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
  }
> = {
  demo: {
    badge: "DEMO REQUEST RECEIVED",
    subject: "Your Stellar SCIO demo request",
    heading: "Thank you for requesting a demo",
    intro:
      "Thank you for your interest in Stellar SCIO. We have received your request, and a member of our team will contact you within one business day to arrange a time that suits you.",
    steps: [
      "We review your details and the systems your business uses today.",
      "We contact you to agree on a convenient date and time.",
      "We walk you through SCIO, focused on your business and your goals.",
    ],
  },
  beta: {
    badge: "APPLICATION RECEIVED",
    subject: "Your Stellar SCIO private beta application",
    heading: "Thank you for applying to the private beta",
    intro:
      "Thank you for applying to the Stellar SCIO private beta. We onboard a small number of businesses at a time so that each one receives dedicated support, and we will be in touch shortly.",
    steps: [
      "We review your application and business details.",
      "If it is a good fit, we contact you to discuss the next steps.",
      "We help you set up SCIO and connect your systems.",
    ],
  },
  contact: {
    badge: "MESSAGE RECEIVED",
    subject: "We have received your message | Stellar SCIO",
    heading: "Thank you for contacting us",
    intro:
      "Thank you for getting in touch with Stellar SCIO. We have received your message, and a member of our team will reply within one business day.",
    steps: [
      "Our team reviews your message and the details you shared.",
      "The right specialist prepares a response to your questions.",
      "We reply directly to this email address.",
    ],
  },
  booking: {
    badge: "BRIEFING REQUESTED",
    subject: "Your Stellar SCIO briefing request",
    heading: "Thank you, we have received your briefing request",
    intro:
      "We have received your preferred time. You will shortly receive a calendar invitation with a link to join the meeting.",
    steps: [
      "We confirm your time and send a calendar invitation.",
      "If helpful, we share a short agenda before the call.",
      "We meet and walk through SCIO with you and your team.",
    ],
  },
};

export function getConfirmationEmailSubject(payload: ConfirmationEmailPayload): string {
  const copy = VARIANT_COPY[payload.variant] ?? VARIANT_COPY.contact;
  return copy.subject;
}

export function renderConfirmationEmailHtml(payload: ConfirmationEmailPayload): string {
  const copy = VARIANT_COPY[payload.variant] ?? VARIANT_COPY.contact;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.stellarscio.app").replace(/\/+$/, "");
  const greeting = payload.name?.trim() ? `Dear ${escapeHtml(payload.name.trim())},` : "Hello,";

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

  const loginUrl = `${siteUrl}/app/login`;
  const logoUrl = `${siteUrl}/email/stellar-scio-logo-white.png`;
  const muted = "#6B6760";
  const font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  const eyebrow = `font-family:${font};font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#8A857C;`;

  const detailsHtml =
    detailRows.length > 0
      ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;border:1px solid #E7E3DC;border-radius:14px;border-collapse:separate;background-color:#FBFAF7;">
                <tr>
                  <td style="padding:16px 22px 6px;${eyebrow}">Your details</td>
                </tr>
                <tr>
                  <td style="padding:0 22px 10px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${detailRows
                        .map(
                          ([label, val], i) => `
                      <tr>
                        <td valign="top" style="padding:11px 12px 11px 0;width:40%;${i ? "border-top:1px solid #ECE8E1;" : ""}font-family:${font};font-size:13.5px;line-height:1.5;color:${muted};">${label}</td>
                        <td valign="top" style="padding:11px 0;${i ? "border-top:1px solid #ECE8E1;" : ""}font-family:${font};font-size:14px;line-height:1.5;font-weight:600;color:#111113;word-break:break-word;">${val.replace(/\n/g, "<br />")}</td>
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
                        <td valign="top" style="padding:8px 14px 8px 0;width:28px;">
                          <div style="width:28px;height:28px;line-height:28px;text-align:center;border-radius:9999px;background-color:#FFF4E2;color:#B06D0F;font-family:${font};font-size:13px;font-weight:700;">${idx + 1}</div>
                        </td>
                        <td valign="middle" style="padding:8px 0;font-family:${font};font-size:14px;line-height:1.55;color:#3E3C38;">${escapeHtml(step)}</td>
                      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(copy.subject)}</title>
  <style>
    @media only screen and (max-width: 620px) {
      .px { padding-left: 22px !important; padding-right: 22px !important; }
      .h1 { font-size: 22px !important; }
      .badge-cell { display: block !important; text-align: left !important; padding-top: 14px !important; }
      .btn a { display: block !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F3F1EC;font-family:${font};color:#111113;-webkit-font-smoothing:antialiased;">
  <!-- Preview text shown next to the subject in the inbox -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(copy.heading)}. Here is a summary of what you sent us and what happens next.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F3F1EC;">
    <tr>
      <td align="center" style="padding:40px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#FFFFFF;border:1px solid #E5E1DA;border-radius:20px;border-collapse:separate;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td class="px" style="background-color:#111113;padding:30px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="middle">
                    <a href="${siteUrl}" style="text-decoration:none;">
                      <img src="${logoUrl}" width="156" height="36" alt="Stellar SCIO" style="display:block;border:0;outline:none;height:36px;width:156px;color:#FFFFFF;font-family:${font};font-size:18px;font-weight:700;" />
                    </a>
                  </td>
                  <td class="badge-cell" align="right" valign="middle">
                    <span style="display:inline-block;background-color:#2A2212;border:1px solid #5C4518;color:#F2A93B;font-family:${font};font-size:10.5px;font-weight:700;letter-spacing:1.2px;padding:6px 12px;border-radius:9999px;white-space:nowrap;">${escapeHtml(copy.badge)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:3px;line-height:3px;font-size:0;background-color:#F2A93B;">&nbsp;</td></tr>

          <!-- Body -->
          <tr>
            <td class="px" style="padding:38px 36px 10px;">
              <h1 class="h1" style="margin:0 0 18px;font-family:${font};font-size:26px;line-height:1.25;font-weight:700;letter-spacing:-0.02em;color:#111113;">${escapeHtml(copy.heading)}.</h1>
              <p style="margin:0 0 12px;font-family:${font};font-size:15px;line-height:1.6;color:#111113;">${greeting}</p>
              <p style="margin:0;font-family:${font};font-size:15px;line-height:1.7;color:#4A4843;">${escapeHtml(copy.intro)}</p>
              ${detailsHtml}
            </td>
          </tr>

          <!-- What happens next -->
          <tr>
            <td class="px" style="padding:22px 36px 6px;">
              <div style="${eyebrow}margin-bottom:6px;">What happens next</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${stepsHtml}
              </table>
              <p style="margin:22px 0 0;font-family:${font};font-size:15px;line-height:1.6;color:#3E3C38;">Kind regards,<br /><strong style="color:#111113;">The Stellar SCIO team</strong></p>
            </td>
          </tr>

          <!-- Call to action -->
          <tr>
            <td class="px" style="padding:26px 36px 38px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#111113;border-radius:16px;border-collapse:separate;">
                <tr>
                  <td style="padding:26px 26px 24px;">
                    <p style="margin:0 0 4px;font-family:${font};font-size:16px;font-weight:700;color:#FFFFFF;">See SCIO in action</p>
                    <p style="margin:0 0 18px;font-family:${font};font-size:13.5px;line-height:1.6;color:#B9B5AE;">Explore the live demo and see how SCIO brings your ERP, POS, inventory and finance data together in one place.</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" class="btn">
                      <tr>
                        <td style="border-radius:9999px;background-color:#F2A93B;">
                          <a href="${loginUrl}" style="display:inline-block;padding:13px 26px;font-family:${font};font-size:14.5px;font-weight:700;color:#111113;text-decoration:none;border-radius:9999px;">Explore the live demo &rarr;</a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:14px 0 0;font-family:${font};font-size:13px;color:#8F8B84;">
                      or <a href="${siteUrl}" style="color:#FFFFFF;text-decoration:underline;">learn more on our website</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="px" style="background-color:#FBFAF7;border-top:1px solid #E5E1DA;padding:24px 36px;">
              <p style="margin:0 0 6px;font-family:${font};font-size:13px;line-height:1.6;color:#3E3C38;">
                If you have any questions in the meantime, simply reply to this email or contact us at <a href="mailto:sales@stellarmind.ai" style="color:#111113;font-weight:600;text-decoration:underline;">sales@stellarmind.ai</a>
              </p>
              <p style="margin:0 0 12px;font-family:${font};font-size:12px;line-height:1.6;color:${muted};">
                Stellar SCIO &middot; A product of <a href="https://stellarmind.ai" style="color:${muted};text-decoration:underline;">Stellarmind.ai</a>
              </p>
              <p style="margin:0;font-family:${font};font-size:11px;line-height:1.6;color:#8A857C;">
                You received this email because ${escapeHtml(payload.email)} was used to submit a form on <a href="${siteUrl}" style="color:#8A857C;">stellarscio.app</a>.
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
