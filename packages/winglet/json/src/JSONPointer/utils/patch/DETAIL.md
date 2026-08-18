# patch contract

## Requirements

- entry point는 RFC 6902 적용(`applyPatch`)·생성(`compare`)과 RFC 7396 적용(`mergePatch`)·생성(`difference`) 자식 fractal 넷의 공개 함수를 감싸거나 이름을 바꾸지 않고 재수출한다.
- `compare`가 생성한 패치를 `applyPatch`에 적용하면 원본이 target과 동일한 구조로 재구성된다 — 배열 원소가 여러 개 줄거나 늘거나 치환되는 경우를 포함한다.
- `difference`가 생성한 병합 패치를 `mergePatch`에 적용해도 target이 동일하게 재구성된다 — 병합 대상 값이 객체가 아닌 경우(원시값·배열·`null`)도 포함한다.
- 연산 이름과 패치 형태 타입은 형제 fractal `patchModel`의 정의를 그대로 재수출하며, 이 fractal은 그 어휘를 재정의하지 않는다.

## API Contracts

- entry point(`index.ts`)는 RFC 6902 쌍(`applyPatch`,`compare`)과 RFC 7396 쌍(`difference`,`mergePatch`)의 공개 함수·옵션 타입을 원래 이름으로 재수출하고, `patchModel`의 `Operation` 상수와 `Patch` 계열 타입도 동일 이름으로 재수출한다. 값이나 타입을 감싸는 래퍼는 없다 — 재수출은 항등이다.

## Acceptance Criteria

### round-trip-inverses — 생성-적용 쌍의 상호 역연산 (patch 소유 통합 테스트)

- 배열 원소가 여러 개 삭제되거나 증가·치환되는 경우에도 `compare`로 생성한 패치를 `applyPatch`에 적용하면 target과 동일한 구조로 재구성된다.
- 중첩 객체 안의 배열이 축소되는 경우도 동일하게 재구성된다.
- `difference`로 생성한 병합 패치를 `mergePatch`에 적용하면 target이 재구성되며, 이는 병합 대상이 객체가 아닌 원시값·배열·`null`인 경우도 포함한다.
- 각 함수의 단위 테스트만으로는 이 결합 계약이 검증되지 않는다 — 배열이 여러 원소만큼 줄어들 때의 재구성 결함이 단위 테스트를 모두 통과한 채 남아있었던 사례가 이 통합 테스트 도입의 근거다.

## Last Updated

2026-08-18 — 최초 계약 작성
