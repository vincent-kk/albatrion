import type { InjectPlan } from '../../core/buildPlan/index.js';
import type { ScopeResolution } from '../../core/index.js';
import type { ConsumerPackage } from '../../commands/runCli/type.js';

export interface PlanStepState {
  readonly packageName: string;
  readonly status: 'pending' | 'running' | 'done' | 'failed';
  readonly error?: string;
}

export interface TargetPlan {
  readonly target: ConsumerPackage;
  readonly scope: ScopeResolution;
  readonly plan: InjectPlan;
}

export interface Warning {
  readonly packageName: string;
  readonly kind: 'warn-diverged' | 'warn-orphan';
  readonly relPath: string;
  readonly description: string;
}

export interface ApplyProgress {
  readonly total: number;
  readonly done: number;
  readonly current?: string;
  readonly startedAt: number;
}
