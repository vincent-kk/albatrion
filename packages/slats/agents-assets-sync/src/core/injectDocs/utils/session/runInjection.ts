import type { DefaultFlags } from '../../../../types/index.js';
import { executeUnits } from './executeUnits.js';
import { prepareUnits } from './prepareUnits/prepareUnits.js';
import type { RunInput, RunResult } from './types.js';
import { createRunDiagnostics } from './utils/createRunDiagnostics.js';
import { validateFlags } from './validateFlags.js';

/** Complete arguments, prepare once, execute once; independent of the output mode.
 * @param input Packages, arguments and optional pure input views.
 * @returns The single result consumed by every output view.
 */
export async function runInjection(input: RunInput): Promise<RunResult> {
  const flags: DefaultFlags = { ...input.flags };
  const initial = validateFlags(flags, true);
  if ('errors' in initial && initial.errors.length)
    return {
      units: [],
      errors: [...(input.notices ?? []), ...initial.errors],
      failures: createRunDiagnostics(
        [...(input.notices ?? []), ...initial.errors],
        input.originCwd,
      ),
      notices: [],
      exitCode: 2,
      dryRun: Boolean(flags.dryRun),
    };
  if (!flags.agent?.length && input.selectAgents)
    flags.agent = [...(await input.selectAgents())];
  if (!flags.scope && input.selectScope)
    flags.scope = await input.selectScope();
  const parsed = validateFlags(flags);
  const errors = [...(input.notices ?? [])];
  if ('errors' in parsed)
    return {
      units: [],
      errors: [...errors, ...parsed.errors],
      failures: createRunDiagnostics(
        [...errors, ...parsed.errors],
        input.originCwd,
      ),
      notices: [],
      exitCode: 2,
      dryRun: Boolean(flags.dryRun),
    };
  const targets = input.targets.filter(
    (target, index, all) =>
      all.findIndex((candidate) => candidate.name === target.name) === index,
  );
  const units = await prepareUnits(
    targets,
    parsed,
    flags,
    input.originCwd,
    input.diagnostics?.map((failure) => failure.reason) ??
      (input.notices ?? []).filter(
        (reason) => !reason.includes('does not ship agent assets'),
      ),
  );
  input.onPlan?.(units, parsed);
  const needsConfirmation =
    flags.force &&
    !flags.yes &&
    !flags.dryRun &&
    units.some((unit) => unit.plan.requiresForce);
  const cancelled = Boolean(
    needsConfirmation &&
      input.confirm &&
      !(await input.confirm(units.filter((unit) => !unit.refused))),
  );
  return executeUnits(units, flags, errors, cancelled, input.diagnostics);
}
