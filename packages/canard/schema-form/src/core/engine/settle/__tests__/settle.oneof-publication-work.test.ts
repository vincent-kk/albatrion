import { afterEach, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { dispatchMount, dispatchSetValue } from '../../write';
import * as views from '../utils/compute/childSelection/utils/createPreparedSelectionStructure';
import * as presence from '../utils/dependencies/collectPresenceChangeNames';
import { createFixedBranchSchema } from './fixtures/childSelection/createFixedBranchSchema';

afterEach(() => vi.restoreAllMocks());

// filid:contract settle-b9-oneof-publication-work
it('publishes a membership-changing oneOf-80 selection without enumerating the private view', () => {
  const { root } = createDispatchTree(createFixedBranchSchema(80));
  dispatchMount(root, undefined, undefined, { deferValidation: false });
  const kind = root.structure!.kind;
  dispatchSetValue(kind, 'kind_79');
  dispatchSetValue(kind, 'kind_0');
  let priorScans = 0;
  let viewScans = 0;
  let viewWrites = 0;
  let comparingPresence = false;
  const collect = presence.collectPresenceChangeNames;
  vi.spyOn(presence, 'collectPresenceChangeNames').mockImplementation(
    (...args) => {
      comparingPresence = true;
      try {
        return collect(...args);
      } finally {
        comparingPresence = false;
      }
    },
  );
  root.structure = new Proxy(root.structure!, {
    ownKeys(target) {
      if (comparingPresence) priorScans++;
      return Reflect.ownKeys(target);
    },
  });
  const create = views.createPreparedSelectionStructure;
  vi.spyOn(views, 'createPreparedSelectionStructure').mockImplementation(
    (...args) =>
      new Proxy(create(...args), {
        ownKeys(target) {
          viewScans++;
          return Reflect.ownKeys(target);
        },
        set(target, name, value) {
          viewWrites++;
          return Reflect.set(target, name, value);
        },
      }),
  );
  dispatchSetValue(kind, 'kind_79');
  expect(viewScans).toBe(0);
  expect(viewWrites).toBe(0);
  expect(priorScans).toBe(0);
  expect(root.emit).toMatchObject({ kind: 'kind_79', payload_79_a: 'a_79' });
  expect(root.structure!.kind).toBe(kind);
});

it('does not sort noninteger entering required candidates in the oneOf-80 write', () => {
  const { root } = createDispatchTree(createFixedBranchSchema(80));
  dispatchMount(root, undefined, undefined, { deferValidation: false });
  const kind = root.structure!.kind;
  dispatchSetValue(kind, 'kind_79');
  dispatchSetValue(kind, 'kind_0');
  let requiredSorts = 0;
  const sort = Array.prototype.sort;
  vi.spyOn(Array.prototype, 'sort').mockImplementation(function (
    this: unknown[],
    compare: Parameters<typeof Array.prototype.sort>[0],
  ) {
    if (
      this.length > 1 &&
      this.every(
        (node) =>
          node !== null &&
          typeof node === 'object' &&
          Reflect.get(node, 'parent') === root,
      )
    )
      requiredSorts++;
    return sort.call(this, compare);
  });
  dispatchSetValue(kind, 'kind_79');
  expect(requiredSorts).toBe(0);
  expect(root.emit).toMatchObject({ kind: 'kind_79', payload_79_a: 'a_79' });
});
