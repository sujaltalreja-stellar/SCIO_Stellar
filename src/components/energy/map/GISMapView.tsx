import React, { useEffect } from "react";
import { useQuery } from "../lib/convex";
import { api } from "../lib/convex";
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

  const [mapStyle, setMapStyle] = React.useState<"light" | "streets" | "satellite" | "dark">("light");

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Title & Basemap Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Geographic Information Systems (GIS) Map</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">PORTFOLIO GEOLOCATIONS AND REAL-TIME GRID TELEMETRY (USA)</p>
        </div>

        {/* Basemap Switcher */}
        <div className="flex items-center gap-1 bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 p-1 rounded-lg text-xs font-mono self-start sm:self-auto shadow-xs">
          <button
            type="button"
            onClick={() => setMapStyle("light")}
            className={`px-3 py-1 rounded text-[11px] font-semibold transition-all ${
              mapStyle === "light" 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40 shadow-2xs font-bold" 
                : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            Light GIS
          </button>
          <button
            type="button"
            onClick={() => setMapStyle("streets")}
            className={`px-3 py-1 rounded text-[11px] font-semibold transition-all ${
              mapStyle === "streets" 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40 shadow-2xs font-bold" 
                : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            Streets (OSM)
          </button>
          <button
            type="button"
            onClick={() => setMapStyle("satellite")}
            className={`px-3 py-1 rounded text-[11px] font-semibold transition-all ${
              mapStyle === "satellite" 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40 shadow-2xs font-bold" 
                : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => setMapStyle("dark")}
            className={`px-3 py-1 rounded text-[11px] font-semibold transition-all ${
              mapStyle === "dark" 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40 shadow-2xs font-bold" 
                : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            Dark GIS
          </button>
        </div>
      </div>

      {/* MAP WRAPPER CONTAINER */}
      <div className="flex-1 rounded-xl overflow-hidden min-h-[500px] relative border border-slate-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 shadow-sm dark:shadow-2xl">
        <MapContainer
          center={[38.5, -96.5]} // Centered on USA
          zoom={4}
          minZoom={3}
          maxZoom={18}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          {/* Active Basemap Layer */}
          {mapStyle === "streets" ? (
            <TileLayer
              key="osm-streets"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          ) : mapStyle === "satellite" ? (
            <>
              <TileLayer
                key="esri-satellite"
                attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxNativeZoom={18}
                maxZoom={19}
              />
              <TileLayer
                key="esri-satellite-ref"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                maxNativeZoom={16}
                maxZoom={19}
              />
            </>
          ) : mapStyle === "dark" ? (
            <>
              <TileLayer
                key="esri-dark-base"
                attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, DeLorme, NAVTEQ'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                maxNativeZoom={16}
                maxZoom={19}
              />
              <TileLayer
                key="esri-dark-ref"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                maxNativeZoom={16}
                maxZoom={19}
              />
            </>
          ) : process.env.NEXT_PUBLIC_CARTO_API_KEY ? (
            <TileLayer
              key="carto-light"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url={`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${process.env.NEXT_PUBLIC_CARTO_API_KEY}`}
            />
          ) : (
            <>
              <TileLayer
                key="esri-light-base"
                attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, DeLorme, NAVTEQ'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                maxNativeZoom={16}
                maxZoom={19}
              />
              <TileLayer
                key="esri-light-ref"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                maxNativeZoom={16}
                maxZoom={19}
              />
            </>
          )}

          {plants.map((p: any) => (
            <Marker
              key={p._id}
              position={[p.latitude, p.longitude]}
              icon={createCustomMarker(p.type, p.status, p.healthScore)}
            >
              <Popup>
                <div className="p-3 min-w-[240px] text-xs font-sans text-slate-800 dark:text-zinc-200">
                  {/* Status header */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2 mb-2">
                    <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm tracking-wide">{p.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase ${
                      p.status === "online" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-500 dark:border-emerald-500/20" 
                        : p.status === "maintenance"
                        ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-yellow-500/10 dark:text-yellow-500 dark:border-yellow-500/20"
                        : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20 animate-pulse"
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  {/* Telemetry rows */}
                  <div className="space-y-2 font-mono text-[11px] mb-3 text-slate-600 dark:text-zinc-400">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><Layers className="h-3 w-3 text-slate-400 dark:text-zinc-500" /> Plant Type</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-300 uppercase">{p.type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><Thermometer className="h-3 w-3 text-slate-400 dark:text-zinc-500" /> Temp</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-300">{p.weatherTemp.toFixed(1)}°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5">Capacity</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-300">{p.capacity} MW</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5">Live Output</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{p.currentPower.toFixed(1)} MW</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5">Health Score</span>
                      <span className={`font-semibold ${
                        p.healthScore > 90 ? "text-emerald-600 dark:text-emerald-400" : p.healthScore > 85 ? "text-amber-600 dark:text-yellow-400" : "text-rose-600 dark:text-red-400"
                      }`}>{p.healthScore.toFixed(1)}%</span>
                    </div>
                    {p.activeAlarmsCount > 0 && (
                      <div className="flex justify-between items-center text-rose-600 dark:text-red-400 font-bold border-t border-slate-200 dark:border-zinc-900 pt-1">
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
                    className="w-full mt-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[10px] font-bold tracking-wider font-mono text-emerald-700 uppercase py-2 rounded flex items-center justify-center gap-1.5 group transition-all dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-emerald-400 cursor-pointer"
                  >
                    Open Plant Console <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Legends Overlay */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 dark:bg-zinc-950/90 border border-slate-200 dark:border-zinc-800/80 backdrop-blur-md p-3.5 rounded-xl text-[10px] font-mono space-y-2 text-slate-700 dark:text-zinc-400 shadow-md">
          <div className="font-bold text-slate-900 dark:text-zinc-300 border-b border-slate-100 dark:border-zinc-900 pb-1 mb-1.5 uppercase tracking-wider">SYSTEM LEGEND</div>
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-xs"></span>
            <span>Solar Generation Site</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500 shadow-xs"></span>
            <span>Wind Turbine Array</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-xs"></span>
            <span>Battery Storage (BESS)</span>
          </div>
          <div className="flex items-center space-x-2 border-t border-slate-100 dark:border-zinc-900 pt-1.5 mt-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span>System Alarm / Offline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
