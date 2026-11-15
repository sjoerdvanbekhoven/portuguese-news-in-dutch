/**
 * Gestileerde haan (galo), naar links kijkend. Lijf met kam, lel, sikkelstaart;
 * oog en vleugelveren zijn uitsparingen (evenodd). Poten apart, zodat ze het lijf
 * niet uitsparen.
 */
export const GALO_BODY =
  "M10 21 L15 18 C14 15 14 12 16 11 C16 8 20 7 21 10 C22 7 26 8 25 11 C27 11 28 14 26 16 " +
  "C28 19 28 21 27 23 C29 27 33 29 38 29 C41 29 43 28 44 26 C44 18 48 10 56 7 C52 12 51 16 52 20 " +
  "C54 17 58 16 61 17 C57 19 55 22 55 26 C57 25 60 26 62 29 C58 30 56 32 55 36 C54 44 46 50 37 50 " +
  "C26 50 19 44 18 36 C17 32 18 29 17 26 C15 28 12 28 12 25 C12 24 13 23 15 23 Z " +
  // oog
  "M18.6 17 a1.4 1.4 0 1 0 2.8 0 a1.4 1.4 0 1 0 -2.8 0 Z " +
  // vleugelveren
  "M26 36.5 C32 33.5 41 33.5 48 35.5 C41 36.2 34 37.5 28.5 40 C28.2 38.5 27.4 37.3 26 36.5 Z " +
  "M30 42 C35 39.6 41 38.8 46 39.4 C40.5 40.6 36 42.4 32.5 45 C32.2 43.6 31.4 42.6 30 42 Z";

export const GALO_LEGS =
  "M32 49.5 h2.2 v7.4 h1 v1.8 h-5.7 v-1.8 h2.5 z M39.5 49.5 h2.2 v7.4 h1 v1.8 h-5.7 v-1.8 h2.5 z";

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
      <path fillRule="evenodd" d={GALO_BODY} />
      <path d={GALO_LEGS} />
    </svg>
  );
}
