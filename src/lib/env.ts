const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

const serverOnly = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_ID',
] as const

function assertEnv(keys: readonly string[]) {
  const missing = keys.filter((k) => !process.env[k])
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Copy .env.example to .env.local and fill in the values.'
    )
  }
}

// Called from server-side code (API routes, Server Components) to validate all vars
export function validateServerEnv() {
  assertEnv([...required, ...serverOnly])
}

// Called from client-side code to validate public vars only
export function validateClientEnv() {
  assertEnv(required)
}
