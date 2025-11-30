import { Context } from '../utils/context';

export const categoryResolvers = {
  Query: {
    categories: async (_: any, __: any, context: Context) => {
      return context.prisma.category.findMany({
        include: {
          products: {
            where: {
              status: 'APPROVED',
            },
          },
        },
      });
    },

    category: async (_: any, { id }: { id: number }, context: Context) => {
      return context.prisma.category.findUnique({
        where: { id },
        include: {
          products: {
            where: {
              status: 'APPROVED',
            },
          },
        },
      });
    },
  },

  Category: {
    products: async (parent: any, _: any, context: Context) => {
      return context.prisma.product.findMany({
        where: {
          categoryId: parent.id,
          status: 'APPROVED',
        },
      });
    },
  },
};
