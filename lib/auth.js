import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '12h', 
    issuer: 'kawan-hiking' 
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, { issuer: 'kawan-hiking' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    throw new Error('Token not valid');
  }
}

export async function getAuthUser() {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const user = verifyToken(token);
    return user;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    throw new Error('Forbidden');
  }
  return user;
}
