import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5175,
    headers: {
      // Firebase signInWithPopup requires the opener to be able to read
      // window.closed on the popup. The default 'same-origin' COOP policy
      // blocks this. 'same-origin-allow-popups' fixes it without opening
      // any cross-origin security holes.
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
});