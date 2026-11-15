import { getLatestEdition } from "@/lib/editions";
import { EditionOverview } from "@/components/edition-overview";
import { Masthead } from "@/components/masthead";

export default function Home() {
  const edition = getLatestEdition();
  if (!edition) {
    return (
      <div className="page">
        <Masthead />
        <p className="intro">
          Nog geen editie. Draai de workflow <code>Nieuws genereren</code> in GitHub Actions om de eerste
          te maken.
        </p>
      </div>
    );
  }
  return <EditionOverview edition={edition} isLatest />;
}
