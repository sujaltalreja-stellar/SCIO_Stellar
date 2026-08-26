"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Mail,
  Building2,
  Globe,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Ship,
  Truck,
  Layers,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { useForm, ValidationError } from "@formspree/react";
import ScioSentinelOrb from "../ai/ScioSentinelOrb";

interface ContactHubProps {
  onBackToHome: () => void;
  onLaunchPlatform: (industry?: string, tab?: string) => void;
  onOpenResources?: () => void;
}

// Enterprise Social Media Links
const SOCIAL_CHANNELS = [
  {
    name: "LinkedIn",
    handle: "@stellarmindai",
    url: "https://www.linkedin.com/company/stellarmindai",
    description: "Enterprise announcements, technical whitepapers & hiring updates.",
    icon: (
      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.39 9.74v-8.37H5.07v8.37h2.78z" />
      </svg>
    ),
    color: "#0A66C2",
    bg: "rgba(10, 102, 194, 0.12)"
  },
  {
    name: "X (Twitter)",
    handle: "@StellarMind_ai",
    url: "https://twitter.com/StellarMind_ai",
    description: "Real-time AI research signals, feature updates & platform telemetry.",
    icon: (
      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: "#E2E8F0",
    bg: "rgba(255, 255, 255, 0.08)"
  },
  {
    name: "Facebook",
    handle: "StellarMind",
    url: "https://www.facebook.com/StellarMind/",
    description: "Community news, company events & industrial technology seminars.",
    icon: (
      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
      </svg>
    ),
    color: "#1877F2",
    bg: "rgba(24, 119, 242, 0.12)"
  },
  {
    name: "Instagram",
    handle: "@stellarmind_ai",
    url: "https://www.instagram.com/stellarmind_ai",
    description: "Behind the scenes at SCIO labs, UI concepts & engineering culture.",
    icon: (
      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
    color: "#E1306C",
    bg: "rgba(225, 48, 108, 0.12)"
  },
  {
    name: "Pinterest",
    handle: "StellarMind_ai",
    url: "https://in.pinterest.com/StellarMind_ai/",
    description: "Industrial visual architecture, infographics & dashboard moodboards.",
    icon: (
      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 0a12 12 0 0 0-4.37 23.18c-.07-.98-.13-2.48.03-3.55l1.04-4.42s-.27-.53-.27-1.32c0-1.24.72-2.16 1.62-2.16.76 0 1.13.57 1.13 1.26 0 .77-.49 1.92-.74 2.98-.21.9.45 1.63 1.34 1.63 1.6 0 2.84-1.69 2.84-4.13 0-2.16-1.55-3.67-3.77-3.67-2.57 0-4.08 1.93-4.08 3.92 0 .78.3 1.61.67 2.06.07.09.08.17.06.27l-.25 1.02c-.04.17-.14.23-.32.15-1.18-.55-1.92-2.28-1.92-3.67 0-2.99 2.17-5.74 6.27-5.74 3.29 0 5.85 2.35 5.85 5.48 0 3.27-2.06 5.9-4.92 5.9-.96 0-1.86-.5-2.17-1.09l-.59 2.25c-.21.83-.78 1.86-1.16 2.49A12 12 0 1 0 12 0z" />
      </svg>
    ),
    color: "#E60023",
    bg: "rgba(230, 0, 35, 0.12)"
  }
];

export default function ContactHub({ onBackToHome, onLaunchPlatform, onOpenResources }: ContactHubProps) {
  // Formspree hooks for General Contact Form (Form ID: mrpznygn)
  const [contactState, handleContactSubmit] = useForm("mrpznygn");
  // Formspree hooks for Calendar Booking (Form ID: mrpznygn)
  const [bookingState, handleBookingSubmit] = useForm("mrpznygn");

  // Meeting Booking Calendar State
  const [meetingType, setMeetingType] = useState<"discovery" | "technical">("discovery");
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate() + 1);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("10:00 AM");
  const [selectedTimezone, setSelectedTimezone] = useState<string>("EST (UTC-5)");
  const [bookedDetails, setBookedDetails] = useState<{ email: string; name: string; date: string; time: string } | null>(null);

  // Calendar Day Generation (Next 14 Days)
  const today = new Date();
  const calendarDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i + 1);
    return {
      dayNumber: d.getDate(),
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      monthName: d.toLocaleDateString("en-US", { month: "short" }),
      fullDateString: d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" }),
      isWeekend: d.getDay() === 0 || d.getDay() === 6
    };
  });

  const availableSlots = [
    "09:00 AM",
    "10:30 AM",
    "01:00 PM",
    "02:30 PM",
    "04:00 PM",
    "05:30 PM"
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
      
      {/* Ambient Lighting Gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* ==================== 1. TOP EXECUTIVE NAVIGATION ==================== */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur-2xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all text-xs font-mono font-bold cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </button>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-white text-black flex items-center justify-center font-mono font-black text-xs">
              S
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white font-display">STELLAR SCIO</span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              CONTACT &amp; BRIEFING
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ENTERPRISE DESK LIVE &bull; RESPONSE &lt; 2 HRS</span>
          </div>

          <button
            onClick={() => onLaunchPlatform("energy", "energy-dashboard")}
            className="px-4 py-1.5 rounded-full font-mono text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black transition-all flex items-center gap-1.5 shadow-md hover:scale-105 cursor-pointer"
          >
            <span>Launch Platform</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* ==================== 2. HERO HEADER ==================== */}
      <section className="pt-16 pb-12 px-4 sm:px-8 max-w-7xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold shadow-xs">
          <MessageSquare className="h-4 w-4" />
          <span>DIRECT ENTERPRISE ENGAGEMENT</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display max-w-4xl mx-auto leading-[1.15]">
          Let&apos;s Connect with Our <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
            Enterprise Architecture Team
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-sans font-medium">
          Schedule a live architectural briefing, request a custom industrial RFP, or book a guided sandbox walkthrough with our lead engineers.
        </p>
      </section>

      {/* ==================== 3. MAIN INTERACTIVE 2-COLUMN HUB ==================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ==================== LEFT COLUMN: MEETING BOOKING CALENDAR (7 COLS) ==================== */}
        <div className="lg:col-span-7 rounded-3xl border border-white/15 bg-slate-900/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Calendar Header & Session Selector */}
          <div className="space-y-4 border-b border-white/10 pb-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-lg sm:text-xl text-white">Book an Architectural Briefing</h2>
                  <p className="text-xs font-mono text-slate-400">Live 1-on-1 Session with Senior Solution Architect</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded font-mono text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>SLOTS OPEN FOR THIS WEEK</span>
              </span>
            </div>

            {/* Session Type Switcher */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMeetingType("discovery")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  meetingType === "discovery"
                    ? "bg-cyan-500/15 border-cyan-400 shadow-md text-white"
                    : "bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[11px] font-bold uppercase text-cyan-400">30 MIN SESSION</span>
                  <Zap className="h-4 w-4 text-cyan-400" />
                </div>
                <h4 className="font-bold text-sm text-white">Executive Discovery Briefing</h4>
                <p className="text-[11px] text-slate-400 mt-1">High-level architecture, 4-step loop &amp; enterprise ROI roadmap.</p>
              </button>

              <button
                type="button"
                onClick={() => setMeetingType("technical")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  meetingType === "technical"
                    ? "bg-emerald-500/15 border-emerald-400 shadow-md text-white"
                    : "bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[11px] font-bold uppercase text-emerald-400">45 MIN SESSION</span>
                  <Layers className="h-4 w-4 text-emerald-400" />
                </div>
                <h4 className="font-bold text-sm text-white">Technical Deep-Dive Sandbox</h4>
                <p className="text-[11px] text-slate-400 mt-1">OPC-UA/Modbus pipeline, FFT harmonics &amp; SAP S/4HANA PM sync.</p>
              </button>
            </div>
          </div>

          {/* Date Picker Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-cyan-400" />
                <span>1. Select Date (Upcoming 2 Weeks)</span>
              </label>

              <div className="flex items-center gap-2">
                <select
                  value={selectedTimezone}
                  onChange={(e) => setSelectedTimezone(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-white/10 bg-black/50 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="EST (UTC-5)">EST (New York, UTC-5)</option>
                  <option value="UTC (London, UTC+0)">UTC (London, UTC+0)</option>
                  <option value="CET (Berlin, UTC+1)">CET (Berlin, UTC+1)</option>
                  <option value="IST (Mumbai, UTC+5:30)">IST (Mumbai, UTC+5:30)</option>
                  <option value="SGT (Singapore, UTC+8)">SGT (Singapore, UTC+8)</option>
                </select>
              </div>
            </div>

            {/* Horizontal Scrollable Calendar Day Cards */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 overflow-x-auto pb-1">
              {calendarDays.slice(0, 7).map((d) => {
                const isSelected = selectedDate === d.dayNumber;
                return (
                  <button
                    key={d.dayNumber}
                    type="button"
                    onClick={() => setSelectedDate(d.dayNumber)}
                    className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? "bg-white text-black border-white shadow-lg scale-105 font-bold"
                        : "bg-black/40 border-white/10 text-slate-300 hover:border-cyan-400/50 hover:bg-white/5"
                    }`}
                  >
                    <span className={`text-[10px] font-mono uppercase ${isSelected ? "text-black/70 font-bold" : "text-slate-500"}`}>
                      {d.dayName}
                    </span>
                    <span className="text-base sm:text-lg font-black my-0.5">
                      {d.dayNumber}
                    </span>
                    <span className={`text-[9px] font-mono ${isSelected ? "text-emerald-700 font-bold" : "text-slate-500"}`}>
                      {d.monthName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot Picker Grid */}
          <div className="space-y-3">
            <label className="font-mono text-xs font-bold uppercase text-slate-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-emerald-400" />
              <span>2. Select Time Slot ({selectedTimezone})</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {availableSlots.map((slot) => {
                const isSelected = selectedTimeSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`py-2.5 px-3 rounded-xl border text-center font-mono text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500 text-black border-emerald-400 shadow-md scale-105"
                        : "bg-black/40 border-white/10 text-slate-300 hover:border-emerald-400/50 hover:bg-white/5"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Booking Confirmation Form (Formspree: mrpznygn) */}
          <div className="pt-4 border-t border-white/10">
            {bookingState.succeeded ? (
              <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-500 text-black mx-auto flex items-center justify-center shadow-lg font-bold">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-extrabold text-white">Meeting Confirmed &amp; Logged!</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Your briefing has been scheduled for <strong>Day {selectedDate} at {selectedTimeSlot} ({selectedTimezone})</strong>. A calendar invite with secure Google Meet link has been dispatched via Formspree.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onLaunchPlatform("energy", "energy-dashboard")}
                    className="px-4 py-2 rounded-lg font-mono text-xs font-bold bg-white text-black hover:bg-slate-100 shadow-md inline-flex items-center gap-1.5"
                  >
                    <span>Launch Live Platform in Sandbox</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-3 font-sans text-xs">
                <input type="hidden" name="form_type" value="Calendar Meeting Booking" />
                <input type="hidden" name="meeting_type" value={meetingType === "discovery" ? "30-min Executive Discovery Briefing" : "45-min Technical Sandbox"} />
                <input type="hidden" name="scheduled_date" value={`Day ${selectedDate}, Time: ${selectedTimeSlot} (${selectedTimezone})`} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="booking-name" className="block mb-1 font-mono text-[10px] uppercase text-white/60 font-bold">
                      Your Full Name
                    </label>
                    <input
                      id="booking-name"
                      type="text"
                      name="name"
                      required
                      placeholder="Dr. Alexander Wright"
                      className="w-full px-3.5 py-2.5 border rounded-xl font-mono focus:outline-none text-white bg-black/50 border-white/15 focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="booking-email" className="block mb-1 font-mono text-[10px] uppercase text-white/60 font-bold">
                      Corporate Work Email
                    </label>
                    <input
                      id="booking-email"
                      type="email"
                      name="email"
                      required
                      placeholder="alexander@enterprise.com"
                      className="w-full px-3.5 py-2.5 border rounded-xl font-mono focus:outline-none text-white bg-black/50 border-white/15 focus:border-cyan-400"
                    />
                    <ValidationError prefix="Email" field="email" errors={bookingState.errors} className="text-red-400 text-[10px] mt-1 font-mono" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Selected: Day {selectedDate} &bull; {selectedTimeSlot} ({selectedTimezone})</span>
                  </div>

                  <button
                    type="submit"
                    disabled={bookingState.submitting}
                    className="px-6 py-2.5 font-bold text-xs font-mono rounded-xl shadow-lg bg-cyan-400 hover:bg-cyan-300 text-black transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {bookingState.submitting ? (
                      <>
                        <span className="h-3 w-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Reserving Slot...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm &amp; Book Slot</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* ==================== RIGHT COLUMN: CUSTOM INQUIRY FORM (5 COLS) ==================== */}
        <div className="lg:col-span-5 rounded-3xl border border-white/15 bg-slate-900/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          <div className="space-y-1.5 border-b border-white/10 pb-5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Mail className="h-4 w-4" />
              </span>
              <h2 className="font-extrabold text-lg sm:text-xl text-white">Direct RFP &amp; Inquiries</h2>
            </div>
            <p className="text-xs font-mono text-slate-400">
              Submit custom requirements, telemetry specs, or partnership inquiries.
            </p>
          </div>

          {contactState.succeeded ? (
            <div className="py-10 text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-emerald-500 text-black mx-auto flex items-center justify-center shadow-xl font-bold">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h4 className="text-xl font-bold text-white">Message Delivered to Formspree</h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                Thank you. Your inquiry has been routed to the relevant sector practice lead. Expect an official response within 2 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-3.5 text-xs font-sans">
              <input type="hidden" name="form_type" value="Direct Enterprise Inquiry Form" />
              <input type="hidden" name="source" value="Stellar SCIO Contact Hub" />

              <div>
                <label htmlFor="contact-name" className="block mb-1 font-mono text-[10px] uppercase text-white/60 font-bold">
                  Full Name &amp; Title
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. VP of Operations / Chief Engineer"
                  className="w-full px-3.5 py-2.5 border rounded-xl font-mono focus:outline-none text-white bg-black/50 border-white/15 focus:border-emerald-400"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block mb-1 font-mono text-[10px] uppercase text-white/60 font-bold">
                  Corporate Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  required
                  placeholder="name@enterprise.com"
                  className="w-full px-3.5 py-2.5 border rounded-xl font-mono focus:outline-none text-white bg-black/50 border-white/15 focus:border-emerald-400"
                />
                <ValidationError prefix="Email" field="email" errors={contactState.errors} className="text-red-400 text-[10px] mt-1 font-mono" />
              </div>

              <div>
                <label htmlFor="contact-company" className="block mb-1 font-mono text-[10px] uppercase text-white/60 font-bold">
                  Company / Organization
                </label>
                <input
                  id="contact-company"
                  type="text"
                  name="company"
                  required
                  placeholder="e.g. Global Energy Utility / Shipping Line"
                  className="w-full px-3.5 py-2.5 border rounded-xl font-mono focus:outline-none text-white bg-black/50 border-white/15 focus:border-emerald-400"
                />
              </div>

              <div>
                <label htmlFor="contact-sector" className="block mb-1 font-mono text-[10px] uppercase text-white/60 font-bold">
                  Operating Sector
                </label>
                <select
                  id="contact-sector"
                  name="sector"
                  className="w-full px-3.5 py-2.5 border rounded-xl font-mono focus:outline-none text-white bg-black/50 border-white/15 focus:border-emerald-400 cursor-pointer"
                >
                  <option value="Renewable Energy & Utilities">⚡ Renewable Energy &amp; Utilities (12.4 GW)</option>
                  <option value="Maritime Fleet Operations">🚢 Maritime Fleet Operations (28 Ships)</option>
                  <option value="Manufacturing 4.0 & OEE">🏭 Manufacturing 4.0 &amp; Industrial OEE (91.4%)</option>
                  <option value="Cold-Chain & Logistics">🚚 Cold-Chain &amp; Multimodal Logistics (142 Reefers)</option>
                  <option value="Other Enterprise">🏢 Cross-Industry / Other Enterprise</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact-message" className="block mb-1 font-mono text-[10px] uppercase text-white/60 font-bold">
                  Operational Requirements / Scope
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={3}
                  required
                  placeholder="Describe your current SCADA / ERP landscape, asset count, and primary downtime or inspection challenges..."
                  className="w-full px-3.5 py-2.5 border rounded-xl font-mono focus:outline-none text-white bg-black/50 border-white/15 focus:border-emerald-400 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={contactState.submitting}
                className="w-full py-3 font-bold text-xs font-mono rounded-xl shadow-lg bg-emerald-500 hover:bg-emerald-400 text-black transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {contactState.submitting ? (
                  <>
                    <span className="h-3 w-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting to Formspree...</span>
                  </>
                ) : (
                  <>
                    <span>Transmit RFP / Inquiry</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>

              <p className="text-[10.5px] text-center text-slate-400 font-mono">
                Formspree Encrypted &bull; NDA Protected &bull; SLA &lt; 2 Hours
              </p>
            </form>
          )}

        </div>

      </main>

      {/* ==================== 4. OFFICIAL SOCIAL MEDIA & COMMUNITY CHANNELS ==================== */}
      <section className="border-t border-white/10 bg-slate-900/60 py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 font-mono text-xs font-bold">
              <Globe className="h-3.5 w-3.5" />
              <span>OFFICIAL STELLAR CHANNELS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Connect Across Our Global Network
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans">
              Follow our engineering research updates, case studies, and industrial webinars on your preferred platform.
            </p>
          </div>

          {/* 5 Social Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {SOCIAL_CHANNELS.map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl border border-white/10 bg-slate-950/80 hover:bg-slate-900 transition-all flex flex-col justify-between space-y-4 group hover:scale-[1.03] shadow-lg cursor-pointer"
                style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ color: item.color, background: item.bg }}
                    >
                      {item.icon}
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-white/40 group-hover:text-white transition-colors" />
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-white group-hover:text-cyan-300 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">{item.handle}</p>
                  </div>

                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono font-bold" style={{ color: item.color }}>
                  <span>Follow Channel</span>
                  <span>→</span>
                </div>
              </a>
            ))}
          </div>

        </div>
      </section>

      {/* ==================== 5. GLOBAL SUPPORT & HEADQUARTERS ==================== */}
      <footer className="border-t border-white/10 bg-slate-950 py-12 px-4 sm:px-8 text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1.5">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="h-6 w-6 rounded bg-white text-black font-black flex items-center justify-center text-[10px]">
                S
              </div>
              <span className="font-bold text-white uppercase tracking-wider">STELLAR SCIO MISSION CONTROL</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Direct Contact: <a href="mailto:info@stellarmind.ai" className="text-cyan-400 hover:underline">info@stellarmind.ai</a> &bull; Support: <a href="mailto:support@stellarmind.ai" className="text-emerald-400 hover:underline">support@stellarmind.ai</a>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
            <button onClick={onBackToHome} className="hover:text-white transition-colors cursor-pointer">Home</button>
            <button onClick={onOpenResources} className="hover:text-white transition-colors cursor-pointer">Resources</button>
            <button onClick={() => onLaunchPlatform("energy", "energy-dashboard")} className="hover:text-white transition-colors cursor-pointer text-emerald-400">Platform</button>
            <span>&copy; 2026 StellarMind.ai</span>
          </div>
        </div>
      </footer>

      {/* ==================== 6. 24/7 SENTINEL COMPANION ==================== */}
      <ScioSentinelOrb
        onLaunchPlatform={onLaunchPlatform}
        currentIndustry="home"
      />

    </div>
  );
}
