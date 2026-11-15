# O Galo

Het Portugese nieuws, twee keer per dag samengevat in het Nederlands.

## Hoe het werkt

```
GitHub Actions (cron 2×/dag)
  └─ scripts/generate.ts
       ├─ haalt RSS-feeds op (lib/feeds.ts): landelijk + regio Coimbra + lokaal (Tábua/Arganil)
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

- Bronnen: `FEEDS` in `lib/feeds.ts` (landelijk, `regio` = Coimbra, `lokaal` = Tábua/Arganil/Coja/Oliveira do Hospital)
- Redactionele keuzes en toon: `SYSTEM` in `scripts/generate.ts`
- Tijdstippen: `cron` in `.github/workflows/generate.yml`
- Bewaartermijn archief: `NEWS_KEEP_DAYS` (standaard 180 dagen)

## Op je iPhone

Open de site in Safari → deelknop → **Zet op beginscherm**. Dan opent hij als app, zonder adresbalk.
Swipe links/rechts tussen artikelen; welke je gelezen hebt wordt per apparaat onthouden.

## Planning: cron-job.org

GitHub start geplande workflows soms te laat of helemaal niet. Daarom start alleen een externe
dienst (cron-job.org) de workflow, op een vaste tijd; de workflow heeft zelf geen schema. Is er al
een editie van minder dan 3 uur oud, dan slaat het script de run over (geen dubbele kosten).

**1. Token aanmaken** — GitHub → Settings → Developer settings → Fine-grained tokens → *Generate new token*
- Repository access: *Only select repositories* → `portuguese-news-in-dutch`
- Permissions → Repository permissions → **Actions: Read and write** (verder niets)
- Vervaldatum: maximaal 1 jaar; zet een herinnering om hem te vernieuwen

**2. Cronjob aanmaken** — [cron-job.org](https://cron-job.org) → *Create cronjob*, twee keer (06:30 en 17:30):
- URL: `https://api.github.com/repos/sjoerdvanbekhoven/portuguese-news-in-dutch/actions/workflows/generate.yml/dispatches`
- Schedule: dagelijks 06:30, tijdzone **Europe/Lisbon** (schuift vanzelf mee met zomertijd)
- Advanced → Request method **POST**, request body `{"ref":"main"}`
- Headers:
  - `Authorization: Bearer <je token>`
  - `Accept: application/vnd.github+json`
  - `X-GitHub-Api-Version: 2022-11-28`
  - `Content-Type: application/json`
- Een geslaagde aanroep geeft **HTTP 204** (geen inhoud). Test met *Test run* en kijk onder Actions.

Handmatig opnieuw genereren terwijl er al een recente editie is: *Run workflow* → vink **force** aan.
