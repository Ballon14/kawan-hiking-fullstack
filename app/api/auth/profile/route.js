import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();
    
    const db = await getDb();
    const userProfile = await db.collection('users').findOne(
      { _id: new ObjectId(user.id) },
      { projection: { password: 0 } } // Exclude password
    );

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: userProfile._id.toString(),
      username: userProfile.username,
      email: userProfile.email,
      role: userProfile.role,
      nomor_hp: userProfile.nomor_hp,
      alamat: userProfile.alamat,
      created_at: userProfile.created_at,
    });
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const user = await requireAuth();
    const { email, nomor_hp, alamat } = await request.json();

    const db = await getDb();

    // Check if email already exists for another user
    if (email) {
      const existingEmail = await db.collection('users').findOne({
        email,
        _id: { $ne: new ObjectId(user.id) }
      });
      
      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Update user profile
    await db.collection('users').updateOne(
      { _id: new ObjectId(user.id) },
      { 
        $set: { 
          email,
          nomor_hp,
          alamat,
          updatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
