import { hasOwnProperty } from '@winglet/common-utils/lib';
import { unescapeSegment } from '@winglet/json/pointer';

import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';

/**
 * Mark development rule writes whose target did not survive the final shape.
 * @param context - Final tree and mutable per-round trace entries
 * @returns Nothing; the trace records final-shape withdrawal in place
 */
export const finalizeDeriveTrace = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  if (!context.traceRounds?.length) return;
  const live = new Map<string, boolean>();
  for (const round of context.traceRounds)
    for (let index = 0; index < round.length; index++) {
      const entry = round[index];
      if (entry.result !== 'applied') continue;
      let exists = live.get(entry.targetPath);
      if (exists === undefined) {
        let node: Self | undefined = context.root;
        for (const encoded of entry.targetPath.split('/').slice(1)) {
          const name = unescapeSegment(encoded);
          const children: Record<string, Self> | null = node?.structure ?? null;
          node = children && hasOwnProperty(children, name) ?
            children[name] : undefined;
          if (!node) break;
        }
        exists = Boolean(node && !node.detached);
        live.set(entry.targetPath, exists);
      }
      if (!exists)
        round[index] = { ...entry, result: 'withdrawn' };
    }
};
