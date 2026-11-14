import { XMLParser } from "fast-xml-parser";

/** lokaal = Tábua / Arganil / Oliveira do Hospital; regio = Coimbra en omgeving. */
export type Region = "lokaal" | "regio";

export type Feed = {
  name: string;
  url: string;
  region?: Region;
  /** Afwijkend tijdvenster; lokaal nieuws is schaars, dus daar kijken we verder terug. */
  hours?: number;
};

const googleNews = (query: string) =>
  "https://news.google.com/rss/search?q=" + encodeURIComponent(query) + "&hl=pt-PT&gl=PT&ceid=PT:pt-150";

/**
 * Bronnen. Controleer met `npm run check-feeds` welke werken; een feed die faalt
 * wordt bij het genereren gewoon overgeslagen.
 */
export const FEEDS: Feed[] = [
  { name: "Observador", url: "https://observador.pt/feed/" },
  { name: "RTP Notícias", url: "https://www.rtp.pt/noticias/rss" },
  { name: "Público", url: "https://feeds.feedburner.com/PublicoRSS" },
  { name: "Expresso", url: "https://expresso.pt/rss/ultimas" },
  { name: "ECO", url: "https://eco.sapo.pt/feed/" },
  { name: "Jornal de Notícias", url: "https://www.jn.pt/rss/" },
  { name: "Notícias ao Minuto", url: "https://www.noticiasaominuto.com/rss/ultima-hora" },
  // CNN Portugal heeft geen (bekende) eigen RSS-feed; via Google Nieuws beperkt tot hun site.
  { name: "CNN Portugal", url: googleNews("site:cnnportugal.iol.pt when:1d") },
  { name: "Google Nieuws PT", url: "https://news.google.com/rss?hl=pt-PT&gl=PT&ceid=PT:pt-150" },

  // Lokaal: Meda de Mouros (Tábua) en buurgemeenten. "Tábua" alleen is ook een gewoon woord
  // (plank), dus alleen in vaste combinaties.
  {
    name: "Google Nieuws lokaal",
    region: "lokaal",
    hours: 24 * 7,
    url: googleNews(
      '"Meda de Mouros" OR "concelho de Tábua" OR "município de Tábua" OR "Câmara de Tábua" OR ' +
        'Arganil OR Coja OR "Oliveira do Hospital" OR "Serra do Açor" OR "Rio Alva" OR "Rio Mondego" when:7d',
    ),
  },
  // Regio Coimbra. Eigen feeds van regionale kranten (onzeker; mislukte feeds worden overgeslagen).
  { name: "Diário As Beiras", url: "https://www.asbeiras.pt/feed/", region: "regio", hours: 48 },
  { name: "Notícias de Coimbra", url: "https://www.noticiasdecoimbra.pt/feed/", region: "regio", hours: 48 },
  { name: "Campeão das Províncias", url: "https://www.campeaoprovincias.pt/feed/", region: "regio", hours: 48 },
  { name: "Correio da Beira Serra", url: "https://www.correiodabeiraserra.com/feed/", region: "lokaal", hours: 24 * 7 },
  {
    name: "Google Nieuws Coimbra",
    region: "regio",
    hours: 48,
    url: googleNews('"distrito de Coimbra" OR "Região de Coimbra" OR "CIM Região de Coimbra" OR Coimbra when:2d'),
  },
];

export type FeedItem = {
  feed: string;
  region: Region | null;
  title: string;
  description: string;
  url: string;
  published: Date | null;
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
});

const asArray = <T>(v: T | T[] | undefined): T[] => (v == null ? [] : Array.isArray(v) ? v : [v]);

function text(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (typeof v === "object" && "#text" in (v as Record<string, unknown>))
    return String((v as Record<string, unknown>)["#text"]);
  return "";
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function cleanText(html: string, max = 500): string {
  const s = html
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#\d+|#x[0-9a-f]+|\w+);/gi, (m, e: string) => {
      if (e[0] === "#") {
        const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : m;
      }
      return ENTITIES[e.toLowerCase()] ?? m;
    })
    .replace(/\s+/g, " ")
    .trim();
  return s.length > max ? s.slice(0, max).replace(/\s\S*$/, "") + "…" : s;
}

function parseDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Ondersteunt RSS 2.0 en Atom. */
export function parseFeed(xml: string, feed: Feed): FeedItem[] {
  const doc = parser.parse(xml);
  const rssItems = asArray(doc?.rss?.channel?.item);
  const atomEntries = asArray(doc?.feed?.entry);

  const items: FeedItem[] = [];
  for (const it of rssItems) {
    items.push({
      feed: feed.name,
      region: feed.region ?? null,
      title: cleanText(text(it.title), 300),
      description: cleanText(text(it.description) || text(it["content:encoded"])),
      url: text(it.link).trim(),
      published: parseDate(text(it.pubDate) || text(it["dc:date"])),
    });
  }
  for (const e of atomEntries) {
    const links = asArray(e.link) as Record<string, string>[];
    const link = links.find((l) => !l["@_rel"] || l["@_rel"] === "alternate") ?? links[0];
    items.push({
      feed: feed.name,
      region: feed.region ?? null,
      title: cleanText(text(e.title), 300),
      description: cleanText(text(e.summary) || text(e.content)),
      url: link?.["@_href"] ?? "",
      published: parseDate(text(e.published) || text(e.updated)),
    });
  }
  return items.filter((i) => i.title && i.url);
}

export async function fetchFeed(feed: Feed, timeoutMs = 15_000): Promise<FeedItem[]> {
  const res = await fetch(feed.url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; nieuws-samenvatter/1.0)",
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseFeed(await res.text(), feed);
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+-\s+[^-]+$/, "") // Google News: " - Bron" achter de titel
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Haalt alle feeds op, filtert op recentheid, ontdubbelt op titel. */
export async function collectItems(opts: { hours: number; perFeed: number }) {
  const results = await Promise.allSettled(FEEDS.map((f) => fetchFeed(f)));

  const report: { feed: string; ok: boolean; count: number; error?: string }[] = [];
  const seen = new Set<string>();
  const items: FeedItem[] = [];

  results.forEach((r, idx) => {
    const feed = FEEDS[idx];
    if (r.status === "rejected") {
      report.push({ feed: feed.name, ok: false, count: 0, error: String(r.reason?.message ?? r.reason) });
      return;
    }
    const fresh = r.value
      .filter((i) => {
        const cutoff = Date.now() - (feed.hours ?? opts.hours) * 3600_000;
        // Zonder datum: alleen meenemen bij landelijke feeds (lokale zoekfeeds bevatten anders oud nieuws).
        return i.published ? i.published.getTime() >= cutoff : !feed.region;
      })
      .sort((a, b) => (b.published?.getTime() ?? 0) - (a.published?.getTime() ?? 0))
      .slice(0, feed.region === "lokaal" ? opts.perFeed * 2 : opts.perFeed);
    let count = 0;
    for (const i of fresh) {
      const key = normalize(i.title);
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(i);
      count++;
    }
    report.push({ feed: feed.name, ok: true, count });
  });

  return { items, report };
}
