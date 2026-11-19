import { expect, it } from 'vitest';
import { Dialect, JSONSchemaScanner, JSONSchemaScannerAsync, createReferenceResolver, createReferenceResolverAsync, type UnknownSchema } from '../index';

it('keeps sync, async and resolver dialect choices equivalent across URI spellings', async () => {
  for (const [draft, dialect] of [
    ['draft-04', Dialect.Draft04], ['draft-06', Dialect.Draft06], ['draft-07', Dialect.Draft07],
    ['draft/2019-09', Dialect.Draft201909], ['draft/2020-12', Dialect.Draft202012],
  ] as const) {
    const canonical = 'http://json-schema.org/' + draft + '/schema#';
    for (const spelling of [canonical, 'HTTP://JSON-SCHEMA.ORG:80/' + draft + '/schema#', 'HTTPS://JSON-SCHEMA.ORG:443/' + draft + '/schema#']) {
      const schema: UnknownSchema = { $schema: spelling, contains: { type: 'string' }, $defs: { value: { type: 'string' } } };
      const expected: string[] = [];
      new JSONSchemaScanner({ visitor: { enter: entry => { expected.push(entry.path + ':' + entry.inert); } } }).scan({ ...schema, $schema: canonical });
      const sync: string[] = [], async: string[] = [];
      new JSONSchemaScanner({ visitor: { enter: entry => { sync.push(entry.path + ':' + entry.inert); } } }).scan(schema);
      await new JSONSchemaScannerAsync({ visitor: { enter: entry => { async.push(entry.path + ':' + entry.inert); } } }).scan(schema);
      expect(sync, spelling).toEqual(expected);
      expect(async, spelling).toEqual(expected);
      for (const alias of [false, true]) {
        const source: UnknownSchema = alias ? { $schema: spelling.replace('json-schema.org', 'example.test').replace('JSON-SCHEMA.ORG', 'EXAMPLE.TEST') } : schema;
        const options = alias ? { dialects: { [canonical.replace('json-schema.org', 'example.test')]: dialect } } : {};
        const resolver = createReferenceResolver(source, options);
        expect(resolver.dialect?.(resolver.root(source)), spelling).toBe(dialect);
        const asynchronous = createReferenceResolverAsync(source, options);
        expect(asynchronous.dialect?.(asynchronous.root(source)), spelling).toBe(dialect);
      }
    }
  }
});
