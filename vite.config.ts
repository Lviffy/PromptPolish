import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Helper function to conditionally add plugins that might be async
async function getConditionalPlugins(isProduction: boolean, replId?: string) {
  const plugins = [];
  if (!isProduction && replId !== undefined) {
    const cartographerPlugin = await import("@replit/vite-plugin-cartographer").then((m) =>
      m.cartographer()
    );
    plugins.push(cartographerPlugin);
  }
  return plugins;
}

export default defineConfig(async ({ mode }) => {
  const projectRoot = path.resolve(import.meta.dirname);
  // Load env variables from the project root for the current mode
  // Only variables prefixed with VITE_ will be loaded by default
  const env = loadEnv(mode, projectRoot, "VITE_");

  const conditionalPlugins = await getConditionalPlugins(
    mode === "production",
    process.env.REPL_ID
  );

  return {
    plugins: [
      react(),
      runtimeErrorOverlay(),
      ...conditionalPlugins,
    ],
    resolve: {
      alias: {
        "@": path.resolve(projectRoot, "client", "src"),
        "@shared": path.resolve(projectRoot, "shared"),
        "@assets": path.resolve(projectRoot, "attached_assets"),
      },
    },
    root: path.resolve(projectRoot, "client"),
    envDir: projectRoot, // Specifies the directory to load .env files from
    define: {
      // Expose env variables to the client code
      // Vite automatically exposes VITE_ prefixed variables from loadEnv if they are used in client code
      // However, explicitly defining them can sometimes help with HMR or specific build scenarios.
      // Let's rely on Vite's default behavior for VITE_ prefixed variables first after using loadEnv.
      // If issues persist, we can uncomment and refine the define block.
      // 'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      // 'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      // To ensure all other import.meta.env properties are preserved:
      "import.meta.env": JSON.stringify({ ...import.meta.env, ...env }),
    },
    build: {
      outDir: path.resolve(projectRoot, "dist/public"),
      emptyOutDir: true,
    },
  };
});
