import { Link } from "@tanstack/react-router";

export function Brand({ size = "md", to = "/" }: { size?: "sm" | "md" | "lg"; to?: string }) {
  const sizeClass = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-xl";
  return (
    <Link to={to} className="inline-flex items-center gap-2 group">
      <span className={`brand-name ${sizeClass} text-foreground`}>Quietly</span>
    </Link>
  );
}

export function BetaPill({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-foreground/8 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-foreground/70 border border-foreground/10 ${className}`}
    >
      Beta
    </span>
  );
}
