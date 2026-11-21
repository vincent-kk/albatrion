import type { DefaultFlags } from '../../../../types/index.js';
import {
  type AgentType,
  type AssetKind,
  isValidAgent,
} from '../../../agentTarget/index.js';
import { isValidScope } from '../../../scope/index.js';
import type { ValidatedFlags } from './types.js';

/** Validate completed arguments without effects, preserving first-listed order.
 * @param flags Completed CLI values.
 * @returns Validated values or all diagnostics; never exits the process.
 */
export function validateFlags(
  flags: DefaultFlags,
  allowMissing = false,
): ValidatedFlags | { errors: string[] } {
  const errors: string[] = [];
  const agents: AgentType[] = [];
  for (const value of flags.agent ?? []) {
    if (!isValidAgent(value))
      errors.push(
        `Invalid --agent: ${value}. Expected claude | codex | agents.`,
      );
    else if (!agents.includes(value)) agents.push(value);
  }
  if (!allowMissing && !agents.length && !errors.length)
    errors.push('--agent is required in non-interactive environments.');
  const scope = flags.scope;
  if ((!allowMissing || scope !== undefined) && !isValidScope(scope))
    errors.push(
      scope
        ? `Invalid --scope: ${scope}. Expected user | project.`
        : '--scope is required in non-interactive environments.',
    );
  const assetKinds = new Set<AssetKind>();
  for (const value of flags.asset?.length
    ? flags.asset
    : ['skills', 'rules', 'commands']) {
    if (value === 'skills' || value === 'rules' || value === 'commands')
      assetKinds.add(value);
    else
      errors.push(
        `Invalid --asset: ${value}. Expected skills | rules | commands.`,
      );
  }
  if (errors.length || !isValidScope(scope)) return { errors };
  return { agents, scope, assetKinds };
}
