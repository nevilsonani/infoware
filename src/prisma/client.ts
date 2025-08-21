import { PrismaClient } from '../../generated/prisma';

export const prisma = new PrismaClient();

export type PrismaTransaction = Parameters<typeof prisma.$transaction>[0];


