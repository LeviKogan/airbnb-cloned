import "server-only";

import Stripe from "stripe";
import type { Property } from "@/lib/types/property";

type PaymentBooking = {
  id: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guests: number;
};

export class IntegrationConfigurationError extends Error {}

export function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new IntegrationConfigurationError("Stripe is not configured. Add STRIPE_SECRET_KEY.");
  return new Stripe(key);
}

export async function createBookingCheckoutSession({
  booking,
  property,
  totalAmountCents,
}: {
  booking: PaymentBooking;
  property: Property;
  totalAmountCents: number;
}) {
  const stripe = getStripe();
  const appUrl = getAppUrl();
  return stripe.checkout.sessions.create(
    {
      mode: "payment",
      customer_email: booking.guestEmail,
      success_url: `${appUrl}/booking/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/properties/${property.slug}?payment=cancelled`,
      metadata: {
        bookingId: booking.id,
        propertyId: property.id,
      },
      payment_intent_data: {
        metadata: {
          bookingId: booking.id,
          propertyId: property.id,
        },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "aud",
            unit_amount: totalAmountCents,
            product_data: {
              name: `${property.name} stay`,
              description: `${booking.checkIn} to ${booking.checkOut} · ${booking.guests} guest${booking.guests === 1 ? "" : "s"}`,
            },
          },
        },
      ],
    },
    { idempotencyKey: `booking-checkout-${booking.id}` },
  );
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(cents / 100);
}

export async function sendPaymentRequestEmail({
  booking,
  property,
  paymentUrl,
  totalAmountCents,
  idempotencyKey,
}: {
  booking: PaymentBooking;
  property: Property;
  paymentUrl: string;
  totalAmountCents: number;
  idempotencyKey: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.BOOKING_EMAIL_FROM;
  if (!apiKey || !from) {
    throw new IntegrationConfigurationError("Email is not configured. Add RESEND_API_KEY and BOOKING_EMAIL_FROM.");
  }

  const safeName = escapeHtml(booking.guestName);
  const safeProperty = escapeHtml(property.name);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
      "User-Agent": "stay-victoria-bookings/1.0",
    },
    body: JSON.stringify({
      from,
      to: [booking.guestEmail],
      subject: `Your ${property.name} booking is ready for payment`,
      text: [
        `Hi ${booking.guestName},`,
        "",
        `Your booking request for ${property.name} from ${booking.checkIn} to ${booking.checkOut} has been accepted.`,
        `Total: ${formatCurrency(totalAmountCents)} AUD`,
        "",
        `Pay securely: ${paymentUrl}`,
        "",
        "Your stay will be confirmed automatically once Stripe confirms payment.",
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#21302b;line-height:1.6">
          <div style="background:#173a33;color:white;padding:28px;border-radius:18px 18px 0 0">
            <strong style="color:#d9ff75">STAY VICTORIA</strong>
            <h1 style="font-size:26px;margin:12px 0 0">Your stay is ready for payment</h1>
          </div>
          <div style="border:1px solid #dfe3dc;border-top:0;padding:28px;border-radius:0 0 18px 18px">
            <p>Hi ${safeName},</p>
            <p>Your request for <strong>${safeProperty}</strong> has been accepted.</p>
            <div style="background:#f5f5f1;padding:16px;border-radius:12px;margin:20px 0">
              <div>${escapeHtml(booking.checkIn)} – ${escapeHtml(booking.checkOut)}</div>
              <div>${booking.guests} guest${booking.guests === 1 ? "" : "s"}</div>
              <strong style="display:block;margin-top:8px">${formatCurrency(totalAmountCents)} AUD</strong>
            </div>
            <a href="${escapeHtml(paymentUrl)}" style="display:inline-block;background:#173a33;color:white;text-decoration:none;padding:13px 20px;border-radius:10px;font-weight:bold">Pay securely with Stripe</a>
            <p style="font-size:13px;color:#6d7a75;margin-top:24px">Your booking will be confirmed automatically after Stripe confirms payment.</p>
          </div>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend rejected the payment email (${response.status}): ${detail.slice(0, 180)}`);
  }
}

export async function sendBookingConfirmedEmail({
  booking,
  propertyName,
}: {
  booking: PaymentBooking;
  propertyName: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.BOOKING_EMAIL_FROM;
  if (!apiKey || !from) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `booking-confirmed-${booking.id}`,
      "User-Agent": "stay-victoria-bookings/1.0",
    },
    body: JSON.stringify({
      from,
      to: [booking.guestEmail],
      subject: `Booking confirmed — ${propertyName}`,
      text: `Hi ${booking.guestName},\n\nPayment is confirmed and your stay at ${propertyName} from ${booking.checkIn} to ${booking.checkOut} is booked.\n\nBooking reference: ${booking.id}`,
    }),
  });
}
