import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/** Vitest runs from the package directory; dist is optional in source-only checkouts. */
const distDirectory = path.resolve('dist');
/** A built package must contain all three outputs, even if only the default ESM exists. */
const hasBuild = existsSync(distDirectory);

describe.skipIf(!hasBuild)(
  'build outputs (requires dist; skipped in source-only checkouts)',
  () => {
    it('keeps call-site ESM and one load-time flag in both Node outputs', () => {
      const esm = readFileSync(path.join(distDirectory, 'index.mjs'), 'utf8');
      const cjs = readFileSync(path.join(distDirectory, 'index.cjs'), 'utf8');
      const node = readFileSync(
        path.join(distDirectory, 'index.node.mjs'),
        'utf8',
      );
      const flagLine =
        'const __SCHEMA_FORM_DEV__ = process.env.NODE_ENV !== "production";';
      const environmentReads = esm.split('process.env.NODE_ENV').length - 1;
      const pureAnnotations = esm.split('@__PURE__').length - 1;
      expect(environmentReads).toBeGreaterThanOrEqual(1);
      expect(esm).not.toContain('__SCHEMA_FORM_DEV__');
      expect(esm).not.toMatch(/^\s*(['"])[^'"\r\n]+\1\s*;/);
      expect(
        cjs
          .split('\n')
          .filter((line) => line.trim())
          .slice(0, 2),
      ).toEqual(['"use strict";', flagLine]);
      expect(node.split('\n')[0]).toBe(flagLine);
      for (const code of [cjs, node]) {
        expect(code.split('process.env.NODE_ENV').length - 1).toBe(1);
        expect(code.split('__SCHEMA_FORM_DEV__').length - 1).toBe(
          environmentReads + 1,
        );
      }
      for (const code of [esm, cjs, node]) {
        expect(code.split('@__PURE__').length - 1).toBe(pureAnnotations);
      }
    });
  },
);
