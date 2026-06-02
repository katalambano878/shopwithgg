/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./{app,components,libs,pages,hooks}/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Semantic theme tokens driven by the CMS (see lib/site-config.ts).
        theme: {
          primary: 'var(--color-primary, #2C1D00)',
          secondary: 'var(--color-secondary, #AB9462)',
          accent: 'var(--color-accent, #FFCC00)',
        },
        brand: {
          // These chain onto the runtime theme vars so existing bg-brand-*
          // classes automatically reflect the admin's chosen palette, while
          // still falling back to the original hex if no theme is injected.
          brown: 'var(--brand-brown, #2C1D00)',
          carton: 'var(--brand-carton, #AB9462)',
          purple: 'var(--brand-purple, #AB9462)',
          gold: 'var(--brand-gold, #FFCC00)',
          cream: '#F3F3F3',
          pink: '#FFCCCC',
          coral: '#FF6666',
          yellow: '#FFFFCC',
          tan: '#996633',
          oxblood: '#9A1900',
          rose: '#FF9999',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Montserrat', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Montserrat', 'system-ui', 'sans-serif'],
      },
      animation: {
        'just-landed-scroll': 'just-landed-scroll 30s linear infinite',
      },
      keyframes: {
        'just-landed-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

