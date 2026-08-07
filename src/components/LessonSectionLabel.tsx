import type { LucideIcon } from "lucide-react";

/** Small uppercase section header used throughout LessonStepFlow.tsx.
 * `scroll-mt-24` keeps anchor-jump targets clear of the fixed app header. */
export function LessonSectionLabel({
  children,
  color = "var(--color-primary)",
  icon: Icon,
  id,
}: {
  children: React.ReactNode;
  color?: string;
  icon: LucideIcon;
  id?: string;
}) {
  return (
    <h2
      id={id}
      className="text-xs font-bold uppercase tracking-widest mt-8 mb-2 flex items-center gap-1.5 scroll-mt-24"
      style={{ color }}
    >
      <Icon size={14} /> {children}
    </h2>
  );
}
