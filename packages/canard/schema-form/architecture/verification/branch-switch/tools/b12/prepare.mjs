// Invoked before B12's quiet window; reuse B11's immutable preparation and B6 timers.
import assert from 'node:assert/strict';

const baseline = '4d0fa4a12d5a9062a83c705076f2928e600d671c';
assert.ok(
  !process.argv.some((argument) => argument.startsWith('--baseline-commit=')),
);
process.argv.push('--baseline-commit=' + baseline);
await import('../b11/prepare.mjs');
console.log('B12_PREPARED');
