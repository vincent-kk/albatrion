// CPU profile driver: run a heavy mixed workload in a tight loop.
import {
  genBranchy,
  genMixed,
  genRefHeavy,
  genWide,
  loadScanners,
} from './_lib.mjs';

const { JSONSchemaScanner, JSONSchemaScannerAsync, createReferenceResolver } =
  await loadScanners();

const wide = genWide(10000);
const branchy = genBranchy(6, 5);
const mixed = genMixed(4, 7);
const refHeavy = genRefHeavy(300, 3, 3);
const noop = () => {};

const ROUNDS = Number(process.argv[2] || 200);
for (let i = 0; i < ROUNDS; i++) {
  new JSONSchemaScanner().scan(wide);
  new JSONSchemaScanner({ visitor: { enter: noop, exit: noop } }).scan(branchy);
  new JSONSchemaScanner({ visitor: { enter: noop, exit: noop } }).scan(mixed);
  const s = new JSONSchemaScanner({
    options: { resolveReference: createReferenceResolver(refHeavy) },
  });
  s.scan(refHeavy);
  s.getValue();
}
console.log('done', ROUNDS, 'rounds');
