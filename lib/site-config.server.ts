import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  DEFAULT_SITE_CONFIG,
  SITE_CONFIG_KEY,
  SiteConfig,
  normalizeSiteConfig,
} from '@/lib/site-config';

/**
 * Reads the persisted site config from `site_settings` (service role, bypasses
 * RLS). Never throws — falls back to defaults if the row is missing or the DB
 * is unreachable (e.g. during a build with no credentials), so the site always
 * renders.
 */
export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return DEFAULT_SITE_CONFIG;
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', SITE_CONFIG_KEY)
      .maybeSingle();
    if (error || !data?.value) return DEFAULT_SITE_CONFIG;
    return normalizeSiteConfig(data.value);
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

/** Persists a normalised config back to `site_settings` (upsert on key). */
export async function saveSiteConfig(input: any): Promise<SiteConfig> {
  const config = normalizeSiteConfig(input);
  const { error } = await supabaseAdmin.from('site_settings').upsert(
    {
      key: SITE_CONFIG_KEY,
      value: config,
      category: 'branding',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' },
  );
  if (error) throw new Error(error.message);
  return config;
}
