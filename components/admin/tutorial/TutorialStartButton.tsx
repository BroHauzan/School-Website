"use client";

import { useTutorial } from "./TutorialProvider";

export default function TutorialStartButton({
  tutorialId,
  label = "Mulai tutorial",
}: {
  tutorialId: string;
  label?: string;
}) {
  const { start } = useTutorial();
  return (
    <button
      onClick={() => start(tutorialId)}
      className="rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-navy-light"
    >
      {label}
    </button>
  );
}
