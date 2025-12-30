import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/lib/auth';

// GET specific user
export async function GET(request, { params }) {
  try {
    await requireAdmin();
    
    const { id } = await params; // Await params in Next.js 15
    
    const db = await getDb();
    const user = await db.collection('users').findOne({
      _id: new ObjectId(id)
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      nama: user.nama || user.username,
      role: user.role || 'user',
      createdAt: user.createdAt,
    });
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(request, { params }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params; // Await params in Next.js 15
    const { nama, email, role } = await request.json();

    // Prevent admin from demoting themselves
    if (id === admin.id && role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    const updateData = {};
    if (nama) updateData.nama = nama;
    if (email) updateData.email = email;
    if (role) updateData.role = role;

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(request, { params }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params; // Await params in Next.js 15

    // Prevent admin from deleting themselves
    if (id === admin.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection('users').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
