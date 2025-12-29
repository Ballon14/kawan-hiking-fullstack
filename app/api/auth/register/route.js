import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { username, password, role, email, nomor_hp, alamat } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const [users] = await pool.query(
      'SELECT id FROM users WHERE username=?',
      [username]
    );
    if (users.length > 0) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Check if email already exists
    if (email) {
      const [emailUsers] = await pool.query(
        'SELECT id FROM users WHERE email=?',
        [email]
      );
      if (emailUsers.length > 0) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Sanitize input
    const sanitizedUsername = username.trim().substring(0, 50);
    const sanitizedEmail = email ? email.trim().substring(0, 255) : null;
    const sanitizedNomorHp = nomor_hp ? nomor_hp.trim().substring(0, 20) : null;
    const sanitizedAlamat = alamat ? alamat.trim().substring(0, 500) : null;

    const hash = await bcrypt.hash(password, 12);
    const userRole = role === 'admin' ? 'admin' : 'user';

    await pool.query(
      'INSERT INTO users (username, password_hash, role, email, nomor_hp, alamat) VALUES (?, ?, ?, ?, ?, ?)',
      [sanitizedUsername, hash, userRole, sanitizedEmail, sanitizedNomorHp, sanitizedAlamat]
    );

    return NextResponse.json({ message: 'Registered successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 }
      );
    }
    console.error('Register error:', err);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
