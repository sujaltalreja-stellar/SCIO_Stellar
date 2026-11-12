import React, { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useRetail } from "../RetailContext";
import { useWorkflows } from "../workflows";
import { TECHNICIANS } from "../generate";
import { equipmentIssues, type EquipmentIssue } from "../analytics";
import type { Equipment, EquipmentType, Ticket } from "../model";
import { axisProps, C, ChartTooltip, Card } from "../../ui";
import { ActButton, aed, DataGrid, Drawer, nf, PageTitle, Pill, Situation, Stat, Tabs, type Column } from "../rui";

const SAFE: Partial<Record<EquipmentType, [number, number]>> = { Freezer: [-22, -15], Chiller: [0, 5], "Cold Room": [0, 4], HVAC: [20, 26] };

function inRange(e: Equipment) {
  const r = SAFE[e.type];
  const v = e.readings[e.readings.length - 1];
  if (r) return v >= r[0] && v <= r[1];
  if (e.type === "POS Terminal") return v > 50;
  return v > 25;
}

export function MaintenancePage() {
  const { state, scope } = useRetail();
  const wf = useWorkflows();
  const { base } = state;
  const [tab, setTab] = useState<"detected" | "open" | "resolved">("detected");
  const issues = useMemo(() => equipmentIssues(state, scope), [state, scope]);
  const detected = issues.filter((i) => !i.ticketId);
  const tickets = state.tickets.filter((t) => !scope || scope.has(t.storeIdx));
  const open = tickets.filter((t) => t.status !== "Resolved");
  const resolved = tickets.filter((t) => t.status === "Resolved");
  const eq = (id: string) => base.equipment.find((e) => e.id === id)!;

  const dCols: Column<EquipmentIssue>[] = [
    { key: "eq", label: "Equipment", render: (i) => (<span><span className="font-semibold text-slate-900">{i.equipment.type} {i.equipment.id}</span><span className="block text-xs text-slate-500">{i.equipment.make}</span></span>) },
    { key: "store", label: "Store", render: (i) => `${base.stores[i.storeIdx].id} ${base.stores[i.storeIdx].name}` },
    { key: "issue", label: "Detected issue", render: (i) => <span className="text-[13px]">{i.equipment.fault!.kind}</span> },
    { key: "read", label: "Reading", align: "right", render: (i) => <span className="font-semibold text-rose-600">{i.latest}{i.equipment.unit}</span> },
    { key: "since", label: "For", align: "right", render: (i) => `${i.equipment.fault!.since} h` },
    { key: "risk", label: "Stock at risk", align: "right", sort: (i) => i.stockAtRiskValue, render: (i) => (i.stockAtRiskValue ? aed(i.stockAtRiskValue) : "–") },
    { key: "act", label: "", align: "right", render: (i) => <ActButton perm="ticket.create" onClick={() => wf.createTicket(i)}>Create ticket</ActButton> },
  ];

  const tCols: Column<Ticket>[] = [
    { key: "id", label: "Ticket", render: (t) => (<span><span className="font-semibold text-slate-900">{t.id}</span><span className="block text-xs text-slate-500">opened {t.created}</span></span>) },
    { key: "eq", label: "Equipment", render: (t) => `${eq(t.equipmentId)?.type ?? ""} ${t.equipmentId}` },
    { key: "store", label: "Store", render: (t) => base.stores[t.storeIdx].id },
    { key: "issue", label: "Issue", render: (t) => <span className="text-[13px]">{t.issue}</span> },
    { key: "p", label: "Priority", render: (t) => <Pill tone={t.priority === "P1" ? "bad" : t.priority === "P2" ? "warn" : "neutral"}>{t.priority}</Pill> },
    {
      key: "tech",
      label: "Technician",
      render: (t) =>
        t.status === "Resolved" ? (
          t.technician ?? "–"
        ) : (
          <select value={t.technician ?? ""} onChange={(e) => wf.assignTicket(t.id, e.target.value)} onClick={(e) => e.stopPropagation()} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs">
            <option value="" disabled>
              Assign…
            </option>
            {TECHNICIANS.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        ),
    },
    { key: "status", label: "Status", render: (t) => <Pill tone={t.status === "Resolved" ? "good" : t.status === "In progress" ? "accent" : t.status === "Assigned" ? "violet" : "warn"}>{t.status}</Pill> },
    {
      key: "act",
      label: "",
      align: "right",
      render: (t) =>
        t.status === "Assigned" ? (
          <ActButton perm="ticket.resolve" variant="secondary" onClick={() => wf.setTicketStatus(t.id, "In progress")}>Start work</ActButton>
        ) : t.status === "In progress" ? (
          <ActButton perm="ticket.resolve" onClick={() => wf.setTicketStatus(t.id, "Resolved")}>Resolve</ActButton>
        ) : t.status === "Resolved" ? (
          <span className="text-xs text-slate-500">{t.resolved}</span>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <PageTitle title="Maintenance" sub="Breakdown tickets for refrigeration, HVAC, POS and generators: detect, assign, fix" />
      <Situation
        what={<>{detected.length} faults detected without a ticket · {open.length} tickets open</>}
        why={<>IoT readings outside safe range (temperature, uptime, fuel)</>}
        where={<>{new Set(detected.map((d) => base.stores[d.storeIdx].id)).size} stores · {aed(detected.reduce((a, d) => a + d.stockAtRiskValue, 0))} chilled/frozen stock at risk</>}
        action={<>Create tickets, assign the right technician, track to resolution</>}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Detected, no ticket" value={detected.length} tone={detected.length ? "bad" : "good"} />
        <Stat label="Open tickets" value={open.length} />
        <Stat label="P1 open" value={open.filter((t) => t.priority === "P1").length} tone="warn" />
        <Stat label="Resolved" value={resolved.length} tone="good" />
      </div>
      <Tabs<"detected" | "open" | "resolved">
        value={tab}
        onChange={setTab}
        tabs={[
          ["detected", "Detected by SCIO", detected.length],
          ["open", "Open tickets", open.length],
          ["resolved", "Resolved", resolved.length],
        ]}
      />
      {tab === "detected" && <DataGrid rows={detected} columns={dCols} rowKey={(i) => i.id} empty="No undetected faults. All issues have tickets." />}
      {tab === "open" && <DataGrid rows={open} columns={tCols} rowKey={(t) => t.id} search={(t) => `${t.id} ${t.equipmentId} ${t.issue} ${base.stores[t.storeIdx].name}`} empty="No open tickets." />}
      {tab === "resolved" && <DataGrid rows={resolved} columns={tCols} rowKey={(t) => t.id} />}
    </div>
  );
}

export function AssetsPage() {
  const { state, scope } = useRetail();
  const wf = useWorkflows();
  const { base } = state;
  const [type, setType] = useState<string>("All");
  const [open, setOpen] = useState<Equipment | null>(null);
  const issues = useMemo(() => equipmentIssues(state, scope), [state, scope]);
  const issueById = new Map(issues.map((i) => [i.equipment.id, i]));
  const rows = base.equipment.filter((e) => (!scope || scope.has(e.storeIdx)) && (type === "All" || e.type === type));
  const status = (e: Equipment) => {
    const i = issueById.get(e.id);
    if (!i) return e.fault ? "Repaired" : "Normal";
    return i.ticketId ? `Ticket ${i.ticketStatus}` : "Fault";
  };
  const overdueService = (e: Equipment) => (new Date(base.anchorDate).getTime() - new Date(e.lastService).getTime()) / 86_400_000 > e.serviceIntervalDays;

  const cols: Column<Equipment>[] = [
    { key: "id", label: "Equipment", sort: (e) => e.id, render: (e) => (<span><span className="font-semibold text-slate-900">{e.type} {e.id}</span><span className="block text-xs text-slate-500">{e.make} · {e.installed}</span></span>) },
    { key: "store", label: "Store", sort: (e) => e.storeIdx, render: (e) => `${base.stores[e.storeIdx].id} ${base.stores[e.storeIdx].name}` },
    { key: "read", label: "Live reading", align: "right", render: (e) => <span className={inRange(e) ? "tabular-nums text-slate-800" : "font-semibold tabular-nums text-rose-600"}>{e.readings[e.readings.length - 1]}{e.unit}</span> },
    { key: "set", label: "Target", align: "right", render: (e) => (e.setpoint !== null ? `${e.setpoint}${e.unit === "°C" ? "°C" : "%"}` : "–") },
    { key: "svc", label: "Last service", render: (e) => <span className={overdueService(e) ? "text-amber-600" : ""}>{e.lastService}{overdueService(e) ? " · due" : ""}</span> },
    { key: "status", label: "Status", sort: (e) => (issueById.has(e.id) ? 0 : 1), render: (e) => { const s = status(e); return <Pill tone={s === "Fault" ? "bad" : s.startsWith("Ticket") ? "warn" : "good"}>{s}</Pill>; } },
  ];

  const sel = open;
  const selIssue = sel ? issueById.get(sel.id) : undefined;
  const chart = sel ? sel.readings.map((v, i) => ({ label: `-${48 - i}h`, v })) : [];
  const safe = sel ? SAFE[sel.type] : undefined;

  return (
    <div className="space-y-6">
      <PageTitle title="Assets" sub="Store equipment health with live IoT readings: refrigeration, HVAC, POS terminals and generators" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {(["Freezer", "Chiller", "Cold Room", "HVAC", "POS Terminal", "Generator"] as EquipmentType[]).map((t) => {
          const all = base.equipment.filter((e) => e.type === t && (!scope || scope.has(e.storeIdx)));
          const bad = all.filter((e) => issueById.has(e.id)).length;
          return (
            <button key={t} onClick={() => setType(type === t ? "All" : t)} className={`rounded-xl border p-3.5 text-left transition ${type === t ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
              <div className="text-[12px] text-slate-500">{t}</div>
              <div className="mt-1 text-xl font-bold text-slate-900">{nf(all.length)}</div>
              <div className={`text-xs ${bad ? "font-semibold text-rose-600" : "text-emerald-600"}`}>{bad ? `${bad} with fault` : "all normal"}</div>
            </button>
          );
        })}
      </div>
      <DataGrid
        rows={rows}
        columns={cols}
        rowKey={(e) => e.id}
        search={(e) => `${e.id} ${e.type} ${e.make} ${base.stores[e.storeIdx].name}`}
        placeholder="Search equipment, make or store…"
        onRowClick={(e) => setOpen(e)}
        initialSort={{ key: "status", dir: "asc" }}
      />
      {sel && (
        <Drawer open onClose={() => setOpen(null)} title={`${sel.type} ${sel.id}`} sub={`${base.stores[sel.storeIdx].id} ${base.stores[sel.storeIdx].name} · ${sel.make} · installed ${sel.installed}`}>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Live reading" value={`${sel.readings[sel.readings.length - 1]}${sel.unit}`} tone={inRange(sel) ? "good" : "bad"} />
              <Stat label="Target" value={sel.setpoint !== null ? `${sel.setpoint}` : "–"} />
              <Stat label="Last service" value={sel.lastService} sub={`every ${sel.serviceIntervalDays} days`} />
              <Stat label="Status" value={status(sel)} tone={selIssue ? "bad" : "good"} />
            </div>
            <Card>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">IoT readings · last 48 hours</h4>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chart} margin={{ left: -10, right: 8 }}>
                    <CartesianGrid vertical={false} stroke={C.grid} />
                    <XAxis dataKey="label" {...axisProps} interval={7} />
                    <YAxis {...axisProps} width={40} domain={["auto", "auto"]} />
                    <Tooltip content={<ChartTooltip format={(v) => `${v}${sel.unit}`} />} />
                    {safe && <ReferenceLine y={safe[1]} stroke={C.rose} strokeDasharray="5 4" label={{ value: "safe limit", fill: C.rose, fontSize: 10, position: "insideTopRight" }} />}
                    <Line dataKey="v" name="Reading" stroke={selIssue ? C.rose : C.indigo} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            {selIssue && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
                <div className="text-sm text-rose-800">{sel.fault!.kind} for {sel.fault!.since} hours.</div>
                {selIssue.ticketId ? <Pill tone="accent">{selIssue.ticketId} · {selIssue.ticketStatus}</Pill> : <ActButton perm="ticket.create" onClick={() => wf.createTicket(selIssue)}>Create ticket</ActButton>}
              </div>
            )}
            <Card>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">Service history</h4>
              <ul className="space-y-1.5 text-sm">
                {state.tickets.filter((t) => t.equipmentId === sel.id).map((t) => (
                  <li key={t.id} className="flex justify-between">
                    <span>{t.id} · {t.issue}</span>
                    <Pill tone={t.status === "Resolved" ? "good" : "warn"}>{t.status}</Pill>
                  </li>
                ))}
                <li className="flex justify-between text-slate-600">
                  <span>Preventive service</span>
                  <span>{sel.lastService}</span>
                </li>
              </ul>
            </Card>
          </div>
        </Drawer>
      )}
    </div>
  );
}
