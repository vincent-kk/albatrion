import type { DefaultFlags } from '../../../../types/index.js';
import { validateFlags } from './validateFlags.js';
import { prepareUnits } from './prepareUnits.js';
import { executeUnits } from './executeUnits.js';
import type { RunInput, RunResult } from './types.js';

/** Complete arguments, prepare once, execute once; independent of the output mode.
 * @param input Packages, arguments and optional pure input views.
 * @returns The single result consumed by every output view.
 */
export async function runInjection(input: RunInput): Promise<RunResult> {
  const flags: DefaultFlags = { ...input.flags };
  if (!flags.agent?.length && input.selectAgents) flags.agent = [...await input.selectAgents()];
  if (!flags.scope && input.selectScope) flags.scope = await input.selectScope();
  const parsed = validateFlags(flags);
  const errors = [...input.notices ?? []];
  if ('errors' in parsed) return { units: [], errors: [...errors, ...parsed.errors], exitCode: 2, dryRun: Boolean(flags.dryRun) };
  const targets = input.targets.filter((target, index, all) => all.findIndex(candidate => candidate.name === target.name) === index);
  const units = await prepareUnits(targets, parsed, flags, input.originCwd);
  input.onPlan?.(units, parsed);
  const needsConfirmation = flags.force && !flags.yes && !flags.dryRun && units.some(unit => unit.plan.requiresForce);
  const cancelled = Boolean(needsConfirmation && input.confirm && !await input.confirm(units));
  return executeUnits(units, flags, errors, cancelled);
}
