import { Loader2 } from "@/components/ui/icons";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="flex items-center justify-center py-24">
      <Loader2 size={24} className="animate-spin text-[#00e5ff]" />
    </div>
  );
}
