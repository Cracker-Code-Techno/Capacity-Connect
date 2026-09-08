"use client";

import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("Error sending contact message:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-[#a855f7]/50";
  const inputStyle = {
    background: "var(--card)",
    border: "1px solid var(--border-light)",
    color: "var(--text-primary)",
  };
  const labelClass = "block text-xs font-bold tracking-widest uppercase mb-2";

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#a855f7]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.15)]">
            <MessageSquare className="w-8 h-8 text-[#a855f7]" />
          </div>
          <h1 className="text-4xl font-extrabold mb-4" style={{ color: "var(--text-primary)" }}>Contact Us</h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Have a question, feedback, or need support? Fill out the form below and our team will get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-8 rounded-2xl border border-[rgba(255,255,255,0.05)]">
              <h3 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>Get in Touch</h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Email</p>
                    <p style={{ color: "var(--text-primary)" }}>capacityconnectofficial@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Phone</p>
                    <p style={{ color: "var(--text-primary)" }}>+91 62893 68662</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Address</p>
                    <p style={{ color: "var(--text-primary)" }} className="leading-relaxed">
                      Ministry of Earth Sciences<br />
                      Prithvi Bhavan, Lodhi Road<br />
                      New Delhi, 110003
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl border border-[rgba(255,255,255,0.05)] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className={labelClass} style={{ color: "var(--text-muted)" }}>Full Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    className={inputClass}
                    style={inputStyle}
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="email" className={labelClass} style={{ color: "var(--text-muted)" }}>Email Address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    className={inputClass}
                    style={inputStyle}
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className={labelClass} style={{ color: "var(--text-muted)" }}>Subject</label>
                <input
                  id="subject"
                  type="text"
                  required
                  className={inputClass}
                  style={inputStyle}
                  placeholder="How can we help you?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="message" className={labelClass} style={{ color: "var(--text-muted)" }}>Message</label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  className={`${inputClass} resize-none`}
                  style={inputStyle}
                  placeholder="Write your message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium"
                >
                  Thank you! Your message has been sent successfully. We will get back to you soon.
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-8 rounded-lg text-sm font-bold tracking-widest text-white bg-purple-600 hover:bg-purple-700 dark:bg-[#a855f7]/20 dark:hover:bg-[#a855f7]/30 border border-purple-600 dark:border-[#a855f7]/30 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {loading ? "SENDING..." : "SEND MESSAGE"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
