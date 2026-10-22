import { expect } from 'vitest';

import { createTestTree } from '../../../../__tests__/fixtures/createTestTree';
import type { BlueprintSchema } from '../../../../blueprint';
import { WriteOption } from '../../../../types/value';
import { dispatchMount } from '../../../../write';
import type { SplitBucket } from '../../../types/splitRegistration';
import { getGateSelectionTable } from '../../../utils/compute/childSelection/getGateSelectionTable';
import { prepareGateSelection } from '../../../utils/compute/childSelection/prepareGateSelection';
import { getDependencyIndex } from '../../../utils/dependencies/getDependencyIndex';
import { DirtyPathSet } from '../../../utils/scratch/DirtyPathSet';

/** Private trie projection used only to verify retained bucket identities. */
interface PreparedTrie {
  splitBuckets?: readonly SplitBucket[];
  children: ReadonlyMap<string, PreparedTrie>;
}

/**
 * Capture static preparation content, reference sharing, query order and actual anchor keys.
 * @param schema - Pre-change loading fixture or a boundary-path schema
 * @param input - Mount input used to materialize array and nested query occurrences
 * @returns Stable JSON retaining every object alias through numbered references
 */
export const captureDependencyPreparation = (
  schema: BlueprintSchema,
  input?: unknown,
): string => {
  const { root, blueprint } = createTestTree(schema);
  prepareGateSelection(blueprint);
  const index = getDependencyIndex(blueprint);
  const tables = blueprint.nodes.map((node) => [
    node.id,
    getGateSelectionTable(node, blueprint),
  ]);
  const trie = Reflect.get(index, 'root') as PreparedTrie | undefined;
  const buckets: SplitBucket[] = [];
  const pending = trie ? [trie] : [];
  while (pending.length) {
    const node = pending.pop()!;
    for (const bucket of node.splitBuckets ?? []) buckets.push(bucket);
    for (const child of node.children.values()) pending.push(child);
  }
  for (const owner of index.splitOwners.values())
    expect(buckets.includes(owner.bucket)).toBe(true);
  const dirty = new DirtyPathSet(new Map());
  dirty.configureSplitOwners(index.splitOwners);
  for (const bucket of buckets)
    for (const event of dirty.planSplitAnchors(bucket, [], 7)) event.insert();
  dispatchMount(root, input, WriteOption.Overwrite);
  const paths = [
    '',
    '/kind',
    '/common',
    '/missing',
    '/',
    '//value',
    '/a~1b',
    '/items/0/value',
  ];
  for (const node of blueprint.nodes)
    if (!paths.includes(node.path)) paths.push(node.path);
  const queries = paths.map((path) => [path, index.affected(path, root)]);
  const nodeIds = new Map<object, number>(
    blueprint.nodes.map((node) => [node, node.id]),
  );
  const seen = new Map<object, number>();
  const encode = (value: unknown): unknown => {
    if (value === undefined) return { $undefined: true };
    if (typeof value === 'function') return { $function: value.name };
    if (value === null || typeof value !== 'object') return value;
    const nodeId = nodeIds.get(value);
    if (nodeId !== undefined) return { $blueprintNode: nodeId };
    const previous = seen.get(value);
    if (previous !== undefined) return { $ref: previous };
    const id = seen.size;
    seen.set(value, id);
    if (Array.isArray(value)) return { $id: id, array: value.map(encode) };
    if (value instanceof Map)
      return {
        $id: id,
        map: [...value].map(([key, entry]) => [encode(key), encode(entry)]),
      };
    if (value instanceof Set) return { $id: id, set: [...value].map(encode) };
    return {
      $id: id,
      object: Object.keys(value).map((key) => [
        key,
        encode(Reflect.get(value, key)),
      ]),
    };
  };
  return (
    JSON.stringify(
      encode({
        trie,
        splitOwners: index.splitOwners,
        tables,
        queries,
        anchors: dirty.childrenByParent,
      }),
      null,
      2,
    ) + '\n'
  );
};
