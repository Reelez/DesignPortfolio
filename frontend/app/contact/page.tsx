"use client";

import { useState } from "react";

/**
 * NOTE: this form is intentionally NOT wired to any backend endpoint.
 * RF05 (contact email delivery) is explicitly out of scope for this change
 * (see proposal.md, "Contact Form UI Only"). Submission only shows a
 * placeholder "not yet connected" state and logs the payload to the
 * console — this is a deliberate scope boundary, not a bug.
 */
export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    // eslint-disable-next-line no-console
    console.log("Contact form submitted (not yet connected to backend):", payload);
    setSubmitted(true);
  }

  const fieldClass =
    "border-0 border-b border-line bg-transparent px-0 py-2 focus:border-accent focus:outline-none focus:ring-0";

  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col gap-10 px-6 py-16 sm:px-10 sm:py-24">
      <div className="flex flex-col gap-2">
        <p className="tracking-label text-xs text-accent">Contact</p>
        <h1 className="font-display text-4xl">Let&apos;s talk</h1>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <label className="flex flex-col gap-2">
          <span className="tracking-label text-xs text-muted">Name</span>
          <input name="name" type="text" required className={fieldClass} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="tracking-label text-xs text-muted">Email</span>
          <input name="email" type="email" required className={fieldClass} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="tracking-label text-xs text-muted">Message</span>
          <textarea name="message" required rows={5} className={fieldClass} />
        </label>
        <button
          type="submit"
          className="tracking-label w-fit border-b-2 border-accent pb-1 text-xs transition hover:text-accent"
        >
          Send
        </button>
        {submitted ? (
          <p className="text-sm text-muted">
            This form isn&apos;t connected to a backend yet — your message was
            only logged locally. Real email delivery is planned for a future
            iteration.
          </p>
        ) : null}
      </form>
    </main>
  );
}
