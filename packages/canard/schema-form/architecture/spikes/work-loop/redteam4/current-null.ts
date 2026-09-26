// @ts-nocheck — throwaway spike outside tsconfig `include`; the `@/schema-form` alias resolves only through ../vite.spike.config.mjs
/**
 * Current-library (src/core) evidence for the #338 null contract cases the
 * 3.1 spec claims to derive (A2, A5). Run from the package directory:
 *   vite-node --config architecture/spikes/work-loop/vite.spike.config.mjs architecture/spikes/work-loop/redteam4/current-null.ts
 */
import { nodeFromJSONSchema } from '@/schema-form/core';

const drain = () => new Promise<void>((r) => setTimeout(r, 0));
const J = (v: unknown) => JSON.stringify(v);
const schema = { type: 'object', properties: { target: { type: ['object', 'null'], properties: { note: { type: 'string' }, reason: { type: 'string', default: 'because' } } } } } as any;

async function ready(defaultValue: unknown) { const root = nodeFromJSONSchema({ jsonSchema: schema, defaultValue, onChange: () => {} }) as any; await drain(); await drain(); return root; }
const state = (root: any, label: string) => console.log(`${label}: getValue=${J(root.value)} note.value=${J(root.find('/target/note')?.value)} reason.value=${J(root.find('/target/reason')?.value)}`);

(async () => {
  const a = await ready({ target: null }); state(a, 'load {target:null}');
  a.find('/target/reason').setValue(''); await drain(); state(a, 'clear reason ("" partial write under null host)');
  a.find('/target/note').setValue('again'); await drain(); state(a, 'type note');

  const b = await ready({ target: { note: 'n', reason: 'r', zz: 'extra' } }); state(b, 'load with extra zz');
  b.find('/target').setValue(17); await drain(); state(b, 'target := 17');
  b.find('/target/note').setValue('typed'); await drain(); state(b, 'type note after 17');

  const c = await ready({ target: { note: 'n', reason: 'r' } }); c.find('/target/reason').setValue(undefined); await drain(); state(c, 'reason := undefined');
  c.setValue(c.value); await drain(); state(c, 'setValue(getValue()) round trip');
})();
