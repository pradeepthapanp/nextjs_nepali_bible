import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { DesignSystemShowcase } from "./_components/design-system-showcase";

/**
 * Root route.
 *
 * Temporarily renders the design-system styleguide (wrapped in the dashboard
 * shell) so the shared components can be reviewed and verified. This is NOT a
 * feature page — it will be replaced by real feature content during migration.
 */
export default function HomePage() {
  return (
    <DashboardLayout>
      <DesignSystemShowcase />
    </DashboardLayout>
  );
}
