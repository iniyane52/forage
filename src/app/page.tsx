import { redirect } from "next/navigation";

export default function Home() {
  // proxy.ts sends signed-in users straight to /dashboard.
  redirect("/auth");
}
