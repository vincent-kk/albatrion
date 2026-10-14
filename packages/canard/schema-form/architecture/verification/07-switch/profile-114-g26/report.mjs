// Read-only report assembly from the designated G26 measurement artifacts.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const evidenceDirectory = path.dirname(directory);
const head = 'af3cd579b892393de3693f737afe68cfce3993f8';
const fixtures = ['sample-0', 'sample-1', 'sample-2', 'sample-3',
  'flat-50', 'flat-100', 'flat-500', 'nested-d3-f4', 'nested-d5-f4',
  'array-100', 'array-500', 'array-1000', 'oneOf-5', 'oneOf-10', 'oneOf-20',
  'array-push-100', 'array-replace-200', 'array-push-remove-100',
  'computed-visible-derived'];
const metrics = ['render-mount-wall', 'render-update-wall', 'profiler-mount',
  'profiler-update', 'commits-mount', 'commits-update'];
const updateOwners = ['sample-0', 'sample-1', 'sample-2', 'sample-3',
  'nested-d3-f4', 'nested-d5-f4', 'array-100', 'array-500',
  'computed-visible-derived'];
const mountOwners = ['sample-2', 'sample-3', 'nested-d3-f4', 'nested-d5-f4',
  'computed-visible-derived'];
const roundMarks = {
  update: '소유자 수용(104라운드)',
  bf: '소유자 수용(104라운드), 같은 원인',
  mount: '소유자 수용(108라운드), 원인: 청사진 분석의 첫 비용',
  first: '소유자 수용(110라운드), 원인: 첫 갱신의 1회 비용',
};
const fixed = (n, digits = 3) => n.toFixed(digits);
const bytes = n => n.toLocaleString('en-US');
const json = name => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
const source = name => fs.readFileSync(path.join(evidenceDirectory, name), 'utf8');
const cells = line => line.split('|').slice(1, -1).map(cell => cell.trim());
const quantile = (values, p) => values.toSorted((a, b) => a - b)[Math.ceil(values.length * p) - 1];
const median = values => quantile(values, 0.5);
const table = (headers, rows) => [
  `| ${headers.join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`,
  ...rows.map(row => `| ${row.map(cell => String(cell).replaceAll('|', '&#124;')).join(' | ')} |`),
].join('\n');
const branch = fixture => fixture.startsWith('oneOf-');

/** Validate each fresh worker and its paired process lifecycle evidence. */
function workers(lane, fixture) {
  const records = { HEAD: [], '0.16.0': [] };
  for (const run of [1, 2, 3]) {
    const pair = json(`pair-${lane}-${fixture}-r${run}.json`);
    assert.equal(pair.head, head);
    assert.equal(pair.fixture, fixture);
    assert.equal(pair.run, run);
    assert.equal(pair.lane, lane);
    assert.equal(pair.equivalent, true);
    assert.deepEqual(pair.order, run === 2 ? ['HEAD', '0.16.0'] : ['0.16.0', 'HEAD']);
    assert(pair.seconds < 480);
    for (const worker of pair.workers) {
      assert.equal(worker.exit, 0);
      assert.equal(worker.signal, null);
      assert(worker.seconds < 220);
    }
    for (const version of ['0.16.0', 'HEAD']) {
      const record = json(`react-${lane}-${fixture}-r${run}-${version}.json`);
      assert.equal(record.head, head);
      assert.equal(record.fixture, fixture);
      assert.equal(record.run, run);
      assert.equal(record.version, version);
      assert.equal(record.environment.lane, lane);
      assert.equal(record.environment.warmup, 20);
      assert.equal(record.environment.samples, 101);
      assert.equal(record.environment.validation, 'off');
      assert.equal(record.environment.ajvMs, 0);
      assert.equal(record.environment.profiling, true);
      assert.equal(record.environment.schemaClone, true);
      assert.equal(record.environment.gcOutsideClock, true);
      assert.equal(record.environment.esbuildExit.code, 0);
      assert.equal(record.environment.esbuildExit.signal, null);
      for (const metric of metrics) {
        assert.equal(record.timing[metric].length, 101);
        assert(record.timing[metric].every(n => Number.isFinite(n) && n >= 0));
      }
      assert(record.timing['commits-mount'].every(n => n > 0));
      if (lane === 'phases') {
        for (const operation of ['mount', 'update']) {
          assert.equal(record.phases[operation].length, 101);
          assert(record.phases[operation].every(row => Object.entries(row)
            .filter(([name]) => !name.startsWith('react-'))
            .reduce((sum, [, value]) => sum + value, 0) > 0));
        }
      }
      records[version].push(record);
    }
    assert.deepEqual(records.HEAD.at(-1).observations, records['0.16.0'].at(-1).observations);
  }
  return records;
}

/** Assemble the current report without mutating source or measurement files. */
export function buildReport() {
  const sections = [];
  let current;
  for (const line of source('profile-111-final.md').split('\n')) {
    if (line.startsWith('## ')) current = { title: line.slice(3), rows: [] };
    const c = cells(line);
    if (line.startsWith('|') && c.length === 10 && ['off', 'on'].includes(c[1])) {
      if (!sections.includes(current)) sections.push(current);
      current.rows.push(c);
    }
  }
  assert.deepEqual(sections.map(section => section.rows.length), [46, 46, 16]);
  const paired = {};
  for (const line of source('profile-113-paired.md').split('\n')) {
    const c = cells(line);
    if (!line.startsWith('|') || !c[0]?.includes('/')) continue;
    assert(!paired[c[0]]);
    if (c.length === 6) {
      const flags = [...c[2].matchAll(/ (통|실)(?=\s*·|$)/g)].map(match => match[1]);
      assert.equal(flags.length, 3);
      paired[c[0]] = { result: `${c[4]} · ${flags.join('/')}`, noise: c[1], pass: c[4] === '통과' };
    } else {
      assert.equal(c.length, 4);
      assert(c[3].endsWith('→ 통'));
      paired[c[0]] = { result: '통과 · 통/통/통', noise: `${c[1].split('→').at(-1).trim()} / ${c[2]}`, pass: true };
    }
  }
  assert.equal(Object.keys(paired).length, 104);
  const operationIds = { '마운트': 'mount', 'BF 갱신': 'update', '첫 갱신': 'update-first', '이후 갱신': 'update-later' };
  const axisIds = { 'BF 갱신': 'axis-update', '첫 갱신': 'axis-first', '이후 갱신': 'axis-later' };
  const core = sections.flatMap((section, sectionIndex) => section.rows.map(c => {
    const row = [...c];
    const id = `${c[0]}/${c[1]}/${sectionIndex === 2 && c[2] !== '마운트' ? axisIds[c[2]] : operationIds[c[2]]}`;
    assert(paired[id], id);
    row[5] = paired[id].result;
    row[6] = paired[id].noise;
    if (updateOwners.includes(c[0]) && c[2] !== '마운트') row[9] = roundMarks.update;
    if (c[0] === 'flat-50' && c[2] === 'BF 갱신') row[9] = roundMarks.bf;
    if (mountOwners.includes(c[0]) && c[2] === '마운트') row[9] = roundMarks.mount;
    if (['flat-50', 'flat-100'].includes(c[0]) && c[2] === '첫 갱신') row[9] = roundMarks.first;
    assert(row[9] === '—' || Object.values(roundMarks).includes(row[9]));
    return { id, sectionIndex, row, pairedPass: paired[id].pass };
  }));
  assert.equal(core.length, 108);
  for (const [mark, count] of [[roundMarks.update, 27], [roundMarks.bf, 1], [roundMarks.mount, 5], [roundMarks.first, 2]]) {
    assert.equal(core.filter(row => row.row[9] === mark).length, count);
  }
  assert(core.filter(item => !['oneOf-', 'if-then'].some(prefix => item.row[0].startsWith(prefix)))
    .filter(item => item.row[8] === '미달').every(item => item.row[9].startsWith('소유자 수용(')));

  const plain = Object.fromEntries(fixtures.map(fixture => [fixture, workers('plain', fixture)]));
  const phaseWorkers = Object.fromEntries(fixtures.filter(branch).map(fixture => [fixture, workers('phases', fixture)]));
  const phaseRows = fixtures.filter(branch).flatMap(fixture => ['mount', 'update'].map(operation => {
    const data = Object.fromEntries(['0.16.0', 'HEAD'].map(version => {
      const rows = phaseWorkers[fixture][version].flatMap(record => record.phases[operation]);
      const coreValues = rows.map(row => Object.entries(row).filter(([name]) => !name.startsWith('react-'))
        .reduce((sum, [, value]) => sum + value, 0));
      return [version, {
        render: median(rows.map(row => row['react-render'] ?? 0)),
        commit: median(rows.map(row => row['react-commit'] ?? 0)),
        layer: median(rows.map(row => (row['react-render'] ?? 0) + (row['react-commit'] ?? 0))),
        core: median(coreValues), ajv: 0,
      }];
    }));
    const ratio = data.HEAD.layer / data['0.16.0'].layer;
    return { fixture, operation, old: data['0.16.0'], current: data.HEAD, ratio, met: ratio <= 1 };
  }));
  const reactRows = metrics.flatMap(metric => fixtures.map(fixture => {
    const pooled = Object.fromEntries(['0.16.0', 'HEAD'].map(version => {
      const values = plain[fixture][version].flatMap(record => record.timing[metric]);
      assert.equal(values.length, 303);
      return [version, { median: median(values), p99: quantile(values, 0.99),
        runs: plain[fixture][version].map(record => median(record.timing[metric])) }];
    }));
    const ratio = pooled.HEAD.median / pooled['0.16.0'].median;
    const operation = metric.endsWith('mount') || metric === 'render-mount-wall' ? 'mount' : 'update';
    const diagnostic = metric.startsWith('commits-');
    const target = diagnostic ? 1 : operation === 'mount' ? 1.2 : 1;
    const phaseRow = branch(fixture) && !diagnostic ? phaseRows.find(row => row.fixture === fixture && row.operation === operation) : undefined;
    const met = phaseRow ? phaseRow.met : ratio <= target;
    return { fixture, metric, old: pooled['0.16.0'], current: pooled.HEAD, ratio, target,
      basis: phaseRow ? '분기 React 층' : diagnostic ? '커밋 횟수 진단' : 'React 시간',
      phaseRatio: phaseRow?.ratio, met, owner: met ? '—' : '소유자 판단 필요' };
  }));
  const ownerRows = reactRows.filter(row => !row.met);
  assert.equal(reactRows.length, 114);
  assert.equal(ownerRows.length, 26);
  assert(phaseRows.every(row => row.met));
  const bundle = json('bundle.json');
  assert.deepEqual(bundle.esm.legacyModules, []);
  assert.deepEqual(bundle.cjs.legacyModules, []);
  assert.equal(bundle.esbuildExit.code, 0);
  assert.equal(bundle.esbuildExit.signal, null);
  assert.equal(bundle.minifyGzip.baseline, 37023);
  assert.equal(bundle.plainGzip.baseline, 51632);
  for (const result of [bundle.minifyGzip, bundle.plainGzip]) {
    assert.equal(result.exit, 0);
    assert.equal(result.signal, null);
  }
  const typecheck = json('typecheck.json');
  assert.equal(typecheck.runs.length, 3);
  assert(typecheck.runs.every(run => run.exit === 0));
  assert.equal(median(typecheck.runs.map(run => run.seconds)), typecheck.medianSeconds);
  const packageBench = JSON.parse(source('bench-82c01-residual-baseline.json'));
  const packageRows = packageBench.files.flatMap(file => file.groups.flatMap(group => group.benchmarks.map(bench => ({
    file: file.filepath.split('/packages/canard/schema-form/').at(-1),
    group: group.fullName.split(' > ').at(-1), name: bench.name,
    median: bench.median, p99: bench.p99, count: bench.sampleCount,
  }))));
  assert.equal(packageRows.length, 44);
  const breakdown = Object.entries(bundle.breakdown.modules.reduce((groups, module) => {
    const parts = module.source.split('/src/').at(-1).split('/');
    const name = parts[0] === 'core' ? parts.slice(0, 2).join('/') : parts[0];
    groups[name] = (groups[name] ?? 0) + module.bytes;
    return groups;
  }, {})).toSorted((a, b) => b[1] - a[1]);
  assert.equal(breakdown.reduce((sum, [, size]) => sum + size, 0) + bundle.breakdown.wrapperAndSeparatorsBytes, bundle.esm.rawBytes);
  const environments = Object.values(plain).flatMap(versions => Object.values(versions).flat()).map(record => record.environment);
  const start = environments.map(env => env.startedAt).toSorted()[0];
  const end = environments.map(env => env.endedAt).toSorted().at(-1);
  const maxPairSeconds = Math.max(...fs.readdirSync(directory).filter(name => name.startsWith('pair-') && name.endsWith('.json')).map(name => json(name).seconds));
  const environment = plain['sample-0'].HEAD[0].environment;
  const summary = {
    head, environment, start, end, maxPairSeconds,
    core: { displayed: core.length, unique: Object.keys(paired).length,
      pairedPass: core.filter(row => row.pairedPass).length,
      pairedFail: core.filter(row => !row.pairedPass).map(row => row.id),
      acceptance: Object.fromEntries(Object.values(roundMarks).map(mark => [mark, core.filter(row => row.row[9] === mark).length])) },
    react: { rows: reactRows, ownerRows, phaseRows,
      metrics: metrics.map(metric => {
        const rows = reactRows.filter(row => row.metric === metric);
        return { metric, minimumRatio: Math.min(...rows.map(row => row.ratio)), maximumRatio: Math.max(...rows.map(row => row.ratio)),
          met: rows.filter(row => row.met).length, notMet: rows.filter(row => !row.met).length };
      }) },
    bundle, typecheck, packageBenchRows: packageRows.length,
  };

  const report = [];
  const add = text => report.push(text);
  add('# G26 성능 보고서');
  add(`대상은 stage-07의 HEAD \`${head}\`와 공개판 0.16.0입니다. 비분기·식 전용 폼은 85C-01·86C-01 기준으로 코어 마운트·갱신 중앙값 ≤1.5×, React production profiling 마운트 ≤1.2×·갱신 ≤1.0×를 적용합니다. oneOf·if/then은 91라운드의 분기 기준 ①·②·③을 적용하고, React 층은 코어를 제외한 render+commit 몫 ≤1.0×를 적용합니다. AJV 몫은 기록만 합니다. [G26 원장](../../../../../../.seiri/tasks/schema-form-switch/gates.md)의 보고 요건과 성능 수용은 별도로 판정합니다.`);
  add(`React ${reactRows.length}행 중 ${ownerRows.length}행은 **소유자 판단 필요**입니다. 분기 기준 ①은 **소유자 답 기다림(분기 기준 ① 고침의 범위와 시기)**이고, 기준 ②의 반복 장부도 해결된 상태가 아닙니다. 따라서 이 보고서는 분기 종합 충족이나 전체 성능 수용을 선언하지 않습니다. 코어 수용 표시는 104·108·110라운드의 소유자 수용 범위에 한정됩니다.`);
  add('## 환경과 명령');
  add(`Node ${environment.node}, V8 ${environment.v8}, React ${environment.react}, ${environment.cpu}, 메모리 64 GiB, ${environment.os}입니다. React 비계측 공식 측정 시각은 ${start}–${end}(UTC)입니다. 두 판은 같은 설치 의존성과 BF fixture·상호작용을 사용하며, 0.16.0은 로컬 공개판 ESM을 사용합니다. 공개판 ESM SHA-256은 \`${environment.legacySha256}\`입니다.`);
  add('각 fixture·판·회차는 새 프로세스입니다. 판 순서는 회차 1·3에서 0.16.0→HEAD, 회차 2에서 HEAD→0.16.0이고, 워밍업 20회와 실표본 101개를 각각 수집합니다. 3회차의 303개 표본을 합쳐 nearest-rank 중앙값과 p99를 구하고, 배율은 HEAD 중앙값/0.16.0 중앙값입니다. 판정은 반올림 전 수치를 사용합니다. schema 복제와 명시적 GC는 시계 밖이며, 마운트·최종 값과 정렬한 data-path의 판 간 동등성을 모든 짝에서 단언합니다.');
  add('BF의 React 마운트·상호작용 harness와 setupJsdom·drainTicks를 재사용하고, NODE_ENV=production과 react-dom/profiling을 적용합니다. render wall 시계에는 BF의 drainTicks(2)가 포함되고, 갱신은 fixture가 정의한 전체 상호작용 순서입니다. profiler 시간은 actualDuration 합이고 commits는 콜백 횟수이므로, 커밋 횟수 행에는 별도의 시간 합격선을 적용하지 않고 기존 횟수 이하인지 기록합니다. [측정 도구](profile-114-g26/measure-react.mjs)와 [코어 계측 도구](profile-114-g26/instrument-core.mjs)가 실제 호출 범위를 규정합니다.');
  add(`비계측 공식 worker 114개와 분기 층 진단 worker 18개를 모두 순차 실행합니다. 짝 명령의 최대 경과 시간은 ${fixed(maxPairSeconds)}초이며 모든 worker와 번들러는 종료 코드 0·signal null입니다. esbuild 서비스는 stdin EOF로 자연 종료합니다. [React 원시 자료와 짝 종료 증거](profile-114-g26/)에 각 회차의 101개 표본과 과정 메타데이터가 있습니다.`);
  add('워크트리 루트에서 다음 명령을 fixture·회차별로 단독 실행합니다. `--phases`는 oneOf-5·10·20의 별도 진단에만 사용합니다.');
  add('```sh\nnode packages/canard/schema-form/architecture/verification/07-switch/profile-114-g26/measure-react.mjs --pair <fixture> <1|2|3>\nnode packages/canard/schema-form/architecture/verification/07-switch/profile-114-g26/measure-react.mjs --pair <oneOf-5|oneOf-10|oneOf-20> <1|2|3> --phases\nnode packages/canard/schema-form/architecture/verification/07-switch/profile-114-g26/measure-bundle.mjs\n```');
  add('타입 검사는 PKG 디렉터리에서 아래 명령을 3회 단독 실행합니다. 패키지 관리자 호출에는 파이프·리다이렉트·환경 변수 접두사가 없습니다.');
  add('```sh\nnpx --no-install tsc --noEmit --composite false --rootDir . -p tsconfig.json\n```');
  add('번들·소스맵·캐시는 저장소 안에 생성하지 않습니다. 번들 출력은 `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles`를 사용하며 cacheDir를 설정하지 않습니다.');
  add('## 공식 코어 표');
  add('중앙값·배율·목표·성능 판정은 [111 최종 공식 표](profile-111-final.md)의 108개 표시 행을 사용합니다. 이 코어 측정의 기록 HEAD는 `23dcaec783ed85b2fd9032d6acfe313e18e5ec6d`이며, 여기서 HEAD 코어를 새로 측정했다고 주장하지 않습니다. `(가)`와 차이/잡음은 [113 독립 짝 검증](profile-113-paired.md)의 microtask·예약 완료·pre-sentinel 끝점으로 확인한 값을 사용합니다. 시간 단위는 µs이고, 첫 중앙값은 새 판, 둘째는 0.16.0입니다. 성능 합격과 소유자 수용 표시는 독립적인 열입니다.');
  add('고유 검사 ID는 104개이며 고정 전환 표의 마운트 4행은 일반 표와 공유합니다. `(가)`는 고유 ID 102개·표시 106행에서 통과하고, array-100/off/update와 array-100/off/update-first의 표시 2행에서 실패합니다. 이 2행은 독립 짝 회차 2의 −14.542µs 차이가 8.625µs 잡음을 넘어 실패합니다. 3.080× 미달과 소유자 수용(104라운드)은 유지하고, 짝 꼬리 jitter 분석은 112라운드 개선 항목입니다. 모든 고유 ID의 새 엔진 경계 예약·pending·tail 실행은 0회라는 전제를 사용합니다.');
  const coreHeaders = ['폼', '검증', '작업', '새 / 0.16.0 중앙값 µs', '배율', '(가) pooled · 회차', '독립 짝 차이 / 잡음 µs', '목표', '성능 판정', '소유자 수용'];
  sections.forEach((section, index) => {
    add(`### ${section.title}`);
    add(table(coreHeaders, core.filter(row => row.sectionIndex === index).map(row => row.row)));
  });
  add('## React production profiling 공식 표');
  add('공식 React 설계의 19개 fixture에 render-mount-wall·render-update-wall·profiler-mount·profiler-update·commits-mount·commits-update 6종을 적용한 114행입니다. 시간 표의 중앙값과 p99 단위는 ms이며 커밋 표의 단위는 회입니다. oneOf 행의 시간 배율은 종단 수치로 기록하되, 목표와 판정은 별도 진단의 코어 제외 render+commit 몫으로 정합니다. 공식 React 설계에는 if/then과 oneOf-40이 없으므로 그 React 층까지 입증한 것으로 확대하지 않습니다. [집계 자료](profile-114-g26/summary.json)는 반올림 전 값과 회차별 중앙값을 포함합니다.');
  add(table(['지표', '종단 배율 범위', '적용 목표', '충족 / 미달'], summary.react.metrics.map(row => [row.metric,
    `${fixed(row.minimumRatio)}–${fixed(row.maximumRatio)}×`, row.metric.startsWith('commits-') ? '기존 횟수 이하; 시간 외 진단' : row.metric.includes('mount') ? '비분기 ≤1.2×; 분기 층 ≤1.0×' : '비분기 ≤1.0×; 분기 층 ≤1.0×', `${row.met} / ${row.notMet}`])));
  for (const metric of metrics) {
    add(`### ${metric}`);
    add(table(['폼', '0.16.0 중앙값', 'HEAD 중앙값', '배율', '0.16.0 p99', 'HEAD p99', '목표', '충족 여부', '소유자 판단'], reactRows.filter(row => row.metric === metric).map(row => [
      row.fixture, fixed(row.old.median, 6), fixed(row.current.median, 6), `${fixed(row.ratio)}×`, fixed(row.old.p99, 6), fixed(row.current.p99, 6),
      row.basis === '분기 React 층' ? `코어 제외 층 ≤1.0×; 실측 ${fixed(row.phaseRatio)}×` : row.basis === '커밋 횟수 진단' ? '횟수 ≤1.0×(진단)' : `≤${row.target.toFixed(1)}×`, row.met ? '충족' : '미달', row.owner,
    ])));
  }
  add('### 소유자 판단이 필요한 React 행');
  add('아래 26행은 지정 시간 목표를 넘으며 소유자 수용 라운드가 없습니다. 작은 차이도 반올림이나 wall 대기 비중을 이유로 충족으로 바꾸지 않습니다. 분기 수용에 대한 코어 104·108·110라운드 표시를 이 React 결과에 전용하지 않습니다.');
  add(table(['폼', 'React 행', '배율', '목표', '상태'], ownerRows.map(row => [row.fixture, row.metric, `${fixed(row.ratio)}×`, `≤${row.target.toFixed(1)}×`, row.owner])));
  add('## 분기·조건 폼의 91라운드 판정');
  add('### 기준 ①: 건드리지 않은 분기의 수와 전환 비용');
  add('상태는 **소유자 답 기다림(분기 기준 ① 고침의 범위와 시기)**입니다. kind_0→kind_4→kind_0으로 건드리는 두 분기를 고정한 oneOf OFF 축에서 전체 분기 5·10·20·40개에 대응하는 건드리지 않은 분기는 3·8·18·38개입니다. 아래 중앙값은 µs이며 크기에 따라 BF·첫·이후 전환 비용이 증가하므로 기준 ①은 미달입니다. [111 전환 축과 각 회차 근거](profile-111-final.md)를 사용하고, 수정 범위와 시기는 소유자 답으로 정합니다.');
  add(table(['전체 분기 / 건드리지 않은 분기', 'BF 갱신 µs', '첫 갱신 µs', '이후 갱신 µs'], [
    ['5 / 3', '478.835', '283.167', '175.875'], ['10 / 8', '648.417', '401.501', '229.084'],
    ['20 / 18', '986.835', '628.167', '342.918'], ['40 / 38', '1651.335', '1072.875', '558.709'],
  ]));
  add('### 기준 ②: 중복 단계 작업과 쓰이지 않는 장부');
  add('기준 ②는 충족을 선언할 수 없는 상태입니다. [112 분기 단계 진단](profile-112-branch.md)은 꺼진 분기의 노드·기록 생성, compute·delivery·validation, 새 gate read 등록이 0회인 점과 실제 식 평가가 현재 계약상 필요한 점을 구분합니다. 그러나 후보·등록·경로·투영·선택·출력·재계산 장부의 반복 방문은 존재합니다. 이 방문을 실제 식 계산이나 쓰이지 않는 분기 노드 실행으로 한데 묶지 않고, 반복 장부를 개선 대상으로 남깁니다.');
  add('### 기준 ③: 남은 배율과 단계 원인');
  add('남은 oneOf·if/then OFF/ON 배율은 공식 코어 108행에, React 종단 배율은 위 114행에 기록합니다. 마운트 청사진 분석과 분기 갱신의 반복 장부는 [111 공식 표](profile-111-final.md)와 [112 상세 귀속](profile-112-branch.md)의 근거를 사용합니다. 아래 값은 112의 CPU 표본을 111 시계로 환산한 건드리지 않은 분기당 µs 추정치이며 별도의 공식 시간 측정치나 서로 독립적인 합산 성분으로 취급하지 않습니다.');
  add(table(['단계', 'BF µs/분기 추정', '이후 µs/분기 추정'], [
    ['자식 선택', '6.428561', '2.343210'], ['경로', '5.944901', '1.781149'],
    ['gate read·등록', '4.662645', '1.670019'], ['투영', '4.436331', '1.534286'],
    ['식 평가', '2.635345', '0.892379'], ['전체', '33.484219', '10.961318'],
  ]));
  add('### React 층과 AJV 몫');
  add('별도 production profiling 진단은 React renderRoot·commitRoot 및 mutation·layout·passive 경로와 코어 동기 본문·getter를 동적으로 계측합니다. 중첩 스택에서 코어 시간을 React 몫에서 제외하며, 각 표본의 render+commit 합을 먼저 구한 뒤 중앙값을 구합니다. 주변 중앙값끼리 더하거나 종단 wall 중앙값에서 별도 코어 중앙값을 빼지 않습니다. 아래 6행의 코어 제외 React 층은 모두 기존 이하입니다. 계측 시계에는 계측 비용이 있으므로 비계측 공식 React 행을 덮어쓰지 않습니다. [계측 도구](profile-114-g26/instrument-core.mjs)와 [진단 원시 자료](profile-114-g26/)가 근거입니다.');
  add(table(['폼 / 작업', '0.16.0 render ms', 'HEAD render ms', '0.16.0 commit ms', 'HEAD commit ms', '0.16.0 층 합 중앙값 ms', 'HEAD 층 합 중앙값 ms', '배율 / 목표', '충족 여부', '0.16.0 / HEAD 코어 ms'], phaseRows.map(row => [
    `${row.fixture} / ${row.operation === 'mount' ? '마운트' : '갱신'}`, fixed(row.old.render, 6), fixed(row.current.render, 6), fixed(row.old.commit, 6), fixed(row.current.commit, 6),
    fixed(row.old.layer, 6), fixed(row.current.layer, 6), `${fixed(row.ratio)}× / ≤1.0×`, row.met ? '충족' : '미달', `${fixed(row.old.core, 6)} / ${fixed(row.current.core, 6)}`,
  ])));
  add('React 공식·층 진단은 validator를 주입하지 않는 validation OFF이므로 두 판 모두 AJV 0 ms·0%입니다. 공식 코어 OFF도 AJV를 사용하지 않습니다. 코어 ON의 AJV는 종단 시간에 포함되며, 111 공식 근거에는 AJV만 분리한 몫이 없어 미분리로 기록합니다. ON 종단 배율이나 AJV 몫을 별도 합격선으로 사용하지 않습니다.');
  add('## 배포 번들 크기');
  add(`패키지 rolldown 설정의 공통 build factory로 src/index.ts의 ESM·CJS를 생성하고, ESM에 esbuild ${bundle.toolVersions.esbuild}의 minify(es2020, 외부 의존성 유지)를 적용한 뒤 시스템 \`gzip -9 -c\`로 측정합니다. rolldown은 ${bundle.toolVersions.rolldown}입니다. 패키지 설정의 dist 정리 동작은 호출하지 않고 같은 입력·출력 옵션의 디렉터리만 지정 scratchpad로 바꿉니다. [번들 도구](profile-114-g26/measure-bundle.mjs)와 [크기·모듈 그래프 증거](profile-114-g26/bundle.json)가 근거입니다.`);
  add(table(['측정', '현재 크기 B', '기준 B', '차이 B', '기준 대비'], [
    ['minify gzip', bytes(bundle.minifyGzip.bytes), '37,023', `+${bytes(bundle.minifyGzip.difference)}`, `${fixed(bundle.minifyGzip.ratio)}×`],
    ['비축소 ESM gzip', bytes(bundle.plainGzip.bytes), '51,632', `+${bytes(bundle.plainGzip.difference)}`, `${fixed(bundle.plainGzip.ratio)}×`],
    ['비축소 ESM raw', bytes(bundle.esm.rawBytes), '—', '—', `${fixed(bundle.esm.rawBytes / 1024)} KiB`],
    ['비축소 CJS raw', bytes(bundle.cjs.rawBytes), '—', '—', `${fixed(bundle.cjs.rawBytes / 1024)} KiB`],
  ]));
  add(`현재 ESM raw는 ${bytes(bundle.esm.rawBytes)} B로 [PKG/CLAUDE.md](../../../CLAUDE.md)의 약 240 kB 설명과 일치하지 않습니다. **src/__legacy__는 배포 번들에 포함되지 않습니다.** ESM·CJS 각각 ${bundle.esm.moduleCount}개 입력 모듈의 출력 그래프에서 src/__legacy__ 모듈은 0개입니다. 따라서 크기 증가를 레거시 동봉으로 설명할 수 없으며, 큰 현재 구현 기여는 아래 settle·blueprint 등에서 확인됩니다.`);
  add('기여 크기는 비축소 ESM에서 각 소스 모듈에 귀속된 UTF-8 출력 영역의 바이트입니다. 모듈별 gzip은 가산적이지 않으므로 압축 크기 기여라고 해석하지 않습니다. 출력 wrapper·구분자 2,726 B를 포함하면 전체 ESM raw 크기와 일치합니다.');
  add(table(['책임 영역', '비축소 출력 B', '전체 ESM 비중'], breakdown.slice(0, 10).map(([name, size]) => [name, bytes(size), `${fixed(size / bundle.esm.rawBytes * 100, 2)}%`])));
  add(table(['큰 개별 기여 모듈', '비축소 출력 B'], bundle.breakdown.modules.slice(0, 10).map(module => [module.source.replace('packages/canard/schema-form/', ''), bytes(module.bytes)])));
  add('## typecheck 시간');
  add('지정 noEmit 명령의 벽시계 시간은 실행 도구의 monotonic 명령 대기 시간으로 측정합니다. 3회 모두 종료 코드 0이며 stdout은 비어 있습니다. [원시 시간 자료](profile-114-g26/typecheck.json)가 근거입니다.');
  add(table(['회차', '시간 s', '결과'], typecheck.runs.map(run => [run.run, fixed(run.seconds, 9), '통과'])));
  add(`typecheck 중앙값은 **${fixed(typecheck.medianSeconds, 9)}초**입니다.`);
  add('## benchmark-form / 패키지 벤치 표');
  add('benchmark-form(BF)의 코어 BF 갱신은 위 공식 코어 표에, React 19 fixture는 위 production profiling 표에 있습니다. 아래는 패키지 벤치 7개 파일의 44행을 담은 [bench-82c01 회귀 감시 기준선](bench-82c01-residual-baseline.json)입니다. 이 자료는 현재 보존하는 패키지 회귀 기준선이며 HEAD 재측정이나 0.16.0 대비 배율로 주장하지 않습니다. 시간 단위는 ms이고 별도의 G26 합격선이 없어 기록 전용입니다.');
  add(table(['패키지 벤치 파일', '그룹', '사례', '중앙값 ms', 'p99 ms', '표본 수', '용도'], packageRows.map(row => [row.file, row.group, row.name, fixed(row.median, 6), fixed(row.p99, 6), row.count, '회귀 감시 기준선'])));
  add('## 개선 단계로 미룬 항목');
  add('- 청사진 분석 가속은 꺼진 분기의 지연 분석, 템플릿 1회 분석, 빌드 시점 사전 분석, 폼 간 공유 S01을 포함하며 개선 단계에서 다룹니다. 마운트 수용은 108라운드 범위이고 S01은 7단계에서 열지 않습니다. [108 수용 범위](profile-108-ratios.md)와 [111 공식 원인](profile-111-final.md)이 근거입니다.\n- 작은 수정 P1·W1과 0.07 ms 이하 상한의 미세 비용은 개선 단계에서 다룹니다. 성능 목표의 면제나 전체 개선 완료로 해석하지 않습니다. [상세 측정 근거](remeasure-86c02.md)를 사용합니다.\n- 벤치마크가 얕게 다루는 패턴은 별도 범위로 보강하며, fixture 밖의 성능까지 이 표로 입증하지 않습니다. [코어 공식 범위](profile-111-final.md)와 [React 측정 fixture](profile-114-g26/measure-react.mjs)가 근거입니다.\n- 파일 배치와 코드 정리는 개선 단계에서 다룹니다. [112 단계 귀속](profile-112-branch.md)이 현재 구현을 추적하는 근거입니다.\n- rjsf 비교는 108라운드의 개선 항목으로 남기며, 이번 G26 측정은 HEAD와 0.16.0 비교입니다. [108 수용 범위](profile-108-ratios.md)를 함께 참조합니다.\n- flat-50·flat-100 첫 갱신의 1회 비용은 소유자 수용(110라운드) 범위로 남기고 개선 단계에서 다룹니다. [111 첫 갱신 표](profile-111-final.md)가 근거입니다.\n- 도우미 테스트 네 파일의 test-record 32사례 상한 초과는 112라운드 개선 항목입니다. 대상은 [formatErrorMessage](../../../src/helpers/error/__tests__/formatErrorMessage.test.ts), [formTypeInputMap](../../../src/helpers/formTypeInputDefinition/__tests__/formTypeInputMap.test.ts), [formTypeInputDefinitions](../../../src/helpers/formTypeInputDefinition/__tests__/formTypeInputDefinitions.test.ts), [extractSchemaInfo](../../../src/helpers/jsonSchema/__tests__/extractSchemaInfo.test.ts)이며 검증 범위를 버리지 않고 정리합니다.\n- array-100 OFF BF·첫 갱신의 독립 짝 꼬리 jitter는 112라운드 개선 항목으로 남깁니다. 104라운드 성능 수용과 `(가)` 실패를 함께 기록하며, [113 독립 짝 검증](profile-113-paired.md)이 근거입니다.\n- 다섯 진입점의 wildcard re-export는 개선 단계에서 명시적 재수출로 정리합니다. 대상은 [dynamicExpression](../../../src/helpers/dynamicExpression/index.ts), [helper error](../../../src/helpers/error/index.ts), [jsonPointer](../../../src/helpers/jsonPointer/index.ts), [defaultValue](../../../src/helpers/defaultValue/index.ts), [errors](../../../src/errors/index.ts)입니다.\n- oneOf의 분기별 장부는 소유자 답에 따라 수정 범위와 시기를 정하는 개선 항목입니다. [112 분기 장부 진단](profile-112-branch.md)의 반복 방문과 실제 식 계산을 구분하며 기준 ② 충족을 선언하지 않습니다.');
  add('## G26 CHECK의 의미');
  add('G26 CHECK는 이 문서의 두 gzip 기준값·typecheck·benchmark-form 표기와 미결 상태 문자열 요건을 검사하여 PERFORMANCE_REPORTED를 출력합니다. 이 표식은 보고 요건 확인이며, 위 React 26행의 소유자 판단과 분기 기준 ①·②의 남은 판단을 자동 수용하지 않습니다. 실제 CHECK 출력은 [검증 증거](profile-114-g26/verification.json)에 기록합니다.');
  const content = report.join('\n\n') + '\n';
  assert(Buffer.byteLength(content) < 5_000_000);
  assert(!content.includes('수용' + ' 대기'));
  return { report: content, summary };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = buildReport();
  if (process.argv[2] === '--summary') console.log(JSON.stringify(result.summary));
  else if (process.argv[2] === '--length') console.log(JSON.stringify({ characters: result.report.length, bytes: Buffer.byteLength(result.report) }));
  else if (process.argv[2] === '--chunk') console.log(JSON.stringify(result.report.slice(Number(process.argv[3]), Number(process.argv[3]) + Number(process.argv[4]))));
  else console.log(result.report);
}
