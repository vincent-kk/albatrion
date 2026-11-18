import { describe, expect, it } from 'vitest';

import { convertMsFromDuration } from '../convertMsFromDuration';

describe('round-2 common-utils 6: nullish duration fallback', () => {
  it('treats null and undefined like an empty duration', () => {
    expect(convertMsFromDuration(null)).toBe(convertMsFromDuration(''));
    expect(convertMsFromDuration(undefined)).toBe(convertMsFromDuration(''));
  });
});
