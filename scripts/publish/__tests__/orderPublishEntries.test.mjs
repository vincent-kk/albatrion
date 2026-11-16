import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { orderPublishEntries } from '../orderPublishEntries.mjs';

const workspace = (location, workspaceDependencies = []) => ({
  location,
  name: `@scope/${location.split('/').pop()}`,
  workspaceDependencies,
});

const locations = (workspaces) =>
  orderPublishEntries(workspaces).map((entry) => entry.location);

describe('orderPublishEntries', () => {
  it('places every workspace after the workspaces it depends on', () => {
    assert.deepEqual(
      locations([
        workspace('packages/app', ['packages/form', 'packages/utils']),
        workspace('packages/form', ['packages/utils']),
        workspace('packages/utils'),
      ]),
      ['packages/utils', 'packages/form', 'packages/app'],
    );
  });

  it('keeps the listed order among workspaces that do not depend on each other', () => {
    assert.deepEqual(
      locations([
        workspace('packages/b'),
        workspace('packages/a'),
        workspace('packages/c', ['packages/a']),
      ]),
      ['packages/b', 'packages/a', 'packages/c'],
    );
  });

  it('drops the monorepo root', () => {
    assert.deepEqual(
      locations([workspace('.'), workspace('packages/a')]),
      ['packages/a'],
    );
  });

  it('ignores a dependency that is not in the list, such as a private workspace', () => {
    assert.deepEqual(
      locations([
        workspace('packages/a', ['packages/private-helper']),
        workspace('packages/b'),
      ]),
      ['packages/a', 'packages/b'],
    );
  });

  it('throws and names the workspaces when they depend on each other in a cycle', () => {
    assert.throws(
      () =>
        orderPublishEntries([
          workspace('packages/a', ['packages/b']),
          workspace('packages/b', ['packages/a']),
          workspace('packages/c'),
        ]),
      /packages\/a.*packages\/b/,
    );
  });
});
