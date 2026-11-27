/** Invoked by build:verify after rolldown; verifies emitted shape, not consumer folding. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** The package directory is also the resolution scope of the child processes. */
const packageDirectory = fileURLToPath(new URL('../', import.meta.url));
/** Exact declaration required before any Node-output code can run. */
const flagLine =
  'const __SCHEMA_FORM_DEV__ = process.env.NODE_ENV !== "production";';
/** Each marker must remain available for development diagnostics in every output. */
const developmentMarkers = [
  '[@canard/schema-form]',
  'Terminal inputs have no child',
  'differs from schema',
];

try {
  const esm = readFileSync(
    new URL('../dist/index.mjs', import.meta.url),
    'utf8',
  );
  const cjs = readFileSync(
    new URL('../dist/index.cjs', import.meta.url),
    'utf8',
  );
  const node = readFileSync(
    new URL('../dist/index.node.mjs', import.meta.url),
    'utf8',
  );
  const environmentReads = esm.split('process.env.NODE_ENV').length - 1;
  const pureAnnotations = esm.split('@__PURE__').length - 1;
  assert.ok(environmentReads >= 1, 'default ESM must retain environment reads');
  assert.ok(
    !esm.includes('__SCHEMA_FORM_DEV__'),
    'default ESM must not use the flag',
  );
  assert.ok(
    !/^\s*(['"])[^'"\r\n]+\1\s*;/.test(esm),
    'default ESM must not start with a directive',
  );

  const cjsLines = cjs.split('\n').filter((line) => line.trim());
  assert.equal(cjsLines[0], '"use strict";');
  assert.equal(
    cjsLines[1],
    flagLine,
    'CJS flag must immediately follow use strict',
  );
  assert.equal(node.split('\n')[0], flagLine, 'Node ESM flag must be line one');
  for (const [name, code] of [
    ['index.cjs', cjs],
    ['index.node.mjs', node],
  ]) {
    assert.equal(
      code.split('process.env.NODE_ENV').length - 1,
      1,
      `${name}: environment reads`,
    );
    assert.equal(
      code.split('__SCHEMA_FORM_DEV__').length - 1,
      environmentReads + 1,
      `${name}: flags`,
    );
  }
  const restored = node
    .slice(node.indexOf('\n') + 1)
    .replaceAll('!__SCHEMA_FORM_DEV__', 'process.env.NODE_ENV === "production"')
    .replaceAll('__SCHEMA_FORM_DEV__', 'process.env.NODE_ENV !== "production"');
  assert.equal(
    restored,
    esm,
    'reversing the Node ESM flag must recover default ESM byte-for-byte',
  );
  for (const [name, code] of [
    ['index.mjs', esm],
    ['index.cjs', cjs],
    ['index.node.mjs', node],
  ]) {
    assert.equal(
      code.split('@__PURE__').length - 1,
      pureAnnotations,
      `${name}: PURE annotations`,
    );
    for (const marker of developmentMarkers)
      assert.ok(code.includes(marker), `${name}: missing ${marker}`);
  }
  const importResolution = execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      'console.log(import.meta.resolve("@canard/schema-form"))',
    ],
    { cwd: packageDirectory, encoding: 'utf8' },
  ).trim();
  const requireResolution = execFileSync(
    process.execPath,
    ['-e', 'console.log(require.resolve("@canard/schema-form"))'],
    { cwd: packageDirectory, encoding: 'utf8' },
  ).trim();
  assert.ok(
    importResolution.endsWith('/dist/index.node.mjs'),
    importResolution,
  );
  assert.ok(requireResolution.endsWith('/dist/index.cjs'), requireResolution);
  console.log(
    `DEVELOPMENT_FLAG_OK reads=${environmentReads} flags=${environmentReads + 1} pure=${pureAnnotations}`,
  );
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
