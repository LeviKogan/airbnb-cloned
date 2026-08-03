import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, isAuthConfigured } from "@/auth";
import { signInWithGoogle } from "@/app/actions/auth";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to manage your Stay Victoria bookings.",
};

type SignInPageProps = {
  searchParams: Promise<{ callbackUrl?: string; setup?: string; error?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const [session, query] = await Promise.all([auth(), searchParams]);
  const callbackUrl =
    query.callbackUrl?.startsWith("/") && !query.callbackUrl.startsWith("//") ? query.callbackUrl : "/account";
  if (session?.user) redirect(callbackUrl);
  const configured = isAuthConfigured();
  const signInAction = signInWithGoogle.bind(null, callbackUrl);

  return (
    <main className="min-h-[75vh] bg-[#f5f5f1] py-14 sm:py-20">
      <Container className="max-w-xl">
        <div className="overflow-hidden rounded-3xl border border-[#dfe3dc] bg-white shadow-[0_18px_60px_rgba(23,58,51,0.08)]">
          <div className="bg-[#173a33] px-6 py-8 text-white sm:px-9">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#d9ff75] text-lg font-bold text-[#173a33]">S</span>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight">Your stays, all in one place.</h1>
            <p className="mt-3 leading-7 text-white/70">Sign in to review booking requests, payment status, and confirmed trips.</p>
          </div>
          <div className="p-6 sm:p-9">
            {query.setup || !configured ? (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                Google sign-in needs to be configured first. Add <code>AUTH_SECRET</code>, <code>AUTH_GOOGLE_ID</code>, and <code>AUTH_GOOGLE_SECRET</code> to the environment.
              </div>
            ) : null}
            <form action={signInAction}>
              <button
                type="submit"
                disabled={!configured}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#d9ddd7] px-5 py-3.5 font-semibold text-[#25332e] transition hover:bg-[#f7f8f5] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <span className="grid size-6 place-items-center rounded-full bg-white text-sm font-bold text-[#4285f4] shadow-sm">G</span>
                Continue with Google
              </button>
            </form>
            <p className="mt-5 text-center text-xs leading-5 text-[#7d8883]">By continuing, you agree to the booking terms and privacy policy.</p>
            <Link href="/" className="mt-6 block text-center text-sm font-medium text-[#365f55]">← Back to Stay Victoria</Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
