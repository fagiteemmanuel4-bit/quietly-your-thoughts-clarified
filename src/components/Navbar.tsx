import { Link } from "@tanstack/react-router";
import { Brand } from "./Brand";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", isDark);
    setDark(isDark);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 transition hover:opacity-80">
          <Brand size="md" />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link to="/" hash="features" className="transition hover:text-foreground">
            Features
          </Link>
          <Link to="/" hash="how" className="transition hover:text-foreground">
            How it works
          </Link>
          <Link to="/" hash="pricing" className="transition hover:text-foreground">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/app">
                <Button size="sm" variant="ghost">Dashboard</Button>
              </Link>
              <Button size="sm" variant="outline" onClick={() => logout()}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth/login">
                <Button size="sm" variant="ghost">Log in</Button>
              </Link>
              <Link to="/auth/signup">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
