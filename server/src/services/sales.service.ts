import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
