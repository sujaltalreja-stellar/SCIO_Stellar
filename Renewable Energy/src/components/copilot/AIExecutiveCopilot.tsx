import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "../../lib/convex";
import { api } from "../../lib/convex";
import {
  MessageSquare, Send, Bot, User, Sparkles, Database,
  ChevronRight, RotateCcw, Clock, Loader2, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_PROMPTS = [
  "Which plants have the highest operational risk?",
  "Predict maintenance costs for the next quarter.",
  "Summarize executive KPIs for today's operations.",
  "Which assets should be replaced within the next 6 months?",
  "Identify procurement bottlenecks.",
  "Compare procurement efficiency across all regions.",
  "Generate a board-level operational summary.",
  "Recommend actions to improve plant efficiency.",
];

function formatMessage(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    // Bold **text**
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i} className="leading-relaxed">
        {parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part
        )}
      </p>
    );
  });
}

export default function AIExecutiveCopilot() {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(`sess_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversations = useQuery(api.copilot.listConversations) ?? [];
  const sendMessage = useMutation(api.copilot.sendMessage);

  const displayMessages = conversations;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, isTyping]);

  const handleSend = async (content?: string) => {
    const msg = content ?? input.trim();
    if (!msg) return;
    setInput("");
    setIsTyping(true);
    try {
      await sendMessage({ content: msg, sessionId });
    } finally {
      setTimeout(() => setIsTyping(false), 800);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ minHeight: "calc(100vh - 180px)" }}>
      {/* Header */}
      <div className="border-b border-zinc-900 pb-5 mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              AI Executive Copilot
              <span className="text-xs font-mono px-2 py-0.5 rounded border border-zinc-700 text-zinc-400 bg-slate-800/35">GPT-4o Powered</span>
            </h2>
            <p className="text-xs text-zinc-500 font-mono">ENTERPRISE AI ASSISTANT — DATA-GROUNDED OPERATIONAL INTELLIGENCE</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />Connected to 15 data sources
            </span>
          </div>
        </div>

        {/* Data Source Badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          {["SCADA Telemetry","Asset Registry","Alarm Console","Work Orders","Procurement","Finance","ESG Data","AI Insights","Forecasts"].map(src => (
            <span key={src} className="flex items-center gap-1 text-[9px] font-mono bg-zinc-900/60 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
              <Database className="w-2.5 h-2.5 text-emerald-400" />{src}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 gap-5 min-h-0">
        {/* Quick Prompts Sidebar */}
        <div className="hidden lg:flex flex-col gap-2 w-56 flex-shrink-0">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider font-mono text-zinc-500 mb-1">Quick Prompts</h3>
          {QUICK_PROMPTS.map((prompt, i) => (
            <button key={i} onClick={() => handleSend(prompt)}
              className="text-left text-[11px] text-zinc-400 hover:text-white font-mono bg-zinc-950/30 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-700 rounded-lg px-3 py-2.5 transition-all leading-relaxed flex items-start gap-2">
              <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-emerald-400" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
            {displayMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Aetheris AI Copilot</h3>
                <p className="text-zinc-400 text-sm max-w-md">Ask me anything about your renewable energy portfolio — generation, maintenance, procurement, ESG, or financial performance.</p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {QUICK_PROMPTS.slice(0,4).map((p, i) => (
                    <button key={i} onClick={() => handleSend(p)}
                      className="text-[11px] text-zinc-400 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 rounded-lg px-3 py-1.5 transition-all font-mono">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {displayMessages.map((msg: any, i: number) => (
                <motion.div key={msg._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center ${msg.role === "assistant" ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-zinc-800 border border-zinc-700"}`}>
                    {msg.role === "assistant" ? <Bot className="w-4 h-4 text-emerald-400" /> : <User className="w-4 h-4 text-zinc-400" />}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-zinc-200 rounded-tr-sm"
                        : "bg-zinc-900/80 border border-zinc-800 text-zinc-300 rounded-tl-sm"
                    }`}>
                      {msg.role === "assistant" ? formatMessage(msg.content) : <p>{msg.content}</p>}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-mono text-zinc-600">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {msg.dataUsed && msg.dataUsed.length > 0 && (
                        <div className="flex gap-1">
                          {msg.dataUsed.slice(0,3).map((d: string) => (
                            <span key={d} className="text-[8px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-600 px-1.5 py-0.5 rounded">
                              {d}
                            </span>
                          ))}
                          {msg.dataUsed.length > 3 && <span className="text-[8px] font-mono text-zinc-600">+{msg.dataUsed.length - 3}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center">
                    <span className="text-xs text-zinc-500 font-mono">Analyzing data</span>
                    <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-end gap-3 bg-zinc-950/50 border border-zinc-900 rounded-2xl p-3">
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder="Ask about plant performance, maintenance costs, ESG, procurement, risk…"
              rows={2}
              className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 resize-none outline-none font-sans leading-relaxed" />
            <button onClick={() => handleSend()} disabled={!input.trim() || isTyping}
              className="flex-shrink-0 h-9 w-9 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black rounded-xl flex items-center justify-center transition-all">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-[9px] text-zinc-700 font-mono mt-2">Press Enter to send · Shift+Enter for new line · Data-grounded from 15 live operational sources</p>

          {/* Mobile Quick Prompts */}
          <div className="flex lg:hidden gap-2 mt-3 overflow-x-auto pb-1">
            {QUICK_PROMPTS.slice(0,4).map((p, i) => (
              <button key={i} onClick={() => handleSend(p)}
                className="flex-shrink-0 text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono whitespace-nowrap">
                {p.slice(0, 30)}…
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
