import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1),
  })).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();

    const { items } = checkoutSchema.parse(body);

    const productIds = items.map(item => item.productId);
    const products = await db.product.findMany({
      where: {
        id: { in: productIds }
      },
      include: {
        prices: {
          where: {
            isActive: true,
            isDefault: true
          },
          take: 1
        }
      }
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "Certains produits sont introuvables" },
        { status: 400 }
      );
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) continue;

      const stripePrice = product.prices[0];

      const isRealStripePrice = stripePrice?.stripePriceId?.startsWith('price_') &&
                               !stripePrice.stripePriceId.includes('_default');

      if (isRealStripePrice) {
        lineItems.push({
          price: stripePrice.stripePriceId,
          quantity: item.quantity,
        });
      } else {
        const amount = stripePrice?.amount ?? product.price;
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: product.title,
              description: product.subtitle,
            },
            unit_amount: amount,
          },
          quantity: item.quantity,
        });
      }
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${req.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/cart`,
      allow_promotion_codes: true,
      ...(session?.user?.email && {
        customer_email: session.user.email,
      }),
    });

    return NextResponse.json({ url: checkoutSession.url });

  } catch (error) {
    console.error('Stripe checkout error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création de la session de paiement" },
      { status: 500 }
    );
  }
}