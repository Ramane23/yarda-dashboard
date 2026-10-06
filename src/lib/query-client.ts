/**
 * The application's single React Query client.
 *
 * It lives in a module (not in component state) so that session code can
 * clear it: cached responses belong to the user who fetched them and must not
 * be shown to whoever signs in next in the same tab.
 */

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchInterval: 60_000,
      retry: 2,
    },
  },
});
