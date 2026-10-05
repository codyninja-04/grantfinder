import { z } from 'zod';
import type { NarrativeDraft } from '../types';
import { MODEL, anthropic, toolInput } from './client';

const TOOL = 'write_narrative';

const narrativeSchema = z.object({
  project_justification: z.string().min(1),
  expected_outcomes_section: z.string().min(1),
  implementation_plan: z.string().min(1),
  missing_information: z.array(z.string()).default([]),
});

const SYSTEM = `You help Singapore SME owners draft grant application narrative sections. Write in the formal but clear style Singapore government grant assessors expect: specific, quantified where possible, outcome focused, and free of marketing fluff.

Hard rules:
- Never fabricate numbers, customers, vendors, dates or claims. Only use what the owner told you.
- Wherever a real figure or fact is needed and was not given, insert a placeholder in this exact form: [FILL IN: what is needed]. For example [FILL IN: current monthly order volume].
- Write in first person plural from the company ("we", "our").
- Use short paragraphs. Bullet points are fine for outcomes and milestones, using "- " at the start of a line.
- Do not use em dashes.
- Never suggest approval is likely or guaranteed.

Sections:
1. project_justification: the business problem, why it matters now, why this project is the right fix, and how it ties to what the grant is for. 200 to 350 words.
2. expected_outcomes_section: measurable outcomes with baseline and target where possible (revenue, productivity, cost, headcount upgrade, new markets). 120 to 250 words.
3. implementation_plan: phases or milestones with rough timing, who is responsible, and how progress will be tracked. 150 to 300 words.
4. missing_information: a short list of the specific facts the owner must supply to make this application credible.`;

export async function draftGrantNarrative(params: {
  grantName: string;
  grantFocus: string | null;
  businessContext: string;
  projectSummary: string;
  expectedOutcomes: string;
  requestedAmount: number | null;
}): Promise<NarrativeDraft> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: SYSTEM,
    tools: [
      {
        name: TOOL,
        description: 'Return the drafted narrative sections.',
        input_schema: {
          type: 'object',
          properties: {
            project_justification: { type: 'string' },
            expected_outcomes_section: { type: 'string' },
            implementation_plan: { type: 'string' },
            missing_information: { type: 'array', items: { type: 'string' } },
          },
          required: ['project_justification', 'expected_outcomes_section', 'implementation_plan', 'missing_information'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: TOOL },
    messages: [
      {
        role: 'user',
        content: `Grant: ${params.grantName}
What assessors look for: ${params.grantFocus ?? 'Not specified'}

Business: ${params.businessContext}

Project: ${params.projectSummary}

Expected outcomes (owner's notes): ${params.expectedOutcomes || 'Not given yet'}

Requested amount: ${params.requestedAmount != null ? `S$${params.requestedAmount}` : 'Not decided yet'}

Draft the narrative sections.`,
      },
    ],
  });

  const draft = narrativeSchema.parse(toolInput(response, TOOL));
  // Belt and braces on the house style: swap any em dash for a comma.
  const EM_DASH = String.fromCharCode(0x2014);
  const clean = (s: string) => s.split(EM_DASH).map((part) => part.trim()).join(', ');
  return {
    project_justification: clean(draft.project_justification),
    expected_outcomes_section: clean(draft.expected_outcomes_section),
    implementation_plan: clean(draft.implementation_plan),
    missing_information: draft.missing_information.map(clean),
  };
}
