"use server";

import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email"),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
});

export type SubmitContactResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function submitContactMessage(input: unknown): Promise<SubmitContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".") || "_form";
      fieldErrors[path] = fieldErrors[path] ?? [];
      fieldErrors[path].push(issue.message);
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  // In production: send via Resend / SES, or persist to DB. Demo path validates only.
  return { ok: true };
}
