import { Breadcrumb, type BreadcrumbItem } from "@/components/navigation/breadcrumb";
import { PageContainer } from "@/components/ui/page-container";
import { PageTitle } from "@/components/ui/page-title";

export interface ContentLayoutProps {
  children: React.ReactNode;
  /** Optional breadcrumb trail rendered above the title. */
  breadcrumb?: BreadcrumbItem[];
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Actions aligned with the page title (e.g. "Add" buttons). */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * ContentLayout — the standard scaffold for secondary content pages:
 * breadcrumb + page title + body, all inside `PageContainer`. Provides the
 * consistent heading hierarchy and spacing every feature content page uses,
 * so pages only supply their content.
 */
export function ContentLayout({
  children,
  breadcrumb,
  title,
  description,
  actions,
  className,
}: ContentLayoutProps) {
  const hasHeader = Boolean(title || description || actions);

  return (
    <PageContainer className={className}>
      <div className="mb-8 space-y-4">
        {breadcrumb ? <Breadcrumb items={breadcrumb} /> : null}
        {hasHeader ? (
          <PageTitle
            title={title}
            description={description}
            actions={actions}
          />
        ) : null}
      </div>
      {children}
    </PageContainer>
  );
}
