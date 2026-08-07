"use client";

import Link from "next/link";
import {
  ExternalLink,
  Globe,
  Info,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_VERSION } from "@/lib/constants";
import { siteConfig } from "@/lib/site";

/**
 * AboutSection — the Settings → About section.
 *
 * REUSES the site metadata (`siteConfig` — the single branding source) and the
 * app version (`APP_VERSION`, mirrored from `package.json`). Privacy / Terms /
 * Licenses link to the real Settings routes.
 */
export function AboutSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">About</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Application information, website and links.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="size-4 text-primary" aria-hidden />
            Application
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <div className="flex items-center justify-between gap-4 py-3">
            <p className="text-sm font-medium text-foreground">Name</p>
            <p className="text-sm text-foreground">{siteConfig.name}</p>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <p className="text-sm font-medium text-foreground">Version</p>
            <p className="text-sm text-foreground">{APP_VERSION}</p>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <p className="text-sm font-medium text-foreground">Description</p>
            <p className="max-w-md text-right text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="size-4 text-primary" aria-hidden />
            Links
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Button variant="outline" href={siteConfig.url} className="justify-start">
            <Globe className="size-4" aria-hidden />
            Website
            <ExternalLink className="ml-auto size-4" aria-hidden />
          </Button>
          <Button variant="outline" href="/settings/privacy" className="justify-start">
            <ShieldCheck className="size-4" aria-hidden />
            Privacy
          </Button>
          <Button variant="outline" href="/settings/privacy" className="justify-start">
            <ShieldCheck className="size-4" aria-hidden />
            Terms
          </Button>
          <Button variant="outline" href="/settings/licenses" className="justify-start">
            <ScrollText className="size-4" aria-hidden />
            Licenses
          </Button>
          <Button
            variant="outline"
            href={siteConfig.links.github}
            className="justify-start sm:col-span-2"
          >
            GitHub
            <ExternalLink className="ml-auto size-4" aria-hidden />
          </Button>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        This is an open-source project. The source code is available on{" "}
        <Link
          href={siteConfig.links.github}
          className="text-primary underline-offset-4 hover:underline"
        >
          GitHub
        </Link>
        .
      </p>
    </div>
  );
}
