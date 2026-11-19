# react-utils contract

## Requirements

- 루트 진입점(`index.ts`)은 하위 organ·fractal이 공개하는 심볼만 이름 지정으로 재수출하며, 와일드카드 재수출을 쓰지 않는다.
- 재수출 목록에 없는 하위 내부 구현은 루트를 통해 노출되지 않는다.
- 각 재수출 심볼의 런타임 동작 계약은 그 심볼을 소유한 하위 organ·fractal의 문서 또는 구현이 정본이며, 이 문서는 집계 경계만 정의한다.
- 패키지 매니페스트(`package.json`의 `exports`)는 루트와 별개로 하위 organ·fractal마다 독립 entry를 선언하고, 각 entry의 `source`는 그 대상 자신의 엔트리 포인트를 가리킨다.

런타임의 JSX 변환과 훅을 제공하는 React와 React DOM 16.14 이상, 20 미만을 peer 범위로 요구한다.

ESM 그래프는 React 16.14·17의 exports map 없는 JSX 런타임도 해석합니다. 빌드 설정이 실제 peer 범위 `>=16.14 <20`을 공유 빌드에 명시적으로 전달하고, 공유 빌드는 검토한 범위만 허용합니다. ESM의 JSX import만 비공개 CommonJS 해석 브리지에 연결하며 기존 CommonJS 출력과 선언 그래프는 유지합니다. 브리지는 패키지 파일에 포함하되 새 공개 하위 경로로 노출하지 않습니다. 다른 라이브러리 워크스페이스에는 이 선택을 적용하지 않습니다.

## API Contracts

workspace의 source 조건은 개발 빌드의 입력입니다. 배포 파일에는 src가 없으므로 publishConfig.exports는 source 조건을 제외한 동일한 런타임·선언 경계를 기록합니다. 공개 진입점과 types·import·require 대상의 일치를 유지하여 개발 입력이 배포 해석을 가로채지 않게 합니다.

- 루트 배럴은 하위 organ·fractal이 공개하는 모든 심볼을 이름 지정 재수출한다 — 개별 훅·HOC·컴포넌트·판별 유틸의 시그니처와 동작 계약은 그 심볼을 소유한 하위 문서 또는 구현이 정본이다.
- 이 문서가 정의하는 것은 재수출이 이름 지정 방식이라는 것과 하위 계약을 재정의하지 않는다는 집계 규칙뿐이다.

훅과 고차 컴포넌트의 함수형 별칭은 매개변수·반환값의 표현만 담당합니다. 콜백의 최신 값 읽기·참조 안정성·정리 시점은 각 구현 소유자의 계약이며 타입 표기로 감싸개를 추가하지 않습니다.

- `useTimeout`의 마운트 표지는 React 18·19의 insertion effect에서 설정되고 언마운트에서 해제된다. 이전 peer에서는 layout effect가 이 역할을 한다. passive effect 정리는 예약 타이머를 취소하며 StrictMode 재실행과 Activity 재표시의 마운트 호출을 막지 않는다.
- `useSnapshotReference`는 마지막 커밋의 스냅샷만 외부 참조로 게시한다. `useSnapshot`과 `useRestProperties`는 현재 렌더의 후보를 반환하되, 비교 기준과 반복 입력 캐시는 커밋에서만 바뀐다. 중단한 렌더는 기준을 바꾸지 않는다. `omit`은 처음 커밋되는 비교에서 고정된다.

## Acceptance Criteria

### root-barrel-named-reexport — 루트 배럴 재수출 방식 (`index.ts` 직접 확인)

- 루트 `index.ts`는 하위 organ·fractal이 공개하는 심볼만 이름 지정으로 재수출한다 — 와일드카드 재수출이 없다.
- 각 재수출은 하위 organ 또는 fractal 자신의 엔트리 포인트(배럴)를 경유하며, 내부 파일을 직접 참조하지 않는다.

### manifest-subpath-entries — 매니페스트 다중 진입점 (`package.json` 직접 확인)

- 패키지 매니페스트는 루트 진입점과 별개로 하위 organ·fractal마다 독립 entry를 선언하며, 각 entry의 source는 그 대상 자신의 엔트리 포인트를 가리킨다.

## Last Updated

react-utils의 공개 경계·입력 해석·반환값 또는 실패 처리 계약이 바뀔 때 갱신합니다.
