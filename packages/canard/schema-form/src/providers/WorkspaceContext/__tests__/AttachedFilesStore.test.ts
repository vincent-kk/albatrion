import { expect, it } from 'vitest';
import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { AttachedFilesStore } from '../utils/AttachedFilesStore';

it('releasing another position does not clear the current owner of the same path', () => {
  const node = nodeFromJSONSchema({ jsonSchema: { type: 'string' } });
  const store = new AttachedFilesStore();
  const first = {}, second = {};
  const a = new File(['a'], 'a.txt'), b = new File(['b'], 'b.txt');
  store.attach(first, node, [a]);
  store.attach(second, node, [b]);
  store.detach(first);
  expect(store.get('')).toEqual([b]);
  store.attach(second, node, undefined);
  expect(store.size).toBe(0);
});
it('clear drops ownership so a later projection cannot restore reset files', () => {
  const node = nodeFromJSONSchema({ jsonSchema: { type: 'string' } });
  const store = new AttachedFilesStore();
  store.attach({}, node, [new File(['a'], 'a.txt')]);
  store.clear();
  store.synchronize();
  expect(store.size).toBe(0);
});
