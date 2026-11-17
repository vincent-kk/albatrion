/**
 * Split a core case identifier into its operation and validation flag.
 * @param {string} id - Core case identifier such as `type-flat-500-validate-nonburst`.
 * @returns {{ operation: string, validation: boolean, key: string }} Operation, whether validation is on, and the observability key.
 */
export function parseCoreCaseId(id) {
  const match = /^(mount|type|first-key|rebuild)-/.exec(id);
  if (!match) throw new Error(`Unknown core case id: ${id}`);
  const validation = !id.endsWith('-none');
  return {
    operation: match[1],
    validation,
    key: `${match[1]}-${validation ? 'validate' : 'none'}`,
  };
}
