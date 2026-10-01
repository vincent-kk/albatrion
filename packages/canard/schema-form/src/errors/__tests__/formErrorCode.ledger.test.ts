import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { FORM_ERROR_CODE_TABLE } from '../formErrorCode';

/**
 * Expands a live ERROR-164 row, including its abbreviated alternatives.
 * @param row - A table row with a code cell and an error or warning level.
 * @returns Full group-qualified codes paired with their ledger levels.
 */
const expandCodeRow = (row: string): readonly (readonly [string, 'error' | 'warning'])[] => {
  const cells = row.split('|');
  const first = cells[1].match(/(JSON_SCHEMA_ERROR|SCHEMA_FORM_ERROR|SCHEMA_FORM_WARNING|UNHANDLED_ERROR)\.([A-Z_]+)/);
  const level = cells[2].match(/`(error|warning)`/)?.[1];
  if (!first || (level !== 'error' && level !== 'warning')) return [];
  const names = [first[2], ...[...cells[1].matchAll(/또는 ([A-Z_]+)/g)].map((match) => match[1])];
  return names.map((name) => [`${first[1]}.${name}`, level]);
};

describe('form error codes', () => {
  it('ERROR-164 code table matches the live ledger rows, supplements, order and level', () => {
    const ledger = readFileSync(new URL('../../../architecture/ledger/error.md', import.meta.url), 'utf8');
    const start = ledger.indexOf('### ERROR-164 ');
    const end = ledger.indexOf('### ERROR-165 ', start);
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    const section = ledger.slice(start, end);
    const supplementStart = ledger.indexOf('- 보충:', start);
    expect(supplementStart).toBeGreaterThan(start);
    const rows = section.split('\n').filter((line) =>
      /^ {2}> \|/.test(line) && /\| `(error|warning)` \|/.test(line) &&
      !/^ {2}> \| \((제외|코드 없음)/.test(line) &&
      !line.includes('오늘에만') && !line.includes('INJECT_TARGET_NOT_FOUND'),
    );
    const base = rows.flatMap(expandCodeRow);

    const supplementLines = section.slice(supplementStart - start).split('\n').filter((line) =>
      /더하는 행은|렌더 계층의 빈 .* 경고는|ERROR-164에 (경고|오류) 행|반영 칸\(union O4, 거부 코드\).*VALIDATOR_BIND_REFUSED|반영 칸\(설계서 메모 4\)/.test(line),
    );
    const supplements: (readonly [string, 'error' | 'warning'])[] = [];
    for (const line of supplementLines) {
      const names = [...line.matchAll(/`(?:\(가칭\) )?((?:(?:JSON_SCHEMA_ERROR|SCHEMA_FORM_ERROR|SCHEMA_FORM_WARNING|UNHANDLED_ERROR)\.)?[A-Z][A-Z_]+)`/g)];
      for (const [, name] of names) {
        const code = name.includes('.') ? name : `SCHEMA_FORM_WARNING.${name}`;
        if (!supplements.some(([existing]) => existing === code))
          supplements.push([code, code.startsWith('SCHEMA_FORM_WARNING.') ? 'warning' : 'error']);
      }
    }
    const dialect = ledger.match(/^### ERROR-199 .*`(SCHEMA_FORM_WARNING\.[A-Z_]+)`/m)?.[1];
    expect(dialect).toBeDefined();
    if (dialect) supplements.push([dialect, 'warning']);
    const expected = [...base, ...supplements];
    console.log(`ERROR-164 live code count: ${expected.length}`);
    expect(expected).toHaveLength(60);
    expect(FORM_ERROR_CODE_TABLE).toEqual(expected);
  });
});
