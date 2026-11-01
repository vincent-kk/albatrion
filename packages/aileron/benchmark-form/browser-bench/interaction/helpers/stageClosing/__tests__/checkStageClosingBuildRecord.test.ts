import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, expect, it } from 'vitest';

import { checkStageClosingBuildRecord } from '../checkStageClosingBuildRecord';

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0))
    fs.rmSync(root, { recursive: true, force: true });
});
const bundles = {
  B: { commit: 'b'.repeat(40), product: { sha256: '1'.repeat(64) } },
  S: { commit: 's'.repeat(40), product: { sha256: '2'.repeat(64) } },
};
it('rejects a missing clean-build record', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'closing-build-'));
  roots.push(root);
  expect(() => checkStageClosingBuildRecord(root, bundles)).toThrow();
});
it('rejects build product hashes that differ from inputs', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'closing-build-'));
  roots.push(root);
  fs.writeFileSync(
    path.join(root, 'clean-build-record.json'),
    JSON.stringify({
      lanes: {
        B: { ...bundles.B, cleanProductScope: true, exitCode: 0 },
        S: {
          ...bundles.S,
          cleanProductScope: true,
          exitCode: 0,
          product: { sha256: '3'.repeat(64) },
        },
      },
    }),
  );
  expect(() => checkStageClosingBuildRecord(root, bundles)).toThrow();
});
it('accepts clean B/S build records bound to the frozen products', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'closing-build-'));
  roots.push(root);
  fs.writeFileSync(
    path.join(root, 'clean-build-record.json'),
    JSON.stringify({
      lanes: {
        B: { ...bundles.B, cleanProductScope: true, exitCode: 0 },
        S: { ...bundles.S, cleanProductScope: true, exitCode: 0 },
      },
    }),
  );
  expect(() => checkStageClosingBuildRecord(root, bundles)).not.toThrow();
});

it.each([
  ['exitCode', 1, 'Successful build'],
  ['commit', 'different-commit', 'Build commit'],
  ['cleanProductScope', false, 'Clean product scope'],
] as const)(
  'rejects a build record with invalid %s',
  (field, value, message) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'closing-build-'));
    roots.push(root);
    fs.writeFileSync(
      path.join(root, 'clean-build-record.json'),
      JSON.stringify({
        lanes: {
          B: {
            ...bundles.B,
            cleanProductScope: true,
            exitCode: 0,
            [field]: value,
          },
          S: { ...bundles.S, cleanProductScope: true, exitCode: 0 },
        },
      }),
    );
    expect(() => checkStageClosingBuildRecord(root, bundles)).toThrow(message);
  },
);
