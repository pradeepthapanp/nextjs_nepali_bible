import { cn } from "@/utils/cn";

/**
 * Form label with consistent styling. Associate with a control via
 * `htmlFor` or by wrapping the control.
 */
export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}
