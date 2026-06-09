import { Link } from "@tanstack/react-router";
import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="mx-auto max-w-6xl px-6 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Brand size="md" />
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Turn messy thoughts into clarity. Quietly is a calm, AI-powered space for thinking.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" hash="features" className="hover:text-foreground text-muted-foreground transition">Features</Link></li>
            <li><Link to="/" hash="pricing" className="hover:text-foreground text-muted-foreground transition">Pricing</Link></li>
            <li><Link to="/app" className="hover:text-foreground text-muted-foreground transition">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/contact" className="hover:text-foreground text-muted-foreground transition">Contact</Link></li>
            <li><Link to="/privacy" className="hover:text-foreground text-muted-foreground transition">Privacy</Link></li>
            <li><Link to="/terms" className="hover:text-foreground text-muted-foreground transition">Terms</Link></li>
            <li><Link to="/cookies" className="hover:text-foreground text-muted-foreground transition">Cookies</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-muted-foreground flex justify-between">
          <span>© {new Date().getFullYear()} Quietly. All rights reserved.</span>
          <span>Made with care.</span>
        </div>
      </div>
    </footer>
  );
}
