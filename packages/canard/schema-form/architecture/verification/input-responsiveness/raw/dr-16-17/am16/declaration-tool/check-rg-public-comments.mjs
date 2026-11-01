import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const [base,head,output]=process.argv.slice(2);
const helper=path.join(import.meta.dirname,'utils/evaluatedDeclarations/describePublicDeclarations.mjs');
const {describePublicDeclarations}=await import(helper);
const require=createRequire(path.join(head,'package.json'));
const ts=require('typescript');
const before=describePublicDeclarations(base,ts);
const after=describePublicDeclarations(head,ts);
const phrase='Only the OnChange validation mode holds errors; other modes follow the live condition.';
const normalize=record=>{
 const [file,name,text]=JSON.parse(record);
 const normalized=text.replaceAll(phrase,'').replace(/\/\*[\s\S]*?\*\//g, comment=>comment.replace(/^\s*\* ?/gm,'').replace(/\s+/g,' ').trim());
 return JSON.stringify([file,name,normalized]);
};
const old=new Set(before.commentRecords.map(normalize));
const current=new Set(after.commentRecords.map(normalize));
const added=[...current].filter(record=>!old.has(record));
const removed=[...old].filter(record=>!current.has(record));
const changedFiles=[];
for(const file of after.files){
 const oldText=fs.readFileSync(path.join(base,'dist',file),'utf8');
 const newText=fs.readFileSync(path.join(head,'dist',file),'utf8');
 if(oldText!==newText)changedFiles.push({file,approvedComment:newText.includes(phrase),privateRuntimeAddition:file==='core/engine/record/types/runtime.d.ts'&&newText.includes('validationRunning?')});
}
const okay=added.length===0&&removed.length===0&&changedFiles.every(file=>file.approvedComment||file.privateRuntimeAddition);
fs.writeFileSync(output,JSON.stringify({method:'Compare only declarations reached from root exports, including their comments. Normalize the one approved F2 sentence and comment layout; private members outside indexed-access selections are reported as file byte differences, never treated as public declarations.',publicReachableFiles:after.files.length,changedFiles,unexpectedAdded:added,unexpectedRemoved:removed,onlyApprovedPublicComments:okay},null,2)+'\n');
if(!okay)throw new Error('Unaccounted public declaration/comment difference');
console.log('PUBLIC_DECLARATIONS_AND_COMMENTS_ACCOUNTED files='+changedFiles.length);
