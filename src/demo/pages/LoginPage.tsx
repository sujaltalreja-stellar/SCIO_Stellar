import React, { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowRight, Eye, EyeOff, Sparkles, ShieldCheck, LineChart, ScanSearch, Loader2, Activity, Database, Boxes, ShoppingCart, PackageSearch, CheckCircle2 } from "lucide-react";
import { DEMO_ACCOUNTS, useDemoAuth } from "../auth";
import { ScioLogo } from "../layout/ScioLogo";
import { Aurora, cx } from "../ui";
import { ThemeToggle } from "../theme";

const FEATURES = [
  { icon: Sparkles, title: "AI Operations Copilot", text: "Ask in plain language, get answers with evidence and next actions." },
  { icon: LineChart, title: "Predictive inventory", text: "Forecast stockouts and overstock before they cost you sales." },
  { icon: ScanSearch, title: "Vision & document AI", text: "Inspect shelves and equipment, read invoices and match POs." },
  { icon: ShieldCheck, title: "Human in the loop", text: "Every action is role-checked, approved and audited." },
];

const DarkField = ({ label, icon: Icon, children }: { label: string; icon: typeof Mail; children: React.ReactNode }) => (
  <label className="block">
    <span className="font-mono text-xs font-bold tracking-[.1em] text-slate-300">{label.toUpperCase()}</span>
    <div className="mt-2 flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/[0.07] px-3.5 shadow-inner transition focus-within:border-cyan-400/60 focus-within:bg-cyan-400/[0.07] focus-within:ring-4 focus-within:ring-cyan-400/10">
      <Icon className="h-5 w-5 shrink-0 text-slate-300" />
      {children}
    </div>
  </label>
);

/**
 * Home-page-matched login experience.
 *
 * Rollback: change the returned component below from HomeStyleLoginPage to
 * LegacyLoginPage. The previous UI is intentionally retained in this file.
 */
export default function LoginPage() {
  return <HomeStyleLoginPage />;
}

function HomeStyleLoginPage() {
  const { user, login } = useDemoAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const from = (location.state as { from?: string } | null)?.from || "/app";
  if (user) return <Navigate to={user.email.toLowerCase() === "sujal.talreja@stellarmind.ai" ? "/app/retail/master" : from} replace />;

  const signIn = (em: string, pw: string, to = from) => {
    setBusy(true);
    setError("");
    login(em, pw).then(
      (ok) => {
        if (ok) navigate(em.trim().toLowerCase() === "sujal.talreja@stellarmind.ai" ? "/app/retail/master" : to, { replace: true });
        else {
          setError("Incorrect email or password.");
          setBusy(false);
        }
      },
      () => {
        setError("Could not reach the server. Please try again.");
        setBusy(false);
      }
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn(email, password);
  };

  return (
    <main className="scio-login min-h-screen bg-[#f8fafc] font-sans text-[#090d16]">
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-[#fff]/95 px-5 shadow-sm backdrop-blur-xl sm:px-8 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#090d16] font-mono text-sm font-black text-[#fff] shadow-sm">S</div>
          <div className="leading-none">
            <div className="flex items-center gap-1.5 text-sm font-extrabold tracking-tight">
              STELLAR SCIO <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            </div>
            <div className="mt-1 font-mono text-[11px] font-bold tracking-[.12em] text-slate-600">OPERATIONAL AI PLATFORM</div>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-mono text-xs font-bold text-emerald-800 sm:flex">
          <ShieldCheck className="h-3.5 w-3.5" /> PRIVATE ENTERPRISE WORKSPACE
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[minmax(0,1.12fr)_minmax(460px,.88fr)]">
        <section className="relative overflow-hidden px-5 py-10 sm:px-10 lg:px-12 lg:py-14 xl:px-20">
          <div aria-hidden className="absolute -left-40 top-24 h-80 w-80 rounded-full bg-blue-200/35 blur-3xl" />
          <div aria-hidden className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-100/50 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(#0f172a_1px,transparent_1px),linear-gradient(90deg,#0f172a_1px,transparent_1px)] [background-size:42px_42px]" />

          <div className="relative mx-auto max-w-[880px]">
            <div className="scio-rise flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-[.12em] text-blue-800">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" /> SCIO RETAIL OS
              </span>
              <span className="rounded-full border border-emerald-400/50 bg-[#090d16] px-3 py-1.5 font-mono text-xs font-bold text-emerald-200 shadow-md">
                ENTERPRISE RETAIL · LIVE ACTIONS
              </span>
            </div>

            <h1 className="scio-rise mt-6 max-w-[780px] text-[clamp(38px,5.4vw,72px)] font-extrabold leading-[1.05] tracking-[-.03em] text-[#090d16] [animation-delay:70ms]">
              One operating system for modern retail operations.
            </h1>
            <p className="scio-rise mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-700 sm:text-lg [animation-delay:120ms]">
              Connect stores, SKUs, inventory, suppliers and equipment—then turn every operational signal into an explainable, approved action.
            </p>

            <div className="scio-rise mt-7 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-[#090d16] via-[#111827] to-[#0c2848] p-4 text-[#fff] shadow-xl [animation-delay:170ms]">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-mono text-xs font-extrabold tracking-[.1em] text-emerald-200">GOVERNED OPERATIONAL INTELLIGENCE</div>
                  <p className="mt-1 text-base leading-relaxed text-slate-200">Role-based approvals, persistent actions and a complete audit trail across every retail workflow.</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { icon: ShoppingCart, code: "01", title: "Sales & margin", text: "POS, GMROI, discount leakage and store profitability.", color: "text-blue-600", bg: "bg-blue-50" },
                { icon: PackageSearch, code: "02", title: "SKU intelligence", text: "5,000 products, batches, availability and lifecycle.", color: "text-violet-600", bg: "bg-violet-50" },
                { icon: Boxes, code: "03", title: "Inventory control", text: "SOH, ATS, ATP, DOS, transfers, FEFO and counts.", color: "text-amber-600", bg: "bg-amber-50" },
                { icon: Database, code: "04", title: "Connected execution", text: "PO, ASN, GRN, suppliers, WMS and approved actions.", color: "text-emerald-600", bg: "bg-emerald-50" },
              ].map((item, i) => (
                <div key={item.code} style={{ animationDelay: `${210 + i * 55}ms` }} className="scio-rise group rounded-2xl border border-slate-200 bg-[#fff] p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className={`grid h-9 w-9 place-items-center rounded-xl ${item.bg} ${item.color}`}><item.icon className="h-4.5 w-4.5" /></span>
                    <span className="font-mono text-[11px] font-bold text-slate-600">MODULE_{item.code}</span>
                  </div>
                  <h2 className="mt-3 text-base font-bold text-slate-950">{item.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="scio-rise mt-5 overflow-hidden rounded-2xl border border-[#243149] bg-[#070b12] text-[#fff] shadow-2xl [animation-delay:390ms]">
              <div className="flex h-11 items-center justify-between border-b border-white/10 bg-[#0d1420] px-4 font-mono text-[11px] font-bold tracking-wider text-slate-300">
                <span>SCIO RETAIL CONTROL TOWER // REGIONAL_NETWORK</span>
                <span className="flex items-center gap-2 text-emerald-400"><span className="relative h-2 w-2 rounded-full bg-emerald-400"><span className="scio-ping absolute inset-0 rounded-full bg-emerald-400" /></span> LIVE</span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-white/10 p-4 font-mono">
                {[['50', 'STORES CONNECTED'], ['5,000', 'ACTIVE SKUS'], ['6', 'MARKETS']].map(([value, label]) => (
                  <div key={label} className="px-3 first:pl-0 last:pr-0">
                    <div className="text-xl font-black text-[#fff] sm:text-2xl">{value}</div>
                    <div className="mt-1 text-[10px] font-bold tracking-[.08em] text-cyan-200 sm:text-[11px]">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="scio-login-dark relative flex items-center justify-center overflow-hidden bg-[#070b12] px-5 py-10 text-[#fff] sm:px-10 lg:px-12">
          <div aria-hidden className="scio-drift absolute -right-24 top-10 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
          <div aria-hidden className="scio-drift absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-violet-600/15 blur-3xl [animation-delay:-7s]" />
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:24px_24px]" />

          <div className="scio-rise relative w-full max-w-[440px]">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <div className="font-mono text-xs font-bold tracking-[.12em] text-cyan-200">SECURE WORKSPACE ACCESS</div>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Welcome back</h2>
                <p className="mt-1.5 text-base leading-relaxed text-slate-300">Sign in to launch SCIO Retail Mission Control.</p>
              </div>
              <Activity className="hidden h-8 w-8 text-cyan-400 sm:block" />
            </div>

            <form onSubmit={submit} className="space-y-4">
              <DarkField label="Work email" icon={Mail}>
                <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent py-3 text-base text-[#fff] outline-none placeholder:text-slate-400" placeholder="you@company.com" required />
              </DarkField>
              <DarkField label="Password" icon={Lock}>
                <input type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent py-3 text-base text-[#fff] outline-none placeholder:text-slate-400" placeholder="Enter your password" required />
                <button type="button" onClick={() => setShow((s) => !s)} className="text-slate-300 transition hover:text-cyan-200" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
              </DarkField>

              {error && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>}

              <button type="submit" disabled={busy} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 py-4 text-base font-bold text-[#fff] shadow-xl shadow-blue-950/40 transition hover:scale-[1.01] hover:from-blue-500 hover:to-violet-500 disabled:opacity-60">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Enter mission control <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></>}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 font-mono text-xs font-bold tracking-wider text-slate-300"><span className="h-px flex-1 bg-white/20" />QUICK ACCESS<span className="h-px flex-1 bg-white/20" /></div>

            <div className="grid gap-2">
              {DEMO_ACCOUNTS.map((a, i) => (
                <button key={a.email} type="button" disabled={busy} onClick={() => signIn(a.email, a.password, a.scope || a.retailRole === "Procurement" ? "/app/retail" : from)} style={{ animationDelay: `${160 + i * 45}ms` }} className="scio-rise group flex items-center gap-3 rounded-xl border border-white/20 bg-white/[0.07] px-3 py-3 text-left transition hover:border-cyan-400/50 hover:bg-cyan-400/[0.1] disabled:opacity-60">
                  <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-black text-[#fff]", AVATAR[i % AVATAR.length])}>{a.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-[#fff]">{a.name}</span><span className="block truncate text-sm text-slate-300">{a.role}</span></span>
                  <CheckCircle2 className="h-5 w-5 text-slate-400 transition group-hover:text-cyan-300" />
                </button>
              ))}
            </div>

            <p className="mt-5 text-center font-mono text-[11px] leading-relaxed text-slate-400">ROLE-CHECKED ACTIONS · FULL AUDIT TRAIL</p>
          </div>
        </section>
      </div>
    </main>
  );
}

/** Previous login UI retained as a tested fallback. */
export function LegacyLoginPage() {
  const { user, login } = useDemoAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const from = (location.state as { from?: string } | null)?.from || "/app";
  if (user) return <Navigate to={user.email.toLowerCase() === "sujal.talreja@stellarmind.ai" ? "/app/retail/master" : from} replace />;

  const signIn = (em: string, pw: string, to = from) => {
    setBusy(true);
    setError("");
    login(em, pw).then(
      (ok) => {
        if (ok) navigate(em.trim().toLowerCase() === "sujal.talreja@stellarmind.ai" ? "/app/retail/master" : to, { replace: true });
        else {
          setError("Incorrect email or password.");
          setBusy(false);
        }
      },
      () => {
        setError("Could not reach the server. Please try again.");
        setBusy(false);
      }
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn(email, password);
  };

  return (
    <div className="relative grid min-h-screen font-sans text-slate-800 lg:grid-cols-[1.05fr_1fr]">
      <Aurora />

      {/* Brand panel */}
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#0b1a3a] via-[#122a63] to-[#0e7490] p-12 text-[#fff] lg:flex lg:flex-col">
        <div aria-hidden className="scio-drift pointer-events-none absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-[#3b82f6]/30 blur-3xl" />
        <div aria-hidden className="scio-drift pointer-events-none absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-[#22d3ee]/20 blur-3xl [animation-delay:-6s]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

        <div className="relative">
          <ScioLogo size={44} withText />
        </div>

        <div className="relative mt-auto max-w-lg">
          <h2 className="scio-rise text-[40px] font-bold leading-[1.1] tracking-tight">
            One intelligent operating system for{" "}
            <span className="bg-gradient-to-r from-[#7dd3fc] to-[#a5b4fc] bg-clip-text text-transparent">every store, warehouse and asset.</span>
          </h2>
          <p className="scio-rise mt-4 text-[16px] text-[#cbd5e1] [animation-delay:80ms]">SCIO connects ERP, POS, WMS and IoT data, predicts what will go wrong, and turns it into approved actions.</p>

          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <div key={f.title} style={{ animationDelay: `${160 + i * 80}ms` }} className="scio-rise rounded-2xl bg-[#fff]/[0.06] p-4 ring-1 ring-[#fff]/10 backdrop-blur transition hover:bg-[#fff]/[0.1]">
                <f.icon className="h-5 w-5 text-[#7dd3fc]" />
                <div className="mt-2 text-[14px] font-semibold">{f.title}</div>
                <div className="mt-1 text-[12.5px] leading-snug text-[#94a3b8]">{f.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-10 flex items-center gap-6 text-[12px] text-[#94a3b8]">
          <span>ERP · POS · WMS · IoT</span>
          <span className="h-1 w-1 rounded-full bg-[#64748b]" />
          <span>Role-based access</span>
          <span className="h-1 w-1 rounded-full bg-[#64748b]" />
          <span>Full audit trail</span>
        </div>
      </section>

      {/* Form */}
      <section className="relative flex items-center justify-center px-4 py-12">
        <div className="absolute right-5 top-5">
          <ThemeToggle />
        </div>
        <div className="scio-rise w-full max-w-[420px]">
          <div className="mb-8 lg:hidden">
            <ScioLogo size={40} withText dark={false} />
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-1.5 text-[15px] text-slate-500">Sign in to your SCIO workspace.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <Field label="Work email" icon={Mail}>
              <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" placeholder="you@company.com" required />
            </Field>
            <Field label="Password" icon={Lock}>
              <input type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" placeholder="••••••••" required />
              <button type="button" onClick={() => setShow((s) => !s)} className="text-slate-400 hover:text-slate-700" aria-label={show ? "Hide password" : "Show password"}>
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </Field>

            {error && <p className="scio-page rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#4f46e5] py-3 text-sm font-semibold text-[#fff] shadow-lg shadow-blue-600/25 transition hover:shadow-xl hover:shadow-blue-600/30 disabled:opacity-70"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></>}
            </button>
          </form>

          <div className="my-7 flex items-center gap-3 text-[12px] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or continue as
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid gap-2">
            {DEMO_ACCOUNTS.map((a, i) => (
              <button
                key={a.email}
                type="button"
                disabled={busy}
                onClick={() => signIn(a.email, a.password, a.scope || a.retailRole === "Procurement" ? "/app/retail" : from)}
                style={{ animationDelay: `${120 + i * 50}ms` }}
                className="scio-rise group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-blue-300 hover:bg-blue-50/50 disabled:opacity-60"
              >
                <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-bold text-[#fff]", AVATAR[i % AVATAR.length])}>
                  {a.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-semibold text-slate-900">{a.name}</span>
                  <span className="block truncate text-[12px] text-slate-500">{a.role}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const AVATAR = ["bg-gradient-to-br from-[#3b82f6] to-[#6366f1]", "bg-gradient-to-br from-[#14b8a6] to-[#0ea5e9]", "bg-gradient-to-br from-[#f59e0b] to-[#f97316]", "bg-gradient-to-br from-[#ec4899] to-[#8b5cf6]", "bg-gradient-to-br from-[#22c55e] to-[#14b8a6]"];

function Field({ label, icon: Icon, children }: { label: string; icon: typeof Mail; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-slate-700">{label}</span>
      <div className="mt-1.5 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
        {children}
      </div>
    </label>
  );
}
