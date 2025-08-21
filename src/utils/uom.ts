import { prisma } from '../prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export async function convertQuantity(
  productBaseCode: string,
  fromCode: string,
  quantity: number
): Promise<{ baseQty: Decimal }>{
  if (fromCode === productBaseCode) {
    return { baseQty: new Decimal(quantity) };
  }
  const from = await prisma.unit.findUnique({ where: { code: fromCode } });
  if (!from) throw new Error(`Unknown unit: ${fromCode}`);
  if (from.baseCode !== productBaseCode) {
    throw new Error(`Unit ${fromCode} incompatible with base ${productBaseCode}`);
  }
  // baseQty = quantity / factor (since factor is base->unit multiplier)
  const baseQty = new Decimal(quantity).div(from.factor);
  return { baseQty };
}


