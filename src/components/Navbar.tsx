import { Link } from "@tanstack/react-router";
import { Brand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-8">
        <Brand />
        <nav className="hidden items-center gap-8 md:flex">
          {[
            { label: "Features", href: "/#features" },
            { label: "Pricing",  href: "/#pricing" },
            { label: "Contact",  href: "/#contact" },
          ].map(n => (
            <a key={n.label} href={n.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Button asChild size="sm" className="rounded-full h-8 px-4 text-xs bg-green text-white hover:bg-green/90" style={{ background: "var(--green)" }}>
              <Link to="/app">Open app →</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost" className="h-8 px-3 text-xs">
                <Link to="/auth/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full h-8 px-4 text-xs" style={{ background: "var(--green)", color: "white" }}>
                <Link to="/auth/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
