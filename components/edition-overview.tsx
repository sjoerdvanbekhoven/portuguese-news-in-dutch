import Link from "next/link";
import type { Edition } from "@/lib/schema";
import { editionLabel, formatEditionDate, readingMinutes } from "@/lib/editions";
import { ContinueButton, ReadCheck } from "./read-state";
import { Masthead } from "./masthead";

export function EditionOverview({ edition, isLatest }: { edition: Edition; isLatest: boolean }) {
  const total = edition.articles.reduce((n, a) => n + readingMinutes(a), 0);
  const href = (slug: string) => `/editie/${edition.id}/${slug}`;

  return (
    <div className="page">
      <Masthead
        line={
          <>
            <span>{formatEditionDate(edition.generatedAt, false)}</span>
            <span>
              {isLatest ? editionLabel(edition.generatedAt) : "Uit het archief"} · {total} min
            </span>
          </>
        }
      />

      <p className="intro">{edition.intro}</p>
      <ContinueButton editionId={edition.id} slugs={edition.articles.map((a) => a.slug)} />

      <ol className="index">
        {edition.articles.map((a, i) => (
          <li key={a.slug}>
            <Link href={href(a.slug)} className="entry">
              <span className="entry-num">{i + 1}</span>
              <span className="entry-body">
                <span className="kicker">
                  {a.category} · {readingMinutes(a)} min
                  <ReadCheck editionId={edition.id} slug={a.slug} />
                </span>
                <span className="entry-title">{a.title}</span>
                <span className="entry-lead">{a.lead}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {edition.vocabulary.length > 0 && (
        <section className="vocab" id="woordjes">
          <h2>
            Palavras do dia <small>woordjes van vandaag · tik om te draaien</small>
          </h2>
          <div className="vocab-grid">
            {edition.vocabulary.map((v) => (
              <details key={v.pt} className="tile">
                <summary lang="pt-PT">{v.pt}</summary>
                <div className="tile-back">
                  <strong>{v.nl}</strong>
                  <em lang="pt-PT">{v.example}</em>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      <Colophon itemCount={edition.itemCount} />
    </div>
  );
}

export function Colophon({ itemCount }: { itemCount?: number }) {
  return (
    <footer className="colophon">
      <div className="tiles" aria-hidden />
      <p>
        Samengesteld {itemCount ? `uit ${itemCount} berichten ` : ""}van Portugese kranten en omroepen,
        automatisch vertaald en samengevat. Bij twijfel: lees de oorspronkelijke bron.
      </p>
      <p className="colophon-place">Meda de Mouros · Tábua</p>
    </footer>
  );
}
