import { describe, expect, it } from 'vitest';

import { makeSchemaNodeTree } from '../../__tests__/makeSchemaNodeTree';
import { setContext } from '../../SchemaNode';
import { SchemaNode } from '../../SchemaNode/SchemaNode';

// filid:contract settle-array
describe('array item declarations', () => {
  it('35C-08 CONTROLS-073 binds visible, readOnly, and children controls to each item', () => {
    const { root } = makeSchemaNodeTree({ type: 'array', items: {
      type: 'object', controls: { children: [
        { targets: ['x'], controls: { disabled: './locked' } },
      ] }, properties: {
        kind: { type: 'string' }, locked: { type: 'boolean' },
        x: { type: 'string', controls: {
          visible: '../kind === "show"', readOnly: '../locked',
        } },
      },
    } });
    root.setValue([
      { kind: 'show', locked: false, x: 'a' },
      { kind: 'hide', locked: true, x: 'b' },
    ]);
    expect(root.find('/0/x')).toMatchObject({ visible: true, readOnly: false,
      disabled: false });
    expect(root.find('/1/x')).toMatchObject({ visible: false, readOnly: true,
      disabled: true });
    root.find('/0/kind')?.setValue('hide');
    expect(root.find('/0/x')?.visible).toBe(false);
    expect(root.find('/1/x')?.visible).toBe(false);
  });

  it('35C-08 SETTLE-045 applies an if/then gate only to the matching item', () => {
    const { root } = makeSchemaNodeTree({ type: 'array', items: {
      type: 'object', properties: { enabled: { type: 'boolean' } },
      if: { properties: { enabled: { const: true } } },
      then: { properties: { gated: { type: 'string' } } },
    } }, { ifPredicate: () => (input) =>
      input !== null && typeof input === 'object' &&
      'enabled' in input && input.enabled === true });
    root.setValue([{ enabled: true, gated: 'A' },
      { enabled: false, gated: 'B' }]);
    expect(root.find('/0/gated')?.value).toBe('A');
    expect(root.find('/1/gated')).toBeNull();
    root.find('/0/enabled')?.setValue(false);
    expect(root.find('/0/gated')).toBeNull();
    expect(root.find('/1/gated')).toBeNull();
  });

  it('35C-08 VALUE-034 exits an inactive item but keeps its array slot', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      showSecond: { type: 'boolean' },
      arr: { type: 'array', prefixItems: [
        { type: 'object', properties: { x: { type: 'string' } } },
        { type: 'object', controls: { active: '#/showSecond' },
          properties: { x: { type: 'string' } } },
      ], items: false },
    } });
    root.setValue({ showSecond: true, arr: [{ x: 'A' }, { x: 'B' }] });
    const second = root.find('/arr/1');
    root.find('/showSecond')?.setValue(false);
    expect(root.find('/arr')?.value).toEqual([{ x: 'A' }, {}]);
    expect(root.find('/arr')?.children).toHaveLength(1);
    expect(second && Reflect.get(second, 'detached')).toBe(true);
    root.find('/showSecond')?.setValue(true);
    expect(root.find('/arr/1')?.value).toEqual({ x: 'B' });
  });

  it('35C-08 WRITE-031 binds an exiting item policy to its own slot', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      showSecond: { type: 'boolean' },
      arr: { type: 'array', prefixItems: [
        { type: 'object', properties: { x: { type: 'string' } } },
        { type: 'object', controls: {
          active: '#/showSecond', unsetOnInactive: true,
        }, properties: { x: { type: 'string' } } },
      ], items: false },
    } });
    root.setValue({ showSecond: true, arr: [{ x: 'A' }, { x: 'B' }] });
    root.find('/showSecond')?.setValue(false);
    expect(root.find('/arr')?.value).toEqual([{ x: 'A' }, {}]);
    root.find('/showSecond')?.setValue(true);
    expect(root.find('/arr/0/x')?.value).toBe('A');
    expect(root.find('/arr/1/x')?.value).toBeUndefined();
  });

  it('35C-08 WRITE-031 keeps exit policy expression keys separate per item', () => {
    const { root } = makeSchemaNodeTree({ type: 'array', items: {
      type: 'object', properties: {
        show: { type: 'boolean' }, clear: { type: 'boolean' },
        target: { type: 'string', controls: {
          active: '../show', unsetOnInactive: '../clear',
        } },
      },
    } });
    root.setValue([{ show: true, clear: true, target: 'A' },
      { show: true, clear: false, target: 'B' }]);
    root.find('/0/show')?.setValue(false);
    root.find('/1/show')?.setValue(false);
    root.find('/0/show')?.setValue(true);
    root.find('/1/show')?.setValue(true);
    expect(root.find('/0/target')?.value).toBeUndefined();
    expect(root.find('/1/target')?.value).toBe('B');
  });

  it('18C-13 35C-08 invalidates absolute and relative readers of another item', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      arr: { type: 'array', items: { type: 'object', properties: {
        x: { type: 'string' },
        absolute: { type: 'string', controls: { visible: '/arr/0/x === "on"' } },
        relative: { type: 'string', controls: {
          visible: '../../0/x === "on"',
        } },
      } } },
    } });
    root.setValue({ arr: [{ x: 'off', absolute: 'a', relative: 'a' },
      { x: 'off', absolute: 'b', relative: 'b' }] });
    expect(root.find('/arr/1/absolute')?.visible).toBe(false);
    expect(root.find('/arr/1/relative')?.visible).toBe(false);
    root.find('/arr/0/x')?.setValue('on');
    expect(root.find('/arr/1/absolute')?.visible).toBe(true);
    expect(root.find('/arr/1/relative')?.visible).toBe(true);
  });

  it('35C-08 CONTROLS-080 reads the emitted array length from an item', () => {
    const { root } = makeSchemaNodeTree({ type: 'array', items: {
      type: 'object', properties: {
        marker: { type: 'string', controls: {
          visible: '(../../).length === 2',
        } },
      },
    } });
    if (!(root instanceof SchemaNode))
      throw new Error('Expected a runtime SchemaNode');
    const array = root;
    root.setValue([{ marker: 'a' }, { marker: 'b' }]);
    expect(root.find('/0/marker')?.visible).toBe(true);
    array.push({ marker: 'c' });
    expect(root.find('/0/marker')?.visible).toBe(false);
    expect(root.find('/2/marker')?.visible).toBe(false);
  });

  it('35C-08 CONTROLS-080 rebinds item declarations after remove and push', () => {
    const { root } = makeSchemaNodeTree({ type: 'array', items: {
      type: 'object', properties: {
        kind: { type: 'string' },
        x: { type: 'string', controls: { visible: '../kind === "show"' } },
      },
    } });
    if (!(root instanceof SchemaNode))
      throw new Error('Expected a runtime SchemaNode');
    const array = root;
    root.setValue([{ kind: 'hide', x: 'A' }, { kind: 'show', x: 'B' },
      { kind: 'hide', x: 'C' }]);
    const surviving = root.children?.[1];
    array.remove(0);
    expect(root.children?.[0]).toBe(surviving);
    expect(root.find('/0/x')?.visible).toBe(true);
    expect(root.find('/1/x')?.visible).toBe(false);
    root.find('/0/kind')?.setValue('hide');
    expect(root.find('/0/x')?.visible).toBe(false);
    array.push({ kind: 'show', x: 'D' });
    expect(root.find('/2/x')?.visible).toBe(true);
  });

  it('35C-08 binds each nested array template segment to its own index', () => {
    const { root } = makeSchemaNodeTree({ type: 'array', items: {
      type: 'array', items: { type: 'object', properties: {
        kind: { type: 'string' },
        x: { type: 'string', controls: { visible: '../kind === "show"' } },
      } },
    } });
    root.setValue([[{ kind: 'show', x: 'a' }, { kind: 'show', x: 'b' }],
      [{ kind: 'show', x: 'c' }]]);
    root.find('/0/1/kind')?.setValue('hide');
    expect(root.find('/0/0/x')?.visible).toBe(true);
    expect(root.find('/0/1/x')?.visible).toBe(false);
    expect(root.find('/1/0/x')?.visible).toBe(true);
  });

  it('35C-08 SETTLE-045 keeps gate registrations bound after remove and push', () => {
    const { root } = makeSchemaNodeTree({ type: 'array', items: {
      type: 'object', properties: {
        kind: { type: 'string' },
        gated: { type: 'string', controls: { active: '../kind === "on"' } },
      },
    } });
    if (!(root instanceof SchemaNode))
      throw new Error('Expected a runtime SchemaNode');
    const array = root;
    root.setValue([{ kind: 'off', gated: 'A' }, { kind: 'on', gated: 'B' }]);
    array.remove(0);
    expect(root.find('/0/gated')?.value).toBe('B');
    root.find('/0/kind')?.setValue('off');
    expect(root.find('/0/gated')).toBeNull();
    array.push({ kind: 'on', gated: 'C' });
    expect(root.find('/1/gated')?.value).toBe('C');
  });

  it('35C-08 CONTROLS-080 expands @ owners for every live item', () => {
    const { root } = makeSchemaNodeTree({ type: 'array', items: {
      type: 'object', properties: {
        x: { type: 'string', controls: { visible: '@.show' } },
      },
    } });
    root.setValue([{ x: 'a' }, { x: 'b' }]);
    setContext(root, { show: false });
    expect(root.find('/0/x')?.visible).toBe(false);
    expect(root.find('/1/x')?.visible).toBe(false);
    setContext(root, { show: true });
    expect(root.find('/0/x')?.visible).toBe(true);
    expect(root.find('/1/x')?.visible).toBe(true);
  });
});
