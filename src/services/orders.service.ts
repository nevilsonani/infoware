import { prisma } from '../prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { convertQuantity } from '../utils/uom';
import { broadcastOrderStatus } from '../sockets/status';

type OrderItemInput = { productId: number; unitCode: string; quantity: number };

export async function placeOrder(buyerUserId: number, items: OrderItemInput[]) {
  const buyer = await prisma.buyer.findUnique({ where: { userId: buyerUserId } });
  if (!buyer) throw new Error('Buyer not found');

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
    include: { baseUnit: true, supplier: true },
  });
  if (products.length !== items.length) throw new Error('Some products missing');

  const supplierId = products[0].supplierId;
  if (!products.every((p) => p.supplierId === supplierId)) throw new Error('All items must be from same supplier');

  const orderItemsData = await Promise.all(
    items.map(async (i) => {
      const product = products.find((p) => p.id === i.productId)!;
      const { baseQty } = await convertQuantity(product.baseUnit.code, i.unitCode, i.quantity);
      const price = new Decimal(product.price);
      const lineTotal = baseQty.mul(price);
      const unit = await prisma.unit.findUnique({ where: { code: i.unitCode } });
      if (!unit) throw new Error('Unit not found');
      return {
        productId: product.id,
        unitId: unit.id,
        quantity: new Decimal(i.quantity),
        baseQty,
        price,
        lineTotal,
      };
    })
  );

  const total = orderItemsData.reduce((acc, it) => acc.add(it.lineTotal), new Decimal(0));

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        buyerId: buyer.id,
        supplierId,
        status: 'PENDING',
        totalAmount: total,
        items: { createMany: { data: orderItemsData } },
        histories: { create: { to: 'PENDING', changedBy: buyerUserId } },
      },
      include: { items: true },
    });
    return order;
  });
}

export async function listBuyerOrders(buyerUserId: number) {
  const buyer = await prisma.buyer.findUnique({ where: { userId: buyerUserId } });
  if (!buyer) throw new Error('Buyer not found');
  return prisma.order.findMany({
    where: { buyerId: buyer.id },
    include: { items: { include: { product: true, unit: true } }, histories: true },
    orderBy: { id: 'desc' },
  });
}

export async function listSupplierIncomingOrders(supplierUserId: number) {
  const supplier = await prisma.supplier.findUnique({ where: { userId: supplierUserId } });
  if (!supplier) throw new Error('Supplier not found');
  return prisma.order.findMany({
    where: { supplierId: supplier.id },
    include: { items: { include: { product: true, unit: true } }, histories: true },
    orderBy: { id: 'desc' },
  });
}

export async function changeOrderStatus(orderId: number, to: 'APPROVED'|'FULFILLED'|'CANCELLED', actorUserId: number) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: { include: { product: true } } } });
    if (!order) throw new Error('Order not found');

    const from = order.status;

    if (from === 'PENDING' && to === 'APPROVED') {
      // reduce stock
      for (const item of order.items) {
        const newQty = new Decimal(item.product.stockQty).minus(item.baseQty);
        if (newQty.lt(0)) throw new Error('Out of stock');
        await tx.product.update({ where: { id: item.productId }, data: { stockQty: newQty } });
      }
    }

    const updated = await tx.order.update({ where: { id: orderId }, data: { status: to } });
    await tx.orderStatusHistory.create({ data: { orderId, from, to, changedBy: actorUserId } });
    // Notify via websocket outside of transaction commit
    setImmediate(() => broadcastOrderStatus(orderId, to));
    return updated;
  });
}

export async function analytics() {
  const countsByStatus = await prisma.order.groupBy({ by: ['status'], _count: { _all: true } });
  const revenuePerSupplier = await prisma.order.groupBy({ by: ['supplierId'], _sum: { totalAmount: true } });
  return { countsByStatus, revenuePerSupplier };
}


