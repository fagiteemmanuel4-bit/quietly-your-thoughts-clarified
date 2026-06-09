import { cn } from "@/lib/utils";

export function Brand({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
    xl: "text-6xl md:text-7xl",
  };
  return (
    <span className={cn("brand-name text-foreground", sizes[size], className)}>
      Quietly<span className="text-muted-foreground">.</span>
    </span>
  );
}
