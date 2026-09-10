import React from "react";
import { ShieldCheck, Lock, FileText } from "lucide-react";

import { formatMetaDescription } from "@/lib/meta";

export const metadata = {
  title: "Privacy Policy | On Gravity Magazine",
  description: formatMetaDescription("Privacy policy and reader data protection guidelines for subscribers of On Gravity Magazine online."),
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-10 font-sans">
      <div className="space-y-4 border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-500 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          Data Sovereignty & Privacy
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-zinc-500">
          Last Updated: September 8, 2026 • Effective Immediately
        </p>
      </div>

      <div className="space-y-8 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
            1. Overview & Commitment
          </h2>
          <p>
            At On Gravity Magazine, we believe your privacy is fundamental. This policy outlines how we collect, store, safeguard, and use personal information when you visit our website, read our articles, or subscribe to our newsletter dispatches.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
            2. Information We Collect
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>
              <strong>Subscriber Information:</strong> Email addresses provided voluntarily for newsletter dispatches.
            </li>
            <li>
              <strong>Usage & Analytics Data:</strong> Anonymized traffic metrics including browser type, page views, session duration, and device characteristics.
            </li>
            <li>
              <strong>Contact Submissions:</strong> Names and email addresses submitted via our contact forms.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
            3. How We Use Your Information
          </h2>
          <p>
            Information collected is strictly utilized to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-400">
            <li>Deliver daily/weekly editorial newsletter dispatches.</li>
            <li>Optimize site performance, reading UI, and article load times.</li>
            <li>Respond to direct reader questions, tips, and press inquiries.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
            4. Data Sharing & Third Parties
          </h2>
          <p>
            We do <strong>not</strong> sell, rent, or trade reader personal data to third-party advertisers or data brokers under any circumstances.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
            5. Your Rights & Unsubscribing
          </h2>
          <p>
            You have the right to request deletion of your subscriber data at any time. Every newsletter email includes a one-click unsubscribe link at the footer.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
            6. Contact Data Protection Officer
          </h2>
          <p>
            For privacy inquiries or data requests, please contact our privacy desk at:{" "}
            <a href="mailto:admin.ongravitymagazine@gmail.com" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
              admin.ongravitymagazine@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
