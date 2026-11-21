import type { RunResult } from '../../../core/index.js';
import { VERSION } from '../../../utils/version.js';

/** Serialize a completed result; never reads or writes destination files.
 * @param result Complete core result, including validation errors.
 */
export function renderJSON(result: RunResult): void {
  for (const error of result.errors) process.stderr.write(`error ${error}\n`);
  const document = {
    schemaVersion: 1,
    tool: 'agents-assets-sync',
    version: VERSION,
    dryRun: result.dryRun,
    exitCode: result.exitCode,
    errors: result.errors,
    failures: result.failures ?? [],
    notices: result.notices ?? [],
    units: result.units.map((unit) => ({
      key: unit.key,
      diagnosticOnly: Boolean(unit.refused),
      ...(unit.aliasOf ? { aliasOf: unit.aliasOf } : {}),
      package: { name: unit.target.name, version: unit.target.version },
      agent: unit.agentTarget.agent,
      scope: unit.agentTarget.scope,
      projectRoot: unit.agentTarget.projectRoot,
      destination: unit.agentTarget.description,
      requiresForce: unit.plan.requiresForce,
      actions: unit.plan.actions,
      report: unit.report ?? null,
      ...(unit.error ? { error: unit.error } : {}),
    })),
  };
  process.stdout.write(`${JSON.stringify(document, null, 2)}\n`);
}
