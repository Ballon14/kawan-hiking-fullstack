import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();
    const [rows] = await pool.query(
      "SELECT * FROM private_trips WHERE JSON_EXTRACT(custom_form, '$.username') = ? ORDER BY id DESC",
      [user.username]
    );
    return NextResponse.json(rows);
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get my private trips error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch user trips' },
      { status: 500 }
    );
  }
}
