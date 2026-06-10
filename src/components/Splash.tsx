import { useEffect, useState } from "react";

export function Splash() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1700);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div className="splash-fade-out fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <div className="text-center fade-in">
        <div
          className="brand-name text-5xl md:text-6xl text-foreground"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Quietly
        </div>
        <div className="mt-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          a calm place to think
        </div>
      </div>
    </div>
  );
}
