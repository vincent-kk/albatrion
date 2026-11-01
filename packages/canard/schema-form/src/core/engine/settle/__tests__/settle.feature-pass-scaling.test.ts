import { describe, expect, it, vi } from 'vitest';

import { isTestFieldNode } from '@/schema-form/core/__tests__/fixtures/testFieldNode';
import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import type { NumberNode } from '@/schema-form/core/surface';

import * as stateKeys from '../utils/controls/calculateStateKeys';
import * as watchValues from '../utils/controls/readFieldNodeWatchValues';

/** Large changed scope with only two independently declared feature targets. */
const makeFeatureTree = (features: boolean) => {
  const properties: Record<string, unknown> = Object.fromEntries(
    Array.from({ length: 2048 }, (_, index) => [
      `f${index}`,
      { type: 'number' },
    ]),
  );
  if (features) {
    properties.controlled = {
      type: 'number',
      controls: { disabled: '../f0 > 0' },
    };
    properties.watched = { type: 'number', controls: { watch: ['../f0'] } };
  }
  const { root } = makeFieldNodeTree({ type: 'object', properties });
  if (!isTestFieldNode(root)) throw new Error('Expected runtime tree');
  const value = (next: number) =>
    Object.fromEntries(Object.keys(properties).map((key) => [key, next]));
  root.setValue(value(0));
  return { root, value };
};

describe('65C-02 feature visits intersect static declarations and changed scope', () => {
  it('bounds state-key visits on whole writes and skips unrelated leaf writes', () => {
    // Shipping visit counts exclude the independent slot-verification tree.
    const { root, value } = makeFeatureTree(true);
    const calculate = stateKeys.calculateStateKeys;
    let visits = 0;
    const spy = vi
      .spyOn(stateKeys, 'calculateStateKeys')
      .mockImplementation((...args) => {
        const result = calculate(...args);
        visits += result.entries.length;
        return result;
      });
    try {
      root.setValue(value(1));
      expect(visits, `state-key whole-write visits: ${visits}`).toBe(1);
      expect((root.find('/controlled') as NumberNode).disabled).toBe(true);
      visits = 0;
      (root.find('/f1') as NumberNode).setValue(2);
      expect(visits, `state-key unrelated-write visits: ${visits}`).toBe(0);
      (root.find('/f0') as NumberNode).setValue(0);
      expect(visits).toBe(1);
      expect((root.find('/controlled') as NumberNode).disabled).toBe(false);
    } finally {
      spy.mockRestore();
    }
  });

  it('bounds candidate watch reads on whole writes and skips unrelated leaves', () => {
    // Shipping watch-read counts exclude the independent slot-verification tree.
    const { root, value } = makeFeatureTree(true);
    const spy = vi.spyOn(watchValues, 'readFieldNodeWatchValues');
    try {
      root.setValue(value(1));
      expect(
        spy.mock.calls.length,
        `watch whole-write visits: ${spy.mock.calls.length}`,
      ).toBe(1);
      spy.mockClear();
      (root.find('/f1') as NumberNode).setValue(2);
      expect(spy).not.toHaveBeenCalled();
      (root.find('/f0') as NumberNode).setValue(3);
      expect(spy).toHaveBeenCalledTimes(1);
    } finally {
      spy.mockRestore();
    }
  });

  it('visits neither scoped pass when the blueprint declares neither feature', () => {
    // Shipping scoped-pass counts exclude independent verification observations.
    const { root, value } = makeFeatureTree(false);
    const stateSpy = vi.spyOn(stateKeys, 'calculateStateKeys');
    const watchSpy = vi.spyOn(watchValues, 'readFieldNodeWatchValues');
    try {
      root.setValue(value(1));
      expect(stateSpy).not.toHaveBeenCalled();
      expect(
        watchSpy.mock.calls.length,
        `feature-free watch visits: ${watchSpy.mock.calls.length}`,
      ).toBe(0);
    } finally {
      stateSpy.mockRestore();
      watchSpy.mockRestore();
    }
  });
});
