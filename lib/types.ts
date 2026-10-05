// Hand written row types. They mirror supabase/migrations and are cast at the
// query site rather than generated.

export type BusinessStage = 'idea' | 'early_stage' | 'growth' | 'established';

export type Initiative =
  | 'digitalization'
  | 'automation'
  | 'overseas_expansion'
  | 'productivity'
  | 'innovation'
  | 'sustainability'
  | 'workforce';

export type RevenueRange = 'under_100k' | '100k_1m' | '1m_10m' | '10m_100m' | 'over_100m';

export type Complexity = 'simple' | 'moderate' | 'complex';

export type ApplicationStatus = 'considering' | 'preparing' | 'submitted' | 'approved' | 'rejected';

export type Tier = 'free' | 'pro';

export interface BusinessProfile {
  user_id: string;
  updated_at: string;
  matched_at: string | null;
  company_name: string;
  uen: string | null;
  industry: string | null;
  annual_revenue_range: RevenueRange | null;
  employee_count: number | null;
  years_operating: number | null;
  is_local_shareholding_30_percent: boolean;
  business_stage: BusinessStage | null;
  planned_initiatives: Initiative[];
  project_notes: string | null;
}

export interface Grant {
  id: string;
  updated_at: string;
  slug: string;
  name: string;
  short_name: string | null;
  provider: string;
  funding_cap: string | null;
  funding_cap_sgd: number | null;
  funding_percent: string | null;
  eligible_business_stages: BusinessStage[];
  eligible_industries: string[];
  eligible_initiatives: Initiative[];
  min_local_shareholding_percent: number;
  sme_only: boolean;
  max_years_operating: number | null;
  application_complexity: Complexity;
  description: string | null;
  plain_english: string | null;
  requirements: string[];
  covers: string[];
  narrative_focus: string | null;
  official_url: string | null;
}

export interface GrantMatch {
  user_id: string;
  grant_id: string;
  matched_at: string;
  match_score: number;
  likely_eligible: boolean;
  reasoning: string | null;
  blockers: string[];
  source: 'ai' | 'rules';
}

export interface NarrativeDraft {
  project_justification: string;
  expected_outcomes_section: string;
  implementation_plan: string;
  missing_information: string[];
}

export interface GrantApplication {
  id: string;
  user_id: string;
  grant_id: string;
  created_at: string;
  updated_at: string;
  status: ApplicationStatus;
  title: string | null;
  project_description: string | null;
  expected_outcomes: string | null;
  narrative_draft: NarrativeDraft | null;
  narrative_drafted_at: string | null;
  requested_amount: number | null;
  target_submit_date: string | null;
  notes: string | null;
}

export type ApplicationWithGrant = GrantApplication & {
  grant: Pick<Grant, 'id' | 'name' | 'short_name' | 'provider' | 'funding_percent' | 'application_complexity'>;
};

export type CheckStatus = 'pass' | 'fail' | 'check';

export interface ChecklistItem {
  key: string;
  label: string;
  detail: string;
  status: CheckStatus;
}
