const speechLanguage: Record<string, string> = {
  English: "en-IN",
  Hindi: "hi-IN",
  Tamil: "ta-IN",
  Telugu: "te-IN",
  Bhojpuri: "hi-IN",
};

export function speakText(text: string, lang: string): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis || !text.trim()) return false;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const targetLang = speechLanguage[lang] || "en-IN";
    u.lang = targetLang;
    const baseLanguage = targetLang.split("-")[0].toLowerCase();
    
    let voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) {
      // Allow speech synthesis to use browser default utterance
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
      return true;
    }

    const voice = voices.find((item) => item.lang.toLowerCase() === targetLang.toLowerCase())
      || voices.find((item) => item.lang.toLowerCase().split("-")[0] === baseLanguage)
      || voices[0];

    if (voice) {
      u.voice = voice;
    }
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
    return true;
  } catch (err) {
    console.warn("Browser SpeechSynthesis fallback triggered:", err);
    return false;
  }
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((ev: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export function getSpeechRecognition(): SpeechRec | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Ctor) return null;
  return new Ctor();
}
