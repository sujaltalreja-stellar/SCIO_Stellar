import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, X, RotateCcw } from "lucide-react";
import { useRetail } from "../RetailContext";
import { DEMO_ACCOUNTS } from "../../auth";
import { ROLE_DESCRIPTION, ROLE_PERMISSIONS, type Permission, type RetailRole } from "../rbac";
import { DEFAULT_THRESHOLDS, type Thresholds } from "../state";
import { describeEvent } from "./RetailDashboard";
import { Card } from "../../ui";
import { ActButton, DataGrid, PageTitle, Pill, Tabs } from "../rui";
import ConnectedSystems from "./ConnectedSystems";
import { SOURCES } from "../sources";

type Tab = "systems" | "thresholds" | "roles" | "currency" | "audit";

const FIELDS: Array<{ key: keyof Thresholds; label: string; help: string; min: number; max: number; unit: string }> = [
  { key: "stockoutDays", label: "Stockout risk", help: "Flag when available stock covers fewer days than this", min: 1, max: 14, unit: "days of supply" },
  { key: "overstockDays", label: "Overstock", help: "Flag when stock covers more days than this", min: 30, max: 365, unit: "days of supply" },
  { key: "expiryDays", label: "Expiry look-ahead", help: "Check perishable lots expiring within", min: 3, max: 45, unit: "days" },
  { key: "phantomDays", label: "Phantom inventory", help: "No sales for this many days while system shows stock", min: 2, max: 21, unit: "days" },
  { key: "markdownPct", label: "Default markdown", help: "Suggested discount for expiring stock", min: 5, max: 70, unit: "%" },
  { key: "targetDays", label: "Replenish to", help: "Transfers and orders restore this much cover", min: 5, max: 45, unit: "days of supply" },
];

export default function RetailSettings() {
  const { state, dispatch, can, reset, role } = useRetail();
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as Tab) || "systems";
  const [draft, setDraft] = useState<Thresholds>(state.thresholds);
  const { base } = state;
  const errors = FIELDS.filter((f) => !(draft[f.key] >= f.min && draft[f.key] <= f.max)).map((f) => f.key);
  const perms = Array.from(new Set(Object.values(ROLE_PERMISSIONS).flat())) as Permission[];

  return (
    <div className="space-y-6">
      <PageTitle title="Settings" sub="Connected systems, thresholds, roles & permissions, currencies and the audit trail" />
      <Tabs<Tab>
        value={tab}
        onChange={(t) => setParams({ tab: t })}
        tabs={[
          ["systems", "Connected Systems", SOURCES.length],
          ["thresholds", "Thresholds"],
          ["roles", "Roles & access"],
          ["currency", "Currency & VAT"],
          ["audit", "Audit trail", state.events.length],
        ]}
      />

      {tab === "systems" && <ConnectedSystems />}

      {tab === "thresholds" && (
        <Card>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {FIELDS.map((f) => (
              <label key={f.key} className="block rounded-xl border border-slate-200 p-4">
                <span className="text-sm font-semibold text-slate-900">{f.label}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{f.help}</span>
                <span className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    min={f.min}
                    max={f.max}
                    value={draft[f.key]}
                    disabled={!can("settings.thresholds")}
                    onChange={(e) => setDraft((d) => ({ ...d, [f.key]: Number(e.target.value) }))}
                    className={`w-24 rounded-lg border px-2 py-1.5 text-right ${errors.includes(f.key) ? "border-rose-400 bg-rose-50" : "border-slate-200"}`}
                  />
                  <span className="text-sm text-slate-600">{f.unit}</span>
                </span>
                {errors.includes(f.key) && <span className="mt-1 block text-xs text-rose-600">Must be between {f.min} and {f.max}</span>}
              </label>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <ActButton perm="settings.thresholds" size="md" disabled={errors.length > 0} onClick={() => dispatch({ type: "thresholds", values: draft }, "Thresholds updated · all alerts recalculated")}>
              Save thresholds
            </ActButton>
            <ActButton perm="settings.thresholds" variant="secondary" size="md" onClick={() => setDraft(DEFAULT_THRESHOLDS)}>
              Restore defaults
            </ActButton>
            {!can("settings.thresholds") && <span className="text-xs text-slate-500">Only HQ can change thresholds (you are {role}).</span>}
          </div>
        </Card>
      )}

      {tab === "roles" && (
        <div className="space-y-5">
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[12px] text-slate-500">
                  <th className="pb-2 font-semibold">Permission</th>
                  {(Object.keys(ROLE_PERMISSIONS) as RetailRole[]).map((r) => (
                    <th key={r} className="pb-2 text-center font-semibold">
                      {r}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {perms.map((p) => (
                  <tr key={p}>
                    <td className="py-2 font-mono text-xs text-slate-700">{p}</td>
                    {(Object.keys(ROLE_PERMISSIONS) as RetailRole[]).map((r) => (
                      <td key={r} className="py-2 text-center">
                        {ROLE_PERMISSIONS[r].includes(p) ? <Check className="mx-auto h-4 w-4 text-emerald-600" /> : <X className="mx-auto h-4 w-4 text-slate-300" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card>
            <h3 className="mb-3 text-[16px] font-semibold text-slate-900">User accounts</h3>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {DEMO_ACCOUNTS.map((a) => (
                  <tr key={a.email}>
                    <td className="py-2 font-medium text-slate-900">{a.name}</td>
                    <td className="py-2 text-slate-600">{a.role}</td>
                    <td className="py-2">
                      <Pill tone="accent">{a.retailRole}</Pill>
                    </td>
                    <td className="py-2 text-xs text-slate-500">{a.retailRole ? ROLE_DESCRIPTION[a.retailRole] : ""}</td>
                    <td className="py-2 font-mono text-xs text-slate-600">
                      {a.email} / {a.password}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === "currency" && (
        <Card>
          <p className="mb-3 text-sm text-slate-600">Prices and costs are stored in AED (reporting currency). Store views show local currency using these rates; VAT is applied per country at the shelf.</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[12px] text-slate-500">
                <th className="pb-2 font-semibold">Country</th>
                <th className="pb-2 font-semibold">Currency</th>
                <th className="pb-2 text-right font-semibold">1 unit = AED</th>
                <th className="pb-2 text-right font-semibold">VAT</th>
                <th className="pb-2 text-right font-semibold">Stores</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {base.countries.map((c) => (
                <tr key={c.code}>
                  <td className="py-2 font-medium text-slate-900">{c.name}</td>
                  <td className="py-2">{c.currency}</td>
                  <td className="py-2 text-right tabular-nums">{c.toAed.toFixed(3)}</td>
                  <td className="py-2 text-right">{Math.round(c.vat * 100)}%</td>
                  <td className="py-2 text-right">{base.stores.filter((s) => s.country === c.code).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "audit" && (
        <div className="space-y-4">
          <DataGrid
            rows={[...state.events].reverse()}
            rowKey={(e) => e.id}
            search={(e) => `${e.user} ${e.role} ${e.type} ${describeEvent(e, base)}`}
            placeholder="Search user, role or action…"
            empty="No actions yet."
            columns={[
              { key: "time", label: "Time", render: (e) => new Date(e.at).toLocaleString("en-GB", { timeZone: "Asia/Dubai", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" }) },
              { key: "user", label: "User", render: (e) => (<span><span className="font-medium text-slate-900">{e.user}</span><span className="block text-xs text-slate-500">{e.role}</span></span>) },
              { key: "type", label: "Event", render: (e) => <span className="font-mono text-xs">{e.type}</span> },
              { key: "desc", label: "Details", render: (e) => describeEvent(e, base) },
              { key: "id", label: "Event ID", render: (e) => <span className="font-mono text-[11px] text-slate-400">{e.id}</span> },
            ]}
          />
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
            <span className="text-sm text-slate-600">Reset clears all recorded actions and returns every KPI to the generated baseline.</span>
            <ActButton variant="danger" size="md" onClick={() => window.confirm("Reset all recorded actions?") && reset()}>
              <RotateCcw className="h-4 w-4" /> Reset action log
            </ActButton>
          </div>
        </div>
      )}
    </div>
  );
}
