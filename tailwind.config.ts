import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      colors: {
        clay: '#B9A18B',
        bone: '#F4EFE6',
        stone: '#D9D2C7',
        ink: '#2B2622',
        engobe: '#8C7A66',
        accent: '#6E4A34',
      },
      fontFamily: {
        // Serif editorial para titulares · grotesque neutra para cuerpo
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        editorial: '88rem',
      },
      letterSpacing: {
        widest2: '0.2em',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
