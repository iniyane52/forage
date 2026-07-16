import { createClient } from "@/lib/supabase/server";
import { InterviewClient } from "@/components/interview/InterviewClient";

const FALLBACK_ROLES = [
  "AI Engineer",
  "Software Engineer",
  "Full-Stack Developer",
  "Data Scientist",
  "Cloud & DevOps",
  "Cybersecurity",
];

export default async function InterviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: paths }, { data: profile }] = await Promise.all([
    supabase.from("streams").select("title").eq("kind", "path").order("sort"),
    supabase.from("profiles").select("plan").eq("user_id", user!.id).single(),
  ]);

  const isPro = profile?.plan === "pro";
  const proRoles = paths && paths.length > 0 ? paths.map((p) => p.title) : FALLBACK_ROLES;

  return <InterviewClient roles={proRoles} defaultRole={proRoles[0]} isPro={isPro} />;
}
