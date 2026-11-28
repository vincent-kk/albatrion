import {
  type FieldNode,
  SetValueOption,
  isArrayNode,
  reloadFieldNodeForm,
  setContext,
  writeFieldNodeInput,
} from '../../../../surface';
import type { SceneStep } from '../types';
import { createSceneInput } from './createSceneInput';
import { findSceneNode } from './findSceneNode';
import type { SceneRun } from './startSceneRun';

/**
 * Apply one write step through the public node surface and the binding entry points.
 * @param run - The run whose form receives the step; `append` records what its updater received
 * @param step - Any step except `note` and `validate`, which the caller handles
 * @returns Nothing; throws what the operation throws, or when the step's path or held reference has no node
 */
export const applySceneStep = (
  run: SceneRun,
  step: Exclude<SceneStep, { note: string } | { validate: true }>,
): void => {
  if ('reload' in step) return reloadFieldNodeForm(run.root, step.reload);
  if ('context' in step) return setContext(run.root, step.context);
  if ('setHeld' in step)
    return requireNode(run.heldNodes[step.setHeld], step.setHeld).setValue(
      step.value,
    );
  if ('reset' in step) return findNode(run, step.reset).resetSubtree();
  if ('input' in step)
    return writeFieldNodeInput(findNode(run, step.input), step.value);
  if ('append' in step)
    return findNode(run, step.append).setValue((previous: unknown) => {
      run.updaterInputs.push(previous);
      return [...(Array.isArray(previous) ? previous : []), step.value];
    });
  if ('push' in step) {
    const node = findNode(run, step.push);
    if (!isArrayNode(node)) throw new Error(`no array at ${step.push}`);
    node.push(step.value);
    return;
  }
  findNode(run, step.set).setValue(
    createSceneInput(step),
    step.merge ? SetValueOption.Merge : SetValueOption.Overwrite,
  );
};

/** The node, or a thrown error naming the step's path or held reference when there is none. */
const requireNode = (node: FieldNode | null | undefined, label: string) => {
  if (!node) throw new Error(`no node at ${label}`);
  return node;
};

/** The node at a step's path, required to exist. */
const findNode = (run: SceneRun, path: string) =>
  requireNode(findSceneNode(run.root, path), path);
