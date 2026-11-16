import { expect, it } from 'vitest';

import { resolveURI } from '../resolveURI';

it.each([
  ['', '', ''],
  ['', 'urn:example:root', 'urn:example:root'],
  [
    '',
    'https://example.com/root.json#retrieval',
    'https://example.com/root.json',
  ],
  ['', 'relative/root.json', 'relative/root.json'],
  ['child.json', 'urn:example:root', 'urn:child.json'],
  ['#x', '', '#x'],
  ['#x', 'urn:example:root', 'urn:example:root#x'],
  ['other.json', '', 'other.json'],
  ['#/a', 'other.json', 'other.json#/a'],
  ['../c.json', 'a/b/c.json', 'a/c.json'],
  ['../x', '', '../x'],
  ['../x', 'b.json', '../x'],
  ['../common.json', 'schemas/root.json', 'common.json'],
  ['../../x', 'a/b', '../x'],
  ['urn:example:other', 'schemas/root.json', 'urn:example:other'],
  ['https://example.com/x.json', 'other.json', 'https://example.com/x.json'],
  [
    'child.json',
    'tag:example.com,2024:a/b',
    'tag:example.com,2024:a/child.json',
  ],
  ['?q', 'urn:example:root', 'urn:example:root?q'],
  ['//host/x', '', '//host/x'],
  [' ', 'https://example.com/root.json', 'https://example.com/%20'],
  [' ', '', '%20'],
  [' ', 'urn:example:root', 'urn:%20'],
  [
    '#a\tb',
    'https://example.com/root.json',
    'https://example.com/root.json#a%09b',
  ],
  [
    '..\\x.json',
    'https://example.com/a/root.json',
    'https://example.com/a/..%5Cx.json',
  ],
  ['my file:x', 'https://example.com/root.json', undefined],
  ['http://[bad', '', undefined],
  ['HTTPS://Example.COM/a', '', 'https://example.com/a'],
  ['urn:Example:a', '', 'urn:Example:a'],
])('resolves %j against %j to %j', (reference, base, expected) => {
  expect(resolveURI(reference, base)).toBe(expected);
});
