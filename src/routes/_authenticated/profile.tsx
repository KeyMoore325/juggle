import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent } from "react";
import { UserRound, Upload, Save } from "lucide-react";
import { toast } from "sonner";
import { accountQuery } from "@/lib/account-query";
import { updateProfile, deleteAccount } from "@/lib/account.functions";
import { COLORS, THEMES, colorSchema, themeSchema, type Color, type Theme } from "@/lib/custom-schedule";
import { supabase } from "@/integrations/supabase/client";
import { useAccountAuth } from "@/components/auth-provider";
import { AccountMenu } from "@/components/account-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile & Preferences — Juggle" }, { name: "description", content: "Manage your Juggle display name, profile photo and favorite schedule colors and themes." }, { property: "og:title", content: "Your Juggle Profile" }, { property: "og:description", content: "Personalize your profile and schedule preferences." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(accountQuery()), component: Profile,
});
function Profile() {
  const { data } = useSuspenseQuery(accountQuery()); const { user, signOut } = useAccountAuth(); const queryClient = useQueryClient(), update = useServerFn(updateProfile), remove = useServerFn(deleteAccount);
  const [name, setName] = useState(data.profile.display_name), [path, setPath] = useState(data.profile.avatar_path), [photo, setPhoto] = useState<string | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const p = data.profile.preferences; const prefs = p && typeof p === "object" && !Array.isArray(p) ? p : {};
  const [theme, setTheme] = useState<Theme>(themeSchema.safeParse(prefs["theme"]).data ?? "playful"), [color, setColor] = useState<Color>(colorSchema.safeParse(prefs["color"]).data ?? "pink");
  useEffect(() => { let active = true; if (!path) { setPhoto(null); return; } void supabase.storage.from("avatars").createSignedUrl(path, 3600).then(({ data }) => { if (active) setPhoto(data?.signedUrl ?? null); }); return () => { active = false; }; }, [path]);
  async function upload(file: File | undefined) {
    if (!file || !user) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) { setError("Choose a JPG, PNG or WebP photo smaller than 2 MB."); return; }
    setBusy(true); setError("");
    try {
      const ext = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
      const next = `${user.id}/avatar.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(next, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      await update({ data: { displayName: name, avatarPath: next, theme, color } });
      setPath(next); const signed = await supabase.storage.from("avatars").createSignedUrl(next, 3600); setPhoto(signed.data?.signedUrl ?? null);
      await queryClient.invalidateQueries({ queryKey: ["account"] }); toast.success("Photo updated.");
    } catch (e) { setError(e instanceof Error ? e.message : "Couldn't upload your photo."); } finally { setBusy(false); }
  }
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try { await update({ data: { displayName: name, avatarPath: path, theme, color } }); await queryClient.invalidateQueries({ queryKey: ["account"] }); toast.success("Profile saved."); } catch (e) { setError(e instanceof Error ? e.message : "Couldn't save your profile."); } finally { setBusy(false); }
  }
  async function deleteMe() {
    if (!window.confirm("Permanently delete your account, profile photo and all saved schedules? This cannot be undone.")) return;
    setBusy(true); try { await remove(); await signOut(); } catch (e) { setError(e instanceof Error ? e.message : "Couldn't delete your account."); setBusy(false); }
  }
  return <main className="mx-auto min-h-screen max-w-3xl px-5 pb-12"><header className="flex flex-wrap items-center justify-between gap-3 py-6"><Link to="/dashboard" className="font-display text-2xl font-bold">← My schedules</Link><AccountMenu /></header><h1 className="mb-8 mt-8 text-4xl font-bold">Profile & preferences</h1>
    <div className="mb-8 flex flex-wrap items-center gap-5"><div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-foreground bg-sky/25">{photo ? <img src={photo} alt="Your profile" className="size-full object-cover" /> : <UserRound className="size-8" />}</div><label className="cursor-pointer"><span className="inline-flex items-center gap-2 font-extrabold"><Upload className="size-4" />Choose profile photo</span><input aria-label="Profile photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} className="mt-2 block w-full max-w-xs text-sm" onChange={(e) => { void upload(e.target.files?.[0]); }} /></label>{path && <Button variant="ghost" disabled={busy} onClick={() => { setPath(null); setPhoto(null); }}>Remove photo</Button>}</div>
    <form onSubmit={submit} className="grid max-w-lg gap-6"><label className="grid gap-2 font-extrabold">Display name<Input value={name} maxLength={80} onChange={(e) => setName(e.target.value)} /></label><fieldset><legend className="mb-3 font-extrabold">Default theme</legend><div className="flex flex-wrap gap-2">{THEMES.map((t) => <Button type="button" key={t.value} aria-pressed={theme === t.value} onClick={() => setTheme(t.value)} variant={theme === t.value ? "default" : "outline"}>{t.label}</Button>)}</div></fieldset><fieldset><legend className="mb-3 font-extrabold">Default color</legend><div className="flex flex-wrap gap-2">{COLORS.map((c) => <Button type="button" key={c.value} onClick={() => setColor(c.value)} aria-pressed={color === c.value} variant={color === c.value ? "default" : "outline"}>{c.label}</Button>)}</div></fieldset>
    {error && <p role="alert" className="text-destructive">{error}</p>}<Button type="submit" disabled={busy}><Save />{busy ? "Saving…" : "Save profile"}</Button></form>
    <section className="mt-12 border-t-2 border-foreground/15 pt-6"><h2 className="mb-4 text-2xl font-bold">Account</h2><p className="mb-4 break-all text-muted-foreground">{user?.email}</p><Button variant="destructive" disabled={busy} onClick={() => { void deleteMe(); }}>Delete account</Button></section>
  </main>;
}