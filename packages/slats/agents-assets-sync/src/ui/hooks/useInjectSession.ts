import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
  ConsumerPackage,
  DefaultFlags,
} from '../../commands/runCli/type.js';
import type { AgentType, AssetKind, Scope } from '../../core/index.js';
import type { InjectEvent, TargetPlan, Warning } from '../types/index.js';
import { applyAllPlans } from './useApplyStep.js';
import { requestForceConfirm } from './useForceConfirmStep.js';
import { usePlanStep } from './usePlanStep.js';
import { useResolveStep } from './useResolveStep.js';

const ALL_KINDS: readonly AssetKind[] = ['skills', 'rules', 'commands'];

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
  const [resolved, setResolved] = useState<{
    agents: readonly AgentType[];
    scope: Scope;
  } | null>(null);
  const [plansReady, setPlansReady] = useState<{
    plans: readonly TargetPlan[];
    warnings: readonly Warning[];
  } | null>(null);
  const pipelineStarted = useRef(false);

  // The CLI layer already rejected unknown values, so anything unrecognised
  // here can only be an empty flag — which means every kind.
  const assetKinds = useMemo(() => {
    const requested = (flags.asset ?? []).filter((value): value is AssetKind =>
      ALL_KINDS.includes(value as AssetKind),
    );
    return new Set<AssetKind>(requested.length > 0 ? requested : ALL_KINDS);
  }, [flags.asset]);

  const onResolved = useCallback(
    (agents: readonly AgentType[], scope: Scope) => {
      setResolved({ agents, scope });
    },
    [],
  );

  const onPlansReady = useCallback(
    (plans: readonly TargetPlan[], warnings: readonly Warning[]) => {
      setPlansReady({ plans, warnings });
    },
    [],
  );

  useResolveStep({ targets, flags, dispatch, onResolved });
  usePlanStep({
    targets,
    agents: resolved?.agents ?? null,
    scope: resolved?.scope ?? null,
    originCwd,
    assetKinds,
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
        autoApprove: Boolean(flags.yes),
        dispatch,
      });
      if (!ok) return;
      await applyAllPlans({
        plans,
        dryRun: Boolean(flags.dryRun),
        force: Boolean(flags.force),
        dispatch,
      });
    })().catch((error) => {
      dispatch({
        type: 'fail',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    });
  }, [plansReady, flags.force, flags.dryRun, flags.yes, dispatch]);
}
