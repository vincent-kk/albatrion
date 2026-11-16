import { expect, it } from 'vitest';

import { resolveURI } from '../resolveURI';

it.each([
  ['../c.json', 'a/b/c.json', 'a/c.json'],
  ['../x', '', '../x'],
  ['../x', 'b.json', '../x'],
  ['../common.json', 'schemas/root.json', 'common.json'],
  ['../../x', 'a/b', '../x'],
  ['./', '', './'],
  ['.', '', './'],
  ['x/..', '', './'],
  ['../', 'a/b', './'],
  ['x/../b:c', '', './b:c'],
  ['./', 'urn:example:root', 'urn:'],
  ['a/b/..', '', 'a/'],
  ['/../x', '', '/x'],
  ['../../x', 'file:///C:/a/b.json', 'file:///C:/x'],
])('resolves %j against %j to %j', (reference, base, expected) => {
  expect(resolveURI(reference, base)).toBe(expected);
});
