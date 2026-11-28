import {
  PointerOperator,
  readPointerSegment,
} from '@/schema-form/helpers/jsonPointer';

import type { SchemaFragment } from '../../../../blueprint';

/**
 * Report whether a fragment is reached from a start fragment by child links along one
 * instance path. A child whose host differs from its parent's moves the instance by the
 * last segment of its host, which must equal the next token or be the item wildcard; a
 * child with the parent's host is followed freely, as `$ref`, `allOf/<n>` and `then` are.
 * @param start - Fragment the walk starts from, bound at the first occurrence of the path.
 * @param tokens - Instance names from that occurrence down to the target's occurrence.
 * @param target - Fragment looked for among those reached at the end of the path.
 * @param fragments - The blueprint's fragment table, indexed by fragment id.
 * @returns True when the target is among the fragments reached after the last token.
 */
export const reachesFragment = (
  start: SchemaFragment,
  tokens: readonly string[],
  target: SchemaFragment,
  fragments: readonly SchemaFragment[],
): boolean => {
  let reached = followStaying([start], fragments);
  for (const token of tokens) {
    const moved: SchemaFragment[] = [];
    for (const fragment of reached)
      for (const id of fragment.children) {
        const child = fragments[id];
        if (child.hostPath === fragment.hostPath) continue;
        const name = readPointerSegment(child.hostPath, -1);
        if (name === token || name === PointerOperator.Wildcard)
          moved.push(child);
      }
    reached = followStaying(moved, fragments);
  }
  return reached.includes(target);
};

/**
 * Add every fragment reached from the given ones through links that keep the instance.
 * @param from - Fragments bound at one occurrence.
 * @param fragments - The blueprint's fragment table, indexed by fragment id.
 * @returns The given fragments and those reached without a move, each once.
 */
const followStaying = (
  from: readonly SchemaFragment[],
  fragments: readonly SchemaFragment[],
): SchemaFragment[] => {
  const reached = [...from];
  for (let index = 0; index < reached.length; index++)
    for (const id of reached[index].children) {
      const child = fragments[id];
      if (
        child.hostPath === reached[index].hostPath &&
        !reached.includes(child)
      )
        reached.push(child);
    }
  return reached;
};
