"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const message = searchParams.get("message");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;
      router.replace("/following");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn't sign you in. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="shell">
      <form className="formCard" style={{ marginTop: 70 }} onSubmit={handleSubmit}>
        <div className="brand" style={{ marginBottom: 26 }}>digified</div>
        <h2>Welcome back</h2>
        {message && <div className="formMessage formSuccess" role="status">{message}</div>}
        {error && <div className="formMessage formError" role="alert">{error}</div>}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <button className="primary" style={{ width: "100%" }} type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
        <p className="muted">No account? <Link href="/signup"><b>Join digified</b></Link></p>
      </form>
    </main>
  );
}

export default function Login() {
  return <Suspense fallback={<main className="shell"><div className="formCard" style={{ marginTop: 70 }}>Loading…</div></main>}><LoginForm /></Suspense>;
}
