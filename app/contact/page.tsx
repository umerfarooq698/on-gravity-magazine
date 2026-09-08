"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, Sparkles } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Editorial Inquiry",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          Get In Touch
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
          Contact On Gravity Magazine
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
          Have a story tip, press release, advertising inquiry, or editorial feedback? We’d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 space-y-8 bg-zinc-50 dark:bg-zinc-900/60 p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800">
          <div className="space-y-3">
            <h3 className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
              Newsroom & Headquarters
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Our editorial teams operate globally with major offices in London, New York, and Tokyo.
            </p>
          </div>

          <div className="space-y-4 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-zinc-900 dark:text-white block">Address:</span>
                On Gravity Publishing Tower, 45 Fifth Avenue, New York, NY 10003
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-500 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-zinc-900 dark:text-white block">Email Enquiries:</span>
                contact@ongravitymagazine.com
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-500 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-zinc-900 dark:text-white block">Press Desk:</span>
                +1 (800) 555-GRAVITY
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <h4 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">
              Editorial Response Time
            </h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Our communications desk reviews inquiries Monday through Friday, 9:00 AM – 6:00 PM EST. Urgent press tips receive priority attention.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-950 p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
          <h2 className="font-serif text-2xl font-bold text-zinc-900 dark:text-white">
            Send Us a Message
          </h2>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-center space-y-3 animate-in fade-in zoom-in duration-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-white">Message Sent Successfully!</h3>
              <p className="text-xs text-emerald-300">
                Thank you for reaching out to On Gravity Magazine. Our desk will review your inquiry and get back to you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@example.com"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Subject *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Editorial Inquiry">Editorial & News Tip</option>
                  <option value="Advertising">Advertising & Partnerships</option>
                  <option value="Feedback">General Feedback</option>
                  <option value="Technical">Website Support</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Message *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your message here..."
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
