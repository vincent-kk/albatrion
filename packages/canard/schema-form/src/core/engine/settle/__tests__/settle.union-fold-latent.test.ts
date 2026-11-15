import { describe, expect, it } from 'vitest';

import { FieldNodeWriteKind, WriteOption } from '../../types/value';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { createUnionFoldTree } from './fixtures/createUnionFoldTree';
import { readRetainedSlotSource } from './fixtures/readRetainedSlotSource';

describe('union fold pending exits and retained source', () => {
  it.each([
    {
      from: 'left',
      to: 'right',
      first: 17,
      second: true,
      own: 'union:3',
      other: 'union:5',
    },
    {
      from: 'right',
      to: 'left',
      first: true,
      second: 29,
      own: 'union:5',
      other: 'union:3',
    },
  ])(
    'isolates pending exits and restores $from and $to source independently',
    ({ from, to, first, second, own, other }) => {
      const { root } = createUnionFoldTree();
      loadFieldNodeAtMount(
        root,
        { [from]: true, [to]: false, shared: first },
        WriteOption.Overwrite,
      );
      writeFieldNode(
        root,
        { [from]: false, [to]: true },
        FieldNodeWriteKind.CallerPartial,
        WriteOption.Merge,
      );
      expect(root.childrenByName?.shared?.source).toBeUndefined();
      expect(readRetainedSlotSource(root, '/shared', own)).toBe(first);
      writeFieldNode(
        root.childrenByName!.shared,
        second,
        FieldNodeWriteKind.Input,
        WriteOption.Overwrite,
      );
      writeFieldNode(
        root,
        { [from]: true, [to]: false },
        FieldNodeWriteKind.CallerPartial,
        WriteOption.Merge,
      );
      expect(root.childrenByName?.shared?.source).toBe(first);
      expect(readRetainedSlotSource(root, '/shared', other)).toBe(second);
      writeFieldNode(
        root,
        { [from]: false, [to]: true },
        FieldNodeWriteKind.CallerPartial,
        WriteOption.Merge,
      );
      expect(root.childrenByName?.shared?.source).toBe(second);
      expect(root.runtime.diagnostics.status).toBe('stable');
    },
  );

  it.each([
    { from: 'left', to: 'right', first: 17, second: true },
    { from: 'right', to: 'left', first: true, second: 29 },
  ])(
    'keeps discriminator $from and $to source in their own folds',
    ({ from, to, first, second }) => {
      const { root } = createUnionFoldTree({ discriminator: true });
      loadFieldNodeAtMount(
        root,
        { tag: from, shared: first },
        WriteOption.Overwrite,
      );
      const original = root.childrenByName!.shared.blueprintNode;
      writeFieldNode(
        root.childrenByName!.tag,
        to,
        FieldNodeWriteKind.Input,
        WriteOption.Overwrite,
      );
      expect(root.childrenByName?.shared?.blueprintNode).not.toBe(original);
      expect(root.childrenByName?.shared?.source).toBeUndefined();
      writeFieldNode(
        root.childrenByName!.shared,
        second,
        FieldNodeWriteKind.Input,
        WriteOption.Overwrite,
      );
      writeFieldNode(
        root.childrenByName!.tag,
        from,
        FieldNodeWriteKind.Input,
        WriteOption.Overwrite,
      );
      expect(root.childrenByName?.shared?.source).toBe(first);
      writeFieldNode(
        root.childrenByName!.tag,
        to,
        FieldNodeWriteKind.Input,
        WriteOption.Overwrite,
      );
      expect(root.childrenByName?.shared?.source).toBe(second);
      expect(root.runtime.diagnostics.status).toBe('stable');
    },
  );

  it('ignores a detached fold write beside a different live union fold', () => {
    const { root } = createUnionFoldTree();
    loadFieldNodeAtMount(
      root,
      { left: true, right: false, shared: 17 },
      WriteOption.Overwrite,
    );
    const detached = root.childrenByName!.shared;
    writeFieldNode(
      root,
      { left: false, right: true },
      FieldNodeWriteKind.CallerPartial,
      WriteOption.Merge,
    );
    expect(detached.isDetached).toBe(true);
    writeFieldNode(
      detached,
      31,
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    expect(root.childrenByName?.shared?.source).toBeUndefined();
    expect(readRetainedSlotSource(root, '/shared', 'union:3')).toBe(17);
    writeFieldNode(
      root,
      { left: true, right: false },
      FieldNodeWriteKind.CallerPartial,
      WriteOption.Merge,
    );
    expect(root.childrenByName?.shared?.source).toBe(17);
  });
});
