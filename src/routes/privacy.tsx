import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0D0D12] text-[#F5F5F7] py-20 px-6">
      <div className="max-w-3xl mx-auto prose prose-invert prose-p:text-white/40 prose-p:leading-relaxed">
        <Link to="/" className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#7B5EA7] mb-12 inline-block hover:text-white transition-colors">← Back to System</Link>
        <h1 className="text-4xl font-display font-bold mb-8">Privacy Protocol</h1>
        <p className="text-lg text-white/60 mb-10 italic">Your intelligence is your property. We exist to synthesize it, not own it.</p>

        <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">1. Data Synthesis</h2>
            <p>We process raw thoughts through secure LLM endpoints (OpenRouter). We do not use your private data to train foundation models.</p>
        </section>

        <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">2. Secrets Vault</h2>
            <p>Sensitive data stored in your Secrets Vault is encrypted client-side using AES-256. We never have access to your decryption keys.</p>
        </section>

        <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">3. Team Collaboration</h2>
            <p>Data shared in Spaces is visible only to authorized members of those spaces. Owners maintain full control over member access.</p>
        </section>
      </div>
    </div>
  );
}
