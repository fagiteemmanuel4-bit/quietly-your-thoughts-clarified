import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

export const Route = createFileRoute("/app/team")({ component: Team });

function Team() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-border/60 px-4 md:px-10 py-5">
        <h1 className="font-display text-3xl md:text-4xl">Team</h1>
        <p className="text-xs text-muted-foreground mt-1">Quiet conversations, threaded.</p>
      </div>
      <div className="mx-auto max-w-3xl px-4 md:px-10 py-16 text-center">
        <Users className="h-8 w-8 mx-auto text-muted-foreground" />
        <h2 className="font-display text-2xl mt-4">Team chat is on the way.</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Real-time threads, @mentions, reactions, and the ability to drop a Quietly output into a message — coming in the next turn.
        </p>
      </div>
    </div>
  );
}
