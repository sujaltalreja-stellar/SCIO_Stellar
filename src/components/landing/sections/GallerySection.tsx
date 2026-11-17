"use client";

import React from "react";
import { C, SHELL, SectionIntro } from "../shared";
import { useSite } from "../../site/SiteContext";

export default function GallerySection() {
  const { handleNavClick } = useSite();

  return (
    <>
      {/* ==================== 7. FIELD TELEMETRY PHOTO GALLERY ==================== */}
      <section id="gallery" className="py-20 border-t" style={{ background: C.white, borderColor: C.lineLight }}>
        <div className={`${SHELL} space-y-12`}>
          <SectionIntro
            eyebrow="05 — GLOBAL FOOTPRINT · CONNECTED FIELD TELEMETRY"
            title="Connected Field Assets in Active Operation"
            description="SCIO powers control centers, ocean navigation bridges, robotic plants, and sub-zero cold chain corridors worldwide."
            tone="light"
            rule
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "12.4 GW Renewable Grid",
                sub: "50 Power Plants Monitored",
                industry: "energy",
                tab: "energy-dashboard",
                img: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=800&q=80",
                tag: "ENERGY"
              },
              {
                title: "Global Container Fleet",
                sub: "28 Ocean Vessels AIS Synced",
                industry: "maritime",
                tab: "dashboard",
                img: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80",
                tag: "MARITIME"
              },
              {
                title: "Robotic Automotive Line",
                sub: "Sub-Second Vibration Analysis",
                industry: "manufacturing",
                tab: "dashboard",
                img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
                tag: "MFG 4.0"
              },
              {
                title: "Cold-Chain Logistics Hub",
                sub: "-18.4°C IoT Telemetry Guard",
                industry: "logistics",
                tab: "dashboard",
                img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
                tag: "SUPPLY CHAIN"
              },
            ].map((item) => (
              <a
                key={item.title}
                href={`/?launch=1&industry=${item.industry}&tab=${item.tab}`}
                onClick={(e) => handleNavClick(e, item.industry, item.tab)}
                className="group relative h-64 rounded-2xl overflow-hidden border transition-all duration-300 hover:scale-[1.02] shadow-md bg-black block cursor-pointer"
                style={{ borderColor: C.lineLight }}
              >
                <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-0.5 rounded font-mono text-[9px] font-bold bg-white text-black shadow-xs">
                    {item.tag}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 space-y-1 z-10">
                  <h4 className="text-sm font-bold text-white leading-snug drop-shadow-sm">{item.title}</h4>
                  <p className="text-[11px] font-mono text-emerald-400 font-bold drop-shadow-sm">{item.sub}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
