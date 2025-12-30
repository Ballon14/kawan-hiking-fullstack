'use client';

import { useState } from 'react';
import { showToast } from '@/lib/toast';

export default function StarRating({ rating, onRatingChange, readonly = false }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRatingChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`text-2xl transition-all ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
          disabled={readonly}
        >
          {star <= (hover || rating) ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  );
}
