/** A bulk array write creates the static tuple host after dependency registration. */
export const tupleGateHostCase = {
  name: 'tuple host created after split registration',
  schema: {
    type: 'object',
    properties: {
      arr: {
        type: 'array',
        prefixItems: [
          {
            type: 'object',
            properties: { kind: { type: 'string', default: 'a' } },
            oneOf: [
              {
                controls: { active: "./kind === 'a'" },
                properties: { a: { type: 'string', default: 'A' } },
              },
              {
                controls: { active: "./kind === 'b'" },
                properties: { b: { type: 'string', default: 'B' } },
              },
            ],
          },
        ],
      },
    },
  },
  input: {},
  writes: [{ path: '/arr', value: [{ kind: 'b' }] }],
};
