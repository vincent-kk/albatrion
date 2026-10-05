// Invoked by measure-round-90-baseline.mjs --round98; bundles remain in memory.
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
const mountRecheck = process.argv.includes('--mount-recheck');
const contextPreparation = process.argv.includes('--a2');
const head = mountRecheck ? '69cbe29c4' : contextPreparation ? '349b62057' :
  '31717d1f7fad0ac94dd36ae9144dee3d1eb4b9d2';
const workingRevision = mountRecheck ? '349b62057' : undefined;
const prefix = mountRecheck ? 'round-98-a1-mount-recheck' :
  contextPreparation ? 'round-98-a2' : 'round-98-a1';
const fixtures = mountRecheck ? ['flat-500', 'nested-d5-f4', 'array-1000',
  'sample-0', 'computed-visible-derived'] : ['sample-0', 'sample-1', 'sample-2', 'sample-3', 'nested-d3-f4',
  'nested-d5-f4', 'array-100', 'flat-500', 'computed-visible-derived', 'oneOf-20'];
const phases = mountRecheck ? ['mount'] : ['mount', 'first', 'later'];
const warmup = 20, sampleCount = 101;
const entries = {
  'settlement/finishSettlement.ts': 'finishSettlement',
  'derivation/runDeriveRounds.ts': 'runDeriveRounds',
  'transition/transitionSettlement.ts': 'transitionSettlement',
  'transition/finalizeExits.ts': 'finalizeExits',
  'commit/snapshotExitedPolicies.ts': 'snapshotExitedPolicies',
  'commit/commitDeriveRules.ts': 'commitDeriveRules',
  'commit/commitExitPolicyValues.ts': 'commitExitPolicyValues',
  'commit/finalizeDeriveTrace.ts': 'finalizeDeriveTrace',
  'load/alignArraySnapshotSlots.ts': 'alignArraySnapshotSlots',
};

/** Persist bounded timing-only samples or aggregate details, refusing overwrites. */
function save(name, value) {
  const text = JSON.stringify(value, null, 2) + '\n';
  assert(Buffer.byteLength(text) <= 5_000_000);
  fs.writeFileSync(path.join(directory, name), text, { flag: 'wx' });
}

/** Compute nearest-rank quantiles from original timing samples in milliseconds. */
function metric(values) {
  const sorted = values.toSorted((a, b) => a - b);
  return { median: sorted[Math.ceil(sorted.length * .5) - 1],
    p99: sorted[Math.ceil(sorted.length * .99) - 1], sampleCount: sorted.length };
}

/** Hash observable state outside timed intervals; no listeners or instrumentation. */
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
  const rows = [], runs = [], counts = [];
  let previousEnd;
  for (const fixture of fixtures) {
    const combined = { H: { mount: [], first: [], later: [] },
      W: { mount: [], first: [], later: [] } };
    let observations;
    for (let run = 1; run <= 3; run++) {
      const order = run === 2 ? ['W', 'H'] : ['H', 'W'];
      for (const side of order) {
        const stem = `${prefix}-${fixture}-r${run}-${side}`;
        const summary = JSON.parse(fs.readFileSync(path.join(directory, `${stem}-summary.json`)));
        const timings = JSON.parse(fs.readFileSync(path.join(directory, `${stem}-timings.json`)));
        assert.equal(summary.environment.warmup, warmup);
        assert.equal(summary.environment.samples, sampleCount);
        assert.equal(summary.environment.instrumented, false);
        if (previousEnd) assert(previousEnd <= summary.environment.startedAt);
        previousEnd = summary.environment.endedAt;
        if (observations) assert.deepEqual(summary.observations, observations);
        observations = summary.observations;
        runs.push(summary);
        for (const phase of phases) {
          assert.equal(timings[phase].length, sampleCount);
          for (const value of timings[phase]) {
            assert(Number.isFinite(value) && value >= 0);
            combined[side][phase].push(value);
          }
        }
      }
    }
    for (const phase of phases) {
      if (!mountRecheck && phase === 'mount' && !['flat-500', 'nested-d5-f4'].includes(fixture)) continue;
      const before = metric(combined.H[phase]), after = metric(combined.W[phase]);
      const pairs = [];
      for (let run = 1; run <= 3; run++) {
        const h = runs.find(row => row.fixture === fixture && row.run === run && row.variant === 'H');
        const w = runs.find(row => row.fixture === fixture && row.run === run && row.variant === 'W');
        pairs.push({ run, order: run === 2 ? 'W→H' : 'H→W', before: h[phase], after: w[phase],
          changePercent: (w[phase].median / h[phase].median - 1) * 100 });
      }
      rows.push({ fixture, phase, before, after, pairs,
        changePercent: (after.median / before.median - 1) * 100 });
    }
    if (mountRecheck) continue;
    const before = JSON.parse(fs.readFileSync(path.join(directory, `${prefix}-${fixture}-H-counts-summary.json`)));
    const after = JSON.parse(fs.readFileSync(path.join(directory, `${prefix}-${fixture}-W-counts-summary.json`)));
    assert.deepEqual(before.observations, after.observations);
    assert.deepEqual(observations, after.observations);
    counts.push({ fixture, before: before.counts, after: after.counts });
  }
  save(`${prefix}-summary.json`, { head, workingRevision, rows, runs, counts,
    method: mountRecheck ? '69cbe29c4(H) 대 349b62057(W), 두 판 모두 git show 정본으로 메모리 번들. 마운트만 실행, 갱신 없음. 동일 세션·fixture별 새 프로세스. H→W, W→H, H→W. 예열20, 표본101×3. 무계측 동기 코어, validation off, 개발 모드, 빈 onChange, 리스너 없음. 각 측정 전에 esbuild stdin을 닫고 자발적 종료0을 확인. 303개 원표본의 nearest-rank median/p99와 회차별 중앙값을 보존.' :
      '동일 세션·fixture별 새 프로세스. H→W, W→H, H→W. 예열20, 표본101×3. 무계측 동기 코어, validation off, 개발 모드, 빈 onChange, 리스너 없음. 첫 쓰기 한 번과 BF 원 상호작용을 마친 뒤의 후속 쓰기 한 번을 분리. oneOf는 kind_0→kind_4. 각 측정 전에 esbuild stdin을 닫고 자발적 종료0을 확인. 계수는 별도 5개 새 트리의 동일 operation 결과.',
    speedAndMemory: mountRecheck ? '기존 빈 정착 단계 생략 변경의 마운트 재확인. 제품 변경 없음, heap byte 미측정.' :
      contextPreparation ? '기능 부재 증명으로 호출별 게이트 상한과 가상 참조 색인 준비를 생략하고 비어 있는 scratch clear 및 배열 초기화를 제거. DirtyPathSet의 모드·부모 색인은 한 번 초기화. 고정 O(1) 검사 비용, 새 영구 메모리·색인·객체 필드 없음. 정적 첫 갱신의 null 참조 캐시 항목을 생성하지 않음. 호출별 문맥 객체 1개와 첫 scratch의 24개 컨테이너는 유지. 중첩·오류 정리·예산·라운드·commit·revision 유지. heap byte 미측정.' :
      '고정 수의 O(1) 입력 부재 검사로 빈 helper 호출과 내부 반복자·임시 그릇을 제거. 기존 scratch 생성·clear, context 준비, 실제 파생 의존 작업, 단계 순서·라운드·commit·revision은 유지. 새 영구 메모리·색인·object shape 없음. heap byte는 측정하지 않음.',
    allocationMethod: contextPreparation ? '별도 계수 번들에서 실제 context return과 scratch 신규 분기를 계수. scratch 신규 분기의 Map·Set·DirtyPathSet·배열 생성 site가 24개임을 소스로 검증. clear는 직접 호출과 DirtyPathSet 내부 부모 Map 호출을 포함하며 엔진 내부 backing-store 할당 수나 heap byte로 환산하지 않음. 5개 새 트리의 mount/first/later 계수와 무계측 관측 해시가 일치해야 요약 성공.' : undefined,
    limits: '실행한 측정·계수·테스트는 모두 순차이며 설치·git 쓰기·추가 에이전트 없음. 운영체제와 기존 상주 도구 서비스는 유지. 작은 시간 차이를 이 변경의 이득 또는 회귀로 단정하지 않음.' });
  for (const row of rows)
    console.log(`${row.fixture} ${row.phase}: ${(row.before.median * 1000).toFixed(2)}→${(row.after.median * 1000).toFixed(2)} µs (${row.changePercent.toFixed(2)}%)`);
} else {
  const fixtureName = process.argv[2], run = Number(process.argv[3]), variant = process.argv[5];
  const counting = process.argv.includes('--counts');
  assert(fixtures.includes(fixtureName) && run >= 1 && run <= 3);
  assert(['H', 'W'].includes(variant) && globalThis.gc);
  const expectedHead = mountRecheck || contextPreparation ? '349b62057' : head;
  assert(childProcess.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim().startsWith(expectedHead));
  let activeCounts;
  globalThis.__r98Enter = (name, amount = 1) => {
    if (activeCounts) activeCounts[name] = (activeCounts[name] ?? 0) + amount;
  };
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
       export { equivalentFixtures } from '../../aileron/benchmark-form/fixtures/equivalent';`,
      resolveDir: pkg, loader: 'ts' },
      write: false, bundle: true, packages: 'external', platform: 'node', format: 'cjs',
      define: { 'process.env.NODE_ENV': '"development"' },
      plugins: [{ name: 'round98-local-source', setup(builder) {
        builder.onLoad({ filter: /\.(ts|tsx)$/ }, args => {
          const relative = path.relative(repo, args.path);
          if (!relative.startsWith('packages/') || relative.includes('node_modules')) return;
          const revision = variant === 'H' ? head : workingRevision;
          let contents = revision ? childProcess.execFileSync('git', ['show', `${revision}:${relative}`],
            { cwd: repo, encoding: 'utf8' }) : fs.readFileSync(args.path, 'utf8');
          if (counting) {
            const key = relative.split('/settle/utils/')[1], name = entries[key];
            if (name) {
              const marker = '): void => {';
              const start = contents.indexOf(`export const ${name}`);
              const body = contents.indexOf(marker, start);
              assert(start >= 0 && body >= start, name);
              const offset = body + marker.length;
              contents = contents.slice(0, offset) + `\n globalThis.__r98Enter('${name}');` + contents.slice(offset);
            }
            if (contextPreparation && key === 'settlement/createSettlementContext.ts') {
              for (const [callee, label] of [['getTransitionCap', 'prepareGateCap'],
                ['getVirtualReferenceIndex', 'prepareVirtualReferences']]) {
                const start = contents.indexOf(`${callee}(`);
                assert(start >= 0);
                let end = start + callee.length + 1, depth = 1;
                while (depth) {
                  assert(end < contents.length);
                  if (contents[end] === '(') depth++;
                  if (contents[end] === ')') depth--;
                  end++;
                }
                contents = contents.slice(0, start) + `(globalThis.__r98Enter('${label}'), ` +
                  contents.slice(start, end) + ')' + contents.slice(end);
              }
              contents = contents.replace('  return {',
                "  globalThis.__r98Enter('contextObjectAllocations');\n  return {");
            }
            if (contextPreparation && key === 'write/getSettlementScratch.ts') {
              const allocations = (contents.match(/\bnew (?:Map|Set|DirtyPathSet)\b/g) ?? []).length +
                (contents.match(/: \[\]/g) ?? []).length;
              assert.equal(allocations, 24);
              contents = contents.replace('  const cached = runtime.settlementScratch;',
                `  const cached = runtime.settlementScratch;
                 globalThis.__r98Enter('getSettlementScratch');
                 if (!cached || cached.inUse) {
                   globalThis.__r98Enter('scratchObjectAllocations');
                   globalThis.__r98Enter('scratchContainerAllocations', ${allocations});
                 }`);
            }
            if (contextPreparation && key === 'write/releaseSettlementScratch.ts') {
              contents = contents.replace(/scratch\.(\w+)\.clear\(\);/g, (_, field) =>
                `(globalThis.__r98Enter('scratchClear.${field}'), scratch.${field}.clear());`);
              contents = contents.replace(/scratch\.(\w+)\.length = 0;/g, (_, field) =>
                `(globalThis.__r98Enter('scratchArrayReset.${field}'), scratch.${field}.length = 0);`);
            }
            if (contextPreparation && key === 'write/DirtyPathSet.ts') {
              contents = contents.replace('    super.clear();',
                "    globalThis.__r98Enter('dirtyTraversalReset');\n    super.clear();")
                .replace('    this.childrenByParent.clear();\n    this.postOrder = false;',
                  "    globalThis.__r98Enter('scratchClear.dirtyChildrenByParent');\n    this.childrenByParent.clear();\n    this.postOrder = false;");
            }
            if (contextPreparation && key === 'compute/getVirtualReferenceIndex.ts') {
              contents = contents.replace(/REFERENCES\.set\(blueprint, ([^)]+)\);/g, (_, value) =>
                `globalThis.__r98Enter('virtualReferenceCacheEntries'); REFERENCES.set(blueprint, ${value});`);
            }
          }
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
  if (fixtureName === 'oneOf-20') fixture.interactions[0].value = 'kind_4';
  const first = fixture.interactions[0];
  const later = { ...first, value: fixtureName === 'oneOf-20' ? 'kind_4' :
    typeof first.value === 'string' ? `${first.value}-later` :
      typeof first.value === 'number' ? first.value + 1 : !first.value };
  const timings = mountRecheck ? { mount: [] } : { mount: [], first: [], later: [] };
  const observations = {}, counts = {};
  const startedAt = new Date().toISOString();
  const total = counting ? 5 : sampleCount;
  const noop = () => {};
  for (let sample = counting ? 0 : -warmup; sample < total; sample++) {
    const schema = structuredClone(fixture.workspace);
    globalThis.gc();
    activeCounts = counting ? {} : undefined;
    let start = performance.now();
    const root = api.nodeFromJSONSchema({ jsonSchema: schema, validationMode: 0, onChange: noop });
    const mounted = performance.now() - start;
    const mountCounts = activeCounts;
    const mountedHash = observe(root);
    if (mountRecheck) {
      assert.equal(root.runtime.diagnostics.status, 'stable');
      if (observations.mount) assert.equal(observations.mount, mountedHash);
      observations.mount = mountedHash;
      if (sample >= 0) timings.mount.push(mounted);
      await new Promise(resolve => setTimeout(resolve, 0));
      continue;
    }
    await new Promise(resolve => setTimeout(resolve, 0));
    activeCounts = counting ? {} : undefined;
    start = performance.now();
    root.find(first.path).setValue(first.value);
    const firstTiming = performance.now() - start;
    const firstCounts = activeCounts;
    const firstHash = observe(root);
    activeCounts = undefined;
    for (let index = 1; index < fixture.interactions.length; index++) {
      const interaction = fixture.interactions[index];
      root.find(interaction.path).setValue(interaction.value);
    }
    await new Promise(resolve => setTimeout(resolve, 0));
    activeCounts = counting ? {} : undefined;
    start = performance.now();
    root.find(later.path).setValue(later.value);
    const laterTiming = performance.now() - start;
    const laterCounts = activeCounts;
    const laterHash = observe(root);
    activeCounts = undefined;
    assert.equal(root.runtime.diagnostics.status, 'stable');
    for (const [phase, hash, operations] of [['mount', mountedHash, mountCounts],
      ['first', firstHash, firstCounts], ['later', laterHash, laterCounts]]) {
      if (observations[phase]) assert.equal(observations[phase], hash);
      observations[phase] = hash;
      if (counting) {
        if (counts[phase]) assert.deepEqual(counts[phase], operations);
        counts[phase] = operations;
      }
    }
    if (!counting && sample >= 0) {
      timings.mount.push(mounted); timings.first.push(firstTiming); timings.later.push(laterTiming);
    }
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  const environment = { startedAt, endedAt: new Date().toISOString(), node: process.version,
    v8: process.versions.v8, platform: process.platform, arch: process.arch,
    cpu: os.cpus()[0].model, warmup: counting ? 0 : warmup, samples: total,
    validation: 'off', mode: 'development synchronous core', instrumented: counting,
    explicitGc: true, esbuildNaturalExits: services.length,
    bundleSha256: createHash('sha256').update(built.outputFiles[0].text).digest('hex') };
  if (counting) save(`${prefix}-${fixtureName}-${variant}-counts-summary.json`,
    { fixture: fixtureName, variant, environment, counts, observations });
  else {
    const stem = `${prefix}-${fixtureName}-r${run}-${variant}`;
    save(`${stem}-timings.json`, timings);
    save(`${stem}-summary.json`, { fixture: fixtureName, variant, run, environment, observations,
      mount: metric(timings.mount), ...(mountRecheck ? {} : {
        first: metric(timings.first), later: metric(timings.later) }) });
  }
  console.log(`${fixtureName} ${variant} ${counting ? '계수5' : `r${run} 예열20 표본101`} 완료`);
}
