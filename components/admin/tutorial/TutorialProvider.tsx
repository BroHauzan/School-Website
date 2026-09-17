"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getTutorial } from "./tutorials";

type TutorialState = {
  activeId: string | null;
  stepIndex: number;
  totalSteps: number;
  stepId: string | null;
  start: (id: string) => void;
  next: () => void;
  prev: () => void;
  exit: () => void;
};

const Ctx = createContext<TutorialState | null>(null);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const tutorial = activeId ? getTutorial(activeId) : undefined;
  const totalSteps = tutorial?.steps.length ?? 0;

  const start = useCallback(
    (id: string) => {
      const t = getTutorial(id);
      if (!t) return;
      setActiveId(id);
      setStepIndex(0);
      if (t.steps[0] && pathname !== t.steps[0].route) {
        router.push(t.steps[0].route as never);
      }
    },
    [pathname, router],
  );

  const exit = useCallback(() => {
    setActiveId(null);
    setStepIndex(0);
  }, []);

  const next = useCallback(() => {
    if (!tutorial) return;
    const nextIdx = stepIndex + 1;
    if (nextIdx >= tutorial.steps.length) {
      exit();
      return;
    }
    const nextStep = tutorial.steps[nextIdx];
    setStepIndex(nextIdx);
    if (nextStep && pathname !== nextStep.route) {
      router.push(nextStep.route as never);
    }
  }, [tutorial, stepIndex, pathname, router, exit]);

  const prev = useCallback(() => {
    if (!tutorial) return;
    const prevIdx = Math.max(0, stepIndex - 1);
    const prevStep = tutorial.steps[prevIdx];
    setStepIndex(prevIdx);
    if (prevStep && pathname !== prevStep.route) {
      router.push(prevStep.route as never);
    }
  }, [tutorial, stepIndex, pathname, router]);

  const value = useMemo<TutorialState>(
    () => ({
      activeId,
      stepIndex,
      totalSteps,
      stepId: tutorial?.steps[stepIndex]?.id ?? null,
      start,
      next,
      prev,
      exit,
    }),
    [activeId, stepIndex, totalSteps, tutorial, start, next, prev, exit],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTutorial(): TutorialState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTutorial harus dipakai di dalam TutorialProvider");
  return ctx;
}
