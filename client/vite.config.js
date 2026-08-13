import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5175,
    strictPort: true, // Fail fast if 5175 is taken — never silently drift to another port
                      // (a different port would trigger Google OAuth origin_mismatch)
  },
});