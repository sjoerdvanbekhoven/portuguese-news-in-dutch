import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatEditionDate, getEdition, listEditionIds } from "@/lib/editions";
import { EditionOverview } from "@/components/edition-overview";

type Params = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return listEditionIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const edition = getEdition((await params).id);
  return { title: edition ? formatEditionDate(edition.generatedAt) : "Editie" };
}

export default async function EditionPage({ params }: Params) {
  const { id } = await params;
  const edition = getEdition(id);
  if (!edition) notFound();
  return <EditionOverview edition={edition} isLatest={id === listEditionIds()[0]} />;
}
