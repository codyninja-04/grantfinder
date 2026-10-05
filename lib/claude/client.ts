import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

/**
 * Both Claude calls force a single tool so the reply arrives as structured
 * input instead of prose we would have to fish JSON out of.
 */
export function toolInput(message: Anthropic.Message, toolName: string): unknown {
  const block = message.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use' && b.name === toolName
  );
  if (!block) throw new Error('Claude did not return a structured result');
  return block.input;
}
