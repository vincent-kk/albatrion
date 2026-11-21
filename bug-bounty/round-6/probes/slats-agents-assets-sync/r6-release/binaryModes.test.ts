import { afterEach, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const bin=resolve(import.meta.dirname,'../../..','bin/inject-agents-settings.mjs');
const roots:string[]=[];
afterEach(()=>{for(const root of roots.splice(0))rmSync(root,{recursive:true,force:true});});
function fixture(body='# Rule\n'){
 const root=mkdtempSync(join(tmpdir(),'r6-release-cli-'));roots.push(root);
 mkdirSync(join(root,'.git'));
 const pkg=join(root,'node_modules/@probe/kit');mkdirSync(join(pkg,'docs/agents/rules'),{recursive:true});
 writeFileSync(join(pkg,'package.json'),JSON.stringify({name:'@probe/kit',version:'1.0.0',agents:{assetPath:'docs/agents'}}));
 writeFileSync(join(pkg,'docs/agents/rules/rule.md'),body);
 return root;
}
function run(root:string,json:boolean,extra:string[]=[]){return spawnSync(process.execPath,[bin,'--package=@probe/kit','--agent=codex','--scope=project',`--root=${root}`,'--asset-path=docs/agents','--no-interactive',...(json?['--json']:[]),...extra],{cwd:root,encoding:'utf8',timeout:30000});}
it('built plain and JSON bins write the same document and are idempotent',()=>{
 const documents=[];
 for(const json of [false,true]){
  const root=fixture();writeFileSync(join(root,'AGENTS.md'),'Application-owned text.\n');
  const first=run(root,json);expect(first.status,first.stderr).toBe(0);
  if(json)expect(JSON.parse(first.stdout).exitCode).toBe(0);
  const text=readFileSync(join(root,'AGENTS.md'),'utf8');expect(text.startsWith('Application-owned text.\n')).toBe(true);documents.push(text);
  const second=run(root,json);expect(second.status,second.stderr).toBe(0);expect(readFileSync(join(root,'AGENTS.md'),'utf8')).toBe(text);
 }
 expect(documents[0]).toBe(documents[1]);
},120000);
it('built bins normalize BOM/CRLF source identically to LF source',()=>{
 const results=[];
 for(const body of ['# Rule\nText\n','\uFEFF# Rule\r\nText\r\n']){
  const root=fixture(body);const result=run(root,true);expect(result.status,result.stderr).toBe(0);results.push(readFileSync(join(root,'AGENTS.md'),'utf8'));
 }
 expect(results[0]).toBe(results[1]);
},120000);
it('built bins report malformed markers with matching nonzero status and preserve application bytes',()=>{
 for(const json of [false,true]){
  const root=fixture();const text='Application\n<!-- AGENTS-ASSETS-SYNC:START:@probe/kit:rules/rule.md -->\nold\n';writeFileSync(join(root,'AGENTS.md'),text);
  const result=run(root,json,['--force','--yes']);expect(result.status).toBe(1);if(json)expect(JSON.parse(result.stdout).exitCode).toBe(1);expect(readFileSync(join(root,'AGENTS.md'),'utf8')).toBe(text);
 }
},120000);
it('built JSON help, version and invalid flags each emit one JSON document',()=>{
 const root=fixture();
 for(const flag of ['--help','--version','--unknown']){
  const result=run(root,true,[flag]);expect(()=>JSON.parse(result.stdout),result.stdout+'\n'+result.stderr).not.toThrow();expect(JSON.parse(result.stdout).exitCode).toBe(flag==='--unknown'?2:0);
 }
},120000);
it('built dry runs leave application-owned files untouched in both modes',()=>{
 for(const json of [false,true]){
  const root=fixture();const result=run(root,json,['--dry-run']);expect(result.status,result.stderr).toBe(0);expect(existsSync(join(root,'AGENTS.md'))).toBe(false);
 }
},120000);
