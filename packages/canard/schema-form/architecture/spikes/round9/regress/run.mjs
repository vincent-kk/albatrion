/** Run every inherited harness and retain baseline/ported evidence within round9. */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const cwd = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const save = (path, text) => writeFileSync(new URL(path, import.meta.url), text);
const run = (args, status = 0) => {
  const result = spawnSync(process.execPath, args, { cwd, encoding: 'utf8' });
  assert.equal(result.status, status, `${args.join(' ')}: ${result.stderr}\n${result.stdout}`);
  return result.stdout;
};
const generated = read('../proto/loop-v5.mjs');
run(['proto/make-v5.mjs']);
assert.equal(read('../proto/loop-v5.mjs'), generated, 'model regeneration is byte-identical');
run(['regress/make-port.mjs']);
for (const dir of ['proto', 'regress', '.']) {
  for (const name of readdirSync(new URL('../' + dir + '/', import.meta.url))) {
    if (name.endsWith('.mjs')) run(['--check', `${dir}/${name}`]);
  }
}
const precheck = spawnSync(process.execPath, ['regress/precheck.mjs'], { cwd, encoding: 'utf8' });
assert.equal(precheck.status, 1);
assert.match(precheck.stderr, /Q8 removes the selection state cell/);
save('./precheck-output.txt', 'exit=1 (expected)\nAssertionError: Q8 removes the selection state cell\nactual=true expected=false\n');
run(['r9.mjs']);
run(['r9b.mjs']);
const edge = run(['regress/edge-cases.mjs']);
save('./edge-cases-output.txt', edge);
const facts = { modelRegeneration: 'byte-identical', precheck: 'expected failure', selfcheck: {}, r7: {}, r8: {} };
const changed = [
  '변경된 selfcheck 단언 (63개 실행 단언을 제거하지 않았습니다)',
  'A3-1-select → A3-1-unconditional: selection 및 동점 선택이 없어 게이트 없는 두 선언이 모두 켜집니다.',
  'A3-2 default-driven forward: base 예산 커밋은 자동 채움을 철회하여 seed 1개만 남깁니다(종전 25개).',
  'A3-2 default-driven reverse: base 예산 커밋은 자동 채움을 철회하여 seed 1개만 남깁니다(종전 25개).',
  'A4b: 중간 c 채움을 확정하지 않습니다. edge 모드의 피드백은 예산 초과 후 빈 base를 커밋하고, level 모드는 c가 없는 상태에서 t=from-undefined로 수렴합니다.',
  'A4c: 원천이 같으면 edge 모드가 발화하지 않아 host 부분 쓰기가 유지됩니다(v4e new에서도 기존 단언 실패).',
  'A4-cap: 같은 값 재기록에는 edge가 없으므로 25라운드 대신 1라운드입니다(v4e new에서도 기존 단언 실패).',
  'disableDefaultInjection → disableAutomaticWrites: 로드 억제 옵션을 명세 이름으로 이식했습니다. 기존 네 단언의 값은 같습니다.',
  '',
  'r7 관측행 변경 (원래 하니스는 단언 대신 출력 비교입니다; 아래 각 행에 이유를 붙입니다)',
];
const reasons = {
  E1: '채움은 노드 생성 때 한 번이며 뒤 라운드에서 새 default로 교체하지 않습니다.',
  E10: '선택 상태를 제거했으므로 순수 분기가 모두 켜집니다.',
  E12: '게이트 없는 조각은 모두 켜지고 두 노드 모두 생성 시 채웁니다.',
  X2: 'entry 안에서 다른 조각이 켜져도 이미 채운 raw를 교체하지 않습니다.',
  'X10/X12': '점수와 동점 스위치가 제거되어 세 역사적 입력 모두 순수 분기를 전부 켭니다.',
  X15: '최종 shape 밖의 채움 후보와 그에 의존한 주입을 철회합니다. 파생 안정 후 후보를 검토하여 5라운드에 수렴합니다.',
  X16: 'edge 모드의 채움/주입/조각 피드백은 예산 초과로 base를 커밋합니다. level 모드는 채움 전에 undefined에서 파생하여 수렴합니다.',
  XA4: '예산 초과 기본 커밋이 lastRound에서 호출자 원본 base로 바뀌었습니다.',
};
for (const mode of ['new', 'old']) {
  const baseline = run(['../round8/proto/selfcheck-v4e.mjs', mode], mode === 'new' ? 1 : 0);
  save(`./selfcheck-v4e-${mode}.txt`, baseline);
  const baselineFailures = baseline.match(/^  FAIL /gm)?.length ?? 0;
  assert.equal(baselineFailures, mode === 'new' ? 3 : 0);
  const current = run(['regress/selfcheck-v5.mjs', mode]);
  save(`./selfcheck-v5-${mode}.txt`, current);
  const passed = current.match(/^  PASS /gm)?.length ?? 0;
  assert.equal(passed, 63);
  facts.selfcheck[mode] = { baselineFailures, passed, failures: 0 };
  const port = run(['regress/r7-port.mjs', mode]);
  const before = read(`../../round8/regress/r7port-${mode}-output.txt`).split('\n');
  const after = port.split('\n');
  let section = '';
  let changedRows = 0;
  for (let i = 0; i < before.length; i++) {
    if (/^[EXD]/.test(before[i])) section = before[i].split(' ')[0];
    if (before[i] === after[i] || !/->|load \{|active |identical:/.test(before[i])) continue;
    assert.ok(reasons[section], `unclassified regression difference: ${section}`);
    changedRows++;
    changed.push(`${mode} ${section} line ${i + 1}: ${reasons[section]}\n  before: ${before[i]}\n  after:  ${after[i]}`);
  }
  assert.equal(changedRows, mode === 'new' ? 12 : 2);
  assert.match(port, /"emit":\{"a":1,"b":2\},"active":\["A","B"\]/);
  assert.match(port, /active \["A","B"\] emit \{"a":"A","b":"B","zzz":1\}/);
  facts.r7[mode] = { changedRows };
}
const r8 = run(['regress/r8-port.mjs']);
const summaries = text => text.split('\n').filter(l => l.startsWith('SUMMARY ')).map(l => JSON.parse(l.slice(8)));
const before = summaries(read('../../round8/r8-output.txt'));
const after = summaries(r8);
assert.equal(after.length, 41);
let changedSummaries = 0;
changed.push('', '추가 이식: r8의 31개 프로세스 구성, 41개 SUMMARY 행');
for (let i = 0; i < before.length; i++) {
  if (JSON.stringify(before[i]) === JSON.stringify(after[i])) continue;
  changedSummaries++;
  const row = before[i];
  const reason = row.probe === 'P1' ? 'FINAL_SHAPE=off 비교 모드에서도 최종 shape 밖의 채움 후보는 확정하지 않습니다.' :
    row.probe === 'P3' ? '기존 최종 조각 default oracle은 생성당 한 번인 v5 채움 규칙과 다릅니다.' :
      row.case.includes('X16') ? 'level 모드는 채움 전 undefined를 파생하므로 c를 생성하지 않고 수렴합니다.' :
        '후보 default를 같은 생김 기회에서 교체하지 않는 v5 규칙과 round8의 최종 default 재선택 규칙이 다릅니다.';
  const keys = Object.keys(row).filter(k => JSON.stringify(row[k]) !== JSON.stringify(after[i][k]));
  changed.push(`${row.probe} ${row.case}: ${reason} changed=${keys.join(',')}`);
  assert.ok(['P1', 'P3', 'P4'].includes(row.probe), `unexpected matrix change: ${row.probe}`);
}
assert.equal(changedSummaries, 17);
const sharedNodeRows = read('./r8port-output.txt').split('\n').filter(line => line.startsWith('R8 '))
  .map(line => JSON.parse(line.slice(3)))
  .filter(row => row.probe === 'P3' && row.case === 'N7_extra_Bon_xMissing_then_a');
assert.equal(sharedNodeRows.length, 6);
changed.push('', '검증 뒤 수정: 기존 round9 대비 변경된 단언과 관측');
changed.push('r9 P4 and-or: 비활성 y의 load raw Y → missing; NODE_GATE_UNIT=shape에서는 생성 전 채우지 않습니다. nearest의 Y는 유지합니다.');
changed.push('r8 SUMMARY 차이 개수 26 → 28: OLD/first 및 OLD/last에도 기존 노드의 재채움을 금지하므로 round8과의 차이가 추가됩니다.');
changed.push('최종 shape 후속 수정: SUMMARY 차이는 28 → 17입니다. P1 12행과 P4 X16 5행의 관측이 변경되었습니다.');
changed.push('A4b 기대값: new {c:C} → undefined, old {t:from-C} → {t:from-undefined}; 최종 shape 밖의 중간 c를 커밋하지 않습니다.');
changed.push('r7 new X15 2행: x 및 y가 없어지고 3 → 5라운드입니다. 최종 shape 밖 채움 후보와 의존 주입을 철회합니다.');
changed.push('r7 new X16 3행: level 모드는 from-undefined/2라운드, edge 두 모드는 빈 base/25라운드 budget-exceeded입니다. 채움/파생의 결합 수렴 여부를 반영합니다.');
changed.push('r8 P1 12행: iv_rawA1.y Y → missing; 파생 안정 이전의 else 조각 채움을 확정하지 않습니다.');
changed.push('r8 P4 X16 5행: edge 네 구성은 stable → budget-exceeded, level 구성은 from-C → from-undefined; 중간 채움 보존을 제거했습니다.');
for (const row of sharedNodeRows) {
  assert.equal(row.result.loadX, 'B');
  assert.equal(row.result.x, '<undefined>');
  assert.equal(row.result.equalsOracle, false);
  assert.equal(row.result.rounds, 1);
  changed.push(`r8 P3 ${row.cfg} ${row.case}: x 재채움 → missing, equalsOracle true → false; 이미 존재하는 노드의 추가 조각 활성화는 새 생성이 아닙니다.`);
}
facts.r8 = { configurations: 31, rows: read('./r8port-output.txt').split('\n').filter(l => l.startsWith('R8 ')).length,
  summaries: after.length, changedSummaries };
facts.q8 = JSON.parse(read('../r9-output.txt').trim().split('\n').at(-1)).summary;
facts.corrections = JSON.parse(read('../r9b-output.txt').trim().split('\n').at(-1)).summary;
facts.edgeCases = JSON.parse(edge).edgeCases;
save('./CHANGES.txt', changed.join('\n') + '\n');
save('./RESULTS.txt', JSON.stringify(facts, null, 2) + '\n');
console.log(JSON.stringify(facts));
