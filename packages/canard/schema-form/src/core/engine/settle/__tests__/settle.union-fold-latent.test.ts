import { describe, expect, it } from 'vitest';

import { WriteOption } from '../../types/value';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { createUnionFoldTree } from './fixtures/createUnionFoldTree';
import { readRetainedSlotRaw } from './fixtures/readRetainedSlotRaw';

describe('union fold pending exits and retained raw', () => {
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
    'isolates pending exits and restores $from and $to raw independently',
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
        'callerPartial',
        WriteOption.Merge,
      );
      expect(root.structure?.shared?.raw).toBeUndefined();
      expect(readRetainedSlotRaw(root, '/shared', own)).toBe(first);
      writeFieldNode(
        root.structure!.shared,
        second,
        'input',
        WriteOption.Overwrite,
      );
      writeFieldNode(
        root,
        { [from]: true, [to]: false },
        'callerPartial',
        WriteOption.Merge,
      );
      expect(root.structure?.shared?.raw).toBe(first);
      expect(readRetainedSlotRaw(root, '/shared', other)).toBe(second);
      writeFieldNode(
        root,
        { [from]: false, [to]: true },
        'callerPartial',
        WriteOption.Merge,
      );
      expect(root.structure?.shared?.raw).toBe(second);
      expect(root.runtime.diagnostics.status).toBe('stable');
    },
  );

  it.each([
    { from: 'left', to: 'right', first: 17, second: true },
    { from: 'right', to: 'left', first: true, second: 29 },
  ])(
    'keeps discriminator $from and $to raw in their own folds',
    ({ from, to, first, second }) => {
      const { root } = createUnionFoldTree({ discriminator: true });
      loadFieldNodeAtMount(
        root,
        { tag: from, shared: first },
        WriteOption.Overwrite,
      );
      const original = root.structure!.shared.blueprintNode;
      writeFieldNode(root.structure!.tag, to, 'input', WriteOption.Overwrite);
      expect(root.structure?.shared?.blueprintNode).not.toBe(original);
      expect(root.structure?.shared?.raw).toBeUndefined();
      writeFieldNode(
        root.structure!.shared,
        second,
        'input',
        WriteOption.Overwrite,
      );
      writeFieldNode(root.structure!.tag, from, 'input', WriteOption.Overwrite);
      expect(root.structure?.shared?.raw).toBe(first);
      writeFieldNode(root.structure!.tag, to, 'input', WriteOption.Overwrite);
      expect(root.structure?.shared?.raw).toBe(second);
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
    const detached = root.structure!.shared;
    writeFieldNode(
      root,
      { left: false, right: true },
      'callerPartial',
      WriteOption.Merge,
    );
    expect(detached.detached).toBe(true);
    writeFieldNode(detached, 31, 'callerReplace', WriteOption.Overwrite);
    expect(root.structure?.shared?.raw).toBeUndefined();
    expect(readRetainedSlotRaw(root, '/shared', 'union:3')).toBe(17);
    writeFieldNode(
      root,
      { left: true, right: false },
      'callerPartial',
      WriteOption.Merge,
    );
    expect(root.structure?.shared?.raw).toBe(17);
  });
});
