import { describe, expect, it } from 'vitest';

import { Murmur3 } from '../murmur3';

describe('round-2 common-utils 3: string partition equivalence', () => {
  it.each(['abcdefghijk', 'àéøÿáâãäåæçèé', 'a가😀나bc다😃z끝!'])(
    'matches every split of %s',
    (text) => {
      const expected = new Murmur3().hash(text).result();
      for (let split = 0; split <= text.length; split++)
        expect(
          new Murmur3()
            .hash(text.slice(0, split))
            .hash(text.slice(split))
            .result(),
        ).toBe(expected);
    },
  );
});
