import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'SkyCuts',
        short_name: 'SkyCuts',
        description: 'Cinematic video review and delivery platform',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#050505',
        background_color: '#050505',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: '/'
      }
    })
  ],
  server: {
    port: 5175,
    strictPort: true, // Fail fast if 5175 is taken — never silently drift to another port
                      // (a different port would trigger Google OAuth origin_mismatch)
  },
});