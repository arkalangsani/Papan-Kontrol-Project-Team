import Board from "@/components/Board";

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Board projectSlug={slug} />;
}
