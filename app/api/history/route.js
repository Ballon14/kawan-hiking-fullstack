import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await requireAuth();
    const [rows] = await pool.query(
      'SELECT * FROM history ORDER BY id DESC LIMIT 100'
    );
    return NextResponse.json(rows);
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('History error:', err);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
