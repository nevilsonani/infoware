import { prisma } from './client';
import { Decimal } from '@prisma/client/runtime/library';

async function main() {
  const kg = await prisma.unit.upsert({
    where: { code: 'KG' },
    update: {},
    create: { code: 'KG', name: 'Kilogram', baseCode: 'KG', factor: new Decimal(1) },
  });
  await prisma.unit.upsert({
    where: { code: 'GM' },
    update: {},
    create: { code: 'GM', name: 'Gram', baseCode: 'KG', factor: new Decimal(1000) },
  });
  const lt = await prisma.unit.upsert({
    where: { code: 'LT' },
    update: {},
    create: { code: 'LT', name: 'Litre', baseCode: 'LT', factor: new Decimal(1) },
  });
  await prisma.unit.upsert({
    where: { code: 'ML' },
    update: {},
    create: { code: 'ML', name: 'Millilitre', baseCode: 'LT', factor: new Decimal(1000) },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', password: 'hashed', name: 'Admin', role: 'ADMIN' },
  });
  const supplierUser = await prisma.user.upsert({
    where: { email: 'supplier@example.com' },
    update: {},
    create: { email: 'supplier@example.com', password: 'hashed', name: 'Supplier', role: 'SUPPLIER' },
  });
  const buyerUser = await prisma.user.upsert({
    where: { email: 'buyer@example.com' },
    update: {},
    create: { email: 'buyer@example.com', password: 'hashed', name: 'Buyer', role: 'BUYER' },
  });

  const supplier = await prisma.supplier.upsert({
    where: { userId: supplierUser.id },
    update: {},
    create: { userId: supplierUser.id },
  });
  await prisma.buyer.upsert({
    where: { userId: buyerUser.id },
    update: {},
    create: { userId: buyerUser.id },
  });

  await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: { supplierId: supplier.id, name: 'Wheat', description: 'Bulk grain', price: new Decimal(30), baseUnitId: kg.id, stockQty: new Decimal(500) },
  });
  await prisma.product.upsert({
    where: { id: 2 },
    update: {},
    create: { supplierId: supplier.id, name: 'Oil', description: 'Edible oil', price: new Decimal(120), baseUnitId: lt.id, stockQty: new Decimal(200) },
  });

  console.log('Seed complete');
}

main().finally(async () => prisma.$disconnect());


