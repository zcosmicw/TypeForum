import { AdSlot } from "@/components/AdSlot";
import { PageHero } from "@/components/PageHero";
import { ProductCard } from "@/components/ProductCard";
import { getFeaturedProducts, fetchProducts } from "@/lib/data";

export default async function StorePage() {
  const [featured, products] = await Promise.all([
    getFeaturedProducts(),
    fetchProducts(),
  ]);

  return (
    <div className="flex-1">
      <PageHero
        eyebrow="TypeForum Store"
        title="Supplements, peptides & gear"
        description="Product listings with reviews, cart checkout, and affiliate commissions."
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <AdSlot variant="banner" label="Featured sponsor" />

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-white">
            Featured & sponsored
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-lg font-bold text-white">All products</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
