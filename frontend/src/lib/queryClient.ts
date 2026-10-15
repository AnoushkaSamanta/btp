/**
 * queryClient.ts  –  Singleton TanStack QueryClient
 *
 * Imported in main.tsx for the provider AND re-exported for
 * manual invalidation calls from non-React contexts (e.g. utility functions).
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Always consider data stale immediately so refetches happen on focus
      staleTime: 0,
      // Cache data for 5 min to avoid redundant network hits within a session
      gcTime: 5 * 60 * 1000,
      // Retry once before surfacing the error to the UI
      retry: 1,
      retryDelay: 800,
      // Refetch when window regains focus (user switches tabs/app → comes back)
      refetchOnWindowFocus: true,
      // Always refetch when a query is mounted by a new component
      refetchOnMount: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
