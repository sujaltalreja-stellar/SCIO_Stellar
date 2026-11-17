"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUp, Check, ChevronDown, Copy, RotateCcw, Sparkles } from "lucide-react";

export interface SiteChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  provider?: string;
  suggestedAction?: { type: string; label: string; payload?: unknown } | null;
  followUps?: string[];
}

/** Minimal markdown: paragraphs, "- " / "• " bullets, **bold**. */
function RichText({ text }: { text: string }) {
  const inline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i} className="font-semibold text-[#111113]">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      )
    );
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <div className="space-y-2.5">
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter(Boolean);
        if (lines.length && lines.every((l) => /^\s*([-•*]|\d+\.)\s+/.test(l))) {
          return (
            <ul key={bi} className="space-y-1.5">
              {lines.map((l, li) => (
                <li key={li} className="flex gap-2">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#F2A93B]" />
                  <span>{inline(l.replace(/^\s*([-•*]|\d+\.)\s+/, ""))}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi} className="whitespace-pre-line">
            {inline(block)}
          </p>
        );
      })}
    </div>
  );
}

function Face({ size = 36, eyeOffset, blinking }: { size?: number; eyeOffset: { x: number; y: number }; blinking: boolean }) {
  return (
    <span
      className="relative flex shrink-0 items-center justify-center rounded-xl bg-[#111113]"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="flex flex-col items-center" style={{ transform: `translate(${eyeOffset.x * 0.4}px, ${eyeOffset.y * 0.4}px)` }}>
        <span className="flex gap-1.5">
          {[0, 1].map((i) => (
            <span
              key={i}
              className="h-2.5 w-1.5 rounded-full bg-[#F2A93B] shadow-[0_0_8px_rgba(242,169,59,0.9)] transition-transform duration-100"
              style={{ transform: blinking ? "scaleY(0.1)" : "scaleY(1)" }}
            />
          ))}
        </span>
        <svg className="mt-0.5 h-1.5 w-3.5" viewBox="0 0 16 8" fill="none">
          <path d="M 2 2 Q 8 7 14 2" stroke="#F2A93B" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
    </span>
  );
}

export default function SiteChatWindow({
  messages,
  isLoading,
  input,
  setInput,
  onSend,
  onClear,
  onClose,
  onAction,
  quickPrompts,
  eyeOffset,
  blinking,
}: {
  messages: SiteChatMessage[];
  isLoading: boolean;
  input: string;
  setInput: (v: string) => void;
  onSend: (q?: string) => void;
  onClear: () => void;
  onClose: () => void;
  onAction: (a: { type: string; label: string; payload?: unknown }) => void;
  quickPrompts: { label: string; query: string }[];
  eyeOffset: { x: number; y: number };
  blinking: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const onlyWelcome = messages.length <= 1;
  const last = messages[messages.length - 1];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const copy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1600);
    }).catch(() => {});
  };

  return (
    <motion.div
      role="dialog"
      aria-label="Chat with SCIO"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.96 }}
      transition={{ type: "spring", damping: 28, stiffness: 320 }}
      className="mb-3 flex h-[min(620px,calc(100vh-120px))] w-[calc(100vw-32px)] sm:w-[420px] flex-col overflow-hidden rounded-3xl border border-[#E7E5E1] bg-white font-sans text-[#111113] shadow-[0_30px_80px_-24px_rgba(17,17,19,0.45)]"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#EFEEEB] px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <Face eyeOffset={eyeOffset} blinking={blinking} />
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[15px] font-semibold">
              SCIO Assistant
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
              </span>
            </p>
            <p className="truncate text-[12.5px] text-[#6b6862]">Ask about the product, setup, security or pricing</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center">
          <button type="button" onClick={onClear} aria-label="Start a new conversation" title="New conversation" className="flex h-8 w-8 items-center justify-center rounded-full text-[#8f8b84] hover:bg-[#F3F2EF] hover:text-[#111113] cursor-pointer">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button type="button" onClick={onClose} aria-label="Minimise chat" className="flex h-8 w-8 items-center justify-center rounded-full text-[#8f8b84] hover:bg-[#F3F2EF] hover:text-[#111113] cursor-pointer">
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-[#FAFAF9] px-4 py-5" aria-live="polite">
        {messages.map((m) => {
          const bot = m.sender === "bot";
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${bot ? "items-start gap-2.5" : "justify-end"}`}>
              {bot && <Face size={28} eyeOffset={{ x: 0, y: 0 }} blinking={false} />}
              <div className={`max-w-[85%] ${bot ? "" : "text-right"}`}>
                <div
                  className={`inline-block text-left text-[14px] leading-relaxed ${
                    bot
                      ? "rounded-2xl rounded-tl-md border border-[#EEECE8] bg-white px-4 py-3 text-[#2b2a27]"
                      : "rounded-2xl rounded-tr-md bg-[#111113] px-4 py-2.5 text-white"
                  }`}
                >
                  {bot ? <RichText text={m.text} /> : m.text}
                  {bot && m.suggestedAction && (
                    <button
                      type="button"
                      onClick={() => onAction(m.suggestedAction!)}
                      className="group mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#111113] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#2a2a30] cursor-pointer"
                    >
                      {m.suggestedAction.label}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  )}
                </div>
                <div className={`mt-1 flex items-center gap-2 px-1 text-[11px] text-[#a19d96] ${bot ? "" : "justify-end"}`}>
                  <span>{m.timestamp}</span>
                  {bot && !m.id.startsWith("welcome") && (
                    <button type="button" onClick={() => copy(m.id, m.text)} className="inline-flex items-center gap-1 hover:text-[#111113] cursor-pointer">
                      {copied === m.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      {copied === m.id ? "Copied" : "Copy"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Starter questions (fresh chat) or the latest answer's follow-ups */}
        {!isLoading && (onlyWelcome || (last?.sender === "bot" && last.followUps?.length)) && (
          <div className="flex flex-wrap gap-2 pl-[38px]">
            {(onlyWelcome ? quickPrompts.map((q) => ({ label: q.label.replace(/^\p{Extended_Pictographic}\s*/u, ""), query: q.query })) : last!.followUps!.map((f) => ({ label: f, query: f }))).map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => onSend(q.query)}
                className="rounded-full border border-[#E7E5E1] bg-white px-3 py-1.5 text-left text-[13px] font-medium text-[#3a3936] hover:border-[#111113] hover:text-[#111113] cursor-pointer"
              >
                {q.label}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-2.5">
            <Face size={28} eyeOffset={{ x: 0, y: 0 }} blinking={false} />
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-[#EEECE8] bg-white px-4 py-3">
              {[0, 150, 300].map((d) => (
                <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-[#F2A93B]" style={{ animationDelay: `${d}ms` }} />
              ))}
              <span className="ml-1 text-[12.5px] text-[#8f8b84]">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="shrink-0 border-t border-[#EFEEEB] bg-white p-3"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-[#D6D3CE] bg-white px-3 py-2 focus-within:border-[#111113]">
          <Sparkles className="mb-2 h-4 w-4 shrink-0 text-[#F2A93B]" aria-hidden="true" />
          <label htmlFor="site-chat-input" className="sr-only">Ask SCIO</label>
          <textarea
            id="site-chat-input"
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Ask anything about SCIO…"
            className="max-h-28 flex-1 resize-none bg-transparent py-1.5 text-[14px] text-[#111113] placeholder:text-[#a19d96] focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Send"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#111113] text-white transition-colors hover:bg-[#2a2a30] disabled:bg-[#D6D3CE] cursor-pointer"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-[#a19d96]">Answers come from SCIO's product information. For pricing, book a demo.</p>
      </form>
    </motion.div>
  );
}
