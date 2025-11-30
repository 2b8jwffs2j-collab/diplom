import { Context } from '../utils/context';
import { GraphQLError } from 'graphql';

export const stockRequestResolvers = {
  Query: {
    myStockRequests: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return context.prisma.stockRequest.findMany({
        where: { userId: context.user.id },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          product: {
            include: {
              seller: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    sellerStockRequests: async (_: any, __: any, context: Context) => {
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

      // Худалдагчийн бүтээгдэхүүнүүдийн хүсэлтүүдийг татах
      return context.prisma.stockRequest.findMany({
        where: {
          product: {
            sellerId: context.user.id,
          },
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          product: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  },

  Mutation: {
    createStockRequest: async (
      _: any,
      { productId, quantity }: { productId: number; quantity: number },
      context: Context
    ) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (quantity <= 0) {
        throw new GraphQLError('Тоо ширхэг 0-ээс их байх ёстой', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Бүтээгдэхүүн татах
      const product = await context.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new GraphQLError('Бүтээгдэхүүн олдсонгүй', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (product.status !== 'APPROVED') {
        throw new GraphQLError('Бүтээгдэхүүн борлуулах боломжгүй', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      if (product.stock > 0) {
        throw new GraphQLError('Бүтээгдэхүүн нөөцөд байна', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Хэрэв аль хэдийн хүсэлт илгээсэн бол шалгах (PENDING эсвэл APPROVED)
      const existingRequest = await context.prisma.stockRequest.findFirst({
        where: {
          userId: context.user.id,
          productId,
          status: {
            in: ['PENDING', 'APPROVED'],
          },
        },
      });

      if (existingRequest) {
        if (existingRequest.status === 'APPROVED') {
          throw new GraphQLError('Таны хүсэлт аль хэдийн зөвшөөрөгдсөн байна', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        throw new GraphQLError('Та энэ бүтээгдэхүүнд хүсэлт илгээсэн байна', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Хүсэлт үүсгэх
      return context.prisma.stockRequest.create({
        data: {
          userId: context.user.id,
          productId,
          quantity,
          status: 'PENDING',
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          product: {
            include: {
              seller: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
      });
    },

    approveStockRequest: async (
      _: any,
      { id, expectedCompletionDate }: { id: number; expectedCompletionDate: string },
      context: Context
    ) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Хүсэлт татах
      const request = await context.prisma.stockRequest.findUnique({
        where: { id },
        include: {
          product: true,
        },
      });

      if (!request) {
        throw new GraphQLError('Хүсэлт олдсонгүй', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Эрх шалгах (зөвхөн худалдагч)
      if (request.product.sellerId !== context.user.id) {
        throw new GraphQLError('Энэ хүсэлтийг зөвшөөрөх эрхгүй', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      if (request.status !== 'PENDING') {
        throw new GraphQLError('Хүсэлт аль хэдийн боловсруулсан байна', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Хүсэлт зөвшөөрөх
      return context.prisma.stockRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          expectedCompletionDate: new Date(expectedCompletionDate),
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          product: {
            include: {
              seller: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
      });
    },

    rejectStockRequest: async (_: any, { id }: { id: number }, context: Context) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Хүсэлт татах
      const request = await context.prisma.stockRequest.findUnique({
        where: { id },
        include: {
          product: true,
        },
      });

      if (!request) {
        throw new GraphQLError('Хүсэлт олдсонгүй', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Эрх шалгах (зөвхөн худалдагч)
      if (request.product.sellerId !== context.user.id) {
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
      return context.prisma.stockRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          product: {
            include: {
              seller: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
      });
    },
  },

  StockRequest: {
    user: async (parent: any, _: any, context: Context) => {
      return context.prisma.user.findUnique({
        where: { id: parent.userId },
        include: {
          profile: true,
        },
      });
    },
    product: async (parent: any, _: any, context: Context) => {
      return context.prisma.product.findUnique({
        where: { id: parent.productId },
        include: {
          seller: {
            include: {
              profile: true,
            },
          },
        },
      });
    },
  },
};
