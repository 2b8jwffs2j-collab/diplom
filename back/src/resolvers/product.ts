import { Context } from '../utils/context';
import { GraphQLError } from 'graphql';

interface CreateProductInput {
  name: string;
  description?: string;
  price: number; // float (төгрөг)
  stock: number;
  categoryId?: number;
  imageUrls?: string[];
  materials?: string;
  timeToMake?: string;
}

interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: number;
  imageUrls?: string[];
  materials?: string;
  timeToMake?: string;
}

// Float үнийг BigInt cents болгож хувиргах
function priceToCents(price: number): bigint {
  return BigInt(Math.round(price * 100));
}

// BigInt cents-ийг Float үнэ болгож хувиргах
function centsToPrice(cents: bigint): string {
  return cents.toString();
}

export const productResolvers = {
  Query: {
    products: async (
      _: any,
      {
        categoryId,
        status,
        sellerId,
        search,
      }: {
        categoryId?: number;
        status?: string;
        sellerId?: number;
        search?: string;
      },
      context: Context
    ) => {
      const where: any = {};

      if (categoryId) where.categoryId = categoryId;
      if (status) where.status = status;
      if (sellerId) where.sellerId = sellerId;
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } },
          { materials: { contains: search } },
        ];
      }

      return context.prisma.product.findMany({
        where,
        include: {
          seller: true,
          category: true,
          reviews: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    product: async (_: any, { id }: { id: number }, context: Context) => {
      const product = await context.prisma.product.findUnique({
        where: { id },
        include: {
          seller: {
            include: {
              profile: true,
            },
          },
          category: true,
          reviews: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
      });

      if (!product) {
        throw new GraphQLError('Бүтээгдэхүүн олдсонгүй', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return product;
    },
  },

  Mutation: {
    createProduct: async (_: any, { input }: { input: CreateProductInput }, context: Context) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (context.user.role !== 'SELLER' && context.user.role !== 'ADMIN') {
        throw new GraphQLError('Зөвхөн худалдагч бүтээгдэхүүн нэмэх эрхтэй', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const product = await context.prisma.product.create({
        data: {
          sellerId: context.user.id,
          name: input.name,
          description: input.description,
          price: priceToCents(input.price),
          stock: input.stock,
          categoryId: input.categoryId,
          imageUrls: input.imageUrls ? JSON.stringify(input.imageUrls) : null,
          materials: input.materials,
          timeToMake: input.timeToMake,
          status: 'PENDING', // Админ зөвшөөрөх хүртэл хүлээнэ
        },
        include: {
          seller: true,
          category: true,
        },
      });

      return product;
    },

    updateProduct: async (
      _: any,
      { id, input }: { id: number; input: UpdateProductInput },
      context: Context
    ) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Бүтээгдэхүүн байгаа эсэхийг шалгах
      const existingProduct = await context.prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new GraphQLError('Бүтээгдэхүүн олдсонгүй', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Эрх шалгах (өөрийн бүтээгдэхүүн эсвэл админ)
      if (existingProduct.sellerId !== context.user.id && context.user.role !== 'ADMIN') {
        throw new GraphQLError('Бүтээгдэхүүн засах эрхгүй', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const updateData: any = {};
      if (input.name) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.price) updateData.price = priceToCents(input.price);
      if (input.stock !== undefined) updateData.stock = input.stock;
      if (input.categoryId !== undefined) updateData.categoryId = input.categoryId;
      if (input.imageUrls) updateData.imageUrls = JSON.stringify(input.imageUrls);
      if (input.materials !== undefined) updateData.materials = input.materials;
      if (input.timeToMake !== undefined) updateData.timeToMake = input.timeToMake;

      const product = await context.prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          seller: true,
          category: true,
        },
      });

      return product;
    },

    deleteProduct: async (_: any, { id }: { id: number }, context: Context) => {
      if (!context.user) {
        throw new GraphQLError('Нэвтрэх шаардлагатай', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const existingProduct = await context.prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new GraphQLError('Бүтээгдэхүүн олдсонгүй', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (existingProduct.sellerId !== context.user.id && context.user.role !== 'ADMIN') {
        throw new GraphQLError('Бүтээгдэхүүн устгах эрхгүй', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      await context.prisma.product.delete({
        where: { id },
      });

      return true;
    },

    approveProduct: async (_: any, { id }: { id: number }, context: Context) => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new GraphQLError('Зөвхөн админ зөвшөөрөх эрхтэй', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return context.prisma.product.update({
        where: { id },
        data: { status: 'APPROVED' },
        include: {
          seller: true,
          category: true,
        },
      });
    },

    rejectProduct: async (_: any, { id }: { id: number }, context: Context) => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new GraphQLError('Зөвхөн админ татгалзах эрхтэй', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return context.prisma.product.update({
        where: { id },
        data: { status: 'REJECTED' },
        include: {
          seller: true,
          category: true,
        },
      });
    },
  },

  Product: {
    price: (parent: any) => centsToPrice(parent.price),
    imageUrls: (parent: any) => {
      try {
        return parent.imageUrls ? JSON.parse(parent.imageUrls) : [];
      } catch {
        return [];
      }
    },
    seller: async (parent: any, _: any, context: Context) => {
      return context.prisma.user.findUnique({
        where: { id: parent.sellerId },
      });
    },
    category: async (parent: any, _: any, context: Context) => {
      if (!parent.categoryId) return null;
      return context.prisma.category.findUnique({
        where: { id: parent.categoryId },
      });
    },
    reviews: async (parent: any, _: any, context: Context) => {
      return context.prisma.review.findMany({
        where: { productId: parent.id },
      });
    },
    averageRating: async (parent: any, _: any, context: Context) => {
      const reviews = await context.prisma.review.findMany({
        where: { productId: parent.id },
      });
      if (reviews.length === 0) return null;
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      return sum / reviews.length;
    },
    reviewCount: async (parent: any, _: any, context: Context) => {
      return context.prisma.review.count({
        where: { productId: parent.id },
      });
    },
  },
};
