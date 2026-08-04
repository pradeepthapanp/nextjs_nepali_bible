import { PageContainer } from "@/components/ui/page-container";
import { PageSkeleton } from "@/components/ui/skeletons";

/**
 * Global loading UI (route-level Suspense fallback).
 *
 * Shown instantly while a route segment streams in from the server. Stays a
 * Server Component (default) and reuses the shared page skeleton so loading
 * mirrors the final layout.
 */
export default function Loading() {
  return (
    <PageContainer className="py-8 sm:py-10">
      <PageSkeleton />
    </PageContainer>
  );
}
