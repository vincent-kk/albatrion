import { describe, expect, it } from 'vitest';

import { encodeNodeKey } from '../encodeNodeKey';
import { readNodeKeyPath } from '../readNodeKeyPath';

describe('B2-P3 node key JSON compatibility', () => {
  it('matches JSON pair bytes and round-trips every UTF-16 code unit', () => {
    const chunks: string[] = [];
    for (let start = 0; start < 65536; start += 256)
      chunks.push(
        String.fromCharCode(
          ...Array.from({ length: 256 }, (_, index) => start + index),
        ),
      );
    const path = '/' + chunks.join('') + '/😀/\\/"/\ud800/\udfff';
    const key = encodeNodeKey(path, 'union:3');
    expect(key).toBe(JSON.stringify([path, 'union:3']));
    expect(readNodeKeyPath(key)).toBe(path);
  });
});
