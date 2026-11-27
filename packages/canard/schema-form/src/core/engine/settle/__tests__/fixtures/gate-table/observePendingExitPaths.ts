import type { PlainNode } from '../../../../__tests__/fixtures/createPlainNode';
import type { SettlementContext } from '../../../types/settlement';

/** Preserve the off baseline path order while exposing both representations as flat path counts. */
export const observePendingExitPaths = (
  context: SettlementContext<PlainNode>,
): [string, number][] => {
  const flat = new Map<string, number>();
  const index = context.pendingExitPaths as
    | Map<string, number | Map<string, number>>
    | undefined;
  for (const [path, value] of index ?? []) {
    if (typeof value === 'number') flat.set(path, value);
    else for (const [child, count] of value) flat.set(child, count);
  }
  const ordered = new Map<string, number>();
  for (const key of context.pendingExits.keys()) {
    const path: string = JSON.parse(key)[0];
    if (flat.has(path)) ordered.set(path, flat.get(path)!);
  }
  return [...ordered];
};
