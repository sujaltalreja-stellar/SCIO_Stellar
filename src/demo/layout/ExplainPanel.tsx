import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Lightbulb, ListChecks, Sparkles, Target, X } from "lucide-react";
import { explainerFor } from "./explainers";

/** Top-bar button + slide-over that explains the current page in business terms. */
export default function ExplainButton() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const e = explainerFor(pathname);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!e) return null;
  const retail = pathname.startsWith("/app/retail");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] font-medium text-amber-800 transition hover:border-amber-300 hover:bg-amber-100"
        title="Explain this page in business terms"
      >
        <Lightbulb className="h-4 w-4" />
        <span className="hidden sm:inline">Explain this page</span>
      </button>

      {open &&
        createPortal(
        <div className="scio-login-explain fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="scio-page absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-white shadow-2xl">
            <div className="flex items-start gap-3 border-b border-slate-200 px-5 py-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700">
                <Lightbulb className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[11.5px] font-medium uppercase tracking-wider text-slate-400">Explain this page</div>
                <h2 className="text-[18px] font-semibold text-slate-900">{e.title}</h2>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <Section icon={BookOpen} title="What it shows">
                <p>{e.what}</p>
              </Section>
              <Section icon={Target} title="Why it matters">
                <p>{e.why}</p>
              </Section>
              <Section icon={ListChecks} title="How to use it">
                <ol className="space-y-1.5">
                  {e.how.map((h, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">{i + 1}</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ol>
              </Section>
              {e.terms && e.terms.length > 0 && (
                <Section icon={BookOpen} title="Terms in plain words">
                  <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                    {e.terms.map(([t, d]) => (
                      <div key={t} className="px-3 py-2.5">
                        <dt className="text-[13px] font-semibold text-slate-900">{t}</dt>
                        <dd className="text-[13px] text-slate-600">{d}</dd>
                      </div>
                    ))}
                  </dl>
                </Section>
              )}
            </div>

            {retail && e.ask && (
              <div className="border-t border-slate-200 p-4">
                <button
                  onClick={() => navigate("/app/retail/ask", { state: { question: e.ask } })}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#111113] py-2.5 text-[14px] font-medium text-[#fff] ring-1 ring-[#fff]/10 hover:bg-[#2a2a30]"
                >
                  <Sparkles className="h-4 w-4 text-[#f2a93b]" /> Ask SCIO: “{e.ask}”
                </button>
              </div>
            )}
          </aside>
        </div>,
          document.body
        )}
    </>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-wider text-slate-500">
        <Icon className="h-3.5 w-3.5" /> {title}
      </h3>
      <div className="text-[14px] leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}
