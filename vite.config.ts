import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          id: '/',
          name: 'VaultDirectory - Secure Personal Directory',
          short_name: 'VaultDir',
          description: 'A minimalist, encrypted, local-first personal directory for contacts, phone numbers, bank accounts, and activity logs.',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      {
        name: 'notion-api-dev-middleware',
        configureServer(server) {
          server.middlewares.use('/api/notion', async (req, res) => {
            try {
              process.env.NOTION_API_KEY = env.NOTION_API_KEY || env.VITE_NOTION_API_KEY || process.env.NOTION_API_KEY || '';
              process.env.NOTION_DATABASE_ID = env.NOTION_DATABASE_ID || env.VITE_NOTION_DATABASE_ID || process.env.NOTION_DATABASE_ID || '';

              if (req.method === 'POST') {
                const chunks: any[] = [];
                for await (const chunk of req) {
                  chunks.push(chunk);
                }
                const bodyStr = Buffer.concat(chunks).toString();
                try {
                  (req as any).body = bodyStr ? JSON.parse(bodyStr) : {};
                } catch {
                  (req as any).body = {};
                }
              }

              const { default: handler } = await import('./api/notion');
              await handler(req, res);
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: err.message || 'Server error' }));
            }
          });
        },
      },
    ],
    define: {
      'import.meta.env.VITE_NOTION_API_KEY': JSON.stringify(
        env.VITE_NOTION_API_KEY || env.NOTION_API_KEY || ''
      ),
      'import.meta.env.VITE_NOTION_DATABASE_ID': JSON.stringify(
        env.VITE_NOTION_DATABASE_ID || env.NOTION_DATABASE_ID || ''
      ),
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      port: 3000,
      proxy: {
        '/notion-api': {
          target: 'https://api.notion.com/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/notion-api/, ''),
          headers: {
            Authorization: `Bearer ${env.VITE_NOTION_API_KEY || env.NOTION_API_KEY}`,
            'Notion-Version': '2022-06-28',
          },
        },
      },
    },
  };
});
