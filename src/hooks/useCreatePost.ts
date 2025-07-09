import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/hooks/useUser';

interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
}

interface CreatePostData {
  title: string;
  content: string;
}

export function useCreatePost() {
  const { user } = useUser();
  const { mutate } = useSWRConfig();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = async (postData: CreatePostData): Promise<Post | null> => {
    if (!user) {
      setError('You must be logged in to create a post');
      return null;
    }

    if (!postData.title.trim() || !postData.content.trim()) {
      setError('Please fill in both title and content');
      return null;
    }

    setIsCreating(true);
    setError(null);

    // Create optimistic post data
    const optimisticPost: Post = {
      id: `temp-${Date.now()}`, // Temporary ID
      title: postData.title.trim(),
      content: postData.content.trim(),
      author_id: user.id,
      created_at: new Date().toISOString(),
    };

    try {
      // Optimistically update the cache
      mutate('posts', (currentPosts: Post[] = []) => {
        return [optimisticPost, ...(currentPosts || [])];
      }, false); // Don't revalidate immediately

      // Actually create the post
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            title: postData.title.trim(),
            content: postData.content.trim(),
            author_id: user.id
          }
        ])
        .select()
        .single();

      if (error) {
        // Revert optimistic update on error
        mutate('posts', (currentPosts: Post[] = []) => {
          return currentPosts.filter(post => post.id !== optimisticPost.id);
        }, false);
        
        setError(`Error creating post: ${error.message}`);
        return null;
      }

      // Update cache with real data
      mutate('posts', (currentPosts: Post[] = []) => {
        return currentPosts.map(post => 
          post.id === optimisticPost.id ? data : post
        );
      }, false);

      // Trigger a revalidation to ensure data is fresh
      mutate('posts');

      return data;
    } catch (err) {
      // Revert optimistic update on error
      mutate('posts', (currentPosts: Post[] = []) => {
        return currentPosts.filter(post => post.id !== optimisticPost.id);
      }, false);
      
      setError('An unexpected error occurred. Please try again.');
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createPost,
    isCreating,
    error,
    clearError: () => setError(null),
  };
} 