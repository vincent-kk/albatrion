import { beforeEach, expect, it } from 'vitest';

import { createLifecycleScenes } from '@/schema-form/__tests__/fixtures/remountEquivalence/createLifecycleScenes';

import { checkCoreScene } from './helpers/checkCoreScene';

for (const kind of ['derived', 'inject', 'unset'])
  it(`asserts the exact ${kind} reload difference without masking other channels`, async () => {
    const scene = createLifecycleScenes().find(
      ({ id }) => id === `lifecycle-${kind}`,
    )!;
    expect(await checkCoreScene(scene)).toEqual([]);
  });

beforeEach(({ task }) => {
  Object.assign(task.meta, { project: task.file.projectName });
});
