# Portugal in het kort

Het Portugese nieuws, twee keer per dag samengevat in het Nederlands.

## Hoe het werkt

```
GitHub Actions (cron 2×/dag)
  └─ scripts/generate.ts
       ├─ haalt RSS-feeds op (lib/feeds.ts): landelijk + regio Guarda/Beira Interior
       ├─ filtert op de laatste 24 uur en ontdubbelt
       ├─ Claude kiest 6–8 verhalen en schrijft Nederlandse artikelen (structured output)
       └─ schrijft content/editions/<datum-tijd>.json en commit die
Vercel ziet de push → bouwt de statische Next.js-site opnieuw
```

Er is geen database en geen serverless-functie: elke editie is een JSON-bestand in git, dus het archief
zit gratis in de repo. Claude ziet alleen koppen en inleidingen uit de feeds, verwijst per artikel naar de
oorspronkelijke bronnen en mag geen feiten toevoegen. Bronlinks komen uit de feed zelf, niet van het model.

## Eenmalige setup

1. **API-sleutel**: GitHub → Settings → Secrets and variables → Actions → *New repository secret*
   `ANTHROPIC_API_KEY`.
2. **Vercel**: *Add New Project* → importeer deze repo. Framework preset Next.js, verder niets instellen.
   Vercel heeft de API-sleutel niet nodig.
3. **Eerste editie**: Actions → *Nieuws genereren* → *Run workflow*.

Optioneel via *Actions variables*: `NEWS_MODEL` (standaard `claude-opus-5-5`) en `NEWS_EFFORT`
(`low`/`medium`/`high`, standaard `medium`).

## Lokaal

```bash
npm install
npm run check-feeds        # welke feeds werken er?
ANTHROPIC_API_KEY=... npm run generate
npm run dev
```

## Aanpassen

- Bronnen: `FEEDS` in `lib/feeds.ts`
- Redactionele keuzes en toon: `SYSTEM` in `scripts/generate.ts`
- Tijdstippen: `cron` in `.github/workflows/generate.yml`
- Bewaartermijn archief: `NEWS_KEEP_DAYS` (standaard 180 dagen)
