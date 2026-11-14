import { expect, it } from 'vitest';

import { detectDialect } from '../detectDialect';

it.each([
  ['http://json-schema.org/draft-04/schema#', 1],
  ['https://json-schema.org/draft-04/schema', 1],
  ['http://json-schema.org/draft-06/schema#', 2],
  ['https://json-schema.org/draft-06/schema', 2],
  ['http://json-schema.org/draft-07/schema#', 4],
  ['https://json-schema.org/draft-07/schema', 4],
  ['http://json-schema.org/draft/2019-09/schema#', 8],
  ['https://json-schema.org/draft/2019-09/schema', 8],
  ['http://json-schema.org/draft/2020-12/schema#', 16],
  ['https://json-schema.org/draft/2020-12/schema', 16],
  ['https://example.test/custom', undefined],
  ['https://json-schema.org/draft-07/schema#named', undefined],
] as const)('recognizes only the official URI alias %s', (uri, expected) => {
  expect(detectDialect(uri)).toBe(expected);
});
