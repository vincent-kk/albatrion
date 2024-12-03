import { describe, expect, it } from 'vitest';

import { removeNonComponentValue } from '../removeNonComponentValue';

describe('removeNonComponentValue', () => {
  it('should remove non component values', () => {
    const result = removeNonComponentValue({ a: 1, b: 2, c: 3 });
    expect(result).toEqual({});
  });

  it('should remain component values', () => {
    const Component = () => <div />;
    const result = removeNonComponentValue({ a: 1, b: 2, c: Component });
    expect(result).toMatchObject({ c: Component });
  });
});
