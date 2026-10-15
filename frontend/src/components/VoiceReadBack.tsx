import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, RotateCcw, CheckCircle2, Play, Pause, AlertCircle } from 'lucide-react';

interface VoiceReadBackProps {
  text?: string;
  audioUrl?: string | null;
  language?: string;
  onConfirm?: () => void;
  isConfirmed?: boolean;
}

export const VoiceReadBack: React.FC<VoiceReadBackProps> = ({
  text,
  audioUrl,
  language = 'hi',
  onConfirm,
  isConfirmed = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fallback to Web Speech API if backend audio is missing or fails
  const playWebSpeech = (spokenText: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(spokenText);
      const langLower = (language || '').toLowerCase();
      let targetLang = 'hi-IN';
      if (langLower.startsWith('en') || langLower === 'english') {
        targetLang = 'en-IN';
      } else if (langLower.startsWith('ta') || langLower === 'tamil') {
        targetLang = 'ta-IN';
      } else if (langLower.startsWith('te') || langLower === 'telugu') {
        targetLang = 'te-IN';
      }
      utterance.lang = targetLang;
      utterance.rate = 0.95;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const base = targetLang.split('-')[0].toLowerCase();
        const voice =
          voices.find((v) => v.lang.toLowerCase() === targetLang.toLowerCase()) ||
          voices.find((v) => v.lang.toLowerCase().startsWith(base)) ||
          voices[0];
        if (voice) utterance.voice = voice;
      }

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        setIsPlaying(false);
        setHasPlayed(true);
      };
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsPlaying(false);
    }
  };

  const getAudioSource = (): string | null => {
    if (audioUrl) {
      if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
        return audioUrl;
      }
      return audioUrl.startsWith('/') ? audioUrl : `/${audioUrl}`;
    }
    if (text && text.trim()) {
      return `/api/tts/synthesize?text=${encodeURIComponent(text.trim())}&language=${encodeURIComponent(language || 'hi')}`;
    }
    return null;
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    const src = getAudioSource();
    if (src) {
      if (!audioRef.current || audioRef.current.src !== src) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(src);
        audio.onended = () => {
          setIsPlaying(false);
          setHasPlayed(true);
        };
        audio.onerror = () => {
          // Fallback to Web Speech API
          if (text) playWebSpeech(text);
          else setIsPlaying(false);
        };
        audioRef.current = audio;
      }

      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          if (text) playWebSpeech(text);
          else setIsPlaying(false);
        });
    } else if (text) {
      playWebSpeech(text);
    }
  };

  const handleReplay = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
    }
    const src = getAudioSource();
    if (src) {
      const audio = new Audio(src);
      audio.onended = () => {
        setIsPlaying(false);
        setHasPlayed(true);
      };
      audio.onerror = () => {
        if (text) playWebSpeech(text);
        else setIsPlaying(false);
      };
      audioRef.current = audio;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          if (text) playWebSpeech(text);
          else setIsPlaying(false);
        });
    } else if (text) {
      playWebSpeech(text);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [audioUrl, text]);


  if (!text && !audioUrl) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200 rounded-xl p-3.5 shadow-xs mb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <button
            type="button"
            onClick={handlePlayToggle}
            className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-emerald-600 text-white animate-pulse shadow-sm'
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            }`}
            title={isPlaying ? "Pause voice read-back" : "Play Indic voice read-back"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" /> Indic Voice Read-Back (ASHA Confirmation)
              </span>
              {isPlaying && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-200 text-emerald-900 animate-pulse">
                  Speaking...
                </span>
              )}
            </div>
            <p className="text-xs text-slate-700 mt-1 line-clamp-2 italic bg-white/70 p-1.5 rounded border border-emerald-100/60 font-mono">
              "{text || 'Maine note kiya... Lakshmi Devi...'}"
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 self-center">
          <button
            type="button"
            onClick={handleReplay}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white/80 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            title="Replay from start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isConfirmed}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isConfirmed
                  ? 'bg-slate-100 text-slate-500 cursor-default border border-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isConfirmed ? 'Voice Confirmed' : 'Voice Confirm'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
