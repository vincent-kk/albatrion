import { afterEach, expect, it, vi } from 'vitest';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { WriteOption } from '../../types/value';
import { loadFieldNodeAtMount } from '../loadFieldNodeAtMount';
import { writeFieldNode } from '../utils/write/writeFieldNode';

afterEach(() => vi.restoreAllMocks());

// filid:contract settle-b9-presence-delta
it('does not enumerate the previous 1000-sibling shape on a steady switch', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      type: { type: 'string', default: 'a' },
      ...Object.fromEntries(
        Array.from({ length: 1000 }, (_, index) => [
          `pad_${index}`,
          { type: 'number', default: index },
        ]),
      ),
    },
    oneOf: ['a', 'b'].map((type) => ({
      controls: { active: `./type === "${type}"` },
      properties: { x: { type: 'string', default: type } },
    })),
  });
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  writeFieldNode(root.structure!.type, 'b', 'input', WriteOption.Overwrite);
  let scans = 0;
  root.structure = new Proxy(root.structure!, {
    ownKeys(target) {
      scans++;
      return Reflect.ownKeys(target);
    },
  });
  writeFieldNode(root.structure.type, 'a', 'input', WriteOption.Overwrite);
  expect(scans).toBe(0);
  expect(root.local).toMatchObject({ type: 'a', x: 'a', pad_999: 999 });
});
