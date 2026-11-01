import { afterEach, expect, it, vi } from 'vitest';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { loadFieldNodeAtMount, writeFieldNode } from '../../settle';
import { WriteOption } from '../../types/value';
import { getHostDerived } from '../../utils/cache/derivedRecords';
import { getSelectedDeclarationIds } from '../utils/evaluate/getSelectedDeclarationIds';
import { createFragmentLoadState } from './fixtures/createFragmentLoadState';

afterEach(() => vi.restoreAllMocks());

// filid:contract derive-static-prepared-ids
it('prefers current selections, then static witnesses, then the committed fallback', () => {
  const { root } = createTestTree({
    type: 'object',
    properties: {
      kind: { type: 'boolean', default: false },
      fixed: { type: 'number', default: 7 },
    },
    oneOf: [false, true].map((kind) => ({
      controls: { active: `./kind === ${kind}` },
      properties: { x: { type: 'string' } },
    })),
  });
  loadFieldNodeAtMount(root, {}, WriteOption.Overwrite);
  writeFieldNode(root.structure!.kind, true, 'input', WriteOption.Overwrite);
  const fixed = root.structure!.fixed;
  const selected = new Map<typeof fixed, readonly number[]>();
  const state = {
    ...createFragmentLoadState(root),
    selectedDeclarationIds: selected,
  };
  const get = vi.spyOn(root.runtime.committedDeclarationIds!, 'get');
  const ids = getSelectedDeclarationIds(fixed, state);
  expect(ids).toEqual(fixed.blueprintNode.declarations.map((item) => item.id));
  expect(get).not.toHaveBeenCalled();
  selected.set(fixed, [777]);
  expect(getSelectedDeclarationIds(fixed, state)).toEqual([777]);
  selected.clear();
  delete getHostDerived(root).preparedStaticHost;
  expect(getSelectedDeclarationIds(fixed, state)).toEqual(ids);
  expect(get).toHaveBeenCalledTimes(1);
});
