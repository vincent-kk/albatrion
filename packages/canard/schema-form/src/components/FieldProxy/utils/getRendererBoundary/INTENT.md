# getRendererBoundary

## Purpose

필드 렌더러와 오류 포맷터의 실패를 그 필드에 가두는 오류 경계와, 선택된 렌더러마다 공유하는 경계 타입을 소유합니다. 실패한 경계는 포맷터나 부품 렌더러가 바뀔 때 다시 시도합니다.

## Conventions

- 공용 `ErrorBoundary`(`@winglet/react-utils/hoc`)를 상속하며, 오류 상태와 fallback은 상속한 구현을 따릅니다.
- 경계 타입은 `getRendererBoundary`로만 얻습니다. 렌더러 identity를 키로 하는 약한 캐시가 타입을 보유합니다.
- 복구 판정은 `formatError`, `LabelRenderer`, `ErrorMessageRenderer`, `InputRenderer` 네 참조만 비교합니다.

## Boundaries

### Always do

- 실패 상태에서만 참조 변경을 감지해 복구하고, 정상 경계의 상태는 바꾸지 않습니다.
- 같은 렌더러에는 같은 경계 타입을 돌려주어, 호출하는 쪽이 경계 타입을 다시 얻어도 정상 경계가 재마운트되지 않게 합니다.

### Ask first

- 복구 판정에 prop을 더하거나 빼는 경우
- 캐시 키를 렌더러 identity가 아닌 값으로 바꾸는 경우

### Never do

- 경계에 memo 래퍼를 더하는 것
- 캐시를 강한 참조로 바꾸어 버려진 렌더러의 타입을 붙잡는 것
- 이 fractal 바깥에서 `components/`의 경계 클래스를 직접 import
