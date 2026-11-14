import Link from "next/link";
import { formatEditionDate, getEdition, listEditionIds } from "@/lib/editions";

export const metadata = { title: "Archief · Portugal in het kort" };

export default function Archive() {
  const editions = listEditionIds()
    .map((id) => getEdition(id))
    .filter((e) => e !== null);

  return (
    <section className="archive">
      <h1>Archief</h1>
      {editions.length === 0 && <p className="muted">Nog geen edities.</p>}
      <ul>
        {editions.map((e) => (
          <li key={e.id}>
            <Link href={`/editie/${e.id}`}>{formatEditionDate(e.generatedAt)}</Link>
            <span className="muted">{e.articles.map((a) => a.title).slice(0, 3).join(" · ")}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
