# console — 콘솔 출력 유틸리티

## Purpose

브라우저 콘솔에 스타일 적용된 오류·경고 메시지를 출력하는 두 프린터 함수 `printError`/`printWarning`을 소유한다. 둘 다 `%c` 서식 문자열과 색상 인자를 짝지어 제목·본문·선택적 상세 데이터를 같은 레이아웃으로 렌더링한다.

## Conventions

- 두 함수는 `type.ts`가 정의하는 동일한 `PrintConsoleOptions` 형태(정보/이모지/제목색/본문색/상세)를 공유하고 기본 색상만 다르다(`printError`는 빨강 계열, `printWarning`은 호박색 계열).
- `details`가 `undefined`일 때만 마지막 인자를 생략한다 — `null` 등 다른 값은 그대로 전달된다.

## Boundaries

### Always do

- `printError`/`printWarning`과 `console.error`/`console.warn`의 대응을 유지한다
- 옵션을 추가하면 `PrintConsoleOptions`를 갱신하고 두 함수 모두에 대칭으로 반영한다

### Ask first

- 기본 색상·이모지 값 변경 — 기존 소비자의 콘솔 출력 모양이 달라진다
- `%c` 서식 인자 순서 변경 — 소비자가 mock으로 인자 위치를 검증하는 테스트를 가지고 있다

### Never do

- 두 함수의 옵션 형태를 서로 다르게 분기
- `details`가 `undefined`인데도 마지막 인자로 밀어 넣는 경로 추가
