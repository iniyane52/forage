import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth (Google) redirects the browser here with a `code` query param -- this is
// the one place a server-side handler is structurally required for auth to work at
// all, unlike the rest of the app which talks to Supabase directly from the client
// or via RPC. Exchanges the code for a session, then sends the user on their way.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/auth`);
}
