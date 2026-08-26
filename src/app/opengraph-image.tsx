import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Stellar SCIO | Autonomous Enterprise Intelligence Platform";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#06080D",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#F8FAFC",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "1120px",
            height: "550px",
            background: "#0D111A",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "16px",
            padding: "36px 44px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              paddingBottom: "20px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 900,
                  letterSpacing: "1px",
                  color: "#FFFFFF",
                  textTransform: "uppercase",
                  lineHeight: 1,
                }}
              >
                STELLAR SCIO
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  color: "#94A3B8",
                  marginTop: "4px",
                  textTransform: "uppercase",
                }}
              >
                Stellar Mind - Operations Intelligence
              </div>
            </div>
            <div
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "1.5px",
                color: "#F8FAFC",
                textTransform: "uppercase",
              }}
            >
              ENTERPRISE CONTROL TOWER
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "24px",
              margin: "20px 0",
            }}
          >
            <div
              style={{
                flex: 1,
                background: "#131824",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "2px",
                    color: "#EF4444",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  THE OPERATIONAL CHALLENGE
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "#FFFFFF",
                    marginBottom: "8px",
                    lineHeight: 1.25,
                  }}
                >
                  Equipment Downtime &amp; Supply Blind Spots
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#94A3B8",
                    lineHeight: 1.5,
                  }}
                >
                  Unscheduled machine stops, cold-chain temperature excursions, demurrage delays, and fragmented telemetry across SCADA, PLC, and ERP data silos create costly operational friction.
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                {["Unscheduled Downtime", "Demurrage Risk", "Cold-Chain Excursions"].map((tag) => (
                  <div
                    key={tag}
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: "4px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#CBD5E1",
                    }}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                flex: 1,
                background: "#131824",
                border: "1px solid rgba(129, 140, 248, 0.35)",
                borderRadius: "12px",
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "2px",
                    color: "#818CF8",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  THE SCIO SOLUTION
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "#FFFFFF",
                    marginBottom: "8px",
                    lineHeight: 1.25,
                  }}
                >
                  Unified Telemetry &amp; Autonomous Action
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#94A3B8",
                    lineHeight: 1.5,
                  }}
                >
                  SCIO connects machine sensors, vessel AIS, and SCADA historians to build real-time digital twins, deliver predictive failure alerts, and dispatch automated MRO work orders.
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                {["Maritime AIS", "Smart Grid SCADA", "Digital Twin OEE"].map((tag) => (
                  <div
                    key={tag}
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: "4px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#CBD5E1",
                    }}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: "18px",
            }}
          >
            <div style={{ display: "flex", gap: "24px", fontSize: "13px", fontWeight: 600, color: "#94A3B8" }}>
              <div>Platform: <span style={{ color: "#FFFFFF" }}>stellarscio.app</span></div>
              <div>|</div>
              <div>Twitter: <span style={{ color: "#FFFFFF" }}>@StellarMind_ai</span></div>
              <div>|</div>
              <div>LinkedIn: <span style={{ color: "#FFFFFF" }}>@stellarmindai</span></div>
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: "1px",
                color: "#F8FAFC",
                padding: "8px 18px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "6px",
              }}
            >
              stellarscio.app
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
