import { prisma } from '../prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export async function listProducts() {
  return prisma.product.findMany({
    include: { supplier: { include: { user: true } }, baseUnit: true },
    orderBy: { id: 'desc' },
  });
}

export async function upsertProduct(
  supplierUserId: number,
  input: { id?: number; name: string; description?: string; price: number; baseUnitCode: string; stockQty: number }
) {
  const supplier = await prisma.supplier.findUnique({ where: { userId: supplierUserId } });
  if (!supplier) throw new Error('Supplier not found');
  const unit = await prisma.unit.findUnique({ where: { code: input.baseUnitCode } });
  if (!unit) throw new Error('Unit not found');
  if (input.id) {
    return prisma.product.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description,
        price: new Decimal(input.price),
        baseUnitId: unit.id,
        stockQty: new Decimal(input.stockQty),
      },
    });
  }
  return prisma.product.create({
    data: {
      supplierId: supplier.id,
      name: input.name,
      description: input.description,
      price: new Decimal(input.price),
      baseUnitId: unit.id,
      stockQty: new Decimal(input.stockQty),
    },
  });
}

export async function updateStock(productId: number, quantityInBase: number) {
  return prisma.product.update({
    where: { id: productId },
    data: { stockQty: new Decimal(quantityInBase) },
  });
}


