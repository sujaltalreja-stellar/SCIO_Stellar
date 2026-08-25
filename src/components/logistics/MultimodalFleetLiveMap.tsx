"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  Ship,
  Plane,
  Train,
  MapPin,
  ThermometerSnowflake,
  ShieldCheck,
  AlertTriangle,
  CircleAlert,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Navigation,
  Globe,
  Radio,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  SlidersHorizontal,
  Search,
  Maximize2,
  RefreshCw,
  Compass,
  Gauge,
  Eye,
  Crosshair
} from "lucide-react";
import dynamic from "next/dynamic";
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface VehicleAsset {
  id: string;
  name: string;
  trackingNumber: string;
  mode: "sea" | "air" | "rail" | "road";
  carrier: string;
  cargo: string;
  origin: string;
  destination: string;
  currentLat: number;
  currentLng: number;
  speed: string;
  heading: number;
  eta: string;
  progressPercent: number;
  status: "In Transit" | "Customs Clearance" | "Delayed" | "Approaching Berth";
  temperature?: number;
  humidity?: number;
  routePath: [number, number][];
}

const LIVE_VEHICLES: VehicleAsset[] = [
  {
    id: "V-SEA-8801",
    name: "Maersk Triple-E Class (SCIO Voyager)",
    trackingNumber: "TRK-GLOBAL-9942",
    mode: "sea",
    carrier: "Maersk Line",
    cargo: "High-Voltage Inverter Sub-Assemblies (480 Reefers)",
    origin: "Rotterdam Europort (NL)",
    destination: "Houston Bayport (US)",
    currentLat: 32.5,
    currentLng: -44.2,
    speed: "21.4 knots",
    heading: 260,
    eta: "2026-08-28 14:00 UTC",
    progressPercent: 74,
    status: "In Transit",
    temperature: -18.4,
    humidity: 82,
    routePath: [
      [51.95, 4.14],
      [49.5, -4.5],
      [42.0, -20.0],
      [36.0, -35.0],
      [32.5, -44.2],
      [28.0, -65.0],
      [25.0, -80.0],
      [29.6, -95.0]
    ]
  },
  {
    id: "V-AIR-8802",
    name: "Lufthansa Cargo B777F (D-ALFA)",
    trackingNumber: "TRK-GLOBAL-6410",
    mode: "air",
    carrier: "Lufthansa Cargo",
    cargo: "Lithium-Ion Cathode Raw Catalyst (Grade 9)",
    origin: "Tokyo Haneda (HND)",
    destination: "Frankfurt CargoCity (FRA)",
    currentLat: 56.8,
    currentLng: 38.2,
    speed: "492 knots (890 km/h)",
    heading: 285,
    eta: "2026-08-24 19:30 UTC",
    progressPercent: 92,
    status: "In Transit",
    temperature: 19.2,
    humidity: 45,
    routePath: [
      [35.54, 139.77],
      [48.0, 110.0],
      [55.0, 70.0],
      [56.8, 38.2],
      [52.0, 15.0],
      [50.03, 8.56]
    ]
  },
  {
    id: "V-RAIL-8803",
    name: "BNSF Double-Stack Tier 4 Intermodal #9240",
    trackingNumber: "TRK-GLOBAL-3108",
    mode: "rail",
    carrier: "BNSF Railway",
    cargo: "Renewable Wind Nacelle Spares & Blades",
    origin: "Chicago Logistics Park (US)",
    destination: "Long Beach Port Pier T (US)",
    currentLat: 39.7,
    currentLng: -104.9,
    speed: "58 mph (93 km/h)",
    heading: 245,
    eta: "2026-08-26 08:00 UTC",
    progressPercent: 48,
    status: "Delayed",
    temperature: 24.5,
    humidity: 60,
    routePath: [
      [41.87, -87.62],
      [41.25, -95.93],
      [39.7, -104.9],
      [40.76, -111.89],
      [36.16, -115.13],
      [33.77, -118.19]
    ]
  },
  {
    id: "V-ROAD-8804",
    name: "Volvo FH Electric Heavy Haul (Fleet #04)",
    trackingNumber: "TRK-GLOBAL-1954",
    mode: "road",
    carrier: "SCIO Green Logistics",
    cargo: "Stamped EV Chassis Frame Lot 12",
    origin: "Plant Alpha Stamping Bay (DE)",
    destination: "Giga-Factory Warehouse Bay 4 (FR)",
    currentLat: 49.2,
    currentLng: 6.1,
    speed: "82 km/h",
    heading: 215,
    eta: "2026-08-24 22:15 UTC",
    progressPercent: 62,
    status: "In Transit",
    temperature: 21.0,
    humidity: 50,
    routePath: [
      [50.11, 8.68],
      [49.45, 7.75],
      [49.2, 6.1],
      [48.85, 2.35]
    ]
  },
  {
    id: "V-SEA-8805",
    name: "CMA CGM Palais Royal (LNG Mega-Max)",
    trackingNumber: "TRK-APAC-7719",
    mode: "sea",
    carrier: "CMA CGM Group",
    cargo: "Semiconductor Wafer Fabrication Clean-Modules",
    origin: "Singapore Tuas Mega-Port (SG)",
    destination: "Rotterdam Europort (NL)",
    currentLat: 12.8,
    currentLng: 45.2,
    speed: "19.8 knots",
    heading: 310,
    eta: "2026-09-02 06:00 UTC",
    progressPercent: 38,
    status: "In Transit",
    temperature: -20.1,
    humidity: 78,
    routePath: [
      [1.35, 103.81],
      [5.9, 95.2],
      [10.0, 75.0],
      [12.8, 45.2],
      [27.8, 34.3],
      [31.2, 32.3],
      [36.0, -5.0],
      [51.95, 4.14]
    ]
  }
];

const DISTRIBUTION_HUBS = [
  { id: "HUB-1", name: "Rotterdam Europort Gateway", lat: 51.95, lng: 4.14, type: "Mega Sea Terminal", load: "92%" },
  { id: "HUB-2", name: "Houston Bayport Container Terminal", lat: 29.6, lng: -95.0, type: "Deepwater Port", load: "78%" },
  { id: "HUB-3", name: "Frankfurt CargoCity South (FRA)", lat: 50.03, lng: 8.56, type: "Airfreight Hub", load: "88%" },
  { id: "HUB-4", name: "Chicago Midwest Intermodal Center", lat: 41.87, lng: -87.62, type: "Rail Ramp Hub", load: "94%" },
  { id: "HUB-5", name: "Singapore Tuas Mega Logistics Park", lat: 1.35, lng: 103.81, type: "Automated Hub", load: "85%" },
];

function createVehicleIcon(mode: string, status: string) {
  let color = "#3FC8D8";
  let modeEmoji = "🚢";
  if (mode === "air") { color = "#8B5CF6"; modeEmoji = "✈️"; }
  if (mode === "rail") { color = "#E8A33D"; modeEmoji = "🚆"; }
  if (mode === "road") { color = "#2FBF71"; modeEmoji = "🚛"; }
  if (status === "Delayed") color = "#F0526B";

  const html = `
    <div class="relative flex items-center justify-center h-9 w-9 cursor-pointer group">
      <span class="absolute inline-flex h-full w-full rounded-full opacity-35 animate-ping" style="background-color: ${color};"></span>
      <div class="relative rounded-full h-7 w-7 border-2 border-[#0B0D0F] shadow-xl flex items-center justify-center text-xs" style="background-color: ${color};">
        <span class="text-[12px] select-none">${modeEmoji}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "custom-vehicle-marker",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function createHubIcon() {
  const html = `
    <div class="relative flex items-center justify-center h-6 w-6">
      <div class="rounded-md h-4 w-4 bg-[#FFFDFA] border border-black shadow-md flex items-center justify-center">
        <span class="h-1.5 w-1.5 bg-[#0B0D0F] rounded-xs"></span>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "custom-hub-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export default function MultimodalFleetLiveMap({
  onSelectVehicle,
}: {
  onSelectVehicle?: (vehicle: VehicleAsset) => void;
}) {
  const [vehicles, setVehicles] = useState<VehicleAsset[]>(LIVE_VEHICLES);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("V-SEA-8801");
  const [filterMode, setFilterMode] = useState<string>("all");
  const [showHubs, setShowHubs] = useState<boolean>(true);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);

  // Live real-time GPS drift simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        const dLat = (Math.random() - 0.48) * 0.05 * simulationSpeed;
        const dLng = (Math.random() - 0.48) * 0.08 * simulationSpeed;
        return {
          ...v,
          currentLat: +(v.currentLat + dLat).toFixed(4),
          currentLng: +(v.currentLng + dLng).toFixed(4),
        };
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, [simulationSpeed]);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  const filteredVehicles = filterMode === "all"
    ? vehicles
    : vehicles.filter(v => v.mode === filterMode);

  return (
    <div className="space-y-6">
      {/* Top Header Controls Bar */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] pb-4 xl:flex-row xl:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#3FC8D8]">
            <Globe className="h-3.5 w-3.5" />
            LIVE MULTIMODAL GPS &amp; AIS TELEMETRY MAP
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl mt-1">
            Global Fleet Geolocation &amp; Corridor Radar
          </h2>
        </div>

        {/* Filter Chips & Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#101315] border border-white/[0.08] p-1 rounded-xl">
            {[
              { id: "all", label: "All Fleet", icon: <Globe className="h-3 w-3" /> },
              { id: "sea", label: "Sea Vessels", icon: <Ship className="h-3 w-3 text-[#3FC8D8]" /> },
              { id: "air", label: "Air Freighters", icon: <Plane className="h-3 w-3 text-[#8B5CF6]" /> },
              { id: "rail", label: "Intermodal Rail", icon: <Train className="h-3 w-3 text-[#E8A33D]" /> },
              { id: "road", label: "OTR Heavy Trucks", icon: <Truck className="h-3 w-3 text-[#2FBF71]" /> },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  filterMode === f.id
                    ? "bg-white/[0.12] text-white font-bold shadow-xs"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {f.icon}
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
              showRoutes
                ? "bg-[#3FC8D8]/10 text-[#3FC8D8] border-[#3FC8D8]/30"
                : "bg-white/[0.03] text-white/40 border-white/[0.08]"
            }`}
          >
            {showRoutes ? "Corridor Polylines: ON" : "Polylines: OFF"}
          </button>
        </div>
      </div>

      {/* Main Map + Selected Vehicle Live HUD Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        
        {/* Left 3 Cols: High-Tech Leaflet Map Container */}
        <div className="lg:col-span-3 rounded-2xl border border-white/[0.08] overflow-hidden bg-[#08090C] h-[620px] relative shadow-2xl">
          {/* Map Overlay HUD Pill */}
          <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 rounded-xl border border-white/[0.1] bg-[#0B0D0F]/90 px-3.5 py-2 font-mono text-xs text-white backdrop-blur-md shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2FBF71] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2FBF71]" />
            </span>
            <span>{filteredVehicles.length} Multimodal Assets Live · 14ms Uplink</span>
          </div>

          <MapContainer
            center={[28.0, 10.0]}
            zoom={2.5}
            className="h-full w-full"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* Distribution Hub Markers */}
            {showHubs && DISTRIBUTION_HUBS.map(hub => (
              <Marker key={hub.id} position={[hub.lat, hub.lng]} icon={createHubIcon()}>
                <Popup>
                  <div className="p-2 text-xs font-mono bg-[#101315] text-white rounded-lg">
                    <strong className="text-[#3FC8D8]">{hub.name}</strong>
                    <p className="text-white/60 text-[10px] mt-0.5">{hub.type} · Utilization: {hub.load}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Live Vehicle Corridor Polylines */}
            {showRoutes && filteredVehicles.map(v => {
              let strokeColor = "#3FC8D8";
              if (v.mode === "air") strokeColor = "#8B5CF6";
              if (v.mode === "rail") strokeColor = "#E8A33D";
              if (v.mode === "road") strokeColor = "#2FBF71";
              if (v.status === "Delayed") strokeColor = "#F0526B";

              return (
                <Polyline
                  key={`path-${v.id}`}
                  positions={v.routePath}
                  pathOptions={{
                    color: strokeColor,
                    weight: v.id === selectedVehicleId ? 3.5 : 2,
                    dashArray: v.id === selectedVehicleId ? undefined : "6, 8",
                    opacity: v.id === selectedVehicleId ? 0.9 : 0.45
                  }}
                />
              );
            })}

            {/* Live Vehicle Moving Markers */}
            {filteredVehicles.map(v => (
              <Marker
                key={v.id}
                position={[v.currentLat, v.currentLng]}
                icon={createVehicleIcon(v.mode, v.status)}
                eventHandlers={{
                  click: () => {
                    setSelectedVehicleId(v.id);
                    if (onSelectVehicle) onSelectVehicle(v);
                  }
                }}
              >
                <Popup>
                  <div className="p-2.5 min-w-[200px] text-xs font-mono bg-[#101315] text-white rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center">
                      <strong className="text-[#3FC8D8] font-bold">{v.id}</strong>
                      <span className="text-[10px] text-white/50">{v.mode.toUpperCase()}</span>
                    </div>
                    <p className="text-white font-semibold text-xs">{v.name}</p>
                    <p className="text-[10px] text-white/60">{v.origin} ➔ {v.destination}</p>
                    <div className="pt-1 border-t border-white/[0.08] flex justify-between text-[10px]">
                      <span>Speed: <strong className="text-white">{v.speed}</strong></span>
                      <span>ETA: <strong className="text-[#2FBF71]">{v.eta.split(" ")[0]}</strong></span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Right 1 Col: Selected Asset Telemetry & Sensor Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#101315] p-5 space-y-4 font-mono text-xs flex flex-col justify-between shadow-2xl">
          <div className="space-y-4">
            <div className="border-b border-white/[0.07] pb-3">
              <span className="text-[10px] uppercase text-[#3FC8D8] tracking-wider block font-bold">Selected Telemetry Target</span>
              <h3 className="text-white font-bold text-base mt-0.5">{selectedVehicle.id}</h3>
              <p className="text-white/50 text-[11px] mt-0.5">{selectedVehicle.name}</p>
            </div>

            {/* GPS Coordinates & Speed */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-1">
                <span className="text-[10px] text-white/40 block">Coordinates</span>
                <span className="text-white font-bold text-xs">{selectedVehicle.currentLat}°N, {selectedVehicle.currentLng}°E</span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-1">
                <span className="text-[10px] text-white/40 block">Velocity</span>
                <span className="text-[#3FC8D8] font-bold text-xs">{selectedVehicle.speed}</span>
              </div>
            </div>

            {/* Route & Cargo Manifest */}
            <div className="p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-2">
              <span className="text-[10px] text-white/40 block">Cargo Manifest</span>
              <p className="text-white font-semibold text-xs leading-snug">{selectedVehicle.cargo}</p>
              <div className="pt-2 border-t border-white/[0.06] flex justify-between text-[11px]">
                <span className="text-white/40">Carrier:</span>
                <span className="text-white font-bold">{selectedVehicle.carrier}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-white/40">Transit Progress:</span>
                <span className="text-[#2FBF71] font-bold">{selectedVehicle.progressPercent}%</span>
              </div>
            </div>

            {/* Cold-Chain IoT Sensor Readout */}
            {selectedVehicle.temperature !== undefined && (
              <div className="p-3.5 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#8B5CF6] font-bold uppercase flex items-center gap-1">
                    <ThermometerSnowflake className="h-3 w-3" /> Reefer Telemetry
                  </span>
                  <span className="text-[10px] text-[#2FBF71] font-bold">Optimal</span>
                </div>
                <div className="flex justify-between text-xs pt-1">
                  <span className="text-white/60">Core Temperature:</span>
                  <strong className="text-white">{selectedVehicle.temperature}°C</strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Relative Humidity:</span>
                  <strong className="text-white">{selectedVehicle.humidity}%</strong>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-white/[0.07]">
            <button
              onClick={() => alert(`Transmitting expedited gate pass for ${selectedVehicle.id}`)}
              className="w-full py-2.5 bg-[#3FC8D8] hover:bg-[#3FC8D8]/90 text-black font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Zap className="h-4 w-4" />
              <span>Expedite Port Customs Gate</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
