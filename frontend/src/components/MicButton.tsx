import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

interface MicButtonProps {
  isListening: boolean;
  onToggle: () => void;
  disabled?: boolean;
  activeLang?: string;
}

export function MicButton({
  isListening,
  onToggle,
  disabled = false,
  activeLang = 'Hindi',
}: MicButtonProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isListening) {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsedSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isListening]);

  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-label={isListening ? 'Stop recording' : 'Start voice recording'}
        title={isListening ? 'Stop recording' : `Record voice in ${activeLang}`}
        className={`relative w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-md ${
          isListening
            ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-200 dark:ring-rose-950 scale-105 shadow-rose-500/30'
            : 'bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-primary-500/20 hover:scale-105 active:scale-95'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {isListening && (
          <span className="absolute inset-0 rounded-2xl bg-rose-500 animate-ping opacity-40 pointer-events-none" />
        )}
        {isListening ? (
          <Square className="w-5 h-5 fill-current text-white relative z-10" />
        ) : (
          <Mic className="w-5 h-5 text-white relative z-10" />
        )}
      </button>

      {/* Recording live feedback indicator badge */}
      {isListening && (
        <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-3 py-1.5 rounded-xl shadow-xs animate-slide-up">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
          </span>
          <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
            Recording...
          </span>
          <span className="text-xs font-mono font-bold text-rose-800 dark:text-rose-200 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-900">
            {timeFormatted}
          </span>
          <button
            type="button"
            onClick={onToggle}
            className="text-[11px] font-bold text-rose-700 underline hover:text-rose-900 ml-1"
          >
            Stop
          </button>
        </div>
      )}
    </div>
  );
}

export default MicButton;
