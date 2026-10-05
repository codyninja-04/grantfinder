import { z } from 'zod';

const initiative = z.enum([
  'digitalization',
  'automation',
  'overseas_expansion',
  'productivity',
  'innovation',
  'sustainability',
  'workforce',
]);

// UEN formats: 8 digits + letter (businesses), 9 digits + letter (local companies),
// or T/S/R + 2 digits + 2 letters + 4 digits + letter (other entities).
export const UEN_PATTERN = /^(\d{8}[A-Z]|\d{9}[A-Z]|[TSR]\d{2}[A-Z]{2}\d{4}[A-Z])$/;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional();

export const profileSchema = z.object({
  company_name: z.string().trim().min(1, 'Company name is required').max(120),
  uen: z
    .string()
    .trim()
    .toUpperCase()
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional()
    .refine((v) => !v || UEN_PATTERN.test(v), 'That does not look like a valid UEN'),
  industry: z.string().max(40).nullable().optional(),
  annual_revenue_range: z.enum(['under_100k', '100k_1m', '1m_10m', '10m_100m', 'over_100m']).nullable().optional(),
  employee_count: z.coerce.number().int().min(0).max(1_000_000).nullable().optional(),
  years_operating: z.coerce.number().int().min(0).max(200).nullable().optional(),
  is_local_shareholding_30_percent: z.boolean(),
  business_stage: z.enum(['idea', 'early_stage', 'growth', 'established']).nullable().optional(),
  planned_initiatives: z.array(initiative).max(7).default([]),
  project_notes: optionalText(1500),
});

export const applicationCreateSchema = z.object({
  grant_id: z.string().uuid(),
  title: optionalText(140),
});

export const applicationUpdateSchema = z.object({
  status: z.enum(['considering', 'preparing', 'submitted', 'approved', 'rejected']).optional(),
  title: optionalText(140),
  project_description: optionalText(5000),
  expected_outcomes: optionalText(3000),
  requested_amount: z.coerce.number().min(0).max(100_000_000).nullable().optional(),
  target_submit_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional()
    .or(z.literal('').transform(() => null)),
  notes: optionalText(3000),
  narrative_draft: z
    .object({
      project_justification: z.string().max(12000),
      expected_outcomes_section: z.string().max(12000),
      implementation_plan: z.string().max(12000),
      missing_information: z.array(z.string().max(500)).max(30).default([]),
    })
    .nullable()
    .optional(),
});
