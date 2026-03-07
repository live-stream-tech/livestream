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

// ─── Stripe Connect（Express）────────────────────────────────────────────

/** 連結アカウント（Express）を作成し、アカウントIDを返す */
export async function createConnectExpressAccount(params: {
  email?: string;
  country?: string;
}): Promise<string> {
  const stripe = await getUncachableStripeClient();
  const account = await stripe.accounts.create({
    type: "express",
    country: params.country ?? "JP",
    email: params.email ?? undefined,
  });
  return account.id;
}

/** オンボーディング用の Account Link URL を発行（単回使用） */
export async function createConnectAccountLink(params: {
  accountId: string;
  returnUrl: string;
  refreshUrl: string;
}): Promise<string> {
  const stripe = await getUncachableStripeClient();
  const link = await stripe.accountLinks.create({
    account: params.accountId,
    refresh_url: params.refreshUrl,
    return_url: params.returnUrl,
    type: "account_onboarding",
  });
  return link.url;
}

/** 連結アカウントのオンボーディング完了状況を取得 */
export async function getConnectAccount(accountId: string): Promise<Stripe.Account | null> {
  const stripe = await getUncachableStripeClient();
  try {
    const account = await stripe.accounts.retrieve(accountId);
    return account;
  } catch {
    return null;
  }
}

/** バナー広告などでプラットフォームが受け取る決済用 PaymentIntent を作成 */
export async function createBannerPaymentIntent(params: {
  amountYen: number;
  metadata?: Record<string, string>;
}): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const stripe = await getUncachableStripeClient();
  const pi = await stripe.paymentIntents.create({
    amount: params.amountYen,
    currency: "jpy",
    automatic_payment_methods: { enabled: true },
    metadata: params.metadata ?? {},
  });
  return {
    clientSecret: pi.client_secret!,
    paymentIntentId: pi.id,
  };
}

/** PaymentIntent の完了状態を取得 */
export async function getPaymentIntentStatus(paymentIntentId: string): Promise<"succeeded" | "requires_payment_method" | null> {
  const stripe = await getUncachableStripeClient();
  try {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status === "succeeded") return "succeeded";
    if (pi.status === "requires_payment_method") return "requires_payment_method";
    return null;
  } catch {
    return null;
  }
}

