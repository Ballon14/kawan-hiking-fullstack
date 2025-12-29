import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();
    
    const [users] = await pool.query(
      'SELECT id, username, role, email, nomor_hp, alamat, created_at FROM users WHERE id=?',
      [user.id]
    );
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(users[0]);
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get profile error:', err);
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

    // Check if email already exists for another user
    if (email) {
      const [emailCheck] = await pool.query(
        'SELECT id FROM users WHERE email=? AND id != ?',
        [email, user.id]
      );
      if (emailCheck.length > 0) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Sanitize input
    const sanitizedEmail = email ? email.trim().substring(0, 255) : null;
    const sanitizedNomorHp = nomor_hp ? nomor_hp.trim().substring(0, 20) : null;
    const sanitizedAlamat = alamat ? alamat.trim().substring(0, 500) : null;

    await pool.query(
      'UPDATE users SET email=?, nomor_hp=?, alamat=? WHERE id=?',
      [sanitizedEmail, sanitizedNomorHp, sanitizedAlamat, user.id]
    );

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Update profile error:', err);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
