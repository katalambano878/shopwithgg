import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';
import { isPlainPostgres } from './db/mode';
import { createClient as createPgClient } from './db/supabase-compat';

/**
 * Server-side admin client.
 * - Plain Postgres (DATABASE_URL set): in-process pg compat + auth/storage shims
 * - Otherwise: hosted Supabase service-role client
 *
 * ONLY use in API routes / server actions — never in client components.
 */

function createAdminClient() {
  if (isPlainPostgres()) {
    return createPgClient();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!supabaseServiceKey) {
    console.error('CRITICAL: Missing SUPABASE_SERVICE_ROLE_KEY — admin operations will fail');
  }

  return createSupabaseJsClient(supabaseUrl, supabaseServiceKey || '', {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Cast: plain-PG compat client is structurally supabase-js-like but not identical
// in TypeScript's eyes; without this, many existing `.map((r) => …)` call sites
// fail with "parameter implicitly has an any type" under noImplicitAny.
export const supabaseAdmin = createAdminClient() as ReturnType<typeof createSupabaseJsClient>;
