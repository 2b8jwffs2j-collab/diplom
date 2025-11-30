import { Context } from '../utils/context';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { GraphQLError } from 'graphql';

interface RegisterInput {
  email: string;
  password: string;
  role?: 'BUYER' | 'SELLER' | 'ADMIN';
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  bio?: string;
  avatarUrl?: string;
}

export const authResolvers = {
  Query: {
    me: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return context.user;
    },

    user: async (_: any, { id }: { id: number }, context: Context) => {
      return context.prisma.user.findUnique({
        where: { id },
        include: {
          profile: true,
          wallet: true,
        },
      });
    },

    users: async (_: any, { role }: { role?: string }, context: Context) => {
      return context.prisma.user.findMany({
        where: role ? { role: role as any } : {},
        include: {
          profile: true,
        },
      });
    },
  },

  Mutation: {
    register: async (_: any, { input }: { input: RegisterInput }, context: Context) => {
      // Email давхардсан эсэхийг шалгах
      const existingUser = await context.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new GraphQLError('Энэ имэйл хаяг бүртгэлтэй байна', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Нууц үг hash хийх
      const hashedPassword = await hashPassword(input.password);

      // Хэрэглэгч үүсгэх (profile болон wallet-тай хамт)
      const user = await context.prisma.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          role: input.role || 'BUYER',
          profile: {
            create: {
              firstName: input.firstName,
              lastName: input.lastName,
              phone: input.phone,
            },
          },
          wallet: {
            create: {
              balance: 0n,
            },
          },
        },
        include: {
          profile: true,
          wallet: true,
        },
      });

      // JWT token үүсгэх
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return { token, user };
    },

    login: async (_: any, { input }: { input: LoginInput }, context: Context) => {
      // Хэрэглэгч хайх
      const user = await context.prisma.user.findUnique({
        where: { email: input.email },
        include: {
          profile: true,
          wallet: true,
        },
      });

      if (!user) {
        throw new GraphQLError('Имэйл эсвэл нууц үг буруу байна', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Нууц үг шалгах
      const valid = await comparePassword(input.password, user.password);

      if (!valid) {
        throw new GraphQLError('Имэйл эсвэл нууц үг буруу байна', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // JWT token үүсгэх
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return { token, user };
    },

    updateProfile: async (_: any, { input }: { input: UpdateProfileInput }, context: Context) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Profile байгаа эсэхийг шалгах
      const existingProfile = await context.prisma.profile.findUnique({
        where: { userId: context.user.id },
      });

      if (existingProfile) {
        // Profile шинэчлэх
        return context.prisma.profile.update({
          where: { userId: context.user.id },
          data: input,
        });
      } else {
        // Profile үүсгэх
        return context.prisma.profile.create({
          data: {
            userId: context.user.id,
            ...input,
          },
        });
      }
    },
  },

  User: {
    profile: async (parent: any, _: any, context: Context) => {
      return context.prisma.profile.findUnique({
        where: { userId: parent.id },
      });
    },
    wallet: async (parent: any, _: any, context: Context) => {
      return context.prisma.wallet.findUnique({
        where: { userId: parent.id },
      });
    },
    products: async (parent: any, _: any, context: Context) => {
      return context.prisma.product.findMany({
        where: { sellerId: parent.id },
      });
    },
    orders: async (parent: any, _: any, context: Context) => {
      return context.prisma.order.findMany({
        where: { buyerId: parent.id },
      });
    },
  },

  Profile: {
    // Profile-ийн бүх field GraphQL schema дээр байгаа учир нэмэлт resolver шаардлагагүй
  },
};
