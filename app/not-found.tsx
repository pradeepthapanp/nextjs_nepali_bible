import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";

/**
 * Global 404 page, built from the shared design system.
 *
 * Rendered when a route segment calls `notFound()` or no route matches. Can
 * remain a Server Component since it uses no client APIs.
 */
export default function NotFound() {
  return (
    <PageContainer className="py-16 sm:py-24">
      <EmptyState
        icon={Compass}
        title="पृष्ठ भेटिएन"
        description="The page you are looking for does not exist or may have been moved."
        action={
          <Button href="/" variant="default">
            घर जानुहोस्
          </Button>
        }
      />
    </PageContainer>
  );
}
