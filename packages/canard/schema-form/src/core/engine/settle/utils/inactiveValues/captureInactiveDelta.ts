import { find, visitFieldNodes } from '../../../navigation';
import type { FieldNodeRecord } from '../../../record';
import type { InactiveSource } from '../../types/inactiveValues';
import type { SettlementContext } from '../../types/settlement';

/**
 * Capture only changed existing keys and occurrence paths at the final shape.
 * @param root - Current committed shape; path strings already belong to its records
 * @param context - Entry/exit facts from the completed settlement
 * @returns Immutable source and visibility journal facts without list arrays
 */
export const captureInactiveDelta = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  context?: SettlementContext<Self>,
) => {
  const runtime = root.runtime;
  const changes = new Map<string, InactiveSource>();
  const visibility = new Map<string, boolean>();
  if (context) {
    for (const node of context.exited)
      visitFieldNodes(
        node,
        (departing) => {
          visibility.set(departing.path, false);
        },
        { owned: true },
      );
    for (const node of context.entered) visibility.set(node.path, false);
    for (const node of context.revived) visibility.set(node.path, false);
  }
  for (const path of visibility.keys())
    visibility.set(path, find(root, path) !== null);
  for (const key of runtime.inactiveValueChanges ?? []) {
    const info = runtime.latentRawMetadata?.get(key);
    if (!info) continue;
    let visible = visibility.get(info.path);
    if (visible === undefined)
      visibility.set(info.path, (visible = find(root, info.path) !== null));
    changes.set(key, {
      key,
      path: info.path,
      present: runtime.latentRaw.has(key),
      source: runtime.latentRaw.get(key),
      template: info.blueprintNode,
      order: info.order,
      visible,
    });
  }
  return { changes, visibility };
};
