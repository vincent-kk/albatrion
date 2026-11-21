import { describe, expect, it } from 'vitest';

import { compare } from '../compare';

describe('round-2 json 3: type replacement ownership', () => {
  it.each([false, true])(
    'isolates values in immutable comparison (strict %s)',
    (strict) => {
      const source = { a: { x: 1 } },
        target = { a: [1, 2] };
      const patches = compare(source, target, { strict });
      const reference = compare({ a: 0 }, { a: target.a }, { strict });
      const replacement = patches.find((p) => p.op === 'replace');
      const referenceReplacement = reference.find((p) => p.op === 'replace');
      expect(replacement?.value === target.a).toBe(
        referenceReplacement?.value === target.a,
      );
      expect(replacement?.value).not.toBe(target.a);
      if (strict)
        expect(patches.find((p) => p.op === 'test')?.value).not.toBe(source.a);
    },
  );
});
