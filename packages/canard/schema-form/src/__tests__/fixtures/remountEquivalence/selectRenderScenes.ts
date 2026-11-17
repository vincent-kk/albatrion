import { requiredFeatures, requiredPairs } from './coverageRequirements';
import { inspectSceneFeatures } from './inspectSceneFeatures';
import type { RemountScene } from './types';

/**
 * Choose a deterministic coverage sample instead of selecting variant numbers.
 * @param scenes - The same core corpus to be replayed on screen.
 * @returns Greedy feature-and-pair cover, failing when any requirement is absent.
 */
export function selectRenderScenes(
  scenes: readonly RemountScene[],
): RemountScene[] {
  const requirements = [
    ...requiredFeatures,
    ...requiredPairs.map(([a, b]) => `${a}+${b}`),
  ];
  const candidates = scenes.map((scene) => {
    const actual = inspectSceneFeatures(scene);
    return {
      scene,
      coverage: requirements.filter((token) =>
        token.split('+').every((feature) => actual.includes(feature)),
      ),
    };
  });
  const covered: string[] = [];
  const selected: RemountScene[] = [];
  while (covered.length < requirements.length) {
    let best: (typeof candidates)[number] | undefined;
    let score = 0;
    for (const candidate of candidates) {
      const next = candidate.coverage.filter(
        (token) => !covered.includes(token),
      ).length;
      if (next > score) {
        score = next;
        best = candidate;
      }
    }
    if (!best)
      throw new Error(
        `CORPUS_COVERAGE_MISSING ${requirements.filter((token) => !covered.includes(token)).join(',')}`,
      );
    selected.push(best.scene);
    covered.push(...best.coverage.filter((token) => !covered.includes(token)));
  }
  return selected;
}
