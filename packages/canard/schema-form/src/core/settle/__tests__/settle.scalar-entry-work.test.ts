import { afterEach, expect, it, vi } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import * as writable from '../utils/dispose/assertSchemaNodeWritable';
import * as latent from '../utils/write/pruneLatentRaw';
import * as wrongKind from '../utils/write/releaseWrongKindHosts';
import * as types from '../utils/commit/effectiveType';
import { createTestTree } from './fixtures/createTestTree';

afterEach(() => vi.restoreAllMocks());

it('removes fixed writable, latent, wrong-kind and effective-type work on normal scalar writes', () => {
  const { root } = createTestTree({ type: 'object', properties: {
    value: { type: 'string' }, sibling: { type: 'number', default: 3 },
  } });
  loadSchemaNodeAtMount(root, { value: 'before' }, SetValueOption.Overwrite);
  const leaf = root.structure!.value;
  const assertWritable = vi.spyOn(writable, 'assertSchemaNodeWritable');
  const prune = vi.spyOn(latent, 'pruneLatentRaw');
  const release = vi.spyOn(wrongKind, 'releaseWrongKindHosts');
  const effective = vi.spyOn(types, 'effectiveType');
  for (const value of ['first', 'later']) {
    writeSchemaNode(leaf, value, 'callerReplace', SetValueOption.Overwrite);
    expect(root.emit).toEqual({ value, sibling: 3 });
  }
  expect(assertWritable).not.toHaveBeenCalled();
  expect(prune).not.toHaveBeenCalled();
  expect(release).not.toHaveBeenCalled();
  expect(effective.mock.calls.filter(([node]) => node === leaf)).toHaveLength(2);
  expect(root.runtime.commitNumber).toBe(3);
});

it('retains general checks and derived writes when their inputs exist', () => {
  const { root } = createTestTree({ type: 'object', properties: {
    value: { type: 'string' }, copy: { type: 'string', controls: { derived: '../value' } },
  } });
  loadSchemaNodeAtMount(root, { value: 'before' }, SetValueOption.Overwrite);
  const leaf = root.structure!.value;
  const assertWritable = vi.spyOn(writable, 'assertSchemaNodeWritable');
  const release = vi.spyOn(wrongKind, 'releaseWrongKindHosts');
  writeSchemaNode(leaf, 'after', 'input', SetValueOption.Overwrite);
  expect(assertWritable).toHaveBeenCalledTimes(1);
  expect(release).toHaveBeenCalledTimes(1);
  expect(root.emit).toEqual({ value: 'after', copy: 'after' });
  leaf.disposed = true;
  expect(() => writeSchemaNode(leaf, 'retired', 'callerReplace', SetValueOption.Overwrite))
    .toThrow('Cannot write disposed node');
  expect(root.emit).toEqual({ value: 'after', copy: 'after' });
});
