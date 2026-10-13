# 216라운드 닫기 — 판정 세션 32b 완료(21:22~01:43 UTC): 개선-32 커밋 2(0517e21cf, 기준 커밋 1 c04c74fe1)는 다섯 부분 모두 passed·ADOPT, 이득 0·차단 회귀 0; 커밋 2 유지; "측정 끝" — 두 세션 해제; 07b 마무리 순서

2026-10-13. fixy07의 보고(CONTROLLER_32B_COMPLETE; W HEAD 1daf55be4, git 상태 깨끗 유지; 부호는 기준 − 후보).

- react-main-a: passed, ADOPT(3,675 s). 판정 48행, 이득 0, 차단 0. 표시된 회귀 하나 flat-50 mount-active −0.101 ms [−0.259, −0.010](기준 7.62 ms) → 24블록 확인 측정 +0.019 ms [−0.039, +0.093]로 확인되지 않음. array-500 mount +1.53~1.75 ms(기준 약 291 ms)는 바닥값 안이라 이득 아님.
- react-main-b: passed, ADOPT(3,381 s). 이득 0, 표시 0, 차단 0. array-100 mount +0.42~0.49 ms(기준 59~61 ms), array-replace-200 update +0.65 ms(기준 115 ms), array-push-100 update −0.06 ms, array-push-remove-100 update −0.12 ms — 모두 구간이 0 포함.
- react-array-1000: passed, ADOPT(4,754 s, 예산 안; 확인 측정 불필요, 32a 전례 미사용). mount-wall +3.41 ms [−1.97, +7.16](기준 575.8 ms), mount-active +2.36 [−2.05, +6.26], update-wall −0.034 ms [−0.089, +0.021](기준 1.854 ms), update-active −0.033 [−0.091, +0.024]. 32a에서 커밋 1이 남긴 −72 µs 갱신 손실 위에서 커밋 2는 갱신을 더 나쁘게 하지 않음.
- react-nested-d5: passed, ADOPT(1,495 s). nested-d5-f4 mount-wall +0.17 ms [−0.84, +1.56](기준 185.9 ms), update-wall −0.012 ms [−0.040, +0.017](기준 3.896 ms).
- core: passed, ADOPT(1,167 s, 판정 행 97). 번들은 base·candidate 바이트 동일.

편차: 매니페스트 revision 조정(215라운드 덧붙임) — 판정 보고의 편차 절에 적는다.

### 216C-01 (1) 32b 판정 ADOPT를 받아 개선-32 커밋 2를 유지한다; 소유자 대기열 14(32a 전례)는 쓰이지 않아 귀환 때 "해당 없음"으로 닫는다; (2) "측정 끝" — reviewer·fairy07의 무거운 실행 제한을 푼다; (3) fixy07의 07b 마무리 순서를 받는다: ① improvement-32-commit2.md 판정 기록·assignments 5행·#355 본문 갱신 커밋(편차 절 포함), ② 문서 정합 커밋(15파일, verifier PASS 둘; prettier·lint·docs/agents 구독 예시 tsc), ③ 215C-02 형 커밋 둘(계획·verifier·형 시험; 사용례 있으면 멈춤), ④ 검증 결과 불변 시 참조 유지·파동 생략(src 동작 변경; 계획·verifier; 0.16.0 onValidate 비교해 다르면 소유자 대기열), ⑤ browser-mode guard 행(07c 머지됐으므로 이제 가능), ⑥ 전체 시험·typecheck·lint·G16 뒤 보고 → 원장 관리자 직접 검증 → #355 squash-merge; (4) ④가 올라가면 fairy07에 알려 G9 it.fails 뒤집기 PR을 받는다 — #355 머지 전에 07b-1로 합친다

- 닫는 항목: LANDING-204(보충), TEST-027(보충)
- 결정:
  - 【추론】 다섯 부분에 판정된 이득도 차단 회귀도 없으면 커밋 2는 "손해 없는 정리"로 ADOPT가 맞고, 그 위에서 07b의 나머지는 측정과 무관한 정리·형·문서다.
- 근거: fixy07의 32b 보고; 161C-01·170라운드 소유자 답(판정 절차·전례); 204C-01; 215C-02.
- 다음: 원장 관리자가 세 세션에 알린다.

## 덧붙임 (2026-10-13, 07b 마무리 ①·② 진행; 공개 API 공백 → reviewer)

① 454531b7d docs: improvement-32-commit2.md(판정·변경·검증·32b 표·편차 절·번들 SHA-256), assignments 5행 "완료, ADOPT(216라운드)", #355 본문 갱신. 정정: 첫 push 9da3d8d81에 세션 링크 줄이 들어가 메시지만 고쳐 --force-with-lease로 바꿈(원장 관리자가 원격 1daf55be4..head에 세션 ID·co-author 0 확인). ② 문서 정합 진행: 예시를 src에 대고 tsc 확인 중 범위 확장 둘 — (a) README 둘·SPECIFICATION 둘·plugin-system.md가 validatorFactory를 "스키마 → 검증 함수"로 가르치고 예시가 `createValidatorFactory(customAjv)`였으나 공개 ValidatorFactory는 `{ compile, compileGuard }` 객체(LANDING-036)라 형 검사 실패 → 객체 계약과 `plugin.validator.bind(customAjv)` + registerPlugin 예시(LANDING-192 거부 포함)로; ajv8이 내보내지 않는 ajvValidatorPlugin 가져오기는 `plugin as ajvValidatorPlugin`로; ExternalFormContextProvider.tsx JSDoc 예시 주석만 수정; (b) docs/QUICK_REFERENCE.md 옛 문법 14곳 같은 커밋. 그대로 둔 것: MOBILE_PERFORMANCE_REPORT.md(옛 엔진 기록), CLAUDE.md(대기열 10), helpers/dynamicExpression(소비자 0 — 개선-38 소유자 결정 3에 이미 포함).

### 216C-02 공개 API 공백 — ajv 플러그인 셋의 공개 export(`plugin`, `createValidatorFactory(ajv)` → compile 함수만)로는 LANDING-036이 정한 `{ compile, compileGuard }` 객체를 인스턴스별로 만들 수 없어 전역 bind만 가능(0.16.0의 `validatorFactory={createValidatorFactory(customAjv)}` 용법 소실). 결정된 이주의 플러그인 쪽 누락이므로 고친다 — reviewer 배정: 세 플러그인(ajv8은 default/2019/2020)에 `createValidator(ajv)`(ValidatorFactory 형 만족) 공개 export 추가, 기존 export 불변, LANDING-192 거부 검사·루트 등록소 규칙 공유, 플러그인별 시험, 버전 올림, README 한 줄; seiri 계획 → review-plan → verifier → `$TMPDIR` 임시 워크트리에서 feat/schema-form-07b-1로 PR. 새 export 이름은 소유자 대기열 18로 귀환 때 확인

- 닫는 항목: LANDING-036(보충)
- 결정:
  - 【추론】 Form 속성이 객체 계약으로 바뀌었는데 플러그인이 그 객체를 만들어 주지 않으면 소비자는 문서가 약속한 인스턴스별 검증을 잃는다. 추가 export만이라 기존 계약은 그대로다.
- 근거: fixy07의 ② 보고; LANDING-036; LANDING-192; ajv8 플러그인 createValidatorFactory.ts·validatorPlugin.ts 직접 확인.

## 덧붙임 2 (2026-10-13, ② 완료; ③ 사용례 조사와 판단; reviewer createValidator 계획 승인)

② 완료 3d14602b3 docs: 17파일(README 둘, SPECIFICATION 둘, QUICK_REFERENCE, docs/agents 11, ExternalFormContextProvider JSDoc). verifier 재대조 3에서 차단 1(X1: "검증기 플러그인이 없으면 then/else 꺼짐" → "선택된 검증기가 없으면(Form·FormProvider의 validatorFactory도 플러그인도 없으면)", RootNodeContextProvider.tsx:53-56; 다섯 곳) 정정. 예시 tsc 0, eslint 0, 옛 문법 0. 커밋 메시지 근거 LANDING-036·192·032, NODE-032, FRAGMENT-003·005·006·009. 비차단 넷(Form 속성 표의 `JSONSchemaError[]` → readonly ValidationIssue[], 비공개 BlueprintSchema 스케치, 아홉 키 목록의 allOf 조각, 깨진 `./claude/skills/` 링크)은 ③ 뒤 작은 문서 커밋으로.

③ 사용례 조사(fixy07): 형 추론 감사 73건 0건; 0.16.0은 네 종류 모두를 공식 키로 선언(dist/types/jsonSchema.d.ts:81,88 virtual, :166 injectTo, :168-182 `&` 별칭 여덟, :184 computed; README.md:1622-1623·1745; QUICK_REFERENCE.md:123-137·163-180). 사실 넷: (1) BasicSchema 끝의 `[alt: string]: any` 때문에 키를 지워도 작성자의 computed·'&if'는 형 검사를 통과 — 삭제는 문서·자동 완성에서만 사라지고 형 시험은 색인 서명을 뺀 키 목록으로 증명; 색인 서명은 검증기 사용자 키워드 때문에 유지; (2) 런타임은 옛 키를 조용히 무시(읽는 곳도 진단도 없음) → 0.16.0 스키마는 조건만 빠진 채 렌더되는 이주 위험; (3) 스키마 수준 injectTo의 유일한 런타임 독자는 helpers/jsonSchema(개선-38 결정 3); (4) 최상위 terminal?·propertyKeys?도 같은 낡은 키. 커밋 ②: validateControlGroups.ts:95-113의 13키로 controls? 명시(children은 앞 아홉), 명시 멤버가 색인 서명을 덮어 모르는 키는 형 오류(런타임 UNKNOWN_GROUP_KEY와 일치); 한계: 조각 자리(oneOf·then)는 같은 JSONSchema 형이라 아홉 키 제한 불가.

### 216C-03 (가) 커밋 ①(삭제)은 진행한다 — 215C-02 조건의 뜻은 새 판 소비 흔적이고 감사 0건이 그것이며, 0.16.0이 네 종류를 공식 키로 담은 것은 이주의 전제로서 CONTROLS-016·CONTROLS-051이 이미 삭제를 정했다; 커밋 메시지에 둘과 0.16.0 선언 위치를 적고 형 차분 목록은 대기열 16에; (나) 최상위 terminal·propertyKeys도 포함(CONTROLS-051 같은 줄); (다) 지워진 키의 런타임 진단은 지금 하지 않는다 — 원장은 맨 모르는 키를 폼이 진단하지 않고 검증기로 넘긴다고 정했고(CONTROLS-078·081) 전용 진단은 새 제품 결정이라 소유자 대기열 19로; (라) options도 OPTION_KEYS 여섯으로 닫는다(CONTROLS-051이 플러그인 자유 칸을 presentation으로 옮겼고 런타임이 다른 키를 거부). 색인 서명 유지, 형 시험은 키 목록 expectTypeOf와 @ts-expect-error

- 닫는 항목: CONTROLS-051(보충), CONTROLS-016(보충)
- 결정:
  - 【추론】 형은 런타임이 받는 것만 광고해야 하고, 런타임이 옛 키를 조용히 무시하는 것은 원장이 정한 "맨 키는 검증기로"의 결과이므로 형 삭제와 별개의 제품 질문이다.
- 근거: fixy07의 ③ 조사; CONTROLS-016·051·078·081; 215C-02.

reviewer의 createValidator 계획(.seiri/tasks/ajv-plugin-create-validator/plan.md; 워크트리 /private/tmp/claude-501/ajv-validator, 브랜치 feat/ajv-create-validator, 기반 454531b7d): 세 플러그인(ajv8은 default/2019/2020) `createValidator(ajv, options?: { directGuardCompile?: boolean })` → `{ compile, compileGuard, release, dialect } satisfies ValidatorFactory`; 생성 시 assertBindableInstance; 반환 객체가 자기 등록소 소유; 플러그인 객체·createValidatorFactory 불변; 플러그인마다 커밋 하나(시험 먼저; export 부재로 수집 실패가 사전 실패 증거), 시험 5(형·폼 경로 검증+가드·인스턴스 분리·거부·해제), publicApi.build 단언, README 한 줄, ajv8 CLAUDE.md 아키텍처 줄. 원장 관리자 답: 승인; 버전 0.17.0(공개 API 추가 = minor; 최종 릴리스 번호는 소유자), 시험 2의 코어 런타임은 de7f56499..07b-1 head의 plugin/type.ts·core/validation·types/error.ts diff가 비어 있음을 확인하고 쓰며, 코어 README 예시 복원은 머지 뒤 fixy07 한 줄 커밋.

## 덧붙임 3 (2026-10-13, ③-① 완료; ③-② 재작업과 판단; 내장 입력 일곱의 options 읽기 결함 → fairy07)

③-① 989dca7f9 refactor: src/types/jsonSchema.ts의 BasicSchema에서 computed?(하위 키 여덟 포함), '&if'·'&active'·'&visible'·'&pristine'·'&readOnly'·'&disabled'·'&watch'·'&derived', injectTo?, terminal? 삭제; NonNullableObjectSchema·NullableObjectSchema에서 propertyKeys?·virtual?과 내부 형 VirtualSchemaProperties 삭제; 서명 변경 0, 색인 서명 유지, 공개 export 이름 증감 0; 저장소 안 깨짐 0. 고치기 전 실패: 새 src/types/__tests__/schemaSurface.type.test.ts가 이전 형에서 tsc 오류 3건. src/DETAIL.md에 "작성 표면" 절. 커밋 메시지 근거 CONTROLS-016·051, 0.16.0 dist/types/jsonSchema.d.ts:81,88,166,168-184. 남긴 것: helpers/error/formatErrorMessage/formatDynamicFunctionError.ts의 '&if' 안내는 엔진이 부르지 않는 함수 셋에만 있어 개선-38 결정 3 묶음. 정리 문서 커밋 9a047805e docs: `JSONSchemaError[]` → readonly ValidationIssue[](Form/type.ts:82,149,151), README 스케치의 BlueprintSchema → JSONSchema, 아홉 키 문장에 oneOf/anyOf/allOf 분기, QUICK_REFERENCE 깨진 링크; 0.16.0 릴리스 노트의 JSONSchemaError 언급은 당시 공개 이름이라 되돌림. 07b-1 head 9a047805e.

③-② verifier: rework-required — F1 계획 초안이 BasicSchema에 두어 공개 JSONSchema(src/types/jsonSchema.ts:130 → core/types/jsonSchema.ts 인터페이스; 원장 관리자가 src/index.ts:76·types/index.ts·Form/type.ts로 확인)에 닿지 않음 → 코어 배치로 해소. 질문 둘: (1) injectTo 형 — core/INTENT "core schema types never import React"이고 공개 InjectToHandler의 ctx는 JSONSchemaWithVirtual(React 형 포함; types/injectTo.ts:3,127); 후보 (a) 코어 제네릭 추가, (b) 코어는 구조적 `(value: any, context: any) => unknown`, 별칭만 엄격. (2) options 기본값 변경이 깨뜨리는 것 — 런타임이 UNKNOWN_GROUP_KEY로 거부하는 options 키를 형으로 읽는 입력 일곱: formTypeDefinitions/FormTypeInputDateFormat.tsx:29-30(options.minimum·maximum), Slider 셋(antd-mobile :33-35 range·marks·lazy, antd5 :31·antd6 :31 lazy), Uri 셋(antd5 :95·antd6 :95·mui :128 protocols) — 형 이전에 기능 문제(스키마에 그 키를 쓰면 청사진이 던져 일곱 기능을 쓸 수 없음).

### 216C-04 (1) injectTo 형은 (c) 코어가 자기 제네릭으로 문맥을 구조적으로 적는다 — `injectTo?: (value: unknown, context: InjectToContext<JSONSchema<Options, Presentation>>) => unknown`; 공개 별칭은 Presentation=SchemaPresentation이라 `satisfies JSONSchema` 작성자도 ctx.schema가 형을 가지며, InjectToHandler가 할당 가능하면 별칭은 그대로; 문맥에 코어가 가질 수 없는 형이 있으면 (b)로 내려가되 any 대신 unknown; (a) 기각(공개 제네릭 불변); (2) ③-②는 controls 형과 키 목록 묶기만 하고 options 기본값 변경은 미룬다; (3) 내장 입력 일곱의 options 읽기는 기능 결함이므로 fairy07에게 배정 — CONTROLS-081의 presentation.FormTypeInputProps 펼침 자리로 읽기를 옮기고(옛 options 읽기 삭제), 입력마다 고치기 전 실패 렌더 시험, 플러그인 README·스토리·버전, 0.16.0에서의 위치 확인; 계획 → review-plan → verifier → 07b-1로 PR; (4) 그 PR이 합쳐지면 fixy07이 options 기본값(SchemaOptions 여섯 키)을 작은 커밋으로; 나머지 정정(allOf 조각, default: unknown, 식 키 boolean | string, derived string, watch readonly string[], satisfies 리터럴 형 시험, 순환 재도입 금지) 수용

- 닫는 항목: CONTROLS-081(보충), CONTROLS-051(보충)
- 결정:
  - 【추론】 코어가 React를 모르는 채로 문맥을 적는 길이 있으면 제네릭을 늘리거나 any로 내리는 것보다 낫다. 런타임이 거부하는 자리에서 설정을 읽는 입력은 형 문제가 아니라 이주가 끝나지 않은 결함이고, 원장이 그 자리를 이미 정했으므로 바로 고친다.
- 근거: fixy07의 ③-② 보고; verifier F1; CONTROLS-051·081; core/INTENT.md; src/index.ts:76·types/jsonSchema.ts:130·Form/type.ts 직접 확인.

## 덧붙임 4 (2026-10-13, ③-② 완료; ④ 계획 승인; ajv 플러그인 typecheck 빨강 → reviewer PR 첫 커밋)

③-② 1d5fa5db3 feat: 공개 JSONSchema(코어 인터페이스)와 종류별 별칭에 `controls?`; core/types/controls.ts(React 없음)에 ChildSchemaControls(9)·SchemaControls(13)·InjectToContext(내부, export 안 함); validateControlGroups.ts의 CHILD_CONTROL_KEYS·CONTROL_KEYS를 satisfies + 역방향 전수 검사로 묶음; injectTo는 (c) — 메서드 문법의 이변 매개변수로 기존 InjectToHandler<string>이 할당됨; options 불변. 게이트: G1 controlsSurface.type.test.ts 이전 형에서 빨강(키 목록 불일치, 쓰이지 않은 @ts-expect-error 넷), G2 typecheck·eslint 0, G3 탐침(watch 제거·pristine 추가 모두 tsc 실패), G4 build:types 뒤 플러그인 일곱 typecheck가 HEAD와 동일(antd5·6·mobile·mui 0건; ajv6·7·8 각 9건은 변경 전부터 — 플러그인 미이주: validatorPlugin.ts:64 readonly ValidationIssue, 스토리 13.FormError·19.SubmitUsecase의 NodeState·CustomFormTypeRenderer), G5 전체 641파일 4,093건 통과. 대기열 16 형 차분: 추가 `controls?`(코어와 별칭), 서명 변경 0, options 불변. ajv 플러그인 셋의 기존 typecheck 빨강은 reviewer의 createValidator PR 첫 커밋("플러그인 셋을 새 공개 형으로 이주", codex 구현)으로 배정(216C-02 확장).

④ 계획(scratchpad/val-207/plan.md; 조사 current.md: 0.16.0 ValidationErrorManager.ts:73-81이 deep equals로 같으면 참조 유지·미발행, 첫 검증은 항상 발행 → 소유자 질의 불필요): areValidationIssuesEqual(core/validation/utils/route/, 길이 + 항목별 equals, source 포함); 루트 대상 + 직전 루트 라우팅 결과 존재 + 동등이면 requestSchemaNodeValidation·dispatchValidate가 배정·파동 생략; 첫 검증은 빈 목록도 발행; 하위 대상·reset 그대로; union 분기 걸러내기(routeValidationIssues.ts:34-46) 위험은 구현 전 탐침 → 다르면 확정 선언 집합 참조 비교 추가; DETAIL 선행(core/validation, dispatch); 시험(e2e 새 파일: children 함수 Form의 Profiler 커밋 1/2, onValidate 횟수; core: 같은 결과 → 참조 유지·무발행, details 변경 → 발행; 분기 전환 사례); 이 커밋이 features-events-consumer.test.tsx:108 it.fails → it와 findings 스토리 복귀를 함께 함(fairy07 G9 PR 취소); G1~G4(G4 = 같은 입력열에서 onValidate 횟수가 0.16.0과 같음). 원장 관리자 승인 조건 넷: (1) 직전 결과의 저장 자리·수명 명시 — reset·validator 교체·validationMode 변경 때 비움, 시험 한 사례; (2) 명시적 validate()는 생략 경로에서도 보유한 같은 참조로 resolve, validating 전이 그대로, 시험 한 사례; (3) 외부 오류 기여는 불변 결과에서도 그대로, 시험 한 사례; (4) 위험 4 탐침 결과를 계획에 기록. 구현은 codex(217C-01), fixy07이 계획·브리프·검증·커밋.

## 덧붙임 5 (2026-10-13, fairy07의 입력 설정 이주 계획 승인; 범위 17개)

계획(/tmp/claude-501/presentation-props/.seiri/tasks/input-settings-presentation-props/plan.md, 게이트 G1~G14; 워크트리 /tmp/claude-501/presentation-props, 브랜치 fix/schema-form-input-presentation-props, 기반 9a047805e). 조사: 0.16.0 배포본 다섯(npm pack)에서 schema-form DateFormat(options.minimum·maximum; d.ts가 options 제네릭 선언), antd5·antd6(날짜 다섯 곳 `const { minimum, maximum } = jsonSchema.options || {}`, options?.lazy, options?.protocols; Uri d.ts가 protocols 선언), antd-mobile(options?.range·marks·lazy), mui(protocolsProp || options.protocols; Slider는 맨 키 lazy) 확인; README 다섯은 위치를 적지 않음; 플러그인 스토리는 options 자리를 씀. 옛 자리의 실패 모습(탐침): onError가 JSON_SCHEMA_ERROR.UNKNOWN_GROUP_KEY와 details { group: 'options', key }, 화면 role=alert "Unable to load form.", window error 1회; 새 자리 presentation.FormTypeInputProps는 폼이 뜨지만 input에 min이 안 붙음(결함 확인). 새로 찾은 열 곳: antd5·antd6의 Date·Month·DateRange·MonthRange·TimeRange(구조 분해라 검색에 안 걸림). 시험: 입력마다 파일 하나에 사례 둘(새 자리 동작 — 고치기 전 실패; 옛 자리 청사진 오류 — 이주 고정); DateFormat·Uri 셋은 실제 DOM, Slider 셋·날짜 열 곳은 vi.mock으로 위젯이 받은 props 기록(disabledDate 직접 호출, onChange 대 onChangeComplete/onAfterChange). 문서: 플러그인 README 영·한, formTypeDefinitions/DETAIL 한 줄(선행), 스토리는 Uri 셋·NumberSlider 셋(맨 FormTypeInput도 presentation으로). 결정(원장 관리자): 열 곳 포함(입력 17개); 플러그인 넷 0.16.0 → 0.17.0(대기열 18에 합쳐 적음); 이주 문장 확정; 범위 밖 넷은 대기열 20. 구현은 codex(217C-01), fairy07이 계획·브리프·검증·커밋·PR.
