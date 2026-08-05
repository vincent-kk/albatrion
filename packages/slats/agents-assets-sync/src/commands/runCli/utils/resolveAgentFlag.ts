import { type AgentType, isValidAgent } from '../../../core/index.js';
import { logger } from '../../../utils/logger.js';

/**
 * Validate `--agent` values into the agents to inject for.
 *
 * Duplicates are dropped while input order is kept, so `--agent claude,codex`
 * and `--agent claude --agent claude --agent codex` behave alike.
 *
 * `agents` is the vendor-neutral `.agents` convention rather than a product;
 * it differs from `codex` only at `user` scope.
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
      logger.error(`Invalid --agent: ${value}. Expected claude | codex | agents.`);
      process.exit(2);
    }
    if (!agents.includes(value)) agents.push(value);
  }
  if (agents.length > 0) return agents;

  if (interactive) return [];
  logger.error('--agent is required in non-interactive environments.');
  logger.error(
    '  Pass one or more of claude, codex, agents — e.g. --agent=claude,codex.',
  );
  process.exit(2);
}
