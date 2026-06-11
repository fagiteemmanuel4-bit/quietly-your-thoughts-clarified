import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/$")({ component: NotFound });

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center bg-background">
      <div className="fade-up space-y-5">
        <p className="font-display text-[8rem] leading-none text-muted-foreground/20">404</p>
        <h1 className="font-display text-4xl">Page not found.</h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          This page doesn't exist or has moved. Let's get you back to clarity.
        </p>
        <Link to="/">
          <Button className="rounded-full mt-2">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back home
          </Button>
        </Link>
      </div>
    </div>
  );
}
