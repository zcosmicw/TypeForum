import Link from "next/link";
import type { StoreProduct } from "@/lib/types";

export function ProductCard({ product }: { product: StoreProduct }) {
  return (
    <Link
      href={`/store/${product.slug}`}
      className="premium-card group flex flex-col overflow-hidden"
    >
      <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-purple-950/20 border-b border-white/5 relative transition-transform duration-300">
        <span className="text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">📦</span>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {product.featured && (
            <span className="rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-400">
              Featured
            </span>
          )}
          {product.sponsored && (
            <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
              Sponsored
            </span>
          )}
          {product.affiliate && (
            <span className="rounded bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-400">
              Affiliate
            </span>
          )}
        </div>
        <h3 className="font-bold text-white group-hover:text-purple-300 transition-colors text-base">
          {product.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-slate-400 leading-relaxed">
          {product.description}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
          <span className="text-lg font-bold text-blue-400">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            ★ {product.rating} ({product.reviewCount} reviews)
          </span>
        </div>
      </div>
    </Link>
  );
}
