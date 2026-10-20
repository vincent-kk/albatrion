import { afterEach, expect, it, vi } from 'vitest';

import { default as headFixture } from '@/schema-form/core/engine/__tests__/fixtures/ownedInlineHead.json';

import * as nodeConstruction from '../buildNodes';
import type { BlueprintSchema } from '../types/schema';
import { validateShape } from '../validateShape';
import { captureOwnedInlineObservables } from './fixtures/captureOwnedInlineObservables';

afterEach(() => vi.restoreAllMocks());

// filid:contract shape-validation-skip
it('preserves corpus graphs, declarations, diagnostics and errors with unconditional validation', () => {
  const samples = headFixture.cases as {
    label: string;
    schema: BlueprintSchema;
  }[];
  const construct = nodeConstruction.buildNodes;
  for (const sample of samples) {
    for (const collect of [false, true]) {
      const gated = captureOwnedInlineObservables(
        structuredClone(sample.schema),
        collect,
      );
      const forced = vi
        .spyOn(nodeConstruction, 'buildNodes')
        .mockImplementation((context, inputs, path) => {
          const nodes = construct(context, inputs, path);
          if (!context.hasTemplateRecursion)
            expect(() => validateShape(context), sample.label).not.toThrow();
          else validateShape(context);
          return nodes;
        });
      const unconditional = captureOwnedInlineObservables(
        structuredClone(sample.schema),
        collect,
      );
      forced.mockRestore();
      expect(unconditional, `${sample.label}: collect=${collect}`).toEqual(
        gated,
      );
    }
  }
  expect(samples).toHaveLength(59);
});
