'use client';

import { SWRConfig } from 'swr';

interface SWRProviderProps {
  children: React.ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Global SWR configuration
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        refreshInterval: 30000, // 30 seconds
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        dedupingInterval: 2000, // Dedupe requests within 2 seconds
        focusThrottleInterval: 5000, // Throttle focus events
        loadingTimeout: 3000, // Show loading state after 3 seconds
        onError: (error: Error) => {
          console.error('SWR Error:', error);
        },
        onSuccess: (data: any, key: string) => {
          console.log(`SWR Success for key: ${key}`, data);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
} 