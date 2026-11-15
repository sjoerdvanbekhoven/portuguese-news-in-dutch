/** Gestileerde haan (galo), naar links kijkend. Eén kleur: currentColor. */
export function GaloMark({ size = 40, title }: { size?: number; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <path d={GALO_PATH} />
    </svg>
  );
}

/** Eén pad, zodat hij ook in de iOS-icoon (next/og) bruikbaar is. */
export const GALO_PATH = [
  // kam
  "M17 13c0-3 2-5 4-4 1-3 4-3 5 0 2-2 5-1 4 2l-2 3h-9z",
  // kop + nek + lijf + staartaanzet (silhouet)
  "M15 16c3-3 9-3 12 0 2 2 3 5 3 8 0 3 1 5 3 6 4 2 9 1 13-2l3-2c1 4 1 9-1 13-3 6-9 10-16 10-8 0-14-5-16-12-1-4 0-8-2-11l-3-2z",
  // snavel
  "M15 17l-6 3 6 2z",
  // staartveren
  "M44 27c-1-8 3-15 10-17-3 4-4 9-3 14z",
  "M47 29c2-7 7-11 13-11-4 3-6 8-6 13z",
  "M48 33c4-5 9-7 14-5-4 2-7 5-8 9z",
  // poten
  "M27 49h3v8h4v2h-7z",
  "M35 49h3v8h4v2h-7z",
].join(" ");
