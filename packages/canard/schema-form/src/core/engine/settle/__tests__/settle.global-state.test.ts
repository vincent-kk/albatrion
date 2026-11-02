import { describe, expect, it } from 'vitest';

import { FieldNodeState } from '@/schema-form/core/engine/types/state';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { writeFieldNode } from '../utils/write/writeFieldNode';

// filid:contract settle-write-global-state
describe('EVENT-062 43C-01 settlement shape counts', () => {
  it('adds a true key on entry, removes it on exit, and adds it on re-entry', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        target: { type: 'string', controls: { active: '../flag' } },
      },
    });
    const createNode = root.runtime.nodeFactory;
    root.runtime.nodeFactory = (entry, parent, runtime) => {
      const node = createNode(entry, parent, runtime);
      if ('name' in entry && entry.name === 'target')
        node.interactionState = { [FieldNodeState.Edited]: true };
      return node;
    };
    writeFieldNode(
      root,
      { flag: true, target: 'value' },
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.runtime.globalState).toEqual({ [FieldNodeState.Edited]: true });
    writeFieldNode(
      root.structure!.flag,
      false,
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.runtime.globalState).toEqual({});
    writeFieldNode(
      root.structure!.flag,
      true,
      'callerReplace',
      WriteOption.Overwrite,
    );
    expect(root.runtime.globalState).toEqual({ [FieldNodeState.Edited]: true });
  });
});
