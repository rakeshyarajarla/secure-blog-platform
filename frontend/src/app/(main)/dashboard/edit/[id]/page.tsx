'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/axios';
import ProtectedRoute from '@/components/protected/ProtectedRoute';

export default function EditBlogPage() {
    const router = useRouter();
    const { id } = useParams();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await api.get(`/blogs/me`);
                const blogToEdit = response.data.find((b: any) => b.id === id);

                if (!blogToEdit) {
                    setError('Blog not found or unauthorized.');
                    setLoading(false);
                    return;
                }

                setTitle(blogToEdit.title);
                setContent(blogToEdit.content);
                setIsPublished(blogToEdit.isPublished);
            } catch (err) {
                setError('Failed to fetch blog details');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchBlog();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            await api.patch(`/blogs/${id}`, { title, content, isPublished });
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update blog');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading editor...</div>;

    return (
        <ProtectedRoute>
            <div className="max-w-3xl mx-auto py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Blog</h1>

                {error && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6 border border-red-200">
                        {error}
                    </div>
                )}

                {title !== '' && !error && (
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Blog Title</label>
                            <input
                                type="text"
                                id="title"
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                            <textarea
                                id="content"
                                required
                                rows={12}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="isPublished"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                            />
                            <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900 font-medium">
                                Publish publicly
                            </label>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard')}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-md justify-center text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Updating...' : 'Update Blog'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </ProtectedRoute>
    );
}
