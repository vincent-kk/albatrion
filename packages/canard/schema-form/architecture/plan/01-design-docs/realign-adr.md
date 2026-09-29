# 유효 스키마 병합이 형 충돌을 결과로 드러낸다

상태: 채택(2026-09-29, 01·02 보정). 최종 모양은 PR 03(정착)이 정한다.

## 맥락

청사진 진입점의 `mergeEffectiveSchema(node, activeDeclarationIds, options?, memo?)`는 활성 선언을 합쳐 고정된 유효 스키마(`BlueprintSchema`)를 돌려준다. 02는 켜진 게이트 선언과 정적 허용 형의 교집합이 비면 `enum: []`를 적어 값이 하나도 통과하지 못하게 했다.

원장은 이 사건을 다르게 정한다. 형 교집합이 비면 "그 게이트들이 켜진 동안의 정착 오류 `SHARED_NODE_CONFLICT`"다(BLUEPRINT-016 충돌 줄, BLUEPRINT-041, BLUEPRINT-044). `enum: []`는 `enum`·`const`의 공집합에만 쓴다(SCHEMA-045). 정착 오류는 PR 03이 던지므로, 청사진은 충돌을 숨기지 말고 03이 읽을 수 있게 드러내야 한다(25라운드 판정, 원장 관리 세션).

## 결정

`mergeEffectiveSchema`는 고정된 결과 기록 `EffectiveSchema { readonly schema: BlueprintSchema; readonly typeConflict: boolean }`를 돌려준다. 형 충돌이 있으면 `typeConflict`가 `true`이고 `schema.type`은 노드의 정적 `schemaType`이며, `enum`은 적지 않는다. 같은 노드와 같은 활성 집합이면 같은 기록 참조를 돌려준다.

## 까닭

- 유효 스키마는 렌더링 힌트다(`mergeEffectiveSchema`의 문서 주석). 신호를 스키마 안에 두면(`enum: []`나 가짜 키) 렌더러는 그것을 "고를 값 없음"이라는 스키마로 읽고, 정착 오류가 힌트 속에 묻힌다. 폼의 판정은 어차피 작성된 스키마로 하므로(VALIDATE-001) 힌트에 판정을 흉내 낼 까닭이 없다.
- 결과 기록이면 같은 참조 규칙을 기록 단위로 지키면서 메모 한 번에 두 값을 돌려준다.

## 버린 대안

- **스키마에 `enum: []` 유지.** 원장 판정과 어긋난다. 정착 오류 대신 검증 오류가 나고, 03이 충돌을 구별할 수 없다.
- **별도 함수 `hasEffectiveTypeConflict(node, ids)`.** 같은 병합을 두 번 하거나 메모의 내부를 두 함수가 나눠 가져야 한다.
- **03까지 신호를 두지 않음.** 02의 `enum: []`를 빼면 충돌이 아무 흔적 없이 사라져 03이 되살려야 한다.

## 비용

- 속도: 메모에 없는 활성 집합마다 고정된 작은 객체 하나를 더 만든다. 메모에 있으면 같은 기록을 돌려주므로 반복 호출의 비용은 그대로다. `false` 스키마의 결과는 모듈 상수 하나를 함께 쓴다.
- 메모리: 메모 항목마다 두 칸짜리 기록 하나가 는다. 노드는 약한 키로 잡히므로 수명은 오늘과 같다.

## 결과

- 청사진 진입점의 반환 형이 바뀌고, 형 `EffectiveSchema`를 이름으로 내보내며, 공개 형 `EffectiveSchemaCacheEntry.schemas`의 값 형도 바뀐다. 소비자는 청사진 안(`buildNodes.ts`)과 시험뿐이다(`src/__legacy__`와 다른 패키지에는 없음).
- 03은 `typeConflict`를 읽어 `SHARED_NODE_CONFLICT`를 던진다. 모양을 바꿀 수 있으며, 바꾸면 이 기록 대신 03의 기록이 이긴다.
