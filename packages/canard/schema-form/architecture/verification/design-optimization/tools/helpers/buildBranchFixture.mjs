/** Build tagged, validator-guarded, nested or expanded-payload branch fixtures for the paired device. */
export function buildBranchFixture(row, legacy) {
  const branches = Array.from({ length: row.n }, (_, i) => ({
    ...(row.gate === 'active'
      ? legacy
        ? { '&if': `./kind === 'kind_${i}'` }
        : { controls: { active: `./kind === 'kind_${i}'` } }
      : {}),
    properties: {
      ...(row.gate === 'discriminator'
        ? { kind: { type: 'string', const: `kind_${i}` } }
        : {}),
      ...Object.fromEntries(
        Array.from({ length: row.payload }, (_, j) => [
          `payload_${i}_${String.fromCharCode(97 + j)}`,
          j % 3 === 0
            ? { type: 'string', default: `a_${i}` }
            : j % 3 === 1
              ? { type: 'number', default: i }
              : { type: 'boolean', default: i % 2 === 0 },
        ]),
      ),
    },
  }));
  const host = {
    type: 'object',
    properties: {
      common: { type: 'string', default: 'shared' },
      kind: { type: 'string', default: 'kind_0' },
    },
    ...(row.gate === 'discriminator'
      ? { controls: { discriminator: 'kind' } }
      : {}),
    ...(row.gate === 'if'
      ? {
          allOf: branches.map((branch, i) => ({
            if: {
              properties: { kind: { const: `kind_${i}` } },
              required: ['kind'],
            },
            then: branch,
          })),
        }
      : { oneOf: branches }),
  };
  return row.hostPath
    ? {
        type: 'object',
        properties: { outer: { type: 'object', properties: { inner: host } } },
      }
    : host;
}
