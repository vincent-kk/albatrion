import { JSONPath } from '@lumy/schema-form/types';

import { SchemaNode } from '../../../type';

/**
 * BaseNode 트리에서 주어진 경로에 해당하는 노드를 찾습니다.
 * @param target - 검색을 시작할 루트 노드
 * @param pathSegments - 찾고자 하는 노드의 경로 세그먼트 배열 (예: ["root", "child", "0", "grandchild"])
 * @returns 찾은 노드 또는 null
 */
export const find = (
  target: SchemaNode | null,
  pathSegments: string[] | null,
): SchemaNode | null => {
  // 초기 검사로 빠른 반환
  if (!target) return null;
  if (!pathSegments?.length) return target;

  let currentTarget = target;

  for (const segment of pathSegments) {
    // 특수 경로 처리
    if (segment === JSONPath.Root) {
      currentTarget = currentTarget.rootNode;
      if (!currentTarget) return null;
      continue;
    }

    if (segment === JSONPath.Current) {
      currentTarget = currentTarget.parentNode!;
      if (!currentTarget) return null;
      continue;
    }

    // 일반 경로 처리
    const children = currentTarget.children;
    if (!children) return null;

    const found = children.find((e) => e.node.name === segment);
    if (!found) return null;

    currentTarget = found.node;
  }

  return currentTarget;
};
