import { expect, it } from 'vitest';

import { formatSegment } from '../formatSegment';
import { isReservedPercentName } from '../isReservedPercentName';
import { parsePointerSegment } from '../parsePointerSegment';

it.each(['%2A', '%2E', '%2E%2E', '%40'])(
  'flags %s because its formatted path reads back as a different name',
  (name) => {
    expect(isReservedPercentName(name)).toBe(true);
    expect(parsePointerSegment(formatSegment(name))).not.toBe(name);
  },
);

it.each(['%2a', '100%', '%2A%2A', '%252A', '*', '.', '..', '@', '', 'a'])(
  'leaves the round-tripping name %j unflagged',
  (name) => {
    expect(isReservedPercentName(name)).toBe(false);
    expect(parsePointerSegment(formatSegment(name))).toBe(name);
  },
);
