import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { transcribeAudio } from '@/lib/api';

interface MicInputProps {
  onTranscript?: (transcript: string) => void;
  language?: string;
}

export function MicInput({ onTranscript, language = 'hi' }: MicInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToBackend(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const sendAudioToBackend = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const data = await transcribeAudio(blob, language);
      if (data?.transcript && onTranscript) {
        onTranscript(data.transcript);
      }
    } catch (error) {
      console.error('Transcription error:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isTranscribing}
        className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 focus:outline-none ${
          isRecording
            ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200 dark:ring-rose-900'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:scale-105'
        } ${isTranscribing ? 'opacity-70 cursor-not-allowed' : ''}`}
        aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
      >
        {isTranscribing ? (
          <Loader2 className="w-8 h-8 animate-spin" />
        ) : isRecording ? (
          <Square className="w-7 h-7" />
        ) : (
          <Mic className="w-8 h-8" />
        )}
      </button>

      <div className="text-center">
        {isRecording && (
          <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">
            Recording: {formatTime(recordingSeconds)}
          </span>
        )}
        {isTranscribing && (
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Transcribing audio with Whisper ASR...
          </span>
        )}
        {!isRecording && !isTranscribing && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Click to record clinical notes
          </span>
        )}
      </div>
    </div>
  );
}

export default MicInput;
