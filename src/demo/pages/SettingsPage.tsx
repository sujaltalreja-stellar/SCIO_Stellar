import React from "react";
import { User, Plug, Cpu, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useDemoAuth } from "../auth";
import { Card, Badge } from "../ui";

const INTEGRATIONS = [
  { name: "ERP · SAP S/4HANA", detail: "Purchase orders, invoices, goods receipts", sync: "2 min ago" },
  { name: "WMS · Warehouse management", detail: "Stock levels across 3 warehouses", sync: "1 min ago" },
  { name: "IoT gateway", detail: "Vibration and pressure sensors on 38 assets", sync: "live" },
  { name: "GIS", detail: "Sites, warehouses and routes", sync: "15 min ago" },
  { name: "CMMS · Maintenance", detail: "Service schedules, inspections, work orders", sync: "4 min ago" },
];

const AI = [
  { name: "Ask SCIO copilot", model: "Gemma 4 31B · Sarvam AI", detail: "Natural-language questions with tool calling over operational data" },
  { name: "Vision inspection", model: "Gemma 4 31B · Sarvam AI (vision)", detail: "Defect detection, severity and inspection reports" },
  { name: "Document OCR", model: "PaddleOCR PP-OCRv6 · in browser", detail: "Reads invoices, POs and delivery notes" },
  { name: "Demand forecasting", model: "Holt-Winters · weekly seasonality", detail: "Daily consumption forecasts with 28-day back-test" },
  { name: "Asset anomaly detection", model: "Baseline ±3σ + trend projection", detail: "ISO 10816 vibration zones" },
];

export default function SettingsPage() {
  const { user } = useDemoAuth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1.5 text-[15px] text-slate-600">Your profile, connected systems, AI services and approval rules.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card>
          <Section icon={User} title="Profile" />
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111113] text-lg font-bold text-[#fff]">{user?.name.split(" ").map((p) => p[0]).join("")}</span>
            <div>
              <div className="font-semibold text-slate-900">{user?.name}</div>
              <div className="text-sm text-slate-500">{user?.role}</div>
              <div className="text-sm text-slate-500">{user?.email}</div>
            </div>
          </div>
          <dl className="mt-5 space-y-2 text-sm">
            <Row k="Time zone" v="Gulf Standard Time (GST)" />
            <Row k="Currency" v="AED" />
            <Row k="Language" v="English" />
          </dl>
        </Card>

        <Card className="xl:col-span-2">
          <Section icon={Plug} title="Connected systems" />
          <ul className="divide-y divide-slate-100">
            {INTEGRATIONS.map((i) => (
              <li key={i.name} className="flex items-center gap-4 py-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900">{i.name}</div>
                  <div className="text-sm text-slate-500">{i.detail}</div>
                </div>
                <Badge tone="good">Connected</Badge>
                <span className="hidden w-24 text-right text-xs text-slate-500 sm:block">Synced {i.sync}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="xl:col-span-2">
          <Section icon={Cpu} title="AI services" />
          <ul className="divide-y divide-slate-100">
            {AI.map((a) => (
              <li key={a.name} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900">{a.name}</div>
                  <div className="text-sm text-slate-500">{a.detail}</div>
                </div>
                <Badge tone="accent">{a.model}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <Section icon={ShieldCheck} title="Approval rules" />
          <ul className="space-y-3 text-sm text-slate-700">
            <li>AI recommends; a person approves every purchase request, work order and invoice payment.</li>
            <li>Invoices with quantity, price or receipt mismatches are held for review.</li>
            <li>Duplicate invoices are blocked from payment.</li>
            <li>Vision severity is decision support, not a certified engineering assessment.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title }: { icon: typeof User; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <Icon className="h-5 w-5 text-slate-500" />
      <h3 className="text-[17px] font-semibold text-slate-900">{title}</h3>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-500">{k}</dt>
      <dd className="font-medium text-slate-800">{v}</dd>
    </div>
  );
}
