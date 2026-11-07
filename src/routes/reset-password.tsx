import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pageHead } from "@/lib/og-pages";
export const Route = createFileRoute("/reset-password")({
  head: () => pageHead("reset-password"), component: ResetPassword,
});
function ResetPassword() {
  const [recovery, setRecovery] = useState(false), [password, setPassword] = useState(""), [confirm, setConfirm] = useState(""), [busy, setBusy] = useState(false), [error, setError] = useState(""), [done, setDone] = useState(false);
  useEffect(() => { setRecovery(new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery"); }, []);
  async function submit(e: FormEvent) {
    e.preventDefault(); if (!recovery) return;
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setBusy(true); setError("");
    const { error } = await supabase.auth.updateUser({ password }); setBusy(false);
    if (error) setError(error.message); else setDone(true);
  }
  return <main className="mx-auto max-w-md px-5 py-16"><h1 className="mb-8 text-4xl font-bold">A fresh password</h1>
    {done ? <p role="status">Your password is updated. <Link to="/dashboard" className="underline">My schedules</Link></p> : !recovery ? <p>Open the password reset link from your email. <Link to="/auth" className="underline">Request another link</Link></p> : <form onSubmit={submit} className="grid gap-4">
      <label className="grid gap-2 font-bold">New password<Input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      <label className="grid gap-2 font-bold">Confirm password<Input type="password" autoComplete="new-password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} /></label>
      {error && <p role="alert" className="text-destructive">{error}</p>}<Button disabled={busy} type="submit">{busy ? "Updating…" : "Update password"}</Button>
    </form>}
  </main>;
}