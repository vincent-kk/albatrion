import type { BlueprintGate } from '../../../blueprint';
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
): GateOccurrence => {
  const suffix = gate.hostPath === templatePath ? '' :
    gate.hostPath.startsWith(`${templatePath}/`)
      ? gate.hostPath.slice(templatePath.length) : undefined;
  const hostPath = childHostPath ??
    (suffix === undefined ? gate.hostPath : `${occurrencePath}${suffix}`);
  let common = hostPath.split('/').filter(Boolean);
  for (const read of gate.evaluationReads) {
    if (typeof read === 'number') {
      common = common.slice(0, Math.max(0, common.length - read));
      continue;
    }
    const target = read.split('/').filter(Boolean);
    let index = 0;
    while (index < common.length && index < target.length &&
      common[index] === target[index]) index++;
    common = common.slice(0, index);
  }
  return { gate, hostPath,
    evaluationHostPath: common.length ? `/${common.join('/')}` : '' };
};
