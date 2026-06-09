import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Quietly" }, { name: "description", content: "Get in touch with the Quietly team." }] }),
  component: Contact,
});

function Contact() {
  const [sending, setSending] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Thanks — we'll get back to you soon.");
    (e.target as HTMLFormElement).reset();
    setSending(false);
  };
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-2xl px-6 py-20">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Contact</p>
        <h1 className="font-display text-5xl mt-3">Say hello.</h1>
        <p className="text-muted-foreground mt-3">
          Questions, feedback, press? Drop us a line and we'll reply within one business day.
        </p>
        <form onSubmit={submit} className="mt-10 space-y-5">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" required rows={6} className="mt-1.5" />
          </div>
          <Button type="submit" disabled={sending} className="rounded-full h-11 px-6">
            {sending ? "Sending…" : "Send message"}
          </Button>
        </form>
        <p className="mt-10 text-sm text-muted-foreground">
          Or email us at <a href="mailto:hello@quietly.app" className="text-foreground underline">hello@quietly.app</a>.
        </p>
      </section>
      <Footer />
    </div>
  );
}
