import { afterEach, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { dispatchMount, dispatchSetValue } from '../../write';
import * as overlays from '../utils/slots/applySlotOverlay';
import * as pruning from '../utils/slots/pruneSlotSources';
import { getDispatchNode } from './fixtures/getDispatchNode';

afterEach(() => vi.restoreAllMocks());

it('prepares a unique-kind terminal write without slot checks, overlay lookups or pruning', () => {
  const { root } = createDispatchTree({
    type: 'object',
    properties: { type: { type: 'string', default: 'a' } },
    oneOf: ['a', 'b'].map((value, index) => ({
      controls: { active: `./type === '${value}'` },
      properties: {
        x: { type: 'string', default: value.toUpperCase() },
        y: { type: 'number', default: index + 1 },
      },
    })),
  });
  dispatchMount(root, undefined);
  const target = getDispatchNode(root, 'type');
  dispatchSetValue(target, 'b');
  const prune = vi.spyOn(pruning, 'pruneSlotSources');
  const apply = vi.spyOn(overlays, 'applySlotOverlay');
  const lookup = vi.fn(() => undefined);
  Object.defineProperty(root, 'inactiveSlotOverlays', {
    configurable: true,
    get: lookup,
  });
  dispatchSetValue(target, 'a');
  expect(prune).not.toHaveBeenCalled();
  expect(apply).not.toHaveBeenCalled();
  expect(lookup).not.toHaveBeenCalled();
  expect(root.local).toEqual({ type: 'a', x: 'A', y: 1 });
});
