// Invoked by node verify-tooling.mjs; this file is verification tooling.
// Scratch artifact checks, not repository tests; every observation is read-only outside SC.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {SC,NODE,sourcePaths,expected,sha,identity,runtime,json} from './config.mjs';
if (!fs.existsSync(path.join(SC, 'counterfactual.mjs'))) {
  const reason = 'SKIP original full-artifact verification: counterfactual builder/patch/copies are intentionally excluded.';
  console.error(reason); console.log(json({kind:'verification',status:'skipped',reason})); process.exit(0);
}
const {patch} = await import('./counterfactual.mjs');
const checks=[];
function check(name,ok,details){checks.push({name,ok,details});if(!ok)throw new Error(name+': '+JSON.stringify(details));}
for(const file of fs.readdirSync(SC).filter(f=>/\.(mjs|cjs)$/.test(f))){const r=spawnSync(NODE,['--check',path.join(SC,file)],{encoding:'utf8'});check('syntax '+file,r.status===0,r.stderr||undefined);}
const shell=spawnSync('zsh',['-n',path.join(SC,'quiet-c-d.sh')],{encoding:'utf8'});check('window syntax only (not executed)',shell.status===0,shell.stderr||undefined);
const manifest=JSON.parse(fs.readFileSync(path.join(SC,'bundle-manifest.json'),'utf8'));
for(const file of manifest.files)check('bundle hash '+file.bundle,identity(file.bundle).sha256===file.sha256);
for(const engine of ['current','legacy']){check('original source hash '+engine,sha(fs.readFileSync(sourcePaths[engine]))===expected[engine]);check('source copy '+engine,sha(fs.readFileSync(path.join(SC,engine+'-source.mjs')))===expected[engine]);}
check('exact counterfactual bytes',patch(fs.readFileSync(path.join(SC,'current-baseline.mjs'),'utf8'))===fs.readFileSync(path.join(SC,'current-direct.mjs'),'utf8'));
check('patch rule and ledger citations',/^# Rule:/.test(fs.readFileSync(path.join(SC,'counterfactual.patch'),'utf8'))&&['controls.md:1071','controls.md:1145','write.md:558','node.md:736'].every(s=>fs.readFileSync(path.join(SC,'counterfactual.patch'),'utf8').includes(s)));
const read=file=>JSON.parse(fs.readFileSync(path.join(SC,'out',file),'utf8'));
const timing=read('smoke-c.json'),instrumented=read('smoke-c-instrumented.json'),diff=read('smoke-c-differential.json'),heap=read('smoke-d.json');
for(const run of [timing,instrumented]){check(run.kind+' rows pass',run.rows.length===136&&run.rows.every(r=>r.status==='pass'),{rows:run.rows.length});check(run.kind+' production Node smoke',run.config.smoke&&run.runtime.name==='node'&&run.nodeEnv==='production');for(const copy of run.bundles)check('run bundle identity '+copy.bundle,identity(copy.bundle).sha256===copy.sha256);}
const cases=instrumented.rows.filter(r=>r.op==='control'&&r.variant==='baseline');
check('control ownership probe exercised',cases.some(a=>{const b=instrumented.rows.find(r=>r.id===a.id&&r.variant==='direct');return a.functions.getControlLayers.calls>b.functions.getControlLayers.calls&&b.functions.__cdOwnsFragmentChild?.calls>0;}));
check('exit ownership probe skipped after fragments turn off',instrumented.rows.filter(r=>r.op==='exit'&&r.variant==='direct').every(r=>(r.functions.__cdOwnsFragmentChild?.calls??0)===0));
check('full differential',diff.status==='pass'&&diff.differences===0&&diff.rows.length===72&&diff.rows.every(r=>r.phases.every(p=>p.same)),{scenes:diff.rows.length,phases:diff.rows.reduce((sum,r)=>sum+r.phases.length,0),differences:diff.differences});
check('D engines / two sizes',heap.rows.length===4&&heap.slopes.length===2&&heap.rows.every(r=>r.nodes===r.count+1));
for(const row of heap.rows){const c=row.classification;check('D reconciliation '+row.engine+' '+row.nodes,Object.values(c.categories).reduce((sum,b)=>sum+b.bytes,0)===c.treeRetainedBytes&&c.recordCount===row.nodes);check('D empty-state count '+row.engine+' '+row.nodes,row.worker.identicalEmptyStateObjects===row.nodes);check('D nonempty root structure / absent leaf structures '+row.engine+' '+row.nodes,row.worker.structureContainers===1&&Object.values(row.worker.emptyStructures).every(n=>n===0)&&row.worker.nullStructureSlots===row.count);for(const file of [row.worker.snapshot,row.worker.blueprintSnapshot])check('snapshot containment',file.startsWith(SC+path.sep)&&fs.existsSync(file));}
const table=fs.readFileSync(path.join(SC,'out/table.md'),'utf8');check('summary coverage',['C timing','C timing slopes','C Node call counts','C correctness differential','D node','H6 empty states','Ledger comparison','Bun status'].every(s=>table.includes(s)));
check('summary has no malformed measurement inputs',read('smoke-summary.json').invalid.length===0);
const guard=spawnSync(NODE,['worktree-guard.mjs','--smoke'],{cwd:SC,encoding:'utf8'});check('worktree and git unchanged',guard.status===0,guard.status===0?JSON.parse(guard.stdout):guard.stderr||guard.stdout);
console.log(json({kind:'verification',runtime:runtime(),status:'pass',checks,smoke:process.argv.includes('--smoke'),windowExecuted:false,bunExecuted:false}));
