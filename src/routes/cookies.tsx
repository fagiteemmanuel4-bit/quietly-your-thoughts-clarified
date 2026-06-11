import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/cookies")({ component: CookiesPage });

function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#0D0D12] text-[#F5F5F7] py-20 px-6">
      <div className="max-w-3xl mx-auto prose prose-invert prose-p:text-white/40 prose-p:leading-relaxed">
        <Link to="/" className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#7B5EA7] mb-12 inline-block hover:text-white transition-colors">← Back to System</Link>
        <h1 className="text-4xl font-display font-bold mb-8">Cookie Policy</h1>

        <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">1. Neural Persistence</h2>
            <p>We use essential cookies to maintain your session and ensure your AI context remains consistent during use.</p>
        </section>

        <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">2. Preference Storage</h2>
            <p>Cookies help us remember your theme choices and AI model preferences so your workspace feels like home every time.</p>
        </section>

        <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">3. Third-party</h2>
            <p>Our authentication (Firebase) and payment providers may set cookies to handle secure transactions and identity verification.</p>
        </section>
      </div>
    </div>
  );
}
