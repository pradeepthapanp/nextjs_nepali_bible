"use client";

import * as React from "react";
import { Music, Plus, SearchX, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/ui/loading-state";
import { SearchInput } from "@/components/ui/search-input";
import { Section } from "@/components/ui/section";
import {
  CardSkeleton,
  ListSkeleton,
  TextSkeleton,
} from "@/components/ui/skeletons";
import { Breadcrumb } from "@/components/navigation/breadcrumb";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { ResponsiveDrawer } from "@/components/navigation/responsive-drawer";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

/**
 * Design system styleguide — renders every shared component so the system can
 * be reviewed and verified in the browser. This is NOT a feature page; it will
 * be replaced by real feature content during migration.
 */
export function DesignSystemShowcase() {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [language, setLanguage] = React.useState("ne");

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <Breadcrumb
          items={[{ label: "गृह", href: "/" }, { label: "डिजाइन प्रणाली" }]}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              डिजाइन प्रणाली
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Reusable, accessible, responsive building blocks shared by every
              feature.
            </p>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher value={language} onValueChange={setLanguage} />
          </div>
        </div>
      </header>

      <Section
        title="Buttons"
        description="Variants and sizes for every interactive action."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Add">
            <Plus aria-hidden />
          </Button>
        </div>
      </Section>

      <Section
        title="Cards"
        description="The standard content surface across all features."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Card title</CardTitle>
              <CardDescription>Optional supporting text.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Body content goes here.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Action</Button>
            </CardFooter>
          </Card>

          <Card interactive className="p-5">
            <h3 className="font-semibold text-foreground">Interactive card</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Hover to see feedback. Pass href for a clickable card.
            </p>
          </Card>

          <Card href="/" interactive>
            <CardHeader>
              <CardTitle>Linked card</CardTitle>
              <CardDescription>The whole card is one link target.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Click anywhere to navigate.
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section
        title="Forms"
        description="Inputs, labels and the debounced search field."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="तपाईंको नाम" />
          </div>
          <div className="space-y-3">
            <Label htmlFor="search">Search</Label>
            <SearchInput
              id="search"
              label="Search"
              value={search}
              onValueChange={setSearch}
              placeholder="खोज्नुहोस्…"
            />
            <p className="text-xs text-muted-foreground">
              Debounced value: {debouncedSearch || "(empty)"}
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Avatar"
        description="Profile images with an automatic initials fallback."
      >
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name="राम शर्मा" size="xl" />
          <Avatar name="Anita Gurung" size="lg" />
          <Avatar name="David" size="md" />
          <Avatar size="sm" />
        </div>
      </Section>

      <Section
        title="Feedback"
        description="Empty, loading and error states used by every feature."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <EmptyState
            icon={SearchX}
            title="केही फेला परेन"
            description="Try a different search or filter."
            action={
              <Button variant="outline" size="sm">
                Clear filters
              </Button>
            }
          />
          <LoadingState label="Loading…" />
          <ErrorState
            title="लोड गर्न सकिएन"
            description="Something went wrong."
            onRetry={() => undefined}
          />
        </div>
      </Section>

      <Section
        title="Skeletons"
        description="Loading placeholders that mirror the final UI."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-5">
            <TextSkeleton lines={3} />
          </div>
          <CardSkeleton />
          <ListSkeleton items={2} />
        </div>
      </Section>

      <Section
        title="Overlays"
        description="Accessible dialogs and drawers (try focus trap + Escape)."
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setConfirmOpen(true)}>
            <Trash2 aria-hidden />
            Open confirm dialog
          </Button>
          <Button variant="outline" onClick={() => setDrawerOpen(true)}>
            <Music aria-hidden />
            Open drawer
          </Button>
        </div>
      </Section>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        variant="destructive"
        title="के तपाईं पक्का हुनुहुन्छ?"
        description="This action cannot be undone. The item will be permanently deleted."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => setConfirmOpen(false)}
      />

      <ResponsiveDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        side="right"
        title="Drawer"
      >
        <p className="text-sm text-muted-foreground">
          A reusable side panel. Try Tab (focus trap), Escape, and the
          backdrop.
        </p>
        <div className="mt-4">
          <Button className="w-full" onClick={() => setDrawerOpen(false)}>
            Close
          </Button>
        </div>
      </ResponsiveDrawer>
    </div>
  );
}
