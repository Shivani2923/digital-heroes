import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    console.log("🔥 Stripe webhook received");
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Webhook secret is missing" },
        { status: 500 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.user_id;
      const planType = session.metadata?.plan_type;

      if (!userId || !planType) {
        console.error("Missing user ID or plan type in metadata");

        return NextResponse.json(
          { error: "Missing subscription metadata" },
          { status: 400 }
        );
      }

      if (!session.subscription) {
        return NextResponse.json(
          { error: "Stripe subscription ID is missing" },
          { status: 400 }
        );
      }

      const stripeSubscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;

      const subscription = await stripe.subscriptions.retrieve(
        stripeSubscriptionId
      );

      const startDate = new Date(
        subscription.start_date * 1000
      ).toISOString();

      const renewalTimestamp =
        subscription.items.data[0]?.current_period_end;

      if (!renewalTimestamp) {
        throw new Error("Renewal date is unavailable");
      }

      const renewalDate = new Date(
        renewalTimestamp * 1000
      ).toISOString();

      const subscriptionData = {
        user_id: userId,
        plan_type: planType,
        status: subscription.status,
        stripe_subscription_id: stripeSubscriptionId,
        start_date: startDate,
        renewal_date: renewalDate,
      };

      const { data: existingSubscription } = await supabaseAdmin
        .from("subscriptions")
        .select("id")
        .eq("stripe_subscription_id", stripeSubscriptionId)
        .maybeSingle();

      let databaseError;

      if (existingSubscription) {
        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update(subscriptionData)
          .eq("id", existingSubscription.id);

        databaseError = error;
      } else {
        const { error } = await supabaseAdmin
          .from("subscriptions")
          .insert(subscriptionData);

        databaseError = error;
      }

      if (databaseError) {
        console.error(
          "Supabase subscription error:",
          databaseError.message
        );

        return NextResponse.json(
          { error: "Unable to save subscription" },
          { status: 500 }
        );
      }

      console.log("✅ Subscription saved successfully");
      console.log("User ID:", userId);
      console.log("Plan:", planType);
      console.log("Subscription ID:", stripeSubscriptionId);
    }

    return NextResponse.json(
      { received: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Webhook error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}