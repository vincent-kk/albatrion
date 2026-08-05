# hash Specification

## Requirements

- 다이제스트는 SHA-256 이고 출력은 소문자 hex 다. `dist/agents-hashes.json`
  (schema v1) 이 기록하는 형식과 같아야 매니페스트 해시와 직접 비교된다.
- `hashContent` 는 `Buffer` 와 `string` 을 모두 받는다. 파일 복사 경로는
  바이트를, marker block 경로는 문자열 본문을 넘긴다.
- `hashFile` 은 파일이 없으면(`ENOENT`) 던지지 않고 `null` 을 답한다. 이
  soft miss 가 `buildPlan` 에서 "아직 설치되지 않음 → copy" 판정의 근거다.
- `ENOENT` 이외의 오류는 삼키지 않고 그대로 전파한다.
- `hashEquals` 는 어느 한쪽이라도 `null` 이면 `false` 다. 없는 파일은 어떤
  것과도 같지 않다.
- 비교는 대소문자를 구분하지 않되 길이가 다르면 즉시 `false` 다.
- 모듈 레벨 상태를 두지 않는다. 캐시나 메모이제이션은 호출자의 생명주기에
  속하므로 여기에 없다.
- `core/` 안의 최심 리프다. 형제 fractal 에서 import 하지 않는다.

## API Contracts

- `hashContent(buffer: Buffer | string): Sha256Hex`
- `hashFile(absPath: string): Promise<Sha256Hex | null>`
  - `ENOENT` 에서만 `null`; 다른 오류는 throw
- `hashEquals(a: Sha256Hex | null, b: Sha256Hex | null): boolean`

## Exported Types

- `Sha256Hex = string`

## Acceptance Criteria

### AC-HASH-VERDICT — 해시 비교가 설치 판정을 결정한다

- 설치본이 없을 때 `hashFile` 이 `null` 을 답하면 계획은 `copy` 가 된다.
- 설치본 해시가 매니페스트 해시와 같으면 계획은 `skip-uptodate` 가 된다.
- 두 해시가 다르면 계획은 `warn-diverged` 가 되고 force 를 요구한다.
- Verified by `tests/core/buildPlan.test.ts`.

### AC-HASH-BLOCK — 블록 본문도 파일과 같은 잣대로 비교된다

- 매니페스트 해시와 일치하는 블록 본문은 일치로 판정된다.
- 손으로 수정된 블록 본문은 불일치로 판정된다.
- Verified by `tests/core/markerBlock.test.ts` (`blockBodyMatches`).

## Last Updated

2026-08-06 — 구현에서 계약을 추출해 최초 작성. 이 fractal 은 전용 테스트
파일을 갖지 않으며, 위 두 그룹은 호출자 테스트를 통해 검증된다.
