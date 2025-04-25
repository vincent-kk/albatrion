import { JSONPath } from '@winglet/common-utils';

import type { SchemaNode } from '@/schema-form/core';

/**
 * AbstractNode 트리에서 주어진 경로에 해당하는 노드를 찾습니다.
 * @param target - 검색을 시작할 루트 노드
 * @param segments - 찾고자 하는 노드의 경로 세그먼트 배열 (예: ["root", "child", "0", "grandchild"])
 * @returns 찾은 노드 또는 null
 */
export const find = (
  target: any | null,
  segments: string[],
): SchemaNode | null => {
  if (!target) return null;
  if (!segments.length) return target as SchemaNode;
  let cursor = target as SchemaNode;
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (segment === JSONPath.Root) {
      cursor = cursor.rootNode;
      if (!cursor) return null;
    } else if (segment === JSONPath.Current) {
      cursor = cursor.parentNode!;
      if (!cursor) return null;
    } else {
      const children = cursor.children;
      if (!children?.length) return null;
      let found = false;
      for (const child of children) {
        if (child.node.name !== segment) continue;
        cursor = child.node;
        found = true;
        break;
      }
      if (!found) return null;
    }
  }
  return cursor;
};
