import Link from "next/link";
import { useTranslations } from "next-intl";
import { AppContainer } from "@/components/ui/app-container";
import { Logo } from "@/components/ui/logo";
import { footerGroups } from "@/lib/navigation";
import { siteConfig } from "@/lib/site";
import { cn } from "@/utils/cn";

export interface AppFooterProps {
  className?: string;
}

/**
 * AppFooter — global footer (brand, link groups, copyright). Renders as a
 * `<footer>` landmark and shares the `AppContainer` grid so it aligns with the
 * header. Link groups come from `lib/navigation.ts`; features extend the data,
 * not this component.
 */
export function AppFooter({ className }: AppFooterProps) {
  const t = useTranslations();

  return (
    <footer className={cn("border-t bg-muted/40", className)}>
      <AppContainer className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          {footerGroups.map((group) => {
            const title = group.titleKey ? t(group.titleKey) : group.title;
            return (
              <nav key={group.title} aria-label={title}>
                <h2 className="text-sm font-semibold text-foreground">
                  {title}
                </h2>
                <ul className="mt-3 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.labelKey ? t(link.labelKey) : link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            );
          })}
        </div>

        <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}. {t("footer.rights")}
        </div>
      </AppContainer>
    </footer>
  );
}
