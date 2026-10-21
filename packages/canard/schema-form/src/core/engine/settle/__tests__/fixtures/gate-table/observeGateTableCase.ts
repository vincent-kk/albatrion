import { vi } from 'vitest';

import type { PlainNode } from '../../../../__tests__/fixtures/createPlainNode';
import * as committing from '../../../utils/commit/commitSettlement';
import * as selection from '../../../utils/compute/childSelection/selectChildren';
import * as traversal from '../../../utils/compute/dirtyChildren';
import * as registration from '../../../utils/dependencies/registerRecalculation';
import * as deriving from '../../../utils/derivation/runDeriveRounds';
import * as transitioning from '../../../utils/transition/transitionSettlement';
import { runGateSelectionCase } from '../../helpers/runGateSelectionCase';
import type { gateSelectionCases } from '../gateSelectionCases';
import { observeGateTableDelivery } from './observeGateTableDelivery';
import { observePendingExitPaths } from './observePendingExitPaths';
import { serializeGateTableObservation } from './serializeGateTableObservation';

/**
 * Freeze one pre-extraction history, including effects invisible in the final value.
 * @param fixture - Authored schema, input, and write sequence
 * @returns JSON text with explicit non-JSON primitives and ordered internal observations
 */
export const observeGateTableCase = (
  fixture: (typeof gateSelectionCases)[number],
): string => {
  const dirty: unknown[] = [];
  const registrations: unknown[] = [];
  const selections: unknown[] = [];
  const commits: unknown[] = [];
  const timeline: unknown[] = [];
  const revivals: string[] = [];
  const observedRevivalSets: Set<unknown>[] = [];
  const restoreRevivalSpies: (() => void)[] = [];
  const identities = new Map<PlainNode, number>();
  const identityOf = (node: PlainNode): number => {
    if (!identities.has(node)) identities.set(node, identities.size);
    return identities.get(node)!;
  };
  let transitionDepth = 0;
  let deriveDepth = 0;
  const originalDirty = traversal.dirtyChildren;
  const originalRegister = registration.registerRecalculation;
  const originalSelect = selection.selectChildren;
  const originalCommit = committing.commitSettlement;
  const originalTransition = transitioning.transitionSettlement;
  const originalDerive = deriving.runDeriveRounds;
  const deriveSpy = vi
    .spyOn(deriving, 'runDeriveRounds')
    .mockImplementation((...args) => {
      deriveDepth++;
      try {
        return originalDerive(...args);
      } finally {
        deriveDepth--;
      }
    });
  const transitionSpy = vi
    .spyOn(transitioning, 'transitionSettlement')
    .mockImplementation((...args) => {
      transitionDepth++;
      try {
        return originalTransition(...args);
      } finally {
        transitionDepth--;
      }
    });
  const dirtySpy = vi
    .spyOn(traversal, 'dirtyChildren')
    .mockImplementation((node, context) => {
      const children = originalDirty(node, context);
      dirty.push({
        phase: deriveDepth
          ? 'derive'
          : transitionDepth
            ? 'transition'
            : 'write',
        host: node.path,
        children: children.map((child) => child.path),
      });
      return children;
    });
  const registrationSpy = vi
    .spyOn(registration, 'registerRecalculation')
    .mockImplementation((...args) => {
      const result = originalRegister(...args);
      const context = args[0];
      timeline.push({
        event: 'registration',
        pendingExits: [...context.pendingExits.keys()],
        dirty: [...context.dirtyPaths],
        changedRaw: [...context.changedRaw],
      });
      registrations.push({
        dirty: [...context.dirtyPaths],
        shapeDirty: [...context.shapeDirtyPaths],
        owners: [...context.dependencyOwnerPaths],
        pendingExits: [...context.pendingExits.keys()],
      });
      return result;
    });
  const selectSpy = vi
    .spyOn(selection, 'selectChildren')
    .mockImplementation((...args) => {
      const context = args[1];
      if (!observedRevivalSets.includes(context.revived)) {
        observedRevivalSets.push(context.revived);
        const add = context.revived.add;
        const revivalSpy = vi
          .spyOn(context.revived, 'add')
          .mockImplementation((child) => {
            revivals.push(child.path);
            timeline.push({
              event: 'revival',
              path: child.path,
              identity: identityOf(child),
            });
            return add.call(context.revived, child);
          });
        restoreRevivalSpies.push(() => revivalSpy.mockRestore());
      }
      const computeChild = args[3];
      const result = originalSelect(
        args[0],
        args[1],
        args[2],
        (child) => {
          timeline.push({
            event: 'computeChild',
            path: child.path,
            entered: args[1].entered.has(child),
            revived: args[1].revived.has(child),
            value: child.local,
          });
          computeChild(child);
        },
        args[4],
      );
      const node = args[0];
      selections.push({
        host: node.path,
        changed: result,
        structure: Object.keys(node.structure ?? {}),
        pendingExits: [...context.pendingExits.keys()],
        revived: [...context.revived].map((child) => child.path),
        entered: [...context.entered].map((child) => child.path),
        throwingExits: [...(context.throwingGateExits ?? [])].map(
          (child) => child.path,
        ),
      });
      return result;
    });
  const commitSpy = vi
    .spyOn(committing, 'commitSettlement')
    .mockImplementation((context) => {
      originalCommit(context);
      commits.push({
        kind: context.kind,
        changedNodes: [...context.changedNodes].map((node) => node.path),
        stateDirtyNodes: [...context.stateDirtyNodes].map((node) => node.path),
        entered: [...context.entered].map((node) => node.path),
        revived: [...context.revived].map((node) => node.path),
        pendingExits: [...context.pendingExits.keys()],
        pendingExitPaths: observePendingExitPaths(context),
        failures: context.failures,
      });
    });
  let observations: unknown[];
  try {
    observations = runGateSelectionCase(
      fixture,
      undefined,
      (root) => {
        const hosts: unknown[] = [];
        const pending: PlainNode[] = [root];
        while (pending.length) {
          const node = pending.pop()!;
          hosts.push({
            path: node.path,
            identity: identityOf(node),
            structure: node.structure ? Object.keys(node.structure) : null,
            revision: node.revisionLedger,
            payload: node.pendingDelivery,
          });
          for (
            let index = (node.children?.length ?? 0) - 1;
            index >= 0;
            index--
          )
            if (node.children![index].parent === node)
              pending.push(node.children![index]);
        }
        const extra = {
          hosts,
          deliveryOrder: [...(root.runtime.deliveries ?? [])].map((node) => ({
            path: node.path,
            type: node.pendingDelivery?.type,
            payloadKinds: Object.keys(node.pendingDelivery?.payload ?? {}),
            payload: node.pendingDelivery?.payload,
            options: node.pendingDelivery?.options,
          })),
          declarationIds: root.runtime.committedDeclarationIds
            ? [...root.runtime.committedDeclarationIds]
            : [],
          dirtyChildren: dirty.splice(0),
          registrations: registrations.splice(0),
          selections: selections.splice(0),
          commits: commits.splice(0),
          timeline: timeline.splice(0),
          revivals: revivals.splice(0),
        };
        return extra;
      },
      (observation) => JSON.parse(serializeGateTableObservation(observation)),
    );
  } finally {
    dirtySpy.mockRestore();
    registrationSpy.mockRestore();
    selectSpy.mockRestore();
    commitSpy.mockRestore();
    transitionSpy.mockRestore();
    deriveSpy.mockRestore();
    for (const restore of restoreRevivalSpies) restore();
  }
  return (
    serializeGateTableObservation({
      fixture: fixture.name,
      observations,
      surface: observeGateTableDelivery(fixture),
    }) + '\n'
  );
};
