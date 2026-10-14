// Final artifact audit and Korean report; native host writing owns every persisted file.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(directory, '../../../../../../..');
const HEAD = '35af3faecd473598d439638806db9d3f39e88a29';
const phases = ['AA', '1-c1-empty-memo', '2-f1-scalar-entry', '3-s1-empty-scratch',
  '4-r1-single-path', '5-q1-stable-compute'];
const codes = ['AA', 'C1', 'F1', 'S1', 'R1', 'Q1'];
const read = (name) => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const summaries = phases.map((phase) => read(phase + '-summary.json'));
const artifact = (file, text) => {
  assert(Buffer.byteLength(text) <= 5_000_000, file);
  console.log('NATIVE_ARTIFACT ' + JSON.stringify({ file, text }));
};
const jsonArtifact = (name, value) => artifact(path.join(directory, name), JSON.stringify(value, null, 2) + '\n');
const git = (...args) => {
  const result = spawnSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false', ...args],
    { cwd: repo, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' }, maxBuffer: 10_000_000 });
  assert.equal(result.status, 0);
  assert.equal(result.signal, null);
  return result.stdout;
};

/** Replay unified patches in memory to verify artifacts; no git writes or behavior assertions. */
function replay(base, patchText) {
  const output = { ...base };
  for (const chunk of patchText.split(/^diff --git /m).slice(1)) {
    const lines = chunk.split('\n');
    const file = lines[0].match(/^a\/(.+) b\/(.+)$/)?.[2];
    assert(file, 'patch file header');
    const before = base[file] ?? '';
    const original = before ? before.replace(/\n$/, '').split('\n') : [];
    const result = [];
    let cursor = 0, index = 1;
    while (index < lines.length) {
      const hunk = lines[index].match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
      if (!hunk) { index++; continue; }
      const start = Math.max(0, Number(hunk[1]) - 1);
      assert(start >= cursor, file);
      result.push(...original.slice(cursor, start));
      cursor = start;
      const oldCount = hunk[2] === undefined ? 1 : Number(hunk[2]);
      const newCount = hunk[4] === undefined ? 1 : Number(hunk[4]);
      let removed = 0, added = 0;
      index++;
      while (index < lines.length && !lines[index].startsWith('@@ ')) {
        const line = lines[index++];
        if (!line) continue;
        const prefix = line[0], body = line.slice(1);
        if (prefix === ' ' || prefix === '-') {
          assert.equal(original[cursor++], body, file + ' original row');
          removed++;
        }
        if (prefix === ' ' || prefix === '+') {
          result.push(body);
          added++;
        }
      }
      assert.equal(removed, oldCount, file + ' old hunk count');
      assert.equal(added, newCount, file + ' new hunk count');
    }
    result.push(...original.slice(cursor));
    output[file] = result.length ? result.join('\n') + '\n' : '';
  }
  return output;
}

function audit() {
  assert.equal(git('rev-parse', 'HEAD').toString().trim(), HEAD);
  const pairs = [], processes = [];
  for (let index = 0; index < phases.length; index++) {
    const phase = phases[index], summary = summaries[index];
    assert.equal(summary.HEAD, HEAD);
    assert.equal(summary.rows.length, 14);
    assert.equal(summary.design.runs, 9);
    assert.equal(summary.design.warmup, 20);
    assert.equal(summary.design.samples, 101);
    const records = fs.readdirSync(directory)
      .filter((name) => name.startsWith(phase + '-process-') && name.endsWith('.json'))
      .map((file) => ({ file, ...read(file) }));
    assert.equal(records.filter((record) => record.command === 'pair').length, 126);
    for (const record of records) {
      assert.equal(record.status, 0);
      assert.equal(record.signal, null);
      assert(record.ended >= record.started && record.elapsedMs < 480_000);
      processes.push(record);
      if (record.command === 'pair') pairs.push(record);
    }
    for (const row of summary.rows) {
      assert.equal(row.pairs, 909);
      assert.equal(row.floorMs, Math.max(Math.abs(row.aaStatisticMs), row.baseMedianMs * 0.005));
      if (index > 0) {
        assert.equal(row.improved, row.ci99Ms[0] > 0 && row.pooledMedianMs > row.aaStatisticMs);
        assert.equal(row.regression, row.ci99Ms[1] < 0 && Math.abs(row.pooledMedianMs) > row.floorMs);
      }
    }
    if (index > 0) {
      assert.equal(summary.adopted, summary.rows.some((row) => row.improved) &&
        !summary.rows.some((row) => row.regression));
      const label = codes[index].toLowerCase();
      const red = read('check-' + label + '-red.json');
      assert.equal(red.exitCode, 1);
      assert(red.summary.some((line) => line.includes('AssertionError:')));
      assert.equal(read('check-' + label + '-green.json').exitCode, 0);
      assert.equal(read('check-' + label + '-counts.json').exitCode, 0);
    }
  }
  assert.equal(pairs.length, 756);
  pairs.sort((a, b) => a.started - b.started);
  for (let index = 1; index < pairs.length; index++)
    assert(pairs[index].started >= pairs[index - 1].ended, 'pair process overlap');
  for (let index = 1; index < phases.length; index++) {
    const priorEnd = Math.max(...pairs.filter((p) => p.file.startsWith(phases[index - 1] + '-')).map((p) => p.ended));
    const nextStart = Math.min(...pairs.filter((p) => p.file.startsWith(phases[index] + '-')).map((p) => p.started));
    assert(nextStart >= priorEnd, 'candidate order');
  }
  assert.equal(summaries[0].builds.head.bundleSha256, summaries[0].builds.working.bundleSha256);
  assert.equal(summaries[1].builds.head.bundleSha256, summaries[0].builds.head.bundleSha256);
  assert.equal(summaries[2].builds.head.bundleSha256, summaries[1].builds.working.bundleSha256);
  for (const index of [3, 4, 5])
    assert.equal(summaries[index].builds.head.bundleSha256, summaries[2].builds.working.bundleSha256);
  let accumulated = {};
  const patchAudit = [];
  for (let index = 1; index < phases.length; index++) {
    const phase = phases[index], summary = summaries[index];
    const base = read(phase + '-base.json').files;
    for (const [file, content] of Object.entries(base))
      if (Object.hasOwn(accumulated, file)) assert.equal(content, accumulated[file], phase + ' cumulative base');
    const manifest = read(phase + '-files.json');
    const replayed = replay(base, fs.readFileSync(path.join(directory, manifest.patch), 'utf8'));
    assert.equal(manifest.baseBundleSha256, summary.builds.head.bundleSha256);
    assert.equal(manifest.candidateBundleSha256, summary.builds.working.bundleSha256);
    for (const { file, detailLines } of manifest.files) {
      assert(Object.hasOwn(replayed, file), 'manifest file');
      if (file.endsWith('/DETAIL.md')) {
        assert(detailLines?.length);
        for (const line of detailLines)
          assert(replayed[file].split('\n')[line - 1].includes('109 갱신 ' + codes[index]), 'DETAIL line');
      }
    }
    if (summary.adopted) accumulated = { ...accumulated, ...replayed };
    else {
      const restored = read(phase + '-restore.json');
      assert(restored.sourceAndDetailByteEqualToMeasuredBase && restored.candidateTestsRemoved);
      for (const [file, content] of Object.entries(base)) {
        if (file.endsWith('/DETAIL.md')) continue; // Q1 later adds its own clause.
        if (content === null) assert(!fs.existsSync(path.join(repo, file)), 'rejected test');
        else assert.equal(fs.readFileSync(path.join(repo, file), 'utf8'), content, 'rejected source restored');
      }
    }
    patchAudit.push({ name: codes[index], patch: manifest.patch, adopted: summary.adopted,
      files: manifest.files.map((entry) => entry.file), baseVerified: true, replayVerified: true });
  }
  for (const [file, content] of Object.entries(accumulated))
    assert.equal(fs.readFileSync(path.join(repo, file), 'utf8'), content, 'final cumulative patch bytes');
  const finalBuild = read(phases[5] + '-build-working.json');
  for (const [file, digest] of Object.entries(finalBuild.sources))
    assert.equal(hash(fs.readFileSync(path.join(repo, file))), digest, 'final measured source bytes');
  const protectedFiles = [
    'src/core/settle/utils/commit/markCommitDeliveries.ts',
    'src/core/record/utils/markSchemaNodeEvent.ts',
    'src/core/settle/utils/compute/updateOutput.ts',
    'src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts',
  ].map((file) => 'packages/canard/schema-form/' + file);
  for (const file of protectedFiles)
    assert(fs.readFileSync(path.join(repo, file)).equals(git('show', HEAD + ':' + file)), 'protected bytes');
  assert.equal(git('diff', '--name-only', 'HEAD', '--', 'packages/canard/schema-form/src/core/blueprint').toString().trim(), '');
  const development = read('check-development.json');
  const fails = development.summary.filter((line) => /^\s*FAIL\s/.test(line));
  assert.equal(development.exitCode, 1);
  assert.equal(fails.length, 4);
  assert(fails.every((line) => line.includes('EVENT-070')));
  assert.equal(fails.filter((line) => line.includes('|render|')).length, 2);
  assert.equal(fails.filter((line) => line.includes('|react18|')).length, 2);
  const finalChecks = ['development', 'production', 'typecheck', 'lint', 'legacy'].map((name) => read('check-' + name + '.json'));
  for (const record of finalChecks) {
    assert(record.natural && record.signal === null && record.elapsedMs < 480_000);
    if (record.name !== 'development') assert.equal(record.exitCode, 0);
  }
  for (const record of fs.readdirSync(directory).filter((file) => /^check-.*\.json$/.test(file)).map(read)) {
    assert(record.natural && record.signal === null && record.elapsedMs < 480_000);
    processes.push(record);
  }
  processes.sort((a, b) => a.started - b.started);
  for (let index = 1; index < processes.length; index++)
    assert(processes[index].started >= processes[index - 1].ended, 'build/test/measurement overlap');
  const files = fs.readdirSync(directory).map((file) => ({ file, bytes: fs.statSync(path.join(directory, file)).size }));
  assert(files.every((file) => file.bytes <= 5_000_000));
  assert(!files.some((file) => /\.(?:cjs|map)$/.test(file.file)));
  const cacheLinks = ['node_modules/.vite', 'packages/canard/schema-form/node_modules/.vite'].map((file) => {
    const resolved = fs.realpathSync(path.join(repo, file));
    assert(resolved.startsWith('/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles/'));
    return { file, resolved };
  });
  const reportText = fs.readFileSync(path.join(directory, '../remeasure-86c02.md'), 'utf8');
  const chapterHeading = '## 107라운드 갱신 손질';
  const chapter = reportText.split(chapterHeading);
  let reportVerified = false;
  if (chapter.length > 1) {
    assert.equal(chapter.length, 2, 'unique report chapter');
    assert.equal(chapter[1].split('\n').filter((line) => /^\| (?:nested-d5-f4|flat-|oneOf-|sample-0)/.test(line)).length, 84);
    for (const summary of summaries) for (const row of summary.rows) {
      const interval = '[' + row.ci99Ms.map((value) => value.toFixed(6)).join(', ') + ']';
      assert(chapter[1].includes(interval), 'reported interval');
    }
    for (let index = 1; index < phases.length; index++) {
      const summary = summaries[index];
      assert.equal(summary.name, codes[index]);
      for (const field of ['name', 'mode', 'pooledMedianMs', 'ci99Ms', 'aaStatisticMs', 'baseMedianMs', 'floorMs', 'verdict'])
        assert(Object.hasOwn(summary, field), 'requested summary field');
      assert(chapter[1].includes(summary.patch), 'reported patch');
    }
    reportVerified = true;
  }
  const result = {
    HEAD, verification: 'PROFILE_109_BATCH_VERIFIED',
    measurements: { phases, rowsPerPhase: 14, runs: 9, samples: 101, pairedProcesses: pairs.length,
      pooledPairs: pairs.length * 101, allRecordedProcessesSequential: true,
      maxPairWorkerMs: Math.max(...pairs.map((record) => record.elapsedMs)),
      maxCommandMs: Math.max(...processes.map((record) => record.elapsedMs)),
      AARanFirst: true, cumulativeBundleChainVerified: true },
    patches: patchAudit, finalSourceTreeSha256: finalBuild.sourceTreeSha256,
    finalSourcesEqualMeasuredCandidate: true, protectedFilesEqualHEAD: protectedFiles,
    blueprintUnchanged: true, fixtureDifferentialRequirement: 'blueprint untouched; additional conditional 59-schema run not required',
    finalChecks: finalChecks.map(({ name, exitCode, elapsedMs, natural, summary }) =>
      ({ name, exitCode, elapsedMs, natural, totals: summary.filter((line) => /Test Files|Tests\s|LEGACY_ISOLATED/.test(line)) })),
    permittedFailures: fails, cacheLinks, files: files.length,
    largestFile: files.sort((a, b) => b.bytes - a.bytes)[0], fileLimitBytes: 5_000_000,
    reportVerified, reportRows: reportVerified ? 84 : 0, reportBytes: Buffer.byteLength(reportText), STOP: [],
  };
  jsonArtifact('final-audit.json', result);
  console.log('PROFILE_109_BATCH_VERIFIED');
  return result;
}

const costs = {
  C1: '계속 빈 불일치 메모의 루트 row는 commit만 갱신합니다. O(1) row/size 확인을 추가하고 clear·부모 색인 재생성·set을 제거합니다. 기존 폼 소유 row를 재사용하여 커밋별 row/색인 할당을 줄이며 새 상주 메모리·필드·폼 간 공유는 없습니다. 불일치→빈 전이와 다른 row가 있는 경우의 초기화·정렬·경고·진단은 기존 처리입니다.',
  F1: 'branchless·파생/잠복 부재·live 비루트 scalar·동일 유효 타입을 호출 진입에서 증명한 경우만 특화합니다. 고정 수 O(1) 검사로 writable/빈 latent·wrong-kind release 및 마감의 중복 유효 타입 해석을 제거합니다. 기존 조상 표시·실제 wrong-kind·표시·계산·전이·상태·커밋·배달 순서는 유지합니다. boolean/local만 추가하고 빈 release의 배열/closure를 줄이며 새 보유 메모리·문맥 필드·폼 간 공유는 없습니다.',
  S1: 'DirtyPathSet의 native Set.clear와 부모 Map.clear는 비어 있으면 생략합니다. 사용된 경로와 post-order 모드/부모 색인 초기화는 유지합니다. O(1) size 분기를 추가하여 빈 native clear만 줄이고 메모리 보유량은 같습니다. 다른 settlement scratch의 빈 release는 이미 보호되어 있어 그 부분을 다시 변경하지 않았습니다.',
  R1: 'beginPostOrder와 의존 경로/owner·shape 등록을 유지한 채, 원래 dirty 하나이고 의존 확장도 같은 경로인 게이트 없는 경우만 while 루프로 조상을 등록합니다. 여러 경로는 기존 확장 Set을 사용합니다. 단일 경로의 O(depth) 순회는 같고 임시 확장 Set·중복 등록을 줄이지만 고정 분기가 추가됩니다. 새로운 상주 메모리·문맥 필드는 없습니다.',
  Q1: '계산 진입에서 branchless·gate 부재·빈 shapeDirty/entered를 한 번 증명한 경우만 동일 helper로 직접 재귀합니다. dirty 확인·stateDirty·자식 post-order·동일 updateOutput 인자·dirty 삭제·터미널 루트 schema 선택은 유지합니다. O(1) 부재 검사와 O(방문 노드) 작업은 남고 노드마다 반복하던 shell 검사를 줄입니다. 기존 dirtyChildren 배열·깊이 D의 재귀 stack을 유지하며 새 heap container·노드/문맥 필드·보유 cache·폼 간 공유는 없습니다.',
};
const evidence = {
  C1: '수정 전 빈 memo clear가 2회여서 제거 assertion이 실패했습니다. 수정 후 count 3사례가 통과하며 빈 상태·불일치 복구·추가 subtree row의 초기화, 경고/commit을 검증합니다.',
  F1: '수정 전 writable helper가 2회여서 실패했습니다. 수정 후 count 2사례가 통과하며 정상 scalar의 writable/prune/빈 release 0회와 유효 타입 해석 감소, derive/dispose 일반 경로를 검증합니다.',
  S1: '수정 전 빈 scratch의 native clear가 1회여서 실패했습니다. 수정 후 count 2사례가 통과하며 빈/사용/중첩 scratch와 post-order 모드 재사용을 관측했습니다. 기각 후 해당 테스트도 제거했습니다.',
  R1: '수정 전 단일 dirty 경로의 Set 생성이 2회여서 1회 기대가 실패했습니다. 수정 후 count 3사례가 통과하며 단일 경로의 임시 Set 제거·여러 경로 등록 순서·의존 owner 확장의 일반 경로를 관측했습니다. 기각 후 해당 테스트도 제거했습니다.',
  Q1: '수정 전 노드별 shape membership 확인이 2회여서 0회 기대가 실패했습니다. 수정 후 count 3사례가 통과하며 확인 0회·dirty/stateDirty·방문/값·배열 생김과 gate 일반 경로를 검증합니다.',
};

function report(auditResult) {
  const fmt = (value) => Number(value).toFixed(6);
  const signed = (value) => value > 0 ? '+' + fmt(value) : fmt(value);
  const interval = (row) => '[' + row.ci99Ms.map(fmt).join(', ') + ']';
  const mode = (value) => ({ mount: '마운트', first: '첫 갱신', later: '이후 갱신' })[value];
  const lines = [
    '## 107라운드 갱신 손질', '',
    '- 범위: stage-07, HEAD 35af3faec. C1 → F1 → S1 → R1 → Q1을 한 세션에서 순서대로 검증했습니다. 코드는 비효율 제거와 JIT 실행 특화만 변경했습니다.',
    '- 판정 열: production의 새 프로세스, 행별 9회, 회차별 예열 20·표본 101, H/W 순서의 표본별 교대, 시계 밖 강제 GC, 기존 종단 끝점(64 checkpoint와 setImmediate sentinel)을 사용했습니다. 행당 909쌍을 pooled하며 기존 결정적 bootstrap 1,999회·seed 101의 99% 구간입니다. H−W가 양수면 후보가 빠릅니다.',
    '- A/A는 HEAD 대 HEAD의 바이트 동일 번들로 먼저 한 번 수행했습니다. C1 기반은 HEAD, F1 기반은 HEAD+C1, S1/R1/Q1 기반은 HEAD+C1+F1입니다. 기각된 S1/R1을 다음 기반에 포함하지 않았습니다.',
    '- 채택: 한 행 이상에서 구간 하한 > 0이며 pooled 중앙값 > 같은 A/A 행의 부호 있는 중앙값이고, 회귀 행이 없어야 합니다. 회귀: 구간 상한 < 0이며 |중앙값| > max(|A/A 행 통계|, 해당 후보 기반 중앙값 × 0.5%)입니다. floorMs는 이 max 값입니다. 105C-01의 최소 크기 덧붙임을 적용했으며 그 이하의 음수는 회귀로 세지 않았습니다.',
    '- 이하 모든 시간은 ms입니다. pooled 표본 구간은 이 세션의 판정 통계이며 프로세스 모집단 전체의 구간을 주장하지 않습니다. 누적 후보의 이득은 서로 더하지 않습니다.', '',
    '### A/A 대조 — HEAD 대 HEAD, 9회 먼저', '',
    '| 행 | 모드 | 기반 중앙값 | pooled H−W 중앙값 | 99% 구간 | A/A 행 통계 | 회귀 바닥 |',
    '| --- | --- | ---: | ---: | --- | ---: | ---: |',
  ];
  for (const row of summaries[0].rows)
    lines.push('| ' + [row.name, mode(row.mode), fmt(row.baseMedianMs), signed(row.pooledMedianMs), interval(row),
      signed(row.aaStatisticMs), fmt(row.floorMs)].join(' | ') + ' |');
  lines.push('', 'A/A의 nested-d5-f4 이후 갱신은 양수 구간을 보였습니다. 이 행도 같은 세션 A/A 중앙값을 넘어야 개선으로 인정하여 해당 비대칭 잡음을 판정에 반영했습니다.', '');
  for (let index = 1; index < phases.length; index++) {
    const phase = phases[index], code = codes[index], summary = summaries[index];
    const updates = summary.rows.filter((row) => row.mode !== 'mount' && row.improved)
      .sort((a, b) => b.pooledMedianMs - a.pooledMedianMs);
    assert(updates.length, code + ' proved update');
    const best = updates[0], regressions = summary.rows.filter((row) => row.regression);
    const verdict = summary.adopted ? '채택' : '기각';
    const manifest = read(phase + '-files.json');
    const compactBuilds = Object.fromEntries(Object.entries(summary.builds).map(([version, build]) => {
      const { sources, ...identity } = build;
      return [version, { ...identity, sourceRecords: phase + '-build-' + build.version + '.json' }];
    }));
    const supplemented = { ...summary, builds: compactBuilds,
      processes: { pairs: 126, records: phase + '-process-*.json', sequential: true, natural: true },
      name: code, mode: best.name + '/' + best.mode,
      pooledMedianMs: best.pooledMedianMs, ci99Ms: best.ci99Ms, aaStatisticMs: best.aaStatisticMs,
      baseMedianMs: best.baseMedianMs, floorMs: best.floorMs, verdict,
      bestProvedUpdateRow: { name: best.name, mode: best.mode },
      speedAndMemoryCost: costs[code], regressionRows: regressions.map((row) => ({ name: row.name, mode: row.mode })),
      patch: manifest.patch, fileManifest: phase + '-files.json',
      measuredAgainst: index === 1 ? 'HEAD' : index === 2 ? 'HEAD+C1' : 'HEAD+C1+F1' };
    jsonArtifact(phase + '-summary.json', supplemented);
    lines.push('### ' + code + ' — ' + verdict, '', costs[code], '',
      '기반: ' + supplemented.measuredAgainst + '. ' + evidence[code] +
      ' 각 후보의 check-' + code.toLowerCase() + '-green은 src/core/settle src/core/record src/core/__tests__의 기존 differential/shadow·event/lifecycle/error 경로와 새 count 테스트를 실행했습니다. 제품 테스트는 런타임 값·참조·순서·작업 수만 관측하며 제품 source text를 읽거나 파싱하지 않습니다.', '',
      '| 행 | 모드 | 기반 중앙값 | pooled H−W 중앙값 | 99% 구간 | A/A 행 통계 | 회귀 바닥 | 행 판정 |',
      '| --- | --- | ---: | ---: | --- | ---: | ---: | --- |');
    for (const row of summary.rows)
      lines.push('| ' + [row.name, mode(row.mode), fmt(row.baseMedianMs), signed(row.pooledMedianMs), interval(row),
        signed(row.aaStatisticMs), fmt(row.floorMs), row.verdict].join(' | ') + ' |');
    lines.push('', '가장 큰 입증된 갱신 이득: ' + best.name + '/' + best.mode + ' ' + signed(best.pooledMedianMs) +
      ' ' + interval(best) + '. ' + verdict + ': ' +
      (summary.adopted ? '개선 행이 있고 최소 크기를 넘은 회귀 행이 없습니다.' :
        '다음 회귀가 있어 후보 전체를 되돌렸습니다: ' +
        regressions.map((row) => row.name + '/' + row.mode + ' ' + signed(row.pooledMedianMs) + ' ' + interval(row) +
          ', |중앙값| > 바닥 ' + fmt(row.floorMs)).join('; ') + '.'), '',
      '패치: [제 ' + index + ' 후보 ' + (summary.adopted ? '채택' : '기각 실험') + ' patch](profile-109-batch/' + manifest.patch +
      '), [파일·DETAIL 줄 목록](profile-109-batch/' + phase + '-files.json), [14행 요약](profile-109-batch/' + phase + '-summary.json).');
    if (!summary.adopted)
      lines.push('복원: source·DETAIL을 측정 기반 바이트로 되돌리고 후보 테스트를 삭제했습니다. ' + phase +
        '-restore.json과 다음 기반 번들 hash가 이를 입증합니다. 기각 patch는 재현 기록이며 최종 구현에는 포함되지 않습니다.');
    lines.push('', '측정 번들 SHA256: 기반 ' + summary.builds.head.bundleSha256 +
      ', 후보 ' + summary.builds.working.bundleSha256 + '.', '');
  }
  lines.push('### 최종 검증과 범위', '',
    '- unit/render/react18: 447파일·3,263사례 통과, 2파일·4사례 실패, todo 1. 실패는 EVENT-070의 useLayoutEffect/useEffect 두 사례가 render와 react18에서 각각 발생한 허용 범위입니다. 자연 종료 ' + fmt(read('check-development.json').elapsedMs / 1000) + '초.',
    '- NODE_ENV=production: 9파일·20사례 모두 통과. tsc·ESLint·legacy isolation은 exit 0이며 격리 검사는 1,658파일을 확인했습니다.',
    '- 지정 npx 명령에는 설치 방지 --no-install, 캐시 방지 --cache false, 저장소 임시 config 번들 방지 --configLoader runner, 순차 실행 --maxWorkers=1 --no-file-parallelism만 추가했습니다. NODE_ENV=production은 package script와 같이 자식 실행에 설정했습니다. cacheDir는 설정하지 않았습니다.',
    '- 기존 루트/패키지 .vite 링크와 모든 production 번들은 지정된 /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles를 사용했습니다. 저장소에 번들·source map·cache를 쓰지 않았습니다. 설치·git 쓰기·병렬 측정·강제 종료 없이 기록된 모든 명령은 8분 미만에 자연 종료했습니다.',
    '- 정식 측정 프로세스 ' + auditResult.measurements.pairedProcesses + '개, 전체 짝 ' +
      auditResult.measurements.pooledPairs.toLocaleString('en-US') + '개. 모든 기록된 build/test/measurement 순서와 채택 patch의 기반·재생·최종 측정 소스 바이트를 감사했습니다. 가장 긴 기록 명령은 ' +
      fmt(auditResult.measurements.maxCommandMs / 1000) + '초입니다. 파일은 각각 5 MB 이하이며 [감사 기록](profile-109-batch/final-audit.json)에 담았습니다.',
    '- markCommitDeliveries·markSchemaNodeEvent·updateOutput·assembleObject는 HEAD와 바이트 동일합니다. EVENT-007/VALUE-012와 D1/E1/O1/A1 원장 질문은 변경하지 않았습니다. blueprint도 변경하지 않았으므로 추가 59-schema fixture differential의 조건이 발생하지 않았습니다.',
    '- Filid가 전체 DETAIL 복원 시 기존 acceptance heading을 이유로 거절하여 범위 한정 역편집으로 측정 기반을 정확히 복원했습니다. 새 helper의 기존 compute/utils 위치에 대한 organ 경고는 기존 디렉터리 구조에서 발생한 경고이며 구조를 바꾸지 않았습니다. 이 작업에서 남은 차단은 없습니다.', '',
    'STOP: 다섯 후보에서 계약이나 폼 간 공유 변경을 요구한 항목은 없습니다. 새로운 STOP 항목은 없습니다.', '');
  const reportPath = path.join(directory, '../remeasure-86c02.md');
  const existing = fs.readFileSync(reportPath, 'utf8');
  assert(!existing.includes('## 107라운드 갱신 손질'), 'append only once');
  const anchor = existing.trimEnd().split('\n').at(-1);
  console.log('NATIVE_APPEND ' + JSON.stringify({ file: reportPath, anchor, text: '\n' + lines.join('\n') }));
  console.log('REPORT_AND_SUMMARIES_READY');
}
const result = audit();
if (process.argv[2] === 'report') report(result);
