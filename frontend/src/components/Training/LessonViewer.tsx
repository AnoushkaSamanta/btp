import React, { useState } from 'react';
import {
  Video,
  FileText,
  FileCheck2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ClipboardList,
  AlertCircle,
  HelpCircle,
  Award,
  CheckCircle2,
  Download,
  Info
} from 'lucide-react';
import type { TrainingLesson, TrainingModule } from '@/types';

interface LessonViewerProps {
  module: TrainingModule;
  lessons: TrainingLesson[];
  currentLessonIndex: number;
  onSelectLessonIndex: (index: number) => void;
  onMarkComplete: () => void;
  onTakeQuiz: () => void;
  onDownloadCertificate?: () => void;
  workerName: string;
}

// Module-specific infographic themes and PDF documents from official NHM / MoHFW repositories
const MODULE_INFOGRAPHICS: Record<
  string,
  {
    bannerTitle: string;
    pdfName: string;
    pdfUrl: string;
    themeGradient: string;
    steps: { step: string; desc: string }[];
  }
> = {
  t1: {
    bannerTitle: 'Official NHM ANC Protocol Infographic',
    pdfName: 'RMNCH+A Operational Guidelines (Maternal Health).pdf',
    pdfUrl: '/api/protocols/r1/pdf',
    themeGradient: 'from-blue-600 via-indigo-600 to-sky-700',
    steps: [
      { step: '1st Visit (<12 wks)', desc: 'Early registration, MCP card, blood grouping, baseline BP, IFA/Folic acid.' },
      { step: '2nd Visit (14-26 wks)', desc: 'Abdominal exam, Td dose 1, ultrasound dating, urine sugar & protein.' },
      { step: '3rd Visit (28-34 wks)', desc: 'Td dose 2, fundal height tracking, fetal heart sounds, severe pallor check.' },
      { step: '4th Visit (36 wks-Term)', desc: 'Fetal presentation, birth preparedness, complication readiness plan.' },
    ],
  },
  t2: {
    bannerTitle: 'NHM Obstetric Danger Signs & Triage Matrix',
    pdfName: 'National Guidelines for PMSMA & Obstetric Triage.pdf',
    pdfUrl: '/api/protocols/r2/pdf',
    themeGradient: 'from-rose-600 via-red-600 to-amber-700',
    steps: [
      { step: 'Severe Headache / Blurred Vision', desc: 'Pre-eclampsia danger sign. Measure BP immediately; if ≥140/90, urgent PHC referral.' },
      { step: 'Vaginal Bleeding', desc: 'Antepartum/Postpartum hemorrhage. Arrange 108 emergency vehicle, notify Medical Officer.' },
      { step: 'Convulsions / Loss of Consciousness', desc: 'Eclampsia protocol. Clear airway, place on left lateral side, fast-track to FRU.' },
      { step: 'High Maternal Fever', desc: 'Puerperal sepsis indicator. Immediate clinical escort to hospital.' },
    ],
  },
  t3: {
    bannerTitle: 'Universal Immunization Programme (UIP) National Chart',
    pdfName: 'MoHFW National Immunization Handbook.pdf',
    pdfUrl: '/api/protocols/r3/pdf',
    themeGradient: 'from-teal-600 via-emerald-600 to-cyan-700',
    steps: [
      { step: 'Birth Doses', desc: 'BCG (0.05 ml intradermal left arm), OPV-0 (2 drops), Hepatitis B birth dose (<24 hrs).' },
      { step: '6, 10 & 14 Weeks', desc: 'Pentavalent 1/2/3, OPV 1/2/3, Rotavirus 1/2/3, and fractional IPV (fIPV).' },
      { step: '9 Completed Months', desc: 'MR Dose 1 (0.5 ml right upper arm subcutaneous) + Vitamin A (1 ml / 1 lakh IU).' },
      { step: 'Cold Chain Standards', desc: 'Maintain vaccines between +2°C to +8°C in ILR / conditioned ice pack vaccine carriers.' },
    ],
  },
  t4: {
    bannerTitle: 'Anemia Mukt Bharat (AMB) 6x6x6 Clinical Matrix',
    pdfName: 'Anemia Mukt Bharat National Guidelines & Toolkit.pdf',
    pdfUrl: '/api/protocols/r5/pdf',
    themeGradient: 'from-amber-600 via-orange-600 to-rose-700',
    steps: [
      { step: 'Prophylaxis Schedule', desc: '1 Red IFA tablet daily (60mg iron + 500mcg folic acid) starting at 14 weeks for 180 days.' },
      { step: 'Severe Anemia (Hb < 7 g/dL)', desc: 'Immediate red-flag referral to District Hospital / FRU for parenteral iron or blood.' },
      { step: 'Deworming Protocol', desc: 'Albendazole 400 mg single dose administered in 2nd trimester after 14 weeks.' },
      { step: 'Clinical Grading of Pallor', desc: 'Inspect lower conjunctiva, nail beds, tongue, and palmar creases at each ANC visit.' },
    ],
  },
  t5: {
    bannerTitle: 'Home-Based Newborn Care (HBNC) & PNC Visits Flowchart',
    pdfName: 'Operational Guidelines for Home Based Newborn Care.pdf',
    pdfUrl: '/api/protocols/r6/pdf',
    themeGradient: 'from-emerald-600 via-teal-600 to-sky-700',
    steps: [
      { step: 'Visit Timelines', desc: 'Days 1, 3, 7, 14, 21, 28, 42 for home births; Days 3, 7, 14, 21, 28, 42 for institutional.' },
      { step: 'Thermal Care', desc: 'Delay bathing for 7 days; promote Kangaroo Mother Care (KMC) for low birth weight (<2.5 kg).' },
      { step: 'Exclusive Breastfeeding', desc: 'Early initiation within 1 hour; no pre-lacteal feeds; assess latch and suckling.' },
      { step: 'Maternal Assessment', desc: 'Check lochia odor and quantity, uterine involution, perineal healing, and maternal mood.' },
    ],
  },
  t6: {
    bannerTitle: 'High-Risk Pregnancy (HRP) Stratification & Escort Protocol',
    pdfName: 'Standard Treatment Guidelines - High Risk Pregnancy.pdf',
    pdfUrl: '/api/protocols/r2/pdf',
    themeGradient: 'from-purple-600 via-indigo-600 to-rose-700',
    steps: [
      { step: 'PMSMA 9th of Month', desc: 'Escort all 2nd & 3rd trimester women for specialist obstetrician screening.' },
      { step: 'Gestational Diabetes', desc: 'Single-step 75g Oral Glucose Tolerance Test (OGTT); 2-hr plasma glucose ≥140 mg/dL is positive.' },
      { step: 'Previous Cesarean / Multi-parity', desc: 'Flag for mandatory institutional delivery at Comprehensive EmOC center.' },
      { step: '108 Ambulance Linkage', desc: 'Pre-book dedicated emergency ambulance transport before estimated delivery date.' },
    ],
  },
};

export const LessonViewer: React.FC<LessonViewerProps> = ({
  module,
  lessons,
  currentLessonIndex,
  onSelectLessonIndex,
  onMarkComplete,
  onTakeQuiz,
  onDownloadCertificate,
  workerName,
}) => {
  const [viewMode, setViewMode] = useState<'video' | 'infographic'>('video');
  const [videoError, setVideoError] = useState(false);

  const currentLesson = lessons[currentLessonIndex] || lessons[0];
  if (!currentLesson) return null;

  const info = MODULE_INFOGRAPHICS[module.id] || MODULE_INFOGRAPHICS.t1;
  const videoSrc = currentLesson.videoUrl || 'https://www.youtube.com/embed/qETtJY-vDzs';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Lesson Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-mono text-xs font-bold text-primary-700 dark:text-primary-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
            Lesson {currentLessonIndex + 1} of {lessons.length}
          </span>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
            {currentLesson.title}
          </h4>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {/* Toggle between Video and Infographic view */}
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setViewMode('video');
                setVideoError(false);
              }}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                viewMode === 'video'
                  ? 'bg-primary-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Video className="w-3.5 h-3.5" /> Video
            </button>
            <button
              type="button"
              onClick={() => setViewMode('infographic')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                viewMode === 'infographic'
                  ? 'bg-primary-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Infographic & PDF
            </button>
          </div>

          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
            <button
              type="button"
              disabled={currentLessonIndex === 0}
              onClick={() => {
                onSelectLessonIndex(Math.max(0, currentLessonIndex - 1));
                setVideoError(false);
              }}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-800"
              title="Previous Lesson"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentLessonIndex === lessons.length - 1}
              onClick={() => {
                onSelectLessonIndex(Math.min(lessons.length - 1, currentLessonIndex + 1));
                setVideoError(false);
              }}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-800"
              title="Next Lesson"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Learning Canvas: Video Player OR Official Infographic */}
      {viewMode === 'video' && !videoError ? (
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 shadow-lg aspect-video border border-slate-800 group">
          <iframe
            key={videoSrc}
            title={currentLesson.title}
            src={videoSrc}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={() => setVideoError(true)}
          />
          <div className="absolute top-2 left-2 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white flex items-center gap-1.5 border border-slate-700/50">
            <Video className="w-3.5 h-3.5 text-rose-500" />
            NHM / MoHFW Video Training
          </div>
          <div className="absolute bottom-2 right-2 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-slate-300 flex items-center gap-2 border border-slate-700/50">
            <span>Video embed not loading?</span>
            <button
              type="button"
              onClick={() => setViewMode('infographic')}
              className="text-primary-300 hover:text-white underline font-medium"
            >
              Switch to Infographic & PDF
            </button>
          </div>
        </div>
      ) : (
        /* Option C: Clean Infographic & Official PDF Protocol Banner */
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-700 shadow-lg p-5 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-700/80 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  NHM Official Clinical Directive
                </span>
                <span className="text-xs text-slate-400 font-mono">Module: {module.id.toUpperCase()}</span>
              </div>
              <h3 className="text-lg font-bold mt-1 text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                {info.bannerTitle}
              </h3>
            </div>

            <a
              href={info.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
              Open Official Protocol PDF
            </a>
          </div>

          {/* Infographic Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
            {info.steps.map((st, i) => (
              <div
                key={i}
                className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 hover:border-slate-500 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-primary-500/30 text-primary-300 text-xs font-bold flex items-center justify-center border border-primary-400/40">
                    {i + 1}
                  </span>
                  <h5 className="text-xs font-bold text-slate-200 truncate">{st.step}</h5>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-sky-400" />
              Source: Ministry of Health & Family Welfare (MoHFW) / NHM India Guidelines
            </span>
            <button
              type="button"
              onClick={() => {
                setViewMode('video');
                setVideoError(false);
              }}
              className="text-primary-300 hover:underline flex items-center gap-1"
            >
              <Video className="w-3.5 h-3.5" /> Back to Video Stream
            </button>
          </div>
        </div>
      )}

      {/* Lesson Content & Key Learning Points */}
      <div className="space-y-4">
        <div className="p-4 bg-slate-50/90 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-primary-600" /> Official Clinical Directive
          </h5>
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            {currentLesson.content}
          </p>
        </div>

        {currentLesson.keyPoints && currentLesson.keyPoints.length > 0 && (
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/40">
            <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Key Clinical Learning Points
            </h5>
            <ul className="space-y-1.5 text-xs sm:text-sm text-emerald-950 dark:text-emerald-100">
              {currentLesson.keyPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold shrink-0 mt-0.5">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {currentLesson.clinicalActions && currentLesson.clinicalActions.length > 0 && (
          <div className="p-4 bg-primary-50/60 dark:bg-primary-950/20 rounded-2xl border border-primary-200/70 dark:border-primary-900/40">
            <h5 className="text-xs font-bold uppercase tracking-wider text-primary-800 dark:text-primary-300 mb-2 flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-primary-600" /> Required Frontline Worker Action
            </h5>
            <ul className="space-y-1.5 text-xs sm:text-sm text-primary-950 dark:text-primary-100">
              {currentLesson.clinicalActions.map((act, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold shrink-0 mt-0.5">✓</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Controls & Next Lesson Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {module.progress === 100 && onDownloadCertificate && (
            <button
              type="button"
              onClick={onDownloadCertificate}
              className="px-4 py-2.5 rounded-xl border border-emerald-300 text-emerald-800 bg-emerald-50 text-xs sm:text-sm font-semibold hover:bg-emerald-100 flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" /> Download Certificate
            </button>
          )}
          <button
            type="button"
            onClick={onTakeQuiz}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" /> Take Competency Quiz
          </button>
        </div>

        <button
          type="button"
          onClick={onMarkComplete}
          className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 shadow-md"
        >
          <CheckCircle2 className="w-4 h-4" />
          {currentLessonIndex < lessons.length - 1
            ? 'Mark Lesson Complete & Next'
            : 'Complete Last Lesson & Take Quiz'}
        </button>
      </div>
    </div>
  );
};
