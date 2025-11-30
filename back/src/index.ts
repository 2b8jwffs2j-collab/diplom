import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createContext } from './utils/context';
import { uploadMultiple } from './utils/upload';
import prisma from './utils/prisma';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  const app = express();

  // Apollo Server үүсгэх
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true, // GraphQL Playground-д ашиглана
  });

  await server.start();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static files - uploads folder serve хийх
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // File upload endpoint
  app.post('/api/upload', (req: any, res: any) => {
    uploadMultiple(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Upload хийхэд алдаа гарлаа' });
      }
      try {
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
          return res.status(400).json({ error: 'Зураг оруулаагүй байна' });
        }

        const files = req.files as Express.Multer.File[];
        const fileUrls = files.map((file) => {
          // URL үүсгэх: http://localhost:4000/uploads/filename
          const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
          return `${baseUrl}/uploads/${file.filename}`;
        });

        res.json({
          success: true,
          urls: fileUrls,
          message: `${files.length} зураг амжилттай upload хийгдлээ`,
        });
      } catch (error: any) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message || 'Upload хийхэд алдаа гарлаа' });
      }
    });
  });

  // GraphQL endpoint
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => createContext({ req }),
    })
  );

  // Server эхлүүлэх
  app.listen(PORT, () => {
    console.log(`🚀 Server ажиллаж байна: http://localhost:${PORT}/graphql`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  });
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️  Server зогсож байна...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Server зогсож байна...');
  await prisma.$disconnect();
  process.exit(0);
});

// Server эхлүүлэх
startServer().catch((error) => {
  console.error('❌ Server эхлэхэд алдаа гарлаа:', error);
  process.exit(1);
});
