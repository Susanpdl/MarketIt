import { prisma } from "../lib/prisma.js";

export async function create(userId: string, amount: number, date: Date, notes?: string) {
  return prisma.salesRecord.create({
    data: { userId, amount, date, notes },
  });
}

export async function list(userId: string) {
  return prisma.salesRecord.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
}

export async function update(id: string, userId: string, data: { amount?: number; date?: Date; notes?: string }) {
  const existing = await prisma.salesRecord.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Sales record not found");
  return prisma.salesRecord.update({
    where: { id },
    data,
  });
}

export async function remove(id: string, userId: string) {
  const result = await prisma.salesRecord.deleteMany({
    where: { id, userId },
  });
  if (result.count === 0) throw new Error("Sales record not found");
}
