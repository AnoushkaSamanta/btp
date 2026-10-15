import { useState, useEffect } from 'react';
import {
  ClipboardList,
  AlertTriangle,
  Syringe,
  Pill,
  HeartHandshake,
  Activity,
  BookOpen,
  Clock,
  Play,
  Award,
  CheckCircle2,
  Lock,
  X,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  ExternalLink,
  HelpCircle,
  ShieldCheck,
  Video,
  FileText
} from 'lucide-react';
import { trainingModules as seedModules } from '@/data';
import type { TrainingModule, TrainingLesson, QuizQuestion } from '@/types';
import {
  fetchTrainingModules,
  fetchTrainingLessons,
  completeTrainingLesson,
  submitModuleQuiz,
} from '@/lib/api';
import { downloadCertificatePdf } from '@/lib/download';
import { getPreferences } from '@/lib/preferences';
import { LessonViewer } from './Training/LessonViewer';

function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

const iconMap: Record<string, typeof BookOpen> = {
  ClipboardList,
  AlertTriangle,
  Syringe,
  Pill,
  HeartHandshake,
  Activity,
};

const colorMap: Record<string, { bg: string; text: string; gradient: string; ring: string }> = {
  primary: { bg: 'bg-primary-50', text: 'text-primary-600', gradient: 'from-primary-400 to-primary-600', ring: 'ring-primary-100/50' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-600', gradient: 'from-sky-400 to-sky-600', ring: 'ring-sky-100/50' },
  accent: { bg: 'bg-accent-50', text: 'text-accent-600', gradient: 'from-accent-400 to-accent-500', ring: 'ring-accent-100/50' },
  success: { bg: 'bg-success-50', text: 'text-success-600', gradient: 'from-success-400 to-success-600', ring: 'ring-success-100/50' },
};

const difficultyConfig: Record<TrainingModule['difficulty'], { bg: string; text: string }> = {
  Beginner: { bg: 'bg-success-50', text: 'text-success-700' },
  Intermediate: { bg: 'bg-accent-50', text: 'text-accent-700' },
  Advanced: { bg: 'bg-error-50', text: 'text-error-700' },
};

export function Training() {
  const [modules, setModules] = useState<TrainingModule[]>(seedModules);
  const [activeModule, setActiveModule] = useState<TrainingModule | null>(null);
  const [lessons, setLessons] = useState<TrainingLesson[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<{ passed: boolean; score: number; certificate?: any } | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Load modules with server persistence
  const loadModules = async () => {
    try {
      const data = await fetchTrainingModules();
      if (Array.isArray(data) && data.length > 0) {
        setModules(data);
        return;
      }
    } catch {
      // retain seed modules with local fallback
    }
    try {
      const saved = localStorage.getItem('asha-training-progress');
      if (saved) {
        const progress = JSON.parse(saved) as Record<string, number>;
        setModules(seedModules.map((m) => ({ ...m, progress: progress[m.id] ?? m.progress })));
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  const openModule = async (module: TrainingModule) => {
    setActiveModule(module);
    setIsLoadingLessons(true);
    setShowQuiz(false);
    setQuizResult(null);
    setQuizAnswers({});

    try {
      const lessonData = await fetchTrainingLessons(module.id);
      if (Array.isArray(lessonData) && lessonData.length > 0) {
        setLessons(lessonData);
        // Find next incomplete lesson
        const completed = new Set(module.completedLessons || []);
        const nextIncompleteIdx = lessonData.findIndex((l) => !completed.has(l.id));
        setCurrentLessonIndex(nextIncompleteIdx !== -1 ? nextIncompleteIdx : 0);
      } else {
        setLessons([]);
      }
    } catch (err) {
      console.error('Failed to load lessons', err);
    } finally {
      setIsLoadingLessons(false);
    }
  };

  const closeModule = () => {
    setActiveModule(null);
    setLessons([]);
    setShowQuiz(false);
    setQuizResult(null);
    setQuizAnswers({});
    loadModules();
  };

  const currentLesson = lessons[currentLessonIndex] || null;

  const markCurrentLessonComplete = async () => {
    if (!activeModule || !currentLesson) return;
    try {
      const res = await completeTrainingLesson(activeModule.id, currentLesson.id);
      if (res && res.progress !== undefined) {
        // Update local state
        setModules((prev) =>
          prev.map((m) =>
            m.id === activeModule.id
              ? {
                  ...m,
                  progress: res.progress,
                  completedLessons: res.completedLessons,
                }
              : m
          )
        );
        setActiveModule((prev) =>
          prev
            ? {
                ...prev,
                progress: res.progress,
                completedLessons: res.completedLessons,
              }
            : null
        );
      }
    } catch (err) {
      console.error('Failed to save completion to server', err);
      // Fallback local save
      const nextProgress = Math.min(100, Math.round(((currentLessonIndex + 1) / lessons.length) * 100));
      setModules((prev) =>
        prev.map((m) => (m.id === activeModule.id ? { ...m, progress: nextProgress } : m))
      );
    }

    // Advance to next lesson or prompt quiz
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex((prev) => prev + 1);
    } else {
      setShowQuiz(true);
    }
  };

  // Compile full module quiz questions from all lessons
  const allModuleQuizQuestions: QuizQuestion[] = lessons.flatMap((l) => l.quiz || []).slice(0, 5);

  const handleSelectQuizAnswer = (questionIdx: number, optionIdx: number) => {
    setQuizAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleQuizSubmit = async () => {
    if (!activeModule || allModuleQuizQuestions.length === 0) return;
    setIsSubmittingQuiz(true);

    let correctCount = 0;
    allModuleQuizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answer) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / allModuleQuizQuestions.length) * 100);

    try {
      const res = await submitModuleQuiz(activeModule.id, {
        answers: Object.fromEntries(Object.entries(quizAnswers).map(([k, v]) => [k, v])),
        score: correctCount,
        total: allModuleQuizQuestions.length,
      });

      setQuizResult(res);

      if (res.passed) {
        setModules((prev) =>
          prev.map((m) =>
            m.id === activeModule.id
              ? { ...m, progress: 100, quizPassed: true, quizScore: scorePct }
              : m
          )
        );
      }
    } catch (err) {
      console.error('Quiz submit failed', err);
      const passed = scorePct >= 70;
      setQuizResult({
        passed,
        score: scorePct,
      });
      if (passed) {
        setModules((prev) =>
          prev.map((m) => (m.id === activeModule.id ? { ...m, progress: 100 } : m))
        );
      }
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const completedCount = modules.filter((m) => m.progress === 100).length;
  const inProgressCount = modules.filter((m) => m.progress > 0 && m.progress < 100).length;
  const notStartedCount = modules.filter((m) => m.progress === 0).length;
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons, 0);
  const completedLessons = modules.reduce(
    (sum, m) => sum + Math.round((m.progress / 100) * m.lessons),
    0
  );

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 relative">
      <FloatingOrb className="w-72 h-72 bg-primary-200/25 -top-16 -right-10" delay={0} />
      <FloatingOrb className="w-64 h-64 bg-accent-200/20 top-40 -left-16" delay={2} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Official NHM Clinical Curriculum
            </span>
          </div>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 dark:text-slate-100">
            Frontline Healthcare Worker Training
          </h2>
          <p className="text-slate-500 mt-1">
            Official government training modules with embedded instructional videos, clinical protocols, and competency certification.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-700">
            {completedLessons} of {totalLessons} lessons completed
          </p>
          <p className="text-xs text-slate-400">
            {Math.round((completedLessons / Math.max(totalLessons, 1)) * 100)}% Overall Completion
          </p>
        </div>
      </div>

      <div className="card p-4">
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-600 to-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${(completedLessons / Math.max(totalLessons, 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { value: completedCount, label: 'Completed & Certified', icon: CheckCircle2, gradient: 'from-success-400 to-success-600' },
          { value: inProgressCount, label: 'In Progress', icon: Play, gradient: 'from-accent-400 to-accent-500' },
          { value: notStartedCount, label: 'Pending Start', icon: Lock, gradient: 'from-slate-400 to-slate-500' },
        ].map((stat, i) => (
          <div key={i} className="glass-card card-hover p-5 animate-slide-up group" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-display font-extrabold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module, i) => {
          const Icon = iconMap[module.icon] || BookOpen;
          const colors = colorMap[module.color] || colorMap.primary;
          const difficulty = difficultyConfig[module.difficulty];
          const isCompleted = module.progress === 100;
          const isInProgress = module.progress > 0 && module.progress < 100;

          return (
            <div key={module.id} className="glass-card card-hover p-5 animate-slide-up flex flex-col justify-between group" style={{ animationDelay: `${i * 50}ms` }}>
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`relative w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center ring-4 ${colors.ring} group-hover:scale-110 transition-transform`}>
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <Icon className={`w-6 h-6 ${colors.text} relative`} />
                    {isCompleted && (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success-500 border-2 border-white flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </span>
                    )}
                  </div>
                  <span className={`stat-badge ${difficulty.bg} ${difficulty.text}`}>
                    {module.difficulty}
                  </span>
                </div>

                <h3 className="font-display font-bold text-slate-900 mb-1 group-hover:text-primary-700 transition-colors">
                  {module.title}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mb-2">{module.category}</p>
                <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
                  {module.description}
                </p>

                <div className="flex items-center gap-4 mb-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {module.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {module.lessons} lessons
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <Video className="w-3.5 h-3.5" />
                    Gov Videos
                  </span>
                </div>

                {isInProgress && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">Curriculum Progress</span>
                      <span className="text-primary-600 font-bold">{module.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full transition-all duration-700`} style={{ width: `${module.progress}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => openModule(module)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                    isCompleted
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                      : isInProgress
                      ? `bg-gradient-to-r ${colors.gradient} text-white shadow-md hover:shadow-lg`
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <Award className="w-4 h-4 text-emerald-700" />
                      View Certificate & Lessons
                    </>
                  ) : isInProgress ? (
                    <>
                      <Play className="w-4 h-4" fill="white" />
                      Continue Training
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" fill="currentColor" />
                      Start Module
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FULL LESSON & QUIZ VIEWER MODAL */}
      {activeModule && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative card-elevated max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="stat-badge bg-primary-50 text-primary-700 font-semibold">
                    {activeModule.category}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    🏛 NHM / MoHFW Training Portal
                  </span>
                </div>
                <h3 className="text-2xl font-display font-extrabold text-slate-900 mt-1">
                  {activeModule.title}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close training"
                onClick={closeModule}
                className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingLessons ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-500">Loading official curriculum & video materials...</p>
              </div>
            ) : showQuiz ? (
              /* QUIZ VIEW */
              <div className="space-y-6 animate-fade-in">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm">Competency Assessment Quiz</h4>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Answer all questions based on the official guidelines learned. Score 70% or higher to earn your verified NHM certificate of completion.
                    </p>
                  </div>
                </div>

                {allModuleQuizQuestions.length > 0 ? (
                  <div className="space-y-6">
                    {allModuleQuizQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                        <p className="text-sm font-bold text-slate-900">
                          {qIdx + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = quizAnswers[qIdx] === optIdx;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectQuizAnswer(qIdx, optIdx)}
                                className={`w-full text-left p-3 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-between border ${
                                  isSelected
                                    ? 'bg-primary-50 border-primary-500 text-primary-900 shadow-sm'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/70'
                                }`}
                              >
                                <span>{opt}</span>
                                <div
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    isSelected ? 'border-primary-600 bg-primary-600' : 'border-slate-300'
                                  }`}
                                >
                                  {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* Quiz Result Display */}
                    {quizResult && (
                      <div
                        className={`p-5 rounded-2xl border ${
                          quizResult.passed
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-rose-50 border-rose-300 text-rose-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {quizResult.passed ? (
                              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                            ) : (
                              <AlertTriangle className="w-6 h-6 text-rose-600" />
                            )}
                            <div>
                              <h5 className="font-bold text-base">
                                {quizResult.passed
                                  ? 'Congratulations! Assessment Passed'
                                  : 'Passing Score Not Met'}
                              </h5>
                              <p className="text-xs">
                                Your Score: <strong>{quizResult.score}%</strong> (Minimum Required: 70%)
                              </p>
                            </div>
                          </div>
                          {quizResult.passed ? (
                            <button
                              type="button"
                              onClick={() =>
                                downloadCertificatePdf(
                                  activeModule.title,
                                  getPreferences().workerName,
                                  quizResult.score,
                                  quizResult.certificate?.certificateNumber
                                )
                              }
                              className="btn-primary flex items-center gap-2 shadow-md"
                            >
                              <Award className="w-4 h-4" /> Download Official Certificate (PDF)
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setQuizResult(null);
                                setQuizAnswers({});
                              }}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1.5"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowQuiz(false)}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 flex items-center gap-1.5"
                      >
                        <ChevronLeft className="w-4 h-4" /> Back to Lessons
                      </button>

                      {!quizResult?.passed && (
                        <button
                          type="button"
                          disabled={
                            Object.keys(quizAnswers).length < allModuleQuizQuestions.length || isSubmittingQuiz
                          }
                          onClick={handleQuizSubmit}
                          className="btn-primary flex items-center gap-2"
                        >
                          {isSubmittingQuiz ? 'Submitting...' : 'Submit Assessment'}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No quiz questions available for this module.</p>
                )}
              </div>
            ) : currentLesson ? (
              <LessonViewer
                module={activeModule}
                lessons={lessons}
                currentLessonIndex={currentLessonIndex}
                onSelectLessonIndex={setCurrentLessonIndex}
                onMarkComplete={markCurrentLessonComplete}
                onTakeQuiz={() => setShowQuiz(true)}
                onDownloadCertificate={
                  activeModule.progress === 100
                    ? () =>
                        downloadCertificatePdf(
                          activeModule.title,
                          getPreferences().workerName,
                          activeModule.quizScore || 100
                        )
                    : undefined
                }
                workerName={getPreferences().workerName}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
