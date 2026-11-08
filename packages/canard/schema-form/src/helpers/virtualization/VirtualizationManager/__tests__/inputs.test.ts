// @vitest-environment jsdom
import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import {
  VirtualizationBackfill,
  resolveVirtualizationOptions,
} from '../../resolveVirtualizationOptions';
import { VirtualizationManager } from '../VirtualizationManager';

it('records input positions in order, replaces identities and detaches idempotently', () => {
  const options = resolveVirtualizationOptions({
    backfill: VirtualizationBackfill.None,
  });
  if (!options) throw new Error('enabled virtualization must resolve');
  const manager = new VirtualizationManager(options);
  const node = nodeFromJSONSchema({ jsonSchema: { type: 'string' } });
  const other = nodeFromJSONSchema({ jsonSchema: { type: 'string' } });
  const first = document.createElement('div');
  const second = document.createElement('div');
  manager.attachInput(first, node);
  manager.attachInput(second, node);
  expect(manager.inputsOf(node)).toEqual([first, second]);
  manager.attachInput(first, other);
  expect(manager.inputsOf(node)).toEqual([second]);
  expect(manager.inputsOf(other)).toEqual([first]);
  manager.disconnect();
  expect(manager.inputsOf(node)).toEqual([second]);
  manager.detachInput(second);
  manager.detachInput(second);
  expect(manager.inputsOf(node)).toEqual([]);
});
