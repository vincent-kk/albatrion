import { useEffect, useRef } from 'react';

import type { Fn } from '@aileron/declare';

import {
  type AgentType,
  type AssetKind,
  type Scope,
  runInjection,
} from '../../core/index.js';
import type { ConsumerPackage } from '../../types/index.js';
import type { InjectEvent, TargetPlan, Warning } from '../types/index.js';

interface UsePlanStepOptions {
  readonly targets: readonly ConsumerPackage[];
  readonly agents: readonly AgentType[] | null;
  readonly scope: Scope | null;
  readonly originCwd: string;
  readonly assetKinds: ReadonlySet<AssetKind>;
  readonly force: boolean;
  readonly dispatch: Fn<[event: InjectEvent]>;
  readonly onPlansReady: Fn<
    [plans: readonly TargetPlan[], warnings: readonly Warning[]]
  >;
}

/** Compatibility transport for plan-stage tests; the core owns all planning.
 * @param options Completed values and a display-event sink.
 */
export function usePlanStep(options: UsePlanStepOptions): void {
  const started = useRef(false);
  useEffect(() => {
    if (!options.agents || !options.scope || started.current) return;
    started.current = true;
    void runInjection({
      targets: options.targets,
      originCwd: options.originCwd,
      flags: {
        agent: [...options.agents],
        scope: options.scope,
        asset: [...options.assetKinds],
        force: options.force,
        dryRun: true,
        yes: true,
      },
      onPlan: (units) => {
        const warnings: Warning[] = units.flatMap((unit) =>
          unit.plan.actions.flatMap((action) =>
            action.kind === 'warn-diverged' ||
            action.kind === 'warn-orphan' ||
            action.kind === 'delete'
              ? [
                  {
                    packageName: unit.target.name,
                    agent: unit.agentTarget.agent,
                    kind:
                      action.kind === 'warn-diverged'
                        ? 'warn-diverged'
                        : 'warn-orphan',
                    relPath: action.relPath,
                    description:
                      action.kind === 'warn-diverged'
                        ? 'local differs from source (user edit or version change)'
                        : 'exists locally but not in manifest',
                  },
                ]
              : [],
          ),
        );
        options.dispatch({ type: 'plans-ready', plans: units });
        options.onPlansReady(units, warnings);
      },
    }).catch((error) =>
      options.dispatch({
        type: 'fail',
        error: error instanceof Error ? error : new Error(String(error)),
      }),
    );
  }, [options]);
}
