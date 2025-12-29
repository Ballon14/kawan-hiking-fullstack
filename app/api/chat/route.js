import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth, requireAdmin, getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    await requireAuth();
    const [rows] = await pool.query(
      'SELECT id, username, message, role, is_read, created_at FROM chat_messages ORDER BY created_at DESC LIMIT 100'
    );
    return NextResponse.json(rows.reverse());
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Chat fetch error:', err);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth();
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 });
    }

    const sanitizedMessage = message.trim().slice(0, 1000);

    const [result] = await pool.query(
      'INSERT INTO chat_messages (username, message, role) VALUES (?, ?, ?)',
      [user.username, sanitizedMessage, user.role]
    );

    // If admin, mark user messages as read
    if (user.role === 'admin') {
      await pool.query(
        "UPDATE chat_messages SET is_read = 1 WHERE role = 'user' AND is_read = 0"
      );
    }

    const [rows] = await pool.query(
      'SELECT id, username, message, role, is_read, created_at FROM chat_messages WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Chat send error:', err);
    return NextResponse.json({ error: 'Gagal mengirim pesan' }, { status: 500 });
  }
}
