import Link from "next/link";
import { editionLabel, formatEditionDate, getEdition, listEditionIds } from "@/lib/editions";
import { Colophon } from "@/components/edition-overview";
import { Masthead } from "@/components/masthead";

export const metadata = { title: "Archief" };

export default function Archive() {
  const editions = listEditionIds()
    .map((id) => getEdition(id))
    .filter((e) => e !== null);

  return (
    <div className="page">
      <Masthead line={<span>Archief · {editions.length} edities</span>} />
      {editions.length === 0 && <p className="intro">Nog geen edities.</p>}
      <ul className="index archive">
        {editions.map((e) => (
          <li key={e.id}>
            <Link href={`/editie/${e.id}`} className="entry">
              <span className="entry-body">
                <span className="kicker">{editionLabel(e.generatedAt)}</span>
                <span className="entry-title">{formatEditionDate(e.generatedAt, false)}</span>
                <span className="entry-lead">{e.articles.slice(0, 3).map((a) => a.title).join(" · ")}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Colophon />
    </div>
  );
}
