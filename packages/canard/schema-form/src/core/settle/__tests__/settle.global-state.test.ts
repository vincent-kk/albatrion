import { describe, expect, it } from 'vitest';

import { SchemaNodeState } from '../../types/state';
import { SetValueOption } from '../../types/value';
import { writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-write
describe('EVENT-062 43C-01 settlement shape counts', () => {
  it('adds a true key on entry, removes it on exit, and adds it on re-entry', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      target: { type: 'string', controls: { active: '../flag' } },
    } });
    const createNode = root.runtime.nodeFactory;
    root.runtime.nodeFactory = (entry, parent, runtime) => {
      const node = createNode(entry, parent, runtime);
      if ('name' in entry && entry.name === 'target')
        node.interactionState = { [SchemaNodeState.Dirty]: true };
      return node;
    };
    writeSchemaNode(root, { flag: true, target: 'value' },
      'callerReplace', SetValueOption.Overwrite);
    expect(root.runtime.globalState).toEqual({ [SchemaNodeState.Dirty]: true });
    writeSchemaNode(root.structure!.flag, false, 'callerReplace',
      SetValueOption.Overwrite);
    expect(root.runtime.globalState).toEqual({});
    writeSchemaNode(root.structure!.flag, true, 'callerReplace',
      SetValueOption.Overwrite);
    expect(root.runtime.globalState).toEqual({ [SchemaNodeState.Dirty]: true });
  });
});
