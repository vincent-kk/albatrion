# 07 전환 이주 점검표

`reviews/round-68-closing.md`의 68C-02에 따른 PR-7 이주 점검 게이트입니다. `ledger/landing.md`에서 `### LANDING-nnn 이주...`로 시작하는 행 전부를 포함하며, 상태는 원문의 대체·중복·분할 대상까지 그대로 옮깁니다. 오늘 동작과 새 동작은 각 행의 결정에서 요약했습니다. 결정에 오늘 동작이 따로 없는 경우에는 그 사실을 표시했습니다.

처분 범례:

- (가) 렌더 또는 e2e 시험으로 오늘과 새 동작을 대조 — 시험 이름 필수.
- (나) 02–06의 코어 시험이 이미 덮음 — 시험 이름 인용 필수.
- (다) 08·09의 몫 — 처분 근거에 `08` 또는 `09` 명시.
- 현행 아님: 상태가 현행이 아닌 행의 처분.

처분·처분 근거·시험 이름은 뒤 단위에서 채우므로 지금은 모두 `미정`입니다. 시험 인용은 저장소 루트 기준 `path/to/file.test.tsx` 또는 `path/to/file.test.tsx > test title`이며, 여러 시험은 `<br>` 또는 세미콜론(`;`)으로 나눕니다. 제목을 적으면 그 문자열이 해당 파일에 있어야 합니다.

원장 기준 행·상태·제목 표 본문 재생성 명령(architecture에서 실행):

```sh
node verification/07-switch/tools/extract-migration-rows.mjs
```

재추출한 행·상태를 아래 표에 반영하고, 오늘 동작·새 동작은 원장의 결정에 맞춰 갱신합니다. `--check verification/07-switch/migration-check.md`는 ID 집합을, `--check-complete verification/07-switch/migration-check.md`는 처분과 시험 근거까지 점검합니다.

| 행 | 상태 | 오늘 동작 | 새 동작 | 처분 | 처분 근거 | 시험 이름 |
| --- | --- | --- | --- | --- | --- | --- |
| LANDING-004 | 현행 | `oneOf`·`anyOf`의 `const`·`enum` 자동 감지로 분기를 고른다 | 폼은 분기를 고르지 않는다. 명시 `controls.discriminator` 또는 분기 안 `if/then/else: false` 또는 `controls.active` | 미정 | 미정 | 미정 |
| LANDING-005 | 현행 | `oneOfIndex`·`anyOfIndices`, 분기 선택 API | 대체물 없이 사라진다. 분기의 필드는 노드이고 활성 여부는 노드의 `active` | 미정 | 미정 | 미정 |
| LANDING-006 | 현행 | `&if`(분기의 조건) | `controls.active`로 흡수 | 미정 | 미정 | 미정 |
| LANDING-007 | 현행 | `computed` 컨테이너 | `controls`로 이름 변경. 별칭 없음(15라운드) | 미정 | 미정 | 미정 |
| LANDING-008 | 현행 | `&pristine` | `controls.resetInteraction` | 미정 | 미정 | 미정 |
| LANDING-009 | 현행 | 없음 | `controls.unsetValue`, `controls.default`, `controls.children`, `controls.discriminator`, `controls.unsetOnInactive` 신설 | 미정 | 미정 | 미정 |
| LANDING-010 | 현행 | `allOf` 항목 안의 `if/then/else`는 병합되지 않고 경고만 | 병합된다 | 미정 | 미정 | 미정 |
| LANDING-011 | 현행 | 분기 전환 때 공유 노드를 다시 채운다 | 이미 있던 노드는 다시 채우지 않는다 | 미정 | 미정 | 미정 |
| LANDING-012 | 현행 | 표준 `readOnly`와 `&readOnly`는 택일(표준이 이김) | OR | 미정 | 미정 | 미정 |
| LANDING-013 | 현행 | `allOf` 항목끼리 겹친 표준 `readOnly`는 먼저 승 | OR | 미정 | 미정 | 미정 |
| LANDING-014 | 현행 | 공개 문서의 `derived` 레벨 약속 | 에지(의존 값이 바뀔 때만) | 미정 | 미정 | 미정 |
| LANDING-015 | 현행 | 루트 키 다섯(`readOnly`·`disabled`·`active`·`visible`·`pristine`)의 특수 처리, README "Priority System" | 사라진다. 루트 키는 루트 노드의 로컬 키. 전체 잠금은 Form 속성 | 미정 | 미정 | 미정 |
| LANDING-016 | 현행 | 로컬 순위 사슬(노드 `readOnly: false`가 `&readOnly`를 이김) | OR | 미정 | 미정 | 미정 |
| LANDING-017 | 현행 | 맨 키 `disabled`·`visible`·`active` | `controls.disabled`·`controls.visible`·`controls.active` | 미정 | 미정 | 미정 |
| LANDING-018 | 현행 | 조각이 꺼지면 원본을 지우고 켜지면 노드가 생성될 때의 값(없으면 `default`)으로 복원 | 기본 유지(방출에서만 빠짐). 비움은 `unsetOnInactive` | 미정 | 미정 | 미정 |
| LANDING-019 | 현행 | `virtual`의 `required` 재작성(가상 이름 → 실제 자식) | 하지 않는다. 작성자가 실제 필드를 적는다 | 미정 | 미정 | 미정 |
| LANDING-020 | 현행 | `find`·`findNodes`가 터미널 아래 경로에 터미널 노드를 별칭으로 돌려줌 | 노드 없음 | 미정 | 미정 | 미정 |
| LANDING-021 | 현행 | 10비트 `SetValueOption` | 비트 넷 | 미정 | 미정 | 미정 |
| LANDING-022 | 현행 | 루트 `onChange` 매크로태스크 디바운스 | 최외곽 동기 진입당 1회 | 미정 | 미정 | 미정 |
| LANDING-023 | 현행 | `normalizedValue` | `outputValue` | 미정 | 미정 | 미정 |
| LANDING-024 | 현행 | 인터페이스 `JSONSchemaError`(노드 오류 항목) | `ValidationIssue` | 미정 | 미정 | 미정 |
| LANDING-025 | 현행 | 예산 초과는 커밋 없이 throw; 컴파일 실패·렌더 오류·검증기 부재는 제각각 처리 | 원본 커밋·통지 뒤 throw; 검증 실패는 요청·제출 거부, 바운더리는 격리·보고, 검증기 부재는 경고 | 미정 | 미정 | 미정 |
| LANDING-026 | 현행 | 조건부 폼 생성 시 가드 컴파일 비용 없음 | `compileGuard` 컴파일이 생긴다(가드 200개에 14–54 ms, 위치당 1회·인스턴스 사이 공유) | 미정 | 미정 | 미정 |
| LANDING-027 | 현행 | `then`·`else`의 `required`로 필드를 켜고 끔(`then.required`가 `computed.active`가 됨) | 읽지 않는다. 그 필드를 `then.properties`로 옮기거나 `controls.active`를 적는다 | 미정 | 미정 | 미정 |
| LANDING-028 | 현행 | 조건도 판별식도 없는 `oneOf`·`anyOf`는 어느 분기도 켜지지 않음 | 모든 분기가 켜진다 | 미정 | 미정 | 미정 |
| LANDING-029 | 현행 | `&if`의 경로 기준점은 호스트(`./kind`) | 바뀌지 않는다. 조각·`children`·`discriminator`의 식도 호스트 기준(15라운드). 자식에 적던 식을 `controls.children`으로 옮길 때만 `../x`를 `./x`로 고친다 | 미정 | 미정 | 미정 |
| LANDING-030 | 현행 | `injectTo` 순환 자동 차단 | 없다. 예산이 잡는다. 왕복이 정확하지 않은 양방향 주입은 식이 `undefined`를 돌려주어 멈춘다(ADR 0010) | 미정 | 미정 | 미정 |
| LANDING-031 | 현행 | 검증기 앞 제거 키 여섯 | 키워드 위치의 그룹 객체 셋(§3.4). strict 검증기에는 동작 변화 | 미정 | 미정 | 미정 |
| LANDING-032 | 현행 | 꺼졌다 켜질 때 노드 생성 시점의 값으로 복원, `oneOf` 전환에서 같은 이름·같은 타입 값을 이음 | 원본은 그대로 남는다(기본). 잇기 장치는 없고 노드 공유가 대신한다 | 미정 | 미정 | 미정 |
| LANDING-033 | 현행 | 평면 `&키` 축약 | 사라진다. 제어 키는 `controls` 안에만(15라운드) | 미정 | 미정 | 미정 |
| LANDING-034 | 현행 | 맨 키 `terminal`·`virtual`·`propertyKeys`, 입력·렌더·오류 표시 키, `options.trim`과 플러그인 자유 칸 | `options.terminal`·`options.virtual`·`options.propertyKeys`, `presentation` 표시 키·자유 칸; `options.trim`은 유지 | 미정 | 미정 | 미정 |
| LANDING-035 | 현행 | `FormGroup`·`FormLabel`·`FormInput`·`FormError`, `CustomFormTypeRenderer`·`FormTypeRenderer` | `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`로 변경; `Form.*` 이름은 유지 | 미정 | 미정 | 미정 |
| LANDING-036 | 현행 | Form 속성 `validatorFactory`는 함수 하나 | `{ compile, compileGuard }` 객체. 플러그인과 같은 계약(§11) | 미정 | 미정 | 미정 |
| LANDING-037 | 현행 | 검증기 플러그인 계약은 `compile`뿐 | `compileGuard(root, pointer)`와 `rejectedKey`가 더해진다. ajv6·7·8 플러그인이 동기 가드 경로를 구현한다 | 미정 | 미정 | 미정 |
| LANDING-038 | 현행 | `node.jsonSchema`는 마운트 때 고정된 값 | 켜진 조각을 병합한 유효 스키마. 활성 조각 집합마다 메모되어 같은 집합이면 같은 참조, 바뀌면 통지의 배달 집합에 든다(§4·§7·§9) | 미정 | 미정 | 미정 |
| LANDING-039 | 현행 | `reset`은 provider 아래를 재마운트해 새 prop을 반영; `showError` 유지, 검증·`onChange`는 항상 실행 | 같은 스키마는 루트 로드·참조 유지, 다르면 트리 교체; 입력만 선별 재마운트, `showError` 초기화, 검증·통지는 조건부 | 미정 | 미정 | 미정 |
| LANDING-040 | 현행 | 플러그인이 `options.*`에 자유 키를 둠(`protocols`·`lazy`·`minimum`·`maximum` 등)과 맨 키(`lazy`·`radioLabels`·`switchLabels`·`switchSize`·`ampm`·`minRows`·`maxRows`) | `presentation.*`로 옮긴다. `options`는 닫힌 목록(`terminal`·`virtual`·`propertyKeys`·`omitEmpty`·`omitTrailing`·`trim`)이라 남겨 두면 청사진 오류 | 미정 | 미정 | 미정 |
| LANDING-041 | 현행 | 마운트 때 검증 모드와 무관하게 한 번 검증 | 로드 뒤 `OnChange` 비트일 때만 한 번 검증; 마운트는 폼 커밋 뒤, reset은 진입 끝, core 호스트는 직접 요청 | 미정 | 미정 | 미정 |
| LANDING-042 | 현행 | 호출자의 전체 교체 `setValue(V)`는 브랜치에도 Refresh를 내어 객체·배열 입력 아래 서브트리 전체를 다시 마운트한다 | reset과 같은 입력 판정이다. 자식 프록시를 그리지 않는 입력만 다시 마운트하고(값 전체를 스스로 그리는 사용자 브랜치 입력은 오늘처럼 다시 마운트된다), 대체된 입력의 늦은 쓰기는 버린다(09 §2.6의 열넷째, 16라운드 스웜 수렴(편집자 결정)) | 미정 | 미정 | 미정 |
| LANDING-043 | 현행 | 공개 `node.group`(`'branch'` 또는 `'terminal'`) | `node.strategy`(값은 그대로, 17라운드 소유자 확정). 가드 `isBranchNode`·`isTerminalNode`는 이름을 유지한다. 소비자는 `FallbackComponents/FormGroupRenderer.tsx:18`, UI 플러그인 넷의 `FormGroup`, 스토리와 시나리오 시험이다 | 미정 | 미정 | 미정 |
| LANDING-044 | 현행 | 오류를 받는 Form 속성이 없다. 오류는 throw·`console.error`·노드 오류로 흩어지고 경고는 개발 모드 콘솔뿐이다 | Form 속성 `onError` 신설. 검증 결과를 뺀 폼 내부의 오류와 경고를 같은 모양의 기록으로 받는 관찰자이며 흐름을 바꾸지 못한다(4번 안 B, §11.3, ADR 0014 §3). 오류·경고 코드 목록이 공개 계약이 된다 | 미정 | 미정 | 미정 |
| LANDING-045 | 현행 | 진단 신호가 없다(`INFINITE_LOOP_DETECTED`를 던질 뿐). 앞 판 설계의 `diagnostics.status`는 `'budgetExceeded'`, `exceededBudget`은 예산 다섯이었다 | `status`는 `'stable'` 또는 `'degraded'`, 원인 `cause`(예산, 식, 대상, 공유 충돌), `exceededBudget`은 정착 예산 셋, `commit`. 다음 로드까지 남고 그 동안 폼의 제출 경로가 거부한다(R17-1 나, §12) | 미정 | 미정 | 미정 |
| LANDING-046 | 현행 | 필드 바운더리와 `Form`의 자기 바운더리는 렌더 오류를 가두어 대체 화면을 그리고 `console.error`만 한다 | 가두고 대체 화면을 그리는 것은 같다. 다시 던지지 않고 `componentDidCatch`에서 `onError`와 주인 없는 오류 싱크로 보고한다(§12). `@winglet/react-utils`의 바운더리 감싸개에 렌더 때 보고 함수를 얻는 선택 인자가 더해진다(소유자 허용, `minor`) | 미정 | 미정 | 미정 |
| LANDING-047 | 대체됨(→ LANDING-145) | `options.trim: true`이면 `StringNode`가 내부 사건 `Blurred`를 구독해 흐림 때 원본을 잘린 값으로 덮는다(`StringNode.ts:118-122`) | 포커스 아웃 때 자르는 동작은 같다. 판단은 문자열 동작 행의 `finishInput` 칸이 하고 어댑터는 타입을 모르는 입력 마침 신호 `finishInput`만 보낸다. 자른 값은 사용자 입력과 같은 쓰기(입력 출처)이며 현재 값과 같으면 쓰지 않는다(17라운드 소유자 답 R17-3, §3.3). 이 쓰기가 바깥 오류를 지우고 dirty를 표시하는지는 18라운드 안건이다 | 미정 | 미정 | 미정 |
| LANDING-048 | 현행 | `isTerminalNode`는 `node.group === 'terminal'`로 판정하면서 형을 잎 넷으로 좁힌다(`src/core/nodes/filter.ts:195-198`) | `node.strategy`로 판정하고, 형의 좁히기를 터미널 객체·배열까지 포함하도록 바로잡는다(공개 형 변경) | 미정 | 미정 | 미정 |
| LANDING-049 | 현행 | 노드 메서드 `findAll` | `findNodes`(`FormHandle`은 이미 `findNodes`다) | 미정 | 미정 | 미정 |
| LANDING-050 | 대체됨(→ LANDING-149) | 잎의 `options.terminal: false`는 `'branch'`가 되어 `FormGroupRenderer`가 fieldset으로 그리고, 가상의 `options.terminal: true`와 인라인 `FormTypeInput`은 `'terminal'`이 되어 자식 구성 요소를 비운다 | `BEHAVIORS[type][strategy]`에 행이 없는 조합이다. 처리와 이주는 18라운드 안건이다 | 미정 | 미정 | 미정 |
| LANDING-115 | 중복(→ VALIDATE-010) | `ENHANCED_KEY` 마커 주입 | 검증기 입력 불변; 활성 조각 기반 `schemaPath` 필터 | 미정 | 미정 | 미정 |
| LANDING-116 | 중복(→ WRITE-022) | `minItems` 채움·`maxItems` 차단, `Normalize` 미선언 키 제거, `null`→`{}` 변환·비객체 값 버리기 | 입력 컴포넌트·유효 스키마로 제한 처리; `extras` 보존·방출, 비객체 값 보존·방출과 type 에러 | 미정 | 미정 | 미정 |
| LANDING-117 | 중복(→ EVENT-002) | 배열 연산이 Promise 반환; `await` 뒤도 구독자 관찰을 뜻하지 않음 | 배열 연산은 동기 API | 미정 | 미정 | 미정 |
| LANDING-118 | 대체됨(→ WRITE-090) | `setValue(getValue())`로 값 유지 | 전체 교체의 로드 계약으로 지운 키에 `default` 재주입; 호출 단위 억제 옵션 필요 | 미정 | 미정 | 미정 |
| LANDING-119 | 중복(→ EVENT-036) | `useEffect`로 파생 값 쓰기 | 새 진입으로 키 입력당 `onChange` 2회; `&derived`·`injectTo`·리스너 권장 | 미정 | 미정 | 미정 |
| LANDING-120 | 분할됨(→ LANDING-125, LANDING-126, LANDING-127) | 파서가 문자 제거·정수 자르기·빈 값 치환·불리언 진릿값 변환 | 뜻을 보존하는 parse만 수행; 실패 값 유지·방출·제출, 정합 상태와 검증기 무관 warning 기록 | 미정 | 미정 | 미정 |
| LANDING-125 | 현행 | 파서가 문자 제거·정수 자르기·빈 값 치환·불리언 진릿값 변환 | 뜻을 보존하는 parse만 수행; 실패 값 유지·방출·제출, 노드 정합 상태가 공개 형 판별자 | 미정 | 미정 | 미정 |
| LANDING-126 | 현행 | 결정에 오늘 동작 별도 명시 없음 | `onError` level `warning`; 정합 상태가 켜질 때마다 `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH` 한 번 | 미정 | 미정 | 미정 |
| LANDING-127 | 현행 | 결정에 오늘 동작 별도 명시 없음 | core parse의 변환 실패 기록은 검증기 유무와 무관하게 발송 | 미정 | 미정 | 미정 |
| LANDING-128 | 현행 | 재귀 객체 스키마가 `UNKNOWN_JSON_SCHEMA` 또는 스택 넘침으로 실패 | 폼이 서지 않는 것은 같고 명시적 청사진 오류 `JSON_SCHEMA_ERROR.RECURSIVE_SHAPE_UNBOUNDED` | 미정 | 미정 | 미정 |
| LANDING-129 | 현행 | 원시 타입 둘 이상의 `type` 배열은 `UNKNOWN_JSON_SCHEMA`로 폼 생성 실패 | `union` 잎과 문자열 입력으로 폼 생성 | 미정 | 미정 | 미정 |
| LANDING-130 | 현행 | `['integer','number']`는 `UNKNOWN_JSON_SCHEMA` | `['integer','number']`는 수 노드 | 미정 | 미정 | 미정 |
| LANDING-131 | 현행 | `dependentSchemas`·`dependencies` 사용의 개발 모드 경고 없음 | 해당 스키마 사용 시 개발 모드 경고 신설 | 미정 | 미정 | 미정 |
| LANDING-132 | 현행 | 조건부 `required` 필드의 필수 표시가 항상 켜짐 | 켜진 `then`에 따라 필수 표시 변경 | 미정 | 미정 | 미정 |
| LANDING-133 | 현행 | 같은 값인 객체·배열 `const`끼리의 `allOf`가 `JSONSchemaError` | 새 설계·레거시 모두 통과(결함 수정) | 미정 | 미정 | 미정 |
| LANDING-134 | 현행 | 여러 `pattern`을 `(?=a)(?=b)` 합성 문자열로 `node.jsonSchema`에 표현 | 첫 패턴과 `allOf`의 `{pattern}` 항목으로 표현 | 미정 | 미정 | 미정 |
| LANDING-135 | 현행 | 결정에 오늘 동작 별도 명시 없음 | 식의 `*` 조각은 청사진 오류 | 미정 | 미정 | 미정 |
| LANDING-136 | 현행 | `../name === ''` 같은 빈 문자열 비교 식 사용 | `omitEmpty` 아래에서는 `undefined` 관찰; `!../name`으로 변경하거나 `omitEmpty` 해제 | 미정 | 미정 | 미정 |
| LANDING-137 | 현행 | `controls.watch`의 `watchValues`에서 빈 문자열 사용 | `omitEmpty` 아래에서는 빈 문자열을 `undefined`로 전달 | 미정 | 미정 | 미정 |
| LANDING-138 | 현행 | `injectTo` 반환의 `undefined` 항목으로 덮어쓰기 | `undefined` 항목은 쓰지 않음 | 미정 | 미정 | 미정 |
| LANDING-139 | 현행 | 입력·`Merge`의 `null` 아래 자식은 기본값 상태 표시 | 채움 없이 없음 | 미정 | 미정 | 미정 |
| LANDING-140 | 현행 | 입력이 넘긴 `Merge`가 `Refresh` 비트로 자기 입력 재마운트 | 입력을 재마운트하지 않음 | 미정 | 미정 | 미정 |
| LANDING-141 | 현행 | `Overwrite \| Merge`가 `Overwrite`로 동작 | `INVALID_WRITE_OPTION` throw | 미정 | 미정 | 미정 |
| LANDING-142 | 대체됨(→ WRITE-090) | `setValue(undefined)`의 기본 `Overwrite`는 채움 없이 비움 | `default` 자리의 기본값 재주입; 채움 없이 비우려면 `Merge`·`DisableAutomaticWrites` | 미정 | 미정 | 미정 |
| LANDING-143 | 대체됨(→ WRITE-090) | 값을 빼는 입력이 `onChange(undefined, SetValueOption.Overwrite)` 사용 | 로드로 기본값 재주입; 값을 빼려면 `Overwrite` 제거, 스토리 넷 수정·입력 작성자 안내 | 미정 | 미정 | 미정 |
| LANDING-144 | 현행 | 로드·부모가 준 `{}`는 호스트 `default`를 막음 | `{}`여도 호스트가 `default`를 받음 | 미정 | 미정 | 미정 |
| LANDING-145 | 현행 | 흐림 때 원본을 잘린 값으로 덮고 `RequestRefresh` 없음 | `finishInput`의 자동 쓰기; 바깥 오류·dirty 유지, 같은 값이면 쓰지 않고 비제어 입력 재마운트 | 미정 | 미정 | 미정 |
| LANDING-146 | 현행 | `batch` 없음; `setValue`·updater는 호출 자리의 값으로 곧바로 적용 | `batch(fn)` 안 updater는 이어지지만 일반 읽기는 직전 커밋; 읽어 다음 쓰기에 쓰던 코드는 updater로 변경 | 미정 | 미정 | 미정 |
| LANDING-147 | 현행 | 가상 노드의 틀린 모양 쓰기는 `JSONSchemaError`; 같은 길이 문자열은 글자로 분해 | 오류는 `SchemaFormError`; 같은 길이 문자열 쓰기는 거부 | 미정 | 미정 | 미정 |
| LANDING-148 | 현행 | `find`가 꺼진 `oneOf` 변형 노드를 반환할 수 있음 | `null` 반환. 07 U8 처분 78C-01: `reset.pristine.render.test.tsx` | 미정 | 미정 | 미정 |
| LANDING-149 | 현행 | 잎 `terminal: false`·가상 `terminal: true` 허용; 가상 인라인 입력은 `'terminal'`이고 자식 구성 요소 비움 | 지원 없는 terminal 조합은 청사진 오류; 가상 인라인 입력은 `'branch'`·`ChildNodeComponents`, `isTerminalNode`는 거짓 | 미정 | 미정 | 미정 |
| LANDING-152 | 현행 | `globalState` 키는 루트에서만 비움 | 참인 노드가 없으면 키 제거 | 미정 | 미정 | 미정 |
| LANDING-153 | 현행 | `globalState`는 마지막으로 쓴 참인 값을 그대로 보유 | 비불리언 상태 값도 `true`로 집계 | 미정 | 미정 | 미정 |
| LANDING-154 | 현행 | `node.key`·`node.schemaPath` 존재 | 두 속성 없음 | 미정 | 미정 | 미정 |
| LANDING-155 | 현행 | `defaultValue`는 노드 생성 뒤 바뀌지 않음 | 해당 경로의 로드마다 새 로드 값; 배열 아이템은 구조 연산을 따라 자기 값 유지 | 미정 | 미정 | 미정 |
| LANDING-156 | 현행 | `find('@')`·`findAll('@')`가 맥락 노드 반환 | `null`·빈 배열 반환 | 미정 | 미정 | 미정 |
| LANDING-157 | 현행 | 공개 형 `NodeState` | 공개 형 `SchemaNodeState` | 미정 | 미정 | 미정 |
| LANDING-158 | 현행 | 공개 이벤트 형 `NodeEventType` | 공개 이벤트 형 `SchemaNodeEventType` | 미정 | 미정 | 미정 |
| LANDING-160 | 현행 | `NumberNode.__equals__`는 `isClose` 근사 비교 | 정확한 비교 | 미정 | 미정 | 미정 |
| LANDING-161 | 현행 | `ObjectNode`의 `equals`는 키 순서 무시 | 키 순서 비교 | 미정 | 미정 | 미정 |
| LANDING-162 | 현행 | `ObjectNode.__equals__`는 내장 객체를 내부 상태로, 클래스 인스턴스를 구조로 비교 | 내장 객체·클래스 인스턴스를 참조로 비교 | 미정 | 미정 | 미정 |
| LANDING-163 | 현행 | 계산 속성이 한 의존 배열을 공유해 `active`만의 경로 변경도 `derived` 재계산 | `derived`는 자기 의존 집합에서만 발화 | 미정 | 미정 | 미정 |
| LANDING-164 | 현행 | 배열 통째 쓰기가 `clear` 뒤 전량 `push`여서 아이템 상태·키 모두 재생성 | 아이템 키 유지; `dirty`·`touched`·바깥 오류·가상화·입력 상태·노드 참조가 위치를 따름 | 미정 | 미정 | 미정 |
| LANDING-165 | 현행 | 닫힌 튜플 뒤의 값 버림 | 뒤의 값도 방출 | 미정 | 미정 | 미정 |
| LANDING-166 | 현행 | 사용자 쓰기의 `injectTo`가 null 조상을 객체로 변경 | null 조상 유지; 아래 값은 그려지지만 방출되지 않음 | 미정 | 미정 | 미정 |
| LANDING-167 | 현행 | 가상 인라인 입력 아래 경로의 `find`가 그 가상 노드 반환 | 참조된 노드 반환 | 미정 | 미정 | 미정 |
| LANDING-168 | 현행 | 노드 자체 잠금만 `onChange`를 버리고 Form 잠금은 입력 prop으로 전달 | Form `readOnly`·`disabled` 잠금 동안 입력 `onChange`도 버림 | 미정 | 미정 | 미정 |
| LANDING-169 | 현행 | 루트 검증 오류의 공개 `dataPath`는 `'/'` | 루트 `dataPath`는 `''` | 미정 | 미정 | 미정 |
| LANDING-171 | 현행 | 빈 중첩 객체·배열의 `normalizedValue`는 `{}`·`[]`; 부모·`getValue()`에는 키 없음 | `omitEmpty` 아래 `outputValue`는 `undefined`; `node.value`는 `{}`·`[]`, 부모·`getValue()`의 키 없음은 유지 | 미정 | 미정 | 미정 |
| LANDING-172 | 현행 | 객체·배열을 포함한 이종 `type` 배열은 `UNKNOWN_JSON_SCHEMA` | 터미널 강제 union; 안쪽 `find` 없음, `{}`·`[]` 방출에는 `omitEmpty: false` | 미정 | 미정 | 미정 |
| LANDING-173 | 현행 | 배열 `type` 경로는 `nullable:true`를 무시 | 비 union 배열도 `nullable: true` 적용 | 미정 | 미정 | 미정 |
| LANDING-174 | 현행 | 형 없는 원시 `anyOf`·`oneOf`는 `UNKNOWN_JSON_SCHEMA` | union·원시 잎과 nullable 처리 | 미정 | 미정 | 미정 |
| LANDING-175 | 현행 | 형 없는 null 분기만의 스키마는 `UNKNOWN_JSON_SCHEMA` | nullable null 노드 | 미정 | 미정 | 미정 |
| LANDING-176 | 현행 | 형 없는 `{allOf:[{type:'string'}]}`는 병합 처리기가 없어 오류 | string 노드 | 미정 | 미정 | 미정 |
| LANDING-177 | 현행 | `['null','null']`은 nullable null 노드 | `UNKNOWN_JSON_SCHEMA` | 미정 | 미정 | 미정 |
| LANDING-178 | 현행 | nullable 기반의 형 없는 `allOf` 항목 `{nullable:false}`가 null 제거 | 그 항목은 효과 없음 | 미정 | 미정 | 미정 |
| LANDING-179 | 현행 | string·null과 number·null의 `allOf` 교집합이 `ALL_OF_TYPE_REDEFINITION` | nullable null 노드 | 미정 | 미정 | 미정 |
| LANDING-180 | 현행 | number와 number·string의 `allOf` 교집합이 `ALL_OF_TYPE_REDEFINITION` | 교집합인 number 노드 | 미정 | 미정 | 미정 |
| LANDING-181 | 현행 | `Hint.type`·`FormTypeInputProps.type`이 `node.schemaType`; 정수는 `'integer'` | `node.type` 사용; 정수는 `'number'`, 별도 `schemaType` 신설 | 미정 | 미정 | 미정 |
| LANDING-182 | 현행 | 입력 선택 시험은 `{type:['number','integer']}` | `{type:'number'}` 사용; 정수만이면 `{schemaType:'integer'}` | 미정 | 미정 | 미정 |
| LANDING-183 | 현행 | 함수 시험의 `type === 'integer'` 절 | 죽은 조건이므로 제거(TS2367) | 미정 | 미정 | 미정 |
| LANDING-184 | 현행 | mui 수 입력은 빈 칸 `null`, `type === 'integer'`·`parseInt` 정수 처리, `step` 사용 | 빈 칸 `undefined`, `schemaType === 'integer'`, 자르지 않음, 해석 못한 글은 초안 | 미정 | 미정 | 미정 |
| LANDING-185 | 현행 | `FormTypeTestObject`는 `type: JSONSchemaType \| JSONSchemaType[]` | `type: SchemaNodeType \| SchemaNodeType[]`, 새 키 `schemaType` | 미정 | 미정 | 미정 |
| LANDING-186 | 현행 | 시험 객체의 모든 키 비교로 `{typo: undefined}`가 우연히 일치 | 모르는 키는 대조에서 제외하고 개발 모드 경고 | 미정 | 미정 | 미정 |
| LANDING-187 | 현행 | 코어 기본 입력 정의 열 개 | `{type:'union'}` 감싸개 추가로 열한 개 | 미정 | 미정 | 미정 |
| LANDING-188 | 현행 | 가드는 `node.group` 판정, `isTerminalNode`가 원시 잎 넷으로 좁힘 | `strategy` 판정·`UnionNode` 추가; 좁힌 뒤 `switch (node.type)`에 `case 'union'` 필요 | 미정 | 미정 | 미정 |
| LANDING-189 | 현행 | `InferValueType`의 `as const` `type` 배열은 `any` | 정확한 합 형; 새 형 오류 가능 | 미정 | 미정 | 미정 |
| LANDING-190 | 현행 | `InferJSONSchema<A\|B>` 분배로 `StringNode \| NumberNode` | `UnionSchema`·`UnionNode` | 미정 | 미정 | 미정 |
| LANDING-191 | 현행 | `SchemaNode` 합집합·`FormTypeRendererProps.type`에 `UnionNode`·`'union'` 없음 | 망라 `switch`에 `case 'union'` 추가 | 미정 | 미정 | 미정 |
| LANDING-192 | 현행 | 값 변경 옵션을 켠 ajv `bind` 허용; 살아 있는 폼 값 제자리 변경 | `bind`가 `VALIDATOR_BIND_REFUSED` throw; 값을 바꾸지 않는 별도 인스턴스 사용 | 미정 | 미정 | 미정 |
| LANDING-193 | 현행 | 검증기에 주는 스키마 사본은 얕음 | 깊은 사본을 한 번 생성 | 미정 | 미정 | 미정 |
| LANDING-194 | 현행 | ajv8 union `type`에 `strictTypes` 로그 경고 | `allowUnionTypes`로 경고 없음 | 미정 | 미정 | 미정 |
| LANDING-195 | 현행 | 터미널 아래 경로의 검증 에러 버림 | 터미널(union) 노드가 에러 수신 | 미정 | 미정 | 미정 |
| LANDING-196 | 현행 | 기본 문자열 입력은 글 그대로, 수 입력은 `valueAsNumber` 전달 | 빈 칸은 `undefined`; 해석 못한 초안은 흐림 때 되돌림 | 미정 | 미정 | 미정 |
| LANDING-197 | 현행 | 터미널 object·array 값 안 JSON 부정합 검사 없음 | 개발 모드 `NON_JSON_WHOLE_VALUE` 경고 | 미정 | 미정 | 미정 |
| LANDING-199 | 현행 | 호출자의 `setValue(V)` `Overwrite`는 브랜치에도 Refresh·하위 트리 전체 재마운트 | 원본이 실제로 바뀐 노드만 재마운트 | 미정 | 미정 | 미정 |
| LANDING-200 | 현행 | `setValue(null)` 뒤 자식 쓰기로 객체 복원 시 자식이 든 기본값 표시 | 채우지 않음 | 미정 | 미정 | 미정 |
| LANDING-201 | 현행 | 입력 `onChange(v, SetValueOption.Overwrite)`가 `Refresh` 비트로 자기 입력 재마운트 | 입력을 재마운트하지 않음 | 미정 | 미정 | 미정 |
| LANDING-202 | 현행 | 배열 통째 `setValue`가 아이템을 재생성하고 모두 채움 | 위치로 이어 남은 아이템은 채우지 않고 뒤에 새로 생긴 아이템만 채움 | 미정 | 미정 | 미정 |
| LANDING-207 | 현행 | 형 없는 객체 `oneOf`·`anyOf`는 `UNKNOWN_JSON_SCHEMA` | object variant 호스트; 게이트 없는 객체 프로퍼티 순환은 `RECURSIVE_SHAPE_UNBOUNDED` | 미정 | 미정 | 미정 |
| LANDING-208 | 현행 | `type` 없이 `const`·`enum`만 있는 프로퍼티는 `UNKNOWN_JSON_SCHEMA` | 리터럴 종류의 원시 잎 | 미정 | 미정 | 미정 |

코어 전용 진입의 서명 변경: 옛 `nodeFromJSONSchema({ jsonSchema, defaultValue, onChange, validationMode, validatorFactory, contextNode })` → 새 서명(plan/07-switch/execution-adr.md D3), 이주 행 아님(70C-01)


공개 표면 잔여의 거취: 형 별칭 `JSONSchemaError`(= `ValidationIssue`, 34C-02·50C-01 "PR-7까지")는 07 전환 커밋에서 공개 index에서 빠짐(74라운드 소유자 답, 75C-01). 옛 이름의 별칭은 두지 않음. throw 클래스의 판별 함수 `isJSONSchemaError`는 오류 분류의 현행 공개 함수로 남음. 이주 안내 본문은 PR-8(LANDING-068)

globalErrors·getErrors()의 내용: 변경 없음(루트 외부 오류 + 검증 목록, 79C-01)

- 마운트 정착 동안 onChange가 나지 않음(TEST-020·021). 초기 값은 동기 정착 뒤 getValue로 읽습니다. 07 U8 처분 78C-01: `array.omit-trailing.injection.render.test.tsx`, `deferred-mount.render.test.tsx`.
- 터미널 호스트는 값을 통째로 들고 자식 기본값을 채우지 않음(NODE-005); 호출자 defaultValue 불변은 유지합니다(WRITE-071). 07 U8 처분 78C-01: `default-value.input-immutability.render.test.tsx`.
- 검증 마커 제거 뒤 표준 oneOf에서 다른 분기가 유효하면 오류가 없음(LANDING-115·VALIDATE-010·036). controls.active는 표준 검증의 분기 선택 마커가 아닙니다. 07 U8 처분 78C-01: `multi-render-split-brain.render.test.tsx`.
- 배열 잎 아이템의 방출 없는 빈자리는 undefined가 아니라 null로 방출하며, omitTrailing은 후행 빈자리만 자름(VALUE-034). 07 U8 처분 78C-01: `array.omit-trailing.injection.render.test.tsx`.
