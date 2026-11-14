import type { Edition } from "@/lib/schema";
import { formatEditionDate } from "@/lib/editions";

export function EditionView({ edition }: { edition: Edition }) {
  return (
    <>
      <section className="edition-head">
        <p className="dateline">{formatEditionDate(edition.generatedAt)}</p>
        <p className="intro">{edition.intro}</p>
        <ol className="toc">
          {edition.articles.map((a) => (
            <li key={a.slug}>
              <a href={`#${a.slug}`}>{a.title}</a>
            </li>
          ))}
        </ol>
      </section>

      {edition.articles.map((a) => (
        <article key={a.slug} id={a.slug} className="article">
          <p className="category">{a.category}</p>
          <h2>{a.title}</h2>
          <p className="lead">{a.lead}</p>
          {a.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {a.context && (
            <aside className="context">
              <strong>Achtergrond</strong> {a.context}
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
                    </a>{" "}
                    <span className="muted">· {s.name}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </article>
      ))}

      {edition.vocabulary.length > 0 && (
        <section className="vocab">
          <h2>Portugees uit het nieuws</h2>
          <dl>
            {edition.vocabulary.map((v) => (
              <div key={v.pt}>
                <dt lang="pt-PT">{v.pt}</dt>
                <dd>
                  {v.nl}
                  <span className="example" lang="pt-PT">
                    {v.example}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <p className="meta muted">
        Gebaseerd op {edition.itemCount} nieuwsitems · {edition.model}
      </p>
    </>
  );
}
