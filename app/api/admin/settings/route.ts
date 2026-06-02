import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getSiteConfig, saveSiteConfig } from '@/lib/site-config.server';

export const dynamic = 'force-dynamic';

function getAccessToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7).trim();
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/\bsb-access-token=([^;]+)/);
  if (match) return decodeURIComponent(match[1].trim());
  const authCookie = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('sb-') && (c.includes('-auth-token') || c.includes('auth')));
  if (!authCookie) return null;
  const value = authCookie.split('=').slice(1).join('=').trim();
  const decoded = decodeURIComponent(value);
  try {
    const parsed = JSON.parse(decoded);
    if (Array.isArray(parsed) && parsed[0]) return parsed[0];
    if (parsed?.access_token) return parsed.access_token;
    if (typeof parsed === 'string') return parsed;
  } catch {
    return decoded;
  }
  return null;
}

async function requireAdmin(request: Request): Promise<NextResponse | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 503 });
  }
  const token = getAccessToken(request);
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  const role = profile?.role != null ? String(profile.role) : '';
  // Site settings are sensitive branding controls — admins only (not staff).
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

/** GET /api/admin/settings — current (normalised) site config. */
export async function GET(request: Request) {
  const err = await requireAdmin(request);
  if (err) return err;
  try {
    const config = await getSiteConfig();
    return NextResponse.json(config);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load settings' }, { status: 500 });
  }
}

/** PUT /api/admin/settings — persist a new site config (sanitised server-side). */
export async function PUT(request: Request) {
  const err = await requireAdmin(request);
  if (err) return err;
  try {
    const body = await request.json();
    const saved = await saveSiteConfig(body);
    return NextResponse.json({ ok: true, config: saved });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to save settings' }, { status: 500 });
  }
}
