/** Describes one public operation and its per-operation lifecycle. */
export type SpeedRow = {
  id: string;
  packageName: string;
  packagePath: string;
  entry: string;
  operation: string;
  input: string;
  source: string;
  render: boolean;
  rounds?: number;
  warmup?: number;
  batches?: number;
  targetBatchNs?: number;
  allowedVariants?: { name: string; version: string }[];
  prepare: (
    module: Record<string, unknown>,
    load: (name: string) => Promise<unknown>,
  ) => {
    run: () => unknown;
    validate: (value: unknown) => boolean;
    cleanup?: () => void;
  };
};

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
    prepare: (module: Record<string, unknown>) => {
      const input = { alpha: { beta: { gamma: 42 } } };
      const getValue = module.getValue as (
        input: unknown,
        pointer: string,
      ) => unknown;
      return {
        run: () => getValue(input, '/alpha/beta/gamma'),
        validate: (result: unknown) => result === 42,
      };
    },
  },
] satisfies SpeedRow[];
