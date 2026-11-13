/**
 * Create a boolean-dominated schema without adding vocabulary unknown to the frozen baseline.
 * @param {number} width Number of property positions, every fifth position containing an object.
 * @returns {object} Stable object work shared by callback-free builds, with many elided boolean leaves.
 */
export function genBooleanHeavy(width) {
  const properties = {};
  for (let index = 0; index < width; index++)
    properties['p' + index] =
      index % 5 === 0 ? { not: false, items: true } : false;
  return { type: 'object', properties };
}
