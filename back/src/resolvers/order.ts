import { Context } from '../utils/context';
import { GraphQLError } from 'graphql';

interface CreateOrderInput {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
  shippingAddress: string;
  phone?: string;
  notes?: string;
}

// BigInt cents-ийг string болгож хувиргах
function centsToString(cents: bigint): string {
  return cents.toString();
}

export const orderResolvers = {
  Query: {
    myOrders: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return context.prisma.order.findMany({
        where: { buyerId: context.user.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    mySellerOrders: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Худалдагчийн бүтээгдэхүүнүүдийг агуулсан захиалгууд
      const orders = await context.prisma.order.findMany({
        where: {
          items: {
            some: {
              product: {
                sellerId: context.user.id,
              },
            },
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          buyer: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return orders;
    },

    order: async (_: any, { id }: { id: number }, context: Context) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const order = await context.prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          buyer: true,
        },
      });

      if (!order) {
        throw new GraphQLError('Захиалга олдсонгүй', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Эрх шалгах
      const isBuyer = order.buyerId === context.user.id;
      const isSeller = order.items.some((item: any) => item.product.sellerId === context.user!.id);
      const isAdmin = context.user.role === 'ADMIN';

      if (!isBuyer && !isSeller && !isAdmin) {
        throw new GraphQLError('Захиалга харах эрхгүй', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return order;
    },
  },

  Mutation: {
    /**
     * Захиалга үүсгэх (зөвхөн захиалга үүсгэх, төлбөргүй)
     * purchaseWithWallet-ээр төлбөр хийнэ
     */
    createOrder: async (_: any, { input }: { input: CreateOrderInput }, context: Context) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (!input.items || input.items.length === 0) {
        throw new GraphQLError('Захиалга хоосон байна', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Бүтээгдэхүүнүүдийг татах
      const productIds = input.items.map((item) => item.productId);
      const products = await context.prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        throw new GraphQLError('Зарим бүтээгдэхүүн олдсонгүй', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Нийт үнэ тооцоолох болон stock шалгах
      let totalAmount = 0n;
      for (const item of input.items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) continue;

        if (product.status !== 'APPROVED') {
          throw new GraphQLError(`Бүтээгдэхүүн "${product.name}" борлуулах боломжгүй`, {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }

        if (product.stock < item.quantity) {
          throw new GraphQLError(`Бүтээгдэхүүн "${product.name}" хүрэлцэхгүй байна`, {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }

        totalAmount += product.price * BigInt(item.quantity);
      }

      // Захиалга үүсгэх (atomic transaction)
      const order = await context.prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            buyerId: context.user!.id,
            totalAmount,
            shippingAddress: input.shippingAddress,
            phone: input.phone,
            notes: input.notes,
            status: 'PENDING',
          },
        });

        // OrderItem үүсгэх болон stock бууруулах
        for (const item of input.items) {
          const product = products.find((p) => p.id === item.productId)!;

          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              price: product.price,
            },
          });

          // Stock бууруулах
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        return newOrder;
      });

      // Order буцаах (items-тай)
      return context.prisma.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          buyer: true,
        },
      });
    },

    /**
     * Wallet ашиглан худалдан авах (atomic transaction)
     * Энэ нь захиалга үүсгэх + wallet balance бууруулах
     */
    purchaseWithWallet: async (
      _: any,
      { input }: { input: CreateOrderInput },
      context: Context
    ) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (!input.items || input.items.length === 0) {
        return {
          success: false,
          message: 'Захиалга хоосон байна',
          order: null,
        };
      }

      // Wallet татах
      const wallet = await context.prisma.wallet.findUnique({
        where: { userId: context.user.id },
      });

      if (!wallet) {
        return {
          success: false,
          message: 'Wallet олдсонгүй',
          order: null,
        };
      }

      // Бүтээгдэхүүнүүдийг татах
      const productIds = input.items.map((item) => item.productId);
      const products = await context.prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        return {
          success: false,
          message: 'Зарим бүтээгдэхүүн олдсонгүй',
          order: null,
        };
      }

      // Нийт үнэ тооцоолох болон stock шалгах
      let totalAmount = 0n;
      for (const item of input.items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) continue;

        if (product.status !== 'APPROVED') {
          return {
            success: false,
            message: `Бүтээгдэхүүн "${product.name}" борлуулах боломжгүй`,
            order: null,
          };
        }

        if (product.stock < item.quantity) {
          return {
            success: false,
            message: `Бүтээгдэхүүн "${product.name}" хүрэлцэхгүй байна`,
            order: null,
          };
        }

        totalAmount += product.price * BigInt(item.quantity);
      }

      // Balance шалгах
      if (wallet.balance < totalAmount) {
        return {
          success: false,
          message: 'Wallet үлдэгдэл хүрэлцэхгүй байна',
          order: null,
        };
      }

      // ATOMIC TRANSACTION: Order үүсгэх, stock бууруулах, wallet balance бууруулах
      try {
        const result = await context.prisma.$transaction(async (tx) => {
          // 1. Order үүсгэх
          const newOrder = await tx.order.create({
            data: {
              buyerId: context.user!.id,
              totalAmount,
              shippingAddress: input.shippingAddress,
              phone: input.phone,
              notes: input.notes,
              status: 'PENDING',
            },
          });

          // 2. OrderItem үүсгэх болон stock бууруулах
          for (const item of input.items) {
            const product = products.find((p) => p.id === item.productId)!;

            await tx.orderItem.create({
              data: {
                orderId: newOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
              },
            });

            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
          }

          // 3. Wallet balance бууруулах
          await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              balance: {
                decrement: totalAmount,
              },
            },
          });

          // 4. WalletTransaction үүсгэх (audit log)
          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              amount: -totalAmount, // Сөрөг утга (зарцуулалт)
              type: 'PURCHASE',
              description: `Захиалга #${newOrder.id}`,
              orderId: newOrder.id,
            },
          });

          return newOrder;
        });

        // Order буцаах (items-тай)
        const order = await context.prisma.order.findUnique({
          where: { id: result.id },
          include: {
            items: {
              include: {
                product: true,
              },
            },
            buyer: true,
          },
        });

        return {
          success: true,
          message: 'Захиалга амжилттай үүслээ',
          order,
        };
      } catch (error) {
        console.error('Purchase transaction error:', error);
        return {
          success: false,
          message: 'Худалдан авалт амжилтгүй боллоо. Дахин оролдоно уу.',
          order: null,
        };
      }
    },

    updateOrderStatus: async (
      _: any,
      { id, status }: { id: number; status: string },
      context: Context
    ) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const order = await context.prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new GraphQLError('Захиалга олдсонгүй', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Эрх шалгах (худалдагч эсвэл админ)
      const isSeller = order.items.some((item: any) => item.product.sellerId === context.user!.id);
      const isAdmin = context.user.role === 'ADMIN';

      if (!isSeller && !isAdmin) {
        throw new GraphQLError('Захиалгын статус өөрчлөх эрхгүй', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return context.prisma.order.update({
        where: { id },
        data: { status: status as any },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          buyer: true,
        },
      });
    },
  },

  Order: {
    totalAmount: (parent: any) => centsToString(parent.totalAmount),
    buyer: async (parent: any, _: any, context: Context) => {
      return context.prisma.user.findUnique({
        where: { id: parent.buyerId },
      });
    },
    items: async (parent: any, _: any, context: Context) => {
      return context.prisma.orderItem.findMany({
        where: { orderId: parent.id },
      });
    },
  },

  OrderItem: {
    price: (parent: any) => centsToString(parent.price),
    order: async (parent: any, _: any, context: Context) => {
      return context.prisma.order.findUnique({
        where: { id: parent.orderId },
      });
    },
    product: async (parent: any, _: any, context: Context) => {
      return context.prisma.product.findUnique({
        where: { id: parent.productId },
      });
    },
  },
};
