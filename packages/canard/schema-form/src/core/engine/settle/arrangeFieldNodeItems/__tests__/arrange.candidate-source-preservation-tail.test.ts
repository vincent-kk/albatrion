import { expect, it } from 'vitest';

import { pinLatentBaseline } from '../../../../__tests__/fixtures/pinLatentBaseline';
import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import {
  dispatchInsert,
  dispatchMount,
  dispatchRemove,
  dispatchSetValue,
} from '../../../write';
import { createCandidateSourceRecord } from '../../__tests__/fixtures/createCandidateSourceRecord';
import { getDispatchNode } from '../../__tests__/fixtures/getDispatchNode';

it('retains live and latent candidate sources while a slot is parked in an undeclared tail', () => {
  // These assertions inspect the latent-store baseline directly.
  pinLatentBaseline();
  const { root, runtime } = createDispatchTree({
    type: 'object',
    properties: {
      kind: { type: 'string' },
      list: {
        type: 'array',
        prefixItems: [createCandidateSourceRecord('../../kind', 37)],
      },
    },
  });
  dispatchMount(root, { kind: 'string', list: [{ v: 'live' }] });
  const list = getDispatchNode(root, 'list');
  const old = getDispatchNode(list, '0');
  dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
  dispatchSetValue(getDispatchNode(root, 'kind'), 'string');
  const key = JSON.stringify(['/list/0/v', 'number']);
  const metadata = runtime.latentRawMetadata?.get(key);
  expect(metadata).toBeDefined();
  runtime.disableAutomaticWrites = true;
  dispatchInsert(list, 0, {});
  expect(old.detached).toBe(true);
  expect(list.emit).toEqual([{}, { v: 'live' }]);
  expect(runtime.latentRaw.get(JSON.stringify(['/list/1/v', 'string']))).toBe(
    'live',
  );
  expect(runtime.latentRaw.get(JSON.stringify(['/list/1/v', 'number']))).toBe(
    37,
  );
  expect(
    runtime.latentRawMetadata?.get(JSON.stringify(['/list/1/v', 'number'])),
  ).toEqual({
    ...metadata,
    path: '/list/1/v',
    order: [1, 1, 1],
  });
  dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
  dispatchRemove(list, 0);
  expect(list.emit).toEqual([{ v: 37 }]);
  expect(runtime.latentRaw.get(JSON.stringify(['/list/0/v', 'string']))).toBe(
    'live',
  );
  dispatchSetValue(getDispatchNode(root, 'kind'), 'string');
  expect(root.emit).toEqual({ kind: 'string', list: [{ v: 'live' }] });
  expect(runtime.latentRaw.get(key)).toBe(37);
  expect(runtime.loadSnapshot).toEqual({
    kind: 'string',
    list: [{ v: 'live' }],
  });
});
