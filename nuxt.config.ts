// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@nuxt/image',
    '@pinia/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      title: 'StudioSet — Cerámica artesanal de Madrid',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Cerámica artesanal hecha a mano en Madrid. Piezas únicas bajo pedido y colecciones de envío inmediato.',
        },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  googleFonts: {
    families: {
      Fraunces: [400, 500, 600],
      Inter: [300, 400, 500, 600],
    },
    display: 'swap',
    preconnect: true,
  },

  // Render híbrido: editorial estático/ISR, panel siempre SSR sin cache
  routeRules: {
    '/': { prerender: true },
    '/sobre-nosotras': { prerender: true },
    '/contacto': { swr: 3600 },
    '/catalogo': { swr: 600 },
    '/catalogo/**': { swr: 600 },
    '/colecciones/**': { swr: 600 },
    '/panel/**': { ssr: true, index: false },
  },

  typescript: {
    strict: true,
  },
})
