'use client';

interface OptimisticPostIndicatorProps {
  isCreating: boolean;
  title: string;
  content: string;
}

export function OptimisticPostIndicator({ isCreating, title, content }: OptimisticPostIndicatorProps) {
  if (!isCreating) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-lg shadow-lg p-4 max-w-sm animate-pulse">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">Creating post...</h4>
          <p className="text-xs text-blue-100 mt-1 truncate">
            "{title}"
          </p>
        </div>
      </div>
      <div className="mt-2 text-xs text-blue-100">
        <span className="inline-block bg-blue-500 px-2 py-1 rounded">
          Optimistic Update
        </span>
        <span className="ml-2">Your post will appear immediately!</span>
      </div>
    </div>
  );
} 