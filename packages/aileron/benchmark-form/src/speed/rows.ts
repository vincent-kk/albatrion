/** The single pilot row uses a fixed, independently verifiable pointer. */
export const rows = [
  {
    id: 'pilot-json-getValue',
    packageName: '@winglet/json',
    packagePath: 'packages/winglet/json',
    entry: '.',
    operation: 'getValue',
    input: '/alpha/beta/gamma',
    source: 'Pilot fixture: fixed three-segment JSON Pointer',
    render: false,
    rounds: 2,
    warmup: 10,
    batches: 5,
    prepare: (module: Record<string, any>) => {
      const input = { alpha: { beta: { gamma: 42 } } };
      return {
        run: () => module.getValue(input, '/alpha/beta/gamma') as unknown,
        validate: (result: unknown) => result === 42,
      };
    },
  },
] as const;
