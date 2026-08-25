"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import SectionIntro from "./SectionIntro";
import { C, T } from "./tokens";
import { VIEWPORT, fadeLeft, fadeRight, fadeUp, stagger } from "./motion";

const MONO = { fontFamily: "var(--font-sico-mono), 'DM Mono', monospace" };

/**
 * The five environment rows, ported from the design source's "industries"
 * section. Each badge carries its own dot colour (the design assigns a
 * different one per metric, not a uniform green) and the literal caps text —
 * these are not CSS-uppercased so mixed-case values like "184 VALVE STATIONS"
 * stay exactly as specified.
 */
const ENVIRONMENTS = [
  {
    title: "Manufacturing & Heavy Industry",
    intro:
      "High-density plant floors require tight synchronization between equipment maintenance, assembly schedules and raw material feeds.",
    image: "/service-pages/services_industry_manuf.png",
    alt: "Plant floor operator reviewing machine analytics on a workstation",
    badges: [
      { text: "ASSET HEALTH 91%", dot: "#2FBF71" },
      { text: "214 INSPECTIONS / MO", dot: "#8B5CF6" },
      { text: "37 DEFECTS OPEN", dot: "#E8A33D" },
    ],
    points: [
      [
        "Visual Defect & Corrosion Tracking",
        "Inspectors capture structural asset photos; SCIO identifies surface rust, dent severity and wear on pressurized tanks and heavy machinery.",
      ],
      [
        "Production Line Component Audits",
        "AI OCR reads worn or greasy labels on the shop floor, matching them instantly to the central asset registry and inventory ledgers.",
      ],
      [
        "EAM Maintenance Triggering",
        "Flag asset defects during visual audits and issue repair tickets straight to SAP EAM or IBM Maximo.",
      ],
    ],
  },
  {
    title: "Energy, Oil & Gas Infrastructure",
    intro:
      "Remote pipelines, refineries and off-grid substations demand offline capability and strict regulatory tracking across vast geographical footprints.",
    image: "/Product/Energy_side.png",
    alt: "Technicians inspecting pipework and pressure equipment in an industrial facility, annotated for corrosion",
    badges: [
      { text: "OFFLINE MODE ACTIVE", dot: "#3FC8D8" },
      { text: "GPS TAGGED", dot: "#8B5CF6" },
      { text: "184 VALVE STATIONS", dot: "#2FBF71" },
    ],
    points: [
      [
        "Offline Field Inspections",
        "Technicians perform AI-guided visual checks on remote valves and substations without internet access, syncing automatically once reconnected.",
      ],
      [
        "Hazardous Asset & Spares Inventory",
        "Catalog and track specialized safety hardware, gas detectors and critical repair parts across dispersed pipeline valve stations.",
      ],
      [
        "Regulatory Proof of Compliance",
        "Maintain tamper-proof digital records with precise GPS tags, photo proof and timestamped AI confidence scores for government audits.",
      ],
    ],
  },
  {
    title: "Corporate Facilities & Commercial Real Estate",
    intro:
      "Managing safety assets and maintenance supply stocks across multi-building campuses requires continuous compliance and material control.",
    image: "/Product/corporate_facilities_side.png",
    alt: "Facilities technicians performing fire and safety inspections in a corporate campus, with capability callouts and a compliance status bar",
    // This asset ships its own capability icon-labels and metric bar baked
    // into the pixels, so the CSS badge overlay below is skipped for it.
    bakedIn: true,
    points: [
      [
        "Automated Fire & Safety Inspections",
        "Technicians capture asset photos; SCIO's VLM verifies pressure gauges, reads physical tags via OCR and flags missing safety seals.",
      ],
      [
        "Parts & Spares Auto-Replenishment",
        "Closing a work order deducts replacement parts from MRO inventory and triggers purchase requisitions below minimum thresholds.",
      ],
      [
        "Instant Audit PDF Generation",
        "Produce verified, photo-backed compliance packages in seconds during unannounced municipal fire or safety inspections.",
      ],
    ],
  },
  {
    title: "Data Centers & Mission-Critical Infrastructure",
    intro:
      "Server rooms and power distribution hubs demand zero downtime, strict access controls and rapid identification of localized safety or hardware hazards.",
    image: "/Product/Data_centers_side.png",
    alt: "Data centre server racks with AI-detected hazard callouts for high voltage, overheating and a loose cable",
    // Baked-in status badges and hazard annotation boxes — same reasoning as
    // the corporate facilities asset above.
    bakedIn: true,
    points: [
      [
        "Critical Zone Safety Audits",
        "Visual checks on clean-agent fire suppression systems and power units in server rooms without disrupting live operations.",
      ],
      [
        "Component Verification & Traceability",
        "OCR tag extraction audits backup generators, high-density power distribution units and cooling assets.",
      ],
      [
        "Real-Time Alert Escalation",
        "High-priority dashboard alerts dispatch field technicians when critical equipment exceeds inspection windows or shows physical anomalies.",
      ],
    ],
  },
  {
    title: "Logistics, Warehousing & Distribution",
    intro:
      "Distribution hubs move material faster than most planning systems can see. SCIO keeps the plan, the bin and the field in the same ledger.",
    image: "/Product/logistics_side.png",
    alt: "Warehouse operators moving palletised stock through a distribution hub, with capability callouts and SKU tracking badges",
    // Baked-in capability icon-pills and metric badges — same reasoning as
    // the corporate facilities asset above.
    bakedIn: true,
    points: [
      [
        "Multi-Echelon Inventory Balancing",
        "Integrated material planning balances stock between central DC, site stores and bin locations.",
      ],
      [
        "Distribution Routing Sync",
        "Routing decisions stay synchronized with field activity, so delayed lanes surface as operational risk, not a spreadsheet variance.",
      ],
      [
        "Bin-Level Asset & Stock Registry",
        "Hierarchical tracking maps equipment, MRO parts and inventory down to building, floor, zone and bin.",
      ],
    ],
  },
];

function WhereSicoRuns() {
  return (
    <section className="bg-white px-5 pt-10 pb-6 sm:px-8 md:px-12 lg:px-[75px] lg:pt-14 lg:pb-8">
      <div className="mx-auto w-full max-w-[1290px]">
        <SectionIntro
          eyebrow="08 — Where SCIO Runs"
          title="The Same Operating Layer, Across Five Environments"
          description="Each environment brings its own assets, regulators and failure modes. SCIO adapts the registry, the inspection rules and the supply logic — the operating layer stays the same."
        />

        <div className="mt-[52px] flex flex-col gap-[22px]">
          {ENVIRONMENTS.map((env, index) => {
            // Photo and copy trade sides down the list so the eye zig-zags
            // instead of running down one rail for five straight rows.
            const imageFirst = index % 2 === 0;

            return (
              <motion.article
                key={env.title}
                className={`grid items-center gap-7 pt-[30px] lg:gap-8 ${
                  imageFirst
                    ? "lg:grid-cols-[1.05fr_1fr]"
                    : "lg:grid-cols-[1fr_1.05fr]"
                }`}
                style={{ borderTop: "1px solid rgba(20,17,14,.12)" }}
                variants={stagger(0.1)}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT}
              >
                <motion.div
                  variants={imageFirst ? fadeRight : fadeLeft}
                  className={`relative h-[260px] overflow-hidden rounded-2xl sm:h-[300px] lg:h-[340px] ${
                    imageFirst ? "lg:order-1" : "lg:order-2"
                  }`}
                  style={{ background: "#14181B" }}
                >
                  <Image
                    src={env.image}
                    alt={env.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />

                  {/* Manufacturing/Energy are plain photos, so this section
                      draws the readability gradient and metric badges in CSS.
                      The other three assets (`bakedIn`) already carry their
                      own capability labels and status badges baked into the
                      pixels — drawing these again would duplicate them. */}
                  {!env.bakedIn && (
                    <>
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(11,13,15,.55) 0%, rgba(11,13,15,.05) 40%, rgba(11,13,15,.1) 100%)",
                        }}
                      />
                      <div className="pointer-events-none absolute left-[14px] right-[14px] top-[14px] flex flex-wrap gap-2">
                        {env.badges.map((badge) => (
                          <motion.span
                            key={badge.text}
                            variants={fadeUp}
                            className="flex items-center gap-[7px] rounded-[7px] px-2.5 py-1.5 backdrop-blur-[8px]"
                            style={{
                              background: "rgba(11,13,15,.7)",
                              border: "1px solid rgba(255,255,255,.14)",
                            }}
                          >
                            <span
                              className={`h-[5px] w-[5px] shrink-0 rounded-full ${
                                badge.blink ? "animate-pulse-soft" : ""
                              }`}
                              style={{ background: badge.dot }}
                            />
                            <span
                              className="whitespace-nowrap"
                              style={{ ...MONO, fontSize: T.monoMicro, letterSpacing: ".1em", color: "#E8E6E3" }}
                            >
                              {badge.text}
                            </span>
                          </motion.span>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>

                <motion.div
                  variants={imageFirst ? fadeLeft : fadeRight}
                  className={imageFirst ? "lg:order-2" : "lg:order-1"}
                >
                  <span style={{ ...MONO, fontSize: "10px", letterSpacing: ".14em", color: "#A89A88" }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3
                    className="mt-2.5"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "clamp(24px, 2.4vw, 32px)",
                      fontWeight: 500,
                      letterSpacing: "-.03em",
                      color: C.ink,
                    }}
                  >
                    {env.title}
                  </h3>
                  <p className="mt-3 max-w-[52ch]" style={{ fontSize: "15px", lineHeight: 1.55, color: "#6B6259" }}>
                    {env.intro}
                  </p>

                  <dl className="mt-[22px] flex flex-col">
                    {env.points.map(([term, body]) => (
                      <div key={term} className="py-[13px]" style={{ borderTop: "1px solid rgba(20,17,14,.1)" }}>
                        <dt className="text-[14px] font-semibold" style={{ color: C.ink }}>
                          {term}
                        </dt>
                        <dd className="mt-1" style={{ fontSize: "13.5px", lineHeight: 1.45, color: "#6B6259" }}>
                          {body}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </motion.div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhereSicoRuns;
