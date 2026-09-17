import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next");
  const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/following";
  if (!code) return NextResponse.redirect(new URL("/login?message=The%20confirmation%20link%20is%20invalid%20or%20expired.", url.origin));

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    const { data: { user } } = await supabase.auth.getUser();
    const username = typeof user?.user_metadata.username === "string" ? user.user_metadata.username : "";
    if (user && username) {
      await supabase.from("profiles").upsert({
        id: user.id,
        username,
        display_name: String(user.user_metadata.display_name || username),
      });
    }
    return NextResponse.redirect(new URL(username ? "/" + username : next, url.origin));
  } catch {
    return NextResponse.redirect(new URL("/login?message=We%20couldn't%20confirm%20your%20account.%20Please%20try%20signing%20in.", url.origin));
  }
}
