import { z } from 'zod';
import { MODEL, anthropic, toolInput } from './client';

const TOOL = 'record_matches';

const matchSchema = z.object({
  matches: z.array(
    z.object({
      grant_id: z.string(),
      match_score: z.number().min(0).max(100),
      reasoning: z.string(),
      likely_eligible: z.boolean(),
    })
  ),
});

export type ClaudeMatch = z.infer<typeof matchSchema>['matches'][number];

export interface MatcherBusiness {
  industry: string | null;
  business_stage: string | null;
  employee_count: number | null;
  years_operating: number | null;
  annual_revenue_range: string | null;
  planned_initiatives: string[];
  is_local_shareholding_30_percent: boolean;
  project_notes: string | null;
}

export interface MatcherGrant {
  id: string;
  name: string;
  provider: string;
  description: string | null;
  eligible_business_stages: string[];
  eligible_industries: string[];
  eligible_initiatives: string[];
  min_local_shareholding_percent: number;
  application_complexity: string;
  hard_blockers: string[]; // already decided by our rules, Claude must respect them
}

const SYSTEM = `You match Singapore SMEs to government grants they are realistically eligible for and would actually benefit from.

Rules:
- Be honest about hard eligibility blockers. Local shareholding minimums, industry restrictions, stage and company age limits are strict and not negotiable.
- Each grant comes with "hard_blockers" that our rules engine has already confirmed. If that list is not empty, likely_eligible must be false and match_score must be 20 or below.
- match_score (0 to 100) is about fit: does this grant fund what the business is planning, is the effort of applying worth it for a company this size, and how strong would the case be.
- reasoning is one or two plain English sentences written to the business owner ("you"). Mention the specific thing that makes it a good or poor fit. No jargon, no hype, never promise approval.
- Return every candidate grant exactly once, using the grant_id given.`;

export async function matchGrants(business: MatcherBusiness, candidateGrants: MatcherGrant[]): Promise<ClaudeMatch[]> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: SYSTEM,
    tools: [
      {
        name: TOOL,
        description: 'Record a match score and reasoning for every candidate grant.',
        input_schema: {
          type: 'object',
          properties: {
            matches: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  grant_id: { type: 'string' },
                  match_score: { type: 'integer', minimum: 0, maximum: 100 },
                  reasoning: { type: 'string' },
                  likely_eligible: { type: 'boolean' },
                },
                required: ['grant_id', 'match_score', 'reasoning', 'likely_eligible'],
              },
            },
          },
          required: ['matches'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: TOOL },
    messages: [
      {
        role: 'user',
        content: `Business:\n${JSON.stringify(business, null, 2)}\n\nCandidate grants:\n${JSON.stringify(candidateGrants, null, 2)}\n\nScore every grant.`,
      },
    ],
  });

  const parsed = matchSchema.parse(toolInput(response, TOOL));
  return parsed.matches.sort((a, b) => b.match_score - a.match_score);
}
