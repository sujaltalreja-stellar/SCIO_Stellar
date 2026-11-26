"use client";

import React, { useEffect, useRef } from "react";
import { useForm, ValidationError } from "@formspree/react";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export const FORMSPREE_ID = "mnpdwgvw";

type Variant = "demo" | "beta" | "contact";

const COPY: Record<Variant, { title: string; subtitle: string; submit: string; done: string; source: string }> = {
  demo: {
    title: "Book a demo",
    subtitle: "See SCIO on your kind of data. We'll reply within one business day.",
    submit: "Request a demo",
    done: "Thanks. We'll be in touch within one business day to set up your demo.",
    source: "Website: demo request",
  },
  beta: {
    title: "Join the private beta",
    subtitle: "We're onboarding a small number of businesses. Tell us about yours.",
    submit: "Apply for the beta",
    done: "Thanks for applying. We'll review your details and get back to you shortly.",
    source: "Website: beta application",
  },
  contact: {
    title: "Talk to our team",
    subtitle: "Questions about SCIO, pricing or a pilot? Send us a note.",
    submit: "Send message",
    done: "Thanks. Your message is with our team and we'll reply soon.",
    source: "Website: contact page",
  },
};

const inputCls =
  "w-full rounded-xl border border-[#D6D3CE] bg-white px-4 py-3 text-[15px] text-[#111113] placeholder:text-[#a19d96] focus:border-[#111113] focus:outline-none focus:ring-2 focus:ring-[#f2a93b]/40";
const labelCls = "block text-[13px] font-semibold text-[#111113] mb-1.5";
const errCls = "mt-1 block text-[12px] text-red-600";

export function LeadForm({ variant }: { variant: Variant }) {
  const [state, handleSubmit] = useForm(FORMSPREE_ID);
  const copy = COPY[variant];
  const lastSubmissionRef = useRef<Record<string, string> | null>(null);
  const confirmationSentRef = useRef(false);

  useEffect(() => {
    if (!state.succeeded || confirmationSentRef.current || !lastSubmissionRef.current) return;
    const payload = lastSubmissionRef.current;
    if (!payload.email) return;
    confirmationSentRef.current = true;
    fetch("/api/contact/confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant, ...payload }),
    }).catch(() => {});
  }, [state.succeeded, variant]);

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    lastSubmissionRef.current = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      company: String(fd.get("company") || ""),
      role: String(fd.get("role") || ""),
      businessType: String(fd.get("businessType") || ""),
      locations: String(fd.get("locations") || ""),
      message: String(fd.get("message") || ""),
    };
    confirmationSentRef.current = false;
    return handleSubmit(e);
  };

  if (state.succeeded) {
    return (
      <div className="flex flex-col items-start gap-4 py-6" role="status">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        <p className="text-[18px] font-semibold text-[#111113]">{copy.done}</p>
      </div>
    );
  }

  const id = (n: string) => `${variant}-${n}`;
  return (
    <form onSubmit={onFormSubmit} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="_subject" value={copy.source} />
      <input type="hidden" name="source" value={copy.source} />
      <div>
        <label htmlFor={id("name")} className={labelCls}>Full name</label>
        <input id={id("name")} name="name" required autoComplete="name" className={inputCls} placeholder="Your name" />
      </div>
      <div>
        <label htmlFor={id("email")} className={labelCls}>Work email</label>
        <input id={id("email")} name="email" type="email" required autoComplete="email" className={inputCls} placeholder="you@company.com" />
        <ValidationError prefix="Email" field="email" errors={state.errors} className={errCls} />
      </div>
      <div>
        <label htmlFor={id("company")} className={labelCls}>Company</label>
        <input id={id("company")} name="company" required autoComplete="organization" className={inputCls} placeholder="Company name" />
      </div>
      <div>
        <label htmlFor={id("role")} className={labelCls}>Role</label>
        <input id={id("role")} name="role" autoComplete="organization-title" className={inputCls} placeholder="e.g. Head of Operations" />
      </div>
      <div>
        <label htmlFor={id("businessType")} className={labelCls}>Business type</label>
        <select id={id("businessType")} name="businessType" className={inputCls} defaultValue="">
          <option value="" disabled>Select one</option>
          <option>Retail / multi-store</option>
          <option>Distribution / wholesale</option>
          <option>FMCG / consumer goods</option>
          <option>Logistics / transport</option>
          <option>Manufacturing / production</option>
          <option>E-commerce / omnichannel</option>
          <option>Services</option>
          <option>Other</option>
        </select>
      </div>
      <div>
        <label htmlFor={id("locations")} className={labelCls}>Locations</label>
        <select id={id("locations")} name="locations" className={inputCls} defaultValue="">
          <option value="" disabled>Select one</option>
          <option>1</option>
          <option>2–10</option>
          <option>11–50</option>
          <option>50+</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={id("message")} className={labelCls}>
          {variant === "contact" ? "Message" : "Which systems do you use today? (optional)"}
        </label>
        <textarea
          id={id("message")}
          name="message"
          rows={3}
          required={variant === "contact"}
          className={inputCls}
          placeholder={variant === "contact" ? "How can we help?" : "e.g. SAP for finance, a POS in each store, Excel for purchasing"}
        />
        <ValidationError prefix="Message" field="message" errors={state.errors} className={errCls} />
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={state.submitting}
          className="group inline-flex items-center gap-2 rounded-full bg-[#111113] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#2a2a30] disabled:opacity-60 cursor-pointer"
        >
          {state.submitting ? "Sending…" : copy.submit}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
        <ValidationError errors={state.errors} className={errCls} />
      </div>
    </form>
  );
}

export function LeadModal({ variant, open, onClose }: { variant: Exclude<Variant, "contact">; open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  const copy = COPY[variant];
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${variant}-modal-title`}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white p-6 sm:p-10 shadow-2xl"
          >
            <button
              ref={closeRef}
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute right-4 top-4 h-10 w-10 rounded-full flex items-center justify-center text-[#5d5a54] hover:bg-[#F3F2EF] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 id={`${variant}-modal-title`} className="font-display text-[30px] font-bold tracking-tight text-[#111113]">
              {copy.title}
            </h2>
            <p className="mt-2 mb-7 text-[15px] text-[#5d5a54]">{copy.subtitle}</p>
            <LeadForm variant={variant} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
