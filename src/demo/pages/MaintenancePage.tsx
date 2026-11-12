import React, { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarClock, TriangleAlert, Wrench, PackageCheck } from "lucide-react";
import { useDataset } from "../useDataset";
import { fleetHealth } from "../data/assetHealth";
import { axisProps, Badge, C, Card, CardTitle, ChartTooltip, cx, Kpi } from "../ui";
import { useApproval } from "../components/Approval";

const DAY = 86_400_000;

export default function MaintenancePage() {
  const ds = useDataset();
  const { request } = useApproval();
  const [filter, setFilter] = useState<"all" | "overdue" | "week" | "month">("all");
  const [orders, setOrders] = useState<Record<string, string>>({});

  const rows = useMemo(() => {
    const health = new Map(fleetHealth(ds).map((h) => [h.asset.id, h]));
    return ds.assets
      .map((a) => {
        const due = Math.round((new Date(a.nextServiceDate).getTime() - new Date(ds.anchorDate).getTime()) / DAY);
        const parts = ds.items.filter((i) => a.partIds.includes(i.id));
        const missing = parts.filter((p) => p.stock < 1);
        const low = parts.filter((p) => p.stock >= 1 && p.stock < p.minStock);
        return { asset: a, due, parts, missing, low, health: health.get(a.id)! };
      })
      .sort((x, y) => x.due - y.due);
  }, [ds]);

  const shown = rows.filter((r) => (filter === "overdue" ? r.due < 0 : filter === "week" ? r.due >= 0 && r.due <= 7 : filter === "month" ? r.due >= 0 && r.due <= 30 : true));
  const overdue = rows.filter((r) => r.due < 0);
  const week = rows.filter((r) => r.due >= 0 && r.due <= 7);
  const blocked = rows.filter((r) => r.due <= 7 && (r.missing.length || r.low.length));

  // Workload for the next 8 weeks (+ overdue backlog)
  const workload = useMemo(() => {
    const buckets = [{ label: "Overdue", count: overdue.length }];
    for (let w = 0; w < 8; w++) {
      const start = new Date(new Date(ds.anchorDate).getTime() + w * 7 * DAY);
      buckets.push({
        label: start.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
        count: rows.filter((r) => r.due >= w * 7 && r.due < (w + 1) * 7).length,
      });
    }
    return buckets;
  }, [rows, overdue.length, ds.anchorDate]);

  const createWO = async (r: (typeof rows)[number]) => {
    const rec = await request({
      kind: "Work order",
      title: `Scheduled service · ${r.asset.name}`,
      lines: [
        ["Asset", `${r.asset.id} · ${r.asset.site}`],
        ["Due", r.due < 0 ? `${-r.due} days overdue` : `in ${r.due} days (${r.asset.nextServiceDate})`],
        ["Interval", `every ${r.asset.serviceIntervalDays} days`],
        ["Parts to reserve", r.parts.map((p) => p.id).join(", ") || "-"],
        ["Parts status", r.missing.length ? `${r.missing.length} out of stock` : r.low.length ? `${r.low.length} below minimum` : "All available"],
      ],
      confirmLabel: "Approve work order",
    });
    if (rec) setOrders((o) => ({ ...o, [r.asset.id]: rec.ref }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-bold tracking-tight text-slate-900">Maintenance</h1>
        <p className="mt-1.5 text-[15px] text-slate-600">Service schedule, overdue work and spare-part readiness for every asset.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Overdue" value={String(overdue.length)} delta={`${overdue.filter((r) => r.asset.criticality === "Critical" || r.asset.criticality === "High").length} High Priority`} deltaPill sub={`of ${rows.length} assets`} tint="rose" icon={<TriangleAlert />} />
        <Kpi label="Due This Week" value={String(week.length)} sub="next 7 days" tint="blue" icon={<CalendarClock />} />
        <Kpi label="Parts Not Ready" value={String(blocked.length)} sub="jobs due ≤ 7 days" tint="amber" icon={<PackageCheck />} />
        <Kpi label="Work Orders Approved" value={String(Object.keys(orders).length)} sub="this session" tint="green" icon={<Wrench />} />
      </div>

      <Card>
        <CardTitle hint="Number of scheduled services per week">Maintenance workload · next 8 weeks</CardTitle>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workload} margin={{ left: -16, right: 8 }}>
              <CartesianGrid vertical={false} stroke={C.grid} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} allowDecimals={false} width={40} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(59,130,246,0.05)" }} />
              <Bar dataKey="count" name="Services" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {workload.map((w, i) => (
                  <Cell key={i} fill={i === 0 ? C.rose : C.indigo} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardTitle
          hint="Sorted by due date"
          right={
            <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs">
              {(
                [
                  ["all", "All"],
                  ["overdue", "Overdue"],
                  ["week", "This week"],
                  ["month", "30 days"],
                ] as const
              ).map(([k, l]) => (
                <button key={k} onClick={() => setFilter(k)} className={cx("rounded-lg px-3 py-1.5 font-medium", filter === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800")}>
                  {l}
                </button>
              ))}
            </div>
          }
        >
          Service schedule
        </CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[13px] text-slate-600">
                <th className="pb-2.5 font-semibold">Asset</th>
                <th className="pb-2.5 font-semibold">Site</th>
                <th className="pb-2.5 font-semibold">Criticality</th>
                <th className="pb-2.5 font-semibold">Next service</th>
                <th className="pb-2.5 font-semibold">Health</th>
                <th className="pb-2.5 font-semibold">Spare parts</th>
                <th className="pb-2.5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shown.map((r) => (
                <tr key={r.asset.id} className="hover:bg-slate-50/70">
                  <td className="py-3">
                    <div className="font-semibold text-slate-900">{r.asset.name}</div>
                    <div className="text-xs text-slate-500">every {r.asset.serviceIntervalDays} days · last {r.asset.lastServiceDate}</div>
                  </td>
                  <td className="py-3 text-slate-600">{r.asset.site}</td>
                  <td className="py-3">
                    <Badge tone={r.asset.criticality === "Critical" ? "bad" : r.asset.criticality === "High" ? "warn" : "neutral"}>{r.asset.criticality}</Badge>
                  </td>
                  <td className="py-3">
                    <div className="text-slate-800">{r.asset.nextServiceDate}</div>
                    <div className={cx("text-xs font-medium", r.due < 0 ? "text-rose-600" : r.due <= 7 ? "text-amber-600" : "text-slate-500")}>
                      {r.due < 0 ? `${-r.due} days overdue` : r.due === 0 ? "due today" : `in ${r.due} days`}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={cx("rounded-md px-2 py-0.5 text-[13px] font-bold", r.health.healthScore < 55 ? "bg-rose-50 text-rose-600" : r.health.healthScore < 75 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700")}>
                      {r.health.healthScore}
                    </span>
                  </td>
                  <td className="py-3">
                    {r.missing.length ? (
                      <Badge tone="bad">{r.missing.length} out of stock</Badge>
                    ) : r.low.length ? (
                      <Badge tone="warn">{r.low.length} below min</Badge>
                    ) : (
                      <Badge tone="good">Ready</Badge>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {orders[r.asset.id] ? (
                      <Badge tone="good">{orders[r.asset.id]}</Badge>
                    ) : (
                      <button onClick={() => createWO(r)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50">
                        Create work order
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
