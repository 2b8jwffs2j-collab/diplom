import { authResolvers } from './auth';
import { productResolvers } from './product';
import { orderResolvers } from './order';
import { walletResolvers } from './wallet';
import { categoryResolvers } from './category';
import { reviewResolvers } from './review';
import { adminResolvers } from './admin';
import { stockRequestResolvers } from './stockRequest';
import { refundRequestResolvers } from './refundRequest';

// Бүх resolvers-ийг нэгтгэх
export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...productResolvers.Query,
    ...orderResolvers.Query,
    ...walletResolvers.Query,
    ...categoryResolvers.Query,
    ...reviewResolvers.Query,
    ...adminResolvers.Query,
    ...stockRequestResolvers.Query,
    ...refundRequestResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...productResolvers.Mutation,
    ...orderResolvers.Mutation,
    ...walletResolvers.Mutation,
    ...reviewResolvers.Mutation,
    ...adminResolvers.Mutation,
    ...stockRequestResolvers.Mutation,
    ...refundRequestResolvers.Mutation,
  },
  User: authResolvers.User,
  Profile: authResolvers.Profile,
  Product: productResolvers.Product,
  Order: orderResolvers.Order,
  OrderItem: orderResolvers.OrderItem,
  Wallet: walletResolvers.Wallet,
  WalletTransaction: walletResolvers.WalletTransaction,
  Category: categoryResolvers.Category,
  Review: reviewResolvers.Review,
  StockRequest: stockRequestResolvers.StockRequest,
  RefundRequest: refundRequestResolvers.RefundRequest,
};
