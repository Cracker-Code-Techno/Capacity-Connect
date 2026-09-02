"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, Award } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/global/useToast";

export default function AssessmentPlayerPage({ params }: { params: Promise<{ courseId: string; assessmentId: string }> | { courseId: string; assessmentId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [courseId, setCourseId] = useState<string>("");
  const [assessmentId, setAssessmentId] = useState<string>("");
  
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State for taking the quiz
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> optionId
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setCourseId(resolved.courseId);
      setAssessmentId(resolved.assessmentId);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!assessmentId) return;
    
    const fetchAssessment = async () => {
      try {
        const res = await fetch(`/api/assessments/${assessmentId}`);
        if (res.ok) {
          setAssessment(await res.json());
        } else {
          console.error("Failed to fetch assessment");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessment();
  }, [assessmentId]);

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < assessment.questions.length) {
      showToast("Please answer all questions before submitting.", "error");
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch(`/api/assessments/${assessmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      });
      
      if (res.ok) {
        setResult(await res.json());
      } else {
        showToast("Failed to submit assessment.", "error");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-24 text-center">Loading assessment...</div>;
  }

  if (!assessment) {
    return <div className="min-h-screen pt-24 text-center text-red-500">Assessment not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#030712] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href={`/courses/${courseId}`} className="inline-flex items-center gap-2 text-sm text-[#a855f7] hover:text-purple-400 font-semibold mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Course
        </Link>

        {result ? (
          // RESULTS VIEW
          <div className="glass-panel p-8 md:p-12 rounded-2xl border border-[rgba(255,255,255,0.05)] text-center">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-xl ${result.passed ? 'bg-emerald-500/20 text-emerald-500 shadow-emerald-500/20' : 'bg-red-500/20 text-red-500 shadow-red-500/20'}`}>
              {result.passed ? <Award className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
            </div>
            
            <h1 className="text-4xl font-extrabold text-white mb-2">
              {result.passed ? "Congratulations!" : "Keep Trying!"}
            </h1>
            <p className="text-lg text-gray-400 mb-8">
              You scored <span className="text-white font-bold">{result.score}%</span> on this assessment.
              <br/>({result.correctCount} out of {result.totalQuestions} correct)
            </p>
            
            <div className="flex justify-center gap-4">
              {!result.passed && (
                <button 
                  onClick={() => { setResult(null); setAnswers({}); }}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold tracking-widest transition-all"
                >
                  RETAKE
                </button>
              )}
              <Link 
                href={`/courses/${courseId}`}
                className="px-6 py-3 bg-[#a855f7] hover:bg-purple-600 text-white rounded-lg font-bold tracking-widest transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              >
                RETURN TO COURSE
              </Link>
            </div>
          </div>
        ) : (
          // QUIZ VIEW
          <div className="glass-panel p-8 md:p-12 rounded-2xl border border-[rgba(255,255,255,0.05)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            
            <h1 className="text-3xl font-extrabold text-white mb-2">{assessment.title}</h1>
            <p className="text-gray-400 mb-8 border-b border-white/10 pb-8">
              Answer all questions below. You need 70% to pass.
            </p>

            <div className="space-y-10">
              {assessment.questions.map((q: any, qIndex: number) => (
                <div key={q.id}>
                  <h3 className="text-lg font-bold text-white mb-4">
                    <span className="text-emerald-500 mr-2">{qIndex + 1}.</span> {q.text}
                  </h3>
                  <div className="space-y-3">
                    {q.options.map((opt: any) => {
                      const isSelected = answers[q.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleOptionSelect(q.id, opt.id)}
                          className={`w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all ${
                            isSelected 
                              ? 'bg-emerald-500/10 border-emerald-500/50 text-white' 
                              : 'bg-black/20 border-[rgba(255,255,255,0.05)] text-gray-300 hover:bg-white/5'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-500'
                          }`}>
                            {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm font-medium">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold tracking-widest text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
              >
                {submitting ? "SUBMITTING..." : "SUBMIT ASSESSMENT"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
