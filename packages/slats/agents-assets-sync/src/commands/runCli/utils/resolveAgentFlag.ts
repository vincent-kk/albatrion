import { type AgentType, isValidAgent } from '../../../core/index.js';
import { logger } from '../../../utils/logger.js';

/**
 * Validate `--agent` values into the agents to inject for.
 *
 * Duplicates are dropped while input order is kept, so `--agent claude,codex`
 * and `--agent claude --agent claude --agent codex` behave alike.
 *
 * @param values - raw `--agent` values, already comma-split by the collector
 * @param interactive - whether the caller can still show a picker
 * @returns the validated agents; an empty array means "ask the user"
 */
export function resolveAgentFlag(
  values: readonly string[],
  interactive: boolean,
): AgentType[] {
  const agents: AgentType[] = [];
  for (const value of values) {
    if (!isValidAgent(value)) {
      logger.error(`Invalid --agent: ${value}. Expected claude | codex.`);
      process.exit(2);
    }
    if (!agents.includes(value)) agents.push(value);
  }
  if (agents.length > 0) return agents;

  if (interactive) return [];
  logger.error('--agent is required in non-interactive environments.');
  logger.error(
    '  Pass --agent=claude, --agent=codex, or --agent=claude,codex.',
  );
  process.exit(2);
}
