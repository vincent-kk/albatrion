import { expect, it } from 'vitest';

import { pinLatentBaseline } from '../../../../__tests__/fixtures/pinLatentBaseline';
import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../../blueprint';
import {
  dispatchInsert,
  dispatchMount,
  dispatchRemove,
  dispatchSetValue,
} from '../../../write';
import { createCandidateSourceRecord } from '../../__tests__/fixtures/createCandidateSourceRecord';
import { getDispatchNode } from '../../__tests__/fixtures/getDispatchNode';

it.each(['destination', 'nested', 'direct-control'] as const)(
  'preserves candidate sources when the %s array exits during its move settlement',
  (scene) => {
    // These assertions inspect the latent-store baseline directly.
    pinLatentBaseline();
    const gate =
      scene === 'nested' ? '../../../list/length < 2' : '../../list/length < 2';
    const path = scene === 'nested' ? '../../../../kind' : '../../../kind';
    const array: BlueprintSchema =
      scene === 'direct-control'
        ? {
            type: 'array',
            controls: { active: gate },
            allOf: [
              {
                controls: { active: '../../kind === "string"' },
                items: { type: 'string' },
              },
              {
                controls: { active: '../../kind === "number"' },
                items: { type: 'number', default: 37 },
              },
            ],
          }
        : {
            type: 'array',
            controls: { active: gate },
            items: createCandidateSourceRecord(path, 37),
          };
    const item: BlueprintSchema =
      scene === 'nested'
        ? { type: 'object', properties: { values: array } }
        : array;
    const initial =
      scene === 'direct-control'
        ? ['live']
        : scene === 'nested'
          ? { values: [{ v: 'live' }] }
          : [{ v: 'live' }];
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        kind: { type: 'string' },
        list: { type: 'array', prefixItems: [item, item] },
      },
    });
    dispatchMount(root, { kind: 'string', list: [initial] });
    dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
    dispatchSetValue(getDispatchNode(root, 'kind'), 'string');
    runtime.disableAutomaticWrites = true;
    const list = getDispatchNode(root, 'list');
    dispatchInsert(list, 0, scene === 'nested' ? {} : []);
    const suffix =
      scene === 'direct-control'
        ? '/0'
        : scene === 'nested'
          ? '/values/0/v'
          : '/0/v';
    const pathAtExit = '/list/1' + suffix;
    expect(runtime.latentRaw.get(JSON.stringify([pathAtExit, 'number']))).toBe(
      37,
    );
    expect(runtime.latentRaw.get(JSON.stringify([pathAtExit, 'string']))).toBe(
      'live',
    );
    expect(
      runtime.latentRawMetadata?.get(JSON.stringify([pathAtExit, 'number'])),
    ).toMatchObject({ path: pathAtExit });
    dispatchRemove(list, 0);
    dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
    const expected =
      scene === 'direct-control'
        ? [37]
        : scene === 'nested'
          ? { values: [{ v: 37 }] }
          : [{ v: 37 }];
    expect(list.emit).toEqual([expected]);
    dispatchSetValue(getDispatchNode(root, 'kind'), 'string');
    expect(list.emit).toEqual([initial]);
  },
);
