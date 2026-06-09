import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { ReactNode } from "react";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Quietly" }, { name: "description", content: "How Quietly collects, uses, and protects your information." }] }),
  component: Privacy,
});

export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <article className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Legal</p>
        <h1 className="font-display text-5xl mt-3">{title}</h1>
        <p className="text-sm text-muted-foreground mt-2">Last updated: {updated}</p>
        <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none text-foreground/85 leading-relaxed space-y-6 text-[15px]">
          {children}
        </div>
      </article>
      <Footer />
    </div>
  );
}

function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 9, 2026">
      <p>
        Quietly ("we", "us", "our") respects your privacy. This Privacy Policy explains how we collect,
        use, disclose, and safeguard your information when you visit our website and use our services
        (collectively, the "Service"). Please read this policy carefully.
      </p>

      <h2 className="font-display text-2xl mt-10">1. Information we collect</h2>
      <p>
        <strong>Account information.</strong> When you create an account, we collect your email address,
        name, and authentication identifiers from providers such as Google.
      </p>
      <p>
        <strong>Content.</strong> Text you submit to the Service to be transformed ("Input") and the
        transformed output ("Output") may be stored if you choose to save it to your history.
      </p>
      <p>
        <strong>Usage data.</strong> We collect anonymous information about how you interact with the
        Service, including pages visited, features used, and approximate location derived from IP.
      </p>

      <h2 className="font-display text-2xl mt-10">2. How we use information</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>To provide, maintain, and improve the Service.</li>
        <li>To process your Input through AI models and return the Output.</li>
        <li>To authenticate you and secure your account.</li>
        <li>To send transactional emails (account, billing, security).</li>
        <li>To monitor and prevent fraud, abuse, or violations of our Terms.</li>
      </ul>

      <h2 className="font-display text-2xl mt-10">3. AI processing</h2>
      <p>
        Your Input is sent to third-party AI providers to generate the Output. These providers process
        the data on our behalf and do not use it to train their models. We do not sell your Input or
        Output to any third party.
      </p>

      <h2 className="font-display text-2xl mt-10">4. Sharing</h2>
      <p>
        We share information only with vetted service providers necessary to operate the Service
        (hosting, authentication, AI inference, payments, email). We may disclose information when
        required by law or to protect our rights.
      </p>

      <h2 className="font-display text-2xl mt-10">5. Data retention</h2>
      <p>
        We retain account and saved-history data until you delete it or close your account. Anonymous
        usage data may be retained longer for analytics.
      </p>

      <h2 className="font-display text-2xl mt-10">6. Your rights</h2>
      <p>
        Depending on your jurisdiction, you may have the right to access, correct, delete, or export
        your personal data, and to object to or restrict certain processing. Contact us to exercise
        these rights.
      </p>

      <h2 className="font-display text-2xl mt-10">7. Security</h2>
      <p>
        We use industry-standard safeguards including encryption in transit, access controls, and
        regular reviews. No system is perfectly secure; please use a strong, unique password.
      </p>

      <h2 className="font-display text-2xl mt-10">8. Children</h2>
      <p>The Service is not directed to children under 13. We do not knowingly collect their data.</p>

      <h2 className="font-display text-2xl mt-10">9. Changes</h2>
      <p>
        We may update this Privacy Policy from time to time. Material changes will be communicated via
        email or in-app notice.
      </p>

      <h2 className="font-display text-2xl mt-10">10. Contact</h2>
      <p>Questions? Reach us at <a href="mailto:privacy@quietly.app" className="underline">privacy@quietly.app</a>.</p>
    </LegalLayout>
  );
}
