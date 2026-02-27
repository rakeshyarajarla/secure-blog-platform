'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        id: string;
        email: string;
    };
}

export default function CommentSection({ blogId }: { blogId: string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await api.get(`/blogs/${blogId}/comments`);
                setComments(response.data);
            } catch (error) {
                console.error('Failed to fetch comments', error);
            } finally {
                setLoading(false);
            }
        };
        fetchComments();
    }, [blogId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const response = await api.post(`/blogs/${blogId}/comments`, {
                content: newComment,
            });
            setComments([response.data, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error('Failed to submit comment', error);
            alert('Failed to post comment. Make sure you are logged in.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="py-4 text-gray-500">Loading comments...</div>;

    return (
        <div className="mt-12 border-t border-gray-100 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Comments ({comments.length})</h3>

            {user ? (
                <form onSubmit={handleSubmit} className="mb-8">
                    <textarea
                        className="w-full rounded-lg border border-gray-300 p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                        rows={3}
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={submitting}
                    />
                    <div className="mt-3 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center mb-8 border border-gray-100">
                    <p className="text-gray-600">Please sign in to leave a comment.</p>
                </div>
            )}

            <div className="space-y-6">
                {comments.map((comment) => (
                    <div key={comment.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-bold uppercase text-sm">
                                {comment.user.email[0]}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{comment.user.email}</p>
                                <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                        <p className="text-gray-700 pl-11">{comment.content}</p>
                    </div>
                ))}
                {comments.length === 0 && !loading && (
                    <p className="text-gray-500 italic text-center py-4">No comments yet. Be the first to share your thoughts!</p>
                )}
            </div>
        </div>
    );
}
