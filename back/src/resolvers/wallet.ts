import { Context } from '../utils/context';
import { GraphQLError } from 'graphql';

// Float amount-ийг BigInt cents болгож хувиргах
function amountToCents(amount: number): bigint {
  return BigInt(Math.round(amount * 100));
}

// BigInt cents-ийг string болгож хувиргах (GraphQL BigInt support хийхгүй учраас)
function centsToString(cents: bigint): string {
  return cents.toString();
}

export const walletResolvers = {
  Query: {
    myWallet: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      let wallet = await context.prisma.wallet.findUnique({
        where: { userId: context.user.id },
      });

      // Wallet байхгүй бол үүсгэх
      if (!wallet) {
        wallet = await context.prisma.wallet.create({
          data: {
            userId: context.user.id,
            balance: 0n,
          },
        });
      }

      return wallet;
    },

    myWalletTransactions: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const wallet = await context.prisma.wallet.findUnique({
        where: { userId: context.user.id },
      });

      if (!wallet) {
        return [];
      }

      return context.prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
      });
    },
  },

  Mutation: {
    /**
     * Fake top-up mutation (DEMO хэрэгцээнд)
     * Production дээр энэ нь Stripe webhook дуудна
     */
    topUpFake: async (_: any, { amount }: { amount: number }, context: Context) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (amount <= 0) {
        throw new GraphQLError('Дүн 0-ээс их байх ёстой', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const amountInCents = amountToCents(amount);

      // Wallet татах эсвэл үүсгэх
      let wallet = await context.prisma.wallet.findUnique({
        where: { userId: context.user.id },
      });

      if (!wallet) {
        wallet = await context.prisma.wallet.create({
          data: {
            userId: context.user.id,
            balance: 0n,
          },
        });
      }

      // Transaction - atomic update
      const [updatedWallet] = await context.prisma.$transaction([
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
            type: 'TOP_UP',
            description: `Fake top-up: ${amount.toFixed(2)}₮`,
          },
        }),
      ]);

      return updatedWallet;
    },
  },

  Wallet: {
    balance: (parent: any) => centsToString(parent.balance),
    transactions: async (parent: any, _: any, context: Context) => {
      return context.prisma.walletTransaction.findMany({
        where: { walletId: parent.id },
        orderBy: { createdAt: 'desc' },
      });
    },
  },

  WalletTransaction: {
    amount: (parent: any) => centsToString(parent.amount),
  },
};
