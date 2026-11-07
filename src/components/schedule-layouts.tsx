import { Lock } from "lucide-react";
import { DAYS, fmt, type Section } from "@/lib/schedule";
import { defaultPeople, type Activity, type Layout, type ScheduleDocument } from "@/lib/custom-schedule";

const EMOJI: [RegExp, string][] = [
  [/wake|slow morning/i, "🌅"], [/breakfast|lunch|dinner|snack|brunch/i, "🍽️"], [/teeth|pajama/i, "🪥"], [/dress/i, "👕"],
  [/bath/i, "🛁"], [/story|lights out|wind-down/i, "🌙"], [/nap|quiet|rest/i, "😴"], [/homework|study|learning/i, "📚"],
  [/screen/i, "📱"], [/workout|movement|outdoor/i, "🏃"], [/school|preschool|daycare/i, "🎒"], [/work|shift/i, "💼"],
  [/play|hobby|creative/i, "🎨"], [/family|friends|people|social|outing/i, "💞"], [/chore|home|errand/i, "🧺"],
  [/self-care|journal/i, "🌱"], [/plan/i, "📝"], [/side project/i, "🚀"], [/break|transition/i, "☕"], [/flex/i, "✨"],
];
export const emojiFor = (label: string) => /^\p{Extended_Pictographic}/u.test(label) ? null : EMOJI.find(([re]) => re.test(label))?.[1] ?? "⭐";

const sectionOf = (b: Activity, i: number, all: Activity[]): Section | string =>
  b.section ?? (i >= all.length - 2 ? "Bedtime" : b.start < 720 ? "Morning" : b.start < 1020 ? "Afternoon" : "Evening");

function groupSections(blocks: Activity[]) {
  const groups: { name: string; items: Activity[] }[] = [];
  blocks.forEach((b, i) => {
    const name = sectionOf(b, i, blocks);
    if (groups.at(-1)?.name === name) groups.at(-1)!.items.push(b); else groups.push({ name, items: [b] });
  });
  return groups;
}

/** Font size shrinks with the number of rows so every layout prints on one Letter/A4 page. */
function fit(rows: number, base: number, capacity: number) {
  return `${Math.max(base * 0.55, Math.min(base, (base * capacity) / Math.max(rows, 1))).toFixed(2)}pt`;
}

const Check = () => <span aria-hidden="true" className="inline-block size-[1.1em] shrink-0 rounded-sm border-2 border-current" />;

export function LayoutSheet({ doc, day, layout, print = false }: { doc: ScheduleDocument; day: string; layout: Layout; print?: boolean }) {
  const blocks = doc.days[day] ?? [];
  const label = doc.span === "weekly" ? day : "Today";
  const header = (
    <header className="sheet-header">
      <p className="font-display text-sm font-bold">juggle.</p>
      <h2 className="break-words text-[1.6em] font-bold leading-tight">{doc.title || "My Juggle Schedule"}</h2>
      <p className="font-semibold">{doc.name ? `${doc.name}'s ${layout === "weekly" ? "week" : label}` : layout === "weekly" ? "This week" : label}</p>
    </header>
  );

  if (layout === "weekly") {
    const keys = doc.span === "weekly" ? DAYS : ["Today"];
    const max = Math.max(...keys.map((k) => doc.days[k]?.length ?? 0));
    return <div className="print-sheet layout-weekly" style={print ? { fontSize: fit(max, 8.5, 16) } : undefined}>
      {print && <style>{"@media print { @page { size: landscape; margin: 10mm; } }"}</style>}
      {header}
      <div className={print ? "" : "overflow-x-auto"}>
        <div className={`grid gap-1 ${print ? "" : "min-w-[760px]"}`} style={{ gridTemplateColumns: `repeat(${keys.length}, minmax(0, 1fr))` }}>
          {keys.map((k) => <section key={k} className="min-w-0">
            <h3 className="mb-1 rounded bg-foreground/10 px-1 py-0.5 text-center font-bold">{k}</h3>
            <ol className="grid gap-0.5">{(doc.days[k] ?? []).map((b) => <li key={b.id} className={`activity-row kind-${b.kind} rounded px-1 py-0.5 leading-tight`}>
              <span className="block text-[0.8em] opacity-80">{fmt(b.start)}</span><span className="font-semibold">{b.label}</span>
            </li>)}</ol>
          </section>)}
        </div>
      </div>
    </div>;
  }

  if (layout === "kids") {
    const kidBlocks = blocks.filter((b) => b.label !== "Transition");
    return <div className="print-sheet layout-kids" style={print ? { fontSize: fit(kidBlocks.length + groupSections(kidBlocks).length, 14, 22) } : undefined}>
      {header}
      {groupSections(kidBlocks).map((g, gi) => <section key={`${g.name}-${gi}`} className="mt-[0.6em]">
        <h3 className="mb-[0.3em] text-[1.2em] font-bold">{g.name}</h3>
        <ul className="grid gap-[0.3em]">{g.items.map((b) => <li key={b.id} className={`activity-row kind-${b.kind} flex items-center gap-[0.6em] rounded-lg px-[0.6em] py-[0.25em]`}>
          <span aria-hidden="true" className="text-[1.6em] leading-none">{emojiFor(b.label)}</span>
          <span className="flex-1 font-bold">{b.label}</span><Check />
        </li>)}</ul>
      </section>)}
    </div>;
  }

  if (layout === "minimal") {
    return <div className="print-sheet layout-minimal ink" style={print ? { fontSize: fit(blocks.length, 11, 34) } : undefined}>
      {header}
      <ol className="mt-[0.6em]">{blocks.map((b) => <li key={b.id} className="flex gap-[1em] border-b border-current/30 py-[0.25em]">
        <span className="w-[9em] shrink-0 tabular-nums">{fmt(b.start)} – {fmt(b.end)}</span><span className="flex-1">{b.label}</span><Check />
      </li>)}</ol>
    </div>;
  }

  if (layout === "family") {
    const people = (doc.people?.length ? doc.people : defaultPeople(doc)).filter(Boolean);
    return <div className="print-sheet layout-family" style={print ? { fontSize: fit(blocks.length, 10, 30) } : undefined}>
      {header}
      <div className={print ? "" : "overflow-x-auto"}>
        <table className="mt-[0.6em] w-full border-collapse text-left">
          <thead><tr><th className="p-[0.3em]">Time</th><th className="p-[0.3em]">Activity</th>{people.map((p, i) => <th key={i} className="p-[0.3em] text-center">{p}</th>)}</tr></thead>
          <tbody>{blocks.map((b) => <tr key={b.id} className={`activity-row kind-${b.kind}`}>
            <td className="whitespace-nowrap p-[0.3em]">{fmt(b.start)}</td><td className="p-[0.3em] font-semibold">{b.label}</td>
            {people.map((_, i) => <td key={i} className="p-[0.3em] text-center"><Check /></td>)}
          </tr>)}</tbody>
        </table>
      </div>
    </div>;
  }

  return <div className="print-sheet layout-timeblock" style={print ? { fontSize: fit(blocks.length, 11, 30) } : undefined}>
    {header}
    <ol className="mt-[0.6em] grid gap-[0.2em]">{blocks.map((b) => <li key={b.id} className={`activity-row kind-${b.kind} flex gap-[1em] rounded px-[0.6em] py-[0.2em]`}>
      <span className="w-[9em] shrink-0 tabular-nums">{fmt(b.start)} – {fmt(b.end)}</span>
      <span className="flex-1 font-semibold">{b.label}</span>{b.locked && <Lock aria-label="Fixed" className="size-[1em]" />}
    </li>)}</ol>
  </div>;
}
