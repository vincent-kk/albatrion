// CLI report generator: stdout is a native apply_patch input; source and measurement files are read-only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const report = path.resolve(directory, '../remeasure-86c02.md');
const read = name => JSON.parse(fs.readFileSync(path.join(directory, name + '.json'), 'utf8'));
const phases = ['AA', '1-build-own', '2-child-input-literal', '3-path-strings', '4-template-key'];
const summaries = phases.map(phase => read(phase + '-summary'));
const audit = read('audit');
const labels = { mount: '마운트', first: '첫 갱신', later: '후속 갱신' };
const fmt = value => value.toFixed(6);
const table = rows => [
  '| fixture / 작업 | pooled 짝 차이 중앙값 ms | 99% 구간 ms | A/A 통계 ms | 기준 pooled 중앙값 ms | 0.5% 바닥 ms | 판정 |',
  '| --- | ---: | --- | ---: | ---: | ---: | --- |',
  ...rows.map(row => `| ${row.name} ${labels[row.mode]} | ${fmt(row.pooledMedianMs)} | [${row.ci99Ms.map(fmt).join(', ')}] | ${fmt(row.aaStatisticMs)} | ${fmt(row.baseMedianMs)} | ${fmt(row.floorMs)} | ${row.verdict} |`),
].join('\n');
const notes = {
  '1-build-own': '단일 연언 선언의 두 소속 배열을 각각 native slice로 생산했습니다. 원래 수집 배열과도 공유하지 않았고 validationOnly 복제 경로·재귀·ID·정적 병합·Map 등록 순서는 유지했습니다. 계수는 slice 0→2, membership push 2→0입니다. 속도 비용은 고정 자격 검사와 native 복사 두 번이고 메모리 비용은 기존 두 소유 배열로 같습니다. flat·sample-0 회귀로 소스·시험·DETAIL을 모두 원복했습니다.',
  '2-child-input-literal': '무게이트 빠른 경로의 base spread만 같은 9개 필드 순서의 literal로 바꿨습니다. 실제 자식 build·binding을 유지했고 자식 두 개의 base spread 계수는 2→0입니다. 속도 비용은 고정 필드 직접 읽기·쓰기이며 범용 키 복사를 제거합니다. 메모리 비용은 기존 부모별 base·자식별 입력·소유 배열·공개 경로로 같고 새 보유 자료가 없습니다. oneOf-40 첫 갱신의 음수 구간은 중앙값 절댓값이 최소 회귀 크기 아래여서 회귀가 아닙니다.',
  '3-path-strings': '이름의 escapeSegment 결과를 schemaPath와 data path에 재사용했습니다. 일반 집계에서도 기존 properties Map의 값에 escapedName·path·inputs를 고정 필드 순서로 두어 같은 이름의 반복 기여와 뒤 build 순회에서 재 escaping하지 않습니다. 두 이름의 escaping 계수는 빠른 경로 4→2, 일반 경로 5→2입니다. 속도 비용은 이름당 native escaping 한 번이며, 메모리 비용은 빠른 경로의 지역 문자열 참조와 일반 경로의 이름별 일시 기록 하나입니다. 공개 두 경로·키 바이트·기여/게이트 순서와 소유 배열·동결은 유지합니다. 새 보유 캐시·공개 필드는 없습니다.',
  '4-template-key': 'encodeLeaf의 quote/backslash scan만 native String.replace로 치환했습니다. 제어 문자·quote/backslash·단독 surrogate를 포함한 실제 key/boundKey 바이트 비교가 같고 gate/owner 중복 순서는 그대로입니다. JS charCodeAt scan 계수는 88→0입니다. 속도 비용은 O(문자열 길이) native scan이며 일시 정규식 객체와 결과 문자열을 생산합니다. 새 결과 메모나 폼 간 공유는 없습니다. 마운트 네 행의 회귀로 소스·시험·DETAIL을 모두 원복했습니다.',
};
let body = `\n## 107라운드 청사진 손질\n\n` +
  '기준 HEAD는 `9d1ea600a1916e66b0389318d81e1c3ee23ad0d3`입니다. 동일 세션에서 A/A 90개 worker를 먼저 실행한 뒤 네 변경을 지정 순서로 각 90개 worker에서 측정했습니다. 기준은 그때까지 채택된 변경만 포함하며 최종 채택은 ②·③입니다. 정착 설계·공개 계약·폼 간 결과 공유 변경은 없고 STOP 항목도 없습니다.\n\n' +
  '정본은 `profile-104-owned/measure.mjs`의 production 판정 열입니다. fresh process, 표본마다 H/W 순서 교대와 회차별 시작 순서 반전, 시계 밖 강제 GC, 각 판 예열 20·표본 101, validation OFF·외부 구독자 0·onChange noop, 64 microtask checkpoint와 같은 큐 sentinel을 유지했습니다. 행마다 9회 909개 H−W 짝 차이를 pool하고 seed 101·1999회 bootstrap의 정본 99% 끝점(9/1989)을 사용했습니다. 양수는 후보가 빠른 것입니다. 회차 중앙값의 중앙값은 사용하지 않습니다.\n\n' +
  '105C-01과 최소 크기 부록을 적용했습니다. 일부 행의 99% 하한이 0보다 크고 pooled 중앙값이 같은 행 A/A 중앙값보다 크면 개선입니다. 회귀는 99% 상한이 0 아래이고 |pooled 중앙값|이 max(|A/A 중앙값|, 현재 기준 pooled 중앙값×0.005)를 넘을 때만 인정합니다. 개선 행이 있고 회귀 행이 없을 때 채택했습니다.\n\n' +
  '### A/A — HEAD 대 HEAD\n\n' + table(summaries[0].rows) + '\n';
for (const summary of summaries.slice(1)) {
  body += `\n### ${summary.phase} — ${summary.adopted ? '채택' : '기각'}\n\n${notes[summary.phase]}\n\n${table(summary.rows)}\n`;
  if (summary.adopted) {
    const manifest = read(summary.phase + '-files');
    body += `\n개별 패치: \`profile-107-batch/${manifest.patch}\` (측정 기반 대비). 파일 목록은 다음과 같습니다.\n\n`;
    for (const file of manifest.files) body += `- \`${file.file}\`${file.detailAddedLines ? ` — patch의 DETAIL ${file.detailAddedLines.join(', ')}행; 최종 DETAIL ${file.finalDetailAddedLines.join(', ')}행` : ''}\n`;
  }
}
body += '\n### 차등·소유·동결·계수 검증\n\n' +
  '네 변경마다 기존 59-schema fixture를 collect 끔/켬으로 development와 production에서 모두 비교했습니다. owned-inline policy/counts와 path-key-once도 각 변경 뒤 두 모드에서 통과했습니다. 새 계수 시험은 변경 전 제거 대상 작업으로 실패했고 변경 뒤 통과했습니다. 기존 fixture·assertion·snapshot은 수정하지 않았습니다. 기각된 ①·④의 시험도 제품 트리에서 제거했습니다.\n\n' +
  '운영 프로젝트의 첫 실행은 새 literal 계수 시험의 node:fs가 브라우저 변환으로 externalize되어 실패했습니다. 시험의 소스 읽기를 Vite raw import로 바꾸고 수정된 시험도 literal을 잠시 되돌렸을 때 base spread 2회로 실패함을 다시 확인했습니다. 로딩 수정은 측정된 제품 소스·타이밍 번들을 바꾸지 않았으며 수정 후 관련 unit 18개 시험과 운영 프로젝트 19개 시험이 통과했습니다. 전체 unit/render/react18 실행은 이 로딩 수정 전에 수행했지만, 제품 바이트와 다른 시험은 그대로이고 바뀐 시험 범위는 수정 후 다시 검증했습니다.\n\n' +
  '### 최종 지정 명령 결과\n\n| 명령 (PKG에서 실행) | 결과 | 실제 명령 ms |\n| --- | --- | ---: |\n';
const commands = {
  development: '`npx vitest run --project unit --project render --project react18 --reporter=dot`',
  production: '`NODE_ENV=production npx vitest run --project production --reporter=dot`',
  typecheck: '`npx tsc --noEmit --composite false --rootDir . -p tsconfig.json`',
  lint: '`npx eslint "src/**/*.{ts,tsx}"`',
  legacy: '`node architecture/verification/07-switch/tools/check-legacy-isolation.mjs`',
};
for (const [name, command] of Object.entries(commands)) {
  const record = read('check-' + name);
  const detail = name === 'development' ? 'exit 1; 3250 통과·todo 1·허용된 EVENT-070 4건만 실패(render/React18 각 useLayoutEffect·useEffect)' :
    name === 'production' ? 'exit 0; 8파일·19시험 통과' : name === 'legacy' ? 'exit 0; LEGACY_ISOLATED, 1651파일' : 'exit 0';
  body += `| ${command} | ${detail} | ${record.elapsedMs} |\n`;
}
body += '\nVitest는 설치 방지 `--no-install`·offline env와 `--configLoader runner --cache false --maxWorkers=1 --no-file-parallelism`을 추가했습니다. NODE_ENV=production은 운영 명령 자식 환경에 명시했습니다. 기존 두 `.vite` 링크가 지정 외부 bundles로 향하며 cacheDir는 설정하지 않았습니다.\n\n' +
  `실행 감사: timer worker ${audit.timerWorkers}개·${audit.pairedSamples}쌍, build worker ${audit.buildWorkers}개, 행 명령 ${audit.rowCommands}개가 순차 자연 종료했습니다. worker 최대 ${audit.maximumWorkerMs} ms, 행 명령 최대 ${audit.maximumRowMs} ms이며 전체 지정 검증의 최대 명령은 ${read('check-development').elapsedMs} ms로 480,000 ms 미만입니다. clock 안 GC는 ${audit.gc.totalInside}회(major ${audit.gc.majorInside}회)입니다. 소스·번들 해시가 측정 기준의 누적 연결 및 최종 제품 바이트와 같고 개별 패치를 메모리에서 순서대로 적용한 결과도 최종 파일과 같습니다.\n\n` +
  '번들·source map·optimizer cache는 지정된 저장소 밖 bundles 경로에만 있습니다. 이 폴더의 모든 산출물은 파일당 5 MB 이하입니다. git 쓰기·설치·버전 변경은 없고 HEAD는 그대로입니다. 개별 채택 패치에는 해당 소스·독립 계수 시험·DETAIL만 포함하며 측정 도구·raw JSON·종합 보고서·작업 계획은 포함하지 않습니다. 재현은 `node profile-107-batch/measure.mjs build <phase> <head|control|working>`, `row <phase> <fixture> <mount|first|later>` 순서이며 기준 번들은 각 변경 전 소스로 생성해야 합니다. 통계·명령·패치 감사는 이 폴더의 `*-summary.json`, `audit.json`, `check-*.json`·`.txt`, `*-files.json`과 개별 worker/driver JSON에 있습니다.\n';
assert(Buffer.byteLength(body) <= 5_000_000);
const existing = fs.readFileSync(report, 'utf8');
assert(!existing.includes('## 107라운드 청사진 손질'));
const anchor = existing.trimEnd().split('\n').at(-1);
console.log(`*** Begin Patch\n*** Update File: ${report}\n@@\n ${anchor}\n${body.trimEnd().split('\n').map(line => '+' + line).join('\n')}\n*** End Patch`);
