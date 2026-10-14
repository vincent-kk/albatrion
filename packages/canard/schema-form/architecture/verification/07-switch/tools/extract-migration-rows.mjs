/**
 * ledger/landing.md의 모든 "### LANDING-nnn 이주..." 행을 읽는 Node ESM 진입점입니다.
 * 인자 없이는 ID·상태·제목 요약의 Markdown 표 본문을 stdout에 출력합니다.
 * --check <table.md>는 ID 집합을, --check-complete <table.md>는 처분·근거·시험까지 점검합니다.
 * architecture에서 node verification/07-switch/tools/extract-migration-rows.mjs로 실행합니다.
 * 시험 파일은 이 진입점이 속한 저장소 루트 기준이며, CLI의 표 경로는 작업 디렉터리 기준입니다.
 */

import { readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** 실행 위치와 무관하게 원장을 찾기 위한 architecture의 절대 경로입니다. */
const architecturePath = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

/** 시험 인용의 상대 경로가 시작하는 현재 worktree의 저장소 루트입니다. */
const repositoryPath = resolve(architecturePath, '../../../..');

/** 68C-02의 세 처분과 비현행 행에 허용되는 처분입니다. */
const dispositions = ['(가)', '(나)', '(다)', '현행 아님'];

/**
 * Markdown 표의 코드 구간과 이스케이프된 파이프를 보존하여 셀을 나눕니다.
 * @param {string} line 양끝 파이프를 생략할 수 있는 Markdown 표 한 줄입니다.
 * @returns {string[]} 빈 셀을 포함하며 양끝 공백만 제거한 셀 목록입니다.
 */
function splitMarkdownRow(line) {
  const cells = [''];
  let fenceLength = 0;
  for (const [token] of line.trim().replace(/^\||\|$/gu, '').matchAll(/\\.|`+|\||[^\\`|]+/gu)) {
    if (token.startsWith('`')) fenceLength = fenceLength === token.length ? 0 : fenceLength || token.length;
    if (token === '|' && !fenceLength) cells.push('');
    else cells[cells.length - 1] += token;
  }
  return cells.map((cell) => cell.trim());
}

/**
 * 단일 코드 구간의 표기와 표 셀의 파이프 이스케이프만 제거합니다.
 * @param {string} value Markdown 셀 또는 시험 제목이며 빈 문자열도 허용합니다.
 * @returns {string} 의미상의 내부 문자와 공백을 보존한 비교용 문자열입니다.
 */
function unwrapMarkdown(value) {
  return value.trim().replace(/^`([^`]*)`$/u, '$1').replace(/\\\|/gu, '|');
}

try {
  const argumentsList = process.argv.slice(2);
  const [mode, tableArgument] = argumentsList;
  if (argumentsList.length && (argumentsList.length !== 2 || !['--check', '--check-complete'].includes(mode))) {
    throw new Error('사용법: node verification/07-switch/tools/extract-migration-rows.mjs [--check|--check-complete <table.md>]');
  }

  const ledger = readFileSync(join(architecturePath, 'ledger/landing.md'), 'utf8')
    .replace(/^\uFEFF/u, '')
    .split(/\r?\n/u)
    .map((line) => line.replace(/^\s*(?:>\s*)+/u, '').trimStart())
    .join('\n');
  const migrationRows = [...ledger.matchAll(/^###[ \t]+(LANDING-\d+)[ \t]+([^\n]+)\n([\s\S]*?)(?=^###[ \t]|$(?![\s\S]))/gmu)]
    .filter(([, , title]) => title.startsWith('이주'))
    .map(([, id, title, body]) => {
      const status = body.match(/^-[ \t]*상태:[ \t]*([^\n]+)/mu)?.[1].trim();
      if (!status) throw new Error(`${id}: 원장의 상태가 비어 있습니다.`);
      return { id, status, title: title.replace(/^이주[^—]*—[ \t]*/u, '') };
    });
  if (!migrationRows.length) throw new Error('원장에서 이주 행을 찾지 못했습니다.');

  if (!mode) {
    process.stdout.write(migrationRows.map(({ id, status, title }) =>
      `| ${id} | ${status.replace(/\|/gu, '\\|')} | ${title.replace(/\|/gu, '\\|')} |`
    ).join('\n') + '\n');
  } else {
    const tablePath = resolve(process.cwd(), tableArgument);
    const table = readFileSync(tablePath, 'utf8').replace(/^\uFEFF/u, '');
    const tableRows = table.split(/\r?\n/u).flatMap((line, index) => {
      const rowLine = line.replace(/^\s*(?:>\s*)+/u, '').trim();
      if (!rowLine.startsWith('|')) return [];
      const cells = splitMarkdownRow(rowLine);
      const id = unwrapMarkdown(cells[0]).match(/^(LANDING-\d+)(?=$|[ \t—])/u)?.[1];
      return id ? [{ id, cells, lineNumber: index + 1 }] : [];
    });
    const ledgerIds = migrationRows.map(({ id }) => id);
    const tableIds = tableRows.map(({ id }) => id);
    const missingIds = ledgerIds.filter((id) => !tableIds.includes(id));
    const extraIds = tableIds.filter((id, index) => !ledgerIds.includes(id) && tableIds.indexOf(id) === index);
    const errors = [];
    if (missingIds.length) errors.push(`누락 ID (${missingIds.length}개): ${missingIds.join(', ')}`);
    if (extraIds.length) errors.push(`추가 ID (${extraIds.length}개): ${extraIds.join(', ')}`);

    if (mode === '--check-complete') {
      const testContents = new Map();
      for (const { id, cells, lineNumber } of tableRows) {
        const label = `${id} (${lineNumber}행)`;
        const ledgerRow = migrationRows.find((row) => row.id === id);
        const status = unwrapMarkdown(cells[1] ?? '');
        const disposition = unwrapMarkdown(cells[4] ?? '');
        const reason = unwrapMarkdown(cells[5] ?? '');
        const tests = (cells[6] ?? '').trim();
        if (ledgerRow && status !== ledgerRow.status) {
          errors.push(`${label}: 상태가 원장과 다릅니다 (표: "${status}", 원장: "${ledgerRow.status}").`);
        }
        if (!dispositions.includes(disposition)) {
          errors.push(`${label}: 처분 "${disposition || '(빈 셀)'}"은 미완료입니다. 허용값: ${dispositions.join(', ')}.`);
          continue;
        }
        if (((ledgerRow && ledgerRow.status !== '현행') || status !== '현행') && disposition !== '현행 아님') {
          errors.push(`${label}: 비현행 상태의 처분은 "현행 아님"이어야 합니다.`);
        }
        if (disposition === '(다)' && !/(?:^|[^0-9])(?:08|09)(?![0-9])/u.test(reason)) {
          errors.push(`${label}: (다)의 처분 근거에 담당 단계 08 또는 09가 필요합니다.`);
        }
        if (disposition !== '(가)' && disposition !== '(나)') continue;
        if (!tests || unwrapMarkdown(tests) === '미정') {
          errors.push(`${label}: ${disposition}에는 시험 이름이 하나 이상 필요합니다.`);
          continue;
        }
        for (const reference of tests.split(/\s*(?:<br\s*\/?>|;)\s*/iu)) {
          const test = unwrapMarkdown(reference).match(/^`?([^`>\s]+\.test\.[cm]?[jt]sx?)`?(?:\s*>\s*(.+))?$/u);
          if (!test) {
            errors.push(`${label}: 시험 인용 "${reference}"의 형식이 잘못되었습니다 (path/to/file.test.tsx 또는 path/to/file.test.tsx > test title).`);
            continue;
          }
          const [, testPath, title] = test;
          const absolutePath = resolve(repositoryPath, testPath);
          const relativePath = relative(repositoryPath, absolutePath);
          if (isAbsolute(testPath) || relativePath === '..' || relativePath.startsWith('../')) {
            errors.push(`${label}: 시험 파일은 저장소 루트 안의 상대 경로여야 합니다 (${testPath}).`);
            continue;
          }
          try {
            const canonicalPath = realpathSync(absolutePath);
            const canonicalRelativePath = relative(repositoryPath, canonicalPath);
            if (canonicalRelativePath === '..' || canonicalRelativePath.startsWith('../') || !statSync(canonicalPath).isFile()) {
              errors.push(`${label}: 저장소 안의 시험 파일이 아닙니다 (${testPath}).`);
              continue;
            }
            if (title) {
              if (!testContents.has(canonicalPath)) testContents.set(canonicalPath, readFileSync(canonicalPath, 'utf8'));
              const testTitle = unwrapMarkdown(title);
              if (!testContents.get(canonicalPath).includes(testTitle)) {
                errors.push(`${label}: 시험 제목 "${testTitle}"이 파일에 없습니다 (${testPath}).`);
              }
            }
          } catch (error) {
            errors.push(`${label}: 시험 파일을 확인할 수 없습니다 (${testPath}): ${error.message}`);
          }
        }
      }
    }

    if (errors.length) {
      process.stderr.write(`이주 점검 실패 (${errors.length}건):\n${errors.map((error) => `- ${error}`).join('\n')}\n`);
      process.exitCode = 1;
    } else {
      process.stdout.write(`이주 ${mode === '--check-complete' ? '완료' : 'ID'} 점검 통과: ${migrationRows.length}개 행.\n`);
    }
  }
} catch (error) {
  process.stderr.write(`이주 점검 오류: ${error.message}\n`);
  process.exitCode = 1;
}
