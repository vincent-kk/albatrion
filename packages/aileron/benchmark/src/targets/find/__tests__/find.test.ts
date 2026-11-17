import { describe, expect, it } from 'vitest';

import { node, targetPath } from '../data';
import { find as findFor } from '../find_for';
import { find as findForOf } from '../find_forOF';
import { find as findOld } from '../find_old';
import { find as findOldest } from '../find_oldest';

describe('find benchmark parity with the current node tree', () => {
  const candidates = [
    ['for', (path: string) => findFor(node, path.split('.'))],
    ['for-of', (path: string) => findForOf(node, path.split('.'))],
    ['recursive', (path: string) => findOld(node, path.split('.'))],
    ['string-recursive', (path: string) => findOldest(node, path)],
  ] as const;

  it.each(candidates)('%s returns the existing node', (_, find) => {
    const expected = node.find('/title');
    expect(expected?.name).toBe('title');
    expect(find('$.title')).toBe(expected);
  });

  it.each(candidates)('%s returns null for a missing node', (_, find) => {
    expect(node.find('/missing')).toBeNull();
    expect(find('$.missing')).toBeNull();
  });

  it('benchmarks an existing node rather than a lookup miss', () => {
    expect(findFor(node, targetPath.split('.'))).toBe(node.find('/title'));
  });
});
