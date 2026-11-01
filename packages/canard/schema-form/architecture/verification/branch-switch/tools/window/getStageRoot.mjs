/**
 * Keep stage outputs outside Spotlight while retaining legacy device addresses.
 * @param {string} root Prepared measurement root.
 * @param {string} lane A or B stage lane.
 * @returns {string} Stage root, ending in .noindex when its parent device does.
 */
export function getStageRoot(root, lane) {
  const suffix = '-stage-' + lane.toLowerCase();
  return root.endsWith('.noindex')
    ? root.slice(0, -8) + suffix + '.noindex'
    : root + suffix;
}
