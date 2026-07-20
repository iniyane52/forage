import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — Forage",
  description: "How Forage collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" updated="20 July 2026">
      <p>
        This Privacy Policy explains what personal data Forage (&quot;we&quot;, &quot;us&quot;)
        collects when you use forage.co.in and related subdomains (the &quot;Service&quot;),
        why we collect it, and the choices you have. By using the Service, you consent to the
        practices described here.
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li><strong>Account data:</strong> email address and (if you sign in with Google) your name and profile photo from Google.</li>
        <li><strong>Progress data:</strong> lessons completed, quiz answers and scores, XP, streaks, badges, and your chosen career path.</li>
        <li><strong>Tutor &amp; Interview content:</strong> messages you send to the AI Tutor, and audio/transcripts from Forage Interview sessions, so the feature can function and so we can enforce usage limits.</li>
        <li><strong>Usage data:</strong> basic technical data like IP address and browser type, collected automatically for security and to keep the Service running reliably.</li>
      </ul>
      <p>We don&apos;t collect payment card details directly — those are handled by our payment processor once paid plans are live, and we never see or store your full card number.</p>

      <h2>2. How we use it</h2>
      <ul>
        <li>To provide the Service — track your progress, run quizzes, power the Tutor and Interview features.</li>
        <li>To maintain security — detect abuse, enforce rate limits, and prevent unauthorized access.</li>
        <li>To communicate with you — account-related emails (e.g. password resets) and, if you opt in, product updates.</li>
        <li>To improve the Service — understanding, in aggregate, which lessons and features are actually used.</li>
      </ul>
      <p>We do not sell your personal data to third parties.</p>

      <h2>3. Who we share it with</h2>
      <p>
        We use a small number of infrastructure providers to run Forage, each processing data
        only as needed to provide their specific service to us:
      </p>
      <ul>
        <li><strong>Supabase</strong> — our database, authentication, and backend hosting provider.</li>
        <li><strong>Groq</strong> — the AI provider powering Forage Tutor and Forage Interview (chat, speech-to-text, and text-to-speech).</li>
        <li><strong>Vercel</strong> — hosts the Forage website and app.</li>
        <li><strong>Google</strong> — if you choose &quot;Continue with Google&quot; to sign in.</li>
      </ul>
      <p>
        We don&apos;t share your data with anyone else except where required by law, or with
        your explicit consent.
      </p>

      <h2>4. Your rights</h2>
      <p>You can, at any time:</p>
      <ul>
        <li>Access the personal data we hold about you.</li>
        <li>Correct inaccurate data (most of it is editable directly in your Profile).</li>
        <li>Request deletion of your account and associated data.</li>
        <li>Withdraw consent for optional communications (e.g. product update emails).</li>
      </ul>
      <p>
        To exercise any of these rights, contact us via the details on our{" "}
        <a href="/contact">Contact page</a>. We&apos;ll respond within a reasonable time, and in
        line with applicable law, including India&apos;s Digital Personal Data Protection Act,
        2023, for users in India.
      </p>

      <h2>5. Data retention</h2>
      <p>
        We keep your account and progress data for as long as your account is active. If you
        delete your account, we delete your personal data within a reasonable period, except
        where we&apos;re required to retain limited records for legal or security purposes.
      </p>

      <h2>6. Cookies</h2>
      <p>
        We use essential cookies to keep you signed in and to remember basic preferences. We
        don&apos;t currently use third-party advertising or tracking cookies.
      </p>

      <h2>7. Security</h2>
      <p>
        We take reasonable technical measures to protect your data, including encrypted
        connections (HTTPS), database access controls (row-level security), and restricting
        who inside Forage can access user data. No system is perfectly secure, and we
        can&apos;t guarantee absolute security.
      </p>

      <h2>8. Children&apos;s privacy</h2>
      <p>The Service is not directed at children under 13, and we don&apos;t knowingly collect personal data from children under 13.</p>

      <h2>9. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Material changes will be
        reflected here with an updated &quot;Last updated&quot; date.
      </p>

      <h2>10. Grievance officer / contact</h2>
      <p>
        For privacy questions, data requests, or complaints, contact us via our{" "}
        <a href="/contact">Contact page</a>. We aim to acknowledge and address grievances
        promptly.
      </p>
    </LegalPageLayout>
  );
}
