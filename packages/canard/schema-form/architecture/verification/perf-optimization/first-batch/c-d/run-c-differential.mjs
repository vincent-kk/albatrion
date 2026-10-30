// Invoked by node run-c-differential.mjs; this file is verification tooling.
// Every C size/variant/control is compared, including retained detached references and re-entry.
import fs from 'node:fs';
import {settings,runtime,identity,save,reverse,outputPath} from './config.mjs';
import {load,scenes,prepare,invoke,validate,snapshot,drain,isDeepStrictEqual,sha,json} from './c-common.mjs';
if (!fs.existsSync(outputPath('current-direct.mjs'))) {
  const reason = 'SKIP C differential: counterfactual copy current-direct.mjs is intentionally excluded.';
  console.error(reason); console.log(json({kind:'C-differential',status:'skipped',reason,rows:[]})); process.exit(0);
}
const config=settings(false),baseline=await load('baseline'),direct=await load('direct'),rows=[],differences=[];
const priorityCases=[{reversePolicy:true,label:'reverse-same-layer'},{fieldsPolicy:true,label:'fields-clear'},{fieldsPolicy:true,nodePolicy:false,label:'node-keep'},{fieldsPolicy:false,nodePolicy:true,label:'node-clear'}].map(extra=>({kind:'overlap',F:4,C:16,op:'exit',...extra,id:'overlap-F4-C16-exit-'+extra.label}));
for(const spec of reverse([...scenes(config.smoke),...priorityCases])) {
  const a=await prepare(baseline,spec,true),b=await prepare(direct,spec,true),phases=[];
  const compare=phase=>{const left=snapshot(a),right=snapshot(b),same=isDeepStrictEqual(left,right);phases.push({phase,same,digest:sha(json(left)),deliveryCount:left.deliveries.length,latentCount:a.root.runtime.latentRaw.size});if(!same)differences.push({scene:spec.id,phase,left,right});};
  compare('before');invoke(baseline,spec,a);invoke(direct,spec,b);validate(spec,a);validate(spec,b);compare('write-return');await drain();compare('after-drain');
  if(spec.op==='exit') {
    // An old reference writes latent data without changing its frozen reads (NODE-044).
    const oldA=a.held.find(n=>n.detached&&n.blueprintNode.kind==='number'),oldB=b.held.find(n=>n.detached&&n.blueprintNode.kind==='number');
    if(oldA&&oldB){baseline.M.writeFieldNodeInput(oldA,9001,baseline.M.SetValueOption.Overwrite);direct.M.writeFieldNodeInput(oldB,9001,direct.M.SetValueOption.Overwrite);compare('detached-write');}
    baseline.M.writeFieldNodeInput(a.root.find('/flag'),true,baseline.M.SetValueOption.Overwrite);direct.M.writeFieldNodeInput(b.root.find('/flag'),true,direct.M.SetValueOption.Overwrite);a.subscribe();b.subscribe();compare('reentry');
    baseline.M.writeFieldNodeInput(a.root.find('/flag'),false,baseline.M.SetValueOption.Overwrite);direct.M.writeFieldNodeInput(b.root.find('/flag'),false,direct.M.SetValueOption.Overwrite);compare('second-exit');
  }
  rows.push({...spec,status:phases.every(p=>p.same)?'pass':'fail',phases});
}
save('out/differential-details.json',JSON.stringify(differences,null,2)+'\n');
console.log(json({kind:'C-differential',runtime:runtime(),config,bundles:[identity(baseline.bundle),identity(direct.bundle)],compared:['values','raw/local/emit','latent keys, values and metadata','inactiveValues','events/order/payloads/onChange','all revision bits','committed rule values and declaration choices','detached reads and writes','reentry and second exit'],differences:differences.length,status:differences.length?'fail':'pass',rows}));
if(differences.length)process.exitCode=1;
