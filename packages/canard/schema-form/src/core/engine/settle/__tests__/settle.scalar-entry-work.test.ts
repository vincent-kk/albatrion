import { afterEach, expect, it, vi } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import * as types from '../utils/commit/effectiveType';
import * as writable from '../utils/dispose/assertFieldNodeWritable';
import * as latent from '../utils/literalStarStore/pruneLiteralStarRaw';
import * as wrongKind from '../utils/write/releaseWrongKindHosts';
import { writeFieldNode } from '../utils/write/writeFieldNode';

afterEach(() => vi.restoreAllMocks());

it('removes fixed writable, latent, wrong-kind and effective-type work on normal scalar writes', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      value: { type: 'string' },
      sibling: { type: 'number', default: 3 },
    },
  });
  loadFieldNodeAtMount(root, { value: 'before' }, WriteOption.Overwrite);
  const leaf = root.structure!.value;
  const assertWritable = vi.spyOn(writable, 'assertFieldNodeWritable');
  const prune = vi.spyOn(latent, 'pruneLiteralStarRaw');
  const release = vi.spyOn(wrongKind, 'releaseWrongKindHosts');
  const effective = vi.spyOn(types, 'effectiveType');
  for (const value of ['first', 'later']) {
    writeFieldNode(leaf, value, 'callerReplace', WriteOption.Overwrite);
    expect(root.emit).toEqual({ value, sibling: 3 });
  }
  expect(assertWritable).not.toHaveBeenCalled();
  expect(prune).not.toHaveBeenCalled();
  expect(release).not.toHaveBeenCalled();
  expect(effective.mock.calls.filter(([node]) => node === leaf)).toHaveLength(
    2,
  );
  expect(root.runtime.commitNumber).toBe(3);
});

it('retains general checks and derived writes when their inputs exist', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      value: { type: 'string' },
      copy: { type: 'string', controls: { derived: '../value' } },
    },
  });
  loadFieldNodeAtMount(root, { value: 'before' }, WriteOption.Overwrite);
  const leaf = root.structure!.value;
  const assertWritable = vi.spyOn(writable, 'assertFieldNodeWritable');
  const release = vi.spyOn(wrongKind, 'releaseWrongKindHosts');
  writeFieldNode(leaf, 'after', 'input', WriteOption.Overwrite);
  expect(assertWritable).toHaveBeenCalledTimes(1);
  expect(release).toHaveBeenCalledTimes(1);
  expect(root.emit).toEqual({ value: 'after', copy: 'after' });
  leaf.disposed = true;
  expect(() =>
    writeFieldNode(leaf, 'retired', 'callerReplace', WriteOption.Overwrite),
  ).toThrow('Cannot write disposed node');
  expect(root.emit).toEqual({ value: 'after', copy: 'after' });
});
