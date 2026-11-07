import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildDay, fmt, MAX_PLATE, type Answers } from "@/lib/schedule";
import { getPersonality } from "@/lib/personality";
import { PersonalityReveal } from "@/components/personality-reveal";
import { createSchedule } from "@/lib/custom-schedule";
import { ScheduleEditor } from "@/components/schedule-editor";
import { AccountMenu } from "@/components/account-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PROGRESS_KEY, QUESTION_COUNT, isStepValid, progressCopy, questionNumber, togglePlate, visibleSteps, withDefaults,
  type Draft, type StepId,
} from "@/lib/quiz-flow";
import { inputMinutes, timeInput } from "@/lib/custom-schedule";
import { pageHead } from "@/lib/og-pages";

export const Route = createFileRoute("/quiz")({
  head: () => pageHead("quiz"),
  component: Quiz,
});

type Opt<V> = { v: V; l: string; e?: string };
const single: Partial<Record<StepId, { key: keyof Answers; q: string; opts: Opt<string>[] }>> = {
  whose: { key: "whose", q: "Whose schedule is it?", opts: [
    { v: "me", l: "Me", e: "🙋" }, { v: "kids", l: "My kid(s)", e: "🧒" },
    { v: "partner", l: "Me + my partner", e: "💞" }, { v: "family", l: "The whole family", e: "🏡" }] },
  kidAge: { key: "kidAge", q: "How old?", opts: [
    { v: "little", l: "Little ones (3–5)", e: "🧸" }, { v: "school", l: "School age (6–12)", e: "🎒" }, { v: "teen", l: "Teens (13+)", e: "🎧" }] },
  peak: { key: "peak", q: "When's your brain sharpest?", opts: [
    { v: "morning", l: "Morning", e: "☀️" }, { v: "afternoon", l: "Afternoon", e: "🌤️" }, { v: "evening", l: "Evening", e: "🌙" }] },
  pace: { key: "pace", q: "How do you like to focus?", opts: [
    { v: "sprints", l: "Sprints (25 min on / 5 off)", e: "⚡" }, { v: "steady", l: "Steady (50 / 10)", e: "🎯" }, { v: "deep", l: "Deep dives (90 / 20)", e: "🌊" }] },
  more: { key: "more", q: "What do you want more time for?", opts: [
    { v: "rest", l: "Rest", e: "😴" }, { v: "movement", l: "Movement", e: "🏃" }, { v: "hobbies", l: "Hobbies", e: "🎨" },
    { v: "people", l: "People I love", e: "💞" }, { v: "learning", l: "Learning", e: "📚" }, { v: "organized", l: "Just want it organized", e: "✅" }] },
};
const PLATE_OPTS: Opt<Answers["plate"][number]>[] = [
  { v: "school", l: "School", e: "🎒" }, { v: "work", l: "Work", e: "💼" }, { v: "family", l: "Kids & family", e: "👨‍👩‍👧" },
  { v: "fitness", l: "Fitness", e: "🏋️" }, { v: "side", l: "Side project", e: "🚀" }, { v: "home", l: "Home & chores", e: "🧺" },
  { v: "selfcare", l: "Self-care", e: "🌱" }, { v: "social", l: "Social life", e: "🎉" },
];
const FIXED_OPTS: Opt<Answers["fixed"]>[] = [
  { v: "school", l: "School hours (8 AM–3 PM)", e: "🏫" }, { v: "work", l: "Work 9–5", e: "💼" },
  { v: "shift", l: "Shift work", e: "🔄" }, { v: "flexible", l: "Pretty flexible", e: "🌈" },
];
const WAKE_OPTS: Opt<Answers["wake"]>[] = [{ v: 5, l: "5–6" }, { v: 6, l: "6–7" }, { v: 7, l: "7–8" }, { v: 8, l: "8–9" }, { v: 9, l: "9+" }];
const SLEEP_OPTS: Opt<Answers["sleep"]>[] = [{ v: 21, l: "9 PM" }, { v: 22, l: "10 PM" }, { v: 23, l: "11 PM" }, { v: 24, l: "Midnight+" }];

const card = "pop pop-hover flex h-auto min-h-20 items-center justify-start gap-4 whitespace-normal rounded-2xl p-5 text-left text-lg font-extrabold transition-transform duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring";
const chip = "pop pop-hover h-auto min-h-11 rounded-full px-5 py-2 font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring";
const on = (sel: boolean) => (sel ? "scale-[1.03] bg-primary text-primary-foreground hover:bg-primary" : "bg-card");

function Quiz() {
  const [ans, setAns] = useState<Draft>({});
  const [step, setStep] = useState<StepId>("whose");
  const [done, setDone] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [picking, setPicking] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const steps = visibleSteps(ans);
  const idx = Math.max(0, steps.indexOf(step));
  const number = questionNumber(step);
  const answered = MAIN_STEPS_ANSWERED(ans);

  // Restore saved progress after hydration.
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(PROGRESS_KEY) ?? "null");
      if (saved && typeof saved === "object") { setAns(saved.ans ?? {}); setStep(saved.step ?? "whose"); setDone(!!saved.done); }
    } catch { /* ignore corrupt progress */ }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) window.localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ans, step, done }));
  }, [ans, step, done, loaded]);

  useEffect(() => { document.title = done ? "Your Custom Schedule — Juggle" : "Schedule Quiz — Juggle"; }, [done]);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    heading.current?.focus();
  }, [step, done]);

  const next = (draft: Draft = ans) => {
    const list = visibleSteps(draft);
    const i = list.indexOf(step);
    if (i >= list.length - 1) setDone(true); else setStep(list[i + 1]!);
  };
  const back = () => { if (idx > 0) setStep(steps[idx - 1]!); };
  const pick = (key: keyof Answers, v: string) => {
    if (picking) return;
    const draft = { ...ans, [key]: v } as Draft;
    if (key === "whose" && v !== "kids") delete draft.kidAge;
    setAns(draft);
    setPicking(true);
    window.setTimeout(() => { setPicking(false); next(draft); }, 300);
  };
  const restart = () => { setAns({}); setStep("whose"); setDone(false); window.localStorage.removeItem(PROGRESS_KEY); };

  const final = useMemo(() => (done ? withDefaults(ans) : null), [done, ans]);
  const preview = useMemo(() => buildDay(withDefaults(ans)), [ans]);
  const s = single[step];

  return (
    <main className="min-h-screen font-sans text-foreground">
      <header className="no-print mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-6">
        <Link to="/" className="font-display text-3xl font-bold">juggle<span className="text-primary">.</span></Link>
        <div className="flex items-center gap-4">{!done && <span className="font-extrabold" aria-live="polite">{number} / {QUESTION_COUNT}</span>}<AccountMenu /></div>
      </header>
      {done && final ? (
        <ScheduleEditor key={JSON.stringify(final)} initial={createSchedule(final)} onRestart={restart} reveal={<PersonalityReveal personality={getPersonality(final)} />} />
      ) : (
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section aria-labelledby="quiz-q">
            <div className="pop h-4 overflow-hidden rounded-full bg-card" role="progressbar" aria-label="Quiz progress" aria-valuenow={answered} aria-valuemin={0} aria-valuemax={QUESTION_COUNT}>
              <div className="h-full bg-sky transition-all duration-500" style={{ width: `${(answered / QUESTION_COUNT) * 100}%` }} />
            </div>
            <p className="mb-8 mt-3 font-extrabold text-muted-foreground">{progressCopy(answered)}</p>

            {s && (
              <>
                <h1 id="quiz-q" ref={heading} tabIndex={-1} className="mb-8 text-4xl font-bold outline-none md:text-5xl">{s.q}</h1>
                <div className="grid gap-4 sm:grid-cols-2">
                  {s.opts.map((o) => {
                    const sel = ans[s.key] === o.v;
                    return (
                      <Button variant="outline" key={o.v} aria-pressed={sel} onClick={() => pick(s.key, o.v)} className={`${card} ${on(sel)}`}>
                        <span className="text-3xl" aria-hidden="true">{o.e}</span>{o.l}
                      </Button>
                    );
                  })}
                </div>
              </>
            )}

            {step === "plate" && (
              <>
                <h1 id="quiz-q" ref={heading} tabIndex={-1} className="mb-2 text-4xl font-bold outline-none md:text-5xl">What's on your plate?</h1>
                <p className="mb-8 font-extrabold text-muted-foreground" aria-live="polite">Pick up to {MAX_PLATE} · {(ans.plate ?? []).length} picked</p>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {PLATE_OPTS.map((o) => {
                    const list = ans.plate ?? [];
                    const sel = list.includes(o.v);
                    const full = !sel && list.length >= MAX_PLATE;
                    return (
                      <Button variant="outline" key={o.v} aria-pressed={sel} disabled={full} onClick={() => setAns({ ...ans, plate: togglePlate(ans.plate, o.v) })}
                        className={`${card} min-h-16 flex-col items-start gap-1 p-4 text-base ${on(sel)}`}>
                        <span className="text-2xl" aria-hidden="true">{o.e}</span>{o.l}
                      </Button>
                    );
                  })}
                </div>
              </>
            )}

            {step === "fixed" && (
              <>
                <h1 id="quiz-q" ref={heading} tabIndex={-1} className="mb-8 text-4xl font-bold outline-none md:text-5xl">Anything set in stone?</h1>
                <div className="grid gap-4 sm:grid-cols-2">
                  {FIXED_OPTS.map((o) => {
                    const sel = ans.fixed === o.v;
                    return (
                      <Button variant="outline" key={o.v} aria-pressed={sel} aria-expanded={o.v === "shift" ? sel : undefined}
                        onClick={() => o.v === "shift" ? setAns({ ...ans, fixed: "shift", shiftStart: ans.shiftStart ?? 420, shiftEnd: ans.shiftEnd ?? 900 }) : pick("fixed", o.v)}
                        className={`${card} ${on(sel)}`}>
                        <span className="text-3xl" aria-hidden="true">{o.e}</span>{o.l}
                      </Button>
                    );
                  })}
                </div>
                {ans.fixed === "shift" && (
                  <div className="pop mt-6 grid gap-4 rounded-2xl bg-card p-5 sm:grid-cols-2">
                    <label className="grid gap-2 font-extrabold">Shift starts
                      <Input type="time" value={timeInput(ans.shiftStart ?? 420)} onChange={(e) => e.target.value && setAns({ ...ans, shiftStart: inputMinutes(e.target.value) })} />
                    </label>
                    <label className="grid gap-2 font-extrabold">Shift ends
                      <Input type="time" value={timeInput(ans.shiftEnd ?? 900)} onChange={(e) => e.target.value && setAns({ ...ans, shiftEnd: inputMinutes(e.target.value) })} />
                    </label>
                  </div>
                )}
              </>
            )}

            {step === "day" && (
              <>
                <h1 id="quiz-q" ref={heading} tabIndex={-1} className="mb-8 text-4xl font-bold outline-none md:text-5xl">Your day runs from…</h1>
                <fieldset className="mb-6"><legend className="mb-3 text-lg font-extrabold">⏰ Wake up</legend>
                  <div className="flex flex-wrap gap-3">{WAKE_OPTS.map((o) => <Button key={o.v} variant="outline" aria-pressed={ans.wake === o.v} onClick={() => setAns({ ...ans, wake: o.v })} className={`${chip} ${on(ans.wake === o.v)}`}>{o.l}</Button>)}</div>
                </fieldset>
                <fieldset><legend className="mb-3 text-lg font-extrabold">🌙 Lights out</legend>
                  <div className="flex flex-wrap gap-3">{SLEEP_OPTS.map((o) => <Button key={o.v} variant="outline" aria-pressed={ans.sleep === o.v} onClick={() => setAns({ ...ans, sleep: o.v })} className={`${chip} ${on(ans.sleep === o.v)}`}>{o.l}</Button>)}</div>
                </fieldset>
              </>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {idx > 0 && <Button variant="ghost" onClick={back} className="font-extrabold underline-offset-4 hover:underline">← Back</Button>}
              {(step === "plate" || step === "day" || (step === "fixed" && ans.fixed === "shift")) && (
                <Button onClick={() => next()} disabled={!isStepValid(step, ans)} className="pop pop-hover ml-auto h-auto rounded-2xl px-8 py-3 text-lg font-extrabold">Next →</Button>
              )}
            </div>
          </section>

          <aside className="hidden lg:block" aria-label="Live schedule preview">
            <div className="pop sticky top-6 rounded-3xl bg-card p-5">
              <p className="font-display text-lg font-bold">juggle.</p>
              <h2 className="mb-1 text-xl font-bold">Your day, so far</h2>
              <p className="mb-4 text-sm text-muted-foreground">Updates as you answer.</p>
              <ol className="theme-playful palette-pink grid max-h-[65vh] gap-1.5 overflow-y-auto pr-1" aria-live="polite">
                {preview.map((b) => (
                  <li key={`${b.start}-${b.label}`} className={`activity-row kind-${b.kind} grid grid-cols-[72px_1fr] gap-2 rounded-lg px-3 py-1.5 text-sm`}>
                    <span className="font-semibold">{fmt(b.start)}</span><span className="font-extrabold">{b.label}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

function MAIN_STEPS_ANSWERED(d: Draft) {
  let n = 0;
  if (d.whose && (d.whose !== "kids" || d.kidAge)) n++;
  if (d.plate?.length) n++;
  if (isStepValid("fixed", d)) n++;
  if (d.wake !== undefined && d.sleep !== undefined) n++;
  if (d.peak) n++;
  if (d.pace) n++;
  if (d.more) n++;
  return n;
}
