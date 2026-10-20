import { afterEach, expect, it, vi } from 'vitest';

import { default as fixtures } from '@/schema-form/core/engine/__tests__/fixtures/ownedInlineHead.json';

import * as nodeBuilder from '../buildNodes';
import { captureOwnedInlineObservables } from './fixtures/captureOwnedInlineObservables';

afterEach(() => vi.restoreAllMocks());

it('matches unconditional validation for all 59 corpus and edge schemas with diagnostics off and on', () => {
  expect(fixtures.cases).toHaveLength(59);
  const build = nodeBuilder.buildNodes;
  for (const sample of fixtures.cases) {
    for (const collect of [false, true]) {
      const gated = captureOwnedInlineObservables(
        structuredClone(sample.schema),
        collect,
      );
      const forced = vi
        .spyOn(nodeBuilder, 'buildNodes')
        .mockImplementation((context, ...args) => {
          const nodes = build(context, ...args);
          Object.defineProperty(context, 'hasChildTargets', {
            value: true,
            writable: true,
          });
          return nodes;
        });
      const unconditional = captureOwnedInlineObservables(
        structuredClone(sample.schema),
        collect,
      );
      forced.mockRestore();
      expect(gated, `${sample.label}: collect=${collect}`).toEqual(
        unconditional,
      );
    }
  }
});
