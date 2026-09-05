type Breadcrumb = { href: string; label: string };
import Link from "next/link";

interface PageHeroProps {
  breadcrumbs: Breadcrumb[];
  title: string | React.ReactNode;
  description?: string;
}

const OWL_WATERMARK = (
  <svg
    className="absolute -right-16 top-16 h-[40vmin] w-[40vmin] opacity-[0.03]"
    viewBox="0 0 200 200"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M100 38c-18 0-34 12-42 30-4 8-6 18-6 28 0 24 16 46 38 54 3 1 6 2 10 2s7-1 10-2c22-8 38-30 38-54 0-10-2-20-6-28-8-18-24-30-42-30z" />
    <circle cx="80" cy="88" r="14" />
    <circle cx="120" cy="88" r="14" />
    <circle cx="80" cy="88" r="5" fill="currentColor" stroke="none" />
    <circle cx="120" cy="88" r="5" fill="currentColor" stroke="none" />
    <path d="M100 102v16" />
    <path d="M92 122c5 4 11 4 16 0" />
    <path d="M62 72c-8-4-14-14-16-26" />
    <path d="M138 72c8-4 14-14 16-26" />
    <path d="M58 120c-10 8-16 22-16 38" />
    <path d="M142 120c10 8 16 22 16 38" />
  </svg>
);

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
        {OWL_WATERMARK}
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
