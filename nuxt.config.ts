// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@nuxt/image',
    '@pinia/nuxt',
    '@nuxtjs/supabase',
  ],

  // Supabase: protege SOLO el panel privado; el resto del sitio es público.
  supabase: {
    redirectOptions: {
      login: '/panel/login',
      callback: '/panel/confirm',
      include: ['/panel(/*)?'],
      exclude: ['/panel/login', '/panel/confirm'],
      cookieRedirect: false,
    },
  },

  // Auto-import por nombre de archivo, sin prefijar con la carpeta
  // (p. ej. components/editorial/HeroSection.vue → <HeroSection>)
  components: [{ path: '~/components', pathPrefix: false }],

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
    // La red corporativa bloquea la descarga en build; cargamos por <link>
    // y, si también se bloquea, cae al stack de respaldo de Tailwind.
    download: false,
  },

  // Render híbrido. No usamos prerender en build porque el plugin de servidor
  // de @nuxtjs/supabase necesita contexto de petición (incompatible con la
  // pre-generación).
  // Páginas con datos editables desde el panel → SSR siempre fresco (sin SWR),
  // para que los cambios y las fotos nuevas aparezcan al instante.
  // Páginas casi estáticas → SWR para mejor rendimiento.
  routeRules: {
    '/': { swr: 60 },
    '/sobre-nosotras': { swr: 3600 },
    '/contacto': { swr: 3600 },
    '/catalogo': { ssr: true },
    '/catalogo/**': { ssr: true },
    '/colecciones': { ssr: true },
    '/colecciones/**': { ssr: true },
    '/panel/**': { ssr: true, index: false },
  },

  typescript: {
    strict: true,
  },
})
