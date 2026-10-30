/** Return additive B0 rows; timings are two writes except the existing siblings probe. */
export function buildBranchRows() {
  return [
    { id: 'switch-oneOf-80', operation: 'switch', shape: 'oneOf', n: 80 },
    {
      id: 'switch-siblings-0',
      operation: 'switch',
      shape: 'siblings',
      siblings: 0,
      n: 0,
    },
    ...['discriminator', 'if'].map((gate) => ({
      id: `switch-${gate}-80`,
      operation: 'switch',
      shape: 'branch-switch',
      gate,
      n: 80,
      payload: 3,
      currentOnly: true,
    })),
    {
      id: 'switch-nested-oneOf-20',
      operation: 'switch',
      shape: 'branch-switch',
      gate: 'active',
      n: 20,
      payload: 3,
      hostPath: '/outer/inner',
    },
    ...[2, 10, 40, 160].map((n) => ({
      id: `switch-oneOf-${n}`,
      operation: 'switch',
      shape: 'branch-switch',
      gate: 'active',
      n,
      payload: 3,
    })),
    {
      id: 'switch-payload-12',
      operation: 'switch',
      shape: 'branch-switch',
      gate: 'active',
      n: 80,
      payload: 12,
    },
  ];
}
