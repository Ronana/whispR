/**
 * app/api/payments/portal/route.js
 *
 * Opens the billing management portal for the current processor.
 */
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { userId, processor } = await req.json();

  switch (processor) {
    case 'stripe': {
      // const Stripe = (await import('stripe')).default;
      // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      // Look up the customer ID from your subscriptions table
      // const session = await stripe.billingPortal.sessions.create({
      //   customer: customerId,
      //   return_url: process.env.NEXT_PUBLIC_SITE_URL,
      // });
      // return NextResponse.json({ url: session.url });
      return NextResponse.json({ message: 'Stripe portal not configured.' }, { status: 501 });
    }
    default:
      return NextResponse.json({ message: 'No payment processor configured.' }, { status: 501 });
  }
}
