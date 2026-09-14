import React from "react";
import { Mail, Sparkles, MessageSquare, Newspaper, ShieldCheck, Clock, FileText } from "lucide-react";
import { formatMetaDescription } from "@/lib/meta";

export const metadata = {
  title: "Contact Us | Newsroom and Inquiries",
  description: formatMetaDescription("Get in touch with the editorial team at On Gravity Magazine for story tips, press inquiries, and general feedback."),
};

export default function ContactPage() {
  const contactEmail = "admin.ongravitymagazine@gmail.com";

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-14 space-y-14 font-sans">
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
          Have a story tip, editorial feedback, press inquiry, or general question? We welcome communication from our readers, contributors, and international partners.
        </p>
      </div>

      {/* Main Contact Card */}
      <div className="bg-white dark:bg-slate-900 border-2 border-red-600/20 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl text-center space-y-8">
        <div className="w-16 h-16 bg-red-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <Mail className="w-8 h-8" />
        </div>

        <div className="space-y-3 max-w-xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Direct Email Desk
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
            For all press dispatches, editorial submissions, reader inquiries, image licensing questions, and partnership proposals, reach out directly to our central desk:
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

      {/* Guidance Section */}
      <section className="bg-slate-50 dark:bg-slate-900/60 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
        <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
          Submission and Response Guidelines
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              Response Timeframes
            </h3>
            <p>
              Our editorial desk reviews correspondence Monday through Friday. We endeavor to respond to standard inquiries within 24 to 48 business hours. Urgent press releases or time-sensitive corrections are processed on high priority.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-600" />
              Editorial Pitch Submissions
            </h3>
            <p>
              When pitching guest articles, column proposals, or news leads, please include a concise summary, primary sources, and relevant writer credentials to streamline our editorial review process.
            </p>
          </div>
        </div>
      </section>

      {/* Inquiry Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center mx-auto sm:mx-0">
            <Newspaper className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
            Editorial & Story Tips
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Share news leads, investigative tips, press releases, or pitch guest editorial pieces directly to our team.
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
            We value reader input. Share suggestions on how we can enhance our coverage, accessibility, or visual design.
          </p>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-amber-600/10 text-amber-600 flex items-center justify-center mx-auto sm:mx-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
            Privacy & Legal Rights
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Contact us regarding data protection, legal notices, correction requests, or site policy inquiries.
          </p>
        </div>
      </div>
    </div>
  );
}
