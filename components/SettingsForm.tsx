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
      const { data: { user }, error: authError } = await supabase.auth.updateUser({
        data: { display_name: displayName, username, bio, location, website },
      });
      if (authError || !user) throw authError || new Error("Unable to update your account.");

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        username,
        display_name: displayName,
        bio: bio || null,
        location: location || null,
        website: website || null,
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
      <div className="field"><label htmlFor="bio">Bio</label><textarea id="bio" name="bio" rows={4} defaultValue={initial.bio} maxLength={300} /></div>
      <div className="twoCol">
        <div className="field"><label htmlFor="location">Location</label><input id="location" name="location" defaultValue={initial.location} /></div>
        <div className="field"><label htmlFor="website">Website</label><input id="website" name="website" type="url" placeholder="https://" defaultValue={initial.website} /></div>
      </div>
      <button className="primary" type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save changes"}</button>
    </form>
  );
}
