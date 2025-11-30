import { Context } from '../utils/context';
import { GraphQLError } from 'graphql';

// Admin эрх шалгах helper
function requireAdmin(context: Context) {
  if (!context.user || context.user.role !== 'ADMIN') {
    throw new GraphQLError('Зөвхөн админ энэ үйлдлийг хийх боломжтой', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
}

// Float-ийг BigInt cents болгож хувиргах
function priceToCents(price: number): bigint {
  return BigInt(Math.round(price * 100));
}

export const adminResolvers = {
  Query: {
    adminStats: async (_: any, __: any, context: Context) => {
      requireAdmin(context);

      const [
        totalUsers,
        totalProducts,
        totalOrders,
        totalTransactions,
        pendingProducts,
        allTransactions,
      ] = await Promise.all([
        context.prisma.user.count(),
        context.prisma.product.count(),
        context.prisma.order.count(),
        context.prisma.walletTransaction.count(),
        context.prisma.product.count({ where: { status: 'PENDING' } }),
        context.prisma.walletTransaction.findMany({
          where: { type: 'TOP_UP' },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      // Өнөөдрийн top-up
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTopUps = allTransactions
        .filter((t) => new Date(t.createdAt) >= today)
        .reduce((sum, t) => sum + t.amount, 0n);

      // Нийт орлого (purchase transactions)
      const purchaseTransactions = await context.prisma.walletTransaction.findMany({
        where: { type: 'PURCHASE' },
      });
      const totalRevenue = purchaseTransactions.reduce(
        (sum, t) => sum + (t.amount < 0n ? -t.amount : 0n),
        0n
      );

      // Системийн 5% комисс тооцоолох
      const systemCommission = (totalRevenue * 5n) / 100n;

      // Хүргэгдсэн захиалгуудын комисс
      const deliveredOrders = await context.prisma.order.findMany({
        where: { status: 'DELIVERED' },
      });
      const totalCommissionEarned = deliveredOrders.reduce(
        (sum, order) => sum + (order.totalAmount * 5n) / 100n,
        0n
      );

      return {
        totalUsers,
        totalProducts,
        totalOrders,
        totalTransactions,
        pendingProducts,
        totalRevenue: totalRevenue.toString(),
        todayTopUps: todayTopUps.toString(),
        systemCommission: systemCommission.toString(),
        totalCommissionEarned: totalCommissionEarned.toString(),
      };
    },

    allUsers: async (_: any, { role }: { role?: string }, context: Context) => {
      requireAdmin(context);

      return context.prisma.user.findMany({
        where: role ? { role: role as any } : {},
        include: {
          profile: true,
          wallet: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    allTransactions: async (_: any, { limit = 100 }: { limit?: number }, context: Context) => {
      requireAdmin(context);

      return context.prisma.walletTransaction.findMany({
        take: limit,
        include: {
          wallet: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
            },
          },
          order: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    userTransactions: async (_: any, { userId }: { userId: number }, context: Context) => {
      requireAdmin(context);

      const wallet = await context.prisma.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new GraphQLError('Хэрэглэгчийн wallet олдсонгүй', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return context.prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        include: {
          order: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  },

  Mutation: {
    updateUser: async (_: any, { id, input }: { id: number; input: any }, context: Context) => {
      requireAdmin(context);

      const user = await context.prisma.user.findUnique({
        where: { id },
        include: { profile: true },
      });

      if (!user) {
        throw new GraphQLError('Хэрэглэгч олдсонгүй', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // User update
      const updateData: any = {};
      if (input.email) updateData.email = input.email;
      if (input.role) updateData.role = input.role;

      // Profile update
      const profileData: any = {};
      if (input.firstName !== undefined) profileData.firstName = input.firstName;
      if (input.lastName !== undefined) profileData.lastName = input.lastName;
      if (input.phone !== undefined) profileData.phone = input.phone;

      await context.prisma.$transaction([
        context.prisma.user.update({
          where: { id },
          data: updateData,
        }),
        user.profile
          ? context.prisma.profile.update({
              where: { userId: id },
              data: profileData,
            })
          : context.prisma.profile.create({
              data: {
                userId: id,
                ...profileData,
              },
            }),
      ]);

      return context.prisma.user.findUnique({
        where: { id },
        include: {
          profile: true,
          wallet: true,
        },
      });
    },

    updateUserRole: async (
      _: any,
      { id, role }: { id: number; role: string },
      context: Context
    ) => {
      requireAdmin(context);

      return context.prisma.user.update({
        where: { id },
        data: { role: role as any },
        include: {
          profile: true,
          wallet: true,
        },
      });
    },

    adjustUserBalance: async (
      _: any,
      { input }: { input: { userId: number; amount: number; description?: string } },
      context: Context
    ) => {
      requireAdmin(context);

      const amountInCents = priceToCents(input.amount);

      // Wallet олох эсвэл үүсгэх
      let wallet = await context.prisma.wallet.findUnique({
        where: { userId: input.userId },
      });

      if (!wallet) {
        wallet = await context.prisma.wallet.create({
          data: {
            userId: input.userId,
            balance: 0n,
          },
        });
      }

      // Atomic transaction
      const [transaction] = await context.prisma.$transaction([
        context.prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: {
              increment: amountInCents,
            },
          },
        }),
        context.prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            amount: amountInCents,
            type: amountInCents > 0n ? 'TOP_UP' : 'WITHDRAWAL',
            description: input.description || `Админ баланс тохируулсан: ${input.amount}₮`,
          },
        }),
      ]);

      return transaction;
    },

    deleteUser: async (_: any, { id }: { id: number }, context: Context) => {
      requireAdmin(context);

      // Өөрөө устгахыг хориглох
      if (id === context.user!.id) {
        throw new GraphQLError('Өөрийгөө устгах боломжгүй', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      await context.prisma.user.delete({
        where: { id },
      });

      return true;
    },
  },
};
