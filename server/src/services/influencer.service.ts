import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type InfluencerStatus = "active" | "waiting" | "success" | "failure";

export async function create(
  userId: string,
  data: { name: string; instagramHandle?: string; email?: string; notes?: string }
) {
  return prisma.influencer.create({
    data: { userId, ...data },
  });
}

export async function listByUser(userId: string) {
  return prisma.influencer.findMany({
    where: { userId },
    orderBy: { addedAt: "desc" },
    include: { posts: { include: { stats: true } } },
  });
}

export async function getById(id: string, userId: string) {
  const inf = await prisma.influencer.findFirst({
    where: { id, userId },
    include: { posts: { include: { stats: true } } },
  });
  if (!inf) throw new Error("Influencer not found");
  return inf;
}

export async function updateStatus(id: string, userId: string, status: InfluencerStatus) {
  const data: Record<string, unknown> = { status };
  if (status === "active") data.repliedAt = new Date();
  if (status === "success" || status === "failure") data.completedAt = new Date();

  return prisma.influencer.updateMany({
    where: { id, userId },
    data: data as { status: string; repliedAt?: Date; completedAt?: Date },
  });
}

export async function update(id: string, userId: string, data: Partial<{ name: string; instagramHandle: string; email: string; notes: string }>) {
  return prisma.influencer.updateMany({
    where: { id, userId },
    data,
  });
}

export async function addPost(influencerId: string, userId: string, postUrl?: string) {
  const inf = await prisma.influencer.findFirst({ where: { id: influencerId, userId } });
  if (!inf) throw new Error("Influencer not found");
  return prisma.influencerPost.create({
    data: { influencerId, postUrl, postedAt: new Date() },
  });
}
