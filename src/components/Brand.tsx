import { Link } from "@tanstack/react-router";

// ── Owl SVG Logo ────────────────────────────────────────────────────────────
// Minimalist geometric owl — big green eyes, angular wings, clean silhouette
export function OwlLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Quietly owl logo"
    >
      {/* Body */}
      <ellipse cx="24" cy="28" rx="13" ry="14" fill="currentColor" opacity="0.12" />
      <ellipse cx="24" cy="28" rx="11" ry="12" fill="currentColor" opacity="0.9" />

      {/* Wings */}
      <path d="M13 26 C8 22 6 30 11 33 L14 30 Z" fill="currentColor" opacity="0.7" />
      <path d="M35 26 C40 22 42 30 37 33 L34 30 Z" fill="currentColor" opacity="0.7" />

      {/* Head */}
      <ellipse cx="24" cy="17" rx="10" ry="10" fill="currentColor" opacity="0.9" />

      {/* Ear tufts */}
      <path d="M16 10 L14 5 L19 9 Z" fill="currentColor" />
      <path d="M32 10 L34 5 L29 9 Z" fill="currentColor" />

      {/* Left eye outer */}
      <circle cx="19.5" cy="17" r="4.5" fill="white" />
      {/* Right eye outer */}
      <circle cx="28.5" cy="17" r="4.5" fill="white" />

      {/* Left eye green */}
      <circle cx="19.5" cy="17" r="3" fill="var(--green, #16a34a)" />
      {/* Right eye green */}
      <circle cx="28.5" cy="17" r="3" fill="var(--green, #16a34a)" />

      {/* Left pupil */}
      <circle cx="19.5" cy="17" r="1.4" fill="#052e16" />
      {/* Right pupil */}
      <circle cx="28.5" cy="17" r="1.4" fill="#052e16" />

      {/* Eye shine */}
      <circle cx="20.5" cy="16" r="0.7" fill="white" />
      <circle cx="29.5" cy="16" r="0.7" fill="white" />

      {/* Beak */}
      <path d="M22 20 L24 23 L26 20 Z" fill="#fbbf24" />

      {/* Chest pattern */}
      <ellipse cx="24" cy="31" rx="5" ry="6" fill="white" opacity="0.15" />
    </svg>
  );
}

// ── Brand wordmark ──────────────────────────────────────────────────────────
export function Brand({ size = "md", to = "/" }: { size?: "sm" | "md" | "lg"; to?: string }) {
  const sz   = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";
  const icon = size === "lg" ? 36 : size === "sm" ? 24 : 28;
  return (
    <Link to={to} className="inline-flex items-center gap-2 group select-none">
      <OwlLogo size={icon} className="text-foreground transition-transform group-hover:rotate-6 duration-300" />
      <span className={`font-display font-bold tracking-tight text-foreground ${sz}`}>
        Quietly
      </span>
    </Link>
  );
}

export function BetaPill({ className = "" }: { className?: string }) {
  return (
    <span className={`chip-green ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-green-500 pulse-dot" />
      Beta
    </span>
  );
}
