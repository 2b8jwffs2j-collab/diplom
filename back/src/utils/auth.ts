import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // 7 хоног

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

// JWT token үүсгэх
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// JWT token шалгах
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Нууц үг hash хийх
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Нууц үг шалгах
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Random token үүсгэх (нууц үг сэргээхэд ашиглана)
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
