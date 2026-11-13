import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Layers, Package, Search, Target, Users, Wrench, ClipboardCheck, BadgePercent } from "lucide-react";
import { useRetail } from "../RetailContext";
import type { StorePerf } from "../analytics";
import { cx } from "../../ui";
import { aed, nf } from "../rui";

// ---------------------------------------------------------------------------
// Stores overview: four headline numbers, a map of store health, and the
// stores needing attention with their main issue and source systems.
// ---------------------------------------------------------------------------

const P = "/app/retail";
type Health = "Critical" | "Below Target" | "On Target";

const HEALTH_COLOR: Record<Health, string> = { Critical: "#ef4444", "Below Target": "#f59e0b", "On Target": "#22c55e" };

function healthOf(p: StorePerf): Health {
  if (p.availability < 0.95 || p.vsTarget < 0.88) return "Critical";
  if (p.vsTarget < 0.97 || p.availability < 0.975) return "Below Target";
  return "On Target";
}


function mainIssue(p: StorePerf): { label: string; icon: React.ElementType; tone: string; systems: string[] } {
  if (p.equipmentFaults > 0) return { label: "Equipment fault", icon: Wrench, tone: "bg-amber-50 text-amber-700", systems: ["IoT", "ERP"] };
  if (p.outOfStock >= 8) return { label: "Stockouts", icon: Package, tone: "bg-rose-50 text-rose-700", systems: ["ERP", "WMS"] };
  if (p.availability < 0.975) return { label: "Low availability", icon: Layers, tone: "bg-amber-50 text-amber-700", systems: ["WMS", "POS"] };
  if (p.pricingExceptions > 0) return { label: "Pricing errors", icon: BadgePercent, tone: "bg-rose-50 text-rose-700", systems: ["POS", "ERP"] };
  if (p.auditScore < 75) return { label: "Audit gaps", icon: ClipboardCheck, tone: "bg-amber-50 text-amber-700", systems: ["SCIO"] };
  if (p.openTasks > 3) return { label: "Staff shortage", icon: Users, tone: "bg-amber-50 text-amber-700", systems: ["HRMS", "ERP"] };
  return { label: "Below target", icon: Target, tone: "bg-amber-50 text-amber-700", systems: ["POS"] };
}

export default function StoresOverview() {
  const { kpis } = useRetail();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const country = params.get("country") ?? "All";
  const [status, setStatus] = useState<"All" | Health>("All");
  const [q, setQ] = useState("");
  const [view, setView] = useState<"stores" | "regions">("stores");

  const all = useMemo(() => kpis.perf.map((p) => ({ p, health: healthOf(p), issue: mainIssue(p) })), [kpis.perf]);
  const counts = { Critical: all.filter((x) => x.health === "Critical").length, "Below Target": all.filter((x) => x.health === "Below Target").length, "On Target": all.filter((x) => x.health === "On Target").length };
  const lost = kpis.perf.reduce((a, p) => a + p.lostSales30, 0);
  const countries = [...new Set(kpis.perf.map((p) => p.store.country))].sort();

  const attention = all
    .filter((x) => x.health !== "On Target")
    .filter((x) => country === "All" || x.p.store.country === country)
    .filter((x) => status === "All" || x.health === status)
    .filter((x) => !q.trim() || `${x.p.store.id} ${x.p.store.name} ${x.p.store.city}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => (a.health === b.health ? a.p.vsTarget - b.p.vsTarget : a.health === "Critical" ? -1 : 1));

  const regions = useMemo(() => {
    const m = new Map<string, StorePerf[]>();
    for (const p of kpis.perf) m.set(`${p.store.country} · ${p.store.region}`, [...(m.get(`${p.store.country} · ${p.store.region}`) ?? []), p]);
    return [...m].map(([name, ps]) => ({ name, stores: ps.length, vsTarget: ps.reduce((a, p) => a + p.sales30, 0) / ps.reduce((a, p) => a + p.target, 0), critical: ps.filter((p) => healthOf(p) === "Critical").length })).sort((a, b) => a.vsTarget - b.vsTarget);
  }, [kpis.perf]);


  const stat = (label: string, value: string, tone: string, onClick: () => void, note?: string) => (
    <button onClick={onClick} className="min-w-0 flex-1 px-5 py-4 text-left transition hover:bg-slate-50">
      <div className="text-[12.5px] text-slate-500">{label}</div>
      <div className={cx("mt-0.5 text-[24px] font-semibold tabular-nums tracking-tight", tone)}>{value}</div>
      {note && <div className="text-[12px] text-slate-500">{note}</div>}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">Stores</h1>
          <p className="mt-0.5 text-[14px] text-slate-500">Performance, live issues and recommended actions across {nf(kpis.perf.length)} stores.</p>
        </div>
        <Link to={`${P}/settings?tab=systems`} className="text-[12.5px] text-slate-500 hover:text-slate-800">
          Data from <span className="text-slate-700">ERP · POS · WMS · WFM · SOTM</span>
        </Link>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white sm:flex sm:divide-x sm:divide-slate-200">
        {stat("Total stores", nf(kpis.perf.length), "text-slate-900", () => setStatus("All"), `${counts["On Target"]} on target`)}
        {stat("Below target", nf(counts["Below Target"]), "text-amber-600", () => setStatus("Below Target"), "sales or availability under plan")}
        {stat("Critical", nf(counts.Critical), "text-rose-600", () => setStatus("Critical"), "need action today")}
        {stat("Est. lost sales · 30d", aed(lost), "text-slate-900", () => navigate(`${P}/insights/stockouts`), "from stockouts")}
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)]">
        {/* Map / regions */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[14px] font-semibold text-slate-900">{view === "stores" ? "Store map · Kuwait" : "Regions"}</div>
            <div className="flex rounded-lg bg-slate-100 p-0.5 text-[12.5px]">
              {(["stores", "regions"] as const).map((k) => (
                <button key={k} onClick={() => setView(k)} className={cx("rounded-md px-3 py-1 transition", view === k ? "bg-white font-medium text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800")}>
                  {k === "stores" ? "Map" : "Regions"}
                </button>
              ))}
            </div>
          </div>

          {view === "stores" ? (
            <div>
              <StoreMap stores={all} onPick={(id) => navigate(`${P}/stores/${id}`)} />
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-slate-600">
                {(Object.keys(counts) as Health[]).map((h) => (
                  <button
                    key={h}
                    onClick={() => {
                      setStatus(h === "On Target" ? "All" : h);
                      setParams({ country: "KW" });
                    }}
                    className="inline-flex items-center gap-1.5 hover:text-slate-900"
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: HEALTH_COLOR[h] }} />
                    {h} <span className="tabular-nums text-slate-400">{all.filter((x) => x.p.store.country === "KW" && x.health === h).length}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="max-h-[460px] divide-y divide-slate-100 overflow-y-auto">
              {regions.map((r) => (
                <li key={r.name} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-medium text-slate-900">{r.name}</div>
                    <div className="text-[12px] text-slate-500">
                      {r.stores} stores{r.critical ? ` · ${r.critical} critical` : ""}
                    </div>
                  </div>
                  <TargetBar value={r.vsTarget} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Stores needing attention */}
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3">
            <h2 className="mr-auto text-[14px] font-semibold text-slate-900">
              Needs attention <span className="font-normal text-slate-400">{attention.length}</span>
            </h2>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search stores" className="w-28 bg-transparent py-1.5 text-[13px] text-slate-900 outline-none placeholder:text-slate-400" />
            </label>
            <select
              value={country}
              onChange={(e) => {
                const v = e.target.value;
                setParams(v === "All" ? {} : { country: v });
              }}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] text-slate-700 outline-none"
            >
              <option value="All">All countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value as "All" | Health)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] text-slate-700 outline-none">
              <option value="All">All statuses</option>
              <option value="Critical">Critical</option>
              <option value="Below Target">Below target</option>
            </select>
          </div>

          {attention.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">All stores are on target.</p>
          ) : (
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full min-w-[640px] text-[13.5px]">
                <thead className="sticky top-0 bg-slate-50 text-left text-[12px] text-slate-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">Store</th>
                    <th className="px-4 py-2 font-medium">vs target</th>
                    <th className="px-4 py-2 font-medium">Main issue</th>
                    <th className="px-4 py-2 font-medium">Source</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attention.map(({ p, health, issue }) => (
                    <tr key={p.store.id} onClick={() => navigate(`${P}/stores/${p.store.id}`)} className="group cursor-pointer hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: HEALTH_COLOR[health] }} title={health} />
                          <span className="font-medium text-slate-900">{p.store.id}</span>
                          <span className="truncate text-slate-500">{p.store.city}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <TargetBar value={p.vsTarget} />
                      </td>
                      <td className="px-4 py-3 text-slate-700">{issue.label}</td>
                      <td className="px-4 py-3 text-[12.5px] text-slate-500">{issue.systems.join(" · ")}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-500 group-hover:text-slate-900">
                          Review <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TargetBar({ value }: { value: number }) {
  const color = value < 0.88 ? "#ef4444" : value < 0.97 ? "#f59e0b" : "#22c55e";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, value * 100)}%`, background: color }} />
      </div>
      <span className="w-10 text-right text-[13px] tabular-nums text-slate-700">{Math.round(value * 100)}%</span>
    </div>
  );
}

// Kuwait outline [lat, lng] (simplified) and store-city coordinates.
const KW_LAND: Array<[number, number]> = [
  [29.1, 46.55], [29.6, 46.9], [30.0, 47.15], [30.1, 47.7], [30.08, 47.95], [29.98, 47.98], [29.75, 47.9], [29.55, 47.72], [29.45, 47.68], [29.38, 47.8], [29.36, 47.92], [29.38, 48.0], [29.33, 48.09], [29.2, 48.1], [29.05, 48.15], [28.85, 48.25], [28.68, 48.35], [28.53, 48.42], [28.53, 47.95], [28.55, 47.6], [28.75, 47.2], [29.0, 46.75],
];
const KW_BUBIYAN: Array<[number, number]> = [[29.98, 48.08], [29.99, 48.3], [29.85, 48.38], [29.68, 48.4], [29.72, 48.18], [29.85, 48.08]];
const KW_CITY: Record<string, [number, number]> = {
  "Kuwait City": [29.375, 47.98],
  Salmiya: [29.335, 48.075],
  Hawalli: [29.335, 48.025],
  Fahaheel: [29.08, 48.13],
};
const KW_LABELS: Array<[string, number, number]> = [["Kuwait City", 29.47, 47.86], ["Salmiya", 29.27, 48.2], ["Fahaheel", 29.0, 48.22], ["Jahra", 29.34, 47.62], ["Al Ahmadi", 28.9, 47.85], ["Bubiyan", 29.83, 48.24]];
const kw = (lat: number, lng: number) => [((lng - 46.45) / 2.1) * 100, ((30.2 - lat) / 1.75) * 86] as const;

function StoreMap({ stores, onPick }: { stores: Array<{ p: StorePerf; health: Health }>; onPick: (id: string) => void }) {
  const poly = (pts: Array<[number, number]>) => pts.map(([la, ln]) => kw(la, ln).join(",")).join(" ");
  const kwStores = stores.filter((s) => s.p.store.country === "KW");
  return (
    <div>
      <div className="mb-1 flex items-center justify-between px-1">
        <span className="text-[14px] font-bold text-slate-900">Kuwait</span>
        <span className="text-[12px] text-slate-500">{kwStores.length} stores · click a pin</span>
      </div>
      <svg viewBox="0 0 100 86" className="h-auto w-full rounded-2xl bg-gradient-to-b from-[#eff6ff] to-[#f8fafc]">
        <defs>
          <linearGradient id="kw-land" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#dbeafe" />
          </linearGradient>
          <pattern id="kw-grid" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M6 0H0V6" fill="none" stroke="#bfdbfe" strokeWidth="0.15" />
          </pattern>
          <filter id="kw-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#1e3a8a" floodOpacity="0.15" />
          </filter>
        </defs>
        <rect width="100" height="86" fill="url(#kw-grid)" />
        <text x="90" y="62" fontSize="2.6" fill="#93c5fd" fontStyle="italic" textAnchor="middle">Arabian Gulf</text>
        <polygon points={poly(KW_LAND)} fill="url(#kw-land)" stroke="#93c5fd" strokeWidth="0.45" strokeLinejoin="round" filter="url(#kw-shadow)" />
        <polygon points={poly(KW_BUBIYAN)} fill="url(#kw-land)" stroke="#93c5fd" strokeWidth="0.4" />
        {KW_LABELS.map(([t, la, ln]) => {
          const [x, y] = kw(la, ln);
          return <text key={t} x={x} y={y} fontSize="2.3" fill="#64748b" fontWeight="600" textAnchor="middle">{t}</text>;
        })}
        {kwStores.map(({ p, health }, i) => {
          const c = KW_CITY[p.store.city] ?? KW_CITY["Kuwait City"];
          const a = (i * 2.399) % (2 * Math.PI);
          const rr = 0.025 + ((i * 7) % 5) * 0.012;
          const [x, y] = kw(c[0] + Math.sin(a) * rr, c[1] + Math.cos(a) * rr * 1.4);
          const crit = health === "Critical";
          const col = HEALTH_COLOR[health];
          return (
            <g key={p.store.id} onClick={() => onPick(p.store.id)} className="cursor-pointer">
              <title>{`${p.store.id} ${p.store.name} · ${Math.round(p.vsTarget * 100)}% of target`}</title>
              {crit && (
                <circle cx={x} cy={y} r="2" fill={col} opacity="0.35">
                  <animate attributeName="r" values="1.6;4.2;1.6" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.45;0;0.45" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              {crit ? (
                <g transform={`translate(${x - 2.2},${y - 5.6})`}>
                  <path d="M2.2 0C1 0 0 1 0 2.2c0 1.6 2.2 3.4 2.2 3.4s2.2-1.8 2.2-3.4C4.4 1 3.4 0 2.2 0z" fill={col} stroke="#fff" strokeWidth="0.35" />
                  <text x="2.2" y="3.1" fontSize="2.4" fill="#fff" fontWeight="800" textAnchor="middle">!</text>
                </g>
              ) : (
                <circle cx={x} cy={y} r="1.25" fill={col} stroke="#fff" strokeWidth="0.45" />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
