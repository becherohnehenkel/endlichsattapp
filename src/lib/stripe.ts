import Stripe from 'stripe'

// Server-only Stripe-Client. NEVER import this from a client component —
// STRIPE_SECRET_KEY darf den Browser nie erreichen (PROJ-11).
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
