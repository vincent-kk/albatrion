import type { ConsumerPackage } from '../../commands/runCli/type.js';
import type { InjectReport, Scope } from '../../core/index.js';
import type { ApplyProgress, PlanStepState, TargetPlan, Warning } from './target.js';

export type Phase =
  | { readonly kind: 'booting' }
  | {
      readonly kind: 'resolving';
      readonly targets: readonly ConsumerPackage[];
    }
  | {
      readonly kind: 'scope-select';
      readonly targets: readonly ConsumerPackage[];
      readonly pending: (scope: Scope) => void;
    }
  | {
      readonly kind: 'planning';
      readonly targets: readonly ConsumerPackage[];
      readonly scope: Scope;
      readonly progress: ReadonlyMap<string, PlanStepState>;
    }
  | {
      readonly kind: 'diff-review';
      readonly plans: readonly TargetPlan[];
      readonly focusedIndex: number;
      readonly scope: Scope;
    }
  | {
      readonly kind: 'force-confirm';
      readonly plans: readonly TargetPlan[];
      readonly warnings: readonly Warning[];
      readonly pending: (ok: boolean) => void;
      readonly scope: Scope;
    }
  | {
      readonly kind: 'applying';
      readonly plans: readonly TargetPlan[];
      readonly progress: ApplyProgress;
      readonly scope: Scope;
    }
  | {
      readonly kind: 'summary';
      readonly reports: readonly InjectReport[];
      readonly plans: readonly TargetPlan[];
      readonly exitCode: 0 | 1 | 2;
      readonly scope: Scope;
      readonly dryRun: boolean;
    }
  | { readonly kind: 'error'; readonly error: Error };
