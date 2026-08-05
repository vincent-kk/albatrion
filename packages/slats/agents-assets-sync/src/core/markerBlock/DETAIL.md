# markerBlock Specification

## Requirements

- 이 fractal 은 문자열만 변환한다. 파일시스템을 읽거나 쓰지 않는다.
- 규칙 파일 하나가 블록 하나가 된다. 그래야 블록 본문의 해시가 그 파일의
  매니페스트 해시와 직접 비교되고, copy/skip/diverged 판정이 파일 복사
  경로와 완전히 같아진다.
- marker 모양은
  `<!-- AGENTS-ASSETS-SYNC:START:<packageName>:<relPath> -->` 이며, 같은
  문서가 이미 지닌 `FILID:` / `SEIRI:` 관례를 따른다. 여러 도구가 한 문서에
  덧붙여도 충돌하지 않는다.
- 자기 블록 바깥의 모든 바이트는 그대로 통과시킨다. 다른 도구의 블록과
  손으로 쓴 산문은 다른 소유자의 내용이다.
- `upsertBlock` 은 기존 블록을 제자리에서 교체한다. 같은 id 의 블록을 하나 더
  덧붙이면 문서가 스스로 모순되므로 하지 않는다.
- 블록이 없으면 문서 끝에 덧붙인다. 문서가 개행으로 끝나지 않으면 개행 하나를
  먼저 넣어 시작 marker 가 자기 줄에서 시작하게 한다.
- 본문이 개행으로 끝나지 않으면 개행 하나를 붙여 쓴다. 그래서 되읽은 본문은
  소스가 갖지 않은 바이트 하나를 가질 수 있다.
- `blockBodyMatches` 는 그 개행 하나를 감안해 두 가지 읽기를 모두 시험한다.
  이것이 블록 판정을 파일 해시 비교와 동일하게 유지한다.
- 블록 탐색은 캡처된 id 를 비교해서 한다. id 로 정규식을 만들지 않는다 —
  패키지 이름은 정규식 메타문자를 담는다.
- `createBlockPattern` 은 호출마다 새 정규식을 돌려준다. 전역 정규식은
  `lastIndex` 를 이월하므로 공유하면 일치를 건너뛴다.
- `parseBlocks` 는 이 도구가 쓴 블록만, 문서 순서대로 읽는다.

## API Contracts

- `formatBlockId(packageName: string, relPath: string): string` — `<packageName>:<relPath>`
- `parseBlocks(content: string): ParsedBlock[]` — 없으면 빈 배열
- `findBlockBody(content: string, blockId: string): string | null`
- `upsertBlock(content: string, blockId: string, body: string): string`
- `removeBlock(content: string, blockId: string): string` — 해당 블록이 없으면 원본 그대로
- `blockBodyMatches(body: string, expected: Sha256Hex): boolean`
- `MARKER_PREFIX = 'AGENTS-ASSETS-SYNC'`
- `startMarker(blockId: string): string` / `endMarker(blockId: string): string`
- `createBlockPattern(): RegExp` — 캡처 `1` = blockId, `2` = body

## Exported Types

- `ParsedBlock` — `{ blockId, packageName, relPath, body }`

## Acceptance Criteria

### AC-MB-UPSERT — 쓰기는 제자리 교체이고 멱등하다

- 빈 문서에 upsert 하면 블록 하나가 덧붙는다.
- 같은 내용으로 두 번째 upsert 를 해도 문서는 달라지지 않는다.
- 기존 블록에 대한 upsert 는 덧붙이지 않고 제자리에서 교체한다.
- 개행으로 끝나지 않는 본문도 왕복 후 본래 내용으로 되읽힌다.
- Verified by `tests/core/markerBlock.test.ts`.

### AC-MB-FOREIGN — 남의 내용은 건드리지 않는다

- 자기 블록 주위의 외부 블록과 자유 산문은 보존된다.
- `parseBlocks` 는 이 도구의 블록만 읽고, packageName 과 relPath 로 분해한다.
- 한 문서 안의 두 블록은 서로 독립적으로 유지된다.
- 해당 블록이 없는 문서에 `removeBlock` 을 걸면 문서는 변하지 않는다.
- Verified by `tests/core/markerBlock.test.ts`.

### AC-MB-VERDICT — 블록 판정은 파일 판정과 같다

- 매니페스트와 일치하는 본문은 `blockBodyMatches` 가 받아들이고, 변경된
  본문은 거부한다.
- `upsertBlock` 이 붙인 후행 개행 하나는 불일치로 취급되지 않는다.
- Verified by `tests/core/markerBlock.test.ts`.

## Last Updated

2026-08-06 — 구현에서 계약을 추출해 최초 작성.
