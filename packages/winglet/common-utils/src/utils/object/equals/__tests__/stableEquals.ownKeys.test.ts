import { describe, expect, it } from 'vitest';

import { stableEquals } from '../utils/stableEquals';

describe('stableEquals own key presence', () => {
  it('should not let a key inherited by the right operand match an own key of the left', () => {
    expect(stableEquals({ constructor: Object, x: 1 }, { x: 1, y: 2 })).toBe(
      false,
    );
    expect(stableEquals({ x: 1, y: 2 }, { constructor: Object, x: 1 })).toBe(
      false,
    );
  });

  it('should still accept own keys that shadow inherited names on both sides', () => {
    expect(
      stableEquals(
        { constructor: Object, x: 1 },
        { constructor: Object, x: 1 },
      ),
    ).toBe(true);
  });
});
