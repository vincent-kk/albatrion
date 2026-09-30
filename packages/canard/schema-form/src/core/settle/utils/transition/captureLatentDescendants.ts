import { hasOwnProperty } from '@winglet/common-utils/lib';
import type { BlueprintNode } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { writeLatentRaw } from './writeLatentRaw';

/** Resolve the last committed declaration policy for an absent descendant. */
const latentPolicy = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>, key: string, template: BlueprintNode,
  inherited: boolean,
): boolean => {
  const ids = context.root.runtime.committedDeclarationIds?.get(key);
  if (!ids?.length) return inherited;
  let clear = false;
  for (const declaration of template.declarations) {
    if (!ids.includes(declaration.id) || declaration.scope !== 'node' ||
      declaration.schema === null || typeof declaration.schema !== 'object') continue;
    const controls = declaration.schema.controls;
    if (controls === null || typeof controls !== 'object' ||
      !hasOwnProperty(controls, 'unsetOnInactive')) continue;
    const policy: unknown = Reflect.get(controls, 'unsetOnInactive');
    if (policy === false) return false;
    if (policy === true) clear = true;
  }
  return clear || inherited;
};

/**
 * Apply a departing host's policy to its already latent descendants.
 * @param context - Transition work and reversible latent writes
 * @param node - Exiting host whose descendants may already be absent
 * @param inherited - Resolved policy at the departing host
 * @returns Nothing; cleared nodes lose raw and extras together
 */
export const captureLatentDescendants = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>, node: Self, inherited: boolean,
): void => {
  const prefix = `${node.path}/`;
  const entries: { key: string; path: string; template: BlueprintNode }[] = [];
  for (const key of context.root.runtime.latentRaw.keys()) {
    const info = context.root.runtime.latentRawMetadata?.get(key);
    if (info && info.path.startsWith(prefix))
      entries.push({ key, path: info.path, template: info.blueprintNode });
  }
  entries.sort((left, right) => left.path.length - right.path.length);
  const policies = new Map<string, boolean>([[node.path, inherited]]);
  for (const entry of entries) {
    let parent = entry.path.slice(0, entry.path.lastIndexOf('/'));
    while (!policies.has(parent) && parent.startsWith(prefix))
      parent = parent.slice(0, parent.lastIndexOf('/'));
    const clear = latentPolicy(context, entry.key, entry.template,
      policies.get(parent) ?? inherited);
    policies.set(entry.path, clear);
    if (clear) writeLatentRaw(context, entry.key, false, undefined);
  }
};
