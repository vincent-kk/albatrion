import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { BlueprintGate, PropertyDeclaration } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';
import { isChildFrameGate } from '../isChildFrameGate';
import { isOwnActiveGate } from '../isOwnActiveGate';
import { readOwnerFrame } from './readFrameBindings';

/** One gate reference bound to the frame that introduced its condition. */
export interface BoundGateFrame {
  /** Address of the frame whose decision the reference consumes. */
  readonly hostPath: string;
  /** Address wildcard reads bind from: the child frame for a child-local condition, else the owner. */
  readonly readOrigin: string;
}

/**
 * Bind a gate reference of a live owner: the single binding definition every consumer shares.
 * A child-local condition (the owner's own `controls.active`, or a condition introduced at an
 * edge's target) binds to that child frame; every other condition binds to the frame its
 * owner's admitting edge transported, or to the owner itself when introduced there.
 * @param owner - Live node whose own declaration or direct edge declaration carries the gate
 * @param gate - Authored condition reference
 * @param declaration - Declaration application holding the reference; omitted when the caller
 * already decided that `edgeName` names the child frame
 * @param edgeName - Direct child edge carrying the declaration; omitted for the owner's own declarations
 * @returns Host frame and read origin; throws `Missing gate transport` when no frame carried the condition
 */
export const bindGateFrame = <Self extends FieldNodeRecord<Self>>(
  owner: Self,
  gate: BlueprintGate,
  declaration?: Pick<PropertyDeclaration, 'path' | 'schemaPath'>,
  edgeName?: string,
): BoundGateFrame => {
  const child =
    edgeName === undefined
      ? declaration !== undefined &&
        isOwnActiveGate(gate.schemaPath, declaration.schemaPath)
        ? owner.path
        : undefined
      : declaration === undefined || isChildFrameGate(gate, declaration)
        ? appendSegment(owner.path, edgeName)
        : undefined;
  return child === undefined
    ? { hostPath: readOwnerFrame(owner, gate).path, readOrigin: owner.path }
    : { hostPath: child, readOrigin: child };
};
