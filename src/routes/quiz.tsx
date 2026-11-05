import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { type Answers } from "@/lib/schedule";
import { createSchedule } from "@/lib/custom-schedule";
import { ScheduleEditor } from "@/components/schedule-editor";
import { AccountMenu } from "@/components/account-menu";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Schedule Quiz — Juggle" },
      { name: "description", content: "Answer 6 questions to generate your custom printable schedule template." },
      { property: "og:title", content: "Take the Juggle Schedule Quiz" },
      { property: "og:description", content: "Five questions to a schedule that fits your life." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Quiz,
});

type Q = { key: keyof Answers; q: string; opts: { v: Answers[keyof Answers]; l: string; e: string }[] };

const QS: Q[] = [
  { key: "whose", q: "Whose schedule is it?", opts: [
    { v: "me", l: "Me", e: "🙋" }, { v: "kids", l: "My kids", e: "🧒" },
    { v: "spouse", l: "My spouse", e: "💞" }, { v: "family", l: "My family", e: "🏡" } ] },
  { key: "focus", q: "What are you juggling most?", opts: [
    { v: "school", l: "School", e: "🎒" }, { v: "work", l: "Work", e: "💼" },
    { v: "family", l: "Family", e: "🏡" }, { v: "selfcare", l: "Me-time", e: "🌱" } ] },
  { key: "span", q: "Plan a day or a whole week?", opts: [
    { v: "daily", l: "Just today", e: "☀️" }, { v: "weekly", l: "Full week", e: "📅" } ] },
  { key: "start", q: "When does your day kick off?", opts: [
    { v: 6, l: "6 AM — early bird", e: "🐦" }, { v: 8, l: "8 AM — right on time", e: "⏰" }, { v: 10, l: "10 AM — night owl", e: "🦉" } ] },
  { key: "priorities", q: "How many big things per day?", opts: [
    { v: 2, l: "Two", e: "✌️" }, { v: 3, l: "Three", e: "🤹" }, { v: 4, l: "Four", e: "🚀" } ] },
  { key: "pace", q: "How do you like to focus?", opts: [
    { v: "sprints", l: "Short sprints", e: "⚡" }, { v: "deep", l: "Long deep dives", e: "🌊" } ] },
];

function Quiz() {
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState<Partial<Answers>>({});
  const done = step >= QS.length;
  const question = QS[step];

  const choose = (k: keyof Answers, v: Answers[keyof Answers]) => {
    setAns((a) => ({ ...a, [k]: v }));
    setStep((s) => s + 1);
  };

  return (
    <main className="min-h-screen font-sans text-foreground">
      <header className="no-print mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-6">
        <Link to="/" className="font-display text-3xl font-bold">juggle<span className="text-primary">.</span></Link>
        <div className="flex items-center gap-4">{!done && <span className="font-extrabold" aria-live="polite">{step + 1} / {QS.length}</span>}<AccountMenu /></div>
      </header>
      {done ? <ScheduleEditor initial={createSchedule(ans as Answers)} onRestart={() => { setAns({}); setStep(0); }} /> : question ? (
        <section className="mx-auto max-w-2xl px-5 py-10">
          <div className="pop mb-10 h-4 overflow-hidden rounded-full bg-card" role="progressbar" aria-valuenow={step} aria-valuemax={QS.length}>
            <div className="h-full bg-sky transition-all duration-500" style={{ width: `${(step / QS.length) * 100}%` }} />
          </div>
          <h1 className="mb-8 text-4xl font-bold md:text-5xl">{question.q}</h1>
          <div className="grid gap-4 sm:grid-cols-2">
            {question.opts.map((o) => (
              <Button variant="outline" key={String(o.v)} onClick={() => choose(question.key, o.v)}
                className="pop pop-hover flex h-auto min-h-20 items-center justify-start gap-4 whitespace-normal rounded-2xl bg-card p-5 text-left text-lg font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring">
                <span className="text-3xl" aria-hidden="true">{o.e}</span>{o.l}
              </Button>
            ))}
          </div>
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)} className="mt-8 font-extrabold underline-offset-4 hover:underline">← Back</Button>
          )}
        </section>
      ) : null}
    </main>
  );
}

