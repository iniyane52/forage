"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "@/components/ui/icons";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto text-center py-24">
      <AlertTriangle size={32} className="mx-auto text-[#ffb020] mb-3" />
      <h1 className="text-lg font-bold mb-1">Something went wrong</h1>
      <p className="text-sm text-[#7d99a3] mb-6">
        That page hit an unexpected error. You can try again, or head back to the dashboard.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-xl bg-[#00e5ff] text-[#05070a] text-sm font-semibold hover:bg-[#33ebff] transition-colors"
        >
          Try again
        </button>
        <Link href="/dashboard" className="px-4 py-2 rounded-xl glass glass-hover text-sm">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
