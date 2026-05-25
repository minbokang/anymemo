import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const host = process.env.TAURI_DEV_HOST
const isTauri = Boolean(host || process.env.TAURI_ENV_PLATFORM)

// https://vite.dev/config/
export default defineConfig({
  clearScreen: !isTauri,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'AnyMemo',
        short_name: 'AnyMemo',
        description:
          '웹·모바일·데스크톱 크로스 플랫폼 실시간 동기화 메모장',
        theme_color: '#fafafa',
        background_color: '#fafafa',
        display: 'standalone',
        start_url: '/',
        lang: 'ko',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,png,woff2}'],
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
  envPrefix: ['VITE_', 'TAURI_ENV_'],
  server: {
    port: 5173,
    strictPort: isTauri,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  build: {
    // Tauri 2 WebView는 최신 Chromium/WebKit — 별도 safari13 다운레벨 불필요 (Vite 8 esbuild와 충돌)
    minify: process.env.TAURI_ENV_DEBUG === 'true' ? false : 'esbuild',
    sourcemap: process.env.TAURI_ENV_DEBUG === 'true',
  },
})
