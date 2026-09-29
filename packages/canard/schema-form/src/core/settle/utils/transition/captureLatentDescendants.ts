import { hasOwnProperty } from '@winglet/common-utils/lib';
import { unescapeSegment } from '@winglet/json/pointer';
import { escapeSegment } from '@winglet/json/pointer';
import type { BlueprintNode } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { writeLatentRaw } from './writeLatentRaw';

/** Read a previously active node policy without evaluating a detached node. */
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

/** Remove a nested object field without changing caller-owned raw references. */
const omitRawPath = (raw: unknown, segments: readonly string[]): unknown => {
  if (!segments.length || raw === null || typeof raw !== 'object' ||
    Array.isArray(raw)) return raw;
  const name = unescapeSegment(segments[0]);
  if (!hasOwnProperty(raw, name)) return raw;
  const copy = { ...raw };
  if (segments.length === 1) Reflect.deleteProperty(copy, name);
  else Reflect.set(copy, name,
    omitRawPath(Reflect.get(raw, name), segments.slice(1)));
  return copy;
};

/**
 * Apply an exiting ancestor's policy to descendants that exited earlier.
 * @param context - Transition work and reversible latent-map writes
 * @param node - Exiting branch whose live children were already processed
 * @param retained - Raw retained for this branch after live-child clearing
 * @param inherited - This branch's resolved policy for its descendants
 * @returns Retained raw with any newly cleared latent fields omitted
 */
export const captureLatentDescendants = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>, node: Self, retained: unknown, inherited: boolean,
): unknown => {
  const prefix = `${node.path}/`;
  const entries: { key: string; path: string; template: BlueprintNode }[] = [];
  const latent = context.root.runtime.latentRaw;
  const seenKeys = new Set<string>();
  /** Follow only latent child edges within this exiting declaration subtree. */
  const visit = (template: BlueprintNode, path: string): void => {
    for (const edge of template.childEntries) {
      const childPath = `${path}/${escapeSegment(edge.name)}`;
      const key = JSON.stringify([childPath, edge.node.kind]);
      if (!latent.has(key) || seenKeys.has(key)) continue;
      seenKeys.add(key);
      entries.push({ key, path: childPath, template: edge.node });
      visit(edge.node, childPath);
    }
  };
  visit(node.blueprintNode, node.path);
  const policies = new Map<string, boolean>([[node.path, inherited]]);
  const ancestorKeys = new Map<string, string>();
  for (const entry of entries) {
    let parent = entry.path.slice(0, entry.path.lastIndexOf('/'));
    while (!policies.has(parent) && parent.startsWith(prefix))
      parent = parent.slice(0, parent.lastIndexOf('/'));
    const clear = latentPolicy(context, entry.key, entry.template,
      policies.get(parent) ?? inherited);
    policies.set(entry.path, clear);
    if (!clear) {
      ancestorKeys.set(entry.path, entry.key);
      continue;
    }
    writeLatentRaw(context, entry.key, false, undefined);
    retained = omitRawPath(retained, entry.path.slice(prefix.length).split('/'));
    for (const [ancestorPath, ancestorKey] of ancestorKeys) {
      if (!entry.path.startsWith(`${ancestorPath}/`) ||
        !context.root.runtime.latentRaw.has(ancestorKey)) continue;
      const source = context.root.runtime.latentRaw.get(ancestorKey);
      writeLatentRaw(context, ancestorKey, true,
        omitRawPath(source, entry.path.slice(ancestorPath.length + 1).split('/')));
    }
  }
  return retained;
};
