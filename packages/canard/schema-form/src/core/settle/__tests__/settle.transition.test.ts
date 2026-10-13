import { describe, expect, it } from 'vitest';

import { FieldNodeState } from '../../types/state';
import { WriteOption } from '../../types/value';
import {
  loadFieldNodeAtMount,
  readFieldNodeDefaultValue,
  resetFieldNodeForm,
  resetFieldNodeSubtree,
  writeFieldNode,
} from '../index';
import { createTestTree } from './fixtures/createTestTree';
import { setTestInteractionState } from './fixtures/setTestInteractionState';

// filid:contract settle-write
describe('settle transitions and loads', () => {
  it('TEST-069 load lifetime and SETTLE-048 load clears the appearance baseline', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        name: { type: 'string', default: 'filled' },
      },
    });
    loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
    expect(root.structure?.name?.raw).toBe('filled');
    writeFieldNode(root, {}, 'callerReplace', WriteOption.Overwrite);
    expect(root.structure?.name?.raw).toBeUndefined();
    resetFieldNodeForm(root, {}, WriteOption.Overwrite);
    expect(root.structure?.name?.raw).toBe('filled');
  });

  it('TEST-069 SetValueOption Overwrite replaces missing child raw without a new lifetime', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        name: { type: 'string', default: 'filled' },
        flag: { type: 'boolean' },
        gated: {
          type: 'string',
          default: 'new',
          controls: { active: '../flag' },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { name: 'original', flag: false },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root,
      { flag: true },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.structure?.name?.raw).toBeUndefined();
    expect(root.structure?.gated?.raw).toBe('new');
    expect(root.runtime.loadSnapshot).toEqual({
      name: 'original',
      flag: false,
    });
    expect(readFieldNodeDefaultValue(root.structure!.name)).toBe('original');
  });

  it('TEST-069 SetValueOption Merge retains missing keys and replaces a non-object V WRITE-079', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'string' },
        flag: { type: 'boolean' },
        gated: {
          type: 'string',
          default: 'new',
          controls: { active: '../flag' },
        },
      },
    });
    loadFieldNodeAtMount(
      root,
      { a: 'A', b: 'B', flag: false },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root,
      { a: 'new', flag: true },
      'callerPartial',
      WriteOption.Merge,
    );
    expect(root.emit).toEqual({ a: 'new', b: 'B', flag: true, gated: 'new' });
    writeFieldNode(root, null, 'callerPartial', WriteOption.Merge);
    expect(root.raw).toBeNull();
    expect(root.structure?.a?.raw).toBeUndefined();
    expect(root.runtime.typeMismatchPaths.has('')).toBe(true);
  });

  it('TEST-069 SetValueOption DisableAutomaticWrites suppresses an actual fill', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        name: { type: 'string', default: 'filled' },
      },
    });
    loadFieldNodeAtMount(
      root,
      {},
      WriteOption.Overwrite | WriteOption.DisableAutomaticWrites,
    );
    expect(root.structure?.name?.raw).toBeUndefined();
    resetFieldNodeForm(root, {}, WriteOption.Overwrite);
    expect(root.structure?.name?.raw).toBe('filled');
  });

  it('TEST-069 SetValueOption EnableAutomaticWrites overrides Form suppression', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        name: { type: 'string', default: 'filled' },
      },
    });
    root.runtime.disableAutomaticWrites = true;
    loadFieldNodeAtMount(
      root,
      {},
      WriteOption.Overwrite | WriteOption.EnableAutomaticWrites,
    );
    expect(root.structure?.name?.raw).toBe('filled');
  });

  it('WRITE-015 suppression wins when a call sets both automatic-write bits', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        name: { type: 'string', default: 'filled' },
      },
    });
    const both =
      WriteOption.Overwrite |
      WriteOption.DisableAutomaticWrites |
      WriteOption.EnableAutomaticWrites;
    loadFieldNodeAtMount(root, {}, both);
    expect(root.structure?.name?.raw).toBeUndefined();
    root.runtime.disableAutomaticWrites = true;
    resetFieldNodeForm(root, {}, both);
    expect(root.structure?.name?.raw).toBeUndefined();
  });

  it('SETTLE-049 and EVENT-072 resetSubtree loads only its subtree snapshot', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        left: {
          type: 'object',
          properties: { a: { type: 'string', default: 'D' } },
        },
        right: { type: 'string', default: 'R' },
      },
    });
    loadFieldNodeAtMount(
      root,
      { left: {}, right: 'given' },
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.structure!.left.structure!.a,
      'changed',
      'input',
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.structure!.right,
      'changed',
      'input',
      WriteOption.Overwrite,
    );
    resetFieldNodeSubtree(root.structure!.left, WriteOption.Overwrite);
    expect(root.structure?.left?.structure?.a?.raw).toBe('D');
    expect(root.structure?.right?.raw).toBe('changed');
  });

  it('ERROR-204 form-level load resets diagnostics but subtree load does not', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    });
    loadFieldNodeAtMount(root, { name: 'x' }, WriteOption.Overwrite);
    root.runtime.diagnostics = {
      status: 'degraded',
      cause: 'budget',
      commit: 1,
    };
    resetFieldNodeSubtree(root.structure!.name, WriteOption.Overwrite);
    expect(root.runtime.diagnostics.status).toBe('degraded');
    resetFieldNodeForm(root, { name: 'y' }, WriteOption.Overwrite);
    expect(root.runtime.diagnostics).toEqual({ status: 'stable' });
  });

  it('WRITE-096 null replacement and null load both leave children unfilled', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: { name: { type: 'string', default: 'N' } },
        },
      },
    });
    loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
    writeFieldNode(
      root,
      { user: null },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.structure?.user?.structure?.name?.raw).toBeUndefined();
    resetFieldNodeForm(root, { user: null }, WriteOption.Overwrite);
    expect(root.structure?.user?.structure?.name?.raw).toBeUndefined();
    expect(root.emit).toEqual({ user: null });
  });

  it('VALUE-036 a loaded null object leaves its children unfilled exactly like a written null', () => {
    const tree = () =>
      createTestTree({
        type: 'object',
        properties: {
          account: {
            type: ['object', 'null'],
            properties: {
              first: { type: 'string', default: 'hidden' },
              second: { type: 'string', default: 'sibling' },
            },
          },
        },
      }).root;
    const loaded = tree();
    loadFieldNodeAtMount(loaded, { account: null }, WriteOption.Overwrite);
    const written = tree();
    loadFieldNodeAtMount(written, {}, WriteOption.Overwrite);
    writeFieldNode(
      written,
      { account: null },
      'callerReplace',
      WriteOption.Overwrite,
    );
    for (const root of [loaded, written]) {
      const account = root.structure!.account!;
      expect(root.emit).toEqual({ account: null });
      expect(account.structure?.first?.raw).toBeUndefined();
      expect(account.structure?.second?.raw).toBeUndefined();
      writeFieldNode(
        account.structure!.first!,
        'typed',
        'input',
        WriteOption.Overwrite,
      );
      expect(root.emit).toEqual({ account: { first: 'typed' } });
    }
  });

  it('WRITE-094 whole replacement clears latent raw and is idempotent on a second call', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        secret: { type: 'string', controls: { active: '../flag' } },
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: false, secret: 'latent' },
      WriteOption.Overwrite,
    );
    expect(root.runtime.latentRaw.size).toBeGreaterThan(0);
    const emitted = root.emit;
    writeFieldNode(root, emitted, 'callerReplace', WriteOption.Overwrite);
    expect(root.runtime.latentRaw.size).toBe(0);
    expect(root.emit).toEqual(emitted);
    const afterFirst = root.emit;
    writeFieldNode(root, afterFirst, 'callerReplace', WriteOption.Overwrite);
    expect(root.emit).toBe(afterFirst);
    expect(root.runtime.refreshTargets?.size).toBe(0);
  });

  it('WRITE-097 a whole undefined clears old raw but fills a newly gated node', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        appeared: {
          type: 'string',
          default: 'A',
          controls: { active: '!../flag' },
        },
      },
    });
    loadFieldNodeAtMount(root, { flag: true }, WriteOption.Overwrite);
    expect(root.structure?.appeared).toBeUndefined();
    writeFieldNode(root, undefined, 'callerReplace', WriteOption.Overwrite);
    expect(root.structure?.flag?.raw).toBeUndefined();
    expect(root.structure?.appeared?.raw).toBe('A');
  });

  it('NODE-044 detached write changes only the latent raw for its path and kind', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        secret: { type: 'string', controls: { active: '../flag' } },
      },
    });
    loadFieldNodeAtMount(
      root,
      { flag: true, secret: 'old' },
      WriteOption.Overwrite,
    );
    const former = root.structure!.secret;
    writeFieldNode(root.structure!.flag, false, 'input', WriteOption.Overwrite);
    const commit = root.runtime.commitNumber;
    writeFieldNode(former, 'new', 'input', WriteOption.Overwrite);
    expect(former.raw).toBe('old');
    expect(root.runtime.commitNumber).toBe(commit);
    expect(
      root.runtime.latentRaw.get(JSON.stringify(['/secret', 'string'])),
    ).toBe('new');
    writeFieldNode(root.structure!.flag, true, 'input', WriteOption.Overwrite);
    expect(root.structure?.secret?.raw).toBe('new');
  });

  it('WRITE-082 fills a host from controls.default before default and distributes through interpret', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        host: {
          type: 'object',
          default: { x: '0' },
          controls: { default: { x: '3', extra: 'E' } },
          properties: {
            x: { type: 'number' },
            y: { type: 'string', default: 'Y' },
          },
        },
      },
    });
    loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
    expect(root.structure?.host?.structure?.x?.raw).toBe(3);
    expect(root.structure?.host?.structure?.y?.raw).toBe('Y');
    expect(root.structure?.host?.undeclaredValues).toEqual({ extra: 'E' });
    resetFieldNodeForm(root, { host: {} }, WriteOption.Overwrite);
    expect(root.structure?.host?.structure?.x?.raw).toBe(3);
  });

  it('VALUE-030 subtree load resets only scoped interaction and mismatch records', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        left: { type: 'number' },
        right: { type: 'number' },
      },
    });
    loadFieldNodeAtMount(
      root,
      { left: 'bad', right: 'bad' },
      WriteOption.Overwrite,
    );
    setTestInteractionState(root.structure!.left, {
      [FieldNodeState.Touched]: true,
    });
    setTestInteractionState(root.structure!.right, {
      [FieldNodeState.Touched]: true,
    });
    resetFieldNodeSubtree(root.structure!.left, WriteOption.Overwrite);
    expect(
      root.structure?.left?.interactionState[FieldNodeState.Touched],
    ).toBeUndefined();
    expect(
      root.structure?.right?.interactionState[FieldNodeState.Touched],
    ).toBe(true);
    expect([...root.runtime.typeMismatchPaths].sort()).toEqual([
      '/left',
      '/right',
    ]);
    expect(
      root.runtime.typeMismatchRecords?.map((record) => record.path),
    ).toEqual(['/left']);
    expect(root.runtime.typeMismatchRecords?.[0]?.source).toBe('load');
  });

  it('WRITE-085 repeated form load with the same source reconstructs inactive raw', () => {
    const source = { flag: false, secret: 'latent' };
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        secret: { type: 'string', controls: { active: '../flag' } },
      },
    });
    loadFieldNodeAtMount(root, source, WriteOption.Overwrite);
    expect(
      root.runtime.latentRaw.get(JSON.stringify(['/secret', 'string'])),
    ).toBe('latent');
    resetFieldNodeForm(root, source, WriteOption.Overwrite);
    expect(
      root.runtime.latentRaw.get(JSON.stringify(['/secret', 'string'])),
    ).toBe('latent');
    expect(readFieldNodeDefaultValue(root)).toBe(source);
  });
});
