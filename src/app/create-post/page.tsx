'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CreatePost() {
  const { user } = useUser();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!user) {
      setError('You must be logged in to create a post');
      setLoading(false);
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError('Please fill in both title and content');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            title: title.trim(),
            content: content.trim(),
            author_id: user.id
          }
        ])
        .select();

      if (error) {
        setError(`Error creating post: ${error.message}`);
      } else {
        setSuccess('Post created successfully! Redirecting...');
        // Clear form
        setTitle('');
        setContent('');
        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
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

          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Post</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Post Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="Enter your post title..."
                  required
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {title.length}/200 characters
                </p>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Post Content *
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="Share your thoughts about the anime... What did you like? What didn't you like? Would you recommend it?"
                  required
                  maxLength={5000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {content.length}/5000 characters
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-green-700">{success}</p>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {loading ? 'Creating Post...' : 'Create Post'}
                </button>
                <Link
                  href="/"
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          {/* Tips Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Writing Tips</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Be specific:</strong> Mention character names, plot points, and themes</li>
              <li>• <strong>Share your opinion:</strong> What made this anime special to you?</li>
              <li>• <strong>Consider the audience:</strong> Who would enjoy this anime?</li>
              <li>• <strong>Be respectful:</strong> Constructive criticism is welcome</li>
              <li>• <strong>Include spoiler warnings:</strong> If discussing major plot points</li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 