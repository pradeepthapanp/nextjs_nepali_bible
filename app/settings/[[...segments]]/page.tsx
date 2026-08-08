import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsRouteDispatcher } from "@/features/settings/components/settings-route-dispatcher";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Settings",
  path: "/settings",
  noindex: true,
});

/**
 * /settings — the Settings Center route (WEB-FIRST).
 *
 * A single catch-all covers every Settings route (`/settings`,
 * `/settings/profile`, `/settings/account`, `/settings/appearance`,
 * `/settings/reading`, `/settings/audio`, `/settings/notifications`,
 * `/settings/about`, `/settings/privacy`, `/settings/licenses`).
 * `SettingsRouteDispatcher` reads the pathname and renders the matching
 * section inside the shared `SettingsLayout` (permanent sidebar on desktop,
 * slide-over drawer on mobile). Real routes keep browser back/forward working.
 */
export default function SettingsRoute() {
  return (
    <Suspense fallback={null}>
      <SettingsRouteDispatcher />
    </Suspense>
  );
}
