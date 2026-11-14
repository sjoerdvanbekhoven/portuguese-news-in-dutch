import { getLatestEdition } from "@/lib/editions";
import { EditionOverview, SiteHeader } from "@/components/edition-overview";

export default function Home() {
  const edition = getLatestEdition();
  if (!edition) {
    return (
      <div className="page">
        <SiteHeader />
        <section className="hero">
          <h1 className="hero-date">Nog geen editie</h1>
          <p className="hero-intro">
            Draai de workflow <code>Nieuws genereren</code> in GitHub Actions om de eerste editie te maken.
          </p>
        </section>
      </div>
    );
  }
  return <EditionOverview edition={edition} isLatest />;
}
