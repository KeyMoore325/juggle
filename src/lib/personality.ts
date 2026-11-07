import type { Answers } from "./schedule";

export interface Personality { name: string; why: string }

/** Maps quiz answers to one of the homepage template flavors (first matching rule wins). */
export function getPersonality(a: Answers): Personality {
  const week = a.span === "weekly";
  if (a.wake <= 6 && a.pace === "sprints")
    return { name: week ? "Early Bird Weekly" : "Early Bird Daily", why: "You rise early and love quick bursts, so we packed your mornings with 25-minute sprints and short breaks." };
  if ((a.wake >= 9 && a.pace === "deep") || (a.peak === "evening" && a.sleep >= 24))
    return { name: week ? "Night Owl Weekly" : "Night Owl Daily", why: "You start later and go deep, so we gave you a gentle late kickoff with long 90-minute focus blocks." };
  if (a.plate.includes("family") || a.whose === "family" || a.whose === "kids")
    return { name: "Family Week", why: "You're juggling a whole crew, so we left room for routines, meals and time together." };
  if (a.pace === "deep")
    return { name: "Deep Work Sprint", why: "You like long focus sessions, so we built in 90-minute deep work blocks with breaks in between." };
  return { name: "Balanced Blend", why: "You like a bit of everything, so we mixed focused work, rest and the things you love into an easy rhythm." };
}
