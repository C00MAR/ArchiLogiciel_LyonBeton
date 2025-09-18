import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "~/server/db";
import { sendEmail, generateOrderConfirmationEmailTemplate, generatePaymentFailedEmailTemplate } from "~/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      console.error("❌ Webhook signature verification failed:", error);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    console.log(`🔔 Stripe webhook received: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`🤷‍♂️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log(`💰 Processing completed checkout session: ${session.id}`);

    const existingOrder = await db.order.findUnique({
      where: { stripeSessionId: session.id }
    });

    if (existingOrder) {
      console.log(`⚠️ Order already exists for session ${session.id}, skipping...`);
      return;
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product']
    });

    if (!lineItems.data.length) {
      console.error("❌ No line items found in checkout session");
      return;
    }

    const sessionWithLineItems = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items.data.price.product']
    });

    const total = session.amount_total || 0;

    const orderData = {
      stripeSessionId: session.id,
      stripePaymentId: session.payment_intent as string,
      total,
      status: "PAID" as const,
      customerEmail: session.customer_details?.email || session.customer_email || "",
      customerName: session.customer_details?.name || "Client",
      userId: null,
    };

    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: orderData
      });

      const orderItems = [];

      for (const lineItem of lineItems.data) {
        if (!lineItem.price?.product) continue;

        const stripeProduct = lineItem.price.product as Stripe.Product;

        let product = null;
        if (stripeProduct.id) {
          product = await tx.product.findFirst({
            where: { stripeProductId: stripeProduct.id }
          });
        }

        if (!product && stripeProduct.metadata?.identifier) {
          product = await tx.product.findFirst({
            where: { identifier: stripeProduct.metadata.identifier }
          });
        }

        const itemData = {
          orderId: newOrder.id,
          productId: product?.id || 0,
          quantity: lineItem.quantity || 1,
          price: lineItem.price?.unit_amount || 0,
          title: product?.title || stripeProduct.name || "Produit",
          subtitle: product?.subtitle || stripeProduct.description || "",
        };

        const orderItem = await tx.orderItem.create({
          data: itemData
        });

        orderItems.push({
          ...itemData,
          title: itemData.title,
          subtitle: itemData.subtitle,
        });
      }

      return { order: newOrder, items: orderItems };
    });

    console.log(`✅ Order created successfully: ${order.order.id}`);

    try {
      const emailTemplate = generateOrderConfirmationEmailTemplate(
        {
          id: order.order.id,
          total: order.order.total,
          items: order.items
        },
        order.order.customerName || "Client"
      );

      await sendEmail({
        to: order.order.customerEmail,
        subject: `Confirmation de commande #${order.order.id}`,
        text: emailTemplate.text,
        html: emailTemplate.html,
      });

      console.log(`📧 Confirmation email sent to ${order.order.customerEmail}`);
    } catch (emailError) {
      console.error("❌ Failed to send confirmation email:", emailError);
    }

  } catch (error) {
    console.error("❌ Error processing checkout session:", error);
    throw error;
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`❌ Processing failed payment intent: ${paymentIntent.id}`);

    const customerEmail = paymentIntent.receipt_email ||
                         paymentIntent.shipping?.name ||
                         "client@example.com";

    const customerName = paymentIntent.shipping?.name || "Client";

    console.error(`💳 Payment failed for ${customerEmail}: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`);

    try {
      const emailTemplate = generatePaymentFailedEmailTemplate(
        {
          id: paymentIntent.id,
          total: paymentIntent.amount,
          customerEmail,
        },
        customerName
      );

      await sendEmail({
        to: customerEmail,
        subject: "Problème avec votre paiement",
        text: emailTemplate.text,
        html: emailTemplate.html,
      });

      console.log(`📧 Payment failed email sent to ${customerEmail}`);
    } catch (emailError) {
      console.error("❌ Failed to send payment failed email:", emailError);
    }

  } catch (error) {
    console.error("❌ Error processing payment intent failed:", error);
  }
}