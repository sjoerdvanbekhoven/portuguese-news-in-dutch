import { XMLParser } from "fast-xml-parser";

export type Feed = { name: string; url: string; regional?: boolean };

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
  {
    name: "Google Nieuws PT",
    url: "https://news.google.com/rss?hl=pt-PT&gl=PT&ceid=PT:pt-150",
  },
  // Regionaal: district Guarda / Beira Interior / Douro Superior
  { name: "O Interior", url: "https://www.ointerior.pt/feed/", regional: true },
  {
    name: "Google Nieuws regio",
    url:
      "https://news.google.com/rss/search?q=" +
      encodeURIComponent('Mêda OR "distrito da Guarda" OR "Beira Interior" OR "Foz Côa" OR Trancoso when:3d') +
      "&hl=pt-PT&gl=PT&ceid=PT:pt-150",
    regional: true,
  },
];

export type FeedItem = {
  feed: string;
  regional: boolean;
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
      regional: !!feed.regional,
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
      regional: !!feed.regional,
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
  const cutoff = Date.now() - opts.hours * 3600_000;
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
      .filter((i) => !i.published || i.published.getTime() >= cutoff)
      .sort((a, b) => (b.published?.getTime() ?? 0) - (a.published?.getTime() ?? 0))
      .slice(0, feed.regional ? opts.perFeed * 2 : opts.perFeed);
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
