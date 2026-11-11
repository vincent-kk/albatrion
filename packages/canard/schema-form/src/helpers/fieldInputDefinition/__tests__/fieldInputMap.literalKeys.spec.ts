import { afterEach, describe, expect, it, vi } from 'vitest';

import { normalizeFieldInputMap } from '../utils/normalizeFieldInputMap';
import { matchesInputMapKey as matches } from './fixtures/matchesInputMapKey';

afterEach(() => vi.restoreAllMocks());

// filid:contract input-map-literals
describe('literal segments and silent nonmatches', () => {
  it('a double star is a literal name at every position', () => {
    expect(matches('/a/**', '/a/**')).toBe(true);
    expect(matches('/a/**', '/a/name')).toBe(false);
    expect(matches('/a/**', '/a/deep/name')).toBe(false);
    expect(matches('/items/**/name', '/items/**/name')).toBe(true);
    expect(matches('/items/**/name', '/items/0/name')).toBe(false);
    expect(matches('/**/**', '/**/**')).toBe(true);
  });
  it('uncompilable non-pattern text does not throw or print a diagnosis', () => {
    const warning = vi.spyOn(console, 'warn');
    const error = vi.spyOn(console, 'error');
    const info = vi.spyOn(console, 'info');
    const log = vi.spyOn(console, 'log');
    expect(matches('/invalid[regex', '/invalid[regex')).toBe(true);
    expect(matches('/items/**/name', '/items/**/name')).toBe(true);
    expect(matches('/(a|b)', '/(a|b)')).toBe(true);
    expect(matches('/[x]', '/[x]')).toBe(true);
    expect(matches('/a.b', '/a.b')).toBe(true);
    expect(matches('/$', '/$')).toBe(true);
    expect(matches('/+', '/+')).toBe(true);
    expect(matches('^#/a', '/a')).toBe(false);
    expect(matches('name', '/name')).toBe(false);
    expect(warning).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });
  it('wildcards consume one segment including object keys', () => {
    expect(matches('/items/*/name', '/items/0/name')).toBe(true);
    expect(matches('#/items/*/name', '/items/abc/name')).toBe(true);
    expect(matches('/items/*/name', '/items/0/child/name')).toBe(false);
    expect(matches('/settings/*', '/settings/theme')).toBe(true);
    expect(matches('/settings/*', '/settings')).toBe(false);
    expect(matches('/settings/*', '/settings/theme/color')).toBe(false);
  });
  it('literal segments in a wildcard remain text', () => {
    expect(
      matches('/files/*/images/(thumb|full)', '/files/a/images/(thumb|full)'),
    ).toBe(true);
    expect(
      matches('/files/*/images/(thumb|full)', '/files/a/images/thumb'),
    ).toBe(false);
    expect(matches('/items/*/**', '/items/0/**')).toBe(true);
    expect(matches('/items/*/**', '/items/0/deep')).toBe(false);
    expect(matches('/a~b/*', '/a~0b/child')).toBe(true);
  });
  it('a trailing empty segment keeps a star outside wildcard grammar', () => {
    expect(matches('/items/*/', '/items/0/')).toBe(false);
    expect(matches('/items/*/', '/items/')).toBe(false);
    expect(matches('/items/*/', '/items/%2A/')).toBe(false);
    expect(matches('/settings/', '/settings')).toBe(false);
    expect(matches('/settings/', '/settings/theme')).toBe(false);
  });
  it('operator text is not an alias for a literal reserved name', () => {
    expect(matches('/.', '/%2E')).toBe(false);
    expect(matches('/..', '/%2E%2E')).toBe(false);
    expect(matches('/@', '/%40')).toBe(false);
  });
  it('integer-looking keys follow Object.keys order and do not select a node', () => {
    const definitions = normalizeFieldInputMap({
      '/contact': () => null,
      '0': () => null,
    });
    const hint = {
      schemaType: 'string',
      type: 'string',
      path: '/contact',
      nullable: false,
      required: false,
      misfit: false,
      jsonSchema: { type: 'string' },
    } satisfies Parameters<(typeof definitions)[0]['test']>[0];
    expect(definitions.map(({ test }) => test(hint))).toEqual([false, true]);
  });
});
