import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

export function isAuthConfigured() {
  return Boolean(process.env.AUTH_SECRET && process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET ?? "configuration-required-before-production",
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "google-client-id-required",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "google-client-secret-required",
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      session.user.role = isAdminEmail(user.email) ? "admin" : user.role;
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (!user.id || !user.email) return;
      await prisma.booking.updateMany({
        where: {
          userId: null,
          guestEmail: { equals: user.email },
        },
        data: { userId: user.id },
      });
    },
  },
});
