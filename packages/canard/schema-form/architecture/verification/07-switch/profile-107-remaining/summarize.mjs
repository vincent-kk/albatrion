// Explicit attribution/report CLI; stdout artifacts are persisted with native apply_patch.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const work = path.dirname(fileURLToPath(import.meta.url)), directory = path.dirname(work);
const repo = path.resolve(directory, '../../../../../..');
const HEAD = '5c530e05414df1c7a09e0b5307b04910a0864c90', started = Date.now();
const fixtures = ['sample-0','sample-1','sample-2','sample-3','flat-50','flat-100','flat-500','nested-d3-f4','nested-d5-f4','array-100','array-500','array-1000','computed-visible-derived','oneOf-20'];
const mounts = ['nested-d5-f4','flat-500'];
const read = file => JSON.parse(fs.readFileSync(path.join(work, file + '.json'), 'utf8'));
const q = (values, p) => values.toSorted((a,b)=>a-b)[Math.ceil(values.length*p)-1];
const median = values => q(values,.5);
const metric = values => ({median:median(values),p99:q(values,.99),samples:values.length});
const hash = value => createHash('sha256').update(value).digest('hex');
const f = value => value.toFixed(4), pct = value => value.toFixed(2);
const table = (headers, rows) => ['| '+headers.join(' | ')+' |','| '+headers.map(()=>'---').join(' | ')+' |',...rows.map(row=>'| '+row.join(' | ')+' |')].join('\n');
const short = file => file.replace('packages/canard/schema-form/src/','');
assert.equal(execFileSync('git',['--no-optional-locks','rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),HEAD);
execFileSync('git',['--no-optional-locks','diff','--quiet','HEAD','--','packages/canard/schema-form/src'],{cwd:repo});

// Identical seeded 99% median uncertainty to the official 95C-01 reporter.
function bootstrap95(values, seed) {
  let state = seed >>> 0; const estimates = [];
  for (let trial=0; trial<1000; trial++) {
    const sample=[];
    for(let i=0;i<values.length;i++){state=(Math.imul(state,1664525)+1013904223)>>>0;sample.push(values[Math.floor(state/4294967296*values.length)]);}
    estimates.push(median(sample));
    assert(Date.now()-started<420000);
  }
  const center=median(values),low=q(estimates,.005),high=q(estimates,.995);
  return {low,high,halfWidth:Math.max(center-low,high-center),resamples:1000,seed};
}
// Identical 1999-resample bound/noise calculation to profile-105.
function boot(values) {
  let state=101;const estimates=[];
  for(let trial=0;trial<1999;trial++){
    const sample=[];for(let i=0;i<values.length;i++){state^=state<<13;state^=state>>>17;state^=state<<5;sample.push(values[(state>>>0)%values.length]);}
    estimates.push(median(sample));
  }
  estimates.sort((a,b)=>a-b);const center=median(values);
  return {center,ci95:[estimates[49],estimates[1949]],error99:Math.max(Math.abs(estimates[9]-center),Math.abs(estimates[1989]-center))};
}

const officialRecords=fixtures.flatMap(name=>[1,2,3].flatMap(run=>(run===2?['new','old']:['old','new']).map(version=>read(`official-${name}-r${run}-${version}`))));
const originalToolHash=hash(fs.readFileSync(path.join(directory,'tools/measure-verdict-95c01.mjs')));
for(const r of officialRecords){
  const s=r.summary;assert.equal(s.environment.head,HEAD);assert.equal(s.warmup,20);assert.equal(s.sampleCount,101);
  assert.equal(s.explicitGc,true);assert.equal(s.officialEngineInstrumentation,false);assert.equal(s.toolSha256,originalToolHash);
  assert.equal(s.boundaryWrapperInstalledAfterOfficialSamples,true);assert.equal(s.sentinelPasses,1);
  assert.equal(s.environment.node,officialRecords[0].summary.environment.node);assert.equal(s.environment.v8,officialRecords[0].summary.environment.v8);
  assert.equal(s.workerExit.code,0);assert.equal(s.workerExit.signal,null);assert.equal(s.workerExit.natural,true);
  assert(s.serviceExits.every(x=>x.code===0&&x.signal===null));assert.equal(s.bundleEvidence[0].phaseHooks,0);
  for(const order of Object.values(s.ordering)){assert.equal(order.pendingAtSentinel.p99,0);assert.equal(order.tailScheduled.p99+order.tailExecuted.p99,0);if(s.version==='new')assert.equal(order.scheduled.p99,0);}
  assert(Object.values(r.timings).every(values=>values.length===101));
}
for(let i=1;i<officialRecords.length;i++)assert(Date.parse(officialRecords[i].summary.environment.started)>Date.parse(officialRecords[i-1].summary.environment.ended));
for(const version of ['old','new']){const hashes=officialRecords.filter(r=>r.summary.version===version).map(r=>r.summary.bundleEvidence[0].sha256);assert(hashes.every(x=>x===hashes[0]));}
for(const name of fixtures)for(const run of [1,2,3])assert.deepEqual(read(`official-${name}-r${run}-old`).summary.checks,read(`official-${name}-r${run}-new`).summary.checks);
const empty=officialRecords.flatMap(r=>[...r.timings['empty-before'],...r.timings['empty-after']]);
const C=median(empty.map(x=>x[1])),M=median(empty.map(x=>x[0]));
const waiting=empty.map(x=>x[1]-x[0]),waitMedian=median(waiting);
const emptyNoise=q(waiting.map(x=>Math.abs(x-waitMedian)),.95);
const emptyEndCi=bootstrap95(empty.map(x=>x[1]),9501),emptyMicroCi=bootstrap95(empty.map(x=>x[0]),9502);
const calibration={C,M,wait:C-M,emptyNoise,emptyEndCi,emptyMicroCi,emptyCalls:empty.length};
const rows=[];
for(const fixture of fixtures){
  const versions={};
  for(const version of ['new','old']){
    const runs=[1,2,3].map(run=>{
      const record=read(`official-${fixture}-r${run}-${version}`),t=record.timings;
      const sentinel=t.mount.map(x=>x[1]-C),microtask=t.mount.map(x=>x[0]-M),callback=t['mount-callback'];
      const sum=microtask.map((x,i)=>x+callback[i]),expected=version==='new'?microtask:sum;
      const noise=Math.max(.001,emptyNoise+bootstrap95(sentinel,run*100+95).halfWidth+bootstrap95(expected,run*100+96).halfWidth+emptyEndCi.halfWidth+emptyMicroCi.halfWidth);
      const difference=median(sentinel)-median(expected);
      return {run,sentinel,microtask,callback,sum,differenceMs:difference,noiseMs:noise,withinNoise:Math.abs(difference)<=noise};
    });
    const pooled=Object.fromEntries(['sentinel','microtask','callback','sum'].map(key=>[key,runs.flatMap(r=>r[key])]));
    const expected=version==='new'?pooled.microtask:pooled.sum;
    const noise=Math.max(.001,emptyNoise+bootstrap95(pooled.sentinel,9593).halfWidth+bootstrap95(expected,9594).halfWidth+emptyEndCi.halfWidth+emptyMicroCi.halfWidth);
    const difference=median(pooled.sentinel)-median(expected),withinNoise=Math.abs(difference)<=noise;
    const fallback=version==='old'&&(!withinNoise||runs.some(r=>!r.withinNoise));
    versions[version]={fallback,column:fallback?'(나) microtask + callback 합':'종단',metric:metric(fallback?pooled.sum:pooled.sentinel),validation:{differenceMs:difference,noiseMs:noise,withinNoise},runs:runs.map(r=>({run:r.run,differenceMs:r.differenceMs,noiseMs:r.noiseMs,withinNoise:r.withinNoise,metric:metric(fallback?r.sum:r.sentinel)}))};
  }
  const ratio=versions.new.metric.median/versions.old.metric.median;
  const runRatios=[0,1,2].map(i=>versions.new.runs[i].metric.median/versions.old.runs[i].metric.median);
  const tie=runRatios.some(x=>x<=1.5)&&runRatios.some(x=>x>1.5);
  rows.push({fixture,validation:'off',mode:'mount',ratio,runRatios,tie,target:1.5,met:tie||ratio<=1.5,verdict:tie?'충족 (공식 동률 규칙)':ratio<=1.5?'충족':'미달',...versions});
}
assert(rows.every(r=>r.new.validation.withinNoise),'새 판 검증 (가) 실패');

const specs=[
  ['blueprint-replay','구조 S01','core/blueprint','blueprint 전체','비교용 S01입니다. form 간 blueprint 공유는 round 104의 수정 명세로 제안하지 않습니다.'],
  ['build-own-replay','작업 제거','core/blueprint','buildNodes 자손 제외','단일 conjunction group에서 validationOnly 복제가 없음을 확인한 경우, 두 membership 배열 생산을 동일한 새 배열 참조를 유지하는 native slice로 치환하십시오. 재귀·ID·effective schema·Map 등록 순서를 유지하십시오.'],
  ['membership-once','단일 변경','core/blueprint','membership 배열','단일 conjunction의 내부 group 배열을 직접 소비하는 변형입니다. 공개 node.declarations의 필요한 별도 참조를 유지하는 구현으로 좁혀야 하며 채택 근거는 별도입니다.'],
  ['declarations-replay','작업 제거','core/blueprint','선언·fragment 생산','collectDeclarations의 gates/order 복사만 packed-array slice로 치환하십시오. fragment와 declaration의 별도 배열 참조, ID·DFS·진단·capability 순서를 유지하십시오. 이미 채택된 sink를 다시 제안하지 않습니다.'],
  ['template-replay','작업 제거','core/blueprint','template/host key','getTemplateKey의 encodeLeaf 내부 quote/backslash scan만 native 문자열 처리로 치환하십시오. key와 boundKey의 JSON bytes 및 gate/owner 중복 순서를 보존하십시오. 결과 memo는 채택하지 않습니다.'],
  ['encode-native','단일 변경','core/blueprint','encodeLeaf native','encodeLeaf의 enclosing-string escape만 JSON.stringify(key).slice(1,-1)로 치환하고 byte 동치를 검증하십시오.'],
  ['key-single-json','단일 변경','core/blueprint','단일 ungated key','getTemplateKey의 단일 ungated 입력에만 native 두 JSON 직렬화를 사용하십시오. $ref 해석과 모든 key bytes를 보존하십시오.'],
  ['path-strings-replay','작업 제거','core/blueprint','경로 문자열 (중첩)','populateNodeChildren에서 같은 name의 escapeSegment 결과를 한 번 계산해 schemaPath와 data path에 재사용하십시오. 공개 두 경로는 계속 생산하고 getTemplateKey bytes는 유지하십시오. template-replay와 겹칩니다.'],
  ['child-own-replay','작업 제거','core/blueprint','자식 입력·binding','populateNodeChildren의 ungated 빠른 경로에서 SchemaInput의 base spread만 명시적 고정 순서 필드 literal로 치환하십시오. 새 input/gates/order 소유권과 appendChildEntries·DFS를 유지하십시오.'],
  ['child-input-literal','단일 변경','core/blueprint','고정 layout SchemaInput','populateNodeChildren의 ungated 빠른 경로에서 base spread를 동일 필드 순서의 literal로 치환하십시오. 이 변형은 실제 자식 build와 binding 생산을 모두 실행합니다.'],
  ['assembly-replay','작업 제거','core/behaviors/objectBehavior','object assembly','최초 local/extras 없음·propertyKeys 없음·entries/children 순서 동치인 경우만 Map/Set 수집을 한 classic loop로 치환하십시오. 실제 새 값 객체, stable shape 및 key count를 생산하십시오.'],
  ['assembly-first-empty-hints','단일 변경','core/behaviors/objectBehavior','첫 object 직접 조립','최초 plain object의 빈 propertyKeys 경로만 순서 동치 검사 후 classic loop로 조립하십시오. 일반 extras/중복/기존 local 경로를 유지하십시오.'],
  ['choices-replay','작업 제거','core/behaviors','static option 읽기','getStaticChoices의 options 없음 분기만 동일 frozen 기본 choices에 연결하십시오. effective별 WeakMap 및 사용자 propertyKeys 처리는 유지하십시오.'],
  ['choices-default','단일 변경','core/behaviors','기본 choices','getStaticChoices의 hints 없음 경로에서 기존 기본값과 frozen empty keys의 동일성을 유지하는 내부 기본 choices를 재사용하십시오.'],
  ['entries-replay','작업 제거','core/settle','static object entries','getStaticObjectEntries의 byName 채우기를 고정 layout의 native 경로로 바꾸는 한 변경만 검토하십시오. 정수 이름 열거·마지막 중복 승리·frozen 결과 배열은 유지하십시오. 전체 replay 이득을 그대로 기대하지 않습니다.'],
  ['delivery-replay','작업 제거','core/settle','첫 delivery/revision','commitStaticFirstNode의 첫 두-bit revision 생산만 전용 고정 layout producer로 바꾸십시오. 새 ledger·payload/options 소유권, previous undefined, revision 및 automatic/load source를 유지하십시오.'],
  ['revision-dense-first','단일 변경','core/record','첫 revision literal','EMPTY previous 및 첫 두-bit mask만 조밀한 counter literal로 초기화하십시오. 다른 previous/mask와 새 ledger 참조를 유지하십시오.'],
  ['flush-reads-zero','작업 제거','core/settle','read flush','flushPendingGateReads의 READ_PLANS 경로 token/첫 segment를 plan binding에서 한 번 해석하십시오. pending 검사와 실제 flush 순서는 유지하십시오. 이 두 mount에서는 0회입니다.'],
  ['recalculation-replay','작업 제거','core/settle','재계산 등록','registerRecalculation의 affected owner prefix 생산을 최초 등장 순서의 단일 방문으로 치환하십시오. dirty/dependency/shape 등록 순서를 유지하십시오. 이 두 mount에서는 0회입니다.'],
  ['dependency-replay','작업 제거','core/settle','dependency index','DependencyIndex.add의 watchedPath split만 index construction 동안 재사용하십시오. wildcard·owner 순서와 affected 관계는 유지하십시오. 이 두 mount에서는 0회입니다.'],
  ['dependency-paths-once','단일 변경','core/settle','상대 의존 경로','동일 host/authored dependency의 문자열 해석만 occurrence binding 안에서 재사용하십시오. rekey 후에는 다시 해석하십시오. 이 두 mount에서는 0회입니다.'],
  ['watched-tokens','단일 변경','core/settle','watched-path token index','DependencyIndex.add에서 같은 watchedPath의 encoded split 결과만 index 인스턴스에 재사용하십시오. owner 비교·경로 축소 이후 lookup·wildcard·최초 owner 순서는 유지하십시오. 이 두 mount에서는 0회입니다.'],
].map(([id,kind,owner,workKind,fixSpec])=>({id,kind,owner,workKind,fixSpec,newContract:false,settlementDesignChange:false}));
const noiseControls={},bounds=[],counts={};
for(const name of mounts){
  const count=read(`counts-head-${name}`);counts[name]={dimensions:count.dimensions,functions:{}};
  for(const fn of ['getTemplateKey','encodeLeaf','flushPendingGateReads','registerRecalculation','getDependencyIndex','DependencyIndex.add','getStaticChoices'])counts[name].functions[fn]=Object.entries(count.counts).filter(([k])=>k.startsWith('function|')&&k.endsWith('|'+fn)).reduce((s,[,v])=>s+v,0);
  const controls=['control','control-after','control-final'].flatMap(id=>[1,2,3].map(run=>{const r=read(`${id}-${name}-forced-r${run}`);assert.equal(r.bundleHashes.head,r.bundleHashes.variant);return {id,run,gainMs:r.boundMs,pairedMedianMs:median(r.pairedDeltasMs)};}));
  const floor=Math.max(...controls.flatMap(r=>[Math.abs(r.gainMs),Math.abs(r.pairedMedianMs)]));noiseControls[name]={floorMs:floor,controls};
  for(const spec of specs){
    const runs=[1,2,3].map(run=>{
      const filename=`${spec.id}-${name}-forced-r${run}`,r=read(filename);
      assert.equal(r.HEAD,HEAD);assert.equal(r.warmup,20);assert.equal(r.samples,101);assert.equal(r.actualMounts.head,121);assert.equal(r.actualMounts.variant,121);
      assert.equal(r.observations.head.sha256,r.observations.variant.sha256,filename);assert.equal(r.bundleHashes.head,read('build-head').sha256);assert.equal(r.bundleHashes.variant,read('build-'+spec.id).sha256);
      for(let i=0;i<101;i++){const first=i%2===(run%2?0:1)?'head':'variant';assert.equal(r.windows[i*2].version,first);assert.equal(r.windows[i*2+1].version,first==='head'?'variant':'head');}
      const paired=boot(r.pairedDeltasMs),head=boot(r.timingsMs.head),variant=boot(r.timingsMs.variant);
      const residual=q([...r.emptyTimingsMs.before,...r.emptyTimingsMs.after].map(x=>Math.abs(x-r.correction)),.95);
      const noise=Math.max(.001,floor,residual+head.error99+variant.error99);
      return {run,headMs:r.metrics.head.median,variantMs:r.metrics.variant.median,gainMs:r.boundMs,noiseMs:noise,pairedMedianMs:paired.center,pairedCi95:paired.ci95,aboveNoise:r.boundMs>noise&&paired.ci95[0]>0,file:filename+'.json'};
    });
    const dormant=['flush-reads-zero','recalculation-replay','dependency-replay','dependency-paths-once','watched-tokens'].includes(spec.id);
    bounds.push({...spec,name,headMs:median(runs.map(r=>r.headMs)),variantMs:median(runs.map(r=>r.variantMs)),gainMs:median(runs.map(r=>r.gainMs)),gainRangeMs:[Math.min(...runs.map(r=>r.gainMs)),Math.max(...runs.map(r=>r.gainMs))],maxNoiseMs:Math.max(...runs.map(r=>r.noiseMs)),aboveNoise:!dormant&&runs.every(r=>r.aboveNoise),attributableBoundMs:dormant?0:undefined,verdict:dormant?'미입증·해당 작업 0회':runs.every(r=>r.aboveNoise)?'↑ 잡음 밖':'≈ 미입증',runs});
  }
}
const cpu=[];
for(const name of mounts){
  const functions=new Map();let denominatorUs=0,samples=0,windowUs=0;
  for(const run of [1,2,3]){
    const r=read(`cpu-head-${name}-r${run}`);assert.equal(r.HEAD,HEAD);assert.equal(r.forcedGC,false);assert.equal(r.counterInstrumentation,false);assert.equal(r.clonePreparation,'101 schemas before Profiler.start');
    assert(Math.abs(r.cpu.selfConservation-r.cpu.denominatorUs)<.01);denominatorUs+=r.cpu.denominatorUs;samples+=r.cpu.samples;windowUs+=r.cpu.windowUs;
    for(const x of r.cpu.functions){const key=x.function+'|'+x.file+':'+x.line+':'+x.column;let item=functions.get(key);if(!item)functions.set(key,item={function:x.function,file:short(x.file),line:x.line,column:x.column,selfUs:0,totalUs:0});item.selfUs+=x.selfUs;item.totalUs+=x.totalUs;}
  }
  const all=[...functions.values()].map(x=>({...x,selfPct:x.selfUs/denominatorUs*100,totalPct:x.totalUs/denominatorUs*100,selfUsPerMount:x.selfUs/303,totalUsPerMount:x.totalUs/303}));
  cpu.push({name,mounts:303,samples,intervalUs:100,denominatorUs,windowUs,gcPct:all.filter(x=>x.function==='(garbage collector)').reduce((s,x)=>s+x.selfPct,0),programPct:all.filter(x=>x.function==='(program)').reduce((s,x)=>s+x.selfPct,0),topSelf:all.toSorted((a,b)=>b.selfUs-a.selfUs).slice(0,20),topTotal:all.toSorted((a,b)=>b.totalUs-a.totalUs).slice(0,20),allFunctions:all});
}
const coverage=cpu.flatMap(c=>c.allFunctions.filter(x=>x.totalPct>=5).map(x=>{
  let ids=[];let reason='';
  if(x.file==='(V8)')reason='VM 분모입니다. 강제 GC가 clock 밖인 판정 열에서 독립 GC 절약으로 바꾸지 않습니다.';
  else if(x.file==='(round-99 canonical adapter)')reason='측정 driver 누적 범위이며 제품 수정 대상이 아닙니다.';
  else if(['blueprint','buildSchemaNodeTree'].includes(x.function))ids=['blueprint-replay'];
  else if(x.function==='buildNodes')ids=['build-own-replay','template-replay','declarations-replay'];
  else if(x.function==='populateNodeChildren')ids=['child-own-replay','child-input-literal','build-own-replay'];
  else if(['getTemplateKey','encodeLeaf'].includes(x.function))ids=['template-replay','encode-native','key-single-json'];
  else if(x.function==='collectDeclarations')ids=['declarations-replay'];
  else if(x.function==='commitStaticFirstNode')ids=['delivery-replay','revision-dense-first'];
  else if(x.function==='assembleObject')ids=['assembly-replay','assembly-first-empty-hints'];
  else if(x.function==='assembleStaticFirstNode')ids=['assembly-replay','choices-replay'];
  else if(['mountSchemaNode','dispatchMount','loadSchemaNodeAtMount','loadStaticFirstTree'].includes(x.function))ids=['assembly-replay','delivery-replay','entries-replay','choices-replay'];
  else if(x.function==='nodeFromJSONSchema')ids=['blueprint-replay','build-own-replay','assembly-replay','delivery-replay'];
  assert(ids.length||reason,'미귀속 함수: '+x.function);
  return {name:c.name,...x,ids,reason:reason||'누적 total에는 자손 bound가 겹칩니다. inline 비용이 caller self에 귀속될 수 있습니다.'};
}));
const ranked=bounds.filter(b=>b.aboveNoise&&b.kind!=='구조 S01').sort((a,b)=>b.gainMs-a.gainMs);
const narrowRank=ranked.filter(b=>b.kind==='단일 변경');
const s01=bounds.filter(b=>b.id==='blueprint-replay');
const processes=fs.readdirSync(work).filter(f=>f.startsWith('process-')&&f.endsWith('.json')).map(f=>({file:f,...read(f.slice(0,-5))}));
const workers=processes.filter(r=>r.command.endsWith('-worker'));
assert(processes.every(r=>r.status===0&&r.signal===null&&r.elapsedMs<480000));
const sorted=workers.toSorted((a,b)=>Date.parse(a.started)-Date.parse(b.started));
for(let i=1;i<sorted.length;i++)assert(Date.parse(sorted[i].started)>=Date.parse(sorted[i-1].ended));
const artifactFiles=fs.readdirSync(work).map(file=>({file,bytes:fs.statSync(path.join(work,file)).size}));assert(artifactFiles.every(f=>f.bytes<=5_000_000));
const cpuEnvironment=read('cpu-head-nested-d5-f4-r1').environment;
const officialBatches=[['sample-0'],['sample-1','sample-2'],['sample-3','flat-50'],['flat-100','flat-500'],['nested-d3-f4'],['nested-d5-f4'],['array-100','array-500'],['array-1000'],['computed-visible-derived','oneOf-20']];
const summary={HEAD,scope:'측정과 귀속만 수행했습니다. git 쓰기·설치·제품 src 변경은 없습니다.',environment:{node:officialRecords[0].summary.environment.node,v8:officialRecords[0].summary.environment.v8,cpu:officialRecords[0].summary.environment.cpu,officialBuildMode:'development (공식 도구 기본값 유지)',cpuAndAblationBuildMode:'production (105 유지)',cpuEnvironment},protocol:{official:'95C-01: fresh process, old/new 교대, 세 회차, warmup 20, 101 표본, clock 밖 강제 GC, 같은 세션/Node, 64 Promise checkpoints와 FIFO sentinel',officialAdaptations:['HEAD','warmup 20','data-module 위치 재배치'],officialToolSha256:originalToolHash,ratioStatistic:'전체 303 표본의 보정 median 비율; 공식 94C-02의 경계 양쪽 회차는 동률·충족',ablation:'같은 종단 판정 열; fresh H/W pair, 표본별 교대, warmup 20, 101쌍, 세 회차, clock 밖 강제 GC, 제품 계측 없음',noise:'max(1µs, 9 동일 바이트 control의 |median 차이|·|paired median|, 빈 종단 residual p95 + 두 median bootstrap 99% 오차). 모든 회차가 초과하고 paired bootstrap 95% 하한 > 0.',boundBootstrap:{resamples:1999,seed:101},cpu:'fresh process 3회씩, warmup 20, 101 연속 mount, 100µs sampling, clone은 Profiler.start 전, 강제 GC 없음; 모든 mount window와 timeDelta 교차 가중; GC/program/idle/driver 분모 유지; 재귀 total 중복 제거'},calibration,rows,counts,cpu,coverageAtLeastFivePct:coverage,noiseControls,bounds,ranked:ranked.map(({runs,...x})=>x),narrowRank:narrowRank.map(({runs,...x})=>x),s01,remainingCodeLevelBoundAboveNoise:ranked.length>0,provenNarrowChangeAboveNoise:narrowRank.length>0,interpretation:'Replay는 첫 warmup 결과를 순서대로 재사용하는 낙관적 작업 제거 범위이며 수학적 상한·일반 구현 성능 보장이 아닙니다. 필요한 결과 생산·진단·참조 소유권을 우회할 수 있습니다. 구조 S01과 코드 bound, 같은 fixture의 중첩 bound를 합산하지 않습니다.',audit:{officialWorkers:84,ablationWorkers:bounds.length*3+18,cpuWorkers:6,countWorkers:2,otherWorkers:workers.length-(bounds.length*3+18)-6-2,retainedNaturalZeroExitProcesses:processes.length+84,measurementWorkerOverlap:false,maxWorkerMs:Math.max(...workers.map(r=>r.elapsedMs),...officialRecords.map(r=>r.summary.workerExit.elapsedMs)),maxRecordedCommandMs:Math.max(...processes.map(r=>r.elapsedMs),...officialRecords.map(r=>r.summary.workerExit.elapsedMs)),maxOfficialBatchWorkerSumMs:Math.max(...officialBatches.map(names=>officialRecords.filter(r=>names.includes(r.summary.fixture)).reduce((s,r)=>s+r.summary.workerExit.elapsedMs,0))),artifactMaxBytes:Math.max(...artifactFiles.map(f=>f.bytes)),bundlesDirectory:'/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles',productSourceDiff:false,gitWrites:false,installs:false,setupRetries:[{variant:'child-input-literal',reason:'빠른 경로와 일반 경로의 공통 anchor를 첫 경로로 한정',exitCode:1,natural:true},{variant:'watched-tokens',reason:'메모리 변형의 중복 닫는 중괄호 수정',exitCode:1,natural:true}],driverSha256:hash(fs.readFileSync(path.join(work,'measure.mjs'))),artifacts:artifactFiles}};

const sections=[];
sections.push('# 107: 현재 mount 비율과 남은 코드 작업 제거 범위\n\n`'+HEAD+'`에서 측정했습니다. '+(ranked.length?'잡음 밖의 코드 작업 제거 범위가 아직 남아 있습니다.':'잡음 밖의 코드 작업 제거 범위는 남지 않았습니다.')+' '+(narrowRank.length?'실제 단일 변경 중 잡음 밖 후보도 있습니다.':'실제 단일 변경의 세 회차 잡음 밖 개선은 입증되지 않았습니다.')+' 넓은 replay 범위는 한 수정의 기대 성능이 아닙니다.');
sections.push('## 현재 공식 core mount 열\n\n공식 `tools/measure-verdict-95c01.mjs`를 메모리에서 HEAD·예열 20·data module 위치만 재배치했습니다. 도구의 기본 development 빌드 모드와 전체 종단/후속 callback 진단을 유지했습니다. validation OFF, 외부 구독자 0, onChange noop, fresh old→new / new→old / old→new 프로세스, 각 warmup 20·101 표본입니다. CPU/ablation은 105와 같은 production이므로 이 비율의 비용과 직접 빼거나 더하지 않습니다.\n\n'+table(['fixture','새 median / p99 ms','구 공식 median / p99 ms','새/0.16.0','회차 1 / 2 / 3','구 선택','1.5× 판정'],rows.map(r=>[r.fixture,f(r.new.metric.median)+' / '+f(r.new.metric.p99),f(r.old.metric.median)+' / '+f(r.old.metric.p99),f(r.ratio)+'×',r.runRatios.map(f).join(' / '),r.old.column,r.verdict]))+'\n\n기존 공식 표의 분기 없음 12개 mount와 식 전용 1개 mount를 모두 포함했고 oneOf-20 OFF를 추가했습니다. oneOf의 1.5× 비교는 이번 질문의 요청에 따른 수치 비교이며 기존 분기 증가 ledger를 대체하지 않습니다. 303개 전체 표본 median 비율입니다. 공식 94C-02에 따라 회차가 목표선 양쪽이면 동률·충족입니다.');
sections.push('## 종단 검증과 보정\n\nclock 밖 schema clone·강제 GC 뒤 별도 check anchor를 기다리고, 호출→64 Promise checkpoints→같은 check 큐 FIFO sentinel까지 잽니다. 공식 표본 뒤에만 scheduler callback을 감쌌습니다. 모든 sentinel의 pending=0, 추가 128 checkpoints/다음 sentinel의 추가 예약·실행=0, 새 엔진 예약=0입니다. 같은 빈 호출 '+empty.length+'개의 pooled C='+f(C*1000)+'µs, M='+f(M*1000)+'µs를 두 판에 공통으로 뺐습니다. (가)는 새 종단과 microtask, (나)는 구 종단과 microtask+별도 callback의 순번별 합을 비교합니다. 한 회차라도 (나)가 잡음 밖이면 세 회차 모두 합을 씁니다. 기존 구 선택을 고정하지 않았고 음수 clipping은 없습니다.\n\n'+table(['fixture/run','새 (가) 차이 / 잡음 ms','구 (나) 차이 / 잡음 ms','구 (나) 일치'],rows.flatMap(r=>r.new.runs.map((a,i)=>[r.fixture+'/'+a.run,f(a.differenceMs)+' / '+f(a.noiseMs),f(r.old.runs[i].differenceMs)+' / '+f(r.old.runs[i].noiseMs),r.old.runs[i].withinNoise?'예':'아니요']))));
sections.push('## 계수 없는 steady CPU 프로파일\n\n각 fixture별 세 fresh process에서 warmup 20 뒤 101개 consecutive mount를 100µs 간격으로 수집했습니다. 101개 schema clone을 Profiler.start 전에 준비했고 강제 GC는 하지 않았습니다. mount window와 sample timeDelta의 교차 시간을 가중하고 GC/program/idle/driver도 분모에 남겼습니다. 재귀 함수 total은 같은 frame당 한 번만 셉니다. V8 inline 비용은 caller self에 포함될 수 있고 inclusive total끼리 합산하지 않습니다.\n\n'+table(['fixture','mounts','표본','분모 ms','GC %','program %'],cpu.map(c=>[c.name,c.mounts,c.samples,f(c.denominatorUs/1000),pct(c.gcPct),pct(c.programPct)])));
for(const c of cpu)for(const [title,list] of [['self',c.topSelf],['total',c.topTotal]])sections.push('### '+c.name+' / '+title+' top 20\n\n'+table(['함수·원본 위치','self %','total %','self µs/mount','total µs/mount'],list.map(x=>['`'+x.function+'` · `'+x.file+':'+x.line+'`',pct(x.selfPct),pct(x.totalPct),pct(x.selfUsPerMount),pct(x.totalUsPerMount)])));
sections.push('## total ≥5% 함수의 누락 없는 귀속\n\n부모 entry/dispatch/load 함수는 자손을 포함하는 누적 범위입니다. self가 5% 미만인 부모에 대해 자손 budget을 별도 제거 범위처럼 반복 계산하지 않았습니다. GC에는 독립적인 코드 owner가 없으며 allocation 관련 ablation과 S01에 겹칩니다. 강제 GC를 clock 밖에 둔 판정 열에서 CPU의 GC 비율을 그대로 시간 절약으로 환산하지 않습니다.\n\n'+table(['fixture','함수·위치','self / total %','연결한 범위 또는 제외 근거'],coverage.map(c=>[c.name,'`'+c.function+'` · `'+c.file+':'+c.line+'`',pct(c.selfPct)+' / '+pct(c.totalPct),c.ids.join(', ')||c.reason])));
sections.push('## 세 회차 ablation 판정 열\n\n모든 변형은 esbuild onLoad 메모리에서만 적용했습니다. CPU/count 번들은 timing에 사용하지 않았습니다. 첫 variant warmup의 결과를 tape로 재사용하는 replay에는 lookup/복사 overhead가 있으며 필수 생산·참조 소유권·진단을 우회할 수 있어 수학적 상한이 아닙니다. 관측한 동일 fixture 값 hash는 모두 같지만 일반 오류·reference·callback 계약의 구현 검증은 아닙니다. 실제 좁은 변경도 mount hash만 확인했습니다.\n\n각 fresh worker는 warmup 20·101 H/W 쌍을 매 표본 교대하며 세 회차 실행했습니다. 명시적 GC와 clone/check anchor는 clock 밖, 종단은 같은 95C-01 열이며 빈 종단 C는 두 판에 공통입니다. 9 byte-identical control의 최대 |median 차이|/|paired median|와 빈 잔차 p95+두 median bootstrap 99% 오차, 1µs 중 최대를 잡음으로 정했습니다. 각 회차가 자기 잡음을 초과하고 paired bootstrap 95% 하한>0일 때만 세 회차 ↑입니다.\n\n'+table(['fixture','동일 코드 잡음 floor ms'],mounts.map(n=>[n,f(noiseControls[n].floorMs)])));
for(const name of mounts)sections.push('### '+name+'\n\n'+table(['변형','H / W median ms','제거 median [최소, 최대] ms','최대 잡음 ms','verdict'],bounds.filter(b=>b.name===name).map(b=>[b.id,f(b.headMs)+' / '+f(b.variantMs),f(b.gainMs)+' ['+b.gainRangeMs.map(f).join(', ')+']',f(b.maxNoiseMs),b.verdict])));
sections.push('## 남은 105 명세와 작업 0회 근거\n\ngetTemplateKey/encodeLeaf는 nested '+counts['nested-d5-f4'].functions.getTemplateKey+'회, flat '+counts['flat-500'].functions.getTemplateKey+'회입니다. 기존 키 개선 뒤에도 template replay·native escape·단일 JSON 경로를 이번 HEAD에서 각각 세 회차 시도했습니다. read flush·recalculation·dependency index 전체 replay와 watched-path token 재사용도 두 fixture에서 각각 세 회차 시도했습니다.\n\n'+table(['작업 함수','nested 호출/mount','flat 호출/mount'],['flushPendingGateReads','registerRecalculation','getDependencyIndex','DependencyIndex.add'].map(fn=>[fn,counts['nested-d5-f4'].functions[fn],counts['flat-500'].functions[fn]]))+'\n\n이 네 작업은 static-first mount에서 호출되지 않아 해당 fixture의 귀속 가능한 제거 bound는 0ms입니다. unused 변형의 관측 차이는 control/JIT 잡음이며 비용으로 해석하지 않습니다. 분기·expression mount나 이후 update 비용이 0이라는 주장도 하지 않습니다. 이미 채택된 children-once·선언 sink·fragment-empty·tuple key 처리를 새 후보로 반복 제안하지 않았습니다.');
sections.push('## 잡음 밖 코드 bound 순위와 owner 안의 한 변경 명세\n\n'+(ranked.length?'잡음 밖 코드 수준의 범위가 남아 있습니다.':'잡음 밖 코드 수준 범위는 없습니다.')+' '+(narrowRank.length?'실제 단일 변경 중 세 회차 통과 후보: '+narrowRank.map(b=>b.name+'/'+b.id).join(', ')+'.':'실제 단일 변경의 세 회차 잡음 밖 개선은 아직 미입증입니다.')+' structural S01은 순위에서 제외했습니다. build-own은 collector/type/key/effective schema 생산을 포함하고 자손 construction을 제외합니다. path replay와 template replay도 겹치므로 합산하지 마십시오. 작업 제거의 넓은 예산을 아래 좁은 fix의 기대 이득으로 주장하지 않습니다.\n\n'+table(['순위','fixture / 범위','제거 ms','분류','owner · 한 변경 명세'],ranked.map((b,i)=>[i+1,b.name+' / '+b.id,f(b.gainMs),b.kind,'`'+b.owner+'` · '+b.fixSpec]))+'\n\n각 수정은 기존 ID/DFS/읽기/평가/정착/오류 순서, enumerable 필드, frozen 상태와 필요한 참조 소유권을 보존해야 합니다. 새 settlement 설계·계약·form 간 결과 공유를 제안하지 않습니다. JIT용 고정 layout literal과 native loop/string 경로는 같은 owner의 내부 생산만 바꾸는 후보이며, 구조적 분석 생략은 후보가 아닙니다.');
sections.push('## 전체 cold blueprint 분석: 구조 S01 비교\n\n'+table(['fixture','H / S01 W ms','제거 ms [회차 최소, 최대]','최대 잡음 ms','verdict'],s01.map(b=>[b.name,f(b.headMs)+' / '+f(b.variantMs),f(b.gainMs)+' ['+b.gainRangeMs.map(f).join(', ')+']',f(b.maxNoiseMs),b.verdict]))+'\n\nS01은 전체 blueprint 결과를 첫 warmup에서 재사용하여 cold analysis를 우회한 구조적 비교입니다. 코드 미세 개선이 아니며 여러 form 사이에 캐시를 도입하거나 분석을 지연하는 설계의 승인/성능 증명이 아닙니다.');
sections.push('## 실행 감사와 재현\n\nNode '+summary.environment.node+', V8 '+summary.environment.v8+', '+summary.environment.cpu+'. 공식 worker 84개, ablation/control worker '+summary.audit.ablationWorkers+'개, CPU 6개, count 2개를 순차 수행했습니다. 성공 기록의 signal은 모두 null이며 esbuild는 stdin EOF로 종료했습니다. 기록된 최대 worker '+summary.audit.maxWorkerMs+'ms, 최대 command '+summary.audit.maxRecordedCommandMs+'ms입니다. 공식 batch 최대 worker 합 '+summary.audit.maxOfficialBatchWorkerSumMs+'ms이며 모든 실제 실행 명령은 60초 도구 예산 내에서 자연 종료했습니다. build adapter의 anchor/중괄호 오류 두 시도는 exit 1로 자체 종료했고 수정 뒤 측정을 시작했으며 성능 표본에 포함하지 않았습니다.\n\n제품 src diff 없음, git 쓰기 없음, 설치 없음, 제품 test/build 실행 없음입니다. 새 저장소 산출물은 이 보고서·summary·profile-107-remaining 근거뿐입니다. 각 raw 파일 최대 '+summary.audit.artifactMaxBytes+'bytes로 5MB 이하입니다. bundle/map은 지정된 저장소 밖 `'+summary.audit.bundlesDirectory+'`에만 있습니다. 캐시를 생성하는 명령은 실행하지 않았습니다.\n\n재현 CLI: `yarn node '+path.relative(repo,path.join(work,'measure.mjs'))+' --official <fixture>`; `--build-worker <variant>`, `--cpu-worker head <fixture> <run>`, `--count-worker head <fixture>`, `--batch <run> <fixture> <variants...>`. 모든 batch를 순차 실행하십시오. `summarize.mjs`는 보고서/JSON bytes를 stdout으로 내고 native 파일 도구로 저장하도록 설계했습니다. 공식 source/tag·번들·도구 해시, 101쌍·시계 window·회차별 CI 및 자연 종료 근거는 sibling raw JSON에 있습니다.');
const markdown=sections.join('\n\n')+'\n';
if(process.argv.includes('--brief'))console.log(JSON.stringify({rows:rows.map(r=>({fixture:r.fixture,ratio:r.ratio,verdict:r.verdict})),ranked:ranked.map(b=>({name:b.name,id:b.id,gainMs:b.gainMs})),narrowRank:narrowRank.map(b=>({name:b.name,id:b.id,gainMs:b.gainMs})),s01:s01.map(b=>({name:b.name,gainMs:b.gainMs})),audit:summary.audit},null,2));
else console.log(JSON.stringify({files:[{path:path.join(directory,'profile-107-remaining.md'),text:markdown},{path:path.join(directory,'profile-107-remaining-summary.json'),text:JSON.stringify(summary,null,2)+'\n'}],brief:{rows:rows.map(r=>({fixture:r.fixture,ratio:r.ratio,verdict:r.verdict})),ranked:ranked.map(b=>({name:b.name,id:b.id,gainMs:b.gainMs})),narrowRank:narrowRank.map(b=>({name:b.name,id:b.id,gainMs:b.gainMs})),s01:s01.map(b=>({name:b.name,gainMs:b.gainMs}))}}));
assert(Date.now()-started<480000);
