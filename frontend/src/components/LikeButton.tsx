'use client';

import { useState } from 'react';
import api from '@/lib/axios';

interface LikeButtonProps {
    blogId: string;
    initialLikeCount: number;
    initialIsLiked: boolean; // Assuming we add this logic or just try-catch for now
    onLikeChange?: (newCount: number) => void;
}

export default function LikeButton({ blogId, initialLikeCount, initialIsLiked }: LikeButtonProps) {
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [loading, setLoading] = useState(false);

    const toggleLike = async () => {
        if (loading) return;
        setLoading(true);

        // Optimistic update
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

        try {
            if (newIsLiked) {
                await api.post(`/blogs/${blogId}/like`);
            } else {
                await api.delete(`/blogs/${blogId}/like`);
            }
        } catch (error: any) {
            // Revert on failure
            setIsLiked(!newIsLiked);
            setLikeCount(prev => !newIsLiked ? prev + 1 : prev - 1);

            if (error.response?.status === 409) {
                alert('You already liked this post.');
            } else {
                console.error('Failed to toggle like', error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleLike}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${isLiked
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200'
                }`}
        >
            <svg
                className={`w-5 h-5 transition-colors ${isLiked ? 'fill-indigo-600' : 'fill-none'}`}
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="font-medium">{likeCount}</span>
        </button>
    );
}
