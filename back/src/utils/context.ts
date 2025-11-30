import { verifyToken, JWTPayload } from './auth';
import prisma from './prisma';
import { User } from '@prisma/client';

export interface Context {
  prisma: typeof prisma;
  user: User | null;
}

// GraphQL context үүсгэх (JWT token-оос хэрэглэгч татах)
export async function createContext({ req }: { req: any }): Promise<Context> {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return { prisma, user: null };
  }

  const payload: JWTPayload | null = verifyToken(token);

  if (!payload) {
    return { prisma, user: null };
  }

  // Хэрэглэгчийн мэдээлэл татах
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  return { prisma, user };
}
