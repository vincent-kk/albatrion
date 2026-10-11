import { expect, it } from 'vitest';

import { buildSchemaNodeTree } from '../buildSchemaNodeTree';
import { mountSchemaNode } from '../mountSchemaNode';
import { reloadSchemaNodeForm } from '../reloadSchemaNodeForm';

it('WRITE-043 WRITE-045 same-tree reset to explicit undefined preserves root identity', () => {
  const root = buildSchemaNodeTree({ jsonSchema: { type: 'string' }, defaultValue: 'previous' });
  mountSchemaNode(root);
  const identity = root.rootNode;
  root.setExternalErrors([{ dataPath: '', message: 'external' }]);
  root.setState({ 1: true, 2: true });
  reloadSchemaNodeForm(root, undefined);
  expect(root.rootNode).toBe(identity);
  expect(root.value).toBeUndefined();
  expect(root.defaultValue).toBeUndefined();
  expect(root.errors).toEqual([]);
  expect(root.globalState).toEqual({});
});
