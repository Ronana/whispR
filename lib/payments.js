/**
 * lib/payments.js — Pluggable payment processor abstraction
 *
 * To swap processor:
 *   1. Set NEXT_PUBLIC_PAYMENT_PROCESSOR env var to 'stripe' | 'ccbill' | 'epoch' etc
 *   2. Add the corresponding server-side route in app/api/payments/checkout/route.js
 *   3. Set the processor-specific env vars (see comments below)
 *
 * Stripe env vars needed:
 *   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
 *
 * CCBill env vars needed:
 *   CCBILL_ACCOUNT_NUMBER, CCBILL_SUB_ACCOUNT, CCBILL_FLEXFORM_ID
 *   CCBILL_SALT_KEY
 *
 * Epoch env vars needed:
 *   EPOCH_PROGRAM_ID, EPOCH_SITE_ID
 */

export const PROCESSOR = process.env.NEXT_PUBLIC_PAYMENT_PROCESSOR || 'unconfigured';

/** Price per locale — swap currency/amount to match your Stripe price IDs */
const PRICES = {
  'en':    { price: '£9.99',    period: 'month', currency: 'GBP', stripePriceEnv: 'STRIPE_PRICE_ID_GBP' },
  'en-us': { price: '$9.99',    period: 'month', currency: 'USD', stripePriceEnv: 'STRIPE_PRICE_ID_USD' },
  'fr':    { price: '€9.99',    period: 'month', currency: 'EUR', stripePriceEnv: 'STRIPE_PRICE_ID_EUR' },
  'de':    { price: '€9.99',    period: 'month', currency: 'EUR', stripePriceEnv: 'STRIPE_PRICE_ID_EUR' },
  'es':    { price: '€9.99',    period: 'month', currency: 'EUR', stripePriceEnv: 'STRIPE_PRICE_ID_EUR' },
  'it':    { price: '€9.99',    period: 'month', currency: 'EUR', stripePriceEnv: 'STRIPE_PRICE_ID_EUR' },
  'pt':    { price: '€9.99',    period: 'month', currency: 'EUR', stripePriceEnv: 'STRIPE_PRICE_ID_EUR' },
  'ja':    { price: '¥1,500',   period: 'month', currency: 'JPY', stripePriceEnv: 'STRIPE_PRICE_ID_JPY' },
};

const BASE_PLAN = {
  id: 'whispr_premium_monthly',
  name: 'WhispR Premium',
  perks: [
    { icon: '🎧', label: 'Lossless audio quality' },
    { icon: '📥', label: 'Download for offline listening' },
    { icon: '🚫', label: 'Ad-free experience' },
    { icon: '✨', label: 'Early access to new content' },
  ],
};

/** Returns the plan with localised price for the given language code */
export function getPlan(lang = 'en') {
  const pricing = PRICES[lang] || PRICES['en'];
  return { ...BASE_PLAN, ...pricing };
}

/** Default plan (GBP) — kept for backward compat */
export const PLAN = getPlan('en');

/**
 * Kick off a checkout session.
 * In production this hits /api/payments/checkout which creates a processor session.
 * Returns { url } to redirect to, or throws.
 */
export async function initiateCheckout({ userId, userEmail, lang = 'en' }) {
  const res = await fetch('/api/payments/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, userEmail, processor: PROCESSOR, lang }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Checkout failed');
  }
  return res.json(); // { url: 'https://...' }
}

/**
 * Open the customer billing portal to manage/cancel subscription.
 */
export async function openBillingPortal({ userId }) {
  const res = await fetch('/api/payments/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, processor: PROCESSOR }),
  });
  if (!res.ok) throw new Error('Could not open billing portal');
  const { url } = await res.json();
  window.location.href = url;
}
