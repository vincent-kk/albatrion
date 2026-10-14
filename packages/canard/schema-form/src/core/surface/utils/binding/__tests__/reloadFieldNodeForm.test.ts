import { expect, it } from 'vitest';

import { buildFieldNodeTree } from '../buildFieldNodeTree';
import { mountFieldNode } from '../mountFieldNode';
import { reloadFieldNodeForm } from '../reloadFieldNodeForm';

it('WRITE-043 WRITE-045 same-tree reset to explicit undefined preserves root identity', () => {
  const root = buildFieldNodeTree({
    jsonSchema: { type: 'string' },
    defaultValue: 'previous',
  });
  mountFieldNode(root);
  const identity = root.rootNode;
  root.setExternalErrors([{ dataPath: '', message: 'external' }]);
  root.setState({ 1: true, 2: true });
  reloadFieldNodeForm(root, undefined);
  expect(root.rootNode).toBe(identity);
  expect(root.value).toBeUndefined();
  expect(root.defaultValue).toBeUndefined();
  expect(root.errors).toEqual([]);
  expect(root.globalState).toEqual({});
});
