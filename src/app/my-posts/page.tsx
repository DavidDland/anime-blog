'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
}

export default function MyPosts() {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyPosts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setError(`Error fetching posts: ${error.message}`);
      } else {
        setPosts(data || []);
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching posts.');
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user.id);

      if (error) {
        setError(`Error deleting post: ${error.message}`);
      } else {
        // Remove the deleted post from the local state
        setPosts(posts.filter(post => post.id !== postId));
      }
    } catch (err) {
      setError('An unexpected error occurred while deleting the post.');
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, [user]);

  return (
    <ProtectedRoute>
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

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Posts</h1>
            <Link
              href="/create-post"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Create New Post
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your posts...</p>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500 mb-6">
                  You haven't created any posts yet. Start sharing your anime reviews!
                </p>
                <Link
                  href="/create-post"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                >
                  Create Your First Post
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {post.title}
                      </h2>
                      <p className="text-sm text-gray-500 mb-2">
                        Created on {new Date(post.created_at).toLocaleDateString()} at{' '}
                        {new Date(post.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Link
                        href={`/post/${post.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-gray-700 mb-4">
                    {post.content.length > 300 ? (
                      <>
                        {post.content.substring(0, 300)}...
                        <Link
                          href={`/post/${post.id}`}
                          className="text-blue-600 hover:text-blue-500 font-medium ml-1"
                        >
                          Read more
                        </Link>
                      </>
                    ) : (
                      post.content
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Post ID: {post.id}</span>
                    <span>{post.content.length} characters</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {posts.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Showing {posts.length} post{posts.length !== 1 ? 's' : ''} • 
                <Link href="/" className="text-blue-600 hover:text-blue-500 ml-1">
                  View all posts
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 