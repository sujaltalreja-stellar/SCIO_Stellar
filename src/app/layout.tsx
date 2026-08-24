import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stellar SCIO Platform",
  description: "Enterprise Operations Control Center",
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
