import { useEffect, useState } from 'react';
import { ClipboardList, AlertTriangle, Syringe, Pill, HeartHandshake, Activity, BookOpen, Clock, Play, Award, CheckCircle2, Lock, Sparkles, X, Download } from 'lucide-react';
import { trainingModules } from '@/data';
import type { TrainingModule } from '@/types';
import { downloadCertificatePdf, downloadText } from '@/lib/download';


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
  const [modules, setModules] = useState<TrainingModule[]>(trainingModules);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('asha-training-progress');
      if (saved) {
        const progress = JSON.parse(saved) as Record<string, number>;
        setModules(trainingModules.map((module) => ({ ...module, progress: progress[module.id] ?? module.progress })));
      }
    } catch { /* retain the bundled demo progress */ }
  }, []);
  const saveProgress = (next: TrainingModule[]) => {
    setModules(next);
    localStorage.setItem('asha-training-progress', JSON.stringify(Object.fromEntries(next.map((module) => [module.id, module.progress]))));
  };
  const activeModule = modules.find((module) => module.id === activeModuleId) || null;
  const completedCount = modules.filter((m) => m.progress === 100).length;
  const inProgressCount = modules.filter((m) => m.progress > 0 && m.progress < 100).length;
  const notStartedCount = modules.filter((m) => m.progress === 0).length;
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons, 0);
  const completedLessons = modules.reduce((sum, m) => sum + Math.round((m.progress / 100) * m.lessons), 0);

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 relative">
      <FloatingOrb className="w-72 h-72 bg-primary-200/25 -top-16 -right-10" delay={0} />
      <FloatingOrb className="w-64 h-64 bg-sky-200/20 top-60 -left-16" delay={2} />

      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-100">
            <Sparkles className="w-3.5 h-3.5" />
            {trainingModules.length} Modules
          </span>
        </div>
        <h2 className="text-3xl font-display font-extrabold text-slate-900">Training Center</h2>
        <p className="text-slate-500 mt-1">Build your skills with certified ASHA training modules</p>
      </div>

      {/* Progress overview */}
      <div className="relative overflow-hidden rounded-3xl hero-gradient p-6 shadow-xl shadow-primary-600/20">
        <div className="absolute inset-0 gradient-mesh opacity-40" />
        <FloatingOrb className="w-48 h-48 bg-white/10 -top-10 right-10" delay={1} />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-semibold mb-3">
              <Award className="w-3.5 h-3.5" />
              Your Progress
            </span>
            <h3 className="text-2xl font-display font-extrabold text-white">{completedLessons} of {totalLessons} lessons</h3>
            <p className="text-primary-100 mt-1 text-sm">{completedCount} completed - {inProgressCount} in progress - {notStartedCount} not started</p>
            <div className="w-full max-w-md h-2.5 bg-white/15 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-gradient-to-r from-white to-primary-200 rounded-full transition-all duration-700" style={{ width: `${(completedLessons / totalLessons) * 100}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-sm border border-white/30 flex flex-col items-center justify-center">
              <span className="text-2xl font-display font-extrabold text-white">{Math.round((completedLessons / totalLessons) * 100)}%</span>
              <span className="text-[10px] text-white/70 font-semibold uppercase">Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { value: completedCount, label: 'Completed', icon: CheckCircle2, gradient: 'from-success-400 to-success-600' },
          { value: inProgressCount, label: 'In Progress', icon: Play, gradient: 'from-accent-400 to-accent-500' },
          { value: notStartedCount, label: 'Not Started', icon: Lock, gradient: 'from-slate-400 to-slate-500' },
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
          const isLocked = false;

          return (
            <div key={module.id} className="glass-card card-hover p-5 animate-slide-up group" style={{ animationDelay: `${i * 50}ms` }}>
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
                <div className="flex items-center gap-1.5">
                  <span className={`stat-badge ${difficulty.bg} ${difficulty.text}`}>
                    {module.difficulty}
                  </span>
                </div>
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
              </div>

              {isInProgress && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">Progress</span>
                    <span className="text-primary-600 font-bold">{module.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full transition-all duration-700`} style={{ width: `${module.progress}%` }} />
                  </div>
                </div>
              )}

              <button type="button" onClick={() => setActiveModuleId(module.id)} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                isCompleted
                  ? 'bg-success-50 text-success-700 hover:bg-success-100'
                  : isInProgress
                  ? `bg-gradient-to-r ${colors.gradient} text-white shadow-md hover:shadow-lg`
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
                {isCompleted ? (
                  <>
                    <Award className="w-4 h-4" />
                    View Completion Record
                  </>
                ) : isInProgress ? (
                  <>
                    <Play className="w-4 h-4" fill="white" />
                    Continue
                  </>
                ) : isLocked ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Locked
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" fill="currentColor" />
                    Start Course
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
      {activeModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="training-title">
          <button type="button" aria-label="Close training" onClick={() => setActiveModuleId(null)} className="absolute inset-0 bg-slate-900/50" />
          <section className="relative card-elevated max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs uppercase font-bold text-primary-600">{activeModule.category}</p><h3 id="training-title" className="text-xl font-display font-bold mt-1">{activeModule.title}</h3></div>
              <button type="button" aria-label="Close" onClick={() => setActiveModuleId(null)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-slate-600">{activeModule.description}</p>
            {activeModule.progress < 100 ? (
              <>
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm font-semibold">Lesson {Math.min(activeModule.lessons, Math.round(activeModule.progress / 100 * activeModule.lessons) + 1)} of {activeModule.lessons}</p><p className="text-xs text-slate-500 mt-1">Use this demo module to track your training progress. Follow your approved training materials for instruction.</p></div>
                <button type="button" className="btn-primary w-full" onClick={() => {
                  const next = modules.map((module) => module.id === activeModule.id ? { ...module, progress: Math.min(100, Math.round((Math.round(module.progress / 100 * module.lessons) + 1) / module.lessons * 100)) } : module);
                  saveProgress(next);
                  const updated = next.find((module) => module.id === activeModule.id);
                  if (updated?.progress === 100) setActiveModuleId(null);
                }}>Mark lesson complete</button>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-success-700 font-semibold">🎉 All {activeModule.lessons} training lessons completed!</p>
                <button
                  type="button"
                  className="btn-primary w-full shadow-lg shadow-success-500/20"
                  onClick={() => downloadCertificatePdf(activeModule.title)}
                >
                  <Award className="w-4 h-4" /> Download Official Certificate (PDF)
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
