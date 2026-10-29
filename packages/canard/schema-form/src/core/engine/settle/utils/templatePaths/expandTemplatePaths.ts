import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Optional } from '@aileron/declare';

import {
  PointerOperator,
  type PointerSegment,
  appendSegment,
  hasPointerOperator,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import { getCachedPointerSegments } from '../../../utils/paths/getCachedPointerSegments';

/**
 * Expand a template owner address over the currently live array positions.
 * A star segment expands only under a host with a repeating item blueprint.
 * @param root - Live tree whose array item counts determine wildcard positions
 * @param templatePath - Absolute declaration path with optional array segments
 * @param preparedSegments - Authored syntax retained by the dependency index
 * @returns Real owner paths, including a gated-out final item slot
 */
export const expandTemplatePaths = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  templatePath: string,
  preparedSegments?: readonly PointerSegment[],
): string[] => {
  if (!hasPointerOperator(templatePath, PointerOperator.Wildcard))
    return [templatePath];
  const segments =
    preparedSegments ?? getCachedPointerSegments(root.runtime, templatePath);
  const paths: string[] = [];
  const pending: { node: Optional<Self>; depth: number; path: string }[] = [
    { node: root, depth: 0, path: '' },
  ];
  while (pending.length) {
    const current = pending.pop();
    if (!current) continue;
    const { node, depth, path } = current;
    if (depth === segments.length) {
      paths.push(path);
      continue;
    }
    if (!node) continue;
    const segment = segments[depth];
    if (
      segment === PointerOperator.Wildcard &&
      node.blueprintNode.item !== undefined
    ) {
      for (let index = node.itemCount - 1; index >= 0; index--) {
        const name = String(index);
        const child = node.structure?.[name];
        if (depth + 1 === segments.length || child)
          pending.push({
            node: child,
            depth: depth + 1,
            path: appendSegment(path, name),
          });
      }
      continue;
    }
    const name = segment;
    if (typeof name !== 'string') continue;
    const structure = node.structure;
    const child =
      structure && hasOwnProperty(structure, name)
        ? structure[name]
        : undefined;
    if (depth + 1 === segments.length || child)
      pending.push({
        node: child,
        depth: depth + 1,
        path: appendSegment(path, name),
      });
  }
  return paths;
};
