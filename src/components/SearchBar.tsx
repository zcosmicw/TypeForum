export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/search" method="get" className="relative w-full max-w-sm">
      <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-ghost" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search threads, users..."
        className="w-full rounded-lg border border-border-default bg-bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-ghost focus:border-accent focus:outline-none transition-colors"
      />
    </form>
  );
}
