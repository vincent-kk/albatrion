import { JSONPath } from '@winglet/json-schema';

import type { AbstractNode } from '@/schema-form/core/nodes/AbstractNode';

export function find(target: any, path: string): AbstractNode | any {
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
    const found = children.find((e: any) => e?.node?.name === currPath);
    if (found && rest.length > 0) {
      return find(found.node, rest.join(JSONPath.Child));
    }
    return found?.node || null;
  }
  return null;
}
