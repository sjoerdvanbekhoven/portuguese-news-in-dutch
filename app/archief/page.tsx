import Link from "next/link";
import { editionLabel, formatEditionDate, getEdition, listEditionIds } from "@/lib/editions";
import { SiteHeader } from "@/components/edition-overview";

export const metadata = { title: "Archief" };

export default function Archive() {
  const editions = listEditionIds()
    .map((id) => getEdition(id))
    .filter((e) => e !== null);

  return (
    <div className="page">
      <SiteHeader archive />
      <section className="hero">
        <h1 className="hero-date">Archief</h1>
      </section>
      {editions.length === 0 && <p className="muted">Nog geen edities.</p>}
      <ul className="archive">
        {editions.map((e) => (
          <li key={e.id}>
            <Link href={`/editie/${e.id}`}>
              <span className="eyebrow">{editionLabel(e.generatedAt)}</span>
              <strong>{formatEditionDate(e.generatedAt, false)}</strong>
              <span className="archive-titles">{e.articles.slice(0, 3).map((a) => a.title).join(" · ")}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
