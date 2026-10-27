import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { engineModes } from '../../utils/cache/engineModes';
import { gateSelectionTable } from '../utils/gates/gateSelectionTable';
import { verifyGateSelection } from '../utils/gates/verifyGateSelection';

describe('gate selection scaffold', () => {
  it('defaults to table with no recorded violations', () => {
    expect(
      readFileSync(
        new URL('../../utils/cache/engineModes.ts', import.meta.url),
        'utf8',
      ),
    ).toContain("gateSelection: 'table'");
    expect(['table', 'verify']).toContain(engineModes.gateSelection);
    expect(gateSelectionTable.violations).toBe(0);
  });

  it('counts and throws forced verification violations only in verify mode', () => {
    const previousMode = engineModes.gateSelection;
    const previous = { ...gateSelectionTable };
    try {
      engineModes.setMode('gateSelection', 'verify');
      expect(() =>
        verifyGateSelection(true, 'matching selection'),
      ).not.toThrow();
      expect(() => verifyGateSelection(false, 'forced violation')).toThrow(
        'forced violation',
      );
      expect(gateSelectionTable.violations).toBe(previous.violations + 1);
      engineModes.setMode('gateSelection', 'off');
      expect(() => verifyGateSelection(false, 'disabled')).not.toThrow();
      engineModes.setMode('gateSelection', 'table');
      expect(() => verifyGateSelection(false, 'disabled')).not.toThrow();
      expect(gateSelectionTable.violations).toBe(previous.violations + 1);
    } finally {
      Object.assign(gateSelectionTable, previous);
      engineModes.setMode('gateSelection', previousMode);
    }
  });
});
