/**
 * Create a driver-owned native opaque-opening probe outside sheet processing.
 * @returns A global probe matching one opening code unit; lastIndex follows it.
 */
export function createCssOpaqueProbe(): RegExp {
  return /["'\\([]|\/(?=\*)/g;
}
