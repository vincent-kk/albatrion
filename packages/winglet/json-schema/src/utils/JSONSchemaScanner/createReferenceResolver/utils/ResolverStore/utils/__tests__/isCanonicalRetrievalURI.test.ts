import { describe, expect, it } from 'vitest';

import { resolveURI } from '../../../resolveURI';
import { isCanonicalRetrievalURI } from '../isCanonicalRetrievalURI';

describe('isCanonicalRetrievalURI', () => {
  it.each([
    'https://ex.example/types.json',
    'http://ex.example/a/b/c.json',
    'https://sub.ex-ample.example/x_y~z/!$&()*+,;=:@.json',
    'https://localhost/',
    'https://ex.example//double/slash.json',
    'https://ex.example/.hidden/..json',
  ])('accepts %s, which resolution keeps unchanged', (uri) => {
    expect(isCanonicalRetrievalURI(uri)).toBe(true);
    expect(resolveURI(uri, '')).toBe(uri);
  });

  it.each([
    'https://EX.example/types.json',
    'HTTPS://ex.example/types.json',
    'https://ex.example',
    'https://ex.example:443/types.json',
    'https://ex.example:8080/types.json',
    'https://user@ex.example/types.json',
    'https://ex.example/types.json?x=1',
    'https://ex.example/types.json#',
    'https://ex.example/a%2Fb.json',
    'https://ex.example/a b.json',
    'https://ex.example/a\\b.json',
    'https://ex.example/a/./b.json',
    'https://ex.example/a/../b.json',
    'https://ex.example/a/..',
    'https://127.0.0.1/types.json',
    'https://0x7f.1/types.json',
    'https://ex.example/é.json',
    'https://ex.example/{x}.json',
    'urn:example:types',
    'file:///types.json',
  ])('rejects %s', (uri) => {
    expect(isCanonicalRetrievalURI(uri)).toBe(false);
  });
});
