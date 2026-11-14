import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portugal in het kort",
  description: "Het Portugese nieuws, samengevat in het Nederlands.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        <header className="site-header">
          <div className="wrap">
            <Link href="/" className="brand">
              Portugal <em>in het kort</em>
            </Link>
            <nav>
              <Link href="/">Vandaag</Link>
              <Link href="/archief">Archief</Link>
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer className="site-footer wrap">
          Automatisch samengevat uit Portugese nieuwsbronnen met Claude. Controleer belangrijke
          zaken altijd via de oorspronkelijke bron.
        </footer>
      </body>
    </html>
  );
}
