type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="border-b border-border-subtle bg-bg-surface">
      <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-14">
        {eyebrow && (
          <p className="section-label mb-2">{eyebrow}</p>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-text-muted">
            {description}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
