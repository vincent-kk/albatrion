import { expect, vi } from 'vitest';

import { isTruthy } from '@winglet/common-utils/filter';

import type {
  Blueprint,
  BlueprintSchema,
} from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import type { PlainNode } from '../../../__tests__/fixtures/createPlainNode';
import { createTestTree } from '../../../__tests__/fixtures/createTestTree';
import * as blueprintApi from '../../../blueprint';
import * as deriveApi from '../../../derive';
import { engineModes } from '../../../utils/cache/engineModes';
import { loadFieldNodeAtMount } from '../../loadFieldNodeAtMount';
import type { SettlementContext } from '../../types/settlement';
import * as settlementApi from '../../utils/settlement/createSettlementContext';
import { writeFieldNode } from '../../utils/write/writeFieldNode';

/** Compiler sidecar is optional until the optimization's fail-first check. */
interface ConvergenceTargets {
  /** Read the memoized proof without triggering collection. */
  get(blueprint: Blueprint): ReadonlySet<string> | undefined;
  /** Disable the proof for one independent reference tree. */
  set(blueprint: Blueprint, targets: ReadonlySet<string> | undefined): void;
}

/**
 * Compare complete settlement observations with the proof disabled and enabled.
 * @param schema - Independent authored counterexample or terminal target schema
 * @param input - First load including explicit edge baselines
 * @param writes - Ordered leaf/root replacements after that load
 * @returns The selected tree, its final context, decisions, and snapshots
 */
export const runDeriveConvergenceCase = (
  schema: BlueprintSchema,
  input: unknown,
  writes: readonly { path: string; value: unknown }[] = [],
) => {
  const sidecar = Reflect.get(blueprintApi, 'DeriveConvergenceTargets') as
    | ConvergenceTargets
    | undefined;
  const enabled = process.env.ROUND99_SKIP !== 'off';
  const environment = process.env.NODE_ENV;
  const shadowEnabled = engineModes.deriveShadow;
  const variants = enabled && environment === 'test' ? 3 : 2;
  if (enabled) expect(sidecar, 'first-write convergence proof').toBeDefined();
  const observations: string[][] = [];
  let result;
  for (let variant = 0; variant < variants; variant++) {
    if (variant === 2) {
      vi.stubEnv('NODE_ENV', 'development');
      engineModes.setMode('deriveShadow', false);
    }
    const { root, blueprint } = createTestTree(schema);
    if (variant === 0 || !enabled) sidecar?.set(blueprint, undefined);
    const snapshots: string[] = [];
    const contexts: SettlementContext<PlainNode>[] = [];
    const decisions: { writes: number; failures: number }[] = [];
    const createContext = settlementApi.createSettlementContext;
    const decide = deriveApi.evaluateDeriveRound;
    const contextSpy = vi
      .spyOn(settlementApi, 'createSettlementContext')
      .mockImplementation((...args) => {
        const context = createContext(...args) as SettlementContext<PlainNode>;
        contexts.push(context);
        return context;
      });
    const decisionSpy = vi
      .spyOn(deriveApi, 'evaluateDeriveRound')
      .mockImplementation((...args) => {
        const decision = decide(...args);
        decisions.push({
          writes: decision.writes.length,
          failures: decision.failures.length,
        });
        return decision;
      });
    try {
      for (let step = -1; step < writes.length; step++) {
        for (const node of root.runtime.deliveries ?? [])
          node.pendingDelivery = undefined;
        root.runtime.deliveries?.clear();
        let error;
        try {
          if (step === -1)
            loadFieldNodeAtMount(root, input, WriteOption.Overwrite);
          else {
            const write = writes[step];
            let target = root;
            const segments = write.path.split('/').filter(isTruthy);
            for (const segment of segments) target = target.structure![segment];
            writeFieldNode(target, write.value, 'input', WriteOption.Overwrite);
          }
        } catch (cause) {
          error = cause instanceof Error ? cause.message : String(cause);
        }
        const nodes = [],
          pending = [root];
        while (pending.length) {
          const node = pending.pop()!;
          nodes.push({
            path: node.path,
            kind: node.blueprintNode.kind,
            raw: node.raw,
            emit: node.emit,
            undeclaredValues: node.undeclaredValues,
            isReadOnly: node.isReadOnly,
            isVisible: node.isVisible,
            isDisabled: node.isDisabled,
            errors: root.runtime.combinedErrors?.get(node.path),
            revisions: node.revisionLedger,
            delivery: node.pendingDelivery,
          });
          for (
            let index = (node.children?.length ?? 0) - 1;
            index >= 0;
            index--
          )
            if (node.children![index].parent === node)
              pending.push(node.children![index]);
        }
        snapshots.push(
          JSON.stringify({
            nodes,
            error,
            diagnostics: root.runtime.diagnostics,
            commit: root.runtime.commitNumber,
            rounds: contexts[contexts.length - 1].deriveRounds ?? 0,
            iterations: contexts[contexts.length - 1].iterations,
            trace: root.runtime.settlementTrace,
            deliveries: [...(root.runtime.deliveries ?? [])].map(
              (node) => node.path,
            ),
            rules: [...(root.runtime.committedRuleValues ?? [])].map(
              ([key, value]) => [JSON.parse(key).slice(0, -1), value],
            ),
          }),
        );
      }
    } finally {
      contextSpy.mockRestore();
      decisionSpy.mockRestore();
      if (variant === 2) {
        engineModes.setMode('deriveShadow', shadowEnabled);
        vi.stubEnv('NODE_ENV', environment);
      }
    }
    observations.push(snapshots);
    if (variant < 2)
      result = {
        root,
        proof: sidecar?.get(blueprint),
        decisions,
        contexts,
        snapshots,
      };
  }
  expect(observations[1]).toEqual(observations[0]);
  if (variants === 3) expect(observations[2]).toEqual(observations[0]);
  return result!;
};
