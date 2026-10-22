import { describe, it } from 'vitest';

import { assertTemplateLeafBytes } from './fixtures/assertTemplateLeafBytes';
import { createTemplateKeyScaleSchema } from './fixtures/createTemplateKeyScaleSchema';

// filid:contract template-leaf-scale-bytes
describe('all measurement-family template key bytes', () => {
  it.each([
    ['flat', 50],
    ['flat', 100],
    ['flat', 500],
    ['flat', 1000],
    ['flat', 2000],
    ['nested', 3],
    ['nested', 4],
    ['nested', 5],
    ['nested', 6],
    ['oneOf', 5],
    ['oneOf', 10],
    ['oneOf', 20],
    ['oneOf', 40],
    ['oneOf', 80],
    ['nested-gate', 6],
  ] as const)('matches every lookup for %s-%i', (family, size) => {
    assertTemplateLeafBytes(createTemplateKeyScaleSchema(family, size));
  });
});
