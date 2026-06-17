import Link from "next/link";

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/search" method="get" className="relative w-full max-w-md">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search threads, users, products..."
        className="w-full rounded-lg border border-white/10 bg-slate-900 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-purple-neon focus:outline-none focus:ring-1 focus:ring-brand-purple-neon"
      />
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
        ⌕
      </span>
      <Link
        href="/search"
        className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded px-2 py-0.5 text-[10px] font-medium text-slate-500 hover:text-white sm:block"
      >
        filters
      </Link>
    </form>
  );
}
