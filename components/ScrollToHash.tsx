"use client";

import { useEffect } from "react";

/**
 * Scrolls to the element matching window.location.hash on mount
 * and whenever the hash changes (e.g., footer nav clicks).
 */
export function ScrollToHash() {
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (!hash) return;

      const el = document.querySelector(hash);
      if (!el) return;

      el.scrollIntoView({ behavior: "smooth" });
    };

    // Scroll on mount if hash is present
    scrollToHash();

    // Listen for hash changes (footer nav clicks)
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return null;
}
