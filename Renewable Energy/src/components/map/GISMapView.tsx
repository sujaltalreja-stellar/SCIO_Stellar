import React, { useEffect } from "react";
import { useQuery } from "../../lib/convex";
import { api } from "../../lib/convex";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Sun, Wind, Battery, ShieldAlert, Thermometer, Layers, ChevronRight } from "lucide-react";

interface GISMapViewProps {
  onSelectPlant: (plantId: string) => void;
}

export default function GISMapView({ onSelectPlant }: GISMapViewProps) {
  const plants = useQuery(api.plants.list) ?? [];

  const [isLightMode, setIsLightMode] = React.useState(() => 
    document.documentElement.classList.contains("light")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.documentElement.classList.contains("light"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    return () => observer.disconnect();
  }, []);

  // Custom marker icons using Leaflet divIcon to support inline SVG and avoid Vite image-resolve errors
  const createCustomMarker = (type: "solar" | "wind" | "bess", status: string, health: number) => {
    let color = "#eab308"; // Solar Amber
    if (type === "wind") color = "#0ea5e9"; // Wind Sky Blue
    if (type === "bess") color = "#10b981"; // BESS Emerald

    const isOffline = status === "offline";
    const isMaintenance = status === "maintenance";
    const hasAlarm = health < 90;

    let pulseClass = "animate-radar";
    let ringColor = color;
    if (isOffline) {
      ringColor = "#ef4444"; // Alarm red
      pulseClass = "animate-pulse-glow-red";
    } else if (hasAlarm) {
      ringColor = "#f97316"; // Alarm orange
    }

    const htmlString = `
      <div class="relative flex items-center justify-center h-8 w-8">
        <span class="absolute inline-flex h-full w-full rounded-full opacity-35 ${pulseClass}" style="background-color: ${ringColor};"></span>
        <div class="relative rounded-full h-4 w-4 border border-zinc-950 shadow-md flex items-center justify-center text-[8px]" style="background-color: ${color};">
          <span class="h-1.5 w-1.5 rounded-full bg-zinc-950"></span>
        </div>
      </div>
    `;

    return L.divIcon({
      html: htmlString,
      className: "custom-leaflet-icon",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">Geographic Information Systems (GIS) Map</h2>
        <p className="text-xs text-zinc-500 font-mono">PORTFOLIO GEOLOCATIONS AND REAL-TIME GRID telemetry</p>
      </div>

      {/* MAP WRAPPER CONTAINER */}
      <div className="flex-1 glass-panel rounded-xl overflow-hidden min-h-[500px] relative border border-zinc-900 shadow-2xl">
        <MapContainer
          center={[37.8, -100.0]} // Center of the US
          zoom={4.5}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          {/* CARTO DB Dark Matter / Positron Tile Layer */}
          <TileLayer
            key={isLightMode ? "light-tiles" : "dark-tiles"}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={isLightMode 
              ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            }
          />

          {plants.map((p: any) => (
            <Marker
              key={p._id}
              position={[p.latitude, p.longitude]}
              icon={createCustomMarker(p.type, p.status, p.healthScore)}
            >
              <Popup>
                <div className="p-3 min-w-[240px] text-xs font-sans text-zinc-200">
                  {/* Status header */}
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
                    <span className="font-bold text-zinc-100 text-sm tracking-wide">{p.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase ${
                      p.status === "online" 
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                        : p.status === "maintenance"
                        ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                        : "bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse"
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  {/* Telemetry rows */}
                  <div className="space-y-2 font-mono text-[11px] mb-3 text-zinc-400">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><Layers className="h-3 w-3 text-zinc-500" /> Plant Type</span>
                      <span className="font-semibold text-zinc-300 uppercase">{p.type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><Thermometer className="h-3 w-3 text-zinc-500" /> Temp</span>
                      <span className="font-semibold text-zinc-300">{p.weatherTemp.toFixed(1)}°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5">Capacity</span>
                      <span className="font-semibold text-zinc-300">{p.capacity} MW</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5">Live Output</span>
                      <span className="font-semibold text-emerald-400">{p.currentPower.toFixed(1)} MW</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5">Health Score</span>
                      <span className={`font-semibold ${
                        p.healthScore > 90 ? "text-emerald-400" : p.healthScore > 85 ? "text-yellow-400" : "text-red-400"
                      }`}>{p.healthScore.toFixed(1)}%</span>
                    </div>
                    {p.activeAlarmsCount > 0 && (
                      <div className="flex justify-between items-center text-red-400 font-bold border-t border-zinc-900 pt-1">
                        <span className="flex items-center gap-1.5"><ShieldAlert className="h-3 w-3" /> Active Alarms</span>
                        <span>{p.activeAlarmsCount}</span>
                      </div>
                    )}
                  </div>

                  {/* Go to console button */}
                  <button
                    onClick={() => {
                      onSelectPlant(p._id);
                    }}
                    className="w-full mt-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-bold tracking-wider font-mono text-emerald-400 uppercase py-2 rounded flex items-center justify-center gap-1.5 group transition-all"
                  >
                    Open Plant Console <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Legends Overlay */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-zinc-950/90 border border-zinc-800/80 backdrop-blur-md p-3.5 rounded-lg text-[10px] font-mono space-y-2 text-zinc-400 shadow-xl">
          <div className="font-bold text-zinc-300 border-b border-zinc-900 pb-1 mb-1.5 uppercase">SYSTEM LEGEND</div>
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
            <span>Solar Generation Site</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]"></span>
            <span>Wind Turbine Array</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span>Battery Storage (BESS)</span>
          </div>
          <div className="flex items-center space-x-2 border-t border-zinc-900 pt-1.5 mt-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span>System Alarm / Offline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
