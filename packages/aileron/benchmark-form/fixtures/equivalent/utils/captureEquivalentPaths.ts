import { flushSync } from 'react-dom';

import { drainTicks } from '../../../src/utils/setup-env';
import type { EquivalentFixture } from '../types';
import { applyInteraction } from './applyInteraction';
import { mountEquivalentForm } from './mountEquivalentForm';

/** Captures actual nondeferred paths at mount and after each authored interaction. */
export async function captureEquivalentPaths(
  fixture: EquivalentFixture,
  version: string,
) {
  const mounted = await mountEquivalentForm(fixture, version);
  const paths = () =>
    [...mounted.container.querySelectorAll('[data-path]:not([data-deferred])')]
      .map((element) => element.getAttribute('data-path')!)
      .filter((path, index, all) => all.indexOf(path) === index)
      .sort();
  try {
    const snapshots = [paths()];
    for (const interaction of fixture.interactions) {
      flushSync(() => applyInteraction(mounted.handle, interaction));
      await drainTicks(2);
      snapshots.push(paths());
    }
    return snapshots;
  } finally {
    mounted.teardown();
  }
}
