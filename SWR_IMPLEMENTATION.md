# SWR Implementation for Anime Blog

## Overview

This document explains the SWR (Stale-While-Revalidate) implementation in the anime blog app for efficient data fetching and caching.

## What is SWR?

SWR is a React Hooks library for data fetching that provides:
- **Automatic caching** - Data is cached and reused across components
- **Revalidation** - Data is automatically revalidated when needed
- **Focus revalidation** - Data refreshes when the user focuses on the window
- **Network recovery** - Data revalidates when the network reconnects
- **Request deduplication** - Multiple requests for the same data are deduplicated
- **Error handling** - Built-in error handling and retry logic

## Implementation Details

### 1. SWR Provider Setup

Located in `src/components/SWRProvider.tsx`:
```typescript
<SWRConfig
  value={{
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 30000, // 30 seconds
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    dedupingInterval: 2000,
    focusThrottleInterval: 5000,
    loadingTimeout: 3000,
  }}
>
  {children}
</SWRConfig>
```

### 2. Custom Hook: usePosts

Located in `src/hooks/usePosts.ts`:
```typescript
export function usePosts() {
  const { data: posts, error, isLoading, mutate } = useSWR<Post[]>(
    'posts',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000,
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
```

### 3. Fetcher Function

The fetcher function handles the actual data fetching:
```typescript
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
```

## Benefits

### Performance Improvements
- **Reduced API calls** - Data is cached and reused
- **Faster page loads** - Cached data is shown immediately
- **Background updates** - Data updates in the background without blocking UI

### User Experience
- **Instant loading** - Cached data appears immediately
- **Automatic updates** - Data stays fresh with background revalidation
- **Offline resilience** - Cached data works offline
- **Error recovery** - Automatic retry on network errors

### Developer Experience
- **Simple API** - Just use the hook, no complex state management
- **Automatic synchronization** - Data stays in sync across components
- **Built-in loading states** - Loading states are handled automatically

## Configuration Options

| Option | Value | Description |
|--------|-------|-------------|
| `revalidateOnFocus` | `false` | Don't revalidate when window gains focus |
| `revalidateOnReconnect` | `true` | Revalidate when network reconnects |
| `refreshInterval` | `30000` | Refresh data every 30 seconds |
| `errorRetryCount` | `3` | Retry failed requests 3 times |
| `errorRetryInterval` | `5000` | Wait 5 seconds between retries |
| `dedupingInterval` | `2000` | Dedupe requests within 2 seconds |
| `focusThrottleInterval` | `5000` | Throttle focus events to 5 seconds |
| `loadingTimeout` | `3000` | Show loading state after 3 seconds |

## Usage in Components

### Before (Manual State Management)
```typescript
const [posts, setPosts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetchPosts();
}, []);

const fetchPosts = async () => {
  // Manual fetch logic
};
```

### After (SWR)
```typescript
const { posts, isLoading, error, mutate } = usePosts();
// That's it! SWR handles everything else
```

## Testing

The SWR implementation includes comprehensive tests in `src/__tests__/hooks/usePosts.test.tsx` that verify:
- Successful data fetching
- Error handling
- Manual revalidation capabilities

## Next Steps

This implementation provides a solid foundation for:
1. **Optimistic updates** - Show immediate feedback for user actions
2. **Real-time updates** - Integrate with Supabase real-time subscriptions
3. **Advanced caching** - Add Redis or other caching layers
4. **Offline support** - Implement offline-first capabilities

## Migration Notes

The homepage has been successfully migrated from manual state management to SWR. The old implementation used:
- `useState` for posts, loading, and error states
- `useEffect` for data fetching
- Manual error handling and loading states

The new SWR implementation provides the same functionality with:
- Automatic caching and revalidation
- Better error handling
- Improved performance
- Cleaner, more maintainable code 