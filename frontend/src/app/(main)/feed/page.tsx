'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface FeedBlog {
    id: string;
    title: string;
    summary: string | null;
    slug: string;
    createdAt: string;
    user: {
        id: string;
        email: string;
    };
    _count: {
        likes: number;
        comments: number;
    };
}

export default function FeedPage() {
    const [blogs, setBlogs] = useState<FeedBlog[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchFeed = async (pageNumber: number) => {
        setLoading(true);
        try {
            const response = await api.get(`/public/feed?page=${pageNumber}&limit=5`);
            setBlogs(response.data.data);
            setTotalPages(response.data.meta.totalPages);
        } catch (error) {
            console.error("Failed to fetch feed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed(page);
    }, [page]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Latest Blogs</h1>
                {!user && (
                    <Link href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        Sign in to join the conversation
                    </Link>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center h-32 items-center">Loading...</div>
            ) : blogs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-lg">No blogs published yet. Be the first!</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {blogs.map((blog) => (
                        <div key={blog.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <Link href={`/public/blogs/${blog.slug}`}>
                                    <h2 className="text-2xl font-bold text-gray-900 hover:text-indigo-600 transition-colors mb-2">
                                        {blog.title}
                                    </h2>
                                </Link>
                                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full whitespace-nowrap ml-4">
                                    {new Date(blog.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                                <span className="inline-block w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-bold uppercase text-xs">
                                    {blog.user.email[0]}
                                </span>
                                {blog.user.email}
                            </p>

                            {blog.summary && (
                                <p className="text-gray-600 mb-6 italic border-l-4 border-indigo-200 pl-4 py-1 bg-gray-50/50">
                                    {blog.summary}
                                </p>
                            )}

                            <div className="flex items-center gap-6 mt-6 border-t border-gray-100 pt-4">
                                <div className="flex items-center text-sm text-gray-500 gap-1.5 cursor-pointer hover:text-indigo-600 transition-colors group">
                                    <svg className="w-5 h-5 group-hover:fill-indigo-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                                    <span>{blog._count.likes}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500 gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer group">
                                    <svg className="w-5 h-5 group-hover:fill-indigo-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                    <span>{blog._count.comments}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="flex items-center px-4 py-2 text-sm text-gray-600">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
