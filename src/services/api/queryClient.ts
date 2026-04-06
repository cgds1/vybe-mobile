import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,   // 2 min
      gcTime: 10 * 60 * 1000,     // 10 min
      retry: 2,
    },
    mutations: {
      retry: 0,
    },
  },
});
