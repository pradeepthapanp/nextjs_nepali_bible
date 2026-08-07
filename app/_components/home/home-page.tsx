"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { FeatureIcon } from "@/components/icons";
import { AppFooter } from "@/components/navigation/app-footer";
import { AppContainer } from "@/components/ui/app-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { ArticleCard } from "@features/articles/components/article/article-card";
import { useArticles } from "@features/articles/queries/use-articles";
import { AudioArtwork } from "@features/audio";
import { useAudioLibrary } from "@features/songs";
import { devotionToPlainText, useDailyDevotion } from "@features/devotions";
import { homeQuickAccess } from "@/lib/navigation";
import { siteConfig } from "@/lib/site";

/* ------------------------------------------------------------------ */
/* Shared                                                            */
/* ------------------------------------------------------------------ */

interface SectionHeadingProps {
  /** Rendered inline before the title (a `FeatureIcon` or generic Lucide icon). */
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
}

/** Consistent section heading used by every home section. */
function SectionHeading({
  icon,
  title,
  subtitle,
  actionHref,
  actionLabel,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {icon}
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
        >
          {actionLabel}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}

/*
 * Empty-state icon wrappers — `EmptyState` expects a Lucide-style icon
 * component, so these thin wrappers render the shared Font Awesome feature
 * icons (they ignore the `className` EmptyState passes and size themselves).
 */
const DevotionEmptyIcon = () => (
  <FeatureIcon name="devotions" className="text-2xl" />
);
const ArticlesEmptyIcon = () => (
  <FeatureIcon name="articles" className="text-2xl" />
);
const MusicEmptyIcon = () => <FeatureIcon name="music" className="text-2xl" />;

/* ------------------------------------------------------------------ */
/* Hero                                                               */
/* ------------------------------------------------------------------ */

function HomeHero() {
  const t = useTranslations("home");
  return (
    <section className="border-b bg-gradient-to-b from-primary/10 via-background to-background">
      <AppContainer className="py-16 text-center sm:py-24">
        <Image
          src="/logo/app-icon.png"
          alt=""
          width={96}
          height={96}
          priority
          className="mx-auto size-24 rounded-2xl object-cover shadow-lg ring-1 ring-border"
        />
        <h1 className="mx-auto mt-6 max-w-3xl text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          {siteConfig.name}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          {t("heroSubtitle")}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/bible" size="lg">
            <BookOpen className="size-4" aria-hidden />
            {t("readBible")}
          </Button>
          <Button href="/articles" size="lg" variant="outline">
            {t("browseArticles")}
          </Button>
        </div>
      </AppContainer>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Quick access                                                       */
/* ------------------------------------------------------------------ */

function HomeQuickAccess() {
  const t = useTranslations();
  return (
    <section className="py-12">
      <AppContainer>
        <SectionHeading
          icon={<Sparkles className="size-5 text-primary" aria-hidden />}
          title={t("home.exploreTitle")}
          subtitle={t("home.exploreSubtitle")}
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {homeQuickAccess.map((item) => (
            <Link key={item.href} href={item.href} className="group">
              <Card interactive className="h-full">
                <CardContent className="flex h-full flex-col gap-2 p-5">
                  {item.icon ? (
                    <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                      <FeatureIcon name={item.icon} aria-hidden />
                    </span>
                  ) : null}
                  <h3 className="mt-1 font-semibold text-foreground">
                    {item.labelKey ? t(item.labelKey) : item.label}
                  </h3>
                  {item.descriptionKey ? (
                    <p className="text-sm text-muted-foreground">
                      {t(item.descriptionKey)}
                    </p>
                  ) : item.description ? (
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  ) : null}
                  <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-primary">
                    {t("home.open")}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </AppContainer>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Today's devotion                                                   */
/* ------------------------------------------------------------------ */

function HomeDevotion() {
  const { data: devotion, isLoading, isError, error, refetch } =
    useDailyDevotion();
  const t = useTranslations("home");

  const plain = devotion ? devotionToPlainText(devotion.devotion) : "";
  const excerpt =
    plain.length > 320 ? `${plain.slice(0, 320).trimEnd()}…` : plain;

  return (
    <section className="border-y bg-muted/40 py-12">
      <AppContainer>
        <SectionHeading
          icon={<FeatureIcon name="devotions" className="text-primary" />}
          title={t("devotionHeading")}
          subtitle={t("devotionTitle")}
          actionHref="/devotion"
          actionLabel={t("openDevotion")}
        />
        <div className="mt-6">
          {isLoading ? (
            <LoadingState label={t("loadingDevotion")} />
          ) : isError ? (
            <ErrorState
              variant="inline"
              title={t("couldntLoadDevotion")}
              description={t("couldntLoadDevotionDesc")}
              error={error ?? undefined}
              onRetry={refetch}
            />
          ) : devotion ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-base leading-relaxed text-foreground">
                  {excerpt}
                </p>
                <div className="mt-5">
                  <Button href="/devotion">
                    {t("readTodayDevotion")}
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={DevotionEmptyIcon}
              title={t("noDevotionForToday")}
              description={t("noDevotionForTodayDesc")}
            />
          )}
        </div>
      </AppContainer>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Recent articles                                                    */
/* ------------------------------------------------------------------ */

function HomeRecentArticles() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useArticles();
  const t = useTranslations("home");
  const articles = data?.slice(0, 3) ?? [];

  return (
    <section className="py-12">
      <AppContainer>
        <SectionHeading
          icon={<FeatureIcon name="articles" className="text-primary" />}
          title={t("recentArticles")}
          subtitle={t("recentArticlesSubtitle")}
          actionHref="/articles"
          actionLabel={t("allArticles")}
        />
        <div className="mt-6">
          {isLoading ? (
            <LoadingState label={t("loadingArticles")} />
          ) : isError ? (
            <ErrorState
              variant="inline"
              title={t("couldntLoadArticles")}
              error={error ?? undefined}
              onRetry={refetch}
            />
          ) : articles.length === 0 ? (
            <EmptyState icon={ArticlesEmptyIcon} title={t("noArticlesYet")} />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onOpen={(a) => router.push(`/articles/${a.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </AppContainer>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Featured music (latest songs)                                      */
/* ------------------------------------------------------------------ */

function HomeFeaturedMusic() {
  const { audios, isLoading, isError, error, refetch } = useAudioLibrary();
  const t = useTranslations("home");
  const songs = audios.slice(0, 4);

  return (
    <section className="border-y bg-muted/40 py-12">
      <AppContainer>
        <SectionHeading
          icon={<FeatureIcon name="music" className="text-primary" />}
          title={t("featuredMusic")}
          subtitle={t("featuredMusicSubtitle")}
          actionHref="/songs"
          actionLabel={t("allSongs")}
        />
        <div className="mt-6">
          {isLoading ? (
            <LoadingState label={t("loadingSongs")} />
          ) : isError ? (
            <ErrorState
              variant="inline"
              title={t("couldntLoadMusic")}
              error={error ?? undefined}
              onRetry={refetch}
            />
          ) : songs.length === 0 ? (
            <EmptyState icon={MusicEmptyIcon} title={t("noSongsYet")} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {songs.map((song) => (
                <Link key={song.id} href="/songs" className="group">
                  <Card interactive className="h-full">
                    <CardContent className="flex h-full flex-col gap-3 p-4">
                      <AudioArtwork
                        src={song.artUrl}
                        alt={song.title}
                        className="aspect-square w-full rounded-lg"
                      />
                      <div className="min-w-0">
                        <h3 className="line-clamp-1 font-semibold text-foreground">
                          {song.title}
                        </h3>
                        {song.artist ? (
                          <p className="mt-0.5 line-clamp-1 text-sm font-medium text-primary">
                            {song.artist}
                          </p>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </AppContainer>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

/**
 * HomePage — the public landing page. Composes the hero, quick-access
 * cards (from `lib/navigation.ts`), today's devotion, recent articles,
 * featured music and the footer.
 */
export function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeQuickAccess />
      <HomeDevotion />
      <HomeRecentArticles />
      <HomeFeaturedMusic />
      <AppFooter />
    </>
  );
}
