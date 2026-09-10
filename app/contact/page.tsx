import React from "react";
import { Mail, Sparkles, MessageSquare, Newspaper, ShieldCheck } from "lucide-react";
import { formatMetaDescription } from "@/lib/meta";

export const metadata = {
  title: "Contact Us | On Gravity Magazine",
  description: formatMetaDescription("Get in touch with the editorial team at On Gravity Magazine for story tips, press inquiries, and general feedback."),
};

export default function ContactPage() {
  const contactEmail = "admin.ongravitymagazine@gmail.com";

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-14 space-y-12 font-sans">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 text-red-600 dark:text-red-500 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          Get In Touch
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Contact On Gravity Magazine
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          Have a story tip, editorial feedback, press inquiry, or general question? We are always open to hearing from our readers and partners.
        </p>
      </div>

      {/* Main Contact Card */}
      <div className="bg-white dark:bg-slate-900 border-2 border-red-600/20 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl text-center space-y-8">
        <div className="w-16 h-16 bg-red-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <Mail className="w-8 h-8" />
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Direct Email Communications
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            For all press dispatches, editorial submissions, reader inquiries, and partnership proposals, please reach out to our primary desk at:
          </p>
        </div>

        {/* Highlighted Email Badge & Action */}
        <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="font-mono text-base sm:text-lg font-bold text-red-600 dark:text-red-400 select-all px-3">
            {contactEmail}
          </span>
          <a
            href={`mailto:${contactEmail}`}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Send Email
          </a>
        </div>
      </div>

      {/* Inquiry Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center mx-auto sm:mx-0">
            <Newspaper className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
            Editorial & Story Tips
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Share news leads, investigative tips, press releases, or pitch a guest editorial piece.
          </p>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center mx-auto sm:mx-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
            Reader Feedback
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            We value your thoughts. Let us know how we can improve our coverage, design, or user experience.
          </p>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-amber-600/10 text-amber-600 flex items-center justify-center mx-auto sm:mx-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
            Privacy & Rights
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Contact us for data requests, legal inquiries, or site policy questions.
          </p>
        </div>
      </div>
    </div>
  );
}
