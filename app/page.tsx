import { getLatestEdition } from "@/lib/editions";
import { EditionView } from "./EditionView";

export default function Home() {
  const edition = getLatestEdition();
  if (!edition) {
    return (
      <section className="empty">
        <h1>Nog geen editie</h1>
        <p>
          Draai de workflow <code>Nieuws genereren</code> in GitHub Actions (of lokaal{" "}
          <code>npm run generate</code>) om de eerste editie te maken.
        </p>
      </section>
    );
  }
  return <EditionView edition={edition} />;
}
