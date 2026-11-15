/**
 * Haalt Portugese nieuwsfeeds op en laat Claude er een Nederlandstalige editie van maken.
 * Resultaat: content/editions/<id>.json. Bedoeld om vanuit GitHub Actions te draaien.
 *
 *   ANTHROPIC_API_KEY=... npm run generate
 */
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import fs from "node:fs/promises";
import path from "node:path";
import { getLatestEdition } from "../lib/editions";
import { collectItems, type FeedItem } from "../lib/feeds";
import { GeneratedEditionSchema, type Article, type Edition } from "../lib/schema";

const MODEL = process.env.NEWS_MODEL || "claude-opus-5-5";
const EFFORT = (process.env.NEWS_EFFORT || "medium") as "low" | "medium" | "high" | "xhigh" | "max";
const HOURS = Number(process.env.NEWS_HOURS || 24);
const KEEP_DAYS = Number(process.env.NEWS_KEEP_DAYS || 180);
const PER_FEED = 25;
const MIN_ITEMS = 15;
/** Sla over als er al een editie is die jonger is dan dit (voorkomt dubbele runs bij twee triggers). */
const SKIP_IF_RECENT_HOURS = Number(process.env.NEWS_SKIP_IF_RECENT_HOURS || 3);
const FORCE = process.env.NEWS_FORCE === "true";

const EDITIONS_DIR = path.join(process.cwd(), "content", "editions");

const SYSTEM = `Je bent eindredacteur van een kleine Nederlandstalige nieuwsbrief over Portugal.
De lezer is een Nederlander die in Meda de Mouros woont (freguesia in de gemeente Tábua, district
Coimbra, tussen Arganil/Coja en Oliveira do Hospital, aan de rand van de Serra do Açor) en daar een
permacultuur-quinta opbouwt, leest Portugees nog niet vlot en wil snel en betrouwbaar weten
wat er speelt.

Je krijgt een lijst recente nieuwsitems (kop + korte inleiding) uit Portugese bronnen, elk met een id.

Opdracht:
- Kies de 6 tot 8 belangrijkste verhalen. Voeg items die over hetzelfde verhaal gaan samen tot één artikel.
- Weeg mee wat voor deze lezer relevant is: landelijke politiek en economie, wetgeving en belastingen
  die bewoners raken, het binnenland, landbouw, water, bosbranden, klimaat en natuur.
  Sport alleen als het écht groot nieuws is.
- Items zijn gemarkeerd als (lokaal) = Tábua, Arganil, Coja, Oliveira do Hospital en omgeving, of
  (regio) = Coimbra en omgeving. Lokaal nieuws gaat voor regionaal nieuws. Neem 1 à 3 artikelen met
  categorie "Regio" op als er betekenisvolle items zijn; benoem in de tekst om welke plaats het gaat
  en hoe ver dat ongeveer van Meda de Mouros ligt als dat relevant is. Laat irrelevante items vallen
  (bijv. een zoektreffer die over iets anders gaat, of puur Coimbra-stadsnieuws zonder belang voor de
  omgeving). Geen regionaal artikel is beter dan een opgevuld artikel.
- Lokale items kunnen tot een week oud zijn. Herhaal geen verhaal dat al in de vorige editie stond
  (zie de lijst), tenzij er een duidelijke nieuwe ontwikkeling is; zeg dat dan.
- Schrijf in helder, neutraal Nederlands. Geen sensatie, geen eigen mening.
- Gebruik uitsluitend feiten die in de aangeleverde items staan. Verzin geen cijfers, citaten of
  details. Als de bron weinig zegt, schrijf dan een korter artikel; vul niet aan met speculatie.
  Algemene, vaststaande achtergrondkennis (wat een instelling is, wie een bekende politicus is) mag
  wel, in het veld "context".
- Leg Portugese begrippen kort uit (bijv. IMI, Câmara Municipal, AIMA, Chega) en laat de Portugese
  term tussen haakjes staan waar dat helpt.
- source_ids: alleen id's uit de lijst, die je echt gebruikt hebt.
- vocabulary: 4-6 woorden of uitdrukkingen in Europees Portugees (niet Braziliaans) die in het nieuws
  van vandaag voorkomen en nuttig zijn in het dagelijks leven.
- Begin met de belangrijkste verhalen.`;

function formatItems(items: FeedItem[]): string {
  return items
    .map((it, i) => {
      const date = it.published ? it.published.toISOString().slice(0, 16).replace("T", " ") : "onbekend";
      const desc = it.description && it.description !== it.title ? `\n${it.description}` : "";
      return `[i${i}] ${it.feed}${it.region ? ` (${it.region})` : ""} · ${date} UTC\n${it.title}${desc}`;
    })
    .join("\n\n");
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

function editionId(d: Date): string {
  // Tijd in Lissabon-tijd, zodat de id overeenkomt met wat de lezer verwacht.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}-${p.hour}${p.minute}`;
}

async function pruneOld() {
  const cutoff = Date.now() - KEEP_DAYS * 86400_000;
  for (const f of await fs.readdir(EDITIONS_DIR)) {
    const m = f.match(/^(\d{4})-(\d{2})-(\d{2})-\d{4}\.json$/);
    if (m && Date.UTC(+m[1], +m[2] - 1, +m[3]) < cutoff) {
      await fs.unlink(path.join(EDITIONS_DIR, f));
      console.log(`Verwijderd (ouder dan ${KEEP_DAYS} dagen): ${f}`);
    }
  }
}

async function main() {
  const latest = getLatestEdition();
  if (latest && !FORCE) {
    const ageHours = (Date.now() - new Date(latest.generatedAt).getTime()) / 3600_000;
    if (ageHours < SKIP_IF_RECENT_HOURS) {
      console.log(
        `Overgeslagen: editie ${latest.id} is ${ageHours.toFixed(1)} uur oud ` +
          `(< ${SKIP_IF_RECENT_HOURS} uur). Gebruik force om toch te genereren.`,
      );
      return;
    }
  }

  const { items, report } = await collectItems({ hours: HOURS, perFeed: PER_FEED });
  console.table(report);
  if (items.length < MIN_ITEMS) {
    throw new Error(`Te weinig nieuwsitems (${items.length}); editie niet gegenereerd.`);
  }
  console.log(`${items.length} items naar ${MODEL} (effort ${EFFORT})…`);

  const previous = latest;
  const previousBlock = previous
    ? `Vorige editie (${previous.generatedAt}):\n${previous.articles.map((a) => `- [${a.category}] ${a.title}`).join("\n")}\n\n`
    : "";

  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    // Bij een (onterechte) weigering door een veiligheidsfilter valt de API automatisch terug op een ander model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: EFFORT, format: betaZodOutputFormat(GeneratedEditionSchema) },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `${previousBlock}Nieuwsitems (${items.length}), opgehaald ${new Date().toISOString()}:\n\n${formatItems(items)}`,
      },
    ],
  });
  const msg = await stream.finalMessage();

  if (msg.stop_reason === "refusal") throw new Error(`Geweigerd: ${JSON.stringify(msg.stop_details)}`);
  if (msg.stop_reason === "max_tokens") throw new Error("Output afgekapt (max_tokens).");
  const out = msg.parsed_output;
  if (!out) throw new Error("Geen geldige structured output ontvangen.");

  const usedSlugs = new Set<string>();
  const articles: Article[] = out.articles.map(({ source_ids, ...a }) => {
    let slug = slugify(a.title) || "artikel";
    while (usedSlugs.has(slug)) slug += "-2";
    usedSlugs.add(slug);
    const sources = [...new Set(source_ids)]
      .map((id) => items[Number(id.replace(/^i/, ""))])
      .filter((x): x is FeedItem => !!x)
      .map((x) => ({ name: x.feed, url: x.url, title: x.title }));
    return { ...a, slug, sources };
  });

  const now = new Date();
  const edition: Edition = {
    id: editionId(now),
    generatedAt: now.toISOString(),
    model: msg.model,
    itemCount: items.length,
    intro: out.intro,
    articles,
    vocabulary: out.vocabulary,
  };

  await fs.mkdir(EDITIONS_DIR, { recursive: true });
  const file = path.join(EDITIONS_DIR, `${edition.id}.json`);
  await fs.writeFile(file, JSON.stringify(edition, null, 2) + "\n");
  await pruneOld();

  const u = msg.usage;
  console.log(
    `Geschreven: ${path.relative(process.cwd(), file)} — ${articles.length} artikelen. ` +
      `Tokens: in ${u.input_tokens}, out ${u.output_tokens}.`,
  );
}

main().catch((err) => {
  if (err instanceof Anthropic.APIError) console.error(`API-fout ${err.status}: ${err.message}`);
  else console.error(err);
  process.exit(1);
});
