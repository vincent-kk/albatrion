import { expect, it } from 'vitest';

import {
  FieldNodeWriteKind,
  WriteOption,
} from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';

it('retains integer property order and untouched references across static selection', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      '10': { type: 'string', default: 'ten' },
      '2': { type: 'string', default: 'two' },
      nested: {
        type: 'object',
        properties: {
          leaf: { type: 'string', default: 'leaf' },
        },
      },
    },
  });
  loadFieldNodeAtMount(root, undefined, WriteOption.Overwrite);
  expect(root.children?.map((child) => child.name)).toEqual([
    '2',
    '10',
    'nested',
  ]);
  expect([...(root.runtime.deliveries ?? [])].map((node) => node.path)).toEqual(
    ['', '/2', '/10', '/nested', '/nested/leaf'],
  );
  const nested = root.__childrenByName__!.nested;
  const value = nested.__value__;
  const children = root.children;
  const revision = nested.__revisionLedger__;
  writeFieldNode(
    root.__childrenByName__!['2'],
    'next',
    FieldNodeWriteKind.Input,
    WriteOption.Overwrite,
  );
  expect(root.__value__).toEqual({
    '2': 'next',
    '10': 'ten',
    nested: { leaf: 'leaf' },
  });
  expect(root.children).toBe(children);
  expect(nested.__value__).toBe(value);
  expect(nested.__revisionLedger__).toBe(revision);
});
