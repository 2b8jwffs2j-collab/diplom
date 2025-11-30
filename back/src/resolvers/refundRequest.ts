import { Context } from '../utils/context';
import { GraphQLError } from 'graphql';

// BigInt cents-ийг string болгож хувиргах
function centsToString(cents: bigint): string {
  return cents.toString();
}

export const refundRequestResolvers = {
  Query: {
    myRefundRequests: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return context.prisma.refundRequest.findMany({
        where: { userId: context.user.id },
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
          user: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    sellerRefundRequests: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (context.user.role !== 'SELLER') {
        throw new GraphQLError('Зөвхөн худалдагч энэ мэдээллийг харах боломжтой', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Худалдагчийн захиалгуудын буцаалтын хүсэлтүүдийг татах
      return context.prisma.refundRequest.findMany({
        where: {
          order: {
            items: {
              some: {
                product: {
                  sellerId: context.user.id,
                },
              },
            },
          },
        },
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
          user: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    adminRefundRequests: async (_: any, __: any, context: Context) => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new GraphQLError('Админ эрх шаардлагатай', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return context.prisma.refundRequest.findMany({
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
          user: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    refundRequest: async (_: any, { id }: { id: number }, context: Context) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const request = await context.prisma.refundRequest.findUnique({
        where: { id },
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
          user: {
            include: {
              profile: true,
            },
          },
        },
      });

      if (!request) {
        throw new GraphQLError('Буцаалтын хүсэлт олдсонгүй', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Эрх шалгах
      const isBuyer = request.userId === context.user.id;
      const isSeller = request.order.items.some(
        (item: any) => item.product.sellerId === context.user!.id
      );
      const isAdmin = context.user.role === 'ADMIN';

      if (!isBuyer && !isSeller && !isAdmin) {
        throw new GraphQLError('Буцаалтын хүсэлт харах эрхгүй', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return request;
    },
  },

  Mutation: {
    createRefundRequest: async (
      _: any,
      { input }: { input: { orderId: number; reason?: string; amount: number } },
      context: Context
    ) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Захиалга татах
      const order = await context.prisma.order.findUnique({
        where: { id: input.orderId },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new GraphQLError('Захиалга олдсонгүй', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Эрх шалгах (зөвхөн захиалгын эзэн)
      if (order.buyerId !== context.user.id) {
        throw new GraphQLError('Энэ захиалгын буцаалт хүсэх эрхгүй', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Захиалгын статус шалгах (CANCELLED байх ёстойгүй)
      if (order.status === 'CANCELLED') {
        throw new GraphQLError('Цуцлагдсан захиалгын буцаалт хийх боломжгүй', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Буцаалтын дүн шалгах
      const refundAmount = BigInt(Math.round(input.amount * 100));
      if (refundAmount <= 0n || refundAmount > order.totalAmount) {
        throw new GraphQLError('Буцаалтын дүн буруу байна', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Аль хэдийн PENDING эсвэл APPROVED хүсэлт байгаа эсэхийг шалгах
      const existingRequest = await context.prisma.refundRequest.findFirst({
        where: {
          orderId: input.orderId,
          status: {
            in: ['PENDING', 'APPROVED'],
          },
        },
      });

      if (existingRequest) {
        if (existingRequest.status === 'APPROVED') {
          throw new GraphQLError('Энэ захиалгын буцаалт аль хэдийн зөвшөөрөгдсөн байна', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        throw new GraphQLError('Энэ захиалгын буцаалтын хүсэлт аль хэдийн илгээгдсэн байна', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Буцаалтын хүсэлт үүсгэх
      return context.prisma.refundRequest.create({
        data: {
          orderId: input.orderId,
          userId: context.user.id,
          reason: input.reason,
          amount: refundAmount,
          status: 'PENDING',
        },
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
          user: {
            include: {
              profile: true,
            },
          },
        },
      });
    },

    approveRefundRequest: async (_: any, { id }: { id: number }, context: Context) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Хүсэлт татах
      const request = await context.prisma.refundRequest.findUnique({
        where: { id },
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
          user: {
            include: {
              wallet: true,
            },
          },
        },
      });

      if (!request) {
        throw new GraphQLError('Буцаалтын хүсэлт олдсонгүй', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Эрх шалгах (худалдагч эсвэл админ)
      const isSeller = request.order.items.some(
        (item: any) => item.product.sellerId === context.user!.id
      );
      const isAdmin = context.user.role === 'ADMIN';

      if (!isSeller && !isAdmin) {
        throw new GraphQLError('Энэ хүсэлтийг зөвшөөрөх эрхгүй', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      if (request.status !== 'PENDING') {
        throw new GraphQLError('Хүсэлт аль хэдийн боловсруулсан байна', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Wallet-д мөнгө нэмэх (atomic transaction)
      try {
        const result = await context.prisma.$transaction(async (tx) => {
          // 1. Хүсэлт зөвшөөрөх
          const updatedRequest = await tx.refundRequest.update({
            where: { id },
            data: {
              status: 'APPROVED',
            },
          });

          // 2. Wallet balance нэмэх
          if (request.user.wallet) {
            await tx.wallet.update({
              where: { id: request.user.wallet.id },
              data: {
                balance: {
                  increment: request.amount,
                },
              },
            });

            // 3. WalletTransaction үүсгэх (audit log)
            await tx.walletTransaction.create({
              data: {
                walletId: request.user.wallet.id,
                amount: request.amount, // Эерэг утга (буцаалт)
                type: 'REFUND',
                description: `Захиалга #${request.orderId} буцаалт`,
                orderId: request.orderId,
              },
            });
          }

          return updatedRequest;
        });

        // Хүсэлт буцаах (бүрэн мэдээлэлтэй)
        return context.prisma.refundRequest.findUnique({
          where: { id: result.id },
          include: {
            order: {
              include: {
                items: {
                  include: {
                    product: true,
                  },
                },
              },
            },
            user: {
              include: {
                profile: true,
              },
            },
          },
        });
      } catch (error) {
        console.error('Refund approval error:', error);
        throw new GraphQLError('Буцаалт зөвшөөрөхөд алдаа гарлаа', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    rejectRefundRequest: async (_: any, { id }: { id: number }, context: Context) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Хүсэлт татах
      const request = await context.prisma.refundRequest.findUnique({
        where: { id },
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      if (!request) {
        throw new GraphQLError('Буцаалтын хүсэлт олдсонгүй', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Эрх шалгах (худалдагч эсвэл админ)
      const isSeller = request.order.items.some(
        (item: any) => item.product.sellerId === context.user!.id
      );
      const isAdmin = context.user.role === 'ADMIN';

      if (!isSeller && !isAdmin) {
        throw new GraphQLError('Энэ хүсэлтийг татгалзах эрхгүй', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      if (request.status !== 'PENDING') {
        throw new GraphQLError('Хүсэлт аль хэдийн боловсруулсан байна', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Хүсэлт татгалзах
      return context.prisma.refundRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
        },
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
          user: {
            include: {
              profile: true,
            },
          },
        },
      });
    },
  },

  RefundRequest: {
    amount: (parent: any) => centsToString(parent.amount),
    order: async (parent: any, _: any, context: Context) => {
      return context.prisma.order.findUnique({
        where: { id: parent.orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    },
    user: async (parent: any, _: any, context: Context) => {
      return context.prisma.user.findUnique({
        where: { id: parent.userId },
        include: {
          profile: true,
        },
      });
    },
  },
};
