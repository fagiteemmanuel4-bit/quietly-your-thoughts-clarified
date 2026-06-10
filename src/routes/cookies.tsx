import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "./privacy";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — Quietly" },
      { name: "description", content: "How Quietly uses cookies and similar technologies." },
    ],
  }),
  component: Cookies,
});

function Cookies() {
  return (
    <LegalLayout title="Cookie Policy" updated="June 9, 2026">
      <p>
        This Cookie Policy explains how Quietly uses cookies and similar technologies when you visit
        our Service.
      </p>

      <h2 className="font-display text-2xl mt-10">1. What are cookies</h2>
      <p>
        Cookies are small text files stored on your device when you visit a website. They allow the
        site to remember information about you, such as preferences and login state.
      </p>

      <h2 className="font-display text-2xl mt-10">2. Cookies we use</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Essential cookies</strong> — required for authentication and core functionality.
          Cannot be disabled.
        </li>
        <li>
          <strong>Preference cookies</strong> — remember your settings (e.g. dark mode).
        </li>
        <li>
          <strong>Analytics cookies</strong> — help us understand usage in aggregate. You can opt
          out.
        </li>
      </ul>

      <h2 className="font-display text-2xl mt-10">3. Third-party cookies</h2>
      <p>
        Our authentication providers (e.g. Google) and analytics tools may set their own cookies
        under their respective privacy policies.
      </p>

      <h2 className="font-display text-2xl mt-10">4. Managing cookies</h2>
      <p>
        You can manage cookies via your browser settings. Disabling essential cookies may impair
        core Service functionality.
      </p>

      <h2 className="font-display text-2xl mt-10">5. Contact</h2>
      <p>
        Questions? Email{" "}
        <a href="mailto:privacy@quietly.app" className="underline">
          privacy@quietly.app
        </a>
        .
      </p>
    </LegalLayout>
  );
}
