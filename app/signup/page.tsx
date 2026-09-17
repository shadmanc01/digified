"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function Signup() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const displayName = String(form.get("displayName") ?? "").trim();
    const username = String(form.get("username") ?? "").trim().toLowerCase();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    if (!/^[a-z0-9._]{3,30}$/.test(username)) {
      setError("Username must be 3–30 characters and use only letters, numbers, periods, or underscores.");
      setSubmitting(false);
      return;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/following`,
          data: { display_name: displayName, username },
        },
      });

      if (signupError) throw signupError;

      if (data.session) {
        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            username,
            display_name: displayName,
          });
        }
        router.replace("/" + username);
        router.refresh();
        return;
      }

      router.replace("/login?message=Check%20your%20email%20to%20confirm%20your%20account%2C%20then%20sign%20in.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn't create your account. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="shell">
      <form className="formCard" style={{ marginTop: 70 }} onSubmit={handleSubmit}>
        <div className="brand" style={{ marginBottom: 26 }}>digified</div>
        <h2>Create your account</h2>
        <p className="muted">Browsing is public. Join when you&apos;re ready to post, follow, save, comment or message.</p>
        {error && <div className="formMessage formError" role="alert">{error}</div>}
        <div className="twoCol">
          <div className="field">
            <label htmlFor="displayName">Display name</label>
            <input id="displayName" name="displayName" autoComplete="name" required maxLength={60} />
          </div>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input id="username" name="username" autoComplete="username" required minLength={3} maxLength={30} pattern="[A-Za-z0-9._]+" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
          <small className="fieldHint">Use at least 8 characters.</small>
        </div>
        <button className="primary" style={{ width: "100%" }} type="submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Join digified"}
        </button>
        <p className="muted">Already have an account? <Link href="/login"><b>Sign in</b></Link></p>
      </form>
    </main>
  );
}
