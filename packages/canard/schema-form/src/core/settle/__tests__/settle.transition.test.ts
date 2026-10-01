import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { NodeState } from '../../types/state';
import { loadSchemaNodeAtMount, readSchemaNodeDefaultValue, resetSchemaNodeForm,
  resetSchemaNodeSubtree, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-write
describe('settle transitions and loads', () => {
  it('TEST-069 load lifetime and SETTLE-048 load clears the appearance baseline', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      name: { type: 'string', default: 'filled' },
    } });
    loadSchemaNodeAtMount(root, {}, SetValueOption.Overwrite);
    expect(root.structure?.name?.raw).toBe('filled');
    writeSchemaNode(root, {}, 'callerReplace', SetValueOption.Overwrite);
    expect(root.structure?.name?.raw).toBeUndefined();
    resetSchemaNodeForm(root, {}, SetValueOption.Overwrite);
    expect(root.structure?.name?.raw).toBe('filled');
  });

  it('TEST-069 SetValueOption Overwrite replaces missing child raw without a new lifetime', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      name: { type: 'string', default: 'filled' },
      flag: { type: 'boolean' },
      gated: { type: 'string', default: 'new', controls: { active: '../flag' } },
    } });
    loadSchemaNodeAtMount(root, { name: 'original', flag: false }, SetValueOption.Overwrite);
    writeSchemaNode(root, { flag: true }, 'callerReplace', SetValueOption.Overwrite);
    expect(root.structure?.name?.raw).toBeUndefined();
    expect(root.structure?.gated?.raw).toBe('new');
    expect(root.runtime.loadSnapshot).toEqual({ name: 'original', flag: false });
    expect(readSchemaNodeDefaultValue(root.structure!.name)).toBe('original');
  });

  it('TEST-069 SetValueOption Merge retains missing keys and replaces a non-object V WRITE-079', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      a: { type: 'string' }, b: { type: 'string' }, flag: { type: 'boolean' },
      gated: { type: 'string', default: 'new', controls: { active: '../flag' } },
    } });
    loadSchemaNodeAtMount(root, { a: 'A', b: 'B', flag: false }, SetValueOption.Overwrite);
    writeSchemaNode(root, { a: 'new', flag: true }, 'callerPartial', SetValueOption.Merge);
    expect(root.emit).toEqual({ a: 'new', b: 'B', flag: true, gated: 'new' });
    writeSchemaNode(root, null, 'callerPartial', SetValueOption.Merge);
    expect(root.raw).toBeNull();
    expect(root.structure?.a?.raw).toBeUndefined();
    expect(root.runtime.typeMismatchPaths.has('')).toBe(true);
  });

  it('TEST-069 SetValueOption DisableAutomaticWrites suppresses an actual fill', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      name: { type: 'string', default: 'filled' },
    } });
    loadSchemaNodeAtMount(root, {}, SetValueOption.Overwrite |
      SetValueOption.DisableAutomaticWrites);
    expect(root.structure?.name?.raw).toBeUndefined();
    resetSchemaNodeForm(root, {}, SetValueOption.Overwrite);
    expect(root.structure?.name?.raw).toBe('filled');
  });

  it('TEST-069 SetValueOption EnableAutomaticWrites overrides Form suppression', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      name: { type: 'string', default: 'filled' },
    } });
    root.runtime.disableAutomaticWrites = true;
    loadSchemaNodeAtMount(root, {}, SetValueOption.Overwrite |
      SetValueOption.EnableAutomaticWrites);
    expect(root.structure?.name?.raw).toBe('filled');
  });

  it('WRITE-015 suppression wins when a call sets both automatic-write bits', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      name: { type: 'string', default: 'filled' },
    } });
    const both = SetValueOption.Overwrite |
      SetValueOption.DisableAutomaticWrites | SetValueOption.EnableAutomaticWrites;
    loadSchemaNodeAtMount(root, {}, both);
    expect(root.structure?.name?.raw).toBeUndefined();
    root.runtime.disableAutomaticWrites = true;
    resetSchemaNodeForm(root, {}, both);
    expect(root.structure?.name?.raw).toBeUndefined();
  });

  it('SETTLE-049 and EVENT-072 resetSubtree loads only its subtree snapshot', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      left: { type: 'object', properties: { a: { type: 'string', default: 'D' } } },
      right: { type: 'string', default: 'R' },
    } });
    loadSchemaNodeAtMount(root, { left: {}, right: 'given' }, SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.left.structure!.a, 'changed', 'input', SetValueOption.Overwrite);
    writeSchemaNode(root.structure!.right, 'changed', 'input', SetValueOption.Overwrite);
    resetSchemaNodeSubtree(root.structure!.left, SetValueOption.Overwrite);
    expect(root.structure?.left?.structure?.a?.raw).toBe('D');
    expect(root.structure?.right?.raw).toBe('changed');
  });

  it('ERROR-204 form-level load resets diagnostics but subtree load does not', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      name: { type: 'string' },
    } });
    loadSchemaNodeAtMount(root, { name: 'x' }, SetValueOption.Overwrite);
    root.runtime.diagnostics = { status: 'degraded', cause: 'budget', commit: 1 };
    resetSchemaNodeSubtree(root.structure!.name, SetValueOption.Overwrite);
    expect(root.runtime.diagnostics.status).toBe('degraded');
    resetSchemaNodeForm(root, { name: 'y' }, SetValueOption.Overwrite);
    expect(root.runtime.diagnostics).toEqual({ status: 'stable' });
  });

  it('WRITE-096 distinguishes null replacement from null load', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      user: { type: 'object', properties: { name: { type: 'string', default: 'N' } } },
    } });
    loadSchemaNodeAtMount(root, {}, SetValueOption.Overwrite);
    writeSchemaNode(root, { user: null }, 'callerReplace', SetValueOption.Overwrite);
    expect(root.structure?.user?.structure?.name?.raw).toBeUndefined();
    resetSchemaNodeForm(root, { user: null }, SetValueOption.Overwrite);
    expect(root.structure?.user?.structure?.name?.raw).toBe('N');
    expect(root.emit).toEqual({});
  });

  it('WRITE-094 whole replacement clears latent raw and is idempotent on a second call', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      secret: { type: 'string', controls: { active: '../flag' } },
    } });
    loadSchemaNodeAtMount(root, { flag: false, secret: 'latent' }, SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.size).toBeGreaterThan(0);
    const emitted = root.emit;
    writeSchemaNode(root, emitted, 'callerReplace', SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.size).toBe(0);
    expect(root.emit).toEqual(emitted);
    const afterFirst = root.emit;
    writeSchemaNode(root, afterFirst, 'callerReplace', SetValueOption.Overwrite);
    expect(root.emit).toBe(afterFirst);
    expect(root.runtime.refreshTargets?.size).toBe(0);
  });

  it('WRITE-097 a whole undefined clears old raw but fills a newly gated node', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      appeared: { type: 'string', default: 'A', controls: { active: '!../flag' } },
    } });
    loadSchemaNodeAtMount(root, { flag: true }, SetValueOption.Overwrite);
    expect(root.structure?.appeared).toBeUndefined();
    writeSchemaNode(root, undefined, 'callerReplace', SetValueOption.Overwrite);
    expect(root.structure?.flag?.raw).toBeUndefined();
    expect(root.structure?.appeared?.raw).toBe('A');
  });

  it('NODE-044 detached write changes only the latent raw for its path and kind', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      secret: { type: 'string', controls: { active: '../flag' } },
    } });
    loadSchemaNodeAtMount(root, { flag: true, secret: 'old' }, SetValueOption.Overwrite);
    const former = root.structure!.secret;
    writeSchemaNode(root.structure!.flag, false, 'input', SetValueOption.Overwrite);
    const commit = root.runtime.commitNumber;
    writeSchemaNode(former, 'new', 'input', SetValueOption.Overwrite);
    expect(former.raw).toBe('old');
    expect(root.runtime.commitNumber).toBe(commit);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/secret', 'string']))).toBe('new');
    writeSchemaNode(root.structure!.flag, true, 'input', SetValueOption.Overwrite);
    expect(root.structure?.secret?.raw).toBe('new');
  });

  it('WRITE-082 fills a host from controls.default before default and distributes through interpret', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      host: { type: 'object', default: { x: '0' },
        controls: { default: { x: '3', extra: 'E' } },
        properties: { x: { type: 'number' }, y: { type: 'string', default: 'Y' } },
      },
    } });
    loadSchemaNodeAtMount(root, {}, SetValueOption.Overwrite);
    expect(root.structure?.host?.structure?.x?.raw).toBe(3);
    expect(root.structure?.host?.structure?.y?.raw).toBe('Y');
    expect(root.structure?.host?.extras).toEqual({ extra: 'E' });
    resetSchemaNodeForm(root, { host: {} }, SetValueOption.Overwrite);
    expect(root.structure?.host?.structure?.x?.raw).toBe(3);
  });

  it('VALUE-030 subtree load resets only scoped interaction and mismatch records', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      left: { type: 'number' }, right: { type: 'number' },
    } });
    loadSchemaNodeAtMount(root, { left: 'bad', right: 'bad' }, SetValueOption.Overwrite);
    root.structure!.left.interactionState = { [NodeState.Touched]: true };
    root.structure!.right.interactionState = { [NodeState.Touched]: true };
    resetSchemaNodeSubtree(root.structure!.left, SetValueOption.Overwrite);
    expect(root.structure?.left?.interactionState[NodeState.Touched]).toBeUndefined();
    expect(root.structure?.right?.interactionState[NodeState.Touched]).toBe(true);
    expect([...root.runtime.typeMismatchPaths].sort()).toEqual(['/left', '/right']);
    expect(root.runtime.typeMismatchRecords?.map((record) => record.path)).toEqual(['/left']);
    expect(root.runtime.typeMismatchRecords?.[0]?.source).toBe('load');
  });

  it('WRITE-085 repeated form load with the same source reconstructs inactive raw', () => {
    const source = { flag: false, secret: 'latent' };
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      secret: { type: 'string', controls: { active: '../flag' } },
    } });
    loadSchemaNodeAtMount(root, source, SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/secret', 'string']))).toBe('latent');
    resetSchemaNodeForm(root, source, SetValueOption.Overwrite);
    expect(root.runtime.latentRaw.get(JSON.stringify(['/secret', 'string']))).toBe('latent');
    expect(readSchemaNodeDefaultValue(root)).toBe(source);
  });
});
