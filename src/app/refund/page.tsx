import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Refund Policy — Forage",
  description: "Forage's cancellation and refund policy for Pro subscriptions.",
};

export default function RefundPage() {
  return (
    <LegalPageLayout title="Refund Policy" updated="20 July 2026">
      <p>
        This policy covers cancellations and refunds for Forage Pro, our paid subscription
        plan. The Common Core (free tier) requires no payment and this policy doesn&apos;t
        apply to it.
      </p>

      <h2>1. Free trial and preview access</h2>
      <p>
        Forage is currently in a pre-launch phase for paid billing — Pro access may be
        offered as a free preview with no charge. If you were granted Pro access this way,
        no payment was collected and no refund is applicable. Once real paid billing goes
        live, this page will be updated to reflect the exact terms in effect at that time,
        and you&apos;ll always be shown the price and billing terms before you pay.
      </p>

      <h2>2. Cancelling your subscription</h2>
      <p>
        Once paid billing is live, you&apos;ll be able to cancel your Pro subscription at any
        time from your account settings. Cancelling stops future billing — you&apos;ll keep
        Pro access until the end of your current paid period, and won&apos;t be charged again
        afterward.
      </p>

      <h2>3. Refund eligibility</h2>
      <p>Once paid billing is live, refunds will generally be available if:</p>
      <ul>
        <li>You were charged due to a genuine billing error on our part (e.g. a duplicate charge).</li>
        <li>You request a refund within 7 days of your first Pro payment and haven&apos;t made substantial use of Pro-only content.</li>
      </ul>
      <p>
        Refunds are generally not provided for partial billing periods after substantial use
        of Pro features, or for renewal charges after the initial 7-day window, except where
        required by applicable law.
      </p>

      <h2>4. How to request a refund</h2>
      <p>
        Contact us via our <a href="/contact">Contact page</a> with your account email and the
        reason for your request. We&apos;ll review and respond within a reasonable time.
        Approved refunds are issued to the original payment method.
      </p>

      <h2>5. Changes to this policy</h2>
      <p>
        We&apos;ll update this page with the definitive refund terms before paid billing goes
        live, and note any material changes here going forward.
      </p>
    </LegalPageLayout>
  );
}
