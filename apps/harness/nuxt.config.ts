import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-05',
  future: {
    compatibilityVersion: 4,
  },
  srcDir: 'app',
  // Tauri bundles the static client from `.output/public` (`npm run generate`).
  // The dev server stays on 3001 so `npm run tauri:dev` can load it.
  ssr: false,
  telemetry: false,
  devtools: { enabled: false },
  devServer: {
    host: '0.0.0.0',
    port: 3001,
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
    clearScreen: false,
    envPrefix: ['VITE_', 'TAURI_'],
    server: {
      strictPort: true,
    },
  },
  ignore: ['**/src-tauri/**'],
  app: {
    head: {
      title: 'Gentle Fist',
      meta: [
        { name: 'description', content: 'Gentle Fist artifact harness. Coding streams render as cards.' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/gentle-fist.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap',
        },
      ],
    },
  },
  components: {
    dirs: [{ path: '~/components', pathPrefix: false }],
  },
  runtimeConfig: {
    railwayToken: process.env.RAILWAY_API_TOKEN || process.env.RAILWAY_TOKEN || '',
    hermesApiKey: process.env.HERMES_API_SERVER_KEY || '',
    hermesBaseUrl: process.env.HERMES_API_BASE_URL || '',
    primeAgentBin: process.env.PRIME_AGENT_BIN || '',
    thesysApiKey: process.env.THESYS_API_KEY || '',
    thesysBaseUrl: process.env.THESYS_C1_BASE_URL || 'https://api.thesys.dev/v1/embed',
    public: {
      openhandsBaseUrl: process.env.NUXT_PUBLIC_OPENHANDS_BASE_URL || '',
      railwayWebtopUrl: process.env.NUXT_PUBLIC_RAILWAY_WEBTOP_URL || 'https://desktop-production-b39d.up.railway.app',
      copilotkitRuntimeUrl: process.env.NUXT_PUBLIC_COPILOTKIT_RUNTIME_URL || '',
    },
  },
})
