import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  ConsumerPackage,
  DefaultFlags,
} from '../../commands/runCli/type.js';
import type { Scope } from '../../core/index.js';
import type { InjectEvent, TargetPlan, Warning } from '../types/index.js';
import { applyAllPlans } from './useApplyStep.js';
import { requestForceConfirm } from './useForceConfirmStep.js';
import { usePlanStep } from './usePlanStep.js';
import { useResolveStep } from './useResolveStep.js';

interface UseInjectSessionOptions {
  readonly targets: readonly ConsumerPackage[];
  readonly flags: DefaultFlags;
  readonly originCwd: string;
  readonly dispatch: (event: InjectEvent) => void;
}

export function useInjectSession({
  targets,
  flags,
  originCwd,
  dispatch,
}: UseInjectSessionOptions): void {
  const [scope, setScope] = useState<Scope | null>(null);
  const [plansReady, setPlansReady] = useState<{
    plans: readonly TargetPlan[];
    warnings: readonly Warning[];
  } | null>(null);
  const pipelineStarted = useRef(false);

  const onScopeResolved = useCallback((resolved: Scope) => {
    setScope(resolved);
  }, []);

  const onPlansReady = useCallback(
    (plans: readonly TargetPlan[], warnings: readonly Warning[]) => {
      setPlansReady({ plans, warnings });
    },
    [],
  );

  useResolveStep({ targets, flags, dispatch, onScopeResolved });
  usePlanStep({
    targets,
    scope,
    originCwd,
    force: Boolean(flags.force),
    dispatch,
    onPlansReady,
  });

  useEffect(() => {
    if (!plansReady || pipelineStarted.current) return;
    pipelineStarted.current = true;

    (async () => {
      const { plans, warnings } = plansReady;
      if (plans.length === 0) {
        dispatch({
          type: 'done',
          reports: [],
          exitCode: 2,
          dryRun: Boolean(flags.dryRun),
        });
        return;
      }
      const ok = await requestForceConfirm({
        plans,
        warnings,
        force: Boolean(flags.force),
        dispatch,
      });
      if (!ok) return;
      await applyAllPlans({
        plans,
        dryRun: Boolean(flags.dryRun),
        dispatch,
      });
    })().catch((error) => {
      dispatch({
        type: 'fail',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    });
  }, [plansReady, flags.force, flags.dryRun, dispatch]);
}
