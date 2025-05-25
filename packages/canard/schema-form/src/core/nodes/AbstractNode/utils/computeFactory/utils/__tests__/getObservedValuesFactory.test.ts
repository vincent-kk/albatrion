import { describe, expect, it } from 'vitest';

import { getObservedValuesFactory } from '../getObservedValuesFactory';

describe('getObservedValuesFactory', () => {
  it('should return undefined when there is no watch', () => {
    const dependencyPaths: string[] = [];

    expect(
      getObservedValuesFactory({ type: 'object' })(dependencyPaths, 'watch'),
    ).toBeUndefined();
  });

  it('should return undefined when watch is not a string or array', () => {
    const dependencyPaths: string[] = [];

    // Runtime test passing number type
    expect(
      // @ts-expect-error
      getObservedValuesFactory({ type: 'object', computed: { watch: 123123 } })(
        dependencyPaths,
        'watch',
      ),
    ).toBeUndefined();
    // Runtime test passing object type
    expect(
      getObservedValuesFactory({
        type: 'object',
        // @ts-expect-error
        computed: { watch: { value: 'value' } },
      })(dependencyPaths, 'watch' as any),
    ).toBeUndefined();
  });

  it('should return undefined when watch is an empty array', () => {
    const dependencyPaths: string[] = [];

    expect(
      getObservedValuesFactory({ type: 'object', computed: { watch: [] } })(
        dependencyPaths,
        'watch',
      ),
    ).toBeUndefined();
  });

  it('should create function with string watch', () => {
    const dependencyPaths: string[] = [];
    const result = getObservedValuesFactory({
      type: 'object',
      computed: { watch: '$.value' },
    })(dependencyPaths, 'watch');

    expect(dependencyPaths).toContain('$.value');
    expect(result).toBeDefined();
    expect(typeof result).toBe('function');

    const values = [42];
    expect(result!(values)).toEqual([42]);
  });

  it('should create function with string array watch', () => {
    const dependencyPaths: string[] = [];
    const result = getObservedValuesFactory({
      type: 'object',
      computed: { watch: ['$.value1', '$.value2', '$.value3'] },
    })(dependencyPaths, 'watch');

    expect(dependencyPaths).toEqual(['$.value1', '$.value2', '$.value3']);
    expect(result).toBeDefined();

    const values = [10, 'test', true];
    expect(result!(values)).toEqual([10, 'test', true]);
  });

  it('should not add path that already exists in dependency paths array', () => {
    const dependencyPaths: string[] = ['$.existingPath'];
    const result = getObservedValuesFactory({
      type: 'object',
      computed: { watch: ['$.existingPath', '$.newPath'] },
    })(dependencyPaths, 'watch');

    expect(dependencyPaths).toContain('$.existingPath');
    expect(dependencyPaths).toContain('$.newPath');
    expect(dependencyPaths.length).toBe(2);

    const values = ['existing', 'new'];
    expect(result!(values)).toEqual(['existing', 'new']);
  });

  it('should get values from correct indices in dependency array', () => {
    const dependencyPaths: string[] = ['$.value1', '$.value2', '$.value3'];
    const result = getObservedValuesFactory({
      type: 'object',
      computed: { watch: ['$.value2', '$.value1'] },
    })(dependencyPaths, 'watch');

    // No new paths should be added
    expect(dependencyPaths.length).toBe(3);

    const values = [1, 2, 3];
    // Should get values in original order
    expect(result!(values)).toEqual([2, 1]);
  });
});
