import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LegalLinks } from "@/components/legal-links";
import { AccountMenu } from "@/components/account-menu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Juggle — Life's a lot. Let's juggle it together." },
      { name: "description", content: "Answer 6 fun questions and get a custom schedule template you can print or download. Free, takes about 60 seconds, no sign-up needed." },
      { property: "og:title", content: "Juggle — Life's a lot. Let's juggle it together." },
      { property: "og:description", content: "A 6-question quiz that builds a custom schedule template for your life. Print or download it free." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://juggle-schedulebuilder.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://juggle-schedulebuilder.lovable.app/" }],
  }),
  component: Index,
});

const quizQuestions = [
  "Whose schedule is it?",
  "What are you juggling most?",
  "Plan a day or a whole week?",
  "When does your day kick off?",
  "How many big things per day?",
  "How do you like to focus?",
];

const personas = [
  { icon: "🎒", name: "Students", blurb: "Classes, homework and study sessions that actually fit between lectures." },
  { icon: "🏡", name: "Busy Parents", blurb: "School runs, errands and family time — all in one calm plan." },
  { icon: "💻", name: "Freelancers", blurb: "Deep work blocks and client calls without the chaos." },
  { icon: "🌱", name: "Wellness Seekers", blurb: "Movement, journaling and rest baked into every day." },
  { icon: "🚀", name: "Side Hustlers", blurb: "Carve out focused hours for the thing you're building." },
];

const templates = [
  { name: "Early Bird Daily", desc: "6 AM start, short sprints", colors: ["bg-primary", "bg-sky", "bg-sun"] },
  { name: "Night Owl Weekly", desc: "10 AM start, deep dives", colors: ["bg-sky", "bg-primary", "bg-muted"] },
  { name: "Family Week", desc: "School runs & family time", colors: ["bg-sun", "bg-sky", "bg-primary"] },
  { name: "Deep Work Sprint", desc: "90-min focus blocks", colors: ["bg-primary", "bg-muted", "bg-sky"] },
  { name: "Balanced Blend", desc: "Work, rest and me-time", colors: ["bg-sky", "bg-sun", "bg-primary"] },
];

const features = [
  { icon: "📱", title: "Fully responsive", desc: "Looks great on your phone, tablet and desktop." },
  { icon: "👤", title: "User profiles", desc: "Save your schedules and pick up where you left off." },
  { icon: "⚡", title: "Real-time updates", desc: "Your schedule updates instantly as you answer." },
  { icon: "🔔", title: "Notifications", desc: "Gentle nudges so you never drop a ball." },
  { icon: "🖨️", title: "Print-perfect", desc: "Clean, colorful printouts and CSV downloads." },
  { icon: "♿", title: "Accessible", desc: "Keyboard-friendly, screen-reader ready, high contrast." },
];

const benefits = [
  { icon: "⏱️", title: "60 seconds", text: "From zero to a full schedule faster than making coffee." },
  { icon: "🎨", title: "Made for you", text: "Built from your answers, not a one-size-fits-all template." },
  { icon: "🖨️", title: "Fridge-ready", text: "Print it, download it, or save it to your profile." },
]

const faqs = [
  { q: "Is Juggle really free?", a: "Yes! The quiz and your custom schedule template are completely free — print or download as many as you like." },
  { q: "Do I need to create an account?", a: "You can take the quiz, personalize your name, schedule title, task names, time frame, colors and theme, and print or download without an account. A free account unlocks individual activity times, adding or rearranging activities, different weekday plans and saved schedules." },
  { q: "What do I get at the end?", a: "A custom daily or weekly schedule template built from your answers, ready to print or download as a CSV for your spreadsheet app." },
  { q: "Can I retake the quiz?", a: "Absolutely — retake it as many times as you want. Different answers, different schedule." },
  { q: "Does it work on my phone?", a: "Yes, Juggle is fully responsive and works beautifully on phones, tablets and desktops." },
];

const shapes = [
  { c: "bg-primary", d: "0s", size: "h-24 w-24", rounded: "rounded-full" },
  { c: "bg-sky", d: ".4s", size: "h-20 w-20", rounded: "rounded-3xl rotate-12" },
  { c: "bg-sun", d: ".8s", size: "h-24 w-24", rounded: "rounded-full" },
];

function Index() {
  return (
    <main className="min-h-screen font-sans text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <span className="font-display text-3xl font-bold">juggle<span className="text-primary">.</span></span>
        <div className="flex flex-wrap items-center gap-3"><AccountMenu /><Link to="/quiz" className="pop pop-hover rounded-full bg-sun px-5 py-2 font-extrabold">Start the Quiz</Link></div>
      </header>

      {/* 1. Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-12 md:grid-cols-2 md:py-20">
        <div>
          <p className="mb-4 inline-block -rotate-2 rounded-full bg-sky px-4 py-1 font-extrabold">6 questions · 1 minute</p>
          <h1 className="text-5xl font-bold leading-tight md:text-7xl">
            Life's a lot. Let's <span className="text-primary">juggle</span> it together.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Answer 6 quick questions and get a custom schedule template made for your life — ready to print or download.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/quiz" className="pop pop-hover rounded-2xl bg-primary px-8 py-4 text-xl font-extrabold">
              Start the Quiz →
            </Link>
            <a href="#templates" className="pop pop-hover rounded-2xl bg-card px-8 py-4 text-xl font-extrabold">
              See Example Templates
            </a>
          </div>
          <p className="mt-5 text-sm font-semibold text-muted-foreground">Free · Takes about 60 seconds · No sign-up needed to start</p>
        </div>
        <div className="relative mx-auto flex h-72 w-full max-w-sm items-end justify-center gap-6" aria-hidden="true">
          {shapes.map((b) => (
            <div key={b.d} className={`pop ${b.size} ${b.rounded} ${b.c} animate-bounce`} style={{ animationDelay: b.d }} />
          ))}
          <div className="pop animate-wobble absolute -top-2 right-4 h-12 w-12 rounded-full bg-sun" />
          <div className="pop animate-wobble absolute left-2 top-8 h-10 w-10 rounded-2xl bg-primary" style={{ animationDelay: "1.2s" }} />
        </div>
      </section>

      {/* 2. How it works */}
      <section className="mx-auto max-w-6xl px-5 pb-20" aria-labelledby="how">
        <h2 id="how" className="mb-8 text-3xl font-bold md:text-4xl">How it works</h2>
        <ol className="grid gap-6 md:grid-cols-3">
          {[
            ["Take the quiz", "Six quick, fun questions about how your days roll.", "bg-primary"],
            ["We work the magic", "Juggle builds a schedule template tailored to your rhythm.", "bg-sky"],
            ["Download or print", "Stick it on the fridge or open it in your spreadsheet.", "bg-sun"],
          ].map(([t, d, c], i) => (
            <li key={t} className="pop rounded-3xl bg-card p-6">
              <span className={`pop mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ${c} font-display text-xl font-bold`}>{i + 1}</span>
              <h3 className="text-2xl font-bold">{t}</h3>
              <p className="mt-2 text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 3. Quiz preview */}
      <section className="mx-auto max-w-6xl px-5 pb-20" aria-labelledby="preview">
        <h2 id="preview" className="mb-3 text-3xl font-bold md:text-4xl">A peek at the quiz</h2>
        <p className="mb-8 max-w-lg text-muted-foreground">Here's what we'll ask — no trick questions, we promise.</p>
        <ul className="flex flex-wrap gap-4">
          {quizQuestions.map((q, i) => (
            <li key={q} className={`pop rounded-full px-5 py-3 font-extrabold ${["bg-primary", "bg-sky", "bg-sun", "bg-card", "bg-muted", "bg-sky"][i]}`}>
              {q}
            </li>
          ))}
        </ul>
        <Link to="/quiz" className="pop pop-hover mt-8 inline-block rounded-2xl bg-primary px-8 py-4 text-xl font-extrabold">
          I'm ready, let's go! →
        </Link>
      </section>

      {/* 4. Who Juggle is for */}
      <section className="mx-auto max-w-6xl px-5 pb-20" aria-labelledby="who">
        <h2 id="who" className="mb-8 text-3xl font-bold md:text-4xl">Who Juggle is for</h2>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {personas.map((p) => (
            <li key={p.name} className="pop rounded-3xl bg-card p-6 transition-transform duration-200 hover:-translate-y-2">
              <span className="text-4xl" aria-hidden="true">{p.icon}</span>
              <h3 className="mt-3 text-xl font-bold">{p.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. Template styles showcase */}
      <section id="templates" className="mx-auto max-w-6xl scroll-mt-8 px-5 pb-20" aria-labelledby="templates-h">
        <h2 id="templates-h" className="mb-3 text-3xl font-bold md:text-4xl">Example templates</h2>
        <p className="mb-8 max-w-lg text-muted-foreground">Every schedule is unique — here are a few flavors yours could take.</p>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {templates.map((t) => (
            <li key={t.name} className="pop rounded-3xl bg-card p-5 transition-transform duration-200 hover:-translate-y-2">
              <div className="mb-4 grid gap-2" aria-hidden="true">
                {t.colors.map((c, i) => (
                  <div key={i} className={`h-6 rounded-lg ${c}`} style={{ width: `${100 - i * 18}%` }} />
                ))}
              </div>
              <h3 className="text-lg font-bold">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 6. Features grid */}
      <section className="mx-auto max-w-6xl px-5 pb-20" aria-labelledby="features">
        <h2 id="features" className="mb-8 text-3xl font-bold md:text-4xl">Packed with good stuff</h2>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <li key={f.title} className="pop rounded-3xl bg-card p-6">
              <span className="text-3xl" aria-hidden="true">{f.icon}</span>
              <h3 className="mt-3 text-xl font-bold">{f.title}</h3>
              <p className="mt-2 text-muted-foreground">{f.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 7. Benefits */}
      <Benefits />

      {/* 8. FAQ accordion */}
      <section className="mx-auto max-w-3xl px-5 pb-20" aria-labelledby="faq">
        <h2 id="faq" className="mb-8 text-3xl font-bold md:text-4xl">Questions? Answers.</h2>
        <div className="grid gap-4">
          {faqs.map((f) => (
            <details key={f.q} className="pop group rounded-2xl bg-card p-5 open:bg-muted">
              <summary className="cursor-pointer list-none text-lg font-extrabold marker:hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring">
                <span className="mr-2 inline-block transition-transform group-open:rotate-90" aria-hidden="true">▸</span>
                {f.q}
              </summary>
              <p className="mt-3 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 9. Final CTA banner */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="pop rounded-3xl bg-gradient-to-r from-primary to-sky p-10 text-center md:p-16">
          <h2 className="text-4xl font-bold md:text-5xl">Ready to stop dropping balls?</h2>
          <p className="mx-auto mt-4 max-w-md text-lg font-semibold">One minute from now, you could have a schedule that actually fits your life.</p>
          <Link to="/quiz" className="pop pop-hover mt-8 inline-block rounded-2xl bg-card px-10 py-4 text-xl font-extrabold">
            Build My Schedule →
          </Link>
        </div>
      </section>

      {/* 10. Footer */}
      <Footer />
    </main>
  );
}

function Benefits() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % benefits.length), 5000);
    return () => clearInterval(id);
  }, []);
  const card = (b: (typeof benefits)[number]) => (
    <div className="pop h-full rounded-3xl bg-card p-8">
      <p className="text-4xl" aria-hidden="true">{b.icon}</p>
      <h3 className="mt-3 text-2xl font-bold">{b.title}</h3>
      <p className="mt-2 text-lg font-semibold leading-relaxed text-muted-foreground">{b.text}</p>
    </div>
  );
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20" aria-labelledby="benefits">
      <h2 id="benefits" className="mb-8 text-3xl font-bold md:text-4xl">Why people love planning with Juggle</h2>
      <div className="hidden gap-6 md:grid md:grid-cols-3">{benefits.map((b) => <div key={b.title}>{card(b)}</div>)}</div>
      <div className="md:hidden">
        <div aria-live="polite">{card(benefits[i]!)}</div>
        <div className="mt-5 flex items-center justify-center gap-3">
          {benefits.map((b, n) => (
            <button key={n} onClick={() => setI(n)} aria-label={`Show ${b.title}`} aria-pressed={n === i}
              className={`pop h-4 w-4 rounded-full transition-colors ${n === i ? "bg-primary" : "bg-card"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <footer className="border-t-4 border-foreground bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-3">
        <div>
          <span className="font-display text-3xl font-bold">juggle<span className="text-primary">.</span></span>
          <p className="mt-3 font-semibold text-muted-foreground">Juggle: plan less, live more.</p>
        </div>
        <nav aria-label="Footer">
          <h2 className="mb-3 font-display text-lg font-bold">Explore</h2>
          <ul className="grid gap-2 font-semibold">
            <li><Link to="/" className="underline-offset-4 hover:underline">Home</Link></li>
            <li><Link to="/quiz" className="underline-offset-4 hover:underline">Take the quiz</Link></li>
            <li><a href="#templates" className="underline-offset-4 hover:underline">Example templates</a></li>
          </ul>
        </nav>
        <div>
          <h2 className="mb-3 font-display text-lg font-bold">Get juggling tips</h2>
          {sent ? (
            <p className="pop inline-block rounded-2xl bg-sun px-4 py-3 font-extrabold">You're in! 🎉</p>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); if (email.trim()) setSent(true); }}
              className="flex flex-wrap gap-3"
            >
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pop min-w-0 flex-1 rounded-2xl bg-background px-4 py-3 font-semibold placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring"
              />
              <button type="submit" className="pop pop-hover rounded-2xl bg-primary px-5 py-3 font-extrabold">Join</button>
            </form>
          )}
        </div>
      </div>
      <div className="border-t-2 border-foreground/10 px-5 py-4 text-center">
        <LegalLinks />
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          © {new Date().getFullYear()} Juggle. Made with 🤹 and good intentions.
        </p>
      </div>
    </footer>
  );
}
