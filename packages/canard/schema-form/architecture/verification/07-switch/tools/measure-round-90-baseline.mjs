// Loaded directly by node --expose-gc; each fixture/run uses a fresh process.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const verification = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = path.resolve(verification, '../../..');
const repo = path.resolve(pkg, '../../..');
const require = createRequire(path.join(pkg, 'package.json'));
const fixtures = ['flat-500', 'nested-d5-f4', 'array-1000', 'computed-visible-derived', 'oneOf-20'];
const warmup = 20;
const samples = 101;
const paired = process.argv.includes('--paired');
const variant = paired ? process.argv[5] : 'W';
const revision = variant === 'H' ? 'afd8ade3d' : undefined;

/** Persist timing-only samples or one aggregate report, below the 5 MB ceiling. */
function save(name, value) {
  const content = JSON.stringify(value, null, 2) + '\n';
  assert(Buffer.byteLength(content) <= 5_000_000);
  fs.writeFileSync(path.join(verification, name), content, { flag: 'wx' });
}

/** Compute nearest-rank statistics from every original timing sample. */
function metric(values) {
  const ordered = [...values].sort((a, b) => a - b);
  return {
    median: ordered[Math.ceil(ordered.length * 0.5) - 1],
    p99: ordered[Math.ceil(ordered.length * 0.99) - 1],
    sampleCount: ordered.length,
  };
}

if (process.argv[2] === '--summarize-paired') {
  const rows = [];
  const runs = [];
  for (const fixture of fixtures) {
    const combined = { H: { mount: [], update: [] }, W: { mount: [], update: [] } };
    let observation;
    for (let run = 1; run <= 3; run++) {
      const order = run === 2 ? ['W', 'H'] : ['H', 'W'];
      let previous;
      for (const side of order) {
        const stem = `round-92-paired-${fixture}-r${run}-${side}`;
        const timings = JSON.parse(fs.readFileSync(path.join(verification, `${stem}-timings.json`), 'utf8'));
        const summary = JSON.parse(fs.readFileSync(path.join(verification, `${stem}-summary.json`), 'utf8'));
        assert.equal(summary.variant, side);
        assert.equal(summary.environment.warmup, warmup);
        assert.equal(summary.environment.samples, samples);
        if (previous) assert(previous.environment.endedAt <= summary.environment.startedAt);
        previous = summary;
        if (observation) assert.equal(summary.observationsSha256, observation);
        observation = summary.observationsSha256;
        runs.push(summary);
        for (const mode of ['mount', 'update']) {
          assert.equal(timings[mode].length, samples);
          assert(timings[mode].every(value => Number.isFinite(value) && value >= 0));
          combined[side][mode].push(...timings[mode]);
        }
      }
    }
    for (const mode of ['mount', 'update']) {
      if (fixture === 'nested-d5-f4' && mode === 'update' ||
        fixture === 'oneOf-20' && mode === 'mount') continue;
      const before = metric(combined.H[mode]);
      const after = metric(combined.W[mode]);
      assert.equal(before.sampleCount, 303);
      assert.equal(after.sampleCount, 303);
      rows.push({ fixture, mode, before, after,
        changePercent: (after.median / before.median - 1) * 100 });
    }
  }
  const report = {
    sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(),
    sourceState: '92C-01–03 미커밋 범용 정착 수정본; 다음 변경의 기준선은 rows[].after',
    environment: runs[0].environment,
    methodology: '동일 세션의 HEAD afd8ade3d(H)와 작업트리(W). 픽스처마다 H→W, W→H, H→W, 각 판·회차 새 프로세스에서 예열 20·표본 101, 303 원표본의 nearest-rank median/p99. validation off, 명시적 GC, 메모리 번들 뒤 esbuild 종료. 다른 명령·테스트·에이전트와 병렬 실행 없음.',
    limits: '운영체제·GUI 및 상주 도구 서비스는 중지하지 않았습니다. heap byte는 미측정입니다. 작은 차이는 이 측정만으로 변경에 귀속하지 않습니다.',
    rows, runs,
  };
  save('round-92-baseline-summary.json', report);
  for (const row of rows)
    console.log(`${row.fixture} ${row.mode}: ${row.before.median.toFixed(6)} → ${row.after.median.toFixed(6)} ms (${row.changePercent.toFixed(2)}%)`);
} else if (process.argv[2] === '--summarize') {
  const before = JSON.parse(fs.readFileSync(path.join(verification, 'round-88-quiet-baseline-summary.json'), 'utf8'));
  const rows = [];
  const runs = [];
  for (const fixture of fixtures) {
    const combined = { mount: [], update: [] };
    for (let run = 1; run <= 3; run++) {
      const stem = `round-90-baseline-${fixture}-r${run}`;
      const timings = JSON.parse(fs.readFileSync(path.join(verification, `${stem}-timings.json`), 'utf8'));
      const summary = JSON.parse(fs.readFileSync(path.join(verification, `${stem}-summary.json`), 'utf8'));
      runs.push(summary);
      for (const mode of ['mount', 'update']) combined[mode].push(...timings[mode]);
    }
    for (const mode of ['mount', 'update']) {
      const previous = before.allHeadRows.find(row => row.fixture === fixture && row.mode === mode);
      const after = metric(combined[mode]);
      rows.push({ fixture, mode, before: previous ? {
        median: previous.median, p99: previous.p99, sampleCount: previous.sampleCount,
      } : null, after,
      changePercent: previous ? (after.median / previous.median - 1) * 100 : null,
      note: previous ? 'round-88에 저장된 같은 픽스처·작업과 비교합니다.' :
        'round-88-quiet-baseline-summary.json에 derived 행이 없어 이전값은 미기록입니다.' });
    }
  }
  const report = {
    sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(),
    sourceState: 'afd8ade3d의 미커밋 90C-01 범용 전이 수정본; 정적 첫 로드 확장 없음',
    environment: runs[0].environment,
    methodology: 'BF 실제 equivalentFixtures, development 동기 코어, validation OFF·구독 없음·새 스키마·mount 전 명시적 GC·mount/update 사이 timer 대기. 픽스처·회차마다 새 프로세스에서 예열 20·표본 101을 3회 순차 실행하고 원표본 303개를 합쳐 nearest-rank median/p99를 계산합니다. 번들은 메모리에서 만들고 esbuild 서비스를 종료한 뒤 측정합니다. 측정 중 다른 명령·테스트·추가 에이전트 실행 없음.',
    limits: '호스트의 운영체제·GUI·도구 서비스까지 중지한 측정은 아닙니다. 저장된 round-88과 실행 시점이 달라 작은 차이의 인과는 확정하지 않습니다. heap byte는 별도 미측정입니다.',
    speedAndMemory: '새 생김 커서와 각 채움 묶음의 깊이 bucket은 O(N+D) 작업·임시 참조이며 기존 노드는 같은 라운드에서 다시 채움 방문하지 않습니다. 호스트 채움이 있을 때만 호스트 Set과 생김/채움 전 길이 Map을 만들고 O(채운 호스트+생긴 branch) 참조를 보유합니다. 영구 메모리·노드 shape 추가 없음. 재귀 판정은 실제 branch 기본값 후보의 조상 깊이만큼이며, 템플릿 반복 후보에서만 작성 게이트 읽기를 확인합니다. 형상/파생 재계산은 기존 경로를 사용합니다.',
    rows,
    runs,
  };
  save('round-90-baseline-summary.json', report);
  for (const row of rows) console.log(`${row.fixture} ${row.mode}: ${row.before?.median.toFixed(6) ?? '미기록'} → ${row.after.median.toFixed(6)} ms, p99 ${row.after.p99.toFixed(6)} ms`);
} else {
  const fixtureName = process.argv[2];
  const run = Number(process.argv[3]);
  assert(fixtures.includes(fixtureName) && run >= 1 && run <= 3);
  assert(variant === 'H' || variant === 'W');
  assert(globalThis.gc, '--expose-gc가 필요합니다.');
  const { build, stop } = require('esbuild');
  const src = path.join(pkg, 'src');
  const bundle = await build({
    stdin: {
      contents: `export { nodeFromJSONSchema } from './src/core/nodeFromJSONSchema';
        export { equivalentFixtures } from '../../aileron/benchmark-form/fixtures/equivalent';`,
      resolveDir: pkg, loader: 'ts',
    },
    write: false, bundle: true, packages: 'external', platform: 'node', format: 'cjs',
    define: { 'process.env.NODE_ENV': '"development"' },
    plugins: [{ name: 'round90-local-source', setup(builder) {
      if (revision) builder.onLoad({ filter: /\.(ts|tsx)$/ }, args => {
        const relative = path.relative(repo, args.path);
        if (relative.startsWith('..') || relative.includes('node_modules') ||
          !relative.startsWith('packages/')) return undefined;
        return { contents: execFileSync('git', ['show', `${revision}:${relative}`],
          { cwd: repo, encoding: 'utf8' }), loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts' };
      });
      builder.onResolve({ filter: /^@\/schema-form/ }, args => {
        const base = path.join(src, args.path.replace(/^@\/schema-form\/?/, ''));
        const target = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]
          .find(file => fs.existsSync(file) && fs.statSync(file).isFile());
        return { path: target };
      });
    } }],
  });
  stop();
  const bundleSha256 = createHash('sha256').update(bundle.outputFiles[0].text).digest('hex');
  const module = { exports: {} };
  new Function('require', 'module', 'exports', bundle.outputFiles[0].text)(require, module, module.exports);
  const api = module.exports;
  const fixture = api.equivalentFixtures.find(item => item.name === fixtureName);
  assert(fixture);
  const timings = { mount: [], update: [] };
  let observation;
  const startedAt = new Date().toISOString();
  for (let sample = -warmup; sample < samples; sample++) {
    const schema = structuredClone(fixture.workspace);
    globalThis.gc();
    let start = performance.now();
    const root = api.nodeFromJSONSchema({ jsonSchema: schema, validationMode: 0 });
    const mount = performance.now() - start;
    const mounted = JSON.stringify(root.value);
    assert.equal(root.runtime.diagnostics.status, 'stable');
    await new Promise(resolve => setTimeout(resolve, 0));
    start = performance.now();
    for (let index = 0; index < fixture.interactions.length; index++) {
      const interaction = fixture.interactions[index];
      assert.equal(interaction.kind, 'set');
      root.find(interaction.path).setValue(interaction.value);
    }
    const update = performance.now() - start;
    const current = [mounted, JSON.stringify(root.value)];
    if (observation) assert.deepEqual(current, observation);
    else observation = current;
    assert.equal(root.runtime.diagnostics.status, 'stable');
    await new Promise(resolve => setTimeout(resolve, 0));
    if (sample >= 0) {
      timings.mount.push(mount);
      timings.update.push(update);
    }
  }
  const stem = paired ? `round-92-paired-${fixtureName}-r${run}-${variant}` :
    `round-90-baseline-${fixtureName}-r${run}`;
  save(`${stem}-timings.json`, timings);
  save(`${stem}-summary.json`, {
    fixture: fixtureName, run, variant,
    environment: { startedAt, endedAt: new Date().toISOString(), node: process.version,
      v8: process.versions.v8, platform: process.platform, arch: process.arch,
      cpu: os.cpus()[0].model, cpus: os.cpus().length, memory: os.totalmem(),
      warmup, samples, validation: 'off', mode: 'development synchronous core',
      explicitGc: true, trace: false, bundleSha256 },
    mount: metric(timings.mount), update: metric(timings.update),
    observationsSha256: createHash('sha256').update(JSON.stringify(observation)).digest('hex'),
    note: '같은 새 스키마·전체 BF 상호작용에서 모든 표본의 mount/update 값과 안정 진단을 확인했습니다. 시간 원표본에는 숫자 배열만 저장합니다.',
  });
  console.log(`${fixtureName} ${run}회차 ${variant} 완료: 예열 ${warmup}, 표본 ${samples}`);
}
