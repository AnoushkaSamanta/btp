import { useState, useRef, useEffect } from 'react';
import { Mic, Send, Sparkles, Volume2, BookOpen, Stethoscope, Languages, Check, ClipboardList, ShieldAlert, Landmark, FileCheck, X } from 'lucide-react';
import { initialChatMessages, suggestedQuestions, patients as seedPatients } from '@/data';
import { confirmVisit, fetchPatients, processVisit, queryCopilot, runFullPipeline, transcribeAudio } from '@/lib/api';

import { getSpeechRecognition, speakText, stopSpeaking } from '@/lib/speech';
import { getPreferences, savePreferences } from '@/lib/preferences';
import type { ChatMessage, Patient } from '@/types';

function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bhojpuri'];

type Mode = 'ask' | 'visit';

type Draft = {
  draft_id: string;
  spoken_summary: string;
  record: Record<string, unknown>;
  protocol: { flags?: Array<{ title: string; severity: string; action: string }>; citations?: Array<{ source: string }> };
  schemes: { matches?: Array<{ name: string; status: string }>; disclaimer?: string };
  report: string;
  tasks?: Array<{ title: string; due: string; priority: string }>;
  safety_note?: string;
};

export function VoiceAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('Choose a language, record one sentence, review the transcript, then send it.');
  const [activeLang, setActiveLang] = useState(() => getPreferences().language);
  const [mode, setMode] = useState<Mode>('visit');
  const [patientList, setPatientList] = useState<Patient[]>(seedPatients);
  const [patientId, setPatientId] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<ReturnType<typeof getSpeechRecognition>>(null);

  useEffect(() => {
    const syncLanguage = () => setActiveLang(getPreferences().language);
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const pushAssistant = (text: string, sources?: string[]) => {
    const assistantMsg: ChatMessage = {
      id: `a${Date.now()}`,
      role: 'assistant',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      sources,
    };
    setMessages((prev) => [...prev, assistantMsg]);
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isThinking) return;
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const userMsg: ChatMessage = { id: `u${Date.now()}`, role: 'user', text, timestamp: now };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);
    setDraft(null);

    try {
      if (mode === 'visit') {
        const data = (await processVisit(text, activeLang, patientId || undefined)) as Draft;
        setDraft(data);
        pushAssistant(data.spoken_summary, ['Visit draft — confirm to save']);
        const responseVoice = activeLang === 'Hindi' ? 'Hindi' : 'English';
        if (getPreferences().voiceGuidance && !speakText(data.spoken_summary, responseVoice)) {
          setVoiceStatus(`No ${responseVoice} speech voice is available in this browser. The response is available as text.`);
        } else if (getPreferences().voiceGuidance && activeLang !== responseVoice) {
          setVoiceStatus(`${activeLang} speech input is enabled. The generated read-back is currently in ${responseVoice}.`);
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
      pushAssistant(error instanceof Error ? `Could not reach the co-pilot service: ${error.message}` : 'Could not reach the co-pilot service. Check that the API is running and try again.');
      setIsThinking(false);
    }
  };

  const handleTestFullPipeline = async () => {
    const sample = input.trim() || 'Visited Lakshmi Devi 24 years, 8 months pregnant, BP 140/90, swelling in feet, headache, BPL.';
    setInput(sample);
    setIsThinking(true);
    setVoiceStatus('Running end-to-end full pipeline (ASR -> Structuring -> Protocol -> Scheme -> Report)...');
    try {
      const result = await runFullPipeline({ transcript: sample, language: activeLang });
      setDraft({
        draft_id: result.draft_id || `draft-${Date.now()}`,
        spoken_summary: result.spoken_summary || result.report,
        record: result.structured_record || {},
        protocol: {
          flags: (result.red_flags || []).map((f: { flag?: string; action?: string; severity?: string }) => ({
            title: f.flag || 'Alert',
            severity: f.severity || 'high',
            action: f.action || '',
          })),
          citations: (result.protocol_citations || []).map((c: string) => ({ source: c })),
        },
        schemes: {
          matches: (result.eligible_schemes || []).map((s: string) => ({ name: s, status: 'eligible' })),
          disclaimer: 'Preliminary matches — verify with scheme office.',
        },
        report: result.report || '',
        tasks: (result.tasks || []).map((t: string) => ({ title: t, due: 'in 7 days', priority: 'routine' })),
        safety_note: 'End-to-End Full Pipeline Test Completed Successfully.',
      });
      pushAssistant(`Full Pipeline Processed Successfully:\n- Transcript: "${result.transcript}"\n- Red Flags: ${(result.red_flags || []).length}\n- Schemes Matched: ${(result.eligible_schemes || []).length}\n- Protocol Citations: ${(result.protocol_citations || []).length}`);
      setVoiceStatus('Full pipeline test completed successfully! Review structured report below.');
    } catch (err) {
      pushAssistant(`Full pipeline test failed: ${err instanceof Error ? err.message : String(err)}`);
      setVoiceStatus('Full pipeline test failed. Check backend server.');
    } finally {
      setIsThinking(false);
    }
  };


  const handleConfirm = async () => {
    if (!draft?.draft_id) return;
    setSaving(true);
    try {
      await confirmVisit(draft.draft_id, patientId || undefined);
      pushAssistant('Saved. Structured record, protocol flags, scheme matches, and tasks are in the visit history. Scheme matches stay labeled preliminary.');
      setDraft(null);
      stopSpeaking();
    } catch (e) {
      pushAssistant(e instanceof Error ? e.message : 'Could not save visit.');
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
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audio = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const asrLanguage = activeLang === 'Hindi' || activeLang === 'Bhojpuri' ? 'hi'
          : activeLang === 'Tamil' ? 'ta' : activeLang === 'Telugu' ? 'te' : 'en';
        try {
          const result = await transcribeAudio(audio, asrLanguage);
          if (!result?.transcript?.trim()) throw new Error('No clear speech was recognized. Record again or type the note.');
          setInput(result.transcript.trim());
          setVoiceStatus(`Transcribed with ${result.model_used || 'local ASR'}. Review and correct the words, then press Send.`);
        } catch (error) {
          setVoiceStatus(error instanceof Error ? `Transcription failed: ${error.message}` : 'Transcription failed. Type or record the note again.');
        }
      };
      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        setIsListening(false);
        setVoiceStatus('Audio recording failed. Check the microphone and try again.');
      };
      recorder.start();
      setIsListening(true);
      setVoiceStatus(`Recording ${activeLang} speech for transcription. Press the microphone again when finished.`);
    } catch (error) {
      setIsListening(false);
      setVoiceStatus(error instanceof Error && error.name === 'NotAllowedError'
        ? 'Microphone access was denied. Allow microphone access in browser settings, then try again.'
        : 'Could not start microphone recording. Check the microphone connection and browser permission.');
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
        const reason = event.error === 'not-allowed' || event.error === 'service-not-allowed'
          ? 'Microphone or speech recognition permission was denied. Allow microphone access and try again.'
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
        setVoiceStatus(activeLang === 'Bhojpuri'
          ? 'Listening in Bhojpuri. Speech recognition uses the Hindi language fallback; review the transcript carefully before processing.'
          : `Listening in ${activeLang}. Your words will appear for review before processing.`);
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

      <div className="mb-4 relative">
        <div className="flex items-center gap-3 mb-1">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-600/30">
            <Stethoscope className="w-5 h-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success-400 border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-display font-extrabold text-slate-900">Voice Co-Pilot</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-accent-400 to-accent-500 text-white text-xs font-bold shadow-sm shadow-accent-500/30">
                <Sparkles className="w-3 h-3" />
                Worker-facing
              </span>
            </div>
            <p className="text-slate-500 text-sm">Document a home visit by voice, or ask a protocol question. Never used as patient advice.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="flex-1 card-elevated flex flex-col min-h-0 overflow-hidden shadow-soft">
          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-5 gradient-mesh">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                  msg.role === 'assistant'
                    ? 'bg-gradient-to-br from-primary-500 to-primary-700 shadow-primary-500/20'
                    : 'bg-gradient-to-br from-slate-300 to-slate-400 shadow-slate-300/20'
                }`}>
                  {msg.role === 'assistant'
                    ? <Stethoscope className="w-5 h-5 text-white" />
                    : <span className="text-sm font-bold text-white">RS</span>}
                </div>
                <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3.5 shadow-sm ${
                    msg.role === 'assistant'
                      ? 'bg-white border border-slate-100 text-slate-700 rounded-tl-md'
                      : 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-tr-md shadow-primary-600/20'
                  }`}>
                    <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                  </div>
                  {msg.sources && (
                    <div className="flex items-center gap-1.5 mt-2 ml-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-400 font-medium">{msg.sources.join(' - ')}</span>
                    </div>
                  )}
                  <span className="text-xs text-slate-300 mt-1 block font-medium">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {draft && (
              <div className="bg-white border border-primary-100 rounded-2xl p-4 shadow-sm space-y-3 animate-slide-up">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-primary-600" />
                    Draft — confirm to persist
                  </h3>
                  <button type="button" onClick={() => setDraft(null)} className="w-8 h-8 rounded-lg hover:bg-slate-50 flex items-center justify-center">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <p className="text-xs text-slate-500">{draft.safety_note}</p>
                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50">
                    <p className="font-semibold text-slate-600 mb-1">Structured fields</p>
                    <p>Name: {String(draft.record.patient_name || '—')}</p>
                    <p>BP: {String(draft.record.blood_pressure || '—')} ({String(draft.record.bp_status || '—')})</p>
                    <p>Symptoms: {(draft.record.symptoms as string[] | undefined)?.join(', ') || '—'}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-error-50/60">
                    <p className="font-semibold text-error-700 mb-1 flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> Protocol flags</p>
                    {(draft.protocol.flags || []).length === 0 && <p>None</p>}
                    {(draft.protocol.flags || []).map((f) => (
                      <p key={f.title}><span className="font-semibold">{f.severity}</span> — {f.title}</p>
                    ))}
                  </div>
                  <div className="p-2 rounded-xl bg-accent-50/70">
                    <p className="font-semibold text-accent-700 mb-1 flex items-center gap-1"><Landmark className="w-3.5 h-3.5" /> Schemes (preliminary)</p>
                    {(draft.schemes.matches || []).filter((m) => m.status !== 'not-eligible').map((m) => (
                      <p key={m.name}>{m.name}: {m.status}</p>
                    ))}
                  </div>
                  <div className="p-2 rounded-xl bg-sky-50">
                    <p className="font-semibold text-sky-700 mb-1">Follow-up tasks</p>
                    {(draft.tasks || []).map((t) => (
                      <p key={t.title}>{t.title} ({t.due})</p>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{draft.report}</p>
                <div className="flex gap-2">
                  <button type="button" disabled={saving} onClick={handleConfirm} className="btn-primary flex-1 text-sm">
                    <FileCheck className="w-4 h-4" />
                    {saving ? 'Saving…' : 'Confirm and save'}
                  </button>
                  <button type="button" onClick={() => { setDraft(null); stopSpeaking(); }} className="btn-ghost border border-slate-200 flex-1 text-sm">
                    Discard
                  </button>
                </div>
              </div>
            )}

            {isThinking && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shrink-0 shadow-md shadow-primary-500/20">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-md px-5 py-4 flex items-center gap-2 shadow-sm">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce-dot"
                      style={{ animationDelay: `${i * 160}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 p-4 bg-white/50 backdrop-blur-sm space-y-3">
            <p className="text-xs text-slate-500" role="status" aria-live="polite">{voiceStatus}</p>
            <div className="flex flex-wrap gap-2">
              {(['visit', 'ask'] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    mode === m ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {m === 'visit' ? 'Document visit' : 'Ask protocol'}
                </button>
              ))}
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 px-2 py-1.5 bg-white max-w-[200px]"
              >
                <option value="">Link household (optional)</option>
                {patientList.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} · {p.village}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleTestFullPipeline}
                disabled={isThinking}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white shadow-sm flex items-center gap-1 transition-all active:scale-95 ml-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Test Full Pipeline
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleListening}
                aria-label={isListening ? 'Stop recording' : 'Start voice recording'}
                title={isListening ? 'Stop recording' : `Speak in ${activeLang}`}
                disabled={isThinking}
                className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 active:scale-90 ${
                  isListening
                    ? 'bg-gradient-to-br from-error-500 to-error-600 shadow-lg shadow-error-500/30'
                    : 'bg-gradient-to-br from-primary-500 to-primary-700 hover:shadow-lg hover:shadow-primary-500/30 shadow-md'
                }`}
              >
                {isListening && <span className="absolute inset-0 rounded-2xl bg-error-500 animate-pulse-ring" />}
                <Mic className="w-5 h-5 text-white relative z-10" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                  placeholder={isListening ? 'Listening...' : mode === 'visit' ? 'Speak or type visit notes…' : 'Ask a protocol question…'}
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => handleSend(input)}
                  disabled={isThinking || !input.trim()}
                  aria-label="Send reviewed transcript"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 flex items-center justify-center transition-all shadow-sm hover:shadow-md active:scale-90"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            {isListening && (
              <div className="flex items-center justify-center gap-1.5 mt-2">
                {[...Array(9)].map((_, i) => (
                  <span
                    key={i}
                    className="w-1 bg-gradient-to-t from-primary-300 to-primary-500 rounded-full animate-wave"
                    style={{ height: '24px', animationDelay: `${i * 80}ms` }}
                  />
                ))}
                <span className="text-xs text-primary-600 ml-3 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-error-500 animate-pulse" />
                  Listening...
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="w-72 shrink-0 space-y-4">
          <div className="card p-5 glass-card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
                <Languages className="w-4 h-4 text-primary-600" />
              </div>
              <h3 className="font-display font-bold text-slate-900 text-sm">Language</h3>
            </div>
            <div className="space-y-1.5">
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => savePreferences({ ...getPreferences(), language: lang })}
                  disabled={isListening || isThinking}
                  className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeLang === lang
                      ? 'bg-gradient-to-r from-primary-50 to-primary-50/50 text-primary-700 shadow-sm'
                      : 'hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  {lang}
                  {activeLang === lang && (
                    <Check className="w-4 h-4 text-primary-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5 glass-card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-accent-50 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-accent-500" />
              </div>
              <h3 className="font-display font-bold text-slate-900 text-sm">Try these</h3>
            </div>
            <div className="space-y-1.5">
              {(mode === 'ask' ? suggestedQuestions : [
                'Visited Lakshmi Devi 24 years, 8 months pregnant, BP 140/90, swelling in feet, headache, BPL.',
                'Sunita Kumari 28 years ANC, Hb 8.2, first child, Aadhaar linked, BPL.',
                'Postnatal visit Geeta Yadav, delivery last week, no fever, breastfeeding well.',
              ]).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSend(q)}
                  className="w-full text-left px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-primary-50 hover:text-primary-700 text-slate-600 text-xs font-medium transition-all leading-relaxed hover:shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden card p-5 glass-card bg-gradient-to-br from-primary-50/80 via-sky-50/80 to-primary-50/80 border-primary-100">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-200/20 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-4 h-4 text-primary-600" />
                <h3 className="font-display font-bold text-slate-900 text-sm">Voice tips</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chrome speech recognition works without Whisper. For ASR models, install openai-whisper and ffmpeg. Confirm every draft before it is stored.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
