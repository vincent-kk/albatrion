import { describe, expect, it, vi } from 'vitest';

import { blueprint } from '../blueprint';

/** Direct collector checks exclude validation and capability helpers on the same stack. */
const work = vi.hoisted(() => ({ keywordChecks: 0 }));

vi.mock('@winglet/common-utils/filter', async importOriginal => {
  const original = await importOriginal<typeof import('@winglet/common-utils/filter')>();
  return {
    ...original,
    isArray: (value: unknown) => {
      const caller = new Error().stack?.split('\n').find(line =>
        line.includes('/src/core/') && !line.includes('/__tests__/'));
      if (caller?.includes('collectDeclarations.ts')) work.keywordChecks++;
      return original.isArray(value);
    },
  };
});

describe('empty fragment work', () => {
  it('keeps the plain declaration and fragment without checking keyword arrays', () => {
    work.keywordChecks = 0;
    const schema = { type: 'string' } as const;
    const result = blueprint(schema);
    expect(result.fragments).toHaveLength(1);
    expect(result.root.declarations).toHaveLength(1);
    expect(result.root.declarations[0].schema).toBe(schema);
    expect(result.capabilities.branchless).toBe(true);
    console.log(`106COUNT empty-fragment keyword-array-check=${work.keywordChecks}`);
    expect(work.keywordChecks).toBe(0);
  });
});
