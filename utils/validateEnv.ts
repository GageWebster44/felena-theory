const req = (name: string) => {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
};

export const ENV = {
  NEXT_PUBLIC_SUPABASE_URL: req('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: req('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  NEXT_PUBLIC_SITE_URL: req('NEXT_PUBLIC_SITE_URL'),

  SUPABASE_SERVICE_ROLE_KEY: req('SUPABASE_SERVICE_ROLE_KEY'),
  STRIPE_SECRET_KEY: req('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET: req('STRIPE_WEBHOOK_SECRET'),
  ADMIN_API_KEY: req('ADMIN_API_KEY'),
};
