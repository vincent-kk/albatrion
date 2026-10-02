import { hasOwnProperty } from '@winglet/common-utils/lib';
import { unescapeSegment } from '@winglet/json/pointer';

import type { SchemaNodeRecord } from '../../../record';

/**
 * Expand a template owner address over the currently live array positions.
 * @param root - Live tree whose array item counts determine wildcard positions
 * @param templatePath - Absolute declaration path with optional array segments
 * @returns Real owner paths, including a gated-out final item slot
 */
export const expandTemplatePaths = <Self extends SchemaNodeRecord<Self>>(
  root: Self, templatePath: string,
): string[] => {
  if (!templatePath.includes('/*')) return [templatePath];
  const segments = templatePath.split('/').slice(1);
  const paths: string[] = [];
  const pending: { node: Self | undefined; depth: number; path: string }[] = [
    { node: root, depth: 0, path: '' },
  ];
  while (pending.length) {
    const current = pending.pop();
    if (!current) continue;
    const { node, depth, path } = current;
    if (depth === segments.length) { paths.push(path); continue; }
    if (!node) continue;
    const segment = segments[depth];
    if (segment === '*') {
      for (let index = node.itemCount - 1; index >= 0; index--) {
        const name = String(index);
        const child = node.structure?.[name];
        if (depth + 1 === segments.length || child)
          pending.push({ node: child, depth: depth + 1, path: `${path}/${name}` });
      }
      continue;
    }
    const name = unescapeSegment(segment);
    const structure = node.structure;
    const child = structure && hasOwnProperty(structure, name)
      ? structure[name] : undefined;
    if (depth + 1 === segments.length || child)
      pending.push({ node: child, depth: depth + 1,
        path: `${path}/${segment}` });
  }
  return paths;
};
