import { Link } from "@tanstack/react-router";
import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer className="border-t border-border bg-subtle mt-20">
      <div className="mx-auto max-w-6xl px-4 md:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1 space-y-3">
          <Brand size="sm" />
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
            A calm AI workspace that turns messy thoughts into clarity.
          </p>
          <p className="text-xs text-muted-foreground">A Kryonara product</p>
        </div>
        {[
          {
            heading: "Product",
            links: [
              { label: "Features", href: "/#features" },
              { label: "Pricing",  href: "/#pricing" },
              { label: "Open app", href: "/app" },
            ],
          },
          {
            heading: "Legal",
            links: [
              { label: "Privacy", href: "/privacy" },
              { label: "Terms",   href: "/terms" },
              { label: "Cookies", href: "/cookies" },
            ],
          },
          {
            heading: "Company",
            links: [
              { label: "Contact",   href: "/contact" },
              { label: "Help",      href: "/app/help" },
            ],
          },
        ].map(col => (
          <div key={col.heading}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">{col.heading}</p>
            <ul className="space-y-2.5">
              {col.links.map(l => (
                <li key={l.label}>
                  <Link to={l.href as never} className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 md:px-8 py-5 flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Quietly · All rights reserved</span>
          <span className="chip-green">Made with 🦉</span>
        </div>
      </div>
    </footer>
  );
}
