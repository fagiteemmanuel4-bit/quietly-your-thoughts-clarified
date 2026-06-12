// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // Force nitro build with vercel preset.
  // This produces .vercel/output/ which Vercel reads automatically.
  // In vercel.json we set outputDirectory to ".vercel/output/static"
  // and the serverless functions are at .vercel/output/functions
  nitro: {
    preset: "vercel",
  },
});
