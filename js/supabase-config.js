/* Isi dari Supabase Dashboard → Project Settings → API (atau tombol "Connect").
   - url     : "Project URL"
   - anonKey : "anon public" (atau "Publishable") key
   Kedua nilai ini memang publik; keamanan dijaga oleh Row Level Security di supabase/setup.sql.
   JANGAN pernah menaruh "service_role" / "secret" key di sini. */
export const supabaseConfig = {
  url: 'ISI_DI_SINI',
  anonKey: 'ISI_DI_SINI',
};
export const isConfigured = supabaseConfig.url.startsWith('https://') && supabaseConfig.anonKey.length > 20;
