"use client";

import React, { useState } from "react";
import {
  Search,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { C, SHELL, renderFaqFormattedAnswer, ENTERPRISE_QUESTIONS_DATA } from "../shared";
import { useSite } from "../../site/SiteContext";

export default function FaqSection() {
  const { openDemo } = useSite();
  // Enterprise Questions (FAQ) Section State
  const [faqSearchQuery, setFaqSearchQuery] = useState("");
  const [faqCategory, setFaqCategory] = useState<"all" | "platform" | "deployment" | "ai" | "roi">("all");
  const [openFaqIds, setOpenFaqIds] = useState<number[]>([1, 2]);

  const toggleFaq = (id: number) => {
    setOpenFaqIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = ENTERPRISE_QUESTIONS_DATA.filter((faq) => {
    const matchesCategory = faqCategory === "all" || faq.category === faqCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
      faq.answerText.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
      (faq.badges && faq.badges.some((b) => b.toLowerCase().includes(faqSearchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* ==================== 10.5 ENTERPRISE QUESTIONS (FAQ) ==================== */}
      <section id="enterprise-questions" className="py-24 border-t" style={{ background: C.night, borderColor: C.lineDark }}>
        <div className={`${SHELL} space-y-12`}>
          {/* Section Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono text-[11px] font-bold uppercase tracking-widest">
              <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
              <span>Enterprise Questions</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white">
              Straight answers for enterprise deployment.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-sans leading-relaxed">
              Clear architecture, governance, security, and integration facts for enterprise decision-makers.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-center">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                  placeholder="Search questions (e.g. SAP, air-gapped, governance, ROI)..."
                  className="w-full pl-11 pr-10 py-3 rounded-xl border bg-slate-900/80 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-cyan-500/60 transition-colors"
                  style={{ borderColor: C.lineDark }}
                />
                {faqSearchQuery && (
                  <button
                    onClick={() => setFaqSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Expand / Collapse All */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOpenFaqIds(filteredFaqs.map((f) => f.id))}
                  className="px-3.5 py-2.5 rounded-lg border border-white/10 bg-slate-900 text-xs font-mono font-bold text-slate-300 hover:text-white hover:border-white/20 transition-all"
                >
                  Expand All
                </button>
                <button
                  onClick={() => setOpenFaqIds([])}
                  className="px-3.5 py-2.5 rounded-lg border border-white/10 bg-slate-900 text-xs font-mono font-bold text-slate-300 hover:text-white hover:border-white/20 transition-all"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { id: "all", label: "All Questions", count: 20 },
                { id: "platform", label: "Platform & ERP", count: 6 },
                { id: "deployment", label: "Deployment & Security", count: 5 },
                { id: "ai", label: "AI & Governance", count: 4 },
                { id: "roi", label: "Value & Implementation", count: 5 },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFaqCategory(cat.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 border ${
                    faqCategory === cat.id
                      ? "bg-cyan-500 text-black border-cyan-400 shadow-lg shadow-cyan-500/20 font-extrabold"
                      : "bg-slate-900/60 text-slate-300 border-white/10 hover:border-white/25 hover:text-white"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      faqCategory === cat.id ? "bg-black/20 text-black font-black" : "bg-white/10 text-slate-400"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Accordion Questions List */}
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredFaqs.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-white/10 bg-slate-900/50 space-y-3">
                <p className="text-slate-400 font-mono text-sm">
                  No enterprise questions match your search &quot;{faqSearchQuery}&quot;.
                </p>
                <button
                  onClick={() => {
                    setFaqSearchQuery("");
                    setFaqCategory("all");
                  }}
                  className="px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded-lg font-mono text-xs font-bold hover:bg-cyan-500/30 transition-all"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = openFaqIds.includes(faq.id);
                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? "border-cyan-500/40 bg-slate-900/90 shadow-xl shadow-cyan-500/5"
                        : "border-white/10 bg-slate-900/40 hover:border-white/20 hover:bg-slate-900/60"
                    }`}
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-6 text-left flex items-start justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-4">
                        <span className="font-mono font-bold text-xs text-cyan-400/70 pt-0.5 shrink-0">
                          {faq.id < 10 ? `0${faq.id}` : faq.id}
                        </span>
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider bg-white/5 text-slate-400 border border-white/10 mb-1">
                            {faq.categoryName}
                          </span>
                          <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-cyan-300 transition-colors font-sans">
                            {faq.question}
                          </h3>
                        </div>
                      </div>
                      <div
                        className={`p-2 rounded-lg border shrink-0 transition-transform duration-200 ${
                          isOpen
                            ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 rotate-180"
                            : "bg-white/5 border-white/10 text-slate-400"
                        }`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                          <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4 ml-10">
                            {/* Formatted Answer */}
                            <div className="space-y-3">
                              {renderFaqFormattedAnswer(faq)}
                            </div>

                            {/* Takeaway Badges */}
                            {faq.badges && faq.badges.length > 0 && (
                              <div className="pt-3 flex flex-wrap items-center gap-2 border-t border-white/5">
                                {faq.badges.map((b, i) => (
                                  <span
                                    key={i}
                                    className="px-2.5 py-1 rounded-md text-[10.5px] font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5"
                                  >
                                    <CheckCircle2 className="h-3 w-3 text-cyan-400" />
                                    <span>{b}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {/* Website Section CTA */}
          <div className="max-w-4xl mx-auto pt-6">
            <div className="p-8 sm:p-12 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 text-center space-y-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Have a specific operational challenge?
              </h3>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed font-medium">
                Let&apos;s explore how SCIO can connect your existing systems, operational data and workflows into one governed intelligence layer.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => openDemo()}
                  className="px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm font-mono shadow-xl transition-all hover:scale-105 bg-cyan-400 text-black hover:bg-cyan-300 border border-cyan-300"
                >
                  Request a SCIO Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
