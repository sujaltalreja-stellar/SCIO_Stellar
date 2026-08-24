import React, { useState } from "react";
import { useQuery, useMutation } from "../lib/convex";
import { api } from "../lib/convex";
import { 
  FileText, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Truck, 
  TrendingDown, 
  DollarSign, 
  Grid,
  ShieldCheck,
  Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ProcurementModule({ hideHeader = false }: { hideHeader?: boolean }) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "requisitions" | "pos" | "vendors" | "rfqs" | "contracts">("dashboard");
  const [selectedPO, setSelectedPO] = useState<any | null>(null);
  const [receiptWarehouseId, setReceiptWarehouseId] = useState<string>("");

  const requisitions = useQuery(api.procurement.listRequisitions) ?? [];
  const purchaseOrders = useQuery(api.procurement.listPurchaseOrders) ?? [];
  const vendors = useQuery(api.procurement.listVendors) ?? [];
  const warehouses = useQuery(api.inventory.listWarehouses) ?? [];
  const contracts = useQuery(api.procurement.listContracts) ?? [];

  const approveRequisition = useMutation(api.procurement.approveRequisition);
  const receiveGoods = useMutation(api.procurement.receiveGoods);

  const pendingPRs = requisitions.filter((r: any) => r.status === "pending_approval");
  const activePOs = purchaseOrders.filter((po: any) => po.status === "sent");

  const handleApprovePR = async (prId: string, approved: boolean) => {
    try {
      await approveRequisition({ prId, approved, approver: "ERP Finance Controller" });
      alert(approved ? "Purchase Requisition Approved! Corresponding Purchase Order sent to top-rated supplier." : "Purchase Requisition Rejected.");
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleReceiveGoods = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO || !receiptWarehouseId) return;

    try {
      await receiveGoods({
        poId: selectedPO._id,
        warehouseId: receiptWarehouseId as any,
        receiver: "Warehouse Receiving Clerk"
      });
      alert(`Goods received successfully for ${selectedPO.poNumber}. Stock incremented in selected warehouse!`);
      setSelectedPO(null);
      setReceiptWarehouseId("");
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  // Mock RFQ Comparison data
  const rfqComparisonData = [
    { name: "First Solar Panels", price: 120, leadTime: 5, rating: 98 },
    { name: "SMA Solar Panels", price: 135, leadTime: 3, rating: 93 },
    { name: "Canadian Solar Panels", price: 110, leadTime: 12, rating: 88 }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
        {!hideHeader && (
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Procurement & Supply Chain Management <span className="text-xs font-mono font-medium px-2 py-0.5 rounded border border-zinc-700 text-zinc-400 bg-slate-800/35">ERP Hub</span>
            </h2>
            <p className="text-xs text-zinc-500 font-mono">PURCHASE REQUISITIONS, PO TRACKING, AND VENDOR SCORECARDS</p>
          </div>
        )}

        {/* Tab switchers */}
        <div className="flex bg-zinc-900/60 p-1.5 rounded-lg border border-zinc-800 text-xs font-mono">
          {(["dashboard", "requisitions", "pos", "vendors", "rfqs", "contracts"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md transition-all uppercase ${
                activeTab === tab 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold" 
                  : "text-zinc-400 hover:text-zinc-200 border border-transparent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "dashboard" && (
        <>
          {/* KPI Panels */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-zinc-300">
            <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-zinc-500 font-mono uppercase">Requisitions Pending Approval</p>
                <h3 className="text-2xl font-bold text-white mt-1">{pendingPRs.length}</h3>
              </div>
              <FileText className="w-8 h-8 text-amber-500 opacity-60" />
            </div>

            <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-zinc-500 font-mono uppercase">POs In-Transit (Sent)</p>
                <h3 className="text-2xl font-bold text-emerald-400 mt-1">{activePOs.length}</h3>
              </div>
              <Truck className="w-8 h-8 text-emerald-500 opacity-60" />
            </div>

            <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-zinc-500 font-mono uppercase">Active Vendors</p>
                <h3 className="text-2xl font-bold text-white mt-1">{vendors.length}</h3>
              </div>
              <Users className="w-8 h-8 text-sky-500 opacity-60" />
            </div>

            <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-zinc-500 font-mono uppercase">Supplier Compliance Avg</p>
                <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                  {vendors.length > 0 
                    ? ((vendors.filter((v: any) => v.compliance).length / vendors.length) * 100).toFixed(0) 
                    : 0}%
                </h3>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-500 opacity-60" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Urgent requisitions */}
            <div className="lg:col-span-2 bg-zinc-950/20 border border-zinc-900 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-200">Pending Requisitions Approval Flow</h3>
              {pendingPRs.length === 0 ? (
                <div className="h-44 flex items-center justify-center border border-dashed border-zinc-800 rounded-lg text-zinc-500 italic text-xs font-mono">
                  No purchase requisitions are waiting for executive review.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingPRs.map((pr: any) => (
                    <div key={pr._id} className="border border-zinc-900 bg-zinc-950/40 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-sm">{pr.title}</span>
                          <span className="text-[9px] border border-amber-500/20 bg-amber-500/5 text-amber-400 px-2 py-0.5 rounded uppercase">Pending</span>
                        </div>
                        <p className="text-zinc-400 mt-1">Plant: {pr.plantName} | Requested By: {pr.requestedBy}</p>
                        <p className="text-zinc-500 mt-0.5">Required Date: {pr.requiredDate} | Est. Cost: <span className="text-slate-300 font-bold">${pr.estimatedCost.toFixed(2)}</span></p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprovePR(pr._id, true)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve PR
                        </button>
                        <button
                          onClick={() => handleApprovePR(pr._id, false)}
                          className="border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400 px-3 py-1.5 rounded transition-all flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Supplier Rankings */}
            <div className="bg-zinc-950/20 border border-zinc-900 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-200">Supplier Quality Rankings</h3>
              <div className="space-y-3 font-mono text-xs">
                {vendors.slice(0, 5).map((v: any) => (
                  <div key={v._id} className="border border-zinc-900 bg-zinc-950/30 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{v.name}</p>
                      <p className="text-[10px] text-zinc-500 uppercase">{v.category} Supplier</p>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold">{v.qualityRating}% Qlt</span>
                      <p className="text-[10px] text-zinc-500">{v.deliveryRating}% Delivery</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "requisitions" && (
        <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-200 mb-4">Material Purchase Requisition Ledger</h3>
          <div className="overflow-x-auto text-xs font-mono">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                  <th className="pb-3">Title / Objective</th>
                  <th className="pb-3">Requestor Plant</th>
                  <th className="pb-3">Estimated Cost</th>
                  <th className="pb-3">Required Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requisitions.map((pr: any) => (
                  <tr key={pr._id} className="border-b border-zinc-900 hover:bg-zinc-900/10">
                    <td className="py-3 font-bold text-zinc-200">{pr.title}</td>
                    <td className="py-3 text-zinc-400">{pr.plantName}</td>
                    <td className="py-3 text-zinc-300 font-bold">${pr.estimatedCost.toFixed(2)}</td>
                    <td className="py-3 text-zinc-400">{pr.requiredDate}</td>
                    <td className="py-3">
                      <span className={`text-[9px] uppercase px-2 py-0.5 rounded border ${
                        pr.status === "approved" || pr.status === "ordered"
                          ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20"
                          : pr.status === "pending_approval"
                          ? "bg-amber-500/5 text-amber-400 border-amber-500/20"
                          : "bg-red-500/5 text-red-400 border-red-500/20"
                      }`}>
                        {pr.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {pr.status === "pending_approval" && (
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => handleApprovePR(pr._id, true)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-2 py-0.5 rounded font-bold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApprovePR(pr._id, false)}
                            className="border border-red-500/30 text-red-400 hover:bg-red-500/10 px-2 py-0.5 rounded"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "pos" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 border border-zinc-900 bg-zinc-950/20 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-200 mb-4">Enterprise Purchase Order Ledger</h3>
            <div className="overflow-x-auto text-xs font-mono">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                    <th className="pb-3">PO Number</th>
                    <th className="pb-3">Supplier Name</th>
                    <th className="pb-3">Total Capital</th>
                    <th className="pb-3">Scheduled Delivery</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Goods Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po: any) => (
                    <tr key={po._id} className="border-b border-zinc-900 hover:bg-zinc-900/10">
                      <td className="py-3 font-bold text-white">{po.poNumber}</td>
                      <td className="py-3 text-zinc-300">{po.vendorName}</td>
                      <td className="py-3 text-zinc-300 font-bold">${po.totalCost.toFixed(2)}</td>
                      <td className="py-3 text-zinc-400">{po.scheduledDeliveryDate}</td>
                      <td className="py-3">
                        <span className={`text-[9px] uppercase px-2 py-0.5 rounded border ${
                          po.status === "closed" || po.status === "delivered"
                            ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/5 text-amber-400 border-amber-500/20"
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {po.status === "sent" && (
                          <button
                            onClick={() => setSelectedPO(po)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-2 py-1 rounded font-bold"
                          >
                            Receive Goods
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-zinc-950/20 border border-zinc-900 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-200">Goods Receipt Panel</h3>
            {selectedPO ? (
              <form onSubmit={handleReceiveGoods} className="space-y-4 font-mono text-xs">
                <div className="border border-emerald-500/15 bg-emerald-500/5 rounded p-3 text-[11px] text-emerald-400 space-y-1">
                  <p className="font-bold">Active Purchase Order: {selectedPO.poNumber}</p>
                  <p>Supplier: {selectedPO.vendorName}</p>
                  <p>Line Items: {selectedPO.items?.map((it: any) => `${it.partName} (x${it.quantity})`).join(", ")}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase">Target Warehouse Location:</label>
                  <select
                    required
                    value={receiptWarehouseId}
                    onChange={(e) => setReceiptWarehouseId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 p-2 rounded focus:outline-none"
                  >
                    <option value="">Select Storage Warehouse</option>
                    {warehouses.map((wh: any) => (
                      <option key={wh._id} value={wh._id}>{wh.name} ({wh.location})</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 py-2 rounded font-bold transition-all"
                  >
                    Generate GRN Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPO(null)}
                    className="border border-zinc-850 py-2 px-3 text-zinc-400 hover:bg-zinc-900 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-zinc-500 italic text-center text-xs py-8">Select an active PO in status "sent" to simulate a delivery logistics receipt check.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "vendors" && (
        <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-200 mb-4">Enterprise Vendor Directory</h3>
          <div className="overflow-x-auto text-xs font-mono">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                  <th className="pb-3">Vendor Name</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Compliance Status</th>
                  <th className="pb-3">Quality Score</th>
                  <th className="pb-3">Delivery Rate</th>
                  <th className="pb-3">Payment Terms</th>
                  <th className="pb-3">Contacts</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v: any) => (
                  <tr key={v._id} className="border-b border-zinc-900 hover:bg-zinc-900/10">
                    <td className="py-3 font-bold text-white">{v.name}</td>
                    <td className="py-3 uppercase text-[10px] text-zinc-400">{v.category}</td>
                    <td className="py-3">
                      <span className={`text-[9px] uppercase px-2 py-0.5 rounded border ${
                        v.compliance 
                          ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20" 
                          : "bg-red-500/5 text-red-400 border-red-500/20"
                      }`}>
                        {v.compliance ? "Compliant" : "Non-Compliant"}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="font-bold text-emerald-400">{v.qualityRating}%</span>
                    </td>
                    <td className="py-3 text-zinc-300">{v.deliveryRating}%</td>
                    <td className="py-3 text-zinc-400">{v.paymentTerms}</td>
                    <td className="py-3 text-zinc-500">{v.contacts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "rfqs" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 border border-zinc-900 bg-zinc-950/20 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-200 mb-4">Request For Quotation (RFQ) Comparison</h3>
            
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rfqComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#0c0c16", border: "1px solid #1f1f2e" }} />
                  <Bar dataKey="price" fill="#10b981" radius={[4, 4, 0, 0]} name="Unit Price ($)" />
                  <Bar dataKey="leadTime" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Lead Time (Days)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-zinc-950/20 border border-zinc-900 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-200">Quote Selection Matrix</h3>
            <div className="space-y-4 text-xs font-mono">
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Comparative analysis of vendor proposals for Solar PV panels. We weight unit costs (50%), lead speed (30%), and historical delivery compliance scores (20%).
              </p>

              {rfqComparisonData.map(c => (
                <div key={c.name} className="border border-zinc-900 bg-zinc-950/30 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-white">{c.name}</span>
                    <span className="text-emerald-400">Score: {((150 - c.price)*0.5 + (15 - c.leadTime)*0.3 + c.rating*0.2).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>Price: ${c.price}/unit</span>
                    <span>Lead: {c.leadTime} days</span>
                    <span>Rating: {c.rating}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "contracts" && (
        <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-200 mb-4">Service Level Agreement (SLA) Contracts</h3>
          <div className="overflow-x-auto text-xs font-mono">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                  <th className="pb-3">Contract Title</th>
                  <th className="pb-3">Supplier Name</th>
                  <th className="pb-3 text-right">Target Availability</th>
                  <th className="pb-3 text-right">SLA Response Window</th>
                  <th className="pb-3 text-right">Penalty Rate</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c: any) => (
                  <tr key={c._id} className="border-b border-zinc-900 hover:bg-zinc-900/10">
                    <td className="py-3 font-bold text-white">{c.title}</td>
                    <td className="py-3 text-zinc-400">{c.vendorName} ({c.vendorCategory})</td>
                    <td className="py-3 text-right text-emerald-400 font-bold">{c.slaAvailability}%</td>
                    <td className="py-3 text-right text-zinc-300">{c.slaResponseHours} Hours</td>
                    <td className="py-3 text-right text-red-400 font-bold">${c.penaltyRatePerHour}/Hour</td>
                    <td className="py-3 text-right">
                      <span className="text-emerald-400 text-[9px] uppercase px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/5">
                        {c.status}
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
