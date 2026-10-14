// Reuses mounted BF forms to identify the array update's component work; no engine edits.
import { writeMeasurement } from './measurement-output.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.argv.push('--render', '--component-probe', '--probe-import');
const { engines, fixtures, begin, finish, drain, React, flushSync, createRoot } =
  await import('./branchless-phase-diagnosis.mjs');
const samples = [];
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
for (const name of ['array-100', 'array-500', 'array-1000']) {
  const fixture = fixtures.find(f => f.name === name);
  const mounted = {};
  for (const version of ['old', 'new']) {
    const container = document.createElement('div'); document.body.appendChild(container);
    const host = createRoot(container), ref = React.createRef();
    flushSync(() => host.render(React.createElement(engines[version].Form, {
      jsonSchema: structuredClone(version === 'old' ? fixture.legacy : fixture.workspace),
      validationMode: 0, ref, onChange() {},
    })));
    for (let i = 0; i < 12 && !ref.current?.findNode(''); i++) await tick();
    await drain(); await tick();
    if (!ref.current?.findNode('')) throw new Error('No mounted handle');
    mounted[version] = { container, host, handle: ref.current };
  }
  const raw = { old: [], new: [] };
  for (let i = -12; i < 101; i++) for (const version of i % 2 ? ['new', 'old'] : ['old', 'new']) {
    globalThis.gc?.();
    const handle = mounted[version].handle;
    const start = begin();
    flushSync(() => handle.findNode('/items/0/name').setValue(`changed-${i}`));
    await drain(); await tick();
    const sample = finish(start);
    if (handle.getValue().items[0].name !== `changed-${i}`) throw new Error('Incomplete update');
    if (i >= 0) raw[version].push(sample);
  }
  for (const version of ['old', 'new']) {
    samples.push({ fixture: name, version, samples: raw[version] });
    flushSync(() => mounted[version].host.unmount());
    mounted[version].container.remove();
  }
  console.log(`${name}: 101 paired retained-tree component samples`);
}
const destination = path.resolve(path.dirname(fileURLToPath(import.meta.url)),
  '../architecture/verification/07-switch/branchless-phase-render-components.json');
writeMeasurement(destination, { environment: { node: process.version, warmup: 12, samples: 101 }, rows: samples });
console.log(`Saved ${path.basename(destination)}`);
