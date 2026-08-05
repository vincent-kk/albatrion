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
  const parsed = parseAgentFlag(values, interactive);
  if ('error' in parsed) {
    for (const line of parsed.error) logger.error(line);
    process.exit(2);
  }
  return parsed.agents;
}

/**
 * Same validation as `resolveAgentFlag`, reporting instead of exiting.
 *
 * The `--json` renderer needs the failure as data so it can place it in the
 * document it owns; exiting here would leave that document unwritten.
 *
 * @param values - raw `--agent` values
 * @param interactive - whether the caller can still show a picker
 * @returns the agents, or the message lines describing why there are none
 */
export function parseAgentFlag(
  values: readonly string[],
  interactive: boolean,
): { agents: AgentType[] } | { error: string[] } {
  const agents: AgentType[] = [];
  for (const value of values) {
    if (!isValidAgent(value))
      return {
        error: [`Invalid --agent: ${value}. Expected claude | codex | agents.`],
      };
    if (!agents.includes(value)) agents.push(value);
  }
  if (agents.length > 0 || interactive) return { agents };
  return {
    error: [
      '--agent is required in non-interactive environments.',
      '  Pass one or more of claude, codex, agents — e.g. --agent=claude,codex.',
    ],
  };
}
