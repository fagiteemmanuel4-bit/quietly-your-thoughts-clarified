import { createFileRoute } from "@tanstack/react-router";
import { Share2 } from "lucide-react";

export const Route = createFileRoute("/app/spaces")({ component: Spaces });

function Spaces() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-border/60 px-4 md:px-10 py-5">
        <h1 className="font-display text-3xl md:text-4xl">Shared Spaces</h1>
        <p className="text-xs text-muted-foreground mt-1">Co-edit a Quietly output with your team.</p>
      </div>
      <div className="mx-auto max-w-3xl px-4 md:px-10 py-16 text-center">
        <Share2 className="h-8 w-8 mx-auto text-muted-foreground" />
        <h2 className="font-display text-2xl mt-4">Collaborative docs — soon.</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Live presence, shared cursors, and version-aware editing land in the next pass.
        </p>
      </div>
    </div>
  );
}
