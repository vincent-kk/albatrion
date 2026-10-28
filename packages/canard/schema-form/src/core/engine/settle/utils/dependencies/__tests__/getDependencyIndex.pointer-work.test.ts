import { afterEach, expect, it, vi } from 'vitest';

import * as pointer from '@/schema-form/helpers/jsonPointer';
import * as grammar from '@/schema-form/helpers/jsonPointer/utils/parsePointerSegments';

import { createTestTree } from '../../../../__tests__/fixtures/createTestTree';
import { WriteOption } from '../../../../types/value';
import { resetEngineDerivedRecords } from '../../../../utils/cache/derivedRecords';
import { loadFieldNodeAtMount } from '../../../loadFieldNodeAtMount';
import { getGateSelectionTable } from '../../compute/childSelection/getGateSelectionTable';
import { getDependencyIndex } from '../getDependencyIndex';
import { getLivePresenceNode } from '../getLivePresenceNode';

afterEach(() => vi.restoreAllMocks());

/** Build a static authored reader whose dependency index has real trie entries. */
const tree = () =>
  createTestTree({
    type: 'object',
    properties: {
      flag: { type: 'boolean' },
      reader: { type: 'string', controls: { active: '../flag === true' } },
    },
  });

it('reuses authored arrays across affected, presence and exact live queries', () => {
  const { root, blueprint } = tree();
  loadFieldNodeAtMount(
    root,
    { flag: true, reader: 'R' },
    WriteOption.Overwrite,
  );
  const index = getDependencyIndex(blueprint);
  const wrapper = vi.spyOn(pointer, 'parsePointer');
  const decoder = vi.spyOn(grammar, 'parsePointerSegments');
  pointer.parsePointer('/positive-control');
  expect(wrapper).toHaveBeenCalledTimes(1);
  expect(decoder).toHaveBeenCalledTimes(1);
  wrapper.mockClear();
  decoder.mockClear();
  for (let repeat = 0; repeat < 3; repeat++) {
    expect(index.affected('/flag', root)).toContain('/reader');
    expect(
      index.affectedByPresence('', 'flag', undefined, {}, root.runtime).owners,
    ).toContain('/reader');
    const registered: string[] = [];
    index.affectedForRegistration('/flag', root, {
      hit: () => [],
      owner: (path) => registered.push(path),
    });
    expect(registered).toContain('/reader');
    expect(getLivePresenceNode(root, '/reader')).toBe(root.structure!.reader);
  }
  expect(wrapper).not.toHaveBeenCalled();
  expect(decoder).not.toHaveBeenCalled();
  const segments = index.pathSegments('/reader');
  expect(index.pathSegments('/reader')).toBe(segments);
});

it('retains split host syntax while querying the current table owners', () => {
  const { root, blueprint } = createTestTree({
    type: 'object',
    properties: { kind: { type: 'string' } },
    oneOf: ['a', 'b'].map((kind) => ({
      controls: { active: `./kind === '${kind}'` },
      properties: { [kind]: { type: 'string' } },
    })),
  });
  loadFieldNodeAtMount(root, { kind: 'a', a: 'A' }, WriteOption.Overwrite);
  const index = getDependencyIndex(
    blueprint,
    new Map([
      [blueprint.root, getGateSelectionTable(blueprint.root, blueprint)!],
    ]),
  );
  expect(index.hasSplitOwners).toBe(true);
  const hostSegments = index.pathSegments('');
  const decoder = vi.spyOn(grammar, 'parsePointerSegments');
  const owners: string[] = [];
  index.affectedForRegistration('/kind', root, {
    hit: () => [],
    owner: (path) => owners.push(path),
  });
  expect(owners).toContain('/a');
  expect(owners).not.toContain('/b');
  expect(index.pathSegments('')).toBe(hostSegments);
  expect(decoder).not.toHaveBeenCalled();
});

it('keeps dynamic query misses runtime-owned and bounded without growing static syntax', () => {
  const { root, blueprint } = tree();
  const index = getDependencyIndex(blueprint);
  const authored = index.pathSegments('/reader');
  const first = index.pathSegments('/history/0', root.runtime);
  const decoder = vi.spyOn(grammar, 'parsePointerSegments');
  index.affected('/history/0', root);
  expect(index.pathSegments('/history/0', root.runtime)).toBe(first);
  expect(decoder).not.toHaveBeenCalled();
  for (let position = 1; position <= 256; position++)
    index.affected(`/history/${position}`, root);
  decoder.mockClear();
  const refilled = index.pathSegments('/history/0', root.runtime);
  expect(refilled).toEqual(first);
  expect(refilled).not.toBe(first);
  expect(decoder).toHaveBeenCalledTimes(1);
  expect(index.pathSegments('/reader')).toBe(authored);
  decoder.mockClear();
  expect(index.pathSegments('/history/0')).toEqual(first);
  expect(index.pathSegments('/history/0')).not.toBe(refilled);
  expect(decoder).toHaveBeenCalledTimes(2);
});

it('isolates presence syntax by runtime and leaves ownerless misses unretained', () => {
  const { root, blueprint } = tree();
  const index = getDependencyIndex(blueprint);
  const runtime = {};
  index.affectedByPresence('/history', '0', undefined, {}, root.runtime);
  const first = index.pathSegments('/history/0', root.runtime);
  const decoder = vi.spyOn(grammar, 'parsePointerSegments');
  index.affectedByPresence('/history', '0', undefined, {}, root.runtime);
  expect(decoder).not.toHaveBeenCalled();
  index.affectedByPresence('/history', '0', undefined, {}, runtime);
  expect(index.pathSegments('/history/0', runtime)).not.toBe(first);
  expect(decoder).toHaveBeenCalledTimes(2);
  decoder.mockClear();
  index.affectedByPresence('/history', '0');
  index.affectedByPresence('/history', '0');
  expect(decoder).toHaveBeenCalledTimes(4);
});

it('replaces prepared arrays with the derived-record generation', () => {
  const { root, blueprint } = tree();
  const before = getDependencyIndex(blueprint);
  const authored = before.pathSegments('/reader');
  const dynamic = before.pathSegments('/history/0', root.runtime);
  resetEngineDerivedRecords();
  const after = getDependencyIndex(blueprint);
  expect(after).not.toBe(before);
  expect(after.pathSegments('/reader')).toEqual(authored);
  expect(after.pathSegments('/reader')).not.toBe(authored);
  expect(after.pathSegments('/history/0', root.runtime)).toEqual(dynamic);
  expect(after.pathSegments('/history/0', root.runtime)).not.toBe(dynamic);
});
