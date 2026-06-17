import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton, WriteReviewButton } from "@/components/AddToCartButton";
import { getProduct, fetchProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex-1">
      <div className="border-b border-white/10 glass-panel">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <Link
            href="/store"
            className="mb-4 inline-block text-sm font-medium text-brand-blue hover:text-white"
          >
            ← Back to store
          </Link>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-purple-900/20">
              <span className="text-6xl opacity-30">📦</span>
            </div>
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-medium capitalize text-blue-400">
                  {product.category}
                </span>
                {product.sponsored && (
                  <span className="rounded bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-400">
                    Sponsored
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {product.name}
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                ★ {product.rating} · {product.reviewCount} reviews
              </p>
              <p className="mt-4 text-3xl font-bold text-brand-blue">
                ${product.price.toFixed(2)}
              </p>
              <p className="mt-4 leading-relaxed text-slate-300">
                {product.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <AddToCartButton productName={product.name} />
                <WriteReviewButton />
              </div>
              {product.affiliate && (
                <p className="mt-4 text-xs text-brand-purple-soft">
                  Affiliate link — TypeForum earns commission on purchases.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Reviews</h2>
          <WriteReviewButton />
        </div>
        <div className="rounded-xl border border-dashed border-white/10 glass-panel px-6 py-10 text-center text-sm text-slate-400">
          No reviews yet. Be the first to share your experience.
        </div>
      </div>
    </div>
  );
}
