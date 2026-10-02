# 07 전환 — 실행 구조 결정

이 문서는 07 실행 계획([execution-plan.md](execution-plan.md))이 내린 구조 결정을 계획 없이 읽히게 적는다. 원장이 정한 것은 원장을 인용만 하고, 원장이 07의 선택으로 남긴 자리와 원장이 말하지 않은 자리만 결정한다. 원장과 다르게 읽히면 원장이 이긴다.

## D1 렌더 계층은 제자리에서 바꾸고, 전환은 한 묶음이다

- 맥락: 원장은 PR-7을 더 쪼갤 수 없다고 정했다(LANDING-072: 옛 엔진과 새 엔진은 값의 소유·통지·분기가 달라 `<Form>`이 둘을 동시에 섬길 수 없음). 새 fractal은 없고 렌더 계층은 기존 자리에서 바뀐다(LANDING-087). 렌더 계층(`providers`·`components`·`hooks`)은 `@/schema-form/core` 하나로 노드 API를 쓰고, 그 진입점이 오늘 레거시를 가리킨다.
- 결정: 바깥 동작을 바꾸지 않는 준비(기준선, 문서, `@winglet/react-utils`, core 통로)를 먼저 각자 초록으로 끝낸다. 그 뒤 진입점 전환·바인딩 교체·렌더 시험 처분을 한 묶음(U5–U8)으로 제자리에서 한다. 묶음 중간 커밋은 `render` 프로젝트가 붉을 수 있고, 묶음 끝에서 `tsc`·lint·unit·render가 초록이어야 한다.
- 까닭: 새 렌더 계층을 다른 자리에 나란히 짓고 나중에 옮기면 같은 코드가 두 벌 생기고, filid 문서와 import 경로를 두 번 고친다. 원장 관리자가 권한 순서 (1)–(3)은 공개 index를 마지막에 돌리지만, 바인딩이 새 엔진 API를 쓰는 순간 렌더 계층은 이미 전환된 것이므로 묶음으로 두는 편이 사실과 같다.
- 버린 안: 병렬 트리(`components/next/` 등) — 두 벌 코드와 이동 비용. 단계별로 렌더 초록 유지 — 레거시와 새 엔진이 한 `<Form>`에 공존할 수 없어 불가능.
- 결과: 붉은 기간을 줄이려고 core 통로(U4)를 먼저 끝내고, U5–U7은 단위마다 새 바인딩 시험을 먼저 써서 초록으로 만든다. 붉은 중간 커밋은 `log.md`에 적는다.

## D2 바인딩 전용 통로는 `SchemaNode/` 진입점이 이름으로 내보내는 함수다

- 맥락: REACT-009 보충은 입력 마침과 입력 출처 쓰기를 클래스 멤버가 아니라 "`SchemaNode/` 진입점이 바인딩 전용으로 이름을 붙여 내보낸다"고 정했다. 마운트·폼 reset·인계 진입(`dispatchMount`·`dispatchResetForm`·`adoptSchemaNodeChain`)은 `dispatch/` 안에만 있고 런타임 레코드 형을 받는다.
- 결정: `CORE/SchemaNode/utils/binding/`에 공개 `SchemaNode` 형을 받는 함수를 둔다: 트리 생성(마운트 없음), 마운트(검증 미룸 선택), 폼 reset, 인계(옛 루트 → 새 루트, 옛 트리 폐기 포함), 입력 출처 쓰기, 입력 마침, 상호작용 초기화 번호 읽기. 각 함수는 노드를 런타임 레코드로 좁혀 `dispatch` 진입을 부르는 한 문장 위임이다. `SchemaNode/index.ts`와 `core/index.ts`가 이름으로 내보내고, `src/index.ts`는 내보내지 않는다. 이름은 U2에서 `SchemaNode/DETAIL.md`와 함께 정한다.
- 까닭: 진입점이 공개 형만 받으면 바인딩이 런타임 레코드 형을 알 필요가 없고(P5의 경계), 레코드 형이 바뀌어도 렌더 계층이 따라 바뀌지 않는다.
- 버린 안: 노드 클래스의 공개 메서드 — REACT-009가 금함. 바인딩이 `dispatch/`를 직접 가져옴 — fractal 경계 위반(형제 fractal의 내부).
- 결과: 원장 관리자 물음 Q11의 답을 따른다. 답이 다르면 이 결정을 고친다.

## D3 `nodeFromJSONSchema`는 트리 생성과 마운트를 잇는 core 호스트의 진입이고, `<Form>`도 같은 생성 함수를 지난다

- 맥락: 원장은 "`nodeFromJSONSchema`를 새 엔진 위에 다시 짓는다"(LANDING-067)와 "직접 부르는 경로와 `<Form>` 경로가 같은 계약"(VALIDATE-010), "core만 쓰는 호스트는 검증기를 선택 인자로"(CONTROLS-075)만 정했고 서명은 정하지 않았다.
- 결정: 서명은 객체 인자 하나다.

  ```ts
  nodeFromJSONSchema<Schema extends JSONSchema>(props: {
    jsonSchema: Schema;
    defaultValue?: InferValueType<Schema>;
    validator?: Validator;            // { compile, compileGuard, release?, dialect? }
    validationMode?: ValidationMode;
    context?: Dictionary;
    onChange?: (value: InferValueType<Schema> | undefined) => void;
    onStateChange?: () => void;
    errorReporter?: FormErrorReporter;
    unsetOnInactive?: boolean;
    disableAutomaticWrites?: boolean;
    isTerminal?: (schema: JSONSchema) => boolean | undefined;
    isAtomic?: (value: unknown) => boolean;
    deferMountValidation?: boolean;   // 기본 false
  }): InferSchemaNode<Schema>          // 마운트가 끝난 루트
  ```

  내부는 D2의 트리 생성 함수와 마운트 함수를 차례로 부른다. `<Form>`은 첫 마운트에서 `nodeFromJSONSchema`를 부르고(`deferMountValidation: true`, 버퍼형 보고기), 재생성 reset에서는 같은 트리 생성 함수 → 인계 → 마운트를 부른다. 옛 `contextNodeFactory`는 대응물이 없고 `context` 칸으로 바뀐다(이주 행).
- 까닭: 두 경로가 같은 생성 함수를 지나므로 같은 계약이 구조로 보장된다. 판정 함수 둘은 청사진 캐시 키와 런타임 병합(D5)에 같은 참조로 쓰이므로 호출자가 들고 있어야 한다(REACT-004).
- 버린 안: 위치 인자 — 칸이 많아 순서 실수. 마운트하지 않은 루트를 돌려줌 — core 호스트가 마운트를 잊으면 로드되지 않은 트리.

## D4 입력 출처는 공개 비트가 아니라 진입의 칸으로 싣는다

- 맥락: 공개 `SetValueOption`은 네 비트뿐이다(REACT-009). 입력 출처는 Refresh 대상에서 쓴 입력을 빼는 판정(EVENT-071)과 늦은 쓰기 차단(REACT-010·024)이 읽는다.
- 결정: 입력 출처 쓰기 함수가 사슬 진입의 출처 칸에 `'input'`을 싣고, 그 칸이 커밋의 `UpdateValue` `options.source`와 Refresh 대상 판정에 흐른다. 내부 `SetValueOption` 열거에 비트를 더하지 않는다.
- 까닭: 비트를 더하면 공개 형과 내부 형의 비트 공간이 갈라져 별칭 규칙이 깨진다. 출처는 진입 단위의 사실이라 진입 칸이 맞는 자리다.

## D5 폐기 표시·상호작용 초기화 번호·원자 판정은 런타임 레코드의 칸이다

- 맥락: 재생성 reset의 옛 트리 폐기(WRITE-046·086), 상호작용 초기화 번호(REACT-024), 실행 중 병합의 원자 판정(REACT-003)이 코드에 없다.
- 결정: 노드 레코드에 폐기 표시와 상호작용 초기화 번호를, 런타임 레코드에 `isAtomic`을 둔다. 폐기는 인계 함수 안에서 옛 트리 전체를 걸어 표시하고 리스너를 떼며 두 번호를 통지 없이 올린다. 표식 없는 쓰기는 `DISPOSED_NODE_WRITE`. 상호작용 초기화 번호는 `revision`의 비트가 아니라 D2의 읽기 함수로만 읽힌다(사건이 아니므로).
- 까닭: 번호는 통지 없이 오르므로 사건 원장(`revision`)에 넣으면 "리스너 없이 집계되는 배달 리비전"이라는 그 계약이 흐려진다.

## D6 React 18은 별칭 개발 의존과 복제 프로젝트로 돈다

68C-10을 그대로 따른다: `react18`·`react-dom18` npm 별칭 개발 의존, `vite.config.ts`의 `render` 복제 프로젝트 `react18`이 `resolve.alias`로 바꿔 끼운다. 포함 글롭은 같고 제외는 이름과 까닭을 적은 파일만. 지속 통합에 두 프로젝트.

## D7 같은 스키마 판정은 렌더 계층의 helper다

- 맥락: reset의 같은 스키마 판정(WRITE-043)은 `<Form>`의 reset 분기에서만 쓰인다. core만 쓰는 호스트는 reset 분기가 없다.
- 결정: `PKG/src/helpers/schemaIdentity/`(가칭)에 둔다. 같은 객체이거나, JSON 부분이 키 순서까지 깊게 같고 JSON 밖의 값(함수·React 요소 등)은 참조로 같으면 같다.
- 버린 안: core에 둠 — 쓰는 곳이 렌더 계층 하나뿐이다(filid 배치 §1).

## D8 07의 검증 산출물은 `verification/07-switch/`에 둔다

처분표(`render-disposition.md`), 이주 점검표(`migration-check.md`)와 그 추출 스크립트(`tools/`), 옛 스토리 정리표(`story-disposition.md`), 브라우저 게이트(`browser-gates.md`), 성능(`performance.md`), 패키지 벤치의 옛 기준선(`bench-legacy-baseline.json`). 스파이크 사례표와 플러그인 고친 줄 목록은 `plan/07-switch/log.md`(68C-07·09).
