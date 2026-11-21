import { expect, it } from 'vitest';
import { JSONSchemaScanner, JSONSchemaScannerAsync } from '@/json-schema';

it('sync and async mutation capture null-prototype replacement children identically', async () => {
  const source = { type: 'object', properties: { a: { type: 'string' } } };
  const make = (seen: string[]) => ({
    visitor: { enter: ({ path }: any) => { seen.push(path); } },
    options: { mutate: ({ path }: any) => path === '#/properties/a'
      ? Object.assign(Object.create(null), { type: 'object', properties: Object.assign(Object.create(null), { child: { type: 'number' } }) })
      : undefined },
  });
  const syncPaths: string[] = [], asyncPaths: string[] = [];
  const sync = new JSONSchemaScanner(make(syncPaths));
  const asyncScanner = new JSONSchemaScannerAsync(make(asyncPaths));
  const first = sync.scan(source).getValue();
  const second = (await asyncScanner.scan(source)).getValue();
  expect(asyncPaths).toEqual(syncPaths);
  expect(syncPaths).toContain('#/properties/a/properties/child');
  expect(second).toEqual(first);
  expect(source.properties.a).toEqual({ type: 'string' });
});
