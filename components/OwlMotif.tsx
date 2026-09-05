"use client";

import { cn } from "@/lib/utils";

type OwlMotifProps = {
  className?: string;
  variant?: "face" | "wing" | "silhouette" | "watermark";
  role?: string;
};

export function OwlMotif({
  className,
  variant = "face",
  role = "img",
}: OwlMotifProps) {
  if (variant === "watermark") {
    return (
      <svg
        role={role}
        aria-label="Motif burung hantu"
        className={cn("pointer-events-none", className)}
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
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
  }

  if (variant === "silhouette") {
    return (
      <svg
        role={role}
        aria-label="Siluet burung hantu"
        className={cn("", className)}
        viewBox="0 0 64 64"
        fill="currentColor"
      >
        <path d="M32 6c-14 0-26 10-30 24-1 4-2 9-2 14 0 18 12 34 30 38 18-4 30-20 30-38 0-5-1-10-2-14C58 16 46 6 32 6z" />
        <circle cx="24" cy="26" r="5" fill="var(--background, #fff)" />
        <circle cx="40" cy="26" r="5" fill="var(--background, #fff)" />
      </svg>
    );
  }

  if (variant === "wing") {
    return (
      <svg
        role={role}
        aria-label="Sayap burung hantu"
        className={cn("", className)}
        viewBox="0 0 120 80"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 70c10-30 30-50 50-60 20 10 40 30 50 60" />
        <path d="M20 70c10-22 28-38 40-46 12 8 30 24 40 46" />
        <path d="M35 70c8-14 20-24 25-28 5 4 17 14 25 28" />
      </svg>
    );
  }

  return (
    <svg
      role={role}
      aria-label="Wajah burung hantu"
      className={cn("", className)}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M32 10c-12 0-22 8-26 20-2 6-3 12-3 18 0 16 10 30 26 34 16-4 26-18 26-34 0-6-1-12-3-18-4-12-14-20-26-20z" />
      <circle cx="24" cy="28" r="5" />
      <circle cx="40" cy="28" r="5" />
      <circle cx="24" cy="28" r="2" fill="currentColor" stroke="none" />
      <circle cx="40" cy="28" r="2" fill="currentColor" stroke="none" />
      <path d="M32 34v6" />
      <path d="M28 42c3 2 7 2 10 0" />
    </svg>
  );
}
