'use client';

import React, { useState } from 'react';
import { IconStarFilled, IconUser } from '@tabler/icons-react';
import ReviewModal from './ReviewModal';
import './ReviewSection.css';

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    profiles: {
        full_name: string;
        avatar_url: string;
    };
}

interface ReviewSectionProps {
    artworkId: string;
    avgRating: number;
    totalReviews: number;
    reviews: Review[];
    onReviewAdded: () => void;
}

export default function ReviewSection({ artworkId, avgRating, totalReviews, reviews, onReviewAdded }: ReviewSectionProps) {
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const ratingsCount = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        percent: totalReviews > 0 ? (reviews.filter(r => r.rating === star).length / totalReviews) * 100 : 0
    }));

    return (
        <div className="reviews-container">
            <div className="reviews-summary-card">
                <div className="overall-rating">
                    <span className="rating-num">{avgRating.toFixed(1)}</span>
                    <div className="stars-row">
                        {[...Array(5)].map((_, i) => (
                            <IconStarFilled
                                key={i}
                                size={20}
                                color={i < Math.floor(avgRating) ? '#f59e0b' : '#e2e8f0'}
                            />
                        ))}
                    </div>
                    <span className="total-count">{totalReviews} customer reviews</span>
                </div>

                <div className="rating-bars">
                    {ratingsCount.map(({ star, percent }) => (
                        <div key={star} className="rating-bar-row">
                            <span className="star-label">{star} star</span>
                            <div className="bar-bg">
                                <div className="bar-fill" style={{ width: `${percent}%` }} />
                            </div>
                            <span className="percent-label">{Math.round(percent)}%</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="reviews-list">
                {reviews.length === 0 ? (
                    <div className="empty-reviews">
                        <p>No reviews yet. Be the first to share your experience!</p>
                        <button className="write-review-btn" onClick={() => setIsReviewModalOpen(true)}>Write a Review</button>
                    </div>
                ) : (
                    <>
                        <div className="reviews-header">
                            <h3>Customer Reviews</h3>
                            <button className="write-review-btn" onClick={() => setIsReviewModalOpen(true)}>Write a Review</button>
                        </div>
                        {reviews.map(review => (
                            <div key={review.id} className="review-item">
                                <div className="review-user">
                                    <div className="user-avatar">
                                        {review.profiles?.avatar_url ? (
                                            <img src={review.profiles.avatar_url} alt={review.profiles.full_name} />
                                        ) : (
                                            <IconUser size={20} />
                                        )}
                                    </div>
                                    <div className="user-meta">
                                        <span className="user-name">{review.profiles?.full_name || 'Anonymous'}</span>
                                        <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="review-stars">
                                    {[...Array(5)].map((_, i) => (
                                        <IconStarFilled
                                            key={i}
                                            size={14}
                                            color={i < review.rating ? '#f59e0b' : '#e2e8f0'}
                                        />
                                    ))}
                                </div>
                                <p className="review-text">{review.comment}</p>
                            </div>
                        ))}
                    </>
                )}
            </div>

            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                artworkId={artworkId}
                onSuccess={onReviewAdded}
            />
        </div>
    );
}
