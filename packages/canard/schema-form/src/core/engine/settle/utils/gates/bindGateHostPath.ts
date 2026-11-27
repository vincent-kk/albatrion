import { isDescendantPath } from '@/schema-form/helpers/jsonPointer';

import type { BlueprintGate } from '../../../blueprint';
import { bindTemplatePath } from '../templatePaths/bindTemplatePath';

/**
 * Bind a gate's declaring host without resolving or changing its evaluation L.
 * @param gate - Gate carrying the first template host
 * @param templatePath - Owner template's first occurrence path
 * @param occurrencePath - Live owner occurrence used for reference rebinding
 * @param childHostPath - Direct child address for its own active gate
 * @returns Absolute declaring host for this occurrence
 */
export const bindGateHostPath = (
  gate: BlueprintGate,
  templatePath: string,
  occurrencePath: string,
  childHostPath?: string,
): string => {
  const suffix =
    gate.hostPath === templatePath
      ? ''
      : isDescendantPath(gate.hostPath, templatePath)
        ? gate.hostPath.slice(templatePath.length)
        : undefined;
  return (
    childHostPath ??
    bindTemplatePath(
      suffix === undefined ? gate.hostPath : occurrencePath + suffix,
      occurrencePath,
    )
  );
};
