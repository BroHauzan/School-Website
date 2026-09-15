"use client";

import type { ReactNode } from "react";
import { Field, inputCls } from "@/components/admin/Field";
import { cn } from "@/lib/utils";

export { inputCls };

/** Label + petunjuk + kontrol, memakai gaya yang sama dengan `components/admin/Field.tsx`. */
export function BlockField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <Field label={label} htmlFor={htmlFor} hint={hint}>
      {children}
    </Field>
  );
}

export function BlockInput({ className, ...props }: React.ComponentProps<"input">) {
  return <input {...props} className={cn(inputCls, className)} />;
}

export function BlockTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(inputCls, "leading-relaxed", className)} />;
}

export function BlockSelect({ className, ...props }: React.ComponentProps<"select">) {
  return <select {...props} className={cn(inputCls, "cursor-pointer", className)} />;
}
