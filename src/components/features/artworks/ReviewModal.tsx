'use client';

import React, { useState } from 'react';
import { IconX, IconStarFilled } from '@tabler/icons-react';
import { createClient } from '@/utils/supabase-client';
import { toast } from 'react-hot-toast';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    artworkId: string;
    onSuccess: () => void;
}

export default function ReviewModal({ isOpen, onClose, artworkId, onSuccess }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const supabase = createClient();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('Please sign in to write a review');
                return;
            }

            const { error } = await supabase
                .from('artwork_reviews')
                .insert({
                    artwork_id: artworkId,
                    user_id: user.id,
                    rating,
                    comment
                });

            if (error) throw error;

            toast.success('Thank you for your review!');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error submitting review:', error);
            toast.error(error.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="review-modal-overlay" onClick={onClose}>
            <div className="review-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Write a Review</h2>
                    <button className="close-btn" onClick={onClose}><IconX size={24} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="rating-picker">
                        <label>Overall Rating</label>
                        <div className="stars-input">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    className={`star-btn ${star <= (hover || rating) ? 'active' : ''}`}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                >
                                    <IconStarFilled size={32} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Your Review</label>
                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            required
                            placeholder="What did you like or dislike about this artwork?"
                            rows={5}
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .review-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    backdrop-filter: blur(8px);
                }
                .review-modal-content {
                    background: white;
                    width: 90%;
                    max-width: 500px;
                    border-radius: 24px;
                    padding: 32px;
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .rating-picker {
                    margin-bottom: 24px;
                    text-align: center;
                }
                .rating-picker label {
                    display: block;
                    font-weight: 700;
                    margin-bottom: 12px;
                }
                .stars-input {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                }
                .star-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #e2e8f0;
                    transition: all 0.2s;
                }
                .star-btn.active {
                    color: #f59e0b;
                    transform: scale(1.1);
                }
                .form-group label {
                    display: block;
                    font-weight: 700;
                    margin-bottom: 8px;
                }
                .form-group textarea {
                    width: 100%;
                    padding: 16px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 16px;
                    resize: none;
                }
                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 24px;
                }
                .btn-primary {
                    background: #1e293b;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                }
                .btn-secondary {
                    background: #f1f5f9;
                    color: #475569;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                }
                .close-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #64748b;
                }
            `}</style>
        </div>
    );
}
