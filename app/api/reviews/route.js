import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/lib/auth';

// GET reviews for a trip
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('trip_id');
    const tripType = searchParams.get('trip_type'); // 'open_trip' or 'private_trip'

    if (!tripId || !tripType) {
      return NextResponse.json(
        { error: 'trip_id and trip_type required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const reviews = await db.collection('reviews')
      .find({ 
        trip_id: new ObjectId(tripId),
        trip_type: tripType 
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      reviews: reviews.map(r => ({
        id: r._id.toString(),
        user_id: r.user_id.toString(),
        username: r.username,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
      average_rating: Math.round(avgRating * 10) / 10,
      total_reviews: reviews.length,
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to get reviews' },
      { status: 500 }
    );
  }
}

// POST new review
export async function POST(request) {
  try {
    const user = await requireAuth();
    const { trip_id, trip_type, rating, comment } = await request.json();

    if (!trip_id || !trip_type || !rating) {
      return NextResponse.json(
        { error: 'trip_id, trip_type, and rating required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if user already reviewed this trip
    const existing = await db.collection('reviews').findOne({
      trip_id: new ObjectId(trip_id),
      trip_type,
      user_id: new ObjectId(user.id),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'You have already reviewed this trip' },
        { status: 400 }
      );
    }

    const result = await db.collection('reviews').insertOne({
      trip_id: new ObjectId(trip_id),
      trip_type,
      user_id: new ObjectId(user.id),
      username: user.username,
      rating: parseInt(rating),
      comment: comment?.trim() || '',
      createdAt: new Date(),
    });

    return NextResponse.json({
      id: result.insertedId.toString(),
      message: 'Review submitted successfully',
    }, { status: 201 });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Create review error:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
