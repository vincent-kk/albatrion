/** Render measured rows, denominators, trace explanations and exact implementation anchors. */
import { readFileSync, writeFileSync } from 'node:fs';
const read = name => readFileSync(new URL(name, import.meta.url), 'utf8');
const lines = read('./r10-output.txt').trim().split('\n');
const rows = lines.filter(line => line.startsWith('ROW ')).map(line => JSON.parse(line.slice(4)));
const summaries = lines.filter(line => line.startsWith('SUMMARY ')).map(line => JSON.parse(line.slice(8)));
const verify = JSON.parse(read('./verification.txt'));
const policy = JSON.parse(read('./policy-check-output.txt'));
const at = (file, text) => read(file).split('\n').findIndex(line => line.includes(text)) + 1;
const value = encoded => encoded.missing ? 'missing' : JSON.stringify(encoded.value);
const raw = row => Object.entries(row.raw).map(([path, v]) => path + '=' + value(v)).join(', ');
const find = criteria => rows.find(row => Object.entries(criteria).every(([key, v]) =>
  key in row.switches ? row.switches[key] === v : row[key] === v));
const pick = { CLEAR_PRIORITY: 'clear-wins', WRITE_CONFLICT: 'inject-wins',
  LOSER_FATE: 'dropped', EDGE_CONSUMED_ON_LOSS: true, LOAD_EDGE_CLEAR: 'held', variant: 'forward' };
const out = [
  'ROUND 10 — 같은 대상 경합 및 load clear 에지 실험',
  '',
  '근거: reviews/round-10-spec.md §1.3의 항목 8·9·21 및 §2입니다.',
  '목적은 후보 정책별 예산 초과, 설명 없는 쓰기 손실, 순서 의존성을 측정하는 것입니다.',
  '정책 채택 여부는 판단하지 않습니다. 전체 결과는 r10-output.txt의 META/ROW/SUMMARY 행입니다.',
  '',
  '파일과 재현',
  'r10.mjs — 고정 프로브와 48조합, 관측/손실 감사/집계입니다.',
  'r10-output.txt — 2,904개 ROW 및 집계 SUMMARY입니다.',
  'proto/make-v6.mjs — round9의 loop-v5/build-v5를 읽어 정확 문자열 치환 8개로 파생합니다.',
  'proto/runtime-v6.inc.txt — 실험 후보 큐/경합/소비/추적의 정본입니다.',
  'proto/loop-v6.mjs, proto/build-v6.mjs — 위 스크립트가 생성한 파생 모델입니다.',
  '원본 직접 import나 byte-identical 사본이 아니라, 요청된 새 스위치를 추가한 파생본을 사용합니다.',
  'EXPERIMENT=false이면 원본 v5 실행 경로이며 WRITE_CONFLICT=last 등 round9 기본값을 유지합니다.',
  'verify.mjs, verification.txt, round9-manifest.txt — 재생성/반복/호환성/원본 보존 증거입니다.',
  'round9-readonly.mjs, round9-run/ — 원본 round9 하니스의 쓰기를 round10으로 보내는 preload와 실행 산출물입니다.',
  'compat/ — EXPERIMENT=false로 실행한 r9/r9b의 import 경로 치환 사본 및 출력입니다.',
  'precheck.mjs — 원본 v5의 CLEAR_PRIORITY 부재를 확인하는 예상 실패입니다.',
  'policy-check.mjs, policy-check-output.txt — 정책 효과를 값으로 검증하는 별도 10개 단언입니다.',
  'write-report.mjs, REPORT.txt, PLAN.txt — 보고서 생성기, 보고서, 범위/해석 기록입니다.',
  '재현: node proto/make-v6.mjs; node r10.mjs; node policy-check.mjs; node verify.mjs; node write-report.mjs',
  '새 의존성을 설치하지 않았습니다. Node.js v26.8.2 및 round9와 같은 설치된 AJV를 사용합니다.',
  '',
  '스위치 및 구현 위치',
  '| 키 | 실험값 | 위치 |',
  `| EXPERIMENT | false: round9 경로, matrix: true | proto/make-v6.mjs:${at('./proto/make-v6.mjs', "EXPERIMENT: false")} |`,
  `| CLEAR_PRIORITY | clear-wins / clear-loses | proto/runtime-v6.inc.txt:${at('./proto/runtime-v6.inc.txt', 'function experimentPriority')} |`,
  '| WRITE_CONFLICT | 기존 first/last는 비실험 경로에 보존; 실험은 inject-wins / derived-wins / declaration-order | 같은 experimentPriority |',
  `| LOSER_FATE | dropped / requeued | proto/runtime-v6.inc.txt:${at('./proto/runtime-v6.inc.txt', 'const retry =')} |`,
  `| EDGE_CONSUMED_ON_LOSS | true / false | proto/runtime-v6.inc.txt:${at('./proto/runtime-v6.inc.txt', 'const consumed =')} |`,
  `| LOAD_EDGE_CLEAR | rising / held | proto/runtime-v6.inc.txt:${at('./proto/runtime-v6.inc.txt', 'const previous = state.clearSeen')} |`,
  `| 선언 전순서 | body < allOf < then/else < oneOf/anyOf, 각 종류는 소스 순서 | proto/build-v6.mjs:${at('./proto/build-v6.mjs', 'function declarationOrder')} |`,
  '',
  '실험 의미의 고정 조건',
  '- ROUND_CAP=25, COMMIT_ON_BUDGET=base, NODE_GATE_UNIT=shape, LOAD_EDGE=fire입니다.',
  '- 원천 값 변화로 만든 규칙별 후보를 한 번 소비합니다. 첫 후보는 v5의 entry/load 에지 검사에서 얻고, 같은 settle 안의 후속 후보는 직전 계산 라운드와의 값 변화에서 얻습니다.',
  '- 승자는 소비하며, 적용 후 다음 라운드에 후보가 없다는 이유로 쓰기를 철회하지 않습니다. 이는 round9의 반복 entry 후보 조정과 구분되는 실험 경로입니다.',
  '- dropped는 패배한 쓰기 제안을 그 라운드에서 버립니다. requeued는 같은 값 스냅샷을 다음 라운드에 다시 후보로 넣습니다.',
  '- EDGE_CONSUMED_ON_LOSS=false인 패배 injectTo는 에지가 남으므로 dropped여도 다음 라운드에 다시 제안합니다. 같은 규칙을 이중 큐잉하지 않습니다.',
  '- 새 원천 에지가 도착하면 같은 규칙의 오래된 대기 후보를 대체합니다. derived/clear 패자의 소비는 true로 고정하며, requeued는 별도로 후보를 보존합니다.',
  '- 경합은 매 라운드의 실제 후보 사이에서만 해결합니다. 이전 라운드의 승자보다 우선순위가 낮아도, 그 승자가 소비된 뒤 단독 재제출된 후보는 쓸 수 있습니다.',
  '- 같은 종류의 후보끼리는 뒤 선언이 이깁니다. category별 전위 순회이며, properties 및 예약 키의 삽입 순서, allOf/branches 배열 순서를 보존합니다. then이 else보다 앞이고 oneOf가 anyOf보다 앞입니다.',
  '- 프로브는 함수 표현식과 스칼라 값을 사용합니다. 중첩 schema의 일반 병합이나 비동기 에지는 측정하지 않았습니다.',
  '- held도 새 노드의 clearWas=false에서 시작하는 최초 true load는 지웁니다. 참을 유지한 reset/full replace에서 다시 지우지 않는 것이 rising과의 차이입니다.',
  '- P6은 LOAD_EDGE_CLEAR=rising인 24조합만 실행하고 load/reset/replace 모두 disableAutomaticWrites=true입니다.',
  '',
  '집계 단위',
  'outcome은 load 또는 사용자 작업 한 번 뒤 커밋된 settle 하나입니다. 스케줄별 독립 트리의 load도 각각 셉니다.',
  'silentWriteLosses는 그 outcome의 커밋 raw에 도달하지 않은 caller/author 제안 중 기록된 규칙 설명이 없는 건수입니다.',
  '명시적 loser drop, 새 원천 에지의 대체, 뒤 라운드의 쓰기, 작성자 예약 쓰기의 caller 값 덮기, 예산 base 복원은 설명된 손실입니다.',
  '중간 staged 쓰기는 커밋 도달로 세지 않습니다. 같은 값은 값 동등성으로 판정하며 함수의 외부 부수효과는 계측하지 않습니다.',
  '순서 비교는 같은 최종 caller 입력의 pair/c-next/idle 결과에서 raw와 status를 비교합니다. 중간 first/load에는 null을 기록합니다.',
  '스케줄 그룹에서 하나라도 batch와 다르면 비교 가능한 그룹의 각 outcome을 scheduleDependent로 셉니다. 쌍의 개수와 다릅니다.',
  'P7 pair의 동일 스케줄/반대 선언 순서를 declarationDependent로 셉니다. orderDependent는 두 지표의 합이 아니라 OR입니다.',
  '스위치별 표는 다른 축을 합친 주변 집계입니다. 행끼리 중복되므로 합산할 수 없으며 인과효과의 독립 추정치도 아닙니다.',
  '',
  '스위치 값별 측정',
  '| 스위치 | 값 | outcomes | budget | silent losses | explained losses | schedule 의존/비교 | 선언 의존/비교 | order 의존 |',
];
for (const s of summaries.filter(s => s.scope === 'switch')) out.push(`| ${s.key} | ${s.value} | ${s.outcomes} | ${s.budgetExceeded} | ${s.silentWriteLosses} | ${s.explainedWriteLosses} | ${s.scheduleDependent}/${s.scheduleComparable} | ${s.declarationDependent}/${s.declarationComparable} | ${s.orderDependent} |`);
out.push('', '프로브별 측정', '| 프로브 | outcomes | budget | silent losses | order 의존 |');
for (const s of summaries.filter(s => s.scope === 'probe')) out.push(`| ${s.probe} | ${s.outcomes} | ${s.budgetExceeded} | ${s.silentWriteLosses} | ${s.orderDependent} |`);
out.push('', 'P1 — 같은 대상, 순환 없음 (각 행은 clear-wins/held의 대표 조합입니다)',
  '| WRITE_CONFLICT | LOSER_FATE | edge consumed | batch | a→b | b→a |');
for (const priority of ['inject-wins', 'derived-wins', 'declaration-order']) for (const fate of ['dropped', 'requeued']) for (const consumed of [true, false]) {
  const c = { ...pick, probe: 'P1', step: 'pair', WRITE_CONFLICT: priority, LOSER_FATE: fate, EDGE_CONSUMED_ON_LOSS: consumed };
  out.push(`| ${priority} | ${fate} | ${consumed} | ${raw(find({ ...c, schedule: 'batch' }))} | ${raw(find({ ...c, schedule: 'left-right' }))} | ${raw(find({ ...c, schedule: 'right-left' }))} |`);
}
out.push('', 'P2/P3 — clear 경합의 batch 결과 (inject-wins/held 대표 조합)', '| CLEAR_PRIORITY | LOSER_FATE | edge consumed | P2 batch | P3 batch |');
for (const clear of ['clear-wins', 'clear-loses']) for (const fate of ['dropped', 'requeued']) for (const consumed of [true, false]) {
  const c = { ...pick, step: 'pair', schedule: 'batch', CLEAR_PRIORITY: clear, LOSER_FATE: fate, EDGE_CONSUMED_ON_LOSS: consumed };
  out.push(`| ${clear} | ${fate} | ${consumed} | ${raw(find({ ...c, probe: 'P2' }))} | ${raw(find({ ...c, probe: 'P3' }))} |`);
}
out.push('', 'P4 — 패자 재생 및 다음 c 에지 (clear-wins/inject-wins/held, batch)', '| LOSER_FATE | consumed | a,c batch | c만 다음 입력 | 무관한 note 입력 |');
for (const fate of ['dropped', 'requeued']) for (const consumed of [true, false]) {
  const c = { ...pick, probe: 'P4', schedule: 'batch', LOSER_FATE: fate, EDGE_CONSUMED_ON_LOSS: consumed };
  out.push(`| ${fate} | ${consumed} | ${raw(find({ ...c, step: 'pair' }))} | ${raw(find({ ...c, step: 'c-next' }))} | ${raw(find({ ...c, step: 'idle' }))} |`);
}
out.push('', 'P5/P6 — true 조건의 load/reset/full replace', '| 프로브 | LOAD_EDGE_CLEAR | load | reset | replace |');
for (const [probe, edge] of [['P5', 'rising'], ['P5', 'held'], ['P6', 'rising']]) {
  const c = { ...pick, probe, LOAD_EDGE_CLEAR: edge, schedule: 'load-reset-replace' };
  out.push(`| ${probe} | ${edge} | ${raw(find({ ...c, step: 'load' }))} | ${raw(find({ ...c, step: 'reset' }))} | ${raw(find({ ...c, step: 'replace' }))} |`);
}
const p7 = summaries.find(s => s.scope === 'P7-final-raw-exceptions');
out.push('', 'P7 — 경합 승자와 최종 raw의 구분',
  'declaration-order의 첫 라운드 승자는 forward에서 derived, reverse에서 injectTo로 모두 반전했습니다.',
  'inject-wins/derived-wins는 선언 순서를 바꿔도 첫 승자와 최종 raw가 유지됐습니다.',
  `다만 declaration-order의 batch 최종 raw가 반전하지 않는 조합은 ${p7.count}개입니다. 모두 dropped + EDGE_CONSUMED_ON_LOSS=false입니다.`,
  'forward에서 진 injectTo가 다음 라운드에 재시도되어 I:2를 쓰고, reverse에서도 injectTo가 이겨 I:2를 씁니다.',
  '따라서 “모든 조합에서 최종 커밋 raw가 뒤집힌다”는 P7 기대는 관측상 성립하지 않습니다. 경합 승자 반전 검사만 통과한 것을 최종 raw 반전으로 보고하지 않습니다.');
for (const id of p7.rows) out.push(id + ': 첫 승자는 반대이지만 최종 /t="I:2"로 같습니다; 소비되지 않은 injectTo 패자가 재시도됩니다.');
out.push('', 'P8 — 추가 순환 프로브',
  'a→t와 t→a가 각각 +1을 주입하며 t에는 flag 기반 clear가 있습니다. load와 flag=false/a=2/t=2 batch를 실행했습니다.',
  '96 outcome 모두 25라운드 budget-exceeded이며 base를 커밋했습니다. P1–P7에서는 예산 초과가 없었습니다.',
  '이 수치는 고정된 프로브와 위 이벤트 소비 모델의 결과이며, 다른 스키마의 종료성을 주장하지 않습니다.',
  '',
  '검증',
  `모델 재생성: ${verify.generatedByteIdentical}; matrix 두 실행 byte-identical: ${verify.matrixByteIdentical}.`,
  `matrix ${verify.matrix.checks}개 단언, 선언 category 순서 ${verify.layerChecks}개 단언, 별도 정책 ${policy.assertions}개 단언이 통과했습니다.`,
  'EXPERIMENT=false의 r9/r9b 출력은 round9의 기존 출력과 바이트 단위로 같습니다.',
  `원본 round9/regress/run.mjs를 ${verify.round9.invocations}회 실행했습니다. exit=${verify.round9.exit}.`,
  `preload로 생성 파일 쓰기/후속 읽기를 round10/round9-run에 보냈으며 round9 ${verify.round9.filesUnchanged}개 파일의 목록/내용 SHA-256이 실행 전후 같습니다.`,
  '원본 회귀: v5 selfcheck 각 63 PASS, Q8 108, 정정 52, 경계 26 단언; 원본 v4e new의 기존 3 FAIL은 하니스가 기대한 비교 기준입니다.',
  `matrix SHA-256: ${verify.matrixSha256}`,
  '',
  '특이 행별 이유',
  '다음 기준 중 하나를 만족하는 ROW를 각각 한 줄로 기록합니다: 예산 초과, 순서 의존, 패자 재시도가 최종 값을 씀, held 최초 load 지움, 설명 없는 손실.',
);
for (const row of rows) {
  const reasons = [];
  if (row.status === 'budget-exceeded') reasons.push('P8의 값 증가 순환이 25라운드 내 멈추지 않아 caller base를 커밋했습니다');
  if (row.batchVsSequential) reasons.push('batch의 같은 라운드 경합과 순차 입력의 별도 에지 처리가 다른 최종 값에 도달했습니다');
  if (row.declarationOrderDifferent) reasons.push('선언 순서가 첫 경합 및 후속 후보 처리 순서를 바꿨습니다');
  if (row.attempts.some(attempt => !attempt.won && attempt.retry && row.offers.some(offer => offer.id === attempt.offer &&
    offer.appliedRound > attempt.round && JSON.stringify(offer.value) === JSON.stringify(row.raw[offer.target])))) reasons.push('패자 후보가 후속 라운드에 단독으로 재제출되어 최종 값을 썼습니다');
  if (row.probe === 'P5' && row.step === 'load' && row.switches.LOAD_EDGE_CLEAR === 'held') reasons.push('최초 clearWas=false에서 true가 되어 held도 최초 load는 지웁니다');
  if (row.silentWriteLosses) reasons.push('추적에서 설명하지 못한 미커밋 쓰기가 있습니다');
  if (reasons.length) out.push(row.id + ': ' + reasons.join('; ') + '.');
}
writeFileSync(new URL('./REPORT.txt', import.meta.url), out.join('\n') + '\n');
console.log(JSON.stringify({ reportLines: out.length, outcomes: rows.length, p7FinalRawExceptions: p7.count }));
