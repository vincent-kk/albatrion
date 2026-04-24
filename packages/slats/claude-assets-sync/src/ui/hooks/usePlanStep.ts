import { useEffect, useRef } from 'react';

import type { ConsumerPackage } from '../../commands/runCli/type.js';
import {
  type Scope,
  buildPlan,
  computeNamespacePrefixes,
  readHashManifest,
  resolveScope,
} from '../../core/index.js';
import type { InjectEvent, TargetPlan, Warning } from '../types/index.js';

interface UsePlanStepOptions {
  readonly targets: readonly ConsumerPackage[];
  readonly scope: Scope | null;
  readonly originCwd: string;
  readonly force: boolean;
  readonly dispatch: (event: InjectEvent) => void;
  readonly onPlansReady: (
    plans: readonly TargetPlan[],
    warnings: readonly Warning[],
  ) => void;
}

export function usePlanStep({
  targets,
  scope,
  originCwd,
  force,
  dispatch,
  onPlansReady,
}: UsePlanStepOptions): void {
  const startedRef = useRef(false);

  useEffect(() => {
    if (!scope || startedRef.current) return;
    startedRef.current = true;
    let cancelled = false;

    (async () => {
      const results: TargetPlan[] = [];
      const warnings: Warning[] = [];
      for (const target of targets) {
        if (cancelled) return;
        dispatch({
          type: 'plan-step',
          step: { packageName: target.name, status: 'running' },
        });
        try {
          if (!target.hashesPresent) {
            dispatch({
              type: 'plan-step',
              step: {
                packageName: target.name,
                status: 'failed',
                error: 'dist/claude-hashes.json missing',
              },
            });
            continue;
          }
          const manifest = await readHashManifest(target.packageRoot);
          const scopeResolution = resolveScope(scope, originCwd);
          const plan = await buildPlan({
            sourceHashes: manifest.files,
            targetRoot: scopeResolution.targetRoot,
            namespacePrefixes: computeNamespacePrefixes(manifest),
            force,
          });
          results.push({ target, scope: scopeResolution, plan });
          for (const action of plan.actions) {
            if (
              action.kind === 'warn-diverged' ||
              action.kind === 'warn-orphan'
            ) {
              warnings.push({
                packageName: target.name,
                kind: action.kind,
                relPath: action.relPath,
                description:
                  action.kind === 'warn-diverged'
                    ? 'local differs from source (user edit or version change)'
                    : 'exists locally but not in manifest',
              });
            }
          }
          dispatch({
            type: 'plan-step',
            step: { packageName: target.name, status: 'done' },
          });
        } catch (error) {
          dispatch({
            type: 'plan-step',
            step: {
              packageName: target.name,
              status: 'failed',
              error: error instanceof Error ? error.message : String(error),
            },
          });
        }
      }
      if (cancelled) return;
      dispatch({ type: 'plans-ready', plans: results });
      onPlansReady(results, warnings);
    })().catch((error) => {
      if (!cancelled) {
        dispatch({
          type: 'fail',
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [targets, scope, originCwd, force, dispatch, onPlansReady]);
}
