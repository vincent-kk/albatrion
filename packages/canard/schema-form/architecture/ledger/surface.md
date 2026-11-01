# 단일 원장 — 공개 표면

기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 이 원장이 인용하는 `path:line`은 모두 이 커밋의 줄 번호다. 정본 우선순위는 `ledger/README.md` §1을 따른다. 이 영역의 정본은 `08-design-a-to-z.md` §13(공개 표면 표와 이름 규칙)이고, `02-target-overview.md` §6의 행은 같은 자리의 보충으로 인용한다(`02`는 새 결정을 만들지 않는다고 스스로 적는다). `05-before-after.md` §3, `06-conclusions.md` §5.6·§6, `07-conclusions.md` §6은 그때의 기록이다. 거기 적힌 규칙이 뒤 문서에 없으면 항목이 되고, 뒤 문서가 바꿨으면 "대체됨"으로 남는다. `07` §6.1의 `&키`·`control` 철자는 15라운드에 `controls.키`로 바뀌었으므로 그 행들은 "대체됨"이며, 이름 낱말 자체는 `controls` 안에서 살아 있다(SURFACE-022와 CONTROLS의 키 항목). `&default`는 철자와 함께 뜻도 바뀌었다(표현식에서 값으로, CONTROLS-018). 다른 영역 항목과 같은 규칙은 출처 칸 끝에 "같은 규칙"으로 번호를 적는다.

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| SURFACE-001 | 스키마 그룹 셋 — `controls`·`options`·`presentation`, 맨 키는 JSON Schema의 것 | 현행 | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:14` 6), 소유자 답(`reviews/round-15-decisions.md:15` 7) |
| SURFACE-002 | 렌더 계층(노드 단위)의 이름 — `FormTypeInput`, 정의 목록, 렌더러 넷, 공통 props와 문맥 | 현행 | 소유자 답(`reviews/round-15-decisions.md:21` 8), 편집자 결정(15라운드, `reviews/round-15-decisions.md:50`; Form 속성 넷) |
| SURFACE-003 | 합성 API — `Form.Group`·`Form.Label`·`Form.Input`·`Form.Error`·`Form.Render`와 props | 현행 | 소유자 답(`reviews/round-15-decisions.md:21` 8) |
| SURFACE-004 | 쓰기 옵션 — 비트마스크 `SetValueOption`의 네 멤버 | 현행 | 소유자 답(`reviews/round-7-convergence.md:144`; 비트마스크), 편집자 결정(9라운드, `reviews/round-9-spec.md:97` 세 곳의 추천을 합쳐 소유자가 동의; `DisableAutomaticWrites`·`EnableAutomaticWrites`) |
| SURFACE-005 | 쓰기 — `setValue`, `FormHandle.reset`(억제 비트 둘만), 배열 다섯, `setSelectedBranch` 없음 | 현행 | 편집자 결정(9라운드, `07-conclusions.md:350` N6 나머지 그대로), 소유자 답(`reviews/round-10-owner-answers.md:9` A-3; `setSelectedBranch` 없음), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-44) |
| SURFACE-006 | 값 읽기 — `value`, `outputValue`, `getInactiveValues(path)`, `FormHandle.getValue()` | 현행 | 편집자 결정(8라운드 D-23, `06-conclusions.md:186-190`), 편집자 결정(9라운드 N3 그대로, `07-conclusions.md:347`), 소유자 답(`reviews/round-18-owner-answers.md:18` 12-8), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-44) |
| SURFACE-007 | 진단 — `diagnostics`, 이벤트 `UpdateDiagnostics`, Form 속성 `onDiagnosticsChange` | 현행 | 편집자 결정(8라운드 N4, `06-conclusions.md:362`), 편집자 결정(9라운드 N4 그대로, `07-conclusions.md:348`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98) |
| SURFACE-008 | 배치 — `batch(fn)` | 현행 | 소유자 답(`00-goals.md:151` G7; 배치 유지), 편집자 결정(4라운드, `adr/0008-event-system.md:3`), 편집자 결정(9라운드, `07-conclusions.md:350` N6 나머지 그대로) |
| SURFACE-009 | 경로 조회 — `find`·`findNodes`, 터미널 아래 경로는 노드 없음, `findAll`은 `findNodes`로 | 현행 | 원리(`06-conclusions.md:175` P2·G4; `find`), 편집자 결정(10라운드 추정 채택 규칙, `07-conclusions.md:209`; `findNodes`), 편집자 결정(17라운드, `08-design-a-to-z.md:478` 이주 행 46; `findAll`) |
| SURFACE-010 | 노드 — 단일 클래스 `SchemaNode`, 게터 `type`·`strategy`, 가드 아홉, 겉면의 크기는 18라운드 안건 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 소유자 답(`reviews/round-17-owner-answers.md:23` `kind` 필드), 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §6; 가드 아홉, 공개 형에서 뺀 필드, 멤버 목록), 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:86-88`; 겉면의 크기), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-32·18C-02), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4) |
| SURFACE-011 | 명령 — `focus`, `select`, `refresh`, `remount` | 현행 | 편집자 결정(8라운드 N6 명령, `06-conclusions.md:387`), 편집자 결정(9라운드, `07-conclusions.md:350` N6 나머지 그대로), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-42), 소유자 답(`reviews/round-18-owner-answers.md:40` 설계서 메모 3) |
| SURFACE-012 | Form 속성(렌더 계층) — 전체 잠금, `unsetOnInactive`, `disableAutomaticWrites`, `onError`, `onDiagnosticsChange`, `validatorFactory` | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리; `readOnly`·`disabled`), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 편집자 결정(9라운드, `reviews/round-9-spec.md:97` 세 곳의 추천을 합쳐 소유자가 동의; `disableAutomaticWrites`), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4; `onError`), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸; `onError`), 편집자 결정(8라운드 N4, `06-conclusions.md:362`; `onDiagnosticsChange`), 소유자 답(`reviews/round-14-owner-answers.md:13` O-7; `validatorFactory`) |
| SURFACE-013 | 검증기 플러그인 계약 — `compile`, `compileGuard`, `rejectedKey` | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:19` 조건 1; `compile`·`compileGuard`), 편집자 결정(5라운드 도출, `reviews/round-5-derivations.md:26` C-4; `rejectedKey`) |
| SURFACE-014 | 오류 클래스 — `JSONSchemaError`, `SchemaFormError`, `ValidationError`, `UnhandledError`, `ValidationIssue`, 기록 형과 코드 형 | 현행 | 편집자 결정(17라운드, ADR 0014 4판 채택 `adr/0014-error-policy.md:3`) |
| SURFACE-015 | 유효 스키마 변경 이벤트의 타입·payload·구독 표면 | 대체됨(→ SURFACE-057, EVENT-064) | 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:108`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-52) |
| SURFACE-016 | 이름 규칙 1 — `FormType…`은 노드 단위 조각과 그것을 그리는 것 | 현행 | 소유자 답(`reviews/round-15-decisions.md:21` 8) |
| SURFACE-017 | 이름 규칙 2 — `…Renderer` 접미는 그리는 것 | 현행 | 소유자 답(`reviews/round-15-decisions.md:21` 8) |
| SURFACE-018 | 이름 규칙 3 — `Form.X`는 `path`를 받는 합성 API, props는 `FormXProps` | 현행 | 소유자 답(`reviews/round-15-decisions.md:21` 8) |
| SURFACE-019 | 구성 요소를 담는 키는 파스칼, props 객체 키는 그 props 타입의 이름 | 현행 | 편집자 결정(15라운드, `reviews/round-15-decisions.md:51`) |
| SURFACE-020 | 이 패키지에서 `controls`는 규칙, `Group`은 한 필드 단위 | 현행 | 편집자 결정(15라운드, `reviews/round-15-decisions.md:54`) |
| SURFACE-021 | 제어 키는 `controls` 안에만 적는다 | 중복(→ CONTROLS-016) | 소유자 답(`reviews/round-15-decisions.md:12` 4) |
| SURFACE-022 | 평면 `&` 축약과 `computed` 별칭은 없다 | 중복(→ CONTROLS-016) | 소유자 답(`reviews/round-15-decisions.md:13` 5) |
| SURFACE-023 | 이름 원칙 — 줄임말이 아닌 풀 네임과 저장소의 짝 관례 | 현행 | 소유자 답(`reviews/round-7-convergence.md:144`), 편집자 결정(8라운드 이름 짓기, `06-conclusions.md:324`; 저장소 관례의 짝) |
| SURFACE-024 | 쓰기 옵션은 옵션 객체가 아니라 비트마스크 | 현행 | 소유자 답(`reviews/round-7-convergence.md:144`) |
| SURFACE-025 | `Overwrite`와 `Merge` — 기본값, `Overwrite ⊇ Merge`, 함께 주면 `Overwrite` | 대체됨(→ SURFACE-051) | 편집자 결정(8라운드 N1, `06-conclusions.md:329`), 편집자 결정(9라운드, `07-conclusions.md:345` N1의 `Overwrite`·`Merge` 그대로), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16) |
| SURFACE-026 | 대체됨: 억제 비트 `DisableSchemaDefaults`·`EnableSchemaDefaults` | 대체됨(→ SURFACE-039) | 편집자 결정(8라운드 N1, `06-conclusions.md:329`) |
| SURFACE-027 | 대체됨: 둘 다 없으면 Form 속성 `disableSchemaDefaults`를 따르고 둘 다 주면 억제가 이긴다 | 대체됨(→ SURFACE-039) | 편집자 결정(8라운드 N1, `06-conclusions.md:338`) |
| SURFACE-028 | 대체됨: Form 속성은 `disableSchemaDefaults`, 공개 합성 멤버는 두지 않는다 | 대체됨(→ SURFACE-039, SURFACE-004) | 편집자 결정(8라운드 N1, `06-conclusions.md:338`) |
| SURFACE-029 | 대체됨: 분기 선택 명령 `setSelectedBranch`, 칸 `selectedBranch`, 계산된 `activeBranch`(06 N2) | 대체됨(→ SURFACE-045) | 편집자 결정(8라운드 N2, `06-conclusions.md:346`) |
| SURFACE-030 | 값의 세 읽기 표 — 원본은 공개 이름 없음, `value`, `outputValue` | 중복(→ VALUE-011) | 편집자 결정(8라운드 N3, `06-conclusions.md:350`), 편집자 결정(9라운드 N3 그대로, `07-conclusions.md:347`) |
| SURFACE-031 | `FormHandle.getValue()` 유지, 노드 `getValue()` 없음, `enhancedValue` 사라짐, `setValue(updater)`의 `prev` | 현행 | 편집자 결정(8라운드 N3, `06-conclusions.md:350`), 편집자 결정(9라운드 N3 그대로, `07-conclusions.md:347`) |
| SURFACE-032 | 대체됨: FE 전용 키는 `&`로 시작하는 평면 키, `computed` 컨테이너 제거(06 N5) | 대체됨(→ SURFACE-001, SURFACE-021, SURFACE-022, CONTROLS-016) | 편집자 결정(8라운드 N5, `06-conclusions.md:379`) |
| SURFACE-033 | 대체됨: 공개 쓰기 API와 배열 API 제안(06 N6) | 대체됨(→ SURFACE-005, SURFACE-008, SURFACE-045, WRITE-050) | 편집자 결정(8라운드 N6, `06-conclusions.md:386`) |
| SURFACE-034 | `write`는 공개 API가 아니다 — 입력 출처 비트로 흡수 | 현행(부정 결정) | 편집자 결정(8라운드 N6, `06-conclusions.md:389`), 편집자 결정(9라운드, `07-conclusions.md:350` N6 나머지 그대로) |
| SURFACE-035 | 대체됨: `removeKey` 보류, 둔다면 `removeUndeclaredKey(key)` | 대체됨(→ WRITE-010) | 편집자 결정(8라운드 N6, `06-conclusions.md:390`) |
| SURFACE-036 | 대체됨: `computed`를 대신할 컨테이너 `control`(`&키`와 `control.키`는 두 철자) | 대체됨(→ SURFACE-001, SURFACE-022, CONTROLS-016) | 소유자 답(`reviews/round-9-spec.md:27` 축9), 편집자 결정(9라운드, `reviews/round-9-spec.md:97` 세 곳의 추천을 합쳐 소유자가 동의) |
| SURFACE-037 | 대체됨(철자): 값 지우기 `&unsetValue` — 이름 낱말은 `controls.unsetValue`로 현행 | 대체됨(→ SURFACE-022, CONTROLS-016, CONTROLS-028) | 소유자 답(`reviews/round-9-spec.md:68` pristine 정정), 소유자 답(`reviews/round-12-owner-answers.md:13` 5) |
| SURFACE-038 | 대체됨(철자): `dirty`·`touched` 초기화 `&resetInteraction`(옛 `&pristine`) — 이름 낱말은 `controls.resetInteraction`로 현행 | 대체됨(→ SURFACE-022, CONTROLS-016, CONTROLS-029) | 소유자 답(`reviews/round-10-owner-answers.md:32` E-5) |
| SURFACE-039 | 로드 시 예약 층의 자동 쓰기 억제 — `DisableAutomaticWrites`·`EnableAutomaticWrites`, Form 속성 `disableAutomaticWrites` | 현행 | 편집자 결정(9라운드, `reviews/round-9-spec.md:97` 세 곳의 추천을 합쳐 소유자가 동의; 이름), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 나감 비움은 정책이 참인 노드만), 편집자 결정(13라운드, `07-conclusions.md:311`; 억제 범위에 나감 비움을 넣음), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-103), 편집자 결정(18라운드, WRITE-078; trim도 억제 비트 대상) |
| SURFACE-040 | 대체됨(철자): 조각 게이트는 `&active`로 통합, `&if` 은퇴 — 뜻은 `controls.active`로 현행 | 대체됨(→ SURFACE-022, CONTROLS-016, CONTROLS-021, CONTROLS-049) | 소유자 답(`reviews/round-10-owner-answers.md:8` A-2), 편집자 결정(9라운드, `07-conclusions.md:135` 4.24 노드 게이트) |
| SURFACE-041 | 대체됨: 없음인 키 채우기 `&default`(표준 키워드의 표현식 판) — 이름은 `controls.default`, 식이 아니라 값 | 대체됨(→ SURFACE-022, CONTROLS-016, CONTROLS-025, CONTROLS-018) | 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천), 편집자 결정(9라운드, `reviews/round-9-spec.md:97` 세 곳의 추천을 합쳐 소유자가 동의) |
| SURFACE-042 | 대체됨(철자): 다른 노드 쓰기 `&injectTo`를 예약 층에 편입 — 이름 낱말은 `controls.injectTo`로 현행 | 대체됨(→ SURFACE-022, CONTROLS-016, CONTROLS-027) | 소유자 답(`reviews/round-9-spec.md:32` 요약 발언), 소유자 답(`reviews/round-9-spec.md:26` 축8) |
| SURFACE-043 | 대체됨(철자): 자식 집합 제어 — 조각 범위 제어와 `&children` 블록 둘 다, `targets`와 `control` — 뜻은 `controls.children`으로 현행 | 대체됨(→ SURFACE-022, CONTROLS-016, CONTROLS-030, CONTROLS-042) | 소유자 답(`reviews/round-9-spec.md:108` 자식 집합 제어), 소유자 답(`reviews/round-10-owner-answers.md:16` C-15), 소유자 답(`reviews/round-10-owner-answers.md:21` D-14) |
| SURFACE-044 | 대체됨(철자): 명시 판별 `&discriminator` — 이름 낱말은 `controls.discriminator`로 현행 | 대체됨(→ SURFACE-022, CONTROLS-016, CONTROLS-031) | 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-12-owner-answers.md:9` 2) |
| SURFACE-045 | 분기 선택 명령은 지워짐 — `setSelectedBranch`·`selectedBranch`·`activeBranch`, `oneOfIndex`·`anyOfIndices`도 대체물 없이 | 현행(부정 결정) | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 편집자 결정(10라운드, `07-conclusions.md:142`) |
| SURFACE-046 | 대체됨: N5 판정 — `control`로 이름만 바꾸고 `&`는 제어 키와 `control.*`에만(13라운드) | 대체됨(→ SURFACE-021, SURFACE-022, CONTROLS-016) | 소유자 답(`reviews/round-13-owner-answers.md:9` 3 폼 전용 키 접두), 소유자 답(`reviews/round-9-spec.md:27` 축9) |
| SURFACE-047 | 오늘의 공개 이름 가운데 `Node`로 줄인 것에 이름 규칙을 적용할지와 그 이주 | 대체됨(→ SURFACE-056) | 소유자 답(`reviews/round-17-owner-answers.md:53` `Node` 이름 규칙), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름; 가드 이름 유지), 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:91`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-47) |
| SURFACE-048 | 대체됨: 제어 키 문법의 세 부류 — 형용사·명사·동사(`injectTo`는 동사) | 대체됨(→ CONTROLS-019) | 편집자 결정(9라운드, `07-conclusions.md:339`) |
| SURFACE-049 | 대체됨: 억제는 전체 교체가 일으킨 정착에서만 듣고, `fire`를 고르면 `injectTo`·`&derived`까지 끈다 | 대체됨(→ SURFACE-039) | 편집자 결정(8라운드 N1, `06-conclusions.md:341`) |
| SURFACE-050 | 값 읽기 이름 확정 — `value`·`outputValue`, `FormHandle.getValue()` 유지, `submit`은 쓰지 않음, 노드는 getter | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:21` 12-8 이어서) |
| SURFACE-051 | `Overwrite`와 `Merge`는 서로 겹치지 않는 비트 — 함께 주면 `INVALID_WRITE_OPTION`, `Overwrite`는 기본값 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16) |
| SURFACE-052 | 정합 상태(경고등)의 공개 이름 — 노드 getter `valueTypeMismatch`(가칭)와 이를 판별자로 한 공개 합집합, `FormTypeInputProps`의 같은 이름 칸 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-89), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4) |
| SURFACE-053 | 루트 전용 넷(`globalState`·`globalErrors`·`setSubtreeState`·`clearSubtreeState`)은 모든 노드의 멤버 — `FormHandle`은 루트에 위임 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-41) |
| SURFACE-054 | 노드의 공개 `schemaPath`·`key`는 두지 않는다 — 라우팅은 청사진 `id`, React key는 인스턴스 신원 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-43) |
| SURFACE-055 | `node.context` getter와 `FormTypeInputProps.context`는 루트의 맥락 객체를 준다 — 갱신은 바인딩 전용 통로 `setContext`(가칭) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-45) |
| SURFACE-056 | 맨앞의 `Node`만 개명 — `NodeState`→`SchemaNodeState`, `NodeEventType`→`SchemaNodeEventType`, 종류·역할 낱말이 앞에 붙은 이름은 그대로 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-47) |
| SURFACE-057 | 공개 이벤트 타입에 `UpdateJsonSchema`(가칭)를 더한다(minor) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-52) |
| SURFACE-058 | 공개 겉면의 크기 — NODE-019의 하위 가지를 닫는 블록, 겉면 멤버는 약 57개, `subnodes`·`schemaPath`·`key`·`publish`는 빠짐 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-32), 소유자 답(`reviews/round-18-owner-answers.md:40` 설계서 메모 3), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4) |
| SURFACE-059 | 원장이 바꾸지 않은 오늘의 공개 표면은 그대로 — `FormProps` 열아홉 칸·`FormHandle` 열여섯 멤버·`ValidationMode`·공개 이벤트 형 여섯, PR-7 이주 점검 게이트 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-87) |
| SURFACE-060 | 안쪽 코드도 `SchemaNodeState`·`SchemaNodeEventType` 한 이름 — 공개 표면과 안쪽 코드에 함께, 한 형에 한 이름, 별칭 없음 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:25` 18C 검토 3번) |
| SURFACE-061 | 경고등의 공개 이름 확정 — 게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`; 뜻은 VALUE-037 그대로, 주석에 `schemaType`·유효 목록 기준 한 줄, 시험 파일 이름은 그대로 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:41` 반영 칸; 시험 파일 이름) |
| SURFACE-062 | 하위 방문 — `visitSubtree(visitor)`: 자기 포함 전위, `false`는 하위 건너뛰기, 형상 한정, 순회 안의 첫 쓰기에서 batch가 열려 끝에 한 번 정착(지연 batch), 내부 순회는 `visitFieldNodes` 한 벌 | 현행 | 소유자 답(`reviews/round-342-owner-answers.md:11` "좋아 그렇게 가죠"), 편집자 결정(342라운드, 반영 칸; 이름·순서·형제 정순) |
| SURFACE-063 | 캐시 계층(446라운드) — 소비자 소유 키 캐시는 `src/app/cache` fractal(도메인 계약: `resolve` 멱등, 값 불변, `invalidate`·`clear`는 항목 제거만, 세대 번호), 엔진 파생 캐시는 `getBlueprintDerived`·`getHostDerived` 레코드 둘, 값·노드 키 메모의 자리, 모드 플래그는 `engineModes`, 공개 API는 `FormHandle.rebuild(option?)` 하나 | 현행 | 소유자 답(`reviews/round-446-owner-answers.md:9-10` 캐시 계층의 자리와 폼 핸들), 편집자 결정(446라운드, `reviews/round-446-closing.md` 446C-04) |
| SURFACE-064 | reset과 rebuild의 관계(447라운드) — `reset`은 언제나 그 폼의 기존 청사진을 유지, 새 청사진은 그 폼 자신의 `rebuild`나 새 마운트에서만, 폐기된 캐시 항목은 이후의 마운트와 rebuild에만 영향, 446C-04 (마)의 "다른 폼은 다음 reset에서 새 청사진" 대체 | 현행 | 편집자 결정(447라운드, `reviews/round-447-closing.md` 447C-02) |
| SURFACE-065 | 엔진 캐시의 배치 원칙(448라운드) — 상수·플러그인 구성 상태는 캐시 밖, 노드·런타임 키 가변 메모는 트리 소유 WeakMap(노드 칸 금지), 생성 때의 증거는 청사진 사실, 섞인 수명은 분리, 셋째 모드도 engineModes, 파생 레코드는 단방향 공통 저장소와 소유자별 builder, 검증기 장부는 도메인 계약 밖이라 검증 모듈에 둠(446C-04 (가)의 편차, 대기열) | 현행 | 편집자 결정(448라운드, `reviews/round-448-closing.md` 448C-06) |

## 항목

### SURFACE-001 스키마 그룹 셋 — `controls`·`options`·`presentation`, 맨 키는 JSON Schema의 것

- 결정:
  > | 자리 | 이름 | 뜻 |
  > | --- | --- | --- |
  > | 스키마 그룹 | `controls`, `options`, `presentation` | §3. 맨 키는 JSON Schema의 것 |
- 보충:
  > 소유자(15라운드 7): "그룹 이름은 presentation으로 하자" (`reviews/round-15-decisions.md:15`)
  > "그룹 이름은 명사이고 수는 뜻을 따른다. 셀 수 있는 항목의 지도는 복수(`controls`, `options`), 하나의 면은 단수(`presentation`)." (`08-design-a-to-z.md:130`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:407`(정본), `08-design-a-to-z.md:130`, `reviews/round-15-decisions.md:12,14,15`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:14` 6), 소유자 답(`reviews/round-15-decisions.md:15` 7)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:12-15`

### SURFACE-002 렌더 계층(노드 단위)의 이름 — `FormTypeInput`, 정의 목록, 렌더러 넷, 공통 props와 문맥

- 결정:
  > | 자리 | 이름 | 뜻 |
  > | --- | --- | --- |
  > | 렌더 계층(노드 단위) | `FormTypeInput`과 정의 목록 `formTypeInputDefinitions`. 렌더러 넷 `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`(넷 모두 플러그인 키이자 같은 이름의 Form 속성. 오늘의 `FormGroup`·`FormLabel`·`FormInput`·`FormError`와 `CustomFormTypeRenderer`). 공통 props `FormTypeRendererProps`, 문맥 `FormTypeRendererContext` | 15라운드 |
- 보충:
  > "| 한 단위(라벨+입력란+오류)를 그리는 것 | 플러그인 `FormGroup`, Form 속성 `CustomFormTypeRenderer`, 타입 `FormTypeRenderer`, 대체 구현 `FormGroupRenderer` | `FormTypeGroupRenderer`(플러그인 키·Form 속성·타입이 같은 이름), 대체 구현 `FallbackFormTypeGroupRenderer` |" (`reviews/round-15-decisions.md:32`)
  > "| 라벨을 그리는 것 | 플러그인 `FormLabel`, 대체 구현 `FormLabelRenderer` | `FormTypeLabelRenderer`, `FallbackFormTypeLabelRenderer` |" (`reviews/round-15-decisions.md:33`)
  > "| 입력란 자리를 그리는 것(`FormTypeInput`을 앉힌다) | 플러그인 `FormInput`, 대체 구현 `FormInputRenderer` | `FormTypeInputRenderer`, `FallbackFormTypeInputRenderer` |" (`reviews/round-15-decisions.md:34`)
  > "| 오류를 그리는 것 | 플러그인 `FormError`, 대체 구현 `FormErrorRenderer` | `FormTypeErrorRenderer`, `FallbackFormTypeErrorRenderer` |" (`reviews/round-15-decisions.md:35`)
  > "**수용.** Form 속성에 넷을 모두 둔다. 플러그인 키와 같은 이름 `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`" (`reviews/round-15-decisions.md:50`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:408`(정본), `reviews/round-15-decisions.md:21,29-36,50`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:21` 8), 편집자 결정(15라운드, `reviews/round-15-decisions.md:50`; Form 속성 넷)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:21`, `reviews/round-15-decisions.md:50`

### SURFACE-003 합성 API — `Form.Group`·`Form.Label`·`Form.Input`·`Form.Error`·`Form.Render`와 props

- 결정:
  > | 자리 | 이름 | 뜻 |
  > | --- | --- | --- |
  > | 합성 API | `Form.Group`·`Form.Label`·`Form.Input`·`Form.Error`·`Form.Render`와 props `FormGroupProps`·`FormLabelProps`·`FormInputProps`·`FormErrorProps`·`FormRenderProps`. `path`를 받아 그 노드의 일부를 그리며 `Form.Group`·`Form.Label`·`Form.Input`·`Form.Error`는 같은 이름의 `FormTypeXRenderer`를 부르고 `Form.Render`는 소비자가 직접 그린다 | 그대로 |
- 보충:
  > "이름 없는 형 `FormGroup`·`FormLabel`·`FormInput`·`FormError`·`FormRender`는 합성 구성 요소만 가리키게 된다(플러그인 키가 옮겨 가므로 충돌이 사라진다)." (`reviews/round-15-decisions.md:38`)
  > 편집자 결정(209C-01): "【추론】 꼬리는 전부 사양대로이고 측정 경로와 독립이라 다시 전체 시험을 돌려 측정을 흔들 이유가 없다. verifier 거부는 세션 공통이라 직접 검증으로 대체하되 그 사실을 적어 둔다." (`reviews/round-209-closing.md:9`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:409`(정본), `reviews/round-15-decisions.md:38`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:21` 8)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:38`

### SURFACE-004 쓰기 옵션 — 비트마스크 `SetValueOption`의 네 멤버

- 결정:
  > | 자리 | 이름 | 뜻 |
  > | --- | --- | --- |
  > | 쓰기 옵션 | `SetValueOption.Overwrite`(기본), `Merge`, `DisableAutomaticWrites`, `EnableAutomaticWrites` | §8.2 |
- 보충:
  > "| 쓰기 옵션 | `SetValueOption` 비트마스크: `Overwrite`(기본), `Merge`, `DisableAutomaticWrites`, `EnableAutomaticWrites` | 쓰기의 종류는 호출자가 선언하고 core는 추론하지 않는다(D-4). `Overwrite`는 전체 교체(로드), `Merge`는 준 키만 쓰는 부분 쓰기이며 준 배열은 통째 교체다. 억제 비트는 그 호출이 일으킨 자동 쓰기에 적용되므로 `Merge`에 주면 통째 교체된 배열 아이템의 채움도 막는다. 억제 비트가 둘인 이유는 상속, 끄기, 켜기의 세 상태 때문이다. 호출에 둘 다 없으면 Form 속성 `disableAutomaticWrites`를 따르고, 둘 다 주면 억제가 이긴다 | ADR 0007 §3, ADR 0013 |" (`02-target-overview.md:305`)
  > "공개 열거형 `SetValueOption`(내부 이름 `PublicSetValueOption`, 오늘과 같음)에 멤버 넷." (`06-conclusions.md:329`)
  > "공개 합성 멤버(`Reset`, `StableReset` 등)는 두지 않는다." (`06-conclusions.md:338`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:410`(정본), `02-target-overview.md:305`, `06-conclusions.md:329,338,340`, `07-conclusions.md:311,345` (같은 규칙: WRITE-015)
- 닫은 사람: 소유자 답(`reviews/round-7-convergence.md:144`; 비트마스크), 편집자 결정(9라운드, `reviews/round-9-spec.md:97` 세 곳의 추천을 합쳐 소유자가 동의; `DisableAutomaticWrites`·`EnableAutomaticWrites`)
- 라운드: 9
- 까닭: `reviews/round-7-convergence.md:144`, `06-conclusions.md:340`
- 충돌:
  > `02-target-overview.md:305`의 "`Overwrite`는 전체 교체(로드)"는 소유자 답과 다르다: `setValue(V)`와 `Overwrite`를 준 입력 쓰기는 로드가 아니라 전체 교체 쓰기이고, 로드는 마운트·`FormHandle.reset()`·`resetSubtree()`뿐이다(WRITE-090). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:26`).

### SURFACE-005 쓰기 — `setValue`, `FormHandle.reset`(억제 비트 둘만), 배열 다섯, `setSelectedBranch` 없음

- 결정:
  > | 자리 | 이름 | 뜻 |
  > | --- | --- | --- |
  > | 쓰기 | `setValue(value 또는 updater, option?)`, `FormHandle.reset(option?)`(억제 비트 둘만, ADR 0013), 배열 `push`·`pop`·`update`·`remove`·`clear` | `setSelectedBranch`는 없다 |
- 보충:
  > "| 쓰기 | `setValue(value 또는 updater, option?)`, `reset(option?)`, 배열 `push`·`remove`·`update` | 같은 비트가 `reset`과 마운트(`defaultValue`)에도 든다. `setSelectedBranch`는 없다 | ADR 0007 §3 |" (`02-target-overview.md:306`)
  > "`push(value?)`(`unlimited` 인자는 뺀다 — 코어가 `maxItems` 초과를 막지 않으므로 무시할 제약이 없다)" (`06-conclusions.md:386`)
  > "`pop()`, `update(index, value)`" (`06-conclusions.md:386`)
  > "`remove(index)`, `clear()`" (`06-conclusions.md:386`)
  > 편집자 결정(18C-44): "【추론】 `node.resetSubtree()`는 진입 하나에서 `clearSubtreeState()`를 한 뒤 `node.defaultValue`를 그 하위 트리에 로드한다." (`reviews/round-18-closing.md:1227`)
  > 편집자 결정(35C-03): "【추론】 SURFACE-005가 배열 쓰기를 다섯(`push`·`pop`·`update`·`remove`·`clear`)으로 닫았고, 원장의 "삽입"은 모두 "`push(v)`·삽입"(WRITE-085, WRITE-099) 또는 "`push`·`remove`·`insert`류"(NODE-051)로 연산 부류를 이름한 것이라 공개 동사도 내부 연산도 아니다; 06은 삽입을 만들지 않고, WRITE-099의 스냅숏 게이트는 `push('x')`로 충족하며 삽입 쪽은 동사가 없어 해당 없음으로 적는다. 삽입 동사가 필요해지면 SURFACE 라운드다." (`reviews/round-35-closing.md:25`)
  > 편집자 결정(35C-06): "【추론】 `update(i, v)`는 i번째 아이템에 `v`를 통째로 쓰는 로드 아닌 쓰기이고(그 안의 위치 재조정은 NODE-051), WRITE-007대로 그 아이템만 바뀌며 WRITE-085대로 구조 연산이 아니라 키와 스냅숏 자리를 지킨다." (`reviews/round-35-closing.md:48`)
  > 편집자 결정(371C-02): "【추론】 공개 배열 동사는 push·pop·update·remove·clear에 insert(index, value?)를 더해 여섯이며 새 길이를 돌려준다(365라운드 소유자 결정, 겉면 이름 수 94 그대로, 멤버 55). WRITE-099 결정은 이미 삽입을 push와 같은 구조 연산으로 적어 두었다. 규칙은 기존 동사의 규칙을 옮긴다: 유효 범위는 [0, N]이고 N은 push와 같은 결과·같은 지름길(WRITE-088·099), 범위 밖·음수·정수 아님은 오류 없는 무동작에 현재 길이(35C-06의 확장), 배열이 아닌 호스트는 insert(0)만 push처럼 [x]를 만들고 misfit 경고등을 끄며 그 밖은 무동작(47C-02의 추론: 있는 아이템을 전제하는 동사만 무효), batch 안은 62C-01대로 호출 자리에서 끼우고 끝에서 통째 쓰기, minItems·maxItems는 막지 않는다(SURFACE-005 보충·WRITE-022). 구현의 발견 넷: insert의 defaultValue는 통째 쓰기와 같을 수 없다(통째는 스냅숏 유지 WRITE-085, insert는 생성 값을 끼움 WRITE-099); 끼운 자리 뒤 아이템은 값 갱신 대신 경로 갱신 revision 하나를 받는다(NODE-051); 아이템 기본값이 있는 스키마는 차등에서 뺀다(새 아이템은 채움 WRITE-088, 통째의 기존 자리는 아님 WRITE-090); 겉면 DETAIL의 멤버 시험 수는 이미 54였던 것을 55로 바로잡았다. 06-conclusions.md:386의 "배열 다섯"은 이 결정과 충돌이다." (`reviews/round-371-closing.md:10`)
  > 편집자 결정(35C-06): "【추론】 범위 밖([0, 길이) 밖)·음수 인덱스의 `update`·`remove`, 빈 배열의 `pop()`, 값이 `null`인 터미널 배열의 `update`·`remove`·`pop`은 원장이 정한 바가 없으므로 레거시(`src/__legacy__/core/nodes/ArrayNode/strategies/BranchStrategy/BranchStrategy.ts:413-447`, `TerminalStrategy/TerminalStrategy.ts:195-224`)를 따라 오류도 경고도 없는 무효 호출이다; 새 코드는 없고 06의 시험이 무효 호출을 단언해 고정한다." (`reviews/round-35-closing.md:49`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:411`(정본), `02-target-overview.md:306`, `06-conclusions.md:338,386`, `07-conclusions.md:350`, `05-before-after.md:77` (같은 규칙: FRAGMENT-010, WRITE-015, EVENT-002; `resetSubtree`의 존폐는 열림 WRITE-050), `reviews/round-18-closing.md:1227`
- 닫은 사람: 편집자 결정(9라운드, `07-conclusions.md:350` N6 나머지 그대로), 소유자 답(`reviews/round-10-owner-answers.md:9` A-3; `setSelectedBranch` 없음), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-44)
- 라운드: 18
- 까닭: `06-conclusions.md:386`, `07-conclusions.md:142`, `reviews/round-18-closing.md:1240-1247`
- 충돌:
  > `02-target-overview.md:306`의 "배열 `push`·`remove`·`update`"는 정본과 다르다(`pop`·`clear`가 없다). 정본이 이긴다(`08-design-a-to-z.md:411`; `02-target-overview.md:3`은 새 결정을 만들지 않는다고 적는다).
  > `06-conclusions.md:386`의 "`remove(index)`, `clear()`"은 배열 동사를 다섯으로 닫은 줄이라 371C-02(insert 추가로 여섯)와 충돌이다. 371C-02가 이긴다(365라운드 소유자 결정, `reviews/round-365-owner-answers.md:7`).

### SURFACE-006 값 읽기 — `value`, `outputValue`, `getInactiveValues(path)`, `FormHandle.getValue()`

- 결정:
  > | 자리 | 이름 | 뜻 |
  > | --- | --- | --- |
  > | 값 읽기 | `value`(합성 값), `outputValue`(방출 값, 옛 `normalizedValue`), `getInactiveValues(path)` | `FormHandle.getValue()`는 루트의 `outputValue` |
- 보충:
  > "| 값 읽기 | `value` | 합성 값(`local`) | ADR 0006 |" (`02-target-overview.md:307`)
  > "| | `outputValue` | 방출 값(`emit`), 옛 `normalizedValue`. `FormHandle.getValue()`는 루트의 `outputValue`와 같다 | ADR 0006 |" (`02-target-overview.md:308`)
  > "| | `getInactiveValues(path)` | 형상에 없는 노드의 원본을 읽기 전용으로 열거한다 | ADR 0006 |" (`02-target-overview.md:309`)
  > "`getInactiveValues(path)`가 꺼진 조각의 원본을 열거한다. 가칭 `latent`를 대체한다." (`06-conclusions.md:388`)
  > 열린 부분(값 읽기 이름 전부. 표 행이라 나누지 않는다): "값 읽기 이름(`value`는 원본, 방출 값의 이름 등, 07 §6.2 N3)에 소유자 동의 원문이 없다." (`reviews/round-18-agenda.md:166`)
  > 소유자(12-8 답): "이대로 가도 되는데요, value 랑 outputValue 가 다르면, 투영할때만 바뀌는 경우(빠지는 값?)은 어떤게 있죠?" (`reviews/round-18-owner-answers.md:18`)
  > 반영 칸(12-8, 이름): "가. 이름은 표대로 확정한다" (`reviews/round-18-owner-answers.md:18`)
  > 편집자 결정(18C-44): "【추론】 `node.defaultValue`는 `getIn(snapshot, node.path)`다." (`reviews/round-18-closing.md:1225`)
  > 편집자 결정(61C-01): "【추론】 삭제·대체는 열이다: `JSON_SCHEMA_ERROR.INJECT_TARGET_NOT_FOUND` 삭제(`injectTo` 대상은 정적으로 알 수 없고 동적 실패는 `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING`, CONTROLS-079); `JSON_SCHEMA_ERROR.INVALID_VIRTUAL_NODE_VALUES` 삭제 → `SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES`(쓰기 오류로 부류 이동, ERROR-195); `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH` 삭제 → `SCHEMA_FORM_WARNING.MISFIT`(소유자 확정, SURFACE-061); `SCHEMA_FORM_WARNING.UNSET_ON_INACTIVE_ON_OBJECT` 삭제(소유자 판정으로 코드 행 제거); `NodeState` → `SchemaNodeState`, `NodeEventType` → `SchemaNodeEventType`(SURFACE-056, 옛 소비자 이주는 07); `valueTypeMismatch`·`valueTypeMismatches` → `misfit`·`misfits`(SURFACE-061); `latent` → `getInactiveValues(path)`(SURFACE-006); 옛 Form 속성 `onListenerError`와 `throwOnBudgetExceeded` 삭제(기록은 `onError`가 받고, 모든 환경에서 사슬 끝에 던진다). 원장에서 이 옛 이름을 가진 문장은 옛 글로 남고 이 보충이 이긴다." (`reviews/round-61-closing.md:10`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:412`(정본), `02-target-overview.md:307-309`, `06-conclusions.md:352-358,388`, `07-conclusions.md:347`, `05-before-after.md:96,136`, `reviews/round-18-owner-answers.md:18` (같은 규칙: VALUE-011, WRITE-019; 반환 모양은 열림 WRITE-020), `reviews/round-18-closing.md:1225`
- 닫은 사람: 편집자 결정(8라운드 D-23, `06-conclusions.md:186-190`), 편집자 결정(9라운드 N3 그대로, `07-conclusions.md:347`), 소유자 답(`reviews/round-18-owner-answers.md:18` 12-8), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-44)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:18`, `06-conclusions.md:356`, `reviews/round-18-closing.md:1240-1247`
- 충돌:
  > `08-design-a-to-z.md:412`의 "`value`(합성 값), `outputValue`(방출 값, 옛 `normalizedValue`), `getInactiveValues(path)`"는 잠복 원본 열거를 `getInactiveValues`라는 읽기로 적는다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:22`, VALUE-029: 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`). 이 항목의 나머지 이름(`value`·`outputValue`·`FormHandle.getValue()`)은 현행이다(SURFACE-050).

### SURFACE-007 진단 — `diagnostics`, 이벤트 `UpdateDiagnostics`, Form 속성 `onDiagnosticsChange`

- 결정:
  > | 자리 | 이름 | 뜻 |
  > | --- | --- | --- |
  > | 진단 | `diagnostics`, 이벤트 `UpdateDiagnostics`, Form 속성 `onDiagnosticsChange` | §12 |
- 보충:
  > "| 진단 | 노드 칸 `diagnostics` | 마지막 로드 이후의 기록. `status`는 `'stable'` 또는 `'degraded'`이고, `cause`(예산·식·대상·공유 충돌), `exceededBudget`(정착의 세 예산), `iterations`, `commit`을 든다. 루트에서 관측한다. `degraded`는 다음 로드(마운트·전체 교체·`reset`)까지 남고(지속은 14라운드 답 O-2 가) 그 동안 폼의 제출 경로가 `SchemaFormError`로 거부한다(`getValue()`는 막지 않는다, 17라운드 소유자 답 R17-1 나). 되먹임·중첩 초과는 사슬 끝에서 던지되 `diagnostics`에 남기지 않고 제출을 막지 않는다(O-2는 정착 예산에 대한 답이다). 모양은 ADR 0014 4판 §5 | ADR 0008 §8, ADR 0014 |" (`02-target-overview.md:310`)
  > "| | 이벤트 `UpdateDiagnostics` | `diagnostics`가 바뀐 커밋에만 낸다 | ADR 0008 §8 |" (`02-target-overview.md:311`)
  > "| | Form 속성 `onDiagnosticsChange` | 호스트가 진단 상태를 관측하는 자리. 제출이 막힐 때 호스트는 이것과 제출 거부의 `SchemaFormError`로 폼 수준 표시를 그린다(17라운드 소유자 답 R17-1 나). 끄는 스위치(`throwOnBudgetExceeded`)는 없다 | ADR 0008 §3 |" (`02-target-overview.md:312`)
  > 편집자 결정(26C-10): "【추론】 떼어진 노드에서 `diagnostics`는 살아 있는 트리(런타임의 진단 칸)를 읽는 NODE-044 고정 규칙의 예외다: `diagnostics`는 트리 전체의 커밋을 기술하며(ERROR-131) 루트에서 관측하는 것이라(SURFACE-007) `globalErrors`와 같은 부류다." (`reviews/round-26-closing.md:107`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:413`(정본), `02-target-overview.md:310-312`, `06-conclusions.md:362`, `07-conclusions.md:348` (같은 규칙: EVENT-043, EVENT-044, ERROR-128, ERROR-135, ERROR-138), `reviews/round-18-closing.md:2797-2799`
- 닫은 사람: 편집자 결정(8라운드 N4, `06-conclusions.md:362`), 편집자 결정(9라운드 N4 그대로, `07-conclusions.md:348`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98)
- 라운드: 18
- 까닭: `06-conclusions.md:362`, `reviews/round-18-closing.md:2801-2803`
- 충돌:
  > `02-target-overview.md:310`의 "다음 로드(마운트·전체 교체·`reset`)"는 소유자 답·18라운드 결정과 다르다: 전체 교체(`setValue(V)`)는 로드가 아니라 전체 교체 쓰기이고(WRITE-090), `degraded`를 비우는 다음 로드는 폼 수준 로드인 마운트·`FormHandle.reset()`이며 `setValue(V)`와 `resetSubtree()`는 비우지 않고, `degraded`에서 돌아오는 길은 `FormHandle.reset()`이다(ERROR-204). 18라운드 결정이 이긴다(`reviews/round-18-owner-answers.md:26`, `reviews/round-18-closing.md:2797-2799`).
  > `02-target-overview.md:310`의 "마지막 로드 이후의 기록"은 18라운드 결정과 다르다: `diagnostics`는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화하므로 마지막 폼 수준 로드 이후의 기록이며, `resetSubtree()`와 `setValue(V)`는 초기화하지 않는다(ERROR-204). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2797-2798`).

### SURFACE-008 배치 — `batch(fn)`

- 결정:
  > | 자리 | 이름 | 뜻 |
  > | --- | --- | --- |
  > | 배치 | `batch(fn)` | §12 |
- 보충:
  > "| 배치 | `batch(fn)` | fn 안의 쓰기를 표시만 하고 끝에서 정착 한 번, 통지 한 번을 낸다. 중첩은 가장 바깥이 이긴다. 정착 횟수가 바뀌므로 채움과 `controls.injectTo`의 결과가 순차 호출과 다를 수 있다 | ADR 0008 §3 |" (`02-target-overview.md:314`)
  > "`batch(callback)`(루트와 `FormHandle`)" (`06-conclusions.md:386`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:414`(정본), `02-target-overview.md:314`, `06-conclusions.md:386`, `05-before-after.md:91` (같은 규칙: EVENT-013, EVENT-014, EVENT-019)
- 닫은 사람: 소유자 답(`00-goals.md:151` G7; 배치 유지), 편집자 결정(4라운드, `adr/0008-event-system.md:3`), 편집자 결정(9라운드, `07-conclusions.md:350` N6 나머지 그대로)
- 라운드: 9
- 까닭: `adr/0008-event-system.md:80`

### SURFACE-009 경로 조회 — `find`·`findNodes`, 터미널 아래 경로는 노드 없음, `findAll`은 `findNodes`로

- 결정:
  > | 자리 | 이름 | 뜻 |
  > | --- | --- | --- |
  > | 경로 조회 | `find(path)`, `findNodes(path)` | 터미널 아래 경로는 노드 없음. 노드 메서드 `findAll`은 `findNodes`로 바뀐다(§14) |
- 보충:
  > "| 경로 조회 | `find(path)`, `findNodes(path)` | 터미널 노드 아래의 경로는 둘 다 노드 없음으로 답한다. 공개 API가 객체를 조용히 파괴하면 안 되기 때문이다(07 4.29) | ADR 0006 §4 |" (`02-target-overview.md:316`)
  > "| 46 | 노드 메서드 `findAll` | `findNodes`(`FormHandle`은 이미 `findNodes`다) |" (`08-design-a-to-z.md:478`)
  > 소유자(341라운드, 하위 노드 방문을 공개 표면으로; 설계는 원장 기준, 판정은 소유자): "그리고 공개표면으로도 추가했으면 하네. \n\n자신을 기준으로 하위 모든 노드를 방문하는 공개 기능으로서. \n\n네이밍과 위치, 동작, 배치여부 등은 원장을 참고해서 추정하고 설계를 구성하라.\n판정과 판단이 필요하면 나에게 묻도록" (`reviews/round-341-owner-answers.md:7`)
  > 편집자 결정(DR-9): "【추론】 DR-9: 경로 주소 바인딩은 경로 컨테이너들의 UpdateChildren을 따라 다시 해석한다. find는 현재 구조에 대한 조회다. useSyncExternalStore는 root부터 각 경로 prefix의 find 결과를 구독하고 unresolved prefix에서 멈춘다. 리스너는 사건 비트로 필터하며 변경 때 모두 해제·재탐색·재구독한 뒤 snapshot 변경을 통지한다. node 입력과 undefined 및 root로 해석되는 입력은 고정 snapshot과 no-op 구독이다. 기본 root proxy와 node-addressed children의 추가 구독·쓰기 비용은 0이며 root의 기존 네 리스너를 유지한다. 경로 프록시는 container마다 리스너 한 개와 사건마다 필터 호출 비용이 들고 wildcard는 첫 매치만 추적한다. identity 변경으로 Input이 remount되면 focus를 잃는 REACT-023 제한은 유지한다. 구독 직후 snapshot 재확인은 tearing을 막으며 재구독 리스너의 같은 wave 재호출은 허용한다." (`reviews/defect-round.md:19`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:415`(정본), `02-target-overview.md:316`, `08-design-a-to-z.md:478`, `06-conclusions.md:394`, `07-conclusions.md:205-210,351`, `05-before-after.md:95` (같은 규칙: NODE-020; 형상에 없는 노드를 돌려주는지는 열림 NODE-019)
- 닫은 사람: 원리(`06-conclusions.md:175` P2·G4; `find`), 편집자 결정(10라운드 추정 채택 규칙, `07-conclusions.md:209`; `findNodes`), 편집자 결정(17라운드, `08-design-a-to-z.md:478` 이주 행 46; `findAll`)
- 라운드: 17
- 까닭: `07-conclusions.md:205-210`

### SURFACE-010 노드 — 단일 클래스 `SchemaNode`, 게터 `type`·`strategy`, 가드 아홉, 겉면의 크기는 18라운드 안건

- 결정:
  > | 자리 | 이름 | 뜻 |
  > | --- | --- | --- |
  > | 노드 | 상속 없는 단일 클래스 `SchemaNode`. 식별 게터 `type`과 `strategy`(`'branch'` 또는 `'terminal'`, 옛 `group`). 가드 아홉(`isBranchNode`·`isTerminalNode`는 `strategy`를 보며 이름을 유지한다) | §4. 필드 `behavior`·`runtime`은 공개 형에 싣지 않는다. 멤버 목록은 공개 겉면의 `DETAIL.md`와 멤버 목록 시험이 정하며, 겉면의 크기(루트 전용 넷, 명령 넷을 노드 메서드로 둘지, `subnodes`·`defaultValue`·`resetSubtree`·`schemaPath`·`key`의 존폐)는 18라운드 안건이다 |
- 보충:
  > "| 종류 읽기 | `type`, `strategy` | 노드가 든 동작 행에서 읽는 게터다. `strategy`는 `'branch'` 또는 `'terminal'`이며 옛 `node.group`의 새 이름이다(값은 그대로, 17라운드 소유자 답). 가드 `isBranchNode`·`isTerminalNode`는 이름을 유지하고 `strategy`를 본다 | 09 §3, ADR 0011 |" (`02-target-overview.md:315`)
  > 편집자 결정(18C-32): "【추론】 이 결정들을 적용하면 겉면 멤버는 확정분 약 44개(`reviews/raw-round17-node-structure.md:136`, `getInactiveValues`는 VALUE-029의 게터 `inactiveValues`로 셈)에 명령 넷, 루트 전용 넷, `defaultValue`·`resetSubtree`, `context`, 18C-40의 게터 `valueTypeMismatch`·`valueTypeMismatches`를 더한 약 57개다." (`reviews/round-18-closing.md:912`)
  > 편집자 결정(18C-32): "【추론】 `subnodes`·`schemaPath`·`key`·`publish`는 빠진다." (`reviews/round-18-closing.md:913`)
  > 반영 칸(설계서 메모 4): "게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`." (`reviews/round-18-owner-answers.md:41`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:416`(정본), `02-target-overview.md:315`, `reviews/round-17-owner-answers.md:22-24` (같은 규칙: NODE-001, NODE-002, NODE-003, NODE-010, NODE-015; 열린 부분: NODE-019, EVENT-038, EVENT-052, WRITE-050), `reviews/round-18-closing.md:77,912-913`, `reviews/round-18-owner-answers.md:41`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 소유자 답(`reviews/round-17-owner-answers.md:23` `kind` 필드), 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §6; 가드 아홉, 공개 형에서 뺀 필드, 멤버 목록), 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:86-88`; 겉면의 크기), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-32·18C-02), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4)
- 라운드: 18
- 까닭: `reviews/round-17-owner-answers.md:22-24`, `reviews/round-18-closing.md:915-915`, `reviews/round-18-closing.md:84-91`
- 충돌:
  > `08-design-a-to-z.md:416`의 "가드 아홉(`isBranchNode`·`isTerminalNode`는 `strategy`를 보며 이름을 유지한다)"는 18라운드 결정과 다르다: (가칭) `isUnionNode`가 더해져 가드는 열이다(NODE-041). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:77`).
  > `08-design-a-to-z.md:416`의 "겉면의 크기(루트 전용 넷, 명령 넷을 노드 메서드로 둘지, `subnodes`·`defaultValue`·`resetSubtree`·`schemaPath`·`key`의 존폐)는 18라운드 안건이다"는 18라운드 결정과 다르다: 루트 전용 넷·명령 넷·`defaultValue`·`resetSubtree`·`context`는 남고 `subnodes`·`schemaPath`·`key`·`publish`는 빠진다(SURFACE-058, SURFACE-053, EVENT-063, WRITE-085, SURFACE-055, NODE-043, SURFACE-054). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:911-913`). 이 가운데 명령 넷과 `publish`는 다시 소유자 답에 진다: 명령은 종류를 매개변수로 받는 메서드 하나이고, 임의 사건을 내는 공개 `publish`는 빠지되 그 메서드의 이름 후보에 명령 사건에 한정한 `publish` 부활이 들며 이름은 PR-4 착수 전에 소유자가 정한다(EVENT-073). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:40`).
  > `reviews/round-18-closing.md:912`의 "약 57개다"는 소유자 답과 다르다: 명령 넷이 메서드 하나로 합쳐지고(EVENT-073) 게터 이름은 `typeMismatch`·`typeMismatches`로 확정되어(SURFACE-061) 겉면 멤버는 약 54개다(SURFACE-058의 충돌 줄). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:40`, `reviews/round-18-owner-answers.md:41`).

### SURFACE-011 명령 — `focus`, `select`, `refresh`, `remount`

- 결정:
  > | 자리 | 이름 | 뜻 |
  > | --- | --- | --- |
  > | 명령 | `focus`, `select`, `refresh`, `remount` | 원본을 쓰지 않는다 |
- 보충:
  > "| 명령 | `focus`, `select`, `refresh`, `remount` | 렌더러와 무관한 표현 계층의 어휘이며 원본을 쓰지 않는다(D-9) | ADR 0008 |" (`02-target-overview.md:317`)
  > "`focus`, `select`(텍스트 선택), `refresh`, `remount`. `refresh`가 비용을 숨긴다는 지적이 있으나 오늘의 공개 이벤트 이름과 함께 바꿔야 하므로 유지가 1순위다." (`06-conclusions.md:387`)
  > 편집자 결정(18C-42): "【추론】 명령 넷은 공개 노드 메서드 `focus()`·`select()`·`refresh()`·`remount()`다." (`reviews/round-18-closing.md:1182`)
  > 소유자(설계서 메모 3): "이 4개 기능을 4개로 분할해서 두지 말고 하나의 메소드에 여러 행위 타입을 파라미터로 받아서 행동하게 해줘." (`reviews/round-18-owner-answers.md:40`)
  > 반영 칸(설계서 메모 3): "방향: 노드 겉면에 명령 메서드 넷을 따로 두지 않고, 명령 종류를 매개변수로 받는 메서드 하나로 합친다(이름 후보 `action`·`interaction`·`request`, 또는 명령 사건에 한정한 `publish` 부활)." (`reviews/round-18-owner-answers.md:40`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:417`(정본), `02-target-overview.md:317`, `06-conclusions.md:387`, `05-before-after.md:92-94,124` (같은 규칙: EVENT-037, EVENT-039; 명령 publish의 공개와 노드 메서드로 둘지는 열림 EVENT-038, NODE-019), `reviews/round-18-closing.md:1182`, `reviews/round-18-owner-answers.md:40`
- 닫은 사람: 편집자 결정(8라운드 N6 명령, `06-conclusions.md:387`), 편집자 결정(9라운드, `07-conclusions.md:350` N6 나머지 그대로), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-42), 소유자 답(`reviews/round-18-owner-answers.md:40` 설계서 메모 3)
- 라운드: 18
- 까닭: `06-conclusions.md:387`, `reviews/round-18-closing.md:1193-1196`
- 충돌:
  > `reviews/round-18-closing.md:1182`의 "명령 넷은 공개 노드 메서드 `focus()`·`select()`·`refresh()`·`remount()`다"는 소유자 답과 다르다: 명령 넷은 따로 둔 메서드 넷이 아니라 명령 종류를 매개변수로 받는 노드 메서드 하나다(EVENT-073). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:40`).

### SURFACE-012 Form 속성(렌더 계층) — 전체 잠금, `unsetOnInactive`, `disableAutomaticWrites`, `onError`, `onDiagnosticsChange`, `validatorFactory`

- 결정:
  > | 자리 | 이름 | 뜻 |
  > | --- | --- | --- |
  > | Form 속성(렌더 계층) | `readOnly`, `disabled`(전체 잠금, 참일 때만), `unsetOnInactive`(나감 정책의 포괄 층), `disableAutomaticWrites`(억제 기본값), `onError`(검증 결과를 뺀 폼 내부의 오류와 경고를 같은 모양의 기록으로 받는 관찰자, ADR 0014 §3. 검증 결과는 `onValidate`. 가칭 `onListenerError`를 흡수한다. `throwOnBudgetExceeded`는 없다, R17-1 나), `onDiagnosticsChange`, `validatorFactory`(그 폼만의 검증기 인스턴스, `compile` + `compileGuard`) | §10, §8, §11 |
- 보충:
  > "| 오류 관찰 | Form 속성 `onError(record)` | 검증 결과를 뺀 폼 내부의 오류와 경고를 같은 모양의 기록으로 받는 관찰자다. 흐름을 바꾸지 못하며(던질 것은 던지고 기본 출력도 그대로), 핸들러가 없으면 비용이 없다(17라운드 스웜 수렴(편집자 결정), 안 B). 받는 것·받지 않는 것·기록 모양은 ADR 0014 §3 | ADR 0014 |" (`02-target-overview.md:313`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:418`(정본), `02-target-overview.md:312-313`, `08-design-a-to-z.md:577` (같은 규칙: ERROR-094, ERROR-096, ERROR-013, VALIDATE-040, VALIDATE-041, VALIDATE-042, WRITE-031, EVENT-044)
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리; `readOnly`·`disabled`), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 편집자 결정(9라운드, `reviews/round-9-spec.md:97` 세 곳의 추천을 합쳐 소유자가 동의; `disableAutomaticWrites`), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4; `onError`), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸; `onError`), 편집자 결정(8라운드 N4, `06-conclusions.md:362`; `onDiagnosticsChange`), 소유자 답(`reviews/round-14-owner-answers.md:13` O-7; `validatorFactory`)
- 라운드: 17
- 까닭: `reviews/round-13-owner-answers.md:16`, `reviews/round-17-owner-answers.md:15`

### SURFACE-013 검증기 플러그인 계약 — `compile`, `compileGuard`, `rejectedKey`

- 결정:
  > | 자리 | 이름 | 뜻 |
  > | --- | --- | --- |
  > | 검증기 플러그인 계약 | `compile`, `compileGuard`, `rejectedKey` | §11 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:419`(정본) (같은 규칙: FRAGMENT-020, VALIDATE-015)
- 닫은 사람: 편집자 결정(16라운드, `09-landing-and-test-strategy.md:19` 조건 1; `compile`·`compileGuard`), 편집자 결정(5라운드 도출, `reviews/round-5-derivations.md:26` C-4; `rejectedKey`)
- 라운드: 16
- 까닭: `adr/0004-validator-plugin-compile-guard.md:27-30`

### SURFACE-014 오류 클래스 — `JSONSchemaError`, `SchemaFormError`, `ValidationError`, `UnhandledError`, `ValidationIssue`, 기록 형과 코드 형

- 결정:
  > | 자리 | 이름 | 뜻 |
  > | --- | --- | --- |
  > | 오류 클래스 | `JSONSchemaError`(throw), `SchemaFormError`, `ValidationError`, `UnhandledError`, 인터페이스 `ValidationIssue`, 기록 형 `FormErrorRecord`와 코드 형 `FormErrorCode`(가칭. 코드 목록은 공개 계약, ADR 0014 §7) | §11.3 |
- 보충:
  > 편집자 결정(32C-02): "【추론】 ajv 플러그인 셋은 `@canard/schema-form`을 런타임 의존성으로 갖지 않으므로(형만 가져온다) 코어 클래스를 던지려면 새 런타임 의존성이 필요한데, 원장은 그런 의존을 정하지 않았다; 플러그인이 이미 런타임 의존성으로 가진 `@winglet/common-utils`의 `BaseError`를 그룹 `'UNHANDLED_ERROR'`·코드 `'VALIDATOR_BIND_REFUSED'`로 던진다(코어 `UnhandledError`와 같은 기반 클래스·같은 그룹·코드 모양). 플러그인 안의 하위 클래스로 감싸도 되나 `name`은 자기 이름을 적고 코어 클래스를 사칭하지 않는다." (`reviews/round-32-closing.md:19`)
  > 편집자 결정(32C-02): "【추론】 코어의 `isUnhandledError`는 `instanceof` 가드라 이 객체를 알아보지 못하며 이는 받아들인다: 이 사건은 폼 밖에서 플러그인의 `bind` 호출자에게 가는 것이라 코어의 가드로 거를 자리가 없고, 호출자는 `group`과 `code`로 가른다. 플러그인 문서에 이 한 줄을 적는다." (`reviews/round-32-closing.md:20`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:420`(정본) (같은 규칙: ERROR-013, ERROR-031, ERROR-164, ERROR-165)
- 닫은 사람: 편집자 결정(17라운드, ADR 0014 4판 채택 `adr/0014-error-policy.md:3`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:74`

### SURFACE-015 유효 스키마 변경 이벤트의 타입·payload·구독 표면

- 결정:
  > | 자리 | 이름 | 뜻 |
  > | --- | --- | --- |
  > | 이벤트 | 유효 스키마 변경 이벤트의 타입·payload·구독 표면은 슬라이스 4의 설계 항목 | |
- 보충: 없음
- 상태: 대체됨(→ SURFACE-057, EVENT-064)
- 출처: `08-design-a-to-z.md:421`(정본), `02-target-overview.md:319#1`, `reviews/round-18-agenda.md:108` (같은 규칙: EVENT-048), `reviews/round-18-closing.md:1442-1460`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:108`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-52)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:108`, `reviews/round-18-closing.md:1462-1465`

### SURFACE-016 이름 규칙 1 — `FormType…`은 노드 단위 조각과 그것을 그리는 것

- 결정:
  > `FormType…`은 노드 단위 조각과 그것을 그리는 것이고 플러그인이 등록하며 Form 속성이 덮고 스키마 `presentation`이 노드별로 고르거나 props를 준다.
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:423#2`(정본), `reviews/round-15-decisions.md:21`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:21` 8)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:21`

### SURFACE-017 이름 규칙 2 — `…Renderer` 접미는 그리는 것

- 결정:
  > `…Renderer` 접미는 그리는 것이다.
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:423#3`(정본), `reviews/round-15-decisions.md:21`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:21` 8)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:21`

### SURFACE-018 이름 규칙 3 — `Form.X`는 `path`를 받는 합성 API, props는 `FormXProps`

- 결정:
  > `Form.X`는 `path`를 받는 합성 API이고 props는 `FormXProps`다.
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:423#4`(정본), `reviews/round-15-decisions.md:21`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:21` 8)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:21`

### SURFACE-019 구성 요소를 담는 키는 파스칼, props 객체 키는 그 props 타입의 이름

- 결정:
  > 구성 요소를 담는 키는 파스칼이고 props 객체 키는 그 props 타입의 이름을 그대로 쓴다.
- 보충:
  > "**규칙으로 닫음.** 구성 요소를 담는 키는 파스칼(React의 구성 요소 값 관례), props 객체 키는 그 props 타입의 이름을 그대로(키와 타입의 1:1 연결)." (`reviews/round-15-decisions.md:51`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:423#5`(정본), `reviews/round-15-decisions.md:51`
- 닫은 사람: 편집자 결정(15라운드, `reviews/round-15-decisions.md:51`)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:51`

### SURFACE-020 이 패키지에서 `controls`는 규칙, `Group`은 한 필드 단위

- 결정:
  > 이 패키지에서 `controls`는 규칙이지 입력 위젯이 아니고, `Group`은 한 필드 단위(라벨·입력란·오류)이지 여러 컨트롤의 묶음이 아니다.
- 보충:
  > "**기록만.** 소유자가 고른 이름이고 규칙 위반이 아니다." (`reviews/round-15-decisions.md:54`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:423#6`(정본), `reviews/round-15-decisions.md:54`
- 닫은 사람: 편집자 결정(15라운드, `reviews/round-15-decisions.md:54`)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:54`

### SURFACE-021 제어 키는 `controls` 안에만 적는다

- 결정:
  > 제어 키는 `controls` 안에만 적는다.
- 보충:
  > "**폼 전용 키는 그룹 객체 셋 안에만 둔다.**" (`reviews/round-15-decisions.md:12`)
- 상태: 중복(→ CONTROLS-016)
- 출처: `02-target-overview.md:319#3`(정본), `reviews/round-15-decisions.md:12` (같은 규칙: CONTROLS-016)
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:12` 4)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:12`

### SURFACE-022 평면 `&` 축약과 `computed` 별칭은 없다

- 결정:
  > 평면 `&` 축약과 `computed` 별칭은 없다(15라운드).
- 보충:
  > 소유자(15라운드 5): "숏컷을 모두 없애고 중첩 객체로 하는 게 빼기도 편하고 나중에 서버 스키마랑 클라이언트 스키마를 병합하기도 편하겠지" (`reviews/round-15-decisions.md:13`)
  > 편집자 결정(187C-01): "【추론】 alias와 paths는 스토리북 실행 설정이지 제품 코드가 아니고 lockfile을 건드리지 않으므로 07c의 공유 파일 한계 안에 둘 수 있다. 문서가 옛 문법을 가르치는 것은 스토리 작업의 범위 밖이지만 소비자가 보는 계약이라 정리 항목으로 남기고 소유자가 알아야 한다. 작성 표면 변경이 의도된 것임을 reviewer 개괄에서 빠뜨린 것은 원장 관리자의 누락이다." (`reviews/round-187-closing.md:9`)
- 상태: 중복(→ CONTROLS-016)
- 출처: `02-target-overview.md:319#4`(정본), `reviews/round-15-decisions.md:13`, `reviews/round-15-apply-spec.md:46,79`, `03-mental-model.md:37` (같은 규칙: CONTROLS-016)
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:13` 5)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:13`

### SURFACE-023 이름 원칙 — 줄임말이 아닌 풀 네임과 저장소의 짝 관례

- 결정:
  > 소유자 규칙 "전체 일관성이 유지된다면 가독성 높고 명료한, 줄임말이 아닌 풀 네임"과 저장소의 기존 관례(속성 `showError`와 열거형 `ShowError`의 짝, 칸 `state`·이벤트 `UpdateState`·콜백 `onStateChange`의 삼중 짝, 쓸 수 있는 칸 `x`에는 `setX`)로 만든 제안이다.
- 보충:
  > 소유자(7라운드): "이름은 기존 프로젝트의 네이밍 규칙에 맞게 정해도 된다 — 전체 일관성만 유지된다면 가독성 높고 명료한, 줄임말이 아닌 풀 네임." (`reviews/round-7-convergence.md:144`)
- 상태: 현행
- 출처: `06-conclusions.md:324#1`(정본), `reviews/round-7-convergence.md:144,150`
- 닫은 사람: 소유자 답(`reviews/round-7-convergence.md:144`), 편집자 결정(8라운드 이름 짓기, `06-conclusions.md:324`; 저장소 관례의 짝)
- 라운드: 8
- 까닭: `reviews/round-7-convergence.md:144`

### SURFACE-024 쓰기 옵션은 옵션 객체가 아니라 비트마스크

- 결정:
  > 설계 4차 본문은 옵션 객체 `{ mode?: 'Overwrite' | 'Merge'; disableDefaultInjection?: boolean }`를 적었으나, 소유자가 비트마스크를 택했다.
- 보충:
  > 소유자(7라운드): "쓰기 옵션은 옵션 객체가 아니라 비트마스크로 `|`로 묶어 쓴다." (`reviews/round-7-convergence.md:144`)
- 상태: 현행
- 출처: `06-conclusions.md:328#1`(정본), `reviews/round-7-convergence.md:144`, `06-conclusions.md:224` (같은 규칙: WRITE-015; 옵션 객체는 대체됨 WRITE-065)
- 닫은 사람: 소유자 답(`reviews/round-7-convergence.md:144`)
- 라운드: 7
- 까닭: `06-conclusions.md:328`

### SURFACE-025 `Overwrite`와 `Merge` — 기본값, `Overwrite ⊇ Merge`, 함께 주면 `Overwrite`

- 결정:
  > | 멤버 | 뜻 |
  > | ---- | -- |
  > | `Overwrite` | 전체 교체. 기본값. 오늘과 같다 |
  > | `Merge` | 부분 쓰기. 오늘과 같다. `Overwrite ⊇ Merge`를 유지해 둘을 함께 주면 `Overwrite`가 이긴다 |
- 보충: 없음
- 상태: 대체됨(→ SURFACE-051)
- 출처: `06-conclusions.md:333-334`(정본), `07-conclusions.md:345`, `reviews/round-18-closing.md:463-500`
- 닫은 사람: 편집자 결정(8라운드 N1, `06-conclusions.md:329`), 편집자 결정(9라운드, `07-conclusions.md:345` N1의 `Overwrite`·`Merge` 그대로), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16)
- 라운드: 18
- 까닭: `06-conclusions.md:334`, `reviews/round-18-closing.md:502-510`

### SURFACE-026 대체됨: 억제 비트 `DisableSchemaDefaults`·`EnableSchemaDefaults`

- 결정:
  > | 멤버 | 뜻 |
  > | ---- | -- |
  > | `DisableSchemaDefaults` | 이 쓰기에서는 스키마 `default`를 채우지 않는다 |
  > | `EnableSchemaDefaults` | Form 속성이 꺼 두었어도 이 쓰기에서는 채운다 |
- 보충: 없음
- 상태: 대체됨(→ SURFACE-039)
- 출처: `06-conclusions.md:335-336`(정본), `06-conclusions.md:339`, `07-conclusions.md:345`
- 닫은 사람: 편집자 결정(8라운드 N1, `06-conclusions.md:329`)
- 라운드: 8
- 까닭: `06-conclusions.md:339`

### SURFACE-027 대체됨: 둘 다 없으면 Form 속성 `disableSchemaDefaults`를 따르고 둘 다 주면 억제가 이긴다

- 결정:
  > 둘 다 없으면 Form 속성 `disableSchemaDefaults`를 따르고, 둘 다 주면 억제가 이긴다(배치 규칙 "섞이면 억제가 이긴다"와 같은 판정).
- 보충: 없음
- 상태: 대체됨(→ SURFACE-039)
- 출처: `06-conclusions.md:338#1`(정본)
- 닫은 사람: 편집자 결정(8라운드 N1, `06-conclusions.md:338`)
- 라운드: 8
- 까닭: `06-conclusions.md:338`

### SURFACE-028 대체됨: Form 속성은 `disableSchemaDefaults`, 공개 합성 멤버는 두지 않는다

- 결정:
  > Form 속성은 `disableSchemaDefaults`. 공개 합성 멤버(`Reset`, `StableReset` 등)는 두지 않는다.
- 보충: 없음
- 상태: 대체됨(→ SURFACE-039, SURFACE-004)
- 출처: `06-conclusions.md:338#3`(정본)
- 닫은 사람: 편집자 결정(8라운드 N1, `06-conclusions.md:338`)
- 라운드: 8
- 까닭: `06-conclusions.md:338`

### SURFACE-029 대체됨: 분기 선택 명령 `setSelectedBranch`, 칸 `selectedBranch`, 계산된 `activeBranch`(06 N2)

- 결정:
  > 명령 `setSelectedBranch(index)`, 상태 칸의 공개 이름 `selectedBranch`. 계산된 활성 분기는 `activeBranch` 하나로 오늘의 `oneOfIndex`와 `anyOfIndices`를 대체한다(새 모델에서는 `anyOf`도 한 분기만 활성).
- 보충: 없음
- 상태: 대체됨(→ SURFACE-045)
- 출처: `06-conclusions.md:346#1`(정본), `07-conclusions.md:346`
- 닫은 사람: 편집자 결정(8라운드 N2, `06-conclusions.md:346`)
- 라운드: 8
- 까닭: `06-conclusions.md:347`

### SURFACE-030 값의 세 읽기 표 — 원본은 공개 이름 없음, `value`, `outputValue`

- 결정:
  > | 칸 | 공개 이름 | 비고 |
  > | -- | --------- | ---- |
  > | 원본 (`raw`) | 공개 이름 없음 | 소비자가 원본을 직접 읽을 이유가 없다. 꺼진 조각의 원본은 N6의 `getInactiveValues`가 열거한다 |
  > | 합성 값 (`local`) | `value` (유지) | 호스트 노드에서만 뜻이 "원본"에서 "합성 값"으로 바뀐다. README 1483행 "`node.value` stays raw"는 이주 안내 대상 |
  > | 방출 값 (`emit`) | `outputValue` | 오늘의 `normalizedValue`의 이름 변경. README가 이 투영을 "Array Output Filters"(배열 한정)라 부른다. `normalizedValue`는 무엇을 정규화했는지 말하지 않고 내부 비트 `Normalize`와 뜻이 다르다 |
- 보충: 없음
- 상태: 중복(→ VALUE-011)
- 출처: `06-conclusions.md:352-356`(정본), `07-conclusions.md:347` (같은 규칙: VALUE-011)
- 닫은 사람: 편집자 결정(8라운드 N3, `06-conclusions.md:350`), 편집자 결정(9라운드 N3 그대로, `07-conclusions.md:347`)
- 라운드: 9
- 까닭: `06-conclusions.md:356`
- 충돌:
  > `06-conclusions.md:354`의 "꺼진 조각의 원본은 N6의 `getInactiveValues`가 열거한다"는 잠복 원본 열거를 `getInactiveValues`라는 읽기로 적는다. 소유자 답과 다르다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:22`, VALUE-029: 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`).

### SURFACE-031 `FormHandle.getValue()` 유지, 노드 `getValue()` 없음, `enhancedValue` 사라짐, `setValue(updater)`의 `prev`

- 결정:
  > `FormHandle.getValue()`는 유지하며 루트의 `outputValue`와 같다. 노드에 `getValue()` 메서드는 따로 두지 않는다(`node.value`와 뜻이 다르면 이름만 보고 속는다). `enhancedValue`는 사라진다(오늘도 내부 이름이다). `setValue(updater)`는 유지하고 `prev`는 `value`다.
- 보충: 없음
- 상태: 현행
- 출처: `06-conclusions.md:358`(정본), `05-before-after.md:137` (같은 규칙: VALUE-011)
- 닫은 사람: 편집자 결정(8라운드 N3, `06-conclusions.md:350`), 편집자 결정(9라운드 N3 그대로, `07-conclusions.md:347`)
- 라운드: 9
- 까닭: `06-conclusions.md:358`
- 충돌:
  > `06-conclusions.md:358`의 "`setValue(updater)`는 유지하고 `prev`는 `value`다."는 `batch(fn)` 안에서는 18라운드 결정과 다르다: 그 안에서 `prev`는 직전 커밋에 앞선 표시를 얹은 값이다(EVENT-061). `batch` 밖에서는 그대로 맞는다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:628`).

### SURFACE-032 대체됨: FE 전용 키는 `&`로 시작하는 평면 키, `computed` 컨테이너 제거(06 N5)

- 결정:
  > - **제안.** 모든 FE 전용 키는 `&`로 시작하는 평면 키다. `computed` 컨테이너를 없앤다(오늘 `&active`와 `computed.active`가 같은 것을 두 문법으로 쓴다). `options`는 사용자 정의 키를 담는 열린 컨테이너라 `&options`로 두고 평면으로 풀지 않는다. 컴포넌트 키는 PascalCase를 유지한다(`&FormTypeInput`).
  > - **이름만 바뀌는 것(기계적 이주 가능).** `computed.*` → `&*`, `FormTypeInput` → `&FormTypeInput`, `FormTypeInputProps`, `FormTypeRendererProps`, `formType`, `terminal`, `errorMessages`, `options`, `injectTo`, `propertyKeys`에 `&` 접두. `&pristine`은 존속.
  > - **사람이 다시 써야 하는 것.** `&if`/`computed.if`(분기 가드로 다시 씀), `virtual`(뜻이 D-6으로 바뀜, 5.6).
  > - **부수 효과.** 오늘 키 여섯을 이름으로 나열하는 제거 목록이 "키워드 위치의 `&` 접두 키를 모두 지운다"는 한 규칙이 된다.
- 보충:
  > 소유자(12라운드 §9 `&options`): "1. options 도 & 키워드를 가지나? 컨트롤이 아닌데?" (`reviews/round-12-owner-answers.md:24`)
- 상태: 대체됨(→ SURFACE-001, SURFACE-021, SURFACE-022, CONTROLS-016)
- 출처: `06-conclusions.md:379-382`(정본), `07-conclusions.md:349`, `reviews/round-12-owner-answers.md:24`
- 닫은 사람: 편집자 결정(8라운드 N5, `06-conclusions.md:379`)
- 라운드: 8
- 까닭: `06-conclusions.md:379`

### SURFACE-033 대체됨: 공개 쓰기 API와 배열 API 제안(06 N6)

- 결정:
  > - **제안.** `setValue(value | updater, option?)`, `setSelectedBranch(index)`, `push(value?)`(`unlimited` 인자는 뺀다 — 코어가 `maxItems` 초과를 막지 않으므로 무시할 제약이 없다), `pop()`, `update(index, value)`(2순위 `setItem`), `remove(index)`, `clear()`, `batch(callback)`(루트와 `FormHandle`), `reset(option?)`/`resetSubtree(option?)`.
- 보충: 없음
- 상태: 대체됨(→ SURFACE-005, SURFACE-008, SURFACE-045, WRITE-050)
- 출처: `06-conclusions.md:386`(정본), `07-conclusions.md:350`
- 닫은 사람: 편집자 결정(8라운드 N6, `06-conclusions.md:386`)
- 라운드: 8
- 까닭: `06-conclusions.md:386`

### SURFACE-034 `write`는 공개 API가 아니다 — 입력 출처 비트로 흡수

- 결정:
  > - **`write`.** 공개 API로 필요 없다. 입력의 `onChange`가 부르는 `setValue`에 내부 출처 비트로 흡수된다.
- 보충: 없음
- 상태: 현행(부정 결정)
- 출처: `06-conclusions.md:389`(정본), `09-landing-and-test-strategy.md:49` (같은 규칙: NODE-010)
- 닫은 사람: 편집자 결정(8라운드 N6, `06-conclusions.md:389`), 편집자 결정(9라운드, `07-conclusions.md:350` N6 나머지 그대로)
- 라운드: 9
- 까닭: `06-conclusions.md:389`

### SURFACE-035 대체됨: `removeKey` 보류, 둔다면 `removeUndeclaredKey(key)`

- 결정:
  > - **`removeKey`.** 보류. 둔다면 `removeUndeclaredKey(key)`. 흡수 규칙은 5.6.
- 보충:
  > "`Merge`로 키에 `undefined`를 쓰면 그 키는 없음이 된다. `extras`의 키도 같고, 따로 `removeKey`를 두지 않는다(소유자 답 2)." (`adr/0013-core-does-not-rewrite-values.md:51`)
- 상태: 대체됨(→ WRITE-010)
- 출처: `06-conclusions.md:390`(정본), `06-conclusions.md:318`
- 닫은 사람: 편집자 결정(8라운드 N6, `06-conclusions.md:390`)
- 라운드: 8
- 까닭: `06-conclusions.md:318`

### SURFACE-036 대체됨: `computed`를 대신할 컨테이너 `control`(`&키`와 `control.키`는 두 철자)

- 결정:
  > | 대상 | 이름 | 비고 |
  > | --- | --- | --- |
  > | `computed`를 대신할 컨테이너 | `control` | 세 곳 일치. `control.active`, `control.injectTo`. `&키`와 `control.키`는 같은 것의 두 철자(9항). 같은 노드에 둘 다 있으면 `control`이 이긴다(오늘 `computed`가 이기던 규칙) |
- 보충:
  > 소유자(9라운드 축9): "9. 기존 computed 와 &를 동시 제공하는건 일종의 선택지를 제공한 것이다. 제거해도 무방하나, 제공하는 방향을 선호한다." (`reviews/round-9-spec.md:27`)
  > 소유자(15라운드 6): "options와 controls와 품사가 맞지 않지 않아?" (`reviews/round-15-decisions.md:14`)
- 상태: 대체됨(→ SURFACE-001, SURFACE-022, CONTROLS-016)
- 출처: `07-conclusions.md:308`(정본), `reviews/round-9-spec.md:101`, `07-conclusions.md:3`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:27` 축9), 편집자 결정(9라운드, `reviews/round-9-spec.md:97` 세 곳의 추천을 합쳐 소유자가 동의)
- 라운드: 9
- 까닭: `reviews/round-9-spec.md:101`

### SURFACE-037 대체됨(철자): 값 지우기 `&unsetValue` — 이름 낱말은 `controls.unsetValue`로 현행

- 결정:
  > | 대상 | 이름 | 비고 |
  > | --- | --- | --- |
  > | 값 지우기 | `&unsetValue` | 새 키. 거짓에서 참으로의 전이에서 값을 뺀다. 입력은 남는다. 동사와 목적어 꼴이라 참이 되는 순간의 한 번 동작으로 읽히고, 같은 동사 꼴인 `injectTo`를 따른다(`raw-round9-naming-local.md:14`). `When`을 붙인 두 추천(antigravity의 `&clearWhen`, codex의 `&clearValueWhen`) 대신 소유자가 `&clearValue`에 동의했고, 12라운드에 `&unsetValue`로 이름을 바꿨다(`setValue`와 짝) |
- 보충:
  > 소유자(9라운드 pristine 정정): "이건 내 오해니, 신규 필드로 하자." (`reviews/round-9-spec.md:68`)
  > 소유자(12라운드 5): "다만 한가지, unsetValue 가 낫지 않나? clear 가 나은가." (`reviews/round-12-owner-answers.md:13`)
- 상태: 대체됨(→ SURFACE-022, CONTROLS-016, CONTROLS-028)
- 출처: `07-conclusions.md:309`(정본), `reviews/round-9-spec.md:102`, `reviews/round-12-owner-answers.md:13`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:68` pristine 정정), 소유자 답(`reviews/round-12-owner-answers.md:13` 5)
- 라운드: 12
- 까닭: `reviews/round-12-owner-answers.md:13`

### SURFACE-038 대체됨(철자): `dirty`·`touched` 초기화 `&resetInteraction`(옛 `&pristine`) — 이름 낱말은 `controls.resetInteraction`로 현행

- 결정:
  > | 대상 | 이름 | 비고 |
  > | --- | --- | --- |
  > | `dirty`·`touched` 초기화 | `&resetInteraction`(옛 `&pristine`) | 5.0의 5 |
  > | `dirty`·`touched` 초기화의 새 이름 | `&resetInteraction` | 소유자 동의(5.0의 5). `&pristine`을 대체. 이주 항목 |
- 보충:
  > "| E-5 `&pristine` 이름 | 동의 |" (`reviews/round-10-owner-answers.md:32`)
- 상태: 대체됨(→ SURFACE-022, CONTROLS-016, CONTROLS-029)
- 출처: `07-conclusions.md:310`(정본), `07-conclusions.md:316`, `07-conclusions.md:33`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:32` E-5)
- 라운드: 10
- 까닭: `reviews/round-10-owner-answers.md:32`

### SURFACE-039 로드 시 예약 층의 자동 쓰기 억제 — `DisableAutomaticWrites`·`EnableAutomaticWrites`, Form 속성 `disableAutomaticWrites`

- 결정:
  > | 대상 | 이름 | 비고 |
  > | --- | --- | --- |
  > | 로드 시 예약 층의 자동 쓰기 억제 | `SetValueOption.DisableAutomaticWrites` / `SetValueOption.EnableAutomaticWrites`, Form 속성 `disableAutomaticWrites` | 06의 `DisableSchemaDefaults`를 대체. 오늘 내부 플래그 `Automatic`("폼이 스스로 쓴 값")의 어휘. 범위는 그 호출(로드와 `Merge`)이 일으킨 예약 층의 쓰기 전부(채움, `&derived`, `&injectTo`, `&unsetValue`, 나감의 비움)이고 로드 값 자체는 막지 않는다. `&active`의 방출 제외는 쓰기가 아니라 투영이므로 범위 밖이고, 정책이 참으로 정해진 노드의 나감 비움은 범위 안이다. 둘 다 없으면 Form 속성을 따르고 둘 다 주면 억제가 이긴다 |
- 보충:
  > "`DisableAutomaticWrites`의 범위는 **그 호출이 일으킨 자동 쓰기 전부**(채움, `controls.derived`, `controls.injectTo`, `controls.unsetValue`, 나감의 비움)이며 로드 값 자체는 막지 않는다." (`08-design-a-to-z.md:278`)
  > "이 범위는 문서 주석에 적는다." (`06-conclusions.md:341`)
- 상태: 현행
- 출처: `07-conclusions.md:311`(정본), `07-conclusions.md:345`, `reviews/round-9-spec.md:104`, `08-design-a-to-z.md:278`, `06-conclusions.md:341` (같은 규칙: WRITE-008, WRITE-015), `reviews/round-18-closing.md:2881`, `reviews/round-18-owner-answers.md:12`
- 닫은 사람: 편집자 결정(9라운드, `reviews/round-9-spec.md:97` 세 곳의 추천을 합쳐 소유자가 동의; 이름), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 나감 비움은 정책이 참인 노드만), 편집자 결정(13라운드, `07-conclusions.md:311`; 억제 범위에 나감 비움을 넣음), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-103), 편집자 결정(18라운드, WRITE-078; trim도 억제 비트 대상)
- 라운드: 18
- 까닭: `reviews/round-9-spec.md:104`, `reviews/round-18-closing.md:2891-2893`
- 충돌:
  > `07-conclusions.md:311`의 "`&derived`, `&injectTo`, `&unsetValue`"는 15라운드 뒤의 표기(`controls.derived`·`controls.injectTo`·`controls.unsetValue`)와 다르다. 뒤 라운드가 이긴다(`08-design-a-to-z.md:278`, `02-target-overview.md:319`).
  > `07-conclusions.md:311`의 "(로드와 `Merge`)"는 18라운드 결정과 다르다: `setValue(V)`는 로드가 아니라 전체 교체 쓰기이며(WRITE-090), 억제 비트의 범위는 그 호출(로드와 전체 교체 쓰기, `Merge`)이 일으킨 예약 층의 쓰기 전부다(WRITE-097). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2881`).
  > `08-design-a-to-z.md:278`의 "`DisableAutomaticWrites`의 범위는 **그 호출이 일으킨 자동 쓰기 전부**(채움, `controls.derived`, `controls.injectTo`, `controls.unsetValue`, 나감의 비움)이며"는 소유자 답과 다르다: 포커스 아웃 `trim`이 자른 값의 쓰기도 자동 쓰기이고 억제 비트의 대상이다(WRITE-078). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:12`).
  > `07-conclusions.md:311`의 "`&active`"는 15라운드 뒤의 표기(`controls.active`)와 다르다. 뒤 라운드가 이긴다(`08-design-a-to-z.md:278`, WRITE-015).
  > `07-conclusions.md:311`의 "(채움, `&derived`, `&injectTo`, `&unsetValue`, 나감의 비움)"은 소유자 답과 다르다: 포커스 아웃 `trim`이 자른 값의 쓰기도 자동 쓰기(여섯째)이고 억제 비트의 대상이다(WRITE-078). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:12`). 다만 이 셀의 목록은 그 호출이 일으킨 쓰기이고, 뒤이은 포커스 아웃의 `trim`은 그 호출이 일으킨 것이 아니어서 호출 수준 비트에는 들지 않으며 Form 속성 `disableAutomaticWrites`에만 든다(WRITE-100).

### SURFACE-040 대체됨(철자): 조각 게이트는 `&active`로 통합, `&if` 은퇴 — 뜻은 `controls.active`로 현행

- 결정:
  > | 대상 | 이름 | 비고 |
  > | --- | --- | --- |
  > | 조각 게이트 | `&active`로 통합, `&if` 은퇴 | 노드 스키마에 쓰면 노드 게이트, 조각 객체에 쓰면 조각 게이트. JSON의 `if`가 이미 조각 게이트이므로 `&if`는 같은 게이트의 셋째 철자가 되어 G4에 걸린다. 이주 항목 |
- 보충:
  > 소유자(10라운드 A-2): "기존과 달리 의미를 통일했으니 이렇게 해도 무방하다." (`reviews/round-10-owner-answers.md:8`)
- 상태: 대체됨(→ SURFACE-022, CONTROLS-016, CONTROLS-021, CONTROLS-049)
- 출처: `07-conclusions.md:312`(정본), `07-conclusions.md:135-139`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:8` A-2), 편집자 결정(9라운드, `07-conclusions.md:135` 4.24 노드 게이트)
- 라운드: 10
- 까닭: `reviews/round-10-owner-answers.md:8`

### SURFACE-041 대체됨: 없음인 키 채우기 `&default`(표준 키워드의 표현식 판) — 이름은 `controls.default`, 식이 아니라 값

- 결정:
  > | 대상 | 이름 | 비고 |
  > | --- | --- | --- |
  > | 없음인 키 채우기 | `&default` | 세 곳 일치. "`&키`는 표준 키워드의 표현식 판"이라는 규칙 그대로. `&defaultValue`는 Form 속성과 층위가 섞여 제외 |
- 보충:
  > 소유자(9라운드 읽기2 채우기 원천): "default 는 좀 특이하게 &default 가 아니게 선언도 가능할거같다. 표준 스키마 문법이니. 그러니 &default 가 있으면 그걸 쓰고, 없으면 default 를 쓴다. 다 없으면 채우지 않는다." (`reviews/round-9-spec.md:52`)
- 상태: 대체됨(→ SURFACE-022, CONTROLS-016, CONTROLS-025, CONTROLS-018)
- 출처: `07-conclusions.md:313`(정본), `reviews/round-9-spec.md:106`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천), 편집자 결정(9라운드, `reviews/round-9-spec.md:97` 세 곳의 추천을 합쳐 소유자가 동의)
- 라운드: 9
- 까닭: `reviews/round-9-spec.md:52`

### SURFACE-042 대체됨(철자): 다른 노드 쓰기 `&injectTo`를 예약 층에 편입 — 이름 낱말은 `controls.injectTo`로 현행

- 결정:
  > | 대상 | 이름 | 비고 |
  > | --- | --- | --- |
  > | 다른 노드 쓰기 | `&injectTo` | 예약 층에 편입 |
- 보충:
  > 소유자(9라운드 요약 발언): "값변경도 전량 &와 injectTo로 처리(injectTo 도 & 패밀리로 넣어도 됨, 단 그럼 computed 이름을 바꿔야함)" (`reviews/round-9-spec.md:32`)
- 상태: 대체됨(→ SURFACE-022, CONTROLS-016, CONTROLS-027)
- 출처: `07-conclusions.md:314`(정본), `reviews/round-9-spec.md:26,32`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:32` 요약 발언), 소유자 답(`reviews/round-9-spec.md:26` 축8)
- 라운드: 9
- 까닭: `reviews/round-9-spec.md:32`

### SURFACE-043 대체됨(철자): 자식 집합 제어 — 조각 범위 제어와 `&children` 블록 둘 다, `targets`와 `control` — 뜻은 `controls.children`으로 현행

- 결정:
  > | 대상 | 이름 | 비고 |
  > | --- | --- | --- |
  > | 자식 집합 제어 | 조각 범위 제어와 `&children` 블록 둘 다 | 소유자 답(5.0의 14·15): `'&children': [{ targets: ['name', 'email'], control: { readOnly: '../locked', unsetValue: '...' } }]`. `targets`와 `control`을 나누고, `control`에는 상태 키뿐 아니라 값 키(`default`, `derived`, `unsetValue`, `resetInteraction`, `unsetOnInactive`)도 허용한다 |
- 보충:
  > 소유자(9라운드 자식 집합 제어): "지금 추천을 동의하나 &chiledren:{} 필드도 있었으면 좋겠어. 조각단위 제어 기능도 추가하고, 컨트롤 블록도 허용하길 바라. oneOf-anyOf 없는 순수 객체도 집합제어를 제공했으면 해서." (`reviews/round-9-spec.md:108`)
  > 소유자(10라운드 C-15): "좀 복잡해져도 거의 풀펑션을 지원하길 바랍니다." (`reviews/round-10-owner-answers.md:16`)
- 상태: 대체됨(→ SURFACE-022, CONTROLS-016, CONTROLS-030, CONTROLS-042)
- 출처: `07-conclusions.md:315`(정본), `07-conclusions.md:34,323`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:108` 자식 집합 제어), 소유자 답(`reviews/round-10-owner-answers.md:16` C-15), 소유자 답(`reviews/round-10-owner-answers.md:21` D-14)
- 라운드: 10
- 까닭: `reviews/round-10-owner-answers.md:16`

### SURFACE-044 대체됨(철자): 명시 판별 `&discriminator` — 이름 낱말은 `controls.discriminator`로 현행

- 결정:
  > | 대상 | 이름 | 비고 |
  > | --- | --- | --- |
  > | 명시 판별 | `&discriminator` | 소유자 동의(5.0의 22). union 호스트에 키 이름을 적으면 청사진이 분기별 `&active`로 바꾼다 |
- 보충:
  > "| §2 권고 | 2 `&discriminator` | 명시 필수 수용. |" (`reviews/round-12-owner-answers.md:9`)
- 상태: 대체됨(→ SURFACE-022, CONTROLS-016, CONTROLS-031)
- 출처: `07-conclusions.md:317`(정본), `07-conclusions.md:142`
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-12-owner-answers.md:9` 2)
- 라운드: 12
- 까닭: `reviews/round-10-owner-answers.md:11`

### SURFACE-045 분기 선택 명령은 지워짐 — `setSelectedBranch`·`selectedBranch`·`activeBranch`, `oneOfIndex`·`anyOfIndices`도 대체물 없이

- 결정:
  > | 06 | 판정 | 내용 |
  > | --- | --- | --- |
  > | N2 분기 선택 명령 | 지워짐 | `setSelectedBranch`, `selectedBranch`, `activeBranch` 모두 사라진다. 오늘의 `oneOfIndex`·`anyOfIndices`도 대체물 없이 사라진다(분기의 필드는 노드이고 활성 여부는 노드의 `active`로 읽는다) |
- 보충:
  > "| 2 | `oneOfIndex`·`anyOfIndices`, 분기 선택 API | 대체물 없이 사라진다. 분기의 필드는 노드이고 활성 여부는 노드의 `active` |" (`08-design-a-to-z.md:434`)
  > "| `scope`, `variant`, `oneOfIndex`, `anyOfIndices`, `initialized` | 공개 겉면에서 빠짐. 오늘 탐색이 `variant`에 기대는 점은 18라운드 안건 N2 |" (`reviews/raw-round17-node-structure.md:83`)
- 상태: 현행(부정 결정)
- 출처: `07-conclusions.md:346`(정본), `07-conclusions.md:142`, `08-design-a-to-z.md:434`, `02-target-overview.md:328`, `06-conclusions.md:346`, `05-before-after.md:138`, `reviews/raw-round17-node-structure.md:83` (같은 규칙: FRAGMENT-010; 탐색이 기대는 내부 칸 `variant`·`oneOfIndex`의 존폐는 열림 NODE-019, `reviews/round-18-agenda.md:74`)
- 닫은 사람: 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 편집자 결정(10라운드, `07-conclusions.md:142`)
- 라운드: 10
- 까닭: `07-conclusions.md:142`

### SURFACE-046 대체됨: N5 판정 — `control`로 이름만 바꾸고 `&`는 제어 키와 `control.*`에만(13라운드)

- 결정:
  > | 06 | 판정 | 내용 |
  > | --- | --- | --- |
  > | N5 FE 전용 키 문법 | 바뀜 | `computed` 컨테이너를 없애지 않고 `control`로 이름만 바꾼다. 평면 `&` 키와 `control.*`는 같은 것의 두 철자. `&if`는 `&active`로 통합. 접두 규칙은 13라운드에 바뀌었다. `&`는 제어 키와 `control.*`에만 붙는다. 접두 없는 폼 전용 키(형상·투영 키와 표현 키, 닫힌 목록은 원장 §1.4)는 접두가 없다. 맨 키 `disabled`·`visible`·`active`는 `&`로 옮긴다 |
- 보충:
  > 소유자(13라운드 3): "제어용 필드들에 대해서만 &를 붙이는 방향으로 가자." (`reviews/round-13-owner-answers.md:9`)
- 상태: 대체됨(→ SURFACE-021, SURFACE-022, CONTROLS-016)
- 출처: `07-conclusions.md:349`(정본), `reviews/round-13-owner-answers.md:9`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:9` 3 폼 전용 키 접두), 소유자 답(`reviews/round-9-spec.md:27` 축9)
- 라운드: 13
- 까닭: `reviews/round-13-owner-answers.md:9`

### SURFACE-047 오늘의 공개 이름 가운데 `Node`로 줄인 것에 이름 규칙을 적용할지와 그 이주

- 결정:
  > 소유자: "Node로 축약해서 부를때는, 매우 협소한 네임스페이스 내에서만 썼으면 해요. 나머지도 마찬가지입니다." 오늘의 공개 이름 가운데 `Node`로 줄인 것(형 `ArrayNode`·`BooleanNode`·`NullNode`·`NumberNode`·`ObjectNode`·`StringNode`·`VirtualNode`, `NodeState`, `NodeEventType`, 가드 `is…Node`)에 이 규칙을 적용할지와 그 이주는 18라운드 안건이다(가드 `isBranchNode`·`isTerminalNode`의 이름 유지는 17라운드 노드 구조 논의의 `group` 행에서 소유자가 받아들인 것이다).
- 보충:
  > 소유자(17라운드 `Node` 이름 규칙): "Node로 축약해서 부를때는, 매우 협소한 네임스페이스 내에서만 썼으면 해요. 나머지도 마찬가지입니다." (`reviews/round-17-owner-answers.md:53`)
- 상태: 대체됨(→ SURFACE-056)
- 출처: `08-design-a-to-z.md:425#5`(정본), `reviews/round-18-agenda.md:91`, `09-landing-and-test-strategy.md:110` (같은 규칙: NODE-011, NODE-012, NODE-015), `reviews/round-18-closing.md:1291-1301`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:53` `Node` 이름 규칙), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름; 가드 이름 유지), 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:91`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-47)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:91`, `reviews/round-18-closing.md:1303-1306`

### SURFACE-048 대체됨: 제어 키 문법의 세 부류 — 형용사·명사·동사(`injectTo`는 동사)

- 결정:
  > 문법이 세 부류로 나뉘고 이 구분이 곧 예측 규칙이다. 형용사(`active`, `visible`, `readOnly`, `disabled`)는 참인 동안 유지되는 상태, 명사(`default`, `derived`)는 값의 출처, 동사(`unsetValue`, `injectTo`)는 참이 되는 순간의 동작이다.
- 보충: 없음
- 상태: 대체됨(→ CONTROLS-019)
- 출처: `07-conclusions.md:339#1-2`(정본)
- 닫은 사람: 편집자 결정(9라운드, `07-conclusions.md:339`)
- 라운드: 9
- 까닭: `07-conclusions.md:339`

### SURFACE-049 대체됨: 억제는 전체 교체가 일으킨 정착에서만 듣고, `fire`를 고르면 `injectTo`·`&derived`까지 끈다

- 결정:
  > 억제는 호출자의 전체 교체가 일으킨 정착에서만 듣고, 사용자 입력이 켠 조각의 전이 주입은 막지 못한다. 5.1에서 `fire`를 고르고 그 귀결을 받으면 `injectTo`와 `&derived`까지 끈다.
- 보충: 없음
- 상태: 대체됨(→ SURFACE-039)
- 출처: `06-conclusions.md:341#2-3`(정본)
- 닫은 사람: 편집자 결정(8라운드 N1, `06-conclusions.md:341`)
- 라운드: 8
- 까닭: `06-conclusions.md:341`

### SURFACE-050 값 읽기 이름 확정 — `value`·`outputValue`, `FormHandle.getValue()` 유지, `submit`은 쓰지 않음, 노드는 getter

- 결정:
  > 노드의 공개 이름은 `value`(합성 값)와 `outputValue`(방출 값)로 확정. `FormHandle.getValue()`는 이름 그대로 두고 루트의 `outputValue`를 돌려준다(폼 밖에서는 둘을 구분할 필요가 없다). `submit`은 폼 제출 제어에 쓰는 낱말이라 값 이름에 쓰지 않는다. 노드 인터페이스의 관례는 getter이고 `get~()` 함수는 두지 않는다.
- 보충:
  > 소유자(12-8 이어서 답): "일단 첫번째로 form 외부 입장에서는 이게 outputValue 인거랑 value 를 구분할 필요가 없을거같아. node 의 공개표면 이름은 outputValue 로 확정하자. 다만, form handle 에서 getOutputValue 로 할 필욘 또 없을거같다. submit 은 따로 쓰는 명칭이 있어서(form submit 제어용) 사용하기 어렵고. 개별 노드는 내가 getter 를 쓰지 get~~() 함수를 제공하지 않는 방향을 썼어서 getInactiveValues 는 어떻게 구성될지 모르겠군. path 를 받는걸 보면 node 인터페이스는 아닌건가?" (`reviews/round-18-owner-answers.md:21`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:21`(정본, 12-8 이어서의 반영 칸. 표 행이라 조각 번호로 나눌 수 없다) (같은 이름: SURFACE-006, VALUE-027; 잠복 원본 열거의 자리: VALUE-029)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:21` 12-8 이어서)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:21`

### SURFACE-051 `Overwrite`와 `Merge`는 서로 겹치지 않는 비트 — 함께 주면 `INVALID_WRITE_OPTION`, `Overwrite`는 기본값

- 결정:
  > 【추론】 `Overwrite`와 `Merge`는 서로 겹치지 않는 비트다.
  > 【추론】 둘을 함께 주면 `INVALID_WRITE_OPTION`이다.
  > `Overwrite`가 전체 교체이자 기본값이고 `Merge`가 부분 쓰기인 것은 오늘과 같다(SURFACE-025 그대로).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:490-492`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:502-510`
- 충돌:
  > `06-conclusions.md:334`의 "`Overwrite ⊇ Merge`를 유지해 둘을 함께 주면 `Overwrite`가 이긴다"는 18라운드 결정과 다르다: 두 비트는 겹치지 않고, 함께 주면 `INVALID_WRITE_OPTION`이다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:491`).

### SURFACE-052 정합 상태(경고등)의 공개 이름 — 노드 getter `valueTypeMismatch`(가칭)와 이를 판별자로 한 공개 합집합, `FormTypeInputProps`의 같은 이름 칸

- 결정:
  > 【추론】 공개 이름은 가칭으로 노드 getter `valueTypeMismatch: boolean`이다.
  > 【추론】 코드 `VALUE_TYPE_MISMATCH`와 짝을 이뤄 검색된다.
  > 【추론】 공개 노드 형은 이 칸을 판별자로 한 합집합이다.
  > 【추론】 `false`이면 `value`가 그 형의 값·`undefined`·(nullable이면) `null`이고, `true`이면 `unknown`이다.
  > 【추론】 입력 구성 요소는 `FormTypeInputProps`의 같은 이름 칸으로 받는다.
- 보충:
  > 편집자 결정(18C-89): "【추론】 `valueTypeMismatch`가 `false`인 멤버의 `value`는 `string | number | boolean | ObjectValue | ArrayValue | undefined`이고, nullable이면 `| null`이 붙는다." (`reviews/round-18-closing.md:2340`)
  > 편집자 결정(18C-89): "【추론】 `valueTypeMismatch`가 `true`인 멤버의 `value`는 `unknown`이다." (`reviews/round-18-closing.md:2341`)
  > 편집자 결정(18C-89): "【추론】 노드 형에는 제네릭을 두지 않으며, 목록 형으로 좁히는 것은 `FormTypeInputProps`가 맡는다." (`reviews/round-18-closing.md:2342`)
  > 편집자 결정(18C-89): "【추론】 props의 `onChange`는 목록 종류의 값, `undefined`, 그리고 nullable일 때만 `null`을 받는다." (`reviews/round-18-closing.md:2345`)
  > 반영 칸(설계서 메모 4): "게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`." (`reviews/round-18-owner-answers.md:41`)
  > 편집자 결정(61C-01): "【추론】 삭제·대체는 열이다: `JSON_SCHEMA_ERROR.INJECT_TARGET_NOT_FOUND` 삭제(`injectTo` 대상은 정적으로 알 수 없고 동적 실패는 `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING`, CONTROLS-079); `JSON_SCHEMA_ERROR.INVALID_VIRTUAL_NODE_VALUES` 삭제 → `SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES`(쓰기 오류로 부류 이동, ERROR-195); `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH` 삭제 → `SCHEMA_FORM_WARNING.MISFIT`(소유자 확정, SURFACE-061); `SCHEMA_FORM_WARNING.UNSET_ON_INACTIVE_ON_OBJECT` 삭제(소유자 판정으로 코드 행 제거); `NodeState` → `SchemaNodeState`, `NodeEventType` → `SchemaNodeEventType`(SURFACE-056, 옛 소비자 이주는 07); `valueTypeMismatch`·`valueTypeMismatches` → `misfit`·`misfits`(SURFACE-061); `latent` → `getInactiveValues(path)`(SURFACE-006); 옛 Form 속성 `onListenerError`와 `throwOnBudgetExceeded` 삭제(기록은 `onError`가 받고, 모든 환경에서 사슬 끝에 던진다). 원장에서 이 옛 이름을 가진 문장은 옛 글로 남고 이 보충이 이긴다." (`reviews/round-61-closing.md:10`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1091-1095`(정본), `reviews/round-18-closing.md:2340-2342,2345`, `reviews/round-18-owner-answers.md:41`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-89), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1134-1141`, `reviews/round-18-closing.md:2367-2370`
- 충돌:
  > `reviews/round-18-closing.md:1091`의 "【추론】 공개 이름은 가칭으로 노드 getter `valueTypeMismatch: boolean`이다."는 소유자 답과 다르다: 이 항목의 `valueTypeMismatch`·`valueTypeMismatches`·`VALUE_TYPE_MISMATCH`는 확정 이름 `typeMismatch`·`typeMismatches`·`SCHEMA_FORM_WARNING.TYPE_MISMATCH`로 읽는다(SURFACE-061). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:41`).

### SURFACE-053 루트 전용 넷(`globalState`·`globalErrors`·`setSubtreeState`·`clearSubtreeState`)은 모든 노드의 멤버 — `FormHandle`은 루트에 위임

- 결정:
  > 【추론】 `globalState`·`globalErrors`(게터)와 `setSubtreeState(state)`·`clearSubtreeState()`는 모든 노드의 멤버로 남긴다.
  > 【추론】 두 게터는 트리 전체의 값을 든 런타임을 읽는 문장 하나다.
  > 【추론】 어느 노드에서 읽어도 같다(오늘과 같음).
  > 【추론】 두 메서드는 그 노드의 하위 트리에 거는 `dispatch` 진입이다.
  > 【추론】 `FormHandle`의 `getState`·`setState`·`clearState`·`getErrors`는 오늘처럼 루트에 위임한다.
- 보충:
  > 편집자 결정(43C-01): "【추론】 셈(키별 참 노드 수)과 현재 `globalState` 객체는 NODE-004·26C-06대로 트리마다 하나인 `SchemaNodeRuntime`의 칸이고(칸을 더하는 절차는 NODE-045), 모든 노드의 `globalState` 게터는 SURFACE-053대로 그 런타임을 읽는 문장 하나다; 셈의 갱신은 두 곳이다 — 상태를 쓰는 `dispatch` 진입(`setState`, `setSubtreeState`, `clearSubtreeState`)에서 키마다 거짓→참이면 더하고 참→거짓이면 빼며, 정착 커밋에서 형상에 든 노드는 그때 참인 키의 수만큼 더하고 형상을 떠난 노드는 그만큼 뺀다. 커밋의 이 덧붙임은 `settle`의 공유 자리라 06과 부딪히면 33C-01의 결대로 뒤에 머지하는 쪽이 맞춘다." (`reviews/round-43-closing.md:10`)
  > 편집자 결정(79C-01): "【추론】 SURFACE-053은 `globalErrors` 게터를 "트리 전체의 값을 든 런타임을 읽는 문장 하나, 어느 노드에서 읽어도 같다(오늘과 같음)"로 두었고 `FormHandle.getErrors`는 루트에 위임하며, VALIDATE-043 (1)의 "모든 에러는 순서대로 폼 수준 목록에 남는다"는 검증기가 낸 에러의 라우팅이 판정을 바꾸지 않는다는 뜻이지 외부 오류의 포함 여부를 정한 문장이 아니다. 원장이 `globalErrors`의 내용을 바꾸는 이주 행을 두지 않았으므로 내용은 오늘과 같다: 옛 엔진의 `globalErrors`는 루트의 외부 오류를 앞에, 검증의 전역 목록을 뒤에 합친 것이고, Form `errors` 속성은 변환한 목록을 통째로 루트에 걸고 경로마다 해당 노드에도 걸므로 `errors` 속성으로 준 오류는 `getErrors()`에 나오며, 루트 아닌 노드에 `node.setExternalErrors`로 직접 건 외부 오류는 그 노드의 `errors`에만 남고 `getErrors()`에는 나오지 않는다. 그러므로 (가)도 (나)도 아니다: 코어는 런타임의 폼 수준 목록을 "루트의 외부 오류 + 라우팅 목록"으로 만들되 읽을 때가 아니라 둘 가운데 하나가 바뀔 때(루트의 `setExternalErrors`·`clearExternalErrors`, 검증 라우팅) 합친 배열을 다시 만들어 같은 값은 같은 참조로 돌려주고(패키지의 "같은 값을 두 번 읽으면 같은 참조" 규칙), 바인딩은 오늘처럼 `errors` 속성을 루트에 통째로, 경로마다 노드에도 건다(69C-03의 경로 키 재적용은 노드 쪽이고 루트에 거는 것이 함께 간다). 07의 세 사례는 외부 오류를 Form `errors` 속성(또는 루트)으로 걸었으면 `getErrors()` 포함을 단언하고, 루트 아닌 노드에 직접 걸었으면 그 노드의 `errors`만 단언하며 `getErrors()` 단언은 지운다; 사례마다 어느 쪽인지 머리에 적는다. 이주 점검표에는 "`globalErrors`·`getErrors()`의 내용: 변경 없음(루트 외부 오류 + 검증 목록)"으로 한 줄 적어 소비자가 확인할 수 있게 한다." (`reviews/round-79-closing.md:9`)
  > 편집자 결정(178C-01): "【추론】 (1)은 형 표면 밖이지만 0.16.0 JavaScript 사용자가 null을 넘겨도 폼이 서 있었는데 새 판은 던지므로, 비용 한 줄로 옛 관용을 되찾는 편이 전환의 약속(소비자가 보는 동작 동일)에 맞다. (2)는 반대로 옛 판의 부작용(소비자 객체 변형)이고 문서가 의존하지 말라고 한 내부 값이라 되살릴 이유가 없다. 둘 다 "옛 판이 내던 것을 새 판이 못 내는" 종류라 166라운드 규칙대로 편집자가 정한다." (`reviews/round-178-closing.md:9`)
  > 소유자(185라운드, 자식 외부 오류의 루트 전파를 경로로): "경로로 같은 효과 내는 쪽으로 리뷰어한테 넘겨줘." (`reviews/round-185-owner-answers.md:7`) — 자식 노드의 clearExternalErrors/setExternalErrors가 key 없이 dataPath로 루트 집계(globalErrors·onValidate)에 반영되게 한다(0.16.0 동작의 복원, 잠재 버그 없이); reviewer가 PR #354에서 구현(원장 관리자, 2026-10-13).
  > 편집자 결정(188C-01): "【추론】 onValidate는 "폼의 오류 집계가 바뀌었다"를 알리는 통로이고 0.16.0에서 외부 오류도 그 집계에 들어가 통지됐다. 새 판이 검증 결과에만 통지하면 errors prop으로 서버 오류를 넣는 소비자가 다음 검증까지 집계를 못 보게 되어 옛 판보다 좁아진다. 185라운드가 자식 전파까지 루트 집계에 넣기로 했으므로 통지도 같은 자리에서 함께 나가야 일관된다." (`reviews/round-188-closing.md:9`)
  > 편집자 결정(195C-01): "【추론】 (1)은 소비자가 가장 흔히 쓰는 모양(값 바뀌면 서버 오류 지우기)에서 루트 목록이 틀리는 회귀라 차단이 맞다. (2)는 소유자가 직접 지시한 변화라 허용 목록에 빠진 것은 내 기록 누락이다. (4)·(5)는 "경로"를 문자열로 읽은 데서 온 것이고 노드 경로로 통일하면 둘 다 사라진다. (3)은 속도와 늦은 평가의 교환이라 소유자 몫이지만, 늦은 평가를 요구한 이유가 사라졌으므로 2안을 추천한다." (`reviews/round-195-closing.md:9`)
  > 편집자 결정(208C-01): "【추론】 (1)은 오류 경로의 원자성이라 새 동작이 옳고 소비자에게 더 안전하다. 꼬리는 전부 외부 오류 채널과 설정·문서라 쓰기 경로 측정과 독립이다." (`reviews/round-208-closing.md:9`)
  > 편집자 결정(215C-01): "【추론】 PR의 코드 범위가 시험·스토리·시나리오뿐이고 수치가 직접 재실행과 맞으며 결함은 모두 상류에서 고쳐졌으므로 머지에 남는 위험은 없다. 최상위 virtual 형은 런타임이 무시하는 자리를 형이 허용하는 함정이라 지워야 하지만 공개 형이므로 계획을 거친다." (`reviews/round-215-closing.md:15`)
  > 편집자 결정(DR-10): "【추론】 DR-10·DR-12: validator 교체 또는 pending reset 재대조 뒤 errors effect는 렌더가 보유한 옛 root가 아니라 store.load.root의 현행 root에 적용한다. 같은 errors 배열 재적용은 기존 조기 반환을 따른다. replacement reset의 applyFormErrors는 이전 root 유무와 무관하게 load origin으로 호출하며 자체 batch 사슬의 listener 실패도 load로 보고한다. 오류 배열 내용·경로별 배정과 caller throw·호스트 전달 규칙은 바꾸지 않는다." (`reviews/defect-round.md:25`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1155-1159`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-41)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1173-1176`

### SURFACE-054 노드의 공개 `schemaPath`·`key`는 두지 않는다 — 라우팅은 청사진 `id`, React key는 인스턴스 신원

- 결정:
  > 【추론】 노드의 공개 `schemaPath`·`key`는 두지 않는다.
  > 【추론】 공유 노드는 선언이 여럿이라 스키마 위치 하나로 정의되지 않는다.
  > 【추론】 에러 라우팅의 키는 청사진 항목의 `id`(작성된 스키마 위치)이고 `validation` 안에서만 쓴다.
  > 【추론】 React key와 구성 요소 캐시의 키는 바인딩이 노드 인스턴스의 신원으로 짓는다(예: 노드를 키로 한 `WeakMap`의 일련번호).
  > 【추론】 같은 이름·다른 종류로 바뀌면 인스턴스가 달라 다시 마운트된다.
  > 【추론】 오늘 `schemaPath`를 넣은 key와 같은 효과다.
  > 【추론】 공유 노드와 배열 아이템(T-22)은 인스턴스가 이어지는 동안 다시 마운트되지 않는다.
  > 【추론】 통째 쓰기에서 아이템 인스턴스가 이어지는지는 18C-59가 정한다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1202-1209`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-43)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1212-1214`

### SURFACE-055 `node.context` getter와 `FormTypeInputProps.context`는 루트의 맥락 객체를 준다 — 갱신은 바인딩 전용 통로 `setContext`(가칭)

- 결정:
  > 【추론】 `node.context`는 루트의 맥락 객체(같은 참조)를 돌려주는 getter로 남긴다.
  > 【추론】 맥락의 갱신은 `finishInput`처럼 바인딩 전용 내부 통로(NODE-010)이며, 가칭 `setContext`다.
  > 【추론】 `FormTypeInputProps.context`도 오늘처럼 남기며, 루트의 맥락 객체(`node.context`와 같은 참조)를 준다.
- 보충:
  > 편집자 결정(28C-03): "【추론】 식과 `controls.injectTo`의 `ctx.context`가 보는 `@`의 값은 트리마다 하나인 `SchemaNodeRuntime`의 맥락 칸이다(26C-06, NODE-045의 절차): 트리 생성 때 바인딩이 준 맥락 객체 하나를 받고, 없으면 `{}`다." (`reviews/round-28-closing.md:33`)
  > 편집자 결정(28C-03): "【추론】 맥락 변경의 진입은 바인딩 전용 내부 통로 `setContext`(가칭, SURFACE-055·NODE-010)이고, 그것이 도는 정착(역의존 표의 `@` 항목이 가리키는 노드와 그 조상의 재계산, `@`를 읽는 `derived`·`unsetValue`·`resetInteraction`에게의 에지)은 PR-3의 기제다: 에지 소비와 파생이 PR-3이고(LANDING-063), 원장이 PR을 적지 않은 것은 그 기제를 들여오는 PR에 든다(26C-01)." (`reviews/round-28-closing.md:38`)
  > 편집자 결정(28C-03): "【추론】 PR-7은 `FormProvider`·Form 속성을 병합해 이 통로를 부르는 바인딩만 붙인다." (`reviews/round-28-closing.md:39`)
  > 편집자 결정(28C-08): "【추론】 `node.context` 게터(SURFACE-055)는 PR-3, 곧 04의 겉면 멤버다: 그 기제(런타임의 맥락 칸, 28C-03)가 04에 들어오고 게터는 그 칸의 같은 참조를 돌려줄 뿐이며(26C-01의 규칙), `FormTypeInputProps.context`는 PR-7 렌더 계층이다." (`reviews/round-28-closing.md:84`)
  > 편집자 결정(28C-08): "【추론】 맥락 변경의 정착은 로드가 아니므로 에지의 기준점은 직전 커밋이다(CONTROLS-080 (8) "기준점은 SETTLE-004대로 따르고, 같음 판정은 18C-50을 따른다")." (`reviews/round-28-closing.md:85`)
  > 편집자 결정(28C-08): "【추론】 같은 참조가 오면 바뀜이 없어 정착이 돌지 않고, 내용이 같은 새 객체도 "깊이 같은 값은 같은 참조로 본다"에 따라 바뀜이 아니어서 정착이 돌지 않는다(같음은 18C-50 (가)로 판정한다)." (`reviews/round-28-closing.md:86`)
  > 편집자 결정(28C-08): "【추론】 내용이 같은 새 객체가 오면 맥락 칸은 옛 참조를 그대로 둔다: 정착이 돌지 않는데 칸만 바뀌면 `node.context`의 참조가 통지 없이 바뀌기 때문이다(SETTLE-043 (나)와 같은 모양)." (`reviews/round-28-closing.md:90`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1259-1261`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-45)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1264-1268`

### SURFACE-056 맨앞의 `Node`만 개명 — `NodeState`→`SchemaNodeState`, `NodeEventType`→`SchemaNodeEventType`, 종류·역할 낱말이 앞에 붙은 이름은 그대로

- 결정:
  > 【추론】 이름의 맨앞에 홀로 선 `Node`만 바꾼다.
  > 【추론】 개명은 둘이다: `NodeState` → `SchemaNodeState`, `NodeEventType`(공개 별칭, 오늘 `src/index.ts:44`의 `PublicNodeEventType as NodeEventType`) → `SchemaNodeEventType`.
  > 【추론】 종류나 역할의 낱말이 이름공간을 좁히는 이름은 그대로 둔다: 종류 형 일곱(`ArrayNode`·`BooleanNode`·`NullNode`·`NumberNode`·`ObjectNode`·`StringNode`·`VirtualNode`), 가드(`isArrayNode` 등과 `isBranchNode`·`isTerminalNode`), `FormTypeInputPropsWithNode`, `ChildNodeComponentProps`, 훅 `useChildNodeComponentMap`·`useChildNodeErrors`(`src/index.ts:60,64,82-83`).
  > 【추론】 범위 문장: "`Node`를 이름의 맨앞에 홀로 쓰지 않는다."
  > 【추론】 종류·역할 낱말이 앞에 붙은 `…Node`는 NODE-011의 "아주 좁은 이름공간"으로 본다.
  > 【추론】 18C-02의 새 가드(가칭 `isUnionNode`)도 이 규칙으로 짓는다.
  > 【추론】 `NodeStateFlags`는 `src/index.ts`가 이름으로 내보내지 않고 `components/Form/type.ts:58,118-119`의 형으로만 닿으므로 개명 목록에 들지 않는다.
  > 【추론】 `NodeStateFlags`에는 새 코드가 NODE-011을 적용한다.
  > 【추론】 새 이름의 공개 형은 PR-2의 `SchemaNode/type.ts`가 처음부터 쓰고, 소비자 이주는 PR-7이다.
- 보충:
  > 반영 칸(18C 검토 3번, 안쪽 코드): "18C-47의 두 개명(`SchemaNodeState`, `SchemaNodeEventType`)은 공개 표면과 안쪽 코드에 함께 적용되며, 한 형에 한 이름이고 별칭을 두지 않는다(NODE-011)." (`reviews/round-18-owner-answers.md:25`)
  > 편집자 결정(61C-01): "【추론】 삭제·대체는 열이다: `JSON_SCHEMA_ERROR.INJECT_TARGET_NOT_FOUND` 삭제(`injectTo` 대상은 정적으로 알 수 없고 동적 실패는 `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING`, CONTROLS-079); `JSON_SCHEMA_ERROR.INVALID_VIRTUAL_NODE_VALUES` 삭제 → `SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES`(쓰기 오류로 부류 이동, ERROR-195); `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH` 삭제 → `SCHEMA_FORM_WARNING.MISFIT`(소유자 확정, SURFACE-061); `SCHEMA_FORM_WARNING.UNSET_ON_INACTIVE_ON_OBJECT` 삭제(소유자 판정으로 코드 행 제거); `NodeState` → `SchemaNodeState`, `NodeEventType` → `SchemaNodeEventType`(SURFACE-056, 옛 소비자 이주는 07); `valueTypeMismatch`·`valueTypeMismatches` → `misfit`·`misfits`(SURFACE-061); `latent` → `getInactiveValues(path)`(SURFACE-006); 옛 Form 속성 `onListenerError`와 `throwOnBudgetExceeded` 삭제(기록은 `onError`가 받고, 모든 환경에서 사슬 끝에 던진다). 원장에서 이 옛 이름을 가진 문장은 옛 글로 남고 이 보충이 이긴다." (`reviews/round-61-closing.md:10`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1291-1299`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-47)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1303-1306`

### SURFACE-057 공개 이벤트 타입에 `UpdateJsonSchema`(가칭)를 더한다(minor)

- 결정:
  > 【추론】 공개 이벤트 타입(오늘 `PublicNodeEventType`의 자리, 공개 이름 `SchemaNodeEventType`, 18C-47)에 넣어 `node.subscribe`로 받는다.
  > 【추론】 공개 소비자는 `node.subscribe`·`useSchemaNodeSubscribe`(`src/index.ts:80`)로 `node.jsonSchema`를 읽는 입력 작성자다.
  > 【추론】 더하는 것이므로 minor다.
- 보충:
  > 편집자 결정(18C-52, 물음의 제목): "유효 스키마 변경 통지의 표면" (`reviews/round-18-closing.md:1438`) — 첫 문장이 넣는 것은 유효 스키마 변경 통지 `UpdateJsonSchema`(가칭, EVENT-064)다.
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1455-1457`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-52)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1462-1465`

### SURFACE-058 공개 겉면의 크기 — NODE-019의 하위 가지를 닫는 블록, 겉면 멤버는 약 57개, `subnodes`·`schemaPath`·`key`·`publish`는 빠짐

- 결정:
  > 【추론】 NODE-019의 하위 가지는 다음 블록이 닫는다: N2는 18C-33·18C-34, N5는 18C-35, N6는 18C-37, N14는 18C-38, 루트 전용 넷은 18C-41, 명령 넷은 18C-42, `subnodes`는 18C-33, `schemaPath`·`key`는 18C-43, `defaultValue`·`resetSubtree`는 18C-44, `ContextNode`와 `context`는 18C-45, `{@inheritDoc}`는 18C-46, 내부 통로는 18C-48이다.
  > 【추론】 이 결정들을 적용하면 겉면 멤버는 확정분 약 44개(`reviews/raw-round17-node-structure.md:136`, `getInactiveValues`는 VALUE-029의 게터 `inactiveValues`로 셈)에 명령 넷, 루트 전용 넷, `defaultValue`·`resetSubtree`, `context`, 18C-40의 게터 `valueTypeMismatch`·`valueTypeMismatches`를 더한 약 57개다.
  > 【추론】 `subnodes`·`schemaPath`·`key`·`publish`는 빠진다.
- 보충:
  > 반영 칸(설계서 메모 4): "게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`." (`reviews/round-18-owner-answers.md:41`)
  > 반영 칸(설계서 메모 3): "SURFACE-058의 겉면 수(명령 4 → 1, 약 57 → 약 54)" (`reviews/round-18-owner-answers.md:40`)
  > 편집자 결정(26C-01): "【추론】 `SchemaNode` 겉면의 멤버는 그 멤버가 드러내는 기제를 들여오는 PR에서 겉면에 들고, 그 PR이 `SchemaNode/`의 `DETAIL.md` 목록·멤버 목록 시험·공개 형 `SchemaNode`를 함께 고친다(EVENT-063이 명령 메서드에 정한 방식)." (`reviews/round-26-closing.md:9`)
  > 편집자 결정(26C-01): "【추론】 그래서 PR-2의 멤버 목록 시험은 PR-2 겉면의 목록을 단언하고, SURFACE-058의 약 54개는 PR-7 전환 시점의 수다; `plan/03-node-and-settle/verification.md:26`의 "이 PR은 명령 메서드 하나를 뺀 목록을 단언한다"는 이 블록으로 바꿔 읽는다." (`reviews/round-26-closing.md:14`)
  > 소유자(30라운드, 명령 메서드 이름): "네" (`reviews/round-30-owner-answers.md:9`) — 명령 메서드 하나의 이름은 `request`이고 명령 한정 `publish` 부활은 택하지 않았다. 겉면 멤버 약 54개는 그대로다(원장 관리자, 2026-10-01).
- 상태: 현행
- 출처: `reviews/round-18-closing.md:911-913`(정본), `reviews/round-18-owner-answers.md:40`, `reviews/round-18-owner-answers.md:41`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-32), 소유자 답(`reviews/round-18-owner-answers.md:40` 설계서 메모 3), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:915`
- 충돌:
  > `reviews/round-18-closing.md:912`의 "【추론】 이 결정들을 적용하면 겉면 멤버는 확정분 약 44개(`reviews/raw-round17-node-structure.md:136`, `getInactiveValues`는 VALUE-029의 게터 `inactiveValues`로 셈)에 명령 넷, 루트 전용 넷, `defaultValue`·`resetSubtree`, `context`, 18C-40의 게터 `valueTypeMismatch`·`valueTypeMismatches`를 더한 약 57개다."는 소유자 답과 다르다: 명령 넷이 메서드 하나로 합쳐지고(EVENT-073) 게터 이름은 `typeMismatch`·`typeMismatches`로 확정되어(SURFACE-061) 겉면 멤버는 약 54개다. 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:40`, `reviews/round-18-owner-answers.md:41`).
  > `reviews/round-18-closing.md:913`의 "`subnodes`·`schemaPath`·`key`·`publish`는 빠진다"는 소유자 답과 다르다: 임의 사건을 내는 공개 `publish`는 빠지되, 명령 종류를 매개변수로 받는 메서드 하나의 이름 후보에 명령 사건에 한정한 `publish` 부활이 들고 이름은 PR-4 착수 전에 소유자가 정한다(EVENT-073). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:40`).

### SURFACE-059 원장이 바꾸지 않은 오늘의 공개 표면은 그대로 — `FormProps` 열아홉 칸·`FormHandle` 열여섯 멤버·`ValidationMode`·공개 이벤트 형 여섯, PR-7 이주 점검 게이트

- 결정:
  > 【추론】 원장의 결정이나 이주 행이 바꾸거나 없앤다고 적지 않은 오늘의 공개 표면은 이름·시그니처·뜻을 그대로 둔다.
  > 【추론】 `Form` props(`src/components/Form/type.ts`의 `FormProps` 열아홉 칸)와 `FormHandle`의 열여섯 멤버가 모두 이 규칙을 따르며, 바뀌는 칸과 멤버는 원장의 결정이 정하고 LANDING의 이주 행이 적는다.
  > 【추론】 `ValidationMode`(`OnChange`·`OnRequest`·`None`)는 그대로다.
  > 【추론】 오늘의 공개 이벤트 형 여섯(`UpdateValue`·`UpdateState`·`UpdateError`·`RequestFocus`·`RequestSelect`·`RequestRemount`)은 모두 남는다.
  > 【추론】 `UpdateError`는 검증 결과가 자기 파동으로 배달하는 오류 갱신(EVENT-046)의 비트다.
  > 【추론】 새 공개 이벤트 형과 `UpdateValue`의 출처 칸(EVENT-060)은 더하는 변화이므로 이주 행이 아니라 새 기능 안내에 적는다.
  > 【추론】 공개 여섯 밖의 오늘 이벤트 종류는 공개 표면이 아니므로 새 설계가 이주 행 없이 바꾼다.
  > PR: PR-7(이주 점검)
  > 무엇: `FormProps` 열아홉 칸, `FormHandle` 열여섯 멤버, 공개 이벤트 형 여섯을 하나씩 원장의 결정·이주 행과 대조한다.
  > 통과: 바뀌는 것마다 이주 행이 있다.
  > 실패: 빠진 이주 행을 더한다.
- 보충:
  > 소유자(30라운드, 폼 핸들의 명령 모양): "네 맞습니다. 추가로, path 는 optional, 없으면 root 를 지칭합니다." (`reviews/round-30-owner-answers.md:11`) — `FormHandle`의 멤버는 열여섯에서 열여덟이 되고(`refresh`·`remount` 추가), `focus`·`select`의 경로 인자는 필수에서 선택으로 바뀐다(없으면 루트). 이 둘은 원장의 결정으로 바뀌는 멤버이므로 PR-7의 대조 목록과 이주 행에 든다(원장 관리자, 2026-10-01).
  > 편집자 결정(80C-01): "【추론】 SURFACE-059는 바뀌는 `FormHandle` 멤버마다 이주 행이 있어야 한다고 했고 그 게이트의 실패 처분이 "빠진 이주 행을 더한다"이므로, 30라운드가 `FormHandle`의 명령 모양을 정하면서 SURFACE-059의 대조 목록에 든다고만 적고 이주 행을 두지 않은 것은 빠진 행이다. 07은 이주 점검표에 LANDING-209 행을 올리고 기존 시험 `Form.binding`의 "SURFACE-059 EVENT-073 … optional-path commands" 사례를 (가)의 시험으로 인용한다." (`reviews/round-80-closing.md:10`)
  > 편집자 결정(80C-02): "【추론】 되돌리지 않는 까닭은 패키지의 "같은 값을 두 번 읽으면 같은 참조" 규칙이다 — `getErrors()`가 돌려주는 배열은 79C-01대로 코어가 바뀔 때만 다시 만드는 공유 배열이므로 소비자가 고치면 코어의 상태가 깨진다; 변경 가능한 형을 돌려주면서 "고치지 말라"고 문서에만 적는 것보다 형이 계약을 말하는 것이 맞다. 받는 쪽(`errors` 속성, 콜백 인자)의 `readonly`는 넓히는 변경이라 소비자 코드를 깨지 않는다. 07은 이주 점검표에 LANDING-210 행을 올리고, 되돌림이 아닌 복사의 안내 한 줄을 PR-8 이주 안내의 재료로 적는다." (`reviews/round-80-closing.md:18`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2276-2282,2298-2301`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-87)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2290-2296`

### SURFACE-060 안쪽 코드도 `SchemaNodeState`·`SchemaNodeEventType` 한 이름 — 공개 표면과 안쪽 코드에 함께, 한 형에 한 이름, 별칭 없음

- 결정:
  > 안쪽 코드도 공개 형과 같은 이름을 쓴다.
  > 18C-47의 두 개명(`SchemaNodeState`, `SchemaNodeEventType`)은 공개 표면과 안쪽 코드에 함께 적용되며, 한 형에 한 이름이고 별칭을 두지 않는다(NODE-011).
- 보충:
  > 소유자(18C 검토 3번): "이게 좀 애매하다. SchemaNode 내부에서는 NodeState 를 써도 되지 않을까 싶긴 한데... 공개 표면으로 나가는거는 SchemaNode 를 풀네임으로 써야하기도 하고..." (`reviews/round-18-owner-answers.md:25`)
  > 소유자(18C 검토 3번): "3번, 내부에서도 통일" (`reviews/round-18-owner-answers.md:25`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:25`(정본, 반영 칸)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:25` 18C 검토 3번)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:25`

### SURFACE-061 경고등의 공개 이름 확정 — 게터 `misfit: boolean`, 경로 목록 `misfits: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.MISFIT`; 뜻은 VALUE-037 그대로, 주석에 `schemaType`·유효 목록 기준 한 줄, 시험 파일 이름은 그대로

- 결정:
  > 게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`.
  > `mismatch`만은 검증기의 다른 불일치와 구별되지 않아 버리고, `value` 접두는 노드 게터·props에서 군더더기라 뺐다.
  > 뜻은 그대로다: `schemaType`(게이트가 켜진 동안은 유효 목록)과 `nullable` 기준의 값 형 불일치이며 `false`는 검증 통과가 아니다(VALUE-037).
  > 문서 주석에 "`node.type`이 아니라 `schemaType`·유효 목록 기준"을 한 줄 적는다.
  > 시험 파일 이름 `union.mismatch-light.test.ts`는 그대로이고, 시험이 부르는 게터·코드 이름은 확정 이름이다.
- 보충:
  > 소유자(설계서 메모 4): "typeMismatch 정도가 적절하지 않나 싶네. 아님 더 짧게 mismatch 같은것도 괜찮고 근데 너무 포괄적이면 또 파악하기 힘드니까.." (`reviews/round-18-owner-answers.md:41`)
  > 소유자(설계서 메모 4, 권장에): "그래 그걸로 메모해둬" (`reviews/round-18-owner-answers.md:41`)
  > 편집자 결정(61C-01): "【추론】 삭제·대체는 열이다: `JSON_SCHEMA_ERROR.INJECT_TARGET_NOT_FOUND` 삭제(`injectTo` 대상은 정적으로 알 수 없고 동적 실패는 `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING`, CONTROLS-079); `JSON_SCHEMA_ERROR.INVALID_VIRTUAL_NODE_VALUES` 삭제 → `SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES`(쓰기 오류로 부류 이동, ERROR-195); `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH` 삭제 → `SCHEMA_FORM_WARNING.MISFIT`(소유자 확정, SURFACE-061); `SCHEMA_FORM_WARNING.UNSET_ON_INACTIVE_ON_OBJECT` 삭제(소유자 판정으로 코드 행 제거); `NodeState` → `SchemaNodeState`, `NodeEventType` → `SchemaNodeEventType`(SURFACE-056, 옛 소비자 이주는 07); `valueTypeMismatch`·`valueTypeMismatches` → `misfit`·`misfits`(SURFACE-061); `latent` → `getInactiveValues(path)`(SURFACE-006); 옛 Form 속성 `onListenerError`와 `throwOnBudgetExceeded` 삭제(기록은 `onError`가 받고, 모든 환경에서 사슬 끝에 던진다). 원장에서 이 옛 이름을 가진 문장은 옛 글로 남고 이 보충이 이긴다." (`reviews/round-61-closing.md:10`)
  > 편집자 결정(394C-03): "【추론】 fairy08의 읽기 전용 대조(393라운드 소유자 지시) 결과를 적어 둔다. 확정 결함 일곱: 문자열 체크박스에 배열 가드가 없어 antd5·6은 문자열·수 값이면 렌더 중 TypeError, 내장 정의는 문자열을 글자 단위로 펼치고 수이면 TypeError; antd5·6 범위 입력 셋이 길이 2만 검사; 네 플러그인의 스위치 둘이 불리언 아닌 값을 유효한 켜짐·꺼짐으로 그리고 무효 표지가 없음(REACT-027 "받은 값이나 무효 표지" 위반); antd 셋의 Slider가 null을 NaN으로 방출; antd 셋의 Number가 nullable이 아니어도 null 방출; MUI Number가 빈 칸을 null로 보내고 parseInt로 자르며 일부만 해석(LANDING-184 위반); 네 플러그인 모두 misfit(SURFACE-061)을 읽는 곳이 없음. 원장 해석 필요 하나(소유자 물음): 내장 Number가 nullable이면 빈 칸에서 null을 보내는데 REACT-027의 "빈 칸이면 undefined"와 "비우기 조작은 nullable이면 null"이 갈린다. 권장 미적용 하나: 플러그인별 union 시험 항목 없음(내장 Union은 맞음). 옛 이름 typeMismatch의 잔재는 플러그인에 없다. 고치는 일은 소유자 지시대로 나중에 플러그인 PR로 한다." (`reviews/round-394-closing.md:12`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:41`(정본, 반영 칸)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:41` 반영 칸; 시험 파일 이름)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:41`

### SURFACE-062 하위 방문 — `visitSubtree(visitor)`: 자기 포함 전위, `false`는 하위 건너뛰기, 형상 한정, 순회 안의 첫 쓰기에서 batch가 열려 끝에 한 번 정착(지연 batch), 내부 순회는 `visitFieldNodes` 한 벌

- 결정:
  > 【추론】 `NodeSurface`에 `visitSubtree(visitor: (node: FieldNode) => void | boolean): void`를 `find`·`findNodes` 옆에 둔다. 런타임 `FieldNode`는 write 엔진의 디스패치에 위임하고, 디스패치는 navigation의 `visitFieldNodes`로 돈다.
  > 【추론】 자기 자신부터 전위 순서(부모 먼저, 형제는 `children` 순)로 방문한다. visitor가 `false`를 돌려주면 그 노드의 하위만 건너뛰고 형제는 계속한다. 전체 중단과 후위 순서 옵션은 두지 않는다(첫 일치는 `find`·`findNodes`의 몫).
  > 【추론】 형상에 있는 노드만 돈다(NODE-043). 터미널은 잎이고(NODE-020), 참조로 두 번 닿는 같은 인스턴스는 한 번만 방문한다. 걷는 중 생긴 노드는 방문을 보장하지 않는다.
  > 【추론】 지연 batch: 순회 자체는 chain에 들어가지 않는다. 순회 안에서 첫 쓰기가 chain 진입 지점에 닿는 순간 batch가 열리고, 그 뒤 쓰기는 표시만 되며, 순회가 끝날 때 루트에서 한 번 정착한다(`batch`와 같은 규칙: 읽기는 직전 커밋 값, 교체 범위는 쓰인 경로의 합). 쓰기가 없으면 아무것도 열지 않는다. 바깥 batch가 열려 있으면 거기에 합류한다. 전달 중(리스너 안)에는 쓰기가 평소처럼 거부되고 읽기 순회만 된다.
  > 【추론】 `FormHandle`에는 두지 않는다(`handle.node`로 충분). 공개 형 이름은 더하지 않고 함수 형을 인라인으로 적어 표면 이름 수는 그대로다.
  > 【추론】 내부 순회 셋(write의 subtree state 디스패치 둘, settle의 `walkOwnedFieldNodes`, navigation의 `walkFieldNodes`)은 navigation의 `visitFieldNodes(origin, visit, { owned?: boolean })` 한 벌로 합친다. `owned`는 `child.parent === node` 간선만 따라가며 공개하지 않는다. 형제 순서는 정순으로 통일한다 — `setSubtreeState`·`clearSubtreeState`의 역순은 스택 구현의 부산물이었고, 한 파동 안 형제 리스너가 `UpdateState`를 듣는 순서만 바뀌며 전역 상태 합계는 같다.
- 보충:
  > 소유자(342라운드, 이름부터 다시 숙고): "visit 이 끌리긴 하는데...\n이름부터 나머지까지 깊이 숙고해서 다시 추천해봐." (`reviews/round-342-owner-answers.md:7`)
  > 소유자(342라운드, 순회 중 쓰기가 배치되는가): "확정하기 전에 한가지만 검토했으면 합니다.\n만약 visitSubtree 를 사용해서 "값"을 바꾼다고 할때, 이 변경은 배치처리가 됩니까?\n\n그러니까, 모든 순회가 끝난 후, 한번에 반영이 이루어집니까? 아니면 순회 중간중간 매번 값이 반영되면서 내려가게 되나요?" (`reviews/round-342-owner-answers.md:8`)
  > 소유자(342라운드, batch를 메서드에 넣는 편이 낫지 않은가): "흠... 그런데 visit 을 사용할때 항상 batch 를 해야한다면 이걸 메소드 기능에 넣는게 좋을거같긴 한데... 권하지 않는다는거지.." (`reviews/round-342-owner-answers.md:9`)
  > 소유자(342라운드, batch 옵션(기본 켬) 설계와 재저울질): "그럼 batch 옵션을 갖도록 하고, 기본값은 배치 사용, 읽기전용인 경우 배치를 끄고 쓰는 그런 메소드 설계는 어떤지? \n그리고 중간에 권고가 달라져서... 다시 저울질을 해보길 바람" (`reviews/round-342-owner-answers.md:10`)
  > 소유자(342라운드, 지연 batch 확정, 배치 예산 물음): "좋아 그렇게 가죠.\n배치 예산인 몇입니까 지금?" (`reviews/round-342-owner-answers.md:11`)
  > 소유자(343라운드, 묶음 2 마무리와 전체 시험 한 번, 소요 시간 물음): "좋네. 개발 마무리까지 진행하고, 신규기능과 공통기능이 포함되니 테스트를 한번 거치도록 하세.\n시간이 얼마나 걸리겠나?" (`reviews/round-343-owner-answers.md:7`)
  > 편집자 결정(346C-01): "【추론】 떼어진 노드에서 부른 `visitSubtree`는 NODE-044의 구조 읽기 규칙을 따라 그 노드와 함께 떼어진 하위 트리(마지막 커밋의 형상)를 걷는다. SURFACE-062의 "형상에 있는 노드만 돈다"는 살아 있는 시작 노드에 대한 문장이다. 무동작은 명령과 상태 진입에만 정해진 것이므로 `dispatchSetSubtreeState`의 방식을 유추하지 않는다." (`reviews/round-346-closing.md:8`)
  > 편집자 결정(346C-02): "【추론】 순회 안의 정착 밖 진입 여섯(`setState`·`setSubtreeState`·`clearSubtreeState`·`setExternalErrors`·`clearExternalErrors`·`request`)은 즉시 전달하지 않고 순회의 묶음을 열어 순회 끝에 한 번 전달한다(`batch` 안과 같은 규칙, EVENT-013). 열린 진입도 순회도 없으면 전과 같이 바로 전달하고, 쓰기도 진입도 없는 순회는 아무것도 열지 않는다. 상태와 외부 오류의 데이터는 즉시 바뀌고 사건만 미뤄진다." (`reviews/round-346-closing.md:10`)
  > 편집자 결정(346C-04): "【추론】 SURFACE-062 결정의 "전달 중(리스너 안)에는 쓰기가 평소처럼 거부되고 읽기 순회만 된다"는 틀렸다. 전달 중의 쓰기는 거부되지 않고 평소 규칙대로 리스너 되먹임으로 세어지며(EVENT-016, EVENT-020), 오류 관찰자 안의 쓰기만 `WriteInObserver`로 거부된다. 리스너 안의 순회에서 쓰기가 묶음을 열면 visitor의 예외는 순회를 부른 쪽에 닿지 않는다(`batch`와 같음)." (`reviews/round-346-closing.md:14`)
  > 편집자 결정(346C-05): "【추론】 SURFACE-062 결정의 "한 파동 안 형제 리스너가 `UpdateState`를 듣는 순서만 바뀌며"는 일어나지 않는다. `deliverWave`가 파동을 문서 순서로 정렬하므로 방문 순서가 정순으로 바뀌어도 전달 순서는 그대로이고 리스너는 아무 차이도 관찰할 수 없다. 두 번 닿는 노드는 한 번만 패치되며 전에는 둘째 패치가 무동작이었다." (`reviews/round-346-closing.md:16`)
- 상태: 현행
- 출처: `reviews/round-342-owner-answers.md:15-20`(정본), `reviews/round-342-owner-answers.md:7-11`(소유자 답), `plan/tidy-structure/walk-subtree-design.md`
- 닫은 사람: 소유자 답(`reviews/round-342-owner-answers.md:11` "좋아 그렇게 가죠"), 편집자 결정(342라운드, 반영 칸; 이름·순서·형제 정순)
- 라운드: 342
- 까닭: `reviews/round-342-owner-answers.md:10`(옵션 설계 재저울질 — 엔진은 쓰기가 들어오는 순간 아니까 사용자에게 묻지 않는다)

### SURFACE-063 캐시 계층(446라운드) — 소비자 소유 키 캐시는 `src/app/cache` fractal(도메인 계약: `resolve` 멱등, 값 불변, `invalidate`·`clear`는 항목 제거만, 세대 번호), 엔진 파생 캐시는 `getBlueprintDerived`·`getHostDerived` 레코드 둘, 값·노드 키 메모의 자리, 모드 플래그는 `engineModes`, 공개 API는 `FormHandle.rebuild(option?)` 하나

- 결정:
  > 【추론】 소유자가 캐시 계층을 플러그인 매니저처럼 `app/` 아래에 모으고 수명·갱신·멱등성·불변성과 강제 갱신을 요구했으며(위 3행), 강제 폐기는 폼 핸들에 더해 공개 API로 내자고 했다(위 4행). 엔진의 프로세스 전역 가변 상태는 약 55개이고 대부분 청사진(14개)이나 청사진 노드(17개)를 키로 하는 WeakMap이며 무효화·강제 재생성 경로는 검증기 캐시(`validation/utils/cache/validationEntries.ts`의 `$id` 밀어내기와 해제 대기열 8)뿐이다. 둘로 가른다. (가) 소비자가 소유한 객체(스키마, 검증기)를 키로 쓰는 캐시만 `src/app/cache` fractal로 모은다 — `app/plugin`과 같은 모양(`INTENT.md`·`DETAIL.md`·`index.ts`·`type.ts`, `utils/CacheManager.ts` static singleton과 `reset()`, `utils/createCacheDomain.ts`, 첫 도메인 `utils/blueprintCacheDomain.ts`). 도메인 계약: `resolve(key, build)`는 같은 키에 같은 참조(멱등), 값은 생성 뒤 바뀌지 않고 개발 모드에서 freeze(불변), `invalidate(key)`·`clear()`는 항목만 제거하고 기존 값을 고치지 않아 마운트된 폼은 옛 청사진을 끝까지 쓴다(강제 갱신), 항목에 생성 세대 번호를 적는다. 소비처는 Form 바인딩뿐이고 core는 app을 import하지 않는다. (나) 엔진이 소유한 불변 객체에서 파생되는 캐시는 엔진 안에서 레코드 둘로 합친다 — 청사진당 `getBlueprintDerived(blueprint)`(파생 규칙 표, 기능 색인, 의존 색인, 게이트 예산 색인, 컨텍스트 소유자, 가상 참조 색인, 순환 여부 등 14 슬롯)와 청사진 노드당 `getHostDerived(blueprintNode)`(선택 표, 직접 선택 계획, 정적 모양, 정적 id, 정적 게이트 목록, 선언 이름, 자식 항목 등 17 슬롯), 지연 계산. 설계 Ⅰ의 호스트별 계획은 이 레코드의 새 슬롯이다. (다) 전이하는 값 객체를 키로 쓰는 메모(`STABLE_SHAPES` 둘, `objectKeyCounts`, `TRIMMED`, `staticSpec`의 둘)는 모듈 범위에 두되 이름을 갈라 한 파일에 모으고, 살아 있는 노드를 키로 쓰는 메모(`getCommittedDeclarationKey`의 `KEYS`, `HOST_CAPS`, `watchValuesMemo`, `detachedReads`)는 런타임 레코드 필드로 옮긴다. (라) `gateSelectionTable.mode`·`gateWheelEvaluation.mode`는 한 파일의 `engineModes`로 합치고 `setMode()`가 파생 레코드를 비우며, 모드를 바꾸는 벤치 fixture는 복원까지 책임진다(`__benchmarks__/fixtures/observationIdentity/prepare.mjs:141`은 복원하지 않는다). (마) 공개 API는 `FormHandle.rebuild(option?)` 하나다: 이 폼의 스키마 항목을 폐기한 뒤 `reset(option)`과 같이 트리를 다시 만든다. 폐기만 하는 메서드는 이 폼이 remount 전까지 옛 청사진을 쓰고 다른 폼에만 영향이 가서 뜻이 닫히지 않는다. 같은 스키마 객체를 쓰는 다른 폼은 각자 다음 reset에서 새 청사진을 받는데, 이는 "소비자가 스키마 객체를 변형했다"는 강제 갱신의 전제와 맞다. 전체 폐기와 테스트용 `CacheManager.reset()`은 공개하지 않는다. `rebuild`는 공개 이름 추가라 `dist/index.d.ts` 대조와 공개 이름 스냅숏 갱신이 따르고 LANDING 이주 항목으로 기록한다.
- 보충:
  > 소유자(446라운드, 캐시 계층의 자리와 요건): "캐시 레이어는 app/ 하위에 모았으면 좋겠어. plugin 매니저 처럼.\n캐시 라이프사이클이랑 리프레시, 멱등성과 불변성을 보장해야하고, 강제 업데이트(기존 캐시를 없애고 새로 만드는 등)도 어떤 형태로든 제공이 되어야하는 기능일거같거든.\n\n그리고 지금 찾은 결함을 포함해서, 동일 기능을 하는 함수나, 여러 파일에 분산된 weakmap 등 캐시 레이어를 좀 더 잘 관리할 수 있는 방법이 없을지도 검토해봐.\n지금처럼 사용처에 직접 두는게 나으면 둬도 되는데, 아무래도 관리가 좀 어려워보여서 말이야." (`reviews/round-446-owner-answers.md:9`)
  > 소유자(446라운드, 캐시 폐기의 공개 API와 설계 수정의 허용 범위): "1. 캐시 폐기를 공개 api로 내려고 한다 formHandle 에 추가하면 되지 않을까? \n\n그리고, 해당 코드는 아직 배포된건 아니라서, 검증에 대한 자신만 있으면(테스트와 시나리오는 꽤 충실하게 작성해두었고, 필요하면 더 작성할 수 있음) 설계 수정을 시도해도 좋아. \n\n다만, 아직은 설계서를 작성하거나 원장을 수정하진 말고, 검토만 해보는걸로.\n\n지금 정도 수준에서의 개선으로도 괜찮나? 아니면 근본적 설계수정이 필요한가?" (`reviews/round-446-owner-answers.md:10`)
  > 편집자 결정(447C-02): "【추론】 446C-04 (마)는 "같은 스키마 객체를 쓰는 다른 폼은 각자 다음 reset에서 새 청사진을 받는다"고 적었다. D3 구현에서 이 문장이 한 폼의 `rebuild`가 다른 폼의 `reset` 뜻을 바꾸게 만든다는 것이 드러났다: reset은 폼 자신을 기본값으로 되돌리는 동작인데, 다른 폼이 먼저 rebuild했는지에 따라 같은 reset이 청사진까지 바꾸게 된다. 패키지의 설계 가치(공개 인터페이스가 이끄는 일관성)에 따라 고친다: `reset`은 언제나 그 폼의 기존 청사진을 유지하고, 새 청사진은 그 폼 자신의 `rebuild`나 새 마운트에서만 받는다. `rebuild`가 폐기한 캐시 항목은 이후의 새 마운트와 rebuild에만 영향을 준다. 살아 있는 폼이 가리키는 옛 청사진은 rebuild 뒤에도 그 폼과 함께 남는다(446C-04의 "마운트된 폼은 옛 청사진을 끝까지 쓴다"와 같다). 결과 문서는 `verification/design-optimization/d3-cache-results.md`이다." (`reviews/round-447-closing.md:10`)
  > 편집자 결정(448C-06): "【추론】 엔진 캐시 인벤토리는 프로세스 전역 가변 상태 67개를 찾았다(직접 컬렉션 선언 54개). 판단이 필요한 28건을 원칙 다섯으로 정했다. 첫째, 상수와 프로토콜 상태(전역 /g 정규식 다섯)는 캐시가 아니므로 정리 대상에서 빼고, 재진입 위험은 지금 호출 경로에서 발견되지 않았다. 둘째, 플러그인 매니저의 구성 상태는 캐시가 아니므로 `app/plugin`에 둔다. 셋째, 살아 있는 노드나 런타임을 키로 쓰는 가변 메모는 노드 칸이 아니라 루트 runtime에 지연 생성하는 트리 소유 WeakMap으로 옮겨 노드당 힙을 늘리지 않고, runtime은 호출자가 매개변수로 넘긴다. 단조 카운터는 캐시가 아니므로 전역에 두고, 이미 runtime을 키로 하는 레지스트리는 record가 settle 형을 import하는 경계 역전을 피하려고 그 자리에 둔다. 넷째, 청사진을 만들 때만 얻을 수 있는 증거는 파생 캐시가 아니라 청사진 사실이므로 모드 전환이 지우지 않으며, 정적 사실과 정착 수명 정보가 한 객체에 섞인 곳은 둘로 가르고, 파생의 파생은 그 소유 레코드의 슬롯이 된다. 다섯째, 셋째 모드 플래그도 `engineModes`에 넣고, 파생 레코드는 단방향 공통 저장소에 소유자별 builder가 슬롯마다 독립 지연으로 채우며, 모드 전환은 두 저장소를 통째로 새로 만든다. 편차: 446C-04 (가)는 검증기 캐시도 `src/app/cache`로 모은다고 했지만, 검증기 장부는 참조 계수·해제 대기열·실패 메모를 가진 가변 장부라 "값 불변·resolve 멱등" 도메인 계약에 맞지 않으므로 검증 모듈에 둔다. 이 편차는 소유자가 뒤집을 수 있다(대기열 67). 구현은 동작 보존 리팩터 PR 둘(D3b-1 `engineModes`·이름 붙인 값 메모·트리 저장소, D3b-2 파생 레코드 둘과 분리)이며, 판정은 어느 행도 폭 밖 악화가 없고 노드당 힙이 늘지 않는 것이다." (`reviews/round-448-closing.md:18`)
  > 편집자 결정(449C-03): "【추론】 계획서에서 마운트를 겨냥한 항목은 넷이다: H5(배달 표식, H5b로 채택), H6(같은 스키마의 둘째 마운트, D3로 채택), D3의 엔진 파생 레코드 둘·값과 노드 키 메모·`engineModes`(진행 중인 D3b-1·D3b-2), 그리고 계획서 목적 절의 "정착 1회의 고정 비용" 목록에 있는 "의존 색인 등록"을 겨냥하는 설계 Ⅰ의 (c) 독자 집합(청사진이 호스트마다 "이 노드를 읽는 게이트·파생·watch"를 계산해 `getHostDerived`에 둔다). 마지막 항목을 D2-M으로 진행하며, 프로파일과 설계안을 먼저 받고 승인한 뒤 구현한다. 첫 마운트의 청사진 분석 자체를 줄이는 일(D1 통합 판에서 마운트 시간의 38~50 %)은 계획서에 없으므로 진행하지 않고, D4에서 수치와 이유를 적어 분기 전환과 함께 소유자 검토에 올린다." (`reviews/round-449-closing.md:12`)
- 상태: 현행
- 출처: `reviews/round-446-closing.md:14`(정본), `reviews/round-446-owner-answers.md:9-10`
- 닫은 사람: 소유자 답(`reviews/round-446-owner-answers.md:9-10` 캐시 계층의 자리와 폼 핸들), 편집자 결정(446라운드, `reviews/round-446-closing.md` 446C-04)
- 라운드: 446
- 까닭: `reviews/round-446-owner-answers.md:9`

### SURFACE-064 reset과 rebuild의 관계(447라운드) — `reset`은 언제나 그 폼의 기존 청사진을 유지, 새 청사진은 그 폼 자신의 `rebuild`나 새 마운트에서만, 폐기된 캐시 항목은 이후의 마운트와 rebuild에만 영향, 446C-04 (마)의 "다른 폼은 다음 reset에서 새 청사진" 대체

- 결정:
  > 【추론】 446C-04 (마)는 "같은 스키마 객체를 쓰는 다른 폼은 각자 다음 reset에서 새 청사진을 받는다"고 적었다. D3 구현에서 이 문장이 한 폼의 `rebuild`가 다른 폼의 `reset` 뜻을 바꾸게 만든다는 것이 드러났다: reset은 폼 자신을 기본값으로 되돌리는 동작인데, 다른 폼이 먼저 rebuild했는지에 따라 같은 reset이 청사진까지 바꾸게 된다. 패키지의 설계 가치(공개 인터페이스가 이끄는 일관성)에 따라 고친다: `reset`은 언제나 그 폼의 기존 청사진을 유지하고, 새 청사진은 그 폼 자신의 `rebuild`나 새 마운트에서만 받는다. `rebuild`가 폐기한 캐시 항목은 이후의 새 마운트와 rebuild에만 영향을 준다. 살아 있는 폼이 가리키는 옛 청사진은 rebuild 뒤에도 그 폼과 함께 남는다(446C-04의 "마운트된 폼은 옛 청사진을 끝까지 쓴다"와 같다). 결과 문서는 `verification/design-optimization/d3-cache-results.md`이다.
- 보충:
  > 소유자(446라운드, 캐시 폐기의 공개 API와 설계 수정의 허용 범위): "1. 캐시 폐기를 공개 api로 내려고 한다 formHandle 에 추가하면 되지 않을까? \n\n그리고, 해당 코드는 아직 배포된건 아니라서, 검증에 대한 자신만 있으면(테스트와 시나리오는 꽤 충실하게 작성해두었고, 필요하면 더 작성할 수 있음) 설계 수정을 시도해도 좋아. \n\n다만, 아직은 설계서를 작성하거나 원장을 수정하진 말고, 검토만 해보는걸로.\n\n지금 정도 수준에서의 개선으로도 괜찮나? 아니면 근본적 설계수정이 필요한가?" (`reviews/round-446-owner-answers.md:10`)
- 상태: 현행
- 출처: `reviews/round-447-closing.md:10`(정본), `reviews/round-446-owner-answers.md:10`, `verification/design-optimization/d3-cache-results.md`
- 닫은 사람: 편집자 결정(447라운드, `reviews/round-447-closing.md` 447C-02)
- 라운드: 447
- 까닭: `reviews/round-447-closing.md:10`

### SURFACE-065 엔진 캐시의 배치 원칙(448라운드) — 상수·플러그인 구성 상태는 캐시 밖, 노드·런타임 키 가변 메모는 트리 소유 WeakMap(노드 칸 금지), 생성 때의 증거는 청사진 사실, 섞인 수명은 분리, 셋째 모드도 engineModes, 파생 레코드는 단방향 공통 저장소와 소유자별 builder, 검증기 장부는 도메인 계약 밖이라 검증 모듈에 둠(446C-04 (가)의 편차, 대기열)

- 결정:
  > 【추론】 엔진 캐시 인벤토리는 프로세스 전역 가변 상태 67개를 찾았다(직접 컬렉션 선언 54개). 판단이 필요한 28건을 원칙 다섯으로 정했다. 첫째, 상수와 프로토콜 상태(전역 /g 정규식 다섯)는 캐시가 아니므로 정리 대상에서 빼고, 재진입 위험은 지금 호출 경로에서 발견되지 않았다. 둘째, 플러그인 매니저의 구성 상태는 캐시가 아니므로 `app/plugin`에 둔다. 셋째, 살아 있는 노드나 런타임을 키로 쓰는 가변 메모는 노드 칸이 아니라 루트 runtime에 지연 생성하는 트리 소유 WeakMap으로 옮겨 노드당 힙을 늘리지 않고, runtime은 호출자가 매개변수로 넘긴다. 단조 카운터는 캐시가 아니므로 전역에 두고, 이미 runtime을 키로 하는 레지스트리는 record가 settle 형을 import하는 경계 역전을 피하려고 그 자리에 둔다. 넷째, 청사진을 만들 때만 얻을 수 있는 증거는 파생 캐시가 아니라 청사진 사실이므로 모드 전환이 지우지 않으며, 정적 사실과 정착 수명 정보가 한 객체에 섞인 곳은 둘로 가르고, 파생의 파생은 그 소유 레코드의 슬롯이 된다. 다섯째, 셋째 모드 플래그도 `engineModes`에 넣고, 파생 레코드는 단방향 공통 저장소에 소유자별 builder가 슬롯마다 독립 지연으로 채우며, 모드 전환은 두 저장소를 통째로 새로 만든다. 편차: 446C-04 (가)는 검증기 캐시도 `src/app/cache`로 모은다고 했지만, 검증기 장부는 참조 계수·해제 대기열·실패 메모를 가진 가변 장부라 "값 불변·resolve 멱등" 도메인 계약에 맞지 않으므로 검증 모듈에 둔다. 이 편차는 소유자가 뒤집을 수 있다(대기열 67). 구현은 동작 보존 리팩터 PR 둘(D3b-1 `engineModes`·이름 붙인 값 메모·트리 저장소, D3b-2 파생 레코드 둘과 분리)이며, 판정은 어느 행도 폭 밖 악화가 없고 노드당 힙이 늘지 않는 것이다.
- 보충:
  > 소유자(446라운드, 캐시 계층의 자리와 요건): "캐시 레이어는 app/ 하위에 모았으면 좋겠어. plugin 매니저 처럼.\n캐시 라이프사이클이랑 리프레시, 멱등성과 불변성을 보장해야하고, 강제 업데이트(기존 캐시를 없애고 새로 만드는 등)도 어떤 형태로든 제공이 되어야하는 기능일거같거든.\n\n그리고 지금 찾은 결함을 포함해서, 동일 기능을 하는 함수나, 여러 파일에 분산된 weakmap 등 캐시 레이어를 좀 더 잘 관리할 수 있는 방법이 없을지도 검토해봐.\n지금처럼 사용처에 직접 두는게 나으면 둬도 되는데, 아무래도 관리가 좀 어려워보여서 말이야." (`reviews/round-446-owner-answers.md:9`)
  > 편집자 결정(449C-05): "【추론】 엔진 캐시를 옮길 때 다시 계산할 수 있는 메모와, 다시 계산할 수 없는 상태를 가른다. 분리된 참조의 쓰기 주소 셀(`DetachedWriteAddress.cells`)은 NODE-044의 옛 참조가 쓸 현재 잠복 주소를 보존하는 상태이므로 지금과 정확히 같은 수명을 지킨다 — 지금은 어떤 reset에서도 지워지지 않고 GC로만 사라진다. 런타임 객체가 폼 reset 뒤에도 같은 객체로 남으면 그 런타임에 두되 비우지 않고, 아니면 지금 자리에 둔다. 다시 계산할 수 있는 트리 메모만 폼 전체 reset과 트리 폐기에서 비우고, 하위 트리 reset은 트리 저장소를 통째로 비우지 않는다." (`reviews/round-449-closing.md:16`)
  > 편집자 결정(450C-03): "【추론】 D3b-1에서 `setMode()`가 파생 레코드를 비우게 되자(계획서 D3), 살아 있는 트리가 있는 동안 모드를 바꾸던 시험 몇이 깨졌다. 모드 전환은 시험과 벤치 전용 기능이고 출하 판에서는 모드가 고정이므로, 시험이 모드를 트리를 만들기 전에 정하도록 순서를 옮기는 것을 허용했다. `engineModes`의 DETAIL과 `setMode` 문서 주석에 "모드는 트리를 만들기 전에 정한다"를 적었다. 독립 검토는 바뀐 시험·픽스처 74개 가운데 단언의 값·개수·순서를 바꾼 것이 0임을 확인했다. 노드당 힙 관문을 넘은 PR은 먼저 브리프대로 구현되었는지(지연 생성, 빈 필드 없음) 확인하고, 그대로인데도 넘으면 고치지 않고 수치와 원인을 PR 머리에 적어 TEST-027로 소유자 수용에 올린다. 이 둘은 449C-02가 표시한 재검증 대상에 들어간다." (`reviews/round-450-closing.md:12`)
  > 편집자 결정(451C-03): "【추론】 D3b-2(파생 WeakMap 루트 32개를 청사진·호스트 레코드 둘의 지연 슬롯으로, 생성 사실은 청사진에 두고 `setMode()`가 지우지 않음, 엔트리별 저장소는 선언 부모 host 레코드가 소유)의 첫 후보 54b8aff0b는 기능 관문은 다 통과했지만 마운트 nested-d6-f4가 폭(0.42 ms) 밖에서 +4.18 %/+3.52 % 악화하고 Bun B2가 +80.7 B/노드(+3.63 %)라 채택하지 않았다. `verification.md`의 "원인을 같은 PR에서 분리한다"에 따라 변수 하나(staticIds 저장만 옛 전역 WeakMap)만 되돌린 탐침으로 Bun 79.06 B/노드(엔트리당 79.08 B)가 호스트별 `Map`의 비용임을 분리했고, 시간 악화는 네 변형이 모두 폭 안이라 재현되지 않았다. 최종 후보 de14aa1da(host-owned WeakMap, 소유 host를 호출자가 명시, 형제 N개의 저장소 공유 시험)는 기준판 8569ec0e1(#470 포함) 대비 기능 관문·배달 0·d.ts 0, Node B2 통과, Bun B2 B 중앙값이 A 최댓값보다 +0.608 B/노드(+0.027 %) 커서 고정 규칙 미달이었고 소유자가 TEST-027로 받아들였다(위 6행). 마운트 nested-d6-f4는 +2.60 %/+3.06 %로 폭 밖이지만 계획서 게이트의 선(TEST-073, 처리량 15 % 초과 하락과 Welch p<0.05)은 안이다. 그런데 브리프에 측정 전 고정한 규칙은 "어느 행도 폭 밖 악화가 없어야 채택"이었고 코디네이터는 측정 뒤에 계획서의 선을 적용했다: 계획서를 따른 것이지만 측정 뒤의 규칙 변경이라 TEST-081에 어긋나므로, 결과 문서와 PR에 "브리프 규칙으로는 미달, 계획서 규칙으로는 통과, 편집자가 측정 뒤 적용"으로 공개하고 재검증 대상으로 두며 D4에서 그 행을 다시 잰다. TEST-073의 평균·Welch 20비교에서 single-nested-d6-f4의 A′/B만 −16.85 %(p 2.2e-7)로 선 밖이었는데 같은 행의 A/B는 −8.34 %이고 A 대 A′의 평균 차이가 10.24 %이며 최솟값 중앙은 A와 B가 0.1766 ms로 같아, 게이트는 A/B로 보고 이 신호는 0.18 ms 행의 평균 불안정으로 읽어 공개만 했다(편집자 판정, 재검증 대상). 독립 검토(antigravity, 2부)는 PASS였으나 `admittedEdgeSchemas`가 같은 모양의 호스트별 `Map`으로 남아 게이트 형제가 많은 폼에서 같은 엔트리당 비용을 낸다고 지적했고, 후속 D3b-2b로 그것도 host-owned WeakMap으로 바꿔(제품 변경 한 파일, 이 PR의 새 시험만 수정, DETAIL 선행) 전체 고정 규약을 다시 쟀다: 폭 밖 악화 0, TEST-073 회귀 0, Node B2 통과, Bun B2 +0.413 B/노드로 수용치 안. 델타 검토 PASS. 판정 파일은 `/private/tmp/claude-501/perf-runs/446-reviews/pr-471-antigravity.md`, 결과 문서는 `verification/design-optimization/d3b-2-results.md`다." (`reviews/round-451-closing.md:12`)
- 상태: 현행
- 출처: `reviews/round-448-closing.md:18`(정본), `reviews/round-446-owner-answers.md:9`, `src/app/cache/DETAIL.md`(가지 `docs/schema-form-d3b-inventory`)
- 닫은 사람: 편집자 결정(448라운드, `reviews/round-448-closing.md` 448C-06)
- 라운드: 448
- 까닭: `reviews/round-448-closing.md:18`
