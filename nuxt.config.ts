// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  css: [
    '~/assets/css/main.css',
    '@fortawesome/fontawesome-svg-core/styles.css',
  ],

  experimental: {
    payloadExtraction: false
  },

  routeRules: {
    '/**': {
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=3600'
      }
    },
    '/_nuxt/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },
    '/_nuxt/builds/**': {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=3600'
      }
    }
  },

  nitro: {
    static: true
  },
  modules: [
    '@vueuse/nuxt',
    '@nuxt/image',
    '@pinia/nuxt',
    '@nuxt/devtools',
    '@nuxt/test-utils/module'
  ],

  build: {
    transpile: [
      '@fortawesome/fontawesome-svg-core',
      '@fortawesome/free-brands-svg-icons',
      '@fortawesome/free-regular-svg-icons',
      '@fortawesome/free-solid-svg-icons',
      '@fortawesome/vue-fontawesome',
    ],
  },

  vite: {
    plugins: [
      tailwindcss()
    ],
    build: {
      chunkSizeWarningLimit: 250,
      rollupOptions: {
        output: {
          entryFileNames: `_nuxt/[name].[hash:16].js`,
          chunkFileNames: `_nuxt/[name].[hash:16].js`,
          assetFileNames: `_nuxt/[name].[hash:16].[ext]`
        }
      }
    }
  },

  typescript: {
    shim: false,
  },

  plugins: [
    { src: '~/plugins/vuekonva', mode: 'client' },
  ],

  app: {
    // cdnURL: "https://pgp-cdn.b-cdn.net/25-07-23/dist/",
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  compatibilityDate: '2024-09-20',
})