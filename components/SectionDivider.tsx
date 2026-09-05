import { cn } from "@/lib/utils";

type SectionDividerProps = {
  dark?: boolean;
  className?: string;
};

/** Garis pembatas antar bagian. */
export function SectionDivider({ dark = false, className }: SectionDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "mx-auto max-w-6xl px-6",
        className
      )}
    >
      <span
        className={cn(
          "block h-px w-full",
          dark ? "bg-cream/15" : "bg-navy/10"
        )}
      />
    </div>
  );
}