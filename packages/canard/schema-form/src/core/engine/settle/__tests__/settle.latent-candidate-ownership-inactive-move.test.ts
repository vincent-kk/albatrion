import { expect, it } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../blueprint';
import { PathKeyedMap } from '../../utils/pathIndex/PathKeyedMap';
import {
  dispatchInsert,
  dispatchMount,
  dispatchPush,
  dispatchRemove,
  dispatchSetValue,
} from '../../write';
import { getDispatchNode } from './fixtures/getDispatchNode';
import { readRetainedSlotEntry } from './fixtures/readRetainedSlotRaw';
import { readRetainedSlotRaw } from './fixtures/readRetainedSlotRaw';

it.each(['insert', 'remove'] as const)(
  'V2 %s preserves all candidate stores when destination slots become inactive',
  (operation) => {
    const item: BlueprintSchema = {
      type: 'object',
      controls: {
        active:
          operation === 'remove'
            ? '../../list/length > 2'
            : '../../list/length < 4',
      },
      allOf: [
        {
          controls: { active: '../../kind === "string"' },
          properties: { v: { type: 'string' } },
        },
        {
          controls: { active: '../../kind === "number"' },
          properties: { v: { type: 'number', default: 37 } },
        },
      ],
    };
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        kind: { type: 'string' },
        list: { type: 'array', prefixItems: [item, item, item, item] },
      },
    });
    const values = ['first', 'second', 'third'];
    dispatchMount(root, {
      kind: 'string',
      list: [{ v: 'first' }, { v: 'second' }, { v: 'third' }],
    });
    dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
    dispatchSetValue(getDispatchNode(root, 'kind'), 'none');
    const declarations = (runtime.committedDeclarationIds ??= new PathKeyedMap(
      'pair',
    ));
    const rules = (runtime.committedRuleValues ??= new PathKeyedMap('rule'));
    const sourceRules = (runtime.committedRuleKeysBySource ??= new Map());
    const targetRules = (runtime.committedRuleKeysByTarget ??= new Map());
    const metadata = values.map((_, index) => ({
      string: readRetainedSlotEntry(root, `/list/${index}/v`, 'string'),
      number: readRetainedSlotEntry(root, `/list/${index}/v`, 'number'),
    }));
    for (let index = 0; index < values.length; index++) {
      const path = `/list/${index}/v`;
      declarations.set(JSON.stringify([path, 'string']), [101 + index]);
      const rule = JSON.stringify([
        path,
        'string',
        1,
        '/retained-rule',
        'target',
        `/list/${index}/probe`,
        'number',
        3,
      ]);
      rules.set(rule, { previous: values[index] });
      sourceRules.set(path, new Set([rule]));
      targetRules.set(`/list/${index}/probe`, new Set([rule]));
      runtime.misfitPaths.add(`/list/${index}/probe`);
    }
    runtime.disableAutomaticWrites = true;
    const list = getDispatchNode(root, 'list');
    if (operation === 'insert') dispatchInsert(list, 0, {});
    else dispatchRemove(list, 0);
    for (
      let source = operation === 'insert' ? 0 : 1;
      source < values.length;
      source++
    ) {
      const destination = operation === 'insert' ? source + 1 : source - 1;
      const path = `/list/${destination}/v`;
      const stringKey = JSON.stringify([path, 'string']);
      expect(list.structure?.[String(destination)]).toBeUndefined();
      expect(readRetainedSlotRaw(root, path, 'string')).toBe(values[source]);
      expect(readRetainedSlotRaw(root, path, 'number')).toBe(37);
      const stringMetadata = metadata[source].string;
      const numberMetadata = metadata[source].number;
      if (!stringMetadata || !numberMetadata)
        throw new Error('Expected both source candidate classifications');
      expect(declarations.get(stringKey)).toEqual([101 + source]);
      const rule = JSON.stringify([
        path,
        'string',
        1,
        '/retained-rule',
        'target',
        `/list/${destination}/probe`,
        'number',
        3,
      ]);
      expect(rules.get(rule)).toEqual({ previous: values[source] });
      expect(runtime.committedRuleKeysBySource?.get(path)).toContain(rule);
      expect(
        runtime.committedRuleKeysByTarget?.get(`/list/${destination}/probe`),
      ).toContain(rule);
      expect(runtime.misfitPaths.has(`/list/${destination}/probe`)).toBe(true);
    }
    if (operation === 'insert') dispatchRemove(list, 0);
    else dispatchPush(list, {});
    dispatchSetValue(getDispatchNode(root, 'kind'), 'string');
    const retained = operation === 'insert' ? values : values.slice(1);
    for (let index = 0; index < retained.length; index++)
      expect(getDispatchNode(list, String(index), 'v').raw).toBe(
        retained[index],
      );
    dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
    for (let index = 0; index < retained.length; index++)
      expect(getDispatchNode(list, String(index), 'v').raw).toBe(37);
  },
);
