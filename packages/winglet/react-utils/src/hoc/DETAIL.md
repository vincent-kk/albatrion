# hoc contract

## Requirements

- 이 진입점은 하위 fractal이 공개하는 심볼만 이름 지정으로 재수출하며, 와일드카드 재수출을 쓰지 않는다.
- 재수출 목록에 없는 하위 fractal의 내부 구현(그 fractal 자신의 organ 등)은 이 진입점을 통해 노출되지 않는다.
- 각 심볼의 런타임 동작 계약은 그 심볼을 소유한 하위 fractal의 DETAIL이 정본이며, 이 문서에서 재정의하지 않는다.

## API Contracts

- 이 진입점은 오류 경계 HOC 쌍(일반형·forwardRef형)과 파일 업로드 HOC를 각각의 하위 fractal로부터 이름 지정 재수출한다.
- 재수출된 각 HOC의 시그니처와 동작(오류 격리 방식, 업로드 트리거 방식 등)은 이 문서가 아니라 그 HOC를 소유한 하위 fractal의 DETAIL이 정본이다.

## Acceptance Criteria

### barrel-named-reexport — 재수출 표면 구성 (`index.ts` 직접 확인)

- 이 진입점은 오류 경계 HOC 쌍과 업로드 HOC, 총 세 심볼만 이름 지정으로 재수출한다 — 와일드카드 재수출이 없다.
- 재수출되는 각 심볼은 그것을 소유한 하위 fractal 자신의 엔트리 포인트를 경유하며, 그 fractal 내부 파일을 직접 참조하지 않는다.

## Last Updated

2026-08-18 — 최초 계약 작성
