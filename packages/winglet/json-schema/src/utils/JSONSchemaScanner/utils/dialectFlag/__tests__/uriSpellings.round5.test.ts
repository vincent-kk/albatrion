import { expect, it } from 'vitest';
import { detectDialect } from '../detectDialect';
import { normalizeSchemaUri } from '../normalizeSchemaUri';

it.each(['draft-04', 'draft-06', 'draft-07', 'draft/2019-09', 'draft/2020-12'])('recognizes equivalent scheme, host and default-port spellings for %s', draft => {
  const path = '/' + draft + '/schema';
  const canonical = 'http://json-schema.org' + path;
  for (const scheme of ['http', 'HTTP', 'https', 'HTTPS']) {
    const port = scheme.toLowerCase() === 'http' ? '80' : '443';
    for (const host of ['json-schema.org', 'JSON-SCHEMA.ORG']) {
      for (const suffix of ['', '#']) {
        for (const spelling of ['', ':', ':' + port, ':0' + port]) {
          const uri = scheme + '://' + host + spelling + path + suffix;
          expect(normalizeSchemaUri(uri), uri).toBe(normalizeSchemaUri(canonical));
          expect(detectDialect(uri), uri).toBe(detectDialect(canonical));
        }
      }
    }
  }
});

it('applies the same default-port equivalence to custom alias keys without changing case-sensitive parts', () => {
  for (const [source, expected] of [
    ['HTTPS://User:Pass@EXAMPLE.TEST:443/Custom?Q=Value#', 'http://User:Pass@example.test/Custom?Q=Value'],
    ['HTTP://[2001:DB8::1]:80/Custom', 'http://[2001:db8::1]/Custom'],
    ['https://example.test:80/Custom', 'http://example.test:80/Custom'],
    ['http://example.test:443/Custom', 'http://example.test:443/Custom'],
    ['https://example.test:8443/Custom', 'http://example.test:8443/Custom'],
  ]) expect(normalizeSchemaUri(source)).toBe(expected);
  expect(normalizeSchemaUri('https://example.test/Custom')).not.toBe(normalizeSchemaUri('https://example.test/custom'));
});
