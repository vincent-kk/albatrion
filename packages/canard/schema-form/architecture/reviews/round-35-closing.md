# 35라운드 닫기 — 06 착수의 원장 해석 여섯과 05의 셋: 배열 메서드의 던짐·경로 갱신·삽입 없음·`resolveArrayLimits`·원본 B 구조 기록·범위 밖 인덱스, 그리고 `bind` 거부 객체의 정정·`dialect?`·공개 검증 형 유지

2026-10-01. 06 작업자(브랜치 `feat/schema-form-array`)가 실행 계획을 쓰며 원장 해석 여섯 건을 물었고, 05 작업자(브랜치 `feat/schema-form-dispatch-and-validation`)가 계획 재작업에서 셋을 물었다. 모두 현행 항목과 레거시 코드에서 유도되므로 편집자 결정으로 닫는다. 05의 첫 물음은 32C-02의 전제(ajv 플러그인 셋이 `@winglet/common-utils`를 런타임 의존성으로 가진다)가 ajv8에만 맞는 것을 바로잡는 정정이다. 소유자에게 물을 것은 없다.

### 35C-01 배열 아닌 노드의 배열 메서드 던짐은 PR-5의 공유 칸이 하고, throw 직전의 `onError` 보고는 디스패치 배선과 함께 뒤에 머지하는 단계가 잇는다

- 닫는 항목: ERROR-197(보충), NODE-014(보충)
- 결정:
  - 【추론】 ERROR-197의 던짐(`type`이 배열이 아닌 노드에서 `push`·`pop`·`update`·`remove`·`clear`를 부르면 행의 공유 칸이 모든 환경에서 즉시 `SchemaFormError`를 던진다, 기록에 `path`와 `details.method`)은 PR-5가 만드는 배열 행의 공유 칸에 사는 것이라 PR-5의 몫이고, NODE-014대로 메서드는 단일 클래스에 두되 형은 공개 `ArrayNode` 인터페이스에만 준다.
  - 【추론】 "throw 직전에 `onError`로 보낸다(surface `'thrown'`)"는 PR-4의 보고기를 쓰므로 33C-01의 디스패치 배선과 함께 뒤에 머지하는 단계가 더한다; 06이 먼저 머지되면 공유 칸은 던지기만 하고 보고를 시도하지 않으며, 그 자리의 DETAIL에 배선 PR이 보고를 더한다는 한 줄을 남긴다. 코드 이름은 가칭 그대로 쓰고 05의 확정 목록(31C-05)에 든다.
- 근거: ERROR-197 "`type`이 배열이 아닌 노드에서 `push`·`pop`·`update`·`remove`·`clear`를 부르면, 행의 공유 칸이 모든 환경에서 즉시 `SchemaFormError`를 던진다.", "throw 직전에 `onError`로 보낸다(surface `'thrown'`)."; NODE-014 "**배열 메서드**는 클래스에 두되 타입은 `ArrayNode` 인터페이스에만 준다. 비배열에서 부르면 행의 공유 칸이 `SchemaFormError`를 던지므로 겉면과 `dispatch`는 종류를 묻지 않는다."

### 35C-02 재인덱싱의 경로 갱신은 PR-5가 레코드 칸에서 하고 `(previous, current)` 사실을 남기며, `UpdatePath` 배달은 디스패처(PR-4)의 몫이다

- 닫는 항목: EVENT-068(보충), NODE-051(보충)
- 결정:
  - 【추론】 구조 연산으로 아이템이 재인덱싱되면 PR-5가 그 아이템과 자손의 레코드 칸(이름·이스케이프한 이름·경로)을 고치고 `(previous, current)` 쌍을 레코드 수준의 사실로 남긴다; 그것을 `UpdatePath` 비트의 배달(EVENT-068의 payload `{ previous, current }`, 자손 포함)로 바꾸는 것은 디스패처(PR-4)의 일이라 33C-01대로 뒤에 머지하는 단계가 잇는다.
  - 【추론】 06의 시험은 26C-03대로 바뀐 경로(상태 신호)만 단언하고 배달은 단언하지 않는다.
- 근거: EVENT-068 "비트는 `UpdatePath`, payload는 오늘처럼 `{ previous, current }`다."; 26C-03(뒤 PR 기제를 쓰는 단언은 그 PR로 나눈다); LANDING-084 "진입 사슬은 `dispatch`가 쓰기 동사마다 진입 함수로 소유하고, 검증 결과 배달은 `dispatch`가 넘긴 콜백이다".

### 35C-03 삽입 동사는 없다 — 원장의 "삽입"은 `push(v)`와 짝지은 연산 부류의 이름이고, WRITE-099의 PR-5 스냅숏 게이트는 `push('x')`로 충족한다

- 닫는 항목: SURFACE-005(보충), WRITE-099(보충), NODE-051(보충)
- 결정:
  - 【추론】 SURFACE-005가 배열 쓰기를 다섯(`push`·`pop`·`update`·`remove`·`clear`)으로 닫았고, 원장의 "삽입"은 모두 "`push(v)`·삽입"(WRITE-085, WRITE-099) 또는 "`push`·`remove`·`insert`류"(NODE-051)로 연산 부류를 이름한 것이라 공개 동사도 내부 연산도 아니다; 06은 삽입을 만들지 않고, WRITE-099의 스냅숏 게이트는 `push('x')`로 충족하며 삽입 쪽은 동사가 없어 해당 없음으로 적는다. 삽입 동사가 필요해지면 SURFACE 라운드다.
- 근거: SURFACE-005 "배열 `push`·`pop`·`update`·`remove`·`clear`"(쓰기 겉면 다섯); WRITE-085 "`remove(i)`·`pop`은 그 자리를 잘라 내고, `push(v)`·삽입은 새 아이템의 생성 값(`v`, 없으면 `undefined`라 되돌림이 채움을 받는다)을 넣는다."; NODE-051 "키를 바꾸는 것은 구조 연산(`push`·`remove`·`insert`류)뿐이다".

### 35C-04 `resolveArrayLimits`는 `blueprint/`에서 이름으로 내보내고 유효 스키마의 `schema`를 받으며, 소비자 의도(렌더 계층의 입력 컴포넌트)는 `blueprint/DETAIL.md`에 적는다

- 닫는 항목: LANDING-085(보충), NODE-009(보충), WRITE-022(보충)
- 결정:
  - 【추론】 NODE-009(behaviors 밖에서도 쓰는 것은 `blueprint/`로)와 LANDING-085·094(PR-5의 이동)대로 `resolveArrayLimits`는 `blueprint/`의 조직에 두고 청사진 진입점에서 이름으로 내보내며, 조각이 준 `minItems`·`maxItems`가 세어지도록 유효 스키마의 `schema`를 받는다(WRITE-022 "제약을 유효 스키마로 노출"); 코어는 채우지도 막지도 않는다.
  - 【추론】 PR-5 안의 소비자는 옮긴 시험뿐이고 의도한 소비자는 렌더 계층의 입력 컴포넌트(PR-7·08)이므로 그 의도를 `blueprint/DETAIL.md`에 적는다(소비자 없는 내보내기는 의도를 적는다는 공개 계약 규칙); 레거시의 사본은 LANDING-159 규칙대로 `__legacy__`에 09까지 남고, 레거시가 옮긴 것을 가져오지 않는다.
- 근거: NODE-009 "behaviors 밖에서도 쓰는 `resolveArrayLimits`는 `blueprint/`로 간다"(요지); LANDING-085 "`resolveArrayLimits`는 `blueprint/`로 옮긴다"(요지); WRITE-022 "`minItems`까지 채우기와 `maxItems` 초과 `push` 차단은 입력 컴포넌트의 몫이다. 코어는 제약을 유효 스키마로 노출하고, 위반은 검증이 알린다"(요지); LANDING-159 "규칙 1: 새 fractal(PR-1부터 새로 쓴 것)은 `__legacy__`를 가져오지 않는다."

### 35C-05 원본 B의 배열 아이템 구조 기록은 호스트·이전 아이템 목록(순서 있는 노드 참조)·이전 `extras`를 적어 자동 쓰기 기록과 함께 거꾸로 되돌리고, 되돌린 아이템은 생기지 않은 것이며, 키 카운터는 되감지 않는다

- 닫는 항목: LANDING-062(보충), TEST-069(보충), WRITE-036(보충), GOAL-073(보충)
- 결정:
  - 【추론】 자동 쓰기(채움·`derived`·`injectTo`·`unsetValue`·나감 비움)가 배열 호스트에 닿아 아이템을 만들거나 없애면 정착 작업장이 {호스트, 이전 아이템 목록(순서 있는 노드 참조), 이전 `extras`}를 적고, 예산 초과 때 기존 자동 쓰기 기록과 함께 거꾸로 되돌려 원본 B에 호출자 쓰기만의 구조를 남긴다(LANDING-062 충돌 줄과 TEST-069가 PR-5로 둔 기록); 그 정착에서 생겼다가 되돌린 아이템은 커밋된 형상에 한 번도 들지 않으므로 생김이 아니고 채움도 받지 않으며, 없어지는 아이템은 WRITE-036대로 나감이 아니다.
  - 【추론】 키 카운터는 되감지 않는다: GOAL-073의 아이템 React key는 생성 순서의 nonce이고 단조 증가가 되돌린 아이템과 뒤 아이템의 신원을 구별해 주며, 되감으면 다른 노드가 같은 nonce를 받는다; 되돌린 아이템은 순번에 빈자리만 남긴다.
- 근거: LANDING-062 충돌 줄 "예산 다섯과 원본 B(되돌림 기록. 기록 항목은 노드, 이전 `raw`, 이전 `extras`, 배열 아이템 구조의 생성·폐기"; TEST-069 "원본 B의 배열 아이템 구조 기록은 PR-5로 미룬다(TEST의 PR-5 행에 더함)."; WRITE-036 "쓰기로 원본 자체가 없어져 노드가 사라지는 것(배열 아이템 `remove`, 통째 교체로 짧아진 배열, 로드)은 나감이 아니라 소멸이며 비움의 대상도, 억제 비트·원본 B의 기록 대상도 아니다."; GOAL-073 제목 "T-22 배열 아이템의 React key는 생성 순서의 nonce".

### 35C-06 `update(i, v)`는 그 아이템의 통째 쓰기(로드 아님)이고 키와 스냅숏 자리를 지키며, 범위 밖·음수 인덱스의 `update`·`remove`와 빈 배열의 `pop()`은 오류 없는 무효 호출이다

- 닫는 항목: SURFACE-005(보충), WRITE-007(보충), WRITE-085(보충)
- 결정:
  - 【추론】 `update(i, v)`는 i번째 아이템에 `v`를 통째로 쓰는 로드 아닌 쓰기이고(그 안의 위치 재조정은 NODE-051), WRITE-007대로 그 아이템만 바뀌며 WRITE-085대로 구조 연산이 아니라 키와 스냅숏 자리를 지킨다.
  - 【추론】 범위 밖([0, 길이) 밖)·음수 인덱스의 `update`·`remove`, 빈 배열의 `pop()`, 값이 `null`인 터미널 배열의 `update`·`remove`·`pop`은 원장이 정한 바가 없으므로 레거시(`src/__legacy__/core/nodes/ArrayNode/strategies/BranchStrategy/BranchStrategy.ts:413-447`, `TerminalStrategy/TerminalStrategy.ts:195-224`)를 따라 오류도 경고도 없는 무효 호출이다; 새 코드는 없고 06의 시험이 무효 호출을 단언해 고정한다.
- 근거: WRITE-007 "쓰기 표의 배열 `push`/`remove`/`update` 행은 구조 연산이며 "그 아이템만" 바뀐다"(요지); WRITE-085 "구조 연산이 아닌 쓰기(`update(i, v)`, 입력 쓰기, `Merge`)는 스냅숏을 건드리지 않는다."; SURFACE-005의 서명 `update(index, value)`·`pop()`; 레거시 `BranchStrategy.update` "if (!node) return promiseAfterMicrotask(void 0);", `TerminalStrategy.update` "if (index < 0 || index >= this.__value__.length) return Promise.resolve(void 0);".

### 35C-07 32C-02의 정정 — ajv6·ajv7 플러그인은 `@winglet/common-utils`를 런타임 의존성으로 갖지 않으므로, `VALIDATOR_BIND_REFUSED`는 플러그인마다 자기 `Error` 하위 클래스에 `group: 'UNHANDLED_ERROR'`·`code: 'VALIDATOR_BIND_REFUSED'` 칸을 두어 던진다; `ValidatorPlugin`에는 `dialect?`도 더하고, 공개 `ValidateFunction`·`ValidatorFactory`는 PR-4에서 그대로다

- 닫는 항목: VALIDATE-050(보충), LANDING-192(보충), VALIDATE-044(보충), VALIDATE-026(보충), ERROR-032(보충)
- 결정:
  - 【추론】 32C-02의 "플러그인이 이미 런타임 의존성으로 가진 `@winglet/common-utils`"는 ajv8 플러그인에만 맞고 ajv6·ajv7은 `ajv`만 의존하므로 바로잡는다: ajv 플러그인 셋은 저마다 네이티브 `Error`의 하위 클래스를 자기 이름으로 두고 `group: 'UNHANDLED_ERROR'`·`code: 'VALIDATOR_BIND_REFUSED'`·`details`(켜진 옵션 이름)를 실어 던지며, 호출자는 `group`과 `code`로 가른다; ajv8이 같은 칸을 가진 `BaseError`를 쓰는 것은 허용되나 셋을 같게 두는 것이 낫고, 새 작업 공간 의존성은 더하지 않는다.
  - 【추론】 34C-01의 추가 멤버에 `dialect?`를 더한다: VALIDATE-044가 계약 멤버로 "선택 방언 선언(VALIDATE-026)"을 들었고 VALIDATE-026이 선언을 선택으로, 어긋남 경고를 개발 모드 전용(핸들러가 있으면 기록)으로 받았으므로, `ValidatorPlugin`의 네 번째 선택 멤버로 PR-4에서 더하고 ajv8 진입점 셋이 방언을 선언한다; 경고의 발화 자리는 트리 생성의 폼 수준 보고기라 LANDING-064의 core 쪽에 따라 PR-4다.
  - 【추론】 공개 `ValidateFunction`·`ValidatorFactory`(`src/types/error.ts`)의 모양을 PR-4에서 옮기거나 바꾸는 항목은 없다: ERROR-032의 PR-4 몫은 `ValidationIssue` 개명과 `ValidateFunction` 문서 주석("입력의 판정은 돌려주고 던지지 않는다. 던지면 실행 실패다")뿐이며, 그 주석은 PR-4에서 코어 `src/core/validation/`의 `ValidateFunction`에 달고 PR-7의 전환에서 공개 선언으로 옮긴다; 같은 이름의 두 형은 코어 쪽 선언에 이름 함정 한 줄로 가른다.
- 근거: `schema-form-ajv6-plugin/package.json`·`schema-form-ajv7-plugin/package.json`의 `dependencies`는 `ajv`만, `schema-form-ajv8-plugin/package.json:77-80`은 `@winglet/common-utils`와 `ajv`; VALIDATE-050 "켜져 있으면 `(가칭) UNHANDLED_ERROR.VALIDATOR_BIND_REFUSED`를 부른 쪽에 즉시 던지고, 인스턴스를 붙이지 않는다."; VALIDATE-044 "`Validator`는 `compile(copy)`, `compileGuard(root, pointer)`, 선택 `release(root)`(18C-56), 선택 방언 선언(VALIDATE-026), 그리고 `compile` 결과 함수의 에러 정규화(`dataPath`, 루트 경로 표기, `rejectedKey`)를 담는다."; VALIDATE-026 반영 칸 "받는다. 플러그인이 자기 방언을 선택적으로 선언하고, 스키마의 `$schema`와 어긋나면 개발 모드에서 경고만 낸다(프로덕션 출력 없음, `onError` 핸들러가 있으면 경고 기록)."; ERROR-032 "PR-4: … `ValidationIssue` 개명, `ValidateFunction`의 문서 주석('입력의 판정은 돌려주고 던지지 않는다. 던지면 실행 실패다')을 넣는다."

### 35C-08 아이템 안의 선언은 PR-5가 아이템마다 평가한다 — 선언 경로의 아이템 조각은 런타임의 어느 색인과도 맞고, 기준점은 노드 자신의 런타임 경로이며, 게이트로 꺼진 아이템은 나감이되 자리는 남아 VALUE-034로 채운다

- 닫는 항목: CONTROLS-080(보충), SETTLE-017(보충), VALUE-034(보충), WRITE-036(보충)
- 결정:
  - 【추론】 배열 아이템 안에 선언된 식·게이트·파생·상태 키의 아이템별 평가는 PR-5의 몫이다(TEST-069 (라): 아이템은 PR-5에서 처음 생긴다); CONTROLS-080대로 식은 작성 위치마다 한 번 컴파일하고 그 위치의 모든 아이템이 결과를 공유하며, 평가의 기준점은 노드 자신의 런타임 경로라 상대 경로(`..`, `../1`, `./x`)는 `/arr/3/...`에 대해 푼다.
  - 【추론】 원장은 선언 경로의 아이템 조각이 런타임에 어떻게 묶이는지 적지 않았으므로 정한다: 청사진의 선언 경로는 배열 층마다 아이템 조각 하나(`items`는 임의 색인, `prefixItems`는 그 색인)를 두고, SETTLE-017의 정적 역의존 표는 조각 단위로 맞추되 선언의 아이템 조각은 어느 색인과도 맞으며, 다른 아이템을 가리키는 절대 런타임 경로(`/arr/0/x`)는 18C-13대로 배열 호스트 하위 트리 전체에 기대는 의존이다; 이 맞춤은 조회 쪽(의존 색인·게이트 재배치)의 변경이고 청사진은 바뀌지 않는다.
  - 【추론】 아이템 선언의 노드 게이트와 아이템 스키마의 게이트 조각은 허용된다(BLUEPRINT-030은 게이트를 형상 확장의 경계로 센다); 게이트로 형상을 떠난 아이템은 WRITE-036의 소멸 목록(`remove`·짧아진 통째 쓰기·로드)에 없으므로 나감이며 나감 정책·비움·잠복 포착이 런타임 경로를 키로 적용되고, 자리는 색인이라 남아 VALUE-034대로 방출 없는 자리로 채운다(객체 `{}`, 배열 `[]`, 잎 `null`; `omitTrailing`은 그런 꼬리를 자른다).
- 근거: CONTROLS-080 "식은 작성된 스키마 위치마다 한 번 컴파일하고, 그 위치의 모든 노드(배열 아이템 포함)가 결과를 공유한다"(요지), "(7) 배열: 색인은 `/n` 조각으로 읽는다(`../items/0/price`, 아이템 안에서 형제는 `../1`)."; SETTLE-017 18C-13 보충 "따라서 역의존 조회(SETTLE-017)는 값이 바뀐 노드의 경로와 그 조상·자손 경로를 읽는 식을 모두 찾는다."; VALUE-034 제목 "배열 아이템의 빈자리는 `{}`·`[]`·`null`"; WRITE-036 "쓰기로 원본 자체가 없어져 노드가 사라지는 것(배열 아이템 `remove`, 통째 교체로 짧아진 배열, 로드)은 나감이 아니라 소멸이며"; `src/core/blueprint/DETAIL.md:7` "배열 아이템·게이트·터미널은 형상 확장의 경계입니다."

### 35C-09 소멸한 아이템과 그 자손은 NODE-044의 떼어진 노드 규칙을 따르되 나감 정책·비움·잠복 포착이 없고, 경로 키 저장소의 항목은 버린다

- 닫는 항목: WRITE-036(보충), NODE-044(보충)
- 결정:
  - 【추론】 `remove`·`pop`·`clear`·짧아진 통째 쓰기·로드로 소멸한 아이템과 그 자손은 NODE-044의 떼어진 노드다(읽기는 마지막 커밋에 고정, 구조 읽기는 함께 떼어진 하위 트리, `active`·`enabled`는 거짓, 구독은 남되 다시 발화하지 않음, 다시 들면 새 인스턴스); WRITE-036대로 나감 정책·나감 비움·잠복 포착·억제 비트·원본 B 기록은 없고, 런타임 경로를 키로 둔 저장소의 항목은 버린다.
  - 【추론】 옛 참조로의 쓰기는 NODE-044 그대로다: 같은 (경로, 종류)의 살아 있는 인스턴스가 있으면 아무것도 하지 않고(재인덱싱 뒤에는 보통 이 경우), 없으면 루트의 (경로, 종류) 잠복 원본만 고친다; 배열을 따로 다루지 않는다.
- 근거: WRITE-036 "비움의 대상도, 억제 비트·원본 B의 기록 대상도 아니다."; NODE-044 "옛 참조의 쓰기는 오류가 아니며 루트의 (경로, 종류) 잠복 원본만 고친다. 같은 (경로, 종류)의 새 인스턴스가 있는 동안에는 쓰기가 아무것도 하지 않는다"(요지), "다시 형상에 들면 새 인스턴스다"(요지).

### 35C-10 게이트로 꺼진 배열 호스트의 잠복 원본은 배열 전체를 호스트 자신의 얼린 `raw`로 들고 `inactiveValues`에 호스트 경로의 항목 하나이며, 재진입은 새 키의 아이템을 만들고 없음인 자손만 채운다

- 닫는 항목: SETTLE-029(보충), VALUE-029(보충), NODE-044(보충)
- 결정:
  - 【추론】 26C-13·26C-14(SETTLE-029, VALUE-002)가 형상 밖 객체 값만 선언의 전순서로 노드별 잠복 원본에 분배하고 호스트의 잠복 원본은 자신의 비객체 `raw`와 선언 밖 `extras`만 보관하므로, 배열은 평범한 객체가 아니라 게이트로 꺼진 배열 호스트의 잠복 원본은 배열 전체를 호스트 자신의 얼린 `raw`로 들고 아이템별로 나누지 않으며, `inactiveValues`에는 호스트 경로의 `{ path, value }` 항목 하나다.
  - 【추론】 재진입은 그 값으로 아이템을 새 `#n` 키로 다시 만들고(NODE-044의 새 인스턴스, GOAL-073의 nonce), 채움은 로드·비로드 규칙대로 없음인 자손에만 간다(WRITE-007의 `push(v)` 규칙과 같다).
- 근거: `src/core/settle/DETAIL.md:35` "호스트 잠복 원본은 자신의 비객체 `raw`와 선언 밖 `extras`만 함께 보관하며 빈 호스트는 항목이 없습니다(26C-13, 26C-14, SETTLE-029, VALUE-002)."; WRITE-007 "`push(v)`면 원본은 `v`이고 없음인 자손에만 채움이 간다"(요지); NODE-044 "다시 형상에 들면 새 인스턴스다"(요지).

### 35C-11 `controls.children`은 이름으로 가리키는 객체 호스트의 장치라 배열 호스트에서 위치를 가리킬 수 없고, 06은 위치 대상도 새 경고도 더하지 않는다

- 닫는 항목: CONTROLS-030(보충), CONTROLS-073(보충)
- 결정:
  - 【추론】 CONTROLS-030은 `children`을 "부모가 이름으로 가리킨 직계 자식"에 거는 한 홉 장치로 적고 CONTROLS-073은 `targets`를 호스트 청사진의 직계 자식 이름으로 풀므로, 작성된 이름이 없는 배열 아이템(위치는 런타임이다)은 대상이 될 수 없다; 06은 위치 대상을 지원하지 않고 경고도 더하지 않으며, 배열 호스트의 `controls.children`은 02 청사진이 풀리지 않는 `targets`에 이미 하는 처리에 맡긴다. 그 처리가 없으면 뒤 라운드의 청사진 진단이지 배열 행의 경고가 아니다(새 경고 코드는 ERROR-164의 라운드다).
- 근거: CONTROLS-030 "부모가 이름으로 가리킨 직계 자식에 제어를 건다. 형태는 `[{ targets: [...], controls: { readOnly, disabled, visible, active, default, derived, unsetValue, resetInteraction, unsetOnInactive } }]`이다.", "한 홉짜리 장치라 손자에 걸려면 자식 스키마에 `controls.children`을 적는다"; CONTROLS-073 "`targets`는 그 선언을 가진 호스트 청사진의 직계 자식 이름으로 푼다"(요지).

### 35C-12 배열의 전략은 청사진이 정하고(렌더 계층의 판정 함수·`options.terminal`), PR-5는 터미널 배열 행만 더한다 — 원본은 배열 전체, 동사 다섯은 사본 위에서 호스트 통째 쓰기, 투영이 `omitTrailing`·`omitEmpty`, 아이템 노드·구조 로그 없음

- 닫는 항목: NODE-005(보충), NODE-028(보충), LANDING-085(보충)
- 결정:
  - 【추론】 배열이 터미널인지는 PR-5가 정하지 않는다: NODE-002의 두 행(`branch`·`terminal`), NODE-027·028(인라인 `presentation.FormTypeInput`의 암묵 터미널은 렌더 계층의 판정 함수가 청사진에 넘겨 정하며 두 행을 가진 object·array에만 있다, NODE-047), BLUEPRINT의 `options.terminal: true` 허용과 `false`의 `TERMINAL_OPTION_UNSUPPORTED`, LANDING-048의 `node.strategy` 판정대로 06은 청사진의 `strategy`를 읽어 `array.terminal` 행을 고른다.
  - 【추론】 터미널 배열 행은 NODE-005대로 원본을 배열 전체로 들고 `push`·`pop`·`update`·`remove`·`clear`를 원본의 사본 위에서 수행해 호스트를 통째로 쓰며(아이템 노드·재인덱싱·아이템 스냅숏 이어 붙임이 없고 호스트 자신의 로드 스냅숏이 단위다), `project`가 LANDING-085가 `arrayBehavior/utils/`로 옮긴 `omitTrailing`·`omitEmpty` 보조로 자르고, 값이 `null`이면 동사는 무효 호출(35C-06)이며, VALUE-034의 빈자리 채움은 적용되지 않는다; 원본 B는 다른 터미널 노드처럼 호스트의 이전 `raw`만 적고 구조 로그는 두지 않는다.
- 근거: NODE-005 "터미널 배열은 원본을 통째로 들고, `push`·`update`·`remove`·`pop`·`clear`를 원본 배열 위에서 지원한다"(요지); NODE-027 "터미널 전략의 object·array는 자식 없이 값을 직접 들고(ADR 0006), 노출 표면은 branch 전략과 같다."; NODE-028 "인라인 `presentation.FormTypeInput`이 **있고 `null`이 아닌지**를 보는 판정은 렌더 계층(React 바인딩)의 판정 함수가 하며, 렌더 계층이 이 함수를 청사진에 넘긴다."; `src/core/behaviors/DETAIL.md:12` "터미널 배열 행은 06단계에서 추가합니다(NODE-002·047, BLUEPRINT-043, LANDING-065)."; LANDING-085 "`omitTrailingArray`·`omitEmptyArray`는 `behaviors/arrayBehavior/utils/`로 옮긴다"(요지).
