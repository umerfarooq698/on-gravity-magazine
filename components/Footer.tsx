"use client";

import React from "react";
import Link from "next/link";
import { CATEGORIES } from "@/data/categories";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="w-full bg-[#001933] text-slate-300 border-t-4 border-red-600 mt-auto">
      {/* Upper Footer section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/">
            <Logo size="md" variant="light" />
          </Link>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm font-sans">
            On Gravity Magazine delivers fair, fast, and comprehensive national, technological, lifestyle, and business coverage for readers worldwide.
          </p>
          <div className="pt-2 flex items-center gap-3 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            <span>© {new Date().getFullYear()} ON GRAVITY MAGAZINE. ALL RIGHTS RESERVED.</span>
          </div>
        </div>

        {/* Categories Column */}
        <div className="space-y-3">
          <h3 className="font-sans text-xs font-black text-white uppercase tracking-widest border-b-2 border-red-600 pb-1.5">
            CATEGORIES
          </h3>
          <ul className="space-y-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            {CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="hover:text-red-500 transition-colors"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Pages Column */}
        <div className="space-y-3">
          <h3 className="font-sans text-xs font-black text-white uppercase tracking-widest border-b-2 border-red-600 pb-1.5">
            CORPORATE & POLICIES
          </h3>
          <ul className="space-y-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <li>
              <Link href="/about" className="hover:text-red-500 transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-red-500 transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-red-500 transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/cookie-policy" className="hover:text-red-500 transition-colors">
                Cookie Policy
              </Link>
            </li>
            <li>
              <Link href="/sitemap.xml" className="hover:text-red-500 transition-colors" target="_blank">
                Sitemap
              </Link>
            </li>
            <li>
              <Link href="/rss.xml" className="hover:text-red-500 transition-colors" target="_blank">
                RSS Feed
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Quick Signup */}
        <div className="space-y-3">
          <h3 className="font-sans text-xs font-black text-white uppercase tracking-widest border-b-2 border-red-600 pb-1.5">
            BREAKING ALERTS
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Get daily newsroom dispatches and breaking stories delivered straight to your inbox.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thank you for subscribing to On Gravity News Alerts!");
            }}
            className="space-y-2"
          >
            <input
              type="email"
              required
              placeholder="ENTER YOUR EMAIL"
              className="w-full bg-slate-900 border border-slate-700 rounded-xs px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 uppercase font-bold"
            />
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider py-2 rounded-xs text-xs shadow-md transition-colors"
            >
              SUBSCRIBE ALERTS
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 py-4 px-4 sm:px-8 bg-[#001226] text-center text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>ON GRAVITY MAGAZINE • GLOBAL JOURNALISM & BREAKING COVERAGE</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/privacy-policy" className="hover:text-white">
              PRIVACY
            </Link>
            <Link href="/cookie-policy" className="hover:text-white">
              COOKIES
            </Link>
            <Link href="/contact" className="hover:text-white">
              CONTACT
            </Link>
            <Link href="/sitemap.xml" className="hover:text-white" target="_blank">
              SITEMAP
            </Link>
            <Link href="/rss.xml" className="hover:text-white" target="_blank">
              RSS FEED
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
