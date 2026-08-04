import { cn } from "@/utils/cn";

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
} as const;

export type AppContainerMaxWidth = keyof typeof maxWidthClasses;

export interface AppContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Horizontal width constraint (defaults to `7xl`). */
  maxWidth?: AppContainerMaxWidth;
}

/**
 * Generic width-constraining wrapper: centers content and applies responsive
 * horizontal padding. The single place that owns horizontal gutters, so
 * headers, footers, pages and dialogs all align to the same grid.
 */
export function AppContainer({
  maxWidth = "7xl",
  className,
  ...props
}: AppContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        maxWidthClasses[maxWidth],
        className,
      )}
      {...props}
    />
  );
}
