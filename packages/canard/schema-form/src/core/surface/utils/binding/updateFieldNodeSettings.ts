import { dispatchUpdateSettings } from '../../../engine';
import { requireRuntimeFieldNode } from '../../runtime/requireRuntimeFieldNode';
import type { FieldNode } from '../../type';

/**
 * Apply committed Form settings through the engine's ordered binding entry.
 * @param root - Current public root, preserved across scalar settings changes.
 * @param settings - Complete scalar defaults and optional opaque display policy.
 * @param onModeChange - Replace the binding slot after an effective mode transition.
 * @returns Nothing; no public node method or package export is added.
 */
export const updateFieldNodeSettings = (
  root: FieldNode,
  settings: Parameters<typeof dispatchUpdateSettings>[1],
  onModeChange?: () => void,
): void =>
  dispatchUpdateSettings(
    requireRuntimeFieldNode(root, true),
    settings,
    onModeChange,
  );
