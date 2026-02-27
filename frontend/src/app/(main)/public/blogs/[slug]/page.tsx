'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import LikeButton from '@/components/LikeButton';
import CommentSection from '@/components/CommentSection';

interface BlogDetail {
    id: string;
    title: string;
    content: string;
    summary: string | null;
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

export default function BlogDetailPage() {
    const { slug } = useParams();
    const [blog, setBlog] = useState<BlogDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await api.get(`/public/blogs/${slug}`);
                setBlog(response.data);
            } catch (err) {
                console.error('Failed to fetch blog', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchBlog();
    }, [slug]);

    if (loading) return <div className="flex justify-center items-center min-h-[50vh]">Loading blog details...</div>;

    if (error || !blog) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Blog Not Found</h2>
            <p className="text-gray-500">The blog you are looking for does not exist or has been removed.</p>
        </div>
    );

    return (
        <article className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100">
            <header className="mb-10 text-center">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                    {blog.title}
                </h1>

                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                            {blog.user.email[0]}
                        </span>
                        <span className="font-medium">{blog.user.email}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <time dateTime={blog.createdAt}>
                        {new Date(blog.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </time>
                </div>
            </header>

            {blog.summary && (
                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-lg mb-10">
                    <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-2">AI Summary</h3>
                    <p className="text-indigo-900 italic text-lg leading-relaxed">{blog.summary}</p>
                </div>
            )}

            <div className="prose prose-lg prose-indigo max-w-none text-gray-700 leading-relaxed mb-12">
                {blog.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-6">{paragraph}</p>
                ))}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-8 pb-4">
                <LikeButton blogId={blog.id} initialLikeCount={blog._count.likes} initialIsLiked={false} />
            </div>

            <CommentSection blogId={blog.id} />
        </article>
    );
}
