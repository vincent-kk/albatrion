import { JSONPath } from '@lumy/schema-form/types';

import type { BaseNode } from '../../BaseNode';

const PATH_NORMALIZE_REGEX = /(?:^\.|\.(?=\d))([^.[]*)|\[(\d+)\]/g;

/**
 * BaseNode 트리에서 주어진 경로에 해당하는 노드를 찾습니다.
 * @param target - 검색을 시작할 루트 노드
 * @param path - 찾고자 하는 노드의 경로 (예: "root.child[0].grandchild")
 * @returns 찾은 노드 또는 null
 */
export const find = <Node extends BaseNode>(
  target: Node | null,
  path: string | null,
): Node | null => {
  // 초기 검사로 빠른 반환
  if (!target) return null;
  if (!path) return target;

  // path 정규화
  let normalizedPath = path.replace(
    PATH_NORMALIZE_REGEX,
    (_, p1, p2) => p1 || p2,
  );

  // 경로 분할 최적화
  let currentTarget = target;

  while (normalizedPath) {
    const dotIndex = normalizedPath.indexOf('.');
    const currentPath =
      dotIndex === -1 ? normalizedPath : normalizedPath.slice(0, dotIndex);

    // 다음 반복을 위한 경로 업데이트
    normalizedPath = dotIndex === -1 ? '' : normalizedPath.slice(dotIndex + 1);

    // 특수 경로 처리
    if (currentPath === JSONPath.Root) {
      currentTarget = currentTarget.rootNode as Node;
      if (!currentTarget) return null;
      continue;
    }

    if (currentPath === JSONPath.Current) {
      currentTarget = currentTarget.parentNode as Node;
      if (!currentTarget) return null;
      continue;
    }

    // 일반 경로 처리
    const children = currentTarget.children?.();
    if (!children) return null;

    const found = children.find((e) => e.node.getName() === currentPath);
    if (!found) return null;

    currentTarget = found.node as unknown as Node;
  }

  return currentTarget;
};
