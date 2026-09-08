import { redirect } from "next/navigation";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function LegacyArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  redirect(`/${slug}`);
}
