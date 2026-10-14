import { JSONPath } from '@winglet/json/path';

import type { FieldNode } from '@/schema-form/core/nodes/type';

export const find = (target: FieldNode, path: string[]): FieldNode | null => {
  const [currPath, ...rest] = path;

  if (path.length === 0) {
    return target;
  } else if (currPath === JSONPath.Root) {
    return find(target?.rootNode, rest);
  } else if (currPath === JSONPath.Current) {
    return find(target?.parentNode as FieldNode, rest);
  } else if (target?.children) {
    const children = target.children;
    const found = children.find((e) => e.node.name === currPath);
    if (found && rest.length > 0) {
      return find(found.node, rest);
    }
    return found?.node || null;
  }
  return null;
};
