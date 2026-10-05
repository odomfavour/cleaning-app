import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "light" | "success";

type Props = {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  href?: string;
  full?: boolean;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
    onClick?: React.MouseEventHandler<HTMLElement>;
  };

/** App-level aliases onto shadcn's `Button` variants. */
const variantMap = {
  primary: { variant: "default" },
  secondary: { variant: "outline" },
  ghost: { variant: "ghost" },
  danger: { variant: "destructive" },
  success: { variant: "default", className: "bg-emerald-600 hover:bg-emerald-700" },
  light: { variant: "secondary", className: "bg-white text-blue-900 shadow-lg hover:bg-blue-50" },
} as const;

const sizeMap = { sm: "sm", md: "default", lg: "lg" } as const;

export function Button({ variant = "primary", size = "md", loading, href, full, className, children, disabled, ...rest }: Props) {
  const v = variantMap[variant];
  const cls = cn("className" in v && v.className, full && "w-full", className);

  if (href && !disabled) {
    return (
      <ShadcnButton asChild variant={v.variant} size={sizeMap[size]} className={cls}>
        <Link href={href} onClick={rest.onClick as never}>{children}</Link>
      </ShadcnButton>
    );
  }
  return (
    <ShadcnButton
      {...rest}
      variant={v.variant}
      size={sizeMap[size]}
      className={cls}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading && <Loader2 className="animate-spin" aria-hidden />}
      {children}
    </ShadcnButton>
  );
}
