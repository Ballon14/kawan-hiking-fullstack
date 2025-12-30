import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/lib/auth';

// GET all users
export async function GET(request) {
  try {
    await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    const db = await getDb();
    
    let query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { nama: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }

    const users = await db.collection('users')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      users.map(user => ({
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        nama: user.nama || user.username,
        role: user.role || 'user',
        createdAt: user.createdAt,
      }))
    );
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to get users' },
      { status: 500 }
    );
  }
}
