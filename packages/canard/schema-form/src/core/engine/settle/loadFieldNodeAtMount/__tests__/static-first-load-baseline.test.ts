import { afterEach, expect, it, vi } from 'vitest';

import {
  dispatchMount,
  dispatchSetValue,
} from '@/schema-form/core/engine/write';

import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import { readFieldNodeIsDivergent } from '../../utils/loadValues/readFieldNodeIsDivergent';
import * as staticLoad from '../utils/staticFirst/loadStaticFirstTree';

/** Read a required fixture child without assuming its structure exists. */
const getDispatchChild = (
  node: ReturnType<typeof createDispatchTree>['root'],
  name: string,
) => {
  const child = node.structure?.[name];
  if (!child) throw new Error('Missing fixture child ' + name);
  return child;
};

afterEach(() => vi.restoreAllMocks());

it('static-first load captures the final filled output as the baseline', () => {
  const load = vi.spyOn(staticLoad, 'loadStaticFirstTree');
  const { root, runtime } = createDispatchTree({
    type: 'object',
    properties: { a: { type: 'string', default: 'd' } },
  });
  dispatchMount(root, undefined);
  expect(load).toHaveBeenCalledTimes(1);
  expect(runtime.loadBaseline).toEqual({ value: { a: 'd' } });
  const child = getDispatchChild(root, 'a');
  expect(readFieldNodeIsDivergent(child)).toBe(false);
  dispatchSetValue(child, 'x');
  expect(readFieldNodeIsDivergent(child)).toBe(true);
});
