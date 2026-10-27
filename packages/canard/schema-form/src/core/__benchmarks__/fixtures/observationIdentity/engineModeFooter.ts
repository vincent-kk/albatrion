/** Appended only to private observation copies; callers restore in finally. */
export const engineModeFooter = (): string => `
const __previousEngineModes = {
  gateSelection: engineModes.gateSelection,
  gateWheel: engineModes.gateWheel,
  deriveShadow: engineModes.deriveShadow,
};
engineModes.setMode('gateSelection', 'verify');
export const __restoreEngineModes = () => {
  engineModes.setMode('gateSelection', __previousEngineModes.gateSelection);
  engineModes.setMode('gateWheel', __previousEngineModes.gateWheel);
  engineModes.setMode('deriveShadow', __previousEngineModes.deriveShadow);
};
export const __readGateTableVerification = () => ({mode: engineModes.gateSelection, violations: gateSelectionTable.violations, assertions: {...gateSelectionTable.assertions}});
`;
