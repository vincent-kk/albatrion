import { describe, expect, it } from 'vitest';

import { gateSelectionTable } from '../utils/gates/gateSelectionTable';
import { verifyGateSelection } from '../utils/gates/verifyGateSelection';

describe('gate selection scaffold', () => {
  it('defaults to off with no recorded violations', () => {
    expect(gateSelectionTable.mode).toBe('off');
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
