import Link from 'next/link';
import { IconArrowRight, IconCheck, IconX } from '@/components/layout/icons';
import Logo from '@/components/layout/Logo';
import { DISCLAIMER } from '@/lib/options';
import { PRO_PRICE } from '@/lib/usage';

const SAMPLE = [
  { name: 'Productivity Solutions Grant', provider: 'Enterprise Singapore / IMDA', score: 91, eligible: true, note: 'Funds the inventory system you plan to adopt.' },
  { name: 'Market Readiness Assistance', provider: 'Enterprise Singapore', score: 84, eligible: true, note: 'Fits your plan to start selling in Malaysia.' },
  { name: 'Startup SG Tech', provider: 'Enterprise Singapore', score: 12, eligible: false, note: 'For companies under 5 years old. You have been running 8.' },
];

const STEPS = [
  {
    n: '01',
    title: 'Describe your business',
    body: 'Industry, size, how long you have been operating, who owns it and what you want to do next. Two minutes, no documents.',
  },
  {
    n: '02',
    title: 'See what you actually qualify for',
    body: 'Hard rules like local shareholding and SME size are checked first, then each match is scored on fit and explained in plain English.',
  },
  {
    n: '03',
    title: 'Draft the hard part',
    body: 'Turn your rough notes into the project justification, outcomes and implementation plan sections assessors expect, with gaps clearly flagged.',
  },
];

export default function Landing() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(55%_80%_at_70%_0%,#E3ECF6_0%,transparent_70%)]" />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/login" className="btn-ghost">
            Sign in
          </Link>
          <Link href="/signup" className="btn-primary">
            Get started
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto grid max-w-6xl gap-14 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-16">
        <div className="animate-rise">
          <p className="eyebrow text-primary">For Singapore SMEs and founders</p>
          <h1 className="mt-4 text-balance font-display text-[44px] font-semibold leading-[1.04] tracking-tight sm:text-[58px]">
            Find the grants you <span className="italic text-primary">actually</span> qualify for.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            EDG, PSG, MRA, Startup SG and a dozen more, each with its own rules and caps. GrantFinder checks your business against
            all of them, tells you straight which ones are a real fit, and helps you write the application.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="btn-primary px-5 py-3 text-[15px]">
              Match my business
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-sm text-muted">Free to start. No card needed.</span>
          </div>
        </div>

        <div className="relative animate-rise [animation-delay:120ms]">
          <div className="card p-5 shadow-lift">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div>
                <p className="eyebrow">Your matches</p>
                <p className="mt-1 font-display text-xl font-semibold">Tan &amp; Sons Trading</p>
              </div>
              <span className="chip">Retail · Growth</span>
            </div>
            <ul className="divide-y divide-hairline">
              {SAMPLE.map((g) => (
                <li key={g.name} className="flex items-start gap-4 py-4">
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl font-mono text-sm font-semibold tabular ${
                      g.eligible ? 'bg-eligible-soft text-eligible-ink' : 'bg-ineligible-soft text-ineligible-ink'
                    }`}
                  >
                    {g.score}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug">{g.name}</p>
                    <p className="text-xs text-faint">{g.provider}</p>
                    <p className="mt-1.5 flex items-start gap-1.5 text-sm text-muted">
                      {g.eligible ? (
                        <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-eligible" />
                      ) : (
                        <IconX className="mt-0.5 h-4 w-4 shrink-0 text-ineligible" />
                      )}
                      {g.note}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-hairline bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n}>
              <p className="font-mono text-sm text-primary">{s.n}</p>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">{s.title}</h2>
              <p className="mt-3 leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Honest by design</h2>
            <p className="mt-4 max-w-md leading-relaxed text-muted">
              A grant you cannot get is worse than no grant at all, because you lose weeks finding out. So we tell you early.
            </p>
          </div>
          <ul className="space-y-4">
            {[
              'Strict rules such as 30% local shareholding are checked before any AI scoring, and a fail is never smoothed over.',
              'Every grant links to the official agency page so you can verify the current criteria.',
              'Drafts never invent numbers. Anything you still need to provide is marked as a clear placeholder.',
              'We do not submit applications or promise approval. That happens on the official portals.',
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                  <IconCheck className="h-3.5 w-3.5" />
                </span>
                <span className="leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card p-7">
            <p className="eyebrow">Free</p>
            <p className="mt-2 font-display text-4xl font-semibold">S$0</p>
            <ul className="mt-6 space-y-2.5 text-[15px] text-muted">
              <li>Full grant catalogue and search</li>
              <li>Eligibility checklist for every grant</li>
              <li>Instant rule based matching, plus 3 AI match refreshes a month</li>
              <li>Track up to 3 applications and try 1 narrative draft</li>
            </ul>
          </div>
          <div className="card relative overflow-hidden border-primary/30 p-7">
            <div aria-hidden className="absolute right-0 top-0 h-32 w-32 rounded-bl-[64px] bg-primary-soft" />
            <p className="eyebrow relative text-primary">Pro</p>
            <p className="relative mt-2 font-display text-4xl font-semibold">
              {PRO_PRICE.split('/')[0]}
              <span className="text-lg font-normal text-muted">/month</span>
            </p>
            <ul className="relative mt-6 space-y-2.5 text-[15px] text-muted">
              <li>Narrative drafting for every application</li>
              <li>Unlimited application tracker</li>
              <li>Unlimited AI matching refreshes</li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-muted sm:px-8">
          <Logo />
          <p className="max-w-3xl text-xs leading-relaxed text-faint">{DISCLAIMER}</p>
        </div>
      </footer>
    </div>
  );
}
