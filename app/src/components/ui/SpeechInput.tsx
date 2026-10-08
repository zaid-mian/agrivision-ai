import { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SpeechInputProps {
  onResult: (text: string) => void;
  className?: string;
}

export default function SpeechInput({ onResult, className = "" }: SpeechInputProps) {
  const { i18n, t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Check speech recognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          onResult(text);
        }
      };

      setRecognition(rec);
    }
  }, [onResult]);

  const toggleListening = () => {
    if (!recognition) {
      alert("Voice speech recognition is not supported in this browser environment. Please use premium Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      // Set language dynamically
      recognition.lang = i18n.language === "ur" ? "ur-PK" : "en-US";
      recognition.start();
    }
  };

  if (!recognition) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      title={isListening ? t("assistant.stopListening") : t("assistant.speechBtn")}
      className={`relative p-3 rounded-xl transition-all duration-200 border cursor-pointer ${
        isListening
          ? "bg-red-500/20 border-red-500/50 text-red-400 animate-pulse scale-105"
          : "bg-[#2D6A4F]/20 border-[#2D6A4F]/40 text-[#74C69D] hover:bg-[#2D6A4F]/30"
      } ${className}`}
    >
      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
      {isListening && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
    </button>
  );
}
