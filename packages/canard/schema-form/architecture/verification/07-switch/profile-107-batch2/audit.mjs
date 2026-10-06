// Artifact checks validate runtime evidence and patch integrity; they never edit product or git state.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(directory, '../../../../../../..');
const bundles = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const read = name => JSON.parse(fs.readFileSync(path.join(directory, name + '.json'), 'utf8'));
const hash = text => createHash('sha256').update(text).digest('hex');
const phases = ['AA', '1-binding-literal', '2-declaration-slice', '3-object-assembly', '4-default-choices'];
const operations = [['nested-d5-f4', 'mount'], ['flat-500', 'mount'], ['oneOf-20', 'mount'], ['sample-0', 'mount'],
  ['sample-0', 'first'], ['sample-0', 'later'], ['nested-d5-f4', 'first'], ['nested-d5-f4', 'later'],
  ['oneOf-40', 'first'], ['oneOf-40', 'later']];
const mode = process.argv[2];
const save = (name, value) => {
  const text = JSON.stringify(value, null, 2) + '\n'; assert(Buffer.byteLength(text) <= 5_000_000);
  fs.writeFileSync(path.join(directory, name + '.json'), text);
};
if (mode === 'census') {
  const census = read('step-a');
  assert.equal(census.HEAD, 'e27f4b3b7e4c975adca702539889335f0b478fae');
  assert.equal(census.sites.length, 468);
  assert.equal(census.sites.filter(site => site.category === 'object spread').length, 48);
  assert.equal(census.sites.filter(site => site.category === 'object rest').length, 2);
  assert.equal(census.sites.filter(site => site.category === 'Object.assign').length, 0);
  for (const site of census.sites) {
    assert(site.file.startsWith('src/core/')); assert(site.line > 0);
    for (const name of ['nested-d5-f4', 'flat-500', 'sample-0'])
      assert(Number.isInteger(site.counts[name]) && site.counts[name] >= 0);
  }
  const selected = census.sites.find(site => site.file.endsWith('/appendChildEntries.ts') && site.line === 39);
  assert.deepEqual(selected.counts, { 'nested-d5-f4': 1364, 'flat-500': 500, 'sample-0': 2 });
  const assembly = census.sites.find(site => site.file.endsWith('/assembleObject.ts') && site.line === 143);
  assert.equal(assembly.category, 'variable runtime keys');
  assert.deepEqual(assembly.counts, { 'nested-d5-f4': 341, 'flat-500': 1, 'sample-0': 1 });
  save('census-audit', { sites: 468, flagged: 294, spreads: 48, rests: 2, assigns: 0,
    selected: [{ id: selected.id, file: selected.file, line: selected.line, counts: selected.counts }],
    externalInstrumentedCopy: path.join(bundles, 'batch2-step-a-copy'), helperWritesObserved: true });
  console.log('BATCH2_CENSUS_OK');
} else if (mode === 'measurements') {
  const summaries = phases.map(phase => read(phase + '-summary'));
  const processes = summaries.flatMap(summary => summary.processes).sort((a,b)=>a.started-b.started);
  assert.equal(processes.length, 450);
  assert(processes.slice(0,90).every(process=>process.args.at(-1)==='control'));
  const buildProcesses = fs.readdirSync(directory).filter(file=>/-process-build-/.test(file)).map(file=>JSON.parse(fs.readFileSync(path.join(directory,file),'utf8')));
  assert.equal(buildProcesses.length, 10);
  const allWorkers = [...processes, ...buildProcesses].sort((a,b)=>a.started-b.started);
  const driverSha256 = hash(fs.readFileSync(path.join(directory,'measure.mjs')));
  for (const process of allWorkers) {
    assert.equal(process.status,0); assert.equal(process.signal,null); assert(process.elapsedMs<480000);
    assert.equal(process.driverSha256,driverSha256);
  }
  for (let index=1;index<allWorkers.length;index++) assert(allWorkers[index].started>=allWorkers[index-1].ended);
  let base = summaries[0].builds.head.sourceTreeSha256, final = summaries[0].builds.head;
  for (const summary of summaries) {
    assert.equal(summary.rows.length,10); assert.equal(summary.design.runs,9);
    assert.equal(summary.design.bootstrapTrials,1999); assert.equal(summary.design.bootstrapSeed,101);
    if (summary.phase !== 'AA') assert.equal(summary.builds.head.sourceTreeSha256,base);
    for (const build of Object.values(summary.builds)) {
      assert.equal(build.naturalBuildServices,1);
      assert.equal(build.bundleSha256,hash(fs.readFileSync(path.join(bundles,`batch107b2-${summary.phase}-${build.version}.cjs`))));
    }
    for (const row of summary.rows) {
      const aa = summaries[0].rows.find(other=>other.name===row.name && other.mode===row.mode);
      assert.equal(row.aaStatisticMs,aa.pooledMedianMs);
      assert.equal(row.floorMs,row.baseMedianMs*0.005);
      if (summary.phase!=='AA') {
        assert.equal(row.improved,row.ci99Ms[0]>0 && row.pooledMedianMs>row.aaStatisticMs);
        assert.equal(row.regression,row.ci99Ms[1]<0 && Math.abs(row.pooledMedianMs)>Math.max(Math.abs(row.aaStatisticMs),row.floorMs));
      }
      const deltas=[];
      for (let run=1;run<=9;run++) {
        const sample=read(`${summary.phase}-forced-${row.name}-${row.mode}-r${run}`);
        assert.equal(sample.warmup,20); assert.equal(sample.samples,101); assert.equal(sample.freshProcess,true);
        assert.equal(sample.forcedGCOutsideClock,true); assert.equal(sample.windows.length,202);
        assert.equal(sample.observations.head,sample.observations.working);
        for (let index=0;index<101;index++) {
          assert.equal(sample.pairedDeltasMs[index],sample.timingsMs.head[index]-sample.timingsMs.working[index]);
          const first=(index+run-1)%2?'working':'head';
          assert.equal(sample.windows[2*index].version,first);
          assert.equal(sample.windows[2*index+1].version,first==='head'?'working':'head');
        }
        deltas.push(...sample.pairedDeltasMs);
      }
      assert.equal(deltas.length,909);
      assert.equal(row.pooledMedianMs,deltas.toSorted((a,b)=>a-b)[454]);
    }
    if (summary.phase!=='AA') {
      assert.equal(summary.adopted,summary.rows.some(row=>row.improved)&&!summary.rows.some(row=>row.regression));
      if (summary.adopted) { base=summary.builds.working.sourceTreeSha256; final=summary.builds.working; }
    }
  }
  for (const [file,expected] of Object.entries(final.sources)) assert.equal(hash(fs.readFileSync(path.join(repo,file))),expected,file);
  const allowed=['packages/canard/schema-form/src/core/blueprint/utils/analyze/collectDeclarations.ts',
    'packages/canard/schema-form/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts',
    'packages/canard/schema-form/src/core/behaviors/utils/options/getStaticChoices.ts'];
  const changed=Object.keys(final.sources).filter(file=>final.sources[file]!==summaries[0].builds.head.sources[file]).sort();
  assert.deepEqual(changed,allowed.sort());
  const rowDrivers=summaries.flatMap(summary=>operations.map(([name,mode])=>read(`${summary.phase}-driver-${name}-${mode}`)));
  assert.equal(rowDrivers.length,50); assert(rowDrivers.every(row=>row.status===0 && row.signal===null && row.elapsedMs<480000));
  save('measurements-audit',{ timerWorkers:450,buildWorkers:10,rowCommands:50,pairedSamples:45450,
    sequential:true,natural:true,aaFirst:true,finalSourceTreeSha256:base,
    maximumWorkerMs:Math.max(...allWorkers.map(row=>row.elapsedMs)),maximumRowMs:Math.max(...rowDrivers.map(row=>row.elapsedMs)),
    started:allWorkers[0].started,ended:allWorkers.at(-1).ended,changed });
  console.log('BATCH2_MEASUREMENTS_OK');
} else if (mode === 'patches') {
  const state=new Map();
  for (const phase of phases.slice(1)) {
    const summary=read(phase+'-summary'),baseline=read(phase+'-base');
    if (!summary.adopted) {
      assert(!fs.existsSync(path.join(directory,phase+'.patch')));
      for (const [file,text] of Object.entries(baseline.files)) {
        if (text===null) assert(!fs.existsSync(path.join(repo,file)));
        else if (!file.endsWith('/DETAIL.md')) assert.equal(fs.readFileSync(path.join(repo,file),'utf8'),text);
      }
      assert.equal(baseline.files['packages/canard/schema-form/src/core/blueprint/DETAIL.md'],
        read('2-declaration-slice-base').files['packages/canard/schema-form/src/core/blueprint/DETAIL.md']);
      continue;
    }
    for (const [file,text] of Object.entries(baseline.files)) {
      if (!state.has(file)) state.set(file,text);
      assert.equal(state.get(file),text,'Patch measured base: '+file);
    }
    applyPatch(state,fs.readFileSync(path.join(directory,phase+'.patch'),'utf8'));
    const manifest=read(phase+'-files'); assert.equal(manifest.measuredBase,phase+'-build-head.json');
    assert(manifest.files.some(file=>file.file.endsWith('/DETAIL.md')));
    assert(manifest.files.some(file=>file.file.includes('.test.ts')));
    for (const file of manifest.files.filter(file=>file.file.endsWith('/DETAIL.md'))) assert(file.detailLines.length>0);
  }
  for (const [file,text] of state) assert.equal(fs.readFileSync(path.join(repo,file),'utf8'),text,file);
  const require=createRequire(path.join(repo,'package.json')),ts=require('typescript');
  const file='packages/canard/schema-form/src/core/behaviors/objectBehavior/branch/utils/__tests__/assembleObject.first-work.test.ts';
  const current=fs.readFileSync(path.join(repo,file),'utf8');
  const before=current.replace('return new NativeMap(...args);\n  });','return new NativeMap(...args);\n  } as unknown as MapConstructor);')
    .replace('return new NativeSet(...args);\n  });','return new NativeSet(...args);\n  } as unknown as SetConstructor);');
  const emit=text=>ts.transpileModule(text,{compilerOptions:{target:ts.ScriptTarget.ESNext,module:ts.ModuleKind.ESNext}}).outputText;
  assert.equal(emit(current),emit(before));
  save('patches-audit',{adopted:phases.slice(1).filter(phase=>read(phase+'-summary').adopted),
    patchChainMatchesFinal:true,rejectedFullyRestored:true,typeOnlyMockCorrectionJsIdentical:true,
    checkedFiles:state.size,typescript:ts.version});
  console.log('BATCH2_PATCHES_OK');
} else if (mode === 'report') {
  const report=fs.readFileSync(path.join(directory,'../remeasure-86c02.md'),'utf8');
  const generated=fs.readFileSync(path.join(directory,'report.md'),'utf8');
  assert(report.endsWith(generated));
  assert.equal(report.split('## 107라운드 형태 고정과 남은 셋').length,2);
  for (const file of fs.readdirSync(directory)) if (fs.statSync(path.join(directory,file)).isFile())
    assert(fs.statSync(path.join(directory,file)).size<=5_000_000,file);
  assert(read('census-audit').helperWritesObserved); assert(read('measurements-audit').sequential);
  assert(read('patches-audit').patchChainMatchesFinal);
  save('report-audit',{report:'../remeasure-86c02.md',heading:'107라운드 형태 고정과 남은 셋',
    reportSha256:hash(report),fragmentSha256:hash(generated),filesBounded:true});
  console.log('BATCH2_REPORT_OK');
} else throw new Error('Use census, measurements, patches, or report');

/** Apply generated unified patches in memory, checking every old/context line. */
function applyPatch(state,patch) {
  const lines=patch.split('\n'); let file,old,result,cursor;
  const finish=()=>{if(file){result.push(...old.slice(cursor));state.set(file,result.join('\n')+'\n');}};
  for (let index=0;index<lines.length;index++) {
    const line=lines[index];
    if (line.startsWith('diff --git ')) {
      finish();file=line.match(/^diff --git a\/(.+) b\/(.+)$/)[1]; const text=state.get(file);
      assert(text!==undefined,file); old=text===null?[]:text.slice(0,-1).split('\n');result=[];cursor=0;
    } else if (line.startsWith('@@ ')) {
      const start=Number(line.match(/^@@ -(\d+)/)[1]),target=start===0?0:start-1;
      result.push(...old.slice(cursor,target));cursor=target;
      while(index+1<lines.length && /^[ +\-]/.test(lines[index+1]) && !lines[index+1].startsWith('--- ') && !lines[index+1].startsWith('+++ ')) {
        const content=lines[++index];
        if(content[0]!=='+'){assert.equal(old[cursor],content.slice(1),file);cursor++;}
        if(content[0]!=='-')result.push(content.slice(1));
      }
    }
  }
  finish();
}
