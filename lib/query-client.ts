import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";
import { DEFAULT_QUERY_RETRY_COUNT, DEFAULT_QUERY_STALE_TIME } from "@/lib/constants";

/**
 * Creates a fresh QueryClient with the app-wide default options.
 * Not exported — callers should use `getQueryClient()` instead.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_QUERY_STALE_TIME,
        retry: DEFAULT_QUERY_RETRY_COUNT,
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        // Include in-flight (pending) queries when dehydrating state so
        // streaming SSR and client hydration stay consistent.
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Returns a single shared QueryClient.
 *
 * - On the **server**: creates a new instance per request so no data leaks
 *   between users (required for SSR correctness).
 * - On the **browser**: caches one instance and reuses it across renders and
 *   client-side navigations.
 *
 * This is the recommended TanStack Query pattern for the Next.js App Router.
 */
export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}
