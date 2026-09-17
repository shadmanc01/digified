import Link from "next/link";
import { notFound } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import PhotoGrid from "@/components/PhotoGrid";
import FollowButton from "@/components/FollowButton";
import { photos } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type StoredProfile = {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  website: string | null;
};

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join("") || "?";
}

export default async function Profile({ params }: { params: Promise<{ username: string }> }) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername).toLowerCase();
  let authUser: User | null = null;
  let storedProfile: StoredProfile | null = null;

  try {
    const supabase = await createServerSupabaseClient();
    const [{ data: authData }, { data: profileData }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("profiles").select("id, username, display_name, bio, avatar_url, location, website").eq("username", username).maybeSingle(),
    ]);
    authUser = authData.user;
    storedProfile = profileData as StoredProfile | null;
  } catch {
    // Auth metadata still powers the owner's page before the profiles migration is run.
  }

  const ownUsername = typeof authUser?.user_metadata.username === "string"
    ? authUser.user_metadata.username.toLowerCase()
    : "";
  const isOwner = Boolean(authUser && ownUsername === username);
  const seededUser = photos.find(photo => photo.user.username === username)?.user;

  if (!isOwner && !storedProfile && !seededUser) notFound();

  const displayName = isOwner
    ? storedProfile?.display_name || String(authUser?.user_metadata.display_name || username)
    : storedProfile?.display_name || seededUser?.name || username;
  const avatar = storedProfile?.avatar_url ? null : initials(displayName);
  const location = storedProfile?.location || (seededUser ? "New York, NY" : null);
  const items = isOwner || storedProfile ? [] : photos.filter(photo => photo.user.username === username);
  const counts = new Map<string, number>();
  items.forEach(photo => counts.set(photo.camera.name, (counts.get(photo.camera.name) || 0) + 1));
  const mostUsed = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const isSeededProfile = Boolean(seededUser && !storedProfile && !isOwner);

  return (
    <main className="shell">
      <section className="profileHero">
        {storedProfile?.avatar_url
          ? <img className="bigAvatar profileAvatarImage" src={storedProfile.avatar_url} alt={displayName + "'s avatar"} />
          : <div className="bigAvatar">{avatar}</div>}
        <div>
          <h1>{displayName}</h1>
          <div className="muted">@{username}{location ? " · " + location : ""}</div>
          {storedProfile?.bio && <p className="profileBio">{storedProfile.bio}</p>}
          <div className="statRow">
            <span><b>{isSeededProfile ? 128 : 0}</b> followers</span>
            <span><b>{isSeededProfile ? 214 : 0}</b> following</span>
            <span><b>{items.length}</b> posts</span>
          </div>
          <div className="gearSummary">
            {mostUsed && <span className="pill">Most used: {mostUsed}</span>}
            <Link className="pill" href={"/" + username + "/gear"}>View gear</Link>
          </div>
        </div>
        <div className="actions">
          {isOwner
            ? <Link className="primary" href="/settings">Edit profile</Link>
            : <><FollowButton /> <Link className="secondary" href="/messages">Message</Link></>}
        </div>
      </section>
      <div className="tabbar">
        <Link className="active" href={"/" + username}>Photos</Link>
        <Link href={"/" + username + "/gear"}>Gear</Link>
        {isOwner && <Link href="/saved">Collections</Link>}
      </div>
      {items.length
        ? <PhotoGrid items={items} />
        : <div className="empty"><h2>No photos yet</h2><p>{isOwner ? "Upload your first photograph to start building your profile." : "This photographer hasn't published anything yet."}</p>{isOwner && <Link className="primary" href="/upload">Upload a photo</Link>}</div>}
    </main>
  );
}
