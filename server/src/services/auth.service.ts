import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || "fallback-dev-secret";
const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

export async function register(email: string, password: string, name?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already registered");
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });
  return { user: { id: user.id, email: user.email, name: user.name }, token: sign(user.id, user.email) };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("Invalid credentials");
  return { user: { id: user.id, email: user.email, name: user.name }, token: sign(user.id, user.email) };
}

function sign(userId: string, email: string) {
  return jwt.sign({ userId, email }, secret, { expiresIn } as jwt.SignOptions);
}
