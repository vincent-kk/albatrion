// Internal test/bench mode is runtime-owned; public readers use committed arrays only.
import { visitFieldNodes } from '../../../navigation';
import type { FieldNodeRecord, FieldNodeRuntime } from '../../../record';
import { engineModes } from '../../../utils/cache/engineModes';
import { PathKeyedMap } from '../../../utils/pathIndex/PathKeyedMap';
import type { SettlementContext } from '../../types/settlement';
import { rebuildInactiveValuesMemo } from './utils/inactiveValues/rebuildInactiveValuesMemo';
import { updateInactiveHostLists } from './utils/inactiveValues/updateInactiveHostLists';
import { updateInactiveValueEntries } from './utils/inactiveValues/updateInactiveValueEntries';
import { verifyInactiveValuesMemo } from './verifyInactiveValuesMemo';

/**
 * Publish the latent delta, rebuilding after wholesale source or address changes.
 * @param root - Final shape and root-owned latent source of truth
 * @param context - Completed settlement's entry, exit and load boundaries
 * @returns Nothing; affected host lists receive new frozen publications
 */
export const updateInactiveValuesMemo = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  context?: SettlementContext<Self>,
): void => {
  const runtime = root.runtime;
  const rebuild =
    !runtime.inactiveValueOrders ||
    runtime.inactiveValuesRebuild ||
    !runtime.inactiveValuesMemo.has('') ||
    context?.kind === 'load' ||
    engineModes.inactiveValues === 'rebuild' ||
    (runtime.latentRawDirty && !runtime.inactiveValueChanges?.size);
  if (
    !rebuild &&
    !runtime.latentRawDirty &&
    !runtime.inactiveValueChanges?.size &&
    !context?.entered.size &&
    !context?.exited.size &&
    !context?.revived.size
  )
    return;
  const oracle: FieldNodeRuntime<Self> | undefined =
    engineModes.inactiveValues === 'verify'
      ? {
          ...runtime,
          latentRawDirty: true,
          latentRawMetadata:
            runtime.latentRawMetadata &&
            new PathKeyedMap('pair', runtime.latentRawMetadata),
          inactiveValueEntries: new PathKeyedMap(
            'pair',
            runtime.inactiveValueEntries,
          ),
          inactiveValuesMemo: new PathKeyedMap(
            'path',
            runtime.inactiveValuesMemo,
          ),
        }
      : undefined;
  if (rebuild) {
    runtime.latentRawDirty = true;
    rebuildInactiveValuesMemo(root);
    const orders = (runtime.inactiveValueOrders = new WeakMap());
    for (const item of runtime.inactiveValueEntries!.values())
      orders.set(item.entry, item.order);
  } else {
    const paths = new Set<string>();
    for (const key of runtime.inactiveValueChanges ?? []) {
      const info = runtime.latentRawMetadata?.get(key);
      if (info) paths.add(info.path);
    }
    if (context) {
      for (const node of context.entered) paths.add(node.path);
      for (const node of context.revived) paths.add(node.path);
      for (const node of context.exited)
        visitFieldNodes(
          node,
          (departing) => {
            paths.add(departing.path);
          },
          { owned: true },
        );
    }
    updateInactiveHostLists(runtime, updateInactiveValueEntries(root, paths));
    for (const key of runtime.inactiveValueChanges ?? [])
      if (!runtime.latentRaw.has(key)) runtime.latentRawMetadata?.delete(key);
    runtime.latentRawDirty = false;
  }
  runtime.inactiveValueChanges?.clear();
  runtime.inactiveValuesRebuild = false;
  if (oracle) verifyInactiveValuesMemo(root, oracle);
};
