import { redirect } from "next/navigation";
import SettingsForm from "@/components/SettingsForm";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Settings() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?message=Sign%20in%20to%20edit%20your%20profile.");

  return (
    <main className="shell">
      <div className="pageHead"><div className="eyebrow">Account</div><h1>Settings</h1></div>
      <SettingsForm
        email={user.email || ""}
        initial={{
          displayName: String(user.user_metadata.display_name || ""),
          username: String(user.user_metadata.username || ""),
          bio: String(user.user_metadata.bio || ""),
          location: String(user.user_metadata.location || ""),
          website: String(user.user_metadata.website || ""),
        }}
      />
    </main>
  );
}
