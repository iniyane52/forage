import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Contact — Forage",
  description: "Get in touch with the Forage team.",
};

const CONTACT_EMAIL = "iniyane52@gmail.com";

export default function ContactPage() {
  return (
    <LegalPageLayout title="Contact" updated="20 July 2026">
      <p>
        Forage is an early-stage product, run directly by its founder — questions, bug
        reports, and feedback all reach a real person, not a support queue.
      </p>

      <h2>Email</h2>
      <p>
        The fastest way to reach us:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>

      <h2>What to include</h2>
      <ul>
        <li>For account or billing questions — the email address on your account.</li>
        <li>For a bug report — what you were doing, what you expected, and what happened instead (a screenshot helps).</li>
        <li>For privacy requests (access, correction, deletion) — see our <a href="/privacy">Privacy Policy</a> for what to expect.</li>
      </ul>

      <h2>Response time</h2>
      <p>
        We aim to respond within a few business days. Forage doesn&apos;t yet have a
        24/7 support team — if something is urgent (e.g. a security concern), please say so
        clearly in your message.
      </p>
    </LegalPageLayout>
  );
}
