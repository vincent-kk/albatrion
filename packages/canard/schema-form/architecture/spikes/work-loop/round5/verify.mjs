import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const base = fileURLToPath(new URL('../../../../', import.meta.url));
const require = createRequire(import.meta.url);
const ts = require('typescript');
const report = readFileSync(base + 'architecture/reviews/raw-round5-cost.md', 'utf8');
const evidence = JSON.parse(readFileSync(new URL('./evidence.json', import.meta.url), 'utf8'));
const expected = { D1_retain: 14, D4_explicit: 7, D5_default_off: 8, D6_namespace_or_binding: 59, D9_remove: 3, D10_debounce_helper: 6, common_two_phase: 26 };
let citations = 0;
for (const [group, rows] of Object.entries(evidence)) {
  assert.equal(rows.reduce((sum, row) => sum + (row.count ?? 1), 0), expected[group], group);
  assert.equal(new Set(rows.map(r => r.file + ':' + r.line)).size, rows.length, group);
  for (const row of rows) {
    const path = base + row.file;
    assert.ok(existsSync(path), row.file);
    const text = readFileSync(path, 'utf8');
    const ast = ts.createSourceFile(row.file, text, ts.ScriptTarget.Latest, true, row.file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    let found = false;
    function visit(n) {
      if (ts.isCallExpression(n) && n.arguments.length >= 2 && ts.isStringLiteralLike(n.arguments[0]) && /^(it|test)(\.|$)/.test(n.expression.getText(ast))) {
        const line = ast.getLineAndCharacterOfPosition(n.getStart(ast)).line + 1;
        if (line === row.line && n.arguments[0].text === row.title) found = true;
      }
      ts.forEachChild(n, visit);
    }
    visit(ast);
    assert.ok(found, row.file + ':' + row.line + ' title');
    assert.ok(report.includes(row.file + ':' + row.line), 'report citation');
    assert.ok(report.includes(row.title.replaceAll('|', '\\|')), 'report title');
    citations++;
  }
}
const results = JSON.parse(readFileSync(new URL('./results.json', import.meta.url), 'utf8'));
assert.equal(results.results.length, 21);
for (const result of results.results) {
  assert.equal(result.samples_us.length, 9);
  assert.equal([...result.samples_us].sort((a,b) => a-b)[4], result.median_us);
  assert.ok(report.includes(result.median_us.toFixed(3)) || ['guards-A','guards-B','defaults-on','previous-absence'].includes(result.case), result.case);
}
const files = execFileSync('rg', ['--files', 'src'], { cwd: base, encoding: 'utf8' }).trim().split('\n').sort();
const h = createHash('sha256');
for (const file of files) h.update(file).update(readFileSync(base + file));
const hash = h.digest('hex');
assert.equal(hash, results.source_sha256, 'source changed');
for (let n = 1; n <= 10; n++) assert.ok(report.includes(`### D-${n} —`));
const tableRows = report.split('\n').filter(l => /^\| D-\d+ \|/.test(l));
assert.equal(tableRows.length, 24);
console.log(JSON.stringify({ status: 'verified', evidenceCitations: citations, groupCounts: expected, optionRows: tableRows.length, measurements: 21, source_sha256: hash }));
