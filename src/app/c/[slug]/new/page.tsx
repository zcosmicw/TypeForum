import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/actions/auth";
import { NewThreadForm } from "@/components/NewThreadForm";
import { fetchCategory } from "@/lib/forum/queries";

export const dynamic = "force-dynamic";

export default async function NewThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sub?: string }>;
}) {
  const { slug } = await params;
  const { sub } = await searchParams;
  const category = await fetchCategory(slug);
  const user = await getSessionUser();

  if (!category) {
    notFound();
  }

  return (
    <div className="flex-1">
      <div className="border-b border-white/10 surface-panel">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <Link
            href={`/c/${slug}${sub ? `?sub=${sub}` : ""}`}
            className="mb-4 inline-block text-sm font-medium text-brand-teal hover:text-white"
          >
            ← Back to {category.name}
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <NewThreadForm
          category={category}
          subforumSlug={sub}
          isLoggedIn={!!user}
        />
      </div>
    </div>
  );
}
