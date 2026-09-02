"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Plus, FileText, LayoutList, HelpCircle, CheckCircle, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Reorder } from "framer-motion";
import ModuleCard from "./ModuleCard";
import AssessmentCard from "./AssessmentCard";
import { useToast } from "@/components/global/useToast";
import { SubjectPicker } from "@/components/subjects/SubjectPicker";
import { ResourceUploader } from "@/components/library/ResourceUploader";
import { ResourceList, ResourceItem } from "@/components/library/ResourceList";
import { RESOURCE_TYPES } from "@/lib/validators/resources";

interface ModuleData {
  id?: string;
  title?: string;
  content?: string;
  order?: number;
}

interface AssessmentData {
  id?: string;
  [key: string]: unknown;
}

interface CourseData {
  id?: string;
  title?: string;
  description?: string;
  modules?: ModuleData[];
  assessments?: AssessmentData[];
  _count?: {
    modules?: number;
    assessments?: number;
    enrollments?: number;
  };
}

interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

interface Question {
  text: string;
  options: QuestionOption[];
}

const emptyQuestion = (): Question => ({
  text: "",
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ],
});

export default function CourseManagementPage({
  params,
}: {
  params: Promise<{ courseId: string }> | { courseId: string };
}) {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);


  // Resolve params
  const [courseId, setCourseId] = useState<string>("");

  // Tabs
  const initialTab = searchParams?.get("tab") === "assessments" ? "assessments" : "modules";
  const [activeTab, setActiveTab] = useState<"modules" | "assessments" | "subjects" | "resources">(initialTab);


  // Module State
  const [orderedModules, setOrderedModules] = useState<ModuleData[]>([]);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [moduleData, setModuleData] = useState({ title: "", content: "" });
  const [moduleLoading, setModuleLoading] = useState(false);

  // Assessment State
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [assessmentDueDate, setAssessmentDueDate] = useState("");
  const [assessmentMaxAttempts, setAssessmentMaxAttempts] = useState("3");
  const [assessmentPassingScore, setAssessmentPassingScore] = useState("70");
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [assessmentLoading, setAssessmentLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const resolveParams = async () => {
      const resolved = await params;
      if (!cancelled) setCourseId(resolved.courseId);
    };
    resolveParams();
    return () => {
      cancelled = true;
    };
  }, [params]);

  const loadCourse = useCallback(
    async (signal?: AbortSignal) => {
      if (!courseId) return;
      try {
        const res = await fetch(`/api/courses/${courseId}`, { signal });
        if (res.ok) {
          const data = await res.json();
          const found = data.course;
          if (found && !found.modules) found.modules = [];
          if (found && !found.assessments) found.assessments = [];
          if (found && found.modules) {
            found.modules.sort((a: ModuleData, b: ModuleData) => ((a.order as number) || 0) - ((b.order as number) || 0));
            setOrderedModules(found.modules);
          }
          setCourse(found);
        } else {
          console.error("Failed to fetch course details");
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") console.error(err);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [courseId]
  );

  // Initial load + reload when courseId changes. The AbortController cleanup
  // prevents a stale response from an in-flight request overwriting state
  // after courseId changes again or the component unmounts.
  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional data fetch keyed on courseId; loadCourse guards state updates with the AbortSignal above
    loadCourse(controller.signal);
    return () => controller.abort();
  }, [loadCourse]);

  // Stable no-arg refetch used by handlers (after saving a module/assessment, card refresh, etc.)
  const fetchCourse = useCallback(() => loadCourse(), [loadCourse]);

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setModuleLoading(true);
    try {
      const res = await fetch("/api/trainer/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          title: moduleData.title,
          content: moduleData.content,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setModuleData({ title: "", content: "" });
      setShowModuleForm(false);
      fetchCourse();
    } catch (err: unknown) {
      showToast((err as Error).message || "Failed to add module", "error");
    } finally {
      setModuleLoading(false);
    }
  };

  const handleReorder = async (newOrder: ModuleData[]) => {
    setOrderedModules(newOrder);
    try {
      await fetch(`/api/trainer/courses/${courseId}/modules/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleIds: newOrder.map((m) => m.id) }),
      });
    } catch (error) {
      console.error("Failed to reorder", error);
    }
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const handleAddOption = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: [...q.options, { text: "", isCorrect: false }] } : q
      )
    );
  };

  const handleSetCorrectOption = (qIndex: number, oIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i !== qIndex
          ? q
          : { ...q, options: q.options.map((opt, oi) => ({ ...opt, isCorrect: oi === oIndex })) }
      )
    );
  };

  const handleQuestionTextChange = (qIndex: number, value: string) => {
    setQuestions((prev) => prev.map((q, i) => (i === qIndex ? { ...q, text: value } : q)));
  };

  const handleOptionTextChange = (qIndex: number, oIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i !== qIndex
          ? q
          : {
              ...q,
              options: q.options.map((opt, oi) => (oi === oIndex ? { ...opt, text: value } : opt)),
            }
      )
    );
  };

  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssessmentLoading(true);
    try {
      const res = await fetch("/api/trainer/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          title: assessmentTitle,
          dueDate: assessmentDueDate ? new Date(assessmentDueDate).toISOString() : undefined,
          maxAttempts: Number(assessmentMaxAttempts) || 3,
          passingScore: Number(assessmentPassingScore) || 70,
          questions,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setAssessmentTitle("");
      setAssessmentDueDate("");
      setAssessmentMaxAttempts("3");
      setAssessmentPassingScore("70");
      setQuestions([emptyQuestion()]);
      setShowAssessmentForm(false);
      fetchCourse();
    } catch (err: unknown) {
      showToast((err as Error).message || "Failed to save assessment", "error");
    } finally {
      setAssessmentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center" style={{ color: "var(--text-primary)" }}>
        Loading course...
      </div>
    );
  }

  if (!course) {
    return <div className="p-12 text-center text-red-500">Course not found</div>;
  }

  return (
    <div
      className="flex-grow flex flex-col py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-5xl mx-auto relative z-10">
        <Link
          href="/trainer"
          className="inline-flex items-center gap-2 text-sm text-[#a855f7] hover:text-purple-400 font-semibold mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="glass-panel p-8 rounded-2xl border border-[#a855f7]/20 mb-8">
          <h1 className="text-3xl font-extrabold mb-2" style={{ color: "var(--text-primary)" }}>
            {course.title}
          </h1>
          <p className="text-sm max-w-3xl mb-6" style={{ color: "var(--text-secondary)" }}>
            {course.description}
          </p>

          <div className="flex gap-6 text-sm">
            <span className="font-mono text-[#a855f7] bg-[#a855f7]/10 px-3 py-1 rounded">
              {course.modules?.length || course._count?.modules || 0} MODULES
            </span>
            <span className="font-mono text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded">
              {course.assessments?.length || course._count?.assessments || 0} ASSESSMENTS
            </span>
            <span className="font-mono" style={{ color: "var(--text-muted)" }}>
              {course._count?.enrollments || 0} Trainees Enrolled
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-8 gap-8" style={{ borderColor: "var(--border-light)" }}>
          <button
            onClick={() => setActiveTab("modules")}
            className={`pb-4 text-sm font-bold tracking-widest uppercase transition-colors relative ${
              activeTab === "modules" ? "text-[#a855f7]" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Modules
            {activeTab === "modules" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#a855f7]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("assessments")}
            className={`pb-4 text-sm font-bold tracking-widest uppercase transition-colors relative ${
              activeTab === "assessments" ? "text-[#a855f7]" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Assessments
            {activeTab === "assessments" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#a855f7]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("subjects")}
            className={`pb-4 text-sm font-bold tracking-widest uppercase transition-colors relative ${
              activeTab === "subjects" ? "text-[#a855f7]" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Subjects
            {activeTab === "subjects" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#a855f7]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("resources")}
            className={`pb-4 text-sm font-bold tracking-widest uppercase transition-colors relative ${
              activeTab === "resources" ? "text-[#a855f7]" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Resources
            {activeTab === "resources" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#a855f7]" />
            )}
          </button>
        </div>

        {/* MODULES TAB */}
        {activeTab === "modules" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <LayoutList className="w-5 h-5 text-[#a855f7]" /> Course Modules
              </h2>
              <button
                onClick={() => setShowModuleForm(!showModuleForm)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold tracking-widest transition-all"
              >
                {showModuleForm ? "CANCEL" : (
                  <>
                    <Plus className="w-4 h-4" /> ADD MODULE
                  </>
                )}
              </button>
            </div>

            {showModuleForm && (
              <div className="glass-panel p-6 rounded-xl border border-[#a855f7]/30 mb-8">
                <form onSubmit={handleAddModule} className="space-y-4">
                  <div>
                    <label
                      className="block text-xs font-bold tracking-widest uppercase mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Module Title
                    </label>
                    <input
                      required
                      className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50"
                      style={{
                        background: "var(--card)",
                        border: "1px solid var(--border-light)",
                        color: "var(--text-primary)",
                      }}
                      value={moduleData.title}
                      onChange={(e) => setModuleData({ ...moduleData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-bold tracking-widest uppercase mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Content (Text/Markdown)
                    </label>
                    <textarea
                      required
                      rows={8}
                      className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50 resize-y"
                      style={{
                        background: "var(--card)",
                        border: "1px solid var(--border-light)",
                        color: "var(--text-primary)",
                      }}
                      value={moduleData.content}
                      onChange={(e) => setModuleData({ ...moduleData, content: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={moduleLoading}
                      className="px-6 py-2.5 rounded-lg text-sm font-bold tracking-widest text-white bg-purple-600 hover:bg-purple-700 transition-all disabled:opacity-50"
                    >
                      {moduleLoading ? "SAVING..." : "SAVE MODULE"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <Reorder.Group axis="y" values={orderedModules} onReorder={handleReorder} className="space-y-4">
              {!orderedModules || orderedModules.length === 0 ? (
                <div
                  className="p-8 text-center border border-dashed rounded-xl"
                  style={{ borderColor: "var(--border-light)", color: "var(--text-secondary)" }}
                >
                  <FileText className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p>No modules have been added to this course yet.</p>
                </div>
              ) : (
                orderedModules.map((mod: ModuleData, index: number) => (
                  <Reorder.Item key={mod.id as string} value={mod} className="cursor-grab active:cursor-grabbing">
                    <ModuleCard mod={mod} index={index} onRefresh={fetchCourse} />
                  </Reorder.Item>
                ))
              )}
            </Reorder.Group>
          </div>
        )}

        {/* ASSESSMENTS TAB */}
        {activeTab === "assessments" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <HelpCircle className="w-5 h-5 text-emerald-500" /> Assessments
              </h2>
              <button
                onClick={() => setShowAssessmentForm(!showAssessmentForm)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold tracking-widest transition-all"
              >
                {showAssessmentForm ? "CANCEL" : (
                  <>
                    <Plus className="w-4 h-4" /> CREATE ASSESSMENT
                  </>
                )}
              </button>
            </div>

            {showAssessmentForm && (
              <div className="glass-panel p-6 rounded-xl border border-emerald-500/30 mb-8">
                <form onSubmit={handleSaveAssessment} className="space-y-8">
                  <div>
                    <label
                      className="block text-xs font-bold tracking-widest uppercase mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Assessment Title
                    </label>
                    <input
                      required
                      className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/50"
                      style={{
                        background: "var(--card)",
                        border: "1px solid var(--border-light)",
                        color: "var(--text-primary)",
                      }}
                      placeholder="e.g. Final Quiz"
                      value={assessmentTitle}
                      onChange={(e) => setAssessmentTitle(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                        Due Date (optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={assessmentDueDate}
                        onChange={(e) => setAssessmentDueDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                        style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                        Max Attempts
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={assessmentMaxAttempts}
                        onChange={(e) => setAssessmentMaxAttempts(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                        style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                        Passing Score (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={assessmentPassingScore}
                        onChange={(e) => setAssessmentPassingScore(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                        style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    {questions.map((q, qIndex) => (
                      <div key={qIndex} className="p-4 rounded-xl border border-[rgba(255,255,255,0.05)] bg-black/20">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-sm text-emerald-500 tracking-widest uppercase">
                            Question {qIndex + 1}
                          </h4>
                        </div>
                        <input
                          required
                          placeholder="Enter your question here..."
                          className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 mb-4"
                          style={{
                            background: "var(--card)",
                            border: "1px solid var(--border-light)",
                            color: "var(--text-primary)",
                          }}
                          value={q.text}
                          onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                        />

                        <div className="space-y-2 pl-4 border-l-2 border-[rgba(255,255,255,0.05)]">
                          {q.options.map((opt, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleSetCorrectOption(qIndex, oIndex)}
                                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                  opt.isCorrect ? "bg-emerald-500 border-emerald-500" : "border-gray-500"
                                }`}
                              >
                                {opt.isCorrect && <CheckCircle className="w-3 h-3 text-white" />}
                              </button>
                              <input
                                required
                                placeholder={`Option ${oIndex + 1}`}
                                className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/50"
                                style={{
                                  background: "var(--background)",
                                  border: "1px solid var(--border-light)",
                                  color: "var(--text-primary)",
                                }}
                                value={opt.text}
                                onChange={(e) => handleOptionTextChange(qIndex, oIndex, e.target.value)}
                              />
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleAddOption(qIndex)}
                            className="text-xs text-emerald-500 font-bold mt-2 hover:underline"
                          >
                            + Add Option
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    className="flex items-center justify-between pt-4 border-t"
                    style={{ borderColor: "var(--border-light)" }}
                  >
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="text-sm font-bold text-gray-400 hover:text-white transition-colors"
                    >
                      + ADD ANOTHER QUESTION
                    </button>
                    <button
                      type="submit"
                      disabled={assessmentLoading}
                      className="px-6 py-2.5 rounded-lg text-sm font-bold tracking-widest text-white bg-emerald-600 hover:bg-emerald-700 transition-all disabled:opacity-50"
                    >
                      {assessmentLoading ? "SAVING..." : "SAVE ASSESSMENT"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {!course.assessments || course.assessments.length === 0 ? (
                <div
                  className="p-8 text-center border border-dashed rounded-xl"
                  style={{ borderColor: "var(--border-light)", color: "var(--text-secondary)" }}
                >
                  <HelpCircle className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p>No assessments have been added to this course yet.</p>
                </div>
              ) : (
                course.assessments.map((assessment: AssessmentData, index: number) => (
                  <AssessmentCard key={assessment.id || index} assessment={assessment} onRefresh={fetchCourse} />
                ))
              )}
            </div>
          </div>
        )}

        {/* SUBJECTS TAB */}
        {activeTab === "subjects" && (
          <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
            <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Course Subjects</h2>
            <SubjectPicker
              courseId={courseId}
              initial={course.subjects || []}
              canEdit={true}
            />
          </div>
        )}

        {/* RESOURCES TAB */}
        {activeTab === "resources" && <CourseResourcesSection courseId={courseId} />}
      </div>
    </div>
  );
}

function CourseResourcesSection({ courseId }: { courseId: string }) {
  const { showToast } = useToast();
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("lecture");
  const [pending, setPending] = useState<{ url: string; size: number; mimeType: string; fileName: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/resources`);
      if (res.ok) setItems(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [courseId]);

  const save = async () => {
    if (!pending || !title.trim()) {
      showToast("Upload a file and enter a title", "error");
      return;
    }
    try {
      const res = await fetch(`/api/courses/${courseId}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          type,
          fileUrl: pending.url,
          fileSize: pending.size,
          mimeType: pending.mimeType,
        }),
      });
      if (res.ok) {
        showToast("Resource attached");
        setTitle("");
        setDescription("");
        setPending(null);
        await load();
      } else {
        showToast("Failed to save", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    }
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/courses/${courseId}/resources?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      showToast("Failed to delete", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-[#a855f7]/20">
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          Attach a new resource
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            >
              {RESOURCE_TYPES.map((t) => (
                <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resource title"
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-y"
            style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
          />
          <div className="flex items-center gap-3">
            <ResourceUploader prefix={`course/${courseId}`} onUploaded={(r) => setPending(r)} />
            {pending && (
              <div className="flex items-center gap-2 text-sm flex-grow" style={{ color: "var(--text-secondary)" }}>
                <span className="truncate">{pending.fileName}</span>
                <button onClick={() => setPending(null)} className="text-rose-500 hover:text-rose-400" aria-label="Discard">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={save}
              disabled={!pending || !title.trim()}
              className="px-4 py-2.5 rounded-lg text-sm font-bold tracking-widest text-white bg-emerald-600 hover:bg-emerald-700 transition-all disabled:opacity-50 inline-flex items-center gap-1"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              ATTACH
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>Course resources</h2>
        {loading ? (
          <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>Loading…</p>
        ) : (
          <ResourceList items={items} canDelete onDelete={remove} />
        )}
      </div>
    </div>
  );
}