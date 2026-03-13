import { prisma } from "../lib/prisma.js";

export type InfluencerStatus = "active" | "waiting" | "success" | "failure";

function getOutreachEmailTemplate(name: string): string {
  return `Hi ${name},

We'd love to collaborate with you on a campaign. Please reply to this email to let us know if you're interested.

Best regards,
MarketIt Team`;
}

export async function create(
  userId: string,
  data: { name: string; instagramHandle?: string; email?: string; notes?: string }
) {
  const outreachContent = data.email ? getOutreachEmailTemplate(data.name) : undefined;
  return prisma.influencer.create({
    data: { userId, ...data, outreachEmailContent: outreachContent },
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

export async function remove(id: string, userId: string) {
  const result = await prisma.influencer.deleteMany({
    where: { id, userId },
  });
  if (result.count === 0) throw new Error("Influencer not found");
}

/**
 * Find influencer by email (in waiting status) and update status.
 * Used by n8n webhook when an email reply is received.
 */
export async function updateStatusByEmail(email: string, status: InfluencerStatus, replyContent?: string) {
  const inf = await prisma.influencer.findFirst({
    where: { email, status: "waiting" },
    orderBy: { addedAt: "desc" },
  });
  if (!inf) throw new Error("No waiting influencer found with this email");
  const data: Record<string, unknown> = { status };
  if (status === "active") data.repliedAt = new Date();
  if (status === "success" || status === "failure") data.completedAt = new Date();
  if (replyContent) data.replyEmailContent = replyContent;
  await prisma.influencer.updateMany({
    where: { id: inf.id, userId: inf.userId },
    data: data as { status: string; repliedAt?: Date; completedAt?: Date; replyEmailContent?: string },
  });
}

export async function setOutreachEmail(influencerId: string, emailContent: string) {
  await prisma.influencer.updateMany({
    where: { id: influencerId },
    data: { outreachEmailContent: emailContent },
  });
}
