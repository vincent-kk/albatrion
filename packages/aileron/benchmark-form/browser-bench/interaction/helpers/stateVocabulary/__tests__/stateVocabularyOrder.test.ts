import { describe, expect, it } from 'vitest';

import { stateVocabularyOrder } from '../stateVocabularyOrder';

describe('two-lane Williams order', () => {
  it('alternates BF and FB with equal kept positions', () => {
    const orders = Array.from({ length: 10 }, (_, i) =>
      stateVocabularyOrder(i),
    );
    expect(orders).toEqual(
      Array.from({ length: 5 }, () => [
        ['B', 'F'],
        ['F', 'B'],
      ]).flat(),
    );
  });
  it('rotates negative warmup indices too', () => {
    expect([-3, -2, -1].map(stateVocabularyOrder)).toEqual([
      ['F', 'B'],
      ['B', 'F'],
      ['F', 'B'],
    ]);
  });
});
