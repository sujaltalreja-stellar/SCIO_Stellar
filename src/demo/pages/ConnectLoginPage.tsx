import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  Database,
  Eye,
  EyeOff,
  House,
  Layers,
  Link2,
  Loader2,
  Lock,
  Mail,
  ScanSearch,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
  Users,
  Zap,
} from "lucide-react";
import { DEMO_ACCOUNTS, useDemoAuth } from "../auth";

const MASTER = "sujal.talreja@stellarmind.ai";
const GOLD = "#f2a93b";

/* Connected systems around the SCIO hub. x/y are % positions in the hub box. */
const NODES = [
  { id: "pos", label: "POS", icon: ShoppingCart, x: 50, y: 9 },
  { id: "wms", label: "WMS", icon: House, x: 80, y: 23 },
  { id: "proc", label: "Procurement", icon: Truck, x: 90, y: 50 },
  { id: "other", label: "Others", icon: Database, x: 76, y: 81 },
  { id: "maint", label: "Maintenance", icon: Settings, x: 24, y: 81 },
  { id: "hrms", label: "HRMS", icon: Users, x: 10, y: 50 },
  { id: "erp", label: "ERP", icon: Layers, x: 20, y: 23 },
] as const;

type NodeId = (typeof NODES)[number]["id"];

/* Real SCIO use cases: a signal in one system resolved through another. */
const FLOWS: { from: NodeId; to: NodeId; text: string; signal: string; outcome: string }[] = [
  { from: "pos", to: "proc", text: "POS sales spike → reorder raised in Procurement", signal: "Demand +38% · SKU 4471", outcome: "PO #8812 approved" },
  { from: "wms", to: "erp", text: "WMS goods receipt → invoice matched in ERP", signal: "GRN posted · 240 units", outcome: "3-way match cleared" },
  { from: "maint", to: "hrms", text: "Chiller alert → technician on shift assigned", signal: "Chiller 6.8°C · Store 12", outcome: "Technician dispatched" },
  { from: "pos", to: "wms", text: "Store stockout → transfer from nearest warehouse", signal: "Stockout risk · 2 days", outcome: "Transfer TO-551 created" },
  { from: "proc", to: "erp", text: "Supplier delay → PO and margin plan updated", signal: "ASN late · 3 days", outcome: "Margin plan updated" },
  { from: "hrms", to: "pos", text: "Weekend footfall → staffing matched to demand", signal: "Footfall +24% forecast", outcome: "Shifts rebalanced" },
];

const FEATURES = [
  { icon: Zap, title: "Unified Operations", text: "One view across all your business systems" },
  { icon: ScanSearch, title: "Real-time Intelligence", text: "Detect issues before they impact sales" },
  { icon: CircleCheck, title: "Action & Control", text: "Turn insights into approved actions" },
];

export default function ConnectLoginPage() {
  const { user, login } = useDemoAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [quickOpen, setQuickOpen] = useState(false);
  const [flow, setFlow] = useState(-1);

  useEffect(() => {
    // Start on the tagline, then cycle through live use cases.
    const t = setInterval(() => setFlow((f) => (f + 1) % FLOWS.length), 3200);
    return () => clearInterval(t);
  }, []);

  const from = (location.state as { from?: string } | null)?.from || "/app/retail/ask";
  if (user) return <Navigate to={user.email.toLowerCase() === MASTER ? "/app/retail/ask" : from} replace />;

  const signIn = (em: string, pw: string, to = from) => {
    setBusy(true);
    setError("");
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 20000));
    Promise.race([login(em, pw), timeout]).then(
      (ok) => {
        if (ok) navigate(em.trim().toLowerCase() === MASTER ? "/app/retail/ask" : to, { replace: true });
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
    if (step === "email") {
      setError("");
      setStep("password");
    } else signIn(email, password);
  };

  const active = flow >= 0 ? FLOWS[flow] : null;

  return (
    <main className="scio-login relative min-h-screen overflow-hidden bg-[#f7f7f8] font-sans text-[#0d0d0f]">
      {/* Background: soft light field, dark curved panel with a gold edge */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,#ffffff_0%,#f6f6f7_55%,#ececee_100%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.5] [background-image:radial-gradient(#c8c8ce_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_40%_45%,black_20%,transparent_70%)]" />
      <div aria-hidden className="scio-drift pointer-events-none absolute left-[30%] top-[18%] h-[420px] w-[420px] rounded-full bg-[#f2a93b]/20 blur-[90px]" />
      <div aria-hidden className="scio-drift pointer-events-none absolute -left-24 top-[38%] h-72 w-72 rounded-full bg-[#fde7c3]/70 blur-3xl [animation-delay:-6s]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-[30%] -left-[15%] h-[45%] w-[75%] rounded-[50%] bg-[#e9e9ec]" />
      <div aria-hidden className="pointer-events-none absolute -right-[22%] -top-[30%] hidden h-[160%] w-[54%] rounded-[50%] border-l-[3px] border-[#f2a93b] bg-[#0f0f11] shadow-[-30px_0_60px_rgba(0,0,0,.12)] lg:block" />
      <div aria-hidden className="pointer-events-none absolute -right-[10%] -top-[20%] hidden h-[70%] w-[30%] rounded-[50%] bg-[#1d1d21] opacity-70 blur-2xl lg:block" />
      <div aria-hidden className="pointer-events-none absolute right-[4%] top-[22%] hidden h-[480px] w-[480px] rounded-full bg-[#f2a93b]/[0.13] blur-[100px] lg:block" />
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 hidden h-full w-[34%] opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_60%_50%,black_30%,transparent_75%)] lg:block" />
      <div aria-hidden className="pointer-events-none absolute -bottom-[18%] -right-[8%] hidden h-[38%] w-[30%] rounded-[50%] bg-[#ededf0] lg:block" />

      <div className="relative mx-auto flex min-h-screen max-w-[1600px] flex-col px-5 py-6 sm:px-10 lg:px-14">
        {/* Brand */}
        <header className="scio-rise flex items-center gap-3.5">
          <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-[#111113] text-2xl font-black text-[#fff] shadow-lg shadow-black/20">
            S
            <span className="absolute right-1.5 top-1.5 h-3 w-3 rounded-full bg-[#f2a93b]" />
          </div>
          <div className="leading-tight">
            <div className="text-2xl font-extrabold tracking-tight">
              Stellar <span className="text-[#f2a93b]">SCIO</span>
            </div>
            <div className="text-[15px] text-[#3a3a40]">Business Operating System</div>
          </div>
          <div className="ml-auto hidden items-center gap-2 rounded-full border border-[#ececef] bg-[#fff]/80 px-3.5 py-1.5 text-[13px] font-semibold text-[#2c2c32] shadow-sm backdrop-blur md:flex lg:mr-[34%]">
            <span className="relative h-2 w-2 rounded-full bg-[#22c55e]"><span className="scio-ping absolute inset-0 rounded-full bg-[#22c55e]" /></span>
            7 systems in sync
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)_420px] lg:gap-6 xl:gap-10">
          {/* Pitch */}
          <section className="max-w-[520px]">
            <h1 className="scio-rise text-[clamp(44px,4.6vw,72px)] font-extrabold leading-[1.02] tracking-[-.035em] [animation-delay:60ms]">
              Connect.
              <br />
              Operate.
              <br />
              <span className="mt-2 inline-block rounded-2xl bg-[#fde7c3] px-4 pb-1 italic">Resolve.</span>
            </h1>
            <p className="scio-rise mt-6 text-base leading-relaxed text-[#2c2c32] sm:text-lg [animation-delay:120ms]">
              A unified business operating system. Bring your systems together, spot what needs attention, and take action.
            </p>
            <ul className="mt-8 space-y-5">
              {FEATURES.map((f, i) => (
                <li key={f.title} style={{ animationDelay: `${180 + i * 70}ms` }} className="scio-rise flex items-center gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#fff] text-[#0d0d0f] shadow-[0_6px_20px_rgba(242,169,59,.18)] ring-1 ring-[#f2a93b]/15">
                    <f.icon className="h-6 w-6" style={{ color: GOLD }} />
                  </span>
                  <span>
                    <span className="block text-lg font-bold">{f.title}</span>
                    <span className="block text-sm text-[#3a3a40]">{f.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Hub */}
          <section className="scio-rise hidden flex-col items-center lg:flex [animation-delay:150ms]">
            <ConnectHub flowFrom={active?.from} flowTo={active?.to} signal={active?.signal} outcome={active?.outcome} tick={flow} />
            <div className="mt-4 flex w-full max-w-[500px] items-center gap-3 rounded-full border-2 border-[#f2a93b]/60 bg-[#fff] py-1.5 pl-1.5 pr-5 shadow-[0_10px_30px_rgba(242,169,59,.18)]">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#111113] text-[#fff]">
                <Link2 className="h-5 w-5" />
              </span>
              <span key={flow} className="scio-rise truncate text-[15px] font-bold">
                {active ? active.text : "All Your Systems. One Unified Context."}
              </span>
            </div>
          </section>

          {/* Sign-in card */}
          <section className="scio-rise w-full max-w-[430px] justify-self-center lg:justify-self-end [animation-delay:220ms]">
            <div className="rounded-[28px] border border-[#fff]/15 bg-[#141416]/95 p-7 text-[#fff] shadow-2xl shadow-black/40 backdrop-blur sm:p-9">
              <div className="text-xs font-bold tracking-[.12em] text-[#d4d4d8]">WELCOME BACK</div>
              <h2 className="mt-1.5 text-[34px] font-extrabold tracking-tight">Sign in to SCIO</h2>
              <p className="mt-1 text-[15px] text-[#d4d4d8]">Your business operations, in control.</p>

              <form onSubmit={submit} className="mt-7 space-y-4">
                {step === "email" ? (
                  <CardField label="Work email" icon={Mail}>
                    <input
                      autoFocus
                      type="email"
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent py-3.5 text-base text-[#fff] outline-none placeholder:text-[#8b8b93]"
                      placeholder="you@company.com"
                      required
                    />
                  </CardField>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("email");
                        setPassword("");
                        setError("");
                      }}
                      className="flex w-full items-center gap-2 rounded-xl border border-[#fff]/15 bg-[#fff]/[0.04] px-3.5 py-3 text-left text-sm text-[#e4e4e7] transition hover:border-[#f2a93b]/60"
                    >
                      <ArrowLeft className="h-4 w-4 text-[#a1a1aa]" />
                      <span className="truncate font-medium">{email}</span>
                    </button>
                    <CardField label="Password" icon={Lock}>
                      <input
                        autoFocus
                        type={show ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent py-3.5 text-base text-[#fff] outline-none placeholder:text-[#8b8b93]"
                        placeholder="Enter your password"
                        required
                      />
                      <button type="button" onClick={() => setShow((s) => !s)} className="text-[#a1a1aa] hover:text-[#f2a93b]" aria-label={show ? "Hide password" : "Show password"}>
                        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </CardField>
                  </>
                )}

                {error && <p className="rounded-xl border border-[#f87171]/30 bg-[#f87171]/10 px-3 py-2 text-sm text-[#fca5a5]">{error}</p>}

                <button
                  type="submit"
                  disabled={busy}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#f7bd5c] to-[#efa232] py-4 text-base font-bold text-[#141416] shadow-lg shadow-[#f2a93b]/20 transition hover:brightness-105 disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {step === "email" ? "Continue" : "Sign in"} <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              <div className="my-5 flex items-center gap-4 text-sm text-[#d4d4d8]">
                <span className="h-px flex-1 bg-[#fff]/20" />
                or
                <span className="h-px flex-1 bg-[#fff]/20" />
              </div>

              <button
                type="button"
                onClick={() => setQuickOpen((o) => !o)}
                aria-expanded={quickOpen}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#fff]/25 py-3.5 text-[15px] font-semibold text-[#fff] transition hover:border-[#f2a93b]/70 hover:bg-[#fff]/[0.04]"
              >
                <Sparkles className="h-5 w-5 text-[#f2a93b]" /> Explore a workspace
              </button>

              {quickOpen && (
                <div className="scio-rise mt-3 max-h-56 space-y-1 overflow-y-auto pr-1">
                  {DEMO_ACCOUNTS.map((a) => (
                    <button
                      key={a.email}
                      type="button"
                      disabled={busy}
                      onClick={() => signIn(a.email, a.password, "/app/retail/ask")}
                      className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-[#fff]/[0.06] disabled:opacity-60"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-b from-[#f7bd5c] to-[#efa232] text-[11px] font-black text-[#141416]">
                        {a.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{a.name}</span>
                        <span className="block truncate text-xs text-[#a1a1aa]">{a.role}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-[#52525b] transition group-hover:translate-x-0.5 group-hover:text-[#f2a93b]" />
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#d4d4d8]">
                <ShieldCheck className="h-4 w-4" /> Secure enterprise access
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function CardField({ label, icon: Icon, children }: { label: string; icon: typeof Mail; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[15px] font-semibold text-[#fff]">{label}</span>
      <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#fff]/30 bg-[#fff]/[0.04] px-4 transition focus-within:border-[#f2a93b] focus-within:ring-4 focus-within:ring-[#f2a93b]/15">
        <Icon className="h-5 w-5 shrink-0 text-[#e4e4e7]" />
        {children}
      </div>
    </label>
  );
}

/* SCIO in the middle with every system wired to it; the active use case sends
   a signal from its source system into SCIO and out to the system that acts. */
function ConnectHub({ flowFrom, flowTo, signal, outcome, tick }: { flowFrom?: NodeId; flowTo?: NodeId; signal?: string; outcome?: string; tick: number }) {
  const find = (id?: NodeId) => NODES.find((n) => n.id === id);
  const a = find(flowFrom);
  const b = find(flowTo);
  const cx = 50;
  const cy = 50;

  return (
    <div className="relative aspect-square w-full max-w-[520px]">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <radialGradient id="scio-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f2a93b" stopOpacity="0.35" />
            <stop offset="55%" stopColor="#f2a93b" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#f2a93b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r="41" fill="none" stroke="#c9c9cf" strokeWidth="0.35" />
        <circle cx={cx} cy={cy} r="25" fill="url(#scio-core-glow)" />
        <circle cx={cx} cy={cy} r="16" fill="#fff" fillOpacity="0.85" stroke="#f2a93b" strokeOpacity="0.25" strokeWidth="0.3" />
        {NODES.map((n) => {
          const on = n.id === flowFrom || n.id === flowTo;
          // Connector from the inner ring edge to ~70% of the way to the node.
          const dx = n.x - cx;
          const dy = n.y - cy;
          const len = Math.hypot(dx, dy);
          const sx = cx + (dx / len) * 17;
          const sy = cy + (dy / len) * 17;
          const ex = cx + dx * 0.7;
          const ey = cy + dy * 0.7;
          return (
            <g key={n.id}>
              <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={on ? "#f2a93b" : "#f2c47e"} strokeWidth={on ? 0.6 : 0.35} />
              <circle cx={sx} cy={sy} r="0.9" fill={on ? "#f2a93b" : "#f2c47e"} />
              <circle cx={ex} cy={ey} r="0.7" fill={on ? "#f2a93b" : "#f2c47e"} />
            </g>
          );
        })}
        {a && b && (
          <g key={`${a.id}-${b.id}`}>
            <circle r="2.6" fill="#f2a93b" opacity="0.3">
              <animateMotion dur="2.6s" repeatCount="indefinite" path={`M${a.x},${a.y} L${cx},${cy} L${b.x},${b.y}`} />
            </circle>
            <circle r="1.2" fill="#e8901a">
              <animateMotion dur="2.6s" repeatCount="indefinite" path={`M${a.x},${a.y} L${cx},${cy} L${b.x},${b.y}`} />
            </circle>
          </g>
        )}
      </svg>

      {/* Live signal + outcome chips */}
      {signal && (
        <div key={`s${tick}`} className="scio-rise absolute -left-[4%] top-[33%] z-10 flex items-center gap-2 rounded-xl border border-[#ececef] bg-[#fff]/95 px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,.08)] backdrop-blur">
          <span className="relative h-2 w-2 rounded-full bg-[#f2a93b]"><span className="scio-ping absolute inset-0 rounded-full bg-[#f2a93b]" /></span>
          <span className="text-[12px] font-semibold text-[#2c2c32]">{signal}</span>
        </div>
      )}
      {outcome && (
        <div key={`o${tick}`} style={{ animationDelay: "1.3s" }} className="scio-rise absolute -right-[4%] top-[66%] z-10 flex items-center gap-2 rounded-xl bg-[#111113] px-3 py-2 text-[#fff] shadow-[0_12px_30px_rgba(0,0,0,.25)]">
          <CircleCheck className="h-4 w-4 text-[#f2a93b]" />
          <span className="text-[12px] font-semibold">{outcome}</span>
        </div>
      )}

      {/* Core */}
      <div className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center">
        <div className="relative grid h-[88px] w-[88px] place-items-center rounded-[22px] bg-[#111113] text-5xl font-black text-[#fff] shadow-[0_14px_40px_rgba(0,0,0,.25)]">
          S
          <span className="absolute right-2 top-2 h-4 w-4 rounded-full bg-[#f2a93b]">
            <span className="scio-ping absolute inset-0 rounded-full bg-[#f2a93b]" />
          </span>
        </div>
        <div className="mt-2 text-2xl font-extrabold tracking-wide">SCIO</div>
      </div>

      {/* Systems */}
      {NODES.map((n) => {
        const on = n.id === flowFrom || n.id === flowTo;
        return (
          <div
            key={n.id}
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            className={`absolute flex min-w-[96px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 rounded-2xl border bg-[#fff] px-3 py-3.5 transition duration-500 ${
              on ? "scale-105 border-[#f2a93b] shadow-[0_10px_30px_rgba(242,169,59,.35)]" : "border-[#ececef] shadow-[0_10px_28px_rgba(0,0,0,.08)]"
            }`}
          >
            <n.icon className="h-7 w-7" strokeWidth={1.6} style={{ color: on ? "#e8901a" : "#111113" }} />
            <span className="text-[13px] font-bold">{n.label}</span>
          </div>
        );
      })}
    </div>
  );
}
