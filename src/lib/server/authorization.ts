import "server-only";

import { redirect } from "next/navigation";
import { auth, isAdminEmail, isAuthConfigured } from "@/auth";

export function isDevelopmentAdminBypassEnabled() {
  return process.env.NODE_ENV === "development" && process.env.AUTH_BYPASS_ADMIN === "true";
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser(callbackUrl = "/account") {
  if (!isAuthConfigured()) {
    redirect(`/signin?setup=1&callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  const user = await getCurrentUser();
  if (!user) redirect(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return user;
}

export async function isCurrentUserAdmin() {
  if (isDevelopmentAdminBypassEnabled()) return true;
  const user = await getCurrentUser();
  return Boolean(user && (user.role === "admin" || isAdminEmail(user.email)));
}

export async function requireAdmin() {
  if (isDevelopmentAdminBypassEnabled()) {
    return { id: "development-admin", role: "admin", name: "Levi", email: "dev-admin@localhost", image: null };
  }
  if (!isAuthConfigured()) {
    redirect("/signin?setup=1&callbackUrl=/admin");
  }
  const user = await getCurrentUser();
  if (!user) redirect("/signin?callbackUrl=/admin");
  if (user.role !== "admin" && !isAdminEmail(user.email)) redirect("/account?error=admin_required");
  return user;
}
