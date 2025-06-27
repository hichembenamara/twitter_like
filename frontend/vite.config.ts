import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: true, // ⬅️ important pour que Docker expose en réseau
    port: 5173, // ⬅️ même port que dans docker-compose
    proxy: {
      '/api': {
        target: mode === 'development' ? 'http://localhost:8001' : 'http://backend', // Use localhost for dev, Docker service name for production
        changeOrigin: true, // Recommended for most cases
        secure: false, // Allow self-signed certificates in dev
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Ensure /api prefix is kept if backend expects it under /api
        // If your Symfony backend doesn't have /api prefix for its routes (e.g. /login_check instead of /api/login_check)
        // you might want to rewrite it like this:
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
