import { z } from "zod";

export const CATEGORIES = [
  "Politiek",
  "Economie",
  "Samenleving",
  "Klimaat & Natuur",
  "Landbouw",
  "Regio",
  "Cultuur",
  "Sport",
  "Internationaal",
] as const;

/** Wat Claude teruggeeft (structured output). Bronnen verwijzen naar item-id's, niet naar URL's,
 *  zodat het model geen links kan verzinnen: wij mappen id → URL zelf. */
export const GeneratedEditionSchema = z.object({
  intro: z
    .string()
    .describe("2-3 zinnen in het Nederlands: de rode draad van het nieuws van dit moment."),
  articles: z.array(
    z.object({
      title: z.string().describe("Nederlandse kop, informatief, geen clickbait."),
      category: z.enum(CATEGORIES),
      lead: z.string().describe("Eén of twee zinnen samenvatting."),
      body: z.array(z.string()).describe("3-5 alinea's lopende tekst."),
      context: z
        .string()
        .describe(
          "Korte achtergrond voor een Nederlander die in het Portugese binnenland woont: wie/wat is dit, waarom doet het ertoe. Lege string als niet nuttig.",
        ),
      source_ids: z.array(z.string()).describe("Id's van de gebruikte bronitems, bijv. ['i3','i17']."),
    }),
  ),
  vocabulary: z
    .array(
      z.object({
        pt: z.string().describe("Woord of uitdrukking in Europees Portugees, zoals in het nieuws gebruikt."),
        nl: z.string().describe("Nederlandse vertaling."),
        example: z.string().describe("Korte voorbeeldzin in het Portugees uit de context van het nieuws."),
      }),
    )
    .describe("4-6 nuttige woorden of uitdrukkingen uit het nieuws van vandaag."),
});

export type GeneratedEdition = z.infer<typeof GeneratedEditionSchema>;

export type Source = { name: string; url: string; title: string };

export type Article = Omit<GeneratedEdition["articles"][number], "source_ids"> & {
  slug: string;
  sources: Source[];
};

/** Wat er op schijf staat in content/editions/<id>.json */
export type Edition = {
  id: string; // bijv. 2026-11-14-0617
  generatedAt: string; // ISO
  model: string;
  itemCount: number;
  intro: string;
  articles: Article[];
  vocabulary: GeneratedEdition["vocabulary"];
};
