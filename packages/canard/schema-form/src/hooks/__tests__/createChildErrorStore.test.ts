import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { createChildErrorStore } from '../fieldNode/utils/createChildErrorStore';

it('retains a delivered token across unchanged cold reads and reconnects', () => {
  const root = nodeFromJSONSchema({
    jsonSchema: { type: 'array', items: { type: 'string' } },
    defaultValue: ['first'],
    deferMountValidation: true,
    validationMode: 2,
  });
  const store = createChildErrorStore(root, root.children);
  const close = store.subscribe(() => undefined);
  root.children![0].setExternalErrors([{ dataPath: '/0', message: 'first' }]);
  const delivered = store.getSnapshot();
  close();
  expect(store.getSnapshot()).toBe(delivered);
  const reconnect = store.subscribe(() => undefined);
  expect(store.getSnapshot()).toBe(delivered);
  reconnect();
});
