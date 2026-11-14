import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatEditionDate, getEdition, listEditionIds } from "@/lib/editions";
import { EditionView } from "../../EditionView";

export const dynamicParams = false;

export function generateStaticParams() {
  return listEditionIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const edition = getEdition((await params).id);
  return { title: edition ? `Editie ${formatEditionDate(edition.generatedAt)}` : "Editie" };
}

export default async function EditionPage({ params }: { params: Promise<{ id: string }> }) {
  const edition = getEdition((await params).id);
  if (!edition) notFound();
  return <EditionView edition={edition} />;
}
