# Merge contract

## Requirements

- 객체 병합은 독립 계약입니다. 부모 object 모듈은 재수출만 맡고, 공개 래퍼·기본 재귀·옵션 재귀·검증은 이 모듈이 소유합니다.
- 공개 함수는 options의 제공 여부를 최상위에서 한 번 판정합니다. 기본 재귀에는 옵션 검사나 옵션 객체 전달이 없으며, 두 재귀 구현은 각각 자기 자신을 호출합니다.
- 두 인자 호출의 기존 의미는 유지합니다. 원본 source는 바꾸지 않으며, 기본 모드는 target을 변이하고 배열을 인덱스별로 병합합니다.
- 선택 인자는 LANDING-091·SCHEMA-039의 쓰기 시 복사·배열 교체·원자 판정·한쪽 참조 이동을 지원합니다. 스키마나 React의 표식은 이 모듈이 해석하지 않습니다.

## API Contracts

- `merge(target, source, options?)`는 병합 결과를 반환합니다. options가 없으면 기존 mutable 재귀, 객체가 제공되면 옵션 재귀로 분기합니다. 공개 이름과 패키지 import 경로는 유지합니다.
- `MergeOptions.arrayStrategy`의 기본값은 인덱스별 병합이며 replace는 뒤 배열 전체를 사용합니다.
- `MergeOptions.isAtomic`에 해당하는 값은 내부를 읽지 않고 뒤 값으로 대체합니다. 원자 여부는 호출자가 정의합니다.
- `MergeOptions.preserveReferences`가 참이면 한쪽에만 있는 컨테이너 참조를 유지합니다.
- `MergeOptions.immutable`이 참이면 겹치는 컨테이너를 새로 만들고 입력 객체를 변이하지 않습니다. 두 plain object가 같은 키에 겹칠 때만 재귀 병합합니다.
- 뒤의 undefined는 정의된 앞 값을 지우지 않습니다. 기본 모드는 기존 __proto__ 제외를 유지하고, 옵션 모드는 부모의 안전한 own 데이터 속성 프리미티브로 예약 키를 처리합니다.
- 기본 모드의 임시 공간은 재귀 깊이에 비례합니다. immutable 모드는 복사한 컨테이너의 공간이 추가됩니다. 어느 모드도 순환 입력에 대한 새 지원을 추가하지 않습니다.

## Acceptance Criteria

### default-compatibility — 기존 두 인자 의미

- 기존 merge 회귀 시험의 단언을 수정하지 않고 모듈 안으로 옮겨 전후 통과를 확인합니다.
- 대상 동일성·source 불변·배열 인덱스 병합·undefined·예약 키 처리 의미를 유지합니다.

### explicit-policies — 선택한 병합 정책

- 원자 값 내부를 읽지 않고, immutable 입력을 변이하지 않으며, 한쪽 값과 교체 배열의 참조를 보존합니다.
- 이미 추가한 옵션 시험의 단언을 수정하지 않고 전후 통과를 확인합니다.

### module-boundary — 단일 분기와 재귀 소유

- 루트의 옛 flat 구현 파일은 없고 부모 재수출은 이 모듈의 진입점을 가리킵니다.
- 공개 래퍼는 두 구현의 선택과 호출만 합니다. 기본 재귀와 옵션 재귀는 wrapper를 가져오거나 호출하지 않습니다.
- 형제 fractal은 해당 진입점으로 가져오고, 부모의 안전한 속성 프리미티브는 부모 내부 파일을 직접 참조하여 재수출 순환을 피합니다.
- 패키지 지정 lint·typecheck·test·build와 변경에 맞는 성능 비교로 이전 검증 증거를 갱신합니다.

## Last Updated

2026-09-27
