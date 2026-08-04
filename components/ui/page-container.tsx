import { AppContainer } from "@/components/ui/app-container";
import { cn } from "@/utils/cn";

export interface PageContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Width constraint passed through to the inner `AppContainer`. */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
}

/**
 * Page content wrapper: applies responsive vertical rhythm and grows to fill
 * the viewport so footers sit at the bottom. Combines `AppContainer` (gutter
 * ownership) with page-level vertical padding — use it once per page inside
 * layouts and route pages.
 */
export function PageContainer({
  maxWidth = "7xl",
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-1 flex-col py-8 sm:py-10 lg:py-12",
        className,
      )}
      {...props}
    >
      <AppContainer maxWidth={maxWidth} className="flex-1">
        {children}
      </AppContainer>
    </div>
  );
}
