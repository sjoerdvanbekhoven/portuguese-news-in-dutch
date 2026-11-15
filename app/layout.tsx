import type { Metadata, Viewport } from "next";
import { Fraunces, Literata } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT"],
  display: "swap",
});
const text = Literata({
  subsets: ["latin"],
  variable: "--font-text",
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "O Galo", template: "%s · O Galo" },
  description: "Het Portugese nieuws, elke ochtend in het Nederlands.",
  appleWebApp: { capable: true, title: "O Galo", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3eee3" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1816" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${display.variable} ${text.variable}`}>
      <body>{children}</body>
    </html>
  );
}
