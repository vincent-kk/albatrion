import { afterEach, describe, expect, it, vi } from 'vitest';

import { normalizeFieldInputMap } from '../utils/normalizeFieldInputMap';
import { matchesInputMapKey as matches } from './fixtures/matchesInputMapKey';

afterEach(() => vi.restoreAllMocks());

// filid:contract input-map-key-kinds
describe('input-map key kinds', () => {
  it('an exact object path excludes descendants, siblings and middle matches', () => {
    expect(matches('/contact', '/contact')).toBe(true);
    expect(matches('/contact', '/contact/first')).toBe(false);
    expect(matches('/contact', '/contacts')).toBe(false);
    expect(matches('/contact', '/a/contact')).toBe(false);
  });

  it.each([
    ['/a.b', '/aXb'],
    ['/price(usd)', '/priceusd'],
    ['/a+b', '/aaab'],
    ['/user/(name|email)', '/user/name'],
    ['/x[y]', '/xy'],
    ['/cost$', '/cost'],
  ])('compares %s as literal text', (key, other) => {
    expect(matches(key, key)).toBe(true);
    expect(matches(key, other)).toBe(false);
  });

  it('removes a fragment prefix from an exact pointer', () => {
    expect(matches('#/contact', '/contact')).toBe(true);
    expect(matches('#/contact', '/contact/first')).toBe(false);
  });

  it('keeps root keys separate from an empty-name child', () => {
    expect(matches('', '')).toBe(true);
    expect(matches('#', '')).toBe(true);
    expect(matches('/', '/')).toBe(true);
    expect(matches('#/', '/')).toBe(true);
    expect(matches('/', '')).toBe(false);
    expect(matches('/', '/a')).toBe(false);
  });

  it('canonicalizes absolute names once while preserving reserved-name escapes', () => {
    expect(matches('/a~b', '/a~0b')).toBe(true);
    expect(matches('#/a~b', '/a~0b')).toBe(true);
    expect(matches('/a~1b', '/a~1b')).toBe(true);
    expect(matches('/a~1b', '/a/b')).toBe(false);
    expect(matches('/%2A', '/%2A')).toBe(true);
    expect(matches('/%2E', '/%2E')).toBe(true);
    expect(matches('/%40', '/%40')).toBe(true);
  });

  it('does not turn relative text into an absolute pointer', () => {
    expect(matches('name', '/name')).toBe(false);
    expect(matches('0', '/0')).toBe(false);
    expect(matches('#a', '/a')).toBe(false);
    expect(matches('items/*/name', '/items/0/name')).toBe(false);
    expect(matches('contact.email', '/contact/email')).toBe(false);
    expect(matches('items[0].name', '/items/0/name')).toBe(false);
    expect(matches('#/properties/contact', '/contact')).toBe(false);
    expect(matches('#/properties/contact', '/properties/contact')).toBe(true);
  });

  it('constructs no RegExp for exact or wildcard keys and one for a pattern', () => {
    const constructor = vi.spyOn(globalThis, 'RegExp');
    normalizeFieldInputMap({
      '/contact': () => null,
      '/items/*/name': () => null,
    });
    expect(constructor).not.toHaveBeenCalled();
    normalizeFieldInputMap({ '^/contact$': () => null });
    expect(constructor).toHaveBeenCalledExactlyOnceWith('^/contact$');
  });
});
