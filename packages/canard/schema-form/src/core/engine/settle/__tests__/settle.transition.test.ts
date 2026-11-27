import { describe, expect, it } from 'vitest';

import { FieldNodeState } from '@/schema-form/core/engine/types/state';
import {
  FieldNodeWriteKind,
  WriteOption,
} from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { readFieldNodeDefaultValue } from '../utils/loadValues/readFieldNodeDefaultValue';
import { resetFieldNodeForm } from '../utils/reset/resetFieldNodeForm';
import { resetFieldNodeSubtree } from '../utils/reset/resetFieldNodeSubtree';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { readRetainedSlotSource } from './fixtures/readRetainedSlotSource';
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
    expect(root.__childrenByName__?.name?.source).toBe('filled');
    writeFieldNode(
      root,
      {},
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    expect(root.__childrenByName__?.name?.source).toBeUndefined();
    resetFieldNodeForm(root, {}, WriteOption.Overwrite);
    expect(root.__childrenByName__?.name?.source).toBe('filled');
  });

  it('TEST-069 SetValueOption Overwrite replaces missing child source without a new lifetime', () => {
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
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    expect(root.__childrenByName__?.name?.source).toBeUndefined();
    expect(root.__childrenByName__?.gated?.source).toBe('new');
    expect(root.runtime.loadSnapshot).toEqual({
      name: 'original',
      flag: false,
    });
    expect(readFieldNodeDefaultValue(root.__childrenByName__!.name)).toBe(
      'original',
    );
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
      FieldNodeWriteKind.CallerPartial,
      WriteOption.Merge,
    );
    expect(root.__outputValue__).toEqual({
      a: 'new',
      b: 'B',
      flag: true,
      gated: 'new',
    });
    writeFieldNode(
      root,
      null,
      FieldNodeWriteKind.CallerPartial,
      WriteOption.Merge,
    );
    expect(root.source).toBeNull();
    expect(root.__childrenByName__?.a?.source).toBeUndefined();
    expect(root.runtime.misfitPaths.has('')).toBe(true);
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
    expect(root.__childrenByName__?.name?.source).toBeUndefined();
    resetFieldNodeForm(root, {}, WriteOption.Overwrite);
    expect(root.__childrenByName__?.name?.source).toBe('filled');
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
    expect(root.__childrenByName__?.name?.source).toBe('filled');
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
    expect(root.__childrenByName__?.name?.source).toBeUndefined();
    root.runtime.disableAutomaticWrites = true;
    resetFieldNodeForm(root, {}, both);
    expect(root.__childrenByName__?.name?.source).toBeUndefined();
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
      root.__childrenByName__!.left.__childrenByName__!.a,
      'changed',
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    writeFieldNode(
      root.__childrenByName__!.right,
      'changed',
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    resetFieldNodeSubtree(root.__childrenByName__!.left, WriteOption.Overwrite);
    expect(root.__childrenByName__?.left?.__childrenByName__?.a?.source).toBe(
      'D',
    );
    expect(root.__childrenByName__?.right?.source).toBe('changed');
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
    resetFieldNodeSubtree(root.__childrenByName__!.name, WriteOption.Overwrite);
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
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    expect(
      root.__childrenByName__?.user?.__childrenByName__?.name?.source,
    ).toBeUndefined();
    resetFieldNodeForm(root, { user: null }, WriteOption.Overwrite);
    expect(
      root.__childrenByName__?.user?.__childrenByName__?.name?.source,
    ).toBeUndefined();
    expect(root.__outputValue__).toEqual({ user: null });
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
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    for (const root of [loaded, written]) {
      const account = root.__childrenByName__!.account!;
      expect(root.__outputValue__).toEqual({ account: null });
      expect(account.__childrenByName__?.first?.source).toBeUndefined();
      expect(account.__childrenByName__?.second?.source).toBeUndefined();
      writeFieldNode(
        account.__childrenByName__!.first!,
        'typed',
        FieldNodeWriteKind.Input,
        WriteOption.Overwrite,
      );
      expect(root.__outputValue__).toEqual({ account: { first: 'typed' } });
    }
  });

  it('VALUE-036 a non-array source loaded into an array leaves its items unfilled', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        list: {
          type: 'array',
          prefixItems: [{ type: 'string', default: 'P' }],
        },
      },
    });
    loadFieldNodeAtMount(root, { list: 'x' }, WriteOption.Overwrite);
    expect(root.__childrenByName__!.list!.source).toBe('x');
    expect(root.__childrenByName__!.list!.children).toEqual([]);
  });

  it('WRITE-094 whole replacement clears latent source and is idempotent on a second call', () => {
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
    const outputValue = root.__outputValue__;
    writeFieldNode(
      root,
      outputValue,
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    expect(root.__outputValue__).toEqual(outputValue);
    const afterFirst = root.__outputValue__;
    writeFieldNode(
      root,
      afterFirst,
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    expect(root.__outputValue__).toBe(afterFirst);
    expect(root.runtime.refreshTargets?.size).toBe(0);
  });

  it('WRITE-097 a whole undefined clears old source but fills a newly gated node', () => {
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
    expect(root.__childrenByName__?.appeared).toBeUndefined();
    writeFieldNode(
      root,
      undefined,
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    expect(root.__childrenByName__?.flag?.source).toBeUndefined();
    expect(root.__childrenByName__?.appeared?.source).toBe('A');
  });

  it('NODE-044 detached write leaves every source unchanged', () => {
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
    const former = root.__childrenByName__!.secret;
    writeFieldNode(
      root.__childrenByName__!.flag,
      false,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    const commit = root.runtime.commitNumber;
    writeFieldNode(
      former,
      'new',
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    expect(former.source).toBe('old');
    expect(root.runtime.commitNumber).toBe(commit);
    expect(readRetainedSlotSource(root, '/secret', 'string')).toBe('old');
    writeFieldNode(
      root.__childrenByName__!.flag,
      true,
      FieldNodeWriteKind.Input,
      WriteOption.Overwrite,
    );
    expect(root.__childrenByName__?.secret?.source).toBe('old');
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
    expect(root.__childrenByName__?.host?.__childrenByName__?.x?.source).toBe(
      3,
    );
    expect(root.__childrenByName__?.host?.__childrenByName__?.y?.source).toBe(
      'Y',
    );
    expect(root.__childrenByName__?.host?.extras).toEqual({ extra: 'E' });
    resetFieldNodeForm(root, { host: {} }, WriteOption.Overwrite);
    expect(root.__childrenByName__?.host?.__childrenByName__?.x?.source).toBe(
      3,
    );
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
    setTestInteractionState(root.__childrenByName__!.left, {
      [FieldNodeState.Touched]: true,
    });
    setTestInteractionState(root.__childrenByName__!.right, {
      [FieldNodeState.Touched]: true,
    });
    resetFieldNodeSubtree(root.__childrenByName__!.left, WriteOption.Overwrite);
    expect(
      root.__childrenByName__?.left?.__state__[FieldNodeState.Touched],
    ).toBeUndefined();
    expect(
      root.__childrenByName__?.right?.__state__[FieldNodeState.Touched],
    ).toBe(true);
    expect([...root.runtime.misfitPaths].sort()).toEqual(['/left', '/right']);
    expect(root.runtime.misfitRecords?.map((record) => record.path)).toEqual([
      '/left',
    ]);
    expect(root.runtime.misfitRecords?.[0]?.source).toBe('load');
  });

  it('WRITE-085 repeated form load with the same source reconstructs inactive source', () => {
    const source = { flag: false, secret: 'latent' };
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        secret: { type: 'string', controls: { active: '../flag' } },
      },
    });
    loadFieldNodeAtMount(root, source, WriteOption.Overwrite);
    expect(readRetainedSlotSource(root, '/secret', 'string')).toBe('latent');
    resetFieldNodeForm(root, source, WriteOption.Overwrite);
    expect(readRetainedSlotSource(root, '/secret', 'string')).toBe('latent');
    expect(readFieldNodeDefaultValue(root)).toBe(source);
  });
});
