# GrantFinder

Singapore has dozens of government grants for small businesses and founders: EDG, PSG, MRA, Startup SG and more. Each one has its own eligibility rules, funding caps and paperwork, and most owners have no idea which ones they actually qualify for.

GrantFinder fixes that. You describe your business once, it checks you against every scheme it tracks, tells you plainly which ones are a real fit and which are ruled out (and why), and then helps you write the narrative sections most applications ask for.

## What it does

- **Business profile.** Industry, stage, size, years operating, local shareholding and what you plan to do next.
- **Matching.** A fixed rules engine checks hard requirements first (30% local shareholding, SME size, company age, industry, stage). Claude then scores the remaining grants on fit and explains each score in plain English. A failed rule always wins over the AI.
- **Grant catalogue.** Search and filter every scheme, each with a plain English summary, what it pays for, what assessors look for and a link to the official page.
- **Eligibility checklist.** Per grant, each condition is shown as met, not met, or "check this yourself".
- **Funding potential.** A dashboard chart of fixed dollar caps across likely eligible grants, with percentage based schemes listed separately instead of being given made up numbers.
- **Application tracker.** A simple board from Considering through to Approved, with amounts, target dates and notes.
- **Narrative drafter.** Claude drafts the project justification, expected outcomes and implementation plan from your notes. It never invents figures; anything missing becomes a highlighted `[FILL IN: ...]` placeholder and a checklist item.

GrantFinder does not submit applications and never promises approval. That happens on the official portals.

## Stack

Next.js 14 (App Router, TypeScript strict), Supabase (Postgres with RLS, Google OAuth), Claude API, Recharts, Tailwind CSS. Deploys to Vercel.

## Running it locally

1. Install dependencies

   ```bash
   npm install
   ```

2. Create a Supabase project, enable the Google provider under Authentication, and add `http://localhost:3000/auth/callback` to the redirect URLs.

3. Run both migrations in the SQL editor, in order:

   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_grants.sql`

4. Copy `.env.example` to `.env.local` and fill it in

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ANTHROPIC_API_KEY=
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. Start it

   ```bash
   npm run dev
   ```

Matching still works without an Anthropic key. It falls back to the rules engine and says so in the UI.

## Plans

| | Free | Pro (S$25/month) |
|---|---|---|
| Grant search and eligibility checklists | Yes | Yes |
| Rules based matching | Unlimited | Unlimited |
| AI match refreshes | 3 a month | Unlimited (fair use) |
| Open applications in the tracker | 3 | Unlimited |
| Narrative drafts | 1 a month to try it | Every application |

Plans live in the `subscriptions` table and only the service role can write to it. Stripe checkout is not wired up yet. To make an account Pro for testing:

```sql
insert into subscriptions (user_id, tier) values ('<user uuid>', 'pro')
on conflict (user_id) do update set tier = 'pro';
```

## Project layout

```
app/
  (auth)/login, signup         Google sign in
  (app)/dashboard              Matches, funding potential chart
  (app)/business-profile       Profile form
  (app)/grants, grants/[id]    Catalogue and grant detail with checklist
  (app)/applications/...       Tracker, application editor, narrative drafter
  (app)/settings               Account, plan and usage
  api/                         profile, grants/match, grants/[id], eligibility/check,
                               applications, applications/[id], narrative/draft
components/                    UI grouped by feature
lib/
  eligibility.ts               Rules engine (hard blockers, checklist, rule score)
  matching.ts                  Runs rules, then Claude, merges and saves
  claude/                      Grant matcher and narrative writer (forced tool use)
  usage.ts                     Plan limits and usage tracking
supabase/migrations/           Schema and the starter grant catalogue
```

## Keeping the catalogue current

Grant terms change often. The seed data is a summary for matching only. Update rows in the `grants` table when agencies revise a scheme, and keep `official_url` pointing at the source.

## Disclaimer

GrantFinder provides informational matching only. Eligibility is determined solely by the respective grant administrators. Verify current criteria at enterprisesg.gov.sg or the relevant agency before applying.
