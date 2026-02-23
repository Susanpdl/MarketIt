import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getInfluencerAnalytics(influencerId: string, userId: string) {
  const inf = await prisma.influencer.findFirst({
    where: { id: influencerId, userId },
    include: {
      posts: {
        include: { stats: true },
        orderBy: { postedAt: "desc" },
      },
    },
  });
  if (!inf) throw new Error("Influencer not found");
  return inf;
}

export async function updatePostStats(
  postId: string,
  userId: string,
  data: { likes?: number; comments?: number; shares?: number; views?: number }
) {
  const post = await prisma.influencerPost.findFirst({
    where: { id: postId },
    include: { influencer: true },
  });
  if (!post || post.influencer.userId !== userId) throw new Error("Post not found");

  const existing = await prisma.postStats.findUnique({ where: { postId } });
  if (existing) {
    return prisma.postStats.update({
      where: { postId },
      data: { ...data, fetchedAt: new Date() },
    });
  }
  return prisma.postStats.create({
    data: { postId, likes: data.likes ?? 0, comments: data.comments ?? 0, shares: data.shares, views: data.views },
  });
}
