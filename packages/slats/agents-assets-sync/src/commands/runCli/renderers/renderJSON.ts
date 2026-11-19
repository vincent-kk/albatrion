import { runInjection, type RunResult } from '../../../core/index.js';
import type { ConsumerPackage, DefaultFlags } from '../../../types/index.js';
import { VERSION } from '../../../utils/version.js';

/** Compatibility driver; core computes the same result used by other modes.
 * @param targets Resolved packages.
 * @param flags Completed arguments.
 * @param originCwd Scope origin.
 * @param notices Pre-render diagnostics.
 * @returns Core exit code.
 */
export async function renderJSON(targets: readonly ConsumerPackage[], flags: DefaultFlags, originCwd: string, notices: readonly string[] = []): Promise<number> {
  const result = await runInjection({ targets, flags, originCwd, notices });
  displayJSON(result);
  return result.exitCode;
}

/** Serialize a completed result; never reads or writes destination files.
 * @param result Complete core result, including validation errors.
 */
export function displayJSON(result: RunResult): void {
  const document = {
    schemaVersion: 1, tool: 'agents-assets-sync', version: VERSION,
    dryRun: result.dryRun, exitCode: result.exitCode, errors: result.errors,
    units: result.units.map(unit => ({
      key: unit.key,
      package: { name: unit.target.name, version: unit.target.version },
      agent: unit.agentTarget.agent, scope: unit.agentTarget.scope,
      projectRoot: unit.agentTarget.projectRoot, destination: unit.agentTarget.description,
      requiresForce: unit.plan.requiresForce, actions: unit.plan.actions,
      report: unit.report ?? null, ...(unit.error ? { error: unit.error } : {}),
    })),
  };
  process.stdout.write(`${JSON.stringify(document, null, 2)}\n`);
}
