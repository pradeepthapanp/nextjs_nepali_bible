import { UserRound } from "lucide-react";
import { cn } from "@/utils/cn";

const sizeClasses = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
  xl: "size-20 text-2xl",
} as const;

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string;
  alt?: string;
  /** Name used to derive fallback initials when no `src` is provided. */
  name?: string;
  size?: keyof typeof sizeClasses;
}

/**
 * Avatar — profile image with an initials fallback (derived from `name`).
 * Used everywhere a user/author is represented (comments, profiles, articles).
 */
export function Avatar({
  src,
  alt = "",
  name,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const initials =
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() ?? "";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-brand-100 font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-200",
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- avatars may come from user uploads
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : initials ? (
        initials
      ) : (
        <UserRound className="size-1/2" aria-hidden />
      )}
    </span>
  );
}
