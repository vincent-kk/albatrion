// CLI reporter: split calibration, per-fixture rows, and final stdout artifacts.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const work = path.dirname(fileURLToPath(import.meta.url)), directory = path.dirname(work);
const repo = path.resolve(directory, '../../../../../..'), started = Date.now();
const HEAD = '0f690b0fa489c84cd2266f86928be27a8d0abe52';
const baseline = JSON.parse(fs.readFileSync(path.join(directory, 'profile-107-remaining-summary.json'), 'utf8'));
const fixtures = ['sample-0','sample-1','sample-2','sample-3','flat-50','flat-100','flat-500','nested-d3-f4','nested-d5-f4','array-100','array-500','array-1000','computed-visible-derived','oneOf-20'];
const pairs = [...fixtures.map(fixture => ({fixture,validation:'off'})), ...['oneOf-5','oneOf-10','oneOf-20','oneOf-40','if-then'].flatMap(fixture => (fixture === 'oneOf-20' ? ['on'] : ['off','on']).map(validation => ({fixture,validation})))];
const read = (file, folder = work) => JSON.parse(fs.readFileSync(path.join(folder, file + '.json'), 'utf8'));
const record = (fixture, validation, run, version) => read(`official-${fixture}-${validation}-r${run}-${version}`);
const prior = (fixture, run, version) => read(`official-${fixture}-r${run}-${version}`, path.join(directory,'profile-107-remaining'));
const q = (values,p) => values.toSorted((a,b)=>a-b)[Math.ceil(values.length*p)-1];
const median = values => q(values,.5);
const metric = values => ({median:median(values),p99:q(values,.99),samples:values.length});
const hash = value => createHash('sha256').update(value).digest('hex');
const bootstrap = (values,seed) => {
  let state = seed >>> 0; const estimates=[];
  for(let trial=0;trial<1000;trial++) {
    const sample=[];
    for(let i=0;i<values.length;i++){state=(Math.imul(state,1664525)+1013904223)>>>0;sample.push(values[Math.floor(state/4294967296*values.length)]);}
    estimates.push(median(sample)); assert(Date.now()-started<420000,'Split reporter commands');
  }
  const center=median(values),low=q(estimates,.005),high=q(estimates,.995);
  return {low,high,halfWidth:Math.max(center-low,high-center),resamples:1000,seed};
};
const calibrate = records => {
  const empty=records.flatMap(r=>[...r.timings['empty-before'],...r.timings['empty-after']]);
  const waiting=empty.map(x=>x[1]-x[0]),waitMedian=median(waiting);
  const C=median(empty.map(x=>x[1])),M=median(empty.map(x=>x[0]));
  return {C,M,wait:C-M,emptyNoise:q(waiting.map(x=>Math.abs(x-waitMedian)),.95),emptyEndCi:bootstrap(empty.map(x=>x[1]),9501),emptyMicroCi:bootstrap(empty.map(x=>x[0]),9502),emptyCalls:empty.length};
};
const evaluate = (records,mode,calibration) => {
  const {C,M,emptyNoise,emptyEndCi,emptyMicroCi}=calibration;
  const callCount=mode==='update'?records[0].summary.interactionCount:1,versions={};
  for(const version of ['new','old']) {
    const runs=[1,2,3].map(run=>{
      const t=records.find(r=>r.summary.run===run&&r.summary.version===version).timings;
      const sentinel=t[mode].map(x=>x[1]-C*callCount),microtask=t[mode].map(x=>x[0]-M*callCount),callback=t[mode+'-callback'];
      const sum=microtask.map((x,i)=>x+callback[i]),expected=version==='new'?microtask:sum;
      const noise=Math.max(.001,callCount*emptyNoise+bootstrap(sentinel,run*100+95).halfWidth+bootstrap(expected,run*100+96).halfWidth+callCount*(emptyEndCi.halfWidth+emptyMicroCi.halfWidth));
      const difference=median(sentinel)-median(expected);
      return {run,sentinel,microtask,callback,sum,differenceMs:difference,noiseMs:noise,withinNoise:Math.abs(difference)<=noise};
    });
    const pooled=Object.fromEntries(['sentinel','microtask','callback','sum'].map(key=>[key,runs.flatMap(r=>r[key])]));
    const expected=version==='new'?pooled.microtask:pooled.sum;
    const noise=Math.max(.001,callCount*emptyNoise+bootstrap(pooled.sentinel,9593).halfWidth+bootstrap(expected,9594).halfWidth+callCount*(emptyEndCi.halfWidth+emptyMicroCi.halfWidth));
    const difference=median(pooled.sentinel)-median(expected),withinNoise=Math.abs(difference)<=noise;
    const fallback=version==='old'&&(!withinNoise||runs.some(r=>!r.withinNoise));
    versions[version]={fallback,column:fallback?'(나) microtask + callback 합':'종단',metric:metric(fallback?pooled.sum:pooled.sentinel),sentinel:metric(pooled.sentinel),microtask:metric(pooled.microtask),callback:metric(pooled.callback),sum:metric(pooled.sum),validation:{differenceMs:difference,noiseMs:noise,withinNoise,allRunsWithinNoise:runs.every(r=>r.withinNoise)},runs:runs.map(r=>({run:r.run,differenceMs:r.differenceMs,noiseMs:r.noiseMs,withinNoise:r.withinNoise,metric:metric(fallback?r.sum:r.sentinel)}))};
  }
  const ratio=versions.new.metric.median/versions.old.metric.median,runRatios=[0,1,2].map(i=>versions.new.runs[i].metric.median/versions.old.runs[i].metric.median);
  const tie=runRatios.some(x=>x<=1.5)&&runRatios.some(x=>x>1.5);
  return {mode,callCount,ratio,runRatios,tie,target:1.5,met:tie||ratio<=1.5,verdict:tie?'충족 (공식 동률 규칙)':ratio<=1.5?'충족':'미달',...versions};
};
const [command,fixture,validation]=process.argv.slice(2);
assert.equal(process.version,baseline.environment.node);
assert.equal(execFileSync('git',['--no-optional-locks','rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),HEAD);
execFileSync('git',['--no-optional-locks','diff','--quiet','HEAD','--','packages/canard/schema-form/src'],{cwd:repo});
const unrelatedTrackedChanges=execFileSync('git',['--no-optional-locks','diff','--name-only','HEAD'],{cwd:repo,encoding:'utf8'}).trim().split('\n').filter(Boolean);
assert(unrelatedTrackedChanges.every(file=>file==='packages/canard/schema-form/architecture/verification/07-switch/analysis-records-design.md'));
if(command==='--calibration') {
  const records=pairs.flatMap(p=>[1,2,3].flatMap(run=>(run===2?['new','old']:['old','new']).map(version=>record(p.fixture,p.validation,run,version))));
  const toolHash=hash(fs.readFileSync(path.join(directory,'tools/measure-verdict-95c01.mjs')));
  for(const r of records) {
    const s=r.summary;assert.equal(s.environment.head,HEAD);assert.equal(s.warmup,20);assert.equal(s.sampleCount,101);
    assert.equal(s.explicitGc,true);assert.equal(s.officialEngineInstrumentation,false);assert.equal(s.toolSha256,toolHash);
    assert.equal(s.boundaryWrapperInstalledAfterOfficialSamples,true);assert.equal(s.environment.node,baseline.environment.node);assert.equal(s.environment.v8,baseline.environment.v8);
    assert.equal(s.workerExit.code,0);assert.equal(s.workerExit.signal,null);assert.equal(s.workerExit.natural,true);assert(s.workerExit.elapsedMs<480000);
    assert(s.serviceExits.every(x=>x.code===0&&x.signal===null));assert.equal(s.bundleEvidence[0].phaseHooks,0);
    for(const order of Object.values(s.ordering)){assert.equal(order.pendingAtSentinel.p99,0);assert.equal(order.tailScheduled.p99+order.tailExecuted.p99,0);if(s.version==='new')assert.equal(order.scheduled.p99,0);}
    assert(Object.values(r.timings).every(x=>x.length===101));
  }
  for(let i=1;i<records.length;i++)assert(Date.parse(records[i].summary.environment.started)>Date.parse(records[i-1].summary.environment.ended));
  for(const p of pairs)for(const run of [1,2,3])assert.deepEqual(record(p.fixture,p.validation,run,'old').summary.checks,record(p.fixture,p.validation,run,'new').summary.checks);
  const byValidation={off:calibrate(records.filter(r=>r.summary.validation==='off'&&fixtures.includes(r.summary.fixture))),on:calibrate(records.filter(r=>r.summary.validation==='on'))};
  const bundles=Object.fromEntries(['new','old'].map(v=>[v,records.filter(r=>r.summary.version===v).map(r=>r.summary.bundleEvidence[0].sha256).filter((x,i,a)=>a.indexOf(x)===i)]));
  assert.equal(bundles.new.length,1);assert.equal(bundles.old.length,1);
  console.log(JSON.stringify({byValidation,workers:records.length,node:process.version,v8:process.versions.v8,cpu:records[0].summary.environment.cpu,started:records[0].summary.environment.started,ended:records.at(-1).summary.environment.ended,toolHash,bundles,maxWorkerMs:Math.max(...records.map(r=>r.summary.workerExit.elapsedMs)),naturalMeasurementExits:true,overlap:false,unrelatedTrackedChanges:unrelatedTrackedChanges.map(file=>({file,mtime:fs.statSync(path.join(repo,file)).mtime.toISOString(),sha256:hash(fs.readFileSync(path.join(repo,file)))})),reportCommandElapsedMs:Date.now()-started}));
} else if(command==='--rows') {
  assert(pairs.some(p=>p.fixture===fixture&&p.validation===validation));
  const records=[1,2,3].flatMap(run=>['old','new'].map(version=>record(fixture,validation,run,version)));
  const calibration=read('calibration').byValidation[validation],rows=[];
  const modes=[...(validation==='off'&&fixtures.includes(fixture)?['mount']:[]),'update','update-first','update-later'];
  for(const mode of modes) {
    const row={fixture,validation,...evaluate(records,mode,calibration)};
    if(validation==='off'&&fixtures.includes(fixture)) {
      const old=mode==='mount'?baseline.rows.find(r=>r.fixture===fixture):evaluate([1,2,3].flatMap(run=>['old','new'].map(version=>prior(fixture,run,version))),mode,baseline.calibration);
      row.previous107={head:baseline.HEAD,ratio:old.ratio,runRatios:old.runRatios,met:old.met,tie:old.tie,oldColumn:old.old.column,newMedianMs:old.new.metric.median,oldMedianMs:old.old.metric.median,source:mode==='mount'?'profile-107-remaining-summary.json':'107 원시 표본과 107 공통 보정으로 재계산'};
      row.changeSince107={ratioDelta:row.ratio-old.ratio,ratioPercent:(row.ratio/old.ratio-1)*100,newMedianDeltaMs:row.new.metric.median-old.new.metric.median,oldMedianDeltaMs:row.old.metric.median-old.old.metric.median,verdictChanged:row.met!==old.met};
      row.newlyFailsSince107=old.met&&!row.met;
    } else {row.previous107=null;row.changeSince107=null;row.newlyFailsSince107=null;row.comparisonNote='107라운드에 해당 행의 비교 표본이 없습니다.';}
    rows.push(row);
  }
  console.log(JSON.stringify({fixture,validation,rows,reportCommandElapsedMs:Date.now()-started}));
} else if(command==='--audit') {
  const rows=pairs.flatMap(p=>read(`rows-${p.fixture}-${p.validation}`).rows);
  assert.equal(rows.length,83);assert.equal(rows.filter(r=>r.mode==='mount').length,14);
  assert(rows.every(r=>Number.isFinite(r.ratio)&&r.new.metric.median>0&&r.old.metric.median>0));
  const official95=read('verdict-95c01-summary',directory);
  const historical=[...official95.officialRows,...official95.updateSplitRows];
  const comparisons=rows.map(row=>{
    const previous=historical.find(r=>r.fixture===row.fixture&&r.validation===row.validation&&r.mode===row.mode);
    assert(previous,`Missing official table row ${row.fixture}/${row.validation}/${row.mode}`);
    const tie=previous.runRatios.some(x=>x<=1.5)&&previous.runRatios.some(x=>x>1.5);
    const met=tie||previous.ratio<=1.5;
    return {fixture:row.fixture,validation:row.validation,mode:row.mode,ratio:previous.ratio,runRatios:previous.runRatios,met,tie,newlyFails:met&&!row.met};
  });
  for(const fixture of fixtures)for(const run of [1,2,3])for(const version of ['old','new']) {
    assert.deepEqual(record(fixture,'off',run,version).summary.checks,prior(fixture,run,version).summary.checks);
  }
  const artifactFiles=fs.readdirSync(work).map(file=>({file,bytes:fs.statSync(path.join(work,file)).size,sha256:hash(fs.readFileSync(path.join(work,file)))}));
  assert(artifactFiles.every(f=>f.bytes<=5000000));assert(artifactFiles.every(f=>/\.(json|mjs)$/.test(f.file)));
  const aFailures=rows.filter(r=>!r.new.validation.withinNoise||!r.new.validation.allRunsWithinNoise).map(r=>({fixture:r.fixture,validation:r.validation,mode:r.mode,current:r.new.validation,previous107:r.previous107?evaluate([1,2,3].flatMap(run=>['old','new'].map(version=>prior(r.fixture,run,version))),r.mode,baseline.calibration).new.validation:null}));
  console.log(JSON.stringify({official95Comparisons:comparisons,sameFixtureResultDigestsSince107:true,productSourceDiff:false,head:HEAD,artifactFiles,artifactMaxBytes:Math.max(...artifactFiles.map(f=>f.bytes)),artifactsBeforeFinalReport:artifactFiles.length,allPooledAWithinNoise:rows.every(r=>r.new.validation.withinNoise),allRunAWithinNoise:rows.every(r=>r.new.validation.allRunsWithinNoise),aFailures,newlyFailingUpdateRowsSince107:rows.filter(r=>r.mode!=='mount'&&r.newlyFailsSince107).map(({fixture,validation,mode,ratio,previous107})=>({fixture,validation,mode,ratio,previousRatio:previous107.ratio})),newlyFailingUpdateRowsSince95:comparisons.filter(r=>r.mode!=='mount'&&r.newlyFails),reportCommandElapsedMs:Date.now()-started}));
} else assert.fail('Use --calibration, --rows, or --audit');
