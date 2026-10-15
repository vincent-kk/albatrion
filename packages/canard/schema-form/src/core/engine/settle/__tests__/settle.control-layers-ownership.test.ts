import { describe, expect, it } from 'vitest';

import { default as headFixture } from '@/schema-form/core/engine/__tests__/fixtures/ownedInlineHead.json';
import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import { WriteOption } from '@/schema-form/core/engine/types/value';
import { dispatchMount } from '@/schema-form/core/engine/write';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { compareTree } from './fixtures/compareTree';
import { fragmentOwnershipSchemas } from './fixtures/fragmentOwnershipSchemas';

// filid:contract settle-control-layers-ownership
describe('P-08 fragment ownership matches the pre-P-08 rescan', () => {
  it.each(fragmentOwnershipSchemas)(
    'gives the reference layers for $label',
    ({ label, schema, values }) => {
      const { root } = createDispatchTree(schema);
      let fragments = 0;
      let comparisons = 0;
      let nodes = 0;
      for (const value of values) {
        dispatchMount(root, value, WriteOption.Overwrite);
        const compared = compareTree(root, label);
        expect(compared.mismatches).toEqual([]);
        fragments += compared.fragments;
        comparisons += compared.comparisons;
        nodes += compared.nodes;
      }
      expect(fragments).toBeGreaterThan(0);
      console.log(
        'P-08 differential:',
        JSON.stringify({ label, nodes, comparisons, fragments }),
      );
    },
  );

  it('gives the reference layers or recorded rejection for all 59 corpus schemas', () => {
    expect(headFixture.cases).toHaveLength(59);
    const mismatches: string[] = [];
    let comparisons = 0;
    let nodes = 0;
    let rejections = 0;
    for (const sample of headFixture.cases) {
      const schema: BlueprintSchema = sample.schema;
      const recorded = sample.captures[0];
      if ('error' in recorded) {
        expect(() => createDispatchTree(schema), sample.label).toThrow(
          recorded.error.message,
        );
        rejections++;
        continue;
      }
      const { root } = createDispatchTree(schema);
      dispatchMount(root, undefined, WriteOption.Overwrite);
      const compared = compareTree(root, sample.label);
      mismatches.push(...compared.mismatches);
      comparisons += compared.comparisons;
      nodes += compared.nodes;
    }
    expect(mismatches).toEqual([]);
    console.log(
      'P-08 corpus:',
      JSON.stringify({ nodes, comparisons, rejections }),
    );
  });
});
