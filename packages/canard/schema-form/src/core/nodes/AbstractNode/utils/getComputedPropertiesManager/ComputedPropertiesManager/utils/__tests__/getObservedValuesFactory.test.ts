import { describe, expect, it } from 'vitest';

import { getObservedValuesFactory } from '../getObservedValuesFactory';
import { getPathManager } from '../getPathManager';

describe('getObservedValuesFactory', () => {
  it('should return undefined when there is no watch', () => {
    const pathManager = getPathManager();

    expect(
      getObservedValuesFactory({ type: 'object' })(pathManager, 'watch'),
    ).toBeUndefined();
  });

  it('should return undefined when watch is not a string or array', () => {
    const pathManager = getPathManager();

    // Runtime test passing number type
    expect(
      // @ts-expect-error
      getObservedValuesFactory({ type: 'object', computed: { watch: 123123 } })(
        pathManager,
        'watch',
      ),
    ).toBeUndefined();
    // Runtime test passing object type
    expect(
      getObservedValuesFactory({
        type: 'object',
        // @ts-expect-error
        computed: { watch: { value: 'value' } },
      })(pathManager, 'watch' as any),
    ).toBeUndefined();
  });

  it('should return undefined when watch is an empty array', () => {
    const pathManager = getPathManager();

    expect(
      getObservedValuesFactory({ type: 'object', computed: { watch: [] } })(
        pathManager,
        'watch',
      ),
    ).toBeUndefined();
  });

  it('should create function with string watch', () => {
    const pathManager = getPathManager();
    const result = getObservedValuesFactory({
      type: 'object',
      computed: { watch: '/value' },
    })(pathManager, 'watch');

    expect(pathManager.get()).toContain('/value');
    expect(result).toBeDefined();
    expect(typeof result).toBe('function');

    const values = [42];
    expect(result!(values)).toEqual([42]);
  });

  it('should create function with string array watch', () => {
    const pathManager = getPathManager();
    const result = getObservedValuesFactory({
      type: 'object',
      computed: { watch: ['/value1', '/value2', '/value3'] },
    })(pathManager, 'watch');

    expect(pathManager.get()).toEqual(['/value1', '/value2', '/value3']);
    expect(result).toBeDefined();

    const values = [10, 'test', true];
    expect(result!(values)).toEqual([10, 'test', true]);
  });

  it('should not add path that already exists in dependency paths array', () => {
    const pathManager = getPathManager();
    pathManager.set('/existingPath');
    const result = getObservedValuesFactory({
      type: 'object',
      computed: { watch: ['/existingPath', '/newPath'] },
    })(pathManager, 'watch');

    expect(pathManager.get()).toContain('/existingPath');
    expect(pathManager.get()).toContain('/newPath');
    expect(pathManager.get().length).toBe(2);

    const values = ['existing', 'new'];
    expect(result!(values)).toEqual(['existing', 'new']);
  });

  it('should get values from correct indices in dependency array', () => {
    const pathManager = getPathManager();
    ['/value1', '/value2', '/value3'].forEach((path) => {
      pathManager.set(path);
    });
    const result = getObservedValuesFactory({
      type: 'object',
      computed: { watch: ['/value2', '/value1'] },
    })(pathManager, 'watch');

    // No new paths should be added
    expect(pathManager.get().length).toBe(3);

    const values = [1, 2, 3];
    // Should get values in original order
    expect(result!(values)).toEqual([2, 1]);
  });
});
