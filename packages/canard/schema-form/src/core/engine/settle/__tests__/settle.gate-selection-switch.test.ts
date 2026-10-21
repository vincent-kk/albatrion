import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { gateSelectionTable } from '../utils/gates/gateSelectionTable';
import { verifyGateSelection } from '../utils/gates/verifyGateSelection';

describe('gate selection scaffold', () => {
  it('defaults to table with no recorded violations', () => {
    expect(
      readFileSync(
        new URL('../utils/gates/gateSelectionTable.ts', import.meta.url),
        'utf8',
      ),
    ).toContain("mode: 'table'");
    expect(['table', 'verify']).toContain(gateSelectionTable.mode);
    expect(gateSelectionTable.violations).toBe(0);
  });

  it('counts and throws forced verification violations only in verify mode', () => {
    const previous = { ...gateSelectionTable };
    try {
      gateSelectionTable.mode = 'verify';
      expect(() =>
        verifyGateSelection(true, 'matching selection'),
      ).not.toThrow();
      expect(() => verifyGateSelection(false, 'forced violation')).toThrow(
        'forced violation',
      );
      expect(gateSelectionTable.violations).toBe(previous.violations + 1);
      gateSelectionTable.mode = 'off';
      expect(() => verifyGateSelection(false, 'disabled')).not.toThrow();
      gateSelectionTable.mode = 'table';
      expect(() => verifyGateSelection(false, 'disabled')).not.toThrow();
      expect(gateSelectionTable.violations).toBe(previous.violations + 1);
    } finally {
      Object.assign(gateSelectionTable, previous);
    }
  });
});
