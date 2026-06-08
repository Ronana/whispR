/**
 * app/api/payments/checkout/route.js
 *
 * Pluggable checkout endpoint. Add a case for each processor you want to support.
 * This runs server-side so secrets stay out of the browser.
 */
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { userId, userEmail, processor } = await req.json();

  switch (processor) {
    case 'stripe': {
      // Install: npm install stripe
      // Env vars: STRIPE_SECRET_KEY, STRIPE_PRICE_ID
      // const Stripe = (await import('stripe')).default;
      // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      // const session = await stripe.checkout.sessions.create({
      //   mode: 'subscription',
      //   customer_email: userEmail,
      //   line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      //   metadata: { userId },
      //   success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?premium=success`,
      //   cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?premium=cancel`,
      // });
      // return NextResponse.json({ url: session.url });
      return NextResponse.json({ message: 'Stripe not yet configured. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID env vars.' }, { status: 501 });
    }

    case 'ccbill': {
      // CCBill uses a hosted FlexForm — no server-side session needed.
      // Build the FlexForm URL with your account/sub-account/form IDs.
      // const url = `https://api.ccbill.com/wap-frontflex/flexforms/${process.env.CCBILL_FLEXFORM_ID}?clientSubacc=${process.env.CCBILL_SUB_ACCOUNT}&customer_fname=${encodeURIComponent(userEmail)}`;
      // return NextResponse.json({ url });
      return NextResponse.json({ message: 'CCBill not yet configured. Add CCBILL_FLEXFORM_ID env var.' }, { status: 501 });
    }

    case 'epoch': {
      // Epoch uses a redirect URL with your program/site IDs.
      // const url = `https://secure.epoch.com/pay/${process.env.EPOCH_PROGRAM_ID}?site_id=${process.env.EPOCH_SITE_ID}&email=${encodeURIComponent(userEmail)}`;
      // return NextResponse.json({ url });
      return NextResponse.json({ message: 'Epoch not yet configured. Add EPOCH_PROGRAM_ID env var.' }, { status: 501 });
    }

    default:
      return NextResponse.json(
        { message: 'No payment processor configured. Set NEXT_PUBLIC_PAYMENT_PROCESSOR env var.' },
        { status: 501 }
      );
  }
}
