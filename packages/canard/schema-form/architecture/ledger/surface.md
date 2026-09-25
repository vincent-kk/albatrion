# 단일 원장 — 공개 표면

기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 이 원장이 인용하는 `path:line`은 모두 이 커밋의 줄 번호다. 정본 우선순위는 `ledger/README.md` §1을 따른다. 이 영역의 정본은 `08-design-a-to-z.md` §13(공개 표면 표와 이름 규칙)이고, `02-target-overview.md` §6의 행은 같은 자리의 보충으로 인용한다(`02`는 새 결정을 만들지 않는다고 스스로 적는다). `05-before-after.md` §3, `06-conclusions.md` §5.6·§6, `07-conclusions.md` §6은 그때의 기록이다. 거기 적힌 규칙이 뒤 문서에 없으면 항목이 되고, 뒤 문서가 바꿨으면 "대체됨"으로 남는다. `07` §6.1의 `&키`·`control` 철자는 15라운드에 `controls.키`로 바뀌었으므로 그 행들은 "대체됨"이며, 이름 낱말 자체는 `controls` 안에서 살아 있다(SURFACE-022와 CONTROLS의 키 항목). `&default`는 철자와 함께 뜻도 바뀌었다(표현식에서 값으로, CONTROLS-018). 다른 영역 항목과 같은 규칙은 출처 칸 끝에 "같은 규칙"으로 번호를 적는다.

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| SURFACE-001 | 스키마 그룹 셋 — `controls`·`options`·`presentation`, 맨 키는 JSON Schema의 것 | 현행 | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:14` 6), 소유자 답(`reviews/round-15-decisions.md:15` 7) |
| SURFACE-002 | 렌더 계층(노드 단위)의 이름 — `FormTypeInput`, 정의 목록, 렌더러 넷, 공통 props와 문맥 | 현행 | 소유자 답(`reviews/round-15-decisions.md:21` 8), 편집자 결정(15라운드, `reviews/round-15-decisions.md:50`; Form 속성 넷) |
| SURFACE-003 | 합성 API — `Form.Group`·`Form.Label`·`Form.Input`·`Form.Error`·`Form.Render`와 props | 현행 | 소유자 답(`reviews/round-15-decisions.md:21` 8) |
| SURFACE-004 | 쓰기 옵션 — 비트마스크 `SetValueOption`의 네 멤버 | 현행 | 소유자 답(`reviews/round-7-convergence.md:144`; 비트마스크), 편집자 결정(9라운드, `reviews/round-9-spec.md:97` 세 곳의 추천을 합쳐 소유자가 동의; `DisableAutomaticWrites`·`EnableAutomaticWrites`) |
| SURFACE-005 | 쓰기 — `setValue`, `FormHandle.reset`(억제 비트 둘만), 배열 다섯, `setSelectedBranch` 없음 | 현행 | 편집자 결정(9라운드, `07-conclusions.md:350` N6 나머지 그대로), 소유자 답(`reviews/round-10-owner-answers.md:9` A-3; `setSelectedBranch` 없음) |
| SURFACE-006 | 값 읽기 — `value`, `outputValue`, `getInactiveValues(path)`, `FormHandle.getValue()` | 현행 | 편집자 결정(8라운드 D-23, `06-conclusions.md:186-190`), 편집자 결정(9라운드 N3 그대로, `07-conclusions.md:347`), 소유자 답(`reviews/round-18-owner-answers.md:18` 12-8) |
| SURFACE-007 | 진단 — `diagnostics`, 이벤트 `UpdateDiagnostics`, Form 속성 `onDiagnosticsChange` | 현행 | 편집자 결정(8라운드 N4, `06-conclusions.md:362`), 편집자 결정(9라운드 N4 그대로, `07-conclusions.md:348`) |
| SURFACE-008 | 배치 — `batch(fn)` | 현행 | 소유자 답(`00-goals.md:151` G7; 배치 유지), 편집자 결정(4라운드, `adr/0008-event-system.md:3`), 편집자 결정(9라운드, `07-conclusions.md:350` N6 나머지 그대로) |
| SURFACE-009 | 경로 조회 — `find`·`findNodes`, 터미널 아래 경로는 노드 없음, `findAll`은 `findNodes`로 | 현행 | 원리(`06-conclusions.md:175` P2·G4; `find`), 편집자 결정(10라운드 추정 채택 규칙, `07-conclusions.md:209`; `findNodes`), 편집자 결정(17라운드, `08-design-a-to-z.md:478` 이주 행 46; `findAll`) |
| SURFACE-010 | 노드 — 단일 클래스 `SchemaNode`, 게터 `type`·`strategy`, 가드 아홉, 겉면의 크기는 18라운드 안건 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 소유자 답(`reviews/round-17-owner-answers.md:23` `kind` 필드), 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §6; 가드 아홉, 공개 형에서 뺀 필드, 멤버 목록), 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:86-88`; 겉면의 크기) |
| SURFACE-011 | 명령 — `focus`, `select`, `refresh`, `remount` | 현행 | 편집자 결정(8라운드 N6 명령, `06-conclusions.md:387`), 편집자 결정(9라운드, `07-conclusions.md:350` N6 나머지 그대로) |
| SURFACE-012 | Form 속성(렌더 계층) — 전체 잠금, `unsetOnInactive`, `disableAutomaticWrites`, `onError`, `onDiagnosticsChange`, `validatorFactory` | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리; `readOnly`·`disabled`), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 편집자 결정(9라운드, `reviews/round-9-spec.md:97` 세 곳의 추천을 합쳐 소유자가 동의; `disableAutomaticWrites`), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4; `onError`), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸; `onError`), 편집자 결정(8라운드 N4, `06-conclusions.md:362`; `onDiagnosticsChange`), 소유자 답(`reviews/round-14-owner-answers.md:13` O-7; `validatorFactory`) |
| SURFACE-013 | 검증기 플러그인 계약 — `compile`, `compileGuard`, `rejectedKey` | 현행 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:19` 조건 1; `compile`·`compileGuard`), 편집자 결정(5라운드 도출, `reviews/round-5-derivations.md:26` C-4; `rejectedKey`) |
| SURFACE-014 | 오류 클래스 — `JSONSchemaError`, `SchemaFormError`, `ValidationError`, `UnhandledError`, `ValidationIssue`, 기록 형과 코드 형 | 현행 | 편집자 결정(17라운드, ADR 0014 4판 채택 `adr/0014-error-policy.md:3`) |
| SURFACE-015 | 유효 스키마 변경 이벤트의 타입·payload·구독 표면 | 열림(→ `reviews/round-18-agenda.md:108`) | 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:108`) |
| SURFACE-016 | 이름 규칙 1 — `FormType…`은 노드 단위 조각과 그것을 그리는 것 | 현행 | 소유자 답(`reviews/round-15-decisions.md:21` 8) |
| SURFACE-017 | 이름 규칙 2 — `…Renderer` 접미는 그리는 것 | 현행 | 소유자 답(`reviews/round-15-decisions.md:21` 8) |
| SURFACE-018 | 이름 규칙 3 — `Form.X`는 `path`를 받는 합성 API, props는 `FormXProps` | 현행 | 소유자 답(`reviews/round-15-decisions.md:21` 8) |
| SURFACE-019 | 구성 요소를 담는 키는 파스칼, props 객체 키는 그 props 타입의 이름 | 현행 | 편집자 결정(15라운드, `reviews/round-15-decisions.md:51`) |
| SURFACE-020 | 이 패키지에서 `controls`는 규칙, `Group`은 한 필드 단위 | 현행 | 편집자 결정(15라운드, `reviews/round-15-decisions.md:54`) |
| SURFACE-021 | 제어 키는 `controls` 안에만 적는다 | 중복(→ CONTROLS-016) | 소유자 답(`reviews/round-15-decisions.md:12` 4) |
| SURFACE-022 | 평면 `&` 축약과 `computed` 별칭은 없다 | 중복(→ CONTROLS-016) | 소유자 답(`reviews/round-15-decisions.md:13` 5) |
| SURFACE-023 | 이름 원칙 — 줄임말이 아닌 풀 네임과 저장소의 짝 관례 | 현행 | 소유자 답(`reviews/round-7-convergence.md:144`), 편집자 결정(8라운드 이름 짓기, `06-conclusions.md:324`; 저장소 관례의 짝) |
| SURFACE-024 | 쓰기 옵션은 옵션 객체가 아니라 비트마스크 | 현행 | 소유자 답(`reviews/round-7-convergence.md:144`) |
| SURFACE-025 | `Overwrite`와 `Merge` — 기본값, `Overwrite ⊇ Merge`, 함께 주면 `Overwrite` | 현행 | 편집자 결정(8라운드 N1, `06-conclusions.md:329`), 편집자 결정(9라운드, `07-conclusions.md:345` N1의 `Overwrite`·`Merge` 그대로) |
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
| SURFACE-039 | 로드 시 예약 층의 자동 쓰기 억제 — `DisableAutomaticWrites`·`EnableAutomaticWrites`, Form 속성 `disableAutomaticWrites` | 현행 | 편집자 결정(9라운드, `reviews/round-9-spec.md:97` 세 곳의 추천을 합쳐 소유자가 동의; 이름), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 나감 비움은 정책이 참인 노드만), 편집자 결정(13라운드, `07-conclusions.md:311`; 억제 범위에 나감 비움을 넣음) |
| SURFACE-040 | 대체됨(철자): 조각 게이트는 `&active`로 통합, `&if` 은퇴 — 뜻은 `controls.active`로 현행 | 대체됨(→ SURFACE-022, CONTROLS-016, CONTROLS-021, CONTROLS-049) | 소유자 답(`reviews/round-10-owner-answers.md:8` A-2), 편집자 결정(9라운드, `07-conclusions.md:135` 4.24 노드 게이트) |
| SURFACE-041 | 대체됨: 없음인 키 채우기 `&default`(표준 키워드의 표현식 판) — 이름은 `controls.default`, 식이 아니라 값 | 대체됨(→ SURFACE-022, CONTROLS-016, CONTROLS-025, CONTROLS-018) | 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천), 편집자 결정(9라운드, `reviews/round-9-spec.md:97` 세 곳의 추천을 합쳐 소유자가 동의) |
| SURFACE-042 | 대체됨(철자): 다른 노드 쓰기 `&injectTo`를 예약 층에 편입 — 이름 낱말은 `controls.injectTo`로 현행 | 대체됨(→ SURFACE-022, CONTROLS-016, CONTROLS-027) | 소유자 답(`reviews/round-9-spec.md:32` 요약 발언), 소유자 답(`reviews/round-9-spec.md:26` 축8) |
| SURFACE-043 | 대체됨(철자): 자식 집합 제어 — 조각 범위 제어와 `&children` 블록 둘 다, `targets`와 `control` — 뜻은 `controls.children`으로 현행 | 대체됨(→ SURFACE-022, CONTROLS-016, CONTROLS-030, CONTROLS-042) | 소유자 답(`reviews/round-9-spec.md:108` 자식 집합 제어), 소유자 답(`reviews/round-10-owner-answers.md:16` C-15), 소유자 답(`reviews/round-10-owner-answers.md:21` D-14) |
| SURFACE-044 | 대체됨(철자): 명시 판별 `&discriminator` — 이름 낱말은 `controls.discriminator`로 현행 | 대체됨(→ SURFACE-022, CONTROLS-016, CONTROLS-031) | 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-12-owner-answers.md:9` 2) |
| SURFACE-045 | 분기 선택 명령은 지워짐 — `setSelectedBranch`·`selectedBranch`·`activeBranch`, `oneOfIndex`·`anyOfIndices`도 대체물 없이 | 현행(부정 결정) | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 편집자 결정(10라운드, `07-conclusions.md:142`) |
| SURFACE-046 | 대체됨: N5 판정 — `control`로 이름만 바꾸고 `&`는 제어 키와 `control.*`에만(13라운드) | 대체됨(→ SURFACE-021, SURFACE-022, CONTROLS-016) | 소유자 답(`reviews/round-13-owner-answers.md:9` 3 폼 전용 키 접두), 소유자 답(`reviews/round-9-spec.md:27` 축9) |
| SURFACE-047 | 오늘의 공개 이름 가운데 `Node`로 줄인 것에 이름 규칙을 적용할지와 그 이주 | 열림(→ `reviews/round-18-agenda.md:91`) | 소유자 답(`reviews/round-17-owner-answers.md:53` `Node` 이름 규칙), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름; 가드 이름 유지), 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:91`) |
| SURFACE-048 | 대체됨: 제어 키 문법의 세 부류 — 형용사·명사·동사(`injectTo`는 동사) | 대체됨(→ CONTROLS-019) | 편집자 결정(9라운드, `07-conclusions.md:339`) |
| SURFACE-049 | 대체됨: 억제는 전체 교체가 일으킨 정착에서만 듣고, `fire`를 고르면 `injectTo`·`&derived`까지 끈다 | 대체됨(→ SURFACE-039) | 편집자 결정(8라운드 N1, `06-conclusions.md:341`) |
| SURFACE-050 | 값 읽기 이름 확정 — `value`·`outputValue`, `FormHandle.getValue()` 유지, `submit`은 쓰지 않음, 노드는 getter | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:21` 12-8 이어서) |

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
- 상태: 현행
- 출처: `08-design-a-to-z.md:411`(정본), `02-target-overview.md:306`, `06-conclusions.md:338,386`, `07-conclusions.md:350`, `05-before-after.md:77` (같은 규칙: FRAGMENT-010, WRITE-015, EVENT-002; `resetSubtree`의 존폐는 열림 WRITE-050)
- 닫은 사람: 편집자 결정(9라운드, `07-conclusions.md:350` N6 나머지 그대로), 소유자 답(`reviews/round-10-owner-answers.md:9` A-3; `setSelectedBranch` 없음)
- 라운드: 10
- 까닭: `06-conclusions.md:386`, `07-conclusions.md:142`
- 충돌:
  > `02-target-overview.md:306`의 "배열 `push`·`remove`·`update`"는 정본과 다르다(`pop`·`clear`가 없다). 정본이 이긴다(`08-design-a-to-z.md:411`; `02-target-overview.md:3`은 새 결정을 만들지 않는다고 적는다).

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
- 상태: 현행
- 출처: `08-design-a-to-z.md:412`(정본), `02-target-overview.md:307-309`, `06-conclusions.md:352-358,388`, `07-conclusions.md:347`, `05-before-after.md:96,136`, `reviews/round-18-owner-answers.md:18` (같은 규칙: VALUE-011, WRITE-019; 반환 모양은 열림 WRITE-020)
- 닫은 사람: 편집자 결정(8라운드 D-23, `06-conclusions.md:186-190`), 편집자 결정(9라운드 N3 그대로, `07-conclusions.md:347`), 소유자 답(`reviews/round-18-owner-answers.md:18` 12-8)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:18`, `06-conclusions.md:356`
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
- 상태: 현행
- 출처: `08-design-a-to-z.md:413`(정본), `02-target-overview.md:310-312`, `06-conclusions.md:362`, `07-conclusions.md:348` (같은 규칙: EVENT-043, EVENT-044, ERROR-128, ERROR-135, ERROR-138)
- 닫은 사람: 편집자 결정(8라운드 N4, `06-conclusions.md:362`), 편집자 결정(9라운드 N4 그대로, `07-conclusions.md:348`)
- 라운드: 9
- 까닭: `06-conclusions.md:362`

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
- 상태: 현행
- 출처: `08-design-a-to-z.md:416`(정본), `02-target-overview.md:315`, `reviews/round-17-owner-answers.md:22-24` (같은 규칙: NODE-001, NODE-002, NODE-003, NODE-010, NODE-015; 열린 부분: NODE-019, EVENT-038, EVENT-052, WRITE-050)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 소유자 답(`reviews/round-17-owner-answers.md:23` `kind` 필드), 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-node-structure.md` §6; 가드 아홉, 공개 형에서 뺀 필드, 멤버 목록), 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:86-88`; 겉면의 크기)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:22-24`

### SURFACE-011 명령 — `focus`, `select`, `refresh`, `remount`

- 결정:
  > | 자리 | 이름 | 뜻 |
  > | --- | --- | --- |
  > | 명령 | `focus`, `select`, `refresh`, `remount` | 원본을 쓰지 않는다 |
- 보충:
  > "| 명령 | `focus`, `select`, `refresh`, `remount` | 렌더러와 무관한 표현 계층의 어휘이며 원본을 쓰지 않는다(D-9) | ADR 0008 |" (`02-target-overview.md:317`)
  > "`focus`, `select`(텍스트 선택), `refresh`, `remount`. `refresh`가 비용을 숨긴다는 지적이 있으나 오늘의 공개 이벤트 이름과 함께 바꿔야 하므로 유지가 1순위다." (`06-conclusions.md:387`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:417`(정본), `02-target-overview.md:317`, `06-conclusions.md:387`, `05-before-after.md:92-94,124` (같은 규칙: EVENT-037, EVENT-039; 명령 publish의 공개와 노드 메서드로 둘지는 열림 EVENT-038, NODE-019)
- 닫은 사람: 편집자 결정(8라운드 N6 명령, `06-conclusions.md:387`), 편집자 결정(9라운드, `07-conclusions.md:350` N6 나머지 그대로)
- 라운드: 9
- 까닭: `06-conclusions.md:387`

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
- 보충: 없음
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
- 상태: 열림(→ `reviews/round-18-agenda.md:108`)
- 출처: `08-design-a-to-z.md:421`(정본), `02-target-overview.md:319#1`, `reviews/round-18-agenda.md:108` (같은 규칙: EVENT-048)
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:108`)
- 라운드: 17
- 까닭: `reviews/round-18-agenda.md:108`

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
- 상태: 현행
- 출처: `06-conclusions.md:333-334`(정본), `07-conclusions.md:345`
- 닫은 사람: 편집자 결정(8라운드 N1, `06-conclusions.md:329`), 편집자 결정(9라운드, `07-conclusions.md:345` N1의 `Overwrite`·`Merge` 그대로)
- 라운드: 9
- 까닭: `06-conclusions.md:334`

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
- 출처: `07-conclusions.md:311`(정본), `07-conclusions.md:345`, `reviews/round-9-spec.md:104`, `08-design-a-to-z.md:278`, `06-conclusions.md:341` (같은 규칙: WRITE-008, WRITE-015)
- 닫은 사람: 편집자 결정(9라운드, `reviews/round-9-spec.md:97` 세 곳의 추천을 합쳐 소유자가 동의; 이름), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값; 나감 비움은 정책이 참인 노드만), 편집자 결정(13라운드, `07-conclusions.md:311`; 억제 범위에 나감 비움을 넣음)
- 라운드: 13
- 까닭: `reviews/round-9-spec.md:104`
- 충돌:
  > `07-conclusions.md:311`의 "`&derived`, `&injectTo`, `&unsetValue`"는 15라운드 뒤의 표기(`controls.derived`·`controls.injectTo`·`controls.unsetValue`)와 다르다. 뒤 라운드가 이긴다(`08-design-a-to-z.md:278`, `02-target-overview.md:319`).

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
- 상태: 열림(→ `reviews/round-18-agenda.md:91`)
- 출처: `08-design-a-to-z.md:425#5`(정본), `reviews/round-18-agenda.md:91`, `09-landing-and-test-strategy.md:110` (같은 규칙: NODE-011, NODE-012, NODE-015)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:53` `Node` 이름 규칙), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름; 가드 이름 유지), 편집자 결정(17라운드, 18라운드 안건으로 이관 `reviews/round-18-agenda.md:91`)
- 라운드: 17
- 까닭: `reviews/round-18-agenda.md:91`

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
