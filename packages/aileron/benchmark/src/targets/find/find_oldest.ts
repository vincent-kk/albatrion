import { JSONPath } from '@winglet/json/path';

import type { FieldNode } from '@/schema-form/core';

export function find(target: FieldNode | null, path: string): FieldNode | null {
  const [currPath, ...rest] = path
    .replace(/^\.([^.])/, '$1')
    // to access array items
    .replace(/\[(\d+)\]/g, '.$1')
    .split(JSONPath.Child);
  if (path === '') {
    return target;
  } else if (currPath === JSONPath.Root) {
    return find(target?.rootNode, rest.join(JSONPath.Child));
  } else if (currPath === JSONPath.Current) {
    return find(target?.parentNode, rest.join(JSONPath.Child));
  } else if (target?.children) {
    const children = target.children;
    const found = children.find((e) => e?.name === currPath);
    if (found && rest.length > 0) {
      return find(found, rest.join(JSONPath.Child));
    }
    return found || null;
  }
  return null;
}
