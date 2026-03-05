import Stripe from "stripe";

const SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

if (!SECRET_KEY || !PUBLISHABLE_KEY) {
  console.warn(
    "[stripe] STRIPE_SECRET_KEY / STRIPE_PUBLISHABLE_KEY が設定されていないため、Stripe連携は無効です。",
  );
}

export async function getUncachableStripeClient() {
  if (!SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(SECRET_KEY, { apiVersion: "2025-08-27.basil" as any });
}

export async function getStripePublishableKey() {
  if (!PUBLISHABLE_KEY) {
    throw new Error("STRIPE_PUBLISHABLE_KEY is not set");
  }
  return PUBLISHABLE_KEY;
}

