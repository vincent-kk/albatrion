# react-utils contract

## Requirements

- 루트 진입점(`index.ts`)은 하위 organ·fractal이 공개하는 심볼만 이름 지정으로 재수출하며, 와일드카드 재수출을 쓰지 않는다.
- 재수출 목록에 없는 하위 내부 구현은 루트를 통해 노출되지 않는다.
- 각 재수출 심볼의 런타임 동작 계약은 그 심볼을 소유한 하위 organ·fractal의 문서 또는 구현이 정본이며, 이 문서는 집계 경계만 정의한다.
- 패키지 매니페스트(`package.json`의 `exports`)는 루트와 별개로 하위 organ·fractal마다 독립 entry를 선언하고, 각 entry의 `source`는 그 대상 자신의 엔트리 포인트를 가리킨다.

## API Contracts

- 루트 배럴은 하위 organ·fractal이 공개하는 모든 심볼을 이름 지정 재수출한다 — 개별 훅·HOC·컴포넌트·판별 유틸의 시그니처와 동작 계약은 그 심볼을 소유한 하위 문서 또는 구현이 정본이다.
- 이 문서가 정의하는 것은 재수출이 이름 지정 방식이라는 것과 하위 계약을 재정의하지 않는다는 집계 규칙뿐이다.

## Acceptance Criteria

### root-barrel-named-reexport — 루트 배럴 재수출 방식 (`index.ts` 직접 확인)

- 루트 `index.ts`는 하위 organ·fractal이 공개하는 심볼만 이름 지정으로 재수출한다 — 와일드카드 재수출이 없다.
- 각 재수출은 하위 organ 또는 fractal 자신의 엔트리 포인트(배럴)를 경유하며, 내부 파일을 직접 참조하지 않는다.

### manifest-subpath-entries — 매니페스트 다중 진입점 (`package.json` 직접 확인)

- 패키지 매니페스트는 루트 진입점과 별개로 하위 organ·fractal마다 독립 entry를 선언하며, 각 entry의 source는 그 대상 자신의 엔트리 포인트를 가리킨다.

## Last Updated

2026-08-18 — 최초 계약 작성
