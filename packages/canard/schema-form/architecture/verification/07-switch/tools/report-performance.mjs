import fs from 'node:fs';
import path from 'node:path';

// Run from the repository root; emits reviewable Markdown for the U13 measurement artifacts.
const verification =
  'packages/canard/schema-form/architecture/verification/07-switch';
const results = 'packages/aileron/benchmark-form/results';
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const core = read(`${results}/equivalent-2026-10-03-f08ff8451-core.json`);
const render = read(`${results}/equivalent-2026-10-03-f08ff8451-render.json`);
const costs = read(`${verification}/performance-costs.json`);
const legacy = read(`${verification}/bench-legacy-baseline.json`);
const workspace = read(`${verification}/bench-workspace-baseline.json`);
for (const data of [core, render]) {
  if (
    data.raw.length !== 19 ||
    data.warmup !== 10 ||
    data.count < 100 ||
    data.rows.some(
      (row) =>
        row.old.samples.length !== data.count ||
        row.new.samples.length !== data.count,
    )
  )
    throw new Error(`Incomplete ${data.mode} measurement`);
}
if (
  core.rows.length !== 38 ||
  render.rows.length !== 114 ||
  costs.typecheck.length !== 3
)
  throw new Error('Missing measurement rows');
const pending = '수용 대기 — 원장 관리자를 거쳐 소유자 수용 필요';
const number = (value) =>
  Number.isFinite(value)
    ? value.toFixed(value !== 0 && Math.abs(value) < 0.001 ? 6 : 4)
    : '—';
const cell = (value) => String(value).replaceAll('|', '\\|');
const issues = [];
let sequence = 26;

/** Records one independently addressable acceptance request and returns its ID. */
function addIssue(name, evidence, cause, location) {
  const id = `P-${sequence++}`;
  issues.push(
    `| ${id} | 07 U13 | ${cell(name)} | ${cell(evidence)}; [측정](./07-switch/performance.md) | ${cause} | ${location} | 정돈 단계 뒤 같은 fixture로 원인별 계측 | ${pending} |`,
  );
  return id;
}

const document = [
  `# 07 전환 U13 — 벤치와 번들 크기

측정일: 2026-10-03 KST. 시작 HEAD: \`f08ff8451\`, 이 문서와 함께 있는 미커밋 U13 하니스 변경을 적용했습니다. 설치·Git 쓰기·다른 워크트리 사용은 하지 않았습니다. 측정은 순차 실행했고 다른 테스트 묶음을 동시에 돌리지 않았습니다. 초기 하니스 진단과 중단한 코어·React 표본은 최종 통계에서 제외했습니다.

## 환경과 비교 조건

- CPU: ${core.cpu}, 10 cores, RAM 64 GiB. OS: macOS 26.6.2 (25G83), ${core.os}. Node ${core.node}, React ${render.react}, Vitest 3.2.6, rolldown 1.2.0, esbuild 0.25.9.
- 0.16.0 별칭은 registry tarball \`https://registry.npmjs.org/@canard/schema-form/-/schema-form-0.16.0.tgz\`입니다. 같은 판 번호의 workspace로 해석되는 npm alias를 피합니다. 이 tarball의 \`@winglet/*\` 의존성은 workspace에 연결됩니다. 완전히 격리된 당시 의존성 스냅숏과의 비교는 아닙니다.
- fixture 19쌍은 BF의 sample/flat/nested/array/oneOf와 array push·replace·remove, computed 이주를 다룹니다. 옛 \`computed\`/\`&if\`를 새 \`controls\`로 옮기고, 복합 sample의 \`minItems\` 초기 채움은 명시적 기본값으로 맞췄습니다. 매 상호작용 뒤 \`[data-path]:not([data-deferred])\` 집합 일치와 비어 있지 않음을 검증했습니다.
- 각 판·fixture·lane에서 워밍업 10회, 표본 100회, AB/BA 교대, 표본 사이 명시적 GC. 매 표본은 새 root지만 fixture 스키마 identity는 재사용하며 엔진의 캐시 정책을 강제로 바꾸지 않습니다. 시간 단위 ms. 중앙값은 가운데 두 값의 평균, p99는 nearest-rank입니다. 업데이트는 fixture의 **전체 상호작용 열 합계**이며 단일 입력 시간으로 오해하지 않습니다.
- 코어는 DOM 없는 Node에서 생성·초기 정착과 쓰기·루트 완료를 잽니다. workspace core 진입점을 esbuild로 번들합니다. 배포 tarball은 core를 공개 수출하지 않으므로 설치 번들의 \`nodeFromJSONSchema\`에 측정용 export만 덧붙였습니다. 구현은 변경하지 않았습니다. 반환 및 초기 루트 콜백 중 늦은 시점을 mount 완료로, 루트 onChange를 쓰기 완료로 삼습니다. polling timer는 완료 timestamp 밖이며, 각 쓰기 뒤 drain은 측정 밖입니다. 원본 JSON에 두 core 번들의 SHA-256을 기록했습니다.
- React는 개발 모드의 실제 Profiler \`actualDuration\` 합과 커밋 수를 기록합니다. mount-wall은 준비된 핸들까지의 drain을, update-wall은 각 상호작용의 2 tick 대기를 포함합니다. Profiler 행과 벽시계 행을 섞지 않습니다. validator를 주지 않고 validationMode=0으로 맞췄습니다. 초기 실행의 User Timing 누적 경고(1,000,001 measure entries)를 확인해 표본 수집 뒤 \`performance.clearMeasures()\`와 \`clearMarks()\`를 호출하고 React 전체를 다시 쟀습니다. 정리는 측정 구간 밖입니다.
- TEST-026/027/072/073 판정: 표본별 처리량(1000/ms)의 평균이 15% 넘게 감소하고 Welch 양측 p<0.05이면 수용 대기입니다. 중앙값·p99 배율 자체는 별도 합격선이 아닙니다. 커밋 수는 진단이며 시간 게이트가 아닙니다. 27라운드의 95:5 추정이나 이전 단계 수용을 새 행의 수용으로 간주하지 않습니다.

## 명령

모든 명령은 이 워크트리에서 실행했습니다. BF = \`packages/aileron/benchmark-form\`, PKG = \`packages/canard/schema-form\`, V7 = \`PKG/architecture/verification/07-switch\`입니다. npx는 설치를 막는 \`--no-install\`을 사용했습니다.

| 위치 | 명령 | 용도 |
| --- | --- | --- |
| PKG | \`npx --no-install rolldown -c\` | dist 런타임 빌드 |
| BF | \`npx --no-install vitest run --reporter=dot equivalent\` | fixture 19쌍 검증 |
| BF | \`node --expose-gc --import tsx src/index.ts --equivalent --mode=core --min-samples=100 --out=results/equivalent-2026-10-03-f08ff8451-core.json\` | 코어 |
| BF | \`node --expose-gc --import tsx src/index.ts --equivalent --mode=render --min-samples=100 --out=results/equivalent-2026-10-03-f08ff8451-render.json\` | React 19 Profiler |
| PKG | \`npx --no-install vitest bench --config vitest.bench.config.ts --run --outputJson architecture/verification/07-switch/bench-workspace-baseline.json\` | 일곱 패키지 벤치 |
| PKG | \`npx --no-install vitest run --project render --reporter=dot\` | jsdom 프로젝트 시간 |
| PKG | \`npx --no-install vitest run --project unit --project render --reporter=dot\` | 최종 회귀 검사 |
| PKG | \`npx --no-install esbuild@0.25.9 dist/index.mjs --bundle --minify --format=esm --packages=external --outfile=architecture/verification/07-switch/.performance/index.min.mjs\` | 의존성 외부, minify |
| PKG | \`gzip -9 -c architecture/verification/07-switch/.performance/index.min.mjs\` | minify gzip 바이트 수 |
| PKG | \`gzip -9 -c dist/index.mjs\` | minify 없는 gzip 바이트 수 |
| PKG | \`npx --no-install tsc --noEmit --composite false --rootDir . -p tsconfig.json\` (3회) | **typecheck** |

명령 벽시계는 단조 시계로 subprocess 시작 전부터 종료 뒤까지 잰 값입니다. 패키지 벤치의 옛 기준은 \`3911b7591\`의 [보존 JSON](bench-legacy-baseline.json)이며, 그 커밋의 환경을 이번 환경과 동일하다고 가정하지 않습니다.
`,
];

for (const [title, data] of [
  ['코어', core],
  ['React 19 / jsdom', render],
]) {
  const metrics = data.rows
    .map((row) => row.metric)
    .filter((metric, index, all) => all.indexOf(metric) === index);
  for (const metric of metrics) {
    document.push(
      `## ${title}: ${metric}\n\n| fixture | 옛 중앙값 | 새 중앙값 | 새/옛 | 옛 p99 | 새 p99 | p99 새/옛 | 처리량 감소 % | Welch p | 판정 |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |`,
    );
    for (const row of data.rows.filter((row) => row.metric === metric)) {
      let verdict = metric.startsWith('commits')
        ? '커밋 수 관측'
        : '게이트 선 안';
      if (row.regression) {
        const id = addIssue(
          `${metric} / ${row.fixture}`,
          `중앙값 ${number(row.old.median)}→${number(row.new.median)} ms (${number(row.ratio)}×), 처리량 −${number(row.throughputDrop)}%, p=${row.p.toExponential(3)}`,
          metric.startsWith('core')
            ? '미분리: 새 청사진·정착·배달의 비용; 이 측정만으로 인과 귀속하지 않음'
            : '미분리: 새 바인딩·노드 생성·구독과 React 작업; 벽시계는 drain 포함',
          '`benchmark-form/fixtures/equivalent/`, core 및 React 바인딩',
        );
        verdict = `${id}: ${pending}`;
      }
      document.push(
        `| ${row.fixture} | ${number(row.old.median)} | ${number(row.new.median)} | ${number(row.ratio)} | ${number(row.old.p99)} | ${number(row.new.p99)} | ${number(row.p99Ratio)} | ${number(row.throughputDrop)} | ${row.p === null ? '—' : row.p.toExponential(3)} | ${verdict} |`,
      );
    }
    document.push('');
  }
}

document.push(
  `## 패키지 벤치 — 보존 기준선 대 새 core\n\n일곱 파일 모두 새 core 진입점을 사용합니다. 독립 실행 스크립트 네 개는 Vitest bench 수집에서 제외했습니다. 생성·분기·find·쓰기 행의 옛 이름을 행 대응 키로 보존하고 describe는 blueprint/load/settle/dispatch/navigation으로 바꿨습니다. compute-recalculate는 옛 내부 계산기 단독 호출에서 공개 쓰기·정착으로 범위가 넓어졌으므로 순수 속도 회귀로 해석하지 않습니다. render-delay의 clone 두 행은 역사적 대조군이며 새 엔진 측정이 아닙니다. validation on은 mode flag만 켠 것으로 validator 컴파일을 포함하지 않습니다. event/object 행은 옛 drain을 유지합니다.\n\n옛 JSON에는 개별 samples가 비어 있어 처리량 Welch를 재구성할 수 없습니다. 처리량 감소가 15%를 넘는 행을 보수적으로 수용 대기에 올리되 통계 판정은 미확정입니다. 같은 실행의 BF 비교가 정식 옛/새 게이트입니다.\n`,
);
const packageSamples = workspace.files.flatMap((file) =>
  file.groups.flatMap((group) =>
    group.benchmarks.map((benchmark) => benchmark.sampleCount),
  ),
);
document.push(
  `패키지 벤치는 보존 기준선과 같은 Vitest/Tinybench 시간 기반 설정을 쓰며 파일 실행은 직렬로 고정했습니다. 새 sampleCount는 ${Math.min(...packageSamples)}–${Math.max(...packageSamples)}회입니다. BF의 100표본 조건과 구분하며, 작은 표본의 p99는 특히 불안정합니다.\n`,
);
for (const file of workspace.files.filter((file) => file.groups.length)) {
  const basename = path.basename(file.filepath);
  const oldFile = legacy.files.find(
    (candidate) => path.basename(candidate.filepath) === basename,
  );
  document.push(
    `### ${basename}\n\n| 행 | 옛 중앙값 ms | 새 중앙값 ms | 새/옛 | 옛 p99 ms | 새 p99 ms | 처리량 감소 % | 판정 |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |`,
  );
  for (let groupIndex = 0; groupIndex < file.groups.length; groupIndex++) {
    const group = file.groups[groupIndex];
    const oldGroup =
      basename === 'render-delay.bench.ts'
        ? oldFile?.groups.find(
            (candidate) =>
              candidate.fullName.split(': ').at(-1) ===
              group.fullName.split(': ').at(-1),
          )
        : oldFile?.groups[groupIndex];
    for (const current of group.benchmarks) {
      const old = oldGroup?.benchmarks.find(
        (candidate) => candidate.name === current.name,
      );
      if (!old)
        throw new Error(
          `Unmatched legacy benchmark: ${basename}/${current.name}`,
        );
      const ratio = current.median / old.median;
      const drop = (1 - current.hz / old.hz) * 100;
      const scope = basename.startsWith('compute') ? '측정 범위 확대; ' : '';
      const label = `${group.fullName.split(' > ').at(-1)} / ${current.name}`;
      let verdict = `${scope}기술 비교, Welch 재구성 불가 (표본 ${old.sampleCount}/${current.sampleCount})`;
      if (drop > 15) {
        const id = addIssue(
          `package ${basename}: ${label}`,
          `중앙값 ${number(old.median)}→${number(current.median)} ms (${number(ratio)}×), 처리량 −${number(drop)}%; 보존 표본 부재로 Welch 미확정`,
          `${scope}미분리: 새 core 비용과 실행 환경 차이`,
          '`schema-form/bench/`',
        );
        verdict = `${id}: ${pending} (${scope}통계 미확정)`;
      }
      document.push(
        `| ${cell(label)} | ${number(old.median)} | ${number(current.median)} | ${number(ratio)} | ${number(old.p99)} | ${number(current.p99)} | ${number(drop)} | ${verdict} |`,
      );
    }
  }
  document.push('');
}

document.push(
  '## 번들 크기\n\n| 방법 | 기준 B | 새 B | 새/옛 | 차이 B | 판정 |\n| --- | ---: | ---: | ---: | ---: | --- |',
);
for (const [name, baseline, current] of [
  ['esbuild minify + gzip -9', 37023, costs.minifiedGzip],
  ['minify 없는 gzip -9', 51632, costs.plainGzip],
]) {
  const id =
    current > baseline
      ? addIssue(
          name,
          `${baseline.toLocaleString('en-US')}→${current.toLocaleString('en-US')} B (${number(current / baseline)}×)`,
          '확인: 새 엔진·바인딩을 포함하는 산출물 증가; 모듈별 기여는 미분리',
          '`dist/index.mjs`',
        )
      : null;
  document.push(
    `| ${name} | ${baseline.toLocaleString('en-US')} | ${current.toLocaleString('en-US')} | ${number(current / baseline)} | ${current - baseline} | ${id ? `${id}: ${pending}` : '증가 없음'} |`,
  );
}
document.push(
  `\n## typecheck / 프로젝트 실행 시간\n\n| 측정 | 옛 | 새 | 새/옛 | 판정 |\n| --- | --- | --- | --- | --- |\n| typecheck 3회 중앙값 | 보존 표본 없음 | ${number(costs.typecheckMedianSeconds)} s | — | GOAL-088 비용 기록, 각 종료 코드 ${costs.typecheck.map((row) => row.exit).join('/')} |\n| jsdom render 프로젝트 벽시계 | 같은 suite 기준선 없음 | ${number(costs.renderSeconds)} s | — | ${cell(costs.renderSummary)} |\n\ntypecheck 각 실행: ${costs.typecheck.map((row) => `${number(row.seconds)} s (exit ${row.exit})`).join(', ')}.\n\n최종 unit+render: ${costs.finalSummary}. fixture equivalent: ${costs.equivalentSummary}. ${costs.typecheckNote ?? ''}\n\n## CI와 해석 범위\n\n현재 performance-benchmarks.yml은 특정 JSON/커밋 기준선을 고정하지 않습니다. warn-only 회귀 스크립트는 최신 bench-v2와 앞선 이력 창을 사용합니다. 따라서 이 작업에서 고정값 치환은 없으며 새 패키지 기준선은 [bench-workspace-baseline.json](bench-workspace-baseline.json)에 보존했습니다. 과다 렌더 기존 sibling=0 단언을 느슨하게 바꾸지 않았습니다.\n\n모바일(TEST-074): 모바일 장치·브라우저·CPU 제한 조건은 이번에 측정하지 않았습니다. 데스크톱 jsdom 결과로 필드/배열 모바일 안전 임계나 개선 배율을 주장하지 않습니다.\n\n수용 필요 행은 아래 ${issues.length}건입니다. 수용은 아직 받지 않았습니다. 새 시간 행과 번들 증가를 기존 단계의 수용에 합치지 않습니다.\n\n${issues.map((line) => `- ${line.split(' | ')[1]}: ${line.split(' | ')[3]}`).join('\n')}\n`,
);

console.log(
  JSON.stringify({
    performance: document.join('\n'),
    issues: issues.join('\n'),
    issueCount: issues.length,
  }),
);
