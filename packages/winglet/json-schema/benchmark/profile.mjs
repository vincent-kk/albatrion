// CPU profile driver: run a heavy mixed workload in a tight loop.
import {
  loadScanners,
  genWide,
  genBranchy,
  genMixed,
  genRefHeavy,
  getByPointer,
} from "./_lib.mjs";

const { JSONSchemaScanner, JSONSchemaScannerAsync } = await loadScanners();

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
    options: { resolveReference: (r) => getByPointer(refHeavy, r) },
  });
  s.scan(refHeavy);
  s.getValue();
}
console.log("done", ROUNDS, "rounds");
