"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "@/components/ui/icons";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await createClient().auth.signOut();
        router.push("/auth");
        router.refresh();
      }}
      aria-label="Sign out"
      className="text-[#9aa7b4] hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
    >
      <LogOut size={16} />
    </button>
  );
}
