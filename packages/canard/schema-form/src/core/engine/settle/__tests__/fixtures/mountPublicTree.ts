import { isTestFieldNode } from '@/schema-form/core/__tests__/fixtures/testFieldNode';
import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import { isArrayNode, mountFieldNode } from '@/schema-form/core/surface';

import type { BlueprintSchema } from '../../../blueprint';

/**
 * Mount a public node tree the way a Form does, with `value` as the first load.
 * @param schema - Authored schema compiled by the shipping blueprint and validated by Ajv 8
 * @param value - First-load source; undefined loads only the schema's literal defaults
 * @returns The mounted root, which also exposes its runtime record, and lookups that throw
 *   when no live node, or no array node, sits at the path
 */
export const mountPublicTree = (schema: BlueprintSchema, value?: unknown) => {
  const { root } = makeFieldNodeTree(schema, { snapshot: value });
  if (!isTestFieldNode(root)) throw new Error('Expected a runtime FieldNode');
  mountFieldNode(root);
  return {
    root,
    at: (path: string) => {
      const node = root.find(path);
      if (!node) throw new Error(`Expected a live node at ${path}`);
      return node;
    },
    arrayAt: (path: string) => {
      const node = root.find(path);
      if (!isArrayNode(node)) throw new Error(`Expected an array at ${path}`);
      return node;
    },
  };
};
