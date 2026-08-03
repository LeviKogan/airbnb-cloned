"use server";

import { signIn, signOut } from "@/auth";

export async function signInWithGoogle(callbackUrl = "/account") {
  await signIn("google", { redirectTo: callbackUrl });
}

export async function signOutCurrentUser() {
  await signOut({ redirectTo: "/" });
}
