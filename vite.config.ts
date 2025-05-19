import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
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

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    }),
    runtimeErrorOverlay(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './client/src'),
      '@shared': resolve(__dirname, './shared'),
      '@client': resolve(__dirname, './client'),
      '@server': resolve(__dirname, './server'),
    },
  },
  server: {
    port: 5000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    headers: {
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.replit.com https://www.googletagmanager.com;
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
        font-src 'self' data:;
        connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.replit.com wss://*.firebaseio.com;
        frame-src 'self' https://*.replit.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        block-all-mixed-content;
        upgrade-insecure-requests;
      `.replace(/\s+/g, ' ').trim()
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'client/index.html'),
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'firebase/app', 'firebase/auth', 'firebase/analytics'],
  },
  envDir: __dirname, // Specifies the directory to load .env files from
  define: {
    // Expose env variables to the client code
    // Vite automatically exposes VITE_ prefixed variables from loadEnv if they are used in client code
    // However, explicitly defining them can sometimes help with HMR or specific build scenarios.
    // Let's rely on Vite's default behavior for VITE_ prefixed variables first after using loadEnv.
    // If issues persist, we can uncomment and refine the define block.
    // 'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
    // 'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    // To ensure all other import.meta.env properties are preserved:
    "import.meta.env": JSON.stringify({ ...import.meta.env, ...process.env }),
  },
});
