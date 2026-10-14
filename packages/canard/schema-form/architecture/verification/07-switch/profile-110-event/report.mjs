// Artifact audit only; runtime tests use differential.mjs and do not inspect product text.
// The host persists emitted artifacts with the native file-editing tool.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const out = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(out, '../../../../../../..');
const HEAD = '4d4792307dd4f0545b2fef3c2dd7a4860588c8cd';
const read = (name) => fs.readFileSync(path.join(out, name), 'utf8');
const json = (name) => JSON.parse(read(name));
const sha = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const emit = (name, text) => {
  if (Buffer.byteLength(text) > 5_000_000) throw new Error('Artifact too large: ' + name);
  console.log('NATIVE_ARTIFACT ' + JSON.stringify({ file: path.join(out, name), text }));
};

// Preserve the malformed exit-record output, then reconstruct only its summary.
// Its intact metadata and the separately persisted complete differential remain evidence.
const probeName = 'probe-e1-production-working.json';
const probeText = read(probeName);
let probe;
try {
  probe = JSON.parse(probeText);
} catch {
  const split = probeText.indexOf('  "summary":');
  if (split < 0) throw new Error('Probe metadata missing');
  const prefix = probeText.slice(0, split).replace(/,\s*$/, '');
  probe = JSON.parse(prefix + '\n}');
  const diff = json('diff-e1-production-working.json');
  if (probe.exitCode !== 0 || !probe.natural || diff.updates !== 10262) {
    throw new Error('Probe recovery lacks completed differential evidence');
  }
  emit('probe-e1-production-working-truncated.txt', probeText);
  probe.summary = [
    'EVENT110_DIFF_OK e1/production/working: 128 cases, 10262 updates, 15110 listeners',
  ];
  probe.reconstructedSummary = true;
  probe.originalRecordSha256 = sha(probeText);
  probe.evidence = 'summary 출력에 중첩된 전체 차분이 들어가 JSON 끝이 잘렸습니다. 원문을 보존하고 정상 종료 메타데이터와 별도 완전한 차분 기록으로 요약만 복원했습니다. 시간 표본은 변경하지 않았습니다.';
  emit(probeName, JSON.stringify(probe, null, 2) + '\n');
}

const aa = json('AA-summary.json');
const d1 = json('1-d1-commit-membership-summary.json');
const e1 = json('2-e1-update-value-summary.json');
const phases = [aa, d1, e1];
const required = ['name', 'mode', 'pooledMedianMs', 'ci99Ms', 'aaStatisticMs', 'baseMedianMs', 'floorMs', 'verdict'];
for (const x of [d1, e1]) {
  for (const key of required) if (!(key in x)) throw new Error('Missing summary field: ' + key);
}
if (!d1.adopted || e1.adopted) throw new Error('Unexpected verdict');
if (d1.builds.working.bundleSha256 !== e1.builds.head.bundleSha256) {
  throw new Error('Cumulative measured base differs');
}
const rawNames = fs.readdirSync(out).filter((n) => /^(AA|1-d1-commit-membership|2-e1-update-value)-forced-.+-r[1-9]\.json$/.test(n));
if (rawNames.length !== 378) throw new Error('Expected 378 fresh timing processes');
const rows = rawNames.map(json);
let pairs = 0;
let majorGcInClock = 0;
for (const x of rows) {
  if (!x.freshProcess || x.warmup !== 20 || x.samples !== 101 || !x.forcedGCOutsideClock) {
    throw new Error('Protocol differs in ' + x.name + '/' + x.mode);
  }
  if (x.pairedDeltasMs.length !== 101 || x.windows.length !== 202) {
    throw new Error('Missing sample/window');
  }
  pairs += x.pairedDeltasMs.length;
  for (let i = 0; i < x.windows.length; i += 2) {
    const first = ((i / 2) & 1) === 0 ? x.firstOrder : x.firstOrder === 'head' ? 'working' : 'head';
    if (x.windows[i].version !== first || x.windows[i + 1].version === first) {
      throw new Error('H/W order did not alternate');
    }
  }
  for (const gc of x.gc) {
    if (gc.kind !== 4) continue;
    for (const window of x.windows) {
      if (gc.start >= window.begin && gc.start < window.end) majorGcInClock++;
    }
  }
}
if (majorGcInClock !== 0) throw new Error('Major GC occurred inside clock');
let previousEnd = 0;
for (const phase of phases) {
  if (phase.processes.length !== 126 || phase.rows.length !== 14) throw new Error('Missing run or row');
  for (const p of phase.processes) {
    if (p.status !== 0 || p.signal !== null || p.elapsedMs >= 480_000 || p.started < previousEnd) {
      throw new Error('Process overlap, forced stop, or deadline');
    }
    previousEnd = p.ended;
  }
}

const build = json('1-d1-commit-membership-build-working.json');
const mismatches = [];
for (const [file, expected] of Object.entries(build.sources)) {
  if (sha(fs.readFileSync(path.join(root, file))) !== expected) mismatches.push(file);
}
if (mismatches.length) throw new Error('Final product differs from tested D1: ' + mismatches.join(', '));
const restored = [];
for (const [file, expected] of Object.entries(json('2-e1-update-value-base.json').files)) {
  const abs = path.join(root, file);
  const equal = expected === null ? !fs.existsSync(abs) : fs.readFileSync(abs, 'utf8') === expected;
  if (!equal) throw new Error('Rejected E1 was not restored: ' + file);
  restored.push({ file, equalsMeasuredBase: true });
}
const diffD1 = json('diff-d1-production-working.json');
const diffE1 = json('diff-e1-production-working.json');
for (const x of [diffD1, diffE1]) {
  if (x.cases.length !== 128 || x.updates !== 10262 || x.listenerCalls !== 15110 || !x.natural) {
    throw new Error('Differential coverage incomplete');
  }
}
const extra = ['sample-0', 'flat-100', 'flat-500', 'nested-d5-f4', 'oneOf-40'];
const corpus = diffD1.cases.filter((x) => !x.subscribed && !extra.includes(x.label));
const constructionErrors = corpus.filter((x) => x.error).length;
const checks = ['development', 'production', 'typecheck', 'lint', 'legacy'].map((n) => json('check-' + n + '.json'));
for (const x of checks) {
  if (!x.natural || x.signal !== null || x.elapsedMs >= 480_000 || x.exitCode !== (x.name === 'development' ? 1 : 0)) {
    throw new Error('Unexpected final command result');
  }
}
const allowedFailures = checks[0].summary.filter((line) => line.startsWith(' FAIL'));
if (allowedFailures.length !== 4 || allowedFailures.some((line) => !line.includes('EVENT-070'))) {
  throw new Error('Unallowed development failure');
}
if (read('cache-before.json') !== read('cache-after.json')) throw new Error('Repository cache changed');
const processNames = fs.readdirSync(out).filter((n) => n.includes('-process-pair-') && n.endsWith('.json'));
const recovered = processNames.map((file) => ({ file, ...json(file) })).filter((x) => x.reconstructed);
const manifests = ['1-d1-commit-membership-files.json', '2-e1-update-value-files.json'].map(json);
const sizes = fs.readdirSync(out).map((file) => ({ file, bytes: fs.statSync(path.join(out, file)).size }));
if (sizes.some((x) => x.bytes > 5_000_000)) throw new Error('Existing artifact exceeds 5 MB');
const audit = {
  HEAD,
  result: 'D1 채택, E1 기각 후 완전 복원',
  design: aa.design,
  protocol: {
    phaseOrder: ['AA HEAD/HEAD', 'D1 HEAD/D1', 'E1 D1/D1+E1'],
    rowsPerPhase: 14,
    runsPerRow: 9,
    freshProcesses: rows.length,
    pooledPairs: pairs,
    warmup: 20,
    samples: 101,
    sampleOrderAlternates: true,
    forcedGcOutsideClock: true,
    majorGcInClock,
    processRecordsSequential: true,
    maxTimingWorkerElapsedMs: Math.max(...rows.map((x) => x.elapsedMs)),
    reconstructedEndBounds: recovered.map(({ file, elapsedMs, endIsConservativeAuditUpperBound, evidence }) => ({
      file, elapsedMs, endIsConservativeAuditUpperBound, evidence,
    })),
    noMeasurementSamplesRepeatedOrRemoved: true,
  },
  finalProduct: {
    sourceCount: Object.keys(build.sources).length,
    sourceTreeSha256: build.sourceTreeSha256,
    bundleSha256: build.bundleSha256,
    sourceHashMismatches: mismatches,
    rejectedE1Restored: restored,
  },
  differential: {
    corpusSchemas: corpus.length,
    validSchemasUpdated: corpus.length - constructionErrors,
    sameConstructionErrorsAsHead: constructionErrors,
    corpusUpdatesBothListenerModes: corpus.reduce((n, x) => n + x.updates, 0) * 2,
    combinationsPerChange: diffD1.cases.length,
    updatesPerChange: diffD1.updates,
    listenerCallsPerChange: diffD1.listenerCalls,
    assertions: diffD1.assertions,
    everyNodeListenerForms: diffD1.cases.filter((x) => x.subscribed && extra.includes(x.label)),
    brokenVariants: ['probe-d1-production-broken.json', 'probe-e1-production-broken.json'].map(json),
    reconstructedE1ProbeSummary: !!probe.reconstructedSummary,
  },
  patches: manifests,
  finalCommands: checks.map(({ name, command, exitCode, natural, signal, elapsedMs, summary }) => ({
    name, command, exitCode, natural, signal, elapsedMs,
    summary: summary.filter((line) => /^( FAIL| Test Files|      Tests|LEGACY_ISOLATED)/.test(line)),
  })),
  cache: { observedFiles: json('cache-after.json').length, unchanged: true, cacheDirSet: false },
  repository: {
    gitWrites: false,
    installs: false,
    bundleAndMapDirectory: '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles',
    unrelatedPreservedChange: 'packages/canard/schema-form/architecture/verification/07-switch/profile-108-ratios.md',
  },
  artifacts: {
    maximumExistingBytes: Math.max(...sizes.map((x) => x.bytes)),
    allExistingFilesUnder5MB: true,
  },
  harnessCorrections: [
    '첫 차분 실행은 매 업데이트마다 모든 과거 사건을 재비교하는 검증 부담으로 420초 자체 마감에서 종료했습니다. 참조 중복은 즉시 검사하고 전체 사건 내용은 마지막에 검사하도록 검증 하네스만 고쳤습니다. 업데이트와 단언 범위는 유지했으며 이후 각 후보 전체 차분은 약 32초에 정상 종료했습니다.',
    'E1 sample-0/later 8회의 종료 기록 stdout이 잘렸습니다. 시간 파일의 101쌍을 보존하고 exit 0 증거로 종료 메타데이터를 복원했습니다. 7회의 메타데이터 덮어쓰기는 원래 시간 파일 및 다음 순차 프로세스 시작 시각으로 복원했습니다. 두 종료 시각은 보수적 상한이며 표본 재실행·제외는 없습니다.',
    'measure.mjs의 프로세스 메타데이터 출력 지점을 exit에서 beforeExit로 바꾸어 stdout이 완전히 배출되게 했습니다. 시간창과 측정 함수는 그대로 유지했습니다.',
    'E1 정상 차분의 probe 요약 JSON 끝 잘림은 원문 보존 후 완전한 별도 차분 및 정상 종료 메타데이터로 복원했습니다.',
  ],
};

const number = (x) => x.toFixed(6);
const interval = (x) => '[' + number(x[0]) + ', ' + number(x[1]) + ']';
const mode = (x) => ({ mount: '마운트', first: '첫 업데이트', later: '이후 업데이트' })[x];
const table = (x) => [
  '| 행 | 풀링 짝차이 중앙값(ms) | 99% 구간(ms) | A/A 통계(ms) | 기반 중앙값(ms) | 회귀 문턱(ms) | 판정 |',
  '| --- | ---: | --- | ---: | ---: | ---: | --- |',
  ...x.rows.map((r) => '| ' + r.name + ' / ' + mode(r.mode) + ' | ' + number(r.pooledMedianMs) + ' | ' + interval(r.ci99Ms) + ' | ' + number(r.aaStatisticMs) + ' | ' + number(r.baseMedianMs) + ' | ' + number(r.floorMs) + ' | ' + r.verdict + ' |'),
].join('\n');
const report = [
  '# 110차 EVENT-007 D1·E1 검증',
  '',
  'HEAD 4d4792307을 기준으로 같은 세션에서 A/A → D1 → E1 순서로 실행했습니다. D1만 채택하고 E1은 회귀 판정 후 소스·소유 DETAIL·추가 테스트를 측정 기반과 바이트 단위로 복원했습니다. 최종 제품은 D1 측정 후보의 498개 입력 소스 해시와 전부 같습니다.',
  '',
  '## 측정과 판정',
  '',
  '105C-01 및 최소 크기 부록의 14개 행을 각 9회씩 새 프로세스에서 측정했습니다. 강제 GC와 스키마 준비는 시계 밖이고, warmup 20회 뒤 101개의 H/W 쌍 순서를 표본마다 번갈아 실행했습니다. 총 378개 프로세스·38,178쌍이며 측정 중 major GC는 0회입니다. 빈 시계 101회 전·후 교정, 64회 microtask 확인 및 FIFO setImmediate 종결 조건을 기존 도구에서 유지했습니다.',
  '',
  '차이는 H−W로 양수가 개선입니다. 909쌍을 풀링한 중앙값의 bootstrap 1,999회(seed 101) 99% 구간을 사용합니다. 개선은 구간 전체 > 0이고 중앙값 > 해당 A/A 통계인 행이 하나 이상일 때입니다. 회귀는 구간 전체 < 0이고 |중앙값| > max(|A/A 통계|, 기반 중앙값의 0.5%)일 때이며 하나라도 있으면 기각합니다. 아래 값은 소수 여섯 자리로 표시하며 판정은 JSON의 원래 정밀도로 합니다.',
  '',
  '### A/A: HEAD 대 HEAD',
  '',
  table(aa),
  '',
  '### D1: 기존 membership 재사용 — 채택',
  '',
  '전역 상태 후보를 먼저, 추가 후보 중 기존 membership에 없는 후보를 다음으로 한 번씩 방문합니다. 모든 리비전 증가 뒤에 배달합니다. 속도 비용은 O(G+C) 순회와 추가 후보 membership 검사이며 두 번째 ordered Set의 생성·복사를 제거합니다. 메모리 비용은 합집합 크기에 비례하는 임시 Set 한 개를 없애고 순회 iterator 두 개만 사용합니다. 상주 필드·캐시를 추가하지 않았습니다. 소유 settle/DETAIL.md의 비용 설명을 먼저 고쳤습니다.',
  '',
  table(d1),
  '',
  'oneOf-40 이후 업데이트 +0.014500ms [0.011041, 0.017959]가 A/A +0.011499ms를 넘습니다. flat-500·nested-d5-f4 이후 업데이트도 개선이며 회귀 행은 없습니다. 기반은 HEAD이고 패치는 이 기반에 대한 독립 변경입니다.',
  '',
  '[채택 패치](1-d1-commit-membership.patch) · [파일 목록](1-d1-commit-membership-files.json) · [요약 JSON](1-d1-commit-membership-summary.json)',
  '',
  '### E1: UpdateValue 리터럴·대입 특화 — 기각·복원',
  '',
  '실험 후보는 UpdateValue를 고정 비트 리터럴·대입 경로로 특화하고 다른 사건은 일반 경로에 유지했습니다. 속도 비용은 표시당 O(1) 비트 분기이며 가변 키 표 생성 대신 고정 키를 사용합니다. 메모리 비용은 배달 객체와 정의된 payload/options 표의 할당 수를 유지하고 추가 상주 필드·캐시는 없습니다. runtime 집합·pendingRevision 비트와 이미 전달한 사건·표를 재사용하지 않는 조건을 유지했습니다. 소유 record/DETAIL.md를 먼저 수정했고 기각 뒤 해당 문서도 복원했습니다.',
  '',
  table(e1),
  '',
  '최선 행 oneOf-40 이후 업데이트는 +0.011666ms [0.008708, 0.015583]입니다. 그러나 flat-100 이후 업데이트 −0.000708ms [−0.001458, −0.000084]는 구간 전체가 음수이고 크기가 회귀 문턱 0.000378ms를 넘어서 기각했습니다. 기반은 채택된 D1이며 아래 패치는 재현용 기각 기록입니다. 최종 제품에는 포함하지 않았습니다.',
  '',
  '[기각 실험 패치](2-e1-update-value-rejected.patch) · [파일 목록](2-e1-update-value-files.json) · [요약 JSON](2-e1-update-value-summary.json)',
  '',
  '## 런타임 차분과 고장 주입',
  '',
  '제품 소스 텍스트를 읽거나 파싱하는 테스트를 사용하지 않았습니다. 원본 14개·경계 45개인 59개 스키마를 HEAD와 후보에서 실행했습니다. 35개는 업데이트했고 24개는 HEAD와 동일한 구성 오류를 단언했습니다. 코퍼스의 무구독·전 노드 구독 모드에서 424개 업데이트를 실행했습니다. 다섯 측정 폼을 더하면 후보별 128개 조합·10,262개 업데이트·15,110개 리스너 호출입니다. flat-500의 501개 노드 전부와 nested-d5-f4의 1,365개 노드 전부에 리스너를 붙인 폼도 포함합니다.',
  '',
  '실제 deliveryChanges 쓰기, runtime.deliveries 삽입, revisionLedger 쓰기와 changedNodes clear를 관찰하여 배달 대상 집합·방문 순서·모든 리비전 증가 후의 리스너 호출·changedNodes·payload/options를 HEAD와 비교했습니다. 이미 건넨 사건·표의 참조 재사용과 이후 내용 변경도 검사했습니다. D1 전체 차분 32.423초, E1 전체 차분 32.203초로 정상 통과했습니다.',
  '',
  '- D1 수정 전: 순서 테스트는 통과하고 비어 있지 않은 Set 복사 개수 테스트는 1 대 0으로 실패했습니다. 수정 후 2개 사례가 통과했습니다. membership 중복 제거를 고의로 끈 변형은 순서 단위 테스트에서 7회 대 4회 방문으로 실패하고 전체 차분도 첫 코퍼스 사례에서 실패했습니다.',
  '- E1 수정 전: 3개 특성화 사례가 통과했습니다. 수정 후 D1의 2개를 포함한 5개가 통과했습니다. UpdateValue의 pendingRevision 증가를 고의로 끈 변형은 2개 단위 사례와 전체 차분의 첫 코퍼스 사례에서 실패했습니다.',
  '',
  '[D1 차분](diff-d1-production-working.json) · [E1 차분](diff-e1-production-working.json) · [D1 고장 패치](d1-broken-variant.patch) · [E1 고장 패치](e1-broken-variant.patch) · [D1 고장 결과](probe-d1-production-broken.json) · [E1 고장 결과](probe-e1-production-broken.json)',
  '',
  '## 실행 기록의 보정',
  '',
  'E1 sample-0 이후 업데이트 7·8회의 종료 메타데이터는 복원 기록입니다. 8회 stdout 잘림 및 복원 중 7회 메타데이터 덮어쓰기가 있었으나 원래 101쌍 시간 파일은 그대로 유지했습니다. 각각 다음 순차 프로세스 시작 시각과 감사 시각으로 종료 상한을 잡았습니다. 8회의 원래 worker 경과는 640ms이며 요약 maxWorkerMs 131,092ms는 보수적 종료 상한입니다. 실제 시간 worker의 최대 경과는 ' + audit.protocol.maxTimingWorkerElapsedMs + 'ms입니다. 재측정·표본 제외는 없었습니다. 이후 메타데이터 출력은 beforeExit에서 stdout을 배출하도록 바꾸었고 시계는 바꾸지 않았습니다.',
  '',
  '초기 차분은 누적 과거 사건을 매 업데이트마다 비교하는 검증 부담 때문에 420초 자체 마감에서 종료했습니다. 하네스의 중복 비교를 줄이고 참조 검사는 즉시, 전체 내용 검사는 끝에서 실행하여 모든 시나리오와 단언을 유지했습니다. E1 정상 차분 probe 요약의 JSON 끝 잘림도 [원문](probe-e1-production-working-truncated.txt)을 보존하고 별도 완전한 차분·정상 종료 메타데이터로 복원했습니다. 모든 실행은 자체 종료했으며 8분을 넘은 단일 명령은 없습니다.',
  '',
  '## 최종 패키지 검증',
  '',
  '명령은 PKG에서 설치 없이 로컬 npx를 사용하고 순차 실행했습니다. Vitest에는 runner config loader, cache false, 단일 worker·파일 직렬 실행만 추가했고 cacheDir은 설정하지 않았습니다. production 명령에는 패키지 스크립트와 같이 NODE_ENV=production을 환경으로 내보냈습니다.',
  '',
  '| 명령 | 결과 | 자체 종료 경과 |',
  '| --- | --- | ---: |',
  ...checks.map((x) => '| ' + (Array.isArray(x.command) ? x.command.join(' ') : x.command) + ' | ' + (x.name === 'development' ? '448파일·3,265사례 통과, 허용 EVENT-070 4사례 실패, todo 1' : x.name === 'production' ? '9파일·20사례 통과' : x.name === 'legacy' ? '1659파일 격리 통과' : 'exit 0') + ' | ' + (x.elapsedMs / 1000).toFixed(3) + '초 |'),
  '',
  '개발 검증의 실패는 render·react18 각각 Form.effectFeedback의 useLayoutEffect·useEffect 두 EVENT-070 사례이며 watchdog 201 대 <200입니다. 그 외 실패는 없습니다. 기존 저장소 캐시 186개 파일의 크기·mtime은 실행 전후 같습니다. 번들·소스맵은 지정한 저장소 밖 bundles 경로에만 생성했습니다. 설치·git 쓰기·버전 변경은 없습니다.',
  '',
  '작업 중 별도로 변경된 profile-108-ratios.md는 원복하거나 이번 패치에 넣지 않고 보존했습니다. 제품 입력 소스 해시가 D1 측정 후보와 같은 것을 확인했으므로 문서 변경이 최종 구현을 바꾸지는 않았습니다.',
  '',
  '[최종 감사 JSON](final-audit.json) · [개발 검증 로그](check-development.txt) · [production 로그](check-production.txt) · [타입 검사](check-typecheck.json) · [lint](check-lint.json) · [legacy 검사](check-legacy.json)',
  '',
].join('\n');
emit('report.md', report);
emit('final-audit.json', JSON.stringify(audit, null, 2) + '\n');
console.log('EVENT110_REPORT_OK D1 adopted, E1 rejected/restored; 378 workers, 38178 pairs');
