# 🔧 Backend - Handmade Shop API

GraphQL API for handmade marketplace built with Node.js, TypeScript, Apollo Server, and Prisma ORM.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start MySQL with Docker
docker-compose up -d

# 3. Copy .env.example to .env and configure
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# 4. Generate Prisma Client
npx prisma generate

# 5. Run migrations
npx prisma migrate dev --name init

# 6. Seed database with demo data
npm run prisma:seed

# 7. Start development server
npm run dev
```

Server will be available at: **http://localhost:4000/graphql**

## 📦 Available Scripts

| Script                    | Description                              |
| ------------------------- | ---------------------------------------- |
| `npm run dev`             | Start development server with hot reload |
| `npm run build`           | Build for production                     |
| `npm start`               | Start production server                  |
| `npm run prisma:generate` | Generate Prisma Client                   |
| `npm run prisma:migrate`  | Run database migrations                  |
| `npm run prisma:seed`     | Seed database with demo data             |
| `npm run prisma:studio`   | Open Prisma Studio (database GUI)        |

## 🗄️ Database

### Docker MySQL

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker logs handmade_mysql

# Access MySQL CLI
docker exec -it handmade_mysql mysql -u root -p
# Password: rootpassword
```

### Adminer (Database UI)

Access at: **http://localhost:8080**

- System: MySQL
- Server: `mysql` (Docker) or `localhost` (host)
- Username: `root`
- Password: `rootpassword`
- Database: `handmade_shop`

### Prisma Studio

```bash
npm run prisma:studio
```

Opens at: **http://localhost:5555**

## 🔐 Environment Variables

Create `.env` file:

```env
DATABASE_URL="mysql://root:rootpassword@localhost:3306/handmade_shop"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=4000
NODE_ENV=development
```

## 📊 Database Schema

### Core Models

- **User** - хэрэглэгч (BUYER, SELLER, ADMIN)
- **Profile** - хэрэглэгчийн дэлгэрэнгүй мэдээлэл
- **Wallet** - түрийвч (balance: BigInt - cents/товгрөг\*100)
- **WalletTransaction** - гүйлгээний түүх (immutable audit log)
- **Product** - бүтээгдэхүүн (price: BigInt)
- **Category** - ангилал
- **Order** - захиалга
- **OrderItem** - захиалгын бүтээгдэхүүн
- **Review** - үнэлгээ

### Money Handling

**Бүх мөнгөн дүн BigInt-ээр хадгалагдана (cents/товгрөг \* 100):**

- 10,000₮ → `1000000n` (database)
- Float → BigInt: `BigInt(Math.round(amount * 100))`
- BigInt → Float: `parseInt(balance) / 100`

## 🔑 Authentication

### JWT Flow

1. **Register/Login** → Returns JWT token
2. **Client** → Stores token in localStorage
3. **Subsequent requests** → Include header: `Authorization: Bearer <token>`
4. **Server** → Verifies token, attaches `user` to context

### Token Payload

```typescript
{
  userId: number;
  email: string;
  role: "BUYER" | "SELLER" | "ADMIN";
  iat: number;
  exp: number;
}
```

## 💰 Wallet System

### Top-up Flow (Demo)

```
topUpFake(amount: Float!)
  ↓
  Atomic Transaction:
    1. wallet.balance += amount (BigInt)
    2. Create WalletTransaction (type: TOP_UP, amount: +cents)
  ↓
  Return updated Wallet
```

### Purchase Flow (Production-ready)

```
purchaseWithWallet(input: CreateOrderInput!)
  ↓
  1. Validate products (status, stock)
  2. Calculate totalAmount (BigInt)
  3. Check wallet.balance >= totalAmount
  ↓
  Atomic Transaction ($transaction):
    4. Create Order
    5. Create OrderItems
    6. Decrement product.stock
    7. Decrement wallet.balance
    8. Create WalletTransaction (type: PURCHASE, amount: -cents)
  ↓
  Return { success, message, order }
```

### Concurrency Safety

Prisma `$transaction` guarantees atomicity:

- If 2 users try to purchase simultaneously with insufficient balance, only the first succeeds
- Database-level locking prevents race conditions

## 📝 GraphQL Schema

See `src/schema.ts` for full schema.

### Key Queries

```graphql
me: User                        # Current user
products(...filters): [Product] # List products
product(id: Int!): Product      # Single product
myWallet: Wallet                # User's wallet
myOrders: [Order]               # User's orders
mySellerOrders: [Order]         # Orders for seller's products
```

### Key Mutations

```graphql
register(input: RegisterInput!): AuthPayload
login(input: LoginInput!): AuthPayload
createProduct(input: CreateProductInput!): Product
topUpFake(amount: Float!): Wallet
purchaseWithWallet(input: CreateOrderInput!): PurchaseResult
createReview(productId: Int!, rating: Int!, comment: String): Review
```

## 🧪 Testing

### GraphQL Playground

Open: **http://localhost:4000/graphql**

### Example: Login & Get Token

```graphql
mutation {
  login(input: { email: "buyer@example.mn", password: "password123" }) {
    token
    user {
      id
      email
      role
    }
  }
}
```

### Example: Top-up Wallet (Authenticated)

Headers:

```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

Mutation:

```graphql
mutation {
  topUpFake(amount: 100000) {
    id
    balance
  }
}
```

### Example: Purchase with Wallet

```graphql
mutation {
  purchaseWithWallet(
    input: {
      items: [{ productId: 1, quantity: 2 }]
      shippingAddress: "УБ, СБД, 1-р хороо"
      notes: "Өглөө хүргээрэй"
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
          name
        }
      }
    }
  }
}
```

## 🛡️ Security

- **Passwords**: bcrypt hashed (10 rounds)
- **JWT**: HS256, 7 days expiry
- **Authorization**: Role-based (BUYER, SELLER, ADMIN)
- **SQL Injection**: Prisma ORM auto-prevents
- **Input Validation**: GraphQL schema + resolver checks

## 🔄 Seeded Demo Data

After `npm run prisma:seed`:

### Users

| Email             | Password    | Role   | Wallet   |
| ----------------- | ----------- | ------ | -------- |
| buyer@example.mn  | password123 | BUYER  | 500,000₮ |
| saruul@example.mn | password123 | SELLER | 0₮       |
| oyunaa@example.mn | password123 | SELLER | 0₮       |
| boldoo@example.mn | password123 | SELLER | 0₮       |
| admin@handmade.mn | admin123    | ADMIN  | 0₮       |

### Products

- 8 products (APPROVED status)
- Categories: Нэхмэл эдлэл, Оёдол, Гоёл чимэглэл, Вааран эдлэл

## 🐛 Troubleshooting

### MySQL connection error

```bash
# Check if MySQL container is running
docker ps

# Restart containers
docker-compose down
docker-compose up -d

# Check logs
docker logs handmade_mysql
```

### Prisma Client not generated

```bash
npx prisma generate
```

### Migration error

```bash
# Reset database (WARNING: deletes all data!)
npx prisma migrate reset

# Re-seed
npm run prisma:seed
```

## 📚 Tech Stack

- **Node.js 20+**
- **TypeScript 5**
- **Apollo Server 4** (GraphQL)
- **Prisma 5** (ORM)
- **MySQL 8** (Database)
- **bcrypt** (Password hashing)
- **jsonwebtoken** (JWT auth)
- **Docker** (MySQL container)

## 📖 Further Reading

- [Prisma Documentation](https://www.prisma.io/docs)
- [Apollo Server Documentation](https://www.apollographql.com/docs/apollo-server)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)

---

Happy coding! 🚀
