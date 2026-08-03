# Authentication, payments, and email setup

The application uses Google OAuth through Auth.js, Stripe-hosted Checkout, and transactional email through Resend. Copy `.env.example` to `.env` and provide the values below.

## Google sign-in

1. Open Google Cloud Console and create or select a project.
2. Configure the OAuth consent screen. Choose **External** if ordinary Google accounts should be able to register.
3. Create an **OAuth client ID** with application type **Web application**.
4. Add these development URLs:
   - Authorized JavaScript origin: `http://localhost:3000`
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Add the corresponding HTTPS origin and callback for production:
   - `https://stays.example.com`
   - `https://stays.example.com/api/auth/callback/google`
6. Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` from the Google credential.
7. Generate `AUTH_SECRET` with `npx auth secret`.
8. Put the owner Google email address in `ADMIN_EMAILS`. Multiple administrators are comma-separated.

Google users are stored in the Prisma `User`, `Account`, and `Session` tables. Existing bookings are linked automatically when the booking email matches the Google email.

## Stripe payment links

1. Create a Stripe account and copy the test-mode secret key into `STRIPE_SECRET_KEY`.
2. Add a webhook endpoint:
   - Development with Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   - Production: `https://stays.example.com/api/stripe/webhook`
3. Subscribe to:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
4. Copy the endpoint signing secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET`.
5. Set `NEXT_PUBLIC_APP_URL` to the public application origin.

When an administrator accepts a request, the server calculates the total from the stored property rate, creates a Stripe Checkout Session, and stores its URL. A booking changes to `confirmed` only after a signature-verified Stripe webhook reports `payment_status=paid`.

## Resend email

1. Create a Resend account.
2. Add and verify the sending domain.
3. Create an API key and set `RESEND_API_KEY`.
4. Set `BOOKING_EMAIL_FROM` to an address on the verified domain, for example `Stay Victoria <bookings@stays.example.com>`.

The acceptance email contains the Stripe payment URL. A confirmation email is sent after the payment webhook confirms the booking.

## Production database

SQLite is suitable for local development. Before deploying to multiple server instances or a serverless platform, switch Prisma to a managed PostgreSQL database and apply the migrations there.
