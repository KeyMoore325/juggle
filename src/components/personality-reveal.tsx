import type { Personality } from "@/lib/personality";

const PIECES = Array.from({ length: 28 }, (_, i) => i);
const TONES = ["bg-primary", "bg-sky", "bg-sun"];

export function PersonalityReveal({ personality }: { personality: Personality }) {
  return (
    <div className="no-print relative mb-6 overflow-hidden rounded-3xl bg-card p-5 pop md:p-6">
      <div className="confetti pointer-events-none absolute inset-0" aria-hidden="true">
        {PIECES.map((i) => (
          <span key={i} className={`confetti-piece ${TONES[i % 3]}`}
            style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 7) * 0.08}s`, transform: `rotate(${i * 29}deg)` }} />
        ))}
      </div>
      <p className="relative text-2xl font-bold md:text-3xl" role="status">
        You're a{/^[AEIOU]/.test(personality.name) ? "n" : ""}{" "}
        <span className="inline-block rounded-full bg-primary px-4 py-1 text-primary-foreground">✨ {personality.name} ✨</span>
      </p>
      <p className="relative mt-3 font-semibold text-muted-foreground">{personality.why}</p>
    </div>
  );
}
