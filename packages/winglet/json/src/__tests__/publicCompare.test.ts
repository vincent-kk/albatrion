import { describe, expect, it } from 'vitest';

import { compare } from '../index';

type JSONRoot = Parameters<typeof compare>[0];

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

  it.each([0, 300])(
    'enumerates a replacement object only when copying it at depth %i',
    (depth) => {
      let reads = 0;
      const replacement = new Proxy(
        { x: 1 },
        {
          ownKeys(value) {
            reads++;
            return Reflect.ownKeys(value);
          },
        },
      );
      let source: JSONRoot = [1];
      let target: JSONRoot = replacement;
      for (let level = 0; level < depth; level++) {
        source = { node: source };
        target = { node: target };
      }
      const path = '/node'.repeat(depth);
      const mutable = compare(source, target, { immutable: false });
      expect(reads).toBe(0);
      expect(mutable[0]).toMatchObject({ op: 'replace', path });
      expect(mutable.find((patch) => patch.op === 'replace')?.value).toBe(
        replacement,
      );

      const immutable = compare(source, target, { immutable: true });
      expect(reads).toBe(1);
      expect(immutable).toEqual([{ op: 'replace', path, value: { x: 1 } }]);
      expect(immutable.find((patch) => patch.op === 'replace')?.value).not.toBe(
        replacement,
      );
    },
  );
});
