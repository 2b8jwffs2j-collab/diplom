import { Context } from '../utils/context';
import { GraphQLError } from 'graphql';

export const reviewResolvers = {
  Query: {
    productReviews: async (_: any, { productId }: { productId: number }, context: Context) => {
      return context.prisma.review.findMany({
        where: { productId },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  },

  Mutation: {
    createReview: async (
      _: any,
      { productId, rating, comment }: { productId: number; rating: number; comment?: string },
      context: Context
    ) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Rating 1-5 хооронд байх ёстой
      if (rating < 1 || rating > 5) {
        throw new GraphQLError('Rating 1-5 хооронд байх ёстой', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Бүтээгдэхүүн байгаа эсэхийг шалгах
      const product = await context.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new GraphQLError('Бүтээгдэхүүн олдсонгүй', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Хэрэглэгч энэ бүтээгдэхүүнийг худалдан авсан эсэхийг шалгах (optional, strict mode)
      // Одоогоор энгийн хувилбар - хэн ч review өгч болно
      // Production дээр purchase history шалгах хэрэгтэй

      // Нэг хэрэглэгч нэг бүтээгдэхүүнд зөвхөн 1 үнэлгээ бичих боломжтой
      // Хэрэв аль хэдийн үнэлгээ бичсэн бол шинэчилнэ
      const existingReview = await context.prisma.review.findFirst({
        where: {
          userId: context.user.id,
          productId,
        },
      });

      if (existingReview) {
        // Аль хэдийн үнэлгээ байвал шинэчилнэ
        return context.prisma.review.update({
          where: { id: existingReview.id },
          data: {
            rating,
            comment,
          },
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            product: true,
          },
        });
      }

      // Шинэ үнэлгээ үүсгэх
      return context.prisma.review.create({
        data: {
          userId: context.user.id,
          productId,
          rating,
          comment,
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          product: true,
        },
      });
    },
  },

  Review: {
    user: async (parent: any, _: any, context: Context) => {
      return context.prisma.user.findUnique({
        where: { id: parent.userId },
      });
    },
    product: async (parent: any, _: any, context: Context) => {
      return context.prisma.product.findUnique({
        where: { id: parent.productId },
      });
    },
  },
};
