// CLI report verification; published table cells and evidence links are checked against their source artifacts.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { directory, HEAD, hash, emit } from './runtime.mjs';

const read = file => JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
const source = read('report-sources.json'), verdict = read('verdict.json');
const preserved = read('audit-final.json'), measurements = read('audit-measurements.json');
const reportPath = path.resolve(directory, '../profile-117-session.md');
const evidencePath = path.join(directory, 'raw-evidence.md');
const report = fs.readFileSync(reportPath, 'utf8'), evidence = fs.readFileSync(evidencePath, 'utf8');
assert.equal(hash(report), source.reportSha256);
assert.equal(hash(evidence), source.rawEvidenceSha256);
assert(preserved.sourceTreeMatchesBaseline && preserved.existingSrcChangesPreserved);
assert(measurements.passed);
assert.equal(measurements.independentlyVerifiedBranchSlopes, 6);
assert.equal(source.verdict, verdict.verdict);
assert.equal(verdict.verdict, 'REJECT');
assert.equal(verdict.regressions.length, 4);
assert(report.includes('현재 판정은 **REJECT**입니다.'));
const modeNames = { mount: '마운트', update: 'BF', 'update-first': '초회', 'update-later': '후속',
  'axis-update': '고정 축 BF', 'axis-first': '고정 축 초회', 'axis-later': '고정 축 후속' };
const us = value => (value * 1000).toFixed(3);
const ci = value => us(value.median) + ' [' + us(value.low) + ', ' + us(value.high) + ']';
const header = '| fixture | 검증 | 모드 | HEAD µs | working µs |';
const tableStart = report.indexOf(header);
assert(tableStart > 0);
const lines = report.slice(tableStart).split('\n').slice(2);
const renderedRows = [];
for (const line of lines) {
  if (!line.startsWith('| ')) break;
  renderedRows.push(line.split('|').slice(1, -1).map(cell => cell.trim()));
}
assert.equal(renderedRows.length, 104);
for (const row of verdict.rows) {
  const rendered = renderedRows.find(cells => cells[0] === row.fixture &&
    cells[1] === row.validation.toUpperCase() && cells[2] === modeNames[row.mode]);
  assert(rendered);
  assert.deepEqual(rendered.slice(3, 8), [us(row.baseMedianMs), us(row.workingMedianMs), ci(row.paired),
    us(row.aaMagnitudeMs), us(row.regressionFloorMs)]);
  assert.equal(rendered[8], row.regression ? '회귀입니다.' : row.meaningfulGain ? '이득입니다.' :
    row.paired.high < 0 ? '음수이나 최소 크기 이내입니다.' : '회귀가 아닙니다.');
}
let links = 0, pendingSelfLinks = 0;
for (const [location, content] of [[reportPath, report], [evidencePath, evidence]]) {
  for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = path.resolve(path.dirname(location), match[1].split('#')[0]);
    if (target === path.join(directory, 'audit-report.json')) { pendingSelfLinks++; continue; }
    assert(fs.existsSync(target), 'Missing evidence: ' + target);
    links++;
  }
}
const artifactPaths = [reportPath, ...fs.readdirSync(directory).map(file => path.join(directory, file))];
const largestFile = artifactPaths.map(file => ({ file: path.relative(path.dirname(directory), file),
  bytes: fs.statSync(file).size })).sort((left, right) => right.bytes - left.bytes)[0];
assert(largestFile.bytes <= 5_000_000);
emit('audit-report.json', { HEAD, checked: new Date().toISOString(), passed: true,
  report: '../profile-117-session.md', reportSha256: hash(report), rawEvidenceSha256: hash(evidence),
  independentlyMatchedVerdictTableRows: renderedRows.length, existingEvidenceLinks: links,
  selfAuditLinksResolvedByThisNativeWrite: pendingSelfLinks, sourcePreserved: true,
  verdict: verdict.verdict, regressionRows: verdict.regressions, largestFile });
console.log('보고서의 104행 수치와 판정·원자료 링크·소스 보존을 확인했습니다.');

