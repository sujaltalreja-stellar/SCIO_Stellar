import React, { useState, useRef } from "react";
import { useQuery, useMutation, api } from "../lib/convex";
import {
  FileText,
  Camera,
  PenTool,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  QrCode,
  Search,
  Zap,
  Shield,
  Activity,
  History,
  AlertCircle,
  MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InspectionsHub() {
  const [activeTab, setActiveTab] = useState<"checklist" | "scanner">("checklist");

  const plants = useQuery(api.plants.list) ?? [];
  const assets = useQuery(api.assets.list) ?? [];
  const templates = useQuery(api.inspections.listTemplates) ?? [];
  const inspections = useQuery(api.inspections.list) ?? [];
  
  const submitInspectionMutation = useMutation(api.inspections.submit);
  const createWOMutation = useMutation(api.workOrders.create);

  // CHECKLIST FORM STATE
  const [chkPlantId, setChkPlantId] = useState("");
  const [chkAssetId, setChkAssetId] = useState("");
  const [chkTemplateId, setChkTemplateId] = useState("");
  const [chkInspector, setChkInspector] = useState("John Doe");
  const [checklistItems, setChecklistItems] = useState<{ item: string; checked: boolean; notes: string }[]>([]);
  const [chkFindings, setChkFindings] = useState("");
  const [chkRecommendations, setChkRecommendations] = useState("");
  const [chkPhoto, setChkPhoto] = useState<string | null>(null);
  const [chkSignature, setChkSignature] = useState("");
  const [chkSuccess, setChkSuccess] = useState(false);

  // SCANNER STATE
  const [scanQuery, setScanQuery] = useState("");
  const [scannedAsset, setScannedAsset] = useState<any>(null);
  const [scannerViewActive, setScannerViewActive] = useState(true);

  // Load checklist items when template changes
  const handleTemplateChange = (templateId: string) => {
    setChkTemplateId(templateId);
    const temp = templates.find((t: any) => t._id === templateId);
    if (temp) {
      setChecklistItems(
        temp.checklistItems.map((item: any) => ({ item, checked: true, notes: "" }))
      );
    }
  };

  const handleCheckboxChange = (idx: number, val: boolean) => {
    const updated = [...checklistItems];
    updated[idx].checked = val;
    setChecklistItems(updated);
  };

  const handleNoteChange = (idx: number, text: string) => {
    const updated = [...checklistItems];
    updated[idx].notes = text;
    setChecklistItems(updated);
  };

  const handleSimulatePhoto = () => {
    // Generate a mock green-glowing canvas base64 or SVG data to simulate camera attachment
    setChkPhoto("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='80' viewBox='0 0 120 80'><rect width='100%' height='100%' fill='%23052e16' stroke='%2310b981' stroke-width='2'/><text x='10' y='30' fill='%2310b981' font-size='10' font-family='monospace'>PHOTO ATTACHED</text><circle cx='100' cy='50' r='10' fill='%23ef4444'/></svg>");
  };

  const handleSign = () => {
    setChkSignature("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40' viewBox='0 0 100 40'><path d='M 10 20 Q 30 10 50 25 T 90 15' fill='none' stroke='%2310b981' stroke-width='2'/></svg>");
  };

  const handleChecklistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chkPlantId || !chkAssetId || !chkFindings) return;

    await submitInspectionMutation({
      plantId: chkPlantId as any,
      assetId: chkAssetId as any,
      templateId: chkTemplateId ? (chkTemplateId as any) : undefined,
      inspector: chkInspector,
      checklist: checklistItems,
      findings: chkFindings,
      recommendations: chkRecommendations,
      signature: chkSignature || "SIGNED MOCK",
    });

    setChkSuccess(true);
    setTimeout(() => {
      setChkSuccess(false);
      // Reset form
      setChkFindings("");
      setChkRecommendations("");
      setChkPhoto(null);
      setChkSignature("");
    }, 2500);
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = scanQuery.trim().toUpperCase();
    const match = assets.find((a: any) => a.serialNumber.toUpperCase() === cleanQuery || a.name.toLowerCase().includes(cleanQuery.toLowerCase()));
    
    if (match) {
      const p = plants.find((pl: any) => pl._id === match.plantId);
      const history = inspections.filter((i: any) => i.assetId === match._id);
      
      setScannedAsset({
        ...match,
        plantName: p?.name ?? "Unknown Plant",
        history
      });
      setScannerViewActive(false);
    } else {
      alert("No asset matched that serial number or identifier. Example try: " + (assets[0]?.serialNumber ?? "SN-SO-128475"));
    }
  };

  const triggerScanFromAsset = (serial: string) => {
    setScanQuery(serial);
    const match = assets.find((a: any) => a.serialNumber === serial);
    if (match) {
      const p = plants.find((pl: any) => pl._id === match.plantId);
      const history = inspections.filter((i: any) => i.assetId === match._id);
      
      setScannedAsset({
        ...match,
        plantName: p?.name ?? "Unknown Plant",
        history
      });
      setScannerViewActive(false);
    }
  };

  const handleCreateCorrectiveWO = async () => {
    if (!scannedAsset) return;
    
    await createWOMutation({
      plantId: scannedAsset.plantId,
      assetId: scannedAsset._id,
      type: "corrective",
      title: `Corrective calibration: ${scannedAsset.name}`,
      description: `Auto-dispatched via QR scanner terminal. Critical diagnostics recommended due to degradation.`,
      priority: "high",
      scheduledDate: new Date().toISOString().split("T")[0],
      estimatedHours: 3
    });
    
    alert(`Corrective Work Order generated for ${scannedAsset.name} and dispatched to the team.`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Inspections & Diagnostics Hub <span className="text-xs font-mono font-medium px-2 py-0.5 rounded border border-slate-700 text-slate-400 bg-slate-800/35">Mobile Core</span>
          </h1>
          <p className="text-xs text-slate-400">
            Submit field compliance safety checklists and simulate QR code scanning hardware inspections.
          </p>
        </div>

        {/* Tabs switcher */}
        <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("checklist")}
            className={`px-3 py-1.5 rounded transition-all font-medium flex items-center gap-1.5 ${
              activeTab === "checklist" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile Checklist
          </button>
          <button
            onClick={() => setActiveTab("scanner")}
            className={`px-3 py-1.5 rounded transition-all font-medium flex items-center gap-1.5 ${
              activeTab === "scanner" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" /> QR/Barcode Scanner
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TAB 1: SMARTPHONE CHECKLIST SIMULATOR */}
        {activeTab === "checklist" && (
          <>
            {/* Phone container */}
            <div className="lg:col-span-1 flex justify-center">
              <div className="w-[300px] h-[550px] border-[8px] border-slate-800 bg-slate-950 rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative">
                {/* Phone Speaker notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-4 w-28 bg-slate-800 rounded-b-xl z-20 flex items-center justify-center">
                  <div className="w-8 h-1 bg-slate-950 rounded-full" />
                </div>

                {/* Mobile App Header */}
                <div className="bg-slate-900 pt-6 pb-2.5 px-4 border-b border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 font-mono flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-400" /> SCIO FIELD INSPECTOR
                  </span>
                </div>

                {/* Mobile screen container scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-[11px] font-sans">
                  {chkSuccess ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
                      <CheckCircle className="w-12 h-12 text-emerald-400" />
                      <p className="font-bold text-white text-xs">Inspection Submitted</p>
                      <p className="text-[10px] text-slate-400">Database updated reactively. Audit trails dispatched.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleChecklistSubmit} className="space-y-4">
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-500 uppercase">1. Site Location</label>
                        <select
                          required
                          value={chkPlantId}
                          onChange={(e) => {
                            setChkPlantId(e.target.value);
                            // Set first asset of this plant as default
                            const pAssets = assets.filter((a: any) => a.plantId === e.target.value);
                            if (pAssets.length > 0) setChkAssetId(pAssets[0]._id);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white"
                        >
                          <option value="">Select Plant</option>
                          {plants.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-500 uppercase">2. Equipment / Serial</label>
                        <select
                          required
                          value={chkAssetId}
                          onChange={(e) => setChkAssetId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white"
                        >
                          <option value="">Select Asset</option>
                          {assets.filter((a: any) => a.plantId === chkPlantId).map((a: any) => (
                            <option key={a._id} value={a._id}>{a.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-500 uppercase">3. Template Protocol</label>
                        <select
                          required
                          value={chkTemplateId}
                          onChange={(e) => handleTemplateChange(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white"
                        >
                          <option value="">Select Template</option>
                          {templates.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                      </div>

                      {/* Checklist items list */}
                      {checklistItems.length > 0 && (
                        <div className="space-y-3 border-t border-slate-900 pt-3">
                          <label className="text-[9px] font-mono text-slate-500 uppercase">4. Checklist Protocols</label>
                          {checklistItems.map((item, idx) => (
                            <div key={idx} className="border border-slate-900 bg-slate-900/40 p-2 rounded space-y-1.5">
                              <label className="flex items-start gap-2 text-[10px] text-slate-300 font-medium leading-tight">
                                <input
                                  type="checkbox"
                                  checked={item.checked}
                                  onChange={(e) => handleCheckboxChange(idx, e.target.checked)}
                                  className="mt-0.5"
                                />
                                <span>{item.item}</span>
                              </label>
                              
                              {!item.checked && (
                                <input
                                  type="text"
                                  required
                                  value={item.notes}
                                  onChange={(e) => handleNoteChange(idx, e.target.value)}
                                  placeholder="Flag failure details (Required)..."
                                  className="w-full bg-slate-950 border border-red-500/25 rounded p-1 text-slate-200 text-[9px] placeholder-slate-600"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-500 uppercase">5. Findings Summary</label>
                        <textarea
                          required
                          placeholder="Record details of corrosion, fluid degradation..."
                          value={chkFindings}
                          onChange={(e) => setChkFindings(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white h-14"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-500 uppercase">Recommendations</label>
                        <textarea
                          placeholder="e.g. Schedule fuse calibration swaps"
                          value={chkRecommendations}
                          onChange={(e) => setChkRecommendations(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white h-12"
                        />
                      </div>

                      {/* Photo upload mock */}
                      <div className="space-y-2">
                        <label className="text-[9px] font-mono text-slate-500 uppercase">6. Diagnostics Attachments</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleSimulatePhoto}
                            className="flex-1 bg-slate-900 border border-slate-800 hover:border-emerald-500/20 py-2 rounded text-slate-300 flex items-center justify-center gap-1.5 font-semibold text-[10px]"
                          >
                            <Camera className="w-3.5 h-3.5 text-emerald-400" /> Capture Photo
                          </button>
                          
                          <button
                            type="button"
                            onClick={handleSign}
                            className="flex-1 bg-slate-900 border border-slate-800 hover:border-emerald-500/20 py-2 rounded text-slate-300 flex items-center justify-center gap-1.5 font-semibold text-[10px]"
                          >
                            <PenTool className="w-3.5 h-3.5 text-emerald-400" /> Sign Checkoff
                          </button>
                        </div>

                        {chkPhoto && (
                          <div className="border border-emerald-500/20 p-1 bg-slate-950 rounded flex justify-center">
                            <div dangerouslySetInnerHTML={{ __html: chkPhoto.replace("data:image/svg+xml;utf8,", "") }} />
                          </div>
                        )}

                        {chkSignature && (
                          <div className="border border-emerald-500/20 p-1 bg-slate-950 rounded flex justify-center">
                            <div dangerouslySetInnerHTML={{ __html: chkSignature.replace("data:image/svg+xml;utf8,", "") }} />
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 rounded shadow-lg transition-all"
                      >
                        Submit Inspection
                      </button>

                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Checklist History and scheduled list (Right 2 columns) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="border border-slate-800 bg-slate-900/10 backdrop-blur-md rounded-lg p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-white mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" /> Inspection Compliance Registry
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono">
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Site Location</th>
                        <th className="pb-2">Equipment Spec</th>
                        <th className="pb-2">Inspector</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Findings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspections.slice(0, 10).map((ins: any) => (
                        <tr key={ins._id} className="border-b border-slate-900 hover:bg-slate-900/15">
                          <td className="py-2.5 font-mono text-slate-400">{ins.scheduledDate}</td>
                          <td className="py-2.5 font-semibold text-slate-200">{ins.plantName}</td>
                          <td className="py-2.5 text-slate-300">{ins.assetName}</td>
                          <td className="py-2.5 text-slate-400">{ins.inspector}</td>
                          <td className="py-2.5">
                            <span className={`text-[9px] font-mono font-medium px-2 py-0.5 rounded border uppercase ${
                              ins.status === "completed" 
                                ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20" 
                                : ins.status === "in_progress" 
                                ? "bg-amber-500/5 text-amber-400 border-amber-500/20"
                                : "bg-slate-900 text-slate-500 border-slate-800"
                            }`}>
                              {ins.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-400 max-w-xs truncate">{ins.findings ?? "Awaiting Checklist Dispatch"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: QR/BARCODE SCANNER SIMULATOR */}
        {activeTab === "scanner" && (
          <>
            {/* Viewfinder Panel */}
            <div className="lg:col-span-1 border border-slate-800 bg-slate-900/20 backdrop-blur-md rounded-lg p-5 flex flex-col h-[520px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-slate-300">Viewfinder</h3>
                <span className="text-[10px] text-emerald-400 animate-pulse font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> SIM CAMERA READY
                </span>
              </div>

              {scannerViewActive ? (
                <div className="flex-1 border-2 border-dashed border-slate-800 rounded-lg bg-slate-950/80 relative flex flex-col items-center justify-center p-4">
                  {/* Glowing camera search guide bounds */}
                  <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-emerald-500" />
                  <div className="absolute top-10 right-10 w-8 h-8 border-t-2 border-r-2 border-emerald-500" />
                  <div className="absolute bottom-10 left-10 w-8 h-8 border-b-2 border-l-2 border-emerald-500" />
                  <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-emerald-500" />

                  <div className="bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] mb-3 animate-pulse">
                    <QrCode className="w-8 h-8 text-emerald-400" />
                  </div>

                  <p className="text-center font-semibold text-slate-200 text-xs">Align Asset Tag QR Inside Box</p>
                  <p className="text-center text-[10px] text-slate-500 mt-1 max-w-[200px] mb-5">
                    Select a serial number from the registry or search below to simulate a digital scan.
                  </p>

                  <form onSubmit={handleScanSubmit} className="w-full space-y-2 max-w-[220px]">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search Serial (e.g. SN-SO-)..."
                        value={scanQuery}
                        onChange={(e) => setScanQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded pl-7 pr-3 py-1.5 text-[11px] text-slate-100 uppercase"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-emerald-500 text-slate-950 font-bold py-1.5 rounded text-[11px] hover:bg-emerald-600 transition-all"
                    >
                      Scan Barcode
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
                  <div className="bg-emerald-500/15 p-4 rounded-full border border-emerald-500/30">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Asset Scanned successfully</h3>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Matched: {scannedAsset?.serialNumber}</p>
                  </div>

                  <button
                    onClick={() => {
                      setScanQuery("");
                      setScannedAsset(null);
                      setScannerViewActive(true);
                    }}
                    className="border border-slate-800 bg-slate-950 hover:border-emerald-500/20 text-slate-300 font-semibold px-4 py-2 rounded text-xs transition-all"
                  >
                    Scan Another Asset
                  </button>
                </div>
              )}
            </div>

            {/* Scanned Asset Profile Details & EAM dashboard (Right 2 columns) */}
            <div className="lg:col-span-2 border border-slate-800 bg-slate-900/20 backdrop-blur-md rounded-lg p-5 flex flex-col h-[520px] overflow-y-auto">
              {scannedAsset ? (
                <div className="space-y-5 text-xs text-slate-300">
                  {/* Summary Block */}
                  <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" /> Hardware Calibration Record
                      </span>
                      <h2 className="text-lg font-bold text-white mt-1">{scannedAsset.name}</h2>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 font-mono mt-0.5">
                        <MapPin className="w-3 h-3" /> Location: {scannedAsset.plantName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border uppercase ${
                        scannedAsset.status === "online" 
                          ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20" 
                          : "bg-amber-500/5 text-amber-400 border-amber-500/20"
                      }`}>
                        {scannedAsset.status}
                      </span>
                      <p className="text-2xl font-bold font-mono text-white mt-1.5">{scannedAsset.healthScore}%</p>
                      <p className="text-[9px] uppercase font-mono text-slate-500">Health score</p>
                    </div>
                  </div>

                  {/* Core details grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/40 p-4 rounded-lg border border-slate-850">
                    <div>
                      <p className="text-[9px] font-mono text-slate-500 uppercase">Manufacturer</p>
                      <p className="font-semibold text-slate-200 mt-0.5">{scannedAsset.manufacturer}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono text-slate-500 uppercase">Serial Number</p>
                      <p className="font-mono text-slate-200 mt-0.5">{scannedAsset.serialNumber}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono text-slate-500 uppercase">Install Date</p>
                      <p className="font-mono text-slate-200 mt-0.5">{scannedAsset.installationDate}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono text-slate-500 uppercase">Warranty Expiration</p>
                      <p className="font-mono text-slate-200 mt-0.5">{scannedAsset.warrantyExpiry}</p>
                    </div>
                  </div>

                  {/* Options actions strip */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleCreateCorrectiveWO}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded shadow transition-all"
                    >
                      Disptach Corrective WO
                    </button>
                    <button
                      onClick={() => {
                        setChkPlantId(scannedAsset.plantId);
                        setChkAssetId(scannedAsset._id);
                        // Pick first template matching plant type
                        const matchedTemp = templates.find((t: any) => t.type === plants.find((pl: any) => pl._id === scannedAsset.plantId)?.type);
                        if (matchedTemp) handleTemplateChange(matchedTemp._id);
                        setActiveTab("checklist");
                      }}
                      className="border border-slate-800 bg-slate-950 hover:border-emerald-500/20 text-slate-200 px-4 py-2 rounded transition-all"
                    >
                      Start Site Checklist
                    </button>
                  </div>

                  {/* History Logs */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-white flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-slate-400" /> Recent Diagnostic Logs
                    </h3>

                    {scannedAsset.history.length === 0 ? (
                      <p className="text-slate-500 italic text-[11px] bg-slate-950/20 border border-slate-900 rounded p-3 text-center">
                        No previous compliance checklists are logged in Convex for this equipment.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {scannedAsset.history.map((h: any) => (
                          <div key={h._id} className="border border-slate-900 bg-slate-950/20 p-3 rounded space-y-1">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span className="text-slate-400 font-bold">{h.inspector}</span>
                              <span className="text-slate-500">{h.scheduledDate}</span>
                            </div>
                            <p className="text-slate-300">{h.findings}</p>
                            {h.recommendations && <p className="text-amber-400 text-[10px]">Rec: {h.recommendations}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <QrCode className="w-12 h-12 text-slate-600 animate-pulse" />
                  <p className="font-semibold text-slate-400">Scanner Waiting</p>
                  <p className="text-[11px] text-slate-500 max-w-sm">
                    Enter an active asset serial code in the viewfinder to simulate a real-time scan. Examples:
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5 justify-center max-w-md pt-2">
                    {assets.slice(0, 10).map((a: any) => (
                      <button
                        key={a._id}
                        onClick={() => triggerScanFromAsset(a.serialNumber)}
                        className="text-[9px] font-mono border border-slate-800 bg-slate-950 text-slate-400 hover:border-emerald-500/25 hover:text-white px-2 py-0.5 rounded transition-all"
                      >
                        {a.serialNumber}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
