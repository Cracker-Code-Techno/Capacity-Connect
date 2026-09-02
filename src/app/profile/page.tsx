"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Save, Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/components/global/useToast";

interface Qualification {
  title: string;
  institution: string;
  year: number;
}

interface Experience {
  company: string;
  role: string;
  start: string;
  end: string;
  description: string;
}

interface Certificate {
  name: string;
  issuer: string;
  year: number;
  fileUrl?: string;
}

interface SocialLinks {
  linkedin?: string;
  github?: string;
  site?: string;
}

type Tab = "personal" | "qualifications" | "experience" | "certificates" | "skills";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>("personal");

  const [bio, setBio] = useState("");
  const [headline, setHeadline] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [yearsExperience, setYearsExperience] = useState<string>("");
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status !== "authenticated") return;
    const load = async () => {
      try {
        const res = await fetch("/api/profile/me");
        if (res.ok) {
          const data = await res.json();
          setRole(data.role);
          const p = data.profile;
          if (p) {
            setBio(p.bio || "");
            setHeadline(p.headline || "");
            if (data.role === "TRAINEE") {
              setInterests(p.interests || []);
              setSkills(p.skills || []);
              setQualifications(p.qualifications || []);
              setExperience(p.experience || []);
              setCertificates(p.certificates || []);
            } else {
              setYearsExperience(p.yearsExperience != null ? String(p.yearsExperience) : "");
              setHourlyRate(p.hourlyRate != null ? String(p.hourlyRate) : "");
              setSocialLinks(p.socialLinks || {});
            }
          } else {
            setRole((session?.user as { role?: string })?.role || "");
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [status, session, router]);

  const save = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { bio, headline };
      if (role === "TRAINEE") {
        payload.interests = interests;
        payload.skills = skills;
        payload.qualifications = qualifications;
        payload.experience = experience;
        payload.certificates = certificates;
      } else if (role === "TRAINER") {
        payload.yearsExperience = yearsExperience ? Number(yearsExperience) : null;
        payload.hourlyRate = hourlyRate ? Number(hourlyRate) : null;
        payload.socialLinks = socialLinks;
      }

      const res = await fetch("/api/profile/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast("Profile saved");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data?.error?.formErrors?.[0] || "Failed to save profile", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error while saving", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 text-center" style={{ color: "var(--text-primary)" }}>
        Loading...
      </div>
    );
  }

  const tabs: { key: Tab; label: string; roles: string[] }[] = role === "TRAINER"
    ? [{ key: "personal", label: "Personal", roles: ["TRAINER", "TRAINEE", "ADMIN"] }]
    : [
        { key: "personal", label: "Personal", roles: ["TRAINER", "TRAINEE", "ADMIN"] },
        { key: "qualifications", label: "Qualifications", roles: ["TRAINEE"] },
        { key: "experience", label: "Experience", roles: ["TRAINEE"] },
        { key: "certificates", label: "Certificates", roles: ["TRAINEE"] },
        { key: "skills", label: "Skills & Interests", roles: ["TRAINEE"] },
      ];

  return (
    <div
      className="flex-grow flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-4xl relative z-10">
        <div className="mb-8">
          <p className="text-xs font-bold tracking-widest font-mono mb-1 text-[#a855f7]">
            PROFILE / {role}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Your Profile
          </h1>
        </div>

        <div className="flex border-b mb-8 gap-6" style={{ borderColor: "var(--border-light)" }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 text-sm font-bold tracking-widest uppercase transition-colors relative ${
                tab === t.key ? "text-[#a855f7]" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {t.label}
              {tab === t.key && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#a855f7]" />
              )}
            </button>
          ))}
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[rgba(255,255,255,0.05)]">
          {tab === "personal" && (
            <div className="space-y-5">
              <Field label="Headline">
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className={inputCls}
                />
              </Field>
              <Field label="Bio">
                <textarea
                  rows={6}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others about yourself..."
                  className={textareaCls}
                />
              </Field>
              {role === "TRAINER" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Years of Experience">
                      <input
                        type="number"
                        min={0}
                        max={80}
                        value={yearsExperience}
                        onChange={(e) => setYearsExperience(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Hourly Rate (USD)">
                      <input
                        type="number"
                        min={0}
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <Field label="Social Links">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="url"
                        placeholder="LinkedIn URL"
                        value={socialLinks.linkedin || ""}
                        onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                        className={inputCls}
                      />
                      <input
                        type="url"
                        placeholder="GitHub URL"
                        value={socialLinks.github || ""}
                        onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                        className={inputCls}
                      />
                      <input
                        type="url"
                        placeholder="Personal site"
                        value={socialLinks.site || ""}
                        onChange={(e) => setSocialLinks({ ...socialLinks, site: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                  </Field>
                </>
              )}
            </div>
          )}

          {tab === "qualifications" && (
            <RepeatList
              items={qualifications}
              emptyText="Add your educational qualifications"
              addLabel="Add Qualification"
              renderItem={(q, i) => (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Title (e.g. BSc Computer Science)"
                    value={q.title}
                    onChange={(e) => updateItem(setQualifications, i, { ...q, title: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    type="text"
                    placeholder="Institution"
                    value={q.institution}
                    onChange={(e) => updateItem(setQualifications, i, { ...q, institution: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    type="number"
                    min={1900}
                    max={2100}
                    placeholder="Year"
                    value={q.year || ""}
                    onChange={(e) => updateItem(setQualifications, i, { ...q, year: Number(e.target.value) })}
                    className={inputCls}
                  />
                </div>
              )}
              onAdd={() =>
                setQualifications([...qualifications, { title: "", institution: "", year: new Date().getFullYear() }])
              }
              onRemove={(i) => removeItem(setQualifications, i)}
            />
          )}

          {tab === "experience" && (
            <RepeatList
              items={experience}
              emptyText="Add your work experience"
              addLabel="Add Experience"
              renderItem={(x, i) => (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Company"
                      value={x.company}
                      onChange={(e) => updateItem(setExperience, i, { ...x, company: e.target.value })}
                      className={inputCls}
                    />
                    <input
                      type="text"
                      placeholder="Role"
                      value={x.role}
                      onChange={(e) => updateItem(setExperience, i, { ...x, role: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Start (e.g. Jan 2022)"
                      value={x.start}
                      onChange={(e) => updateItem(setExperience, i, { ...x, start: e.target.value })}
                      className={inputCls}
                    />
                    <input
                      type="text"
                      placeholder="End (or Present)"
                      value={x.end}
                      onChange={(e) => updateItem(setExperience, i, { ...x, end: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Description"
                    value={x.description || ""}
                    onChange={(e) => updateItem(setExperience, i, { ...x, description: e.target.value })}
                    className={textareaCls}
                  />
                </div>
              )}
              onAdd={() =>
                setExperience([
                  ...experience,
                  { company: "", role: "", start: "", end: "", description: "" },
                ])
              }
              onRemove={(i) => removeItem(setExperience, i)}
            />
          )}

          {tab === "certificates" && (
            <RepeatList
              items={certificates}
              emptyText="Add your certificates"
              addLabel="Add Certificate"
              renderItem={(c, i) => (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={c.name}
                    onChange={(e) => updateItem(setCertificates, i, { ...c, name: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    type="text"
                    placeholder="Issuer"
                    value={c.issuer}
                    onChange={(e) => updateItem(setCertificates, i, { ...c, issuer: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    type="number"
                    min={1900}
                    max={2100}
                    placeholder="Year"
                    value={c.year || ""}
                    onChange={(e) => updateItem(setCertificates, i, { ...c, year: Number(e.target.value) })}
                    className={inputCls}
                  />
                </div>
              )}
              onAdd={() =>
                setCertificates([...certificates, { name: "", issuer: "", year: new Date().getFullYear() }])
              }
              onRemove={(i) => removeItem(setCertificates, i)}
            />
          )}

          {tab === "skills" && (
            <div className="space-y-5">
              <TagField label="Skills" values={skills} setValues={setSkills} placeholder="Add a skill and press Enter" />
              <TagField label="Interests" values={interests} setValues={setInterests} placeholder="Add an interest" />
            </div>
          )}

          <div className="flex justify-end pt-6 mt-6 border-t" style={{ borderColor: "var(--border-light)" }}>
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold tracking-widest text-white bg-purple-600 hover:bg-purple-700 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "SAVING..." : "SAVE PROFILE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50";
const textareaCls =
  "w-full px-4 py-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50 resize-y";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="block text-xs font-bold tracking-widest uppercase mb-2"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function RepeatList<T>({
  items,
  emptyText,
  addLabel,
  renderItem,
  onAdd,
  onRemove,
}: {
  items: T[];
  emptyText: string;
  addLabel: string;
  renderItem: (item: T, index: number) => React.ReactNode;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>
          {emptyText}
        </p>
      )}
      {items.map((item, i) => (
        <div key={i} className="p-4 rounded-xl border border-[rgba(255,255,255,0.05)] bg-black/20 relative">
          {renderItem(item, i)}
          <button
            onClick={() => onRemove(i)}
            className="absolute top-2 right-2 p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg"
            aria-label="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#a855f7] hover:text-purple-400"
      >
        <Plus className="w-4 h-4" /> {addLabel}
      </button>
    </div>
  );
}

function updateItem<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, i: number, next: T) {
  setter((prev) => prev.map((it, idx) => (idx === i ? next : it)));
}
function removeItem<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, i: number) {
  setter((prev) => prev.filter((_, idx) => idx !== i));
}

function TagField({
  label,
  values,
  setValues,
  placeholder,
}: {
  label: string;
  values: string[];
  setValues: (v: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");
  return (
    <Field label={label}>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/30 text-sm text-[#a855f7]"
          >
            {v}
            <button
              onClick={() => setValues(values.filter((_, idx) => idx !== i))}
              className="hover:text-rose-400"
              aria-label="Remove"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && input.trim()) {
            e.preventDefault();
            setValues([...values, input.trim()]);
            setInput("");
          }
        }}
        placeholder={placeholder}
        className={inputCls}
      />
    </Field>
  );
}