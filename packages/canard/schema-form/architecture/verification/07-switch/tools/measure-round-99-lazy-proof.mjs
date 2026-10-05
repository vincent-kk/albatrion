// Invoked by measure-round-90-baseline.mjs --round99-lazy; every fixture uses a fresh process.
import assert from 'node:assert/strict';
import childProcess from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = path.resolve(directory, '../../..');
const repo = path.resolve(pkg, '../../..');
const require = createRequire(path.join(pkg, 'package.json'));
const prefix = 'round-99-lazy-proof-first-write';
const head = childProcess.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
const revisions = { P: '403226d12', H: head, W: undefined };
const fixtures = ['computed-visible-derived', 'flat-500', 'nested-d5-f4'];
const warmup = 20, sampleCount = 101;
const computedPhases = ['mount', 'first', 'later', 'secondMount', 'secondFirst', 'secondLater'];

/** Save timing-only samples or aggregate details, with a per-file 5 MB ceiling. */
function save(name, value) {
  const text = JSON.stringify(value, null, 2) + '\n';
  assert(Buffer.byteLength(text) <= 5_000_000);
  fs.writeFileSync(path.join(directory, name), text, { flag: 'wx' });
}

/** Summarize original millisecond samples with nearest-rank quantiles. */
function metric(values) {
  const sorted = values.toSorted((a, b) => a - b);
  return { median: sorted[Math.ceil(sorted.length * .5) - 1],
    p99: sorted[Math.ceil(sorted.length * .99) - 1], sampleCount: sorted.length };
}

/** Read complete observable state outside timing, retaining only its hash. */
function observe(root) {
  const nodes = [], pending = [root];
  while (pending.length) {
    const node = pending.pop();
    nodes.push({ path: node.path, value: node.value, emit: node.emit,
      errors: node.errors, revisions: node.revisionLedger,
      active: node.active, visible: node.visible, disabled: node.disabled });
    const children = node.children;
    for (let index = (children?.length ?? 0) - 1; index >= 0; index--)
      if (children[index].parent === node) pending.push(children[index]);
  }
  return createHash('sha256').update(JSON.stringify({ nodes,
    diagnostics: root.runtime.diagnostics, commit: root.runtime.commitNumber,
    rounds: root.runtime.settlementTrace?.rounds,
    warnings: root.runtime.typeMismatchRecords,
    deliveries: [...root.runtime.deliveries ?? []].map(node => node.path),
  })).digest('hex');
}

if (process.argv[2] === '--summarize-paired') {
  const rows = [], runs = [];
  let previousEnd;
  for (const fixture of fixtures) {
    const phases = fixture === 'computed-visible-derived' ? computedPhases : ['mount'];
    const combined = { P: {}, H: {}, W: {} };
    let observations;
    for (let run = 1; run <= 3; run++) {
      const order = run === 2 ? ['W', 'H', 'P'] : ['P', 'H', 'W'];
      for (const variant of order) {
        const stem = `${prefix}-${fixture}-r${run}-${variant}`;
        const summary = JSON.parse(fs.readFileSync(path.join(directory, `${stem}-summary.json`)));
        const timings = JSON.parse(fs.readFileSync(path.join(directory, `${stem}-timings.json`)));
        assert.equal(summary.sourceHead, head);
        assert.equal(summary.environment.warmup, warmup);
        assert.equal(summary.environment.samples, sampleCount);
        assert.equal(summary.environment.instrumented, false);
        assert.equal(summary.environment.esbuildNaturalExits, 1);
        if (previousEnd) assert(previousEnd <= summary.environment.startedAt);
        previousEnd = summary.environment.endedAt;
        if (observations) assert.deepEqual(summary.observations, observations);
        observations = summary.observations;
        runs.push(summary);
        for (const phase of phases) {
          assert.equal(timings[phase].length, sampleCount);
          const values = combined[variant][phase] ??= [];
          for (const value of timings[phase]) {
            assert(Number.isFinite(value) && value >= 0);
            values.push(value);
          }
        }
      }
    }
    for (const phase of phases) {
      const metrics = { P: metric(combined.P[phase]), H: metric(combined.H[phase]),
        W: metric(combined.W[phase]) };
      const pairs = [];
      for (let run = 1; run <= 3; run++) {
        const pair = {};
        for (const variant of ['P', 'H', 'W'])
          pair[variant] = runs.find(row => row.fixture === fixture && row.run === run &&
            row.variant === variant).metrics[phase];
        pairs.push({ run, order: run === 2 ? 'W→H→P' : 'P→H→W', ...pair,
          workingVsPrePercent: (pair.W.median / pair.P.median - 1) * 100,
          workingVsHeadPercent: (pair.W.median / pair.H.median - 1) * 100 });
      }
      rows.push({ fixture, phase, metrics, pairs,
        workingVsPrePercent: (metrics.W.median / metrics.P.median - 1) * 100,
        workingVsHeadPercent: (metrics.W.median / metrics.H.median - 1) * 100 });
    }
  }
  save(`${prefix}-summary.json`, { sourceHead: head, revisions, rows, runs,
    method: '동일 세션의 P=403226d12, H=현재 HEAD, W=작업트리 무계측 메모리 번들. fixture마다 P→H→W, W→H→P, P→H→W로 순차 실행해 H/W 순서는 H→W, W→H, H→W. 매 판 새 프로세스, 예열20·표본101×3, validation off, 개발 모드, 빈 onChange, 구독 없음. computed는 세 판 모두 초기값 {trigger:"on",source:1,target:2}를 넣어 마운트의 실제 derive 쓰기를 없애 첫 source=3 갱신에서 증명을 부담하도록 분리. target만 미리 넣으면 source default 채움 전 derive가 발생하므로 그 준비는 제외. getter로 시간 구간 밖에서 W의 마운트 후 증명 부재와 첫 쓰기 후 증명 존재를 단언하며 함수 교체·계측은 없음. esbuild stdin을 닫고 자발 종료0 확인 후 측정. 시간 원본은 시간 표본만 저장하며 관측 해시·환경·회차별 median/p99는 summary에 저장. 세 판의 모든 관측 해시 일치 및 프로세스 실행 구간 비중첩 검증.',
    secondForm: '첫 폼은 기존 nodeFromJSONSchema를 그대로 측정. 첫/후속 갱신 완료 뒤 동일 스키마 객체와 첫 폼의 청사진으로 명시적 caller-owned BlueprintOptions.cache를 채우고 blueprint→schemaNodeFactory→mountSchemaNode로 두 번째 폼을 생성. 청사진 정체성 일치를 단언. 코어/React의 기본 생성은 캐시를 주입하지 않으므로 스키마 객체만 같다고 자동 공유되는 이득으로 해석하지 않음. 두 번째 폼에도 동일한 첫/후속 쓰기 실행.',
    speedAndMemory: '쓰기 없는 마운트의 O(선언+읽기+대상×읽기) 증명 작업·임시 색인을 첫 실제 derive 쓰기로 이동. 결과와 증명 불가 null을 청사진당 약한 캐시 한 항목에 보유. 이후 쓰기·같은 청사진의 두 번째 폼은 O(1) 조회. O(정적 대상 수) 경로 참조와 기존 O(컴파일 식 수) 완전성 등록 유지, 노드·값·식 descriptor shape 추가 없음. heap byte 미측정.',
    limits: '세 회차 중앙값 편차와 순서 효과를 노이즈 근거로 함께 보고. 실행은 모두 순차, 설치·git 쓰기·다른 에이전트·계측·강제 종료 없음. 운영체제와 기존 상주 도구 서비스는 유지.' });
  for (const row of rows)
    console.log(`${row.fixture} ${row.phase}: P ${(row.metrics.P.median * 1000).toFixed(2)}, H ${(row.metrics.H.median * 1000).toFixed(2)}, W ${(row.metrics.W.median * 1000).toFixed(2)} µs`);
} else {
  const fixtureName = process.argv[2], run = Number(process.argv[3]), variant = process.argv[5];
  assert(fixtures.includes(fixtureName) && run >= 1 && run <= 3);
  assert(['P', 'H', 'W'].includes(variant) && globalThis.gc);
  const startedAt = new Date().toISOString();
  const services = [], originalSpawn = childProcess.spawn;
  childProcess.spawn = function(file, args, options) {
    const child = originalSpawn(file, args, options);
    if (String(file).includes('esbuild')) services.push(child);
    return child;
  };
  let built;
  try {
    const { build } = require('esbuild');
    built = await build({ stdin: { contents:
      `export { nodeFromJSONSchema } from './src/core/nodeFromJSONSchema';
       export { blueprint } from './src/core/blueprint';
       import * as blueprintApi from './src/core/blueprint'; export { blueprintApi };
       export { schemaNodeFactory, mountSchemaNode } from './src/core/SchemaNode';
       export { equivalentFixtures } from '../../aileron/benchmark-form/fixtures/equivalent';`,
      resolveDir: pkg, loader: 'ts' },
      write: false, bundle: true, packages: 'external', platform: 'node', format: 'cjs',
      define: { 'process.env.NODE_ENV': '"development"' },
      plugins: [{ name: 'round99-lazy-local-source', setup(builder) {
        builder.onLoad({ filter: /\.(ts|tsx)$/ }, args => {
          const relative = path.relative(repo, args.path);
          if (!relative.startsWith('packages/') || relative.includes('node_modules')) return;
          const revision = revisions[variant];
          const contents = revision ? childProcess.execFileSync('git', ['show', `${revision}:${relative}`],
            { cwd: repo, encoding: 'utf8' }) : fs.readFileSync(args.path, 'utf8');
          return { contents, loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts' };
        });
        builder.onResolve({ filter: /^@\/schema-form/ }, args => {
          const base = path.join(pkg, 'src', args.path.replace(/^@\/schema-form\/?/, ''));
          const target = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]
            .find(file => fs.existsSync(file) && fs.statSync(file).isFile());
          return { path: target };
        });
      } }] });
  } finally {
    childProcess.spawn = originalSpawn;
    for (const service of services) {
      service.ref();
      const ended = service.exitCode === null ? once(service, 'exit') : Promise.resolve([service.exitCode]);
      service.stdin.end();
      const [code, signal] = await ended;
      assert.equal(code, 0, `esbuild 자발적 종료 ${signal}`);
    }
  }
  const module = { exports: {} };
  new Function('require', 'module', 'exports', built.outputFiles[0].text)(require, module, module.exports);
  const api = module.exports;
  const fixture = api.equivalentFixtures.find(row => row.name === fixtureName);
  assert(fixture);
  const computed = fixtureName === 'computed-visible-derived';
  const first = fixture.interactions[0];
  const later = { ...first, value: typeof first.value === 'string' ? `${first.value}-later` :
    typeof first.value === 'number' ? first.value + 1 : !first.value };
  const phases = computed ? computedPhases : ['mount'];
  const timings = Object.fromEntries(phases.map(phase => [phase, []]));
  const observations = {};
  let proofAvailability;
  const noop = () => {};
  for (let sample = -warmup; sample < sampleCount; sample++) {
    const schema = structuredClone(fixture.workspace);
    globalThis.gc();
    const values = {};
    const initialValue = computed ? { trigger: 'on', source: 1, target: 2 } : undefined;
    let start = performance.now();
    const root = api.nodeFromJSONSchema({ jsonSchema: schema, defaultValue: initialValue,
      validationMode: 0, onChange: noop });
    values.mount = performance.now() - start;
    const hashes = { mount: observe(root) };
    assert.equal(root.runtime.diagnostics.status, 'stable');
    if (computed) {
      const sidecar = api.blueprintApi.DeriveConvergenceTargets;
      const afterMount = sidecar?.get(root.runtime.blueprint) !== undefined;
      assert.equal(root.find('/target').value, 2);
      if (variant === 'W') assert.equal(afterMount, false);
      await new Promise(resolve => setTimeout(resolve, 0));
      start = performance.now();
      root.find(first.path).setValue(first.value);
      values.first = performance.now() - start;
      hashes.first = observe(root);
      const afterFirst = sidecar?.get(root.runtime.blueprint) !== undefined;
      if (variant === 'W') assert.equal(afterFirst, true);
      proofAvailability = { afterMount, afterFirst };
      for (let index = 1; index < fixture.interactions.length; index++) {
        const interaction = fixture.interactions[index];
        root.find(interaction.path).setValue(interaction.value);
      }
      await new Promise(resolve => setTimeout(resolve, 0));
      start = performance.now();
      root.find(later.path).setValue(later.value);
      values.later = performance.now() - start;
      hashes.later = observe(root);
      const cache = new WeakMap();
      cache.set(schema, [{ blueprint: root.runtime.blueprint, isTerminal: undefined,
        isAtomic: undefined, warningsCollected: false }]);
      await new Promise(resolve => setTimeout(resolve, 0));
      start = performance.now();
      const second = api.schemaNodeFactory(api.blueprint(schema, { cache }),
        { diagnostics: { status: 'stable' }, loadSnapshot: initialValue,
          validationMode: 0, onChange: noop });
      api.mountSchemaNode(second);
      values.secondMount = performance.now() - start;
      assert.equal(second.runtime.blueprint, root.runtime.blueprint);
      hashes.secondMount = observe(second);
      await new Promise(resolve => setTimeout(resolve, 0));
      start = performance.now();
      second.find(first.path).setValue(first.value);
      values.secondFirst = performance.now() - start;
      hashes.secondFirst = observe(second);
      for (let index = 1; index < fixture.interactions.length; index++) {
        const interaction = fixture.interactions[index];
        second.find(interaction.path).setValue(interaction.value);
      }
      await new Promise(resolve => setTimeout(resolve, 0));
      start = performance.now();
      second.find(later.path).setValue(later.value);
      values.secondLater = performance.now() - start;
      hashes.secondLater = observe(second);
      assert.equal(root.runtime.diagnostics.status, 'stable');
      assert.equal(second.runtime.diagnostics.status, 'stable');
    }
    for (const phase of phases) {
      if (observations[phase]) assert.equal(observations[phase], hashes[phase]);
      observations[phase] = hashes[phase];
      if (sample >= 0) timings[phase].push(values[phase]);
    }
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  const environment = { startedAt, endedAt: new Date().toISOString(), node: process.version,
    v8: process.versions.v8, platform: process.platform, arch: process.arch,
    cpu: os.cpus()[0].model, warmup, samples: sampleCount, validation: 'off',
    mode: 'development synchronous core', instrumented: false, explicitGc: true,
    esbuildNaturalExits: services.length,
    bundleSha256: createHash('sha256').update(built.outputFiles[0].text).digest('hex') };
  const stem = `${prefix}-${fixtureName}-r${run}-${variant}`;
  save(`${stem}-timings.json`, timings);
  save(`${stem}-summary.json`, { sourceHead: head, revision: revisions[variant],
    fixture: fixtureName, variant, run, environment, observations, proofAvailability,
    metrics: Object.fromEntries(phases.map(phase => [phase, metric(timings[phase])])) });
  console.log(`${fixtureName} ${variant} r${run} 예열20 표본101 완료`);
}
