import { describe, expect, it } from 'vitest';

import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../../../__tests__/fixtures/createTestTree';
import { hasRetainedSlotOwnSource } from '../../../__tests__/fixtures/readRetainedSlotRaw';
import { getSettlementScratch } from '../../scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../../scratch/releaseSettlementScratch';
import { createSettlementContext } from '../../settlement/createSettlementContext';
import { getLiteralStarPathIndex } from '../getLiteralStarPathIndex';
import { setLiteralStarRaw } from '../setLiteralStarRaw';

describe('49C-01 latent path index maintenance', () => {
  it('removes deleted keys from all path queries while retaining another kind and sibling', () => {
    const { root } = createTestTree({ type: 'object' });
    const scratch = getSettlementScratch(root.runtime);
    const context = createSettlementContext(
      root,
      'callerReplace',
      WriteOption.Overwrite,
      scratch,
    );
    const deleted = JSON.stringify(['/rows/0/child', 'string']);
    const otherKind = JSON.stringify(['/rows/0/child', 'number']);
    const sibling = JSON.stringify(['/rows/1/child', 'string']);
    try {
      setLiteralStarRaw(
        root.runtime,
        undefined,
        deleted,
        true,
        'a',
        undefined,
        undefined,
        context,
      );
      setLiteralStarRaw(
        root.runtime,
        undefined,
        otherKind,
        true,
        17,
        undefined,
        undefined,
        context,
      );
      setLiteralStarRaw(
        root.runtime,
        undefined,
        sibling,
        true,
        'b',
        undefined,
        undefined,
        context,
      );
      expect([...getLiteralStarPathIndex(context).get('/rows')!]).toEqual([
        deleted,
        otherKind,
        sibling,
      ]);
      setLiteralStarRaw(
        root.runtime,
        undefined,
        deleted,
        false,
        undefined,
        undefined,
        undefined,
        context,
      );
      expect(hasRetainedSlotOwnSource(root, '/rows/0/child', 'string')).toBe(
        false,
      );
      const index = getLiteralStarPathIndex(context);
      for (const path of ['', '/rows'])
        expect([...index.get(path)!]).toEqual([otherKind, sibling]);
      for (const path of ['/rows/0', '/rows/0/child'])
        expect([...index.get(path)!]).toEqual([otherKind]);
      setLiteralStarRaw(
        root.runtime,
        undefined,
        otherKind,
        false,
        undefined,
        undefined,
        undefined,
        context,
      );
      expect(getLiteralStarPathIndex(context).has('/rows/0/child')).toBe(false);
      expect(getLiteralStarPathIndex(context).has('/rows/0')).toBe(false);
      expect([...getLiteralStarPathIndex(context).get('/rows')!]).toEqual([
        sibling,
      ]);
    } finally {
      releaseSettlementScratch(scratch);
    }
  });
});
