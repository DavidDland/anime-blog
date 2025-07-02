'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
}

export default function Home() {
  const { user, loading, signOut } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState('');

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setPostsError(`Error fetching posts: ${error.message}`);
      } else {
        setPosts(data || []);
      }
    } catch (err) {
      setPostsError('An unexpected error occurred while fetching posts.');
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Anime Blog</h1>
            </div>
            <nav className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700">Welcome, {user.email}</span>
                  <button
                    onClick={signOut}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {user ? (
          // Authenticated user content
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Anime Blog!
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Share your thoughts and reviews about your favorite anime series.
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/create-post"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg"
                >
                  Create New Post
                </Link>
                <Link
                  href="/my-posts"
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg"
                >
                  My Posts
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Recent Posts
                </h3>
                <button
                  onClick={fetchPosts}
                  disabled={postsLoading}
                  className="text-blue-600 hover:text-blue-500 font-medium text-sm"
                >
                  {postsLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {postsError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <p className="text-red-700">{postsError}</p>
                </div>
              )}

              {postsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-4">No posts yet. Be the first to share!</p>
                  <Link
                    href="/create-post"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    Create First Post
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {post.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Posted on {new Date(post.created_at).toLocaleDateString()} at{' '}
                            {new Date(post.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <Link
                          href={`/post/${post.id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded ml-4"
                        >
                          Read More
                        </Link>
                      </div>
                      
                      <div className="text-gray-700 mb-3">
                        {post.content.length > 200 ? (
                          <>
                            {post.content.substring(0, 200)}...
                            <Link
                              href={`/post/${post.id}`}
                              className="text-blue-600 hover:text-blue-500 font-medium ml-1"
                            >
                              Continue reading
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
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Protected Route Demo
              </h3>
              <p className="text-gray-600 mb-4">
                This content is only visible to authenticated users. If you were not logged in, 
                you would be redirected to the login page.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-800">
                  ✅ You are successfully authenticated and can access protected content!
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Non-authenticated user content
          <div className="text-center space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Anime Blog
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join our community to share and discover amazing anime reviews and discussions.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Get Started
              </h3>
              <p className="text-gray-600 mb-6">
                Create an account to start sharing your anime reviews and connect with other fans.
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg"
                >
                  Create Account
                </Link>
                <Link
                  href="/login"
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg"
                >
                  Sign In
                </Link>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                🔒 Protected Content
              </h3>
              <p className="text-yellow-700">
                Some features are only available to authenticated users. Sign up or log in to access 
                the full anime blog experience!
              </p>
            </div>

            {/* Public Post Feed for Non-Authenticated Users */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Recent Community Posts
                </h3>
                <button
                  onClick={fetchPosts}
                  disabled={postsLoading}
                  className="text-blue-600 hover:text-blue-500 font-medium text-sm"
                >
                  {postsLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {postsError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <p className="text-red-700">{postsError}</p>
                </div>
              )}

              {postsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-4">No posts yet. Join the community to be the first!</p>
                  <Link
                    href="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    Join Community
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.slice(0, 3).map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {post.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Posted on {new Date(post.created_at).toLocaleDateString()} at{' '}
                            {new Date(post.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <Link
                          href={`/post/${post.id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded ml-4"
                        >
                          Read More
                        </Link>
                      </div>
                      
                      <div className="text-gray-700 mb-3">
                        {post.content.length > 150 ? (
                          <>
                            {post.content.substring(0, 150)}...
                            <Link
                              href={`/post/${post.id}`}
                              className="text-blue-600 hover:text-blue-500 font-medium ml-1"
                            >
                              Continue reading
                            </Link>
                          </>
                        ) : (
                          post.content
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {posts.length > 3 && (
                    <div className="text-center pt-4">
                      <p className="text-gray-600 mb-2">
                        Showing 3 of {posts.length} posts
                      </p>
                      <Link
                        href="/login"
                        className="text-blue-600 hover:text-blue-500 font-medium"
                      >
                        Sign in to see all posts
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
