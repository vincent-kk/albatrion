import { useEffect, useRef } from 'react';

import type { Fn } from '@aileron/declare';

import {
  type AgentType,
  type AssetKind,
  type ResolvedLocations,
  type Scope,
  assertDestinationRootsContained,
  assertWriteTargetsContained,
  buildPlan,
  collectFileWrites,
  computeNamespacePrefixes,
  resolveAgentTarget,
  resolveDestinations,
  resolveHashManifest,
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

/** Build one plan per (package, agent) pair, reporting progress per pair. */
export function usePlanStep({
  targets,
  agents,
  scope,
  originCwd,
  assetKinds,
  force,
  dispatch,
  onPlansReady,
}: UsePlanStepOptions): void {
  const startedRef = useRef(false);

  useEffect(() => {
    if (!scope || !agents || agents.length === 0 || startedRef.current) return;
    startedRef.current = true;
    let cancelled = false;

    (async () => {
      const results: TargetPlan[] = [];
      const warnings: Warning[] = [];
      // One stamp for the whole planning pass: a computed manifest records when
      // the run looked, not when each pair happened to reach the hasher.
      const generatedAt = new Date().toISOString();
      // Destination directories repeat across pairs; resolve each once.
      const resolved: ResolvedLocations = new Map();
      for (const agent of agents) {
        for (const target of targets) {
          if (cancelled) return;
          dispatch({
            type: 'plan-step',
            step: { packageName: target.name, agent, status: 'running' },
          });
          try {
            const manifest = await resolveHashManifest(target, generatedAt);
            const agentTarget = resolveAgentTarget(agent, scope, originCwd);
            const { destinations, orphanScans } = resolveDestinations({
              agentTarget,
              packageName: target.name,
              relPaths: Object.keys(manifest.files),
              namespacePrefixes: computeNamespacePrefixes(manifest),
              assetKinds,
            });
            await assertDestinationRootsContained({
              agentTarget,
              assetKinds,
              orphanScans,
              resolved,
            });
            const plan = await buildPlan({
              sourceHashes: manifest.files,
              ...(target.hashSource === 'manifest' ? { assetRoot: target.assetRoot } : {}),
              destinations,
              orphanScans,
              force,
            });
            await assertWriteTargetsContained({
              agentTarget,
              dstPaths: collectFileWrites(plan),
              resolved,
            });
            results.push({ target, agentTarget, plan });
            for (const action of plan.actions) {
              if (action.kind === 'warn-diverged')
                warnings.push({
                  packageName: target.name,
                  agent,
                  kind: action.kind,
                  relPath: action.relPath,
                  description:
                    'local differs from source (user edit or version change)',
                });
              // `--force` plans an orphan as `delete`; the dialog still owes
              // the user that path before it disappears.
              else if (
                action.kind === 'warn-orphan' ||
                action.kind === 'delete'
              )
                warnings.push({
                  packageName: target.name,
                  agent,
                  kind: 'warn-orphan',
                  relPath: action.relPath,
                  description: 'exists locally but not in manifest',
                });
            }
            dispatch({
              type: 'plan-step',
              step: { packageName: target.name, agent, status: 'done' },
            });
          } catch (error) {
            results.push({ target, agentTarget: resolveAgentTarget(agent, scope, originCwd),
              plan: { actions: [], requiresForce: false },
              error: error instanceof Error ? error.message : String(error) });
            dispatch({
              type: 'plan-step',
              step: {
                packageName: target.name,
                agent,
                status: 'failed',
                error: error instanceof Error ? error.message : String(error),
              },
            });
          }
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
  }, [
    targets,
    agents,
    scope,
    originCwd,
    assetKinds,
    force,
    dispatch,
    onPlansReady,
  ]);
}
