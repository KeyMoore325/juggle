import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowDown, ArrowUp, Download, LockKeyhole, Plus, Printer, RotateCcw, Save, Trash2, Check, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthDialog } from "./auth-dialog";
import { useAccountAuth } from "./auth-provider";
import { accountQuery } from "@/lib/account-query";
import { saveSchedule } from "@/lib/account.functions";
import { DAYS, fmt } from "@/lib/schedule";
import { COLORS, THEMES, canFullyCustomize, colorSchema, themeSchema, inputMinutes, timeInput, resizeTimeFrame, reorderActivities, scheduleCsv, scheduleSchema, type Activity, type ScheduleDocument } from "@/lib/custom-schedule";

export function ScheduleEditor({ initial, savedId, onRestart }: { initial: ScheduleDocument; savedId?: string; onRestart?: () => void }) {
  const [doc, setDoc] = useState(initial), [id, setId] = useState(savedId), [day, setDay] = useState(initial.span === "weekly" ? "Mon" : "Today");
  const [authOpen, setAuthOpen] = useState(false), [busy, setBusy] = useState(false), [dirty, setDirty] = useState(!savedId), [error, setError] = useState("");
  const blocks = doc.days[day] ?? [];
  const [start, setStart] = useState(timeInput(blocks[0]?.start ?? 480)), [end, setEnd] = useState(timeInput(blocks.at(-1)?.end ?? 1020));
  const { user } = useAccountAuth(); const advanced = canFullyCustomize(user?.id);
  const account = useQuery({ ...accountQuery(), enabled: Boolean(user) });
  const save = useServerFn(saveSchedule), queryClient = useQueryClient();
  const preferencesApplied = useRef(Boolean(savedId));
  useEffect(() => {
    if (preferencesApplied.current) return;
    const preferences = account.data?.profile.preferences;
    if (preferences && typeof preferences === "object" && !Array.isArray(preferences)) {
      const theme = themeSchema.safeParse(preferences["theme"]), color = colorSchema.safeParse(preferences["color"]);
      if (theme.success && color.success) { preferencesApplied.current = true; setDoc((d) => ({ ...d, theme: theme.data, color: color.data })); }
    }
  }, [account.data]);
  useEffect(() => {
    if (!dirty) return;
    const prevent = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", prevent);
    return () => window.removeEventListener("beforeunload", prevent);
  }, [dirty]);
  useEffect(() => { if (!user) setAuthOpen(false); }, [user]);
  function change(next: ScheduleDocument) { preferencesApplied.current = true; setDoc(next); setDirty(true); setError(""); }
  function changeBlocks(next: Activity[]) {
    if (!advanced) { setAuthOpen(true); return; }
    change({ ...doc, days: { ...doc.days, [day]: next } });
  }
  function patchBlock(index: number, patch: Partial<Activity>) { changeBlocks(blocks.map((b, i) => i === index ? { ...b, ...patch } : b)); }
  function renameBlock(index: number, label: string) {
    change({ ...doc, days: { ...doc.days, [day]: blocks.map((b, i) => i === index ? { ...b, label } : b) } });
  }
  function validate() {
    const result = scheduleSchema.safeParse(doc);
    if (!result.success) { setError(result.error.issues[0]?.message ?? "Check your schedule."); return false; }
    setError(""); return true;
  }
  async function handleSave(asCopy = false) {
    if (!advanced) { setAuthOpen(true); return; }
    if (!validate()) return;
    setBusy(true);
    try { const result = await save({ data: { id: asCopy ? undefined : id, document: doc } }); setId(result.id); setDirty(false); void queryClient.invalidateQueries({ queryKey: ["account"] }); toast.success(asCopy ? "A new copy is saved." : "Schedule saved."); }
    catch (e) { setError(e instanceof Error ? e.message : "Couldn't save your schedule."); }
    finally { setBusy(false); }
  }
  function download() {
    if (!validate()) return;
    const url = URL.createObjectURL(new Blob(["\uFEFF", scheduleCsv(doc)], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "juggle-schedule.csv"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function add() {
    const last = Math.max(0, ...blocks.map((b) => b.end));
    if (last >= 1440) { setError("There isn't room for another activity today."); return; }
    changeBlocks([...blocks, { id: crypto.randomUUID(), label: "New activity", start: last || 480, end: Math.min((last || 480) + 30, 1440), kind: "focus" }]);
  }
  function selectDay(key: string) { setDay(key); const next = doc.days[key] ?? []; setStart(timeInput(next[0]?.start ?? 480)); setEnd(timeInput(next.at(-1)?.end ?? 1020)); }
  function setSpan(span: "daily" | "weekly") {
    const key = span === "weekly" ? "Mon" : "Today";
    const source = doc.days[day] ?? [];
    change({ ...doc, span, days: { ...doc.days, ...(span === "daily" ? { Today: source.map((b) => ({ ...b })) } : Object.fromEntries(DAYS.map((d) => [d, source.map((b) => ({ ...b }))]))) } });
    setDay(key);
  }
  return <section className="mx-auto max-w-7xl px-5 pb-12">
    <div className="no-print mb-8 flex flex-wrap items-end justify-between gap-5">
      <div><p className="mb-2 font-extrabold text-muted-foreground">A little less chaos. A little more you.</p><h1 className="text-4xl font-bold md:text-5xl">Your custom schedule</h1></div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => { if (validate()) window.print(); }}><Printer />Print</Button>
        <Button variant="secondary" onClick={download}><Download />CSV</Button>
        <Button onClick={() => { void handleSave(); }} disabled={busy}><Save />{busy ? "Saving…" : dirty || !id ? "Save schedule" : "Saved"}</Button>
        {id && <Button variant="outline" onClick={() => { void handleSave(true); }} disabled={busy}>Save a copy</Button>}
        {onRestart && <Button size="icon" variant="ghost" aria-label="Retake quiz" title="Retake quiz" onClick={() => { if (!dirty || window.confirm("Start again? Unsaved changes will be lost.")) onRestart(); }}><RotateCcw /></Button>}
      </div>
    </div>
    {error && <p role="alert" className="no-print mb-5 rounded-lg border border-destructive bg-card p-3 text-destructive">{error}</p>}
    <div className="grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="no-print grid gap-7 border-b-2 border-foreground/15 pb-6 lg:sticky lg:top-5 lg:border-b-0 lg:border-r-2 lg:pr-7" aria-label="Schedule customization">
        <div className="grid gap-4"><h2 className="text-2xl font-bold">Make it yours</h2>
          <label className="grid gap-2 text-sm font-extrabold">Schedule title<Input value={doc.title} onChange={(e) => change({ ...doc, title: e.target.value })} maxLength={100} /></label>
          <label className="grid gap-2 text-sm font-extrabold">Your name<Input placeholder="Whose plan is this?" value={doc.name} onChange={(e) => change({ ...doc, name: e.target.value })} maxLength={80} /></label>
        </div>
        <fieldset><legend className="mb-3 text-sm font-extrabold">Plan</legend><div className="flex gap-2">{(["daily", "weekly"] as const).map((s) => <Button key={s} variant={doc.span === s ? "default" : "outline"} aria-pressed={doc.span === s} onClick={() => { if (!advanced) { setAuthOpen(true); return; } setSpan(s); }}><CalendarDays />{s === "daily" ? "Daily" : "Weekly"}</Button>)}</div></fieldset>
        <form onSubmit={(e) => { e.preventDefault(); try { change(resizeTimeFrame(doc, inputMinutes(start), inputMinutes(end))); } catch (err) { setError(err instanceof Error ? err.message : "Check your times."); } }}>
          <h3 className="mb-3 text-sm font-extrabold">Overall time frame</h3><div className="grid grid-cols-2 gap-2">
            <label className="grid gap-1 text-sm">Start<Input type="time" required value={start} onChange={(e) => setStart(e.target.value)} /></label>
            <label className="grid gap-1 text-sm">End<Input type="time" required value={end} onChange={(e) => setEnd(e.target.value)} /></label>
          </div><Button variant="outline" className="mt-3 w-full" type="submit">Apply time frame</Button>
        </form>
        <fieldset><legend className="mb-3 text-sm font-extrabold">Color</legend><div className="flex gap-3">{COLORS.map((c) => <Button key={c.value} size="icon" variant="outline" aria-label={c.label} title={c.label} aria-pressed={doc.color === c.value} onClick={() => change({ ...doc, color: c.value })} className={`color-swatch swatch-${c.value} rounded-full`}>{doc.color === c.value && <Check />}</Button>)}</div></fieldset>
        <fieldset><legend className="mb-3 text-sm font-extrabold">Theme</legend><div className="grid grid-cols-3 gap-2">{THEMES.map((t) => <Button key={t.value} variant={doc.theme === t.value ? "default" : "outline"} aria-pressed={doc.theme === t.value} className="px-2" onClick={() => change({ ...doc, theme: t.value })}>{t.label}</Button>)}</div></fieldset>
        {!advanced && <Button onClick={() => setAuthOpen(true)} className="h-auto min-h-11 whitespace-normal py-3 font-extrabold"><LockKeyhole />Unlock full customization</Button>}
        <p className="text-sm font-semibold text-muted-foreground" role="status">{id && !dirty ? "All changes saved" : "Unsaved changes"}</p>
      </aside>
      <div className={`schedule-paper theme-${doc.theme} palette-${doc.color} min-w-0`}>
        <div className="mb-6 border-b-2 border-foreground/15 pb-5"><p className="mb-2 font-display text-lg font-bold">juggle.</p><h2 className="break-words text-3xl font-bold">{doc.title || "My Juggle Schedule"}</h2>{doc.name && <p className="mt-2 break-words font-semibold">{doc.name}'s {doc.span === "weekly" ? "week" : "day"}</p>}</div>
        {doc.span === "weekly" && <nav className="no-print mb-5 flex flex-wrap gap-2" aria-label="Weekdays">{DAYS.map((d) => <Button key={d} aria-pressed={d === day} variant={d === day ? "default" : "outline"} onClick={() => selectDay(d)}>{d}</Button>)}</nav>}
        <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-bold">{day}</h3>{advanced && <div className="flex flex-wrap gap-2">{doc.span === "weekly" && <Button variant="outline" onClick={() => { if (window.confirm(`Replace all other weekday plans with ${day}'s plan?`)) change({ ...doc, days: { ...doc.days, ...Object.fromEntries(DAYS.map((d) => [d, blocks.map((b) => ({ ...b }))])) } }); }}>Copy to all days</Button>}<Button variant="secondary" onClick={add}><Plus />Add activity</Button></div>}</div>
        <div className="no-print grid gap-3">
          {!blocks.length && <p className="py-8 text-center text-muted-foreground">A blank day, full of possibilities.</p>}
          {blocks.map((b, index) => <div key={b.id} className={`activity-row kind-${b.kind} grid gap-3 rounded-lg p-3 ${advanced ? "md:grid-cols-[minmax(0,1fr)_auto]" : "sm:grid-cols-[150px_minmax(0,1fr)]"}`}>
            {advanced ? <><div className="grid gap-3"><Input aria-label={`Activity ${index + 1} name`} value={b.label} maxLength={120} onChange={(e) => renameBlock(index, e.target.value)} className="border-foreground/20 bg-card/70 font-bold" /><div className="flex flex-wrap gap-2">
              <Input className="w-28 border-foreground/20 bg-card/70" aria-label={`Activity ${index + 1} start`} type="time" value={timeInput(b.start)} onChange={(e) => { if (e.target.value) patchBlock(index, { start: inputMinutes(e.target.value) }); }} />
              <span className="self-center" aria-hidden="true">–</span><Input className="w-28 border-foreground/20 bg-card/70" aria-label={`Activity ${index + 1} end`} type="time" value={timeInput(b.end)} onChange={(e) => { if (e.target.value) patchBlock(index, { end: inputMinutes(e.target.value) }); }} />
              <select aria-label={`Activity ${index + 1} type`} value={b.kind} onChange={(e) => patchBlock(index, { kind: e.target.value as Activity["kind"] })} className="rounded-md border border-foreground/20 bg-card px-2 text-sm"><option value="focus">Focus</option><option value="break">Break</option><option value="meal">Meal</option><option value="routine">Routine</option></select>
            </div></div><div className="flex items-center gap-1 md:flex-col">
              <Button size="icon" variant="ghost" title="Move earlier" aria-label={`Move activity ${index + 1} earlier`} disabled={index === 0} onClick={() => changeBlocks(reorderActivities(blocks, index, -1))}><ArrowUp /></Button>
              <Button size="icon" variant="ghost" title="Move later" aria-label={`Move activity ${index + 1} later`} disabled={index === blocks.length - 1} onClick={() => changeBlocks(reorderActivities(blocks, index, 1))}><ArrowDown /></Button>
              <Button size="icon" variant="ghost" title="Delete activity" aria-label={`Delete activity ${index + 1}`} onClick={() => changeBlocks(blocks.filter((_, i) => index !== i))}><Trash2 /></Button>
            </div></> : <><p className="self-center text-sm font-semibold">{fmt(b.start)} – {fmt(b.end)}</p><Input aria-label={`Activity ${index + 1} name`} value={b.label} maxLength={120} onChange={(e) => renameBlock(index, e.target.value)} className="min-w-0 border-foreground/20 bg-card/70 font-bold" /></>}
          </div>)}
        </div>
        <div className="print-only">{(doc.span === "weekly" ? DAYS : ["Today"]).map((d) => <section key={d} className="print-day"><h3 className="mb-3 text-xl font-bold">{d}</h3><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Time</th><th className="p-2">Activity</th></tr></thead><tbody>{(doc.days[d] ?? []).map((b) => <tr key={b.id} className={`activity-row kind-${b.kind}`}><td className="p-2">{fmt(b.start)} – {fmt(b.end)}</td><td className="p-2">{b.label}</td></tr>)}</tbody></table></section>)}</div>
      </div>
    </div><AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
  </section>;
}