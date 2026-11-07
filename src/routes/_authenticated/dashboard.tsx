import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { accountQuery } from "@/lib/account-query";
import { deleteSchedule } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAccountAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/account-menu";
import { scheduleSchema } from "@/lib/custom-schedule";
import { pageHead } from "@/lib/og-pages";
export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => pageHead("dashboard"),
  loader: ({ context }) => context.queryClient.ensureQueryData(accountQuery()), component: Dashboard,
});
function Dashboard() {
  const { data } = useSuspenseQuery(accountQuery()); const queryClient = useQueryClient(), remove = useServerFn(deleteSchedule); const { user } = useAccountAuth(); const [deleting, setDeleting] = useState<string | null>(null);
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`schedules-${crypto.randomUUID()}`).on("postgres_changes", { event: "*", schema: "public", table: "schedules", filter: `user_id=eq.${user.id}` }, () => { void queryClient.invalidateQueries({ queryKey: ["account"] }); }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user, queryClient]);
  async function deleteOne(id: string) {
    if (!window.confirm("Delete this saved schedule? This can't be undone.")) return;
    setDeleting(id); try { await remove({ data: { id } }); await queryClient.invalidateQueries({ queryKey: ["account"] }); toast.success("Schedule deleted."); } catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't delete."); } finally { setDeleting(null); }
  }
  return <main className="mx-auto min-h-screen max-w-6xl px-5 pb-12"><header className="flex flex-wrap items-center justify-between gap-3 py-6"><Link to="/" className="font-display text-3xl font-bold">juggle<span className="text-primary">.</span></Link><AccountMenu /></header>
    <div className="mb-10 mt-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-muted-foreground">Welcome back{data.profile.display_name ? `, ${data.profile.display_name}` : ""}.</p><h1 className="text-4xl font-bold">My schedules</h1></div><Button asChild><Link to="/quiz"><Plus />New schedule</Link></Button></div>
    {!data.schedules.length ? <div className="border-y-2 border-foreground/15 py-16 text-center"><CalendarDays className="mx-auto mb-4 size-12 text-muted-foreground" /><h2 className="text-2xl font-bold">Room for your first plan</h2><Button asChild className="mt-5"><Link to="/quiz">Take the quiz</Link></Button></div> : <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.schedules.map((s) => {
      const parsed = scheduleSchema.safeParse(s.document); const doc = parsed.success ? parsed.data : null;
      return <li key={s.id} className="overflow-hidden rounded-lg border-2 border-foreground bg-card"><Link to="/schedules/$id" params={{ id: s.id }} className="block p-5"><div aria-hidden="true" className={`palette-${doc?.color ?? "pink"} mb-5 grid gap-2`}>{(doc?.days[doc.span === "weekly" ? "Mon" : "Today"] ?? []).slice(0, 4).map((b) => <div key={b.id} className={`activity-row kind-${b.kind} h-6 rounded-md`} />)}</div><h2 className="break-words text-2xl font-bold">{s.title}</h2><p className="mt-2 text-sm text-muted-foreground">{doc?.span === "weekly" ? "Weekly" : "Daily"} · Updated {new Date(s.updated_at).toLocaleDateString()}</p></Link><div className="flex items-center justify-between border-t border-foreground/15 px-5 py-3"><Button asChild variant="link" className="px-0"><Link to="/schedules/$id" params={{ id: s.id }}>Open schedule</Link></Button><Button variant="ghost" size="icon" title="Delete schedule" aria-label={`Delete ${s.title}`} disabled={deleting === s.id} onClick={() => { void deleteOne(s.id); }}><Trash2 /></Button></div></li>;
    })}</ul>}
  </main>;
}