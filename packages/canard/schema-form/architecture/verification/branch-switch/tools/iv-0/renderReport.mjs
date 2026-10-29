// Deterministic report generation reads validated summary data only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { stageNames as originalStages } from '../../../design-optimization/tools/profile/branch-switch/buildBundle.mjs';
import { read } from '../b9-0/files.mjs';

const raw = path.resolve(process.argv[2]),
  output = path.resolve(process.argv[3]);
const summary = read(path.join(raw, 'summary.json'));
const format = (value, digits = 3) =>
  value === null || value === undefined ? '—' : Number(value).toFixed(digits);
const table = (headers, rows) =>
  [
    '| ' + headers.join(' | ') + ' |',
    '| ' + headers.map(() => '---').join(' | ') + ' |',
    ...rows.map((row) => '| ' + row.join(' | ') + ' |'),
  ].join('\n');
const cell = (lane) =>
  lane
    ? `${format(lane.us)} / ${format(lane.minMedianUs)}~${format(lane.maxMedianUs)}`
    : '쌍 없음';
const fraction = (numerator, denominator) =>
  denominator
    ? `${numerator}/${denominator} (${format((numerator / denominator) * 100, 2)}%)`
    : '해당 없음';
const timing = (row, variant) =>
  summary.timings.find(
    (record) => record.row === row && record.variant === variant,
  );
const stageCost = (record, mode, name) =>
  record.modes[mode].stages[name] ?? { selfUs: 0, selfNetUs: 0, calls: 0 };
const usefulCorpus = summary.corpus.reduce(
  (sum, row) => sum + row.usefulWrites,
  0,
);
const corpusWrites = summary.corpus.reduce((sum, row) => sum + row.writes, 0);
const emptyRounds = summary.rows.reduce((sum, row) => sum + row.emptyRounds, 0);
const allRounds = summary.rows.reduce((sum, row) => sum + row.rounds, 0);
const openingEmpty = summary.rows.reduce(
  (sum, row) => sum + row.emptyOpeningRounds,
  0,
);
const lines = [
  '# Ⅳ-0 — 세 레인 이정표와 국소 정착 진단',
  '',
  `제품을 바꾸지 않고 설계 Ⅳ의 기준선을 측정했습니다. 배달 코퍼스의 실제 비루트 적격은 **${fraction(usefulCorpus, corpusWrites)}**입니다. 공개 22행의 빈 호스트 라운드는 ${fraction(emptyRounds, allRounds)}이며, 그중 다음 라운드를 연 빈 변경 집합은 ${openingEmpty}건입니다.`,
  '',
  'computeNode 호출 5회는 루트 바퀴 5회가 아닙니다. oneOf-80은 루트 1회와 자식 재귀 4회이며, 정상 전환의 루트 호스트 바퀴는 이미 1라운드입니다. 루트 자체가 게이트 호스트인 oneOf-80·siblings-0에는 비루트에서 바퀴를 시작하는 것만으로 방문 범위를 줄일 여지가 없습니다.',
  '',
  '## 입력과 환경',
  '',
  table(
    ['항목', '값'],
    [
      ['L', '공개 @canard/schema-form@0.16.1'],
      ['S', summary.inputs.startCommit],
      ['E', summary.inputs.stageHead],
      ['정식 시작 UTC', summary.window.start.startedAt],
      ['정식 종료 UTC', summary.window.end.endedAt],
      [
        'Node / Bun',
        summary.inputs.environment.node +
          ' / ' +
          summary.inputs.environment.bun,
      ],
      [
        'CPU / OS',
        summary.inputs.environment.cpu +
          ' / ' +
          summary.inputs.environment.release,
      ],
      [
        'legacy 품질 비 / 판정',
        format(summary.quality.ratio, 6) +
          ' / ' +
          (summary.quality.passed ? '통과' : '실패 — 비율 판정 불가'),
      ],
      [
        '제품 변경 / dist',
        'src·manifest·빌드 설정 변경 없음; 단계 머리의 배포 해시 유지',
      ],
      [
        '배달',
        `${summary.delivery.scenes}장면·${summary.delivery.phases}단계 차이 ${summary.delivery.differences}; B12 확장 ${summary.delivery.extensionScenes}장면·${summary.delivery.extensionPhases}단계 통과`,
      ],
    ],
  ),
  '',
  '22행·레인별 10프로세스·20예열/100표본·quality=legacy를 고정했습니다. L은 S 역할 프로세스의 legacy 주 레인이며 E 역할의 legacy는 보조입니다. 무시간 스모크, 실제 CLI 각 1프로세스·1/1 예행, 새 root의 파일럿과 코디네이터 승인을 거쳤습니다. 표본 사이에는 타이밍 밖 setImmediate를 사용하고 개별 외부 PID의 3초 평균 30% 및 일반 120초/Spotlight 600초 규칙을 적용했습니다.',
  '',
  '첫 창은 mediaanalysisd 부하로 환경 실패(458C-03)했습니다. 첫 행의 6개 프로세스가 current·legacy 각 600표본을 만든 뒤 A3가 적재 전 CPU 검사에서 실패했습니다. 이 부분 표본은 [실패 기록](raw/iv-0/aborted-window-1/failure.json)과 별도 압축 원시에 보존하며 아래 새 창의 판정에 합치지 않습니다.',
  '',
  '## 1. 세 레인 — 전체 22행',
  '',
  '단위는 µs/정의된 행 표본입니다. 셀은 프로세스 최소값 10개의 중앙값 / 프로세스 중앙값의 최소~최대입니다. oneOf·branch-switch는 왕복 2쓰기, single과 구독 single은 10쓰기, siblings·leaf·bulk·wave는 1쓰기, mount는 1마운트입니다. L 쌍이 없는 행은 대신 다른 fixture의 L을 끼우지 않습니다. 1.5배 선은 기록 전용입니다.',
  '',
  table(
    ['행', 'L 0.16.1', 'S 단계 시작', 'E 설계 Ⅲ 끝', 'E/L', 'E/S', 'L×1.5'],
    summary.milestone.map((row) => [
      row.row,
      cell(row.lanes.L),
      cell(row.lanes.S),
      cell(row.lanes.E),
      format(row.endOverLegacy),
      format(row.endOverStart),
      format(row.legacyOnePointFiveUs),
    ]),
  ),
  '',
  '### 단계 장부 — 쓰기 하나',
  '',
  '각 셀은 세 프로세스의 100표본 중앙값을 다시 중앙값으로 집계한 raw self µs입니다. A(S)는 원래 단계 목록, B(E)는 B9-0 장부 목록입니다. 계측 집합과 생성 경계가 다르므로 A/B 단계 self·wrapped 총합의 비율을 만들지 않습니다. 레인 사이 비교는 위 alternate 표만 사용합니다. 개별 단계 중앙값의 합은 총시간 중앙값과 다릅니다.',
  '',
];
for (const row of summary.stages) {
  lines.push(
    '#### ' + row.row,
    '',
    table(
      ['단계', 'S 원래 단계 목록', 'E B9-0 장부 목록'],
      Object.keys(row.lanes.B.stages).map((name) => [
        name,
        name === 'everythingElse' || originalStages.includes(name)
          ? format(row.lanes.A.stages[name].selfUs.median)
          : '계측 없음',
        format(row.lanes.B.stages[name].selfUs.median),
      ]),
    ),
    '',
    `wrapped 총시간 중앙값: S ${format(row.lanes.A.totalUs.median)}, E ${format(row.lanes.B.totalUs.median)} µs.`,
    '',
  );
}
lines.push(
  '### Node/Bun 힙',
  '',
  table(
    ['런타임', 'S bytes/node', 'E bytes/node', 'S 범위', 'E 범위'],
    ['node', 'bun'].map((runtime) => {
      const a = summary.heaps[runtime].A.new,
        b = summary.heaps[runtime].B.new;
      return [
        runtime,
        format(a.bytesPerNode),
        format(b.bytesPerNode),
        `${format(Math.min(...a.samples))}~${format(Math.max(...a.samples))}`,
        `${format(Math.min(...b.samples))}~${format(Math.max(...b.samples))}`,
      ];
    }),
  ),
  '',
  '기존 장치의 5,001노드·7표본입니다. Bun은 보고용이며, 제품 dist는 finally에서 복원하고 해시를 대조했습니다.',
  '',
  '## 2. 영향 집합의 닫힘',
  '',
  '첫 수치는 비루트로 닫히는 useful입니다. 루트로 닫히는 구조적 자격과 구분합니다. 실제 branch host 변화와 순수 조상 출력 집계를 따로 기록하고, 바뀐 범위를 포함하는 최소 호스트에서 정적 바깥 의존과 제품 dependencyOwners를 확인했습니다. 무관한 외부 원천에서 들어오는 읽기는 허용하고 조상 원천·밖으로 나가는 영향·required 경계는 거절합니다. wildcard 또는 함수형 injectTo 규칙이 남으면 보수적으로 unknown입니다. 마운트는 쓰기 분모에서 제외합니다.',
  '',
  table(
    ['행', 'useful / 쓰기', '보수적 closed / 쓰기', '최소 범위', '거절 사유'],
    summary.rows.map((row) => [
      row.label,
      fraction(row.usefulWrites, row.writes),
      fraction(row.closedWrites, row.writes),
      row.scopes.map((scope) => scope || '루트').join(', ') || '—',
      JSON.stringify(row.refusalReasons),
    ]),
  ),
  '',
  '### 배달 코퍼스 — 장면별',
  '',
  table(
    ['장면', 'useful / 쓰기', '보수적 closed / 쓰기', '범위', '거절 사유'],
    summary.corpus.map((row) => [
      row.label,
      fraction(row.usefulWrites, row.writes),
      fraction(row.closedWrites, row.writes),
      row.scopes.map((scope) => scope || '루트').join(', '),
      JSON.stringify(row.refusalReasons),
    ]),
  ),
  '',
  '독립 검토 전에는 34건의 비루트 후보를 모두 거절했습니다. 들어오는 간선과 active 게이트의 거친 조상 중복 간선을 바로잡자 27건이 적격이 됐습니다. 남은 7건은 items의 control 장면에서 wildcard 의존을 확정하지 못한 거절이며 원시에 crossing-unknown과 unknown-dependency가 남습니다. single-nested-d6-f4의 40/40, nested-oneOf의 8/8은 유지됐습니다. 공유 $ref의 두 번째 이후 바인딩까지 정적 안전성을 증명한 도구는 아니므로 이 코퍼스 밖의 경로표를 이 수치만으로 출하하지 않습니다.',
  '',
  '## 3. 호출과 라운드',
  '',
  '실제 computeNode 호출을 computeId로 구별하고, 각 호스트 라운드의 parentRound·값/선택 변경 집합 크기·후속 라운드 개시 여부를 원시에 보존했습니다. 빈 종료 라운드는 고정점 확인이며 곧바로 제거 가능한 비용이 아닙니다.',
  '',
  table(
    [
      '행',
      '쓰기',
      'computeNode 호출 범위/쓰기',
      '호스트 라운드',
      '빈 라운드',
      '빈 개시 / 빈 종료',
    ],
    summary.rows.map((row) => [
      row.label,
      row.writes,
      row.computeCalls.length
        ? `${Math.min(...row.computeCalls)}~${Math.max(...row.computeCalls)}`
        : '—',
      row.rounds,
      fraction(row.emptyRounds, row.rounds),
      `${row.emptyOpeningRounds} / ${row.emptyTerminalRounds}`,
    ]),
  ),
  '',
  '## 4. 바닥의 고정·형상 분리',
  '',
  '같은 fixture의 독립 인스턴스에서 no-op, one-leaf, switch를 측정했습니다. 아래는 wrapped/unwrapped 짝의 원래 장부 경계이며 details 경계를 섞지 않습니다. 셀은 raw self / selfNetUs(µs)입니다. no-op은 관측된 고정비 대용값이며 잎·형상 증가분은 각각 one-leaf−no-op, switch−no-op의 보정값 차이입니다. 조건·경로가 달라지는 차분이므로 모두 제거 가능한 비용이라는 인과적 주장은 하지 않습니다.',
  '',
);
for (const row of ['switch-siblings-0', 'switch-oneOf-80']) {
  const records = ['noop', 'leaf', 'switch'].map((variant) =>
    timing(row, variant),
  );
  lines.push(
    '### ' + row,
    '',
    table(
      [
        '단계',
        'no-op raw/net',
        'one-leaf raw/net',
        'switch raw/net',
        '잎 Δnet',
        '형상 Δnet',
      ],
      [
        'selectChildren',
        'computeNode',
        'everythingElse',
        'markCommitDeliveries',
        'registerRecalculation',
        'evaluateGate',
        'updateOutput',
        'commitSettlement',
      ].map((name) => {
        const costs = records.map((record) =>
          stageCost(record, 'wrapped', name),
        );
        return [
          name,
          ...costs.map(
            (cost) => `${format(cost.selfUs)} / ${format(cost.selfNetUs)}`,
          ),
          format(costs[1].selfNetUs - costs[0].selfNetUs),
          format(costs[2].selfNetUs - costs[0].selfNetUs),
        ];
      }),
    ),
    '',
  );
}
lines.push(
  '## 5. 쓰기 진입·gap·finalizeExits의 소유자',
  '',
  'details는 이 절의 하위 타이머에만 사용합니다. writeFieldNode의 컨텍스트·scratch·마무리, 정착 바깥의 사슬 진입/종료·배달, finalizeExits의 pending-exit·retain·조상 재조립 루프를 추가 경계로 나눴습니다. 각 표본의 중첩 self 합과 잔여는 총시간을 보존합니다. 같은 프로세스 plain 짝과의 차이를 타이머 enter/exit 쌍 수로 나누는 B9-0 균일 보정을 쓰며 음수도 그대로 공개합니다. 자체 self는 하위 타이머를 포함하지 않습니다.',
  '',
);
for (const row of ['switch-siblings-0', 'switch-oneOf-80']) {
  const record = timing(row, 'switch');
  lines.push(
    '### ' + row,
    '',
    table(
      ['소유자', 'raw self µs', 'selfNetUs', '호출/쓰기'],
      [
        'writeFieldNode',
        'createSettlementContext',
        'getSettlementScratch',
        'releaseSettlementScratch',
        'finishSettlement',
        'startFieldNodeChain',
        'enterFieldNodeChain',
        'exitFieldNodeChain',
        'runDeliveryWaves',
        'deliverWave',
        'flushQueuedEvents',
        'everythingElse',
        'finalizeExits',
        'finalizePendingExitLoop',
        'captureDetachedFieldNodeReads',
        'visitFieldNodes',
        'registryRemoval',
        'finalizeRetainLoop',
        'retainExitedSlot',
        'createExitSlotOverlay',
        'readSlotExitPolicy',
        'finalizeAncestorCollection',
        'finalizeAncestorOutput',
        'finalizeRestoredSlotRaw',
      ].map((name) => {
        const cost = stageCost(record, 'details', name);
        return [
          name,
          format(cost.selfUs),
          format(cost.selfNetUs),
          format(cost.calls, 1),
        ];
      }),
    ),
    '',
    `짝당 추정 오버헤드 ${format(record.modes.details.perCallUs)} µs; details 총시간 ${format(record.modes.details.totalUs)}, plain ${format(record.modes.details.baselineUs)} µs.`,
    '',
  );
}
lines.push(
  '### 타이머 프로세스별 중앙값/최솟값 비',
  '',
  table(
    ['행', '변형', '반복', 'plain', 'details', 'unwrapped', 'wrapped'],
    summary.timings.flatMap((row) =>
      row.sampleRatios.map((process) => [
        row.row,
        row.variant,
        process.repeat,
        ...['plain', 'details', 'unwrapped', 'wrapped'].map((mode) =>
          format(process.modes[mode].ratio),
        ),
      ]),
    ),
  ),
  '',
  '## 6. 컨텍스트·scratch·Map/Set 생성 수',
  '',
  '단위는 쓰기당 중앙값입니다. scratch는 이미 재사용하고 있으며 컨텍스트 객체와 분리해서 셉니다. Map/Set은 PathKeyedMap/PathKeyedSet을 포함합니다. 배달 경계는 writeFieldNode가 끝난 뒤 exitFieldNodeChain까지 별도로 추적해 정착의 생성 수에 더했습니다. 일반 객체·배열 전체나 GC 바이트의 추정값은 아닙니다.',
  '',
  table(
    [
      '행',
      'context',
      'scratch 신규/재사용',
      'Map',
      'Set',
      'wheel',
      'commit',
      'delivery',
      '기타',
    ],
    summary.rows
      .filter((row) => row.writes)
      .map((row) => [
        row.label,
        row.contexts,
        `${row.scratchNew}/${row.scratchReused}`,
        row.allocations.maps,
        row.allocations.sets,
        row.allocations.wheel,
        row.allocations.commit,
        row.allocations.delivery,
        row.allocations.other,
      ]),
  ),
  '',
  '코퍼스 175건 모두 exitFieldNodeChain의 Set 생성이 1회 이상 기록됐습니다. 검토 전 delivery=0은 정착 경계 밖 관측 누락이었으며 재사용 풀의 입력으로 사용하지 않습니다.',
  '',
  '## 설계 Ⅳ 비용 모델에 돌려주는 입력',
  '',
  'Ⅳ-1의 비루트 국소 바퀴는 위의 적격 범위에만 적용됩니다. root-host oneOf-80·siblings-0에는 방문 감소의 직접 예산을 0으로 둡니다. Ⅳ-2의 “루트 5라운드” 전제는 재귀 호출과 혼동한 것이어서 철회하며, 빈 개시 라운드와 게이트 메모 가능성을 따로 검증해야 합니다. Ⅳ-3은 컨텍스트 1개와 단계별 일시 Map/Set을 겨냥하되 이미 재사용하는 scratch를 새 절감량으로 세지 않습니다. Ⅳ-5의 13.6 µs와 gap의 과거 절대값은 다른 창의 값이므로 재사용하지 않고 이 창의 하위 소유자 표를 예산 상한 입력으로 씁니다. Ⅳ-4 등록 소유자와 Ⅳ-6 조립 메모의 제거 가능성은 계측 비용에서 추정한 가설이며 제품 개선 실측이 아닙니다.',
  '',
  '채택된 이론상 단계 합 목표(siblings-0 25~40 µs, oneOf-80 60~95 µs)는 계속 기록합니다. 아래는 이 창 E의 단계 self 중앙값 합 대비 목표 비율을 같은 창 E/L 주행 비율에 곱한 보조 환산입니다. 개선 전후 계측 부담 비율이 같다는 가정이며, 실제 PR의 판정은 그 PR 창의 배포 행 E/L로 다시 합니다.',
  '',
  table(
    [
      '행',
      'E 단계 self 중앙값 합',
      '단계 목표',
      'L 대비 목표 보조 환산',
      '현재 주행 E/L',
    ],
    [
      ['switch-siblings-0', 25, 40],
      ['switch-oneOf-80', 60, 95],
    ].map(([id, lower, upper]) => {
      const stage = summary.stages.find((row) => row.row === id).lanes.B;
      const sum = Object.values(stage.stages).reduce(
        (total, value) => total + Number(value.selfUs.median),
        0,
      );
      const ratio = summary.milestone.find(
        (row) => row.row === id,
      ).endOverLegacy;
      return [
        id,
        format(sum),
        `${lower}~${upper}`,
        `${format((ratio * Number(lower)) / sum)}~${format((ratio * Number(upper)) / sum)}`,
        format(ratio),
      ];
    }),
  ),
  '',
  '## 재현과 검증',
  '',
  '원시는 [전체 표본](raw/iv-0/evidence.json.gz), [축약 CPU](raw/iv-0/cpu.json.gz), [재계산 요약](raw/iv-0/summary.json)에 있습니다. CPU의 시작 관측·프로세스별 관측·Bun 사전 관측은 모두 상위 10개 프로세스 이름/비율로 줄이고 모든 공개 JSON의 로컬 경로를 가렸습니다. checkTools, 저장소 ESLint·checkJs·Prettier, 지정 제품 build(typecheck·artifact 포함)와 package lint를 통과한 뒤 창을 열었습니다. 결과의 22행 순서·각 레인 10프로세스·100표본·PID 독립성·24개 장부·18개 세부 프로세스·self 보존·79장면과 모든 수치는 checkResults.mjs가 압축 원시에서 다시 계산합니다.',
  '',
  '```sh',
  'node packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-0/checkResults.mjs packages/canard/schema-form/architecture/verification/branch-switch/raw/iv-0',
  '```',
  '',
);
if (fs.existsSync(path.join(raw, 'provenance.json'))) {
  const provenance = read(path.join(raw, 'provenance.json'));
  lines.push(
    '## 측정·진단 출처',
    '',
    table(
      ['구분', '준비 root 식별자', '도구 기준'],
      provenance.roots.map((root) => [root.kind, root.id, root.commit]),
    ),
    '',
    provenance.note,
    '',
  );
}
if (fs.existsSync(path.join(raw, 'fca/summary.json'))) {
  const audit = read(path.join(raw, 'fca/summary.json'));
  lines.push(
    '## FCA 감사와 독립 검토',
    '',
    `패키지 전체 FCA 감사는 facts ${audit.facts.exact}/${audit.facts.covered} exact, 동일 snapshot에서 findings ${audit.findingCount}건(오류 ${audit.severities.error}·경고 ${audit.severities.warning}·정보 ${audit.severities.info})으로 ${audit.verdict}입니다. 분석은 indeterminate를 포함합니다. 확정 오류는 기존 FieldProxy↔FieldInputSlot 순환이며 제품 소스·모듈 문서·FCA 설정은 기준 머리와 같습니다. architecture는 기존 ignore 정책의 대상입니다. 측정 전용 범위를 지켜 이 기존 문제를 함께 수정하지 않았습니다. [감사 근거](raw/iv-0/fca/summary.json)를 보존했습니다.`,
    '',
    '독립 검토는 [후보 1](reviews/pr-iv-0-candidate-1-claude.md)의 P2 세 건을 수정한 뒤 [후보 2](reviews/pr-iv-0-candidate-2-claude.md)에서 P1/P2 0, PASS with P3로 확인했습니다. 배달 frame 방어와 parentRound 보존의 후속 P3는 시간 원시를 먼저 공개한 뒤 별도 커밋과 시계 없는 진단으로 확인합니다. 시간 창을 다시 열지 않습니다.',
    '',
  );
}
const document = lines.join('\n');
assert.ok(!/\/(?:Users|private\/tmp|var\/folders)\//.test(document));
if (process.argv[4] === '--check')
  assert.equal(fs.readFileSync(output, 'utf8'), document);
else fs.writeFileSync(output, document);
console.log('IV_0_REPORT_OK');
