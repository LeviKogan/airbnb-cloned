"use client";

import { useState, useTransition } from "react";
import { submitContactMessage } from "@/app/actions/contact";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitContactMessage({ name, email, subject, message });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSent(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    });
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8">
        <p className="text-sm font-medium text-emerald-700">Message sent</p>
        <p className="mt-2 text-neutral-700">
          Thanks for reaching out. We typically reply within one business day. For urgent booking
          questions, mention your dates in a follow-up email to{" "}
          <a href="mailto:hello@stayvictoria.com" className="font-medium text-neutral-950 underline">
            hello@stayvictoria.com
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 text-sm font-medium text-neutral-950 underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm text-neutral-700">
          Name
          <input
            required
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-neutral-950"
          />
        </label>
        <label className="block text-sm text-neutral-700">
          Email
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-neutral-950"
          />
        </label>
      </div>
      <label className="block text-sm text-neutral-700">
        Subject
        <input
          required
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-neutral-950"
        />
      </label>
      <label className="block text-sm text-neutral-700">
        Message
        <textarea
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-neutral-950"
          placeholder="Tell us about your trip, dates, or any questions about our properties."
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
