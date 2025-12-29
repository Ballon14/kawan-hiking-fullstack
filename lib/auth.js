import jwt from 'jsonwebtoken';
import { getDb } from './mongodb.js';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

export function createToken(userId, username, role) {
  return jwt.sign(
    { userId, username, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const db = await getDb();
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(decoded.userId) 
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return { id: user._id.toString(), username: user.username, role: user.role };
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Helper to extract token from headers
async function getTokenFromHeaders() {
  const { headers } = await import('next/headers');
  const headersList = await headers();
  const authorization = headersList.get('authorization');
  
  if (!authorization) {
    return null;
  }
  
  // Support both "Bearer TOKEN" and just "TOKEN"
  const parts = authorization.split(' ');
  return parts.length === 2 ? parts[1] : authorization;
}

export async function requireAuth() {
  const token = await getTokenFromHeaders();
  if (!token) {
    throw new Error('Unauthorized');
  }
  return await verifyToken(token);
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    throw new Error('Forbidden');
  }
  return user;
}
