# 우산 순서 4 — 노드 트리와 정착 (원장 PR-2)

> 원장 정본: LANDING-062(정의), LANDING-082(정착 지도), LANDING-092(보정), TEST-069(독립 검증 경계), TEST-070(게이트). 규칙은 NODE·VALUE·WRITE·SETTLE 영역. 이 문서는 읽기 표면이며, 어긋나면 원장이 이긴다.

## 목적

상속 없는 단일 클래스 `SchemaNode`와 동작 행, `raw`·`extras` 둘뿐인 상태, 정착 루프(표시·계산·전이·커밋)와 예산·원본 B, `diagnostics`를 세운다. 새 엔진의 몸통이며, 가장 크고 어느 것과도 합치지 않는 단계다.

## 우산 안의 자리

- 의존: PR-1(청사진을 입력으로 받는다).
- 다음: PR-3·4·5가 이 위에서 병렬로 진행한다. 게이트(`if`·`controls.active`)는 술어 인터페이스 뒤의 스텁이다(LANDING-062).

## 범위 — 원장이 정한 내용

- **노드**: `src/core/SchemaNode/`의 단일 클래스와 `BEHAVIORS[type][strategy]`의 동작 행 — 잎 넷과 `union` 행, 객체·터미널 객체, 가상(터미널 배열은 PR-5)(LANDING-062와 그 충돌 줄, BLUEPRINT-043). `src/core/record/`·`behaviors/`·`navigation/`, 공개 `type`·`strategy`·`active` 게터, 겉면 규칙의 기계 검사(파일 한정 린트, 멤버 목록 시험, 행 칸 순서 시험)(LANDING-062·092). 노드 공개 형은 `type` 판별 합집합이고 `UnionNode`는 `typeMismatch`로 두 멤버로 나뉜다(NODE-058, SURFACE-061). 겉면 멤버는 약 54개(SURFACE-058의 충돌 줄, EVENT-073).
- **필드**: `type`(종류, 여덟), `schemaType`(계산 목록; union이면 얼린 배열, `'null'` 제외), `nullable`; 불변식 `Array.isArray(schemaType) === (type === 'union')`(BLUEPRINT-036·039·040).
- **쓰기와 해석**: 쓰기 종류와 경계(WRITE-056·093), 규칙 A `isMember`·`convert`·`interpret`(순서 무관·멱등·무할당, 동점 12건, WRITE-093), U7 두 단계와 전이 라운드(WRITE-098·099), 전체 교체 쓰기의 잠복 원본 비움(WRITE-096), 비객체 V의 `Merge`(WRITE-079), null 계약(WRITE-097).
- **정착**: 호스트 바퀴·노드 게이트·투영, 채움 시점(WRITE-090)과 로드 규칙의 범위(EVENT-072), 나감 비움 네 층과 하위 트리, 예산 다섯과 원본 B(되돌림 기록 항목 확정, LANDING-092), 라운드 상한(SETTLE-005·047·048), Refresh 대상(EVENT-071), 트리 순회 예산(SETTLE-047).
- **경고등과 진단**: `typeMismatch`·`typeMismatches`(VALUE-030·037, SURFACE-061), `TYPE_MISMATCH` 경고 기록 칸, `diagnostics`(`stable`·`degraded`·`cause`·`commit`)와 초기화 시점(ERROR-204), `SetValueOption`.
- **방출**: 빈 호스트·루트의 투영(VALUE-034), 원본 참조 그대로(VALUE-037).
- parse의 문서는 새 자리 `src/core/behaviors/utils/parse/`의 문서로(LANDING-150).

## 부딪히는 코드 · 그대로 쓰는 것 · 새 fractal (LANDING-082)

| 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- |
| `AbstractNode`의 `onChange` 전파·`__scoped__`·`__reset__`·루트 매크로태스크 디바운스, `ObjectNode` 전략 선택, `getNodeGroup`의 `isReactComponent`, `BranchStrategy.ts` | `getResolveSchema`, `extractSchemaInfo`, `omitEmptyObject`(→ `behaviors/objectBehavior/utils/`), `findNode`·`traversal`(→ `navigation/`), `shallowPatch`(→ `record/`). `core/parsers/*`는 교체 대상이 아니다(소유자 답 S1, WRITE-052) | `src/core/record/`, `src/core/behaviors/`, `src/core/navigation/`, `src/core/SchemaNode/`, `src/core/settle/` |

## 레거시 이동 (LANDING-159)

`src/core/nodes` → `src/__legacy__/core/nodes/`, 그것이 가져오는 `src/core/parsers` → `src/__legacy__/core/parsers/`, 옛 `src/core/__tests__` → 레거시. 옮기기 전에 옛 엔진의 벤치 기준선을 잰다(기반 PR이 고정). 옛 노드는 PR-7까지 오늘의 parse 동작을 지키고 새 parse를 가져오지 않는다.

## 착수 전 닫을 것

LANDING-062의 안건 B·C·D와 노드 구조(N2·N5·N6·N14·공개 표면의 크기·`ContextNode`)는 18라운드에서 닫혔다(18C-15·16·32–48, 18C-104·105). 프로토타입 v7은 기반 PR이 만든다.

## 검증 게이트 — 이 PR이 독립적으로 통과해야 하는 것

- **독립 검증 경계**(TEST-069): 자기 기제만 시험하고 게이트는 술어 대역 하나로 세운다. 미룬 사례는 PR을 적는다.
- **정착 루프 시험**: 프로토타입 v7 회귀 전부 이식, 타이머 없이 단언(TEST-003). 표본 (c′) "`required` 없는 `if/then`으로만 끊긴 재귀 → 정착 오류"(TEST-067).
- **union 행 시험**(TEST-077·HANDOFF §2): 규칙 A 표 전체와 동점 12건, `integer` 멤버십, 게이트 전이에서 경고등만 바뀌고 값은 그대로, `setValue({kind:'num', a:'42'})`가 직전 상태와 무관하게 `a = 42`(U7), 서로소 게이트 둘의 충돌, 되먹임 반례의 라운드 상한(WRITE-099), 경고 1회·재발송 조건(`union.mismatch-light.test.ts`).
- **공개 형**: 실제 공개 형으로 `tsc --strict`를 단언 없이 통과, `children`은 저장 배열과 같은 참조; 실패하면 소유자 물음(TEST-070).
- **벤치 게이트**(TEST-027·032): 노드 구조 행의 합격선(18C-31), "켜진 조각 N개 호스트의 무관한 키 입력" 행(18C-67, SETTLE-044), 잠복 원본 열거(18C-81), `controls.active`의 다른 호스트 읽기 재순회(18C-15).
- **엔진 수준 시나리오**: 02 §9 상황 목록 가운데 값·정착·채움·나감에 해당하는 것을 시나리오 패키지에 넣는다(LANDING-071).
- 옛 시험 전부 초록(레거시 이동 뒤).

## 완료 기준

- [ ] 새 fractal 다섯과 문서(INTENT·DETAIL), 겉면 기계 검사 셋
- [ ] 규칙 A·U7·정착 루프·예산·원본 B·diagnostics 구현과 시험
- [ ] `typeMismatch`·`typeMismatches`·`TYPE_MISMATCH` 기록
- [ ] 레거시 이동과 벤치 기준선 대조 보고
- [ ] `tsc --strict` 공개 형 시험, 벤치 게이트 통과(또는 소유자 수용)

## 원장 항목 색인 (결정·보충에 PR-2를 든 현행 항목, 기계 추출)

- BLUEPRINT-043 값 union에서 계속 그대로인 것 — `null`은 nullable로·`integer`는 `number`로 접음, 접은 집합이 둘 이상이면 `union`(행 `terminal`), `union`끼리는 접은 집합이 같을 때 같은 종류, 정합은 나열된 타입 가운데 하나, PR-1 인식·PR-2 행
- CONTROLS-073 `controls.children` 항목 — 대상 해석, 청사진 오류, 형상 밖 대상, 항목 게이트 자리, 대상별 식, 값 키의 층, 상태 키는 로컬 결합
- ERROR-204 `diagnostics`와 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화 — `setValue(V)`·`resetSubtree()`는 비우지 않음, `degraded`의 복귀는 `FormHandle.reset()`
- EVENT-071 로드가 아닌 쓰기(`setValue(V)` 포함)의 Refresh는 원본이 실제로 바뀐 노드에만(쓴 입력 제외) — "값이 같아도 낸다"는 로드의 새 수명만
- EVENT-072 `resetSubtree()`에 걸린 로드 규칙(로드 뒤 검증, `batch` 안의 즉시 정착, 한 로드에 한 번, 로드마다 다시 만듦)은 그 하위 트리에만
- LANDING-062 PR-2 노드 트리와 정착 — 단일 클래스 `SchemaNode`와 동작 행, 정착 루프, 예산 다섯과 원본 B, `diagnostics`
- LANDING-063 PR-3 파생 — `controls.derived`·`injectTo`·`unsetValue`, 같은 대상 규칙, 에지 소비
- LANDING-064 PR-4 통지와 검증 — 디스패처·`batch`·진입 사슬·`onError`의 core 쪽·`compileGuard`·배달 경로
- LANDING-065 PR-5 배열 — 배열·터미널 배열 행, 아이템 호스트, 통째 교체의 identity
- LANDING-071 위험이 모이는 곳은 PR-7 — 완화는 엔진 수준 통합 시나리오와 차등 테스트
- LANDING-077 정착 조건 5 — 되돌림 기록에 `extras`와 배열 구조
- LANDING-082 정착 지도 PR-2 — 부딪히는 코드, 그대로 쓰는 것과 옮길 자리, 새 fractal 다섯
- LANDING-092 보정 PR-2 — 되돌림 기록 항목 확정, 노드 구조, `active` 게터, 나감 비움의 하위 트리 규칙
- LANDING-150 착수 항목(18라운드) — parse 문서는 새 자리의 문서로 PR-2, `src/types/formTypeInput.ts:60-65`의 문서 주석은 PR-7
- LANDING-159 레거시는 `src/__legacy__/` — 상대 경로 유지, PR마다 옮김, 새 fractal의 가져오기 금지, PR-7 통째 삭제, 시험 글롭 포함, filid 깊이 점검, 스토리북·벤치
- LANDING-198 union 설계의 이주 점검 — PR-7 이주 목록에 LANDING-181–LANDING-186과 자사 플러그인마다 `union` 항목(권장), 바뀌지 않는 것, 이주 행마다 오늘과 새 동작을 시험으로 대조
- NODE-018 비용(추정) — 노드마다 객체 하나, 행 아홉, 숨은 클래스, 벤치 여섯
- NODE-045 `SchemaNodeRuntime` 칸의 형은 `record/`가 최소 인터페이스로 선언한다 — `import type` 포함 비순환, PR-2 순환 검사
- NODE-055 노드 구조 벤치 B1–B6의 합격선 — PR-2에서 V8과 JavaScriptCore로, B1·B5·B6은 `guard:check`의 선 안, B2는 추정의 1.5배 이내이며 오늘보다 크지 않음, B3은 같은 맵, B4는 보고만
- NODE-056 S1 parse 함수의 자리는 `src/core/behaviors/utils/parse/` — 부르는 쪽은 동작 행의 `interpret` 칸과 기본 union 입력(쓰지 않는 호출), 오늘의 `src/core/parsers/`는 레거시로 옮기고 새 parse를 가져오지 않음
- NODE-058 `union` 노드의 공개 형 — `UnionMemberType`·`UnionSchemaType`, `UnionNode`와 판별 `value`, props의 `value`·`onChange`, 종류별 `schemaType` 좁힘, 가드 `isUnionNode`, `InferSchemaNode`·`InferValueType`·`InferJSONSchema`의 사상, 참조 안정성, PR-2·PR-7 게이트
- PROCESS-027 설계 항목의 닫는 법 — 18라운드 안건 항목은 18라운드에 먼저, 나머지는 슬라이스 시작 때 짧은 설계로
- PROCESS-059 18라운드 전 외부 안건 점검 — codex와 antigravity, 검토자는 파일을 고치지 않고 검증자가 거른다
- PROCESS-060 총검증 — 18라운드 뒤 codex와 antigravity의 교차검증, 결과는 권고, 검토자는 파일을 고치지 않음
- SETTLE-042 branch 객체 `local`·`emit`의 키 순서 — `propertyKeys`, 첫 선언의 전순서, `extras` 삽입 순서; 키 집합이 같으면 패치, 바뀌면 O(키 수)로 다시 짓기
- SETTLE-044 직전 커밋의 활성 집합에서 출발하는 최적화는 채택하지 않는다 — 출발점 고정, PR-2 벤치 게이트
- SETTLE-045 하위 트리 밖을 읽는 `controls.active` 게이트는 가장 낮은 공통 조상 L에서 평가 — L 전순서의 자리, 경로 재계산은 호스트 바퀴 예산, 재순회 없음
- SETTLE-047 트리 전체 순회의 예산 — 로드와, 쓰기가 닿은 하위 트리를 도는 전체 교체 쓰기에서만
- SETTLE-048 에지와 생김의 기준 — 로드는 비우고, 로드가 아닌 쓰기(`setValue(V)` 포함)는 직전 커밋
- SURFACE-056 맨앞의 `Node`만 개명 — `NodeState`→`SchemaNodeState`, `NodeEventType`→`SchemaNodeEventType`, 종류·역할 낱말이 앞에 붙은 이름은 그대로
- TEST-027 벤치 게이트 — 옛 판보다 느린 항목은 이유를 적고 Vincent가 받아들여야 병합, 통제 가능하고 일정 수준 안
- TEST-032 벤치 시나리오 — G6의 네 상황과 새 구조 고유·메모리·14라운드 행
- TEST-067 `$ref` 재귀 게이트(PR-1·PR-2) — 스캐너 확인, 코퍼스 14종, 무한 형상 표본과 `if/then` 정착 오류 표본, 청사진 1회 비용
- TEST-069 PR-2 독립 검증 경계 — 자기 기제만 시험, 게이트 술어 대역 하나, 미룬 사례의 PR 배분, 프로토타입 회귀 배분
- TEST-070 PR-2 게이트 — 실제 공개 형으로 `tsc --strict`를 단언 없이 통과, `children`은 저장 배열과 같은 참조, 실패 시 소유자 물음
- VALUE-034 빈 호스트와 루트의 방출 — 빈 `local`은 `{}`·`[]`, `omitEmpty`는 빈 `local`을 방출하지 않음, 루트는 루트 종류의 빈 그릇, 배열 아이템의 빈자리는 `{}`·`[]`·`null`
- WRITE-052 노드마다 타입에 맞는 parse — 뜻이 그대로인 변환만(형 정규화, ADR 0013 결정 1의 이름 붙은 예외)
- WRITE-056 parse를 부르는 자리와 적용 범위
- WRITE-087 잠복 원본 열거의 반환 모양 — 읽기 전용 `{ path, value }` 배열, 전순서, 얼린 빈 배열 공유, 커밋 단계 메모
- WRITE-093 `union` 행의 해석 — 기본 spec과 유효 목록, `isMember`·`convert`·`interpret`(규칙 A: 순서 무관·멱등·무할당), 노드에 드는 모든 쓰기의 경계와 한 진입의 두 번 해석, `Merge`는 통째, `trim`은 `finishInput`, PR-2·PR-4 게이트
- WRITE-094 `setValue(V)`는 로드가 아니지만 V에 없는 경로의 원본(잠복 원본 포함)을 없음으로 만든다 — 잠복 원본이 지워지는 길 셋, 멱등은 방출 값·채움·에지에 대해
- WRITE-096 null 계약의 문구 — 로드가 아닌 쓰기로 온 `null` 아래 자식은 채움 없이 없음, 로드로 온 `null`은 채움, 쓰기 종류에 호출자 전체 교체
- WRITE-097 정리 — 억제 비트의 범위(로드·전체 교체 쓰기·`Merge`), 낡은 근거와 가리킴, LANDING-118, `setValue(undefined)`와 노드 게이트의 채움
- WRITE-098 U7 정련 — 쓰기 경계는 정적 목록(`schemaType`, `nullable`)으로 한 번, 전이 단계는 최종 유효 목록이 좁은 노드만 원래 쓰인 값을 다시 해석, 로드도 같음, 유효 목록의 정의, PR-2 게이트
- WRITE-099 U7 정련 2 — 전이 단계의 재해석은 전이 쓰기(다음 라운드, 한 라운드에 한 번, 상한이면 원본 B에는 쓰기 경계의 해석만), `VALIDATOR_COMPILE_FAILED`는 폼 수준 기록, 정적 선언 없는 이름의 게이트 없는 분기끼리 fold가 다르면 청사진 오류, `node.type`은 여덟, `union` 입력이 보내는 값, 목록 밖 `default`는 노드가 생길 때마다, `push(v)`의 스냅숏은 생성 값, `NON_JSON_WHOLE_VALUE`는 개발 모드에서만, 좁혀지지 않은 유효 목록은 `schemaType` 그 값, PR-2·PR-4·PR-1 게이트

## 원장이 PR-2에 배정한 게이트 (기계 추출; 원문은 `ledger/`와 `reviews/round-18-closing.md`)

게이트를 제목에 든 항목:

- NODE-058 `union` 노드의 공개 형 — `UnionMemberType`·`UnionSchemaType`, `UnionNode`와 판별 `value`, props의 `value`·`onChange`, 종류별 `schemaType` 좁힘, 가드 `isUnionNode`, `InferSchemaNode`·`InferValueType`·`InferJSONSchema`의 사상, 참조 안정성, PR-2·PR-7 게이트
- SETTLE-044 직전 커밋의 활성 집합에서 출발하는 최적화는 채택하지 않는다 — 출발점 고정, PR-2 벤치 게이트
- TEST-067 `$ref` 재귀 게이트(PR-1·PR-2) — 스캐너 확인, 코퍼스 14종, 무한 형상 표본과 `if/then` 정착 오류 표본, 청사진 1회 비용
- TEST-069 PR-2 독립 검증 경계 — 자기 기제만 시험, 게이트 술어 대역 하나, 미룬 사례의 PR 배분, 프로토타입 회귀 배분
- TEST-070 PR-2 게이트 — 실제 공개 형으로 `tsc --strict`를 단언 없이 통과, `children`은 저장 배열과 같은 참조, 실패 시 소유자 물음
- WRITE-093 `union` 행의 해석 — 기본 spec과 유효 목록, `isMember`·`convert`·`interpret`(규칙 A: 순서 무관·멱등·무할당), 노드에 드는 모든 쓰기의 경계와 한 진입의 두 번 해석, `Merge`는 통째, `trim`은 `finishInput`, PR-2·PR-4 게이트
- WRITE-098 U7 정련 — 쓰기 경계는 정적 목록(`schemaType`, `nullable`)으로 한 번, 전이 단계는 최종 유효 목록이 좁은 노드만 원래 쓰인 값을 다시 해석, 로드도 같음, 유효 목록의 정의, PR-2 게이트
- WRITE-099 U7 정련 2 — 전이 단계의 재해석은 전이 쓰기(다음 라운드, 한 라운드에 한 번, 상한이면 원본 B에는 쓰기 경계의 해석만), `VALIDATOR_COMPILE_FAILED`는 폼 수준 기록, 정적 선언 없는 이름의 게이트 없는 분기끼리 fold가 다르면 청사진 오류, `node.type`은 여덟, `union` 입력이 보내는 값, 목록 밖 `default`는 노드가 생길 때마다, `push(v)`의 스냅숏은 생성 값, `NON_JSON_WHOLE_VALUE`는 개발 모드에서만, 좁혀지지 않은 유효 목록은 `schemaType` 그 값, PR-2·PR-4·PR-1 게이트

18라운드 닫기 블록의 게이트 줄:

- 18C-01 `$ref` 재귀 — 정적 열거가 끝나는 곳과 무한 형상
  - PR: PR-1·PR-2(표본 (c′)는 PR-2).
  - (c′) 표본 "`required` 없는 `if/then`으로만 끊긴 재귀 → 정착 오류"를 PR-2에서 확인한다(예: `Node = { properties:{hasChild:{}}, if:{properties:{hasChild:{const:true}}}, then:{properties:{child:{$ref:Node}}} }`에 값 `{hasChild:true}`).
- 18C-15 다른 호스트를 읽는 `controls.active`의 평가 순서와 재순회
  - PR: PR-2 정착 시나리오(18C-25의 PR-2 시험)와 PR-2 벤치.
- 18C-31 노드 구조 벤치 행의 합격선
  - PR: PR-2.
- 18C-37 N6 — 레코드 형에서 공개 판별 합집합으로
  - PR: PR-2.
- 18C-39 `emit`의 키 순서(Q14)와 합성 패치(F13)
  - PR: PR-2 시험.
- 18C-67 Q15 직전 커밋의 활성 집합을 출발 가설로 쓰는 최적화
  - PR: PR-2 벤치(TEST-027·TEST-032)에 "켜진 조각 N개 호스트의 무관한 키 입력" 행을 더한다.
- 18C-81 잠복 원본 열거의 반환 모양(11-14)
  - PR: PR-2 벤치.
- 18C-88 빈 호스트와 루트의 방출 — 6라운드부터 원장 밖에 남아 있던 투영 규칙
  - PR: PR-2(객체 호스트)·PR-5(배열)
- 18C-89 union 노드의 공개 형 — `UnionNode`, 판별 `value`, 형 추론, 가드, 참조 안정성
  - PR: PR-2(노드 형)·PR-7(공개 수출)
- 18C-91 값 의미 — `isMember`·`convert`·`interpret`, 쓰기 경로, 경고등, 방출·채움, 식
  - PR: PR-2(행·`interpret`·경고등·두 번 해석·방출)·PR-4(검증 에러의 귀속과 경고 코드 확정)
- 18C-93 이주, 시험, 비용 — union 설계의 오늘 → 새 설계
  - PR: PR-7(이주 점검), 시험은 각 줄의 PR(청사진 PR-1, 행 PR-2, 검증기 PR-4, 렌더 PR-7)
- 18C-94 로드가 아닌 쓰기의 Refresh 범위 — 원본이 실제로 바뀐 노드만, "값이 같아도 낸다"는 로드만
  - PR: PR-2(정착의 Refresh 대상)·PR-7(입력의 다시 마운트)
- 18C-95 트리 전체 순회의 예산 — 로드와, 쓰기가 닿은 하위 트리를 도는 전체 교체 쓰기
  - PR: PR-2(정착)
- 18C-96 `setValue(getValue())`의 멱등 범위와 잠복 원본 — 전체 교체 쓰기는 V에 없는 경로의 원본을 없음으로 만든다
  - PR: PR-2(쓰기)
- 18C-98 진단의 초기화 — 폼 수준 로드에서만, `degraded`에서 돌아오는 길은 `FormHandle.reset()`
  - PR: PR-2(진단)
- 18C-100 null 계약의 문구 — 로드가 아닌 쓰기로 온 null 아래 자식은 채움 없이 없음, 쓰기 종류에 호출자 전체 교체
  - PR: PR-2(쓰기 종류)
- 18C-101 `resetSubtree()`에 걸린 로드 규칙의 범위 — 그 하위 트리에만
  - PR: PR-2(정착)·PR-4(검증)
- 18C-102 에지와 생김의 기준 — 로드는 비우고, 로드가 아닌 쓰기는 직전 커밋
  - PR: PR-2(정착)
- 18C-103 정리 — 억제 비트의 범위, 낡은 근거와 가리킴, LANDING-118, WRITE-090의 두 표현
  - PR: PR-2(채움)
- 18C-104 U7 정련 — 쓰기 경계는 정적 목록, 전이 단계는 원래 쓰인 값
  - PR: PR-2(두 번 해석)
- 18C-105 U7 정련 2 — 전이 라운드와 원본 B
  - PR: PR-2(전이 라운드)
  - PR: PR-2(스냅숏·유효 목록)
