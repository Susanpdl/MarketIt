import { prisma } from "../lib/prisma.js";

export async function getDashboardStats(userId: string) {
  const [influencers, salesRecords] = await Promise.all([
    prisma.influencer.findMany({
      where: { userId },
      select: { status: true },
    }),
    prisma.salesRecord.findMany({
      where: { userId },
      select: { amount: true, date: true },
      orderBy: { date: "desc" },
      take: 12,
    }),
  ]);

  const totalInfluencers = influencers.length;
  const byStatus = {
    active: influencers.filter((i) => i.status === "active").length,
    waiting: influencers.filter((i) => i.status === "waiting").length,
    success: influencers.filter((i) => i.status === "success").length,
    failure: influencers.filter((i) => i.status === "failure").length,
  };
  const completed = byStatus.success + byStatus.failure;
  const successRate = completed > 0 ? Math.round((byStatus.success / completed) * 100) : 0;

  const totalSales = salesRecords.reduce((sum, r) => sum + Number(r.amount), 0);
  const recentSales = salesRecords.slice(0, 5).map((r) => ({
    amount: Number(r.amount),
    date: r.date.toISOString().slice(0, 10),
  }));

  const recentInfluencers = (await prisma.influencer.findMany({
    where: { userId },
    select: { id: true, name: true, status: true, addedAt: true },
    orderBy: { addedAt: "desc" },
    take: 5,
  })).map((i) => ({
    id: i.id,
    name: i.name,
    status: i.status,
    addedAt: i.addedAt.toISOString(),
  }));

  return {
    totalInfluencers,
    byStatus,
    successRate,
    totalSales: Math.round(totalSales * 100) / 100,
    recentSales,
    recentInfluencers,
  };
}
