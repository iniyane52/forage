import { type ReactNode } from "react";

export function Glass({
  children,
  className = "",
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={`glass ${interactive ? "glass-hover" : ""} rounded-2xl ${className}`}
    >
      {children}
    </div>
  );
}
