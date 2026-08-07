"use client";

import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/lib/site";

const PRIVACY_POINTS = [
  {
    title: "Information you provide",
    body: "When you create an account we store the email address, name and phone number you provide. Your profile photo, saved reading positions, highlights, notes, prayer requests and notices are associated with your account.",
  },
  {
    title: "Information we collect automatically",
    body: "Like most websites we use browser storage on your device to remember your preferences (theme, reading settings, playback defaults). We do not run third-party advertising trackers.",
  },
  {
    title: "How we use your information",
    body: "Your information is used to run the application — signing you in, saving your content, syncing your reading across devices and letting you participate in the community. We never sell your personal data.",
  },
  {
    title: "Data you control",
    body: "You can edit your profile, change your password, sign out and delete your account at any time from Settings. Deleting your account permanently removes your profile and associated data.",
  },
  {
    title: "Contact",
    body: `If you have questions about your data, contact us through the app's GitHub repository (${siteConfig.links.github}).`,
  },
];

/**
 * PrivacySection — the Settings → Privacy section. A plain-language summary of
 * how the application handles data (web-first informational page; the full
 * legal policy lives with the project's terms).
 */
export function PrivacySection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Privacy</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          How {siteConfig.name} collects, uses and protects your information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="size-4 text-primary" aria-hidden />
            Privacy Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {PRIVACY_POINTS.map((point) => (
            <div key={point.title} className="py-4">
              <h3 className="text-sm font-semibold text-foreground">
                {point.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{point.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
