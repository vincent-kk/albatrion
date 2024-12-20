import type { BaseNode } from '@lumy-pack/schema-form/src/core/nodes/BaseNode';
import { JSONPath } from '@lumy-pack/schema-form/src/types';

export function find(target: any, path: string): BaseNode | any {
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
