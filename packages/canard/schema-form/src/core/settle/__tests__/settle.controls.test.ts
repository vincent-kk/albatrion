import { describe, expect, it, vi } from 'vitest';

import { blueprint } from '../../blueprint';
import type { BlueprintSchema } from '../../blueprint';
import { schemaNodeFactory } from '../../SchemaNode';
import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

/** Create a runtime surface tree for commit-scoped getter checks. */
const createSurfaceTree = (schema: BlueprintSchema) => schemaNodeFactory(
  blueprint(schema), { context: {}, ifPredicates: new Map(),
    diagnostics: { status: 'stable' }, loadSnapshot: undefined,
    latentRaw: new Map(), typeMismatchPaths: new Set(),
    inactiveValuesMemo: new Map() });

// filid:contract settle-state-keys
describe('settled controls', () => {
  it('CONTROLS-082 readOnly OR keeps a true parent item over own false', () => {
    const { root } = createTestTree({ type: 'object', controls: { children: [
      { targets: ['field'], controls: { readOnly: true } },
    ] }, properties: { field: { type: 'string', controls: { readOnly: false } } } });
    loadSchemaNodeAtMount(root, { field: 'a' }, SetValueOption.Overwrite);
    expect(root.structure?.field?.readOnly).toBe(true);
  });

  it('CONTROLS-082 disabled OR keeps a true own key over parent false', () => {
    const { root } = createTestTree({ type: 'object', controls: { children: [
      { targets: ['field'], controls: { disabled: false } },
    ] }, properties: { field: { type: 'string', controls: { disabled: true } } } });
    loadSchemaNodeAtMount(root, { field: 'a' }, SetValueOption.Overwrite);
    expect(root.structure?.field?.disabled).toBe(true);
  });

  it('CONTROLS-082 visible AND combines false across declaration positions', () => {
    const { root } = createTestTree({ type: 'object', controls: { children: [
      { targets: ['field'], controls: { visible: false } },
    ] }, properties: { field: { type: 'string', controls: { visible: true } } } });
    loadSchemaNodeAtMount(root, { field: 'a' }, SetValueOption.Overwrite);
    expect(root.structure?.field?.visible).toBe(false);
  });

  it('CONTROLS-082 standard readOnly is OR merged with controls', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      field: { type: 'string', readOnly: true, controls: { readOnly: false } },
    } });
    loadSchemaNodeAtMount(root, { field: 'a' }, SetValueOption.Overwrite);
    expect(root.structure?.field?.readOnly).toBe(true);
  });

  it('CONTROLS-073 children item expression uses its host for every target', () => {
    const { root } = createTestTree({ type: 'object', controls: { children: [
      { targets: ['a', 'b'], controls: { disabled: './lock' } },
    ] }, properties: { lock: { type: 'boolean' }, a: { type: 'string' },
      b: { type: 'string' } } });
    loadSchemaNodeAtMount(root, { lock: true, a: 'a', b: 'b' }, SetValueOption.Overwrite);
    expect(root.structure?.a?.disabled).toBe(true);
    expect(root.structure?.b?.disabled).toBe(true);
  });

  it('CONTROLS-073 evaluates a children item once for all addressed siblings', () => {
    const { root } = createTestTree({ type: 'object', controls: { children: [
      { targets: ['a', 'b'], controls: { readOnly: '@.locked()' } },
    ] }, properties: { a: { type: 'string' }, b: { type: 'string' } } });
    const locked = vi.fn(() => true);
    root.runtime.context = { locked };
    loadSchemaNodeAtMount(root, { a: 'a', b: 'b' }, SetValueOption.Overwrite);
    expect(locked).toHaveBeenCalledTimes(1);
    expect([root.structure?.a?.readOnly, root.structure?.b?.readOnly])
      .toEqual([true, true]);
  });

  it('state key expressions follow a later dependency change', () => {
    const { root } = createTestTree({ type: 'object', controls: { children: [
      { targets: ['target'], controls: { disabled: './flag' } },
    ] }, properties: { flag: { type: 'boolean' },
      target: { type: 'string', controls: { visible: '../flag' } } } });
    loadSchemaNodeAtMount(root, { flag: false, target: 't' }, SetValueOption.Overwrite);
    expect([root.structure?.target?.visible, root.structure?.target?.disabled])
      .toEqual([false, false]);
    writeSchemaNode(root.structure!.flag, true, 'callerReplace', SetValueOption.Overwrite);
    expect([root.structure?.target?.visible, root.structure?.target?.disabled])
      .toEqual([true, true]);
  });

  it('CONTROLS-042 fragment scope reaches only directly declared children', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      outside: { type: 'string' },
    }, allOf: [{ controls: { visible: false }, properties: {
      inside: { type: 'string' },
    } }] });
    loadSchemaNodeAtMount(root, { inside: 'i', outside: 'o' }, SetValueOption.Overwrite);
    expect(root.structure?.inside?.visible).toBe(false);
    expect(root.structure?.outside?.visible).toBe(true);
  });

  it('CONTROLS-045 no root inheritance keeps root state local', () => {
    const { root } = createTestTree({ type: 'object', readOnly: true,
      controls: { disabled: true, visible: false }, properties: {
        child: { type: 'string' },
      } });
    loadSchemaNodeAtMount(root, { child: 'c' }, SetValueOption.Overwrite);
    expect([root.readOnly, root.disabled, root.visible]).toEqual([true, true, false]);
    expect([root.structure?.child?.readOnly, root.structure?.child?.disabled,
      root.structure?.child?.visible]).toEqual([false, false, true]);
  });

  it('ERROR-122 state key throw commits degraded and ignores that declaration', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      child: { type: 'string', controls: { visible: '@.explode()' } },
    } });
    root.runtime.context = { explode: () => { throw new Error('state key'); } };
    expect(() => loadSchemaNodeAtMount(root, { child: 'c' },
      SetValueOption.Overwrite)).toThrow();
    expect(root.runtime.diagnostics).toMatchObject({
      status: 'degraded', cause: 'expression',
    });
    expect(root.structure?.child?.visible).toBe(true);
  });

  it('CONTROLS-083 locked writes still apply caller and derived values', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      source: { type: 'string' }, target: { type: 'string', controls: {
        readOnly: true, disabled: true, derived: '../source',
      } },
    } });
    loadSchemaNodeAtMount(root, { source: 'a' }, SetValueOption.Overwrite);
    expect([root.structure?.target?.readOnly, root.structure?.target?.disabled])
      .toEqual([true, true]);
    expect(root.structure?.target?.raw).toBe('a');
    writeSchemaNode(root.structure!.target, 'manual', 'callerReplace',
      SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('manual');
    writeSchemaNode(root.structure!.source, 'b', 'callerReplace',
      SetValueOption.Overwrite);
    expect(root.structure?.target?.raw).toBe('b');
  });

  it('28C-07 watchValues reads effective watch paths and memoizes a commit; CONTROLS-019 a single-string watch is not a watch', () => {
    const root = createSurfaceTree({ type: 'object', $defs: {
      watched: { type: 'string', controls: { watch: ['../second'] } },
    }, properties: {
      first: { type: 'string' }, second: { type: 'string' },
      target: { $ref: '#/$defs/watched', controls: { watch: ['../first'] } },
      single: { type: 'string', controls: { watch: '../first' } },
    } });
    root.setValue({ first: 'a', second: 'b', target: 't' });
    const target = root.find('/target');
    expect(target?.watchValues).toEqual(['b']);
    expect(target?.watchValues).toBe(target?.watchValues);
    expect(root.find('/single')?.watchValues).toEqual([]);
    root.find('/second')?.setValue('c');
    expect(target?.watchValues).toEqual(['c']);
  });

  it('LANDING-137 watchValues omitEmpty sees an omitted empty string', () => {
    const root = createSurfaceTree({ type: 'object', properties: {
      source: { type: 'string', options: { omitEmpty: true } },
      target: { type: 'string', controls: { watch: ['../source'] } },
    } });
    root.setValue({ source: '', target: 't' });
    expect(root.find('/source')?.value).toBe('');
    expect(root.find('/target')?.watchValues).toEqual([undefined]);
  });

  it('28C-02 detached frozen retains state reads after an ancestor changes', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      shown: { type: 'boolean' }, branch: { type: 'object',
        controls: { active: '../shown' }, properties: {
          child: { type: 'string', controls: {
            visible: false, readOnly: true, disabled: true,
          } },
        } },
    } });
    loadSchemaNodeAtMount(root, { shown: true, branch: { child: 'c' } },
      SetValueOption.Overwrite);
    const child = root.structure!.branch.structure!.child;
    writeSchemaNode(root.structure!.shown, false, 'callerReplace',
      SetValueOption.Overwrite);
    expect(child.detached).toBe(true);
    expect([child.visible, child.readOnly, child.disabled]).toEqual([false, true, true]);
    expect(root.runtime.detachedReads?.get(child)).toMatchObject({
      visible: false, readOnly: true, disabled: true,
    });
  });

  it('28C-02 detached frozen retains watchValues from its last live commit', () => {
    const root = createSurfaceTree({ type: 'object', properties: {
      shown: { type: 'boolean' }, source: { type: 'string' },
      target: { type: 'string', controls: {
        active: '../shown', watch: ['../source'],
      } },
    } });
    root.setValue({ shown: true, source: 'old', target: 't' });
    const target = root.find('/target');
    root.setValue({ shown: false, source: 'new', target: 't' });
    expect(target?.active).toBe(false);
    expect(target?.watchValues).toEqual(['old']);
    expect(target?.watchValues).toBe(target?.watchValues);
  });
});
