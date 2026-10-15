import { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Send,
  Volume2,
  BookOpen,
  Stethoscope,
  Check,
  ClipboardList,
  ShieldAlert,
  Landmark,
  FileCheck,
  X,
  Download,
  RotateCcw,
  ExternalLink,
  Loader2,
  Users,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { initialChatMessages, suggestedQuestions, patients as seedPatients } from '@/data';
import {
  fetchPatients,
  processVisit,
  queryCopilot,
  saveVisit,
  sendChatMessage,
  transcribeAudio,
} from '@/lib/api';
import { downloadClinicalPdf } from '@/lib/download';
import { getPreferences, savePreferences, workerInitials } from '@/lib/preferences';
import { getSpeechRecognition, speakText, stopSpeaking } from '@/lib/speech';
import { t } from '@/lib/i18n';
import type { ChatMessage, Patient, ViewId } from '@/types';
import { HouseholdPicker } from './HouseholdPicker';
import { SampleVisitCard } from './SampleVisitCard';
import { LanguageSelector } from './LanguageSelector';
import { MicButton } from './MicButton';
import { ProtocolSidePanel } from './ProtocolSidePanel';
import { StructuredFields } from './StructuredFields';
import { ClinicalAlerts } from './ClinicalAlerts';
import { WelfareSchemes } from './WelfareSchemes';
import { VoiceReadBack } from './VoiceReadBack';

function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

type Mode = 'visit' | 'ask';

type SchemeMatch = {
  name: string;
  fullName?: string;
  status: string;
  reasons?: string[];
  blockers?: string[];
  benefitAmount?: string;
};

type Draft = {
  draft_id: string;
  spoken_summary: string;
  record: Record<string, unknown>;
  protocol: {
    flags?: Array<{ title: string; severity: string; action: string }>;
    citations?: Array<{ source: string }>;
  };
  schemes: { matches?: Array<SchemeMatch>; disclaimer?: string };
  report: string;
  tasks?: Array<{ title: string; due: string; priority: string }>;
  safety_note?: string;
};

function formatSymptomLabel(sym: string): string {
  if (!sym) return '';
  const lower = sym.toLowerCase().trim();
  if (lower === 'high_bp' || lower === 'high bp') return 'High BP';
  if (lower === 'high bp (invalid)') return 'High BP (invalid)';
  if (lower === 'high_sugar' || lower === 'high sugar') return 'High Sugar';
  if (lower === 'diabetic range' || lower === 'diabetic_range') return 'Diabetic Range';
  return sym
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function VoiceAssistant({ onNavigate }: { onNavigate?: (view: ViewId) => void }) {
  // Use real current time for initial chat message rather than static 09:00
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const nowTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return initialChatMessages.map((m, idx) =>
      idx === 0 ? { ...m, timestamp: nowTime } : m
    );
  });

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState(
    'Choose a language, record one sentence, review the transcript, then send it.'
  );
  const [activeLang, setActiveLang] = useState(() => getPreferences().language);
  const [mode, setMode] = useState<Mode>('visit');
  const [patientList, setPatientList] = useState<Patient[]>(seedPatients);
  const [patientId, setPatientId] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  // Notifications and Modals
  const [saveSuccessToast, setSaveSuccessToast] = useState<{
    show: boolean;
    draft: Draft;
    countdown: number;
    patientName: string;
  } | null>(null);
  const [sampleToast, setSampleToast] = useState<string>('');
  const [langToast, setLangToast] = useState<string>('');
  const [viewRecordModal, setViewRecordModal] = useState<Draft | null>(null);
  const [protocolPanelOpen, setProtocolPanelOpen] = useState(false);
  const [voiceTipsOpen, setVoiceTipsOpen] = useState(false);
  const [tryTheseExpanded, setTryTheseExpanded] = useState(true);

  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<ReturnType<typeof getSpeechRecognition>>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const syncLanguage = () => {
      const updated = getPreferences().language;
      setActiveLang(updated);
    };
    window.addEventListener('asha-preferences-changed', syncLanguage);
    return () => window.removeEventListener('asha-preferences-changed', syncLanguage);
  }, []);

  useEffect(() => {
    fetchPatients()
      .then((rows) => setPatientList(rows as Patient[]))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isThinking, draft]);

  const handleLanguageChange = (lang: string) => {
    setActiveLang(lang);
    const msg = t('languageSwitched', lang);
    setLangToast(`${msg}: ${lang}`);
    setTimeout(() => setLangToast(''), 3500);
  };

  const pushAssistant = (text: string, sources?: string[]) => {
    const assistantMsg: ChatMessage = {
      id: `a${Date.now()}`,
      role: 'assistant',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      sources,
    };
    setMessages((prev) => [...prev, assistantMsg]);
  };

  const handleSend = async (textToSend?: string) => {
    const text = typeof textToSend === 'string' ? textToSend : input;
    if (!text.trim() || isThinking) return;

    const now = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const userMsg: ChatMessage = { id: `u${Date.now()}`, role: 'user', text: text.trim(), timestamp: now };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);
    setDraft(null);

    try {
      if (mode === 'visit') {
        const data = (await processVisit(text, activeLang, patientId || undefined)) as any;
        if (data.status === 'validation_error' || data.validation_error) {
          pushAssistant(data.spoken_summary || data.message || 'I couldn’t find a visit note in your input. Please describe your observation.', ['Input Validation']);
          setIsThinking(false);
          return;
        }
        setDraft(data);
        pushAssistant(data.spoken_summary, ['Full clinical pipeline — confirm to save']);
        const responseVoice = activeLang === 'Hindi' ? 'Hindi' : 'English';
        if (getPreferences().voiceGuidance && !speakText(data.spoken_summary, responseVoice)) {
          setVoiceStatus(`No ${responseVoice} speech voice is available in this browser. The response is available as text.`);
        } else if (getPreferences().voiceGuidance && activeLang !== responseVoice) {
          setVoiceStatus(`${activeLang} speech input is enabled. The generated read-back is currently in ${responseVoice}.`);
        }
        setIsThinking(false);
        return;
      }

      // If user is in 'ask' mode but types patient/clinical details, process full pipeline too!
      const hasClinicalData = /\b(?:bp|blood pressure|pregnant|fever|swelling|headache|hyderabad|eligibility|patient)\b/i.test(
        text
      );
      if (hasClinicalData) {
        const chatData = (await sendChatMessage(text, activeLang, patientId || undefined)) as any;
        if (chatData.status === 'validation_error' || chatData.validation_error) {
          pushAssistant(chatData.spoken_summary || chatData.message, ['Input Validation']);
          setIsThinking(false);
          return;
        }
        setDraft(chatData);
        pushAssistant(chatData.spoken_summary, ['ASHA Co-Pilot Chat Analysis']);
        const responseVoice = activeLang === 'Hindi' ? 'Hindi' : 'English';
        if (getPreferences().voiceGuidance && !speakText(chatData.spoken_summary, responseVoice)) {
          setVoiceStatus(`No ${responseVoice} speech voice is available in this browser. The response is available as text.`);
        }
        setIsThinking(false);
        return;
      }

      const data = await queryCopilot(text, activeLang);
      pushAssistant(data.text, data.sources);
      const responseVoice = activeLang === 'Hindi' ? 'Hindi' : 'English';
      if (getPreferences().voiceGuidance && !speakText(data.text.slice(0, 400), responseVoice)) {
        setVoiceStatus(`No ${responseVoice} speech voice is available in this browser. The response is available as text.`);
      } else if (getPreferences().voiceGuidance && activeLang !== responseVoice) {
        setVoiceStatus(`${activeLang} speech input is enabled. The generated read-back is currently in ${responseVoice}.`);
      }
      setIsThinking(false);
      return;
    } catch (error) {
      pushAssistant(
        error instanceof Error
          ? `Could not reach the co-pilot service: ${error.message}`
          : 'Could not reach the co-pilot service. Check that the API is running and try again.'
      );
      setIsThinking(false);
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setInput(sampleText);
    setMode('visit');
    setSampleToast(t('sampleLoaded', activeLang));
    setTimeout(() => setSampleToast(''), 3500);
  };

  const handleRunSampleVisit = () => {
    const sample =
      'Lakshmi Devi 24 years, 8 months pregnant, BP 140/90, swelling in feet, headache, BPL.';
    setInput(sample);
    setMode('visit');
    setSampleToast('Sample loaded — click send to try');
    setTimeout(() => setSampleToast(''), 3500);
  };

  const handleUndo = () => {
    if (undoTimerRef.current) {
      clearInterval(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    if (saveSuccessToast?.draft) {
      setDraft(saveSuccessToast.draft);
      pushAssistant('Save undone. Draft restored for editing.');
    }
    setSaveSuccessToast(null);
  };

  const handleConfirm = async () => {
    if (!draft) return;
    setSaving(true);
    const confirmedDraft = draft;
    try {
      const saveRes = await saveVisit({
        structured_record: confirmedDraft.record,
        record: confirmedDraft.record,
        protocol_flags: confirmedDraft.protocol?.flags || [],
        protocol: confirmedDraft.protocol,
        scheme_matches: confirmedDraft.schemes?.matches || [],
        schemes: confirmedDraft.schemes,
        tasks: confirmedDraft.tasks || [],
        draft_id: confirmedDraft.draft_id,
        report: confirmedDraft.report,
        transcript: String(confirmedDraft.record?.visit_notes || ''),
      });

      if (!saveRes?.success && !saveRes?.patient_id) {
        throw new Error('Database write did not complete.');
      }

      // Refresh patients list immediately
      try {
        const updatedPatients = (await fetchPatients()) as Patient[];
        setPatientList(updatedPatients);
      } catch {
        // retain previous patientList if fetch fails
      }

      const pName = String(confirmedDraft.record.patient_name || 'Patient');
      pushAssistant(
        `Saved. ${pName} is now persisted in the registry and visit history.`
      );
      setDraft(null);
      stopSpeaking();

      // Show save feedback toast with View Record and 5-second Undo option
      if (undoTimerRef.current) clearInterval(undoTimerRef.current);
      let secondsLeft = 5;
      setSaveSuccessToast({
        show: true,
        draft: confirmedDraft,
        countdown: secondsLeft,
        patientName: pName,
      });

      undoTimerRef.current = setInterval(() => {
        secondsLeft -= 1;
        if (secondsLeft <= 0) {
          if (undoTimerRef.current) clearInterval(undoTimerRef.current);
          undoTimerRef.current = null;
          setSaveSuccessToast(null);
        } else {
          setSaveSuccessToast((prev) =>
            prev ? { ...prev, countdown: secondsLeft } : null
          );
        }
      }, 1000);
    } catch (e) {
      pushAssistant(e instanceof Error ? e.message : 'Could not save visit to database.');
    }
    setSaving(false);
  };

  const startBackendRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setIsListening(false);
      setVoiceStatus('This browser cannot record audio. Type your note instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((type) =>
        MediaRecorder.isTypeSupported(type)
      );
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audio = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        const asrLanguage =
          activeLang === 'Hindi' || activeLang === 'Bhojpuri'
            ? 'hi'
            : activeLang === 'Tamil'
            ? 'ta'
            : activeLang === 'Telugu'
            ? 'te'
            : 'en';
        try {
          const result = await transcribeAudio(audio, asrLanguage);
          if (!result?.transcript?.trim()) {
            throw new Error('No clear speech was recognized. Record again or type the note.');
          }
          setInput(result.transcript.trim());
          setVoiceStatus(
            `Transcribed with ${result.model_used || 'ASR'}. Review and correct the words, then press Send.`
          );
        } catch (error) {
          setVoiceStatus(
            error instanceof Error
              ? `Transcription failed: ${error.message}`
              : 'Transcription failed. Type or record the note again.'
          );
        }
      };
      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        setIsListening(false);
        setVoiceStatus('Audio recording failed. Check the microphone and try again.');
      };
      recorder.start();
      setIsListening(true);
      setVoiceStatus(
        `Recording ${activeLang} speech for transcription. Press the microphone again when finished.`
      );
    } catch (error) {
      setIsListening(false);
      setVoiceStatus(
        error instanceof Error && error.name === 'NotAllowedError'
          ? 'Microphone access was denied. Allow microphone access in browser settings, then try again.'
          : 'Could not start microphone recording. Check microphone permissions.'
      );
    }
  };

  const toggleListening = async () => {
    if (isListening) {
      setIsListening(false);
      recRef.current?.stop();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    if (isThinking) return;
    setIsListening(true);
    const langMap: Record<string, string> = {
      English: 'en-IN',
      Hindi: 'hi-IN',
      Tamil: 'ta-IN',
      Telugu: 'te-IN',
      Bhojpuri: 'hi-IN',
    };

    const rec = getSpeechRecognition();
    if (rec) {
      rec.lang = langMap[activeLang] || 'en-IN';
      rec.interimResults = false;
      rec.continuous = false;
      rec.onresult = (ev) => {
        const said = ev.results[0][0].transcript;
        setIsListening(false);
        if (said?.trim()) {
          setInput(said.trim());
          setVoiceStatus('Transcript ready. Review and correct it, then press Send to process.');
        } else {
          setVoiceStatus('No speech was recognized. Please try again or type the note.');
        }
      };
      rec.onerror = (event) => {
        recRef.current = null;
        const reason =
          event.error === 'not-allowed' || event.error === 'service-not-allowed'
            ? 'Microphone or speech recognition permission was denied. Allow microphone access.'
            : event.error === 'no-speech'
            ? 'No speech was detected. Move closer to the microphone and try again.'
            : event.error === 'audio-capture'
            ? 'No working microphone was found.'
            : 'Speech recognition failed. Check microphone permission and try again.';
        if (event.error === 'not-allowed' || event.error === 'audio-capture') {
          setIsListening(false);
          setVoiceStatus(reason);
        } else {
          setVoiceStatus(`${reason} Switching to audio transcription. Record your sentence again.`);
          void startBackendRecording();
        }
      };
      rec.onend = () => {
        if (recRef.current === rec) setIsListening(false);
      };
      recRef.current = rec;
      try {
        setVoiceStatus(
          activeLang === 'Bhojpuri'
            ? 'Listening in Bhojpuri. Speech recognition uses Hindi phonetic fallback; review transcript carefully before processing.'
            : `Listening in ${activeLang}. Your words will appear for review before processing.`
        );
        rec.start();
        return;
      } catch {
        recRef.current = null;
      }
    }

    await startBackendRecording();
  };

  return (
    <div className="animate-fade-in h-[calc(100vh-5rem)] flex flex-col max-w-7xl mx-auto relative">
      <FloatingOrb className="w-72 h-72 bg-primary-200/25 -top-16 -right-10" delay={0} />
      <FloatingOrb className="w-64 h-64 bg-accent-200/20 bottom-20 -left-16" delay={2} />

      {/* Floating Toast Alerts */}
      <div className="fixed top-20 right-6 z-50 space-y-2 max-w-md pointer-events-none">
        {sampleToast && (
          <div className="p-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 flex items-center gap-2 animate-slide-up pointer-events-auto">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{sampleToast}</span>
          </div>
        )}
        {langToast && (
          <div className="p-3 rounded-xl bg-primary-900 text-white text-xs font-semibold shadow-xl border border-primary-700 flex items-center gap-2 animate-slide-up pointer-events-auto">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{langToast}</span>
          </div>
        )}
      </div>

      {/* Page Header */}
      <div className="mb-3 relative shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-600/25">
            <Stethoscope className="w-5 h-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t('voiceAssistant', activeLang)}
            </h2>
            <p className="text-slate-500 text-xs">
              Clinical field documentation tool for community health workers. Speak or type visit notes.
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex gap-5 min-h-0">
        {/* Left: Chat & Clinical Draft Console */}
        <div className="flex-1 card-elevated flex flex-col min-h-0 overflow-hidden shadow-soft rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4 gradient-mesh">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                    msg.role === 'assistant'
                      ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white'
                      : 'bg-gradient-to-br from-slate-400 to-slate-600 text-white'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <Stethoscope className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-xs font-bold">{workerInitials()}</span>
                  )}
                </div>
                <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-xs ${
                      msg.role === 'assistant'
                        ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-xs'
                        : 'bg-primary-600 dark:bg-primary-700 text-white rounded-tr-xs shadow-primary-600/20'
                    }`}
                  >
                    <p className="text-xs whitespace-pre-line leading-relaxed">{msg.text}</p>
                  </div>
                  {msg.sources && (
                    <div className="flex items-center gap-1.5 mt-1.5 ml-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] text-slate-400 font-medium">
                        {msg.sources.join(' · ')}
                      </span>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-medium">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Save Feedback Banner with View Record and 5-Second Undo */}
            {saveSuccessToast && (
              <div className="bg-emerald-600 dark:bg-emerald-700 text-white rounded-2xl p-4 shadow-lg shadow-emerald-600/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-slide-up border border-emerald-500">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      ✓ Visit saved to {saveSuccessToast.patientName}'s record
                    </p>
                    <p className="text-xs text-emerald-100">
                      Synchronized to health registry with protocol flags and scheme verification.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate('patients')}
                      className="px-3 py-1.5 rounded-xl bg-white text-emerald-900 text-xs font-bold hover:bg-emerald-50 transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Registry
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setViewRecordModal(saveSuccessToast.draft)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-emerald-400"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {t('viewRecord', activeLang)}
                  </button>
                  <button
                    type="button"
                    onClick={handleUndo}
                    className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-emerald-400"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {t('undo', activeLang)} ({saveSuccessToast.countdown}s)
                  </button>
                </div>
              </div>
            )}

            {/* Structured Draft Display */}
            {draft && (
              <div className="bg-white dark:bg-slate-800 border border-primary-200 dark:border-primary-800/60 rounded-2xl p-4 shadow-sm space-y-3 animate-slide-up">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    Draft — Confirm to persist in patient history
                  </h3>
                  <button
                    type="button"
                    onClick={() => setDraft(null)}
                    className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs text-slate-500">{draft.safety_note}</p>
                  {(draft.record as any)?.language_detected && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
                      Detected Language: <span className="uppercase">{(draft.record as any).language_detected}</span>
                    </span>
                  )}
                </div>

                {/* Voice Read-Back (Indic TTS / Frontline Worker Audio Confirmation) */}
                <VoiceReadBack
                  text={(draft as any).tts?.text || draft.spoken_summary}
                  audioUrl={(draft as any).tts?.audio_url || null}
                  language={activeLang}
                  onConfirm={handleConfirm}
                  isConfirmed={saving}
                />

                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  {/* Left Column: Structured Observations */}
                  <StructuredFields record={draft.record} />

                  {/* Right Column: Alerts & Schemes */}
                  <div className="space-y-2.5">
                    <ClinicalAlerts
                      flags={draft.protocol.flags}
                      cannotAssess={Boolean((draft.protocol as any)?.cannot_assess)}
                    />
                    <WelfareSchemes
                      matches={draft.schemes.matches}
                      isPregnant={Boolean(draft.record.pregnancy_status || draft.record.trimester)}
                    />
                  </div>
                </div>

                {/* Draft Actions */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleConfirm}
                    className="btn-primary flex-1 text-xs py-2.5 shadow-sm font-bold flex items-center justify-center gap-1.5"
                  >
                    <FileCheck className="w-4 h-4" />
                    {saving ? 'Saving…' : t('confirmAndSave', activeLang)}
                  </button>
                  <button
                    type="button"
                    className="btn-ghost border border-slate-300 dark:border-slate-700 text-xs py-2.5 px-3 font-semibold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={async () => {
                      const rawName = String(draft.record.patient_name || draft.record.name || 'Patient').replace(/[^\w]/g, '');
                      const dTag = new Date().toISOString().split('T')[0];
                      const desiredFilename = `visit-note_${rawName || 'Patient'}_${dTag}.pdf`;
                      try {
                        const downloadedAs = await downloadClinicalPdf(desiredFilename, {
                          ...draft.record,
                          report: draft.report,
                          flags: draft.protocol.flags || [],
                          schemes: (draft.schemes.matches || []).filter(
                            (m) => m.status !== 'not-eligible'
                          ),
                          worker_name: getPreferences().workerName,
                          village: draft.record.location || draft.record.village,
                        });
                        setSampleToast(`✓ Downloaded ${downloadedAs}`);
                        setTimeout(() => setSampleToast(''), 4500);
                      } catch {
                        setSampleToast('Download failed. Please retry.');
                        setTimeout(() => setSampleToast(''), 4000);
                      }
                    }}
                  >
                    <Download className="w-3.5 h-3.5 inline mr-1" />
                    Download PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(null);
                      stopSpeaking();
                    }}
                    className="btn-ghost border border-slate-300 dark:border-slate-700 text-xs py-2.5 px-3 font-semibold text-slate-500"
                  >
                    {t('discard', activeLang)}
                  </button>
                </div>
              </div>
            )}

            {/* SKELETON LOADER & SPINNER WHILE PROCESSING */}
            {isThinking && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shrink-0 shadow-md">
                  <Stethoscope className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-xs p-4 shadow-sm space-y-2.5 max-w-md w-full">
                  <div className="flex items-center gap-2 text-primary-600 font-semibold text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                    <span>Analyzing clinical vitals & rules</span>
                  </div>
                  <div className="space-y-2 pt-1 animate-pulse">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-4/5" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-700/60 rounded-full w-full" />
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-700/40 rounded-full w-2/3" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal to View Saved Record */}
          {viewRecordModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                        Saved Patient Record
                      </h3>
                      <p className="text-xs text-slate-500">ID: {viewRecordModal.draft_id}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewRecordModal(null)}
                    className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                    <p>
                      <span className="font-semibold text-slate-600 dark:text-slate-400">Patient:</span>{' '}
                      {String(viewRecordModal.record.patient_name || '—')}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-600 dark:text-slate-400">Location:</span>{' '}
                      {String(viewRecordModal.record.location || viewRecordModal.record.village || '—')}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-600 dark:text-slate-400">BP:</span>{' '}
                      {String(viewRecordModal.record.blood_pressure || '—')} ({String(viewRecordModal.record.bp_status || '—')})
                    </p>
                    <p>
                      <span className="font-semibold text-slate-600 dark:text-slate-400">Blood Sugar:</span>{' '}
                      {String(viewRecordModal.record.blood_sugar || '—')} mg/dL ({String(viewRecordModal.record.sugar_status || '—')})
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50">
                    <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Alerts & Protocols</p>
                    {(viewRecordModal.protocol.flags || []).map((f) => (
                      <p key={f.title} className="text-amber-900 dark:text-amber-200">
                        • [{f.severity}] {f.title}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setViewRecordModal(null)}
                    className="btn-primary text-xs px-4 py-2"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Interactive Input Console */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-3.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm space-y-3 shrink-0">
            {/* Top Toolbar Row */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('visit')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  mode === 'visit'
                    ? 'bg-primary-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {t('documentVisit', activeLang)}
              </button>

              <button
                type="button"
                onClick={() => setProtocolPanelOpen(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                  protocolPanelOpen
                    ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border-primary-300'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
                title="Search and reference official NHM clinical protocols"
              >
                <BookOpen className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                {t('askProtocol', activeLang)}
              </button>

              {/* Patient / Household Linker */}
              <HouseholdPicker
                patients={patientList}
                selectedPatientId={patientId}
                onSelectPatient={(pId) => setPatientId(pId)}
                disabled={isThinking}
              />

              {/* Run Sample Visit Button */}
              <button
                type="button"
                onClick={handleRunSampleVisit}
                disabled={isThinking}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:border-primary-300 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 ml-auto flex items-center gap-1.5 transition-all"
                title="Auto-fill with sample Lakshmi Devi visit note"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Run sample visit
              </button>
            </div>

            {/* Input Bar Row */}
            <div className="flex items-center gap-2.5">
              {/* 48x48 Mic Button with Live Timer & Pulse Feedback */}
              <MicButton
                isListening={isListening}
                onToggle={toggleListening}
                disabled={isThinking}
                activeLang={activeLang}
              />

              {/* Voice Tips Tooltip Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setVoiceTipsOpen((prev) => !prev)}
                  className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Voice recording tips"
                  aria-label="Voice recording tips"
                >
                  <Info className="w-4 h-4" />
                </button>

                {voiceTipsOpen && (
                  <div className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-slate-900 text-white rounded-2xl shadow-2xl text-xs z-50 space-y-2 border border-slate-700 animate-slide-up">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                      <span className="font-bold flex items-center gap-1.5 text-primary-300">
                        <Volume2 className="w-3.5 h-3.5" />
                        Voice Recording Tips
                      </span>
                      <button
                        type="button"
                        onClick={() => setVoiceTipsOpen(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      • Speak clearly close to your microphone.
                      <br />• Dictate vitals like <em>"BP 130/80"</em> or <em>"Sugar 110"</em>.
                      <br />• Regional dialects (Hindi, Bhojpuri, Tamil, Telugu) are supported.
                      <br />• Always review the generated draft before confirming.
                    </p>
                  </div>
                )}
              </div>

              {/* Text Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={
                    isListening
                      ? 'Listening to speech...'
                      : mode === 'visit'
                      ? 'Speak or type visit observations (e.g., BP, trimester, symptoms)…'
                      : 'Ask clinical protocol question…'
                  }
                  className="input-field pr-14 py-3 text-xs sm:text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />

                {/* 44x44 Send Button */}
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={isThinking || !input.trim()}
                  aria-label={t('sendVisitNote', activeLang)}
                  title={t('sendVisitNote', activeLang)}
                  className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-all shadow-sm ${
                    input.trim()
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow-md active:scale-95'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>

            {/* Live Audio Waveform Animation during recording */}
            {isListening && (
              <div className="flex items-center justify-center gap-1.5 pt-1 animate-fade-in">
                {[...Array(12)].map((_, i) => (
                  <span
                    key={i}
                    className="w-1 bg-gradient-to-t from-primary-400 to-rose-500 rounded-full animate-wave"
                    style={{
                      height: `${14 + ((i * 7) % 22)}px`,
                      animationDelay: `${i * 70}ms`,
                    }}
                  />
                ))}
                <span className="text-xs text-rose-600 dark:text-rose-400 ml-3 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  Recording audio...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Language + Expandable Try These */}
        <div className="w-80 shrink-0 space-y-4 flex flex-col min-h-0">
          {/* Language Selector Component */}
          <LanguageSelector
            activeLang={activeLang}
            onChangeLang={handleLanguageChange}
            disabled={isListening || isThinking}
          />

          {/* Expandable "Try These" Examples Card */}
          <div className="card p-4 glass-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Try these
                  </h3>
                  <p className="text-[11px] text-slate-500">Click any card to auto-fill</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTryTheseExpanded((prev) => !prev)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"
                aria-label={tryTheseExpanded ? 'Collapse examples' : 'Expand examples'}
              >
                {tryTheseExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {tryTheseExpanded && (
              <div className="space-y-2.5 overflow-y-auto scrollbar-thin flex-1 pr-1">
                <SampleVisitCard
                  text="Visited Lakshmi Devi 24 years, 8 months pregnant, BP 140/90, swelling in feet, headache, BPL."
                  onSelect={handleSelectSample}
                  disabled={isThinking}
                />
                <SampleVisitCard
                  text="Sunita Kumari 28 years ANC, Hb 8.2, first child, Aadhaar linked, BPL."
                  onSelect={handleSelectSample}
                  disabled={isThinking}
                />
                <SampleVisitCard
                  text="Postnatal visit Geeta Yadav, delivery last week, no fever, breastfeeding well."
                  onSelect={handleSelectSample}
                  disabled={isThinking}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Protocol Side Panel for Searching and Reading Official Protocols */}
      <ProtocolSidePanel
        isOpen={protocolPanelOpen}
        onClose={() => setProtocolPanelOpen(false)}
        onSelectPrompt={(promptText) => {
          setInput(promptText);
          setMode('ask');
          setSampleToast('Protocol question filled');
          setTimeout(() => setSampleToast(''), 3000);
        }}
      />
    </div>
  );
}

export default VoiceAssistant;
