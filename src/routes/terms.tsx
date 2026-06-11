import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "./privacy";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Quietly" },
      { name: "description", content: "The terms governing your use of Quietly." },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <LegalLayout title="Terms of Service" updated="June 9, 2026">
      <p>
        These Terms of Service ("Terms") govern your access to and use of Quietly (the "Service").
        By using the Service, you agree to be bound by these Terms.
      </p>

      <h2 className="font-display text-2xl mt-10">1. Eligibility</h2>
      <p>You must be at least 13 years old and capable of forming a binding contract.</p>

      <h2 className="font-display text-2xl mt-10">2. Accounts</h2>
      <p>
        You are responsible for your account credentials and for all activity under your account.
        Notify us immediately of any unauthorized use.
      </p>

      <h2 className="font-display text-2xl mt-10">3. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Use the Service for unlawful, harmful, or abusive purposes.</li>
        <li>Submit content that violates intellectual property, privacy, or other rights.</li>
        <li>Attempt to reverse-engineer, scrape, or disrupt the Service.</li>
        <li>Use the Service to generate spam, deception, or harassing content.</li>
      </ul>

      <h2 className="font-display text-2xl mt-10">4. Your content</h2>
      <p>
        You retain ownership of your Input and Output. You grant us a limited license to process
        your content solely to provide the Service.
      </p>

      <h2 className="font-display text-2xl mt-10">5. Subscriptions and payment</h2>
      <p>
        Paid plans are billed in advance on a recurring basis. You can cancel anytime; cancellations
        take effect at the end of the current billing period. Fees are non-refundable except as
        required by law.
      </p>

      <h2 className="font-display text-2xl mt-10">6. AI limitations</h2>
      <p>
        AI Output may be inaccurate, incomplete, or offensive. Do not rely on the Service for
        medical, legal, financial, or other professional advice. You are responsible for reviewing
        Output.
      </p>

      <h2 className="font-display text-2xl mt-10">7. Termination</h2>
      <p>
        We may suspend or terminate your account for violation of these Terms. You may delete your
        account at any time.
      </p>

      <h2 className="font-display text-2xl mt-10">8. Disclaimers</h2>
      <p>
        The Service is provided "as is" without warranties of any kind, express or implied,
        including merchantability, fitness for a particular purpose, and non-infringement.
      </p>

      <h2 className="font-display text-2xl mt-10">9. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Quietly's total liability will not exceed the amount
        you paid us in the 12 months preceding the event giving rise to the claim.
      </p>

      <h2 className="font-display text-2xl mt-10">10. Governing law</h2>
      <p>
        These Terms are governed by the laws of the jurisdiction in which Quietly is established.
      </p>

      <h2 className="font-display text-2xl mt-10">11. Changes</h2>
      <p>We may modify these Terms; continued use after changes means you accept them.</p>

      <h2 className="font-display text-2xl mt-10">12. Contact</h2>
      <p>
        Reach us at{" "}
        <a href="mailto:legal@quietly.app" className="underline">
          legal@quietly.app
        </a>
        .
      </p>
    </LegalLayout>
  );
}
