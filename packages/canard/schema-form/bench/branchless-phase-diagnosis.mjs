// Diagnostic entry: bundles source in memory; no product files or git state are changed.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import Module from 'node:module';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(pkg, '../../..');
const bf = path.join(repo, 'packages/aileron/benchmark-form');
const req = createRequire(path.join(pkg, 'package.json'));
const bfReq = createRequire(path.join(bf, 'package.json'));
const { build } = req('esbuild');
const ts = req('typescript');
const Ajv = req('ajv/dist/2020').default;
const out = path.join(pkg, 'architecture/verification/07-switch');
const warmup = Number(process.env.PHASE_WARMUP ?? 12);
const sampleCount = Number(process.env.PHASE_SAMPLES ?? 101);
const smoke = process.argv.includes('--smoke');
const trace = !process.argv.includes('--plain');
const render = process.argv.includes('--render');
const componentProbe = process.argv.includes('--component-probe');
const ownerProbe = process.argv.includes('--owner-stack');
const modeName = componentProbe ? 'render-components-fresh' : `${render ? 'render' : 'core'}-${trace ? 'traced' : 'plain'}`;
const tag = '@canard/schema-form@0.16.0';
const gitFiles = new Set(execFileSync('git', ['ls-tree', '-r', '--name-only', tag,
  'packages/canard/schema-form/src'], { cwd: repo, encoding: 'utf8' }).trim().split('\n'));
const virtualSources = new Map();
const hooks = [];
const phases = ['analysis', 'creation', 'settlement', 'validation-registration',
  'validation-run', 'delivery', 'react-render', 'react-commit', 'other', 'wait'];
let collecting = false;
let totals = {}, calls = {}, stack = [], details = {};

/** Enter a synchronous exclusive-time span; async work is timed at its callback. */
globalThis.__phaseEnter = (phase, site) => {
  if (!collecting) return null;
  const frame = { phase, site, start: performance.now(), child: 0 };
  stack.push(frame);
  return frame;
};
globalThis.__phaseExit = (frame) => {
  if (!frame) return;
  const elapsed = performance.now() - frame.start;
  if (stack.pop() !== frame) throw new Error('Unbalanced phase stack');
  if (stack.length) stack[stack.length - 1].child += elapsed;
  const own = elapsed - frame.child;
  totals[frame.phase] = (totals[frame.phase] ?? 0) + own;
  calls[frame.phase] = (calls[frame.phase] ?? 0) + 1;
  const detail = details[frame.site] ??= { ms: 0, calls: 0 };
  detail.ms += own; detail.calls++;
};

/** Classify boundaries, without changing the operation or its arguments. */
function phaseFor(file, name, node) {
  if (componentProbe && (file.includes('/formTypeDefinitions/FormTypeInputArray.tsx') ||
    file.endsWith('/useChildNodeComponents.tsx') || file.endsWith('/SchemaNodeInput.tsx'))) return 'react-render';
  if (name === 'nodeFromJSONSchema') return 'other';
  if (file.includes('react-dom-client.development.js')) {
    if (['renderRootSync', 'renderRootConcurrent'].includes(name)) return 'react-render';
    if (['commitRoot', 'flushMutationEffects', 'flushLayoutEffects', 'flushPassiveEffects'].includes(name)) return 'react-commit';
    return undefined;
  }
  const old = file.includes('/__legacy__/');
  if (old) {
    if (file.includes('/helpers/jsonSchema/') || ['processSchema', 'resolveReferences'].includes(name)) return 'analysis';
    if (file.endsWith('/schemaNodeFactory.ts') && ts.isArrowFunction(node) && ts.isBlock(node.body) && node.parameters[0]?.name.getText() === 'props') return 'creation';
    if (file.includes('/ValidationManager/')) return ts.isConstructorDeclaration(node) ? 'validation-registration' : /validate/i.test(name) ? 'validation-run' : undefined;
    if (file.includes('/EventCascadeManager/')) return 'delivery';
    if (file.endsWith('/afterMicrotask.ts') && name === 'callback') return 'delivery';
    if (file.includes('/core/parsers/')) return 'settlement';
    if (/^(__setDefaultValue__|__initialize__|initialize|setValue|setDefaultValue|__parseValue__|__processValue__|__propagate__|__handleEmitChange__|__processComputedProperties__|__updateComputedProperties__|__updateComputedPropertiesRecursively__|__primeInitialBranch__|__processOneOfChildren__|__processAnyOfChildren__)$/.test(name)) return 'settlement';
    if (['publish', '__publishChildrenChange__'].includes(name)) return 'delivery';
    return undefined;
  }
  if (name === 'blueprint' || name === 'preprocessSchema') return 'analysis';
  if (name === 'createSchemaNode') return 'creation';
  if (['writeSchemaNode', 'loadSchemaNodeAtMount', 'commitSettlement', 'transitionSettlement', 'selectChildren', 'updateOutput', 'registerRecalculation', 'computeNode', 'isMissingRaw', 'getDependencyIndex', 'getDeriveRuleTable'].includes(name)) return 'settlement';
  if (['readValidationEntry', 'compileEntryGuards', 'readSchemaNodeGuard', 'requestSchemaNodeValidation'].includes(name)) return 'validation-registration';
  if (name === 'runSchemaNodeValidation') return 'validation-run';
  if (['markCommitDeliveries', 'flushSchemaNodeEvents', 'flushQueuedEvents', 'markSchemaNodeEvent', 'captureSchemaNodeChange'].includes(name)) return 'delivery';
  return undefined;
}

/** Add try/finally spans only to the diagnostic bundle's in-memory TS source. */
function instrument(file, source, enabled) {
  if (!enabled) return source;
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const edits = [];
  function visit(node) {
    if ((ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) ||
      ts.isConstructorDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) && node.body && ts.isBlock(node.body)) {
      let name = node.name?.getText(ast) ?? '';
      if (ts.isConstructorDeclaration(node)) name = 'constructor';
      if (!name && ts.isVariableDeclaration(node.parent)) name = node.parent.name.getText(ast);
      const phase = node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.AsyncKeyword)
        ? undefined : phaseFor(file, name, node);
      if (phase) {
        const site = `${path.relative(repo, file)}:${ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1}:${name || 'callback'}`;
        hooks.push({ phase, site });
        edits.push([node.body.getStart(ast) + 1, `\nconst __phaseFrame = globalThis.__phaseEnter(${JSON.stringify(phase)}, ${JSON.stringify(site)}); try {\n`]);
        edits.push([node.body.end - 1, '\n} finally { globalThis.__phaseExit(__phaseFrame); }\n']);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  for (const [at, text] of edits.sort((a, b) => b[0] - a[0])) source = source.slice(0, at) + text + source.slice(at);
  return source;
}

/** Resolve the release's React binding while retaining the requested local legacy core. */
function oldResolve(relative) {
  const base = `packages/canard/schema-form/src/${relative}`;
  const found = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].find(p => gitFiles.has(p));
  if (!found) throw new Error(`No release source: ${relative}`);
  const local = path.join(pkg, 'src/__legacy__', found.slice('packages/canard/schema-form/src/'.length));
  return relative.startsWith('core') && fs.existsSync(local) ? { path: local } : { path: found, namespace: 'release-binding' };
}

function localResolve(base) {
  const found = [base + '.ts', base + '.tsx', path.join(base, 'index.ts'), path.join(base, 'index.tsx'), base].find(p => fs.existsSync(p) && fs.statSync(p).isFile());
  if (!found) throw new Error(`No local source: ${base}`);
  return found;
}

/** Build source-only engines and fixtures; generated JS is evaluated without a disk bundle. */
async function bundle(version) {
  const core = version === 'old' ? 'src/__legacy__/core/nodeFromJSONSchema.ts' : 'src/core/nodeFromJSONSchema.ts';
  const result = await build({
    stdin: { contents: `export {nodeFromJSONSchema} from ${JSON.stringify(path.join(pkg, core))};
      export {equivalentFixtures} from ${JSON.stringify(path.join(bf, 'fixtures/equivalent/index.ts'))};
      ${render ? version === 'old' ? "export {Form} from 'release-form';" : `export {Form} from ${JSON.stringify(path.join(pkg, 'src/index.ts'))};` : ''}`,
      resolveDir: bf, loader: 'ts' },
    write: false, bundle: true, packages: 'external', platform: 'node', format: 'cjs',
    jsx: 'automatic', define: { 'process.env.NODE_ENV': JSON.stringify('development') },
    plugins: [{ name: 'diagnostic-only-source', setup(builder) {
      builder.onResolve({ filter: /^release-form$/ }, () => oldResolve('components/Form'));
      builder.onResolve({ filter: /^@\/schema-form\/__legacy__\// }, ({ path: p }) => ({ path: localResolve(path.join(pkg, 'src/__legacy__', p.split('/__legacy__/')[1])) }));
      builder.onResolve({ filter: /^@\/schema-form/ }, args => {
        if (args.namespace === 'release-binding') return oldResolve(args.path.replace(/^@\/schema-form\/?/, ''));
        return { path: localResolve(path.join(pkg, 'src', args.path.replace(/^@\/schema-form\/?/, ''))) };
      });
      builder.onResolve({ filter: /.*/, namespace: 'release-binding' }, async args => {
        if (args.path.startsWith('.')) return oldResolve(path.posix.normalize(path.posix.join(path.posix.dirname(args.importer), args.path)).slice('packages/canard/schema-form/src/'.length));
        return { path: args.path, external: true };
      });
      builder.onLoad({ filter: /.*/, namespace: 'release-binding' }, args => {
        if (!virtualSources.has(args.path)) virtualSources.set(args.path, execFileSync('git', ['show', `${tag}:${args.path}`], { cwd: repo, encoding: 'utf8' }));
        return { contents: instrument(args.path, virtualSources.get(args.path), trace), loader: args.path.endsWith('tsx') ? 'tsx' : 'ts' };
      });
      builder.onLoad({ filter: /\/schema-form\/src\/.*\.tsx?$/ }, args => ({ contents: instrument(args.path, fs.readFileSync(args.path, 'utf8'), trace), loader: args.path.endsWith('tsx') ? 'tsx' : 'ts' }));
    } }],
  });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', result.outputFiles[0].text)(bfReq, module, module.exports);
  return module.exports;
}

/** AJV timing is a nested span, so its cost is not counted twice in phase totals. */
function timed(phase, site, operation) {
  const frame = trace ? globalThis.__phaseEnter(phase, site) : null;
  try { return operation(); } finally { globalThis.__phaseExit(frame); }
}
function validatorServices() {
  const ajv = new Ajv({ allErrors: true, strict: false, validateFormats: false });
  const errors = validate => data => timed('validation-run', 'AJV:validate', () => validate(data) ? null : validate.errors.map(error => ({ ...error, dataPath: error.instancePath })));
  const validator = {
    compile(schema) { return timed('validation-registration', 'AJV:compile', () => errors(ajv.compile(schema))); },
    compileGuard(schema, pointer) { return timed('validation-registration', 'AJV:compileGuard', () => {
      const root = ajv.getSchema('diagnostic-root');
      if (!root) ajv.addSchema(schema, 'diagnostic-root');
      const validate = ajv.compile({ $ref: `diagnostic-root${pointer.startsWith('#') ? pointer : '#' + pointer}` });
      return data => timed('validation-run', 'AJV:guard', () => validate(data));
    }); },
  };
  return { validator, validatorFactory: validator.compile };
}

/** Flush bounded microtask generations for both engines; wall-time remainder stays explicit. */
async function drain() {
  for (let i = 0; i < 16; i++) await Promise.resolve();
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
}
function begin() { totals = {}; calls = {}; details = {}; stack = []; collecting = trace; return performance.now(); }
function finish(start) {
  const elapsed = performance.now() - start;
  collecting = false;
  if (stack.length) throw new Error('Unclosed phase frames');
  const own = Object.values(totals).reduce((a, b) => a + b, 0);
  return { elapsed, active: own, phases: { ...totals, wait: elapsed - own }, calls: { ...calls }, details: { ...details } };
}
function valueOf(root) { return typeof root.getValue === 'function' ? root.getValue() : root.value; }
function assertValue(root, fixture) {
  for (const interaction of fixture.interactions) {
    if (fixture.interactions.some((later, index) => index > fixture.interactions.indexOf(interaction) && later.path === interaction.path)) continue;
    const value = interaction.path.split('/').slice(1).reduce((v, key) => v?.[key], valueOf(root));
    if (value !== interaction.value) throw new Error(`${fixture.name} failed completion at ${interaction.path}: ${value}`);
  }
}

let React, flushSync, createRoot;
if (render) {
  const { JSDOM } = bfReq('jsdom');
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost', pretendToBeVisual: true });
  for (const key of ['window', 'document', 'navigator', 'Element', 'HTMLElement', 'HTMLInputElement', 'HTMLFormElement', 'HTMLSelectElement', 'Event', 'MouseEvent', 'KeyboardEvent']) Object.defineProperty(globalThis, key, { value: key === 'window' ? dom.window : dom.window[key], configurable: true, writable: true });
  globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
  const originalJsLoader = Module._extensions['.js'];
  Module._extensions['.js'] = (module, filename) => {
    if (trace && filename.endsWith('/react-dom-client.development.js')) module._compile(instrument(filename, fs.readFileSync(filename, 'utf8'), true), filename);
    else originalJsLoader(module, filename);
  };
  React = bfReq('react'); ({ flushSync } = bfReq('react-dom')); ({ createRoot } = bfReq('react-dom/client'));
  Module._extensions['.js'] = originalJsLoader;
  if (ownerProbe) {
    const jsxRuntime = bfReq('react/jsx-runtime');
    const internals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    for (const name of ['jsx', 'jsxs']) {
      const original = jsxRuntime[name];
      jsxRuntime[name] = function (...args) {
        if (!collecting) return original.apply(this, args);
        const tracked = internals.recentlyCreatedOwnerStacks < 10000;
        return timed('react-render', tracked ? 'React:jsx-owner-stack' : 'React:jsx-no-owner-stack', () => original.apply(this, args));
      };
    }
  }
}
const engines = { old: await bundle('old'), new: await bundle('new') };
let fixtures = engines.new.equivalentFixtures.filter(f => /^(flat-(50|100|500)|nested-d[35]-f4|array-(100|500|1000)|computed-visible-derived|oneOf-(5|10|20))$/.test(f.name));
const ifSchema = { type: 'object', properties: { kind: { type: 'string', default: 'a' }, detail: { type: 'string', default: 'detail' } }, if: { properties: { kind: { const: 'b' } }, required: ['kind'] }, then: { properties: { detail: { minLength: 3 } } } };
fixtures.push({ name: 'if-then', legacy: ifSchema, workspace: structuredClone(ifSchema), interactions: [{ kind: 'set', path: '/kind', value: 'b' }, { kind: 'set', path: '/kind', value: 'a' }] });
if (smoke) fixtures = fixtures.filter(f => ['flat-50', 'computed-visible-derived', 'oneOf-5', 'if-then'].includes(f.name));
if (process.env.PHASE_FIXTURES) fixtures = fixtures.filter(f => process.env.PHASE_FIXTURES.split(',').includes(f.name));
const rows = [];
if (!process.argv.includes('--probe-import')) {
for (const fixture of fixtures) {
  const branch = /oneOf|if-then/.test(fixture.name);
  for (const validation of branch ? ['off', 'on'] : ['off']) {
    const samples = { old: { mount: [], update: [] }, new: { mount: [], update: [] } };
    const outputs = {};
    const count = smoke ? 2 : sampleCount;
    for (let i = -(smoke ? 1 : warmup); i < count; i++) {
      for (const version of i % 2 ? ['new', 'old'] : ['old', 'new']) {
        globalThis.gc?.();
        const schema = structuredClone(version === 'old' ? fixture.legacy : fixture.workspace);
        const services = branch ? validatorServices() : {};
        const props = { jsonSchema: schema, validationMode: validation === 'on' ? 1 : 0, onChange() {}, ...services };
        if (render && version === 'new') props.validatorFactory = services.validator;
        let root, cleanup = () => {}, commits = [];
        let start, synchronous = 0;
        if (render) {
          const ref = React.createRef();
          const container = document.createElement('div'); document.body.appendChild(container);
          const reactRoot = createRoot(container);
          start = begin();
          flushSync(() => reactRoot.render(React.createElement(React.Profiler, { id: fixture.name, onRender: (_id, _phase, duration) => commits.push(duration) }, React.createElement(engines[version].Form, { ...props, ref }))));
          synchronous = performance.now() - start;
          for (let tick = 0; tick < 12 && !ref.current?.findNode(''); tick++) await new Promise(resolve => setTimeout(resolve, 0));
          await new Promise(resolve => setTimeout(resolve, 0));
          root = ref.current?.findNode('');
          if (!root) throw new Error('React handle never became ready');
          cleanup = () => { flushSync(() => reactRoot.unmount()); container.remove(); };
        } else {
          start = begin();
          root = engines[version].nodeFromJSONSchema(props);
          synchronous = performance.now() - start;
          await drain();
          await new Promise(resolve => setTimeout(resolve, 0));
        }
        const mount = finish(start);
        mount.synchronous = synchronous;
        mount.profiler = commits.reduce((a, b) => a + b, 0); mount.commits = commits.length;
        outputs[version] = { mount: JSON.stringify(valueOf(root)) };
        commits = [];
        start = begin();
        synchronous = 0;
        for (const interaction of fixture.interactions) {
          const syncStart = performance.now();
          timed('other', 'harness:find-and-write', () => {
            const node = root.find(interaction.path);
            if (!node) throw new Error(`Missing ${fixture.name} ${interaction.path}`);
            if (render) flushSync(() => node.setValue(interaction.value));
            else node.setValue(interaction.value);
          });
          synchronous += performance.now() - syncStart;
          await drain();
          await new Promise(resolve => setTimeout(resolve, 0));
        }
        if (render) await new Promise(resolve => setTimeout(resolve, 0));
        const update = finish(start);
        update.synchronous = synchronous;
        update.profiler = commits.reduce((a, b) => a + b, 0); update.commits = commits.length;
        assertValue(root, fixture);
        outputs[version].update = JSON.stringify(valueOf(root));
        if (render) outputs[version].paths = [...document.querySelectorAll('[data-path]:not([data-deferred])')].map(e => e.getAttribute('data-path')).sort();
        if (i >= 0) { samples[version].mount.push(mount); samples[version].update.push(update); }
        cleanup();
      }
      for (const mode of ['mount', 'update']) if (outputs.old[mode] !== outputs.new[mode]) {
        // Key order is not semantic; compare recursively using a canonical key order.
        const canonical = value => JSON.stringify(value, (key, item) => item && !Array.isArray(item) && typeof item === 'object' ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item);
        if (canonical(JSON.parse(outputs.old[mode])) !== canonical(JSON.parse(outputs.new[mode]))) throw new Error(`Value mismatch ${fixture.name}/${mode}: ${outputs.old[mode]} <> ${outputs.new[mode]}`);
      }
      if (render && JSON.stringify(outputs.old.paths) !== JSON.stringify(outputs.new.paths)) throw new Error(`Rendered path mismatch ${fixture.name}`);
    }
    const quantile = (values, percentile) => values.toSorted((a, b) => a - b)[Math.ceil(values.length * percentile) - 1];
    for (const version of ['old', 'new']) for (const mode of ['mount', 'update']) {
      const raw = samples[version][mode];
      const metric = fn => ({ median: quantile(raw.map(fn), .5), p99: quantile(raw.map(fn), .99) });
      rows.push({ fixture: fixture.name, validation, version, mode, total: metric(s => s.elapsed),
        active: metric(s => s.active),
        synchronous: metric(s => s.synchronous),
        phases: Object.fromEntries(phases.map(phase => [phase, metric(s => s.phases[phase] ?? 0)])),
        profiler: metric(s => s.profiler), commits: metric(s => s.commits), samples: raw });
    }
    console.log(`${modeName} ${fixture.name} ${validation}: ${count} paired samples, equal values${render ? ' and rendered paths' : ''}`);
  }
}
const result = { environment: { date: new Date().toISOString(), head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(), node: process.version, v8: process.versions.v8, platform: process.platform, arch: process.arch, cpu: os.cpus()[0].model, cpus: os.cpus().length, memory: os.totalmem(), react: bfReq('react/package.json').version, ajv: req('ajv/package.json').version, mode: 'development', warmup: smoke ? 1 : warmup, samples: smoke ? 2 : sampleCount }, hooks, rows };
const destination = path.join(out, `branchless-phase-${modeName}${smoke ? '-smoke' : ''}.json`);
fs.writeFileSync(destination, JSON.stringify(result, null, 2));
console.log(`Saved ${path.relative(repo, destination)}`);
}

export { engines, fixtures, begin, finish, drain, React, flushSync, createRoot };
