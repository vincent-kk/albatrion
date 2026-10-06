// Korean report derives every table from bounded runtime artifacts; --patch feeds the native editor.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory=path.dirname(fileURLToPath(import.meta.url));
const read=name=>JSON.parse(fs.readFileSync(path.join(directory,name+'.json'),'utf8'));
const phases=['AA','1-binding-literal','2-declaration-slice','3-object-assembly','4-default-choices'];
const summaries=phases.map(phase=>read(phase+'-summary'));
const census=read('step-a'),audit=read('measurements-audit');
const fmt=value=>value.toFixed(6);
const modes={mount:'마운트',first:'첫 갱신',later:'후속 갱신'};
const lines=['## 107라운드 형태 고정과 남은 셋','',
  '기준 HEAD는 `e27f4b3b7e4c975adca702539889335f0b478fae`입니다. 같은 세션에서 A/A 9회차를 먼저 끝낸 뒤 한 변경씩 누적 기반과 비교했습니다. binding 리터럴은 기각·완전 복원했고 declaration slice, object assembly, 기본 choices는 순서대로 채택했습니다. S01과 정착 설계·공개 계약은 변경하지 않았습니다.','',
  '### Step A — 객체 생산과 mount 계수','',
  'blueprint·record·settle·behaviors의 TypeScript AST에서 객체 생산 지점 468곳을 열거했습니다. object spread는 48곳, object rest는 2곳이며 Object.assign은 없었습니다. 아래 표는 고정 리터럴과 미실행 지점까지 포함합니다. 계수는 원본 HEAD의 외부 instrumented copy에서 mount 한 번과 64 microtask·check-queue 종료까지 셌습니다. 후속 확인에서는 생성 객체 참조를 clock과 무관한 계수 실행에서 보유하여 helper 경유 키 추가도 최종 Object.keys로 관측했습니다. 첫 계수와 후속 HEAD 계수는 일치하며 이후 제품 변경의 계수는 섞지 않았습니다.','',
  '외부 복사본은 지정한 `scratchpad/bundles/batch2-step-a-copy`에 있으며 실제 계수·키 모양은 `profile-107-batch2/step-a.json`에 있습니다. 계수 번들은 timing에 사용하지 않았습니다. AST의 조건부 생성 후보에는 키 집합이 고정인 경우도 보수적으로 포함했습니다.','',
  '| 선택 | 지점 | nested-d5-f4 | flat-500 | sample-0 | 판단 |',
  '| --- | --- | ---: | ---: | ---: | --- |',
  '| 선택 1 | `appendChildEntries.ts:39` binding 선언 spread | 1,364 | 500 | 2 | 생산자 14개 열거 키·순서 그대로 리터럴 가능. 후속 측정에서 flat 회귀로 기각 |',
  '| 미선택 | `mergeSingleStaticContribution.ts:64` 작성 schema 객체 | 1,365 | 501 | 3 | 작성 키와 필터에 따라 열거 키가 달라짐. undefined 필드를 추가하면 키 집합 변경; S01은 소유자 몫 |',
  '| 미선택 | `commitStaticFirstNode.ts:21–22` event 숫자 키 | 각 1,365 | 각 501 | 각 3 | enum 상수 키 하나인 고정 모양 리터럴이며 spread·가변 키 복사 없음 |',
  '| 미선택 | `assembleObject.ts:143` 결과 객체 | 341 | 1 | 1 | 작성된 자식 이름이 키를 결정하므로 고정 필드 리터럴 불가. 별도 Step B에서 Map/Set 작업만 제거 |','',
  '| 지점 | 파일:줄 | nested | flat | sample | 선택 여부·이유 |',
  '| --- | --- | ---: | ---: | ---: | --- |'];
for(const site of census.sites.toSorted((a,b)=>b.counts['nested-d5-f4']-a.counts['nested-d5-f4']||b.counts['flat-500']-a.counts['flat-500']||a.id-b.id)) {
  let reason;
  if(site.file.endsWith('/appendChildEntries.ts')&&site.line===39) reason='선택 1: 고정 선언 필드 순서의 리터럴 가능';
  else if(!Object.values(site.counts).some(Boolean)) reason='미선택: 세 fixture mount에서 0회';
  else if(site.category==='computed keys') reason='미선택: 상수 event 키의 고정 모양 리터럴';
  else if(site.category==='variable runtime keys'||site.category==='Object.create') reason='미선택: 작성 이름·조건에 따른 열거 키 집합 보존 필요';
  else if(site.category==='variable keys'&&site.file.endsWith('/populateNodeChildren.ts')) reason='미선택: 기존 필드 값 재대입; 이미 동일 순서 리터럴';
  else if(site.category==='variable keys') reason='미선택: 조건부 필드 추가·작성 키를 보존해야 함';
  else reason='미선택: 이미 고정 리터럴; 제거할 범용 키 복사 없음';
  lines.push(`| ${site.id}: ${site.category} | \`${site.file}:${site.line}\` | ${site.counts['nested-d5-f4']} | ${site.counts['flat-500']} | ${site.counts['sample-0']} | ${reason} |`);
}
lines.push('','### 측정·판정 조건','',
  '기존 `profile-104-owned/measure.mjs`의 production 종단 clock을 메모리 adapter로 유지했습니다. fresh process, 외부 강제 GC, warmup 20, 회차당 101 H/W 쌍, 표본마다 H/W 순서 교대, clone·관측·파일 쓰기는 clock 밖입니다. 64 microtask와 check-queue sentinel은 clock 안이며 두 판의 빈 종단을 같이 관측합니다. 매 행은 909개 paired H−W 차이를 pooled median으로 집계했고 canonical seed 101·1,999 bootstrap trials의 99% 구간을 사용했습니다. 모든 값의 단위는 ms이며 양수는 후보가 빠르다는 뜻입니다.','',
  '채택은 어떤 행의 구간 하한이 0보다 크고 중앙값이 같은 A/A 행 통계보다 큰 경우입니다. 회귀는 구간 상한이 0보다 작고 |중앙값|이 max(|A/A|, 해당 누적 기반 중앙값의 0.5%)를 넘는 경우입니다. 회귀 행이 하나라도 있으면 전부 기각했습니다. 구간 비교는 JSON의 원래 정밀도로 수행하며 표는 소수점 여섯 자리로 표시합니다. 따라서 극소 양수 하한은 표에서 0.000000으로 반올림될 수 있습니다. 개선 크기의 0.5% 하한은 추가하지 않았습니다.','',
  '### A/A — HEAD 대 HEAD 아홉 회차','');
lines.push(...table(summaries[0]));
const costs={
  '1-binding-literal':'고정 14개 필드 직접 읽기·쓰기로 spread를 제거하되 같은 객체 하나와 독립 gates/order 두 배열을 유지했습니다. 새 보유 자료는 없습니다. 측정 결과 flat 회귀로 소스·시험·DETAIL 모두 복원했습니다.',
  '2-declaration-slice':'collectDeclarations의 네 packed gates/order 복사를 native slice로 바꿨습니다. 같은 원소 수의 native 복사이며 배열 네 개와 별도 소유·개발 동결은 그대로입니다. 새 보유 자료는 없습니다.',
  '3-object-assembly':'local/extras/propertyKeys 없음과 entries/children 길이·순서·이름 동치를 확인하며 classic loop 한 번에서 실제 결과·names·stable shape·키 수를 생산합니다. 적격 호출의 Map/Set 두 객체와 원소 저장·중복 조회를 없앴고 기존 결과와 보유 stable shape는 유지합니다. 불일치 도중의 일시 결과·names는 보유하지 않습니다.',
  '4-default-choices':'options가 없으면 생성 때 동결한 동일 기본 choices에 연결하며 effective별 WeakMap 조회·등록을 유지합니다. 네 필드 choices 생산·freeze를 effective마다 없애고 모듈 상수 하나를 보유합니다. propertyKeys 해석과 사용자 배열의 독립 복사·동결은 유지합니다. schema 결과를 폼 사이에서 공유하지 않습니다.',
};
const proofs={
  '1-binding-literal':'변경 전/후 개발·운영의 59-schema 차등(collect 끔/켬), 소유·동결, path-key 및 binding 키 순서·재바인딩 시험 각 12건 통과. 동작 보존 refactor의 characterization을 먼저 실행했습니다.',
  '2-declaration-slice':'입력 소속 배열 iterator 계수는 변경 전 6회로 기대 0에 실패했고 변경 후 0회입니다. 개발·운영 owned-inline·path-key 각 21건 통과. fragment/declaration의 gates/order가 별도 배열임을 관측합니다.',
  '3-object-assembly':'올바른 constructor spy에서 변경 전 Map 1회로 기대 0에 실패했고 변경 후 Map/Set 모두 0회입니다. undefined·__proto__·같은 값 참조·선언/선호/extras fallback 키 순서 및 기존 차등·소유 시험을 포함하여 개발·운영 각 23건 통과했습니다.',
  '4-default-choices':'변경 전 optionless 두 effective의 freeze 2회로 기대 0에 실패했고 변경 후 0회입니다. 기본값의 같은 참조·생성 지점 동결과 옵션/propertyKeys 독립성을 확인했으며 개발·운영 각 25건 통과했습니다. 변경 전 mount choices 객체/동결 계수는 nested 1,365·flat 501·oneOf 5·sample 3회였고 제거 후 distinct 전체 동결 수는 운영/개발 각각 1,706/29,007·502/10,523·111/1,564·5/66입니다. 재동결·primitive 호출은 0이며 소속 배열 보호는 그대로입니다.',
};
for(const summary of summaries.slice(1)) {
  const phase=summary.phase;
  lines.push('',`### ${phase} — ${summary.adopted?'채택':'기각'}`,'',
    `측정 기반 source tree: \`${summary.builds.head.sourceTreeSha256}\`; 후보: \`${summary.builds.working.sourceTreeSha256}\`. 이전 채택분만 기반에 포함했습니다.`,
    '',costs[phase],'',proofs[phase],'',...table(summary));
  if(summary.adopted) {
    const manifest=read(phase+'-files');
    lines.push('',`개별 patch: \`profile-107-batch2/${phase}.patch\`. 파일과 DETAIL 줄:`, '');
    for(const file of manifest.files) lines.push(`- \`${file.file}\`${file.detailLines?`: DETAIL ${file.detailLines.join(', ')}줄`:''}`);
  } else lines.push('','기각 patch는 만들지 않았습니다. 다음 기반은 HEAD와 같은 source tree이며 신규 binding 시험은 삭제했습니다.');
}
lines.push('','### 종단 검증과 실행 검사','',
  `측정 프로세스 ${audit.timerWorkers}개, EOF로 닫힌 build service ${audit.buildWorkers}개, 행별 명령 ${audit.rowCommands}개, paired 표본 ${audit.pairedSamples.toLocaleString('en-US')}개입니다. 최대 측정 worker ${audit.maximumWorkerMs} ms, 최대 행별 명령 ${audit.maximumRowMs} ms이며 모두 순차·자연 종료했습니다. A/A가 먼저였고 누적 source tree·최종 source bytes·각 patch 기반과 최종 파일이 일치합니다. 번들·소스맵·instrumented copy·optimizer cache는 지정한 외부 bundles에만 두고 cacheDir을 설정하지 않았습니다. 설치와 git 쓰기는 하지 않았습니다.`, '',
  '| 패키지 명령 | 결과 | 자연 종료 ms |', '| --- | --- | ---: |');
for(const name of ['development','production','typecheck','lint','legacy']) {
  const check=read('check-'+name);
  const meaningful=check.summary.filter(line=>/Test Files|Tests |LEGACY_ISOLATED/.test(line)).map(line=>line.trim()).join('; ');
  const result=name==='development'?`허용 EVENT-070 4건만 실패; ${meaningful}`:check.exitCode===0?`통과${meaningful?'; '+meaningful:''}`:`실패 exit ${check.exitCode}`;
  lines.push(`| \`${check.command}\` | ${result} | ${check.elapsedMs} |`);
}
lines.push('',
  'Vitest는 설정 산출물과 결과 cache를 저장하지 않도록 runner·cache=false를 사용했고 기존 외부 optimizer symlink를 유지했습니다. production에서는 설정 로드 전에 NODE_ENV=production을 지정했습니다. typecheck에서 시험 spy의 불필요한 MapConstructor/SetConstructor 캐스트를 제거했으며 전후 emitted JavaScript가 바이트 동일함을 확인하여 전체 개발 검증을 재사용했습니다. 이후 같은 tsc 명령은 통과했습니다. lint의 Node 폐기 예정 경고는 오류가 아니며 legacy guard는 1,654개 파일을 검사했습니다.','',
  'Step A·측정 순서/통계·기각 복원/patch chain·요청 명령의 결과는 `census-audit.json`, `measurements-audit.json`, `patches-audit.json`, `check-*.json`에서 검사합니다. 모든 profile-107-batch2 파일은 각각 5 MB 이하입니다. 제품 시험은 런타임 값·참조·동결·키 순서·작업 수만 관측하며 제품 source text를 읽거나 파싱하지 않습니다. 감사 도구의 source hash 비교는 측정 대상/patch 파일 동일성을 검증합니다.','',
  'STOP: S01의 폼 간 유효 schema 결과 공유·새 정착 설계는 이 작업에서 제외하고 소유자에게 남겼습니다. 추가 STOP 항목은 없습니다.','');
const report=lines.join('\n'); assert(Buffer.byteLength(report)<=5_000_000);
fs.writeFileSync(path.join(directory,'report.md'),report);
if(process.argv[2]==='--patch') {
  const file=path.join(directory,'../remeasure-86c02.md');
  const original=fs.readFileSync(file,'utf8'); assert(!original.includes('## 107라운드 형태 고정과 남은 셋'));
  const tail=original.trimEnd().split('\n').slice(-10);
  console.log('*** Begin Patch\n*** Update File: '+path.relative(path.resolve(directory,'../../../../../../..'),file)+'\n@@\n'+
    tail.map(line=>' '+line).join('\n')+'\n+\n'+report.trimEnd().split('\n').map(line=>'+'+line).join('\n')+'\n*** End Patch');
} else console.log(`profile-107-batch2/report.md: ${Buffer.byteLength(report)} bytes, Step A와 50개 통계 행`);

/** Render one verified summary without inventing or recalculating a statistic. */
function table(summary) {
  return ['| fixture / 작업 | pooled paired 중앙값 | 99% 구간 | A/A 통계 | 기반 중앙값 | 0.5% 바닥 | 판정 |',
    '| --- | ---: | --- | ---: | ---: | ---: | --- |',...summary.rows.map(row=>
      `| ${row.name} ${modes[row.mode]} | ${fmt(row.pooledMedianMs)} | [${row.ci99Ms.map(fmt).join(', ')}] | ${fmt(row.aaStatisticMs)} | ${fmt(row.baseMedianMs)} | ${fmt(row.floorMs)} | ${row.verdict} |`)];
}
