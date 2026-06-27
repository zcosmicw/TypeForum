type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="hero-bg border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        {eyebrow && (
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-teal">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-300">
            {description}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
