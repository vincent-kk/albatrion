# console contract

## Requirements

- `printError(title, message, options?)`는 `console.error`를, `printWarning(title, message, options?)`는 `console.warn`을 항상 정확히 1회 호출한다.
- 두 함수 모두 `%c` 서식 문자열에 제목 줄과 메시지 줄마다 대응하는 색상 인자를 순서대로 전달한다.
- `options.details`가 `undefined`가 아니면 마지막 인자로 그대로 전달되고, `undefined`면 인자 목록에서 생략된다.

## API Contracts

- `printError(title, message, options?)` → 기본 제목색 `#ff0000`, 기본 본문색 `#ff6b6b`, 기본 이모지 `⚠️`.
- `printWarning(title, message, options?)` → 기본 제목색 `#f59e0b`, 기본 본문색 `#d97706`, 기본 이모지 `⚠️`.
- `PrintConsoleOptions`(`type.ts`)는 `info`/`emoji`/`titleColor`/`messageColor`/`details`를 모두 선택 필드로 정의하며 두 함수가 공유한다.
- 인자 순서는 고정이다: 서식 문자열 → `info` 색상 → 제목 색상 → 메시지 줄 수만큼의 본문 색상 → (있다면) `details`.

## Acceptance Criteria

### default-styling — 기본 스타일 출력

- 옵션 없이 호출하면 각 함수 고유의 기본 이모지·제목색·본문색으로 `console.error`/`console.warn`을 1회 호출한다.
- 서식 문자열에 제목과 모든 메시지 줄이 포함된다.
- 빈 메시지 배열로 호출해도 예외 없이 제목만 담아 호출한다.

### custom-options — 사용자 옵션 반영

- `info`/`emoji`/`titleColor`/`messageColor`를 지정하면 기본값 대신 그 값이 서식 문자열과 색상 인자에 반영된다.
- `details`를 지정하면 인자 목록의 마지막 자리에 그 값이 그대로 전달되고, 지정하지 않으면 인자 목록에 추가되지 않는다.

## Boundary Exemptions

### `*.ts` — 공개 프린터 함수 flat 형제 유지 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: `printError`/`printWarning` 둘 다 fractal 이름과 같은 이름의 파일이 없는 대칭적인 공개 함수라 root flat이 정본 형태다. 공유 타입(`type.ts`)만 별도 파일이고, organ 재배치는 두 함수뿐인 배럴에 깊이만 더한다.

## Last Updated

2026-08-18 — 최초 계약 작성
