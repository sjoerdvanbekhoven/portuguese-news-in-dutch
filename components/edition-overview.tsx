import Link from "next/link";
import type { Edition } from "@/lib/schema";
import { categoryColor } from "@/lib/categories";
import { editionLabel, formatEditionDate, readingMinutes } from "@/lib/editions";
import { ContinueButton, ReadCheck } from "./read-state";

export function SiteHeader({ archive = false }: { archive?: boolean }) {
  return (
    <header className="topbar">
      <Link href="/" className="brand">
        Portugal <em>in het kort</em>
      </Link>
      <Link href="/archief" className={`topbar-link${archive ? " active" : ""}`}>
        Archief
      </Link>
    </header>
  );
}

export function EditionOverview({ edition, isLatest }: { edition: Edition; isLatest: boolean }) {
  const total = edition.articles.reduce((n, a) => n + readingMinutes(a), 0);
  const href = (slug: string) => `/editie/${edition.id}/${slug}`;

  return (
    <div className="page">
      <SiteHeader />

      <section className="hero">
        <p className="eyebrow">
          {isLatest ? editionLabel(edition.generatedAt) : "Archief"} · {total} min lezen
        </p>
        <h1 className="hero-date">{formatEditionDate(edition.generatedAt, false)}</h1>
        <p className="hero-intro">{edition.intro}</p>
        <ContinueButton editionId={edition.id} slugs={edition.articles.map((a) => a.slug)} />
      </section>

      <ol className="cards">
        {edition.articles.map((a, i) => (
          <li key={a.slug} style={{ "--cat": categoryColor(a.category) } as React.CSSProperties}>
            <Link href={href(a.slug)} className="card">
              <div className="card-meta">
                <span className="pill">{a.category}</span>
                <span className="card-num">
                  {i + 1}/{edition.articles.length} · {readingMinutes(a)} min
                </span>
                <ReadCheck editionId={edition.id} slug={a.slug} />
              </div>
              <h2 className="card-title">{a.title}</h2>
              <p className="card-lead">{a.lead}</p>
            </Link>
          </li>
        ))}
      </ol>

      {edition.vocabulary.length > 0 && (
        <section className="vocab" id="woordjes">
          <h2>Woordjes van vandaag</h2>
          <p className="vocab-hint">Tik om de vertaling te zien.</p>
          <div className="vocab-grid">
            {edition.vocabulary.map((v) => (
              <details key={v.pt} className="flash">
                <summary lang="pt-PT">{v.pt}</summary>
                <div className="flash-back">
                  <strong>{v.nl}</strong>
                  <span lang="pt-PT">{v.example}</span>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      <footer className="footer">
        Samengevat uit {edition.itemCount} berichten van Portugese nieuwsbronnen met Claude. Controleer
        belangrijke zaken altijd via de oorspronkelijke bron.
      </footer>
    </div>
  );
}
