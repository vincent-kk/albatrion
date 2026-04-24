import type { ConsumerPackage } from '../../commands/runCli/type.js';
import type { InjectReport, Scope } from '../../core/index.js';
import type { PlanStepState, TargetPlan, Warning } from './target.js';

export type InjectEvent =
  | {
      readonly type: 'scope-needed';
      readonly pending: (scope: Scope) => void;
    }
  | { readonly type: 'scope-selected'; readonly scope: Scope }
  | {
      readonly type: 'planning-started';
      readonly targets: readonly ConsumerPackage[];
      readonly scope: Scope;
    }
  | { readonly type: 'plan-step'; readonly step: PlanStepState }
  | { readonly type: 'plans-ready'; readonly plans: readonly TargetPlan[] }
  | {
      readonly type: 'force-confirm-required';
      readonly warnings: readonly Warning[];
      readonly pending: (ok: boolean) => void;
    }
  | { readonly type: 'force-answer'; readonly ok: boolean }
  | { readonly type: 'apply-start'; readonly total: number }
  | {
      readonly type: 'apply-progress';
      readonly done: number;
      readonly current?: string;
    }
  | {
      readonly type: 'done';
      readonly reports: readonly InjectReport[];
      readonly exitCode: 0 | 1 | 2;
      readonly dryRun: boolean;
    }
  | { readonly type: 'fail'; readonly error: Error }
  | { readonly type: 'focus-target'; readonly index: number };
