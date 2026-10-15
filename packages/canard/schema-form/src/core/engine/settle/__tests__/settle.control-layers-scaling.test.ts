import { describe, expect, it } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { WriteOption } from '../../types/value';
import { dispatchMount } from '../../write';
import { countControlLayerWork } from './fixtures/countControlLayerWork';
import { fragmentToggleSchema } from './fixtures/fragmentToggleSchema';

// filid:contract settle-control-layers-scaling
describe('P-08 fragment ownership work', () => {
  it('collects F fragment layers with at most 2.2 times the work per doubling', () => {
    const rows = [16, 32, 64, 128].map((fragments) => {
      const { root } = createDispatchTree(fragmentToggleSchema(fragments));
      dispatchMount(
        root,
        { enabled: true, target: 'retained' },
        WriteOption.Overwrite,
      );
      const target = root.structure?.target;
      if (!target) throw new Error('Missing P-08 state-key target');
      const { layers, work } = countControlLayerWork(target);
      expect(layers.filter(({ layer }) => layer === 'fragment')).toHaveLength(
        fragments,
      );
      return { fragments, work };
    });
    console.log('P-08 counted work:', JSON.stringify(rows));
    for (let index = 1; index < rows.length; index++)
      expect(rows[index].work / rows[index - 1].work).toBeLessThanOrEqual(2.2);
  });
});
