import { describe, expect, it } from 'vitest';

import { remainOnlyReactComponent } from '../remainOnlyReactComponent';

describe('remainOnlyReactComponent', () => {
  it('should remove non component values', () => {
    const result = remainOnlyReactComponent({ a: 1, b: 2, c: 3 });
    expect(result).toEqual({});
  });

  it('should remain component values', () => {
    const Component = () => <div />;
    const result = remainOnlyReactComponent({ a: 1, b: 2, c: Component });
    expect(result).toMatchObject({ c: Component });
  });
});
