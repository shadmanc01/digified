"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type ProfileValues = {
  displayName: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  avatarUrl?: string;
};

export default function SettingsForm({ email, initial }: { email: string; initial: ProfileValues }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const displayName = String(form.get("displayName") || "").trim();
    const username = String(form.get("username") || "").trim().toLowerCase();
    const bio = String(form.get("bio") || "").trim();
    const location = String(form.get("location") || "").trim();
    const website = String(form.get("website") || "").trim();

    if (!/^[a-z0-9._]{3,30}$/.test(username)) {
      setError("Username must be 3–30 characters and use only letters, numbers, periods, or underscores.");
      setSubmitting(false);
      return;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      const avatarFile = form.get("avatar") as File | null;
      let avatarUrl = initial.avatarUrl || null;
      const { data: { user: existing } } = await supabase.auth.getUser();
      if (avatarFile?.size && existing) {
        const path = `${existing.id}/avatar-${Date.now()}.${avatarFile.name.split(".").pop() || "jpg"}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        avatarUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      }
      const password = String(form.get("password") || "");
      const { data: { user }, error: authError } = await supabase.auth.updateUser({
        ...(password ? { password } : {}), data: { display_name: displayName, username, bio, location, website, avatar_url: avatarUrl },
      });
      if (authError || !user) throw authError || new Error("Unable to update your account.");

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        username,
        display_name: displayName,
        bio: bio || null,
        location: location || null,
        website: website || null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });
      if (profileError && profileError.code !== "42P01") throw profileError;

      router.replace("/" + username);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn't update your profile.");
      setSubmitting(false);
    }
  }

  return (
    <form className="formCard" onSubmit={handleSubmit}>
      {error && <div className="formMessage formError" role="alert">{error}</div>}
      <div className="twoCol">
        <div className="field"><label htmlFor="displayName">Display name</label><input id="displayName" name="displayName" defaultValue={initial.displayName} required /></div>
        <div className="field"><label htmlFor="username">Username</label><input id="username" name="username" defaultValue={initial.username} required /></div>
      </div>
      <div className="field"><label>Email</label><input value={email} disabled /></div>
      <div className="field"><label htmlFor="avatar">Profile photo</label><input id="avatar" name="avatar" type="file" accept="image/jpeg,image/png,image/webp" /></div>
      <div className="field"><label htmlFor="bio">Bio</label><textarea id="bio" name="bio" rows={4} defaultValue={initial.bio} maxLength={300} /></div>
      <div className="twoCol">
        <div className="field"><label htmlFor="location">Location</label><input id="location" name="location" defaultValue={initial.location} /></div>
        <div className="field"><label htmlFor="website">Website</label><input id="website" name="website" type="url" placeholder="https://" defaultValue={initial.website} /></div>
      </div>
      <div className="field"><label htmlFor="password">New password</label><input id="password" name="password" type="password" minLength={8} placeholder="Leave blank to keep your current password" /></div>
      <button className="primary" type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save changes"}</button>
      <DeleteAccount />
    </form>
  );
}

function DeleteAccount(){const router=useRouter();async function remove(){if(!confirm("Delete your account and all of its posts permanently?"))return;const supabase=createBrowserSupabaseClient();const {error}=await supabase.rpc("delete_my_account");if(error){alert(error.message);return;}await supabase.auth.signOut();router.replace("/");router.refresh();}return <div className="dangerZone"><h3>Delete account</h3><p className="muted">This permanently removes your profile, posts, comments, saves, messages and gear.</p><button className="dangerButton" type="button" onClick={remove}>Delete my account</button></div>}
