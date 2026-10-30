// Invoked by node worktree-guard.mjs; this file is verification tooling.
// Read-only worktree and git-state guard; snapshots are written only inside SC.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { SC,W,sha,save,option,json } from './config.mjs';
function state() {
  const files=[];
  function walk(dir) {for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const full=path.join(dir,entry.name),stat=fs.lstatSync(full);const rel=path.relative(W,full);files.push([rel,stat.mode,stat.size,stat.mtimeMs,entry.isSymbolicLink()?fs.readlinkSync(full):null]);if(entry.isDirectory())walk(full);}}
  walk(W);
  const git=args=>execFileSync('git',['--no-optional-locks',...args],{cwd:W,encoding:'utf8',env:{...process.env,GIT_OPTIONAL_LOCKS:'0'}});
  return {files,git:{head:git(['rev-parse','HEAD']),status:git(['status','--porcelain=v1','--untracked-files=all']),diff:sha(git(['diff','--binary'])),cached:sha(git(['diff','--cached','--binary']))}};
}
const mode=option('mode','check'),current=state();
if(mode==='before'){save('out/worktree-before.json',JSON.stringify(current));console.log(json({kind:'worktree-guard',mode,files:current.files.length,head:current.git.head.trim(),initialStatus:current.git.status}));}
else {const before=JSON.parse(fs.readFileSync(path.join(SC,'out/worktree-before.json'),'utf8'));const unchanged=JSON.stringify(before)===JSON.stringify(current);save('out/worktree-after.json',JSON.stringify(current));console.log(json({kind:'worktree-guard',mode,unchanged,files:current.files.length,gitUnchanged:JSON.stringify(before.git)===JSON.stringify(current.git)}));if(!unchanged)process.exitCode=1;}
