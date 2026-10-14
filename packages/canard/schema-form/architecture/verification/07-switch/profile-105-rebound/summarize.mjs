// Explicit analysis CLI; derived reports go to stdout for native artifact writes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const work=path.dirname(fileURLToPath(import.meta.url)),directory=path.dirname(work);
const pkg=path.resolve(directory,'../../..'),repo=path.resolve(pkg,'../../..');
const HEAD='a958b37cbf7d7cd897565a06278ee141fd402816',started=Date.now();
const bundles='/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const fixtures=['nested-d5-f4','flat-500','oneOf-20','sample-0'];
const median=a=>a.toSorted((x,y)=>x-y)[Math.ceil(a.length/2)-1];
const read=f=>JSON.parse(fs.readFileSync(path.join(work,f+'.json'),'utf8'));
const sum=(o,p)=>Object.entries(o).filter(([k])=>p(k)).reduce((a,[,v])=>a+v,0);
const fn=(r,n)=>sum(r.counts,k=>k.startsWith('function|')&&k.endsWith('|'+n));
const metric=a=>{const s=a.toSorted((a,b)=>a-b);return {median:median(s),p5:s[Math.ceil(s.length*.05)-1],p95:s[Math.ceil(s.length*.95)-1],p99:s[Math.ceil(s.length*.99)-1]};};
const boot=values=>{
  let state=101;const medians=[];
  for(let trial=0;trial<1999;trial++){
    if(trial%100===0)assert(Date.now()-started<420000);
    const sample=[];for(let i=0;i<values.length;i++){state^=state<<13;state^=state>>>17;state^=state<<5;sample.push(values[(state>>>0)%values.length]);}
    medians.push(median(sample));
  }
  medians.sort((a,b)=>a-b);const center=median(values);
  return {center,ci95:[medians[49],medians[1949]],error99:Math.max(Math.abs(medians[9]-center),Math.abs(medians[1989]-center))};
};
const f=n=>n.toFixed(4),pct=n=>n.toFixed(2);
const table=(headers,rows)=>['| '+headers.join(' | ')+' |','| '+headers.map(()=>'---').join(' | ')+' |',...rows.map(r=>'| '+r.join(' | ')+' |')].join('\n');
const short=file=>file.replace('packages/canard/schema-form/src/','').replace('packages/winglet/','winglet/');
assert.equal(execFileSync('git',['--no-optional-locks','rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),HEAD);
execFileSync('git',['--no-optional-locks','diff','--quiet','HEAD','--','packages/canard/schema-form/src'],{cwd:repo});

const specs=[
  ['children-once','단일 ungated 자식 직접 전달','단일 변경','populateNodeChildren의 단일 conjunction·ungated object 경로에서 eager Object.entries snapshot을 곧바로 build에 전달하십시오. 중간 properties Map과 재열거를 제거하고 기존 binding producer·DFS·정적 검사를 유지하십시오.','child enumeration once','children-replay'],
  ['children-replay','자식 입력·binding replay','전체 작업 제거','children-once와 같은 직접 전달 명세입니다. replay에는 binding 생산까지 들어가므로 공개 결과를 생산하는 실제 변경의 회수 시간은 별도입니다.','child enumeration once','children-once'],
  ['declarations-replay','선언 collector 결과·상태 replay','전체 작업 제거','collectDeclarations의 recursive 반환 flatten을 최종 소유자별 단일 ordered sink로 바꾸십시오. ID 예약·fragment 연결·capability·진단은 기존 DFS 위치에 두고 최종 공개 배열은 그대로 생산하십시오.','declaration collection once','declaration-sink'],
  ['declaration-sink','선언 ordered sink','단일 변경','recursive 반환 배열의 복사를 단일 sink로 없애십시오. 현재 네 fixture에서 이 변경 자체의 이득은 잡음 밖으로 입증되지 않았습니다.','declaration collection once','declarations-replay'],
  ['path-strings-replay','경로·template 문자열 replay','전체 작업 제거','getTemplateKey의 private 동치 관계를 유지하는 occurrence/context/ordered gate tuple key를 한 번 구성하고 host-bound key가 그 문자열을 다시 JSON 인코딩하지 않게 하십시오. 공개 schema/data 경로 및 순서는 그대로 생산하십시오.','path construction once','template-replay'],
  ['template-replay','getTemplateKey replay','부분 작업 제거','같은 내부 tuple key 단일 구성 명세입니다. 현재 단순 문자열 연결과 classic-loop 변형은 그 전체 예산을 회수하지 못했습니다.','path construction once','path-key-once'],
  ['projected-once','투영 값 재사용·coarse invalidation','재사용 범위','값 계산 순서를 유지하는 readProjectedValue의 JSON Pointer token 해석만 같은 path에서 재사용하십시오. 값 결과 memo의 일반 채택은 이 측정으로 정당화되지 않습니다.','projected reads reused','projected-tokens'],
  ['projected-first','mount·첫 공개 전이 한정 투영 재사용','재사용 범위','load 및 같은 root의 첫 non-load context만 memo 대상입니다. 후속 context는 원래 읽기를 실행합니다. token 재사용만 범위 내 단일 변경으로 제안합니다.','projected reads reused, initial lifetime','projected-tokens'],
  ['projected-tokens','투영 읽기 path token 재사용','단일 변경','동일 JSON Pointer의 split·unescape 결과만 재사용하고 projection·extras·flush는 매번 원래 순서로 읽으십시오.','projected read parsing','projected-once'],
  ['blueprint-replay','전체 정적 그래프 replay','중첩 전체 예산','buildNodes에서 단일 conjunction의 group.declarations를 중간 owned/conjunction 배열로 다시 복사하는 작업만 제거하십시오. node-membership-once의 실제 이득은 미입증입니다. 전체 blueprint 공유를 수정 명세로 제안하지 않습니다.','buildNodes and blueprint inclusive','node-membership-once'],
  ['node-membership-once','단일 conjunction membership 중간 복사 제거','단일 변경','공개 필드·순서·validationOnly 처리가 같음을 증명한 단일 conjunction에서 내부 group 배열을 직접 소비하십시오.','buildNodes own work','blueprint-replay'],
  ['assembly-replay','assembleObject 결과 replay','전체 작업 제거','첫 plain object assembly에서 확인된 preferred/children 순서 일치를 이용해 값 객체를 classic loop로 한 번 생산하십시오. extras·중복 이름·기존 shape 갱신은 일반 경로에 두십시오.','assembly','assembly-first-plain'],
  ['delivery-replay','첫 delivery payload·revision replay','전체 작업 제거','EMPTY previous와 UpdateValue|RequestRefresh의 첫 mask만 기존 undefined/증가 값을 보존하는 조밀한 counter literal로 초기화하십시오. private counter 소유권과 새 ledger 참조를 유지하십시오. 이 좁은 후보 자체의 개선은 미입증입니다.','first delivery','revision-dense-first'],
  ['selection-replay','active declaration 선택 결과 replay','부분 작업 제거','단일 declaration edge의 immutable 단일 ID 목록을 entry별로 한 번 생산하고 성공 시 사용하십시오. gate 호출·flush·throw 및 선택 순서는 전부 유지하십시오.','selection','selection-lazy'],
  ['selection-lazy','inactive edge의 선택 배열 지연 생성','단일 변경','첫 admitted declaration에서 active/ID 배열을 생성하십시오. 현재 이 좁은 변경의 개선은 미입증입니다.','selection','selection-replay'],
  ['flush-reads-zero','flushPendingGateReads 전체 생략','전체 작업 제거','READ_PLANS의 occurrence·bound dependency에 JSON Pointer token/첫 segment를 한 번 바인딩하고 순수 경로 해석을 재사용하십시오. pending output 검사와 실제 flush 시점은 유지하십시오.','pending gate read plan','dependency-paths-once'],
  ['recalculation-replay','역의존·dirty 경로 결과 replay','전체 작업 제거','registerRecalculation에서 affected owner 경로를 최초 등장 순서대로 한 번 모아 반복 prefix slicing과 세 집합의 중복 등록을 제거하십시오. 기존 dirty 순서와 affected 관계를 유지하십시오.','recalculation','dependency-replay'],
  ['assembly-first-plain','첫 plain object 직접 assembly','단일 변경','preferred/children 순서가 같은 최초 plain object만 Map/Set 수집 없이 classic loop로 생산하십시오. 현재 개선은 미입증입니다.','assembly','assembly-replay'],
  ['dependency-replay','역의존 index replay','전체 작업 제거','DependencyIndex.add에서 같은 watchedPath의 encoded token을 index construction 동안 한 번 해석하고 재사용하십시오. wildcard/owner 비교와 최초 owner 삽입 순서를 유지하십시오.','index building','index-declarations-needed'],
  ['dependency-paths-once','host·authored dependency 경로 memo','단일 변경','같은 host/authored dependency의 순수 문자열 해석을 occurrence binding 동안 재사용하고 host rekey 때 다시 해석하십시오.','path resolution','dependency-replay'],
  ['gates-replay','gate 결과 occurrence replay','전체 작업 제거','evaluateGate의 dependencies.map callback을 동일 읽기 순서의 고정 길이 classic loop로 교체하십시오. 평가 함수는 매회 호출하고 catch·gateThrowVersion·오류 occurrence를 유지하십시오. 결과 memo는 제안하지 않습니다.','gate evaluation','gate-active-input-zero'],
  ['freeze-remainder','남은 Object.freeze 전체 생략','전체 작업 제거','공개 유효 스키마·옵션·entry view의 frozen 계약을 유지한 채 이미 frozen인 값의 중복 작업만 제거할 수 있습니다. 본 fixture에서 동일 객체 중복 동결과 이득은 입증되지 않았습니다.','remaining freezes',null],
  ['path-key-once','bound key의 재직렬화 대신 직접 연결','단일 변경','기존 template/host 동치 관계를 보존하는 private key 연결입니다. 현재 네 fixture에서 개선은 미입증입니다.','path construction once','path-strings-replay'],
  ['revision-dense-first','첫 두 bit mask의 조밀 counter literal','단일 변경','첫 두 bit mask만 literal로 초기화하고 다른 previous/mask는 기존 경로를 유지하십시오. 현재 개선은 미입증입니다.','first delivery','delivery-replay'],
  ['fragment-empty-fast','fragment 없는 선언의 빠른 종료','단일 변경','기존 제어·타입 검사·capability·ID·fragment 기록 뒤, $ref/allOf/if/oneOf/anyOf가 없을 때 visiting stack 및 고정 fragment keyword loop 생성을 생략하십시오.','declaration collection','declarations-replay'],
  ['template-key-classic','template key의 map/filter를 classic loop로','단일 변경','key JSON bytes, gate·appliesWhen의 최초 등장 순서와 중복 규칙을 그대로 보존하는 classic loop를 쓰십시오. 현재 개선은 미입증입니다.','path construction once','template-replay'],
  ['gate-active-input-zero','active gate의 미사용 host/input 생성 생략','단일 변경','active expression이 읽지 않는 host/input scratch 객체만 생략하고 dependency reads와 실제 평가를 유지하십시오. 현재 개선은 미입증입니다.','gate evaluation','gates-replay'],
  ['index-declarations-needed','명시적 dependency가 없으면 ID lookup 수집 생략','단일 변경','DependencyIndex에서 명시적 dependency ID가 없을 때만 declaration lookup Map 생산을 생략하십시오. expression 및 derive watch index는 유지하십시오. 현재 개선은 미입증입니다.','index building','dependency-replay'],
].map(([id,title,kind,fixSpec,workKind,narrow])=>({id,title,kind,fixSpec,workKind,narrow,ledgerQuestion:false}));

const counts=Object.fromEntries(fixtures.map(n=>[n,Object.fromEntries(['head','old'].map(v=>[v,read('counts-'+v+'-'+n)]))]));
for(const n of fixtures)assert.equal(counts[n].head.observed.sha256,counts[n].old.observed.sha256);
const defs=[
  ['type-read','타입·허용 타입 읽기',r=>fn(r,'readAllowedTypes'),r=>fn(r,'extractSchemaInfo'),'old는 타입 외 정보도 추출합니다.'],
  ['schema-read','object schema 읽기',r=>fn(r,'readSchemaObject'),r=>fn(r,'extractSchemaInfo'),'type-read와 중복되므로 합산하지 않습니다.'],
  ['merge-entry','유효 스키마 병합 입구',r=>fn(r,'mergeSchemaContributions'),r=>fn(r,'processAllOfSchema'),'HEAD의 채택된 single-contribution 빠른 경로를 포함합니다.'],
  ['general-contribution','범용 기여 적용',r=>fn(r,'applySchemaContribution'),r=>fn(r,'getMergeSchemaHandler'),'단순 HEAD에서 0회인 것은 단일 기여 처리까지 0회라는 뜻이 아닙니다.'],
  ['freeze','Object.freeze',r=>sum(r.counts,k=>k.startsWith('freeze|')),r=>sum(r.counts,k=>k.startsWith('freeze|')),'최종 유효 스키마·옵션·entry view 등이 남습니다.'],
  ['declarations','선언·fragment 방문',r=>fn(r,'collectDeclarations'),r=>fn(r,'getStackEntriesForNode'),'old는 공개 declaration 기록 대신 reference scanner 방문을 대응시킵니다.'],
  ['fragment-enumeration','fragment keyword 검사',r=>sum(r.counts,k=>/^loop\|.*collectDeclarations\.ts:142\|/.test(k)),r=>sum(r.counts,k=>/^loop\|.*getStackEntriesForNode\.cjs:.*\|pushSchemaListChildren$/.test(k)),'HEAD의 5 keyword 검사와 old의 실제 schema-list 원소는 다른 단위입니다.'],
  ['child-enumeration','자식 입력 호스트 열거',r=>fn(r,'populateNodeChildren'),r=>fn(r,'pushMapChildren'),'호스트 수이며 edge 원소 수와 구분합니다.'],
  ['path-construction','경로 문자열 생산 site',r=>sum(r.counts,k=>k.startsWith('path-string|')),r=>sum(r.counts,k=>k.startsWith('path-string|')),'AST site 계수이며 전체 문자열 할당 수는 아닙니다. JSON key는 다음 행입니다.'],
  ['template-key','template/host-bound key 생성',r=>fn(r,'getTemplateKey')+sum(r.counts,k=>/^path-operation\|.*\/buildNodes\.ts:\d+\|buildNodes$/.test(k)),()=>0,'host-bound JSON stringify의 HEAD 위치는 원시 계수에도 보존합니다.'],
  ['dependency-index','역의존 index 생성',r=>fn(r,'DependencyIndex.constructor'),r=>fn(r,'getPathManager'),'getter와 실제 생성은 구분합니다.'],
  ['index-insertion','의존 경로 등록',r=>fn(r,'DependencyIndex.add'),r=>sum(r.counts,k=>/^function\|.*getPathManager\.ts:.*\|set$/.test(k)),'등록 입구와 unique watch/owner 수는 다릅니다.'],
  ['path-index','PathStoreIndex.add',r=>fn(r,'PathStoreIndex.add'),()=>0,'old에 같은 index 구조는 없습니다.'],
  ['dependency-path','상대 의존 경로 해석',r=>fn(r,'resolveDependencyPath'),r=>sum(r.counts,k=>/^function\|.*getPathManager\.ts:.*\|set$/.test(k)),'old set은 expression 등장 수이며 매회 재해석 횟수가 아닙니다.'],
  ['gates','gate 평가',r=>fn(r,'evaluateGate'),r=>fn(r,'getSimpleEquality.callback'),'old는 단순 equality 사전 selector입니다.'],
  ['projection','투영 값 읽기',r=>fn(r,'readProjectedValue'),r=>fn(r,'getSimpleEquality.callback'),'old의 selector가 dependency 배열 값을 읽는 호출을 대응시킵니다.'],
  ['initial-revision','17개 initial previous bit 읽기',r=>fn(r,'SchemaNodeRevisionLedger.constructor.callback'),()=>0,'채택된 EMPTY 및 native ledger 경로에서 생략됐습니다.'],
];
const workKinds=defs.map(([id,title,h,o,note])=>({id,title,note,fixtures:fixtures.map(name=>{
  const N=counts[name].head.dimensions.blueprintNodes;
  return {name,templateNodes:N,head:{perMount:h(counts[name].head),perTemplateNode:h(counts[name].head)/N,perLiveNode:h(counts[name].head)/counts[name].head.dimensions.liveNodes},old:{perMount:o(counts[name].old),perTemplateNode:o(counts[name].old)/N,perLiveNode:o(counts[name].old)/counts[name].old.dimensions.liveNodes}};
})}));

const cpu=[];
for(const name of fixtures.slice(0,3))for(const version of ['head','old']){
  const records=[1,2,3].map(r=>read('cpu-'+version+'-'+name+'-r'+r)),functions=new Map();
  let denominatorUs=0,samples=0,windowUs=0;
  for(const row of records){assert.equal(row.HEAD,HEAD);assert.equal(row.warmup,20);assert.equal(row.samples,101);assert.equal(row.forcedGC,false);assert.equal(row.counterInstrumentation,false);assert.equal(row.clonePreparation,'101 schemas before Profiler.start');assert(Math.abs(row.cpu.selfConservation-row.cpu.denominatorUs)<.01);denominatorUs+=row.cpu.denominatorUs;samples+=row.cpu.samples;windowUs+=row.cpu.windowUs;
    for(const x of row.cpu.functions){const key=x.function+'|'+x.file+':'+x.line+':'+x.column;let item=functions.get(key);if(!item)functions.set(key,item={function:x.function,file:short(x.file),line:x.line,column:x.column,selfUs:0,totalUs:0});item.selfUs+=x.selfUs;item.totalUs+=x.totalUs;}}
  const all=[...functions.values()].map(x=>({...x,selfPct:x.selfUs/denominatorUs*100,totalPct:x.totalUs/denominatorUs*100,selfUsPerMount:x.selfUs/303,totalUsPerMount:x.totalUs/303}));
  cpu.push({name,version,mounts:303,samplingIntervalUs:100,samples,denominatorUs,windowUs,gcPct:all.filter(x=>x.function==='(garbage collector)').reduce((a,x)=>a+x.selfPct,0),programPct:all.filter(x=>x.function==='(program)').reduce((a,x)=>a+x.selfPct,0),topSelf:all.toSorted((a,b)=>b.selfUs-a.selfUs).slice(0,20),topTotal:all.toSorted((a,b)=>b.totalUs-a.totalUs).slice(0,20),allFunctions:all,files:[1,2,3].map(r=>'cpu-'+version+'-'+name+'-r'+r+'.json')});
}

const noiseControls={},bounds=[];
for(const name of fixtures){
  const controls=['control','control-after','control-final'].flatMap(v=>[1,2,3].map(run=>{const row=read(v+'-'+name+'-forced-r'+run);assert.equal(row.bundleHashes.head,row.bundleHashes.variant);return {id:v,run,gainMs:row.boundMs,pairedMedianMs:median(row.pairedDeltasMs),file:v+'-'+name+'-forced-r'+run+'.json'};}));
  const noOpNoiseMs=Math.max(...controls.flatMap(x=>[Math.abs(x.gainMs),Math.abs(x.pairedMedianMs)]));noiseControls[name]={noOpNoiseMs,controls};
  for(const spec of specs){const records=[1,2,3].map(run=>read(spec.id+'-'+name+'-forced-r'+run));
    const runs=records.map(row=>{assert.equal(row.HEAD,HEAD);assert.equal(row.warmup,20);assert.equal(row.samples,101);assert.equal(row.actualMounts.head,121);assert.equal(row.actualMounts.variant,121);assert.equal(row.observations.head.sha256,row.observations.variant.sha256,spec.id+'/'+name);assert.equal(row.bundleHashes.head,read('build-head').sha256);assert.equal(row.bundleHashes.variant,read('build-'+spec.id).sha256);assert.equal(row.timingsMs.head.length,101);assert.equal(row.timingsMs.variant.length,101);assert(row.elapsedMs<480000);
      const ordered=row.windows.filter(x=>x.index>=0);for(let i=0;i<101;i++){const first=i%2===(row.run%2?0:1)?'head':'variant';assert.equal(ordered[i*2].version,first);assert.equal(ordered[i*2+1].version,first==='head'?'variant':'head');}
      const residual=[...row.emptyTimingsMs.before,...row.emptyTimingsMs.after].map(x=>Math.abs(x-row.correction)).sort((a,b)=>a-b);
      const headError99=boot(row.timingsMs.head).error99,variantError99=boot(row.timingsMs.variant).error99,paired=boot(row.pairedDeltasMs);
      const noiseMs=Math.max(.001,noOpNoiseMs,residual[Math.ceil(residual.length*.95)-1]+headError99+variantError99);
      return {run:row.run,headMs:row.metrics.head.median,workingMs:row.metrics.variant.median,gainMs:row.boundMs,noiseMs,headError99,variantError99,pairedMedianMs:paired.center,pairedCi95:paired.ci95,aboveNoise:row.boundMs>noiseMs&&paired.ci95[0]>0,file:spec.id+'-'+name+'-forced-r'+row.run+'.json'};
    });
    bounds.push({id:spec.id,name,kind:spec.kind,title:spec.title,headMs:median(runs.map(x=>x.headMs)),workingMs:median(runs.map(x=>x.workingMs)),gainMs:median(runs.map(x=>x.gainMs)),gainRangeMs:[Math.min(...runs.map(x=>x.gainMs)),Math.max(...runs.map(x=>x.gainMs))],maxNoiseMs:Math.max(...runs.map(x=>x.noiseMs)),aboveNoise:runs.every(x=>x.aboveNoise),verdict:runs.every(x=>x.aboveNoise)?'↑ 잡음 밖':'≈ 미입증',runs});
  }
}

const mounts=[];
for(const name of fixtures){const rows=[1,2,3].map(run=>read('verdict-'+name+'-r'+run));
  const runs=rows.map(row=>{assert.equal(row.HEAD,HEAD);assert.equal(row.samples,101);assert.equal(row.callbackExecutionMs.length,101);assert.equal(row.observations.head.sha256,row.observations.old.sha256);assert(row.ordering.every(x=>x.pendingAtSentinel===0&&x.tailScheduled===0&&x.tailExecuted===0));assert.equal(row.headBoundary.scheduled,0);
    const empty=[...row.emptyTimingsMs.before,...row.emptyTimingsMs.after],C=median(empty.map(x=>x[1])),M=median(empty.map(x=>x[0]));
    const head=row.timingsMs.head.map(x=>x[1]-C),headMicro=row.timingsMs.head.map(x=>x[0]-M),oldTerminal=row.timingsMs.old.map(x=>x[1]-C),oldSum=row.timingsMs.old.map((x,i)=>x[0]-M+row.callbackExecutionMs[i]);
    const residual=empty.map(x=>Math.abs(x[1]-C)).sort((a,b)=>a-b),p95=residual[Math.ceil(residual.length*.95)-1];
    const oldNoiseMs=Math.max(.001,p95+boot(oldTerminal).error99+boot(oldSum).error99),headNoiseMs=Math.max(.001,p95+boot(head).error99+boot(headMicro).error99);
    const headDeltaMs=median(head)-median(headMicro),oldDeltaMs=median(oldTerminal)-median(oldSum);
    assert(Math.abs(headDeltaMs)<=headNoiseMs,'95C-01 (가) failed '+name);
    return {run:row.run,head:metric(head),headMicro:metric(headMicro),oldTerminal:metric(oldTerminal),oldMicroPlusCallbacks:metric(oldSum),emptyTerminalMs:C,emptyMicroMs:M,headDeltaMs,headNoiseMs,oldDeltaMs,oldNoiseMs,oldAgreement:Math.abs(oldDeltaMs)<=oldNoiseMs,file:'verdict-'+name+'-r'+row.run+'.json'};
  });
  const oldColumn=runs.every(x=>x.oldAgreement)?'종단':'(나) microtask + callback 합';
  const field=oldColumn==='종단'?'oldTerminal':'oldMicroPlusCallbacks';
  const headMs=median(runs.map(x=>x.head.median)),oldMs=median(runs.map(x=>x[field].median));
  mounts.push({name,headMs,oldMs,ratio:headMs/oldMs,oldColumn,ratioRuns:runs.map(x=>x.head.median/x[field].median),verdict:'mount 미달: 새/구 > 1',runs});
}

const sourceCoverage=cpu.filter(x=>x.version==='head').flatMap(row=>row.allFunctions.filter(x=>x.totalPct>=5&&!x.file.startsWith('(')&&!x.file.startsWith('node:')).map(x=>{
  let ids;
  if(/populateNodeChildren/.test(x.file))ids=['children-once','children-replay'];
  else if(/collectDeclarations/.test(x.file))ids=['declarations-replay','declaration-sink','fragment-empty-fast'];
  else if(/getTemplateKey/.test(x.file))ids=['template-replay','path-strings-replay'];
  else if(/buildNodes|blueprint\.ts|buildSchemaNodeTree/.test(x.file))ids=['blueprint-replay','node-membership-once','path-strings-replay'];
  else if(/commitStaticFirstNode/.test(x.file))ids=['delivery-replay','revision-dense-first'];
  else if(/assembleObject|assembleStaticFirstNode/.test(x.file))ids=['assembly-replay','assembly-first-plain'];
  else if(/readProjectedValue/.test(x.file))ids=['projected-once','projected-first','projected-tokens'];
  else if(/evaluateGate/.test(x.file))ids=['gates-replay','projected-once'];
  else if(/selectChildren/.test(x.file))ids=['selection-replay','selection-lazy','gates-replay'];
  else if(/flushPendingGateReads/.test(x.file))ids=['flush-reads-zero'];
  else if(/resolveDependencyPath/.test(x.file))ids=['dependency-paths-once'];
  else if(/getDependencyIndex/.test(x.file))ids=['dependency-replay','index-declarations-needed'];
  else if(/registerRecalculation/.test(x.file))ids=['recalculation-replay'];
  else if(/loadStaticFirstTree|loadSchemaNodeAtMount|dispatchMount|mountSchemaNode/.test(x.file))ids=['delivery-replay','assembly-replay','selection-replay','gates-replay'];
  else if(/computeNode|finishSettlement|writeSchemaNode|transitionSettlement/.test(x.file))ids=['selection-replay','gates-replay','flush-reads-zero','recalculation-replay'];
  else if(/nodeFromJSONSchema/.test(x.file))ids=['blueprint-replay','delivery-replay','assembly-replay','selection-replay'];
  else throw new Error('Uncovered >=5% source function '+x.file+':'+x.line);
  return {name:row.name,function:x.function,file:x.file,line:x.line,selfPct:x.selfPct,totalPct:x.totalPct,ids,interpretation:'내부 단계 또는 자손의 제거 범위; 부모 자체·필수 출력 비용 전부를 제거한 단일 변경 상한은 아닙니다.'};
}));

const processFiles=fs.readdirSync(work).filter(x=>x.startsWith('process-')&&x.endsWith('.json'));
const processes=processFiles.map(file=>({file,...JSON.parse(fs.readFileSync(path.join(work,file),'utf8'))}));
const validProcesses=processes.filter(x=>x.status===0),workers=validProcesses.filter(x=>['--timer-worker','--cpu-worker','--count-worker','--verdict-worker'].includes(x.command)).sort((a,b)=>Date.parse(a.started)-Date.parse(b.started));
for(let i=1;i<workers.length;i++)assert(Date.parse(workers[i].started)>=Date.parse(workers[i-1].ended),'Worker overlap');
assert(validProcesses.every(x=>x.signal===null&&x.elapsedMs<480000));
const artifactFiles=fs.readdirSync(work).filter(x=>fs.statSync(path.join(work,x)).isFile()).map(file=>({file,bytes:fs.statSync(path.join(work,file)).size}));
assert(artifactFiles.every(x=>x.bytes<=5000000));assert(!artifactFiles.some(x=>/\.(cjs|map)$|cache/.test(x.file)));
const invalid=['projected-once','projected-first','gates-once'].map(id=>{const row=read('invalid-'+id+'-oneOf-20-forced-r1');assert.notEqual(row.observations.head.sha256,row.observations.variant.sha256);return {id,headValue:row.observations.head.value,workingValue:row.observations.variant.value,file:'invalid-'+id+'-oneOf-20-forced-r1.json',reason:'payload가 사라져 제거된 read/gate 외 작업이 섞입니다. 정상 bound와 순위에서 제외했습니다.'};});
const ranked=bounds.filter(x=>x.aboveNoise).toSorted((a,b)=>b.gainMs-a.gainMs);
const narrowRank=ranked.filter(x=>x.kind==='단일 변경');
const summary={HEAD,scope:'측정·귀속만 수행했습니다. git 쓰기·설치·제품 코드 변경은 없습니다.',protocol:{verdict:'95C-01',warmup:20,samplesPerRun:101,runs:3,forcedGCOutsideClock:true,alternatingOrderPerMeasuredSample:true,validation:'off',subscribers:0,endpoint:'64 Promise checkpoints + same-check-queue setImmediate sentinel',noise:'max(1 µs, 9 byte-identical controls의 |difference of medians|·|paired median|, 빈 종단 잔차 p95 + 두 median bootstrap 99% error). 3회 각각 초과하고 paired bootstrap 95% 하한 > 0.',bootstrap:{resamples:1999,seed:101},cpu:{freshProcess:true,warmup:20,mounts:101,runs:3,intervalUs:100,forcedGC:false,counters:false,clonesPreparedBeforeProfiler:true,denominatorIncludes:['(garbage collector)','(program)','(idle)','driver'],recursiveTotalsDeduplicated:true}},environment:read('cpu-head-nested-d5-f4-r1').environment,mounts,noiseControls,workKinds,dimensions:Object.fromEntries(fixtures.map(n=>[n,{head:counts[n].head.dimensions,old:counts[n].old.dimensions}])),cpu:cpu.map(({allFunctions,...x})=>x),coverageAtLeastFivePct:sourceCoverage,specs,bounds,ranked:ranked.map(x=>({id:x.id,name:x.name,gainMs:x.gainMs,kind:x.kind})),narrowRank:narrowRank.map(x=>({id:x.id,name:x.name,gainMs:x.gainMs})),invalid,ledgerQuestions:{recommendedFixSpecs:'없습니다. 모두 평가 순서·공개 결과·기존 settlement 계약을 보존하는 내부 작업 제거 명세입니다.',scopeExpansion:['projection 값/result memo를 일반 epoch 계약으로 채택할지: 이 보고서는 채택 근거를 제공하지 않습니다.','form/mount 간 blueprint 또는 runtime tree 공유를 도입할지: round 104의 현재 허용 범위에 들어가지 않습니다.'],smallFormUpdates:'round 104의 수용 결정을 다시 질문하지 않습니다.'},audit:{workers:workers.length,naturalZeroExitProcesses:validProcesses.length,maxWorkerMs:Math.max(...workers.map(x=>x.elapsedMs)),maxCommandMs:Math.max(...validProcesses.map(x=>x.elapsedMs)),overlap:false,productSourceDiff:false,bundlesDirectory:bundles,artifactMaxBytes:Math.max(...artifactFiles.map(x=>x.bytes)),driverSha256:createHash('sha256').update(fs.readFileSync(path.join(work,'measure.mjs'))).digest('hex'),timerDriverNote:'측정 중간에 추가된 것은 변형·CPU clone preparation·별도 verdict worker입니다. 기본 forced timer 구현은 같은 profile-102 원본을 계속 사용했습니다.'}};

const sections=[];
sections.push('# 105: HEAD에서 남은 mount 작업량과 제거 범위\n\n`'+HEAD+'`에서 새 엔진과 `src/__legacy__` 0.16.0 스냅샷을 source-backed production bundle로 측정했습니다. 현재 네 mount 비율은 모두 1보다 큽니다. 작은 form update의 round 104 수용 결정은 이 작업의 대상 밖입니다.\n\n실제 단일 변경으로 잡음 밖에 남은 후보는 `children-once`(nested·flat)와 `fragment-empty-fast`(flat)입니다. 전체 replay의 큰 이득은 필수 공개 결과 생산과 자손 작업까지 포함하므로 그대로 한 패치의 절약 시간으로 해석할 수 없습니다.');
sections.push('## 현재 mount 판정열\n\n'+table(['fixture','새 ms','구 공식 ms','새/구','구 선택','회차별 비율'],mounts.map(x=>[x.name,f(x.headMs),f(x.oldMs),f(x.ratio)+'×',x.oldColumn,x.ratioRuns.map(f).join(' / ')]))+'\n\n표는 회차별 median의 median이며 비율은 표시한 새/구 median으로 계산했습니다. 기존 판정표의 old 선택을 고정하지 않고 현재 세 회차에서 (가)/(나)를 다시 판정했습니다. 한 회차라도 old 종단과 합이 잡음 밖이면 그 fixture의 세 회차 모두 합을 사용합니다. microtask와 callback은 회차 내 순번별로 합치고 C/M은 같은 202개 빈 호출의 pooled median입니다. callback boundary는 공식 표본 후의 별도 진단에서만 감쌌습니다. 모든 old sentinel의 pending=0 및 추가 128 checkpoints/다음 sentinel의 추가 예약·실행=0, 새 엔진 예약=0을 확인했습니다.\n\n'+table(['fixture/run','새 종단−micro ms / 잡음','구 종단−합 ms / 잡음','(나) 일치'],mounts.flatMap(x=>x.runs.map(r=>[x.name+'/'+r.run,f(r.headDeltaMs)+' / '+f(r.headNoiseMs),f(r.oldDeltaMs)+' / '+f(r.oldNoiseMs),r.oldAgreement?'예':'아니요']))));
sections.push('## 계측 조건과 한계\n\n'+JSON.stringify(summary.environment)+'\n\n각 timing worker는 fresh process에서 H/W 엔진별 warmup 20과 101 쌍을 수행했습니다. 측정 표본의 순서는 회차 1/3 H 시작, 2 W 시작으로 매 표본 교대합니다. schema clone, 명시적 GC 및 GC 뒤 check anchor는 clock 밖이며 64 Promise checkpoints 후 same-check-queue sentinel까지 잰 공통 empty 보정 verdict 열입니다. 계수 bundle과 CPU profile은 timing에 사용하지 않았습니다.\n\nCPU는 fresh process마다 warmup 20 뒤 101 consecutive mounts를 100 µs interval로 3회 수집했습니다. 101개의 schema clone을 Profiler.start 전에 준비하여 짧은 old mount의 경계에서 clone stack이 mount에 섞이는 문제를 줄였습니다. 표본 timeDelta를 모든 mount window와 교차 가중하고 GC/program/idle/driver를 분모에 남겼습니다. 재귀 total은 같은 frame당 한 번만 셉니다. old oneOf의 표본은 적어 작은 함수 간 순위는 변동할 수 있습니다. V8 inline 비용은 caller self에 잡힐 수 있으며 inclusive total끼리 합산하지 않습니다.\n\nreplay는 첫 warmup의 성공 fixture 결과를 발생 순서로 재사용하는 낙관적 작업 제거입니다. 제거 대상의 public view 생산·진단·referential contract를 우회할 수 있고 replay/memo lookup 비용도 들어갑니다. 따라서 수학적 상한 또는 검증된 일반 구현 성능이 아닙니다. narrow 변경은 같은 성공 fixture 값 hash를 확인했으나 전체 Blueprint observable·오류·callback 계약 검증은 수행하지 않았습니다. 제품 시험/빌드는 요청 범위 밖이므로 실행하지 않았습니다.');
sections.push('## 노드당 작업 계수\n\n각 셀은 `HEAD mount당 / old mount당 (HEAD template-node당 / old potential-node당)`입니다. old oneOf는 63개 runtime 후보를 만들고 live는 6개입니다. 정적 분모는 HEAD template N=63을 old에도 적용하고 runtime용 live 분모는 JSON에 따로 제공합니다. 서로 다른 역할이나 중복 site를 더해 총 작업량으로 만들지 마십시오.\n\n'+table(['작업',...fixtures],workKinds.map(x=>[x.title,...x.fixtures.map(r=>r.head.perMount+' / '+r.old.perMount+' ('+r.head.perTemplateNode.toFixed(3)+' / '+r.old.perTemplateNode.toFixed(3)+')')]))+'\n\n'+workKinds.map(x=>'- '+x.title+': '+x.note).join('\n')+'\n\nHEAD 단순 mount의 initial previous 17-bit 읽기는 0입니다. single-contribution 빠른 경로는 병합 입구 수를 없애지 않고 범용 기여 적용을 제거했습니다. 남은 freeze는 nested 3071, flat 1003, oneOf 116, sample 8이며 producer-owned inline 동결의 과거 상한을 다시 더하지 않았습니다. 원시 AST 함수/loop/path site와 문자열 총량은 `counts-*.json`에 남겼습니다.');
sections.push('## 계수 없는 steady CPU: self/total top 20\n\n'+table(['fixture/엔진','mounts','표본','분모 ms','GC %','program %'],cpu.map(x=>[x.name+'/'+x.version,x.mounts,x.samples,f(x.denominatorUs/1000),pct(x.gcPct),pct(x.programPct)])));
for(const x of cpu){for(const [title,list] of [['self 순',x.topSelf],['total 순',x.topTotal]])sections.push('### '+x.name+' / '+(x.version==='head'?'HEAD':'0.16.0')+' / '+title+'\n\n'+table(['함수·원본 위치','self %','total %','self µs/mount','total µs/mount'],list.map(r=>['`'+r.function+'` · `'+r.file+':'+r.line+'`',pct(r.selfPct),pct(r.totalPct),pct(r.selfUsPerMount),pct(r.totalUsPerMount)])));}
sections.push('## HEAD의 total ≥5% 함수와 상한 연결\n\n부모/dispatch 단계는 제거할 독립 작업이 아니라 자손 단계들의 누적 범위입니다. 그 행은 연결한 leaf/phase bound로 귀속하며 self와 필수 출력 비용 전부가 같은 단일 수정으로 없어지는 것으로 판정하지 않았습니다. GC/program/idle는 분모에 포함한 VM/driver 항목이고, 강제 GC를 clock 밖에 둔 verdict에서 독립 GC 시간을 빼는 상한으로 변환하지 않았습니다. old 함수는 고정 비교판의 귀속이며 수정 대상은 HEAD입니다.\n\n'+table(['fixture','함수·위치','self / total %','연결한 제거 범위'],sourceCoverage.map(x=>[x.name,'`'+x.function+'` · `'+x.file+':'+x.line+'`',pct(x.selfPct)+' / '+pct(x.totalPct),x.ids.join(', ')])));
sections.push('## 95C-01 작업 제거 범위와 verdict\n\n잡음은 9개 byte-identical control의 최대 |difference-of-medians| 및 |paired median|, 빈 종단 잔차 p95 + 양쪽 median의 bootstrap 99% 오차, 1 µs 중 최대입니다. 3회 각각 difference-of-medians가 자기 잡음보다 크고 paired bootstrap 95% 하한이 0보다 클 때만 ↑입니다. 표의 max 잡음은 세 회차 최대이고 median gain과 같은 회차 값은 아닙니다. 회차별 수치·CI·원시 101쌍·clock windows는 JSON에 보존했습니다.\n\n'+table(['fixture','동일 코드 noise envelope ms'],fixtures.map(n=>[n,f(noiseControls[n].noOpNoiseMs)])));
for(const name of fixtures)sections.push('### '+name+'\n\n'+table(['변형','새 / W ms','제거 ms [회차 최소, 최대]','최대 잡음 ms','verdict'],bounds.filter(x=>x.name===name).map(x=>[x.id,f(x.headMs)+' / '+f(x.workingMs),f(x.gainMs)+' ['+x.gainRangeMs.map(f).join(', ')+']',f(x.maxNoiseMs),x.verdict])));
sections.push('## 잡음 밖 범위의 순위와 단일 변경 명세\n\n전체 graph/collector/path/selection bound는 서로 겹칩니다. 아래 제거 범위를 합산하지 마십시오. `blueprint-replay`는 중첩 전체 예산이고 개별 패치의 실행 우선순위는 실제 narrow 근거를 먼저 봅니다.\n\n'+table(['순위','fixture / 범위','제거 ms','분류','범위 내 한 변경·ledger'],ranked.map((x,i)=>{const s=specs.find(s=>s.id===x.id);return [i+1,x.name+' / '+x.id,f(x.gainMs),s.kind,s.fixSpec+' Ledger 질문: 없음.'];}))+'\n\n### 실제 narrow 후보 우선순위\n\n'+table(['fixture / 후보','개선 ms','명세'],narrowRank.map(x=>[x.name+' / '+x.id,f(x.gainMs),specs.find(s=>s.id===x.id).fixSpec]))+'\n\n같은 후보의 fixture 수치를 합산하지 않습니다. `declaration-sink`만으로 네 fixture의 안정적 이득이 없으며 선언 전체 replay를 그 수정의 기대치로 쓰지 않습니다. `projected-once`와 `projected-first` 모두 잡음 밖을 통과하지 못했습니다. mount만 재므로 limited variant의 첫 공개 전이 이득에 대한 시간 주장은 없습니다. `path-key-once`·`template-key-classic`, `node-membership-once`, `selection-lazy`, `assembly-first-plain`, `revision-dense-first`, `gate-active-input-zero`, `index-declarations-needed`도 안정적인 일반 mount 개선이 미입증입니다.');
sections.push('## 무효 memo 진단과 ledger 질문\n\nmount 전체의 무조건 projection/gate memo는 oneOf payload를 없앴습니다. 이 3개 진단 JSON은 보존했으며 정상 bound/순위에서 제외했습니다. 정상 projected 변형은 context별 memo를 사용하고 markWrite/updateOutput/selectChildren 진입 및 pending output이 있는 읽기에서 지웁니다. limited 변형은 load 및 root의 첫 non-load context에만 사용합니다. 이 coarse 경계는 일반 cache 정당성 증명이 아닙니다.\n\n권장 한 변경 명세는 기존 읽기·평가·정착·오류 순서와 공개 결과를 유지하는 내부 작업 제거이므로 새 ledger 질문이 없습니다. projection 값을 epoch 전체에서 공유하는 새 규칙이나 form/mount 간 blueprint/runtime result 공유를 채택하려면 별도 범위 확장 질문이 필요합니다. 현재 round 104 범위에서 이 결과 공유를 권장하지 않습니다. 작은 form update 수용은 다시 묻지 않습니다.\n\n각 후속 fix는 frozen 상태/own enumerable 필드/필수 참조 관계와 static 오류·warning의 code/source path/순서/개수를 보존해야 합니다. Boolean·nullable·충돌 제약·무효 pattern·custom collect/isAtomic·inactive gated branch·다중 host $ref·순서 민감 overlay를 포함하십시오. gate/경로 수정은 중간 쓰기·앞 gate의 flush·extras·배열 rekey·다중 host를 포함하고 실제 평가 횟수 및 실패 재평가를 줄이지 않아야 합니다.');
sections.push('## 산출물과 실행 감사\n\n'+table(['항목','결과'],[['HEAD',HEAD],['채택 worker 자연 종료',workers.length+'개, signal 없음'],['전체 성공 command 최대',summary.audit.maxCommandMs+' ms (<480000 ms)'],['worker 최대',summary.audit.maxWorkerMs+' ms'],['worker 시간 겹침','없음'],['제품 src diff','없음'],['bundle / map / cache','저장소 안 신규 출력 없음. bundle/map은 '+bundles],['개별 raw 파일 최대',summary.audit.artifactMaxBytes+' bytes (≤5000000)']])+'\n\n`profile-105-rebound/measure.mjs`는 profile-102의 원본 harness와 round-99 canonical builder를 메모리에서 재배치합니다. 모든 source transform은 esbuild onLoad 메모리에서만 수행했으며 서비스는 stdin EOF로 종료했습니다. `process-*.json`, `build-*.json`, `counts-*.json`, `cpu-*.cpuprofile`, `*-forced-r*.json`, `verdict-*.json`이 재현·검증 근거입니다. 공식 보고서는 `profile-105-rebound.md`, 구조화 요약은 `profile-105-rebound-summary.json`입니다.');

const report=sections.join('\n\n')+'\n';
assert(Buffer.byteLength(report)<5000000);assert(Buffer.byteLength(JSON.stringify(summary))<5000000);
const mode=process.argv[2];
if(mode==='--chunk'){
  const artifact=process.argv[3];
  assert(['report','summary'].includes(artifact));
  const rendered=artifact==='report'?report:JSON.stringify(summary,null,2)+'\n';
  const start=Number(process.argv[4]),length=Number(process.argv[5]);
  assert(Number.isSafeInteger(start)&&start>=0&&Number.isSafeInteger(length)&&length>0);
  console.log(JSON.stringify({artifact,start,total:rendered.length,bytes:Buffer.byteLength(rendered),text:rendered.slice(start,start+length)}));
}
else if(mode==='--report')process.stdout.write(report);
else if(mode==='--summary')process.stdout.write(JSON.stringify(summary,null,2)+'\n');
else console.log(JSON.stringify({mounts:mounts.map(x=>({fixture:x.name,ratio:x.ratio,oldColumn:x.oldColumn})),narrowRank:summary.narrowRank,ranked:summary.ranked,reportBytes:Buffer.byteLength(report),summaryBytes:Buffer.byteLength(JSON.stringify(summary,null,2)),audit:summary.audit}));
