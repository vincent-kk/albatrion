import { describe, expect, it } from 'vitest';

import { FormErrorCode } from '@/schema-form/errors';

import { matchesInputMapKey as matches } from './fixtures/matchesInputMapKey';

// filid:contract input-map-patterns
describe('explicit pattern grammar and recipes', () => {
  it('a prefix pattern includes descendants and text-prefix siblings', () => {
    expect(matches('^/contact', '/contact')).toBe(true);
    expect(matches('^/contact', '/contact/first')).toBe(true);
    expect(matches('^/contact', '/contacts')).toBe(true);
    expect(matches('^/contact', '/a/contact')).toBe(false);
  });
  it('the end anchor restricts a pattern to one path', () => {
    expect(matches('^/contact$', '/contact')).toBe(true);
    expect(matches('^/contact$', '/contact/first')).toBe(false);
  });
  it('grouped alternatives and string-escaped digits retain RegExp semantics', () => {
    expect(matches('^/user/(name|email)$', '/user/email')).toBe(true);
    expect(matches('^/user/(name|email)$', '/user/email/more')).toBe(false);
    expect(matches('^/(billing|shipping)/email$', '/shipping/email')).toBe(
      true,
    );
    expect(matches('^/(billing|shipping)/email$', '/other/email')).toBe(false);
    expect(matches('^/users/\\d+$', '/users/12')).toBe(true);
    expect(matches('^/users/\\d+$', '/users/a')).toBe(false);
  });
  it('classifies a leading caret before a wildcard-looking segment', () => {
    expect(matches('^/items/*/name$', '/items/name')).toBe(true);
    expect(matches('^/items/*/name$', '/items/0/name')).toBe(false);
    expect(matches('^/items/[^/]+/name$', '/items/0/name')).toBe(true);
    expect(matches('^/items/[^/]+/name$', '/items/0/deep/name')).toBe(false);
  });
  it('tests the escaped path rather than decoded names or fragments', () => {
    expect(matches('^/a~1b$', '/a~1b')).toBe(true);
    expect(matches('^/a~0b$', '/a~0b')).toBe(true);
    expect(matches('^/%2A$', '/%2A')).toBe(true);
    expect(matches('^$', '')).toBe(true);
    expect(matches('^#/a', '/a')).toBe(false);
  });
  it('reports a compile failure through the existing map error code', () => {
    expect(() => matches('^/invalid[', '/invalid[')).toThrow(
      expect.objectContaining({ code: FormErrorCode.FormTypeInputMap }),
    );
  });
  it('a slash-bounded prefix selects descendants at any depth but not the node', () => {
    expect(matches('^/settings/', '/settings/theme')).toBe(true);
    expect(matches('^/settings/', '/settings/theme/color/value')).toBe(true);
    expect(matches('^/settings/', '/settings')).toBe(false);
    expect(matches('^/settings/', '/settingsBackup')).toBe(false);
  });
  it('the bounded pattern alternative selects the node and its descendants', () => {
    expect(matches('^/contact(?:/|$)', '/contact')).toBe(true);
    expect(matches('^/contact(?:/|$)', '/contact/first')).toBe(true);
    expect(matches('^/contact(?:/|$)', '/contacts')).toBe(false);
  });
  it('a name-at-any-depth pattern ends at that name', () => {
    expect(matches('^.*/note$', '/note')).toBe(true);
    expect(matches('^.*/note$', '/a/b/note')).toBe(true);
    expect(matches('^.*/note$', '/a/note/child')).toBe(false);
    expect(matches('^.*/note$', '/notebook')).toBe(false);
  });
});
