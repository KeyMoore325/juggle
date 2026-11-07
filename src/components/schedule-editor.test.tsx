import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSchedule } from "@/lib/custom-schedule";
import { ScheduleEditor } from "./schedule-editor";

vi.mock("./auth-provider", () => ({ useAccountAuth: () => ({ user: null }) }));
vi.mock("./auth-dialog", () => ({ AuthDialog: ({ open }: { open: boolean }) => open ? <div role="dialog" /> : null }));
vi.mock("@tanstack/react-start", () => ({ useServerFn: () => vi.fn() }));
vi.mock("@/lib/account.functions", () => ({ saveSchedule: vi.fn() }));
vi.mock("@/lib/account-query", () => ({ accountQuery: () => ({ queryKey: ["account"], queryFn: async () => null }) }));

afterEach(cleanup);

function renderGuestEditor() {
  const initial = createSchedule({ whose: "me", plate: ["work"], fixed: "flexible", wake: 8, sleep: 22, peak: "morning", pace: "sprints", more: "rest", span: "weekly" });
  render(<QueryClientProvider client={new QueryClient()}><ScheduleEditor initial={initial} /></QueryClientProvider>);
  return initial;
}

describe("free schedule customization", () => {
  it("lets a guest enter their name without requiring an account", () => {
    renderGuestEditor();
    fireEvent.change(screen.getByRole("textbox", { name: "Your name" }), { target: { value: "Key Moore" } });
    expect(screen.getByRole("textbox", { name: "Your name" })).toHaveValue("Key Moore");
    expect(screen.getByText("Key Moore's week")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("lets a guest rename a task without changing its times or other weekdays", () => {
    const initial = renderGuestEditor();
    fireEvent.change(screen.getByRole("textbox", { name: "Activity 1 name" }), { target: { value: "Pack lunches" } });
    expect(screen.getByRole("textbox", { name: "Activity 1 name" })).toHaveValue("Pack lunches");
    const monday = document.querySelector(".print-only");
    expect(monday?.textContent).toContain("Pack lunches");
    expect(monday?.textContent).toContain("8:00 AM – 8:30 AM");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tue" }));
    expect(screen.getByRole("textbox", { name: "Activity 1 name" })).toHaveValue(initial.days["Tue"]?.[0]?.label);
    fireEvent.click(screen.getByRole("button", { name: "Mon" }));
    expect(screen.getByRole("textbox", { name: "Activity 1 name" })).toHaveValue("Pack lunches");
  });

  it("still requires an account for saving and full editing", () => {
    renderGuestEditor();
    expect(screen.queryByLabelText("Activity 1 start")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add activity" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save schedule" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});