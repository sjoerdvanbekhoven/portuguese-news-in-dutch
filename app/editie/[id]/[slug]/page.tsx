import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEdition, listEditionIds, readingMinutes, shortDate } from "@/lib/editions";
import { MarkRead } from "@/components/read-state";
import { SwipeNav } from "@/components/swipe-nav";
import { GaloMark } from "@/components/galo";

type Params = { params: Promise<{ id: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return listEditionIds().flatMap((id) => getEdition(id)?.articles.map((a) => ({ id, slug: a.slug })) ?? []);
}

async function load(params: Params["params"]) {
  const { id, slug } = await params;
  const edition = getEdition(id);
  const index = edition?.articles.findIndex((a) => a.slug === slug) ?? -1;
  if (!edition || index < 0) notFound();
  return { edition, index, article: edition.articles[index] };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { article } = await load(params);
  return { title: article.title, description: article.lead };
}

export default async function ArticlePage({ params }: Params) {
  const { edition, index, article: a } = await load(params);
  const n = edition.articles.length;
  const base = `/editie/${edition.id}`;
  const prev = index > 0 ? `${base}/${edition.articles[index - 1].slug}` : null;
  const next = index < n - 1 ? `${base}/${edition.articles[index + 1].slug}` : null;
  const overview = edition.id === listEditionIds()[0] ? "/" : base;

  return (
    <div className="reader-page">
      <MarkRead editionId={edition.id} slug={a.slug} />
      <SwipeNav prev={prev} next={next} />

      <header className="reader-top">
        <nav className="stories" aria-label="Artikelen">
          {edition.articles.map((x, i) => (
            <Link
              key={x.slug}
              href={`${base}/${x.slug}`}
              className={i < index ? "seen" : i === index ? "current" : ""}
              aria-label={`Artikel ${i + 1}: ${x.title}`}
              aria-current={i === index ? "page" : undefined}
              replace
            />
          ))}
        </nav>
        <div className="reader-top-row">
          <Link href={overview} className="back" aria-label="Terug naar overzicht">
            <GaloMark size={18} /> O Galo · {shortDate(edition.generatedAt)}
          </Link>
          <span className="reader-count">
            {index + 1} / {n}
          </span>
        </div>
      </header>

      <article className="reader" key={a.slug}>
        <p className="kicker">{a.category}</p>
        <h1>{a.title}</h1>
        <p className="reader-meta">{readingMinutes(a)} min lezen</p>
        <p className="lead">{a.lead}</p>
        {a.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {a.context && (
          <aside className="context">
            <strong>Achtergrond</strong>
            {a.context}
          </aside>
        )}
        {a.sources.length > 0 && (
          <details className="sources">
            <summary>Bronnen ({a.sources.length})</summary>
            <ul>
              {a.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.title}
                  </a>
                  <span>{s.name}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
        <p className="swipe-hint">— swipe voor het volgende artikel —</p>
      </article>

      <nav className="dock" aria-label="Navigatie">
        {prev ? (
          <Link href={prev} className="dock-btn" replace>
            ‹ Vorige
          </Link>
        ) : (
          <Link href={overview} className="dock-btn">
            ‹ Overzicht
          </Link>
        )}
        {next ? (
          <Link href={next} className="dock-btn primary" replace>
            Volgende ›
          </Link>
        ) : (
          <Link href={`${overview}#woordjes`} className="dock-btn primary">
            Woordjes ›
          </Link>
        )}
      </nav>
    </div>
  );
}
