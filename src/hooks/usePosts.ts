import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';

interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
}

const fetcher = async (url: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export function usePosts() {
  const { data: posts, error, isLoading, mutate } = useSWR<Post[]>(
    'posts',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  return {
    posts: posts || [],
    isLoading,
    error: error?.message || null,
    mutate, // For manual revalidation
  };
} 