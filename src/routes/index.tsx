import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  ArrowRight,
  Brain,
  Zap,
  Users,
  ShieldCheck,
  Target,
  MessageSquare,
  Check,
  ChevronRight,
  Plus,
  Mic,
  Smile,
  Send,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { helpAssistant } from "@/lib/help.functions";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const ask = useServerFn(helpAssistant);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;
    setLoading(true);
    try {
        const res = await ask({ data: { question } });
        setAnswer(res.text);
    } catch {
        setAnswer("Synthesis interrupted.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D12] text-[#F5F5F7] selection:bg-[#7B5EA7]/30">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 h-20 bg-[#0D0D12]/80 backdrop-blur-xl border-b border-white/5 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#7B5EA7] to-[#4ECDC4] flex items-center justify-center shadow-lg">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Quietly</span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#spaces">Spaces</NavLink>
          <NavLink href="#ai">Intelligence</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/auth/login" className="text-sm font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">Sign In</Link>
          <Button asChild className="rounded-full bg-white text-[#0D0D12] hover:bg-white/90 h-10 px-6 font-bold uppercase tracking-widest text-[10px]">
             <Link to="/auth/signup">Get Started</Link>
          </Button>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-40 pb-20 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-[#7B5EA7]/10 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A24] border border-[#7B5EA7]/20 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
               <Sparkles className="h-3 w-3 text-[#7B5EA7]" />
               <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#7B5EA7]">Introducing Neural Workspace v2.0</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700">
                Turn messy thoughts <br /> into <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7B5EA7] to-[#4ECDC4]">pure clarity.</span>
            </h1>
            <p className="text-white/40 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                The AI-first intelligence layer for individuals and teams who think deeply and move fast.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                <Button asChild className="h-14 px-10 rounded-2xl bg-white text-[#0D0D12] hover:bg-white/90 font-bold uppercase tracking-widest text-xs shadow-2xl shadow-white/5">
                   <Link to="/auth/signup">Start Synthesis — Free</Link>
                </Button>
                <Button variant="ghost" className="h-14 px-10 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 font-bold uppercase tracking-widest text-xs">
                    Watch the Demo <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
            </div>

            <div className="mt-24 rounded-[40px] border border-white/5 bg-[#1A1A24]/40 backdrop-blur-2xl p-4 md:p-6 shadow-2xl animate-in zoom-in duration-1000 delay-500">
                <div className="rounded-[32px] overflow-hidden border border-white/5 aspect-video bg-[#0D0D12]">
                    <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070" alt="Quietly Interface" className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000" />
                </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-20 border-y border-white/5">
           <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-around items-center gap-12 grayscale opacity-30">
                <span className="text-2xl font-bold tracking-tighter">SYNTHESIS</span>
                <span className="text-2xl font-bold tracking-tighter italic">NEURAL_NET</span>
                <span className="text-2xl font-bold tracking-tighter">CLARITY.CO</span>
                <span className="text-2xl font-bold tracking-tighter italic">DEEP_WORK</span>
           </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 px-6">
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-24">
                    <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#7B5EA7] mb-4">Core Engine</h2>
                    <h3 className="text-4xl md:text-5xl font-display font-bold">Six layers of intelligence.</h3>
                </header>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard icon={<Zap />} title="Quick Capture" description="Voice or text. Captured at the speed of thought before it's gone." />
                    <FeatureCard icon={<Brain />} title="Auto Synthesis" description="AI identifies tasks, summaries, and meeting notes automatically." />
                    <FeatureCard icon={<ShieldCheck />} title="Secrets Vault" description="AES-256 client-side encryption. We can't see your data." />
                    <FeatureCard icon={<Target />} title="Neural Planner" description="Dynamic to-do lists that evolve with your project context." />
                    <FeatureCard icon={<Users />} title="Shared Spaces" description="Real-time collaborative environments with presence." />
                    <FeatureCard icon={<Sparkles />} title="Multi-Model" description="Switch between Claude 3.5, GPT-4o, and Gemini instantly." />
                </div>
            </div>
        </section>

        {/* FAQ Section */}
        <section className="py-32 px-6 border-t border-white/5">
            <div className="max-w-4xl mx-auto">
                <header className="mb-20">
                    <h2 className="text-4xl font-display font-bold">Common Queries</h2>
                </header>
                <div className="space-y-6">
                    <FAQItem question="How secure is the Secrets Vault?" answer="We use AES-256-GCM encryption performed entirely in your browser. Your keys never leave your device, meaning even we cannot access your stored secrets." />
                    <FAQItem question="Which AI models can I use?" answer="Quietly supports Claude 3.5 Sonnet, GPT-4o, and Gemini 2.0. Pro users can switch between them on the fly for different reasoning tasks." />
                    <FAQItem question="Can I invite my whole team?" answer="Absolutely. Shared Spaces are designed for scale. You can invite members via secure, domain-agnostic links or direct email invites." />
                </div>
            </div>
        </section>

        {/* Contact Form */}
        <section className="py-32 px-6 bg-white/[0.01] border-t border-white/5">
            <div className="max-w-xl mx-auto">
                <header className="text-center mb-12">
                    <h2 className="text-3xl font-display font-bold">Direct Synthesis</h2>
                    <p className="text-white/40 mt-2">Need human assistance? Drop us a line.</p>
                </header>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Message synthesized. We'll be in touch."); }}>
                    <input placeholder="Your Name" className="w-full h-12 rounded-xl bg-[#1A1A24] border border-white/5 px-4 outline-none focus:border-[#7B5EA7]/50" />
                    <input placeholder="Email Address" type="email" className="w-full h-12 rounded-xl bg-[#1A1A24] border border-white/5 px-4 outline-none focus:border-[#7B5EA7]/50" />
                    <textarea placeholder="Your Message" rows={4} className="w-full rounded-xl bg-[#1A1A24] border border-white/5 p-4 outline-none focus:border-[#7B5EA7]/50 resize-none" />
                    <Button className="w-full h-12 rounded-xl bg-white text-[#0D0D12] font-bold">Send Message</Button>
                </form>
            </div>
        </section>

        {/* How It Works */}
        <section className="py-32 bg-white/[0.02] border-y border-white/5 px-6">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-display font-bold">From chaos to clarity.</h2>
                </header>
                <div className="space-y-12">
                    <StepRow num="01" title="Drop the mess" description="Paste raw notes, record a voice memo, or dump a project brief." />
                    <StepRow num="02" title="Synthesize" description="The neural engine parses meaning and structures the output." />
                    <StepRow num="03" title="Execute" description="Export to your tools or manage directly in Shared Spaces." />
                </div>
            </div>
        </section>

        {/* Spaces Deep Dive */}
        <section id="spaces" className="py-32 px-6 overflow-hidden">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                <div>
                    <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 leading-tight">Collaborate <br /> in silence.</h2>
                    <p className="text-white/40 text-xl leading-relaxed mb-10">Shared Spaces are context-aware environments where your team can brainstorm and execute without the noise of traditional chat.</p>
                    <ul className="space-y-4 mb-12">
                        <li className="flex items-center gap-3"><Check className="h-5 w-5 text-[#4ECDC4]" /> Threaded neural discussions</li>
                        <li className="flex items-center gap-3"><Check className="h-5 w-5 text-[#4ECDC4]" /> Integrated Kanban workflows</li>
                        <li className="flex items-center gap-3"><Check className="h-5 w-5 text-[#4ECDC4]" /> Real-time presence and status</li>
                    </ul>
                    <Button className="h-12 rounded-full border border-white/10 hover:bg-white/5 font-bold uppercase tracking-widest text-[10px]">Learn about Spaces</Button>
                </div>
                <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-br from-[#7B5EA7] to-[#4ECDC4] rounded-[40px] opacity-20 blur-2xl group-hover:opacity-40 transition duration-1000" />
                    <div className="relative bg-[#1A1A24] rounded-[32px] border border-white/10 p-8 shadow-2xl">
                         <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070" className="rounded-2xl opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000" />
                    </div>
                </div>
            </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-32 px-6">
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-24">
                    <h2 className="text-4xl md:text-5xl font-display font-bold">Fair pricing. Deep value.</h2>
                </header>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div className="p-10 rounded-[40px] border border-white/5 bg-[#1A1A24]/20 backdrop-blur-xl">
                        <h3 className="text-xl font-bold mb-2">Thinker</h3>
                        <div className="text-4xl font-display font-bold mb-8">$0 <span className="text-sm font-sans text-white/20 font-normal">/ month</span></div>
                        <ul className="space-y-4 mb-10 opacity-60">
                            <li className="flex items-center gap-2"><Check className="h-4 w-4" /> 50 AI Synth actions</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4" /> 3 Shared Spaces</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Basic Intelligence</li>
                        </ul>
                        <Button className="w-full h-12 rounded-xl border border-white/10 hover:bg-white/5 font-bold">Current Plan</Button>
                    </div>
                    <div className="p-10 rounded-[40px] border border-[#7B5EA7]/30 bg-[#7B5EA7]/10 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-4 right-6 text-[8px] font-bold uppercase tracking-widest text-[#7B5EA7] bg-[#7B5EA7]/10 px-2 py-1 rounded-full border border-[#7B5EA7]/20">Recommended</div>
                        <h3 className="text-xl font-bold mb-2">Architect</h3>
                        <div className="text-4xl font-display font-bold mb-8">$24 <span className="text-sm font-sans text-white/20 font-normal">/ month</span></div>
                        <ul className="space-y-4 mb-10">
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#7B5EA7]" /> Unlimited AI Synth</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#7B5EA7]" /> Pro Models (Claude 3.5)</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#7B5EA7]" /> Unlimited Spaces</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-[#7B5EA7]" /> Secrets Vault Audit</li>
                        </ul>
                        <Button className="w-full h-12 rounded-xl bg-[#7B5EA7] hover:bg-[#7B5EA7]/80 text-white font-bold shadow-xl shadow-[#7B5EA7]/20">Go Pro</Button>
                    </div>
                </div>
            </div>
        </section>

        {/* Footer */}
        <footer className="py-20 border-t border-white/5 px-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-12">
                <div className="max-w-xs">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#7B5EA7] to-[#4ECDC4] flex items-center justify-center">
                            <Brain className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-display text-xl font-bold tracking-tight">Quietly</span>
                    </div>
                    <p className="text-xs text-white/30 leading-relaxed mb-6">Synthesizing human intelligence with neural precision. Built for the modern thinker.</p>
                    <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-[#7B5EA7]/20 transition-colors cursor-pointer"><Zap className="h-3.5 w-3.5" /></div>
                        <div className="h-8 w-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-[#7B5EA7]/20 transition-colors cursor-pointer"><Users className="h-3.5 w-3.5" /></div>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
                    <FooterColumn title="Platform" links={[{label: "Workspace", href: "/app/workspace"}, {label: "Spaces", href: "/app/spaces"}, {label: "Planner", href: "/app/planner"}]} />
                    <FooterColumn title="Company" links={[{label: "About", href: "/#"}, {label: "Contact", href: "/contact"}, {label: "Changelog", href: "/#"}]} />
                    <FooterColumn title="Legal" links={[{label: "Privacy", href: "/privacy"}, {label: "Terms", href: "/terms"}, {label: "Cookies", href: "/cookies"}]} />
                </div>
            </div>
            <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest font-bold text-white/10">© 2024 Quietly Intelligence. All Rights Reserved.</span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#4ECDC4]">System Status: Stable</span>
            </div>
        </footer>
      </main>

      {/* Floating AI Bubble */}
      <div className="fixed bottom-8 right-8 z-[100]">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="h-14 w-14 rounded-full bg-white text-[#0D0D12] flex items-center justify-center shadow-2xl hover:scale-110 transition-all group"
          >
            <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform" />
          </button>
        ) : (
          <div className="w-[380px] bg-[#1A1A24] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
            <header className="p-4 border-b border-white/5 flex items-center justify-between bg-[#1A1A24]/80 backdrop-blur-xl">
               <div className="flex items-center gap-2">
                 <div className="h-6 w-6 rounded-lg bg-[#7B5EA7] flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                 </div>
                 <span className="text-[10px] uppercase tracking-widest font-bold">Neural Assist</span>
               </div>
               <button onClick={() => setChatOpen(false)} className="text-white/20 hover:text-white transition-colors"><X className="h-4 w-4" /></button>
            </header>
            <div className="h-[400px] overflow-y-auto p-6 space-y-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs leading-relaxed">
                    Hello. I am the Quietly Intelligence. How can I help you understand our platform today?
                </div>
                {answer && (
                    <div className="p-4 rounded-2xl bg-[#7B5EA7]/10 border border-[#7B5EA7]/20 text-xs leading-relaxed prose prose-invert prose-xs">
                        <ReactMarkdown>{answer}</ReactMarkdown>
                    </div>
                )}
                {loading && (
                    <div className="flex gap-2">
                        <div className="h-1 w-1 rounded-full bg-[#7B5EA7] animate-bounce" />
                        <div className="h-1 w-1 rounded-full bg-[#7B5EA7] animate-bounce delay-100" />
                        <div className="h-1 w-1 rounded-full bg-[#7B5EA7] animate-bounce delay-200" />
                    </div>
                )}
            </div>
            <form onSubmit={handleAsk} className="p-4 border-t border-white/5 bg-[#0D0D12]/50">
                <div className="relative flex items-center">
                    <input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask anything..."
                        className="w-full bg-[#1A1A24] border border-white/5 rounded-xl h-10 pl-4 pr-10 text-xs focus:border-[#7B5EA7]/50 focus:ring-0 outline-none"
                    />
                    <button type="submit" className="absolute right-2 text-[#7B5EA7] hover:text-white transition-colors">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function NavLink({ href, children }: any) {
    return (
        <a href={href} className="text-sm font-bold uppercase tracking-widest text-white/20 hover:text-white transition-colors">{children}</a>
    );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-white/5 pb-6">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-left group">
                <span className="text-xl font-bold text-white/60 group-hover:text-white transition-colors">{question}</span>
                <Plus className={`h-5 w-5 text-[#7B5EA7] transition-transform duration-500 ${open ? "rotate-45" : ""}`} />
            </button>
            {open && (
                <p className="mt-4 text-white/40 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-500">{answer}</p>
            )}
        </div>
    );
}

function FeatureCard({ icon, title, description }: any) {
    return (
        <div className="p-10 rounded-[40px] bg-[#1A1A24]/40 border border-white/5 hover:border-[#7B5EA7]/20 transition-all duration-500 group shadow-2xl">
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 mb-8 group-hover:bg-[#7B5EA7]/10 group-hover:text-[#7B5EA7] transition-all">
                {icon}
            </div>
            <h4 className="text-xl font-display font-bold mb-3">{title}</h4>
            <p className="text-sm text-white/30 leading-relaxed">{description}</p>
        </div>
    );
}

function StepRow({ num, title, description }: any) {
    return (
        <div className="flex gap-10 group">
            <span className="text-4xl font-display font-bold text-white/10 group-hover:text-[#7B5EA7] transition-colors">{num}</span>
            <div>
                <h4 className="text-2xl font-display font-bold mb-2">{title}</h4>
                <p className="text-white/40 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

function FooterColumn({ title, links }: any) {
    return (
        <div>
            <h5 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/60 mb-6">{title}</h5>
            <ul className="space-y-3">
                {links.map((l: any) => (
                    <li key={l.label}><Link to={l.href} className="text-xs text-white/30 hover:text-white transition-colors">{l.label}</Link></li>
                ))}
            </ul>
        </div>
    );
}
