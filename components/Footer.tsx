"use client";

import React from "react";
import Link from "next/link";
import { CATEGORIES } from "@/data/categories";
import { Sparkles, Mail, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-zinc-950 text-zinc-300 border-t border-zinc-900 mt-auto">
      {/* Upper Footer section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <span className="font-serif text-2xl font-black text-white tracking-tight">
              ON GRAVITY
            </span>
          </Link>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
            On Gravity Magazine is an independent publication delivering high-caliber journalism, culture insights, technological developments, and lifestyle perspectives for global readers.
          </p>
          <div className="pt-2 flex items-center gap-3 text-xs text-zinc-500">
            <span>© {new Date().getFullYear()} On Gravity Magazine. All rights reserved.</span>
          </div>
        </div>

        {/* Categories Column */}
        <div className="space-y-3">
          <h3 className="font-sans text-xs font-bold text-white uppercase tracking-widest border-b border-zinc-800 pb-2">
            Categories
          </h3>
          <ul className="space-y-2 text-xs font-medium text-zinc-400">
            {CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="hover:text-amber-400 transition-colors"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Pages Column */}
        <div className="space-y-3">
          <h3 className="font-sans text-xs font-bold text-white uppercase tracking-widest border-b border-zinc-800 pb-2">
            Company & Policies
          </h3>
          <ul className="space-y-2 text-xs font-medium text-zinc-400">
            <li>
              <Link href="/about" className="hover:text-amber-400 transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-amber-400 transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-amber-400 transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/cookie-policy" className="hover:text-amber-400 transition-colors">
                Cookie Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Quick Signup */}
        <div className="space-y-3">
          <h3 className="font-sans text-xs font-bold text-white uppercase tracking-widest border-b border-zinc-800 pb-2">
            Stay Informed
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Get our daily editor’s picks and breaking stories delivered straight to your inbox.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thank you for subscribing to On Gravity Magazine!");
            }}
            className="space-y-2"
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold py-2 rounded-lg text-xs transition-colors"
            >
              Subscribe Now
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-900 py-6 px-4 sm:px-8 bg-zinc-950 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>Designed for Readers Worldwide • High Quality Journalism</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/cookie-policy" className="hover:underline">
              Cookies
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
