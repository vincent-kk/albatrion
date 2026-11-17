// Loaded by test:cli; standalone tsx execution checks the benchmark's JSX runtime.
import assert from 'node:assert/strict';

import { settleUpdates } from '../../../src/utils/settleUpdates';
import { setupJsdom } from '../../../src/utils/setup-env';
import { equivalentFixtures } from '../index';
import { applyInteraction } from '../utils/applyInteraction';
import { mountEquivalentForm } from '../utils/mountEquivalentForm';

setupJsdom();
for (const version of ['0.16.1', 'latest']) {
  const fixture = equivalentFixtures[0];
  const mounted = await mountEquivalentForm(fixture, version);
  try {
    assert(mounted.handle.findNode(''));
    assert(mounted.commits.length > 0);
    for (const interaction of fixture.interactions) {
      applyInteraction(mounted.handle, interaction);
      await settleUpdates();
      if (interaction.kind === 'set')
        assert.deepEqual(
          mounted.handle.findNode(interaction.path)?.value,
          interaction.value,
        );
    }
  } finally {
    mounted.teardown();
  }
}
console.log('CLI_MOUNT_UPDATE_OK');
