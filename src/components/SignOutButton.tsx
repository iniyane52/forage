"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await createClient().auth.signOut();
        router.push("/auth");
        router.refresh();
      }}
      className="text-[#9aa7b4] hover:text-white text-xs border border-[#2a323d] rounded-md px-2 py-1"
    >
      Sign out
    </button>
  );
}
