import {
  type PointerSegment,
  joinPointer,
  parsePointerSegments,
} from '@/schema-form/helpers/jsonPointer';

import type { BlueprintGate } from '../../../blueprint';
import { bindTemplatePath } from '../templatePaths/bindTemplatePath';
import { bindGateHostPath } from './bindGateHostPath';
import type { GateOccurrence } from './type';

/**
 * Bind a template gate once to a live owner's absolute occurrence path.
 * @param gate - Static read list and first-template host
 * @param templatePath - Owner template's first data occurrence
 * @param occurrencePath - Current live owner's absolute data path
 * @param childHostPath - Direct child host when a gate belongs to that edge
 * @returns Bound host and its lowest common evaluation host
 */
export const resolveGateOccurrence = (
  gate: BlueprintGate,
  templatePath: string,
  occurrencePath: string,
  childHostPath?: string,
  readSegments: (
    path: string,
  ) => readonly PointerSegment[] = parsePointerSegments,
): GateOccurrence => {
  const hostPath = bindGateHostPath(
    gate,
    templatePath,
    occurrencePath,
    childHostPath,
  );
  let common = readSegments(hostPath);
  for (const read of gate.evaluationReads) {
    if (typeof read === 'number') {
      common = common.slice(0, Math.max(0, common.length - read));
      continue;
    }
    const target = readSegments(
      bindTemplatePath(read, childHostPath ?? occurrencePath),
    );
    let index = 0;
    while (
      index < common.length &&
      index < target.length &&
      common[index] === target[index]
    )
      index++;
    common = common.slice(0, index);
  }
  return {
    gate,
    hostPath,
    evaluationHostPath: joinPointer(common),
  };
};
