import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: [
                'favicon.ico',
                'apple-touch-icon.png',
                'mask-icon.svg',
            ],
            manifest: {
                name: 'DVA-DYL - Тувинский язык',
                short_name: 'DVA-DYL',
                description: 'Изучай тувинский язык с нуля',
                theme_color: '#E8DCC8',
                background_color: '#E8DCC8',
                display: 'standalone',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern:
                            /^https:\/\/hurdvyigefxttxttprsy\.supabase\.co\/rest\/v1\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'supabase-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 дней
                            },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 год
                            },
                        },
                    },
                ],
            },
        }),
    ],
    server: {
        port: 3000,
    },
});
