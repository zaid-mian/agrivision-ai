import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Send, Sparkles, BookOpen, User, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Card from "../components/ui/Card";
import SpeechInput from "../components/ui/SpeechInput";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  sources?: string[];
  relevanceScore?: number;
  retrievalLatencyMs?: number;
  date: Date;
}

export default function RAGAssistant() {
  const { user, token, logout } = useAuth();
  const { t } = useTranslation();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init_1",
      text: "As-salamu Alaykum! I am your AI Agriculture Expert, synced with 50+ local crop diagnostic templates. Ask me about late blights, N-P-K nutrients, watercycles, soil pH, organic pest controls, and seasonal rotations. You can type in English/Urdu, or use our speech button to talk!",
      sender: "bot",
      date: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!question.trim()) return;

    const userText = question;
    setQuestion("");

    // Push User message
    const userMsg: Message = {
      id: "_" + Math.random().toString(36).substr(2, 9),
      text: userText,
      sender: "user",
      date: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/assistant/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ question: userText })
      });

      if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error("Your session has expired. Please log in again.");
      }

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error("Local RAG search failing");
      }

      const botMsg: Message = {
        id: "_" + Math.random().toString(36).substr(2, 9),
        text: json.data.answer,
        sender: "bot",
        sources: json.data.sources,
        relevanceScore: json.data.relevance_score,
        retrievalLatencyMs: json.data.retrieval_latency_ms,
        date: new Date()
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: "_" + Math.random().toString(36).substr(2, 9),
        text: "I experienced momentary difficulty recalling my soil databases. Double-check your network link and ask again!",
        sender: "bot",
        date: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = (text: string) => {
    setQuestion(text);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-4 pb-4 font-sans max-w-5xl mx-auto">
      {/* Header title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-serif flex items-center gap-2">
          <Sparkles className="text-[#74C69D] animate-pulse" size={24} />
          {t("assistant.title")}
        </h1>
        <p className="text-white/60 text-xs mt-1">
          Query our offline Agronomic knowledge-base in real-time. Use speech input for hands-free queries on the tractor!
        </p>
      </div>

      {/* Main chat terminal layout */}
      <Card hoverEffect={false} className="flex-1 flex flex-col bg-black/40 border-white/10 p-4 h-full min-h-0 overflow-hidden relative">
        {/* Background logo marker */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
          <BookOpen size={300} className="text-[#74C69D]" />
        </div>

        {/* Message history thread container */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 select-text max-h-full">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 max-w-xl ${m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {/* Avatar circle */}
              <div className={`p-2 h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs select-none shadow-md shrink-0 border ${m.sender === "user"
                  ? "bg-[#2D6A4F] border-[#74C69D]/30 text-white"
                  : "bg-white/10 border-white/10 text-[#74C69D]"
                }`}>
                {m.sender === "user" ? <User size={14} /> : "AI"}
              </div>

              {/* Text Bubble */}
              <div className={`p-4 rounded-2xl relative ${m.sender === "user"
                  ? "bg-white/10 text-white rounded-tr-none border border-white/5"
                  : "bg-[#2D6A4F]/10 border border-[#2D6A4F]/20 text-white/95 rounded-tl-none leading-relaxed"
                }`}>
                <p className="text-xs">{m.text}</p>

                {/* Source listings and semantic retrieval telemetry */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3.5 pt-2 border-t border-white/5 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 flex items-center gap-1">
                        <BookOpen size={10} />
                        {t("assistant.sources")}:
                      </span>
                      {m.retrievalLatencyMs !== undefined && (
                        <span className="text-[9px] font-mono bg-[#2D6A4F]/20 text-[#74C69D] border border-[#74C69D]/30 px-1.5 py-0.5 rounded">
                          ⚡ {m.retrievalLatencyMs}ms BM25 Retrieval
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {m.sources.map((src, i) => (
                        <span key={i} className="text-[9px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/60">
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Typing state mock */}
          {isTyping && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="p-2 h-9 w-9 rounded-xl flex items-center justify-center bg-white/10 border border-white/10 text-[#74C69D] text-xs shadow-md select-none">
                AI
              </div>
              <div className="p-4 bg-[#2D6A4F]/10 border border-[#2D6A4F]/20 rounded-2xl rounded-tl-none flex items-center gap-1.5 h-11 py-2">
                <span className="w-1.5 h-1.5 bg-[#74C69D] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-[#74C69D] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-[#74C69D] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Query form input field footer bar */}
        <form onSubmit={handleSend} className="flex gap-3 items-center border-t border-white/5 pt-4 bg-transparent shrink-0">
          <SpeechInput onResult={handleVoiceInput} />

          <input
            type="text"
            required
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t("assistant.placeholder")}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs placeholder-white/30 focus:outline-none focus:border-[#74C69D] focus:ring-1 focus:ring-[#74C69D]"
          />

          <button
            type="submit"
            className="p-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white border border-[#2D6A4F]/50 rounded-xl transition cursor-pointer flex items-center justify-center self-stretch"
          >
            <Send size={16} />
          </button>
        </form>
      </Card>
    </div>
  );
}
