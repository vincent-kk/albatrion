import { expect, it } from 'vitest';

import { resolveURI } from '../resolveURI';

it.each([
  ['', '', '#'],
  ['', 'urn:example:root', 'urn:example:root#'],
  [
    '',
    'https://example.com/root.json#retrieval',
    'https://example.com/root.json',
  ],
  ['', 'relative/root.json', undefined],
  ['child.json', 'urn:example:root', undefined],
])('resolves %j against %j to %j', (reference, base, expected) => {
  expect(resolveURI(reference, base)).toBe(expected);
});
