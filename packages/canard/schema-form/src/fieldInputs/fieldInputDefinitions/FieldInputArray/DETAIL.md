# FieldInputArray 계약

## Requirements

- 부모 `fieldInputs`의 기본 입력 계약 중 배열 입력 몫을 구현합니다(86C-02 iv, 87라운드 원칙 3, F-D′, 304라운드 권고 2).

## API Contracts

- `FieldInputArray.tsx`는 값 전달과 목록 표시를 별도 memo 경계로 나눕니다. 목록은 `components/ArrayItems.tsx`이며 node·자식 컴포넌트 배열 identity·자식 수(`childCount`)·readOnly·disabled·jsonSchema·style이 같으면 값만 바뀐 부모 렌더에서 행과 버튼을 재생성하지 않습니다. 구조·제어·스키마·스타일 변경과 각 자식의 독립 구독은 반영합니다. 잎 갱신의 목록 작업은 O(N)에서 O(1) 속성 비교로 줄고 배열 입력당 React memo fiber와 직전 속성 객체를 보유합니다(86C-02 iv).
- 행은 한 번의 인덱스 `for`에서 JSX 목록으로 만듭니다. key·순서·memo 경계·삭제 인덱스를 유지하고 값만 바뀔 때 목록을 재생성하지 않습니다. 시간 O(행 수), 결과 메모리 O(행 수)는 같으며 map callback 호출 비용만 제거합니다(87라운드 원칙 3).
- `components/Button.tsx`는 내부 memo 경계이며 삭제 버튼은 현재 인덱스와 배열 전체가 공유하는 안정된 클릭 처리기를 받습니다. 인덱스는 memo 비교에서 이동한 행을 갱신하고, 처리기는 클릭한 버튼의 부모 행이 목록의 직접 자식 중 몇 번째인지 읽어 현재 항목을 삭제합니다. 행은 배열 순서대로 직접 자식이며 추가 버튼의 label은 행 다음에 있으므로 기존 DOM에 인덱스 속성을 더하지 않습니다. 행별 감싸개 컴포넌트·hook·클로저를 만들지 않습니다. push는 기존 삭제 버튼과 추가 버튼의 본문을 실행하지 않고 새 삭제 버튼만 한 번 실행합니다. DOM·문구·순서·disabled·readOnly·maxItems 동작과 공개 표면을 유지합니다. 목록 생성과 속성 비교, 삭제 클릭의 위치 조회는 O(N)입니다(F-D′).
- 유효 스키마의 `minItems`(`maxItems`가 더 작으면 그 값)에서 현재 항목 수를 뺀 만큼 빈 슬롯(`components/EmptySlot.tsx`)을 UI로만 그리고 값은 쓰지 않습니다. 슬롯은 노드가 아니어서 `data-path`가 없습니다. 자리의 스키마(`prefixItems`의 그 자리, 없으면 `items`)가 문자열·수·정수·불리언이면 그 종류의 기본 입력을, 그 밖이면 채움 버튼을 그립니다(`utils/readSlotKind.ts`). 사용자가 슬롯에 입력하거나 채움 버튼을 누를 때 그 자리까지의 배열을 통째로 한 번 씁니다(`utils/fillArraySlot.ts`). 앞쪽 빈 자리는 `undefined`이고 기존 항목은 위치로 이어집니다. 그 뒤 새 행의 첫 입력으로 초점을 옮깁니다. 게이트로 유효 스키마가 바뀌면 슬롯 수도 따라가며, readOnly·disabled에서는 슬롯을 그리되 쓰지 않습니다(304라운드 권고 2, 정돈-S).
- `components/`의 `ArrayItems`·`Button`·`EmptySlot`과 `utils/`의 두 함수는 이 fractal 안에서만 쓰입니다.

## Acceptance Criteria

### array-memo — 목록 memo 경계

- 값만 바뀐 부모 렌더에서 행과 버튼을 재생성하지 않고, 구조·제어 변경은 반영합니다(`__tests__/array-memo.test.tsx`).
- 100개 항목의 push는 Button 본문을 한 번만 실행하며 기존 삭제 버튼을 다시 렌더하지 않습니다. 가운데 항목 삭제 후 이동한 인덱스에서 다시 삭제해도 올바른 값이 제거됩니다. 삭제 버튼의 클릭 처리기 identity는 행 전체와 push 전후에 동일합니다(F-D′, `__tests__/array-button-memo.test.tsx`).

### array-min-slots — 값 없는 빈 슬롯

- `minItems: 3`인 빈 배열은 값 없는 빈 입력 셋을 그리고 `value`는 그대로입니다. 첫 슬롯에 입력하면 그때 길이 1의 배열이 쓰이고, 게이트로 `minItems`가 바뀌면 슬롯 수가 따라갑니다(정돈-S, `__tests__/array-min-slots.test.tsx`).

## Last Updated

2026-10-14 — 소유자 구조 리뷰 넷째 손질(기본 입력을 입력마다 fractal로 분리).
