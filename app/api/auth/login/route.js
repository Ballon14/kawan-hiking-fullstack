import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    const inputUsername = (username || '').trim();
    if (!inputUsername || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user with case-insensitive username
    const [users] = await pool.query(
      'SELECT * FROM users WHERE LOWER(username)=LOWER(?)',
      [inputUsername]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    
    if (!valid) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const token = signToken({
      username: user.username,
      role: user.role,
      id: user.id
    });

    return NextResponse.json({
      token,
      username: user.username,
      role: user.role
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
