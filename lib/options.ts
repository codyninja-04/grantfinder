import type { ApplicationStatus, BusinessStage, Complexity, Initiative, RevenueRange } from './types';

export const STAGES: { value: BusinessStage; label: string; hint: string }[] = [
  { value: 'idea', label: 'Idea', hint: 'Not trading yet, or only just incorporated' },
  { value: 'early_stage', label: 'Early stage', hint: 'First customers, still finding fit' },
  { value: 'growth', label: 'Growth', hint: 'Steady revenue, scaling the team' },
  { value: 'established', label: 'Established', hint: 'Mature business, several years in' },
];

export const INITIATIVES: { value: Initiative; label: string; hint: string }[] = [
  { value: 'digitalization', label: 'Going digital', hint: 'Software, e-commerce, cloud tools' },
  { value: 'automation', label: 'Automation', hint: 'Machines or systems that replace manual work' },
  { value: 'overseas_expansion', label: 'Overseas expansion', hint: 'Selling into a new country' },
  { value: 'productivity', label: 'Productivity', hint: 'Doing more with the same team' },
  { value: 'innovation', label: 'New product or R&D', hint: 'Building something that does not exist yet' },
  { value: 'sustainability', label: 'Sustainability', hint: 'Energy savings, greener operations' },
  { value: 'workforce', label: 'Training and hiring', hint: 'Upskilling staff or reskilling new hires' },
];

export const INDUSTRIES: { value: string; label: string }[] = [
  { value: 'retail', label: 'Retail' },
  { value: 'food_beverage', label: 'Food and beverage' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'logistics', label: 'Logistics and transport' },
  { value: 'construction', label: 'Construction and built environment' },
  { value: 'professional_services', label: 'Professional services' },
  { value: 'ict', label: 'Tech and ICT' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education and training' },
  { value: 'tourism_hospitality', label: 'Tourism and hospitality' },
  { value: 'agrifood', label: 'Farming and agri-food' },
  { value: 'finance', label: 'Finance' },
  { value: 'creative_media', label: 'Creative and media' },
  { value: 'other', label: 'Something else' },
];

export const REVENUE_RANGES: { value: RevenueRange; label: string; upper: number }[] = [
  { value: 'under_100k', label: 'Under S$100k', upper: 100_000 },
  { value: '100k_1m', label: 'S$100k to S$1M', upper: 1_000_000 },
  { value: '1m_10m', label: 'S$1M to S$10M', upper: 10_000_000 },
  { value: '10m_100m', label: 'S$10M to S$100M', upper: 100_000_000 },
  { value: 'over_100m', label: 'Over S$100M', upper: Infinity },
];

export const COMPLEXITY: Record<Complexity, { label: string; hint: string }> = {
  simple: { label: 'Simple', hint: 'A short form, often vendor assisted' },
  moderate: { label: 'Moderate', hint: 'A proposal and some supporting documents' },
  complex: { label: 'Complex', hint: 'Detailed proposal, quotes and financials' },
};

export const STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: 'considering', label: 'Considering' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Not approved' },
];

export function labelFor<T extends string>(list: { value: T; label: string }[], value: T | null | undefined) {
  return list.find((o) => o.value === value)?.label ?? value ?? '';
}

export const DISCLAIMER =
  'GrantFinder provides informational matching only. Eligibility is determined solely by the respective grant administrators. Verify current criteria at enterprisesg.gov.sg or the relevant agency before applying.';
