import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Brain, Zap, Shield, Globe, MousePointer2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen mesh-gradient overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass rounded-[32px] px-8 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-foreground flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-background" />
            </div>
            <span className="font-display text-xl tracking-tight">Quietly</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Vision
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Manifesto
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Intelligence
            </a>
          </div>
          <Link to="/auth/signup">
            <Button
              variant="ghost"
              className="rounded-full px-6 text-xs font-bold uppercase tracking-widest"
            >
              Enter Space
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/10 text-accent text-[10px] font-bold uppercase tracking-[0.3em] mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="h-3 w-3 fill-accent" /> Intelligence Evolved
          </div>

          <h1 className="font-display text-7xl md:text-[120px] leading-[0.85] tracking-tight mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            Thoughts, <br />
            <span className="text-accent italic">Clarified.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed mb-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            A serene, multi-model workspace designed to capture raw human thought and transmute it
            into structured execution.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
            <Link to="/auth/signup">
              <Button
                size="lg"
                className="h-16 px-10 rounded-[24px] bg-foreground text-background text-lg font-medium hover:scale-105 transition-transform shadow-deep group"
              >
                Begin Transformation{" "}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="lg"
              className="h-16 px-10 rounded-[24px] text-lg font-medium border border-border/60 hover:bg-white/40"
            >
              Watch Vision
            </Button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl aspect-square pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-gradient-to-tr from-accent to-violet blur-[120px] rounded-full animate-pulse" />
        </div>

        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sage/20 blur-[100px] rounded-full float" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-accent/10 blur-[120px] rounded-full float [animation-delay:2s]" />
      </section>

      {/* Feature Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: "Neural Chains",
              desc: "Sequence multiple AI models to analyze, summarize, and strategize in a single flow.",
              color: "text-indigo-500",
              bg: "bg-indigo-500/10",
            },
            {
              icon: Zap,
              title: "Instant Clarity",
              desc: "Transmute chaotic notes into professional emails, reports, or action plans in milliseconds.",
              color: "text-amber-500",
              bg: "bg-amber-500/10",
            },
            {
              icon: Shield,
              title: "Private Space",
              desc: "Your thoughts are yours. Encrypted, serene, and free from the noise of the traditional web.",
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group p-10 rounded-[48px] bg-card border border-border/40 hover:border-accent/40 transition-all hover:shadow-lift hover-lift"
            >
              <div
                className={`h-14 w-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-8`}
              >
                <feature.icon className={`h-7 w-7 ${feature.color}`} />
              </div>
              <h3 className="font-display text-3xl mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Visual Teaser */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative aspect-[21/9] rounded-[60px] overflow-hidden shadow-deep group">
            <img
              src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=2067"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              alt="Workspace"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-16">
              <div className="max-w-xl">
                <h2 className="font-display text-5xl text-white mb-6">
                  Designed for the <span className="italic">Deep Worker.</span>
                </h2>
                <p className="text-white/80 text-lg leading-relaxed">
                  Quietly eliminates friction between intention and output. It is the vessel for
                  your most ambitious ideas.
                </p>
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-foreground border-b-[8px] border-b-transparent ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-border/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-foreground flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-background" />
            </div>
            <span className="font-display text-lg tracking-tight">Quietly</span>
          </div>

          <div className="flex gap-12 text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground">
            <a href="#" className="hover:text-foreground">
              Twitter
            </a>
            <a href="#" className="hover:text-foreground">
              Discord
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
          </div>

          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            © 2026 Quietly Intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
}
