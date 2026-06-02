/*
 * Site configuration (CMS) — the single source of truth for storefront
 * branding, theme colours, typography and hero content.
 *
 * This module is intentionally PURE (no Supabase / server imports) so it can be
 * shared by client components, the admin editor and server code alike. The
 * server-only loader lives in `lib/site-config.server.ts`.
 *
 * Persistence: one row in `site_settings` with key = 'site_config', the whole
 * document stored as JSONB in `value`.
 */

export const SITE_CONFIG_KEY = 'site_config';

export interface ThemeColors {
  /** Dominant brand colour (maps to Tailwind brand-brown / --color-primary). */
  primary: string;
  /** Supporting brand colour (maps to brand-carton / --color-secondary). */
  secondary: string;
  /** Highlight / call-to-action colour (maps to brand-gold / --color-accent). */
  accent: string;
}

export interface Typography {
  /** Font id for body text (see FONT_OPTIONS). */
  bodyFont: string;
  /** Font id for headings. */
  headingFont: string;
}

export interface HeroSlide {
  src: string;
  /** CSS object-position, e.g. "50% 40%". */
  position: string;
}

export interface HeroConfig {
  badge: string;
  headline: string;
  subheadline: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  slides: HeroSlide[];
  /** 0–80 — darkness of the overlay over the hero image. */
  overlayOpacity: number;
}

export interface BrandingConfig {
  siteName: string;
  tagline: string;
  logoUrl: string;
}

export interface SocialConfig {
  facebook: string;
  instagram: string;
  twitter: string;
  tiktok: string;
}

export interface SiteConfig {
  branding: BrandingConfig;
  theme: ThemeColors;
  typography: Typography;
  hero: HeroConfig;
  social: SocialConfig;
}

// ─── Defaults (the "factory" preset + reset target) ─────────────────────────

export const DEFAULT_THEME: ThemeColors = {
  primary: '#2C1D00',
  secondary: '#AB9462',
  accent: '#FFCC00',
};

export const DEFAULT_TYPOGRAPHY: Typography = {
  bodyFont: 'montserrat',
  headingFont: 'montserrat',
};

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  branding: {
    siteName: 'ShopWithGG',
    tagline: 'Your trusted sourcing and procurement partner.',
    logoUrl: '/shopwithgg-logo.png',
  },
  theme: { ...DEFAULT_THEME },
  typography: { ...DEFAULT_TYPOGRAPHY },
  hero: {
    badge: 'ShopWithGG · Smart Sourcing',
    headline: 'Quality Products, Sourced Directly for You',
    subheadline:
      'We leverage a global network of trusted manufacturers and suppliers to bring you quality products at the best possible prices.',
    primaryButtonText: 'Shop Now',
    primaryButtonLink: '/shop',
    secondaryButtonText: 'Browse Collections',
    secondaryButtonLink: '/shop',
    slides: [
      { src: '/hero-1.png', position: '50% 40%' },
      { src: '/hero-2.png', position: '50% 35%' },
    ],
    overlayOpacity: 30,
  },
  social: {
    facebook: '',
    instagram: '_shopwithgg_',
    twitter: '',
    tiktok: '',
  },
};

// ─── Font registry (client-safe; faces themselves live in lib/fonts.ts) ─────

export interface FontOption {
  id: string;
  label: string;
  /** CSS var() expression assigned to --font-sans / --font-display. */
  cssVar: string;
  category: 'sans' | 'serif';
}

export const FONT_OPTIONS: FontOption[] = [
  { id: 'montserrat', label: 'Montserrat', cssVar: 'var(--font-montserrat)', category: 'sans' },
  { id: 'poppins', label: 'Poppins', cssVar: 'var(--font-poppins)', category: 'sans' },
  { id: 'inter', label: 'Inter', cssVar: 'var(--font-inter)', category: 'sans' },
  { id: 'outfit', label: 'Outfit', cssVar: 'var(--font-outfit)', category: 'sans' },
  { id: 'dm-sans', label: 'DM Sans', cssVar: 'var(--font-dm-sans)', category: 'sans' },
  { id: 'roboto', label: 'Roboto', cssVar: 'var(--font-roboto)', category: 'sans' },
  { id: 'lato', label: 'Lato', cssVar: 'var(--font-lato)', category: 'sans' },
  { id: 'playfair', label: 'Playfair Display', cssVar: 'var(--font-playfair)', category: 'serif' },
];

const FALLBACK_SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const FALLBACK_SERIF = "Georgia, 'Times New Roman', serif";

/** Resolve a stored font id to a full CSS font stack (with a safe fallback). */
export function fontStack(id: string | undefined | null): string {
  const found = FONT_OPTIONS.find((f) => f.id === id);
  if (!found) return `var(--font-montserrat), ${FALLBACK_SANS}`;
  const fallback = found.category === 'serif' ? FALLBACK_SERIF : FALLBACK_SANS;
  return `${found.cssVar}, ${fallback}`;
}

// ─── Validation / normalisation ─────────────────────────────────────────────

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function cleanHex(input: unknown, fallback: string): string {
  if (typeof input !== 'string') return fallback;
  const v = input.trim();
  return HEX.test(v) ? v : fallback;
}

function cleanStr(input: unknown, fallback: string, max = 2000): string {
  if (typeof input !== 'string') return fallback;
  const v = input.trim();
  return v.length === 0 ? fallback : v.slice(0, max);
}

/** Like cleanStr but allows an empty string (for optional fields like social handles). */
function cleanOptional(input: unknown, fallback: string, max = 2000): string {
  if (typeof input !== 'string') return fallback;
  return input.trim().slice(0, max);
}

function cleanFont(input: unknown, fallback: string): string {
  return FONT_OPTIONS.some((f) => f.id === input) ? (input as string) : fallback;
}

/**
 * Deep-merges an untrusted partial config onto the defaults and sanitises every
 * field. Always returns a complete, safe SiteConfig — never throws.
 */
export function normalizeSiteConfig(input: any): SiteConfig {
  const d = DEFAULT_SITE_CONFIG;
  const src = input && typeof input === 'object' ? input : {};

  const brandingSrc = src.branding ?? {};
  const themeSrc = src.theme ?? {};
  const typoSrc = src.typography ?? {};
  const heroSrc = src.hero ?? {};
  const socialSrc = src.social ?? {};

  const slides: HeroSlide[] = Array.isArray(heroSrc.slides)
    ? heroSrc.slides
        .filter((s: any) => s && typeof s.src === 'string' && s.src.trim().length > 0)
        .slice(0, 6)
        .map((s: any) => ({
          src: cleanStr(s.src, '', 1000),
          position: cleanStr(s.position, '50% 50%', 50),
        }))
    : d.hero.slides;

  const overlayRaw = Number(heroSrc.overlayOpacity);
  const overlayOpacity = Number.isFinite(overlayRaw)
    ? Math.min(80, Math.max(0, Math.round(overlayRaw)))
    : d.hero.overlayOpacity;

  return {
    branding: {
      siteName: cleanStr(brandingSrc.siteName, d.branding.siteName, 120),
      tagline: cleanStr(brandingSrc.tagline, d.branding.tagline, 300),
      logoUrl: cleanOptional(brandingSrc.logoUrl, d.branding.logoUrl, 1000),
    },
    theme: {
      primary: cleanHex(themeSrc.primary, d.theme.primary),
      secondary: cleanHex(themeSrc.secondary, d.theme.secondary),
      accent: cleanHex(themeSrc.accent, d.theme.accent),
    },
    typography: {
      bodyFont: cleanFont(typoSrc.bodyFont, d.typography.bodyFont),
      headingFont: cleanFont(typoSrc.headingFont, d.typography.headingFont),
    },
    hero: {
      badge: cleanOptional(heroSrc.badge, d.hero.badge, 120),
      headline: cleanStr(heroSrc.headline, d.hero.headline, 300),
      subheadline: cleanStr(heroSrc.subheadline, d.hero.subheadline, 600),
      primaryButtonText: cleanStr(heroSrc.primaryButtonText, d.hero.primaryButtonText, 60),
      primaryButtonLink: cleanStr(heroSrc.primaryButtonLink, d.hero.primaryButtonLink, 500),
      secondaryButtonText: cleanOptional(heroSrc.secondaryButtonText, d.hero.secondaryButtonText, 60),
      secondaryButtonLink: cleanStr(heroSrc.secondaryButtonLink, d.hero.secondaryButtonLink, 500),
      slides: slides.length > 0 ? slides : d.hero.slides,
      overlayOpacity,
    },
    social: {
      facebook: cleanOptional(socialSrc.facebook, d.social.facebook, 300),
      instagram: cleanOptional(socialSrc.instagram, d.social.instagram, 300),
      twitter: cleanOptional(socialSrc.twitter, d.social.twitter, 300),
      tiktok: cleanOptional(socialSrc.tiktok, d.social.tiktok, 300),
    },
  };
}

// ─── Runtime theming ────────────────────────────────────────────────────────

/**
 * The CSS custom properties that theme the whole site. Brand Tailwind tokens
 * are chained onto the semantic colour vars so existing `bg-brand-*` classes
 * pick up the admin's palette automatically.
 */
export function themeVarMap(config: SiteConfig): Record<string, string> {
  const { primary, secondary, accent } = config.theme;
  return {
    '--color-primary': primary,
    '--color-secondary': secondary,
    '--color-accent': accent,
    '--brand-brown': primary,
    '--brand-carton': secondary,
    '--brand-purple': secondary,
    '--brand-gold': accent,
    '--font-sans': fontStack(config.typography.bodyFont),
    '--font-display': fontStack(config.typography.headingFont),
  };
}

/** Serialises the theme var map into a `:root { ... }` block for SSR injection. */
export function buildThemeCss(config: SiteConfig): string {
  const body = Object.entries(themeVarMap(config))
    .map(([k, v]) => `${k}:${v};`)
    .join('');
  return `:root{${body}}`;
}

/**
 * Flattens the config into the legacy flat key/value map used by `useCMS().getSetting`,
 * so existing components (Header, Footer, etc.) keep working without changes.
 */
export function configToSettings(config: SiteConfig): Record<string, string> {
  return {
    site_name: config.branding.siteName,
    site_tagline: config.branding.tagline,
    site_logo: config.branding.logoUrl,
    primary_color: config.theme.primary,
    secondary_color: config.theme.secondary,
    accent_color: config.theme.accent,
    social_facebook: config.social.facebook,
    social_instagram: config.social.instagram,
    social_twitter: config.social.twitter,
    social_tiktok: config.social.tiktok,
    hero_badge: config.hero.badge,
    hero_headline: config.hero.headline,
    hero_subheadline: config.hero.subheadline,
    hero_primary_btn_text: config.hero.primaryButtonText,
    hero_primary_btn_link: config.hero.primaryButtonLink,
    hero_secondary_btn_text: config.hero.secondaryButtonText,
    hero_secondary_btn_link: config.hero.secondaryButtonLink,
  };
}
