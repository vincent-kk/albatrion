import { afterEach, describe, expect, it, vi } from 'vitest';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { WriteOption } from '../../types/value';
import { getBlueprintNodeIdentity } from '../../utils/nodeIdentity/getBlueprintNodeIdentity';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import * as selection from '../utils/compute/childSelection/selectChildren';
import { writeFieldNode } from '../utils/write/writeFieldNode';
import { createUnionFoldTree } from './fixtures/createUnionFoldTree';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('same-name union fold selection', () => {
  it('revives the same union record after exit and re-entry within one settlement', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        t: { type: 'boolean' },
        a: {
          type: 'number',
          default: 1,
          controls: { active: '../t === true' },
        },
        c: {
          type: 'number',
          default: 2,
          controls: { active: '../a === 1' },
        },
        shared: {
          type: ['number', 'string'],
          default: 'refilled',
          controls: {
            active: '../a !== 1 || ../c === 2',
            unsetOnInactive: true,
          },
        },
      },
    });
    loadFieldNodeAtMount(root, { shared: 17 }, WriteOption.Overwrite);
    const original = root.structure!.shared;
    const factory = vi.spyOn(root.runtime, 'nodeFactory');
    const select = selection.selectChildren;
    const key = JSON.stringify(['/shared', 'union:3']);
    const pending: boolean[] = [];
    const revived: boolean[] = [];
    vi.spyOn(selection, 'selectChildren').mockImplementation(
      (node, context, prior, computeChild, immediate) => {
        const changed = select(node, context, prior, computeChild, immediate);
        if (node === root) {
          pending.push(context.pendingExits.get(key) === original);
          revived.push(
            context.revived.has(original) && !context.pendingExits.has(key),
          );
        }
        return changed;
      },
    );

    writeFieldNode(root.structure!.t, true, 'input', WriteOption.Overwrite);

    expect(
      factory.mock.calls.filter(
        ([entry]) => 'node' in entry && entry.name === 'shared',
      ).length,
    ).toBe(0);
    expect(root.structure?.shared).toBe(original);
    expect(pending).toContain(true);
    expect(pending[pending.length - 1]).toBe(false);
    expect(revived).toContain(true);
    expect(original.raw).toBe(17);
    expect(original.detached).toBe(false);
    expect(root.runtime.diagnostics.status).toBe('stable');
  });

  it('mounts only the later fold without exhausting the host wheel', () => {
    const { root, blueprint } = createUnionFoldTree();
    expect(() =>
      loadFieldNodeAtMount(
        root,
        { left: false, right: true, shared: true },
        WriteOption.Overwrite,
      ),
    ).not.toThrow();
    const variants = blueprint.root.childEntries.filter(
      (entry) => entry.name === 'shared',
    );
    expect(root.structure?.shared?.blueprintNode).toBe(variants[1].node);
    expect(root.structure?.shared?.raw).toBe(true);
    expect(
      root.children?.filter((child) => child.name === 'shared'),
    ).toHaveLength(1);
    expect(root.runtime.diagnostics.status).toBe('stable');
  });

  it.each([
    { from: 'left', to: 'right', value: 7, index: 1 },
    { from: 'right', to: 'left', value: true, index: 0 },
  ])(
    'converges on an exclusive $from → $to switch and back',
    ({ from, to, value, index }) => {
      const { root, blueprint } = createUnionFoldTree();
      loadFieldNodeAtMount(
        root,
        { [from]: true, [to]: false, shared: value },
        WriteOption.Overwrite,
      );
      const original = root.structure!.shared;
      expect(() =>
        writeFieldNode(
          root,
          { [from]: false, [to]: true },
          'callerPartial',
          WriteOption.Merge,
        ),
      ).not.toThrow();
      const variants = blueprint.root.childEntries.filter(
        (entry) => entry.name === 'shared',
      );
      expect(root.structure?.shared?.blueprintNode).toBe(variants[index].node);
      expect(root.structure?.shared).not.toBe(original);
      expect(root.runtime.diagnostics.status).toBe('stable');
      expect(() =>
        writeFieldNode(
          root,
          { [from]: true, [to]: false },
          'callerPartial',
          WriteOption.Merge,
        ),
      ).not.toThrow();
      expect(root.structure?.shared?.blueprintNode).toBe(
        original.blueprintNode,
      );
      expect(root.runtime.diagnostics.status).toBe('stable');
    },
  );

  it('FRAGMENT-049 replaces a live later fold with the first active fold and reports conflict', () => {
    const { root, blueprint } = createUnionFoldTree();
    loadFieldNodeAtMount(
      root,
      { left: false, right: true, shared: true },
      WriteOption.Overwrite,
    );
    const later = root.structure!.shared;
    let conflict: unknown;
    try {
      writeFieldNode(root, { left: true }, 'callerPartial', WriteOption.Merge);
    } catch (error) {
      conflict = error;
    }
    expect(conflict).toMatchObject({
      code: 'SCHEMA_FORM_ERROR.SHARED_NODE_CONFLICT',
      message: 'Active declarations conflict at /shared',
    });
    expect(root.structure?.shared?.blueprintNode).toBe(
      blueprint.root.childEntries.find((entry) => entry.name === 'shared')
        ?.node,
    );
    expect(root.structure?.shared).not.toBe(later);
    expect(
      root.children?.filter((child) => child.name === 'shared'),
    ).toHaveLength(1);
    expect(root.runtime.diagnostics).toMatchObject({
      status: 'degraded',
      cause: 'sharedConflict',
    });
  });

  it('shares string and nullable string but separates the string/number fold', () => {
    const { blueprint } = createUnionFoldTree({
      left: { type: 'string' },
      right: { type: ['string', 'null'] },
    });
    const shared = blueprint.root.childEntries.filter(
      (entry) => entry.name === 'shared',
    );
    expect(shared).toHaveLength(1);
    expect(shared[0].declarations).toHaveLength(2);
    expect(getBlueprintNodeIdentity(shared[0].node)).toBe('string');
    const different = createUnionFoldTree({
      left: { type: 'string' },
      right: { type: ['string', 'number'] },
    }).blueprint.root.childEntries.filter((entry) => entry.name === 'shared');
    expect(different).toHaveLength(2);
    expect(getBlueprintNodeIdentity(different[0].node)).toBe('string');
    expect(getBlueprintNodeIdentity(different[1].node)).toBe('union:3');
  });
});
