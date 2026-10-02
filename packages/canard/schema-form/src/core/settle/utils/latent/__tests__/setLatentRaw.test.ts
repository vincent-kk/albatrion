import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../../../types/value';
import { createTestTree } from '../../../__tests__/fixtures/createTestTree';
import { createSettlementContext } from '../../settlement/createSettlementContext';
import { getSettlementScratch } from '../../write/getSettlementScratch';
import { releaseSettlementScratch } from '../../write/releaseSettlementScratch';
import { getLatentPathIndex } from '../getLatentPathIndex';
import { setLatentRaw } from '../setLatentRaw';

describe('49C-01 latent path index maintenance', () => {
  it('removes deleted keys from all path queries while retaining another kind and sibling', () => {
    const { root } = createTestTree({ type: 'object' });
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(root, 'callerReplace',
      SetValueOption.Overwrite, scratch);
    const deleted = JSON.stringify(['/rows/0/child', 'string']);
    const otherKind = JSON.stringify(['/rows/0/child', 'number']);
    const sibling = JSON.stringify(['/rows/1/child', 'string']);
    try {
      setLatentRaw(root.runtime, undefined, deleted, true, 'a',
        undefined, undefined, context);
      setLatentRaw(root.runtime, undefined, otherKind, true, 17,
        undefined, undefined, context);
      setLatentRaw(root.runtime, undefined, sibling, true, 'b',
        undefined, undefined, context);
      expect([...getLatentPathIndex(context).get('/rows')!])
        .toEqual([deleted, otherKind, sibling]);
      setLatentRaw(root.runtime, undefined, deleted, false, undefined,
        undefined, undefined, context);
      expect(root.runtime.latentRaw.has(deleted)).toBe(false);
      const index = getLatentPathIndex(context);
      for (const path of ['', '/rows'])
        expect([...index.get(path)!]).toEqual([otherKind, sibling]);
      for (const path of ['/rows/0', '/rows/0/child'])
        expect([...index.get(path)!]).toEqual([otherKind]);
      setLatentRaw(root.runtime, undefined, otherKind, false, undefined,
        undefined, undefined, context);
      expect(getLatentPathIndex(context).has('/rows/0/child')).toBe(false);
      expect(getLatentPathIndex(context).has('/rows/0')).toBe(false);
      expect([...getLatentPathIndex(context).get('/rows')!]).toEqual([sibling]);
    } finally {
      releaseSettlementScratch(scratch);
    }
  });
});
