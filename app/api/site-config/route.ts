import { NextResponse } from 'next/server';
import { getSiteConfig } from '@/lib/site-config.server';
import { DEFAULT_SITE_CONFIG } from '@/lib/site-config';

export const dynamic = 'force-dynamic';

/**
 * GET /api/site-config
 * Public, read-only branding/theme/hero config consumed by the storefront
 * (CMSProvider). Returns safe, non-sensitive data only.
 */
export async function GET() {
  try {
    const config = await getSiteConfig();
    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300',
      },
    });
  } catch {
    return NextResponse.json(DEFAULT_SITE_CONFIG);
  }
}
