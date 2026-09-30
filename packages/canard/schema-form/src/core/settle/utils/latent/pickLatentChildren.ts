import { hasOwnProperty } from '@winglet/common-utils/lib';
import { escapeSegment } from '@winglet/json/pointer';
import type { BlueprintNode } from '../../../blueprint';

/**
 * Choose one child declaration per name when expanding a latent host value.
 * @param template - Host template whose child edges are in blueprint total order
 * @param path - Absolute path of the latent host
 * @param value - Host value whose own keys supply implicit children
 * @param latent - Latent raw map whose explicit keys outrank the host value
 * @returns Indices into the template's child edges, at most one per name
 */
export const pickLatentChildren = (
  template: BlueprintNode, path: string, value: object,
  latent: ReadonlyMap<string, unknown>,
): number[] => {
  const picked = new Map<string, { index: number; explicit: boolean }>();
  template.childEntries.forEach((child, index) => {
    const explicit = latent.has(JSON.stringify([
      `${path}/${escapeSegment(child.name)}`, child.node.kind,
    ]));
    const held = picked.get(child.name);
    if (!held || (explicit && !held.explicit))
      picked.set(child.name, { index, explicit });
  });
  return [...picked.values()].filter(({ index, explicit }) => explicit ||
    hasOwnProperty(value, template.childEntries[index].name))
    .map(({ index }) => index);
};
