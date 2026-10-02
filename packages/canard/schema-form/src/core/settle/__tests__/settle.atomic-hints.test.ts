import { describe, expect, it } from 'vitest';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { blueprint } from '../../blueprint';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

const isAtomic = (value: unknown): boolean => value !== null && typeof value === 'object' &&
  (hasOwnProperty(value, '$$typeof') ||
    Object.keys(value).length === 1 && hasOwnProperty(value, 'current'));
const firstElement = { $$typeof: Symbol.for('react.element'), props: { first: true } };
const lastElement = { $$typeof: Symbol.for('react.element'), props: { last: true } };
const firstRef = { current: { first: true } };
const lastRef = { current: { last: true } };
const schema = { type: 'object', properties: {
  enabled: { type: 'boolean' },
  field: { type: 'string', options: { omitEmpty: { element: firstElement, ref: firstRef } },
    presentation: { element: firstElement, ref: firstRef } },
}, if: { properties: { enabled: { const: true } }, required: ['enabled'] },
then: { properties: {
  field: { type: 'string', options: { omitEmpty: { element: lastElement, ref: lastRef } },
    presentation: { element: lastElement, ref: lastRef } },
} } };

describe('runtime hint atomicity', () => {
  it('REACT-003 gate-enabled options and presentation retain the last atomic element and ref', () => {
    const { root } = createTestTree(schema, undefined, { isAtomic });
    loadSchemaNodeAtMount(root, { enabled: false, field: 'value' }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.enabled, true, 'input', SetValueOption.Overwrite);
    const effective = root.structure!.field.schema.schema;
    if (typeof effective === 'boolean') throw new Error('Expected object schema');
    for (const hints of [Reflect.get(effective.options!, 'omitEmpty'), effective.presentation]) {
      expect(hints).toEqual({ element: lastElement, ref: lastRef });
      expect(Reflect.get(hints!, 'element')).toBe(lastElement);
      expect(Reflect.get(hints!, 'ref')).toBe(lastRef);
    }
  });

  it('REACT-003 hosts without a predicate retain recursive hint merging', () => {
    const { root } = createTestTree(schema);
    loadSchemaNodeAtMount(root, { enabled: true, field: 'value' }, SetValueOption.Overwrite);
    const effective = root.structure!.field.schema.schema;
    if (typeof effective === 'boolean') throw new Error('Expected object schema');
    for (const hints of [Reflect.get(effective.options!, 'omitEmpty'), effective.presentation])
      expect(hints).toEqual({
        element: { $$typeof: firstElement.$$typeof, props: { first: true, last: true } },
        ref: { current: { first: true, last: true } },
      });
  });

  it('REACT-004 blueprint retains predicate identities and unchanged cache separation', () => {
    const cache = new WeakMap();
    const isTerminal = () => undefined;
    const options = { isAtomic, isTerminal, cache };
    const analysis = blueprint(schema, options);
    expect(analysis.isAtomic).toBe(isAtomic);
    expect(analysis.isTerminal).toBe(isTerminal);
    expect(blueprint(schema, options)).toBe(analysis);
    expect(blueprint(schema, { cache })).not.toBe(analysis);
  });
});
