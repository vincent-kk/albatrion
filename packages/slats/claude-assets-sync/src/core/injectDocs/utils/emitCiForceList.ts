import type { InjectPlan } from '../../buildPlan/index.js';

export function emitCiForceList(plan: InjectPlan): void {
  const divergent = plan.actions.filter(
    (a) => a.kind === 'warn-diverged' || a.kind === 'warn-orphan',
  );
  process.stderr.write(
    `[claude-assets-sync] --force overwriting ${divergent.length} file(s) in non-TTY mode:\n`,
  );
  for (const a of divergent) process.stderr.write(`  ${a.relPath}\n`);
}
