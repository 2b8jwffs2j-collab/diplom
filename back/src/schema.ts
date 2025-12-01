export const typeDefs = `#graphql
  # ========================================
  # ENUMS
  # ========================================
  
  enum UserRole {
    BUYER
    SELLER
    ADMIN
  }

  enum ProductStatus {
    PENDING
    APPROVED
    REJECTED
  }

  enum OrderStatus {
    PENDING
    CONFIRMED
    SHIPPED
    DELIVERED
    CANCELLED
  }

  enum WalletTransactionType {
    TOP_UP
    PURCHASE
    REFUND
    WITHDRAWAL
  }

  enum StockRequestStatus {
    PENDING
    APPROVED
    REJECTED
  }

  enum RefundRequestStatus {
    PENDING
    APPROVED
    REJECTED
  }

  # ========================================
  # TYPES
  # ========================================

  type User {
    id: Int!
    email: String!
    role: UserRole!
    profile: Profile
    wallet: Wallet
    products: [Product!]!
    orders: [Order!]!
    createdAt: String!
    updatedAt: String!
  }

  type Profile {
    id: Int!
    userId: Int!
    firstName: String
    lastName: String
    phone: String
    address: String
    bio: String
    avatarUrl: String
    createdAt: String!
    updatedAt: String!
  }

  type Wallet {
    id: Int!
    userId: Int!
    balance: String!
    transactions: [WalletTransaction!]!
    createdAt: String!
    updatedAt: String!
  }

  type WalletTransaction {
    id: Int!
    walletId: Int!
    amount: String!
    type: WalletTransactionType!
    description: String
    orderId: Int
    createdAt: String!
  }

  type Category {
    id: Int!
    name: String!
    slug: String!
    products: [Product!]!
    createdAt: String!
    updatedAt: String!
  }

  type Product {
    id: Int!
    seller: User!
    category: Category
    name: String!
    description: String
    price: String!
    originalPrice: String
    discount: Int
    stock: Int!
    imageUrls: [String!]
    status: ProductStatus!
    materials: String
    timeToMake: String
    reviews: [Review!]!
    averageRating: Float
    reviewCount: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Order {
    id: Int!
    buyer: User!
    totalAmount: String!
    status: OrderStatus!
    shippingAddress: String
    phone: String
    notes: String
    items: [OrderItem!]!
    createdAt: String!
    updatedAt: String!
  }

  type OrderItem {
    id: Int!
    order: Order!
    product: Product!
    quantity: Int!
    price: String!
    createdAt: String!
  }

  type Review {
    id: Int!
    user: User!
    product: Product!
    rating: Int!
    comment: String
    createdAt: String!
    updatedAt: String!
  }

  type StockRequest {
    id: Int!
    user: User!
    product: Product!
    quantity: Int!
    status: StockRequestStatus!
    expectedCompletionDate: String
    createdAt: String!
    updatedAt: String!
  }

  type RefundRequest {
    id: Int!
    order: Order!
    user: User!
    reason: String
    amount: String!
    status: RefundRequestStatus!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type PurchaseResult {
    success: Boolean!
    message: String!
    order: Order
  }

  type ChangePasswordResult {
    success: Boolean!
    message: String!
  }

  type AdminStats {
    totalUsers: Int!
    totalProducts: Int!
    totalOrders: Int!
    totalTransactions: Int!
    pendingProducts: Int!
    totalRevenue: String!
    todayTopUps: String!
    systemCommission: String!
    totalCommissionEarned: String!
  }

  # ========================================
  # INPUT TYPES
  # ========================================

  input RegisterInput {
    email: String!
    password: String!
    role: UserRole
    firstName: String
    lastName: String
    phone: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateProductInput {
    name: String!
    description: String
    price: Float!
    originalPrice: Float
    discount: Int
    stock: Int!
    categoryId: Int
    imageUrls: [String!]
    materials: String
    timeToMake: String
  }

  input UpdateProductInput {
    name: String
    description: String
    price: Float
    originalPrice: Float
    discount: Int
    stock: Int
    categoryId: Int
    imageUrls: [String!]
    materials: String
    timeToMake: String
  }

  input CreateOrderInput {
    items: [OrderItemInput!]!
    shippingAddress: String!
    phone: String
    notes: String
  }

  input OrderItemInput {
    productId: Int!
    quantity: Int!
  }

  input UpdateProfileInput {
    firstName: String
    lastName: String
    phone: String
    address: String
    bio: String
    avatarUrl: String
  }

  input UpdateUserInput {
    email: String
    role: UserRole
    firstName: String
    lastName: String
    phone: String
  }

  input AdjustBalanceInput {
    userId: Int!
    amount: Float!
    description: String
  }

  input CreateRefundRequestInput {
    orderId: Int!
    reason: String
    amount: Float!
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  input RequestPasswordResetInput {
    email: String!
  }

  input ResetPasswordInput {
    token: String!
    newPassword: String!
  }

  # ========================================
  # QUERIES
  # ========================================

  type Query {
    # Auth & User
    me: User
    user(id: Int!): User
    users(role: UserRole): [User!]!

    # Products
    products(
      categoryId: Int
      status: ProductStatus
      sellerId: Int
      search: String
    ): [Product!]!
    product(id: Int!): Product

    # Categories
    categories: [Category!]!
    category(id: Int!): Category

    # Orders
    myOrders: [Order!]!
    mySellerOrders: [Order!]!
    order(id: Int!): Order

    # Wallet
    myWallet: Wallet
    myWalletTransactions: [WalletTransaction!]!

    # Reviews
    productReviews(productId: Int!): [Review!]!

    # Admin
    adminStats: AdminStats!
    allUsers(role: UserRole): [User!]!
    allTransactions(limit: Int): [WalletTransaction!]!
    userTransactions(userId: Int!): [WalletTransaction!]!

    # Stock Requests
    myStockRequests: [StockRequest!]!
    sellerStockRequests: [StockRequest!]!

    # Refund Requests
    myRefundRequests: [RefundRequest!]!
    sellerRefundRequests: [RefundRequest!]!
    adminRefundRequests: [RefundRequest!]!
    refundRequest(id: Int!): RefundRequest
  }

  # ========================================
  # MUTATIONS
  # ========================================

  type Mutation {
    # Auth
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    changePassword(input: ChangePasswordInput!): ChangePasswordResult!
    requestPasswordReset(input: RequestPasswordResetInput!): ChangePasswordResult!
    resetPasswordWithToken(input: ResetPasswordInput!): ChangePasswordResult!

    # Profile
    updateProfile(input: UpdateProfileInput!): Profile!

    # Products
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: Int!, input: UpdateProductInput!): Product!
    deleteProduct(id: Int!): Boolean!
    approveProduct(id: Int!): Product!
    rejectProduct(id: Int!): Product!

    # Orders
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(id: Int!, status: OrderStatus!): Order!

    # Wallet
    topUpFake(amount: Float!): Wallet!
    purchaseWithWallet(input: CreateOrderInput!): PurchaseResult!

    # Reviews
    createReview(productId: Int!, rating: Int!, comment: String): Review!

    # Admin
    updateUser(id: Int!, input: UpdateUserInput!): User!
    updateUserRole(id: Int!, role: UserRole!): User!
    adjustUserBalance(input: AdjustBalanceInput!): WalletTransaction!
    deleteUser(id: Int!): Boolean!

    # Stock Requests
    createStockRequest(productId: Int!, quantity: Int!): StockRequest!
    approveStockRequest(id: Int!, expectedCompletionDate: String!): StockRequest!
    rejectStockRequest(id: Int!): StockRequest!

    # Refund Requests
    createRefundRequest(input: CreateRefundRequestInput!): RefundRequest!
    approveRefundRequest(id: Int!): RefundRequest!
    rejectRefundRequest(id: Int!): RefundRequest!
  }
`;
