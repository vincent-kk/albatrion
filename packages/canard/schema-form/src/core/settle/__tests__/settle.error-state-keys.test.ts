import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount, writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-state-keys
describe('state-key failures during settlement', () => {
  it('ERROR-122 throwing visible leaves an unrelated unsetOnInactive exit clear', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      flag: { type: 'boolean' },
      secret: { type: 'string', controls: {
        active: '../flag', unsetOnInactive: true,
      } },
      noisy: { type: 'string', controls: {
        visible: '!../flag ? (() => { throw new Error("visibility") })() : true',
      } },
    } });
    loadSchemaNodeAtMount(root, { flag: true, secret: 'held' },
      SetValueOption.Overwrite);
    expect(() => writeSchemaNode(root.structure!.flag, false, 'input',
      SetValueOption.Overwrite)).toThrow('State key expression failed');
    expect(root.structure?.secret).toBeUndefined();
    expect(root.runtime.latentRaw.has(JSON.stringify(['/secret', 'string'])))
      .toBe(false);
  });
});
