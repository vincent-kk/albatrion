// Coordinator authorization is required; B11 enforces quiet starts and a single formal marker.
import assert from 'node:assert/strict';

assert.ok(
  process.argv[2]?.endsWith('.noindex'),
  'B12 formal root must end in .noindex',
);
await import('../b11/window.mjs');
