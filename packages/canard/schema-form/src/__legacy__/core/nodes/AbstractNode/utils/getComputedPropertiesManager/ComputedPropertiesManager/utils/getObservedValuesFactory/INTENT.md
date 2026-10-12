# getObservedValuesFactory — watch 값의 순서 보존

## Purpose

`computed.watch` 또는 `&watch`가 요청한 값들을 의존성 배열에서 작성 순서대로 읽는 함수를 만듭니다. 경로의 실제 노드 조회나 의존성 값 갱신은 맡지 않습니다.

## Conventions

- 단일 문자열과 배열을 같은 순서 있는 watch 목록으로 처리합니다. 결과 배열은 중복 경로를 포함해 작성 순서를 유지합니다.
- 각 경로를 등록한 뒤 `PathManager.findIndex()`로 인덱스를 얻습니다. 다른 계산식이 먼저 등록한 경로도 같은 의존성 슬롯을 읽어야 합니다.
- 인덱스가 하나도 없으면 함수를 만들지 않고, 함수 생성 실패는 `OBSERVED_VALUES` 오류로 전달합니다.

## Boundaries

### Always do

- 사용할 인덱스가 없으면 `undefined`를 반환합니다.
- 경로 등록은 `PathManager.set()`을 통해 수행합니다.

### Ask first

- 단일 문자열 watch의 배열 정규화 방식 변경

### Never do

- watch 경로를 `pathManager` 없이 직접 인덱스로 변환하지 않습니다.
- 결과 배열의 순서를 watch 입력 순서와 다르게 반환하지 않습니다.
