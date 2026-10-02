import { describe, expect, it, vi } from 'vitest';

import { makeSchemaNodeTree } from '../../__tests__/makeSchemaNodeTree';
import { SchemaNode } from '../../SchemaNode/SchemaNode';
import * as stateKeys from '../utils/controls/calculateStateKeys';
import * as watchValues from '../utils/controls/readSchemaNodeWatchValues';

/** Large changed scope with only two independently declared feature targets. */
const makeFeatureTree = (features: boolean) => {
  const properties: Record<string, unknown> = Object.fromEntries(
    Array.from({ length: 2048 }, (_, index) => [`f${index}`, { type: 'number' }]),
  );
  if (features) {
    properties.controlled = { type: 'number', controls: { disabled: '../f0 > 0' } };
    properties.watched = { type: 'number', controls: { watch: ['../f0'] } };
  }
  const { root } = makeSchemaNodeTree({ type: 'object', properties });
  if (!(root instanceof SchemaNode)) throw new Error('Expected runtime tree');
  const value = (next: number) => Object.fromEntries(
    Object.keys(properties).map((key) => [key, next]),
  );
  root.setValue(value(0));
  return { root, value };
};

describe('65C-02 feature visits intersect static declarations and changed scope', () => {
  it('bounds state-key visits on whole writes and skips unrelated leaf writes', () => {
    const { root, value } = makeFeatureTree(true);
    const calculate = stateKeys.calculateStateKeys;
    let visits = 0;
    const spy = vi.spyOn(stateKeys, 'calculateStateKeys').mockImplementation((...args) => {
      const result = calculate(...args);
      visits += result.entries.length;
      return result;
    });
    try {
      root.setValue(value(1));
      expect(visits, `state-key whole-write visits: ${visits}`).toBe(1);
      expect((root.find('/controlled') as SchemaNode).disabled).toBe(true);
      visits = 0;
      (root.find('/f1') as SchemaNode).setValue(2);
      expect(visits, `state-key unrelated-write visits: ${visits}`).toBe(0);
      (root.find('/f0') as SchemaNode).setValue(0);
      expect(visits).toBe(1);
      expect((root.find('/controlled') as SchemaNode).disabled).toBe(false);
    } finally { spy.mockRestore(); }
  });

  it('bounds candidate watch reads on whole writes and skips unrelated leaves', () => {
    const { root, value } = makeFeatureTree(true);
    const spy = vi.spyOn(watchValues, 'readSchemaNodeWatchValues');
    try {
      root.setValue(value(1));
      expect(spy.mock.calls.length, `watch whole-write visits: ${spy.mock.calls.length}`)
        .toBe(1);
      spy.mockClear();
      (root.find('/f1') as SchemaNode).setValue(2);
      expect(spy).not.toHaveBeenCalled();
      (root.find('/f0') as SchemaNode).setValue(3);
      expect(spy).toHaveBeenCalledTimes(1);
    } finally { spy.mockRestore(); }
  });

  it('visits neither scoped pass when the blueprint declares neither feature', () => {
    const { root, value } = makeFeatureTree(false);
    const stateSpy = vi.spyOn(stateKeys, 'calculateStateKeys');
    const watchSpy = vi.spyOn(watchValues, 'readSchemaNodeWatchValues');
    try {
      root.setValue(value(1));
      expect(stateSpy).not.toHaveBeenCalled();
      expect(watchSpy.mock.calls.length, `feature-free watch visits: ${watchSpy.mock.calls.length}`)
        .toBe(0);
    } finally { stateSpy.mockRestore(); watchSpy.mockRestore(); }
  });
});
