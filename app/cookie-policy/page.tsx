import React from "react";
import { Cookie, ShieldAlert } from "lucide-react";

import { formatMetaDescription } from "@/lib/meta";

export const metadata = {
  title: "Cookie Policy | On Gravity Magazine",
  description: formatMetaDescription("Cookie policy explaining tracking cookies, user preferences, and browser consent settings on On Gravity Magazine."),
};

export default function CookiePolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-10 font-sans">
      <div className="space-y-4 border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider">
          <Cookie className="w-4 h-4" />
          Cookies & Storage
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
          Cookie Policy
        </h1>
        <p className="text-xs text-zinc-500">
          Last Updated: September 8, 2026 • Effective Immediately
        </p>
      </div>

      <div className="space-y-8 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
            1. What Are Cookies?
          </h2>
          <p>
            Cookies are small text files stored on your browser or device when you visit websites. They help remember your preferences (such as Light/Dark mode settings) and ensure smooth site navigation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
            2. How We Use Cookies
          </h2>
          <p>On Gravity Magazine uses minimal, essential cookies for:</p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>
              <strong>Theme Preferences:</strong> Storing your Light or Dark mode UI choice.
            </li>
            <li>
              <strong>Session Security:</strong> Protecting site forms against CSRF attacks.
            </li>
            <li>
              <strong>Performance Analytics:</strong> Understanding popular articles anonymously to improve our editorial content.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
            3. Managing Cookies
          </h2>
          <p>
            You can modify your browser settings to decline or delete cookies at any time. Note that disabling essential cookies may impact certain UI features such as dark mode memory.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
            4. Updates to This Policy
          </h2>
          <p>
            We may update this policy periodically to reflect changes in web standards or legal regulations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
            5. Contact Us
          </h2>
          <p>
            For questions regarding cookie management, email us at:{" "}
            <a href="mailto:admin.ongravitymagazine@gmail.com" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
              admin.ongravitymagazine@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
