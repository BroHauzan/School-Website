import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/school";
import { getHalamanBySlug } from "@/lib/halaman-server";
import { HalamanBuilderPage } from "@/components/public/HalamanBuilderPage";

export const revalidate = 300;

type HalamanParams = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<HalamanParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getHalamanBySlug(slug);
  if (!doc || doc.published === false) return {};
  const title = doc.metaTitle || doc.judul;
  const description = doc.metaDescription || doc.heroDescription || undefined;
  const base = SITE_URL.replace(/\/$/, "");
  return {
    title,
    description,
    alternates: { canonical: `${base}/halaman/${doc.slug}` },
  };
}

export default async function HalamanPublikPage({
  params,
}: {
  params: Promise<HalamanParams>;
}) {
  const { slug } = await params;
  if (!slug) notFound();
  return <HalamanBuilderPage slug={slug} />;
}
