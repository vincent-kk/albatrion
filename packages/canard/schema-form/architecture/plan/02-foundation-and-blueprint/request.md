# 02 기반 + 청사진 — 개발요청서

> 원장 정본: 기반은 LANDING-060·090(PR-0 코드 부분), LANDING-159(레거시 규칙), TEST-008·022·023(시나리오 원칙); 청사진은 LANDING-061(정의)·081(정착 지도)·091(보정)·088, BLUEPRINT·FRAGMENT·SCHEMA 영역. 합침은 LANDING-204. 어긋나면 원장이 이긴다.

## 우산 안의 자리

- 우산 순서 02, 첫 개발 PR. base `1.0.0-beta`, 브랜치 제안 `feat/schema-form-foundation-blueprint`. 의존 없음. 01 설계문서 PR과 병렬.
- 다음: 03 노드 트리·정착이 이 청사진을 입력으로 받고 이 하니스로 시험한다.

## 목적

두 가지를 한 PR에 담는다. (1) **기반**: 새 엔진을 시험할 하니스를 새 엔진보다 먼저 세운다 — 프로토타입 v7, 시나리오 패키지 뼈대, vitest 프로젝트 셋, 레거시 규칙, 벤치 기준선. (2) **청사진**: 스키마를 읽어 청사진(조각 표·노드 공유·유효 스키마 병합·오류 데이터)을 만드는 순수 함수 `blueprint`를 새 fractal `src/core/blueprint/`에 세운다. 트리도 React도 없이 테이블 테스트로 닫힌다. 프로토타입 v7과 시나리오 뼈대가 청사진 시험의 하니스로 바로 쓰이므로 한 PR이다(LANDING-204).

## 범위 A — 기반 (원장이 정한 내용)

- **프로토타입 v7** `architecture/spikes/round18/proto/loop-v7.mjs`: v6에 게이트 입력의 `extras` 정적 규칙, 같은 순위 동점·정착 단위 순위, 나감 에지, 전이 라운드 상한, 재계산 목록만 순회를 더한다(LANDING-060). 18라운드가 더한 것: 빈 호스트·루트의 방출(VALUE-034), 규칙 A의 세 함수 `isMember`·`convert`·`interpret`와 동점 12건(WRITE-093), 게이트 유효 목록과 U7의 두 단계·전이 라운드(WRITE-098·099). v6은 빈 루트를 `undefined`로 낸다.
- **시나리오 패키지** 비공개 `@aileron/schema-form-scenarios`: 시나리오 데이터 모듈의 형 `FormScenario`, 코어 러너와 화면 어댑터 `playScenario`의 뼈대(시나리오 감싸개와 핸들 등록 포함)(LANDING-090). 시나리오는 실행기 없는 순수 데이터 모듈(TEST-008). 패밀리 폴더와 빈 스위트에 union·fill·narrowing을 미리 둔다(TEST-077).
- **vitest `test.projects` 셋**(`unit`·`render`·`storybook`)과 addon-vitest, 세 글롭이 `src/__legacy__/**`를 포함(LANDING-090·159). 릴리스 전환 PR이 먼저 들어왔다면 `test.yml`에 vitest 세 프로젝트와 playwright chromium 단계.
- **옛 스토리의 처분 목록**, 패키지 `CLAUDE.md`의 'Render-Level Test Harness' 절 개정(LANDING-090).
- **벤치 기준선**: 옛 엔진의 마지막 `bench:baseline`을 03이 `core/nodes`를 옮기기 전에 재고 커밋을 고정한다(LANDING-159, TEST-031).

## 범위 B — 청사진 (원장이 정한 내용)

- 조각 표와 전순서, 노드 공유, `controls.discriminator` 변환(끌어올림 포함), 유효 스키마 병합 함수(LANDING-061). 병합의 원자·참조 이동은 `@winglet/common-utils` `merge`의 선택 인자로(changeset `minor`, LANDING-091).
- 잎 교차 함수 `intersectEnum`·`intersectConst`·`intersectMinimum`·`intersectMaximum`·`intersectMultipleOf`·`validateRange`를 청사진 밖의 새 fractal로 옮기고 공집합 표시를 돌려주게 바꾼다. `intersectPattern`은 옮기지 않고, 레거시의 `const` 비교는 깊은 비교로 바뀐다(LANDING-061의 충돌 줄).
- 식 컴파일러(`createDynamicFunction`과 `utils`, `JSON_POINTER_PATH_REGEX`, `getPathManager`, `DynamicFunction`)를 청사진으로 통째로 옮기고 이름으로 내보낸다. 유지 이유는 청사진 `DETAIL.md`에(LANDING-091). 역의존 표, `controls.watch` 의존의 합집합.
- 청사진 오류·경고의 데이터화(수집기 인자, 소비자 없으면 모으지 않음), `controls`·`options`의 닫힌 목록(`trim` 포함), 정적 `controls.injectTo` 대상 없음의 청사진 오류(LANDING-061; 코드 표 ERROR-164).
- **union 판정 절차**: 허용 집합 A(d)와 fold, 교집합(`integer ⊂ number`, `null`은 양쪽에 있을 때만), 단계 S0–S6, 결과 일곱, 터미널 하위 키 경고(BLUEPRINT-044), 예 E1–E42(BLUEPRINT-045), 형 없는 칸의 원시 `oneOf`·`anyOf` 합집합(BLUEPRINT-037·038), 교집합 원리 U1–U9의 정적 부분(BLUEPRINT-041), 정적 선언 없는 이름의 게이트 없는 분기 fold 충돌(WRITE-099).
- 내부 이름: 약어 없는 풀 네임(`PropertyDeclaration`, BLUEPRINT-046), 조각 타입 `SchemaFragment`(BLUEPRINT-047). 청사진 `DETAIL.md`·`type.ts`가 적는다.
- `core/INTENT.md`의 "새 노드는 `AbstractNode`를 상속한다"를 먼저 고친다(LANDING-088).
- `$ref` 재귀: 정적 열거가 끝나는 곳과 무한 형상, 스캐너 확인, 코퍼스 14종(TEST-067).

## 부딪히는 코드 · 그대로 쓰는 것 · 새 fractal (LANDING-081)

| 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- |
| `preprocessSchema`(`oneOf` 자동 감지·`virtual` `required` 재작성), `processAllOfSchema`, `schemaNodeFactory`의 스키마 변이, `BranchStrategy/utils`의 조건 사전 | `stripSchemaExtensions`의 스캐너 틀, 잎 교차 함수, `jsonPointer`, 옮긴 식 컴파일러, `src/__tests__/renderForm.tsx` 하니스(TEST-004) | `src/core/blueprint/`(옮긴 식 컴파일러 포함), 잎 교차 함수의 새 fractal(이름은 이 PR이 정한다), `packages/aileron/schema-form-scenarios/`, `architecture/spikes/round18/proto/` |

## 레거시 이동 (LANDING-159)

- 이 PR이 새로 쓰는 영역의 옛 파일만 `src/__legacy__/`로(상대 경로 유지, 별칭 접두만 바꿈). 옛 `intersect*Schema`는 새 잎 교차 함수를 가져오되 공집합 표시를 받으면 오늘처럼 던진다(규칙 2의 허용).
- 규칙 1의 ESLint `no-restricted-imports`(새 fractal → `__legacy__` 금지)를 이 PR에서 건다. filid `max-depth`(14) 통과; 실패하면 `src/__legacy__/**` 예외를 같은 PR에서.
- 레거시는 09까지 참고용으로 보존한다(LANDING-205).

## 착수 전 확인

- LANDING-061의 넷(18라운드 안건 A·B, 전환 방식의 세부, N14)은 닫혔다: A는 BLUEPRINT-036–045, B는 CONTROLS 영역의 식 언어 항목, 전환 방식은 LANDING-159, N14는 18C-38.
- 잎 교차 fractal의 이름을 이 PR이 정한다(`DETAIL.md`에 이유).

## 산출물과 완료 기준

- [ ] v7과 프로브 결과 보고서(`spikes/round18/proto/REPORT-v7.md`), 벤치 기준선 고정
- [ ] `@aileron/schema-form-scenarios` 뼈대, `FormScenario`, `playScenario`, vitest `test.projects` 셋, addon-vitest, `CLAUDE.md` 하니스 절, 옛 스토리 처분 목록
- [ ] `src/core/blueprint/` fractal(INTENT·DETAIL·진입점), 잎 교차 fractal, 식 컴파일러 이동, `merge` 선택 인자와 changeset
- [ ] 청사진 오류·경고 데이터화와 코드 상수, union 판정 절차
- [ ] 레거시 린트 규칙, `core/INTENT.md` 개정
- [ ] `verification.md`의 게이트 전부 통과

## 절차 (seiri·filid)

- filid: `src/core/blueprint/`와 잎 교차 fractal의 `INTENT.md`·`DETAIL.md`를 코드보다 먼저 쓴다. 식 컴파일러를 옛 소비자가 계속 가져오는 것은 청사진 진입점의 이름 내보내기로 하고 그 이유를 `DETAIL.md`에 적는다(외부 소비 선언). 스캔은 PR 경계에서.
- seiri: 순수 함수 한 파일에 하나, 테이블 테스트는 시험이 검증하는 것의 이름을 따른다(naming §4), 헬퍼는 함수 디렉토리 아래로(function-boundaries §4).

## 원장 항목 색인 (결정·보충에 PR-0·PR-1를 든 현행 항목, 기계 추출)

- BLUEPRINT-043 값 union에서 계속 그대로인 것 — `null`은 nullable로·`integer`는 `number`로 접음, 접은 집합이 둘 이상이면 `union`(행 `terminal`), `union`끼리는 접은 집합이 같을 때 같은 종류, 정합은 나열된 타입 가운데 하나, PR-1 인식·PR-2 행
- BLUEPRINT-044 청사진 판정 절차 — 허용 집합 A(d)와 fold, 교집합(`integer ⊂ number`, `null`은 양쪽에 있을 때만), 단계 S0–S6, 결과 일곱, 터미널 하위 키 경고 (가칭) `TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`, PR-1·PR-4 게이트
- BLUEPRINT-046 청사진 내부 이름은 약어 없이 풀 네임 — `PropertyDecl`은 `PropertyDeclaration` 같은 풀 네임으로(PROCESS-023·SURFACE-023), PR-1의 청사진 `DETAIL.md`에서 적음
- CONTROLS-073 `controls.children` 항목 — 대상 해석, 청사진 오류, 형상 밖 대상, 항목 게이트 자리, 대상별 식, 값 키의 층, 상태 키는 로컬 결합
- CONTROLS-078 `virtualRequired`는 새 설계에 없고 대체도 없다 — `options` 닫힌 목록 밖, 맨 키는 모르는 키로 검증기에
- ERROR-032 착수 조건과 PR 배치
- ERROR-164 §7.2 코드 목록 — 머리 문단과 정해진 행
- GOAL-018 C5 지원 방언 — 방언은 플러그인의 영역, 폼은 두 철자를 모두 읽음
- LANDING-056 새 core의 자리와 이름 — `blueprint`·`record`·`behaviors`·`navigation`·`settle`·`dispatch`·`validation`·`SchemaNode`와 행의 칸
- LANDING-060 PR-0 문서 — 이 문서·기록·HANDOFF·프로토타입 v7·시나리오 패키지 뼈대
- LANDING-061 PR-1 청사진 — 조각 표·노드 공유·병합 함수·잎 교차 함수 이동·식 컴파일러 이동·청사진 오류의 데이터화
- LANDING-062 PR-2 노드 트리와 정착 — 단일 클래스 `SchemaNode`와 동작 행, 정착 루프, 예산 다섯과 원본 B, `diagnostics`
- LANDING-067 PR-7 전환 — `nodeFromJSONSchema` 재구축, React 바인딩 연결, Form 속성, 바운더리, 옛 코드 삭제, UI 플러그인 이주
- LANDING-069 교체 규모 — 교체 대상, 그대로 쓰는 것, 옮기는 것, 테스트 234파일의 처분
- LANDING-071 위험이 모이는 곳은 PR-7 — 완화는 엔진 수준 통합 시나리오와 차등 테스트
- LANDING-074 정착 조건 2 — 재사용 두 문장을 사실대로: 잎 교차 함수만 재사용, 식 컴파일러는 청사진으로 통째 이동
- LANDING-081 정착 지도 PR-1 — 부딪히는 코드, 그대로 쓰는 것, 새 fractal `src/core/blueprint/`
- LANDING-088 `core/INTENT.md`의 상속 문장은 PR-1에서 먼저 고침
- LANDING-090 보정 PR-0 — 시나리오 형과 러너 뼈대, vitest 셋, addon-vitest, 옛 스토리 처분 목록, 비공개 시나리오 패키지
- LANDING-091 보정 PR-1 — 식 컴파일러 통째 이동, 잎 교차 함수 이동, `core/INTENT.md` 개정, `merge` 선택 인자와 changeset
- LANDING-097 릴리스 전환(별도 PR) — changesets 가동과 CI·배포 작업 흐름 정리, PR-8 전에 병합
- LANDING-159 레거시는 `src/__legacy__/` — 상대 경로 유지, PR마다 옮김, 새 fractal의 가져오기 금지, PR-7 통째 삭제, 시험 글롭 포함, filid 깊이 점검, 스토리북·벤치
- LANDING-198 union 설계의 이주 점검 — PR-7 이주 목록에 LANDING-181–LANDING-186과 자사 플러그인마다 `union` 항목(권장), 바뀌지 않는 것, 이주 행마다 오늘과 새 동작을 시험으로 대조
- NODE-008 책임별 fractal과 트리마다 하나인 생성 함수 `schemaNodeFactory`
- PROCESS-026 PR-1 전에 정련할 항목은 18라운드 안건이 모은다
- PROCESS-027 설계 항목의 닫는 법 — 18라운드 안건 항목은 18라운드에 먼저, 나머지는 슬라이스 시작 때 짧은 설계로
- PROCESS-059 18라운드 전 외부 안건 점검 — codex와 antigravity, 검토자는 파일을 고치지 않고 검증자가 거른다
- PROCESS-060 총검증 — 18라운드 뒤 codex와 antigravity의 교차검증, 결과는 권고, 검토자는 파일을 고치지 않음
- SCHEMA-045 런타임 교차 공집합의 표현 — `enum: []`로 통일, 범위 역전은 그대로, 같은 활성 집합이면 같은 참조
- TEST-010 화면 어댑터 playScenario — e2e와 스토리가 함께 쓰는 해석기, 비공개 패키지 @aileron/schema-form-scenarios
- TEST-011 단계 어휘 여덟과 핸들의 DOM 등록 — playScenario(scenario, 요소) 하나
- TEST-013 기존 234파일의 처분 — 그대로 산다·표면만 고친다·버리고 새로 쓴다·미분류·새로 있어야 한다
- TEST-014 새로 있어야 하는 시험 PR-1 — 청사진 테이블·병합표·제거 규칙·식 컴파일러·options/presentation 병합·전략 불일치·청사진 경고 수집
- TEST-024 도구와 설정 — vitest 프로젝트 셋, 의존, portable stories, play 안의 expect
- TEST-049 릴리스 5 — 지속 통합 시험 작업 흐름 test.yml을 새로 둔다
- TEST-054 릴리스 10 — 자리와 저장소 정리 — 별도 PR, PR-8 전에 병합
- TEST-055 릴리스 11 — 무리 밖 패키지 — @winglet/common-utils·@winglet/react-utils의 자기 changeset
- TEST-067 `$ref` 재귀 게이트(PR-1·PR-2) — 스캐너 확인, 코퍼스 14종, 무한 형상 표본과 `if/then` 정착 오류 표본, 청사진 1회 비용
- TEST-069 PR-2 독립 검증 경계 — 자기 기제만 시험, 게이트 술어 대역 하나, 미룬 사례의 PR 배분, 프로토타입 회귀 배분
- WRITE-099 U7 정련 2 — 전이 단계의 재해석은 전이 쓰기(다음 라운드, 한 라운드에 한 번, 상한이면 원본 B에는 쓰기 경계의 해석만), `VALIDATOR_COMPILE_FAILED`는 폼 수준 기록, 정적 선언 없는 이름의 게이트 없는 분기끼리 fold가 다르면 청사진 오류, `node.type`은 여덟, `union` 입력이 보내는 값, 목록 밖 `default`는 노드가 생길 때마다, `push(v)`의 스냅숏은 생성 값, `NON_JSON_WHOLE_VALUE`는 개발 모드에서만, 좁혀지지 않은 유효 목록은 `schemaType` 그 값, PR-2·PR-4·PR-1 게이트
