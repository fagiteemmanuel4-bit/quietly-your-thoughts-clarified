import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({ component: TermsPage });

function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0D0D12] text-[#F5F5F7] py-20 px-6">
      <div className="max-w-3xl mx-auto prose prose-invert prose-p:text-white/40 prose-p:leading-relaxed">
        <Link to="/" className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#7B5EA7] mb-12 inline-block hover:text-white transition-colors">← Back to System</Link>
        <h1 className="text-4xl font-display font-bold mb-8">Terms of Intelligence</h1>

        <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">1. Neural Usage</h2>
            <p>Users are responsible for the content they synthesize using the Quietly engine. Automated abuse of AI endpoints is prohibited.</p>
        </section>

        <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">2. Account Responsibility</h2>
            <p>You are responsible for maintaining the security of your account and your client-side encryption keys.</p>
        </section>

        <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">3. Termination</h2>
            <p>Users can delete their account and associated data at any time via the System Settings dashboard.</p>
        </section>
      </div>
    </div>
  );
}
