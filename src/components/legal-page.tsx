import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ArrowUp, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalLinks } from "@/components/legal-links";
import { legalContactEmail, type PolicySection } from "@/lib/legal-content";

type LegalPageProps = {
  title: string;
  intro: string;
  sections: PolicySection[];
  lastUpdated?: string;
  tldr?: string;
};

export function LegalPage({ title, intro, sections, lastUpdated, tldr }: LegalPageProps) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen font-sans text-foreground">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6">
        <Button asChild variant="link" className="h-auto p-0 font-display text-3xl font-bold text-foreground hover:no-underline">
          <Link to="/" aria-label="Juggle home">juggle<span className="text-primary">.</span></Link>
        </Button>
        <Button asChild className="pop pop-hover h-auto rounded-full bg-sun px-5 py-2 font-extrabold text-foreground hover:bg-sun/90 motion-reduce:transform-none motion-reduce:transition-none">
          <Link to="/quiz">Start the Quiz <ArrowRight aria-hidden="true" /></Link>
        </Button>
      </header>

      <main id="main-content" className="mx-auto max-w-6xl px-5 pb-16 pt-5 md:pt-10">
        <Button asChild variant="link" className="mb-6 h-auto px-0 font-extrabold text-foreground">
          <Link to="/"><ArrowLeft aria-hidden="true" /> Back to Juggle</Link>
        </Button>
        <p className="mb-3 font-extrabold text-muted-foreground">Juggle · Legal</p>
        <h1 className="break-words text-4xl font-bold leading-tight md:text-5xl">{title}</h1>
        {lastUpdated && <p className="mt-2 text-sm font-bold text-muted-foreground">Last updated: {lastUpdated}</p>}
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{intro}</p>

        {tldr && (
          <aside aria-label="In short" className="my-8 rounded-3xl border-2 border-foreground/10 bg-card p-5">
            <p className="font-extrabold">TL;DR</p>
            <p className="mt-1 max-w-2xl leading-relaxed text-muted-foreground">{tldr}</p>
          </aside>
        )}


        <div className="grid items-start gap-10 border-t-2 border-foreground/10 pt-8 md:grid-cols-[220px_minmax(0,1fr)] md:gap-14">
          <nav aria-label="On this page" className="md:sticky md:top-8">
            <h2 className="mb-4 text-xl font-bold">On this page</h2>
            <ol className="grid gap-3 text-sm font-bold">
              {sections.map((section) => (
                <li key={section.id}>
                  <Button asChild variant="link" className="h-auto justify-start whitespace-normal p-0 text-left font-bold leading-relaxed text-foreground">
                    <a href={`#${section.id}`}>{section.title}</a>
                  </Button>
                </li>
              ))}
              <li><Button asChild variant="link" className="h-auto p-0 font-bold text-foreground"><a href="#contact">Contact</a></Button></li>
            </ol>
          </nav>
          <article aria-label={title} className="min-w-0 max-w-3xl">
            {sections.map((section) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className="mb-9 scroll-mt-8">
                <h2 id={`${section.id}-heading`} className="mb-3 text-2xl font-bold">{section.title}</h2>
                {section.paragraphs?.map((paragraph) => <p key={paragraph} className="mt-3 leading-7 text-muted-foreground">{paragraph}</p>)}
                {section.items && <ul className="mt-4 list-disc space-y-3 pl-5 leading-7 text-muted-foreground">{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
                {section.afterItems?.map((item) => <p key={item} className="mt-3 leading-7 text-muted-foreground">{item}</p>)}
              </section>
            ))}
            <section id="contact" aria-labelledby="contact-heading" className="scroll-mt-8 border-t-2 border-foreground/10 pt-7">
              <h2 id="contact-heading" className="text-2xl font-bold">Contact</h2>
              <p className="mt-3 leading-7 text-muted-foreground">For privacy, cookie, or legal questions, contact us:</p>
              <Button asChild variant="link" className="mt-2 h-auto max-w-full whitespace-normal px-0 font-extrabold text-foreground">
                <a href={`mailto:${legalContactEmail}`}><Mail aria-hidden="true" /><span className="break-all">{legalContactEmail}</span></a>
              </Button>
            </section>
          </article>
        </div>
      </main>

      <footer className="border-t-4 border-foreground bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-7 md:flex-row">
          <p className="font-semibold text-muted-foreground">Juggle: plan less, live more.</p>
          <LegalLinks />
        </div>
      </footer>

      {showBackToTop && (
        <Button asChild className="pop pop-hover fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-sun p-0 font-extrabold text-foreground shadow-lg hover:bg-sun/90 motion-reduce:transform-none motion-reduce:transition-none">
          <a href="#main-content" aria-label="Back to top"><ArrowUp aria-hidden="true" /></a>
        </Button>
      )}
    </div>
  );
}
