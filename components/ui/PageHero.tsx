type Breadcrumb = { href: string; label: string };
import Link from "next/link";

interface PageHeroProps {
  breadcrumbs: Breadcrumb[];
  title: string | React.ReactNode;
  description?: string;
}

export function PageHero({ breadcrumbs, title, description }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-navy text-cream">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-school.webp"
          alt=""
          className="h-full w-full object-cover opacity-[0.15]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/90 via-navy/85 to-navy" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-32 lg:pb-28 lg:pt-40">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-xs text-cream/50">
            {breadcrumbs.map((crumb, i) => (
              <li key={crumb.href} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">/</span>}
                <Link
                  href={crumb.href}
                  className="transition-colors hover:text-cream/80"
                >
                  {crumb.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <h1 className="font-display text-4xl leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description && (
          <p 
            className="mt-5 max-w-2xl text-base leading-relaxed text-cream/70 sm:text-lg"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}
          >
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
