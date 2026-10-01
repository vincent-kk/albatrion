import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../../../__tests__/makeSchemaNodeTree';
import { isUnionNode, SetValueOption } from '../../../SchemaNode';

// filid:contract union-rule-a
describe('TEST-077 union write paths', () => {
  it('interprets a root caller replacement through the unordered static list', () => {
    const { root } = makeSchemaNodeTree({ type: ['number', 'boolean'] });
    root.setValue('42');
    expect(isUnionNode(root)).toBe(true);
    expect(root.value).toBe(42);
    expect(root.outputValue).toBe(42);
    expect(root.typeMismatch).toBe(false);
  });

  it('interprets a nested node write without replacing its sibling', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      a: { type: ['number', 'boolean'] }, keep: { type: 'string' },
    } });
    root.setValue({ a: 1, keep: 'retained' });
    root.find('/a')?.setValue('false');
    expect(root.find('/a')?.raw).toBe(false);
    expect(root.outputValue).toEqual({ a: false, keep: 'retained' });
  });

  it('resetSubtree reinterprets its saved load value', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      a: { type: ['number', 'boolean'] },
    } }, { snapshot: { a: '42' } });
    root.setValue({ a: false });
    root.find('/a')?.resetSubtree();
    expect(root.find('/a')?.raw).toBe(42);
    expect(root.outputValue).toEqual({ a: 42 });
  });

  it('Merge writes an object-valued union as one replacement', () => {
    const first = { old: 1 };
    const second = { next: 2 };
    const { root } = makeSchemaNodeTree({ type: ['object', 'string'] });
    root.setValue(first);
    root.setValue(second, SetValueOption.Merge);
    expect(root.raw).toBe(second);
    expect(root.value).toBe(second);
    expect(root.outputValue).toBe(second);
    expect(root.children).toBeNull();
  });

  it('keeps an array member by reference as a terminal whole value', () => {
    const value = [1, { a: 2 }];
    const { root } = makeSchemaNodeTree({ type: ['array', 'string'] });
    root.setValue(value);
    expect(root.raw).toBe(value);
    expect(root.outputValue).toBe(value);
    expect(root.children).toBeNull();
  });

  it('keeps a string draft unchanged during a direct union write', () => {
    const { root } = makeSchemaNodeTree({ type: ['string', 'boolean'],
      options: { trim: true } });
    root.setValue('  text  ');
    expect(root.raw).toBe('  text  ');
    expect(root.outputValue).toBe('  text  ');
    root.setValue(false);
    expect(root.outputValue).toBe(false);
  });

  it('25C-11 exposes the seven PR-2 runtime node.type values including virtual', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      s: { type: 'string' }, n: { type: 'number' },
      b: { type: 'boolean' }, z: { type: 'null' },
      o: { type: 'object' }, u: { type: ['string', 'number'] },
    }, options: { virtual: { v: { fields: ['s'] } } } });
    root.setValue({ s: 'text', n: 1, b: true, z: null, o: {}, u: 'value' });
    expect(['', '/s', '/n', '/b', '/z', '/u', '/v'].map(path =>
      root.find(path)?.type)).toEqual([
      'object', 'string', 'number', 'boolean', 'null', 'union', 'virtual',
    ]);
  });

  it('TEST-077 derived writes through the effective union list', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      source: { type: 'string' },
      target: { type: ['number', 'boolean'], controls: { derived: '../source' } },
    } });
    root.setValue({ source: '42' });
    expect(root.find('/target')?.raw).toBe(42);
    expect(root.find('/target')?.typeMismatch).toBe(false);
  });

  it('TEST-077 injectTo writes through the effective union list', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      source: { type: 'string', controls: {
        injectTo: (value: unknown) => ({ '../target': value }),
      } }, target: { type: ['number', 'boolean'] },
    } });
    root.setValue({ source: '42' });
    expect(root.find('/target')?.raw).toBe(42);
    expect(root.find('/target')?.typeMismatch).toBe(false);
  });
  it.todo('TEST-077 stage 07 (PR-7): finished string input applies trim');
  it.todo('25C-11 stage 06 (PR-5): array node completes all eight node.type values');
});
