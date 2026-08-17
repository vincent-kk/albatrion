# patchModel

## Purpose

RFC 6902 JSON Patch 문서의 어휘 — 연산 이름(`Operation`)과 패치 형태(`Patch` 계열) — 를 소유한다. 값을 계산하지도 문서를 변형하지도 않는다.

`patch`와 그 자식 fractal(`applyPatch`, `compare`, `difference`, `mergePatch`)이 공유하는 어휘라서 `patch` 안이 아니라 형제로 있다. `patch` 안에 두면 `patch/index.ts`가 자식을 재export하고 자식이 다시 `patch`를 참조해 의존 순환이 닫힌다.

## Conventions

- 연산 이름은 `enum`이 아니라 `as const` 객체 — `isolatedModules` 소거 후에도 런타임 비교가 가능해야 한다.
- 파생 타입은 원천과 같은 파일에 둔다 (`Operation` 타입은 `constant.ts`).
- 값을 담는 패치의 `value`는 `any` — 패치 문서는 파싱된 JSON으로 들어오고 값 타입은 포인터를 대상 문서에 적용하기 전까지 알 수 없다.

## Boundaries

### Always do

- 새 연산이나 패치 형태를 추가할 때 `index.ts`에 이름으로 재export
- RFC 6902에 정의된 어휘만 반영

### Ask first

- `Patch` 유니온 멤버 추가·제거 (`@winglet/json` 공개 표면 변경)
- `value`를 `any`보다 좁히는 제네릭 도입

### Never do

- 패치를 적용·비교·생성하는 로직을 여기에 두기 — 이 fractal은 어휘만 소유한다
- `patch`나 그 자식 fractal을 import — 의존은 단방향이다
