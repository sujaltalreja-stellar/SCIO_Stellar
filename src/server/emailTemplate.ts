export type ConfirmationVariant = "demo" | "beta" | "contact" | "booking";

export interface ConfirmationEmailPayload {
  variant: ConfirmationVariant;
  email: string;
  name?: string;
  company?: string;
  role?: string;
  sector?: string;
  businessType?: string;
  locations?: string;
  country?: string;
  phone?: string;
  challenge?: string;
  message?: string;
  meetingType?: string;
  scheduledDate?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const VARIANT_COPY: Record<
  ConfirmationVariant,
  {
    badge: string;
    subject: string;
    heading: string;
    intro: string;
    steps: [string, string, string];
    ctaLabel: string;
  }
> = {
  demo: {
    badge: "DEMO REQUEST CONFIRMED",
    subject: "Your Stellar SCIO Demo Request is Confirmed",
    heading: "We've received your demo request.",
    intro:
      "Thank you for reaching out to Stellar SCIO. Our solutions architecture team is reviewing your operational profile and will reach out within one business day to schedule a live walkthrough on your kind of data.",
    steps: [
      "A solutions architect reviews your systems and operational goals.",
      "We send a calendar invite with a tailored sandbox agenda.",
      "Live walkthrough of SCIO's unified operational cockpit and AI copilot.",
    ],
    ctaLabel: "Explore SCIO Platform",
  },
  beta: {
    badge: "PRIVATE BETA APPLICATION",
    subject: "Your Stellar SCIO Private Beta Application",
    heading: "You're on the SCIO Private Beta list.",
    intro:
      "Thank you for applying to the Stellar SCIO private beta. We onboard a small cohort of organizations at a time so every deployment receives dedicated engineering support.",
    steps: [
      "Our onboarding team reviews your company and systems stack.",
      "If selected for the current cohort, you'll receive sandbox credentials.",
      "Dedicated setup of your ERP, telemetry, and operational connectors.",
    ],
    ctaLabel: "Preview SCIO Platform",
  },
  contact: {
    badge: "INQUIRY RECEIVED",
    subject: "We Received Your Message — Stellar SCIO",
    heading: "Thanks for contacting Stellar SCIO.",
    intro:
      "Your message has been logged and routed to the appropriate sector specialist. We typically respond within one business day (under 2 hours for active enterprise inquiries).",
    steps: [
      "Your inquiry is routed to the relevant domain lead.",
      "We prepare answers covering architecture, integrations, or pricing.",
      "You'll receive a direct reply at this email address.",
    ],
    ctaLabel: "Visit Stellar SCIO",
  },
  booking: {
    badge: "BRIEFING SCHEDULED",
    subject: "Your Stellar SCIO Briefing Request is Logged",
    heading: "Your briefing request is confirmed.",
    intro:
      "We have logged your preferred briefing slot. A calendar invitation with a secure meeting link will be sent to your inbox shortly.",
    steps: [
      "Calendar invite and secure meeting link dispatched to your email.",
      "Optional pre-read and NDA available on request prior to the call.",
      "Live executive or technical sandbox session with our engineering lead.",
    ],
    ctaLabel: "Open SCIO Command Center",
  },
};

export function getConfirmationEmailSubject(payload: ConfirmationEmailPayload): string {
  const copy = VARIANT_COPY[payload.variant] ?? VARIANT_COPY.contact;
  return copy.subject;
}

export function renderConfirmationEmailHtml(payload: ConfirmationEmailPayload): string {
  const copy = VARIANT_COPY[payload.variant] ?? VARIANT_COPY.contact;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.stellarscio.app").replace(/\/+$/, "");
  const safeName = payload.name?.trim() ? escapeHtml(payload.name.trim()) : "there";

  const detailRows: Array<[string, string]> = [];
  if (payload.company?.trim()) detailRows.push(["Company", escapeHtml(payload.company.trim())]);
  if (payload.role?.trim()) detailRows.push(["Role", escapeHtml(payload.role.trim())]);
  if (payload.sector?.trim()) detailRows.push(["Sector", escapeHtml(payload.sector.trim())]);
  if (payload.businessType?.trim()) detailRows.push(["Business Type", escapeHtml(payload.businessType.trim())]);
  if (payload.country?.trim()) detailRows.push(["Country", escapeHtml(payload.country.trim())]);
  if (payload.phone?.trim()) detailRows.push(["Phone", escapeHtml(payload.phone.trim())]);
  if (payload.locations?.trim()) detailRows.push(["Number of Sites", escapeHtml(payload.locations.trim())]);
  if (payload.challenge?.trim()) detailRows.push(["Wants to Fix First", escapeHtml(payload.challenge.trim())]);
  if (payload.meetingType?.trim()) detailRows.push(["Session", escapeHtml(payload.meetingType.trim())]);
  if (payload.scheduledDate?.trim()) detailRows.push(["Requested Slot", escapeHtml(payload.scheduledDate.trim())]);
  if (payload.message?.trim()) detailRows.push(["Notes", escapeHtml(payload.message.trim())]);

  const detailsHtml =
    detailRows.length > 0
      ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background-color:#FBF9F5;border:1px solid #E5E1DA;border-radius:12px;">
        <tr>
          <td style="padding:18px 20px;">
            <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#8A857C;margin-bottom:12px;">
              Submission Summary
            </div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${detailRows
                .map(
                  ([label, val]) => `
                <tr>
                  <td style="padding:6px 0;width:130px;vertical-align:top;font-size:13px;font-weight:600;color:#5D5A54;">${label}</td>
                  <td style="padding:6px 0;vertical-align:top;font-size:13px;color:#111113;line-height:1.5;">${val}</td>
                </tr>`
                )
                .join("")}
            </table>
          </td>
        </tr>
      </table>`
      : "";

  const stepsHtml = copy.steps
    .map(
      (step, idx) => `
      <tr>
        <td style="padding:7px 0;vertical-align:top;width:30px;">
          <div style="width:22px;height:22px;line-height:22px;text-align:center;border-radius:9999px;background-color:#111113;color:#F2A93B;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;font-weight:700;">
            ${idx + 1}
          </div>
        </td>
        <td style="padding:7px 0 7px 8px;vertical-align:top;font-size:13.5px;line-height:1.55;color:#3E3C38;">
          ${escapeHtml(step)}
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(copy.subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#F3F1EC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111113;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F3F1EC;padding:36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#FFFFFF;border:1px solid #E5E1DA;border-radius:18px;overflow:hidden;box-shadow:0 12px 32px rgba(17,17,19,0.06);">
          <!-- Header -->
          <tr>
            <td style="background-color:#111113;padding:28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <span style="display:inline-block;background-color:#FFFFFF;color:#111113;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;font-weight:800;letter-spacing:1.2px;padding:6px 12px;border-radius:8px;">
                      STELLAR SCIO
                    </span>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="display:inline-block;background-color:rgba(242,169,59,0.16);border:1px solid rgba(242,169,59,0.4);color:#F2A93B;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;font-weight:700;letter-spacing:1px;padding:5px 10px;border-radius:9999px;">
                      ${escapeHtml(copy.badge)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:34px 32px 28px;">
              <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;font-weight:700;letter-spacing:-0.02em;color:#111113;">
                ${escapeHtml(copy.heading)}
              </h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3E3C38;">
                Hi ${safeName},
              </p>
              <p style="margin:0 0 20px;font-size:14.5px;line-height:1.65;color:#5D5A54;">
                ${escapeHtml(copy.intro)}
              </p>

              ${detailsHtml}

              <!-- Next Steps -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 28px;">
                <tr>
                  <td>
                    <div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#8A857C;margin-bottom:10px;">
                      What Happens Next
                    </div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${stepsHtml}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:9999px;background-color:#111113;">
                    <a href="${siteUrl}" style="display:inline-block;padding:13px 26px;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:9999px;">
                      ${escapeHtml(copy.ctaLabel)} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#FBF9F5;border-top:1px solid #E5E1DA;padding:20px 32px;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#6E6A63;">
                Stellar SCIO &bull; Operational AI Platform &bull; NDA Protected
              </p>
              <p style="margin:4px 0 0;font-size:11px;line-height:1.5;color:#8A857C;">
                You received this confirmation because you submitted a form on Stellar SCIO using ${escapeHtml(payload.email)}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
