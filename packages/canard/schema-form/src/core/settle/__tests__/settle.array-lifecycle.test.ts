import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { makeSchemaNodeTree } from '../../__tests__/makeSchemaNodeTree';
import { writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-array
describe('array settlement lifecycle', () => {
  it('35C-09 and WRITE-036 perish without exit latent or inactive entries', () => {
    const { root, runtime } = makeSchemaNodeTree({ type: 'array',
      items: { type: 'string' } }, { snapshot: ['a', 'b'] });
    root.resetSubtree();
    const perished = root.children![1];
    root.setValue(['x']);
    expect(root.children).toHaveLength(1);
    expect(perished.active).toBe(false);
    expect(perished.value).toBe('b');
    expect(perished.defaultValue).toBe('b');
    expect(root.inactiveValues).toEqual([]);
    const latent: Map<string, unknown> = Reflect.get(runtime, 'latentRaw');
    expect(latent.has(JSON.stringify(['/1', 'string']))).toBe(false);
    root.setValue(['x', 'c']);
    expect(root.children![1]).not.toBe(perished);
    expect(Reflect.get(root.children![1], 'itemKey'))
      .toBeGreaterThan(Reflect.get(perished, 'itemKey'));
  });

  it('35C-10 captures an inactive array as one host latent and recreates items', () => {
    const { root, runtime } = makeSchemaNodeTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      items: { type: 'array', controls: { active: '../flag' },
        items: { type: 'string' } },
    } });
    root.setValue({ flag: true, items: ['a', 'b'] });
    const former = root.find('/items')!;
    const formerFirst = former.children![0];
    root.find('/flag')?.setValue(false);
    const latent: Map<string, { raw?: unknown }> = Reflect.get(runtime, 'latentRaw');
    expect([...latent.keys()]).toEqual([JSON.stringify(['/items', 'array'])]);
    expect(root.inactiveValues).toEqual([{ path: '/items', value: ['a', 'b'] }]);
    expect(latent.get(JSON.stringify(['/items', 'array']))?.raw).toEqual(['a', 'b']);
    expect(Object.isFrozen(latent.get(JSON.stringify(['/items', 'array']))?.raw)).toBe(true);
    root.find('/flag')?.setValue(true);
    expect(root.find('/items')?.value).toEqual(['a', 'b']);
    expect(root.find('/items')).not.toBe(former);
    expect(root.find('/items')?.children?.[0]).not.toBe(formerFirst);
  });

  it('38C-02 captures raw item trees and folds latent children into one host', () => {
    const { root, runtime } = makeSchemaNodeTree({ type: 'object', properties: {
      showHost: { type: 'boolean' },
      items: { type: 'array', controls: { active: '../showHost' },
        items: { type: 'object', properties: {
          show: { type: 'boolean' },
          visible: { type: 'string', default: 'fill' },
          hidden: { type: 'string', controls: { active: '../show' } },
          nested: { type: 'object', properties: {
            leaf: { type: 'string' },
          } },
          nestedArray: { type: 'array', prefixItems: [
            { type: 'string' },
          ], items: false },
        } } },
    } });
    root.setValue({ showHost: true, items: [
      { show: true, visible: 'v', hidden: 'secret', nested: null,
        nestedArray: ['first', 'tail'], extra: 9 }, {},
    ] }, SetValueOption.DisableAutomaticWrites);
    root.find('/items/0/show')?.setValue(false);
    expect(root.find('/items/0/hidden')).toBeNull();
    root.find('/showHost')?.setValue(false);
    const latent: Map<string, { raw?: unknown }> = Reflect.get(runtime, 'latentRaw');
    const rawTree = [{ show: false, visible: 'v', hidden: 'secret', nested: null,
      nestedArray: ['first', 'tail'], extra: 9 },
      undefined];
    expect([...latent.keys()]).toEqual([JSON.stringify(['/items', 'array'])]);
    expect(latent.get(JSON.stringify(['/items', 'array']))?.raw).toEqual(rawTree);
    expect(root.inactiveValues).toEqual([{ path: '/items', value: rawTree }]);
    root.find('/showHost')?.setValue(true);
    expect(root.find('/items')?.value).toEqual([
      { show: false, visible: 'v', nested: null,
        nestedArray: ['first', 'tail'], extra: 9 }, { visible: 'fill' },
    ]);
    root.find('/items/0/show')?.setValue(true);
    expect(root.find('/items/0/hidden')?.value).toBe('secret');
  });

  it('35C-09 drops latent and declaration paths below a perished item', () => {
    const { root, runtime } = makeSchemaNodeTree({ type: 'array', items: {
      type: 'object', properties: {
        show: { type: 'boolean' },
        hidden: { type: 'string', controls: { active: '../show' } },
      },
    } }, { snapshot: [{ show: true }, { show: false, hidden: 'secret' }] });
    root.resetSubtree();
    const old = root.children![1];
    expect(old.inactiveValues).toEqual([{ path: '/1/hidden', value: 'secret' }]);
    root.setValue([{ show: true }]);
    expect(old.inactiveValues).toEqual([{ path: '/1/hidden', value: 'secret' }]);
    const latent: Map<string, unknown> = Reflect.get(runtime, 'latentRaw');
    const metadata: Map<string, unknown> = Reflect.get(runtime, 'latentRawMetadata');
    const declarations: Map<string, unknown> = Reflect.get(runtime,
      'committedDeclarationIds');
    expect([...latent.keys(), ...metadata.keys(), ...declarations.keys()]
      .every((key) => !key.includes('"/1'))).toBe(true);
  });

  it('35C-10 retains a gated-out item source when its array host exits', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      showItem: { type: 'boolean' }, showHost: { type: 'boolean' },
      items: { type: 'array', controls: { active: '../showHost' },
        items: { type: 'string', controls: { active: '../../showItem' } } },
    } });
    root.setValue({ showItem: true, showHost: true, items: ['a'] });
    root.find('/showItem')?.setValue(false);
    expect(root.find('/items')?.value).toEqual([null]);
    root.find('/showHost')?.setValue(false);
    expect(root.inactiveValues).toEqual([{ path: '/items', value: ['a'] }]);
    root.find('/showHost')?.setValue(true);
    root.find('/showItem')?.setValue(true);
    expect(root.find('/items')?.value).toEqual(['a']);
  });

  it('35C-10 preserves a gated-out object item through whole host latent', () => {
    const { root } = makeSchemaNodeTree({ type: 'object', properties: {
      showItem: { type: 'boolean' }, showHost: { type: 'boolean' },
      items: { type: 'array', controls: { active: '../showHost' },
        items: { type: 'object', controls: { active: '../../showItem' },
          properties: { a: { type: 'string' } } } },
    } });
    root.setValue({ showItem: true, showHost: true, items: [{ a: 'A' }] });
    root.find('/showItem')?.setValue(false);
    root.find('/showHost')?.setValue(false);
    expect(root.inactiveValues).toEqual([{ path: '/items', value: [{ a: 'A' }] }]);
    root.find('/showHost')?.setValue(true);
    root.find('/showItem')?.setValue(true);
    expect(root.find('/items')?.value).toEqual([{ a: 'A' }]);
  });

  it('35C-10 bounds recursive item latent capture by stored source paths', () => {
    const { root } = makeSchemaNodeTree({ type: 'object',
      $defs: { Node: { type: 'object', properties: {
        hasChild: { type: 'boolean' },
        child: { $ref: '#/$defs/Node',
          controls: { active: '../hasChild === true' } },
      } } },
      properties: {
        showItem: { type: 'boolean' }, showHost: { type: 'boolean' },
        items: { type: 'array', controls: { active: '../showHost' },
          items: { $ref: '#/$defs/Node',
            controls: { active: '../../showItem' } } },
      },
    });
    root.setValue({ showItem: true, showHost: true,
      items: [{ hasChild: false }] });
    root.find('/showItem')?.setValue(false);
    root.find('/showHost')?.setValue(false);
    expect(root.inactiveValues).toEqual([{ path: '/items',
      value: [{ hasChild: false }] }]);
  });

  it('35C-05 restores automatic array structure after Source-B budget fallback', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      a: { type: ['string', 'boolean'] },
      items: { type: 'array', default: ['filled'], items: { type: 'string' } },
    }, allOf: [
      { controls: { active: './a === "0"' },
        properties: { a: { type: 'boolean' } } },
      { controls: { active: './a !== "0"' },
        properties: { a: { type: 'string' } } },
    ] });
    expect(() => writeSchemaNode(root, { a: 0 }, 'callerReplace',
      SetValueOption.Overwrite)).toThrow();
    expect(root.runtime.diagnostics).toMatchObject({ cause: 'budget',
      exceededBudget: 'transition' });
    expect(root.structure?.items?.itemCount).toBe(0);
    expect(root.structure?.items?.children).toEqual([]);
    expect(root.structure?.items?.nextItemKey).toBeGreaterThan(0);
  });

  it('35C-05 restores prior item references and extras after automatic array growth', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      a: { type: ['string', 'boolean'] },
      flag: { type: 'boolean' },
      source: { type: 'string', default: 'fill',
        controls: { active: '../flag',
          injectTo: () => ({ '../items': ['injected', 'new', 'tail'],
            '../tuple': ['changed', 'new-tail'] }) } },
      items: { type: 'array', prefixItems: [
        { type: 'string' }, { type: 'string' },
      ], items: false },
      tuple: { type: 'array', prefixItems: [{ type: 'string' }],
        items: false },
    }, allOf: [
      { controls: { active: './a === "0"' },
        properties: { a: { type: 'boolean' } } },
      { controls: { active: './a !== "0"' },
        properties: { a: { type: 'string' } } },
    ] });
    writeSchemaNode(root, { a: 'stable', flag: false, items: ['before'],
      tuple: ['kept', 'extra'] },
      'callerReplace', SetValueOption.Overwrite);
    const host = root.structure!.items;
    const first = host.children![0];
    const tuple = root.structure!.tuple;
    const tupleFirst = tuple.children![0];
    const previousExtras = tuple.extras;
    expect(() => writeSchemaNode(root,
      { a: 0, flag: true, items: ['before'], tuple: ['kept', 'extra'] },
      'callerReplace',
      SetValueOption.Overwrite)).toThrow();
    expect(root.runtime.diagnostics).toMatchObject({ cause: 'budget',
      exceededBudget: 'transition' });
    expect(host.children).toEqual([first]);
    expect(host.children![0]).toBe(first);
    expect(host.itemCount).toBe(1);
    expect(host.extras).toBeUndefined();
    expect(host.nextItemKey).toBeGreaterThan(first.itemKey! + 1);
    expect(tuple.children![0]).toBe(tupleFirst);
    expect(tuple.itemCount).toBe(2);
    expect(tuple.extras).toBe(previousExtras);
    expect(tuple.extras).toEqual(['extra']);
  });

  it('35C-08 gates out an item as an exit while retaining its array slot', () => {
    const { root, runtime } = makeSchemaNodeTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      items: { type: 'array', items: { type: 'string',
        controls: { active: '../../flag' } } },
    } });
    root.setValue({ flag: true, items: ['a'] });
    const former = root.find('/items/0')!;
    root.find('/flag')?.setValue(false);
    expect(root.find('/items')?.children).toEqual([]);
    expect(root.find('/items')?.value).toEqual([null]);
    expect(former.active).toBe(false);
    const latent: Map<string, unknown> = Reflect.get(runtime, 'latentRaw');
    expect(latent.get(JSON.stringify(['/items/0', 'string']))).toBe('a');
    root.find('/items')?.setValue([]);
    expect(latent.has(JSON.stringify(['/items/0', 'string']))).toBe(false);
  });
});
