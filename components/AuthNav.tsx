import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export default async function AuthNav() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const username = typeof user.user_metadata.username === "string" ? user.user_metadata.username : "settings";
      const displayName = typeof user.user_metadata.display_name === "string" ? user.user_metadata.display_name : username;
      return <><Link className="hideTablet" href="/notifications">Activity</Link><LogoutButton /><Link className="join" href={username === "settings" ? "/settings" : `/${username}`}>{displayName}</Link></>;
    }
  } catch {
    // Show the public navigation until authentication is configured.
  }

  return <><Link href="/login">Sign in</Link><Link className="join" href="/signup">Join digified</Link></>;
}
