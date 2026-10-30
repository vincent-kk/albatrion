/** Canonical scale fixtures mirror benchmark-form/src/fixtures/scale-schemas.ts and fixtures/equivalent/branches.ts. */
export function buildFixture(row, legacy = false) {
  if (row.shape === 'nested') {
    const build = (depth) =>
      depth === 0
        ? { type: 'string', default: 'leaf' }
        : {
            type: 'object',
            properties: Object.fromEntries(
              Array.from({ length: 4 }, (_, i) => [`n${i}`, build(depth - 1)]),
            ),
          };
    return build(6);
  }
  if (row.shape === 'flat') {
    return {
      type: 'object',
      properties: Object.fromEntries(
        Array.from({ length: row.n }, (_, i) => [
          `field_${String(i).padStart(3, '0')}`,
          { type: 'string', default: `value_${i}` },
        ]),
      ),
    };
  }
  if (row.shape === 'siblings') {
    const properties = {
      type: { type: 'string', enum: ['a', 'b'], default: 'a' },
    };
    for (let i = 0; i < row.siblings; i++)
      properties[`pad_${i}`] = { type: 'number', default: i };
    return {
      type: 'object',
      properties,
      ...(row.gated === false
        ? {}
        : {
            oneOf: ['a', 'b'].map((v, i) => ({
              ...(legacy
                ? { computed: { if: `./type === '${v}'` } }
                : { controls: { active: `./type === '${v}'` } }),
              properties: {
                x: { type: 'string', default: v.toUpperCase() },
                y: { type: 'number', default: i + 1 },
              },
            })),
          }),
    };
  }
  const count = row.shape === 'oneOf' ? row.n : 2;
  const properties = {
    common: { type: 'string', default: 'shared' },
    kind: { type: 'string', default: 'kind_0' },
  };
  for (let i = 0; i < (row.siblings ?? 0); i++)
    properties[`pad_${i}`] = { type: 'number', default: i };
  const schema = { type: 'object', properties };
  if (row.gated !== false)
    schema.oneOf = Array.from({ length: count }, (_, i) => ({
      ...(legacy
        ? { '&if': `./kind === 'kind_${i}'` }
        : { controls: { active: `./kind === 'kind_${i}'` } }),
      properties: {
        [`payload_${i}_a`]: { type: 'string', default: `a_${i}` },
        [`payload_${i}_b`]: { type: 'number', default: i },
        [`payload_${i}_c`]: { type: 'boolean', default: i % 2 === 0 },
      },
    }));
  return schema;
}
