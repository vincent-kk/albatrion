// Loaded by Vitest; this probe exercises published manifests and existing dist only.
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, existsSync, mkdtempSync, mkdirSync, symlinkSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';

const root = resolve(process.cwd(), '../../..');
const packages = readdirSync(join(root, 'packages')).flatMap(group => {
  const base = join(root, 'packages', group);
  return readdirSync(base, { withFileTypes: true }).filter(e => e.isDirectory()).flatMap(e => {
    const path = join(base, e.name);
    if (!existsSync(join(path, 'package.json'))) return [];
    const manifest = JSON.parse(readFileSync(join(path, 'package.json'), 'utf8'));
    return !manifest.private && manifest.exports ? [{ path, manifest }] : [];
  });
});
const address = (name: string, key: string) => name + (key === '.' ? '' : key.slice(1));

describe('published artifacts', () => {
  for (const { path, manifest } of packages) it(`${manifest.name}: every runtime condition loads and dual names agree`, () => {
    const script = `
      import {createRequire} from 'node:module';
      import {pathToFileURL} from 'node:url';
      const require=createRequire(${JSON.stringify(join(path, 'package.json'))});
      const manifest=${JSON.stringify(manifest)};
      const failures=[];
      const knownBrowserOnly=manifest.name==='@canard/schema-form-antd-mobile-plugin';
      async function visit(branch, conditions=[]) {
        if(typeof branch==='string') {
          if(!/\\.(mjs|cjs|js)$/.test(branch)) return null;
          const target=${JSON.stringify(path)}+'/'+branch;
          try {return conditions.includes('require') ? require(target) : await import(pathToFileURL(target).href)}
          catch(e){if(knownBrowserOnly && /Unexpected token/.test(e.message))return null;failures.push([conditions.join('/'),branch,e.code,e.message]);return null}
        }
        if(!branch) return null;
        const names={}; let forwarded=null;
        for(const [key,value] of Object.entries(branch)) {
          if(['source','types'].includes(key))continue;
          const result=await visit(value,[...conditions,key]);
          if(key==='default')forwarded=result;
          if(result)names[key]=Object.keys(result).filter(x=>x!=='__esModule').sort();
        }
        if(names.import && names.require && JSON.stringify(names.import)!==JSON.stringify(names.require)) failures.push(['parity',names]);
        return forwarded;
      }
      await visit(manifest.publishConfig?.exports ?? manifest.exports);
      console.log(JSON.stringify(failures));
    `;
    const run = spawnSync(process.execPath, ['--no-experimental-require-module','--input-type=module','-e',script], { cwd: root, encoding: 'utf8', timeout: 90000 });
    if(run.stdout.trim()!=='[]') console.log(manifest.name,run.stdout);
    expect({ status:run.status, errors:run.stderr, result:run.stdout.trim() }).toEqual({status:0, errors:'', result:'[]'});
  }, 120000);

  for(const [label,module,moduleResolution,extension] of [
    ['nodenext-esm',ts.ModuleKind.NodeNext,ts.ModuleResolutionKind.NodeNext,'mts'],
    ['nodenext-cjs',ts.ModuleKind.NodeNext,ts.ModuleResolutionKind.NodeNext,'cts'],
    ['bundler',ts.ModuleKind.ESNext,ts.ModuleResolutionKind.Bundler,'mts'],
  ] as const) it(`all declarations: ${label}, skipLibCheck false`, () => {
    const scratch=mkdtempSync(join(tmpdir(),'r6-release-types-'));
    try {
      const lines:string[]=[];
      for(const {path,manifest} of packages) {
        const link=join(scratch,'node_modules',manifest.name);
        mkdirSync(dirname(link),{recursive:true});symlinkSync(path,link,'dir');
        for(const [key,branch] of Object.entries(manifest.publishConfig?.exports ?? manifest.exports)) {
          if(manifest.name==='@slats/agents-assets-sync')continue;
          if(key==='./package.json' || (manifest.name==='@slats/agents-assets-sync' && extension==='cts'))continue;
          lines.push(`import * as e${lines.length} from '${address(manifest.name,key)}';`);
        }
      }
      const entry=join(scratch,`consumer.${extension}`);writeFileSync(entry,lines.join('\n'));
      const program=ts.createProgram([entry],{strict:true,noEmit:true,skipLibCheck:false,module,moduleResolution,target:ts.ScriptTarget.ES2022,types:[],lib:['lib.es2022.d.ts','lib.dom.d.ts'],esModuleInterop:true,exactOptionalPropertyTypes:true});
      const diagnostics=ts.getPreEmitDiagnostics(program).map(d=>`${d.file?.fileName}:${d.start} TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText,' ')}`);
      if(diagnostics.length) console.log(label,JSON.stringify(diagnostics));
      expect(diagnostics).toEqual([]);
    } finally {rmSync(scratch,{recursive:true,force:true});}
  },120000);
});
