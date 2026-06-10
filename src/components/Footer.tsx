import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-subtle/40 mt-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="brand-name text-xl text-foreground">Quietly</div>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            A calm AI workspace for turning messy thoughts into clarity.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Product</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/#features" className="text-foreground/80 hover:text-foreground">
                Features
              </a>
            </li>
            <li>
              <a href="/#pricing" className="text-foreground/80 hover:text-foreground">
                Pricing
              </a>
            </li>
            <li>
              <Link to="/app" className="text-foreground/80 hover:text-foreground">
                Open app
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Legal</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/privacy" className="text-foreground/80 hover:text-foreground">
                Privacy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-foreground/80 hover:text-foreground">
                Terms
              </Link>
            </li>
            <li>
              <Link to="/cookies" className="text-foreground/80 hover:text-foreground">
                Cookies
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Company</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/contact" className="text-foreground/80 hover:text-foreground">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-5 flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Quietly</span>
          <span>A Kryonara product</span>
        </div>
      </div>
    </footer>
  );
}
