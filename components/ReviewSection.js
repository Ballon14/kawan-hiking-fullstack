'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api-client';
import { showToast } from '@/lib/toast';
import StarRating from './StarRating';

export default function ReviewSection({ tripId, tripType }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [tripId, tripType]);

  async function fetchReviews() {
    try {
      const data = await apiGet(`/api/reviews?trip_id=${tripId}&trip_type=${tripType}`);
      setReviews(data.reviews || []);
      setStats({
        average_rating: data.average_rating || 0,
        total_reviews: data.total_reviews || 0,
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      showToast.error('Silakan login terlebih dahulu');
      return;
    }

    if (rating === 0) {
      showToast.error('Pilih rating terlebih dahulu');
      return;
    }

    setSubmitting(true);
    try {
      await apiPost('/api/reviews', {
        trip_id: tripId,
        trip_type: tripType,
        rating,
        comment,
      });
      showToast.success('Review berhasil dikirim!');
      setShowForm(false);
      setRating(0);
      setComment('');
      await fetchReviews();
    } catch (error) {
      showToast.error(error.message || 'Gagal mengirim review');
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  if (loading) {
    return <div className="animate-pulse h-40 bg-slate-800 rounded-xl"></div>;
  }

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">⭐ Reviews & Rating</h3>
          {stats.total_reviews > 0 && (
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-amber-400">
                {stats.average_rating.toFixed(1)}
              </div>
              <div>
                <StarRating rating={Math.round(stats.average_rating)} readonly />
                <div className="text-sm text-slate-400">{stats.total_reviews} reviews</div>
              </div>
            </div>
          )}
        </div>
        {user && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Tulis Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900 rounded-xl p-6 mb-6">
          <h4 className="font-semibold text-white mb-4">Tulis Review Anda</h4>
          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-2">Rating</label>
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-2">Komentar (opsional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              placeholder="Ceritakan pengalaman Anda..."
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Mengirim...' : 'Kirim Review'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setRating(0);
                setComment('');
              }}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <div className="text-4xl mb-2">📝</div>
            <p>Belum ada review. Jadilah yang pertama!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-slate-900 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-full flex items-center justify-center text-white font-bold">
                    {review.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{review.username}</div>
                    <div className="text-xs text-slate-400">{formatDate(review.createdAt)}</div>
                  </div>
                </div>
                <StarRating rating={review.rating} readonly />
              </div>
              {review.comment && (
                <p className="text-slate-300 text-sm mt-3">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
