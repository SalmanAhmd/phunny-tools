import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Vite config for the self-contained Phunny Tools app under src/ut.
 *
 * Dev:    npx vite --config vite.ut.config.ts       (open http://localhost:5173)
 * Build:  npx vite build --config vite.ut.config.ts (outputs to dist-ut/)
 *
 * It uses the alias-free entry `index.ut.html` -> `src/ut/main.tsx` so it never
 * collides with the repository root app / config.
 */
/**
 * Serves / → /index.ut.html in dev, and gives `vite preview` the same SPA
 * fallback so deep links like /tool/hammer-zip work from the built app.
 */
function serveUtIndex(): Plugin {
  const rewrite = (req: { url?: string }, res: unknown, next: () => void) => {
    if (!req.url) return next();
    const clean = req.url.split("?")[0];
    // Leave real files (assets, the html itself) and Vite's own protocol
    // URLs alone; rewrite every other path to the app entry.
    const devAwkward = clean.startsWith("/@") || clean.startsWith("/.");
    const looksLikeFile = /\.[a-z0-9]+(?:$|!)/i.test(clean);
    if (clean !== "/index.ut.html" && !devAwkward && (clean === "/" || !looksLikeFile)) {
      req.url = "/index.ut.html";
    }
    next();
  };
  return {
    name: "ut-serve-index",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

export default defineConfig({
  plugins: [react(), serveUtIndex()],
  build: {
    outDir: "dist-ut",
    emptyOutDir: true,
    rollupOptions: {
      input: "index.ut.html",
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
          zip: ["jszip"],
        },
      },
    },
  },
});
