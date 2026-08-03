import Stripe from "stripe";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { properties } from "@/lib/data/properties";
import { getStripe, sendBookingConfirmedEmail } from "@/lib/server/payments";

export const runtime = "nodejs";

async function confirmCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return;
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return;

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      stripeCheckoutSessionId: session.id,
    },
  });
  if (!booking || booking.status === "confirmed") return;

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: "confirmed",
      paymentStatus: "paid",
      paidAt: new Date(),
    },
  });

  const property = properties.find((item) => item.id === booking.propertyId);
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");
  revalidatePath("/account");
  if (property) {
    revalidatePath(`/properties/${property.slug}`);
    try {
      await sendBookingConfirmedEmail({ booking, propertyName: property.name });
    } catch {
      // Payment confirmation remains authoritative even if the courtesy email fails.
    }
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!webhookSecret || !signature) {
    return new Response("Stripe webhook is not configured.", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await request.text();
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return new Response("Invalid webhook signature.", { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    await confirmCheckoutSession(event.data.object);
  }

  return Response.json({ received: true });
}
