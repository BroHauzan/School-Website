import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

type SectionHeadingProps = {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  dark = false,
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-[0.28em]",
          align === "center" && "text-center",
          dark ? "text-cream/60" : "text-navy-muted"
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          "mt-5 font-display text-4xl leading-[1.08] tracking-[-0.02em] text-balance sm:text-5xl lg:text-6xl",
          dark ? "text-cream" : "text-ink"
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-6 text-base leading-relaxed sm:text-lg",
            dark ? "text-cream/75" : "text-muted"
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}