/**
 * Compare immutable witnesses including entering and exiting record identities.
 * @param {Map<any,any>} before - Snapshot before the observed unit
 * @param {Map<any,any>} after - Snapshot after the observed unit
 * @returns {{path:string,branch:boolean,value:boolean,selection:boolean}[]} Actual changed records
 */
export function compareNodes(before, after) {
  const result = [];
  for (const [node, previous] of before) {
    const current = after.get(node);
    const value =
      !current ||
      previous.local !== current.local ||
      previous.emit !== current.emit;
    const selection =
      !current ||
      previous.children !== current.children ||
      previous.schema !== current.schema ||
      previous.active !== current.active;
    if (value || selection)
      result.push({
        path: previous.path,
        branch: previous.branch,
        value,
        selection,
      });
  }
  for (const [node, current] of after)
    if (!before.has(node))
      result.push({
        path: current.path,
        branch: current.branch,
        value: true,
        selection: true,
      });
  return result;
}
