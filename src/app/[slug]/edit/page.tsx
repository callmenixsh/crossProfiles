import { notFound, redirect } from "next/navigation";
import { findProfileBySlug } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditPage(props: PageProps<"/[slug]/edit">) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;

  const profile = findProfileBySlug(slug);
  if (!profile) notFound();

  const token = typeof searchParams.token === "string" ? searchParams.token : "";
  redirect(token ? `/${slug}/profiles?token=${encodeURIComponent(token)}` : `/${slug}/profiles`);
}