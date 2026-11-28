import type { BlueprintGate, PropertyDeclaration } from '../../../blueprint';
import { isOwnActiveGate } from './isOwnActiveGate';

/**
 * Whether a gate on an edge declaration is hosted at the edge's target frame.
 * The target's own `controls.active`, and every condition introduced at the target's
 * template (rebound to the edge path, or an item template's own gate), bind to the child;
 * every other gate is the owner's own or was transported into the owner.
 * @param gate - Gate carried by an edge declaration
 * @param declaration - Edge declaration whose `path` is the target in owner-template coordinates
 * @returns Whether the host is the child frame rather than the owner's frame
 */
export const isChildFrameGate = (
  gate: BlueprintGate,
  declaration: Pick<PropertyDeclaration, 'path' | 'schemaPath'>,
): boolean =>
  gate.hostPath === declaration.path ||
  isOwnActiveGate(gate.schemaPath, declaration.schemaPath);
