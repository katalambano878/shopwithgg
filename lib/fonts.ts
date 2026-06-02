import {
  Montserrat,
  Poppins,
  Inter,
  Playfair_Display,
  Roboto,
  Lato,
  Outfit,
  DM_Sans,
} from 'next/font/google';

/*
 * Curated typography set for the storefront. Every face is loaded via next/font
 * (self-hosted, no layout shift) and exposes a CSS variable. The active body /
 * heading font is selected at runtime by pointing `--font-sans` / `--font-display`
 * at one of these variables (see lib/site-config.ts + app/layout.tsx).
 *
 * Only Montserrat is preloaded (it's the default); the rest load on demand when
 * an admin switches the theme, keeping the initial payload light.
 */

const montserrat = Montserrat({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-poppins',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-playfair',
});

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-roboto',
});

const lato = Lato({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-lato',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-outfit',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-dm-sans',
});

/** All font CSS-variable classNames, applied together on <body>. */
export const fontVariables = [
  montserrat.variable,
  poppins.variable,
  inter.variable,
  playfair.variable,
  roboto.variable,
  lato.variable,
  outfit.variable,
  dmSans.variable,
].join(' ');
