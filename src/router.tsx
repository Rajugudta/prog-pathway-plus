import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  // Cache data briefly and back off on failures so heavy traffic doesn't
  // multiply requests against the backend.
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 10 * 60_000,
        refetchOnWindowFocus: false,
        retry: (count, err) => {
          const msg = String((err as Error)?.message ?? "");
          if (/unauthor|forbidden|invalid/i.test(msg)) return false;
          return count < 3;
        },
        retryDelay: (n) => Math.min(1000 * 2 ** n, 15_000) + Math.random() * 500,
      },
      mutations: { retry: 0 },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 30_000,
  });

  return router;
};
