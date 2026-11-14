import type { CATEGORIES } from "./schema";

type Category = (typeof CATEGORIES)[number];

/** Kleur per categorie (als CSS-variabele, zodat licht/donker in CSS geregeld wordt). */
export const CATEGORY_VAR: Record<Category, string> = {
  Politiek: "--c-politiek",
  Economie: "--c-economie",
  Samenleving: "--c-samenleving",
  "Klimaat & Natuur": "--c-natuur",
  Landbouw: "--c-landbouw",
  Regio: "--c-regio",
  Cultuur: "--c-cultuur",
  Sport: "--c-sport",
  Internationaal: "--c-internationaal",
};

export const categoryColor = (c: string) => `var(${CATEGORY_VAR[c as Category] ?? "--accent"})`;
