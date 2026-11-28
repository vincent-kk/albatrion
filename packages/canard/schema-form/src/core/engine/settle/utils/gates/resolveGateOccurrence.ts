import { maxLite } from '@winglet/common-utils/math';

import type { Fn } from '@aileron/declare';

import {
  type PointerSegment,
  joinPointer,
  parsePointerSegments,
} from '@/schema-form/helpers/jsonPointer';

import type { BlueprintGate } from '../../../blueprint';
import { bindTemplatePath } from '../templatePaths/bindTemplatePath';
import type { GateOccurrence } from './type';

/**
 * Locate a gate's evaluation host from its transported host frame.
 * @param gate - Static read list of the authored condition
 * @param hostPath - Current address of the host frame bound by provenance
 * @param readOrigin - Live path that binds wildcards of absolute template reads
 * @param readSegments - Pointer decoder shared by the registry
 * @returns Bound host and its lowest common evaluation host
 */
export const resolveGateOccurrence = (
  gate: BlueprintGate,
  hostPath: string,
  readOrigin: string,
  readSegments: Fn<
    [path: string],
    readonly PointerSegment[]
  > = parsePointerSegments,
): GateOccurrence => {
  let common = readSegments(hostPath);
  for (const read of gate.evaluationReads) {
    if (typeof read === 'number') {
      common = common.slice(0, maxLite(0, common.length - read));
      continue;
    }
    const target = readSegments(bindTemplatePath(read, readOrigin));
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
