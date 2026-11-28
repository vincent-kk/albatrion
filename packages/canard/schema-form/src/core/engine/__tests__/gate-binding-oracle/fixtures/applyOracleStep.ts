import { applySceneStep } from '../../../../__tests__/boundary-scenes/fixtures/utils/applySceneStep';
import { findSceneNode } from '../../../../__tests__/boundary-scenes/fixtures/utils/findSceneNode';
import type { SceneRun } from '../../../../__tests__/boundary-scenes/fixtures/utils/startSceneRun';
import { isArrayNode } from '../../../../surface';
import type { OracleOperation, OracleStep } from './types';

/**
 * Apply one generated step through the public node surface; a batch runs its operations inside one `root.batch`.
 * @param run - The run whose form receives the step
 * @param step - The step
 * @returns Nothing; throws what the operation throws, or `no node at` / `no array at` when its address has no fitting node
 */
export const applyOracleStep = (run: SceneRun, step: OracleStep): void => {
  if (step.kind === 'batch')
    return run.root.batch(() => {
      for (const operation of step.operations) applyOperation(run, operation);
    });
  applyOperation(run, step);
};

/** Apply one operation; `set` and `push` run through the boundary scene step runner. */
const applyOperation = (run: SceneRun, operation: OracleOperation): void => {
  if (operation.kind === 'set')
    return applySceneStep(run, { set: operation.path, value: operation.value });
  if (operation.kind === 'push')
    return applySceneStep(run, {
      push: operation.path,
      value: operation.value,
    });
  const array = findSceneNode(run.root, operation.path);
  if (!array || !isArrayNode(array))
    throw new Error(`no array at ${operation.path}`);
  if (operation.kind === 'remove') return void array.remove(operation.index);
  if (operation.kind === 'clear') return array.clear();
  const [first, second] = [0, 1].map((index) =>
    findSceneNode(run.root, `${operation.path}/${index}`),
  );
  if (!first || !second) throw new Error(`no node at ${operation.path}/1`);
  const [firstValue, secondValue] = [
    structuredClone(first.value),
    structuredClone(second.value),
  ];
  first.setValue(secondValue);
  second.setValue(firstValue);
};
