# 18라운드 — 봉인 뒤 최종 정합성 점검 원문과 판정

지시는 봉인 뒤의 원장 전체를 보는 같은 지시서를 codex와 antigravity에 주었다. 찾을 것은 다섯이다: A 현행 항목 사이의 모순, B 끊긴 가리킴, C 소유자 답 위반, D 미결 결정, E 18라운드 블록 사이의 불일치. 검토자는 파일을 고치지 않았다. 기준은 커밋 `9f6d21306`, 원장 1,327항목(2026-09-26, 봉인)이다. 검증자가 지적마다 인용한 두 자리를 원장과 대조해 확인·부분 확인·기각으로 걸렀고, 편집자 판정대로 `reviews/round-18-closing.md`의 18C-105와 원장에 반영했다. 판정은 각 절 끝에, 고침은 3절에 있다.

## 1. codex (session 9a923cc8-602d-45db-b587-535dd7fbfee3)

지적 일곱. 아래는 전달자가 옮긴 원문 그대로다(첫 턴의 본 답변과, 분류·집계를 보완한 둘째 턴).

> === Turn 1 (본 답변) ===
> 파일 변경 없이 확인했습니다. 아래 경로의 `ARCH`는 `packages/canard/schema-form/architecture`입니다.
>
> ### F1 높음 — U7의 추가 해석 1회로는 최종 유효 목록에 따른 결과를 보장할 수 없음
>
> - 항목: WRITE-098(현행) vs SETTLE-005(현행)·SETTLE-017(현행)
> - 인용: "【추론】 전이 단계에서는 이 진입에서 쓰인 노드마다, 최종 유효 목록이 정적 목록보다 좁으면 원래 쓰인 값(쓰기 경계에서 바뀐 값이 아니라 호출자·입력이 준 값)을 최종 유효 목록으로 다시 해석해 그 결과를 원본으로 삼는다." (`ARCH/ledger/write.md:1559`) / "【추론】 비용: 쓰인 노드 가운데 유효 목록이 정적 목록보다 좁은 노드에 한해 `interpret` 한 번과 쓰인 값의 참조 보관이다." (`ARCH/ledger/write.md:1564`) / "채움이나 나감의 비움이 다음 라운드를 부르는 것은 그 쓰기가 게이트를 뒤집어 새 노드를 내거나 노드를 내보낼 때뿐이다" (`ARCH/ledger/settle.md:125`)
> - 왜 모순인가: 정적 목록이 `['string','boolean']`이고, `a`가 number이면 boolean으로, 아니면 string으로 좁히는 게이트에서 `a=0`을 쓰면 정적 해석은 `0`, 첫 재해석은 `false`입니다. 그 결과 게이트가 string 쪽으로 바뀌므로 최종 결과 `"0"`에는 두 번째 재해석이 필요하지만, 노드 생김·나감 없이 발생하는 이 반복은 추가 해석 1회 계약과 맞지 않습니다.
> - 제안: 소유자 물음 — 재해석이 게이트를 바꾸는 경우의 재계산·종료 조건과 예산을 정하거나, '최종 유효 목록'의 의미를 제한해야 합니다.
>
> ### F2 중간 — 배열 삽입의 되돌림 값이 `v`와 `undefined`로 갈림
>
> - 항목: WRITE-085(현행) vs WRITE-095(현행)
> - 인용: "【추론】 `remove(i)`·`pop`은 그 자리를 잘라 내고, `push(v)`·삽입은 새 아이템의 생성 값(`v`, 없으면 `undefined`라 되돌림이 채움을 받는다)을 넣는다." (`ARCH/ledger/write.md:1266`) / "【추론】 아이템을 만들거나 없애는 모든 쓰기는 구조 연산처럼 그 경로의 스냅숏 배열의 자리를 맞춘다." (`ARCH/ledger/write.md:1498`) / "【추론】 없어진 아이템의 자리는 잘라 내고, 새 아이템의 자리에는 `undefined`를 넣으며, 값은 싣지 않는다." (`ARCH/ledger/write.md:1499`)
> - 왜 모순인가: `push('x')` 뒤 새 아이템의 `defaultValue`와 `resetSubtree()` 결과가 달라집니다. WRITE-085의 충돌 칸은 구조 연산이 아닌 쓰기만 대체하며, `push(v)`의 생성 값 보존은 대체하지 않습니다.
> - 제안: WRITE-085가 이깁니다. 소유자 반영문도 "배열의 구조 연산이 스냅숏을 고치는 18C-44의 규칙은 그대로다"라고 유지하므로(`ARCH/reviews/round-18-owner-answers.md:26`), WRITE-095의 `undefined` 규칙을 비구조 쓰기로 생긴 자리로 한정해야 합니다.
>
> ### F3 중간 — `NON_JSON_WHOLE_VALUE`의 프로덕션 실행 조건이 다름
>
> - 항목: VALUE-037(현행) vs TEST-078(현행)
> - 인용: "【추론】 프로덕션에서는 그 점검을 하지 않으며, 이 한계를 문서에 적는다." (`ARCH/ledger/value.md:617`) / "【추론】 비용 — 새 경고 넷(`TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`, `NON_JSON_WHOLE_VALUE`, `DISCRIMINATOR_BRANCH_UNREACHABLE`, `FORM_TYPE_TEST_INVALID`): 개발 모드나 핸들러가 있을 때만 돌며, 비용은 터미널 하위 스키마 크기, 통째 값 크기(참조가 바뀐 커밋마다), 등록 때의 키 수에 비례한다; 메모리는 중복 억제 키이고; 각 30–40줄이다." (`ARCH/ledger/test.md:1327`)
> - 왜 모순인가: 핸들러가 있는 프로덕션에서 VALUE-037은 깊이 점검을 금지하지만 TEST-078은 실행 대상으로 포함합니다. 경고 수신 여부뿐 아니라 커밋마다 값 크기에 비례하는 비용도 달라집니다.
> - 제안: 해당 경고를 구체적으로 정의한 VALUE-037을 우선하고, TEST-078의 공통 실행 조건에서 이를 분리해야 합니다.
>
> ### F4 중간 — E26은 배열과 스칼라가 같은 참조라고 요구함
>
> - 항목: BLUEPRINT-045(현행) vs NODE-057(현행)
> - 인용: "【추론】 E26: 본체 `a:{type:'number'}` + `if/then a:{type:['number','string']}`는 number / `'number'` / false / terminal이고, 켜진 동안 유효 목록은 `['number']`로 `schemaType`과 같은 참조다." (`ARCH/ledger/blueprint.md:864`) / "union이 아닌 노드의 `schemaType`은 오늘과 같은 스칼라이며, number 노드는 `'integer'`를 보존하고 null 노드는 `'null'`이다." (`ARCH/ledger/node.md:949`)
> - 왜 모순인가: E26의 `schemaType`은 문자열 `'number'`이므로 배열 `['number']`와 동일한 참조일 수 없습니다. 이 예를 그대로 참조 동일성 시험으로 옮기면 만족시킬 수 없습니다.
> - 제안: 소유자 답에서 온 NODE-057의 스칼라 계약을 유지하고, 좁히지 않은 단일 타입의 유효 목록 표현을 명시하여 E26과 참조 공유 규칙을 맞춰야 합니다.
>
> ### F5 중간 — 하위 트리 로드 후 전체 컴파일 실패의 재통보 단위가 정해지지 않음
>
> - 항목: ERROR-164(현행)·VALIDATE-048(현행) vs EVENT-072(현행)
> - 인용: "한 로드에 오류 객체 하나로 첫 OnChange 검증, validate(), 제출을 모든 환경에서 거부(R17-1 나). 그 로드에서 OnChange 검증을 다시 예약하지 않음" (`ARCH/ledger/error.md:2433`) / "【추론】 검증 불가 기록은 여전히 폼의 로드마다 한 번씩 낸다(ERROR 영역의 `VALIDATOR_COMPILE_FAILED` 행)." (`ARCH/ledger/validate.md:754`) / "【추론】 "한 로드에 한 번"(VALIDATE-048)은 `resetSubtree()`에는 그 하위 트리에만 적용한다." (`ARCH/ledger/event.md:1106`)
> - 왜 모순인가: 전체 스키마 컴파일 실패는 폼 단위인데, EVENT-072는 그 기록의 수명을 하위 트리에 적용하면서 귀속 기준을 정하지 않습니다. 실패를 이미 통보한 폼에서 자식의 `resetSubtree()`를 호출했을 때 오류 객체·재통보·OnChange 예약 억제 중 무엇을 갱신하는지 결정할 수 없으며, ERROR-204의 진단·경고 초기화 규칙도 이 오류의 답은 아닙니다.
> - 제안: 소유자 물음 — 폼 수준 로드에서만 재통보할지, 하위 트리 로드에도 재통보할지 확정하고 EVENT-072의 PR-4 통과 조건에 기대 횟수와 오류 객체 수명을 명시해야 합니다.
>
> ### F6 낮음 — 노드 종류 총수가 일곱과 여덟으로 다름
>
> - 항목: BLUEPRINT-032(현행) vs NODE-057(현행)
> - 인용: "【추론】 그래서 노드의 종류는 일곱이다: string, number(`integer` 포함), boolean, null, object, array, (가칭) `union`." (`ARCH/ledger/blueprint.md:518`) / "가. `node.type`은 `'string'`·`'number'`·`'boolean'`·`'null'`·`'object'`·`'array'`·`'virtual'`·`'union'` 가운데 하나인 단일 문자열이며, 노드가 사는 동안 바뀌지 않는다." (`ARCH/ledger/node.md:943`)
> - 왜 모순인가: BLUEPRINT-032의 총수에는 `virtual`이 빠져 있습니다. 같은 항목의 충돌 칸도 일곱을 승자로 유지합니다.
> - 제안: 소유자 반영문을 정본으로 삼은 NODE-057이 이깁니다. 전체 노드 종류는 여덟으로 맞춰야 합니다.
>
> ### F7 낮음 — 충돌 칸 네 곳이 분할된 BLUEPRINT-031을 승자 포인터로 유지함
>
> - 항목: NODE-008(현행)·NODE-018(현행)·LANDING-082(현행) vs BLUEPRINT-031(분할됨(→ BLUEPRINT-034, BLUEPRINT-033))
> - 인용: "종류 모듈에 (가칭) `unionBehavior/`가 더해진다(BLUEPRINT-031)." (`ARCH/ledger/node.md:164`) / "- 상태: 분할됨(→ BLUEPRINT-034, BLUEPRINT-033)" (`ARCH/ledger/blueprint.md:509`)
> - 왜 모순인가: 현행 충돌 해소의 근거 포인터가 현행 결정이 아닌 분할 항목을 가리킵니다. 같은 문제가 NODE-018의 두 줄(`ARCH/ledger/node.md:292`, `:293`)과 LANDING-082(`ARCH/ledger/landing.md:1309`)에도 남아 있습니다.
> - 제안: 해당 동작 행·PR 배치·모듈 내용을 보유한 현행 BLUEPRINT-043으로 네 포인터를 바꿔야 합니다. 분할 내용 자체의 유실은 아닙니다.
>
> === Turn 2 (카테고리 태그 + 집계 정리 보완 요청에 대한 답) ===
> - F1: **A / E** — 최종 유효 목록 보장과 추가 해석 횟수·정착 규칙의 충돌입니다.
> - F2: **A / C / E** — 배열 삽입의 되돌림 값이 다르며, 소유자가 유지한 구조 연산 규칙과도 어긋납니다.
> - F3: **A / E** — 프로덕션에서 경고 점검을 실행하는 조건이 다릅니다.
> - F4: **A / C / E** — 배열의 참조 동일성 요구가 소유자 답의 스칼라 `schemaType` 계약과 충돌합니다.
> - F5: **E** — 폼 단위 컴파일 실패와 하위 트리 로드 규칙의 적용 단위가 정합하게 연결되지 않았습니다.
> - F6: **A / C** — 노드 종류 총수가 소유자 반영문의 여덟 종류와 다릅니다.
> - F7: **B** — 충돌 칸의 승자 포인터가 분할된 항목을 가리킵니다.
>
> 카테고리 D: 없음. F5는 담당·시점 없는 명시적 보류가 아니라, 로드 규칙 사이의 적용 범위 문제로 분류했습니다.
>
> **높음 1건, 중간 4건, 낮음 2건 — 총 7건입니다.**

**판정(검증자, 2026-09-27).** 검증자가 연 자리는 모두 기준 커밋의 원장이다.

| 지적 | 판정 | 근거 |
| --- | --- | --- |
| C-F1 | 확인 | `ledger/write.md:1559`·`:1564`(WRITE-098: 재해석 한 번, 비용 한 번)와 `ledger/settle.md:125`(SETTLE-005: 다음 라운드를 부르는 쓰기는 채움과 나감의 비움뿐)가 인용대로다. 반례에서 첫 재해석의 `false`가 게이트를 뒤집는데, 재해석이 다음 라운드를 부르는지는 어느 현행 항목도 정하지 않는다. |
| C-F2 | 확인 | `ledger/write.md:1266`(WRITE-085: `push(v)`는 `v`)과 `:1498-1499`(WRITE-095: 새 자리는 `undefined`)가 인용대로다. WRITE-085의 충돌 줄(`ledger/write.md:1280`)은 비구조 쓰기만 대체하고, 반영 칸(`reviews/round-18-owner-answers.md:26`)은 구조 연산의 규칙을 그대로 둔다. |
| C-F3 | 확인 | `ledger/value.md:617`(프로덕션에서는 점검하지 않음)과 `ledger/test.md:1327`(개발 모드나 핸들러가 있을 때)이 인용대로다. |
| C-F4 | 확인 | `ledger/blueprint.md:864`(E26: `['number']`로 `schemaType`과 같은 참조)와 `ledger/node.md:949`(union이 아닌 노드의 `schemaType`은 스칼라)가 인용대로다. 같은 요구가 TEST-077의 `union.gated-narrowing` 줄(`ledger/test.md:1290`)에도 있다. |
| C-F5 | 확인 | `ledger/error.md:2433`(ERROR-164 행: 한 로드에 한 번, 그 로드에서 다시 예약하지 않음), `ledger/validate.md:754`(VALIDATE-048: 폼의 로드마다), `ledger/event.md:1106`(EVENT-072: 하위 트리에만)이 인용대로다. ERROR-204(`ledger/error.md:3014-3015`)는 진단과 경고 중복 키만 다룬다. |
| C-F6 | 확인 | `ledger/blueprint.md:518`(일곱)과 `ledger/node.md:943`(`virtual`을 포함한 여덟 값)이 인용대로이고, BLUEPRINT-032의 충돌 줄 셋도 "일곱"을 이긴 쪽으로 적는다. |
| C-F7 | 확인 | `ledger/node.md:164`·`:292`·`:293`과 `ledger/landing.md:1309`가 분할된 BLUEPRINT-031(`ledger/blueprint.md:509`)을 가리킨다. 행 `terminal`(`reviews/round-18-closing.md:59`), PR-2의 `union` 행(`:79`), `unionBehavior/`(`:80`)는 BLUEPRINT-043의 결정에 있다. |

**판정(편집자, 2026-09-27).** 일곱 모두 받는다. C-F1은 18C-105의 U7 정련 2(전이 단계의 재해석은 전이 쓰기, 한 라운드에 한 번, 상한이면 원본 B)로, C-F2–C-F6은 18C-105의 결정 줄과 그 충돌 줄로, C-F7은 가리킴 고침으로 닫는다. C-F1과 C-F5의 "소유자 물음" 제안은 받지 않는다: 두 답 모두 이미 정해진 규칙(SETTLE-005의 라운드와 상한, SETTLE-011의 원본 B, ERROR-204의 폼 수준 로드)을 새 경우로 넓힌 편집자 결정이다.

## 2. antigravity (session b1d8966e-1fa4-4c5d-83fe-a6bbc810e43e)

지적 아홉. 아래는 전달자가 옮긴 원문 그대로다(분류 표기를 더한 둘째 턴의 답이 첫 턴의 답을 대신한다).

> 요청하신 대로 F1~F9 보고서의 각 항목에 브리핑 기준 카테고리(A~E) 분류를 표시하고, C(소유자 답 위반)와 D(미결 결정) 카테고리에 대한 원장 전수 재검증 결과를 포함하여 다시 출력합니다.
>
> ---
>
> # `@canard/schema-form` 재설계 원장 18라운드 봉인 후 최종 정합성 검사 보고서 (분류 표기판)
>
> ### F1 높음 — `EVENT-072`의 "한 로드에 한 번" 하위 트리 한정과 전역 컴파일 오류 및 `ERROR-204` 간의 정의 모순 (분류: E)
> - 분류: **E (18라운드 블록 간 불일치)**
> - 항목: EVENT-072(packages/canard/schema-form/architecture/ledger/event.md:1106)(현행) vs VALIDATE-048(packages/canard/schema-form/architecture/ledger/validate.md:754)(현행), ERROR-204(packages/canard/schema-form/architecture/ledger/error.md:3014)(현행)
> - 인용: "【추론】 "한 로드에 한 번"(VALIDATE-048)은 resetSubtree()에는 그 하위 트리에만 적용한다." (event.md:1106) / "【추론】 검증 불가 기록은 여전히 폼의 로드마다 한 번씩 낸다(ERROR 영역의 VALIDATOR_COMPILE_FAILED 행)." (validate.md:754) / "【추론】 diagnostics와 경고 중복 키는 폼 수준 로드(마운트, FormHandle.reset())에서만 초기화한다. 【추론】 setValue(V)와 resetSubtree()는 초기화하지 않는다." (error.md:3014)
> - 왜 모순인가: VALIDATE-048의 "한 로드에 한 번" 대상은 전체 스키마 컴파일 실패(VALIDATOR_COMPILE_FAILED)이며 이는 폼 전체(루트) 단위 사건이므로 하위 트리 단위(resetSubtree())로 쪼개어 적용할 수 없습니다. 더욱이 ERROR-204는 resetSubtree()가 diagnostics나 경고 중복 키를 초기화하지 않는다고 명시하고 있어, resetSubtree() 호출 시 컴파일 실패 기록을 다시 내야 하는지 억제해야 하는지 규정이 서로 충돌하며 비어 있습니다(gate3-union-fill.md:137).
> - 제안: 소유자 물음. 전체 컴파일 실패(VALIDATOR_COMPILE_FAILED)는 폼 수준 로드(마운트, FormHandle.reset())에서만 발생하는 폼 단위 사건으로 한정하고, EVENT-072에서 VALIDATE-048을 하위 트리에 적용한다는 문장을 삭제하거나 예외로 명시해야 합니다.
>
> ---
>
> ### F2 높음 — 정적 선언 없는 이름에서 게이트 없는 분기 간 fold 불일치 시 처리 규칙 모순/미결 (분류: E)
> - 분류: **E (18라운드 블록 간 불일치)**
> - 항목: BLUEPRINT-044(blueprint.md:813-817)(현행) vs BLUEPRINT-011(blueprint.md:206)(현행), BLUEPRINT-012(blueprint.md:226)(현행)
> - 인용: "【추론】 정적 선언이 하나도 없는 이름은 fold가 같은 선언끼리 노드 하나를 둔다. … 【추론】 fold가 다른 게이트 선언이 동시에 켜지면 SHARED_NODE_CONFLICT이고, 배타이면 종류별 노드이며(BLUEPRINT-011·012 그대로)" (blueprint.md:813-817) / "게이트 없는 선언끼리는 늘 함께 켜지므로 청사진 오류다" (blueprint.md:226)
> - 왜 모순인가: 호스트 본체나 정적 allOf에 선언이 없는 이름에 대해, 게이트 없는 분기들(예: variant 호스트의 게이트 없는 oneOf 분기들)이 서로 다른 fold(예: string과 number)를 가질 때의 규칙이 누락되어 있습니다. BLUEPRINT-044는 "정적 선언이 있을 때"와 "게이트 선언끼리"만 규정하고 있어, 게이트 없는 분기 간 fold 불일치가 청사진 오류(SHARED_NODE_KIND_CONFLICT)인지 배타적 종류별 노드인지 정의되지 않았습니다(gate3-union-fill.md:135).
> - 제안: 소유자 답 14라운드 O-10("게이트 없는 선언끼리 다른 종류는 청사진 오류") 대원칙이 이깁니다. 정적 선언이 없는 이름이라도 게이트 없는 분기끼리 fold가 다르면 SHARED_NODE_KIND_CONFLICT 청사진 오류로 처리하도록 BLUEPRINT-044에 명시해야 합니다.
>
> ---
>
> ### F3 중간 — 노드 종류 수(Node Kinds Count) 불일치 (분류: A)
> - 분류: **A (현행 항목 간 모순)**
> - 항목: BLUEPRINT-032(blueprint.md:518)(현행) vs NODE-057(node.md:943)(현행), 소유자 답 row 31
> - 인용: "【추론】 그래서 노드의 종류는 일곱이다: string, number(integer 포함), boolean, null, object, array, (가칭) union." (blueprint.md:518) / "가. node.type은 'string'·'number'·'boolean'·'null'·'object'·'array'·'virtual'·'union' 가운데 하나인 단일 문자열이며, 노드가 사는 동안 바뀌지 않는다." (node.md:943)
> - 왜 모순인가: BLUEPRINT-032는 노드의 종류를 virtual을 제외한 '일곱(7종)'으로 단정하고 있으나, 정본인 NODE-057과 소유자 답 row 31은 'virtual'을 포함한 '여덟(8종)'으로 정의하고 있습니다.
> - 제안: 소유자 답 row 31 및 NODE-057이 이깁니다. BLUEPRINT-032의 "일곱이다"를 virtual을 포함한 "여덟이다"로 바로잡아야 합니다.
>
> ---
>
> ### F4 중간 — `BLUEPRINT-033` 분할 결정문 누락 (분류: B)
> - 분류: **B (끊긴 포인터)**
> - 항목: BLUEPRINT-033(blueprint.md:548)(분할됨) vs BLUEPRINT-042(blueprint.md:736-740)(현행), BLUEPRINT-040(blueprint.md:688-692)(현행)
> - 인용: "union 노드의 입력은 목록의 한 형의 값이나 없음을 보내며, 어떤 형을 보낼지는 입력 구현(UI 플러그인)이 정하고 목록은 node.jsonSchema.type에서 읽는다." (blueprint.md:548)
> - 왜 모순인가: BLUEPRINT-033의 5번째 문장 전반부는 소유자 답 row 24의 핵심 결정인데, 분할 대상인 BLUEPRINT-042 결정문에서 누락되었고 BLUEPRINT-040에서도 결정문이 아닌 보충 칸(blueprint.md:695)에만 인용되어 독립된 현행 결정문으로 유지되지 못했습니다.
> - 제안: 소유자 답 row 24 원문이 이깁니다. BLUEPRINT-042 결정문에 해당 입력 계약 문장을 복원해야 합니다.
>
> ---
>
> ### F5 중간 — `BLUEPRINT-034` 분할 결정문 누락 및 잘못된 분할 포인터 (분류: B)
> - 분류: **B (끊긴 포인터)**
> - 항목: BLUEPRINT-034(blueprint.md:575)(분할됨) vs BLUEPRINT-043(blueprint.md:769)(현행), REACT-033(react.md:539)(현행)
> - 인용: "【추론】 (4) 입력: 패키지의 기본 입력 정의는 union 노드를 문자열 입력으로 그리고, 입력한 글은 (3)의 parse가 해석한다." (blueprint.md:575) / "【추론】 (4) 입력: 다른 입력은 작성자가 fieldPlugin.inputs에 union을 지정해 바꿀 수 있다." (blueprint.md:769)
> - 왜 모순인가: BLUEPRINT-034의 (4) 첫 문장이 BLUEPRINT-043 결정문에서 누락되어 뒷 문장만 홀로 남았습니다. 또한 REACT-033은 해당 출처(reviews/round-18-closing.md:70) 내용을 담지 않는데도 BLUEPRINT-034의 분할 대상 목록에 포함되어 있습니다(gate3-union-fill.md:71-79).
> - 제안: BLUEPRINT-043 결정문에 누락된 첫 문장을 복원하고, BLUEPRINT-034의 분할 대상 목록에서 무관한 REACT-033을 제거해야 합니다.
>
> ---
>
> ### F6 중간 — union 노드의 목록 밖 default 처리 시점 누락 (분류: E)
> - 분류: **E (18라운드 블록 간 불일치)**
> - 항목: VALUE-037(value.md:620)(현행) vs WRITE-090(write.md:1358)(현행)
> - 인용: "【추론】 목록 밖 default(예: ['string','boolean']에 default: 0)는 마운트 때 경고등을 켜고, source: 'fill', reason: 'ambiguous'로 경고를 한 번 보낸다." (value.md:620) / "채움(controls.default > default)은 노드가 생길 때만 일어난다: 마운트, FormHandle.reset(), resetSubtree(), 분기가 켜짐, 배열 아이템이 생김." (write.md:1358)
> - 왜 모순인가: WRITE-090에 따르면 채움은 마운트뿐만 아니라 resetSubtree(), 분기 활성화, 배열 아이템 생성 등 "노드가 생길 때" 발생합니다. 그러나 VALUE-037은 union의 목록 밖 default 처리를 오직 "마운트 때"로 한정하여, 런타임에 새로 생겨난 union 노드의 목록 밖 default 처리가 누락됩니다.
> - 제안: WRITE-090의 채움 정의가 이깁니다. VALUE-037의 "마운트 때"를 "노드가 생길 때(채움 시점)"로 일반화해야 합니다.
>
> ---
>
> ### F7 중간 — U7 전이 단계 재해석과 예산 초과 원본 B 커밋 간의 규정 공백 (분류: E)
> - 분류: **E (18라운드 블록 간 불일치)**
> - 항목: WRITE-098(write.md:1559)(현행) vs SETTLE-011(settle.md:209)(현행)
> - 인용: "【추론】 전이 단계에서는 이 진입에서 쓰인 노드마다, 최종 유효 목록이 정적 목록보다 좁으면 원래 쓰인 값(쓰기 경계에서 바뀐 값이 아니라 호출자·입력이 준 값)을 최종 유효 목록으로 다시 해석해 그 결과를 원본으로 삼는다." (write.md:1559) / "정착의 세 예산(호스트 바퀴, 파생 라운드, 전이 라운드) 가운데 하나라도 상한을 넘기면, 그 정착의 자동 쓰기 — 채움, controls.derived, controls.injectTo, controls.unsetValue, 나감의 비움 — 를 모두 뺀 원본 B를 커밋한다." (settle.md:209)
> - 왜 모순인가: 18C-104(WRITE-098)에 따라 U7 전이 단계에서 쓰인 노드는 유효 목록에 맞춰 2차 재해석되어 새로운 원본이 됩니다. 정착 중 예산 초과로 원본 B를 커밋해야 할 때, 이 U7 재해석 결과가 SETTLE-011의 "자동 쓰기를 모두 뺀 원본 B"에 반영되는지 규정되어 있지 않습니다.
> - 제안: U7 재해석은 자동 쓰기가 아니라 호출자 쓰기의 유효 목록 확정 단계이므로, 원본 B 커밋 시에도 2단계 재해석 결과가 유지되어야 함을 SETTLE-011에 보충/충돌로 명시해야 합니다.
>
> ---
>
> ### F8 낮음 — `SETTLE-027` 분할 타깃 누락 (분류: B)
> - 분류: **B (끊긴 포인터)**
> - 항목: SETTLE-027(settle.md:435)(분할됨) vs SETTLE-048(settle.md:763)(현행)
> - 인용: "- 상태: 분할됨(→ SETTLE-046, WRITE-090)" (settle.md:435) / "【추론】 로드는 에지와 생김의 기준을 비운다." (settle.md:763)
> - 왜 모순인가: SETTLE-027의 첫 문장은 18C-102에 의해 독립 항목인 SETTLE-048로 분할되었으나, SETTLE-027의 상태 줄 및 색인 표(settle.md:35)에는 SETTLE-046, WRITE-090만 기재되어 SETTLE-048이 누락되었습니다.
> - 제안: SETTLE-027의 상태 줄과 색인 표를 "분할됨(→ SETTLE-046, SETTLE-048, WRITE-090)"으로 바로잡아야 합니다.
>
> ---
>
> ### F9 낮음 — `NODE-018` 충돌 칸의 승자 항목이 비현행(`분할됨`) 상태임 (분류: B)
> - 분류: **B (끊긴 포인터)**
> - 항목: NODE-018(node.md:292)(현행) 충돌 칸 vs BLUEPRINT-031(blueprint.md:509)(분할됨)
> - 인용: "(가칭) union 잎의 terminal 행이 더해져 행은 열이다(BLUEPRINT-031). 18라운드 결정이 이긴다(reviews/round-18-closing.md:59)." (node.md:292) / "- 상태: 분할됨(→ BLUEPRINT-034, BLUEPRINT-033)" (blueprint.md:509)
> - 왜 모순인가: NODE-018의 충돌 칸에서 18라운드 결정 승자로 가리키는 BLUEPRINT-031이 현행 항목이 아니라 분할됨 상태입니다.
> - 제안: 충돌 칸의 승자 포인터를 현행 항목인 NODE-002 보충 또는 BLUEPRINT-043으로 바로잡아야 합니다.
>
> ---
>
> ## C(소유자 답 위반) 및 D(미결 결정) 전수 검증 결과
>
> 1. **C (소유자 답 위반): 없음**
>    - 18라운드 소유자 답(round-18-owner-answers.md) 전 37개 행과 이전 라운드 소유자 답을 원장 17개 파일의 모든 현행 항목과 대조했습니다.
>    - 소유자의 명시적 결정에 위배되는 내용이 현행 결정문으로 잘못 들어간 사례는 없었습니다. (F3의 경우 BLUEPRINT-032가 소유자 답 row 31과 상충하나, 이는 현행 항목인 NODE-057과의 노드 종류 수 모순이 본질이므로 카테고리 A로 분류되었습니다.)
>    - 18라운드 봉인 시 추가·수정된 항목의 "닫은 사람" 칸을 전수 점검한 결과 편집자 추론(【추론】)이 소유자 답으로 허위 표기된 사례 역시 없었습니다.
>
> 2. **D (미결 결정): 없음**
>    - 원장의 현행 항목 중 "정하지 않는다", "미정", "나중에" 등으로 선택지를 열어둔 채 결정 주체와 시점을 명시하지 않은 미결 결정문은 없습니다.
>    - 소유자 답 row 33의 원시·객체/배열 혼합 분기의 미지원(UNKNOWN_JSON_SCHEMA)은 브리핑에서 "Known and accepted"로 규정된 사항입니다.
>    - WRITE-076 및 WRITE-077의 자동 변환 해제 옵션 등은 "끄는 옵션은 두지 않는다"는 명시적 부정 결정으로 종결 처리되었습니다.
>
> ---
>
> ## 심각도별 집계
> - **높음**: 2건 (F1, F2)
> - **중간**: 5건 (F3, F4, F5, F6, F7)
> - **낮음**: 2건 (F8, F9)
> - **없음**: 없음 (모든 심각도 카테고리에 유효한 결함이 보고됨)
>
> ## 카테고리별 집계
> - **A (현행 항목 간 모순)**: 1건 (F3)
> - **B (끊긴 포인터)**: 4건 (F4, F5, F8, F9)
> - **C (소유자 답 위반)**: 없음
> - **D (미결 결정)**: 없음
> - **E (18라운드 블록 간 불일치)**: 4건 (F1, F2, F6, F7)

**판정(검증자, 2026-09-27).**

| 지적 | 판정 | 근거 |
| --- | --- | --- |
| A-F1 | 확인(= C-F5) | `ledger/event.md:1106`, `ledger/validate.md:754`, `ledger/error.md:3014-3015`가 인용대로다(마지막 인용은 두 줄을 이은 것). |
| A-F2 | 확인 | `ledger/blueprint.md:814`(정적 선언이 없는 이름은 fold가 같은 선언끼리 노드 하나)와 `:817`(fold가 다른 게이트 선언)이 인용대로이고, 게이트 없는 분기끼리 fold가 다른 경우는 BLUEPRINT-044에 없다. BLUEPRINT-012의 "게이트 없는 선언끼리는 늘 함께 켜지므로 청사진 오류다"는 인용한 `:226`이 아니라 `ledger/blueprint.md:228`에 있다. |
| A-F3 | 확인(= C-F6) | `ledger/blueprint.md:518`과 `ledger/node.md:943`이 인용대로다. |
| A-F4 | 확인 | 반영 칸 다섯째 문장의 앞부분은 분할된 BLUEPRINT-033의 결정(`ledger/blueprint.md:548`)과 BLUEPRINT-040의 보충(`:695`)에만 있다. BLUEPRINT-042의 출처는 반영 칸의 1–4·6번째 문장이다(`ledger/blueprint.md:752`). |
| A-F5 | 부분 확인 | REACT-033(`ledger/react.md:539`)은 18C-92의 줄(`reviews/round-18-closing.md:2575`)이라 BLUEPRINT-034의 내용을 싣지 않는다: 확인. `reviews/round-18-closing.md:70`의 복원은 기각: 그 문장은 반영 칸의 여섯째 문장(`reviews/round-18-owner-answers.md:24`)이 대체했고 BLUEPRINT-042가 그것을 싣는다. 또 인용한 `ledger/blueprint.md:769`의 "(4) 입력: 다른 입력은 작성자가 fieldPlugin.inputs에 union을 지정해 바꿀 수 있다"는 그 자리에 없다(그 줄은 "다른 입력은 작성자가 `formTypeInputMap`이나 인라인 입력으로 고른다"). |
| A-F6 | 확인 | `ledger/value.md:620`(마운트 때)과 `ledger/write.md:1358`(채움은 노드가 생길 때: 마운트, `FormHandle.reset()`, `resetSubtree()`, 분기가 켜짐, 배열 아이템이 생김)이 인용대로다. |
| A-F7 | 확인(제안은 받지 않음) | `ledger/write.md:1559`와 `ledger/settle.md:209`가 인용대로이고, 원본 B에 재해석 결과가 드는지는 정해지지 않았다. 제안(원본 B에도 재해석 결과를 남김)은 받지 않는다: 상한에 걸린 정착의 게이트 상태는 최종이 아니므로 그 상태로 좁힌 재해석도 최종이 아니다. |
| A-F8 | 확인 | `ledger/settle.md:435`와 색인 `:35`에 SETTLE-048이 없고, SETTLE-048(`ledger/settle.md:763`)이 SETTLE-027의 첫 문장을 싣는다. |
| A-F9 | 확인(= C-F7의 일부) | `ledger/node.md:292`가 인용대로다. 제안의 "NODE-002 보충"은 받지 않고 BLUEPRINT-043으로 가리킨다. |

C(소유자 답 위반)와 D(미결 결정)의 "없음"은 검증자가 따로 전수 재검하지 않았다. codex는 C-F2·C-F4·C-F6을 C로도 분류했고, 그 셋은 위에서 받았다.

**판정(편집자, 2026-09-27).** A-F1·A-F3·A-F9는 codex 지적과 같은 원인으로 함께 닫는다. A-F2·A-F4·A-F6·A-F7은 18C-105의 결정 줄로, A-F8은 가리킴 고침으로 닫는다. A-F5는 가리킴만 고친다.

## 3. 고침 명세 (2026-09-27)

- 닫힌 기록: `reviews/round-18-closing.md` 끝에 절 "최종 정합성 점검이 드러낸 항목"과 블록 18C-105(`:2934-2984`)를 더했다. 결정 `:2938-2957`, 근거 `:2959-2967`, 게이트 `:2969-2984`(PR-2 전이 라운드, PR-2 스냅숏·유효 목록, PR-4 검증 불가 기록, PR-1 청사진 판정). 앞 줄은 고치지 않았다.
  - `:2938-2945` U7 정련 2(C-F1, A-F7): 전이 단계의 재해석은 전이 쓰기, 게이트를 뒤집으면 다음 라운드(상한 그대로), 한 라운드에 한 번, 예, 상한이면 원본 B에는 쓰기 경계의 해석만, 경고등, 비용.
  - `:2946-2949` 검증 불가 기록의 단위(C-F5, A-F1).
  - `:2950` 정적 선언이 없는 이름의 게이트 없는 분기끼리 fold가 다르면 `SHARED_NODE_KIND_CONFLICT`(A-F2).
  - `:2951` `node.type` 여덟(C-F6, A-F3).
  - `:2952` 반영 칸 다섯째 문장의 앞부분(A-F4).
  - `:2953` 목록 밖 `default`는 노드가 생길 때마다(A-F6).
  - `:2954` `push(v)`·삽입의 스냅숏(C-F2).
  - `:2955` `NON_JSON_WHOLE_VALUE`는 개발 모드에서만(C-F3).
  - `:2956-2957` 좁혀지지 않은 노드의 유효 목록과 E26(C-F4).
- 새 항목: WRITE-099(결정 = 18C-105의 결정과 게이트 36줄, 출처 `reviews/round-18-closing.md:2938-2957,2969-2984`(정본)과 `reviews/round-18-owner-answers.md:24`, 닫은 사람 18C-105와 소유자 답 :24).
- 보충: WRITE-098(`:2938-2940,2942-2945`), SETTLE-005(`:2938-2940`), SETTLE-011(`:2942-2944`, 라운드 18), VALIDATE-048(`:2946-2948`), BLUEPRINT-044(`:2950`), WRITE-085(`:2954`), TEST-077(게이트 `:2970-2971`).
- 충돌: EVENT-072(`:2850`의 하위 트리 적용 → `:2946-2949`), BLUEPRINT-032(`:61`의 "일곱" → 소유자 답 `reviews/round-18-owner-answers.md:31`), VALUE-037(`:2544`의 "마운트 때" → `:2953`), WRITE-095(`:2780`의 `undefined` → `:2954`), TEST-078(`:2701`의 "핸들러가 있을 때" → `:2955`), BLUEPRINT-045(`:2441`의 E26 → `:2956-2957`), TEST-077(`:2676`의 E26 유효 목록 → `:2956-2957`).
- 상태: BLUEPRINT-033 → `분할됨(→ BLUEPRINT-042, BLUEPRINT-040, WRITE-099)`(반영 칸 다섯째 문장의 새 집), BLUEPRINT-034 → REACT-033을 BLUEPRINT-042로 바꿈(A-F5), SETTLE-027 → `분할됨(→ SETTLE-046, SETTLE-048, WRITE-090)`(A-F8). 색인 행을 함께 맞췄다.
- 가리킴: NODE-008(`ledger/node.md:164`), NODE-018(`:292`, `:293`), LANDING-082(`ledger/landing.md:1309`)의 충돌 줄에서 BLUEPRINT-031을 BLUEPRINT-043으로 바꿨다(C-F7, A-F9). 이 네 줄은 18라운드에 더한 줄이다.
- 받지 않은 것: A-F5의 `reviews/round-18-closing.md:70` 복원(반영 칸 여섯째 문장이 대체), A-F7의 원본 B에 재해석 결과를 남기자는 제안, C-F1·C-F5의 소유자 물음 제안.
- 반영 뒤 원장: 항목 1,328(현행 1,058(부정 결정·기록 포함), 대체됨 199, 분할됨 47, 중복 24, 열림 0). 기계 검사는 모두 문제 0이고 소유자 답은 231/231 인용, 토큰 잔여는 481이다. 봉인 커밋과 견준 `diff-guard`는 위 가리킴 고침 세 항목만 알린다(18라운드 전 커밋 `fcab8d891`과 견주면 0).
