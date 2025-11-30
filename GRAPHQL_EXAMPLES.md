# 📘 GraphQL Query & Mutation Examples

GraphQL Playground-д ашиглах жишээ query/mutation-ууд.

Open: **http://localhost:4000/graphql**

---

## 🔐 Authentication

### 1. Register (Бүртгүүлэх)

```graphql
mutation {
  register(
    input: {
      email: "newuser@example.mn"
      password: "password123"
      role: BUYER
      firstName: "Шинэ"
      lastName: "Хэрэглэгч"
      phone: "99887766"
    }
  ) {
    token
    user {
      id
      email
      role
      profile {
        firstName
        lastName
      }
      wallet {
        balance
      }
    }
  }
}
```

### 2. Login (Нэвтрэх)

```graphql
mutation {
  login(input: { email: "buyer@example.mn", password: "password123" }) {
    token
    user {
      id
      email
      role
      profile {
        firstName
        lastName
      }
      wallet {
        balance
      }
    }
  }
}
```

**Response:**

```json
{
  "data": {
    "login": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 5,
        "email": "buyer@example.mn",
        "role": "BUYER",
        "profile": {
          "firstName": "Батаа",
          "lastName": "Доржийн"
        },
        "wallet": {
          "balance": "50000000"
        }
      }
    }
  }
}
```

**⚠️ Token-ийг хуулж, дараагийн query-д HTTP Headers-д нэмнэ:**

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 👤 User Queries

### 3. Get Current User (Би хэн бэ?)

```graphql
query {
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
    }
    wallet {
      balance
    }
  }
}
```

### 4. Update Profile

```graphql
mutation {
  updateProfile(
    input: {
      firstName: "Батаа"
      lastName: "Доржийн"
      phone: "99445566"
      address: "Улаанбаатар, СБД, 1-р хороо"
      bio: "Гар урлалын сонирхогч"
    }
  ) {
    id
    firstName
    lastName
    phone
    address
    bio
  }
}
```

---

## 🛍️ Product Queries

### 5. Get All Products (Approved only)

```graphql
query {
  products(status: APPROVED) {
    id
    name
    description
    price
    stock
    imageUrls
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
```

### 6. Search Products

```graphql
query {
  products(search: "малгай", status: APPROVED) {
    id
    name
    price
    stock
    seller {
      profile {
        firstName
        lastName
      }
    }
  }
}
```

### 7. Filter by Category

```graphql
query {
  products(categoryId: 1, status: APPROVED) {
    id
    name
    price
    category {
      name
    }
  }
}
```

### 8. Get Single Product

```graphql
query {
  product(id: 1) {
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
        bio
        phone
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
```

---

## 🏪 Seller Mutations

### 9. Create Product (Seller only)

**⚠️ Headers:** `Authorization: Bearer <seller_token>`

```graphql
mutation {
  createProduct(
    input: {
      name: "Гар хийц зүүлт"
      description: "Модон бөмбөлөгтэй, өнгөлөг зүүлт."
      price: 12000
      stock: 10
      categoryId: 3
      imageUrls: [
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908"
      ]
      materials: "Мод, утас"
      timeToMake: "1 цаг"
    }
  ) {
    id
    name
    price
    status
  }
}
```

### 10. Update Product

```graphql
mutation {
  updateProduct(
    id: 1
    input: { name: "Ноосон малгай (шинэчлэгдсэн)", price: 30000, stock: 8 }
  ) {
    id
    name
    price
    stock
  }
}
```

### 11. Delete Product

```graphql
mutation {
  deleteProduct(id: 1)
}
```

---

## 💰 Wallet Queries & Mutations

### 12. Get My Wallet

```graphql
query {
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
```

### 13. Fake Top-up (Demo)

```graphql
mutation {
  topUpFake(amount: 100000) {
    id
    balance
  }
}
```

**Response:**

```json
{
  "data": {
    "topUpFake": {
      "id": 5,
      "balance": "55000000"
    }
  }
}
```

### 14. Get Wallet Transactions

```graphql
query {
  myWalletTransactions {
    id
    amount
    type
    description
    orderId
    createdAt
  }
}
```

---

## 🛒 Order Mutations & Queries

### 15. Create Order (without payment)

**Энэ нь зөвхөн order үүсгэнэ, wallet-аас төлбөр хийхгүй.**

```graphql
mutation {
  createOrder(
    input: {
      items: [{ productId: 1, quantity: 2 }, { productId: 3, quantity: 1 }]
      shippingAddress: "Улаанбаатар, СБД, 1-р хороо"
      notes: "Өглөө хүргээрэй"
    }
  ) {
    id
    totalAmount
    status
    items {
      id
      quantity
      price
      product {
        name
      }
    }
  }
}
```

### 16. Purchase with Wallet (Recommended)

**Энэ нь order үүсгэж, wallet-аас atomic transaction-оор төлбөр хийнэ.**

```graphql
mutation {
  purchaseWithWallet(
    input: {
      items: [{ productId: 1, quantity: 1 }, { productId: 2, quantity: 2 }]
      shippingAddress: "Улаанбаатар, СБД, 1-р хороо"
      notes: "Өглөө 10 цагт хүргээрэй"
    }
  ) {
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
          imageUrls
        }
      }
    }
  }
}
```

**Success Response:**

```json
{
  "data": {
    "purchaseWithWallet": {
      "success": true,
      "message": "Захиалга амжилттай үүслээ",
      "order": {
        "id": 1,
        "totalAmount": "6800000",
        "status": "PENDING",
        "items": [...]
      }
    }
  }
}
```

**Error Response (insufficient balance):**

```json
{
  "data": {
    "purchaseWithWallet": {
      "success": false,
      "message": "Wallet үлдэгдэл хүрэлцэхгүй байна",
      "order": null
    }
  }
}
```

### 17. Get My Orders (Buyer)

```graphql
query {
  myOrders {
    id
    totalAmount
    status
    shippingAddress
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
          profile {
            firstName
            lastName
          }
        }
      }
    }
  }
}
```

### 18. Get Orders for My Products (Seller)

```graphql
query {
  mySellerOrders {
    id
    totalAmount
    status
    shippingAddress
    createdAt
    buyer {
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
      }
    }
  }
}
```

### 19. Update Order Status (Seller/Admin)

```graphql
mutation {
  updateOrderStatus(id: 1, status: CONFIRMED) {
    id
    status
  }
}
```

**Available statuses:** `PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`

---

## ⭐ Review Mutations

### 20. Create Review

```graphql
mutation {
  createReview(
    productId: 1
    rating: 5
    comment: "Маш сайн бүтээгдэхүүн байлаа!"
  ) {
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
```

### 21. Get Product Reviews

```graphql
query {
  productReviews(productId: 1) {
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
```

---

## 🏷️ Category Queries

### 22. Get All Categories

```graphql
query {
  categories {
    id
    name
    slug
    products {
      id
      name
      price
    }
  }
}
```

---

## 🔧 Admin Mutations

### 23. Approve Product (Admin only)

**⚠️ Headers:** `Authorization: Bearer <admin_token>`

```graphql
mutation {
  approveProduct(id: 9) {
    id
    name
    status
  }
}
```

### 24. Reject Product (Admin only)

```graphql
mutation {
  rejectProduct(id: 9) {
    id
    name
    status
  }
}
```

### 25. Get All Users (Admin)

```graphql
query {
  users {
    id
    email
    role
    profile {
      firstName
      lastName
    }
  }
}
```

### 26. Get Sellers Only

```graphql
query {
  users(role: SELLER) {
    id
    email
    profile {
      firstName
      lastName
      bio
    }
    products {
      id
      name
      status
    }
  }
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: Full Purchase Flow

```graphql
# 1. Login
mutation {
  login(input: { email: "buyer@example.mn", password: "password123" }) {
    token
  }
}

# 2. Check wallet balance
query {
  myWallet {
    balance
  }
}

# 3. Top-up if needed
mutation {
  topUpFake(amount: 50000) {
    balance
  }
}

# 4. Browse products
query {
  products(status: APPROVED) {
    id
    name
    price
    stock
  }
}

# 5. Purchase
mutation {
  purchaseWithWallet(
    input: {
      items: [{ productId: 1, quantity: 1 }]
      shippingAddress: "Test Address"
    }
  ) {
    success
    message
    order {
      id
      totalAmount
    }
  }
}

# 6. Check orders
query {
  myOrders {
    id
    totalAmount
    status
  }
}
```

### Scenario 2: Seller Workflow

```graphql
# 1. Login as seller
mutation {
  login(input: { email: "saruul@example.mn", password: "password123" }) {
    token
  }
}

# 2. Create product
mutation {
  createProduct(
    input: { name: "New Product", price: 25000, stock: 5, categoryId: 1 }
  ) {
    id
    name
    status
  }
}

# 3. View my products
query {
  products(sellerId: 2) {
    id
    name
    status
  }
}

# 4. View orders for my products
query {
  mySellerOrders {
    id
    status
    buyer {
      email
    }
  }
}

# 5. Update order status
mutation {
  updateOrderStatus(id: 1, status: SHIPPED) {
    id
    status
  }
}
```

---

## 📝 Notes

- Бүх authenticated mutation-д `Authorization: Bearer <token>` header шаардлагатай
- Money amounts: BigInt (cents) → Frontend дээр `/100` хийж display хийнэ
- Product status: PENDING (default) → APPROVED (admin) → visible to buyers
- Order status flow: PENDING → CONFIRMED → SHIPPED → DELIVERED

---

Happy testing! 🚀
