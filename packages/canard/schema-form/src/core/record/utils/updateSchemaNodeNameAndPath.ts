import type { SchemaNodeRecord } from '../type';

/** Rebind a node's direct identity; callers rebind affected descendants separately. */
export const updateSchemaNodeNameAndPath = <Self extends { path: string; depth: number }>(
  node: SchemaNodeRecord<Self>,
  name: string,
  parent: Self | null,
): void => {
  node.parent = parent;
  node.name = name;
  node.escapedName = name.replace(/~/g, '~0').replace(/\//g, '~1');
  node.path = parent === null ? '' : `${parent.path}/${node.escapedName}`;
  node.depth = parent === null ? 0 : parent.depth + 1;
};
