import { DEFAULT_ANSWERS, MAX_PLATE, type Answers } from "./schedule";

export type StepId = "whose" | "kidAge" | "plate" | "fixed" | "day" | "peak" | "pace" | "more";
export type Draft = Partial<Answers>;

export const MAIN_STEPS: StepId[] = ["whose", "plate", "fixed", "day", "peak", "pace", "more"];
export const QUESTION_COUNT = MAIN_STEPS.length;
export const PROGRESS_KEY = "juggle-quiz-progress";

/** Steps the user will see, given their answers so far (age follow-up only for kids). */
export function visibleSteps(d: Draft): StepId[] {
  return d.whose === "kids" ? ["whose", "kidAge", ...MAIN_STEPS.slice(1)] : MAIN_STEPS;
}

/** 1-based question number; the age follow-up counts as part of question 1. */
export function questionNumber(step: StepId) {
  return step === "kidAge" ? 1 : MAIN_STEPS.indexOf(step) + 1;
}

export function isStepValid(step: StepId, d: Draft): boolean {
  switch (step) {
    case "whose": return !!d.whose;
    case "kidAge": return !!d.kidAge;
    case "plate": return !!d.plate && d.plate.length >= 1 && d.plate.length <= MAX_PLATE;
    case "fixed":
      if (d.fixed !== "shift") return !!d.fixed;
      return d.shiftStart !== undefined && d.shiftEnd !== undefined && d.shiftStart !== d.shiftEnd;
    case "day": return d.wake !== undefined && d.sleep !== undefined;
    case "peak": return !!d.peak;
    case "pace": return !!d.pace;
    case "more": return !!d.more;
  }
}

/** Toggle a plate item, never exceeding the max. */
export function togglePlate(current: Answers["plate"] | undefined, item: Answers["plate"][number]) {
  const list = current ?? [];
  if (list.includes(item)) return list.filter((p) => p !== item);
  return list.length >= MAX_PLATE ? list : [...list, item];
}

/** Fill gaps with defaults so a partial quiz can drive the live preview. */
export function withDefaults(d: Draft): Answers {
  return { ...DEFAULT_ANSWERS, ...Object.fromEntries(Object.entries(d).filter(([, v]) => v !== undefined)), plate: d.plate?.length ? d.plate : DEFAULT_ANSWERS.plate } as Answers;
}

const MICROCOPY = [
  "Let's get juggling! 🤹",
  "1 ball in the air… nice toss! 🎈",
  "2 balls in the air… you're a natural! ✨",
  "3 balls in the air… keep going! 🤹",
  "4 balls in the air… look at you go! 🚀",
  "5 balls in the air… almost a pro! 🎪",
  "6 balls in the air… one more catch! 🙌",
];
export const progressCopy = (answered: number) => MICROCOPY[Math.min(answered, MICROCOPY.length - 1)]!;
