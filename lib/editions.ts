import fs from "node:fs";
import path from "node:path";
import type { Edition } from "./schema";

const DIR = path.join(process.cwd(), "content", "editions");

/** Alle edities, nieuwste eerst. Wordt alleen tijdens de build gelezen. */
export function listEditionIds(): string[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}-\d{4}\.json$/.test(f))
    .map((f) => f.replace(/\.json$/, ""))
    .sort()
    .reverse();
}

export function getEdition(id: string): Edition | null {
  if (!/^\d{4}-\d{2}-\d{2}-\d{4}$/.test(id)) return null;
  const file = path.join(DIR, `${id}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as Edition;
}

export function getLatestEdition(): Edition | null {
  const [id] = listEditionIds();
  return id ? getEdition(id) : null;
}

export function formatEditionDate(iso: string, withTime = true): string {
  return new Intl.DateTimeFormat("nl-NL", {
    timeZone: "Europe/Lisbon",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(iso));
}
