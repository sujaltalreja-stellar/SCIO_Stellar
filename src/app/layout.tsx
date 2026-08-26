import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://stellar-scio.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Stellar SCIO | Autonomous Enterprise Intelligence Platform",
  description: "Next-generation enterprise operations control center for real-time supply chain, maritime, energy, and manufacturing intelligence.",
  keywords: ["Stellar SCIO", "Enterprise AI", "Supply Chain Intelligence", "Maritime Logistics", "Energy Grid Control", "Predictive Analytics"],
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Stellar SCIO | Autonomous Enterprise Intelligence Platform",
    description: "Next-generation enterprise operations control center for real-time supply chain, maritime, energy, and manufacturing intelligence.",
    siteName: "Stellar SCIO",
    url: siteUrl,
    images: [
      {
        url: "/thumbnail.png",
        width: 1200,
        height: 630,
        alt: "Stellar SCIO Autonomous Enterprise Intelligence Platform",
        type: "image/png",
      },
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Stellar SCIO Platform",
        type: "image/png",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stellar SCIO | Autonomous Enterprise Intelligence Platform",
    description: "Next-generation enterprise operations control center for real-time supply chain, maritime, energy, and manufacturing intelligence.",
    images: ["/thumbnail.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                const root = document.documentElement;
                const cleanExtensionMarkers = () => {
                  root.removeAttribute("data-qb-installed");
                  root.removeAttribute("suppresshydrationwarning");
                };
                cleanExtensionMarkers();
                const observer = new MutationObserver(cleanExtensionMarkers);
                observer.observe(root, {
                  attributes: true,
                  attributeFilter: ["data-qb-installed", "suppresshydrationwarning"],
                });
                window.addEventListener("load", () => observer.disconnect(), { once: true });
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
