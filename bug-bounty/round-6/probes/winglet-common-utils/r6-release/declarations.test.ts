import { expect, it } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
const root=resolve(import.meta.dirname,'../../../../../..');
const packages=readdirSync(join(root,'packages')).flatMap(group=>readdirSync(join(root,'packages',group)).map(name=>join(root,'packages',group,name))).filter(dir=>existsSync(join(dir,'package.json'))).map(dir=>({dir,manifest:JSON.parse(readFileSync(join(dir,'package.json'),'utf8'))})).filter(p=>!p.manifest.private && p.manifest.name!=='@slats/agents-assets-sync');
it.each(packages)('$manifest.name built declarations pass all five strict consumer profiles', ({dir})=>{
 const result=spawnSync(process.execPath,[join(root,'packages/aileron/script/build/verifyDeclarations.mjs')],{cwd:dir,encoding:'utf8',timeout:115000,maxBuffer:8e6});
 expect({status:result.status,error:result.error?.message}, result.stdout+'\n'+result.stderr).toEqual({status:0,error:undefined});
},120000);
