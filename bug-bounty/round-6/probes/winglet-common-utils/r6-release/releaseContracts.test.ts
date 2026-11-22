// Loaded by Vitest; checks the release decisions whose manifests and changesets are the artifact.
import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
const root=resolve(process.cwd(),'../../..');
const manifest=(name:string)=>JSON.parse(readFileSync(join(root,'packages/canard',name,'package.json'),'utf8'));
it('mobile runtime dependency, peer and breaking migration all start at 5.2',()=>{
 const pkg=manifest('schema-form-antd-mobile-plugin');
 expect(pkg.dependencies['antd-mobile']).toBe('^5.2.0');expect(pkg.peerDependencies['antd-mobile']).toBe('^5.2.0');
 const change=readFileSync(join(root,'.changeset/mobile-empty-stepper-peer-floor.md'),'utf8');
 expect(change).toContain('"@canard/schema-form-antd-mobile-plugin": major');expect(change).toContain('Breaking change:');expect(change).toContain('Before:');expect(change).toContain('After:');
});
for(const version of [6,7,8]) it(`AJV ${version} private-root migration is marked major with an application-owned replacement`,()=>{
 const text=readFileSync(join(root,`.changeset/ajv${version}-private-form-ownership.md`),'utf8');
 expect(text).toContain(`"@canard/schema-form-ajv${version}-plugin": major`);expect(text).toContain('Breaking change:');expect(text).toContain('ajv.addSchema(applicationSchema)');expect(text).toContain('validator.compile({ $ref: applicationSchema.$id })');
});
it('the antd5 floor is retained together with its legacy commit callback',()=>{
 const pkg=manifest('schema-form-antd5-plugin');expect(pkg.dependencies.antd).toBe('^5.10.0');expect(pkg.peerDependencies.antd).toBe('^5.10.0');
 const source=readFileSync(join(root,'packages/canard/schema-form-antd5-plugin/src/fieldInputs/FieldInputSlider.tsx'),'utf8');
 expect(source).toContain("version.startsWith('5.10.') || version.startsWith('5.11.')");expect(source).toContain('onAfterChange: complete');expect(source).toContain('onChangeComplete: complete');
});
it('virtual default and reset ordering changesets disclose the observable change',()=>{
 const virtual=readFileSync(join(root,'.changeset/schema-form-virtual-tuple-storage.md'),'utf8');
 const reset=readFileSync(join(root,'.changeset/schema-form-batch-reset-barrier.md'),'utf8');
 expect(virtual).toContain('instead of undefined');expect(reset).toContain('settles every earlier write');expect(reset).toContain('reset is then refused');
});
