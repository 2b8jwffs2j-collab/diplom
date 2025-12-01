import { gql } from '@apollo/client';

// ========================================
// AUTH QUERIES & MUTATIONS
// ========================================

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        role
        profile {
          firstName
          lastName
        }
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        role
        profile {
          firstName
          lastName
        }
      }
    }
  }
`;

export const ME = gql`
  query Me {
    me {
      id
      email
      role
      profile {
        firstName
        lastName
        phone
        address
        bio
        avatarUrl
      }
      wallet {
        id
        balance
      }
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      firstName
      lastName
      phone
      address
      bio
      avatarUrl
    }
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {
    requestPasswordReset(input: $input) {
      success
      message
    }
  }
`;

export const RESET_PASSWORD_WITH_TOKEN = gql`
  mutation ResetPasswordWithToken($input: ResetPasswordInput!) {
    resetPasswordWithToken(input: $input) {
      success
      message
    }
  }
`;

// ========================================
// PRODUCT QUERIES & MUTATIONS
// ========================================

export const GET_PRODUCTS = gql`
  query GetProducts($categoryId: Int, $status: ProductStatus, $search: String) {
    products(categoryId: $categoryId, status: $status, search: $search) {
      id
      name
      description
      price
      originalPrice
      discount
      stock
      imageUrls
      status
      materials
      timeToMake
      averageRating
      reviewCount
      seller {
        id
        profile {
          firstName
          lastName
        }
      }
      category {
        id
        name
      }
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: Int!) {
    product(id: $id) {
      id
      name
      description
      price
      stock
      imageUrls
      status
      materials
      timeToMake
      averageRating
      reviewCount
      seller {
        id
        email
        profile {
          firstName
          lastName
          phone
          bio
          avatarUrl
        }
      }
      category {
        id
        name
      }
      reviews {
        id
        rating
        comment
        createdAt
        user {
          profile {
            firstName
            lastName
          }
        }
      }
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
      price
      status
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: Int!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      price
      stock
      status
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: Int!) {
    deleteProduct(id: $id)
  }
`;

// ========================================
// WALLET QUERIES & MUTATIONS
// ========================================

export const MY_WALLET = gql`
  query MyWallet {
    myWallet {
      id
      balance
      transactions {
        id
        amount
        type
        description
        createdAt
      }
    }
  }
`;

export const TOP_UP_FAKE = gql`
  mutation TopUpFake($amount: Float!) {
    topUpFake(amount: $amount) {
      id
      balance
    }
  }
`;

// ========================================
// ORDER QUERIES & MUTATIONS
// ========================================

export const MY_ORDERS = gql`
  query MyOrders {
    myOrders {
      id
      totalAmount
      status
      shippingAddress
      phone
      notes
      createdAt
      items {
        id
        quantity
        price
        product {
          id
          name
          imageUrls
          seller {
            id
            profile {
              firstName
              lastName
            }
          }
        }
      }
    }
  }
`;

export const ORDER = gql`
  query Order($id: Int!) {
    order(id: $id) {
      id
      totalAmount
      status
      shippingAddress
      phone
      notes
      createdAt
      updatedAt
      items {
        id
        quantity
        price
        product {
          id
          name
          imageUrls
          seller {
            id
            profile {
              firstName
              lastName
            }
          }
        }
      }
      buyer {
        id
        email
        profile {
          firstName
          lastName
        }
      }
    }
  }
`;

export const MY_SELLER_ORDERS = gql`
  query MySellerOrders {
    mySellerOrders {
      id
      totalAmount
      status
      shippingAddress
      phone
      notes
      createdAt
      updatedAt
      buyer {
        id
        email
        profile {
          firstName
          lastName
          phone
        }
      }
      items {
        id
        quantity
        price
        product {
          id
          name
          imageUrls
          seller {
            id
            profile {
              firstName
              lastName
            }
          }
        }
      }
    }
  }
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: Int!, $status: OrderStatus!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      totalAmount
      status
      shippingAddress
      createdAt
      items {
        id
        quantity
        price
        product {
          id
          name
        }
      }
    }
  }
`;

export const PURCHASE_WITH_WALLET = gql`
  mutation PurchaseWithWallet($input: CreateOrderInput!) {
    purchaseWithWallet(input: $input) {
      success
      message
      order {
        id
        totalAmount
        status
        items {
          id
          quantity
          price
          product {
            id
            name
          }
        }
      }
    }
  }
`;

// ========================================
// CATEGORY QUERIES
// ========================================

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
    }
  }
`;

// ========================================
// ADMIN QUERIES & MUTATIONS
// ========================================

export const APPROVE_PRODUCT = gql`
  mutation ApproveProduct($id: Int!) {
    approveProduct(id: $id) {
      id
      name
      status
      seller {
        id
        profile {
          firstName
          lastName
        }
      }
    }
  }
`;

export const REJECT_PRODUCT = gql`
  mutation RejectProduct($id: Int!) {
    rejectProduct(id: $id) {
      id
      name
      status
      seller {
        id
        profile {
          firstName
          lastName
        }
      }
    }
  }
`;

export const ADMIN_STATS = gql`
  query AdminStats {
    adminStats {
      totalUsers
      totalProducts
      totalOrders
      totalTransactions
      pendingProducts
      totalRevenue
      todayTopUps
      systemCommission
      totalCommissionEarned
    }
  }
`;

export const ALL_USERS = gql`
  query AllUsers($role: UserRole) {
    allUsers(role: $role) {
      id
      email
      role
      createdAt
      profile {
        firstName
        lastName
        phone
      }
      wallet {
        id
        balance
      }
    }
  }
`;

export const ALL_TRANSACTIONS = gql`
  query AllTransactions($limit: Int) {
    allTransactions(limit: $limit) {
      id
      amount
      type
      description
      createdAt
      wallet {
        user {
          id
          email
          profile {
            firstName
            lastName
          }
        }
      }
      order {
        id
        totalAmount
      }
    }
  }
`;

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($id: Int!, $role: UserRole!) {
    updateUserRole(id: $id, role: $role) {
      id
      email
      role
    }
  }
`;

export const CREATE_STOCK_REQUEST = gql`
  mutation CreateStockRequest($productId: Int!, $quantity: Int!) {
    createStockRequest(productId: $productId, quantity: $quantity) {
      id
      quantity
      status
      createdAt
      product {
        id
        name
      }
    }
  }
`;

export const SELLER_STOCK_REQUESTS = gql`
  query SellerStockRequests {
    sellerStockRequests {
      id
      quantity
      status
      expectedCompletionDate
      createdAt
      updatedAt
      user {
        id
        email
        profile {
          firstName
          lastName
        }
      }
      product {
        id
        name
        price
        imageUrls
      }
    }
  }
`;

export const MY_STOCK_REQUESTS = gql`
  query MyStockRequests {
    myStockRequests {
      id
      quantity
      status
      expectedCompletionDate
      createdAt
      product {
        id
        name
        price
        imageUrls
      }
    }
  }
`;

export const APPROVE_STOCK_REQUEST = gql`
  mutation ApproveStockRequest($id: Int!, $expectedCompletionDate: String!) {
    approveStockRequest(id: $id, expectedCompletionDate: $expectedCompletionDate) {
      id
      status
      expectedCompletionDate
    }
  }
`;

export const REJECT_STOCK_REQUEST = gql`
  mutation RejectStockRequest($id: Int!) {
    rejectStockRequest(id: $id) {
      id
      status
    }
  }
`;

export const ADJUST_USER_BALANCE = gql`
  mutation AdjustUserBalance($input: AdjustBalanceInput!) {
    adjustUserBalance(input: $input) {
      id
      amount
      type
      description
      createdAt
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: Int!) {
    deleteUser(id: $id)
  }
`;

// ========================================
// REVIEW QUERIES & MUTATIONS
// ========================================

export const PRODUCT_REVIEWS = gql`
  query ProductReviews($productId: Int!) {
    productReviews(productId: $productId) {
      id
      rating
      comment
      createdAt
      user {
        id
        profile {
          firstName
          lastName
        }
      }
    }
  }
`;

export const CREATE_REVIEW = gql`
  mutation CreateReview($productId: Int!, $rating: Int!, $comment: String) {
    createReview(productId: $productId, rating: $rating, comment: $comment) {
      id
      rating
      comment
      createdAt
    }
  }
`;

// ========================================
// REFUND REQUEST QUERIES & MUTATIONS
// ========================================

export const MY_REFUND_REQUESTS = gql`
  query MyRefundRequests {
    myRefundRequests {
      id
      order {
        id
        totalAmount
        status
        createdAt
        items {
          id
          product {
            id
            name
            imageUrls
          }
        }
      }
      reason
      amount
      status
      createdAt
      updatedAt
    }
  }
`;

export const SELLER_REFUND_REQUESTS = gql`
  query SellerRefundRequests {
    sellerRefundRequests {
      id
      order {
        id
        totalAmount
        status
        createdAt
        items {
          id
          product {
            id
            name
            imageUrls
            seller {
              id
            }
          }
          quantity
          price
        }
      }
      user {
        id
        email
        profile {
          firstName
          lastName
          phone
        }
      }
      reason
      amount
      status
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_REFUND_REQUEST = gql`
  mutation CreateRefundRequest($input: CreateRefundRequestInput!) {
    createRefundRequest(input: $input) {
      id
      order {
        id
      }
      reason
      amount
      status
      createdAt
    }
  }
`;

export const APPROVE_REFUND_REQUEST = gql`
  mutation ApproveRefundRequest($id: Int!) {
    approveRefundRequest(id: $id) {
      id
      status
    }
  }
`;

export const REJECT_REFUND_REQUEST = gql`
  mutation RejectRefundRequest($id: Int!) {
    rejectRefundRequest(id: $id) {
      id
      status
    }
  }
`;
