# 우산 순서 3 — 청사진 (원장 PR-1)

> 원장 정본: LANDING-061(정의), LANDING-081(정착 지도), LANDING-091(보정), LANDING-088, LANDING-159. 청사진의 규칙은 BLUEPRINT·FRAGMENT·SCHEMA 영역. 이 문서는 읽기 표면이며, 어긋나면 원장이 이긴다.

## 목적

스키마를 읽어 청사진(조각 표·노드 공유·유효 스키마 병합·오류 데이터)을 만드는 **순수 함수** `blueprint`를 새 fractal `src/core/blueprint/`에 세운다. 트리도 React도 없이 테이블 테스트로 닫히는 첫 단계다.

## 우산 안의 자리

- 의존: 기반 PR(시나리오 러너·vitest 프로젝트). 합침 P3을 채택하면 기반과 한 PR.
- 다음: PR-2가 이 청사진을 입력으로 받는다.

## 범위 — 원장이 정한 내용

- 조각 표와 전순서, 노드 공유, `controls.discriminator` 변환(끌어올림 포함), 유효 스키마 병합 함수(LANDING-061). 병합의 원자·참조 이동은 `@winglet/common-utils` `merge`의 선택 인자로(changeset `minor`, LANDING-091).
- 잎 교차 함수 `intersectEnum`·`intersectConst`·`intersectMinimum`·`intersectMaximum`·`intersectMultipleOf`·`validateRange`를 청사진 밖의 새 fractal로 옮기고 공집합 표시를 돌려주게 바꾼다. `intersectPattern`은 옮기지 않고, 레거시의 `const` 비교는 깊은 비교로 바뀐다(LANDING-061의 충돌 줄, 18C-05·06).
- 식 컴파일러(`createDynamicFunction`과 `utils`, `JSON_POINTER_PATH_REGEX`, `getPathManager`, `DynamicFunction`)를 청사진으로 통째로 옮기고 이름으로 내보낸다. 유지 이유는 청사진 `DETAIL.md`에(LANDING-091). 역의존 표, `controls.watch` 의존의 합집합.
- 청사진 오류·경고의 데이터화(수집기 인자, 소비자 없으면 모으지 않음), `controls`·`options`의 닫힌 목록(`trim` 포함), 정적 `controls.injectTo` 대상 없음의 청사진 오류(LANDING-061; 코드 표 ERROR-164).
- **union 판정 절차**: 허용 집합 A(d)와 fold, 교집합(`integer ⊂ number`, `null`은 양쪽에 있을 때만), 단계 S0–S6, 결과 일곱, 터미널 하위 키 경고(BLUEPRINT-044), 예 E1–E42(BLUEPRINT-045), 형 없는 칸의 원시 `oneOf`·`anyOf` 합집합(BLUEPRINT-037·038), 교집합 원리 U1–U9의 정적 부분(BLUEPRINT-041), 정적 선언 없는 이름의 게이트 없는 분기 fold 충돌(WRITE-099).
- 내부 이름: 약어 없는 풀 네임(`PropertyDeclaration`, BLUEPRINT-046), 조각 타입은 `SchemaFragment`(BLUEPRINT-047). 청사진 `DETAIL.md`·`type.ts`가 적는다.
- `core/INTENT.md`의 "새 노드는 `AbstractNode`를 상속한다"를 이 PR에서 먼저 고친다(LANDING-088). 문서가 코드보다 먼저 바뀐다.
- `$ref` 재귀: 정적 열거가 끝나는 곳과 무한 형상, 스캐너 확인, 코퍼스 14종(TEST-067, 18C-01).

## 부딪히는 코드 · 그대로 쓰는 것 · 새 fractal (LANDING-081)

| 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- |
| `preprocessSchema`(`oneOf` 자동 감지·`virtual` `required` 재작성), `processAllOfSchema`, `schemaNodeFactory`의 스키마 변이, `BranchStrategy/utils`의 조건 사전 | `stripSchemaExtensions`의 스캐너 틀, 잎 교차 함수, `jsonPointer`, 옮긴 식 컴파일러 | `src/core/blueprint/`(옮긴 식 컴파일러 포함), 잎 교차 함수의 새 fractal(이름은 이 PR이 정한다) |

## 레거시 이동 (LANDING-159)

- 이 PR이 새로 쓰는 영역의 옛 파일만 옮긴다. 옛 소비자는 import 별칭 접두만 바꾼다. 옛 `intersect*Schema`는 새 잎 교차 함수를 가져오되 공집합 표시를 받으면 오늘처럼 던진다(규칙 2의 허용).
- 규칙 1의 ESLint `no-restricted-imports`(새 fractal → `__legacy__` 금지)를 이 PR에서 건다.
- filid `max-depth`(14) 통과. 실패하면 `src/__legacy__/**` 예외를 같은 PR에서 둔다.

## 착수 전 닫을 것

LANDING-061의 넷(18라운드 안건 A·B, 전환 방식의 세부, 노드 구조 N14)은 18라운드에서 닫혔다: A는 18C-01–18C-08과 BLUEPRINT-036–045, B는 CONTROLS 영역의 식 언어 항목, 전환 방식은 LANDING-159, N14는 18C-38.

## 검증 게이트 — 이 PR이 독립적으로 통과해야 하는 것

- 테이블 테스트: 청사진 판정 예 E1–E42(BLUEPRINT-045) 전부, union 시험 목록의 청사진 줄(TEST-077), 오류 코드마다 한 사례(ERROR-164의 청사진 행).
- `$ref` 재귀 게이트: 코퍼스 14종, 무한 형상 표본, 청사진 1회 비용(TEST-067; 표본 (c′)는 PR-2).
- 잎 교차 함수 이동 뒤 옛 시험 전부 초록(옛 동작 유지, 예외는 `const` 깊은 비교).
- 레거시 규칙 1 린트 통과, filid `max-depth` 통과.
- 이주 점검의 청사진 줄: `['object','null']`·`['null']`·`[]`·`['string','string']`·`integer`/`number` `allOf`의 `schemaType`이 오늘과 같다(LANDING-198).

## 완료 기준

- [ ] `src/core/blueprint/` fractal(INTENT·DETAIL·진입점), 잎 교차 fractal, 식 컴파일러 이동
- [ ] `merge` 선택 인자와 changeset(`minor`)
- [ ] 청사진 오류·경고 데이터화와 코드 상수
- [ ] 테이블 테스트·`$ref` 코퍼스·union 청사진 시험 초록
- [ ] `core/INTENT.md` 개정, 레거시 린트 규칙

## 원장 항목 색인 (결정·보충에 PR-1를 든 현행 항목, 기계 추출)

- BLUEPRINT-043 값 union에서 계속 그대로인 것 — `null`은 nullable로·`integer`는 `number`로 접음, 접은 집합이 둘 이상이면 `union`(행 `terminal`), `union`끼리는 접은 집합이 같을 때 같은 종류, 정합은 나열된 타입 가운데 하나, PR-1 인식·PR-2 행
- BLUEPRINT-044 청사진 판정 절차 — 허용 집합 A(d)와 fold, 교집합(`integer ⊂ number`, `null`은 양쪽에 있을 때만), 단계 S0–S6, 결과 일곱, 터미널 하위 키 경고 (가칭) `TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`, PR-1·PR-4 게이트
- BLUEPRINT-046 청사진 내부 이름은 약어 없이 풀 네임 — `PropertyDecl`은 `PropertyDeclaration` 같은 풀 네임으로(PROCESS-023·SURFACE-023), PR-1의 청사진 `DETAIL.md`에서 적음
- CONTROLS-073 `controls.children` 항목 — 대상 해석, 청사진 오류, 형상 밖 대상, 항목 게이트 자리, 대상별 식, 값 키의 층, 상태 키는 로컬 결합
- CONTROLS-078 `virtualRequired`는 새 설계에 없고 대체도 없다 — `options` 닫힌 목록 밖, 맨 키는 모르는 키로 검증기에
- ERROR-032 착수 조건과 PR 배치
- ERROR-164 §7.2 코드 목록 — 머리 문단과 정해진 행
- GOAL-018 C5 지원 방언 — 방언은 플러그인의 영역, 폼은 두 철자를 모두 읽음
- LANDING-056 새 core의 자리와 이름 — `blueprint`·`record`·`behaviors`·`navigation`·`settle`·`dispatch`·`validation`·`SchemaNode`와 행의 칸
- LANDING-061 PR-1 청사진 — 조각 표·노드 공유·병합 함수·잎 교차 함수 이동·식 컴파일러 이동·청사진 오류의 데이터화
- LANDING-062 PR-2 노드 트리와 정착 — 단일 클래스 `SchemaNode`와 동작 행, 정착 루프, 예산 다섯과 원본 B, `diagnostics`
- LANDING-067 PR-7 전환 — `nodeFromJSONSchema` 재구축, React 바인딩 연결, Form 속성, 바운더리, 옛 코드 삭제, UI 플러그인 이주
- LANDING-069 교체 규모 — 교체 대상, 그대로 쓰는 것, 옮기는 것, 테스트 234파일의 처분
- LANDING-071 위험이 모이는 곳은 PR-7 — 완화는 엔진 수준 통합 시나리오와 차등 테스트
- LANDING-074 정착 조건 2 — 재사용 두 문장을 사실대로: 잎 교차 함수만 재사용, 식 컴파일러는 청사진으로 통째 이동
- LANDING-081 정착 지도 PR-1 — 부딪히는 코드, 그대로 쓰는 것, 새 fractal `src/core/blueprint/`
- LANDING-088 `core/INTENT.md`의 상속 문장은 PR-1에서 먼저 고침
- LANDING-091 보정 PR-1 — 식 컴파일러 통째 이동, 잎 교차 함수 이동, `core/INTENT.md` 개정, `merge` 선택 인자와 changeset
- LANDING-159 레거시는 `src/__legacy__/` — 상대 경로 유지, PR마다 옮김, 새 fractal의 가져오기 금지, PR-7 통째 삭제, 시험 글롭 포함, filid 깊이 점검, 스토리북·벤치
- LANDING-198 union 설계의 이주 점검 — PR-7 이주 목록에 LANDING-181–LANDING-186과 자사 플러그인마다 `union` 항목(권장), 바뀌지 않는 것, 이주 행마다 오늘과 새 동작을 시험으로 대조
- NODE-008 책임별 fractal과 트리마다 하나인 생성 함수 `schemaNodeFactory`
- PROCESS-026 PR-1 전에 정련할 항목은 18라운드 안건이 모은다
- PROCESS-027 설계 항목의 닫는 법 — 18라운드 안건 항목은 18라운드에 먼저, 나머지는 슬라이스 시작 때 짧은 설계로
- PROCESS-059 18라운드 전 외부 안건 점검 — codex와 antigravity, 검토자는 파일을 고치지 않고 검증자가 거른다
- PROCESS-060 총검증 — 18라운드 뒤 codex와 antigravity의 교차검증, 결과는 권고, 검토자는 파일을 고치지 않음
- SCHEMA-045 런타임 교차 공집합의 표현 — `enum: []`로 통일, 범위 역전은 그대로, 같은 활성 집합이면 같은 참조
- TEST-014 새로 있어야 하는 시험 PR-1 — 청사진 테이블·병합표·제거 규칙·식 컴파일러·options/presentation 병합·전략 불일치·청사진 경고 수집
- TEST-055 릴리스 11 — 무리 밖 패키지 — @winglet/common-utils·@winglet/react-utils의 자기 changeset
- TEST-067 `$ref` 재귀 게이트(PR-1·PR-2) — 스캐너 확인, 코퍼스 14종, 무한 형상 표본과 `if/then` 정착 오류 표본, 청사진 1회 비용
- TEST-069 PR-2 독립 검증 경계 — 자기 기제만 시험, 게이트 술어 대역 하나, 미룬 사례의 PR 배분, 프로토타입 회귀 배분
- WRITE-099 U7 정련 2 — 전이 단계의 재해석은 전이 쓰기(다음 라운드, 한 라운드에 한 번, 상한이면 원본 B에는 쓰기 경계의 해석만), `VALIDATOR_COMPILE_FAILED`는 폼 수준 기록, 정적 선언 없는 이름의 게이트 없는 분기끼리 fold가 다르면 청사진 오류, `node.type`은 여덟, `union` 입력이 보내는 값, 목록 밖 `default`는 노드가 생길 때마다, `push(v)`의 스냅숏은 생성 값, `NON_JSON_WHOLE_VALUE`는 개발 모드에서만, 좁혀지지 않은 유효 목록은 `schemaType` 그 값, PR-2·PR-4·PR-1 게이트

## 원장이 PR-1에 배정한 게이트 (기계 추출; 원문은 `ledger/`와 `reviews/round-18-closing.md`)

게이트를 제목에 든 항목:

- BLUEPRINT-044 청사진 판정 절차 — 허용 집합 A(d)와 fold, 교집합(`integer ⊂ number`, `null`은 양쪽에 있을 때만), 단계 S0–S6, 결과 일곱, 터미널 하위 키 경고 (가칭) `TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`, PR-1·PR-4 게이트
- TEST-067 `$ref` 재귀 게이트(PR-1·PR-2) — 스캐너 확인, 코퍼스 14종, 무한 형상 표본과 `if/then` 정착 오류 표본, 청사진 1회 비용
- WRITE-099 U7 정련 2 — 전이 단계의 재해석은 전이 쓰기(다음 라운드, 한 라운드에 한 번, 상한이면 원본 B에는 쓰기 경계의 해석만), `VALIDATOR_COMPILE_FAILED`는 폼 수준 기록, 정적 선언 없는 이름의 게이트 없는 분기끼리 fold가 다르면 청사진 오류, `node.type`은 여덟, `union` 입력이 보내는 값, 목록 밖 `default`는 노드가 생길 때마다, `push(v)`의 스냅숏은 생성 값, `NON_JSON_WHOLE_VALUE`는 개발 모드에서만, 좁혀지지 않은 유효 목록은 `schemaType` 그 값, PR-2·PR-4·PR-1 게이트

18라운드 닫기 블록의 게이트 줄:

- 18C-01 `$ref` 재귀 — 정적 열거가 끝나는 곳과 무한 형상
  - PR: PR-1·PR-2(표본 (c′)는 PR-2).
- 18C-90 청사진 판정 절차 — 허용 집합, 단계 S0–S6, 예, 오류 코드, 터미널 하위 키 경고
  - PR: PR-1(청사진 판정)·PR-4(ajv8 설정)
- 18C-93 이주, 시험, 비용 — union 설계의 오늘 → 새 설계
  - PR: PR-7(이주 점검), 시험은 각 줄의 PR(청사진 PR-1, 행 PR-2, 검증기 PR-4, 렌더 PR-7)
- 18C-105 U7 정련 2 — 전이 라운드와 원본 B
  - PR: PR-1(청사진 판정)
