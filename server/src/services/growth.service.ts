import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getSalesOverTime(userId: string, from?: Date, to?: Date) {
  const where: { userId: string; date?: { gte?: Date; lte?: Date } } = { userId };
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = from;
    if (to) where.date.lte = to;
  }
  const records = await prisma.salesRecord.findMany({
    where,
    orderBy: { date: "asc" },
  });
  return records.map((r) => ({
    date: r.date.toISOString().slice(0, 10),
    amount: Number(r.amount),
    notes: r.notes,
  }));
}

export async function getSuccessMarkers(userId: string) {
  const influencers = await prisma.influencer.findMany({
    where: { userId, status: "success" },
    include: {
      posts: {
        where: { postedAt: { not: null } },
        orderBy: { postedAt: "asc" },
      },
    },
  });
  const markers: { date: string; influencerName: string; postUrl?: string }[] = [];
  for (const inf of influencers) {
    const firstPost = inf.posts.find((p) => p.postedAt);
    const date = firstPost?.postedAt ?? inf.completedAt;
    if (date) {
      markers.push({
        date: date.toISOString().slice(0, 10),
        influencerName: inf.name,
        postUrl: firstPost?.postUrl ?? undefined,
      });
    }
  }
  return markers.sort((a, b) => (a.date < b.date ? -1 : 1));
}
