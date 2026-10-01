import { hasOwnProperty } from '@winglet/common-utils/lib';
import { escapeSegment } from '@winglet/json/pointer';
import type { BlueprintNode } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { isPlain } from '../write/isPlain';
import { getLatentPathIndex } from './getLatentPathIndex';
import { HostLatent } from './HostLatent';

/**
 * Recompose a gated-out item from its retained own-kind latent sources.
 * @param context - Settlement retaining sources by actual occurrence path and kind
 * @param path - Runtime position of the absent item or descendant
 * @param template - Blueprint kind and declared children at that position
 * @returns Its retained source value, or undefined when no source exists
 */
export const readLatentSlotSource = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>, path: string, template: BlueprintNode,
): unknown => {
  const runtime = context.root.runtime;
  const own = runtime.latentRaw.get(JSON.stringify([path, template.kind]));
  if (own !== undefined && !(own instanceof HostLatent)) return own;
  if (own instanceof HostLatent && own.raw !== undefined) return own.raw;
  if (template.kind !== 'object' || template.strategy !== 'branch')
    return undefined;
  if (own === undefined) {
    const ignored = new Set<string>();
    for (const node of [...context.entered, ...context.revived])
      if (!node.detached && (!node.parent || node.parent.structure?.[node.name] === node))
        ignored.add(JSON.stringify([node.path, node.blueprintNode.kind]));
    let hasDescendant = false;
    for (const key of getLatentPathIndex(context).get(path) ?? []) {
      if (ignored.has(key) || JSON.parse(key)[0] === path) continue;
      hasDescendant = true;
      break;
    }
    if (!hasDescendant) return undefined;
  }
  const value: Record<string, unknown> = own instanceof HostLatent &&
    isPlain(own.extras) ? { ...own.extras } : {};
  let found = Object.keys(value).length > 0;
  for (const entry of template.childEntries) {
    if (hasOwnProperty(value, entry.name)) continue;
    const child = readLatentSlotSource(context,
      `${path}/${escapeSegment(entry.name)}`, entry.node);
    if (child === undefined) continue;
    Object.defineProperty(value, entry.name, { value: child, enumerable: true,
      configurable: true, writable: true });
    found = true;
  }
  return found ? value : undefined;
};
