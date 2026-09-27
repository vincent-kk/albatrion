import { describe, expect, it } from 'vitest';

// @ts-expect-error The original JavaScript corpus has no TypeScript declaration.
import { corpus } from '../../../../architecture/spikes/guard-cost/redteam3/corpus.mjs';

import { blueprint } from '../index';

// filid:contract corpus
describe('original 14-schema generator corpus', () => {
  it.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])(
    'accepts unchanged sample %i',
    (index) => {
      expect(corpus).toHaveLength(14);
      const sample = corpus[index];
      const before = JSON.stringify(sample.root);
      expect(() => blueprint(sample.root), sample.id).not.toThrow();
      expect(JSON.stringify(sample.root), sample.id).toBe(before);
    },
  );
});
