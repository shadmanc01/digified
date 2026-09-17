import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function MobileNav() {
  let profileHref = "/login";
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const username = typeof user?.user_metadata.username === "string" ? user.user_metadata.username : "";
    if (username) profileHref = "/" + username;
  } catch {
    // Keep the public login destination until auth is configured.
  }

  return <nav className="bottomnav"><Link href="/">⌂<span>Home</span></Link><Link href="/explore">⌕<span>Explore</span></Link><Link href="/upload">＋<span>Upload</span></Link><Link href="/notifications">♡<span>Activity</span></Link><Link href={profileHref}>●<span>Profile</span></Link></nav>;
}
