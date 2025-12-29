import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    const [result] = await pool.query(
      "SELECT COUNT(*) as count FROM chat_messages WHERE is_read = 0 AND role = 'user'"
    );
    const count = result[0]?.count || 0;
    return NextResponse.json({ count });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Unread count error:', err);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}

export async function POST() {
  try {
    await requireAdmin();
    await pool.query(
      "UPDATE chat_messages SET is_read = 1 WHERE role = 'user' AND is_read = 0"
    );
    return NextResponse.json({ message: 'Messages marked as read' });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Mark read error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui status baca' }, { status: 500 });
  }
}
