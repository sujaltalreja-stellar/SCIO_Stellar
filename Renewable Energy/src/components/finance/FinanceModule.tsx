import React, { useState } from "react";
import { useQuery, useMutation } from "../../lib/convex";
import { api } from "../../lib/convex";
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Activity, 
  CheckCircle,
  FileSpreadsheet,
  PieChart as PieIcon,
  Briefcase,
  Layers,
  Calculator
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, AreaChart, Area } from "recharts";

export default function FinanceModule({ hideHeader = false }: { hideHeader?: boolean }) {
  const [activeSubTab, setActiveSubTab] = useState<"budgets" | "ap" | "ledger" | "ppa">("budgets");
  const [depreciationAsset, setDepreciationAsset] = useState<"solar" | "wind" | "bess">("solar");
  const [acquisitionCost, setAcquisitionCost] = useState<number>(120000);
  const [usefulLife, setUsefulLife] = useState<number>(15);

  const costCenters = useQuery(api.finance.listCostCenters) ?? [];
  const invoices = useQuery(api.finance.listInvoices, { status: "unpaid" }) ?? [];
  const paidInvoices = useQuery(api.finance.listInvoices, { status: "paid" }) ?? [];
  const ppaBillings = useQuery(api.finance.listPpaBillings) ?? [];

  const payInvoice = useMutation(api.finance.payInvoice);

  const handlePayInvoice = async (poId: string) => {
    try {
      await payInvoice({ poId, operator: "Lead Financial Analyst" });
      alert("Invoice approved and paid! Capital debited from respective cost center.");
    } catch (err: any) {
      alert("Error paying invoice: " + err.message);
    }
  };

  const totalAllocated = costCenters.reduce((sum: number, cc: any) => sum + cc.allocatedBudget, 0);
  const totalSpent = costCenters.reduce((sum: number, cc: any) => sum + cc.spentBudget, 0);

  // Mock historical OPEX trend data
  const historicalOPEX = [
    { month: "Jan", opex: 240000, capex: 180000 },
    { month: "Feb", opex: 280000, capex: 210000 },
    { month: "Mar", opex: 310000, capex: 300000 },
    { month: "Apr", opex: 290000, capex: 150000 },
    { month: "May", opex: 350000, capex: 400000 },
    { month: "Jun", opex: 420000, capex: 620000 }
  ];

  // Dynamic Depreciation Calculator Logic
  const getDepreciationData = () => {
    const data = [];
    const salvageValue = acquisitionCost * 0.1; // 10% salvage value default
    const annualDepreciation = (acquisitionCost - salvageValue) / usefulLife;
    
    for (let year = 0; year <= usefulLife; year++) {
      const bookValue = Math.max(salvageValue, acquisitionCost - annualDepreciation * year);
      data.push({
        year: `Yr ${year}`,
        bookValue: parseFloat(bookValue.toFixed(0)),
        depreciation: year === 0 ? 0 : parseFloat(annualDepreciation.toFixed(0))
      });
    }
    return data;
  };

  const depreciationData = getDepreciationData();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
        {!hideHeader && (
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Finance & Commercial Ledger <span className="text-xs font-mono font-medium px-2 py-0.5 rounded border border-zinc-700 text-zinc-400 bg-slate-800/35">Financials</span>
            </h2>
            <p className="text-xs text-zinc-500 font-mono">COST CENTER BUDGETS, EXPENSES, AND GENERAL LEDGER ACCOUNTS</p>
          </div>
        )}

        {/* Tab switchers */}
        <div className="flex bg-zinc-900/60 p-1.5 rounded-lg border border-zinc-800 text-xs font-mono">
          {(["budgets", "ap", "ledger", "ppa"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-3 py-1.5 rounded-md transition-all uppercase ${
                activeSubTab === tab 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold" 
                  : "text-zinc-400 hover:text-zinc-200 border border-transparent"
              }`}
            >
              {tab === "budgets" ? "Budgets & OPEX" : tab === "ap" ? "Accounts Payable" : tab === "ledger" ? "General Ledger" : "PPA Settlements"}
            </button>
          ))}
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-zinc-300">
        <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 font-mono uppercase">Total Allocated Budget</p>
            <h3 className="text-2xl font-bold text-white mt-1">${totalAllocated.toLocaleString()}</h3>
          </div>
          <DollarSign className="w-8 h-8 text-emerald-500 opacity-60" />
        </div>

        <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 font-mono uppercase">Total Spent Capital</p>
            <h3 className="text-2xl font-bold text-white mt-1">${totalSpent.toLocaleString()}</h3>
          </div>
          <CreditCard className="w-8 h-8 text-sky-500 opacity-60" />
        </div>

        <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 font-mono uppercase">Budget Utilization Index</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">
              {totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0}%
            </h3>
          </div>
          <TrendingUp className="w-8 h-8 text-emerald-500 opacity-60" />
        </div>
      </div>

      {activeSubTab === "budgets" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cost Centers */}
          <div className="lg:col-span-2 border border-zinc-900 bg-zinc-950/20 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-200">Cost Center Budgets</h3>
            <div className="space-y-4 font-mono text-xs">
              {costCenters.map((cc: any) => {
                const util = cc.allocatedBudget > 0 ? (cc.spentBudget / cc.allocatedBudget) * 100 : 0;
                return (
                  <div key={cc._id} className="border border-zinc-900 bg-zinc-950/40 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between font-bold">
                      <div>
                        <span className="text-zinc-500 text-[10px] uppercase mr-2">{cc.code}</span>
                        <span className="text-white">{cc.name}</span>
                      </div>
                      <span className="text-zinc-300">${cc.spentBudget.toLocaleString()} / <span className="text-zinc-500">${cc.allocatedBudget.toLocaleString()}</span></span>
                    </div>

                    <div className="space-y-1">
                      <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-950">
                        <div 
                          className={`h-full rounded-full ${util > 70 ? "bg-amber-500" : "bg-emerald-500"}`} 
                          style={{ width: `${util}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-zinc-500">
                        <span>Spent: {util.toFixed(1)}%</span>
                        <span>Category: {cc.category.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* OPEX Analytics Chart */}
          <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-200">OPEX Expenditure Trends</h3>
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalOPEX}>
                  <defs>
                    <linearGradient id="colorOpex" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" />
                  <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#0c0c16", border: "1px solid #1f1f2e" }} />
                  <Area type="monotone" dataKey="opex" stroke="#10b981" fillOpacity={1} fill="url(#colorOpex)" name="OPEX ($)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "ap" && (
        <div className="space-y-6">
          {/* Accounts Payable Ledger */}
          <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-200 mb-4">Accounts Payable Invoice Queue</h3>
            {invoices.length === 0 ? (
              <p className="text-zinc-500 italic text-xs font-mono py-6 text-center">No outstanding unpaid invoices found in the system queue.</p>
            ) : (
              <div className="overflow-x-auto text-xs font-mono">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                      <th className="pb-3">Invoice Number</th>
                      <th className="pb-3">PO Reference</th>
                      <th className="pb-3">Supplier Name</th>
                      <th className="pb-3">Total Amount</th>
                      <th className="pb-3">Due Date</th>
                      <th className="pb-3">Billing Details</th>
                      <th className="pb-3 text-right">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv: any) => (
                      <tr key={inv._id} className="border-b border-zinc-900 hover:bg-zinc-900/10">
                        <td className="py-3 font-bold text-white">{inv.invoiceNumber}</td>
                        <td className="py-3 text-zinc-400">{inv.poNumber}</td>
                        <td className="py-3 text-zinc-300">{inv.vendorName}</td>
                        <td className="py-3 text-emerald-400 font-bold">${inv.amount.toLocaleString()}</td>
                        <td className="py-3 text-zinc-400">{inv.dueDate}</td>
                        <td className="py-3 text-zinc-500 text-[10px] max-w-xs truncate">{inv.billingDetails}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handlePayInvoice(inv._id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-3 py-1 rounded font-bold"
                          >
                            Approve & Pay
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Historical Payments Registry */}
          <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-200 mb-4">Paid Invoices Ledger</h3>
            <div className="overflow-x-auto text-xs font-mono">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                    <th className="pb-3">Invoice Number</th>
                    <th className="pb-3">PO Reference</th>
                    <th className="pb-3">Supplier Name</th>
                    <th className="pb-3">Paid Amount</th>
                    <th className="pb-3">Due Date</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paidInvoices.map((inv: any) => (
                    <tr key={inv._id} className="border-b border-zinc-900 hover:bg-zinc-900/10 opacity-70">
                      <td className="py-3 font-bold text-zinc-400">{inv.invoiceNumber}</td>
                      <td className="py-3 text-zinc-500">{inv.poNumber}</td>
                      <td className="py-3 text-zinc-400">{inv.vendorName}</td>
                      <td className="py-3 text-zinc-350 font-bold">${inv.amount.toLocaleString()}</td>
                      <td className="py-3 text-zinc-500">{inv.dueDate}</td>
                      <td className="py-3">
                        <span className="text-emerald-400 text-[10px] border border-emerald-500/10 bg-emerald-500/5 px-2.5 py-0.5 rounded flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" /> Paid & Settled
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "ledger" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Double-entry balance sheet */}
          <div className="lg:col-span-2 border border-zinc-900 bg-zinc-950/20 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-200">General Ledger Accounts</h3>
            <div className="overflow-x-auto text-xs font-mono">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                    <th className="pb-3">Account Code</th>
                    <th className="pb-3">Account Name</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3 text-right">Debit Balance</th>
                    <th className="pb-3 text-right">Credit Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-900 hover:bg-zinc-900/10">
                    <td className="py-3 font-bold text-zinc-400">1000-CASH</td>
                    <td className="py-3 text-zinc-300 font-bold">Capital & Reserves Account</td>
                    <td className="py-3 text-zinc-500 uppercase">Asset</td>
                    <td className="py-3 text-right text-zinc-400">-</td>
                    <td className="py-3 text-right text-emerald-400 font-bold">${(totalAllocated - totalSpent).toLocaleString()}</td>
                  </tr>
                  <tr className="border-b border-zinc-900 hover:bg-zinc-900/10">
                    <td className="py-3 font-bold text-zinc-400">1200-INV</td>
                    <td className="py-3 text-zinc-300 font-bold">Warehouse Spares Inventory</td>
                    <td className="py-3 text-zinc-500 uppercase">Asset</td>
                    <td className="py-3 text-right text-emerald-400 font-bold">$482,000</td>
                    <td className="py-3 text-right text-zinc-400">-</td>
                  </tr>
                  <tr className="border-b border-zinc-900 hover:bg-zinc-900/10">
                    <td className="py-3 font-bold text-zinc-400">1500-PP&E</td>
                    <td className="py-3 text-zinc-300 font-bold">Property, Plant & Equipment</td>
                    <td className="py-3 text-zinc-500 uppercase">Asset</td>
                    <td className="py-3 text-right text-emerald-400 font-bold">$18,450,000</td>
                    <td className="py-3 text-right text-zinc-400">-</td>
                  </tr>
                  <tr className="border-b border-zinc-900 hover:bg-zinc-900/10">
                    <td className="py-3 font-bold text-zinc-400">2000-AP</td>
                    <td className="py-3 text-zinc-300 font-bold">Accounts Payable (Outstanding)</td>
                    <td className="py-3 text-zinc-500 uppercase">Liability</td>
                    <td className="py-3 text-right text-zinc-400">-</td>
                    <td className="py-3 text-right text-amber-500 font-bold">${invoices.reduce((sum: number, inv: any) => sum + inv.amount, 0).toLocaleString()}</td>
                  </tr>
                  <tr className="border-b border-zinc-900 hover:bg-zinc-900/10">
                    <td className="py-3 font-bold text-zinc-400">5000-OPEX</td>
                    <td className="py-3 text-zinc-300 font-bold">Maintenance & Operating Expense</td>
                    <td className="py-3 text-zinc-500 uppercase">Expense</td>
                    <td className="py-3 text-right text-emerald-400 font-bold">${totalSpent.toLocaleString()}</td>
                    <td className="py-3 text-right text-zinc-400">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Depreciation Calculator Card */}
          <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-200 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-emerald-400" /> Depreciation Estimator
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 uppercase">Acquisition Cost ($):</label>
                <input
                  type="number"
                  value={acquisitionCost}
                  onChange={(e) => setAcquisitionCost(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 p-2 rounded focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 uppercase">Useful Lifetime (Years):</label>
                <input
                  type="number"
                  value={usefulLife}
                  onChange={(e) => setUsefulLife(parseInt(e.target.value) || 1)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 p-2 rounded focus:outline-none"
                />
              </div>

              <div className="h-44 border-t border-zinc-900 pt-3">
                <p className="text-[10px] text-zinc-500 mb-2 uppercase">Straight-Line Book Value Curve</p>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={depreciationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" />
                    <XAxis dataKey="year" stroke="#888888" fontSize={9} />
                    <YAxis stroke="#888888" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: "#0c0c16", border: "1px solid #1f1f2e" }} />
                    <Line type="monotone" dataKey="bookValue" stroke="#f59e0b" strokeWidth={2} name="Book Value ($)" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "ppa" && (
        <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-200 mb-4">PPA Energy Generation Settlements</h3>
          <div className="overflow-x-auto text-xs font-mono">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                  <th className="pb-3">Plant Name</th>
                  <th className="pb-3">Billing Period</th>
                  <th className="pb-3 text-right">Energy Yield (MWh)</th>
                  <th className="pb-3 text-right">Tariff Rate ($/MWh)</th>
                  <th className="pb-3 text-right">Settled Revenue</th>
                  <th className="pb-3 text-right">Payout Status</th>
                </tr>
              </thead>
              <tbody>
                {ppaBillings.map((b: any) => (
                  <tr key={b._id} className="border-b border-zinc-900 hover:bg-zinc-900/10">
                    <td className="py-3 font-bold text-white flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        b.plantType === "solar" ? "bg-amber-500" : b.plantType === "wind" ? "bg-sky-400" : "bg-emerald-400"
                      }`} />
                      {b.plantName}
                    </td>
                    <td className="py-3 text-zinc-400">{b.billingPeriod}</td>
                    <td className="py-3 text-right text-zinc-300 font-bold">{b.mwhGenerated.toLocaleString()} MWh</td>
                    <td className="py-3 text-right text-zinc-500">${b.tariffRate}/MWh</td>
                    <td className="py-3 text-right text-emerald-400 font-bold">${b.totalRevenue.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <span className={`text-[9px] uppercase px-2 py-0.5 rounded border ${
                        b.status === "settled" 
                          ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20" 
                          : "bg-amber-500/5 text-amber-400 border-amber-500/20"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
