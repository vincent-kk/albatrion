import { closingGateFixture } from '../../../stageClosing/__tests__/fixtures/closingGateFixture';

/** Extend the unchanged closing contract fixture with the state's tail and censored-frame evidence. */
export function stateVocabularyGateFixture() {
  const data = closingGateFixture();
  for (const metrics of Object.values(data.bounds)) {
    metrics.processingTail = { ...metrics.processing };
    metrics.flooredMountLongestFrame = { ...metrics.longestFrame };
  }
  return data;
}
