// CLI evidence aggregation; timing decisions reuse the committed 95C-01 noise rule.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const artifacts=path.dirname(fileURLToPath(import.meta.url)),directory=path.dirname(artifacts);
const repo=path.resolve(directory,'../../../../../..');
const bundles='/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const scratch=path.join(bundles,'profile103');
const HEAD='ee97495c93349edb42b726cccae8b1fb020542ef';
const variants=['control','candidate','unfrozen','uniform-gates','uniform-arrays','owned-inline'];
const operations=[['nested-d5-f4','mount'],['flat-500','mount'],['oneOf-20','mount'],['sample-0','mount'],['sample-0','later'],['oneOf-40','later']];
const read=name=>JSON.parse(fs.readFileSync(path.join(artifacts,name+'.json'),'utf8'));
const sha=text=>createHash('sha256').update(text).digest('hex');
const median=values=>values.toSorted((a,b)=>a-b)[Math.ceil(values.length/2)-1];
const fmt=(value,digits=4)=>value.toFixed(digits);
const started=Date.now();

/** Reproduce the canonical deterministic 1999-trial bootstrap used for the noise gate. */
function bootstrap(values){
  let state=101;const medians=[];
  for(let trial=0;trial<1999;trial++){
    if(trial%100===0)assert(Date.now()-started<420000,'Split summary before eight minutes');
    const sample=[];
    for(let i=0;i<values.length;i++){
      state^=state<<13;state^=state>>>17;state^=state<<5;sample.push(values[(state>>>0)%values.length]);
    }
    medians.push(median(sample));
  }
  medians.sort((a,b)=>a-b);const center=median(values);
  return {center,ci95:[medians[49],medians[1949]],error99:Math.max(Math.abs(medians[9]-center),Math.abs(medians[1989]-center))};
}

/** Validate the exact measured matrix and retain local HEAD comparators for every bound. */
const timing=[],windows=[];
for(const [name,mode]of operations){
  const controls=[1,2,3].map(run=>read(`time-control-${name}-${mode}-r${run}`));
  const noOpNoiseMs=Math.max(...controls.flatMap(row=>[Math.abs(row.gainMs),Math.abs(row.pairedMedianMs)]));
  for(const variant of variants){
    const records=[1,2,3].map(run=>read(`time-${variant}-${name}-${mode}-r${run}`));
    const runs=records.map(row=>{
      assert.equal(row.HEAD,HEAD);assert.equal(row.warmup,20);assert.equal(row.samples,101);
      assert.deepEqual(row.calls,{head:121,variant:121});assert.equal(row.regime,'forced');
      assert.equal(row.timingsMs.head.length,101);assert.equal(row.timingsMs.variant.length,101);assert.equal(row.windows.length,202);
      assert.deepEqual(row.observation.head,row.observation.variant);
      assert(row.elapsedMs<480000);windows.push([row.started,row.ended]);
      if(row.bundleSha256)for(const [key,v]of [['head','head'],['variant',variant]])assert.equal(row.bundleSha256[key],sha(fs.readFileSync(path.join(bundles,`shape103-${v}.cjs`))));
      const inside=row.gc.filter(event=>row.windows.some(window=>event.start>=window.begin&&event.start<window.end));
      assert.equal(inside.filter(event=>event.kind===4).length,0,'forced major GC stays outside clocks');
      const residuals=[...row.emptyTimingsMs.before,...row.emptyTimingsMs.after].map(value=>Math.abs(value-row.empty)).sort((a,b)=>a-b);
      const headError=bootstrap(row.timingsMs.head).error99,variantError=bootstrap(row.timingsMs.variant).error99;
      const noiseMs=Math.max(.001,noOpNoiseMs,residuals[Math.ceil(residuals.length*.95)-1]+headError+variantError);
      const paired=bootstrap(row.pairedDeltasMs);
      return {run:row.run,headMs:row.headMs,variantMs:row.variantMs,gainMs:row.gainMs,pairedMedianMs:row.pairedMedianMs,
        noiseMs,pairedCi95:paired.ci95,emptyMs:row.empty,gcInside:inside.length,file:`profile-103-freeze/time-${variant}-${name}-${mode}-r${row.run}.json`};
    });
    const pooled=bootstrap(records.flatMap(row=>row.pairedDeltasMs));
    timing.push({name,mode,variant,headMs:median(runs.map(row=>row.headMs)),variantMs:median(runs.map(row=>row.variantMs)),
      gainMs:median(runs.map(row=>row.gainMs)),gainRunRangeMs:[Math.min(...runs.map(row=>row.gainMs)),Math.max(...runs.map(row=>row.gainMs))],
      pairedMedianMs:median(runs.map(row=>row.pairedMedianMs)),pooledPairedMedianMs:pooled.center,pooledPairedCi95:pooled.ci95,
      noOpNoiseMs,maxNoiseMs:Math.max(...runs.map(row=>row.noiseMs)),
      aboveNoise:runs.every(row=>row.gainMs>row.noiseMs),belowNoise:runs.every(row=>row.gainMs< -row.noiseMs),runs});
  }
}
windows.sort((a,b)=>a[0]-b[0]);for(let i=1;i<windows.length;i++)assert(windows[i][0]>=windows[i-1][1],'sequential timer processes');

const ic={};
for(const name of ['nested-d5-f4','flat-500']){
  ic[name]={};
  for(const variant of ['head','candidate','unfrozen','uniform-gates','uniform-arrays','owned-inline']){
    const raw=read(`ic-${variant}-${name}`);
    ic[name][variant]={file:`profile-103-freeze/ic-${variant}-${name}.json`,allBundleSites:raw.allBundleSites,
      functions:Object.fromEntries(Object.entries(raw.functions).map(([fn,row])=>[fn,{loggedSites:row.loggedSites,mono:row.mono,poly:row.poly,mega:row.mega,freezeMixSites:row.freezeMixSites,
        sites:row.sites.map(site=>({file:site.file,line:site.line,column:site.column,type:site.type,key:site.key,keys:site.keys,
          observedMapCount:site.mapCount||null,state:site.state,lowerBound:site.mapCountIsLowerBound,elementsKinds:site.elementsKinds,
          freezeMix:site.freezeMix,maps:site.maps,states:[...new Set(site.transitions.map(row=>row.from+'>'+row.to))]}))}])),
      deopts:raw.deopts.filter(row=>row.product).map(({phase,function:fn,reason,bytecodeOffset})=>({phase,function:fn,reason,bytecodeOffset})),
      otherFreezeMixSites:raw.otherFreezeMixSites.map(row=>({function:row.function,file:row.file,line:row.line,key:row.key,mapCount:row.mapCount}))};
  }
}

const counts=[];
for(const variant of ['head','candidate','unfrozen','uniform-gates','uniform-arrays','owned-inline'])for(const mode of ['production','development'])
  for(const name of ['nested-d5-f4','flat-500','oneOf-20','sample-0']){
    const row=read(`count-${variant}${mode==='development'?'-dev':''}-${name}`);assert.equal(row.aliasCalls,0);
    counts.push({...row,variant,sites:undefined});
  }
const builds=Object.fromEntries(['head',...variants,...['head','candidate','unfrozen','uniform-gates','uniform-arrays','owned-inline'].map(v=>v+'-dev')]
  .filter((v,i,all)=>all.indexOf(v)===i).map(variant=>{const row=read('build-'+variant);assert.equal(row.sha256,sha(fs.readFileSync(path.join(bundles,`shape103-${variant}.cjs`))));return [variant,row];}));
assert.equal(builds.head.sha256,builds.control.sha256);
const safety=Object.fromEntries(['candidate','unfrozen','uniform-gates','uniform-arrays','owned-inline','owned-inline-dev'].map(variant=>{
  const row=read('verify-'+variant);return [variant,{equal:row.equal,schemas:row.schemas,captures:row.captures,protectedCaptures:row.safety.length,
    sharedMemberships:row.safety.reduce((sum,row)=>sum+row.sharedMemberships,0),issues:row.safety.flatMap(row=>row.issues)}];
}));
const lazy=Object.fromEntries(['head','candidate','owned-inline'].map(variant=>[variant,read('lazy-'+variant)]));
const cpu=Object.fromEntries(['head','candidate','owned-inline'].map(variant=>[variant,read(`cpu-${variant}-nested-d5-f4`)]));

/** Native object dumps corroborate allocation kinds without altering timed bundle instructions. */
const probe=[];let current;
for(const line of fs.readFileSync(path.join(scratch,'probe-candidate-nested-d5-f4.log'),'utf8').split('\n')){
  if(line.startsWith('PROBE ')){current=JSON.parse(line.slice(6));probe.push(current);}
  if(current&&/^ - map:/.test(line)&&!current.map){current.map=line.match(/0x[\da-f]+/)?.[0];}
  if(current&&/^ - elements kind:/.test(line)&&!current.elementsKind)current.elementsKind=line.split(': ')[1];
}
for(const row of probe){
  const actual={'raw.declaration':'analyze/collectDeclarations.ts:76','node.declarations':'analyze/buildNodes.ts:70',
    'public.schema':'effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:39'}[row.kind];
  if(actual){row.reportedCreation=row.creation;row.creation=actual;row.sourceOriginBasis='HEAD의 AST initializer 위치로 대조';}
}
const processRecords=fs.readdirSync(artifacts).filter(file=>file.startsWith('process-')&&file.endsWith('.json')).map(file=>({file,...JSON.parse(fs.readFileSync(path.join(artifacts,file),'utf8'))}));
const failedProcesses=processRecords.filter(row=>row.status!==0);
assert(processRecords.every(row=>row.signal===null&&row.elapsedMs<480000));
const sourceDiff=execFileSync('git',['--no-optional-locks','-c','core.fsmonitor=false','diff','--exit-code','HEAD','--','packages/canard/schema-form/src'],{cwd:repo,encoding:'utf8'});
assert.equal(sourceDiff,'');assert.equal(execFileSync('git',['--no-optional-locks','rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),HEAD);
const get=(variant,name,mode='mount')=>timing.find(row=>row.variant===variant&&row.name===name&&row.mode===mode);
const recovery=Object.fromEntries(['nested-d5-f4','flat-500','oneOf-20','sample-0'].map(name=>[name,{gainMs:get('owned-inline',name).gainMs,
  unfrozenBoundMs:get('unfrozen',name).gainMs,fraction:get('owned-inline',name).gainMs/get('unfrozen',name).gainMs,aboveNoise:get('owned-inline',name).aboveNoise}]));
const conclusion={
  hypothesis:'nested・flat mount의 회귀를 frozen/non-frozen map 혼합이 주로 일으켰다는 가설은 지지되지 않습니다. 혼합은 새 완료 함수 한 사이트에서 확인됐지만 기존 주요 소비 함수에는 이 혼합이 관측되지 않았습니다.',
  evidence:'gate membership 혼합을 제거한 uniform-gates와 보유 배열을 동결한 uniform-arrays가 더 느렸습니다. candidate 완료 보호는 별도 CPU 표본에서 mount당 약 1.46 ms였고 owned-inline은 이 순회를 수행하지 않습니다.',
  causalLimit:'새 동결 호출과 복사량도 함께 달라지므로 혼합의 기여를 정확히 0으로 증명한 단일 변수 실험은 아닙니다. 완료 순회・WeakSet 조회・동적 키 접근의 비용이 더 잘 맞는 설명입니다.',
  recommendation:'owned-inline: 내부 membership은 각 record가 소유하고 운영에서 동결하지 않습니다. 공개 schema・생산자가 만든 공개 배열/봉투・schemaType・공유 gate와 그 내부 metadata는 생성 지점에서 얕게 동결합니다. 공유 false 봉투도 소유 객체로 바꿉니다.',
  developmentCost:'개발에서는 소유 복사본도 동결하므로 HEAD보다 배열 수와 동결 수가 증가합니다. 개발 완료 보호에서 이미 동결된 schema의 중복 호출은 피합니다.',
  confidence:'잡음 판정을 통과한 회수율은 nested와 flat에 한정합니다. 작은 sample 및 후속 update의 수 µs 차이를 제품 개선 근거로 삼지 않습니다.'
};
const summary={HEAD,created:new Date().toISOString(),scope:'진단 전용; 제품 소스와 git 변경 없음',
  protocol:{name:'95C-01 verdict',warmup:20,samplesPerRun:101,runs:3,freshProcess:true,alternatingEachPair:true,forcedGCOutsideClock:true,
    schemaCloneOutsideClock:true,promiseCheckpoints:64,endpoint:'setImmediate sentinel 안',subtractedEmpty:'앞뒤 각 101회 drain의 합친 중앙값',
    noise:'max(0.001 ms, 동일 HEAD 대조의 최대 |gain|・|paired median|, empty residual p95 + 양쪽 중앙값 bootstrap 99% 오차)',
    ci95:'303개의 paired delta를 합친 중앙값의 일반 bootstrap 95% 구간; 프로세스 간 일반화 구간이 아님'},
  bundles:builds,timing,ic,freezeCounts:counts,safety,lazy,cpu,probe,recovery,conclusion,
  validation:{timerProcesses:windows.length,measuredPairs:windows.length*101,processRecords:processRecords.length,
    maxProcessElapsedMs:Math.max(...processRecords.map(row=>row.elapsedMs)),signals:0,signalScope:'측정/빌드 driver ledger에 기록된 프로세스',
    setupExceptions:[{operation:'측정 전 초기 rg 파일 목록 수집',errno:-55,code:'ENOBUFS',signal:'SIGTERM',status:null,
      reason:'execFileSync 출력 maxBuffer 초과',constraintViolation:'모든 프로세스 자연 종료 조건을 한 번 위반했습니다.',
      beforeMeasurements:true,measurementDataUsed:false}],failedProcesses:failedProcesses.map(row=>({file:row.file,status:row.status})),
    sequentialTimers:true,forcedMajorGCInsideClocks:0,sourceDiffEmpty:true,headControlByteIdentical:true,
    caveat:'초기 unfrozen 빌드 설정 실패는 수정됐고 성공 자료만 사용했습니다. 프로세스 간 IC map 주소를 직접 비교하지 않습니다.'},
  artifacts:{directory:artifacts,bundles,scratch,rawIcPattern:'ic-{variant}-{fixture}.log',deoptPattern:'deopt-{variant}-{fixture}.log',
    manifest:'profile-103-freeze/measure.mjs',icParser:'profile-103-freeze/parse-ic.mjs'},
  limitations:['IC 로그는 상태 전환만 기록하며 접근 빈도나 모든 최적화된 load를 기록하지 않습니다. 기록이 없다는 것은 미실행의 확정 증거가 아닙니다.',
    'N 이후 map 수는 하한이며, 동적 키 접근은 receiver map이 두 개여도 N이 됩니다. map 필드가 0인 array-literal IC의 map 수는 미제공입니다.',
    'selectChildren・computeNode・markWrite・readProjectedValue의 mount IC는 이 두 무게이트 fixture에서 기록되지 않았습니다. update의 IC로 일반화하지 않습니다.',
    'PACKED/HOLEY 전환은 freeze 여부와 별개입니다. candidate뿐 아니라 unfrozen과 owned-inline에서도 일부 wrong-map deopt가 나타납니다.',
    '앞선 2.1253 ms는 다른 HEAD와 전체 source Object.freeze ablation입니다. 이번 unfrozen은 blueprint 안의 freeze만 제거하고 밖의 동결을 보존했습니다.',
    '동결 수는 모듈 로드 상수를 제외한 cold mount의 서로 다른 대상 수입니다. 개발 측정은 비용 계수이며 속도 비교가 아닙니다.']};
const text=JSON.stringify(summary)+'\n';assert(Buffer.byteLength(text)<=5_000_000);
fs.writeFileSync(path.join(directory,'profile-103-freeze-summary.json'),text);

const lines=[`# 103라운드 동결・IC 진단`, '',
  `기준 HEAD는 \`${HEAD}\`입니다. **동결 여부가 섞여서 주요 소비 함수가 다형화됐다는 설명은 이번 nested・flat 자료에서 지지되지 않습니다.** 새 완료 함수의 gate 배열 \`length\`에는 실제 혼합이 있었으나, 그 혼합을 제거한 변형도 더 느렸습니다. 완료 순회・약한 색인 조회・동적 키 읽기 비용이 회귀와 더 잘 맞습니다. 이는 관측을 종합한 추론이며 각 원인의 독립적인 시간 기여를 확정한 결과는 아닙니다.`, '',
  `권장 측정 정책은 **owned-inline**입니다. 운영에서 내부 membership을 record별 소유 복사본으로 두고, 공개 schema와 생산자가 만든 공개 값・schemaType 및 공유 gate metadata를 생성 지점에서 보호합니다. nested와 flat에서 동결 전체 제거 절감량의 각각 **${fmt(recovery['nested-d5-f4'].fraction*100,1)}%・${fmt(recovery['flat-500'].fraction*100,1)}%**를 회수했습니다. 제품에는 적용하지 않았습니다.`, '',
  `## 측정 조건`, '',
  `production 번들 6개 정책과 동일 HEAD 대조를 사용했습니다. 모든 판정 실행은 새 Node 프로세스, 엔진별 warmup 20회, 101쌍, 3회입니다. 각 표본의 H/V 순서는 교대하며 회차의 시작 순서도 바뀝니다. 입력 복사와 강제 GC는 시계 밖이고, 시계는 operation부터 64 Promise checkpoint 뒤 setImmediate sentinel 내부까지입니다. 앞뒤 각 101회 empty drain을 합친 중앙값을 양쪽에서 뺐습니다. 강제 major GC의 시계 안 시작은 0개입니다.`, '',
  `IC・map・deopt와 CPU 계측은 판정 타이머와 별도 프로세스에서 수행했습니다. IC는 각 번들・각 fixture의 20+101 mount, CPU도 별도의 20+101 mount이며 sample interval은 100 µs입니다. profiler의 시간은 상한 집계에 쓰지 않았습니다.`, '',
  `## 판정 열의 상한`, '',
  `아래 Δ는 각 페어 안의 **HEAD 중앙값 − 변형 중앙값**을 계산한 뒤 3회 중앙값을 취한 값입니다. 양수가 빠릅니다. [최소, 최대]는 세 회차의 범위이며 신뢰구간이 아닙니다. 서로 다른 프로세스의 absolute ms를 직접 빼지 않습니다. paired median과 95% 구간, 회차별 HEAD/V absolute ms는 뒤 표와 JSON에 별도로 기록했습니다.`, '',
  `| 작업 | candidate | unfrozen | uniform-gates | uniform-arrays | owned-inline |`, `| --- | ---: | ---: | ---: | ---: | ---: |`];
for(const [name,mode]of operations)lines.push(`| ${name} ${mode} | `+['candidate','unfrozen','uniform-gates','uniform-arrays','owned-inline'].map(v=>{const row=get(v,name,mode);return `${fmt(row.gainMs)} [${row.gainRunRangeMs.map(x=>fmt(x)).join(', ')}]`;}).join(' | ')+' |');
lines.push('',`동일 HEAD control의 Δ 기준점은 0입니다. 측정된 대조의 차이는 잡음 바닥으로만 사용합니다. 각 절감량의 채택 판정은 기존 95C-01 규칙을 그대로 적용했습니다. 95% paired bootstrap 구간이 0을 넘는 것과, 이 더 보수적인 잡음 판정을 통과하는 것은 서로 다른 조건입니다.`, '',
  `| 작업 | 정책 | H ms | V ms | Δ ms | paired median ms | pooled paired 95% CI | 최대 잡음 ms | 판정 |`, `| --- | --- | ---: | ---: | ---: | ---: | --- | ---: | --- |`);
for(const row of timing){lines.push(`| ${row.name} ${row.mode} | ${row.variant} | ${fmt(row.headMs)} | ${fmt(row.variantMs)} | ${fmt(row.gainMs)} | ${fmt(row.pairedMedianMs)} | [${row.pooledPairedCi95.map(x=>fmt(x)).join(', ')}] | ${fmt(row.maxNoiseMs)} | ${row.aboveNoise?'3/3 개선':row.belowNoise?'3/3 회귀':'잡음 기준 미통과'} |`);}
lines.push('',`candidate의 nested와 flat Δ는 세 회차 모두 음수였지만, 이번 no-op 대조 변동까지 포함한 엄격한 판정은 위 표를 따릅니다. 작은 sample mount와 두 후속 update는 안정적인 개선 근거가 없습니다. oneOf-40에서는 신호의 방향이 양수인 정책도 있으나 세 회차 모두 잡음 밖이라는 조건을 충족하지 못합니다.`, '',
  `## IC와 deopt`, '',
  `자체 parser는 code-creation의 PC 범위로 bundle 소유를 판별하고 source map과 원본 AST로 실제 접근 함수를 찾습니다. 최적화 코드에 inline된 접근은 caller가 아니라 원본 helper로 귀속했습니다. 동일한 동적 접근의 키들은 한 사이트로 합쳤습니다. map-details의 요소 종류・동결 특성・descriptor를 사용했으며 map 주소 자체는 같은 프로세스 안에서만 의미가 있습니다.`, '',
  `M/P/N은 V8의 mono/poly/mega 상태입니다. N 이후 map 수는 관측 하한입니다. 동적 키만 바뀌어도 N이 될 수 있어 N을 ‘receiver map이 다섯 개 이상’으로 해석하지 않습니다. IC는 전환 로그이며 호출 횟수나 완전한 load census가 아닙니다. map 필드 미제공과 로그 없음은 0개 shape 또는 통과로 해석하지 않았습니다.`, '',
  `| fixture | 정책 | 함수 | mono/poly/mega 사이트 | 동결 혼합 사이트 | warmup/sample product deopt | sample wrong map |`, `| --- | --- | --- | --- | ---: | --- | ---: |`);
for(const name of ['nested-d5-f4','flat-500'])for(const variant of ['head','candidate','unfrozen','uniform-gates','uniform-arrays','owned-inline']){
  const record=ic[name][variant];
  for(const fn of ['buildNodes','populateNodeChildren','collectDeclarations','assembleObject','commitStaticFirstNode','loadStaticFirstTree','freezeBlueprintDeclarations','freezeEffectiveSchema']){
    const row=record.functions[fn];if(!row?.loggedSites)continue;
    const deopts=record.deopts.filter(row=>row.function===fn);
    lines.push(`| ${name} | ${variant} | ${fn} | ${row.mono}/${row.poly}/${row.mega} | ${row.freezeMixSites} | ${deopts.filter(row=>row.phase==='warmup').length}/${deopts.filter(row=>row.phase==='samples').length} | ${deopts.filter(row=>row.phase==='samples'&&row.reason==='wrong map').length} |`);
  }
}
lines.push('',`nested에서 buildNodes는 HEAD 67/8/0 → candidate 71/3/0, populateNodeChildren는 91/0/0 → 89/0/0, assembleObject는 양쪽 40/0/0입니다. 원래 주요 소비 사이트가 후보에서 일괄적으로 frozen/non-frozen 혼합이나 megamorphic 상태로 바뀌는 패턴은 없습니다. flat에서도 assembleObject・commitStaticFirstNode의 모든 기록 사이트는 mono이고 동결 혼합이 없습니다.`, '',
  `candidate의 실제 혼합은 새 \`freezeBlueprintDeclarations.ts:17\`의 \`gates.length\`입니다. 같은 사이트에서 PACKED_FROZEN_ELEMENTS, PACKED_SMI_ELEMENTS, HOLEY_SMI_ELEMENTS의 **3개 map**과 0→1→P를 관측했습니다. fragment/raw declaration이 공유하는 gates는 \`collectDeclarations.ts:46,68\`에서 생성되고 완료 때 동결되며, 바인딩 declaration의 gates는 \`populateNodeChildren.ts:173\`의 map 결과로 생성되어 운영에서는 동결되지 않습니다. 공유 배열과 소유 배열의 구분은 맞지만, 이 길이 읽기는 새 완료 단계 안에 있습니다.`, '',
  `uniform-gates에서는 위 길이 읽기가 동결된 배열 1개 map의 mono로 바뀌었고 동결 혼합 사이트는 0개가 됐습니다. 그러나 gate 동결 호출을 추가한 순 비용으로 nested Δ ${fmt(get('uniform-gates','nested-d5-f4').gainMs)} ms, flat Δ ${fmt(get('uniform-gates','flat-500').gainMs)} ms였습니다. 따라서 혼합 제거만으로 채택할 수 없습니다. 추가 동결 비용이 포함되므로 혼합 효과의 정확한 0 증명도 아닙니다.`, '',
  `candidate의 \`freezeEffectiveSchema.ts:21\`은 \`schema[OWNED_KEYS[index]]\`라는 한 동적 접근입니다. 7개 이름과 두 가지 object schema map이 섞여 N이 됩니다. frozen/non-frozen receiver 혼합은 아니며, clause 접근을 포함해 두 mega 사이트가 새로 생겼습니다. owned-inline은 이를 고정 필드 읽기로 바꾸며 완료 순회 자체를 없앴습니다.`, '',
  `candidate의 sample phase에서 nested product wrong-map deopt는 ${ic['nested-d5-f4'].candidate.deopts.filter(row=>row.phase==='samples'&&row.reason==='wrong map').length}개, HEAD는 ${ic['nested-d5-f4'].head.deopts.filter(row=>row.phase==='samples'&&row.reason==='wrong map').length}개입니다. 그러나 unfrozen에도 ${ic['nested-d5-f4'].unfrozen.deopts.filter(row=>row.phase==='samples'&&row.reason==='wrong map').length}개가 있습니다. \`visitShape\`의 some/filter 사이트에서 PACKED_ELEMENTS와 HOLEY_ELEMENTS를 확인했으며, 동결을 전부 제거한 번들에도 같은 전환이 있습니다. wrong map을 곧바로 frozen map 원인으로 읽어서는 안 됩니다. unknown lazy deopt에는 이유를 만들어 붙이지 않았습니다.`, '',
  `selectChildren, computeNode, markWrite, readProjectedValue는 이 두 mount의 IC 로그에 없었습니다. 무게이트 fixture의 StaticFirstLoad 경로에서는 주로 loadStaticFirstTree → commitStaticFirstNode가 실행됩니다. oneOf의 전체 commit・gate 경로에 대한 IC 증거로 일반화하지 않습니다. 요청하신 모든 함수와 각 property/element 사이트의 map 수・주소・state・요소 종류는 이 보고서 마지막 표와 \`ic-*.json\`에 있습니다.`, '',
  `### 생성 위치의 실제 객체 확인`, '',
  `별도의 동일 20+101 mount 뒤 %DebugPrint를 실행했습니다. 이 probe는 타이머나 IC 근거 번들의 명령을 바꾸지 않았으며 마지막 관측 단계에서만 객체를 읽었습니다. 위치는 HEAD 생성 site를 기준으로 한 안정적인 참조이고 후보의 추가 import/줄 이동은 source snapshot에 남겼습니다.`, '',
  `| 종류 | 생성 위치 (blueprint/utils 아래) | candidate 동결 | 실제 elements kind |`, `| --- | --- | --- | --- |`);
for(const row of probe)lines.push(`| ${row.kind} | ${row.creation} | ${row.frozen?'동결':'비동결'} | ${row.elementsKind??'미제공'} |`);
lines.push('',`raw/bound declaration 객체는 둘 다 비동결입니다. 공개 유효 schema는 동결입니다. 따라서 서로 다른 record 종류의 상태가 다르다는 사실과 **같은 access site**가 여러 상태의 receiver를 읽는다는 사실을 구분해야 합니다. ready-time node.declarations의 HOLEY와 entry.declarations의 PACKED 차이도 동결과 별개입니다.`, '',
  `### 별도 CPU 표본`, '',`| 번들 | 함수 | self ms/mount | inclusive ms/mount |`, `| --- | --- | ---: | ---: |`);
for(const variant of ['head','candidate','owned-inline'])for(const row of cpu[variant].functions.filter(row=>/freezeBlueprint|freezeEffective/.test(row.function)||row.function==='blueprint'))lines.push(`| ${variant} | ${row.function} | ${fmt(row.selfMsPerMount)} | ${fmt(row.totalMsPerMount)} |`);
lines.push('',`candidate freezeBlueprintValues의 inclusive 값은 약 1.46 ms/mount이며 하위 freezeBlueprintValue 자체 self가 약 1.27 ms/mount입니다. 이 함수의 WeakSet.has/add와 native freeze 비용은 CPU 표본에서 서로 분리되지 않습니다. 별도 표본은 비용 위치를 설명하는 증거이고 판정 열의 절감량이나 두 비용의 합산 상한이 아닙니다.`, '',
  `## 종류별 정책과 보호`, '',
  `| 종류 | uniform-gates | uniform-arrays | 권장 owned-inline |`, `| --- | --- | --- | --- |`,
  `| fragment/raw/bound gates | 생성 시 모두 동결 | 생성 시 모두 동결 | record마다 새 배열을 소유하고 운영에서 비동결 |`,
  `| order | 공유 동결 유지 | 공유 동결 유지 | fragment/raw/bound/lazy 별 소유 복사; 운영 비동결 |`,
  `| declarations/childEntries 등 보유 membership | 후보의 소유・공유 구분 유지 | 해당 배열 종류 모두 동결 | 각 소유자의 새 배열; virtual edge의 공유 목록과 entry도 복사 |`,
  `| 일반 node/fragment/declaration/entry 기록 | 개발에서 동결 | 개발에서 동결 | 운영 비동결・개발 동결; 공유 metadata와 private graph 연결을 구분 |`,
  `| gate/evaluationReads/discriminator/appliesWhen | 후보의 공유 보호 유지 | 공유 보호 유지 | 공유 가능한 gate를 생성 시 보호; appliesWhen은 별도 소유 복사 후 동결 |`,
  `| EffectiveSchema 봉투 | 후보의 false 공유 상수는 동결 | 동일 | false도 새 소유 봉투; 운영의 일반 봉투와 일관되게 비동결 |`,
  `| 공개 schema/schemaType/생산자가 만든 공개 배열・봉투 | 완료 때 보호 | 완료 때 보호 | 생성 완료 시 보호; 고정 필드 읽기・owned index만 사용 |`,
  `| 완료 순회/FrozenBlueprintValues | 유지 | 유지・보호 대상 증가 | 운영에서 수행하지 않음; 개발에서만 완료 보호 |`, '',
  `소유 복사를 택할 때 virtual node가 빌리던 child entry와 declaration 목록, validation-only 복사, lazy item binding의 order/gates까지 함께 소유하게 했습니다. 원래 gate 객체의 재사용과 authored 조건・default・hint의 빌린 하위 값은 보존합니다. cache hit의 참조 재사용과 공개 node/value 동작도 유지합니다. 내부 alias의 개수는 바뀌므로 원래 내부 identity를 제품 계약으로 넓게 약속했다면 별도 계약 검토가 필요합니다.`, '',
  `59개 스키마 × collect off/on의 118 capture에서 정규화 schema・필드 순서・선언/fragment/entry 데이터・오류와 진단을 HEAD와 비교했습니다. 유효 capture 70개에서는 공개 schema와 새 공개 container, shared membership, gate를 얕게 보호하는지 검사했고 입력이 변경되지 않았는지도 검사했습니다. owned-inline은 운영・개발 양쪽에서 통과했습니다. all-unfrozen은 출력 비교만 통과했으며 보호 검사를 의도적으로 적용하지 않은 측정용 상한입니다.`, '',
  `lazy slot 0/1에서 cache 재조회 시 같은 entry와 같은 template 참조를 확인했습니다. 권장 변형의 order/gates는 slot마다 다른 배열이고, HEAD/candidate의 공유 order/gates는 동결돼 있습니다. 성공 mount와 후속 update의 최종 public value hash는 모든 판정 페어에서 같았습니다. 이는 제품 배포 승인이나 전체 React 회귀 시험의 대체가 아닙니다.`, '',
  `## 모드별 동결 수`, '',
  `모듈 로드 때의 상수는 제외했고 blueprint 밖의 기존 동결은 포함했습니다. calls와 distinct 수를 별도로 세었으며 아래 최종 자료의 alias 추가 호출과 primitive 호출은 0개입니다. 배열 복사 수・메모리 byte는 동결 수와 같지 않으며 측정하지 않았습니다.`, '',
  `| 폼 | 정책 | 운영 distinct / node | 개발 distinct / node | 운영 distinct | 개발 distinct |`, `| --- | --- | ---: | ---: | ---: | ---: |`);
for(const name of ['nested-d5-f4','flat-500','oneOf-20','sample-0'])for(const variant of ['head','candidate','unfrozen','uniform-gates','uniform-arrays','owned-inline']){
  const p=counts.find(row=>row.name===name&&row.variant===variant&&row.mode==='production'),d=counts.find(row=>row.name===name&&row.variant===variant&&row.mode==='development');
  lines.push(`| ${name} | ${variant} | ${fmt(p.freezesPerNode)} | ${fmt(d.freezesPerNode)} | ${p.distinct} | ${d.distinct} |`);
}
lines.push('',`권장 정책의 운영 수는 nested 3071/1365, flat 1003/501, oneOf 116/63, sample 8/3입니다. nested・flat은 공개 schema N개와 blueprint 밖의 기존 동결이 대부분입니다. 개발 수는 소유 복사본을 보호하므로 nested 30372/1365, flat 11024/501입니다. 개발 비용 증가를 숨기고 ‘운영 수 감소’만으로 추천하지 않습니다.`, '',
  `oneOf의 권장 생성 지점 보호는 버려질 정적 schema도 보호하여 static schema 63개를 처리합니다. 후보의 완료 방식에서는 61개 정적 schema를 보유하지 않아 제외합니다. 이 수명 차이가 있으므로 schema freeze 수만으로 완료 정책이 더 낫다고 판단하지 않습니다. 앞선 2.1253 ms 상한은 다른 HEAD와 전체 source freeze 제거였고, 이번 unfrozen은 blueprint 안만 제거했으므로 숫자가 같아야 할 이유가 없습니다.`, '',
  `## 실행・산출물 확인`, '',
  `최종 타이머 프로세스 ${windows.length}개, paired sample ${windows.length*101}쌍의 행/개수/값 해시와 순차 실행을 확인했습니다. 측정/빌드 driver ledger에 기록된 프로세스의 최대 시간은 ${fmt(summary.validation.maxProcessElapsedMs/1000,3)}초이며 signal은 0개입니다. build service는 stdin EOF로 정상 종료했습니다. 초기 unfrozen 빌드의 wrapper/경로 설정 실패는 수정됐고 실패 시간은 집계하지 않았습니다. 권장 정책 정리 뒤에는 해당 정책의 18개 타이머와 IC・CPU・계수를 새 번들로 재실행했습니다.`, '',
  `자연 종료 조건 위반 1회: 측정 전 초기 파일 목록 수집의 rg는 execFileSync 출력 maxBuffer 초과(ENOBUFS, errno -55)로 SIGTERM 종료됐습니다. 이 수집 오류는 측정 자료에 사용하지 않았습니다. 위 signal 0개는 측정/빌드 driver ledger 범위이며, 이번 작업의 모든 프로세스가 자연 종료했다는 뜻은 아닙니다.`, '',
  `HEAD는 그대로이고 \`packages/canard/schema-form/src\`의 tracked diff는 없습니다. git write・설치・제품 소스 수정・monorepo 검사・병렬 측정은 수행하지 않았습니다. 모든 bundle/map과 원시 V8 로그는 지정된 저장소 밖 bundles 경로에만 있습니다. D 아래 실행별 파일은 profile-103-freeze에만 만들었고 5 MB cap을 검사했습니다. 이 두 보고서는 D의 요청된 경로에 있습니다.`, '',
  `- [전체 요약 JSON](profile-103-freeze-summary.json)`,
  `- [측정 및 메모리 변형](profile-103-freeze/measure.mjs)`,
  `- [IC parser](profile-103-freeze/parse-ic.mjs)`,
  `- [통계와 보고서 생성](profile-103-freeze/summarize.mjs)`,
  `- 원시 타이머: \`profile-103-freeze/time-{variant}-{fixture}-{mode}-r{1,2,3}.json\``,
  `- 상세 IC/map: \`profile-103-freeze/ic-{variant}-{fixture}.json\``,
  `- 원시 V8/deopt/CPU: \`${scratch}\``, '',
  `## 주요 함수의 각 접근 사이트`, '',
  `각 행은 원본 source map의 file:line:column과 IC 종류/키를 주소로 삼습니다. 열은 관측 map 수/최종 상태이며 동적 키 집합과 map 주소・descriptor는 상세 IC JSON에 있습니다. 행을 묶어 합치면서 누락하지 않도록 모든 요청 함수와 추가 완료/검증/commit 함수의 기록 사이트를 정책별로 보존했습니다. \`미제공\`은 map 필드가 없다는 뜻이고 \`N≥\`는 관측 하한입니다. 상태 other는 일반 IC의 1/P/N 전환을 기록하지 않은 사이트입니다.`, '');
for(const name of ['nested-d5-f4','flat-500'])for(const variant of ['head','candidate','unfrozen','uniform-gates','uniform-arrays','owned-inline']){
  lines.push(`### ${name} / ${variant}`,'',`| 함수 | file:line:column (src/core/ 생략) | 접근 | map 수 / state | 요소 종류 |`, `| --- | --- | --- | --- | --- |`);
  for(const [fn,row]of Object.entries(ic[name][variant].functions))for(const site of row.sites){
    const short=site.file.replace('packages/canard/schema-form/src/core/','');
    const count=site.observedMapCount===null?'미제공':`${site.lowerBound?'≥':''}${site.observedMapCount}`;
    lines.push(`| ${fn} | ${short}:${site.line}:${site.column} | ${site.type} ${site.key.replaceAll('|','\\|')} | ${count} / ${site.state}${site.freezeMix?' (동결 혼합)':''} | ${site.elementsKinds.join(', ')} |`);
  }
}
const report=lines.join('\n')+'\n';assert(Buffer.byteLength(report)<=5_000_000);
fs.writeFileSync(path.join(directory,'profile-103-freeze.md'),report);
console.log(JSON.stringify({summaryBytes:Buffer.byteLength(text),reportBytes:Buffer.byteLength(report),timerProcesses:windows.length,
  rows:timing.map(({name,mode,variant,gainMs,maxNoiseMs,aboveNoise,belowNoise})=>({name,mode,variant,gainMs,maxNoiseMs,aboveNoise,belowNoise})),recovery,
  candidateMixedSite:ic['nested-d5-f4'].candidate.functions.freezeBlueprintDeclarations.sites.filter(row=>row.freezeMix),maxProcessElapsedMs:summary.validation.maxProcessElapsedMs}));
