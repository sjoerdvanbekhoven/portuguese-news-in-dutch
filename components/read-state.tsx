"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";

/* Welke artikelen gelezen zijn, per editie, in localStorage. Puur een gemak:
   als opslag niet beschikbaar is (privémodus) werkt alles gewoon zonder. */

const key = (editionId: string) => `gelezen:${editionId}`;
const EVENT = "gelezen-change";

function read(editionId: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key(editionId)) ?? "[]");
  } catch {
    return [];
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function useRead(editionId: string): string[] {
  // Snapshot als string, zodat useSyncExternalStore een stabiele waarde vergelijkt.
  const raw = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(read(editionId)),
    () => "[]",
  );
  return JSON.parse(raw);
}

/** Markeert het artikel als gelezen zodra het geopend wordt. */
export function MarkRead({ editionId, slug }: { editionId: string; slug: string }) {
  useEffect(() => {
    const cur = read(editionId);
    if (cur.includes(slug)) return;
    try {
      localStorage.setItem(key(editionId), JSON.stringify([...cur, slug]));
      window.dispatchEvent(new Event(EVENT));
    } catch {
      /* geen opslag beschikbaar */
    }
  }, [editionId, slug]);
  return null;
}

/** Vinkje op een kaart in het overzicht. */
export function ReadCheck({ editionId, slug }: { editionId: string; slug: string }) {
  const done = useRead(editionId).includes(slug);
  return done ? <span className="read-check"> · gelezen ✓</span> : null;
}

/** Grote knop: "Begin met lezen" of "Verder lezen (3/8)". */
export function ContinueButton({ editionId, slugs }: { editionId: string; slugs: string[] }) {
  const done = useRead(editionId);
  const next = slugs.find((s) => !done.includes(s));
  const count = slugs.filter((s) => done.includes(s)).length;

  if (!next) {
    return (
      <a className="cta" href="#woordjes">
        Alles gelezen ✓ <span>naar de woordjes ›</span>
      </a>
    );
  }
  return (
    <Link className="cta" href={`/editie/${editionId}/${next}`}>
      {count === 0 ? "Begin met lezen" : "Verder lezen"}
      <span>{count === 0 ? `${slugs.length} artikelen ›` : `${count} van ${slugs.length} gelezen ›`}</span>
    </Link>
  );
}
