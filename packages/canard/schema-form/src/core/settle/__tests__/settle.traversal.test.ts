import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-write
describe('bounded settlement traversal', () => {
  it('SETTLE-047 visits only the leaf and its ancestor on an input write', () => {
    const properties = Object.fromEntries(Array.from({ length: 50 }, (_, index) =>
      [`field${index}`, { type: 'string' }]));
    const { root, visits } = createTestTree({ type: 'object', properties });
    writeSchemaNode(root, {}, 'callerReplace', SetValueOption.Overwrite);
    visits.length = 0;
    writeSchemaNode(root.structure!.field0, 'changed', 'input', SetValueOption.Overwrite);
    expect(visits).toEqual(['/field0', '']);
    expect(visits.filter((visit) => visit.startsWith('select:'))).toHaveLength(0);
    expect(visits).toHaveLength(2);
  });

  it('SETTLE-047 skips 50 declared siblings when their gate reads cannot change', () => {
    const properties = Object.fromEntries(Array.from({ length: 50 }, (_, index) =>
      [`field${index}`, { type: 'string' }]));
    const { root, visits } = createTestTree({ type: 'object', properties: {
      ...properties,
      flag: { type: 'boolean' },
      guarded: { type: 'string', controls: { active: '../flag' } },
    } });
    writeSchemaNode(root, { flag: false }, 'callerReplace', SetValueOption.Overwrite);
    visits.length = 0;
    writeSchemaNode(root.structure!.field49, 'changed',
      'input', SetValueOption.Overwrite);
    expect(visits).toEqual(['/field49', '']);
    expect(visits.filter((visit) => visit.startsWith('select:'))).toHaveLength(0);
  });

  it('SETTLE-047 confines whole replacement to its target subtree', () => {
    const fields = Object.fromEntries(Array.from({ length: 50 }, (_, index) =>
      [`field${index}`, { type: 'string' }]));
    const { root, visits } = createTestTree({ type: 'object', properties: {
      left: { type: 'object', properties: fields },
      right: { type: 'object', properties: fields },
    } });
    writeSchemaNode(root, { left: {}, right: {} },
      'callerReplace', SetValueOption.Overwrite);
    visits.length = 0;
    writeSchemaNode(root.structure!.left, { field0: 'changed' },
      'callerReplace', SetValueOption.Overwrite);
    expect(visits.some((visit) => visit === '/right' ||
      visit.startsWith('/right/'))).toBe(false);
    expect(root.structure!.right.revision).toBe(1);
  });
});
