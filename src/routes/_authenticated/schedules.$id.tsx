import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { accountQuery } from "@/lib/account-query";
import { scheduleSchema } from "@/lib/custom-schedule";
import { ScheduleEditor } from "@/components/schedule-editor";
import { AccountMenu } from "@/components/account-menu";
import { pageHead } from "@/lib/og-pages";
export const Route = createFileRoute("/_authenticated/schedules/$id")({
  head: ({ params }) => pageHead("schedule", `/schedules/${encodeURIComponent(params.id)}`),
  loader: ({ context }) => context.queryClient.ensureQueryData(accountQuery()), component: SavedSchedule,
});
function SavedSchedule() {
  const { id } = Route.useParams(); const { data } = useSuspenseQuery(accountQuery()); const row = data.schedules.find((s) => s.id === id); const doc = scheduleSchema.safeParse(row?.document);
  return <main className="min-h-screen"><header className="no-print mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-6"><Link to="/dashboard" className="font-display text-2xl font-bold">← My schedules</Link><AccountMenu /></header>
    {doc.success ? <ScheduleEditor key={id} initial={doc.data} savedId={id} /> : <div className="mx-auto max-w-6xl px-5 py-12"><h1 className="text-3xl font-bold">Schedule not found</h1><Link to="/dashboard" className="mt-4 inline-block underline">Back to my schedules</Link></div>}
  </main>;
}