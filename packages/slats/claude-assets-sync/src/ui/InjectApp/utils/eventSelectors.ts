import type { ConsumerPackage } from '../../../commands/runCli/type.js';
import type { Phase } from '../../types/index.js';

export function scopeLabel(phase: Phase): string | undefined {
  switch (phase.kind) {
    case 'planning':
    case 'diff-review':
    case 'force-confirm':
    case 'applying':
    case 'summary':
      return phase.scope;
    default:
      return undefined;
  }
}

export function targetsOf(phase: Phase): readonly ConsumerPackage[] {
  switch (phase.kind) {
    case 'resolving':
    case 'scope-select':
    case 'planning':
      return phase.targets;
    case 'diff-review':
    case 'force-confirm':
    case 'applying':
      return phase.plans.map((tp) => tp.target);
    default:
      return [];
  }
}

export function etaSeconds(
  startedAt: number,
  done: number,
  total: number,
  now: number = Date.now(),
): number | undefined {
  if (done === 0) return undefined;
  const elapsedMs = Math.max(now - startedAt, 1);
  const rate = done / elapsedMs;
  const remaining = total - done;
  if (rate <= 0) return undefined;
  return remaining / rate / 1000;
}
