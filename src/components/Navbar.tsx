import { Link } from "@tanstack/react-router";
import { Brand, BetaPill } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Brand />
          <BetaPill />
        </div>
        <nav className="hidden items-center gap-7 md:flex">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <a
            href="/#features"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="/#pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </a>
          <Link
            to="/contact"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Button asChild size="sm" className="rounded-md">
              <Link to="/app">Open app</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link to="/auth/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="rounded-md">
                <Link to="/auth/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
