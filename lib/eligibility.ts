import { INDUSTRIES, INITIATIVES, REVENUE_RANGES, STAGES, labelFor } from './options';
import type { BusinessProfile, ChecklistItem, Grant } from './types';

/**
 * Deterministic eligibility rules. These run before Claude and their verdict
 * wins: a hard blocker here can never be overridden by the model. Anything we
 * cannot judge from the profile comes back as 'check' so people verify it.
 */

const SME_TURNOVER_CAP = 100_000_000;
const SME_HEADCOUNT_CAP = 200;

type ProfileLike = Pick<
  BusinessProfile,
  | 'industry'
  | 'business_stage'
  | 'employee_count'
  | 'years_operating'
  | 'annual_revenue_range'
  | 'is_local_shareholding_30_percent'
  | 'planned_initiatives'
>;

export function eligibilityChecklist(grant: Grant, profile: ProfileLike): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  // Local shareholding
  const minShare = grant.min_local_shareholding_percent ?? 0;
  if (minShare > 0) {
    if (!profile.is_local_shareholding_30_percent) {
      items.push({
        key: 'shareholding',
        label: `At least ${minShare}% local shareholding`,
        detail: `Your profile says Singapore Citizens or PRs hold less than 30% of the company. This is a strict rule for ${grant.short_name ?? grant.name} and is not waived.`,
        status: 'fail',
      });
    } else if (minShare > 30) {
      items.push({
        key: 'shareholding',
        label: `At least ${minShare}% local shareholding`,
        detail: `You meet the usual 30% bar, but this scheme asks for ${minShare}%. Check your cap table.`,
        status: 'check',
      });
    } else {
      items.push({
        key: 'shareholding',
        label: `At least ${minShare}% local shareholding`,
        detail: 'Your profile says at least 30% is held by Singapore Citizens or PRs.',
        status: 'pass',
      });
    }
  }

  // Business stage
  if (grant.eligible_business_stages.length > 0) {
    const stageNames = grant.eligible_business_stages.map((s) => labelFor(STAGES, s).toLowerCase()).join(', ');
    if (!profile.business_stage) {
      items.push({ key: 'stage', label: 'Business stage', detail: `Built for ${stageNames} businesses. Add your stage to your profile.`, status: 'check' });
    } else if (grant.eligible_business_stages.includes(profile.business_stage)) {
      items.push({ key: 'stage', label: 'Business stage', detail: `Built for ${stageNames} businesses, which includes you.`, status: 'pass' });
    } else {
      items.push({
        key: 'stage',
        label: 'Business stage',
        detail: `Built for ${stageNames} businesses. You are at the ${labelFor(STAGES, profile.business_stage).toLowerCase()} stage.`,
        status: 'fail',
      });
    }
  }

  // Industry
  if (grant.eligible_industries.length > 0) {
    const names = grant.eligible_industries.map((i) => labelFor(INDUSTRIES, i).toLowerCase()).join(', ');
    if (!profile.industry) {
      items.push({ key: 'industry', label: 'Industry', detail: `Only open to ${names}. Add your industry to your profile.`, status: 'check' });
    } else if (grant.eligible_industries.includes(profile.industry)) {
      items.push({ key: 'industry', label: 'Industry', detail: `Open to ${names}, which covers you.`, status: 'pass' });
    } else {
      items.push({ key: 'industry', label: 'Industry', detail: `Only open to ${names}.`, status: 'fail' });
    }
  }

  // SME definition: either test is enough to qualify
  if (grant.sme_only) {
    const revenueUpper = REVENUE_RANGES.find((r) => r.value === profile.annual_revenue_range)?.upper;
    const turnoverOk = revenueUpper !== undefined ? revenueUpper <= SME_TURNOVER_CAP : null;
    const headcountOk = profile.employee_count != null ? profile.employee_count <= SME_HEADCOUNT_CAP : null;

    let status: ChecklistItem['status'] = 'check';
    if (turnoverOk || headcountOk) status = 'pass';
    else if (turnoverOk === false && headcountOk === false) status = 'fail';

    items.push({
      key: 'sme',
      label: 'Counts as an SME',
      detail:
        status === 'pass'
          ? 'Group turnover up to S$100M or up to 200 staff. You fit.'
          : status === 'fail'
            ? 'Needs group turnover up to S$100M or no more than 200 staff. Your profile is above both.'
            : 'Needs group turnover up to S$100M or no more than 200 staff. Add revenue and headcount to confirm.',
      status,
    });
  }

  // Company age for startup schemes
  if (grant.max_years_operating != null) {
    const max = grant.max_years_operating;
    if (profile.years_operating == null) {
      items.push({ key: 'age', label: 'Company age', detail: `For companies up to about ${max} year${max === 1 ? '' : 's'} old.`, status: 'check' });
    } else if (profile.years_operating <= max) {
      items.push({ key: 'age', label: 'Company age', detail: `For companies up to about ${max} year${max === 1 ? '' : 's'} old. You are within that.`, status: 'pass' });
    } else {
      items.push({
        key: 'age',
        label: 'Company age',
        detail: `For companies up to about ${max} year${max === 1 ? '' : 's'} old. You have been operating ${profile.years_operating} years.`,
        status: 'fail',
      });
    }
  }

  // Fit with what they plan to do. Not a blocker, but worth showing.
  if (grant.eligible_initiatives.length > 0) {
    const overlap = grant.eligible_initiatives.filter((i) => profile.planned_initiatives?.includes(i));
    const names = grant.eligible_initiatives.map((i) => labelFor(INITIATIVES, i).toLowerCase()).join(', ');
    items.push({
      key: 'initiative',
      label: 'Fits what you plan to do',
      detail:
        overlap.length > 0
          ? `Funds ${names}. You picked ${overlap.map((i) => labelFor(INITIATIVES, i).toLowerCase()).join(', ')}.`
          : `Funds ${names}, none of which are in your plans right now.`,
      status: overlap.length > 0 ? 'pass' : 'check',
    });
  }

  // Scheme specific conditions we cannot judge from a profile
  grant.requirements.forEach((req, i) => {
    items.push({ key: `req-${i}`, label: req, detail: 'Confirm this yourself before applying.', status: 'check' });
  });

  return items;
}

export function blockersFrom(items: ChecklistItem[]): string[] {
  return items.filter((i) => i.status === 'fail').map((i) => `${i.label}: ${i.detail}`);
}

/**
 * A fast score that needs no AI. It is what free users see once their AI
 * refreshes are used up, and the fallback if Claude is unavailable.
 */
export function ruleScore(grant: Grant, profile: ProfileLike, items: ChecklistItem[]) {
  const fails = items.filter((i) => i.status === 'fail').length;
  const overlap = grant.eligible_initiatives.filter((i) => profile.planned_initiatives?.includes(i)).length;

  let score = 35 + Math.min(overlap, 3) * 15;
  if (profile.business_stage && grant.eligible_business_stages.includes(profile.business_stage)) score += 10;
  if (grant.eligible_industries.length > 0 && profile.industry && grant.eligible_industries.includes(profile.industry)) score += 10;
  if (overlap === 0) score -= 15;
  if (fails > 0) score = Math.min(score, 20) - (fails - 1) * 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function ruleReasoning(grant: Grant, profile: ProfileLike, items: ChecklistItem[]) {
  const fail = items.find((i) => i.status === 'fail');
  if (fail) return `Blocked on ${fail.label.toLowerCase()}. ${fail.detail}`;
  const overlap = grant.eligible_initiatives.filter((i) => profile.planned_initiatives?.includes(i));
  if (overlap.length === 0) return `You look eligible on paper, but ${grant.short_name ?? grant.name} funds work you have not said you are planning.`;
  return `No hard blockers found, and it funds ${overlap.map((i) => labelFor(INITIATIVES, i).toLowerCase()).join(' and ')}, which you are planning.`;
}

/** Safe defaults so the checklist still renders before a profile exists. */
export function rulesProfile(p: BusinessProfile | null): ProfileLike {
  return {
    industry: p?.industry ?? null,
    business_stage: p?.business_stage ?? null,
    employee_count: p?.employee_count ?? null,
    years_operating: p?.years_operating ?? null,
    annual_revenue_range: p?.annual_revenue_range ?? null,
    is_local_shareholding_30_percent: p?.is_local_shareholding_30_percent ?? true,
    planned_initiatives: p?.planned_initiatives ?? [],
  };
}
