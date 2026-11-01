import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthForm({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<"signup" | "signin" | "forgot">("signup");
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [name, setName] = useState("");
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [notice, setNotice] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setNotice("If an account exists for this email, a password reset link is on its way.");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { display_name: name } } });
        if (error) throw error;
        if (data.session) onSuccess();
        else setNotice("Check your email to confirm your account, then sign in here. Your schedule stays open in this tab.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess();
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); }
    finally { setBusy(false); }
  };
  const changeMode = (next: typeof mode) => { setMode(next); setNotice(""); setError(""); };
  return <div>
    <div className="mb-6 flex gap-2 border-b border-foreground/15 pb-3">
      <Button variant={mode === "signup" ? "default" : "ghost"} onClick={() => changeMode("signup")}>Create account</Button>
      <Button variant={mode === "signin" ? "default" : "ghost"} onClick={() => changeMode("signin")}>Sign in</Button>
    </div>
    <form onSubmit={submit} className="grid gap-4">
      {mode === "signup" && <label className="grid gap-2 font-bold">Display name<Input autoComplete="name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} required /></label>}
      <label className="grid gap-2 font-bold">Email<Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      {mode !== "forgot" && <label className="grid gap-2 font-bold">Password<Input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required /></label>}
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {notice && <p role="status" className="rounded-lg bg-sun/25 p-3 font-semibold">{notice}</p>}
      <Button type="submit" className="h-11 font-extrabold" disabled={busy}>{busy ? "One moment…" : mode === "signup" ? "Create my account" : mode === "signin" ? "Sign in to Juggle" : "Send reset link"}</Button>
      {mode === "signin" && <Button variant="link" onClick={() => changeMode("forgot")} type="button">Forgot password?</Button>}
      {mode === "signup" && <p className="text-sm text-muted-foreground">By creating an account, you agree to our <Link to="/terms" className="underline">Terms of Service</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.</p>}
    </form>
  </div>;
}