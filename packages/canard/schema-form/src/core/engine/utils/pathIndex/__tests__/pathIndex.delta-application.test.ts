import { afterEach, describe, expect, it, vi } from 'vitest';

import { PathKeyedMap } from '../PathKeyedMap';

afterEach(() => vi.restoreAllMocks());

describe('B2-P3 pair index codec', () => {
  it('indexes escaped pair keys without JSON.parse, including surrogate and control characters', () => {
    const paths = [
      '',
      '/a~1b/~0',
      '/"quoted"/\n/\t/\\',
      '/한글/😀/\ud800/\udfff',
      '/\u0000/\b/\f/\r',
    ];
    const keys = paths.map((path) => JSON.stringify([path, 'union:3']));
    const parse = vi.spyOn(JSON, 'parse');
    const store = new PathKeyedMap('pair');
    for (let index = 0; index < paths.length; index++) {
      store.set(keys[index], index);
      expect(store.pathIndex.under(paths[index]).has(keys[index])).toBe(true);
    }
    expect(parse).not.toHaveBeenCalled();
  });
});
