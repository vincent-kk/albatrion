import { getByPointer } from '../_lib.mjs';

/**
 * Adapt a benchmark case to one build; resolver factories and legacy callbacks do equivalent work.
 * @param {object} build Scanner constructors and optional built-in resolver factory.
 * @param {object} scenario Named workload with schema, group and optional density/reuse settings.
 * Callback-free fingerprints count object frames because boolean frames are elided in that measured path.
 * @returns {object} Batch preparation/execution functions and an untimed correctness fingerprint.
 */
export function createWorkload(build, scenario) {
  const { schema, group, density, reuseResolver } = scenario;
  const Scanner =
    group === 'asyncNoop'
      ? build.JSONSchemaScannerAsync
      : build.JSONSchemaScanner;
  const resolver = () =>
    build.createReferenceResolver
      ? build.createReferenceResolver(schema)
      : (ref) => getByPointer(schema, ref);
  const sharedResolver =
    group === 'refHeavy' && reuseResolver ? resolver() : undefined;
  const options = () =>
    group === 'refHeavy'
      ? { resolveReference: sharedResolver ?? resolver() }
      : group === 'mutation' || group === 'getValue'
        ? {
            mutate: (entry) =>
              entry.depth > 0 &&
              (density === 'dense' || entry.path.endsWith('/p0'))
                ? { ...entry.schema, title: 'measured' }
                : undefined,
          }
        : {};
  const visitor =
    group === 'noopEnterExit' || group === 'asyncNoop'
      ? { enter() {}, exit() {} }
      : undefined;
  return {
    prepare(count) {
      return group === 'getValue'
        ? Array.from({ length: count }, () =>
            new Scanner({ options: options() }).scan(schema),
          )
        : undefined;
    },
    run(prepared, index) {
      if (group === 'getValue') return prepared[index].getValue();
      const scanner = new Scanner({ visitor, options: options() });
      if (group === 'asyncNoop') return scanner.scan(schema);
      scanner.scan(schema);
      if (group === 'refHeavy' || group === 'mutation')
        return scanner.getValue();
    },
    async fingerprint() {
      let visits = 0;
      const scanner = new Scanner({
        visitor: {
          enter: (entry) => {
            if (group !== 'noCallback' || typeof entry.schema !== 'boolean')
              visits++;
          },
        },
        options: options(),
      });
      await scanner.scan(schema);
      return {
        visits,
        outputBytes: Buffer.byteLength(JSON.stringify(scanner.getValue())),
      };
    },
  };
}
