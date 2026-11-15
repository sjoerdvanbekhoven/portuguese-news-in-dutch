import Link from "next/link";
import { GaloMark } from "./galo";

/** Krantenkop: haan + naam, met een tegelrand eronder. */
export function Masthead({ line }: { line?: React.ReactNode }) {
  return (
    <header className="masthead">
      <nav className="masthead-nav">
        <Link href="/archief">Archief</Link>
      </nav>
      <Link href="/" className="nameplate" aria-label="O Galo, naar de laatste editie">
        <GaloMark size={44} />
        <span>O Galo</span>
      </Link>
      <p className="tagline">Het Portugese nieuws, in het Nederlands</p>
      <div className="tiles" aria-hidden />
      {line && <p className="dateline">{line}</p>}
    </header>
  );
}
