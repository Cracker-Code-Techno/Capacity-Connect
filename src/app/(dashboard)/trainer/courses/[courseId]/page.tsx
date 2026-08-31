"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, FileText, LayoutList, HelpCircle, CheckCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function CourseManagementPage({ params }: { params: Promise<{ courseId: string }> | { courseId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Resolve params
  const [courseId, setCourseId] = useState<string>("");
  
  // Tabs
  const [activeTab, setActiveTab] = useState<"modules" | "assessments">("modules");

  // Module State
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [moduleData, setModuleData] = useState({ title: "", content: "" });
  const [moduleLoading, setModuleLoading] = useState(false);

  // Assessment State
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [questions, setQuestions] = useState([{ text: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] }]);
  const [assessmentLoading, setAssessmentLoading] = useState(false);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setCourseId(resolved.courseId);
    };
    resolveParams();
  }, [params]);

  const fetchCourse = async () => {
    if (!courseId) return;
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (res.ok) {
        const data = await res.json();
        const found = data.course;
        if (found && !found.modules) found.modules = [];
        if (found && !found.assessments) found.assessments = [];
        setCourse(found);
      } else {
        console.error("Failed to fetch course details");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

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
          content: moduleData.content
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setModuleData({ title: "", content: "" });
      setShowModuleForm(false);
      fetchCourse();
    } catch (err: any) {
      alert(err.message || "Failed to add module");
    } finally {
      setModuleLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] }]);
  };

  const handleAddOption = (qIndex: number) => {
    const newQs = [...questions];
    newQs[qIndex].options.push({ text: "", isCorrect: false });
    setQuestions(newQs);
  };

  const handleSetCorrectOption = (qIndex: number, oIndex: number) => {
    const newQs = [...questions];
    newQs[qIndex].options = newQs[qIndex].options.map((opt, i) => ({
      ...opt,
      isCorrect: i === oIndex
    }));
    setQuestions(newQs);
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
          questions
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setAssessmentTitle("");
      setQuestions([{ text: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] }]);
      setShowAssessmentForm(false);
      fetchCourse();
    } catch (err: any) {
      alert(err.message || "Failed to save assessment");
    } finally {
      setAssessmentLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center" style={{ color: "var(--text-primary)" }}>Loading course...</div>;
  }

  if (!course) {
    return <div className="p-12 text-center text-red-500">Course not found</div>;
  }

  return (
    <div className="flex-grow flex flex-col py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-5xl mx-auto relative z-10">
        
        <Link href="/trainer" className="inline-flex items-center gap-2 text-sm text-[#a855f7] hover:text-purple-400 font-semibold mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="glass-panel p-8 rounded-2xl border border-[#a855f7]/20 mb-8">
          <h1 className="text-3xl font-extrabold mb-2" style={{ color: "var(--text-primary)" }}>{course.title}</h1>
          <p className="text-sm max-w-3xl mb-6" style={{ color: "var(--text-secondary)" }}>{course.description}</p>
          
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
            className={`pb-4 text-sm font-bold tracking-widest uppercase transition-colors relative ${activeTab === 'modules' ? 'text-[#a855f7]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Modules
            {activeTab === 'modules' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#a855f7]" />}
          </button>
          <button 
            onClick={() => setActiveTab("assessments")}
            className={`pb-4 text-sm font-bold tracking-widest uppercase transition-colors relative ${activeTab === 'assessments' ? 'text-[#a855f7]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Assessments
            {activeTab === 'assessments' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#a855f7]" />}
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
                {showModuleForm ? "CANCEL" : <><Plus className="w-4 h-4" /> ADD MODULE</>}
              </button>
            </div>

            {showModuleForm && (
              <div className="glass-panel p-6 rounded-xl border border-[#a855f7]/30 mb-8">
                <form onSubmit={handleAddModule} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>Module Title</label>
                    <input
                      required
                      className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50"
                      style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                      value={moduleData.title}
                      onChange={(e) => setModuleData({ ...moduleData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>Content (Text/Markdown)</label>
                    <textarea
                      required
                      rows={8}
                      className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#a855f7]/50 resize-y"
                      style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                      value={moduleData.content}
                      onChange={(e) => setModuleData({ ...moduleData, content: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={moduleLoading} className="px-6 py-2.5 rounded-lg text-sm font-bold tracking-widest text-white bg-purple-600 hover:bg-purple-700 transition-all disabled:opacity-50">
                      {moduleLoading ? "SAVING..." : "SAVE MODULE"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {(!course.modules || course.modules.length === 0) ? (
                <div className="p-8 text-center border border-dashed rounded-xl" style={{ borderColor: "var(--border-light)", color: "var(--text-secondary)" }}>
                  <FileText className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p>No modules have been added to this course yet.</p>
                </div>
              ) : (
                course.modules.map((mod: any, index: number) => (
                  <div key={mod.id || index} className="glass-card p-5 rounded-xl border border-[rgba(255,255,255,0.05)]">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#a855f7]/10 flex items-center justify-center font-mono text-sm font-bold text-[#a855f7]">
                        {mod.order || (index + 1)}
                      </div>
                      <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>{mod.title}</h3>
                    </div>
                    <div className="pl-12 text-sm opacity-80" style={{ color: "var(--text-secondary)" }}>
                      {mod.content?.substring(0, 150)}{mod.content?.length > 150 ? '...' : ''}
                    </div>
                  </div>
                ))
              )}
            </div>
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
                {showAssessmentForm ? "CANCEL" : <><Plus className="w-4 h-4" /> CREATE ASSESSMENT</>}
              </button>
            </div>

            {showAssessmentForm && (
              <div className="glass-panel p-6 rounded-xl border border-emerald-500/30 mb-8">
                <form onSubmit={handleSaveAssessment} className="space-y-8">
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>Assessment Title</label>
                    <input
                      required
                      className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/50"
                      style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                      placeholder="e.g. Final Quiz"
                      value={assessmentTitle}
                      onChange={(e) => setAssessmentTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-6">
                    {questions.map((q, qIndex) => (
                      <div key={qIndex} className="p-4 rounded-xl border border-[rgba(255,255,255,0.05)] bg-black/20">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-sm text-emerald-500 tracking-widest uppercase">Question {qIndex + 1}</h4>
                        </div>
                        <input
                          required
                          placeholder="Enter your question here..."
                          className="w-full px-4 py-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 mb-4"
                          style={{ background: "var(--card)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                          value={q.text}
                          onChange={(e) => {
                            const newQs = [...questions];
                            newQs[qIndex].text = e.target.value;
                            setQuestions(newQs);
                          }}
                        />
                        
                        <div className="space-y-2 pl-4 border-l-2 border-[rgba(255,255,255,0.05)]">
                          {q.options.map((opt, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleSetCorrectOption(qIndex, oIndex)}
                                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${opt.isCorrect ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500'}`}
                              >
                                {opt.isCorrect && <CheckCircle className="w-3 h-3 text-white" />}
                              </button>
                              <input
                                required
                                placeholder={`Option ${oIndex + 1}`}
                                className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/50"
                                style={{ background: "var(--background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                                value={opt.text}
                                onChange={(e) => {
                                  const newQs = [...questions];
                                  newQs[qIndex].options[oIndex].text = e.target.value;
                                  setQuestions(newQs);
                                }}
                              />
                            </div>
                          ))}
                          <button type="button" onClick={() => handleAddOption(qIndex)} className="text-xs text-emerald-500 font-bold mt-2 hover:underline">
                            + Add Option
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "var(--border-light)" }}>
                    <button type="button" onClick={handleAddQuestion} className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
                      + ADD ANOTHER QUESTION
                    </button>
                    <button type="submit" disabled={assessmentLoading} className="px-6 py-2.5 rounded-lg text-sm font-bold tracking-widest text-white bg-emerald-600 hover:bg-emerald-700 transition-all disabled:opacity-50">
                      {assessmentLoading ? "SAVING..." : "SAVE ASSESSMENT"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {(!course.assessments || course.assessments.length === 0) ? (
                <div className="p-8 text-center border border-dashed rounded-xl" style={{ borderColor: "var(--border-light)", color: "var(--text-secondary)" }}>
                  <HelpCircle className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p>No assessments have been added to this course yet.</p>
                </div>
              ) : (
                course.assessments.map((assessment: any) => (
                  <div key={assessment.id} className="glass-card p-5 rounded-xl border border-[rgba(255,255,255,0.05)]">
                    <h3 className="font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>{assessment.title}</h3>
                    <p className="text-xs font-mono text-emerald-500">{assessment.questions?.length || 0} Questions</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
