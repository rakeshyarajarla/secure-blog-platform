'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/protected/ProtectedRoute';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

interface Blog {
    id: string;
    title: string;
    isPublished: boolean;
    createdAt: string;
    slug: string;
}

export default function DashboardPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await api.get('/blogs/me');
                setBlogs(response.data);
            } catch (error) {
                console.error('Failed to fetch blogs', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchBlogs();
        }
    }, [user]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this blog?')) return;
        try {
            await api.delete(`/blogs/${id}`);
            setBlogs(blogs.filter(blog => blog.id !== id));
        } catch (error) {
            console.error('Failed to delete blog', error);
        }
    };

    return (
        <ProtectedRoute>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-900">Your Dashboard</h1>
                    <Link href="/dashboard/create" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                        Create New Blog
                    </Link>
                </div>

                {loading ? (
                    <div>Loading your blogs...</div>
                ) : blogs.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">No blogs yet</h3>
                        <p className="mt-1 text-sm text-gray-500 mb-6">Get started by creating a new blog.</p>
                        <Link href="/dashboard/create" className="bg-indigo-600 text-white px-6 py-2 rounded-md text-sm font-medium shadow-sm hover:bg-indigo-700 transition-colors">
                            Write your first post
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul role="list" className="divide-y divide-gray-200">
                            {blogs.map((blog) => (
                                <li key={blog.id}>
                                    <div className="px-4 py-4 flex items-center sm:px-6">
                                        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                            <div className="truncate">
                                                <div className="flex text-sm">
                                                    <p className="font-medium text-indigo-600 truncate">{blog.title}</p>
                                                    <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                                                        - {blog.isPublished ? 'Published' : 'Draft'}
                                                    </p>
                                                </div>
                                                <div className="mt-2 flex">
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <span>Created {new Date(blog.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-5 flex-shrink-0 flex space-x-2">
                                            <Link href={`/dashboard/edit/${blog.id}`} className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">Edit</Link>
                                            <button onClick={() => handleDelete(blog.id)} className="text-sm text-red-600 hover:text-red-900 font-medium cursor-pointer">Delete</button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
