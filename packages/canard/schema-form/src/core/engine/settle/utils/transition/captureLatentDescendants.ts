import { isArray } from '@winglet/common-utils/filter';
import { unescapeSegment } from '@winglet/json/pointer';

import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import { visitFieldNodes } from '../../../navigation';
import type { FieldNodeRecord } from '../../../record';
import type { DeclarationLayer } from '../../../types/controls';
import { emptyReadonlyMap } from '../../../utils/emptyReadonlyMap';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { SettlementContext } from '../../types/settlement';
import { getControlLayers } from '../controls/getControlLayers';
import { readExitLayerPolicy } from '../controls/readExitLayerPolicy';
import { readLatentExitPolicy } from '../controls/readLatentExitPolicy';
import { getLatentPathIndex } from '../latentStore/getLatentPathIndex';
import { reachesLatentPath } from './reachesLatentPath';
import { selectCandidateOwnedLatent } from './selectCandidateOwnedLatent';
import { writeLatentRaw } from './writeLatentRaw';

/** One stored source and its last-live exit decisions. */
interface LatentEntry {
  /** Encoded path and kind of the stored occurrence. */
  readonly key: string;
  /** Absolute address used to find its ancestor policy. */
  readonly path: string;
  /** Blueprint position distinguishing branches with the same path. */
  readonly order: readonly number[];
  /** Explicit decisions saved when the occurrence left the shape. */
  readonly exitLayers?: readonly {
    layer: DeclarationLayer;
    clear: boolean;
  }[];
}

/** Policy already resolved for one ancestor occurrence. */
interface ResolvedAncestor {
  /** Absolute address of the ancestor occurrence. */
  readonly path: string;
  /** Blueprint position matching descendant entries. */
  readonly order: readonly number[];
  /** Inherited policy after this ancestor's explicit layers. */
  readonly clear: boolean;
}

/**
 * Apply a departing host's policy to its already latent descendants.
 * @param context - Transition work and reversible latent writes
 * @param node - Exiting host whose descendants may already be absent
 * @param inherited - Resolved policy at the departing host
 * @returns Nothing; cleared nodes lose raw and extras together
 */
export const captureLatentDescendants = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  node: Self,
  inherited: boolean,
): void => {
  const runtime = context.root.runtime;
  const index = getLatentPathIndex(context);
  const entries: LatentEntry[] = [];
  const ownsLatent = selectCandidateOwnedLatent(node);
  for (const key of index.get(node.path) ?? []) {
    const identity: unknown = JSON.parse(key);
    if (!isArray(identity) || typeof identity[0] !== 'string') continue;
    const path = identity[0];
    if (
      ownsLatent &&
      ownsLatent(key) &&
      !reachesLatentPath(
        node.blueprintNode,
        path === node.path
          ? []
          : path
              .slice(node.path.length + 1)
              .split('/')
              .map(unescapeSegment),
        0,
        identity[1],
      )
    ) {
      writeLatentRaw(context, key, false, undefined);
      continue;
    }
    if (path === node.path) continue;
    const info = runtime.latentRawMetadata?.get(key);
    if (info)
      entries.push({
        key,
        path,
        order: info.order,
        exitLayers: info.exitLayers,
      });
  }
  entries.sort((left, right) => left.path.length - right.path.length);
  const live = new Map<string, Self>();
  visitFieldNodes(
    node,
    (current) => {
      live.set(
        JSON.stringify([
          current.path,
          getBlueprintNodeIdentity(current.blueprintNode),
        ]),
        current,
      );
    },
    { owned: true },
  );
  const resolved = new Map<string, ResolvedAncestor[]>([
    [node.path, [{ path: node.path, order: [], clear: inherited }]],
  ]);
  for (const entry of entries) {
    let parentPath = entry.path.slice(0, entry.path.lastIndexOf($.Separator));
    let parent: ResolvedAncestor | undefined;
    while (!parent && parentPath.length >= node.path.length) {
      parent = resolved
        .get(parentPath)
        ?.find((candidate) =>
          candidate.order.every(
            (position, index) => position === entry.order[index],
          ),
        );
      if (parentPath === node.path) break;
      parentPath = parentPath.slice(0, parentPath.lastIndexOf($.Separator));
    }
    const inheritedPolicy = parent?.clear ?? inherited;
    const current = live.get(entry.key);
    const clear = current
      ? readExitLayerPolicy(
          getControlLayers(current, emptyReadonlyMap),
          context.root.runtime.committedRuleValues,
          inheritedPolicy,
        )
      : readLatentExitPolicy(entry.exitLayers, inheritedPolicy);
    const samePath = resolved.get(entry.path) ?? [];
    samePath.push({ path: entry.path, order: entry.order, clear });
    resolved.set(entry.path, samePath);
    if (clear && (!ownsLatent || ownsLatent(entry.key)))
      writeLatentRaw(context, entry.key, false, undefined);
  }
};
