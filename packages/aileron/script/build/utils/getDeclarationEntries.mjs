/**
 * Enumerates import and require declarations without silently dropping public addresses.
 * @param {object} manifest Package exports whose declarations are checked.
 * @returns {{entries: [string, {import: string, require: string}][], blocked: string[]}} Concrete targets and blocked addresses.
 * @throws When wildcard addresses or unsupported conditions cannot be proven.
 */
export function getDeclarationEntries(manifest) {
  const exports = manifest.exports;
  const targets = typeof exports === 'object' && exports !== null && !Array.isArray(exports) &&
    Object.keys(exports).some((key) => key.startsWith('.'))
    ? Object.entries(exports) : [['.', exports]];
  const entries = [];
  const blocked = [];
  for (const [key, target] of targets) {
    if (key.includes('*') || JSON.stringify(target)?.includes('*')) throw new Error(`${manifest.name}: wildcard export ${key} requires concrete consumer addresses`);
    if (target === null) { blocked.push(key); continue; }
    try {
      entries.push([key, declarationBranches(target)]);
    } catch (error) {
      throw new Error(`${manifest.name}: export ${key} ${error.message}`);
    }
  }
  if (!entries.length) throw new Error(`${manifest.name}: no verifiable public exports found`);
  return { entries, blocked };
}

/**
 * Resolves supported shapes while requiring Node runtime selection to share the declaration contract.
 * @param {unknown} target Export address or conditional export object.
 * @returns {{import: string, require: string}} Declaration target for each consumer format.
 * @throws When conditions cannot be represented by the supported consumer checks.
 */
function declarationBranches(target) {
  if (typeof target === 'string') return { import: target, require: target };
  if (!target || typeof target !== 'object' || Array.isArray(target) ||
    Object.keys(target).some((key) => !['types', 'source', 'node', 'import', 'require'].includes(key))) throw new Error('has unsupported conditions');
  const branches = typeof target.types === 'string'
    ? { import: target.types, require: target.types }
    : { import: branchTypes(target.import), require: branchTypes(target.require) };
  if (target.node && JSON.stringify(declarationBranches(target.node)) !== JSON.stringify(branches)) throw new Error('has node declarations that differ from the import/require contract');
  return branches;
}

/**
 * Requires a complete, ordered branch instead of guessing an unchecked fallback.
 * @param {unknown} branch A nested import or require condition with types first.
 * @returns {string} Declared types target.
 * @throws When the branch is incomplete, incorrectly ordered or unsupported.
 */
function branchTypes(branch) {
  if (!branch || typeof branch !== 'object' || Array.isArray(branch) || typeof branch.types !== 'string' ||
    Object.keys(branch)[0] !== 'types' || Object.keys(branch).some((key) => !['types', 'default'].includes(key))) {
    throw new Error('requires a top-level types condition or both nested import.types and require.types branches with types first');
  }
  return branch.types;
}
