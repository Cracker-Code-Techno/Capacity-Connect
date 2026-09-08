import { HelpCircle, ChevronDown } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Capacity Connect.",
};

const faqs = [
  {
    question: "What is Capacity Connect?",
    answer: "Capacity Connect is a premier learning management platform designed to build capacity, accelerate professional development, and connect trainees with expert trainers."
  },
  {
    question: "Who can use it?",
    answer: "Trainees - to learn courses and give tests. Trainers - to create courses and check progress. Admins - to manage users and see full reports."
  },
  {
    question: "How do I become a Trainer?",
    answer: "During signup, select 'Trainer' as your role. Your account will be created as a 'Pending Trainer' and will be reviewed by our administrators. Once approved, you'll be able to create courses and modules."
  },
  {
    question: "Do I need high-speed internet?",
    answer: "No. It works on low internet. You can download videos and give tests offline. It syncs later."
  },
  {
    question: "Is my data safe?",
    answer: "Yes. Secure login, role-based access, and encrypted data. Only authorized persons can access."
  },
  {
    question: "How are experts assigned?",
    answer: "System auto-matches the best expert to the subject based on skills and experience."
  },
  {
    question: "Will I get a certificate?",
    answer: "Yes, instant QR-verified certificate after course completion."
  },
  {
    question: "Can Admin track progress live?",
    answer: "Yes, live dashboard shows attendance, completion, scores, and progress charts."
  },
  {
    question: "Is it different from Moodle?",
    answer: "Yes, Moodle is generic. Our portal is made for Govt/MoES - has competency mapping, offline sync, and MoES subject tagging."
  },
  {
    question: "How do I reset my password?",
    answer: "If you've forgotten your password, go to the login page and click on 'Forgot Password'. We will send you a secure link to reset it."
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.15)]">
            <HelpCircle className="w-8 h-8 text-[#a855f7]" />
          </div>
          <h1 className="text-4xl font-extrabold mb-4" style={{ color: "var(--text-primary)" }}>Frequently Asked Questions</h1>
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            Have a question? We&apos;re here to help. Find answers to our most common questions below.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details key={index} className="group glass-panel rounded-xl border border-[rgba(255,255,255,0.05)] overflow-hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                {faq.question}
                <span className="transition group-open:rotate-180">
                  <ChevronDown className="w-5 h-5 text-purple-500" />
                </span>
              </summary>
              <div className="px-6 pb-6 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {faq.answer}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Still have questions?</p>
          <Link href="/contact" className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold tracking-widest rounded-lg text-white bg-purple-600 hover:bg-purple-700 dark:bg-[#a855f7]/20 dark:hover:bg-[#a855f7]/30 border border-purple-600 dark:border-[#a855f7]/30 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            CONTACT SUPPORT
          </Link>
        </div>
      </div>
    </div>
  );
}
