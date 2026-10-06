// Read-only report compiler; emits a native apply_patch envelope instead of editing reports.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = path.resolve(directory, '../../..');
const repo = path.resolve(pkg, '../../..');
const results = path.join(directory, 'profile-100c01');
const read = name => JSON.parse(fs.readFileSync(path.join(results, name), 'utf8'));
const head = '0fdb6660ba07b94bafe3ff20e95b0025154ca490';
const fixtures = ['nested-d5-f4', 'flat-500', 'oneOf-20', 'sample-0'];
const operations = [...fixtures.map(name => [name, 'mount']), ['sample-0', 'later'], ['nested-d5-f4', 'later']];
const configs = read('ablations.json');
const profiles = fixtures.map(name => read(`analysis-${name}.summary.json`));
const median = xs => xs.toSorted((a,b)=>a-b)[Math.floor(xs.length/2)];
const span = xs => [Math.min(...xs), Math.max(...xs)];
const f = (x, digits = 6) => Number(x).toFixed(digits);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

// Reuse the committed 99C-01 exact distribution-free interval calculation verbatim.
const upstream = fs.readFileSync(path.join(directory, 'tools/summarize-99c01.mjs'), 'utf8');
const intervalSource = upstream.slice(upstream.indexOf('function medianInterval(values) {'),
  upstream.indexOf('\n}\n', upstream.indexOf('function medianInterval(values) {')) + 2);
assert(intervalSource.startsWith('function medianInterval'));
const medianInterval = new Function(intervalSource + '; return medianInterval;')();

/** Validate run arrays and summarize medians without copying output trees into the report. */
function runs(id, name, mode) {
  return [1,2,3].map(run => {
    const stem = `profile-99c01-paired-${id}-${name}-${mode}-r${run}`;
    const metadata = read(stem + '.summary.json'), arrays = read(stem + '.json');
    assert.equal(metadata.head, head); assert.equal(metadata.warmup, 20); assert.equal(metadata.samples, 101);
    assert.equal(metadata.run, run);
    for (const values of [...Object.values(arrays.timingsMs), arrays.pairedDeltasMs,
      arrays.emptyTimingsMs.before, arrays.emptyTimingsMs.after]) {
      assert.equal(values.length, 101); assert(values.every(Number.isFinite));
    }
    const interval = medianInterval(arrays.pairedDeltasMs);
    return { run, started: metadata.started, ended: metadata.ended,
      head: metadata.metrics.head, variant: metadata.metrics[id], boundMs: metadata.boundMs,
      pairedDelta: metadata.pairedDelta, medianIntervalMs: interval,
      emptyBefore: metadata.emptyBefore, emptyAfter: metadata.emptyAfter,
      subtractedEmptyMs: metadata.subtractedEmptyMs,
      observations: Object.fromEntries(['head',id].map(v => [v, {
        sha256: metadata.observations[v].sha256, bytes: metadata.observations[v].outputBytes,
        liveWidth: metadata.observations[v].liveWidth }])),
      resultChanged: metadata.observations.head.sha256 !== metadata.observations[id].sha256,
      artifact: stem + '.json', summary: stem + '.summary.json' };
  });
}

const controls = operations.map(([name,mode]) => {
  const rows = runs('control',name,mode);
  return { name,mode,noiseMs:Math.max(...rows.flatMap(row=>[Math.abs(row.boundMs),Math.abs(row.pairedDelta.median)])),runs:rows };
});

/** Use 3-run reproduction and the original median interval, never sample percentiles. */
function bound(id,name,mode) {
  const rows = runs(id,name,mode), noiseMs = controls.find(row=>row.name===name && row.mode===mode).noiseMs;
  const gains = rows.map(row=>row.boundMs);
  return { id,name,mode,headMedianMs:median(rows.map(row=>row.head.median)),
    variantMedianMs:median(rows.map(row=>row.variant.median)),medianBoundMs:median(gains),spreadMs:span(gains),
    pairedMedianMs:median(rows.map(row=>row.pairedDelta.median)),noiseMs,
    aboveNoise:gains.every(x=>x>noiseMs) && rows.every(row=>row.medianIntervalMs[0]>0),
    regressionAboveNoise:gains.every(x=>x < -noiseMs) && rows.every(row=>row.medianIntervalMs[1]<0),
    strictEveryRunWithinNoise:gains.every(x=>x >= -noiseMs),resultChanged:rows.some(row=>row.resultChanged),runs:rows };
}
const bounds = configs.filter(row=>row.id!=='control').flatMap(config=>config.fixtures.map(name=>({
  ...bound(config.id,name,'mount'),classification:config.classification,spec:config.spec,coverage:config.coverage,
})));
const comparisons = operations.map(([name,mode])=>bound('working',name,mode));
assert(comparisons.every(row=>!row.resultChanged));
const adopted = comparisons.some(row=>row.mode==='mount' && row.aboveNoise) && comparisons.every(row=>!row.regressionAboveNoise);
assert.equal(adopted,false,'The measured attempt must be reverted');
const restored = ['src/core/blueprint/utils/analyze/populateNodeChildren.ts','src/core/blueprint/DETAIL.md'].map(file=>{
  const working=fs.readFileSync(path.join(pkg,file)),original=execFileSync('git',['show',head+':'+path.relative(repo,path.join(pkg,file))],{cwd:repo});
  assert(working.equals(original));return {file,headSha256:hash(original),finalSha256:hash(working),identical:true};
});
const counts = ['head','working'].flatMap(variant=>fixtures.map(name=>read(`count-${variant}-${name}.summary.json`)));
const verification = read('verification.summary.json');
const vitest = verification.checks.find(row=>row.id==='vitest');
assert.equal(vitest.exitCode,1); assert.equal(vitest.failures.length,4);
for(const project of ['render','react18']) assert.equal(vitest.failures.filter(line=>line.includes(`|${project}|`) && line.includes('EVENT-070') && /through use(Layout)?Effect/.test(line)).length,2);
assert(vitest.summary.some(line=>line.includes('3207 passed')));
for(const id of ['tsc','eslint','isolation']) assert.equal(verification.checks.find(row=>row.id===id).exitCode,0);
assert(verification.checks.every(row=>row.signal===null && row.sourceRestored));
assert(verification.checks.find(row=>row.id==='isolation').summary.some(line=>line.includes('LEGACY_ISOLATED: 1625 files checked')));
const testLogs = Object.fromEntries(['red','green','head'].map(name=>[name,fs.readFileSync(path.join(results,`tests-${name}.log`),'utf8')]));
assert(testLogs.red.includes('length of 26 but got 51')); assert(testLogs.red.includes('1 failed | 2 passed'));
assert(testLogs.green.includes('8 passed')); assert(testLogs.head.includes('8 passed'));
const differential = JSON.parse(fs.readFileSync(path.join(pkg,'src/core/blueprint/__tests__/fixtures/coldBindingHead.json'),'utf8'));
assert.equal(differential.cases.length,59); assert.equal(differential.head,head);
assert.equal(differential.canonicalSha256,hash(fs.readFileSync(path.join(repo,differential.canonical))));

const coverage = profiles.flatMap(profile=>{
  const functions=profile.functions.filter(row=>row.selfPercent>=5 || row.totalPercent>=5).map(row=>({
    type:'function',target:row.function,selfPercent:row.selfPercent,totalPercent:row.totalPercent,
    ids:configs.filter(config=>config.coverage.includes(row.function)).map(config=>config.id),
  }));
  const stages=profile.stages.filter(row=>row.selfPercent>=5 || row.totalPercent>=5).map(row=>({
    type:'stage',target:row.stage,selfPercent:row.selfPercent,totalPercent:row.totalPercent,
    ids:configs.filter(config=>config.coverage.includes(row.stage)).map(config=>config.id),
  }));
  for(const row of [...functions,...stages]) assert(row.ids.length,`${profile.name}: uncovered ${row.type} ${row.target}`);
  return [...functions,...stages].map(row=>({...row,name:profile.name}));
});
const selected = bounds.filter(row=>row.name==='nested-d5-f4' && row.classification==='code-level' && row.aboveNoise)
  .sort((a,b)=>b.medianBoundMs-a.medianBoundMs)[0];
assert.equal(selected.id,'children');
const initialBuilds = JSON.parse(fs.readFileSync(path.join(results,'.work/builds.json'),'utf8')).records;
assert.equal(initialBuilds.find(row=>row.variant==='head').sha256,initialBuilds.find(row=>row.variant==='control').sha256);
const builds=[...initialBuilds,...fs.readdirSync(results).filter(name=>/^build-.*\.summary\.json$/.test(name)).map(read)];
assert(builds.every(row=>row.naturalServiceExits===1));
for(const profile of profiles){assert(profile.selectedSamples>1000);assert(profile.rawBytes<=5_000_000);
  assert(Math.abs(profile.stages.reduce((n,row)=>n+row.selfPercent,0)-100)<1e-8);
  for(const row of profile.functions.filter((row,i)=>i<25 || row.selfPercent>=2 || row.totalPercent>=2))
    assert(profile.top25AndAtLeast2Percent.some(other=>other.function===row.function && other.file===row.file && other.line===row.line));
}
const artifacts=fs.readdirSync(results).filter(name=>fs.statSync(path.join(results,name)).isFile()).map(name=>({name,bytes:fs.statSync(path.join(results,name)).size}));
assert(artifacts.every(row=>row.bytes<=5_000_000));
const environment=read('profile-99c01-paired-control-nested-d5-f4-mount-r1.summary.json').environment;
const summary={head,editorDecision:'100C-01 / 3d7e28520',method:'99C-01 profiler and 100 paired timer; exact 99C-01 median interval',
  environment,warmup:20,samples:101,runs:3,sequential:true,freshProcesses:true,alternatingFirstOrders:['H-A','A-H','H-A'],
  profiles,controls,bounds,coverage,selectedCodeLevelJob:selected.id,builds,rawProfileLocation:profiles[0].rawProfile.replace(/\/[^/]+$/,''),
  artifactCounts:{analysis:profiles.length,ablationJobs:configs.length-1,pairedB:configs.length*fixtures.length*3,pairedCExtra:24,
    timingFiles:artifacts.filter(row=>/^profile-99c01-paired-.*\.json$/.test(row.name) && !row.name.endsWith('.summary.json')).length,
    maxExistingArtifactBytes:Math.max(...artifacts.map(row=>row.bytes))},
  caveats:['native/inlined freezing is charged to callers; its sampled share is not separately identifiable',
    'inclusive and ablation bounds overlap and cannot be added',
    'replacement lookup/guard/scaffold cost remains; negative bounds are not treated as zero',
    'changed-output ablations can also remove downstream mount work; their bound is not a pure stage cost'],
};
const verdict={head,job:'children',adopted,productRestored:true,restored,comparisons,counts,verification,
  differential:{cases:59,corpus:14,edges:45,staticErrors:differential.cases.filter(row=>row.expected.error).length,
    warningCases:differential.cases.filter(row=>row.expected.diagnostics.some(d=>d.level==='warning')).length,
    errorsInclude:['name','message','code','specific','details','diagnostics'],excluded:['stack addresses'],
    fixture:'src/core/blueprint/__tests__/fixtures/coldBindingHead.json',sha256:hash(fs.readFileSync(path.join(pkg,'src/core/blueprint/__tests__/fixtures/coldBindingHead.json')))},
  tests:{before:'1 failed | 2 passed; count 51 versus 26',attempt:'8 passed',restored:'8 passed',
    retainedCount:'reachable record count and frozen declarations; passes HEAD after rejecting the stricter speed target'},
  attempt:{file:'src/core/blueprint/utils/analyze/populateNodeChildren.ts',line:163,diff:'attempt.diff',
    bundleSha256:read('build-working.summary.json').sha256,spec:'같은 호스트 선언·게이트·배열 재사용; 다른 호스트만 lazy copy',
    memory:'추가 색인 없음. nested에서 선언 기록 1,364개와 배열 2,728개를 제거했으나 종단 속도 이득이 잡음을 넘지 못해 제품에 남기지 않았습니다.'},
};

const names={'buildNodes other':'buildNodes 직접 구축','static schema merge':'정적 스키마 병합','child binding':'자식 바인딩',
  'declaration collection':'선언 수집','blueprint orchestration / inlined freezing':'청사진 마무리·인라인 동결',
  indexes:'템플릿 키·색인','shape validation':'형상·자식 대상 검증','type and strategy':'형·전략 판정',
  'expression compilation':'식 컴파일','gate read analysis':'게이트 읽기 추출','warning collection':'경고 수집',freezing:'동결'};
const codePath=row=>row.file.replace('packages/canard/schema-form/','');
const report=[
  '# 100C-01 — 콜드 청사진 분석의 함수 귀속과 제거 상한',
  '',
  '청사진 분석 안에서 nested의 자기 시간은 buildNodes 직접 구축 31.09%, 정적 스키마 병합 23.68%, 자식 바인딩 15.77%였습니다. 코드 수준 최대 상한은 자식 바인딩 1.708 ms(1.680–1.878 ms)였으며 그 한 가지의 구현은 종단 이득이 잡음을 넘지 못하여 복구했습니다. 전체 청사진 공유의 8.261 ms와 완성 그래프 공유의 7.720 ms는 계약에 닿는 겹친 천장입니다.',
  '',
  '## 기준과 재현 방법',
  '',
  `- 작업 트리: stage-07; HEAD \`${head}\`; 100C-01은 \`git show origin/1.0.0-beta:packages/canard/schema-form/architecture/reviews/round-100-closing.md\`로 읽었습니다(결정 commit 3d7e28520). 89C-03 commit은 af1904cf9입니다.`,
  '- A는 기존 profile-99c01.mjs의 소스 전용 EOF 종료 빌드·source-map·표본 가중 집계를 재사용했습니다. B·C는 measure-schema-merge-100.mjs가 사용한 같은 99C-01 sentinel timer와 교대 조건을 사용하며, 중앙값 구간은 summarize-99c01.mjs의 함수를 그대로 실행합니다.',
  `- 환경: ${environment.cpu}, ${environment.platform}/${environment.arch}, Node ${environment.node}, V8 ${environment.v8}, esbuild ${environment.esbuild}; production, validation off, 외부 구독자 0입니다.`,
  '- A는 매회 새 schema를 structuredClone으로 만들고 cache 옵션 없이 blueprint만 호출합니다. 내부 계측이 없습니다. warmup 20 후 3.5초 작업, 100 μs 요청 간격으로 표본을 얻고 blueprint 하위 비유휴 프레임만 선택합니다. clone·driver·스택을 잃은 GC는 분모 밖입니다. 표본 CPU 시간은 B·C의 cold mount 벽시계 시간으로 대체하지 않습니다.',
  '- 함수 total은 재귀 프레임을 한 번만 셉니다. 단계 self는 가장 가까운 단계에 배타적으로 귀속하고, total은 그 단계가 스택에 있는 표본의 합집합입니다. 누적 단계·함수는 서로 겹칩니다. buildNodes/자식 바인딩의 total은 재귀 자식 구축까지 포함합니다.',
  '- V8가 Object.freeze의 native/inlined 호출을 별도 함수로 내보내지 않아 동결 몫만의 표본 비율은 분리할 수 없습니다. 해당 비용은 각 호출자 self에 포함됩니다. 아래의 동결 제거 대조로만 그 천장을 확인합니다. 0%로 해석하지 않습니다.',
  '- B·C는 새 process마다 H와 A/W를 번갈아 실행합니다. warmup 20, 101쌍 × 3회입니다. schema 준비·강제 GC는 시계 밖이며 끝점은 64 Promise turn 및 같은 check queue의 setImmediate sentinel입니다. 앞뒤 empty sentinel 101개의 중앙값 평균을 양쪽 시간에서 뺍니다. 음수 차이는 보존합니다.',
  '- N은 동일 HEAD control 세 run의 H−control 중앙값 차이 및 paired 중앙값 절댓값의 최댓값입니다. 세 run의 bound가 모두 N보다 크고 paired 중앙값 95% 구간 하한이 모두 0보다 클 때만 **잡음 초과**입니다. 101개 표본에서는 정렬한 41번째/61번째가 구간입니다. 연속 표본의 독립성은 보장되지 않아 구간보다 세 run 재현과 control을 우선합니다.',
  '- 제거는 측정 전용 in-memory build plugin에서 함수 body를 상수/무동작/상수 자료 재생으로 교체합니다. 조회·guard·유효한 그래프를 위한 재생 scaffold 비용은 남습니다. cold 분석에 한정한 병합·동결/형 판정 guard를 사용합니다. 결과가 바뀐 제거는 후속 마운트 작업도 달라질 수 있어 순수 함수 비용으로 해석하지 않습니다.',
  '- 사용자 지정 작업 트리 외 제품·git 쓰기·설치·다른 에이전트는 사용하지 않았습니다. worker는 순차 실행하고 signal 없는 정상/예상 exit를 확인했습니다. esbuild는 stdin EOF를 받아 exit 0으로 끝났습니다. 원시 .cpuprofile만 지정 /private/tmp 위치에 보관하고 per-run 자료는 profile-100c01/ 아래에 둡니다.',
  '',
  '## A — 분석만의 표본 귀속',
  '',
];
for(const profile of profiles){
  report.push(`### ${profile.name}`,'',
    `새 분석 ${profile.operations.toLocaleString('en-US')}회; blueprint 하위 표본 ${profile.selectedSamples.toLocaleString('en-US')}개, ${f(profile.selectedMs,3)} ms; 분모 밖 ${f(profile.outsideMs,3)} ms입니다. 노드 ${profile.nodes}개·조각 ${profile.fragments}개입니다. [전체 함수 JSON](profile-100c01/analysis-${profile.name}.summary.json).`,'',
    '| 단계 | self ms | self % | total ms | total % |','|---|---:|---:|---:|---:|');
  for(const row of profile.stages) report.push(`| ${names[row.stage]??row.stage} | ${f(row.selfMs,3)} | ${f(row.selfPercent,2)} | ${f(row.totalMs,3)} | ${f(row.totalPercent,2)} |`);
  report.push('| 동결 단독 | 분리 불가 | 분리 불가 | 분리 불가 | 분리 불가 |','',
    '자기 시간 상위 25개와 self 또는 total이 2% 이상인 **모든 함수**를 아래에 단계별로 모았습니다. 함수 위치는 HEAD source map 기준입니다.','');
  const allGroups=profile.top25AndAtLeast2Percent.map(row=>row.stage);
  const groups=allGroups.filter((stage,index)=>allGroups.indexOf(stage)===index);
  for(const stage of groups){
    report.push(`#### ${names[stage]??stage}`,'','| 함수·작성 위치 | self ms | total ms | self % | total % |','|---|---:|---:|---:|---:|');
    for(const row of profile.top25AndAtLeast2Percent.filter(row=>row.stage===stage))
      report.push(`| \`${row.function}\` — \`${codePath(row)}:${row.line}\` | ${f(row.selfMs,3)} | ${f(row.totalMs,3)} | ${f(row.selfPercent,2)} | ${f(row.totalPercent,2)} |`);
    report.push('');
  }
}
report.push('## B — 제거 상한과 잡음','',
  'bound = 각 run의 HEAD 중앙값 − ablated 중앙값입니다. 대표값은 세 bound의 중앙값이고 spread는 최솟값–최댓값입니다. 상세 paired 구간·날짜·empty 값·출력 hash는 [요약 JSON](profile-100c01-summary.json)에 모두 있습니다. 출력이 달라진 제거에 표시를 남깁니다. 그 천장을 동일 내용의 제품 수정으로 그대로 얻을 수 있다고 주장하지 않습니다.','',
  '| 대상/연산 | N ms | control bound 3회 ms |','|---|---:|---|');
for(const row of controls) report.push(`| ${row.name}/${row.mode} | ${f(row.noiseMs)} | ${row.runs.map(x=>f(x.boundMs)).join(', ')} |`);
report.push('','| 제거 대상 | fixture | 분류 | H→A 중앙값 ms | bound ms [spread] | 잡음 초과 | 결과 변화 |',
  '|---|---|---|---:|---:|---|---|');
for(const row of bounds) report.push(`| ${row.id} | ${row.name} | ${row.classification==='code-level'?'코드 수준':'계약 접촉'} | ${f(row.headMedianMs)}→${f(row.variantMedianMs)} | ${f(row.medianBoundMs)} [${row.spreadMs.map(x=>f(x)).join(', ')}] | ${row.aboveNoise?'**초과**':'미확인'} | ${row.resultChanged?'변경':'같음'} |`);
report.push('','### 분류와 수정 사양','',
  '코드 수준 항목은 동일 blueprint 내용·정적 오류·경고·참조 계약을 유지하는 아래 사양만 구현 후보입니다. 상수 결과 재사용 자체는 측정 전용입니다. 계약 접촉 항목은 원장 결정을 위한 천장으로 남깁니다.','');
for(const config of configs.filter(row=>row.id!=='control')) report.push(`- **${config.id}** (${config.classification==='code-level'?'코드 수준':'계약 접촉'}): ${config.spec}`);
report.push('','### 5% coverage','',
  '각 fixture에서 self/total 5% 이상인 모든 함수와 단계가 적어도 하나의 제거에 연결되어 있고 101×3 원시 시간 배열을 확인했습니다. 형·전략 전체는 readAllowedTypes·resolveNodeTypes·resolveNodeStrategy를 함께 상수 재생하여 별도 측정했습니다. 함수 단독 node-types와 구분합니다.','',
  '| fixture | 종류 | 5% 대상 | self/total % | 제거 |','|---|---|---|---:|---|');
for(const row of coverage) report.push(`| ${row.name} | ${row.type==='stage'?'단계':'함수'} | ${row.target} | ${f(row.selfPercent,2)}/${f(row.totalPercent,2)} | ${row.ids.join(', ')} |`);
report.push('','## C와 최종 상태','',
  'nested 기준 코드 수준 최대인 자식 바인딩 하나만 구현했습니다. 59-schema 구조·오류·경고 차등과 생성 횟수 시험을 통과했지만 실제 종단 이득이 잡음을 넘지 못했습니다. 제품 코드와 소유 DETAIL은 HEAD의 원래 바이트로 복구했습니다. 다른 후보는 구현하지 않았습니다. C의 수치·복구 근거·메모리 비용은 [101라운드 재측정](remeasure-86c02.md#101라운드-콜드-청사진-자식-바인딩)에 기록했습니다.','',
  '재현 명령(작업 트리에서 순차 실행):','',
  '```sh',
  'node packages/canard/schema-form/architecture/verification/07-switch/tools/profile-100c01.mjs --build head control',
  'node packages/canard/schema-form/architecture/verification/07-switch/tools/profile-100c01.mjs --profiles',
  'node packages/canard/schema-form/architecture/verification/07-switch/tools/profile-100c01.mjs --matrix',
  '# C 원시 결과는 복구 전 attempt.diff의 단일 실험 코드로 --compare를 실행한 결과입니다.',
  '# 현재 복구된 제품으로 --compare를 재실행하면 두 측정 대상이 HEAD가 됩니다.',
  'node packages/canard/schema-form/architecture/verification/07-switch/tools/profile-100c01.mjs --verify',
  'node packages/canard/schema-form/architecture/verification/07-switch/tools/summarize-100c01.mjs --emit-patch',
  '```','',
  '생성 번들·source map은 최종 산출물에서 제거합니다. 재집계 시 --build head control로 동일 해시의 map을 다시 만듭니다. 프로파일·측정·보고서·summary는 모두 파일당 5,000,000 바이트 이하입니다. 설치 없는 npx 실행에는 npm_config_offline=true와 npm_config_yes=false를 적용했습니다.','');

const cReport=[
  '## 101라운드 콜드 청사진 자식 바인딩','',
  '**복구했습니다.** 100C-01의 nested 코드 수준 최대 제거 상한은 자식 바인딩 1.707792 ms(1.680500–1.877792 ms), N=0.841083 ms였습니다. 정적 정규화 1.630875 ms보다 커서 이 한 가지를 선택했습니다. 실제 선언 재사용 구현은 여섯 종단 연산 어디에서도 세 run 재현 조건으로 잡음 초과 이득을 얻지 못했습니다. 다음 후보로 바꾸지 않았습니다.','',
  '### 구현과 동일성','',
  '- 소유 blueprint/DETAIL.md를 먼저 갱신하고 populateNodeChildren.ts:163의 자식 선언 복사만 바꾸었습니다. 필드·게이트가 같은 첫 호스트는 frozen 원본 선언·배열을 재사용하고, 참조의 다른 호스트는 바뀐 선언·게이트만 lazy copy했습니다. 추가 색인·public field·캐시 계약은 없습니다. [실험 diff](profile-100c01/attempt.diff)를 보존합니다.',
  `- 89C-03(af1904cf9)의 기존 corpus 14종과 경계 45종을 정본 test에서 추출했습니다. HEAD ${head}의 59개 기대 구조·식 함수 본문·의존·진단 및 오류 name/message/code/details를 고정한 fixture로 비교했습니다. 오류 ${verdict.differential.staticErrors}개 스키마와 경고 ${verdict.differential.warningCases}개 스키마를 포함합니다. stack의 실행 주소만 정규화하며 의미 필드는 제외하지 않습니다.`,
  '- 수정 전에는 59 차등과 참조 호스트 시험이 통과하고 생성 횟수 시험만 실패했습니다(51회, 기대 26회). 수정 후 기존 89C-03 시험까지 8건 통과했습니다. 복구 후에도 59-schema fixture는 그대로 유지하고 count 시험은 reachable 기록 수·각 기록의 동결을 확인하는 HEAD 통과 시험으로 남겼습니다. 복구 후 8건 통과했고 지정 전체 검증에서도 통과했습니다.',
  '- 속도 비용: 첫 호스트에서 O(선언 수) scalar 검사를 더하고 spread·gate map·freeze·배열 복사를 없앴습니다. 다른 호스트는 기존 O(선언+게이트 수)이며 lazy 배열을 필요할 때만 만듭니다. 메모리 비용: 별도 보유 색인은 없고 선언·배열을 기존 청사진 수명에 함께 둡니다. 선언과 게이트 배열 1개, edge 선언 배열 1개씩의 중복 기록을 줄이는 사양입니다. 시간 이득이 재현되지 않아 최종 제품의 속도·메모리 비용은 HEAD와 같습니다.','',
  '### 별도 계수 worker의 작업량','',
  '계수 worker와 횟수 시험에서만 Object.freeze를 관찰했습니다. CPU 표본과 종단 timer에는 계측을 넣지 않았습니다. freeze 호출 감소를 바이트 크기로 환산하지 않았습니다.','',
  '| fixture | 선언 기록 H→W | freeze 호출 H→W | 공유한 edge 선언 배열 W |','|---|---:|---:|---:|'];
for(const name of fixtures){const h=counts.find(row=>row.variant==='head' && row.name===name),w=counts.find(row=>row.variant==='working' && row.name===name);
  cReport.push(`| ${name} | ${h.declarationRecords}→${w.declarationRecords} | ${h.freezeCalls}→${w.freezeCalls} | ${w.reusedEntryArrays} |`);}
cReport.push('','### HEAD와 실험 코드의 짝 종단 측정','',
  '기존 99C-01/100 timer 그대로 fresh process·warmup20·101쌍×3, run 최초 순서 H-W/W-H/H-W 및 표본 순서 교대입니다. 각 쌍 출력 hash·크기·살아 있는 폭이 같습니다. 대표 H/W는 run 중앙값의 중앙값이며, H−W 대표 bound와 paired 중앙값은 구분합니다.','',
  '| fixture/연산 | H ms | W ms | H−W ms [3회 spread] | paired 중앙값 ms | N ms | 잡음 초과 |','|---|---:|---:|---:|---:|---:|---|');
for(const row of comparisons) cReport.push(`| ${row.name}/${row.mode} | ${f(row.headMedianMs)} | ${f(row.variantMedianMs)} | ${f(row.medianBoundMs)} [${row.spreadMs.map(x=>f(x)).join(', ')}] | ${f(row.pairedMedianMs)} | ${f(row.noiseMs)} | ${row.aboveNoise?'초과':'미확인'} |`);
cReport.push('','| fixture/연산 | 각 run H−W ms | 각 run paired 중앙값 95% 구간 ms |','|---|---|---|');
for(const row of comparisons) cReport.push(`| ${row.name}/${row.mode} | ${row.runs.map(run=>f(run.boundMs)).join(', ')} | ${row.runs.map(run=>'['+run.medianIntervalMs.map(x=>f(x)).join(', ')+']').join('; ')} |`);
cReport.push('','nested의 paired 중앙값은 0.550208, −0.755999, 0.579084 ms로 부호가 재현되지 않았고 H−W 대표 차이 0.068000 ms도 N보다 작습니다. flat은 대표 −0.100958 ms이나 세 run 모두 N 밖의 회귀로 재현되지는 않았습니다. 나머지 mount 및 later도 잡음 초과 이득이 없습니다. count 감소만으로 채택하지 않았습니다.','',
  '### 복구 및 지정 검증','',
  'populateNodeChildren.ts와 blueprint/DETAIL.md 두 파일을 git show HEAD의 원래 내용과 바이트 비교해 같음을 확인했습니다. git 쓰기 없이 native patch로 복구했습니다. 지정 전체 검증 이후 제품·시험 동작은 변경하지 않았습니다. 계약을 복구하며 삭제한 임시 acceptance group의 시험 marker도 제거했습니다. 별도 에이전트 없이 직접 범위·불변성·정적 진단·계수·출력·최종 source hash를 검토했습니다.','',
  '| PKG 명령 | 결과 |','|---|---|');
for(const row of verification.checks) cReport.push(`| \`${row.command}\` | ${row.id==='vitest'?'종료1; 425파일·3,207건 통과, todo1; render/react18의 EVENT-070 useLayoutEffect/useEffect 각 2건, 총 4건만 실패':row.id==='isolation'?'종료0; LEGACY_ISOLATED: 1625 files checked':'종료0'} |`);
cReport.push('','[A·B 보고서](profile-100c01.md), [A·B summary JSON](profile-100c01-summary.json), [C 판정·차등·계수·검증 JSON](profile-100c01/verdict.summary.json)에 근거를 보관했습니다. 모든 per-run 자료는 profile-100c01/에 있고 파일마다 5MB 이하입니다. .cpuprofile은 지정 /private/tmp 위치에만 보관하며 생성 번들과 map은 정리합니다. 설치·git 쓰기·다른 에이전트·강제 종료 없이 측정 worker를 순차 실행했습니다.','');

/** Emit a bounded native-file patch without exposing raw measurements to the model. */
function emit() {
  const outputs=[['profile-100c01.md',report.join('\n')],['profile-100c01-summary.json',JSON.stringify(summary,null,2)+'\n'],
    ['profile-100c01/verdict.summary.json',JSON.stringify(verdict,null,2)+'\n']];
  const parts=['*** Begin Patch'];
  for(const [name,text] of outputs.filter(([name])=>!process.argv[3] || name===process.argv[3])){assert(Buffer.byteLength(text)<=5_000_000,name);assert(!fs.existsSync(path.join(directory,name)),name+' already exists');
    parts.push('*** Add File: '+path.join(directory,name),'+'+text.trimEnd().split('\n').join('\n+'));}
  if(!process.argv[3] || process.argv[3]==='remeasure-86c02.md'){
  const existing=fs.readFileSync(path.join(directory,'remeasure-86c02.md'),'utf8').trimEnd().split('\n');
  const tail=existing[existing.length-1]; assert.equal(existing.filter(line=>line===tail).length,1);
  parts.push('*** Update File: '+path.join(directory,'remeasure-86c02.md'),'@@',' '+tail,'+',
    '+'+cReport.join('\n').trimEnd().split('\n').join('\n+'));
  }
  parts.push('*** End Patch');
  console.log(parts.join('\n'));
}
assert.equal(process.argv[2],'--emit-patch');
emit();
