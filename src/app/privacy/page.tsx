import { ShieldCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Capacity Connect collects, uses, stores, and protects your personal data.",
};

/**
 * Date this policy was last revised. Update whenever the sections below change.
 */
const LAST_UPDATED = "9 September 2026";

const SUPPORT_EMAIL = "capacityconnectofficial@gmail.com";

interface Section {
  heading: string;
  body: string[];
  bullets?: string[];
}

const sections: Section[] = [
  {
    heading: "1. Introduction",
    body: [
      "Capacity Connect (“we”, “us”, or “the platform”) is a digital capacity-building and learning portal. This policy explains what personal information we collect when you use the platform, why we collect it, how we store and protect it, and the choices available to you.",
      "This policy applies to everyone who uses the platform, whether as a trainee, a trainer, or an administrator. By creating an account you confirm that you have read and understood how your information is handled.",
    ],
  },
  {
    heading: "2. Information We Collect",
    body: [
      "We collect only the information needed to operate the platform and deliver training. This falls into the following categories:",
    ],
    bullets: [
      "Account information — your name, email address, assigned role (trainee, trainer, or administrator), and a securely hashed version of your password. We never store your password in a readable form.",
      "Profile information — optional details you choose to add, such as a short biography, headline, areas of interest, skills, qualifications, work experience, certificates, years of experience, and professional or social links.",
      "Learning activity — the courses you enrol in, your progress through individual modules, assessment attempts and scores, completion status, and any course feedback or ratings you submit.",
      "Content you upload — files you add to the platform, including lecture recordings, presentations, documents, and images, together with their file name, size, and type.",
      "Communications — messages you send us through the contact form, including your name, email address, subject, and message body.",
      "Technical information — your IP address, which we use to apply rate limits that protect the platform against automated abuse, and basic error logs used for diagnosing faults.",
    ],
  },
  {
    heading: "3. How We Use Your Information",
    body: ["We use the information described above to:"],
    bullets: [
      "Create and administer your account, and authenticate you when you sign in.",
      "Verify your email address and allow you to reset a forgotten password.",
      "Deliver course content, record your progress, grade assessments, and issue completion records.",
      "Match trainers to subjects based on recorded skills and experience.",
      "Show trainers and administrators the progress of learners they are responsible for.",
      "Respond to enquiries and provide technical support.",
      "Maintain the security, availability, and integrity of the platform.",
    ],
  },
  {
    heading: "4. Cookies and Sessions",
    body: [
      "When you sign in we place a session cookie in your browser. This cookie identifies you for the duration of your session so that you do not have to sign in on every page, and it is essential to the operation of the platform — the service cannot function without it.",
      "We also store a small preference locally in your browser to remember your chosen light or dark theme. We do not use advertising cookies, and we do not track you across other websites.",
    ],
  },
  {
    heading: "5. How Your Information Is Shared",
    body: [
      "We do not sell your personal information, and we do not share it for advertising purposes. Your information is visible to others only in the following circumstances:",
    ],
    bullets: [
      "Trainers can see the enrolment status and progress of learners on the courses they run, along with feedback submitted for those courses.",
      "Administrators can see account details and platform-wide reporting in order to manage users and oversee training delivery.",
      "Other users can see the parts of your profile you have chosen to publish, such as your name, headline, biography, and listed subjects.",
      "Service providers who host the platform, store uploaded files, and deliver our transactional email act on our instructions and may process data on our behalf.",
      "We may disclose information where we are required to do so by law, or to protect the rights, safety, and security of our users and the platform.",
    ],
  },
  {
    heading: "6. Data Security",
    body: [
      "We apply appropriate technical and organisational measures to protect your information. Passwords are stored using a one-way hashing algorithm and are never recoverable in plain text. Access to features and records is restricted by role, so users can reach only the data appropriate to them. Traffic between your browser and the platform is encrypted in transit.",
      "No online service can guarantee absolute security. If you believe your account has been compromised, change your password immediately and contact us using the details below.",
    ],
  },
  {
    heading: "7. Data Retention",
    body: [
      "We keep your account and learning records for as long as your account remains active, so that your progress, results, and completion records stay available to you.",
      "Short-lived security tokens are deleted automatically once they are used or once they expire: password reset links expire after one hour, and email verification links expire after twenty-four hours.",
      "If your account is closed, we delete or anonymise the personal information associated with it, other than records we are required to retain for legal, audit, or reporting obligations.",
    ],
  },
  {
    heading: "8. Your Rights",
    body: [
      "You can review and update most of your personal details at any time from your profile page. In addition, you may ask us to:",
    ],
    bullets: [
      "Provide a copy of the personal information we hold about you.",
      "Correct information that is inaccurate or incomplete.",
      "Delete your account and the personal information associated with it, subject to any records we must retain by law.",
      "Restrict or object to certain uses of your information.",
    ],
  },
  {
    heading: "9. Children's Privacy",
    body: [
      "The platform is intended for professional and workforce training and is not directed at children. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so that we can remove it.",
    ],
  },
  {
    heading: "10. Changes to This Policy",
    body: [
      "We may update this policy from time to time to reflect changes to the platform or to our legal obligations. When we do, we will revise the “last updated” date shown at the top of this page. Where changes are significant, we will take reasonable steps to notify you directly.",
    ],
  },
  {
    heading: "11. Contact Us",
    body: [
      `If you have questions about this policy, or wish to exercise any of the rights described above, contact us at ${SUPPORT_EMAIL}, or write to us at Ministry of Earth Sciences, Prithvi Bhavan, Lodhi Road, New Delhi, 110003.`,
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div
      className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.15)]">
            <ShieldCheck className="w-8 h-8 text-[#a855f7]" />
          </div>
          <h1
            className="text-4xl font-extrabold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Privacy Policy
          </h1>
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            How we collect, use, and protect your information on Capacity Connect.
          </p>
          <p
            className="text-sm mt-4 font-semibold tracking-wider uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* Template notice — remove once the policy has had legal review. */}
        <div className="mb-10 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            <span className="font-bold">Template notice.</span> This is a general
            privacy policy provided as a starting point. It has not been reviewed
            by a legal professional and may not satisfy every obligation that
            applies to your organisation. Please have it reviewed before relying
            on it in production.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <section
              key={section.heading}
              className="glass-panel rounded-xl border border-[rgba(255,255,255,0.05)] p-6 sm:p-8"
            >
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                {section.heading}
              </h2>

              {section.body.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed mb-3 last:mb-0"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {paragraph}
                </p>
              ))}

              {section.bullets && (
                <ul className="mt-4 space-y-3">
                  {section.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] shrink-0 mt-[0.5rem]" />
                      <span
                        className="text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            Questions about how we handle your data?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold tracking-widest rounded-lg text-white bg-purple-600 hover:bg-purple-700 dark:bg-[#a855f7]/20 dark:hover:bg-[#a855f7]/30 border border-purple-600 dark:border-[#a855f7]/30 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
          >
            CONTACT US
          </Link>
        </div>
      </div>
    </div>
  );
}
