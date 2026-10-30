import { performance } from 'node:perf_hooks';

import { createRecorder } from '../../../design-optimization/tools/profile/branch-switch/createRecorder.mjs';

/** Creation and restoration include clone work, counted once across nested calls. */
export const enteringNames = [
  'createChildNode',
  'enterFieldNode',
  'restoreLatentState',
  'createFieldNode',
  'cloneFromSlot',
  'cloneSlotSubtree',
  'enterSlotClone',
  'createFromSlotOverlay',
  'applySlotOverlay',
];

/** Keep the existing disjoint stage ledger and add a non-overlapping entering group. */
export function createSlotRecorder() {
  const recorder = createRecorder();
  const enter = recorder.enter.bind(recorder);
  const exit = recorder.exit.bind(recorder);
  const reset = recorder.reset.bind(recorder);
  let enteringDepth = 0;
  recorder.groups = {};
  recorder.enter = (name, gate) => {
    const token = enter(name, gate);
    if (token && enteringNames.includes(name)) {
      token.entering = true;
      token.groupRoot = enteringDepth++ === 0;
    }
    return token;
  };
  recorder.enterCreation = (name) =>
    enteringDepth === 0 ? recorder.enter(name) : undefined;
  recorder.exit = (token) => {
    if (token?.entering) {
      enteringDepth--;
      if (token.groupRoot) {
        const group = (recorder.groups.enteringNodes ??= {
          inclusiveUs: 0,
          calls: 0,
        });
        group.inclusiveUs += (performance.now() - token.start) * 1000;
        group.calls++;
      }
    }
    exit(token);
  };
  recorder.reset = () => {
    if (enteringDepth !== 0) throw new Error('Unbalanced entering group');
    reset();
    recorder.groups = {};
  };
  return recorder;
}
