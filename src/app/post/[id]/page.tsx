'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/hooks/useUser';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
}

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useUser();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchPost = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Post not found');
        } else {
          setError(`Error fetching post: ${error.message}`);
        }
      } else {
        setPost(data);
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching the post.');
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async () => {
    if (!user || !post) return;

    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)
        .eq('author_id', user.id);

      if (error) {
        setError(`Error deleting post: ${error.message}`);
      } else {
        // Redirect to home page after successful deletion
        router.push('/');
      }
    } catch (err) {
      setError('An unexpected error occurred while deleting the post.');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              ← Back to Home
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link
                href="/"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const isAuthor = user && user.id === post.author_id;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            ← Back to Home
          </Link>
        </div>

        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Post Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {post.title}
                </h1>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span>
                    Posted on {new Date(post.created_at).toLocaleDateString()} at{' '}
                    {new Date(post.created_at).toLocaleTimeString()}
                  </span>
                  <span>•</span>
                  <span>{post.content.length} characters</span>
                  <span>•</span>
                  <span>Post ID: {post.id}</span>
                </div>
              </div>
              
              {isAuthor && (
                <div className="flex space-x-2 ml-4">
                  <Link
                    href={`/edit-post/${post.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={deletePost}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Post Content */}
          <div className="p-6">
            <div className="prose max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </div>
          </div>

          {/* Post Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {isAuthor ? (
                  <span>You are the author of this post</span>
                ) : (
                  <span>Posted by a community member</span>
                )}
              </div>
              
              <div className="flex space-x-4">
                <Link
                  href="/"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  View All Posts
                </Link>
                {user && (
                  <Link
                    href="/my-posts"
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    My Posts
                  </Link>
                )}
                {user && (
                  <Link
                    href="/create-post"
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Create New Post
                  </Link>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Related Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">What's Next?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-2">Browse All Posts</h3>
              <p className="text-sm text-gray-600">Discover more anime reviews from the community</p>
            </Link>
            
            {user ? (
              <Link
                href="/create-post"
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <h3 className="font-medium text-gray-900 mb-2">Share Your Review</h3>
                <p className="text-sm text-gray-600">Create your own anime review and join the discussion</p>
              </Link>
            ) : (
              <Link
                href="/register"
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <h3 className="font-medium text-gray-900 mb-2">Join the Community</h3>
                <p className="text-sm text-gray-600">Sign up to create your own posts and engage with others</p>
              </Link>
            )}
            
            <Link
              href="/my-posts"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-2">View My Posts</h3>
              <p className="text-sm text-gray-600">See all the posts you've created</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 