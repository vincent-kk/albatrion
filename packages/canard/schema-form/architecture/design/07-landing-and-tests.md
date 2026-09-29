# 07 이주·착수와 시험

이 문서는 원장의 LANDING·TEST 영역을 읽는 표면이다. 정본은 `ledger/`이며, 문장 끝 괄호의 ID가 근거이고, 어긋나면 원장이 이긴다.

## 소유자 통과

| 절 | 상태 | 날짜 |
| --- | --- | --- |
| 1.1 전환 범위와 이주 안내 | 대기 | — |
| 1.2 기존 기능과 공개 계약의 이주 | 대기 | — |
| 1.3 이주 안내의 추가 기록 | 대기 | — |
| 1.4 파싱과 입력의 이주 | 대기 | — |
| 1.5 재귀와 조건부 스키마의 이주 | 대기 | — |
| 1.6 union과 형 없는 스키마의 이주 | 대기 | — |
| 1.7 파생 값과 상태 키의 이주 | 대기 | — |
| 1.8 로드와 채움의 이주 | 대기 | — |
| 1.9 값 비교와 출력의 이주 | 대기 | — |
| 1.10 노드 탐색과 공개 사건의 이주 | 대기 | — |
| 1.11 공개 형과 입력 계약의 이주 | 대기 | — |
| 1.12 검증기와 오류 처리의 이주 | 대기 | — |
| 1.13 플러그인 이주와 차이 점검 | 대기 | — |
| 1.14 개발 단계와 전환 방식 | 대기 | — |
| 1.15 코어의 자리와 교체 범위 | 대기 | — |
| 1.16 기반과 청사진의 착수 | 대기 | — |
| 1.17 노드 트리와 정착의 착수 | 대기 | — |
| 1.18 파생의 착수 | 대기 | — |
| 1.19 통지와 검증의 착수 | 대기 | — |
| 1.20 배열의 착수 | 대기 | — |
| 1.21 상태 키와 제어의 착수 | 대기 | — |
| 1.22 엔진 전환과 레거시 경계 | 대기 | — |
| 1.23 플러그인 전환 | 대기 | — |
| 1.24 릴리스 작업 흐름의 전환 | 대기 | — |
| 1.25 정리와 릴리스 | 대기 | — |
| 2.1 시험의 원칙과 위계 | 대기 | — |
| 2.2 시나리오의 단일 원천과 실행기 | 대기 | — |
| 2.3 기존 시험과 렌더 하니스의 처분 | 대기 | — |
| 2.4 단계별 새 시험 | 대기 | — |
| 2.5 청사진과 노드 트리의 검증 관문 | 대기 | — |
| 2.6 union의 시험 목록 | 대기 | — |
| 2.7 스토리북의 구조와 이식 | 대기 | — |
| 2.8 릴리스 시험과 배포 작업 흐름 | 대기 | — |
| 2.9 릴리스 관문과 정리 | 대기 | — |
| 2.10 성능 측정 원칙과 기준선 | 대기 | — |
| 2.11 측정 시나리오와 실험 기록 | 대기 | — |
| 2.12 성능 예산과 병합 관문 | 대기 | — |

## 1. 이주와 착수

### 1.1 전환 범위와 이주 안내

완전한 파괴적 변경이며 `@canard/schema-form`과 플러그인 패키지 전부가 함께 메이저 버전급 변경으로 올라간다(추가 목표 C7(확장 계약의 재설계))(LANDING-001). 소유자(C7): "스키마폼 관련 모든 버전은 일시에 메이저 버전급 변경을 진행한다."(LANDING-001)

릴리스 노트와 이주 프롬프트(`docs/agents` 경로)를 낸다(추가 목표 C8(이행 경로))(LANDING-003). 소유자(C8): "(1) 릴리즈 노트와 배포 문서 — 수정의 의도와 목표, 기존 사용 방법별 대체 용법. (2) **그 수정을 수행할 수 있는 프롬프트** — 에이전트가 소비자의 맥락에 맞게 고칠 수 있도록."(LANDING-003)

### 1.2 기존 기능과 공개 계약의 이주

(LANDING-004, LANDING-005, LANDING-006, LANDING-007, LANDING-008, LANDING-009, LANDING-010, LANDING-011, LANDING-012, LANDING-013, LANDING-014, LANDING-015, LANDING-016, LANDING-017, LANDING-018, LANDING-019, LANDING-020, LANDING-021, LANDING-022, LANDING-023, LANDING-024, LANDING-025, LANDING-026, LANDING-027, LANDING-028, LANDING-029, LANDING-030, LANDING-031, LANDING-032, LANDING-033, LANDING-034, LANDING-035, LANDING-036, LANDING-037, LANDING-038, LANDING-039, LANDING-040, LANDING-041, LANDING-042, LANDING-043, LANDING-044, LANDING-045, LANDING-046, LANDING-048, LANDING-049, EVENT-071, LANDING-199, ERROR-195, ERROR-190, LANDING-188, LANDING-149)

| # | 오늘 | 새 설계 |
| --- | --- | --- |
| 1 | `oneOf`·`anyOf`의 `const`·`enum` 자동 감지로 분기를 고른다 | 폼은 분기를 고르지 않는다. 명시 `controls.discriminator` 또는 분기 안 `if/then/else: false` 또는 `controls.active` |
| 2 | `oneOfIndex`·`anyOfIndices`, 분기 선택 API | 대체물 없이 사라진다. 분기의 필드는 노드이고 활성 여부는 노드의 `active` |
| 3 | `&if`(분기의 조건) | `controls.active`로 흡수 |
| 4 | `computed` 컨테이너 | `controls`로 이름 변경. 별칭 없음(15라운드) |
| 5 | `&pristine` | `controls.resetInteraction` |
| 6 | 없음 | `controls.unsetValue`, `controls.default`, `controls.children`, `controls.discriminator`, `controls.unsetOnInactive` 신설 |
| 7 | `allOf` 항목 안의 `if/then/else`는 병합되지 않고 경고만 | 병합된다 |
| 8 | 분기 전환 때 공유 노드를 다시 채운다 | 이미 있던 노드는 다시 채우지 않는다 |
| 9 | 표준 `readOnly`와 `&readOnly`는 택일(표준이 이김) | OR |
| 10 | `allOf` 항목끼리 겹친 표준 `readOnly`는 먼저 승 | OR |
| 11 | 공개 문서의 `derived` 레벨 약속 | 에지(의존 값이 바뀔 때만) |
| 12 | 루트 키 다섯(`readOnly`·`disabled`·`active`·`visible`·`pristine`)의 특수 처리, README "Priority System" | 사라진다. 루트 키는 루트 노드의 로컬 키. 전체 잠금은 Form 속성 |
| 13 | 로컬 순위 사슬(노드 `readOnly: false`가 `&readOnly`를 이김) | OR |
| 14 | 맨 키 `disabled`·`visible`·`active` | `controls.disabled`·`controls.visible`·`controls.active` |
| 15 | 조각이 꺼지면 원본을 지우고 켜지면 노드가 생성될 때의 값(없으면 `default`)으로 복원 | 기본 유지(방출에서만 빠짐). 비움은 `unsetOnInactive` |
| 16 | `virtual`의 `required` 재작성(가상 이름 → 실제 자식) | 하지 않는다. 작성자가 실제 필드를 적는다 |
| 17 | `find`·`findNodes`가 터미널 아래 경로에 터미널 노드를 별칭으로 돌려줌 | 노드 없음 |
| 18 | 10비트 `SetValueOption` | 비트 넷 |
| 19 | 루트 `onChange` 매크로태스크 디바운스 | 최외곽 동기 진입당 1회 |
| 20 | `normalizedValue` | `outputValue` |
| 21 | 인터페이스 `JSONSchemaError`(노드 오류 항목) | `ValidationIssue` |
| 22 | `INFINITE_LOOP_DETECTED`는 배치 도중 throw해 커밋을 남기지 않음. 검증기 컴파일 실패는 `console.error` + 노드 오류. `Form`의 자기 바운더리가 마운트 오류를 삼킴. 검증기 없이도 조용히 동작 | 원본 B를 커밋·통지한 뒤 사슬의 끝에서 모든 환경에서 throw(17라운드 소유자 답 R17-1 나). 전체 스키마 컴파일 실패는 검증 불가, 가드 컴파일 실패는 그 게이트의 가드 실패, 요청 시점 실패는 `validate()`의 거부. 루트 바운더리는 다시 던지지 않고 가두어 `onError`와 주인 없는 오류 싱크로 보고한다. 검증기가 없어도 폼은 서며 `if` 게이트의 조각은 꺼진 채 경고를 낸다. 검증기가 없으면 거부하지 않고 개발 모드 콘솔과 `onError`의 경고 기록으로 트리마다 한 번 알리며, 검증기는 있으나 전체 스키마 컴파일이 실패하면 검증 모드가 `None`이 아닐 때 검증 요청·`validate()`·제출이 모든 환경에서 거부된다(소유자 통보 3 답, R17-1 나, 17라운드 스웜 수렴(편집자 결정)) |
| 23 | 조건부 폼 생성 시 가드 컴파일 비용 없음 | `compileGuard` 컴파일이 생긴다(가드 200개에 14–54 ms, 위치당 1회·인스턴스 사이 공유) |
| 24 | `then`·`else`의 `required`로 필드를 켜고 끔(`then.required`가 `computed.active`가 됨) | 읽지 않는다. 그 필드를 `then.properties`로 옮기거나 `controls.active`를 적는다 |
| 25 | 조건도 판별식도 없는 `oneOf`·`anyOf`는 어느 분기도 켜지지 않음 | 모든 분기가 켜진다 |
| 26 | `&if`의 경로 기준점은 호스트(`./kind`) | 바뀌지 않는다. 조각·`children`·`discriminator`의 식도 호스트 기준(15라운드). 자식에 적던 식을 `controls.children`으로 옮길 때만 `../x`를 `./x`로 고친다 |
| 27 | `injectTo` 순환 자동 차단 | 없다. 예산이 잡는다. 왕복이 정확하지 않은 양방향 주입은 식이 `undefined`를 돌려주어 멈춘다(FRAGMENT-034) |
| 28 | 검증기 앞 제거 키 여섯 | 키워드 위치의 그룹 객체 셋(VALIDATE-004). strict 검증기에는 동작 변화 |
| 29 | 꺼졌다 켜질 때 노드 생성 시점의 값으로 복원, `oneOf` 전환에서 같은 이름·같은 타입 값을 이음 | 원본은 그대로 남는다(기본). 잇기 장치는 없고 노드 공유가 대신한다 |
| 30 | 평면 `&키` 축약 | 사라진다. 제어 키는 `controls` 안에만(15라운드) |
| 31 | 맨 키 `terminal`·`virtual`·`propertyKeys`, `formType`·`FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`·`errorMessages`, `options.trim`, `options`의 플러그인 자유 칸 | `options.terminal`·`options.virtual`·`options.propertyKeys`, `presentation`의 다섯 키, 자유 칸. `options.trim`은 `options`에 그대로 두고 적용 자리만 바뀐다(LANDING-145, 17라운드 소유자 답 R17-3) |
| 32 | 플러그인 키 `FormGroup`·`FormLabel`·`FormInput`·`FormError`, Form 속성 `CustomFormTypeRenderer`, 타입 `FormTypeRenderer` | `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`. Form 속성 `CustomFormTypeRenderer`는 `FormTypeGroupRenderer`가 되고 같은 이름의 Form 속성 `FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`가 새로 생긴다. `ChildNodeComponentProps`와 `FormGroupProps`의 공개 prop `FormTypeRenderer`(와 `OverridableFormTypeInputProps`의 Omit 목록)도 `FormTypeGroupRenderer`로 바꾼다. `FormInputProps`·`FormRenderProps`도 `ChildNodeComponentProps`와 교차하므로 같은 이름 변경을 받는다(17라운드 스웜 수렴(편집자 결정), 사실 정정). 합성 API `Form.*`의 이름과 `…Props` 형 이름은 그대로(그 안의 prop `FormTypeRenderer`는 위대로 바뀐다) |
| 33 | Form 속성 `validatorFactory`는 함수 하나 | `{ compile, compileGuard }` 객체. 플러그인과 같은 계약(VALIDATE-041) |
| 34 | 검증기 플러그인 계약은 `compile`뿐 | `compileGuard(root, pointer)`와 `rejectedKey`가 더해진다. ajv6·7·8 플러그인이 동기 가드 경로를 구현한다 |
| 35 | `node.jsonSchema`는 마운트 때 고정된 값 | 켜진 조각을 병합한 유효 스키마. 활성 조각 집합마다 메모되어 같은 집합이면 같은 참조, 바뀌면 통지의 배달 집합에 든다(VALUE-002, SETTLE-007, SCHEMA-007) |
| 36 | `FormHandle.reset`은 `<Form>` 안의 `RootNodeContextProvider` 아래를 다시 마운트하고(`showError`·첨부 파일 맵 인스턴스·provider는 남고 맵의 내용은 비운다) 그때 새 `jsonSchema`·`defaultValue` prop을 반영 | 로드다(WRITE-042, 16라운드 스웜 수렴(편집자 결정)). 같은 스키마(같은 객체이거나, JSON 부분이 키 순서까지 깊게 같고 함수·컴포넌트 칸이 참조로 같음)면 루트의 로드 한 번이고 트리·캐시·노드 참조가 남는다. 다르면 reset 호출 안에서 트리와 캐시를 새로 만들고(비용은 `<Form key>`의 재생성과 같다) 돌아오기 전에 핸들을 새 트리로 바꾼다. 값은 호출 시점에 커밋된 prop이며, 같은 처리기에서 prop을 바꾼 reset은 그 커밋에서 한 번 더 반영한다(끝에서 새 prop이 반영된다. 그 경로에서는 `onChange`가 두 번이고, `startTransition` 안에서는 첫 로드의 옛 값이 한 번 그려진다). 입력은 자식 프록시를 그리지 않는 입력만 다시 마운트하고(오늘은 provider 아래 전부), 대체된 입력의 늦은 쓰기는 버린다. 어느 경로든 `showError`는 prop 값으로 돌아가고(오늘은 유지), `onStateChange`는 상태가 바뀐 때만 내며, 검증 결과는 비운 뒤 `OnChange` 비트가 켜져 있을 때만 한 번 검증한다(오늘은 모드와 무관하게 늘). `onChange`는 방출 값의 참조가 바뀐 때만 낸다(오늘은 늘 낸다). 스키마 객체를 제자리에서 고친 뒤의 reset은 그 변경을 반영하지 않는다(오늘은 reset마다 `clone`해 다시 읽는다). 노드 참조가 reset을 넘어 이어지는 것은 같은 스키마일 때뿐이다. `FormHandle.reset(option?)`은 억제 비트 둘만 받는다 |
| 37 | 플러그인이 `options.*`에 자유 키를 둠(`protocols`·`lazy`·`minimum`·`maximum` 등)과 맨 키(`lazy`·`radioLabels`·`switchLabels`·`switchSize`·`ampm`·`minRows`·`maxRows`) | `presentation.*`로 옮긴다. `options`는 닫힌 목록(`terminal`·`virtual`·`propertyKeys`·`omitEmpty`·`omitTrailing`·`trim`)이라 남겨 두면 청사진 오류 |
| 38 | 마운트 때 검증 모드와 무관하게 한 번 검증한다(`Form.tsx:139`) | 로드(마운트·reset) 뒤의 검증은 `ValidationMode`의 `OnChange` 비트가 켜져 있을 때만 한 번이다. `OnRequest`만 켠 폼은 마운트 때 검증하지 않는다(EVENT-032, 16라운드 스웜 수렴(편집자 결정)). 마운트의 검증 요청은 렌더 계층의 준비 시점(폼이 커밋된 뒤, 오늘 `handleReady`의 자리), reset은 진입 끝에서 내며 규칙은 "로드 뒤 `OnChange` 비트면 한 번"이다. core만 쓰는 호스트(추가 목표 C3(프레임워크 독립적인 core))는 마운트 검증을 직접 요청한다(ERROR-040, 17라운드 스웜 수렴(편집자 결정)) |
| 39 | 호출자의 전체 교체 `setValue(V)`는 브랜치에도 Refresh를 내어 객체·배열 입력 아래 서브트리 전체를 다시 마운트한다 | 로드가 아닌 쓰기(`setValue(V)` 포함)는 원본이 실제로 바뀐 노드에만 Refresh를 내고 쓴 입력 자신은 제외하며, "값이 같아도 낸다"는 로드의 새 수명에만 해당한다(EVENT-071, LANDING-199). 자식 프록시를 그리지 않는 입력만 다시 마운트하고(로드가 아닌 `setValue(V)`는 원본이 실제로 바뀐 노드에만 Refresh를 내고 그 노드만 다시 마운트하므로, 값 전체를 그리는 브랜치 입력도 그 노드의 원본이 바뀐 때만 다시 마운트된다, EVENT-071, LANDING-199), 대체된 입력의 늦은 쓰기는 버린다(REACT-019, REACT-024, 16라운드 스웜 수렴(편집자 결정)) |
| 40 | 공개 `node.group`(`'branch'` 또는 `'terminal'`) | `node.strategy`(값은 그대로, 17라운드 소유자 확정). 가드 `isBranchNode`·`isTerminalNode`는 이름을 유지한다. 소비자는 `FallbackComponents/FormGroupRenderer.tsx:18`, UI 플러그인 넷의 `FormGroup`, 스토리와 시나리오 시험이다 |
| 41 | 오류를 받는 Form 속성이 없다. 오류는 throw·`console.error`·노드 오류로 흩어지고 경고는 개발 모드 콘솔뿐이다 | Form 속성 `onError` 신설. 검증 결과를 뺀 폼 내부의 오류와 경고를 같은 모양의 기록으로 받는 관찰자이며 흐름을 바꾸지 못한다(17라운드 4번 수렴의 안 B, ERROR-094, ERROR-096). 오류·경고 코드 목록이 공개 계약이 된다 |
| 42 | 진단 신호가 없다(`INFINITE_LOOP_DETECTED`를 던질 뿐). 앞 판 설계의 `diagnostics.status`는 `'budgetExceeded'`, `exceededBudget`은 예산 다섯이었다 | `status`는 `'stable'` 또는 `'degraded'`, 원인 `cause`(예산, 식, 대상, 공유 충돌), `exceededBudget`은 정착 예산 셋, `commit`. `cause`에 다섯째 값 (가칭) `'writeShape'`가 더해지고(ERROR-195), `exceededBudget`에 재귀 펼침의 멈춤을 뜻하는 (가칭) `'recursion'`이 더해져 값이 넷이다(ERROR-190). 다음 로드까지 남고 그 동안 폼의 제출 경로가 거부한다(R17-1 나, ERROR-135, ERROR-138) |
| 43 | 필드 바운더리와 `Form`의 자기 바운더리는 렌더 오류를 가두어 대체 화면을 그리고 `console.error`만 한다 | 가두고 대체 화면을 그리는 것은 같다. 다시 던지지 않고 `componentDidCatch`에서 `onError`와 주인 없는 오류 싱크로 보고한다(ERROR-089). `@winglet/react-utils`의 바운더리 감싸개에 렌더 때 보고 함수를 얻는 선택 인자가 더해진다(소유자 허용, `minor`) |
| 45 | `isTerminalNode`는 `node.group === 'terminal'`로 판정하면서 형을 잎 넷으로 좁힌다(`src/core/nodes/filter.ts:195-198`) | `node.strategy`로 판정하고, 형의 좁히기를 터미널 객체·배열까지 포함하도록 바로잡는다(공개 형 변경). `isTerminalNode`의 반환 형 합집합에 `UnionNode`가 들어가고(LANDING-188), 가상 노드는 전략이 `branch`라 `isTerminalNode(가상)`은 거짓이다(LANDING-149) |
| 46 | 노드 메서드 `findAll` | `findNodes`(`FormHandle`은 이미 `findNodes`다) |

【추론】 이주 안내에는 한 줄만 두고 README를 가리킨다(LANDING-022). 【추론】 그 한 줄은, 오늘 매크로태스크 디바운스가 가리던 "이펙트 쓰기면 키 입력당 `onChange` 2회"가 새 설계에서 드러난다는 점이다(LANDING-022).

조건부 폼의 생성은 현재 구현보다 1.7배 느리다 — 가드 200개에 22.4 ms(LANDING-026, TEST-064). AJV에서 가드의 호출은 싸고(좁은 가드 5–58 ns, 루트에 걸린 가드 200개를 키 입력마다 전부 돌려 7.9 µs) 비싼 것은 **컴파일**이다(가드 하나에 70–270 µs, 200개면 폼 생성 시점에 14–54 ms)(LANDING-026).

소유자(16라운드 답 2): "기본적으로 값에 대한 리셋이긴 한데요, 기존 사용방식을 참고해서 로드로 충분한지 검토해보세요. 불필요한 캐시 리빌드를 원하진 않습니다만, 사용자가 key를 사용한 리셋보다 효율적이고 안전한 방법을 얻길 바라긴 합니다"(LANDING-039)

【추론】 로드 뒤 `OnChange` 비트면 한 번 하는 검증(LANDING-041, ERROR-040, EVENT-032)은 `resetSubtree()`에는 그 하위 트리에만 적용한다(LANDING-041).

【추론】 `diagnostics`와 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화한다(LANDING-045). 【추론】 `setValue(V)`와 `resetSubtree()`는 초기화하지 않는다(LANDING-045).

### 1.3 이주 안내의 추가 기록

다음은 기록이다(LANDING-109). 편집자 결정(8라운드, `06-conclusions.md:429`; 목록)이 새로 올린 것: `find`의 터미널 별칭 제거(LANDING-020), 배열 `Merge`의 통째 교체(WRITE-015), 이력에 기대어 안정되던 스키마가 예산 초과가 되는 것(SETTLE-026), 비수렴 시 `default`가 모두 빠지는 것(SETTLE-011), 파생 필드의 문서와 코드 어긋남(WRITE-060), `injectTo`의 로드 동작(CONTROLS-084), 조건부 조각의 `default`가 동작하기 시작하는 것(SCHEMA-009)(확정 근거: 소유자 답, `reviews/round-10-owner-answers.md:20` D-7; 5.3의 (C)), `normalizedValue` → `outputValue`(LANDING-023), `computed` → `controls`(별칭 없음, LANDING-007)와 평면 `&키` 축약이 사라지고 제어 키는 `controls` 안에만 두는 것(LANDING-033), `push`의 `unlimited` 제거(SURFACE-005), README 1483행(LANDING-109). 주석 키워드(`title`, `description`, `format`, `default`·`controls.default`, `writeOnly`, `$comment`, `examples`)는 뒤가 앞을 덮는다(LANDING-109). 켜진 조각이 본체를, 전순서에서 나중 조각이 앞 조각을 덮는다(LANDING-109).

다음은 기록이다(LANDING-110). `const`/`enum` 자동 감지 제거와 `oneOfIndex`·`anyOfIndices` 제거(LANDING-004, LANDING-005), `&if`→`controls.active`(LANDING-006), `computed`→`controls`(별칭 없음, LANDING-007), `DisableSchemaDefaults`→`DisableAutomaticWrites`(06 문서상의 이름이라 코드 이주는 없음), `controls.unsetValue` 신설(평면 `&키` 축약은 사라졌다, LANDING-009, LANDING-033), `allOf` 안의 `if/then/else`가 병합되기 시작하는 것(LANDING-010), 분기 전환 때 공유 노드를 다시 채우지 않는 것(LANDING-011), 같은 노드의 표준 `readOnly`와 `&readOnly`가 택일(오늘은 표준 키가 이김)에서 OR로 바뀌는 것(LANDING-012), `allOf` 항목끼리 겹친 표준 `readOnly`가 먼저-승에서 OR로 바뀌는 것(LANDING-013), 공개 문서의 `derived` 레벨 약속을 에지로 고치는 것(LANDING-014)(LANDING-110).

### 1.4 파싱과 입력의 이주

확정(나)이며, parse는 뜻이 그대로인 변환만 한다(ajv 규칙 수준)(LANDING-125). 오늘 파서의 문자 제거, 정수 자르기, 빈 값 치환(`""`, `[]`, `{}`), 불리언의 진릿값 변환은 parse에서 뺀다(LANDING-125). 바꾸지 못한 값은 받은 그대로 들고 `value`·방출·제출이 모두 그 값이다(비우기·대체·거부 없음)(LANDING-125). 노드는 정합 상태(경고등)를 들고, 이것이 공개 형의 판별자다(이름과 모양은 SURFACE-061)(LANDING-125).

(2) 입력 구성 요소의 계약: 치다 만 글자는 입력이 들고, 빈 칸은 `undefined`, 비우기는 nullable이면 `null` 아니면 `undefined`를 보낸다(LANDING-125). 기본 수 입력(빈 칸에 `valueAsNumber`의 `NaN`)과 기본 불리언 체크박스(`defaultChecked={defaultValue ?? undefined}`)를 고친다(LANDING-125). (4) nullable이 아닌 노드의 `null`(서버의 NULL)이 더는 방출에서 빠지지 않아 검증기 있는 폼의 제출을 막는 사용성 변화의 문서화(LANDING-125).

【추론】 (4) nullable이 아닌 노드의 `null`은 바꾸지 않고 받은 그대로 방출된다(LANDING-125). 【추론】 경고등이 켜지고 경고가 가며, 검증기가 있으면 형 에러로 제출이 막힌다(LANDING-125). 【추론】 이 사용성 변화를 이주 항목(F27 확장, LANDING-125)과 PR-8 문서에 적는다(LANDING-125). 【추론】 해법은 스키마에 nullable을 적는 것이다(LANDING-125). 【추론】 값 규칙은 이미 닫혀 있고 문서화만 남았다(LANDING-125).

이주(LANDING-125): 단일 노드 파서(`parseNumber`는 숫자가 아닌 문자를 지우고 `Math.trunc`로 자름 `src/core/parsers/parseNumber.ts:31-39`, `parseBoolean`은 참 거짓 판정 `parseBoolean.ts:34-41`, `parseString(true)`는 `''` `parseString.ts:34-38`)는 공통 이주를 따른다(WRITE-075의 변환 목록, 실패는 값 보존과 경고등)(LANDING-125).

`onError` 기록의 level은 `warning`이다(LANDING-126). 값을 보존하므로 폼의 약속은 지켜진다(LANDING-126). error 층은 throw·거부·싱크로 드러나야 해 통보 3과 부딪힌다(LANDING-126). `SCHEMA_FORM_WARNING.TYPE_MISMATCH`를 노드의 정합 상태가 켜질 때마다 한 번 보낸다(path, 기대 형, 받은 값의 종류, 쓰기 출처)(LANDING-126, SURFACE-061). 소유자(12-7 답): "형변환 실패로 문제가 생기는 경우에 대한 대응은 FormType 이 하기로 했잖아. 그래서 개발단계에서는 중요한데, 리얼부터는 어쩔 수 없다고 생각하긴 해. warning 이면 되지않을까?"(LANDING-126) 반영 칸(설계서 메모 4): "게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`."(LANDING-126)

검증기가 있든 없든 보낸다(core의 parse가 찾는 것이라 검증 결과가 아니다)(LANDING-127).

이주(LANDING-145): 오늘은 흐림 때 원본을 잘린 값으로 덮고 `RequestRefresh`는 없다(`StringNode.ts:118-121`, `:43`, `value.ts:51`)(LANDING-145). 새 설계에서는 `finishInput` 칸이 자르고, 쓰기는 자동 쓰기다(LANDING-145). 바깥 오류와 dirty는 건드리지 않고(오늘과 같음), 같은 값이면 쓰지 않는다(LANDING-145). 자동 쓰기이므로 비제어 입력이 흐림 때 다시 마운트된다(오늘과 다름)(LANDING-145).

이주(LANDING-196): 기본 입력의 빈 칸과 초안은 오늘 문자열 입력이 글을 그대로 보내고(`src/formTypeDefinitions/FormTypeInputString.tsx:27-29`) 수 입력이 `valueAsNumber`를 보내며(`src/formTypeDefinitions/FormTypeInputNumber.tsx:22-24`), 새 설계에서는 REACT-027을 따라 빈 칸은 `undefined`이고 해석할 수 없는 초안은 흐려질 때 되돌린다(LANDING-196).

이주(LANDING-201): 입력의 `onChange(v, SetValueOption.Overwrite)`는 오늘 `Overwrite`에 든 `Refresh` 비트로 자기 입력을 다시 마운트하고(`src/core/types/value.ts:63,65`, `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:50-53,121`, `src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInputControl.ts:37`), 새 설계에서는 다시 마운트하지 않는다(LANDING-201).

### 1.5 재귀와 조건부 스키마의 이주

이주(LANDING-128): 재귀 객체 스키마의 실패 모양이 오늘의 `UNKNOWN_JSON_SCHEMA` 또는 스택 넘침에서 청사진 오류 `JSON_SCHEMA_ERROR.RECURSIVE_SHAPE_UNBOUNDED`(가칭)로 바뀐다(서지 않는 것은 같고, 명시적 코드가 생긴다)(LANDING-128).

이주(LANDING-131): `dependentSchemas`나 `dependencies`를 쓴 스키마에 개발 모드 경고가 새로 난다(LANDING-131).

이주(LANDING-132): 조건부 `required`가 있는 필드의 필수 표시는 오늘 늘 켜지고, 새 설계에서는 켜진 `then`에 따라 바뀐다(LANDING-132).

이주(LANDING-133): 같은 값인 객체·배열 `const`끼리의 `allOf`는 오늘 `JSONSchemaError`를 던지고, 새 설계와 레거시 모두에서 통과한다(결함 수정)(LANDING-133).

이주(LANDING-134): 여러 `pattern`의 `node.jsonSchema` 표현이 오늘의 `(?=a)(?=b)` 합성 문자열에서 첫 패턴과 `allOf`의 `{pattern}` 항목으로 바뀐다(LANDING-134).

이주(LANDING-135): 식에 쓴 `*` 조각이 청사진 오류가 된다(LANDING-135).

【추론】 이주(LANDING-207): 형 없는 객체 분기 `oneOf`·`anyOf`(pydantic·zod·OpenAPI·TypeBox)는 오늘 `UNKNOWN_JSON_SCHEMA`이고(`extractSchemaInfo.ts:23`), 새 설계에서는 object variant 호스트다(LANDING-207). 【추론】 pydantic `Optional[Self]`처럼 그 호스트가 게이트 없는 객체 프로퍼티 순환을 이루면 실패 코드가 `UNKNOWN_JSON_SCHEMA`에서 `RECURSIVE_SHAPE_UNBOUNDED`로 바뀐다(LANDING-207, LANDING-128).

【추론】 이주(LANDING-208): `type` 없이 `const`·`enum`만 있는 프로퍼티(OpenAPI 3.1·JSON Schema 2020-12 관용구, 수기 태그)는 오늘 `UNKNOWN_JSON_SCHEMA`이고(`extractSchemaInfo.ts:23`), 새 설계에서는 리터럴 종류의 원시 잎이다(LANDING-208).

### 1.6 union과 형 없는 스키마의 이주

이주(LANDING-129): 원시 타입 둘 이상의 `type` 배열(예 `['number','string']`, `['string','number','null']`)은 오늘 `UNKNOWN_JSON_SCHEMA`로 폼이 서지 않고, 새 설계에서는 `union` 잎과 문자열 입력으로 선다(사용자에게 보이는 변화)(LANDING-129). 이주(LANDING-129, 보충): `['string','number']`처럼 null 없는 두 형과 원소가 셋 이상인 `type` 배열은 오늘 `UNKNOWN_JSON_SCHEMA`이고(`src/helpers/jsonSchema/extractSchemaInfo/extractSchemaInfo.ts:25,28-29` → `src/core/nodes/schemaNodeFactory.ts:116`), 새 설계에서는 union 잎(+nullable)이며 기본 입력은 `{type:'union'}` 감싸개다(LANDING-129, REACT-033).

이주(LANDING-130): `['integer','number']`는 오늘 `UNKNOWN_JSON_SCHEMA`이고, 새 설계에서는 수 노드다(LANDING-130). 이주(LANDING-130): `['integer','number']`는 오늘 같은 오류이고(`extractSchemaInfo.ts:28-29`), 새 설계에서는 number 노드이며 `schemaType`은 `'number'`다(LANDING-130).

이주(LANDING-172): `['object','string']`·`['object','array']`·`['array','string']`은 오늘 `UNKNOWN_JSON_SCHEMA`이고(`extractSchemaInfo.ts:28-29` → `schemaNodeFactory.ts:116`), 새 설계에서는 터미널 강제 union이며 안쪽 `find`는 없고 `{}`·`[]`를 방출하려면 `omitEmpty: false`를 적는다(LANDING-172, BLUEPRINT-036).

이주(LANDING-173): `type`이 배열이고 `nullable:true`가 함께 있으면(`{type:['string'], nullable:true}` 같은 비 union 포함) 오늘은 배열 경로가 `nullable`을 보지 않고(`extractSchemaInfo.ts:24-34`), 새 설계에서는 `nullable: true`다(LANDING-173).

이주(LANDING-174): 형 없는 원시 `anyOf`·`oneOf`(TypeBox, pydantic, zod)는 오늘 `UNKNOWN_JSON_SCHEMA`이고(`extractSchemaInfo.ts:23`), 새 설계에서는 union·원시 잎(+nullable)이다(LANDING-174, BLUEPRINT-051).

이주(LANDING-175): 형 없는 칸의 분기가 모두 null 분기인 것(`{anyOf:[{type:'null'}]}`)은 오늘 같은 오류이고(`extractSchemaInfo.ts:23`), 새 설계에서는 nullable null 노드다(LANDING-175).

이주(LANDING-176): 형 없는 `{allOf:[{type:'string'}]}`는 오늘 병합 처리기가 없어 오류이고(`src/helpers/jsonSchema/processAllOfSchema/processAllOfSchema.ts:31-32`), 새 설계에서는 string 노드다(LANDING-176).

이주(LANDING-177): `['null','null']`은 오늘 nullable null 노드이고(`extractSchemaInfo.ts:28,30`), 새 설계에서는 `UNKNOWN_JSON_SCHEMA`다(LANDING-177).

이주(LANDING-178): nullable 기반에 붙은 형 없는 `allOf` 항목 `{nullable:false}`는 오늘 null을 빼고(`src/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/processSchemaType.ts:57,65-67`), 새 설계에서는 효과가 없다(LANDING-178).

이주(LANDING-179): `{type:['string','null'], allOf:[{type:['number','null']}]}`는 오늘 `ALL_OF_TYPE_REDEFINITION`이고(`winglet/json-schema/src/filters/isCompatibleSchemaType.ts:62-68`), 새 설계에서는 nullable null 노드다(LANDING-179).

이주(LANDING-180): `{type:'number', allOf:[{type:['number','string']}]}`는 오늘 `ALL_OF_TYPE_REDEFINITION`이고(`processAllOfSchema.ts:45-50` ← `validateCompatibility.ts:21-25` ← `isCompatibleSchemaType.ts:77-83`), 새 설계에서는 교집합인 number 노드다(LANDING-180).

### 1.7 파생 값과 상태 키의 이주

이주(LANDING-136): `omitEmpty`(기본 켜짐) 아래에서 `../name === ''` 같은 식은 `undefined`를 보게 되므로 `!../name`으로 고치거나 `omitEmpty`를 끈다(LANDING-136).

이주(LANDING-137): `controls.watch`의 `watchValues`도 `omitEmpty` 아래에서 빈 문자열을 `undefined`로 받는다(입력 구성 요소가 보는 변화)(LANDING-137).

이주(LANDING-138): `injectTo` 반환의 값이 `undefined`인 항목은 오늘 `undefined`로 덮어쓰고, 새 설계에서는 쓰지 않는다(LANDING-138).

이주(LANDING-152): `globalState`의 키는 오늘 루트에서만 비워지고, 새 설계에서는 참인 노드가 없으면 내려간다(LANDING-152).

이주(LANDING-153): `globalState`는 오늘 마지막으로 쓴 참인 값을 그대로 들고, 새 설계에서는 비불리언 상태 값도 `true`가 된다(LANDING-153).

이주(LANDING-163): 오늘은 노드의 모든 계산 속성이 한 의존 배열을 나눠(`ComputedPropertiesManager.ts:264-268`, `AbstractNode.ts:516-555`) `active`만 읽는 경로가 바뀌어도 `derived`를 다시 세고, 새 설계에서는 `derived`가 자기 의존 집합에서만 발화한다(LANDING-163).

이주(LANDING-166): 사용자 쓰기가 일으킨 `injectTo`가 null 조상을 객체로 만들던 동작(`ObjectNode/DETAIL.md:14,16`)이 사라져, 값은 null 조상 아래에 그려지지만 방출되지 않는다(LANDING-166). 이주 안내 항목(C8)으로 둔다(LANDING-166).

이주(LANDING-168): Form 속성의 잠금(`readOnly`·`disabled`)이 켜진 동안 입력의 `onChange`는 버려지며, 오늘은 노드 자신의 잠금만 버리고(`SchemaNodeInput.tsx:51`) Form 속성의 잠금은 입력 prop으로만 넘긴다(`:111-112`)(LANDING-168).

### 1.8 로드와 채움의 이주

이주(LANDING-139): 입력이나 `Merge`로 된 `null` 아래의 자식은 오늘 기본값 상태를 보이고(S4, `ObjectNode/DETAIL.md:19`), 새 설계에서는 채움 없이 없음이다(LANDING-139).

이주(LANDING-140): 입력이 넘긴 `Merge`는 오늘 `Refresh` 비트로 자기 입력을 다시 마운트하고(`value.ts:63`), 새 설계에서는 다시 마운트하지 않는다(LANDING-140).

이주(LANDING-141): `Overwrite | Merge`는 오늘 `Overwrite`로 동작하고(`value.ts:65`), 새 설계에서는 `INVALID_WRITE_OPTION`으로 던진다(ERROR-164 행의 이주 쪽)(LANDING-141).

이주(LANDING-144): 로드한 값이나 부모가 그 자리에 준 `{}`는 오늘 호스트 `default`를 막고(`AbstractNode.ts:1197-1199`), 새 설계에서는 `{}`여도 호스트가 `default`를 받는다(사용자에게 보이는 변화)(LANDING-144).

이주(LANDING-146): 오늘은 `batch`가 없고, `setValue`는 부른 자리에서 적용되며 updater도 그 자리의 `value`로 곧바로 계산된다(`AbstractNode.ts:355-364`)(LANDING-146). 새 설계에서 쓰기를 `batch(fn)`로 묶으면 updater는 오늘처럼 이어진다(+1 두 번이면 +2)(LANDING-146). 그러나 `fn` 안의 `value`·`outputValue`·`inactiveValues`·`getValue()`는 직전 커밋을 돌려준다(LANDING-146). 쓰기 직후 `value`를 읽어 다음 쓰기에 쓰던 코드를 `batch`로 옮기면 updater로 바꾼다(LANDING-146). 이주 안내 항목(C8)으로 둔다(LANDING-146).

이주(LANDING-155): `defaultValue`는 그 경로에 닿는 로드마다 새 로드 값이 되고, 배열 아이템은 구조 연산을 따라 자기 값을 지킨다(LANDING-155). 오늘 `defaultValue`는 노드가 생긴 뒤 바뀌지 않는다(`AbstractNode.ts:290-296`)(LANDING-155). `setValue`는 로드가 아니므로 `defaultValue` 게터와 `resetSubtree()`의 로드 스냅숏을 바꾸지 않는다(배열의 구조 연산이 스냅숏을 고치는 WRITE-085의 규칙은 그대로다)(LANDING-155).

이주(LANDING-164): 통째 쓰기가 아이템 키를 새로 만들지 않아 `dirty`·`touched`·바깥 오류·가상화 기록·컨테이너 입력의 비값 상태·소비자가 든 노드 참조가 위치를 따라가며, 오늘은 `clear` 뒤 전량 `push`라 모두 새로 시작한다(LANDING-164).

이주(LANDING-199): 호출자의 `setValue(V)`(`Overwrite`)는 오늘 브랜치에도 Refresh를 내어 하위 트리 전체를 다시 마운트하고(LANDING-042의 오늘 칸), 새 설계에서는 원본이 실제로 바뀐 노드만 다시 마운트한다(LANDING-199).

이주(LANDING-200): 호출자의 `setValue(null)` 뒤 자식 쓰기로 객체가 돌아오면 오늘은 null인 동안 자식이 든 기본값이 나타나고(`src/core/nodes/ObjectNode/DETAIL.md:19-20`), 새 설계에서는 채우지 않는다(LANDING-200).

이주(LANDING-202): 배열을 통째로 쓰는 `setValue`는 오늘 아이템을 다시 만들어 모두 채우고(탐침 P8, `reviews/raw-round18-tests/t1b-fill-consistency.md:116-133`), 새 설계에서는 위치로 이어 남은 아이템은 채우지 않고 뒤쪽에 새로 생긴 아이템만 채운다(NODE-051, WRITE-090)(LANDING-202).

- PR: PR-7(이주 점검)·PR-5(배열)(LANDING-203).
- 무엇: 세 장면(LANDING-200, LANDING-201, LANDING-202의 이주 행)을 오늘 코드와 새 구현에서 돌린다(LANDING-203).
- 통과: 오늘 결과가 T1-B의 탐침과 같고 새 결과가 이주 행대로다(LANDING-203).
- 실패: 다르면 이주 행을 고친다(LANDING-203).

### 1.9 값 비교와 출력의 이주

이주(LANDING-160): 오늘 `NumberNode.__equals__`의 근사 비교(`src/core/nodes/NumberNode/NumberNode.ts:28-38`, `isClose`)는 정확한 비교가 된다(LANDING-160).

이주(LANDING-161): `ObjectNode`의 키 순서를 무시하는 `equals`(`ObjectNode.ts:46-52`)는 키 순서를 보게 된다(LANDING-161).

이주(LANDING-162): 오늘 `ObjectNode.__equals__`가 쓰는 `@winglet/common-utils/object`의 `equals`(`packages/winglet/common-utils/src/utils/object/equals/equals.ts`)는 내장 객체(`Date` 등)를 내부 상태로, 클래스 인스턴스를 구조로 비교하며, 새 규칙 (가)는 이들을 참조로 본다(LANDING-162, SETTLE-043).

이주(LANDING-165): 닫힌 튜플 뒤의 값이 버려지지 않고 방출된다(LANDING-165).

이주(LANDING-171): 빈 중첩 객체·배열 노드의 `normalizedValue`는 오늘 `{}`·`[]`이고(`src/helpers/defaultValue/getEmptyValue/getEmptyValue.ts:8-14`, `src/core/nodes/AbstractNode/AbstractNode.ts:397-399`), 새 설계의 `outputValue`는 `omitEmpty`(기본 켜짐) 아래에서 `undefined`다(LANDING-171, VALUE-034). `node.value`(투영 전)는 오늘처럼 `{}`·`[]`이고, 부모의 값과 `FormHandle.getValue()`에는 오늘처럼 그 키가 없다(LANDING-171).

### 1.10 노드 탐색과 공개 사건의 이주

다음은 기록이다(LANDING-124).

| 항목 | 현재 | 새 설계 | 변화 | 근거 |
| --- | --- | --- | --- | --- |
| `NodeEventType` | 17종. 공개 서브셋 6종 | **3역할로 재정의** — 상태 통지 / `revision` 원장 / 명령 시그널. 17종 개별의 생사는 언급이 없다 | 재정의 + **미확인** | `core/types/event.ts:45-96` / EVENT-001 |
| 명령 어휘 | `RequestFocus`·`RequestSelect`·`RequestRefresh`·`RequestRemount`·`RequestEmitChange`·`RequestInjection` | 앞의 넷은 유지. 뒤의 둘은 **미확인** | 유지 + 미확인 | `core/types/event.ts:45-96` / EVENT-001 |
| 공개 훅 5종 | `useSchemaNodeTracker`·`useSchemaNodeSubscribe`·`useChildNodeComponentMap`·`useChildNodeErrors`·`useFormSubmit` | 언급 없음. `useSchemaNodeTracker`의 `useSyncExternalStore` 방식은 유지한다고만 적혀 있다 | **미확인** | `src/index.ts:78-84` / EVENT-001 |

**문서가 말하지 않는 것(미확인).**(LANDING-124) `Form` props 14개, `FormHandle` 8개, `NodeEventType` 17종의 개별 생사, `RequestEmitChange`/`RequestInjection`, `ValidationMode`, 공개 훅 5종, `oneOfIndex`/`anyOfIndices`의 대응물, `FormTypeInputProps.alias`, `placeholder`, `errorMessages`, `type: 'virtual'` 노드, `&` 계열의 root 폴백 우선순위, `default` 없는 키에 타입별 빈 값을 만들던 경로의 명시적 폐기(LANDING-124).

이주(LANDING-147): 가상 노드에 모양이 틀린 쓰기의 오류 클래스가 `JSONSchemaError`에서 `SchemaFormError`로 바뀌고, 길이가 같은 문자열을 글자로 쪼개던 동작은 거부로 바뀐다(LANDING-147).

이주(LANDING-148): 오늘 `find`는 꺼진 `oneOf` 변형의 노드를 돌려줄 수 있지만(`findNode.ts:69-85`, 첫 후보로 물러남), 새 설계는 `null`이다(LANDING-148).

이주(LANDING-149): 잎의 `options.terminal: false`와 가상의 `options.terminal: true`는 청사진 오류(가칭 `TERMINAL_OPTION_UNSUPPORTED`)이니 지운다(LANDING-149). 가상의 인라인 `FormTypeInput`은 그대로 그려지며 `ChildNodeComponents`를 받고(오늘은 비워짐), `node.strategy`는 `'branch'`이고 `isTerminalNode(가상)`은 참에서 거짓으로 바뀐다(오늘 `group`은 `'terminal'`)(LANDING-149).

이주(LANDING-154): 오늘의 `node.key`·`node.schemaPath`는 새 설계에 없다(LANDING-154).

이주(LANDING-156): `find('@')`·`findAll('@')`는 오늘 맥락 노드를 돌려주고, 새 설계에서는 `null`·빈 배열을 돌려준다(LANDING-156).

이주(LANDING-157): 공개 형 `NodeState`의 이름이 `SchemaNodeState`로 바뀐다(LANDING-157).

이주(LANDING-158): 공개 이벤트 형 `NodeEventType`의 이름이 `SchemaNodeEventType`으로 바뀐다(LANDING-158).

이주(LANDING-167): 인라인 `FormTypeInput`을 둔 가상 노드 아래 경로의 `find`는 오늘 그 가상 노드를 돌려주고(오늘 가상의 인라인 입력은 `'terminal'`이고 `findNode`는 터미널에 닿으면 남은 경로를 무시한다), 새 설계에서는 참조된 노드를 돌려준다(LANDING-167).

이주(LANDING-169): 루트 수준 검증 오류의 공개 `dataPath`가 `'/'`에서 `''`로 바뀐다(LANDING-169).

【추론】 (1) `RequestEmitChange`·`RequestInjection`은 새 설계에 없다(LANDING-170). 【추론】 둘 다 오늘의 이벤트 사슬 전파가 쓰던 내부 비트다(`BranchStrategy.ts:145`, `AbstractNode.ts:974-977`)(LANDING-170). 【추론】 새 설계에서는 방출과 `controls.injectTo`가 정착 루프의 구조(작업 루프의 커밋과 파생 단계)이며, "전파와 통지가 옵션이 아니라 구조"다(LANDING-170, GOAL-075). 【추론】 오늘 공개 `NodeEventType`(=`PublicNodeEventType` 여섯, `src/core/types/event.ts:85-92`, `src/index.ts:44`)에 없고 소비자가 publish할 수도 없으므로(`reviews/round-5-derivations.md:22` C-11) 이주 행은 두지 않는다(LANDING-170).

소유자(18C 검토 5번, `reviews/round-18-owner-answers.md:27`): "브레이킹 체인지를 할거라 제거되는 명령은 없애버려도 됩니다."(LANDING-170)

소유자(설계서 메모 3, `reviews/round-18-owner-answers.md:40`): "publish 가 없어진건.. 자의적으로 이벤트를 호출할 수 없어서 좀 그렇긴 한데, 이 4개 기능을 4개로 분할해서 두지 말고 하나의 메소드에 여러 행위 타입을 파라미터로 받아서 행동하게 해줘. 이전에는 publish 에 섞여있어서 메소드로 안보였는데, 이걸 별도 메소드로 빼니까 node 의 정체성이 좀 깨지는걸 action 이나 interaction 이나 뭐든.... publish 를 부활시키던가..."(LANDING-170)

【추론】 (2) LANDING-124가 든 공개 훅 가운데 REACT-006이 다루지 않은 셋, `useChildNodeComponentMap`·`useChildNodeErrors`·`useFormSubmit`은 이름과 시그니처를 유지한다(`src/index.ts:82-84`)(LANDING-170). 【추론】 `useChildNodeComponentMap`은 `ChildNodeComponents`의 `field`만 쓰는 렌더 계층 도우미라 그대로 둔다(LANDING-170). 【추론】 `useChildNodeErrors`는 PR-7에서 새 통지(`UpdateChildren`에 대응하는 형상 변경, `UpdateState`, EVENT-068의 `UpdatePath`)로 다시 구현하며, 반환형의 `JSONSchemaError`는 `ValidationIssue`로 바뀐다(LANDING-170, LANDING-024, LANDING-070). 【추론】 `useFormSubmit`은 `FormHandle.submit`의 `subscribe`·`pending` 위에 서 있고, `degraded` 동안 제출 거부 경로로 이미 새 설계에 쓰였으므로(ERROR-159) 유지한다(LANDING-170). 【추론】 이 결정은 명령 둘과 훅 셋에 한정한다(LANDING-170). 【추론】 같은 원문의 나머지 미확인(`Form` props 14, `FormHandle` 8, `NodeEventType` 17종의 개별 생사, `ValidationMode`, `oneOfIndex`/`anyOfIndices`, `type: 'virtual'`, root 폴백, 빈 값 경로)은 이 행의 범위가 아니며, `alias`·`placeholder`·`errorMessages`는 CONTROLS-081이 닫는다(LANDING-170).

### 1.11 공개 형과 입력 계약의 이주

이주(LANDING-181): `Hint.type`·`FormTypeInputProps.type`은 오늘 `node.schemaType`이고(`src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInput.ts:70`, `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:124`), 새 설계에서는 `node.type`이며 정수 노드는 `'integer'`에서 `'number'`로 바뀌고 새 칸 `schemaType`이 생긴다(`reviews/round-18-owner-answers.md:36`)(LANDING-181).

이주(LANDING-182): `{type:['number','integer']}` 시험(코어 `src/formTypeDefinitions/FormTypeInputNumber.tsx:44`, antd5·antd6 Number `:62`·Slider `:53`, antd-mobile Number `:51`, mui Number `:120`)은 새 설계에서 `{type:'number'}`이고, 정수만이면 `{schemaType:'integer'}`다(LANDING-182).

이주(LANDING-183): 함수 시험의 `type === 'integer'` 절(antd5·antd6 RadioGroup `:86`, antd-mobile RadioGroup `:91`·Slider `:59`, mui RadioGroup `:125`·Slider `:114`)은 죽은 조건이므로 지운다(TS2367로 드러남)(LANDING-183).

이주(LANDING-184): mui 수 입력은 오늘 빈 칸이 `null`이고(`schema-form-mui-plugin/src/formTypeInputs/FormTypeInputNumber.tsx:74-76`), 정수를 `type === 'integer'`로 판정해 `parseInt`로 자르며(`:81`), `step`을 쓴다(`:109`)(LANDING-184). 새 설계에서는 빈 칸이 `undefined`, 판정은 `schemaType === 'integer'`, 자르지 않음, 해석할 수 없는 글은 초안이다(LANDING-184, REACT-027, WRITE-075).

이주(LANDING-185): `FormTypeTestObject` 형 선언은 오늘 `type: JSONSchemaType | JSONSchemaType[]`이고(`src/types/formTypeInput.ts:163`), 새 설계에서는 `type: SchemaNodeType | SchemaNodeType[]`와 새 키 `schemaType`이다(LANDING-185).

이주(LANDING-186): 시험 객체의 모르는 키는 오늘 모든 키를 비교해 `{typo: undefined}`가 우연히 맞고(`src/helpers/formTypeInputDefinition/formTypeInputDefinitions.ts:44-58`), 새 설계에서는 대조에서 빼고 개발 모드 경고를 낸다(LANDING-186, REACT-033).

이주(LANDING-187): 코어 기본 입력 정의는 오늘 열 개이고(`src/formTypeDefinitions/index.tsx:14-25`), 새 설계에서는 `{type:'union'}` 감싸개를 더해 열한 개다(LANDING-187).

이주(LANDING-188): 가드 `isTerminalNode`·`isBranchNode`는 오늘 `node.group`을 보고(`src/core/nodes/filter.ts:77,198`) `isTerminalNode`의 반환 형은 `BooleanNode | NumberNode | StringNode | NullNode`이며(`:197`), 새 설계에서는 `strategy`를 보고 반환 형에 `UnionNode`가 더해지며 좁힌 뒤 `switch (node.type)`에 `case 'union'`이 필요하다(LANDING-188, NODE-058).

이주(LANDING-189): `InferValueType`의 `as const` `type` 배열은 오늘 `any`이고(`src/types/value.ts:10-15`), 새 설계에서는 정확한 합 형이며 새 형 오류가 날 수 있다(LANDING-189).

이주(LANDING-190): `InferJSONSchema<A|B>`는 오늘 분배되어 `StringNode | NumberNode`이고(`src/types/jsonSchema.ts:40-88`), 새 설계에서는 `UnionSchema`와 `UnionNode`다(LANDING-190).

이주(LANDING-191): `SchemaNode` 합집합과 `FormTypeRendererProps.type`에는 오늘 `UnionNode`와 `'union'`이 없고(`src/types/formTypeRenderer.ts:21`), 새 설계에서는 망라 `switch`에 `case 'union'`을 더한다(LANDING-191).

### 1.12 검증기와 오류 처리의 이주

이주(LANDING-192): `coerceTypes`·`useDefaults`·`removeAdditional`을 켠 ajv 인스턴스의 `bind`는 오늘 받아들이고 살아 있는 폼 값이 제자리에서 바뀌며(`schema-form-ajv8-plugin/src/default/validatorPlugin.ts:46`, `src/core/nodes/AbstractNode/AbstractNode.ts:718`, `schema-form-ajv8-plugin/src/validator/createValidatorFactory.ts:23-25`), 새 설계에서는 `bind`가 `VALIDATOR_BIND_REFUSED`를 던지므로 폼에는 값을 바꾸지 않는 인스턴스를 따로 만들어 넘긴다(`reviews/round-18-owner-answers.md:34`)(LANDING-192).

이주(LANDING-193): 검증기에 넘기는 스키마 사본은 오늘 얕고(`createValidatorFactory.ts:19-22`, `src/helpers/jsonSchema/stripSchemaExtensions/stripSchemaExtensions.ts:32-36`), 새 설계에서는 깊은 사본을 한 번 만든다(`reviews/round-18-owner-answers.md:34`)(LANDING-193).

이주(LANDING-194): ajv8에서 union `type`은 오늘 `strictTypes` 로그 경고를 내고(`schema-form-ajv8-plugin/src/default/validatorPlugin.ts:15-19`에 `strict` 없음, `node_modules/ajv/lib/core.ts:250`의 기본 `"log"`), 새 설계에서는 경고가 없다(`allowUnionTypes`, VALIDATE-051)(LANDING-194).

이주(LANDING-195): 터미널 아래 경로의 검증 에러는 오늘 버려지고(`src/core/nodes/AbstractNode/utils/ValidationManager/ValidationManager.ts:150`), 새 설계에서는 터미널(union) 노드가 받는다(LANDING-195, VALIDATE-051).

이주(LANDING-197): 터미널 object·array 값 안의 JSON 부정합은 오늘 검사가 없고, 새 설계에서는 개발 모드 경고 `NON_JSON_WHOLE_VALUE`를 낸다(LANDING-197, VALIDATE-051).

### 1.13 플러그인 이주와 차이 점검

자사 플러그인 수정 목록은 PR-7 뒤의 플러그인 PR이 한다: antd·mui 수 입력의 비우기 값과 부분 해석, 스위치의 무효 표지, 문자열 체크박스와 범위 입력의 `Array.isArray` 막기(LANDING-151, LANDING-206).

반영 칸(개발계획 P1): "UI 플러그인 넷(antd5·antd6·antd-mobile·mui)의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR(우산 순서 N+1, PR-7 뒤)이 한다."(LANDING-151, LANDING-198)

이주 표의 행 LANDING-181–LANDING-186과 이주 점검은 PR-7에 남고, 자사 플러그인마다의 union 항목은 플러그인 PR이 한다(LANDING-151, LANDING-198, LANDING-206).

【추론】 바뀌지 않는 것: `['object','null']`은 nullable object이고, `['null']`은 null 노드다(LANDING-198). 【추론】 바뀌지 않는 것: `[]`와 `['string','string']`은 오류다(LANDING-198). 【추론】 바뀌지 않는 것: `{type:'number', allOf:[{type:'integer'}]}`와 `{type:'integer', allOf:[{type:'number'}]}`의 `schemaType`은 `'integer'`다(`processSchemaType.ts:73`, `isCompatibleSchemaType.ts:90-93`)(LANDING-198). 【추론】 바뀌지 않는 것: `{type:'string', allOf:[{type:['string','null']}]}`는 nullable이 아닌 string이다(LANDING-198). 【추론】 바뀌지 않는 것: 서로소인 정적 선언(`{type:'string', allOf:[{type:'number'}]}`)은 `ALL_OF_TYPE_REDEFINITION`이다(LANDING-198). 【추론】 바뀌지 않는 것: union이 아닌 모든 노드의 `schemaType` 값(LANDING-198).

- PR: PR-7(이주 점검), 시험은 각 줄의 PR(청사진 PR-1, 행 PR-2, 검증기 PR-4, 렌더 PR-7)(LANDING-198).
- 무엇: 이주 행마다 오늘 동작과 새 동작을 시험으로 대조하고, 자사 플러그인(antd5·antd6·antd-mobile·mui·ajv6·7·8)의 수정 목록을 LANDING-151과 대조한다(LANDING-198).
- 통과: 오늘과 다른 곳마다 이주 행이 있고, 시험 목록의 모든 줄이 통과한다(LANDING-198).
- 실패: 빠진 이주 행을 더하고, 시험이 규칙과 어긋나면 해당 블록(NODE-058, BLUEPRINT-044, WRITE-093, REACT-033)을 고친다(LANDING-198).

### 1.14 개발 단계와 전환 방식

**배포는 한 번, 개발은 나눈다.**(LANDING-051) 모든 패키지가 함께 메이저 버전급으로 올라가고(목표 C7(확장 계약의 재설계), GOAL-020) 호환 계층을 두지 않으므로(GOAL-022), `master`로의 병합은 우산 브랜치(`1.0.0-beta`, LANDING-204) 하나가 한 번에 한다(LANDING-051). 그 안에서는 개발 PR 여섯(기반+청사진, 노드 트리·정착, 파생+상태 키·제어, 통지·검증, 배열, 전환)으로 나누고 자식 PR의 순서는 설계·설계문서 → 개발 여섯 → 플러그인 → 정리·릴리스이며, 각 PR은 새 코드와 그 테스트만으로 독립 검증된다(LANDING-051, LANDING-204).

**옛 코드는 레거시로 옮기고 새로 쓴다(17라운드 소유자 답).**(LANDING-052) PR마다 대상 영역의 옛 코드를 레거시 디렉토리로 옮기고 새 코드를 쓴다(LANDING-052). 쓸 만한 코드와 함수는 가져오고 나머지는 버린다(LANDING-052). 옛 이름과의 중복은 기준이 아니다(소유자: "그러니 이름 중복은 걱정하지 않아도 됩니다")(LANDING-052).

새 엔진은 전환 PR 전까지 `<Form>`과 `nodeFromJSONSchema`에 닿지 않으며, 옛 코드와 새 코드는 상태 소유 방식이 달라 한 트리 안에서 공존할 수 없으므로(antigravity 검토와 같은 판단) 점진 교체는 하지 않는다(LANDING-053).

**문서가 코드보다 먼저 바뀐다**(filid 규칙)(LANDING-055). 각 PR은 새 fractal의 `INTENT.md`·`DETAIL.md`로 시작한다(LANDING-055). 이름은 책임을 말하는 것으로 짓는다(LANDING-055).

**원샷이어야 하는 것은 둘뿐이다.**(LANDING-058) 전환 PR(PR-7)과 `master` 병합(릴리스)(LANDING-058). 나머지는 독립이다(LANDING-058). 전체를 원샷으로 진행할 필요는 없다(LANDING-058).

【추론】 레거시 디렉토리는 `src/__legacy__/`다(LANDING-159). 【추론】 옮기는 파일은 원래의 `src/` 아래 상대 경로를 그대로 둔다(`src/core/nodes/` → `src/__legacy__/core/nodes/`)(LANDING-159). 【추론】 import는 별칭 접두만 바꾼다(`@/schema-form/core/nodes` → `@/schema-form/__legacy__/core/nodes`)(LANDING-159). 【추론】 PR마다 그 PR이 새로 쓰는 영역의 옛 파일만 옮긴다(LANDING-159). 【추론】 예를 들어 PR-2는 `src/core/nodes`, 그것이 가져오는 `src/core/parsers`(→ `src/__legacy__/core/parsers/`), 옛 `src/core/__tests__`를 옮긴다(LANDING-159). 【추론】 이것으로 새 `src/core/__tests__/scenarios/` 자리가 빈다(LANDING-159). 【추론】 옛 노드는 PR-7까지 오늘의 parse 동작을 지키고 새 parse(NODE-056)를 가져오지 않으므로, 아래 규칙 2의 허용 목록은 바뀌지 않는다(LANDING-159).

【추론】 규칙 1: 새 fractal(PR-1부터 새로 쓴 것)은 `__legacy__`를 가져오지 않는다(LANDING-159). 【추론】 규칙 1은 파일 한정 ESLint `no-restricted-imports`로 막고 PR-1에서 건다(LANDING-159). 【추론】 규칙 2: 레거시 → 새 코드는 LANDING-061이 이미 적은 곳만 허용한다(예: 옛 `intersect*Schema`가 새 잎 교차 함수를, 옛 소비자가 청사진으로 옮긴 식 컴파일러를 가져온다)(LANDING-159). 【추론】 규칙 3: `src/core/index.ts`와 `src/index.ts`는 PR-7까지 옛 엔진을 가리킨다(LANDING-159). 【추론】 새 엔진은 PR-7 전까지 `<Form>`에 닿지 않는다(LANDING-159). 【추론】 규칙 4: PR-7은 진입점을 새 엔진으로 바꾼다(LANDING-159). `src/__legacy__/`는 PR-8까지 참고용으로 보존하고, PR-7은 진입점 전환과 레거시 import 0 점검만 하며, 삭제는 PR-8이 한다(LANDING-159, LANDING-205).

반영 칸(개발계획 P2): "`src/__legacy__/`는 PR-7이 지우지 않고 정리·릴리스 PR(PR-8)까지 참고용으로 보존한다."(LANDING-159)

【추론】 PR-7의 점검은 새 코드가 레거시를 가리키는 import가 0인 것이고, `src/__legacy__/`는 PR-8까지 보존하며 디렉토리 삭제는 PR-8이 한다(LANDING-159, LANDING-205). 【추론】 빌드와 공개 진입점에서 따로 뺄 설정은 두지 않는다(LANDING-159). 【추론】 rolldown은 `src/index.ts`가 닿는 것만 묶는다(LANDING-159). 【추론】 그 사이의 산출물은 옛 엔진이고, 우산 브랜치는 PR-8 전에 배포하지 않으며, 디렉토리는 PR-8이 지운다(LANDING-159, LANDING-205).

【추론】 이름을 `__legacy__`로 하는 것은 filid 분류 규칙 (3)으로 organ이 확정되어 설계의 fractal로 읽히지 않기 때문이다(LANDING-159). 【추론】 저장소의 `__tests__` 관례와 모양이 같다(LANDING-159). 【추론】 `src` 안에 두면 tsc·eslint·Storybook의 포함 규칙과 `@/schema-form` 별칭이 설정 변경 없이 따라간다(LANDING-159). 【추론】 저장소 filid 설정(`.filid/config.json`)은 `max-depth`를 severity `error`, `maxDepth: 14`로 건다(LANDING-159). 【추론】 가장 깊은 `src` 디렉토리가 저장소 뿌리에서 13단이므로 `__legacy__`를 끼우면 14단이다(LANDING-159). 【추론】 PR-1 점검에 "filid `max-depth` 통과. 실패하면 `src/__legacy__/**`를 예외로 두는 설정 변경을 같은 PR에서 한다"를 둔다(LANDING-159).

【추론】 옛 코드와 함께 사는 `__tests__`는 코드와 함께 옮겨지고, PR-7까지 그대로 돈다(LANDING-159). 【추론】 `<Form>`이 쓰는 옛 엔진을 지키는 것이다(LANDING-159). LANDING-205 뒤에는 PR-7이 진입점을 새 엔진으로 바꾼 뒤 레거시 안의 옛 단위 시험을 시험 글롭에서 빼 두고(옛 엔진은 더 `<Form>`에 닿지 않는다), 디렉토리와 함께 PR-8이 지운다(LANDING-159). 【추론】 TEST-013의 처분은 파일마다 한다(LANDING-159). 【추론】 "그대로 산다"는 단위가 새 자리로 옮겨 가는 PR에서 함께 새 자리로 간다(레거시가 아님)(LANDING-159). 【추론】 "버리고 새로 쓴다"는 레거시로 옮겨 돌다가, 그 상황 목록이 대체 PR의 데이터 모듈로 옮겨진 뒤 PR-8에서 디렉토리와 함께 지운다(LANDING-159, LANDING-205). 【추론】 "표면만 고친다" 렌더 시나리오 17파일과 `src/__tests__`의 나머지는 `<Form>`을 시험하므로 자리를 지키다가 PR-7에서 처분한다(LANDING-159). 【추론】 PR-0의 세 프로젝트 글롭(`unit`·`render`·`storybook`)이 `src/__legacy__/**`를 포함한다(LANDING-159).

【추론】 옛 스토리(`stories/`)는 `../src`의 진입점으로 옛 엔진을 그리므로 PR-7까지 그대로 돈다(LANDING-159). 【추론】 새 문법의 시나리오 스토리는 `<Form>`이 새 엔진을 쓰는 PR-7부터 그릴 수 있다(LANDING-159). 【추론】 PR-7이 TEST-025대로 옛 스토리를 정리한다(16라운드 답 4 "전체 정리 허용")(LANDING-159). 【추론】 옛 엔진의 마지막 벤치 기준선(`bench:baseline`)은 PR-2가 `core/nodes`를 옮기기 전에 잰다(LANDING-159).

인접 단계 합침 둘을 채택한다: 기반(PR-0의 코드 부분)과 청사진(PR-1)은 한 PR, 파생(PR-3)과 상태 키·제어(PR-6)는 한 PR(LANDING-204). 개발 PR은 여섯이다: 기반+청사진, 노드 트리·정착(PR-2), 파생+상태 키·제어, 통지·검증(PR-4), 배열(PR-5), 전환(PR-7)(LANDING-204). 우산 PR(`1.0.0-beta`, #344)의 자식은 설계 PR·설계문서 PR → 개발 PR 여섯 → 플러그인 PR → 정리·릴리스 PR(PR-8)이며 모두 `1.0.0-beta`를 base로 열고 merge commit으로 들어온다(LANDING-204, LANDING-058). 원장의 단계 정의(LANDING-060–068)는 바뀌지 않는다(LANDING-204). 릴리스 전환 PR(LANDING-097)의 시점은 소유자가 정한다(LANDING-204).

소유자(개발계획 P3·P4): "이외 권장대로."(LANDING-204)

소유자(개발계획 1-가): "1-가"(LANDING-204)

반영 칸(개발계획 1-가): "기반 PR과 병렬이며 코드 PR을 막지 않는다."(LANDING-204) 자식 순서의 "설계 PR·설계문서 PR → 개발 PR 여섯"에서 설계문서 PR은 순차가 아니라 병렬이다(LANDING-204).

### 1.15 코어의 자리와 교체 범위

새 core의 자리와 이름은 17라운드에 정했다(소유자 확정, 구조와 규칙은 NODE-001, NODE-009, NODE-010)(LANDING-056).

- `src/core/blueprint/`(PR-1): 청사진(LANDING-056).
- `src/core/record/`: 레코드(LANDING-056). `SchemaNodeRecord` 형, 행 계약 `Behavior`, `SchemaNodeFactory` 형, `SchemaNodeRuntime` 형(LANDING-056).
- `src/core/behaviors/`: 표 `BEHAVIORS`(`BEHAVIORS[type][strategy]`)와 종류 모듈 `stringBehavior/`·`numberBehavior/`·`booleanBehavior/`·`nullBehavior/`·`virtualBehavior/`(LANDING-056). 종류 모듈 목록에 `unionBehavior/`가 더해진다(LANDING-056, BLUEPRINT-043, BLUEPRINT-035). `objectBehavior/`와 `arrayBehavior/`는 안에 `branch/`·`terminal/`·`utils/`를 둔다(LANDING-056).
- `src/core/navigation/`: `find`·`findNodes`와 트리 걷기(LANDING-056).
- `src/core/settle/`(+`settle/derive/`), `src/core/dispatch/`, `src/core/validation/`(LANDING-056).
- `src/core/SchemaNode/`: 공개 겉면, 클래스 `SchemaNode`(LANDING-056).
- 행의 칸은 `interpret`(입력 해석), `assemble`(합성), `project`(투영), `finishInput`(입력 마침), `declareChildren`, `type`, `strategy`이고, 종류별 데이터 칸은 `structure`다(LANDING-056). `declareChildren`은 자식 선언 목록만 돌려준다(LANDING-056). 생성은 `settle`이 런타임의 `nodeFactory`로 한다(LANDING-056). 행은 계산만 한다(LANDING-056). 노드 필드 `runtime`은 트리마다 하나인 `SchemaNodeRuntime`(통지 대기열, 검증기, 진단, 진입 깊이와 예산, `nodeFactory`, `onError` 보고기)을 가리키고, 모듈 수준 생성 함수는 `schemaNodeFactory`다(LANDING-056).

겉면 규칙: 클래스는 필드·게터·문장 하나짜리 위임만 두며 분기·반복·종류 비교를 두지 않고 노드마다 할당하지 않는다(LANDING-057). 멤버 목록은 시험으로 고정하고, 여러 단계의 조율은 `dispatch`의 동사별 진입이 맡는다(LANDING-057). behaviors 규칙: 종류마다 fractal, 여덟 줄을 넘는 칸과 그 종류만의 보조는 그 종류의 `utils/`, 두 전략이 함께 쓰는 것은 그 종류의 `utils/`, 두 종류 이상이 쓰는 것은 `behaviors/utils/`에 두고, 행은 칸을 모두 같은 순서로 갖는다(LANDING-057).

**교체 규모.**(LANDING-069) `src/core` 178파일 9,884줄 가운데 `AbstractNode`(71파일 3,991줄, 계산 속성·검증 매니저·이벤트 캐스케이드)와 `ObjectNode`의 `BranchStrategy`(39파일 2,185줄), `ArrayNode` 전략(15파일 930줄), 오늘의 `schemaNodeFactory`(노드마다 넘기는 공장)가 교체 대상이다(LANDING-069). 새 모듈 수준 생성 함수도 이름이 `schemaNodeFactory`이며 공장은 트리마다 하나다(옛 이름과의 중복은 기준이 아니다, LANDING-052)(LANDING-069). `helpers` 134파일 6,087줄 가운데 `jsonPointer`와 가상화는 그대로 쓰고, 교차 연산은 잎 함수만 옮겨 쓰며(LANDING-061), 식 컴파일러는 청사진으로 통째로 옮긴다(LANDING-069, LANDING-061). 테스트 234파일의 처분은 TEST-013을 따른다(17파일은 단언을 살린다, 16라운드 답 7)(`renderForm` 하니스는 재사용)(LANDING-069).

**형제 패키지.**(LANDING-070) ajv 플러그인 셋은 `ValidatorPlugin`·`ValidateFunction`·`JSONSchema`·`JSONSchemaError`·`SchemaFormPlugin` 타입을 가져오며(`JSONSchemaError`는 LANDING-024에 따라 `ValidationIssue`로 바뀐다) 모두 `$async: true`로 컴파일하므로, PR-4에서 동기 `compileGuard(root, pointer)` 경로를 세 플러그인에 구현해야 한다(캐시는 코어가 든다)(타입만 맞추면 되는 것이 아니다. 16라운드 정착 검토)(LANDING-070). UI 플러그인 넷은 `FormTypeRendererProps`뿐 아니라 `FormTypeInputDefinition`(11–19회)·`FormTypeInputPropsWithSchema`(8–15회)·스키마 타입을 가져오고, 27파일이 `jsonSchema.options.*`와 맨 키(`formType`·`radioLabels`·`switchLabels`·`switchSize`·`lazy`·`ampm`·`minRows`·`maxRows`)를 읽으며(mui 7/19, antd5 9/22, antd6 9/22, antd-mobile 2/14), 노드 표면 `push`·`remove`·`maxItems`·`length`도 쓴다(LANDING-070). 그래서 PR-7의 UI 플러그인 이주는 타입과 등록 키 넷을 포함하고, 스키마 읽기 27파일을 옮기는 UI 플러그인 넷의 `presentation.*` 이주는 PR-7이 아니라 플러그인 PR(우산 순서 N+1)이 하고 PR-7은 기본 입력으로 검증한다(LANDING-070, LANDING-034, LANDING-035, LANDING-040, LANDING-206). `@winglet/react-utils`의 ErrorBoundary와 감싸개 둘에는 렌더 때 보고 함수를 얻는 선택 인자를 더한다(주지 않으면 오늘 동작, 소유자 허용, 17라운드 스웜 수렴(편집자 결정), ERROR-115)(LANDING-070).

LANDING-081–LANDING-087 표의 '그대로 쓰는 것'은 가져오는 코드의 목록이다(LANDING-089).

- `extras` 정적 규칙은 스캐너의 `keyword`·`variant`·`dataPath`로 구현 가능하다(LANDING-122). 조각 표를 만드는 걸음에서 함께 뽑고, `$ref` 순환은 스캐너가 `referenceSkipped: 'cycle'`로 알린다(LANDING-122).
- 유효 스키마 메모는 노드 위치마다 덧씌움 후보를 전순서로 매기고 활성 부분집합을 비트 집합으로 키한다(LANDING-122). 후보에 `controls.children` 항목과 조각의 `controls`까지 넣어야 "같은 집합이면 같은 참조"가 참이 된다(추정, 비용은 재지 않았다)(LANDING-122).

"**메모.** 유효 스키마는 활성 덧씌움 집합(그 노드에 얹힌 켜진 조각들의 집합)마다 메모한다. 같은 집합이면 같은 참조를 돌려준다."(LANDING-122, BLUEPRINT-021)

### 1.16 기반과 청사진의 착수

(LANDING-060, LANDING-090, PROCESS-061, PROCESS-062, PROCESS-026)

| PR | 내용 | 의존 | 착수 전 닫을 것 |
| --- | --- | --- | --- |
| PR-0 문서 | 08·09와 옛 ADR은 백업 디렉토리로 가고 설계문서와 ADR은 원장에서 새로 만들며 소유자의 절 단위 통과는 새 설계문서에서만 한다(PROCESS-061, PROCESS-062). 프로토타입 v7(게이트 입력의 `extras` 정적 규칙, 같은 순위 동점·정착 단위 순위, 나감 에지, 전이 라운드 상한, 재계산 목록만 순회). 시나리오 패키지 `@aileron/schema-form-scenarios`의 뼈대, vitest `test.projects` 셋, addon-vitest(LANDING-090) | 없음 | 소유자의 O-1 – O-11 답, 절 단위 통과는 새 설계문서에서만 하고 08·09는 통과 절차 없이 백업으로 간다(PROCESS-062), 18라운드 정련(PROCESS-026) |

【추론】 PR-0의 세 프로젝트 글롭(`unit`·`render`·`storybook`)이 `src/__legacy__/**`를 포함한다(LANDING-060).

반영 칸(개발계획 1-가): "설계문서 8편·ADR 재작성·역검사 `doc-coverage`·옛 문서의 `_archive/` 이동·소유자 절 단위 통과는 별도 설계문서 PR로 `1.0.0-beta`에 연다."(LANDING-060)

반영 칸(개발계획 1-가): "기반 PR과 병렬이며 코드 PR을 막지 않는다."(LANDING-060)

(LANDING-090, TEST-008, TEST-009, TEST-023, TEST-049)

| PR | 더해진 것 |
| --- | --- |
| PR-0 | 시나리오 데이터 모듈의 형(`FormScenario`)과 코어 러너·화면 어댑터 `playScenario`의 뼈대(시나리오 감싸개와 핸들 등록 포함), vitest `test.projects` 셋, addon-vitest 설치, 옛 스토리의 처분 목록, 패키지 `CLAUDE.md`의 'Render-Level Test Harness' 절 개정(신규 시나리오의 자리와 파일당 상한을 TEST-008·TEST-009·TEST-023에 맞춘다), 비공개 패키지 `@aileron/schema-form-scenarios`의 생성(TEST-023), 릴리스 전환 PR 뒤라면 `test.yml`에 vitest 세 프로젝트와 playwright chromium 단계(TEST-049) |

(LANDING-061, SCHEMA-007, BLUEPRINT-016, PROCESS-027, CONTROLS-079, ERROR-164, LANDING-159, LANDING-205, SCHEMA-043)

| PR | 내용 | 의존 | 착수 전 닫을 것 |
| --- | --- | --- | --- |
| PR-1 청사진 | 순수 함수 `blueprint`: 조각 표와 전순서, 노드 공유, `controls.discriminator` 변환(끌어올림 포함), 유효 스키마 병합 함수(SCHEMA-007 병합표는 새로 쓴다. 렌더 계층이 넘긴 판정으로 정하는 원자(React 요소, ref 모양)와 한쪽 값의 참조 이동은 `@winglet/common-utils` `merge`의 선택 인자(배열 교체, 원자 판정, 참조 이동. 양쪽에 있는 객체는 새 객체에 병합한다: 쓰기 시 복사. 인자가 없으면 오늘 동작, changeset `minor`)로 쓴다(17라운드 스웜 수렴(편집자 결정)). 오늘의 교차 연산은 먼저 승·얕은 덮어쓰기·무조건 throw라 SCHEMA-007과 다르므로 잎 교차 함수 `intersectEnum`·`intersectConst`·`intersectMinimum`·`intersectMaximum`·`intersectMultipleOf`·`validateRange`를 청사진 밖의 새 fractal로 옮겨(청사진 안에 두면 그것을 가져가는 옛 `helpers/jsonSchema`와 서로 가져오는 고리가 될 수 있다. 이름은 PR-1이 정한다) 이름으로 내보내되, `intersectEnum`·`intersectConst`·`validateRange`는 공집합·충돌에서 던지지 않고 공집합 표시를 돌려주도록 바꾼다. `intersectPattern`은 새 fractal로 옮기지 않는다. throw는 청사진이 정적 연언을 교차할 때만 한다(BLUEPRINT-016). 옛 `intersect*Schema`는 공집합 표시를 받으면 오늘처럼 `JSONSchemaError`를 던지도록 import와 함께 고쳐 옛 동작을 PR-7까지 지킨다(레거시로 옮긴 옛 코드가 PR-7까지 도는 방법은 닫혔다: PR-7은 진입점을 새 엔진으로 바꾸고 새 코드가 레거시를 가리키는 import가 0임을 점검하며 옛 코드는 `src/__legacy__/`에 보존한다, LANDING-159, LANDING-205). 레거시의 `const` 비교는 깊은 비교로 바뀌며(결함 수정), 이것이 옛 동작을 PR-7까지 지킨다는 규칙의 예외다), 검증기 앞 제거 규칙 하나, `controls`의 식 컴파일(오늘의 컴파일러 `createDynamicFunction`과 그 `utils`, `JSON_POINTER_PATH_REGEX`, `getPathManager`, `DynamicFunction` 형은 `AbstractNode` 조직 안에 있으므로 PR-1에서 청사진으로 통째로 옮긴다. 새 엔진에서 식을 컴파일하는 곳은 청사진 하나뿐이고(filid 배치 규칙 §1), `helpers/dynamicExpression/`의 `INTENT.md`는 표현식 직접 실행(`eval`, `new Function`)을 금한다. PR-7까지는 옛 엔진도 쓰므로 청사진 진입점이 이름으로 내보내고 그 유지 이유를 청사진의 `DETAIL.md`에 적는다. 옛 소비자는 import만 고친다. 16라운드 편집자 결정, 답 10으로 확정)과 역의존 표, 청사진 오류·경고(선언 사이 `options.terminal`·렌더 계층 판정·`controls.discriminator` 불일치, `controls`·`options`의 모르는 키. 터미널 전략은 `options.terminal` → 렌더 계층이 인자로 넘긴 판정 함수 → `type`의 순서로 정하며 청사진은 `presentation`을 읽지 않는다, 17라운드 스웜 수렴(편집자 결정)), `controls.watch` 의존의 합집합, `options`의 닫힌 목록(`trim` 포함), `controls.injectTo`는 함수 형태 하나라 청사진이 정적으로 아는 대상이 없고, 그 오류 코드 `INJECT_TARGET_NOT_FOUND`는 낼 자리가 없어 PR-4의 코드 확정에서 빠지며, 대상 없음은 모두 동적 대상 없음 `INJECT_TARGET_MISSING`이다(CONTROLS-079, ERROR-164), 청사진 오류·경고의 데이터화(수집기 인자로 코드·`schemaPath`·세부·판별 칸을 모으며 소비자가 없으면 모으지 않는다. 캐시 청사진의 늦은 경고 수집은 작성 루트마다 한 번, 17라운드 스웜 수렴(편집자 결정)). 테이블 테스트 | 없음 | 18라운드 안건 A(`$ref` 재귀, 다중 `type`, `dependentSchemas`·`patternProperties` 등)와 B(식 언어 명세), 전환 방식의 세부(레거시 디렉토리의 이름과 자리), 노드 구조 N14(행이 없는 조합, 청사진의 전략 결정)(PROCESS-027) |

【추론】 (7) PR 배치: 청사진이 `union` 종류를 알아보는 것은 PR-1이다(청사진이 종류를 정한다)(LANDING-061).

【추론】 규칙 1은 파일 한정 ESLint `no-restricted-imports`로 막고 PR-1에서 건다(LANDING-061). 【추론】 규칙 2: 레거시 → 새 코드는 LANDING-061이 이미 적은 곳만 허용한다(예: 옛 `intersect*Schema`가 새 잎 교차 함수를, 옛 소비자가 청사진으로 옮긴 식 컴파일러를 가져온다)(LANDING-061). 【추론】 PR-1 점검에 "filid `max-depth` 통과. 실패하면 `src/__legacy__/**`를 예외로 두는 설정 변경을 같은 PR에서 한다"를 둔다(LANDING-061).

반영 칸(개발계획 P3·P4): "인접 단계 합침 둘을 채택한다: 기반(PR-0의 코드 부분)과 청사진(PR-1)은 한 PR, 파생(PR-3)과 상태 키·제어(PR-6)는 한 PR."(LANDING-060, LANDING-061)

(LANDING-081, SCHEMA-043)

| PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- | --- |
| PR-1 청사진 | `preprocessSchema`(`oneOf` 자동 감지·`virtual` `required` 재작성), `processAllOfSchema`(정적 평탄화, `if/then/else` 무시), `schemaNodeFactory`의 스키마 변이, `BranchStrategy/utils`의 조건 사전 | `stripSchemaExtensions`의 스캐너 틀(키 목록만 그룹 셋으로), 잎 교차 함수(잎 교차 함수 가운데 `intersectConst`는 깊은 비교로 뜻이 바뀌고 `intersectPattern`은 새 fractal로 옮기지 않는다(SCHEMA-043)), `jsonPointer`, 옮긴 식 컴파일러 | `src/core/blueprint/`(옮긴 식 컴파일러 포함) |

`core/INTENT.md`의 "새 노드는 `AbstractNode`를 상속한다"는 PR-1에서 먼저 고친다(문서가 코드보다 먼저 바뀐다)(LANDING-088).

(LANDING-091, SCHEMA-043, TEST-055, LANDING-159, LANDING-205)

| PR | 더해진 것 |
| --- | --- |
| PR-1 | 식 컴파일러(`createDynamicFunction`과 그 `utils`, `JSON_POINTER_PATH_REGEX`, `getPathManager`, `DynamicFunction` 형)를 `src/core/blueprint/`로 통째로 옮김(PR-7까지는 옛 엔진도 쓰므로 청사진 진입점이 이름으로 내보내고 그 유지 이유를 청사진의 `DETAIL.md`에 적는다. 옛 소비자는 import만 고침), 잎 교차 함수를 새 fractal로 옮김(옛 `intersect*Schema`는 공집합 표시를 받으면 오늘처럼 던지도록 고쳐 옛 동작을 PR-7까지 지킨다(방법은 닫혔다: PR-7은 진입점을 새 엔진으로 바꾸고 새 코드가 레거시를 가리키는 import가 0임을 점검하며 옛 코드는 `src/__legacy__/`에 보존한다, LANDING-159, LANDING-205). 레거시의 `const` 비교는 깊은 비교로 바뀌며(결함 수정) 이것이 그 규칙의 예외이고, `intersectPattern`은 새 fractal로 옮기지 않고 레거시에 남는다(SCHEMA-043)), `core/INTENT.md` 개정, `@winglet/common-utils`의 `merge` 선택 인자와 그 changeset(`minor`, TEST-055) |

(LANDING-073, LANDING-074, LANDING-037, LANDING-064, LANDING-070, VALIDATE-015, VALIDATE-017, VALIDATE-018, VALIDATE-019, LANDING-061, LANDING-069, SCHEMA-043, LANDING-159, LANDING-205)

| 조건 | 처분 |
| --- | --- |
| 1 가드 계약을 (루트, 위치)로 고치고 ajv 셋에 동기 가드 경로를 두며 작성 루트 기준 캐시를 둔다 | **LANDING-037·LANDING-064·LANDING-070·VALIDATE-015·VALIDATE-017·VALIDATE-018·VALIDATE-019에 반영.** 떼어 낸 `if`는 `$ref` 때문에 단독 컴파일이 실패하고(ajv 8 실행 확인), 세 플러그인이 모두 `$async: true`이며, 같은 `$id` 루트의 재컴파일은 throw한다. `compileGuard(root, pointer)`. 캐시는 코어가 검증기 인스턴스마다 WeakMap<작성 루트 객체, { 사본, 가드 표 }>로 든다. 플러그인의 `compileGuard`는 가드 캐시를 들지 않는다. 사본 루트의 등록(루트마다 한 번의 `addSchema`와 고유 키 배정)은 플러그인의 검증기 인스턴스가 든다(ajv는 같은 키의 재등록에 실패한다, 16라운드 실행 확인). `Form`의 스키마 `clone`은 없앤다. 가드 캐시와 등록의 소유는 편집자 결정이며 16라운드 답 10으로 확정했다 |
| 2 "재사용" 두 문장을 사실대로 | **LANDING-061·LANDING-069에 반영.** 교차 연산은 잎 함수만 재사용하고 병합표는 새로 쓴다(오늘은 먼저 승·얕은 덮어쓰기·무조건 throw). 식 컴파일러는 `AbstractNode` 조직 안에 있으므로 PR-1에서 청사진(`src/core/blueprint/`)으로 통째로 옮긴다. 새 엔진에서 식을 컴파일하는 곳은 청사진 하나뿐이고, `helpers/dynamicExpression/`의 `INTENT.md`는 표현식 직접 실행을 금하기 때문이다(편집자 결정, 16라운드 답 10으로 확정). 잎 함수 `intersectEnum`·`intersectConst`·`validateRange`는 공집합·충돌에서 던지지 않고 공집합 표시를 돌려주도록 바꾼다. 옛 `intersect*Schema`는 공집합 표시를 받으면 오늘처럼 던지도록 고쳐 옛 동작을 PR-7까지 지킨다(방법은 닫혔다: PR-7은 진입점을 새 엔진으로 바꾸고 새 코드가 레거시를 가리키는 import가 0임을 점검하며 옛 코드는 `src/__legacy__/`에 보존한다, LANDING-159, LANDING-205). 레거시의 `const` 비교는 깊은 비교로 바뀌며(결함 수정), 이것이 옛 동작을 PR-7까지 지킨다는 규칙의 예외다(SCHEMA-043) |

### 1.17 노드 트리와 정착의 착수

(LANDING-062, BLUEPRINT-035, TEST-069, PROCESS-027, PROCESS-026)

| PR | 내용 | 의존 | 착수 전 닫을 것 |
| --- | --- | --- | --- |
| PR-2 노드 트리와 정착 | 노드: 상속 없는 단일 클래스 `SchemaNode`(`src/core/SchemaNode/`)와 `BEHAVIORS[type][strategy]`의 동작 행(잎 넷·객체·터미널 객체·가상. PR-2의 동작 행에 `union` 행이 다른 잎 행과 함께 든다(BLUEPRINT-035). 터미널 배열은 PR-5), `src/core/record/`·`src/core/behaviors/`·`src/core/navigation/`, 공개 `type`·`strategy` 게터와 `active` 게터(노드 게이트), 겉면 규칙의 기계 검사(파일 한정 린트, 멤버 목록 시험, 행 칸 순서 시험). `raw`·`extras`, 표시·계산(호스트 바퀴, 노드 게이트, 투영)·전이(채움, 나감 비움 네 층과 하위 트리·잠복 자손으로 내려가는 정책, R17-2 ㄴ)·커밋, 예산 다섯과 원본 B(되돌림 기록. 기록 항목은 노드, 이전 `raw`, 이전 `extras`, 배열 아이템 구조의 생성·폐기이며 중간 라운드 채움의 철회보다 먼저 적용한다. 각 PR은 자기가 들여오는 기제를 검증하므로 PR-2가 실제 코드로 시험하는 예산은 호스트 바퀴와 전이 라운드이고, 파생 라운드 예산은 PR-3, 되먹임 파동과 `onChange` 중첩 예산은 PR-4, 원본 B의 배열 아이템 구조 기록은 PR-5가 맡는다(TEST-069)), `diagnostics`(`'stable'` 또는 `'degraded'`, `cause`, `commit`, R17-1 나), `SetValueOption`, 게이트는 술어 인터페이스 뒤의 스텁. 정착 루프 테스트(프로토타입 회귀 이식) | PR-1 | 18라운드 안건 B·C·D(`controls.active` 식의 다른 호스트 읽기 순서, 비객체 V의 `Merge`, 되먹임 거부 표면, 프로토타입 v7)와 노드 구조(N2(탐색이 기대는 `subnodes`·`variant`의 존폐), N5(런타임 형의 타입 순환), N6(레코드에서 공개 판별 합집합으로의 형 변환), N14, 공개 표면의 크기, `ContextNode`의 자리)(PROCESS-027) |

(LANDING-082, WRITE-052, NODE-056, WRITE-056, BLUEPRINT-030, BLUEPRINT-044, NODE-043, BLUEPRINT-043, BLUEPRINT-035)

| PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- | --- |
| PR-2 트리·정착 | `AbstractNode`의 `onChange` 전파·`__scoped__`·`__reset__`·루트 매크로태스크 디바운스, `ObjectNode` 전략 선택, `getNodeGroup`의 `isReactComponent`(원리 다섯째 'core는 렌더러를 모른다' 위반), `core/parsers/*`(노드마다 타입에 맞는 parse를 두되 뜻이 그대로인 변환만 하며, 새 parse는 `src/core/behaviors/utils/parse/`에 두고 오늘의 `src/core/parsers/`는 옛 노드와 함께 `src/__legacy__/core/parsers/`로 옮긴다, WRITE-052, NODE-056, WRITE-056), `BranchStrategy.ts` | 청사진은 `$ref`를 대상 위치마다 한 번 분석해 그 분석을 가리키고(BLUEPRINT-030), 형 판정은 `extractSchemaInfo`의 형 부분을 대신하는 허용 집합 도우미가 PR-1 청사진에서 맡는다(BLUEPRINT-044). `omitEmptyObject`(`behaviors/objectBehavior/utils/`로), `findNode`·`traversal`(`navigation/`으로 옮기며 고친다. `find`는 형상에 있는 노드만 돌려주고, `detectsCandidate`와 첫 후보로 물러나는 규칙, 내부 칸 `variant`·`scope`·`oneOfIndex`·`anyOfIndices`는 폐기한다(NODE-043)), `shallowPatch`(`record/`로) | `src/core/record/`, `src/core/behaviors/`(잎 넷, `objectBehavior/`의 `branch/`·`terminal/`, `virtualBehavior/`. PR-2의 동작 행에 `union` 행이 다른 잎 행과 함께 든다(BLUEPRINT-043, BLUEPRINT-035). 터미널 배열은 PR-5), `src/core/navigation/`, `src/core/SchemaNode/`, `src/core/settle/` |

"확정(나). parse는 뜻이 그대로인 변환만 한다(ajv 규칙 수준). 오늘 파서의 문자 제거, 정수 자르기, 빈 값 치환(`""`, `[]`, `{}`), 불리언의 진릿값 변환은 parse에서 뺀다."(LANDING-082)

`parsers`의 새 자리는 닫혔다: 새 parse는 `src/core/behaviors/utils/parse/`에 둔다(LANDING-082, NODE-056).

【추론】 예를 들어 PR-2는 `src/core/nodes`, 그것이 가져오는 `src/core/parsers`(→ `src/__legacy__/core/parsers/`), 옛 `src/core/__tests__`를 옮긴다(LANDING-082). 【추론】 S1 parse 함수(소유자 답 S1의 노드마다 타입에 맞는 parse, WRITE-052)는 `src/core/behaviors/utils/parse/`에 둔다(LANDING-082). 【추론】 PR-2는 이 자리에 S1 변환(WRITE-075의 변환 목록, WRITE-052)만 하는 parse를 새로 둔다(LANDING-082). 【추론】 오늘의 `src/core/parsers/`는 그것을 가져오는 옛 노드와 함께 `src/__legacy__/core/parsers/`로 옮긴다(LANDING-159)(LANDING-082).

(LANDING-092, LANDING-077, NODE-008, BLUEPRINT-043, BLUEPRINT-035)

| PR | 더해진 것 |
| --- | --- |
| PR-2 | 되돌림 기록 항목 확정(LANDING-077), 노드 구조(NODE-008: `record/`·`behaviors/`·`navigation/`·`SchemaNode/`, 행은 잎 넷·객체 둘(터미널 객체까지)·가상. PR-2의 동작 행에 `union` 행이 다른 잎 행과 함께 든다(BLUEPRINT-043, BLUEPRINT-035). 터미널 배열은 PR-5), `active` 게터, 나감 비움의 하위 트리 규칙(R17-2 ㄴ) |

(LANDING-077, LANDING-079, LANDING-062, NODE-001, NODE-015, NODE-043, NODE-045, NODE-046, NODE-047, SURFACE-058)

| 조건 | 처분 |
| --- | --- |
| 5 되돌림 기록에 `extras`와 배열 구조 | **LANDING-062에 반영** |
| 7 공개 노드 타입·가드는 단일 클래스 겉면과 판별 인터페이스로 | **NODE-001·NODE-015에서 정함(17라운드 소유자 확정과 노드 구조 수렴, 이름도 확정). 설계 빈틈 넷(N2·N5·N6·N14)은 NODE-043·NODE-045·NODE-046·NODE-047이, 공개 표면의 크기는 SURFACE-058이 닫았다** |

【추론】 parse의 문서(오늘 `src/core/parsers/INTENT.md`가 맡던 것)는 새 자리(`src/core/behaviors/utils/parse/`, NODE-056)의 문서로 PR-2의 착수 항목이고, `src/types/formTypeInput.ts:60-65`의 문서 주석은 PR-7의 착수 항목이다(LANDING-150).

### 1.18 파생의 착수

(LANDING-063)

| PR | 내용 | 의존 | 착수 전 닫을 것 |
| --- | --- | --- | --- |
| PR-3 파생 | `controls.derived`·`controls.injectTo`·`controls.unsetValue`, 같은 대상 규칙(종류 순위, 문서 순서, 층, 전순서, 정착 단위), 에지 소비, `DisableAutomaticWrites`, `controls.resetInteraction`, 개발 모드 정착 기록 | PR-2 | 에지의 값 동등 판정, `controls.derived` 의존 집합, 조각 `controls` 식의 나감 발화 |

반영 칸(개발계획 P3·P4): "인접 단계 합침 둘을 채택한다: 기반(PR-0의 코드 부분)과 청사진(PR-1)은 한 PR, 파생(PR-3)과 상태 키·제어(PR-6)는 한 PR."(LANDING-063)

(LANDING-083)

| PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- | --- |
| PR-3 파생 | 의존 경로의 이벤트 구독, `InjectionGuardManager`, `getDerivedValueFactory` | `createDynamicFunction`의 의존 주입 형태 | `src/core/settle/derive/` |

### 1.19 통지와 검증의 착수

(LANDING-064, ERROR-041, EVENT-045, EVENT-046, VALIDATE-046, REACT-002)

| PR | 내용 | 의존 | 착수 전 닫을 것 |
| --- | --- | --- | --- |
| PR-4 통지와 검증 | 루트 디스패처, `batch`, 진입당 `onChange` 1회, 진입 사슬과 사슬 끝의 throw, `onError` 로깅 채널의 core 쪽(기록 형 `FormErrorRecord`와 코드 형 `FormErrorCode`(가칭), core가 인자로 받는 보고기(`report`, `hasConsumer`), 사슬 끝 기록마다 전달, 핸들러 예외의 묶음 규칙, 전달 중 쓰기 거부, 경고의 구조 키 중복 억제, 정착 경고 판정의 소비자 조건, `ValidateFunction` 문서 주석 "판정은 돌려주고 던지지 않는다". `ValidationIssue` 개명이 `onError`의 공개보다 먼저 선다, 17라운드 스웜 수렴(편집자 결정)), 진입 사슬의 소유는 `dispatch`(쓰기 동사마다 진입 함수)이며 겉면의 쓰기 위임을 `dispatch` 진입으로 옮김, `SchemaFormError`의 집계 오류(`details.errors`), 주인 없는 오류 싱크, 검증 실행 실패와 검증 불가의 드러남, 가드의 늦은 컴파일(프로덕션)과 개발 모드 일괄 컴파일(어느 환경이든 실패는 그 게이트의 가드 실패)(ERROR-041, 17라운드 스웜 수렴(편집자 결정)), `UpdateDiagnostics`, 커밋 번호 스탬프 검증과 실행 합치기, 검증기 계약(`compileGuard`, `rejectedKey`)의 플러그인·`validatorFactory` 통일과 ajv6·7·8 플러그인 구현, 에러 라우팅, 오류 클래스(`ValidationIssue`), 훅 수준의 React 바인딩 시험(동기 통지와 `useSyncExternalStore`, StrictMode 이중 호출, 구독 뒤 따라잡기), 같은 `$id` 루트의 중복 등록 처리, 상태·오류·명령 사건과 검증 결과의 배달 경로(EVENT-045, EVENT-046, 16라운드 답 3), 검증기 등록의 참조 세기와 최근 해제 목록, 재생성 reset의 같은 `$id`(VALIDATE-046, 16라운드 스웜 수렴(편집자 결정)) | PR-2 (PR-3과 병렬) | `compileGuard` 계약 세부, 에러 라우팅, 유효 스키마 변경 이벤트, core가 `ValidationManager` → `app/plugin`의 `PluginManager`를 거쳐 React 구성 요소 모듈을 가져오는 import의 분리(검증기 주입 경로, REACT-002) |

(LANDING-084)

| PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- | --- |
| PR-4 통지·검증 | `EventCascadeManager`(노드별 마이크로태스크, 100회 throw), `ValidationManager`(실패 삼킴), `compile` 하나뿐인 계약 | 비트별 배달 원장 개념, 세대 번호, `transformErrors` | `src/core/dispatch/`, `src/core/validation/`, `app/plugin/type.ts` 개정. 진입 사슬은 `dispatch`가 쓰기 동사마다 진입 함수로 소유하고, 검증 결과 배달은 `dispatch`가 넘긴 콜백이다 |

(LANDING-093, EVENT-045, EVENT-046, WRITE-046, VALIDATE-046, ERROR-032)

| PR | 더해진 것 |
| --- | --- |
| PR-4 | ajv6·7·8의 동기 `compileGuard(root, pointer)` 구현과 코어의 사본·가드 캐시, 훅 수준 바인딩 시험, 같은 `$id` 재등록, 배달 경로(EVENT-045, EVENT-046), 검증기 등록의 참조 세기와 최근 해제 목록, 재생성 reset의 같은 `$id`(새 루트를 등록할 때 옛 트리가 아직 살아 있으므로 살아 있는 두 트리의 충돌로 다루고 reset의 원자성을 지킨다, WRITE-046·VALIDATE-046, 16라운드 스웜 수렴(편집자 결정)), `onError`의 core 쪽(보고기 인자, 기록 형과 코드 형, 사슬 끝의 기록마다 전달, 핸들러 예외 규칙, 전달 중 쓰기 거부, ERROR-032) |

【추론】 가드 200개인 조건부 폼 생성은 새 판 23.0 ms(트리 585 µs + AJV 컴파일 22.4 ms) 대 오늘 13.4 ms로 1.7배다(`spikes/work-loop/REPORT.txt:113-118`, `:196-200`)(LANDING-093). 【추론】 이 항목을 PR-4(동기 `compileGuard`를 구현하는 PR)의 수용 필요 항목으로 미리 적고, 이유는 "검증기 컴파일"이다(LANDING-093). 【추론】 미리 적는 것이지 미리 받아들이는 것이 아니다(LANDING-093).

【추론】 저장소의 ajv 플러그인 셋과 core의 폴백 검증기(`src/core/nodes/AbstractNode/utils/ValidationManager/utils/getFallbackValidator.ts:19`)는 PR-4(동기 `compileGuard`를 구현하는 그 PR)에서 함께 루트에 `''`를 내도록 고친다(LANDING-093).

반영 칸(개발계획 P1): "ajv6·ajv7·ajv8의 `compileGuard`·`rejectedKey`·같은 `$id` 처리는 원장대로 PR-4에서 셋 다 구현한다."(LANDING-064, LANDING-093)

(LANDING-076, EVENT-045, EVENT-046)

| 조건 | 처분 |
| --- | --- |
| 4 상태·오류·명령 사건과 검증 결과의 배달 경로 | **EVENT-045·EVENT-046에서 정함(16라운드 답 3으로 확정).** |

### 1.20 배열의 착수

(LANDING-065, SURFACE-005)

| PR | 내용 | 의존 | 착수 전 닫을 것 |
| --- | --- | --- | --- |
| PR-5 배열 | 배열·터미널 배열 행(`arrayBehavior/`의 `branch/`·`terminal/`), 겉면 배열 멤버, 배열 노드와 아이템 호스트, `items`·`prefixItems`, 배열 쓰기는 `push`·`pop`·`update`·`remove`·`clear` 다섯이다(SURFACE-005), 통째 교체의 identity, 아이템 채움 | PR-2 (PR-3·4와 병렬) | 배열 아이템의 생김과 채움, `contains` |

(LANDING-085)

| PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- | --- |
| PR-5 배열 | `ArrayNode` 전략 둘, 비동기 `push` | `resolveArrayLimits`(`blueprint/`로 옮김), `omitTrailingArray`·`omitEmptyArray`(`behaviors/arrayBehavior/utils/`로). `resolveArrayValueFilter`는 투영 칸의 비트 분기로 다시 쓴다 | `src/core/behaviors/arrayBehavior/`(`branch/`·`terminal/`·`utils/`) |

(LANDING-094)

| PR | 더해진 것 |
| --- | --- |
| PR-5 | 배열·터미널 배열 행(`behaviors/arrayBehavior/`의 `branch/`·`terminal/`), `resolveArrayLimits`의 청사진 이동 |

### 1.21 상태 키와 제어의 착수

(LANDING-066, LANDING-092, TEST-069, NODE-042)

| PR | 내용 | 의존 | 착수 전 닫을 것 |
| --- | --- | --- | --- |
| PR-6 상태 키와 제어 | `controls.visible`·`controls.readOnly`·`controls.disabled`·표준 `readOnly`의 결합(OR/AND), `controls.children`, 조각 `controls`, 나감 비움의 하위 트리 규칙은 PR-2가 세우고, PR-6은 `children` 항목 층·조각 `controls` 층·식 값(직전 커밋)을 더한다(LANDING-092, TEST-069), 겉면의 계산 게터(`visible`·`enabled`·`readOnly`·`disabled`) | PR-3 | `controls.children` 세부. 조각에 따라 터미널 전략이 바뀌는 경로는 17라운드 스웜 수렴(편집자 결정)으로 닫혔다(선언 사이 정적, NODE-042) |

반영 칸(개발계획 P3·P4): "인접 단계 합침 둘을 채택한다: 기반(PR-0의 코드 부분)과 청사진(PR-1)은 한 PR, 파생(PR-3)과 상태 키·제어(PR-6)는 한 PR."(LANDING-066)

(LANDING-086)

| PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- | --- |
| PR-6 상태 키·제어 | 루트 스키마 전역 상속, `checkComputedOptionFactory`, `mergeShowConditions` | 없음 | `settle/`의 계산 끝 |

### 1.22 엔진 전환과 레거시 경계

(LANDING-067, EVENT-071, LANDING-199, LANDING-205, LANDING-206, TEST-073, WRITE-085, REACT-028, WRITE-083, LANDING-145)

| PR | 내용 | 의존 | 착수 전 닫을 것 |
| --- | --- | --- | --- |
| PR-7 전환 | `nodeFromJSONSchema`를 새 엔진 위에 다시 짓고, React 바인딩(`providers`·`hooks`·`components`)을 새 값 채널(`value`·`outputValue`)과 통지에 연결, Form 속성(`readOnly`·`disabled` 전체 잠금, `unsetOnInactive`, `disableAutomaticWrites`, `onError`, `onDiagnosticsChange`, `validatorFactory`, 렌더러 넷 `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`), 청사진 오류의 생성 자리 포착과 대체 화면, 마운트 정착 오류의 원인별 처리(ERROR-077–ERROR-084), 루트·필드 바운더리의 가두고 보고하기(17라운드 스웜 수렴(편집자 결정), ERROR-088, ERROR-089), `degraded` 동안의 제출 거부(네이티브 submit은 `onError`와 싱크로)와 검증 불가의 거부(R17-1 나), 터미널 전략과 병합의 원자(렌더 계층의 터미널 판정 함수와 원자 판정 함수를 청사진에 넘김, REACT-003), 명령, 레거시 디렉토리는 PR-8까지 보존하고 PR-7은 레거시 import 0만 점검한다, `core/index.ts`의 수출을 `src/core/SchemaNode/` 진입점으로, `node.group` → `node.strategy`의 소비자 이주(LANDING-043), 렌더 시나리오 438건의 처분(TEST-013. 17파일은 단언을 이름만 바꿔 살린다, 16라운드 답 7), UI 플러그인 넷의 타입과 등록 키 대응, UI 플러그인 넷의 이주는 PR-7 뒤의 플러그인 PR이 하고 PR-7은 기본 입력으로 검증한다, `SchemaNodeInput`의 흐림 처리에서 `Blurred` 발행을 입력 마침 신호 `finishInput`으로 바꿈(`options.trim`은 문자열 행의 `finishInput` 칸이 판단, R17-3), `ChildNodeComponentProps`·`FormGroupProps`의 prop `FormTypeRenderer` → `FormTypeGroupRenderer`, `SchemaNodeInput.handleChange`의 세 진입(값 쓰기·외부 오류 지움·dirty)을 `batch` 하나로 묶기, 입력 출처 표식(Refresh 판정과 폐기된 노드의 늦은 입력 쓰기 판별용 내부 통로), 마운트 로드 정착 동안 `onChange`·`onDiagnosticsChange`는 버리고 `onError`는 커밋 뒤 한 번 전달하는 계약과 마운트 로드의 검증 요청을 준비 시점에 내는 것(17라운드 스웜 수렴(편집자 결정), REACT-007), `onError`의 렌더 계층(바깥 감싸개와 인스턴스 보고기 문맥, 로드 기록의 준비 이펙트 전달과 대체 화면 이펙트 전달, 바운더리의 렌더 때 보고기 읽기와 `componentStack`, 네이티브 submit 경로의 오류 층 거부를 `onError`와 싱크로), `@winglet/react-utils` ErrorBoundary와 감싸개 둘의 렌더 때 보고 함수를 얻는 선택 인자(소유자 허용. 그 모듈의 `DETAIL.md`를 먼저 갱신한다, 17라운드 스웜 수렴(편집자 결정)), React 18 실행 시험(16라운드 답 5), `useFormTypeInput`의 메모 의존에 유효 스키마 참조 추가와 `SchemaNodeProxy`의 유효 스키마 변경 비트 구독, 배달 경로의 렌더 계층 구독(EVENT-045, EVENT-046), `Form`의 스키마 `clone`(`preprocessSchema(clone(inputJSONSchema))`) 제거(작성 루트 객체를 가드 캐시의 키로 지킨다. `defaultValue`의 `clone`은 이 항목이 아니다), `reset`의 로드 전환(같은 스키마 판정, 커밋 재대조, 호출 안의 재생성, 입력 판정과 노드가 드는 Refresh 번호, 상호작용 초기화 번호), 로드의 검증 규칙(마운트 포함, LANDING-041)(WRITE-042, WRITE-043, WRITE-044, WRITE-046, REACT-019, REACT-024, 16라운드 스웜 수렴(편집자 결정)), 로드가 아닌 쓰기(`setValue(V)` 포함)는 원본이 실제로 바뀐 노드에만 Refresh를 내고 쓴 입력 자신은 제외하며, "값이 같아도 낸다"는 로드의 새 수명에만 해당한다, `@winglet/react-utils`의 changeset(`minor`), 벤치 비교 | PR-1 – PR-6 전부 | 성능 예산 수치는 닫혔다(예산의 수치는 기존 `guard:check`의 선이다, TEST-073), 브라우저 IME 확인, 노드 `resetSubtree()`의 존치는 닫혔고(WRITE-085, `resetSubtree()`와 게터 `defaultValue`를 남김) 입력 판정의 구현 확인만 PR-7 게이트로 남는다(REACT-028), `trim` 쓰기의 부수 효과는 닫혔다(`trim`은 `finishInput` 칸의 자동 쓰기이고 바깥 오류와 dirty는 그대로다, WRITE-083, LANDING-145), `@winglet/react-utils` 선택 인자의 모양, 네이티브 submit 경로의 검증 실패(`ValidationError`) 처리(오늘은 미처리 거부, `Form.tsx:127-133`, `getTrackableHandler.ts:429-431`) |

반영 칸(개발계획 P1): "UI 플러그인 넷(antd5·antd6·antd-mobile·mui)의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR(우산 순서 N+1, PR-7 뒤)이 한다."(LANDING-067, LANDING-078).

(LANDING-087, LANDING-206)

| PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- | --- |
| PR-7 전환 | `RootNodeContextProvider`, `Form`, `SchemaNodeProxy`, `SchemaNodeInput`, `useFormTypeInput`, `PluginManager`의 렌더 키트, `types/jsonSchema`의 맨 키. UI 플러그인 넷(antd5·antd6·antd-mobile·mui)의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR(우산 순서 N+1, PR-7 뒤)이 한다 | 가상화(WeakSet identity), `renderForm`, `providers` 대부분, `useSchemaNodeTracker`·`useSchemaNodeSubscribe` | 기존 자리. `core/index.ts`의 수출만 새 fractal로 돌려 import 경로를 지킨다(`core/index.ts`는 `SchemaNode/`의 진입점을 가리키고 바인딩 전용 내부 통로를 이름으로 다시 내보낸다). `core/types`의 event·state·value는 남고 node·constructor는 지운다 |

(LANDING-095, EVENT-071, LANDING-199, LANDING-206)

| PR | 더해진 것 |
| --- | --- |
| PR-7 | 바인딩 계약 다섯(REACT-007, REACT-009, REACT-011, ERROR-088, ERROR-089, REACT-012. 첫째·넷째는 17라운드 스웜 수렴(편집자 결정)으로 닫힘. 드러남과 제출 거부는 모든 환경에서 같다, R17-1 나), Form 속성 `onError`와 바깥 감싸개·인스턴스 보고기, 입력 마침 신호 `finishInput`(trim), `node.group` → `node.strategy`의 소비자 이주, UI 플러그인 넷의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR(우산 순서 N+1, PR-7 뒤)이 한다, `renderForm` 다섯(TEST-021), 부류별 e2e 실행기, React 18 실행, 배달 경로의 렌더 계층 구독(EVENT-045, EVENT-046), 시나리오 스토리와 `playScenario`, 옛 스토리 49파일 전체 정리, `architecture/spikes/**` 가운데 제품 동작에 남는 상황의 e2e 이식(TEST-024), `Form`의 스키마 `clone` 제거, `reset`의 로드 전환(같은 스키마 판정, 커밋 재대조, 호출 안의 재생성, 자식 프록시 마운트 여부로 가르는 입력 판정, 노드가 드는 Refresh 번호와 상호작용 초기화 번호), 로드의 검증 규칙(마운트 포함)(WRITE-042, WRITE-043, WRITE-044, WRITE-046, REACT-019, REACT-024, LANDING-041, 16라운드 스웜 수렴(편집자 결정)), 로드가 아닌 쓰기(`setValue(V)` 포함)는 원본이 실제로 바뀐 노드에만 Refresh를 내고 쓴 입력 자신은 제외하며, "값이 같아도 낸다"는 로드의 새 수명에만 해당한다, `@winglet/react-utils`의 changeset(`minor`, TEST-055) |

(LANDING-075, LANDING-078, LANDING-080, LANDING-206)

| 조건 | 처분 |
| --- | --- |
| 3 바인딩 계약 넷 | **REACT-007, REACT-009, REACT-011, ERROR-088, ERROR-089, REACT-012에서 정함(첫째·넷째는 17라운드 스웜 수렴(편집자 결정)으로 닫힘: 마운트 동안 `onError`는 커밋 뒤로 미루고 바운더리는 다시 던지지 않고 가두고 보고한다. 다섯째 '유효 스키마를 따라간다'는 편집자가 더함).** LANDING-067에 반영 |
| 6 UI 플러그인 규모와 `options` 닫힌 목록의 충돌 | **LANDING-070·LANDING-040에 반영.** 27파일이 `options.*`·맨 키를 읽으므로 PR-7 뒤의 플러그인 PR이 `presentation.*`로 옮긴다 |
| 8 훅·바인딩 시험과 React 18 실행 | **TEST-017·TEST-020에 넣음.** LANDING-064·LANDING-067에 반영(React 18 실행은 16라운드 답 5로 확정) |

**위험이 모이는 곳은 PR-7이다.**(LANDING-071) PR-1 – PR-6은 `<Form>`에 닿지 않으므로 사용자 관점의 동작은 PR-7에서 처음 검증된다(LANDING-071). 완화: PR-2부터 엔진 수준의 통합 시나리오(TEST-004의 상황 목록)를 각 PR에 넣고, PR-4 뒤에 차등 테스트(독립 검증기와의 판정 동치)를 돌린다(LANDING-071).

**PR-7을 더 쪼갤 수 없는 이유.**(LANDING-072) 옛 엔진과 새 엔진은 값의 소유(다중 사본 대 `raw` 하나), 통지(마이크로태스크 배치 대 동기 1회), 분기(자동 감지 대 게이트)가 다르다(LANDING-072). `<Form>`이 둘을 동시에 섬길 수 없고, 렌더 시나리오의 기대값도 한 계약에만 맞는다(LANDING-072).

`src/__legacy__/`는 PR-7이 지우지 않고 정리·릴리스 PR(PR-8)까지 참고용으로 보존한다(LANDING-205, LANDING-067). PR-7은 진입점을 새 엔진으로 바꾸고 새 코드가 레거시를 가리키는 import가 0임을 점검한다(LANDING-205). 디렉토리 삭제는 PR-8이 한다(LANDING-205). 우산 브랜치에 딸려 들어온 무관한 파일(`.seiri/.gitignore`, 벤치 결과)은 정리하지 않는다(LANDING-205). 소유자(개발계획 P2): "레거시는 마지막까지 보존. 참고용."(LANDING-205). 소유자(개발계획 P2): "무관한 커밋을 굳이 정리할 필욘 없어."(LANDING-205).

### 1.23 플러그인 전환

ajv6·ajv7·ajv8의 `compileGuard`·`rejectedKey`·같은 `$id` 처리는 원장대로 PR-4에서 셋 다 구현한다(LANDING-064·LANDING-093 그대로)(LANDING-206). UI 플러그인 넷(antd5·antd6·antd-mobile·mui)의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR(우산 순서 N+1, PR-7 뒤)이 한다(LANDING-206). PR-7은 기본 입력으로 검증한다(LANDING-206). 이주 표의 행(LANDING-181–LANDING-186)과 이주 점검은 PR-7에 남는다(LANDING-206). 소유자(개발계획 P1): "0에서 ajv 플러그인은 먼저 전부 수정하고 가자. 별로 크게 달라질건 없잖아?"(LANDING-206).

### 1.24 릴리스 작업 흐름의 전환

(LANDING-097)

| PR | 더해진 것 |
| --- | --- |
| 릴리스 전환(별도 PR) | changesets 가동, 지속 통합 시험 작업 흐름과 루트 `lint`·`typecheck`·`test` 스크립트, `publish-npm-packages.yml`의 작업 다섯, 포장 스크립트 분리와 릴리스 테스트 재작성, 판 올림 스크립트 정리와 루트 `CLAUDE.md`·`scripts/PUBLISHING.md` 개정(TEST-045, TEST-047, TEST-049, TEST-050, TEST-054, 16라운드 스웜 수렴(편집자 결정)). 저장소 전체의 일이라 재설계와 독립이며 PR-8 전에 병합한다. PR-0과는 순서가 없다 |

### 1.25 정리와 릴리스

(LANDING-068, TEST-045)

| PR | 내용 | 의존 | 착수 전 닫을 것 |
| --- | --- | --- | --- |
| PR-8 릴리스 | README·docs 재작성, ADR 0010 최종, 이주 안내와 이주 프롬프트(`docs/agents`), changeset(파괴적 변경, `fixed` 무리 전체 `major`. 1.0.0-beta 프리릴리스 뒤 1.0.0, TEST-058. `changeset version`은 `changesets/action` 안에서만 돌므로 `CHANGELOG.md`는 병합 뒤 그 작업 흐름의 판 올림 PR이 만들고 PR-8은 changeset만 쓴다), 포장된 산출물의 릴리스 테스트(TEST-050, 16라운드 스웜 수렴(편집자 결정)), README·docs의 reset 규칙(LANDING-121), README·docs의 `onError` 코드 표(코드, level, 부류, 언제, 누구 잘못, 기본 드러남)와 판 규칙 | PR-7 | 릴리스 전환 PR(TEST-054, 저장소 전체)의 병합 |

(LANDING-096, TEST-045)

| PR | 더해진 것 |
| --- | --- |
| PR-8 | 릴리스 전 벤치 재실행, changeset(파괴적 변경, `fixed` 무리 전체 `major`. 1.0.0-beta 프리릴리스 뒤 1.0.0, TEST-058. `changeset version`은 `changesets/action` 안에서만 돌므로 `CHANGELOG.md`는 병합 뒤 그 작업 흐름의 판 올림 PR이 만들고 PR-8은 changeset만 쓴다), 포장된 산출물의 릴리스 테스트(TEST-050, 16라운드 스웜 수렴(편집자 결정)), README·`docs/QUICK_REFERENCE.md`·`docs/agents`의 reset 규칙(LANDING-121), 스토리북 문서 |

반영 칸(개발계획 P2): "디렉토리 삭제는 PR-8이 한다."(LANDING-068, LANDING-096).

판 번호는 1.0.0-beta 프리릴리스 뒤 1.0.0이다(16라운드 소유자 답, TEST-058)(LANDING-002). 소유자(16라운드 추가 확인): "(나) 1.0.0-beta를 먼저 내고 1.0.0 예상합니다"(LANDING-002). PR-8의 changeset은 `major`이고(0.16.0 → 1.0.0), 먼저 프리릴리스 모드(`changeset pre enter beta`)로 `fixed` 무리 여덟을 1.0.0-beta.N으로 낸다(LANDING-002). 프리릴리스는 `latest`를 건드리지 않도록 dist-tag `beta`로 올린다(LANDING-002).

릴리스는 `master` 병합 뒤의 배포이며, 판 올림 PR을 병합하면 배포 작업 흐름이 시험 관문을 거쳐 자동으로 배포한다(TEST-051, 16라운드 스웜 수렴(편집자 결정))(LANDING-059). 소유자(16라운드 답 9): "정해지지 않았습니다. changeSet 을 사용한 표준 방법으로 바꾸고자 합니다. 릴리즈 테스트도 다시 작성해야 합니다. 지금 구조는 github actions를 보세요"(LANDING-059).

**문서와 시험.**(LANDING-121) PR-8의 문서 재작성(README, `docs/QUICK_REFERENCE.md`, `docs/agents`의 `validation-and-state.md`)이 적는 것: 같은 스키마의 판정(WRITE-043), prop을 읽는 때와 재대조(WRITE-044), 노드 참조가 이어지는 조건(로드 경로뿐), 제자리 변경 비반영, `key`가 버리는 것, 포커스, 입력 컴포넌트의 늦은 쓰기는 `node`가 아니라 `onChange`로 한다는 것(재생성 reset 뒤 `node`로 한 늦은 쓰기는 `SchemaFormError`), reset 직후 다시 마운트된 입력이 흉내 언마운트 때 같은 값을 흘려보내 `dirty`를 세울 수 있다는 것(`dirty`는 목표 후보 C6(편집 중 상태의 보존과 격리)대로 현행 유지라 값이 같아도 선다(LANDING-121, GOAL-019). 개발 모드 StrictMode에서만 관측될 수 있음, 실행 확인 전)(LANDING-121).

## 2. 시험과 성능

### 2.1 시험의 원칙과 위계

**원칙 둘.**(TEST-006) 모든 시험은 회귀를 막고 개별 함수의 동작을 표현한다(TEST-006).
절대 실패하지 않는 단언은 시험이 아니다(TEST-006).
이슈 #342 §4의 교훈도 옮긴다(TEST-006).
숨은 키 누출 검사를 `JSON.stringify(...).not.toContain(KEY)`로 하면 제어 문자가 이스케이프되어 절대 실패하지 않는다(TEST-006).
목표 구조에는 숨은 키가 없으므로 이 검사 자체가 필요 없어지지만, "절대 실패하지 않는 단언"을 경계하는 원칙은 남긴다(TEST-006).
항상 통과하는 테스트(`findNode.test.ts` 147–149행, `expect(x).toEqual(x)`)를 `toBeNull()`로 고친다(TEST-006).

(TEST-007)

| 층 | 무엇을 | 환경 | 원천 |
| --- | --- | --- | --- |
| 코어 유닛 | 청사진 표, 정착 루프, 파생, 디스패처, 검증 스탬프. 단위 시험과 **시나리오 시험**(스키마 하나로 여러 단계) | vitest, `node` | 단위는 함수 옆 `__tests__`, 시나리오는 TEST-008의 데이터 모듈 |
| `<Form>` e2e | 실제 React 렌더 사이클. 마운트·입력·전환·제출·오류 표시 | vitest, `jsdom` + `@testing-library/react`(`renderForm` 하니스) | TEST-008의 데이터 모듈을 `playScenario`가 해석(스토리와 같은 어댑터). 스토리북 브라우저 실행은 이 층의 미러다(TEST-022, 16라운드 답 1로 확정) |
| 개별 함수·훅 | 순수 함수, 훅, 도구. 복수 허용 | vitest, 함수는 `node`, 훅은 `jsdom` | 함수 옆 `__tests__` |

소유자(16라운드 답 1): "e2e는 `jsdom`에서 돈다 | "예" | 확정"(TEST-007).
`<Form>` e2e는 vitest `jsdom` + `renderForm`으로 시나리오를 그리고 `playScenario`로 돌리며, 실제 브라우저 실행은 스토리북 자동화(addon-vitest)가 맡는다(TEST-007).

1. **차등 테스트.**(TEST-001) 임의의 (스키마, 상호작용 시퀀스)에 대해 `form.validate()`의 판정이 독립 검증기(작성된 스키마, `FormHandle.getValue()`)의 판정과 같아야 한다(TEST-001). 이슈 #342 §2의 표가 시드다(TEST-001). 독립 검증기는 폼이 쓰는 플러그인과 다른 구현이어야 하고 값은 JSON으로 직렬화한 뒤 넣는다(TEST-001). 같은 플러그인에 같은 메모리 값을 넣으면 동어반복이다(TEST-001).
2. **청사진 테이블 테스트.**(TEST-002) 스키마에서 청사진으로 가는 것은 순수 함수다(TEST-002). 조각 열거, 중첩, 노드 공유, `controls.discriminator` 변환을 표로 단언한다(TEST-002).
3. **정착 루프 테스트.**(TEST-003) 쓰기에서 커밋된 상태까지 동기이므로 타이머 flush 없이 단언한다(TEST-003). 프로토타입 v5·v6의 회귀 단언(63 + 108 + 26 + 52)을 이식한다(TEST-003). 정착 루프 시나리오(프로토타입 v5·v6 회귀 63+108+26+52와 v7 회귀 이식)(TEST-003).
4. **`renderForm` 시나리오.**(TEST-004) 하니스는 재사용하고 기존 시나리오의 기대값은 버리되 상황 목록(null 분기 위치, 배열 제거와 추가, 활성 0→1→0, 복수 활성, 배열 항목 재인덱싱)은 자산으로 옮긴다(TEST-004). 하니스(`src/__tests__/renderForm.tsx`)는 API 수준이라 재사용한다(TEST-004). 최종 스펙 동작은 렌더 시나리오로 단언한다는 패키지 규칙은 그대로다(TEST-004). 예외: 조합과 옛 키가 없는 17파일은 기대값을 이름만 바꿔 e2e의 추가 단언으로 살린다(16라운드 답 7, TEST-013)(TEST-005).

소유자(16라운드 답 7): "렌더 시나리오 17파일의 단언 유지 | "예" | 확정. TEST-004의 예외"(TEST-005).

### 2.2 시나리오의 단일 원천과 실행기

코어 시나리오와 e2e와 스토리가 같은 스키마·단계를 쓰도록, 시나리오를 실행기 없는 순수 데이터로 둔다(TEST-008).

```ts
// packages/aileron/schema-form-scenarios/src/<이름>.scenario.ts
export const scenario = {
  name: '결제 수단 전환',
  schema: { … },                 // 새 문법
  initialValue: { kind: 'card' },
  steps: [
    { path: '/kind', action: 'setValue', value: 'bank',
      expect: { shape: { '/account': 'present', '/cardNumber': 'absent' }, outputValue: { kind: 'bank' } } },
    { path: '/account', action: 'setValue', value: '110-1234',
      expect: { errors: { '/account': [] } } },
  ],
} satisfies FormScenario;
```

- **코어 러너**는 시나리오 부류마다 한 파일(`src/core/__tests__/scenarios/<부류>.spec.ts`)이며, 데이터 모듈을 이름으로 가져와 파일당 15건 이하로 두고 노드 트리만 만들어 단계를 `find(path).setValue(value)`로 해석하고 `expect`를 형상·`outputValue`·오류·`diagnostics`에 대고 단언한다(TEST-009). React 없음, 타이머 없음(TEST-009).
- **화면 어댑터** `playScenario`는 같은 단계를 `userEvent`로 해석하고 화면에서 보이는 것(입력란의 존재, 값, 오류 문구)을 단언한다(TEST-010). 이 어댑터는 e2e와 스토리가 함께 쓰는 해석기이며 데이터 모듈과 같은 비공개 패키지 `@aileron/schema-form-scenarios`에 둔다(16라운드 답 8)(TEST-010). 스토리는 e2e의 화면 미러이고 스토리북 자동화는 그 스토리의 `play`다(TEST-022)(TEST-010).

소유자(16라운드 답 8): "시나리오 모듈은 비공개 패키지 | "예 적절한 이름을 써주세요" | 확정. 이름은 편집자가 형제 이름을 따라 정한다"(TEST-010).
**시나리오 모듈의 자리 — 확정(답 8).**(TEST-010) 비공개 워크스페이스 패키지 `@aileron/schema-form-scenarios`(`packages/aileron/schema-form-scenarios/`)(TEST-008).
이름은 Vincent가 편집자에게 맡겼고, 형제 비공개 패키지(`@aileron/benchmark-form`, `@aileron/production-testbed`)의 자리를 따르며 담은 것(schema-form의 시나리오)이 이름에서 읽히게 했다(TEST-010).
그 패키지는 `@canard/schema-form`을 값으로도 형으로도 가져오지 않는다(가져오면 schema-form의 시험과 서로 가져오는 고리가 된다)(TEST-010).
그래서 `Form`·`FormHandle`·`FormScenario.schema`는 구조적 형으로 적고, 시나리오 감싸개는 `Form`을 주입받는다(TEST-010).
가능한지는 PR-0이 확인한다(TEST-010).

- 단계의 어휘는 `setValue`·`clear`·`push`·`remove`·`update`·`submit`·`reset`·`batch`로 닫고, 필요하면 PR마다 더한다(TEST-011). 화면 단언은 경로를 `data-path`로 찾는다(`SchemaNodeProxy`와 `DeferrableNodeProxy`가 붙인다)(TEST-011). 화면 입력으로 풀 수 없는 단계(`batch`, `reset`, `submit`, `update`, 잎이 아닌 경로의 `setValue`)는 화면 어댑터가 `FormHandle`로 실행한다(TEST-011). **핸들은 그린 쪽이 DOM에 등록하고 어댑터는 받은 요소 자신과 그 자손에서 찾는다**(편집자 결정, 16라운드 답 10으로 확정)(TEST-011). 스토리·플러그인 패키지에서는 감싸개 루트가 받은 요소의 자손이고 e2e에서는 받은 요소 자신이다(TEST-011). 스토리는 시나리오를 그리는 감싸개가 자기 루트 요소에, e2e는 `renderForm`이 돌려준 핸들을 `container`에 등록한다(TEST-021)(TEST-011). 등록이 DOM을 거치므로 호출 모양은 스토리·e2e·플러그인 패키지 모두 `playScenario(scenario, 요소)` 하나이고, `render(<Story />)`와 `Story.play()`가 서로 다른 스토리 문맥을 만들어도(Storybook 10.4.1) 핸들이 건너간다(TEST-011). 핸들을 어댑터의 인자로 넘기는 안은 호출 모양이 경로마다 달라지고 플러그인 패키지 경로에서 성립하지 않아 버렸다(TEST-011). 감싸개·등록 함수·표식의 이름은 PR-0의 어댑터 뼈대가 정한다(TEST-011).
- 수백 개 조합(검증 매트릭스)은 스토리로 만들지 않는다(TEST-012). 행을 정적으로 적은 `test.each` 표로 돌리되 파일당 상한을 지키고 스토리북에는 대표만 둔다(antigravity 조사의 권고와 같다)(TEST-012).

### 2.3 기존 시험과 렌더 하니스의 처분

234파일을 넷으로 가른다(TEST-013).
(TEST-013, WRITE-052, TEST-068)

| 부류 | 기준 | 대표 | 규모 |
| --- | --- | --- | --- |
| 그대로 산다 | 순수 함수이거나 타입 사상, 새 엔진에 시그니처와 뜻이 그대로, 타이머 없음, LANDING-004–LANDING-046, LANDING-145, LANDING-048, LANDING-049, LANDING-149의 어느 행에도 안 걸림. 단위가 옮겨 가면 시험도 함께 옮긴다 | `helpers/jsonPointer/utils/__tests__/*`, 식 정규식 시험(옮김), 잎 교차 시험(먼저 승 관련과 `intersectEnum`·`intersectConst`·`validateRange`의 throw 단언 제외. 이 셋의 throw 단언은 '버리고 새로 쓴다'로(공집합 표시를 단언한다). `intersectConst.test.ts:40-58`의 참조 비교 단언과 `intersectPattern.test.ts:6-14`의 전방 탐색 단언도 '그대로 산다'에서 빠진다), `ArrayNode/utils/__tests__`, `InferSchemaNode.type.test.ts` | 약 30 |
| 표면만 고친다 | 모든 단언의 기대값이 08 규칙에서 그대로 나오고 이름만 바뀐다(`computed` → `controls`, `normalizedValue` → `outputValue`, `FormGroup` → `FormTypeGroupRenderer`, `JSONSchemaError` → `ValidationIssue`). 단언마다 LANDING-004–LANDING-046, LANDING-145, LANDING-048, LANDING-049, LANDING-149와 대조한다 | 조합·옛 키 없는 렌더 시나리오 17파일(`array.mutation-identity`, `controlled-interaction`, `default-value`, `formType-resolution`, `state-management`, `validation.errors` 등). 반례: `terminal-mode`의 "터미널 아래 `find`가 터미널을 돌려준다"는 LANDING-020에 걸려 재작성. 이 17파일도 스키마와 단계는 데이터 모듈로 옮기고, 단언은 이름만 바꿔 e2e의 추가 단언으로 둔다(16라운드 답 7로 확정) | 약 25 |
| 버리고 새로 쓴다 | 기대값이 LANDING-004–LANDING-046, LANDING-145, LANDING-048, LANDING-049, LANDING-149 이주 행(분기 자동 감지, `oneOfIndex`, `schemaPath`, 복원, 주입 순환 차단, 루트 전역, 먼저 승, 마이크로태스크 타이밍)이나 삭제될 내부를 단언한다. 노드마다 타입에 맞는 parse를 두고 뜻이 그대로인 변환만 남긴다. **상황 목록은 자산으로 옮긴다**(TEST-008의 데이터 모듈로) | `core/__tests__` 87파일 가운데 옛 표면 52·타이머 의존 78, `oneOfSchemaPath`, `AbstractNode.injectTo`, `core/parsers/__tests__`, 렌더 시나리오 `composition.*`·`computed.*` | 약 150 |
| 미분류 | 위 세 부류의 기준으로 아직 가르지 않은 것. PR-0의 처분 목록에서 파일마다 가른다 | — | 약 29 |
| 새로 있어야 한다 | 설계의 새 장치마다 시험이 없다 | TEST-014, TEST-069, TEST-016–TEST-020 | — |

소유자(18라운드 S1): "S1. node 는 각자의 타입에 맞는 parse 함수를 가져야 합니다. 지금처럼요."(TEST-013)

실제 React 렌더(`act`, `userEvent`, StrictMode, 재마운트 계측)이고 447건이 통과하므로 e2e 층의 뼈대로 쓴다(TEST-021).
고칠 것 다섯: `setupValidatorPlugin`에 동기 `compileGuard`와 루트 등록, `caughtErrors`가 창 이벤트만 잡으므로 주인 없는 오류 싱크와 `onError` 관찰용 도우미(REACT-007, ERROR-088, ERROR-089), `reset`의 뜻(WRITE-042, 16라운드 스웜 수렴(편집자 결정): 호출 안의 동기 로드와 커밋 재대조), `flushOnMount: false`(26회)의 "초기 스냅숏" 뜻이 동기 정착에서 사라지는 것, 돌려주는 핸들을 `container`에 등록해 화면 어댑터가 찾게 하는 것(TEST-011)(TEST-021).

(TEST-021)

| 두 단계 테스트 하네스 | `__tests__/renderForm.tsx:63-66`(13개 파일) | 생성이 곧 첫 정착이다 | 단일 단계 단언(제약 T-5(두 단계 단언 — 동기 단계와 정착 단계), F23) |

### 2.4 단계별 새 시험

(TEST-014, TEST-016, TEST-017, TEST-018, TEST-019, TEST-020, CONTROLS-079, ERROR-198, WRITE-083, LANDING-145, LANDING-206)

| PR | 시험 |
| --- | --- |
| PR-1 | 청사진 테이블 시험(조각 열거, 전순서, 노드 공유, `controls.discriminator` 변환과 끌어올림, `extras` 정적 집합, 역의존 표, 청사진 오류·경고), 병합표 시험, 제거 규칙 시험(키워드 위치만), 식 컴파일러 시험(옮긴 9파일 + 기준점 호스트. `regex.test.ts`의 `SIMPLE_EQUALITY_REGEX` 묶음은 그 상수와 함께 옛 엔진에 남긴다), `options`·`presentation` 병합의 원자(React 요소, ref 모양)·한쪽 값의 참조 이동·양쪽 객체의 쓰기 시 복사(작성자 객체를 변이하지 않음, `@winglet/common-utils`의 `merge` 선택 인자 포함), 선언 사이 `options.terminal`·렌더 계층 판정의 불일치(노드가 형상에 있는 경우마다 순서대로 정한 전략이 다르면 청사진 오류. 게이트 없는 선언끼리는 나중 승, 조각에만 선언된 노드는 조각이 모두 꺼진 경우를 비교하지 않음(조각 하나에만 선언된 노드의 인라인 `presentation.FormTypeInput`·`options.terminal`은 오류가 아님, 두 조각이 같은 노드에 서로 다른 전략을 주면 청사진 오류), 게이트 없는 선언의 `options.terminal`이 정한 노드에 조각이 인라인 입력을 더해도 오류가 아님, 판정의 없음은 앞 판정을 지우지 않음), 청사진 경고의 데이터 수집(수집기 인자, 코드·`schemaPath`·판별 칸, 소비자가 없으면 모으지 않음, 캐시 청사진의 늦은 수집이 작성 루트마다 한 번) |
| PR-3 | 같은 대상 규칙(종류·문서 순서·층·전순서·정착 단위), 에지 소비, `DisableAutomaticWrites`, 개발 모드 정착 기록 |
| PR-4 | 디스패처(진입당 1회, 되먹임 상한, 구독 뒤 따라잡기), 사슬 끝 throw와 `onError`, `onError` 계약의 core 쪽 시험(사슬 끝의 기록마다 발생 순서 전달과 경고 포함, 묶음의 `aggregate`와 구성 기록, 핸들러가 던질 때의 묶음(원래 드러날 값을 펼치지 않고 `details.errors`의 앞에), 핸들러 안 쓰기의 즉시 거부와 비전달, `validate()` 허용, 경고 구조 키 중복 억제(같은 노드의 다른 `allOf` 키워드는 따로), 핸들러 없는 프로덕션에서 기록·서식·정착 경고 판정 없음(할당 계측), 마운트 뒤 핸들러를 단 폼은 그 뒤 사건만 받음, 원시값 예외의 전달, 검증기 실행 실패의 기록과 `ValidationError`의 비기록), 검증기 없음의 경고(거부하지 않음, 트리마다 한 번, 같은 스키마 reset과 `setValue(V)`에서는 다시 보내지 않음)와 전체 스키마 컴파일 실패의 거부(모든 환경), 커밋 스탬프와 실행 합치기, (루트, 위치) 가드와 같은 `$id` 재등록, ajv6·7·8 동기 가드, 차등 시험(독립 검증기와의 판정 동치), **훅 수준 바인딩 시험**(동기 통지와 `useSyncExternalStore`, StrictMode 이중 호출) |
| PR-5 | 배열 아이템의 생김과 채움, `push`·`remove`·`update`의 identity, `omitTrailing`, 터미널 배열 행의 구조 연산(원본 사본 위의 `push`·`pop`·`update`·`remove`·`clear`), `resolveArrayLimits`의 청사진 이동과 옮긴 시험 |
| PR-6 | 잠금 OR·표시 AND, `controls.children`, 조각 `controls`, `unsetOnInactive` 층 |
| PR-7 | e2e: 렌더 중 `onChange` 없음, 마운트 동안 `onChange`·`onDiagnosticsChange` 버림과 `onError`의 커밋 뒤 한 번 전달, 마운트 정착 오류의 원인별 폼 서기(공유 충돌은 대체 화면), 바운더리의 가두고 보고하기(렌더 때 보고기 읽기, 주인 없는 오류 싱크), 싱크의 세 경로(`reportError`, `ErrorEvent`가 있을 때만 보내고 취소되지 않으면 `console.error`, 서버의 `console.error`), `WeakSet`으로 바운더리가 다시 잡은 값의 핸들러 전달 한 번 거르기, 로드 객체 전달함 표지로 StrictMode에서 한 번, `degraded` 제출 거부(모든 환경, R17-1 나), `degraded` 동안 제출 경로의 거부와 `getValue()`의 허용(TEST-017, TEST-020), `onError` e2e(받는 것·받지 않는 것 목록 대조: 검증 결과·정착 추적·호스트 `onSubmit` 예외는 오지 않음. 핸들러 유무에 따른 동작 동일(throw·거부·싱크·콘솔). 프로덕션 빌드의 경고 기록. 로드 기록의 준비 이펙트 전달과 청사진 오류 대체 화면의 전달. 루트 바운더리가 하위 트리를 버린 로드의 오류 층 기록이 렌더 실패 기록보다 먼저 감. `componentDidCatch`에서 핸들러가 던질 때 호스트 바운더리가 발화하지 않고 싱크가 한 번. 이펙트에서 연 사슬의 throw가 필드 바운더리에 다시 잡힐 때 핸들러가 한 번. 모듈 수준·`FormProvider`·폼마다의 필드 바운더리가 인스턴스 보고기에 닿음. 네이티브 submit의 `degraded` 거부가 `onError`와 싱크로 감. 서버 렌더에서 핸들러를 부르지 않고 하이드레이션 뒤 한 번), `finishInput` 신호와 `trim`(포커스 아웃 때만 자름, 입력 중에는 자르지 않음, 같은 값이면 쓰지 않음. `trim` 쓰기는 입력 출처 쓰기가 아니라 자동 쓰기이므로 PR-7 시험은 바깥 오류와 dirty가 그대로이고 그 노드의 입력이 Refresh를 받는 것을 단언한다), `node.strategy`로 옮긴 `FormGroupRenderer`(UI 플러그인 넷의 이주와 시험은 PR-7이 아니라 플러그인 PR이 하고 PR-7은 기본 입력으로 검증한다, LANDING-206), 입력 출처와 Refresh, `reset`의 시험 목록(16라운드 스웜 수렴(편집자 결정)), React 18 실행(동료 의존 `>=18 <20`인데 오늘 설치는 19뿐, 16라운드 답 5. React 18 개발 모드는 렌더 오류를 전역 오류로 다시 재생하므로 바운더리가 잡은 오류가 `window` 'error'에 두 번 닿을 수 있는 이중 보고를 확인한다) |

`controls.injectTo`는 함수 형태 하나라 청사진이 정적으로 아는 대상이 없으므로 PR-1 시험에 정적으로 아는 `controls.injectTo` 대상 없음의 청사진 오류가 없고, 대상 경로가 청사진에 없거나 터미널 아래인 경우는 동적 대상 없음 `INJECT_TARGET_MISSING`이다(TEST-014, CONTROLS-079, ERROR-198).
【추론】 PR-1 병합표 시험이 이 표현(SCHEMA-045)을 단언한다(TEST-014).
【추론】 (다) 파생 라운드 예산과 그 `degraded`, `DisableAutomaticWrites`의 파생·`injectTo` 억제는 PR-3으로 미룬다(TEST-016).
`hooks/`에는 오늘 시험이 하나도 없다(TEST-017).
PR-4의 훅 시험이 처음이다(TEST-017).
【추론】 되먹임 파동과 `onChange` 중첩 예산, 진입 사슬의 사슬 끝 throw(중첩 진입, 통지·`onChange`와의 순서, `details.errors` 묶음)는 PR-4로 미룬다(TEST-017).
【추론】 원본 B의 배열 아이템 구조 기록은 PR-5로 미룬다(TEST-018).
PR-5 시험에 위치 재조정(키 유지와, 위치를 따라가는 `dirty`·`touched`·바깥 오류·가상화 기록·노드 참조), 청사진 없는 자리의 `extras` 보존, 구조 연산에서 값이 노드와 `extras` 사이를 옮기는 것을 더한다(TEST-018).
【추론】 나감 비움의 `children` 항목 층, 조각 `controls` 층, 식 값(직전 커밋)은 PR-6으로 미룬다(TEST-019).
소유자(16라운드 답 5): "React 18 계속 지원 | "예" | 확정"(TEST-020).
PR-7의 시험: 터미널 입력의 다시 마운트(`reset.pristine:267-309`의 단언 유지), 값 전체를 그리는 브랜치 입력과 빈 배열 입력은 다시 마운트되고 자식을 그리고 있는 기본 객체·배열 입력은 아님, 대체된 입력의 늦은 `onChange`·`onFileAttach` 폐기, 재생성 reset 뒤 옛 입력(컨테이너 입력 포함)의 언마운트 flush와 늦은 `onFileAttach`, 흐림 뒤 미룬 `touched`와 컨테이너 입력의 늦은 `onChange`(그 `dirty` 표시와 외부 오류 지움 포함)는 조용히 버려지고 옛 노드 참조로 한 쓰기는 `SchemaFormError`, 흐림 직후 reset과 `clearState`의 `touched`, 같은 처리기의 prop 갱신 뒤 reset(`startTransition` 안 포함), 인라인이지만 같은 스키마의 로드(노드 identity 유지)와 함수 칸 차이의 재생성·경고, `properties` 순서만 바꾼 스키마의 reset은 재생성, `batch` 안의 두 경로(reset 뒤의 읽기와 부분 쓰기의 결과가 경로와 무관함), 검증 모드 비트별 마운트·reset 검증, `onStateChange`는 바뀐 때만, `showError` 복귀, `reset(option?)`의 억제 비트 두 방향(Form 속성 `disableAutomaticWrites`와의 우선순위, 둘 다 주면 억제)과 재대조가 원래 호출의 억제 비트를 쓰는 것, `diagnostics` 재기록(로드가 `degraded`와 제출 거부를 푼다, R17-1 나), 가설 H1–H5(`reviews/raw-round16-reset.md` §4)의 실행 확인(TEST-020).
【추론】 `degraded` 동안의 제출 거부는 PR-7로 미룬다(TEST-020).

### 2.5 청사진과 노드 트리의 검증 관문

- PR: PR-1·PR-2(표본 (c′)는 PR-2)(TEST-067).
- (a) `@winglet/json-schema` 스캐너가 `$ref`의 대상 위치를 주는지, 순환을 `referenceSkipped: 'cycle'`로 알리는지 확인한다(TEST-067).
- (b) 코퍼스 14종(재귀 pydantic 트리 포함)이 모두 선다(TEST-067).
- (c) 무한 형상 표본 셋(자기 참조 객체 프로퍼티, nullable 자기 참조, A↔B 상호 참조)은 청사진 오류가 나고, 배열·게이트·터미널로 끊은 표본은 선다(TEST-067).
- (c′) 표본 "`required` 없는 `if/then`으로만 끊긴 재귀 → 정착 오류"를 PR-2에서 확인한다(예: `Node = { properties:{hasChild:{}}, if:{properties:{hasChild:{const:true}}}, then:{properties:{child:{$ref:Node}}} }`에 값 `{hasChild:true}`)(TEST-067).
- (d) `$ref`가 많은 스키마에서 청사진 1회 비용을 잰다(TEST-032의 벤치 행)(TEST-067).
- 통과: (b)와 (c)가 성립한다(TEST-067).
- 실패: 스캐너가 (a)를 못 주면 오늘의 `getReferenceTable`로 청사진이 스스로 푼다(편집자 선에서 처리)(TEST-067).
- 실패: (b)나 (c)가 실패하면 소유자에게 올린다(TEST-067).

【추론】 (4) TEST-013의 '그대로 산다'에서 뺄 것은 둘이다(TEST-068). 【추론】 하나는 `utils/__tests__/intersectConst.test.ts:40-58`의 참조 비교 단언으로, '버리고 새로 쓴다'로 옮겨 깊은 비교를 단언한다(TEST-068). 【추론】 다른 하나는 `utils/__tests__/intersectPattern.test.ts:6-14`의 전방 탐색 문자열 단언으로, 레거시와 함께 가며 새 병합 시험은 `'ab'`·`'Abc123'`·역참조·같은 이름 캡처 그룹 사례로 목록 표현을 단언한다(TEST-068).

【추론】 "각 PR은 새 코드와 그 시험만으로 독립 검증된다"(LANDING-051)는 각 PR이 자기가 들여오는 기제를 검증한다로 읽는다(TEST-069). 【추론】 뒤 PR의 기제가 있어야 하는 사례는 그 기제를 들여오는 PR의 시험으로 넘기며, 잃지 않도록 PR-0의 처분 목록이 사례마다 PR 번호를 단다(TEST-069).

【추론】 (가) PR-2는 예산 다섯 가운데 호스트 바퀴와 전이 라운드를 실제 코드로 시험한다: 초과 시 원본 B 커밋, `diagnostics`의 `'degraded'`·`cause: 'budget'`·`exceededBudget`(`'hostWheel'`·`'transition'`), 다음 로드까지의 지속(TEST-069). 【추론】 `diagnostics`와 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화한다(TEST-069). 【추론】 `setValue(V)`와 `resetSubtree()`는 초기화하지 않는다(TEST-069).

【추론】 PR-2는 원본 B의 되돌림 기록 가운데 노드·이전 `raw`·이전 `extras`와 객체 자식의 생김·빠짐을 시험한다(TEST-069). 【추론】 PR-2는 정착 오류의 throw를 시험한다(TEST-069). 【추론】 PR-2에서 사슬은 `settle` 호출 하나다(`setValue`가 `settle` 쓰기로 직접 위임, `reviews/raw-round17-node-structure.md:74`)(TEST-069). 【추론】 커밋과 `diagnostics` 뒤 그 호출의 끝에서 던지는 것을 시험한다(TEST-069). 【추론】 PR-2는 식·가드 실패의 자리별 값과 `cause: 'expression'`을 시험하며, 식은 PR-1의 실제 컴파일러를 쓴다(TEST-069). 【추론】 PR-2는 `SetValueOption` 넷(억제 비트는 PR-2에 있는 자동 쓰기인 채움에 대해)과 로드의 새 수명을 시험한다(TEST-069). 【추론】 PR-2는 나감 비움 가운데 노드 자신의 층과 Form 속성 층을 시험한다(TEST-069). 【추론】 그 값은 참·거짓 리터럴이고, 하위 트리로 내려감, 자손의 `false`가 이김, 선언의 나감, 잠복 자손 비움, `extras` 불변을 포함한다(TEST-069). 【추론】 PR-2는 노드 구조 시험 전부, 린트 설정, `active` 게터, SETTLE-042의 키 순서(직렬화 단언 포함), TEST-070의 형 게이트를 시험한다(TEST-069).

"노드 구조 시험(행 칸 순서 시험: 모든 행의 칸 키와 순서가 같음. 겉면 멤버 목록 시험: 프로토타입 멤버 이름과 `SchemaNode/`의 `DETAIL.md` 목록의 일치. 공개 index 키 목록: 내부 통로가 `src/index.ts`에 없음. 행 고르기 함수의 조합 전수. 공개 형의 키 목록 타입 시험. `isTerminalNode`가 터미널 객체도 좁힘), `SchemaNode` 클래스 파일에 거는 린트 설정, `active` 게터"(TEST-069).

- PR: PR-2 정착 시나리오(TEST-069의 PR-2 시험)와 PR-2 벤치(TEST-069, SETTLE-045).
- (a) 사촌 하위 트리를 읽는 노드 게이트를 단언한다(TEST-069).
- (b) `#`를 읽는 게이트를 단언한다(TEST-069).
- (c) 서로를 읽는 두 호스트의 양의 순환이 이력과 무관하게 같은 원본에서 같은 형상을 내는지 단언한다(TEST-069).

【추론】 (나) 시험 대역은 게이트 술어 하나다(LANDING-062의 "게이트는 술어 인터페이스 뒤의 스텁")(TEST-069). 【추론】 대역의 계약은 PR-4의 `compileGuard`가 돌려주는 술어와 같은 모양이다: 게이트 입력 값 하나를 받아 참·거짓을 돌려주고, 동기이며, 순수하다(같은 입력에 같은 답)(TEST-069). 【추론】 던지는 대역으로 가드 평가 실패(정착 오류)를 시험한다(TEST-069). 【추론】 PR-4는 같은 시나리오를 실제 가드로 다시 돌린다(TEST-069). 【추론】 그 밖의 대역은 두지 않는다(TEST-069). 【추론】 시험만을 위한 주입 자리(파생 단계, 디스패처)를 새로 만들지 않는다(seiri `public-contract` §3)(TEST-069).

【추론】 (다) 파생 라운드 예산과 그 `degraded`, `DisableAutomaticWrites`의 파생·`injectTo` 억제는 PR-3으로 미룬다(TEST-069). 【추론】 되먹임 파동과 `onChange` 중첩 예산, 진입 사슬의 사슬 끝 throw(중첩 진입, 통지·`onChange`와의 순서, `details.errors` 묶음)는 PR-4로 미룬다(TEST-069). 【추론】 원본 B의 배열 아이템 구조 기록은 PR-5로 미룬다(TEST-018의 PR-5 행에 더함)(TEST-069). 【추론】 나감 비움의 `children` 항목 층, 조각 `controls` 층, 식 값(직전 커밋)은 PR-6으로 미룬다(TEST-019의 PR-6 행 "`unsetOnInactive` 층"에 명시)(TEST-069). 【추론】 `degraded` 동안의 제출 거부는 PR-7로 미룬다(TEST-069).

【추론】 (라) 프로토타입 회귀의 배분: 한 사례는 그것이 건드리는 기제가 모두 있는 가장 이른 PR로 간다(TEST-069). 【추론】 `selfcheck-v5`(63)는 a·b·c·d·e → PR-2(c 가운데 주입을 쓰는 단언은 PR-3), f(`disableAutomaticWrites`) → PR-3, g(통지) → PR-4로 간다(TEST-069). 【추론】 `r8-port`(q8 108, 예산·원본 B 행렬)는 호스트 바퀴·전이만 쓰는 행 → PR-2, `derived`·`injectTo`를 쓰는 행 → PR-3으로 간다(TEST-069). 【추론】 `r7-port`(52, E1–E13·X*)는 에지 발화 파생·`injectTo` → PR-3, X2·X3의 한 진입 묶음과 D-17 파동 세기 → PR-4로 간다(TEST-069). 【추론】 `edge-cases`(26, `spikes/round9/regress/edge-cases.mjs`)는 조각 생김·채움·덧씌움 기본값·`allOf` else → PR-2, `clearValue`·`injectTo`·단계 순서·파생 예산 → PR-3, 잠금 결합 → PR-6으로 간다(TEST-069). 【추론】 v7 회귀는 게이트 입력 `extras`·전이 상한·재계산 목록 순회·나감 비움(노드 자신·Form 속성 층) → PR-2, 같은 순위 동점·정착 단위 순위 → PR-3, 나감 에지 → PR-3(조각 `controls` 층의 사례는 PR-6)으로 간다(TEST-069). 【추론】 안건 `reviews/round-18-agenda.md:56`의 실행 확인(게이트 입력 `extras` 정적 규칙, 같은 순위 규칙, 나감 에지, 전이 라운드 상한이 나감 비움을 포함해 실제로 보장되는지)은 위 v7 회귀를 배분받은 PR의 시험으로 한다(TEST-069).

- PR: PR-2(TEST-070).
- 무엇: 실제 공개 형(`InferSchemaNode` 사상, 배열 멤버, S1(소유자 답 S1의 노드마다 타입에 맞는 parse, WRITE-052) 정합 상태 판별자)으로 새 fractal이 `tsc --strict`를 `as`·`any` 없이 통과하는지, `node.children`이 저장 배열과 같은 참조인지(시험) 본다(TEST-070).
- 통과: 둘 다 참이다(TEST-070).
- 실패: 두 선택지(가: 한 함수에 가둔 단언 하나를 승인, 나: 단언 없이 목록 읽기마다 원소 검사·복사)를 그대로 소유자에게 올린다(TEST-070).
- 실패: 그때 오늘 `src/core/nodeFromJSONSchema.ts:55`의 `as InferSchemaNode<Schema>`도 같은 물음의 대상으로 적는다(TEST-070).

【추론】 게이트(PR 02): E16(BLUEPRINT-045)의 새 기대와 게이트 분기만인 호스트·`{object,array}`·⊤ 분기·순환 절단과 빈 U의 사례가 `src/core/blueprint/__tests__/`에 한 건씩 있고, 순환 절단이 구현되어 형 없는 `$ref` 순환이 스택 넘침 없이 끝난다(TEST-079). 【추론】 게이트(PR 02): TEST-067(b)는 코퍼스 14종을 시험 파일로 돌려 원본 그대로 서야 하며, 통과하지 못하는 표본은 소유자에게 올린다(TEST-079, TEST-067). 【추론】 시험 `union.migration-shapes.render.test.tsx`에 LANDING-207의 모양을 더한다(TEST-079). 【추론】 시험 `union.migration-shapes.render.test.tsx`에 LANDING-208의 모양을 더한다(TEST-079). 【추론】 게이트(PR 02): 단일 종류(null 포함)·종류 혼합·객체 리터럴·분기 안의 `const`(그대로 오류)의 사례가 `src/core/blueprint/__tests__/`에 한 건씩 있다(TEST-079).

### 2.6 union의 시험 목록

- 【추론】 시험 `src/core/blueprint/__tests__/union.kind-procedure.test.ts`: 예 E1–E42(BLUEPRINT-045)의 종류·`schemaType`·nullable·전략·오류가 모두 표대로다(TEST-077). E16은 BLUEPRINT-048의 새 기대를 단언한다(TEST-077, BLUEPRINT-048, TEST-079).
- 【추론】 시험 같은 곳 `union.null-only.test.ts`: E30·E32·E33은 null 노드이고 nullable이며 오류가 없고, E34·E35·E38은 nullable이며, 모든 선언이 `'null'`만인 정적 연언도 null 노드다(TEST-077).
- 【추론】 시험 같은 곳 `union.static-intersection.test.ts`: 모든 선언 쌍 X·Y에서 `{allOf:[X,Y]}`와 `{allOf:[Y,X]}`의 결과(원소 순서 제외)가 같고(E39), E18·E24·E31·E38은 교집합이며, E23만 `ALL_OF_TYPE_REDEFINITION`이다(TEST-077).
- 【추론】 시험 같은 곳 `union.schema-type-invariant.test.ts`: 모든 코퍼스 칸에서 `Array.isArray(schemaType) === (type === 'union')`이고, 같은 칸의 노드와 배열 아이템이 같은 `schemaType` 참조를 가지며, 그 참조는 `Object.isFrozen`이다(TEST-077).
- 【추론】 시험 같은 곳 `union.gated-narrowing.test.ts`: E25·E26·E41에서 게이트 전후로 `schemaType` 참조가 같고, 켜진 동안 유효 목록은 `['number']`·`schemaType`과 같은 `'number'`·`['integer']`이며, E40은 둘 다 켜지면 `SHARED_NODE_CONFLICT`이고, E42의 유효 목록은 `schemaType`과 같은 참조다(TEST-077, WRITE-099). 좁혀지지 않은 노드의 유효 목록은 `schemaType` 그 값(스칼라면 스칼라, 배열이면 그 배열 참조)이다(TEST-077, WRITE-099).
- 【추론】 시험 같은 곳 `union.terminal-subtree-warning.test.ts`: `['object','string']` 칸 `properties` 안의 `controls`가 경고를 한 번 내고, `$ref` 대상에서는 경고가 없으며, `options.terminal:false`는 ERROR-200이다(TEST-077).
- 【추론】 시험 `src/core/behaviors/utils/parse/__tests__/interpret.table.test.ts`: 변환 표(WRITE-093)의 모든 칸과 `"1.0"`·`"1e2"`·`"1e16"`·`"9007199254740993"`·`"01"`·`" true"`, `NaN`·`±Infinity`·`2**60`·`-0`·bigint·`Date`(object 멤버)·`Object.create(null)`(TEST-077).
- 【추론】 시험 같은 곳 `interpret.properties.test.ts`: `d-rule-a.mjs`의 전수 실행으로 순서 무관, 멱등, 변환 결과 ∈ 목록, 경우 집합이 정확히 12건, 원소 하나인 목록 = 단일 노드 행, 쓰기당 할당 0(TEST-077).
- 【추론】 시험 `src/core/behaviors/unionBehavior/__tests__/union.write-paths.test.ts`: 쓰기 경로마다 한 사례이고, `Merge` 객체 V는 통째 교체이며, `trim`은 문자열 값에서만 돈다(TEST-077).
- 【추론】 시험 같은 곳 `union.mismatch-light.test.ts`: 켜짐→켜짐이면 경고 0회, 꺼짐→켜짐이면 1회, 로드하면 다시 1회이고, `expected`는 `{schemaType, nullable, effective}`이며, `'ambiguous'`이면 `candidates`가 있다(TEST-077).

반영 칸(설계서 메모 4): "게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`."(TEST-077)

반영 칸(설계서 메모 4): "시험 파일 이름 `union.mismatch-light.test.ts`는 그대로이고, 시험이 부르는 게터·코드 이름은 확정 이름이다."(TEST-077)

- 【추론】 시험 `src/__tests__/scenarios/union.gated-effective-list.render.test.tsx`: E25에서 게이트가 켜진 뒤 친 `"42"`는 `42`로 저장되고, 켜기 전에 저장된 `"abc"`는 게이트가 켜지면 쓰기 없이 경고등이 켜지며 `source:'gate'` 경고가 1회 나고 `UpdateJsonSchema`로 배달되며, 게이트가 꺼지면 경고등이 꺼지고 값은 그대로이고, 입력 구성 요소는 바뀌지 않으며, E41에서 `1.5`는 켜진 동안 경고등이 켜진다(TEST-077).
- 【추론】 시험 `union.entry-two-step.render.test.tsx`: 게이트 `kind==='num'`이면 `a:number`인 스키마에서 직전 `kind`가 `'text'`일 때와 `'num'`일 때 각각 `setValue({kind:'num', a:'42'})`를 부르면 둘 다 `a === 42`이고, 마운트·`reset()`도 같으며, 쓰이지 않은 형제 노드는 다시 해석되지 않는다(TEST-077).

- 무엇: 렌더 시나리오 `union.entry-two-step`에 WRITE-098의 예의 폼을 더해, 직전 `kind`가 `'text'`일 때와 `'flag'`일 때 각각 `setValue({kind:'flag', a:0})`를 부르고, `defaultValue`가 `{kind:'flag', a:0}`인 마운트와, `kind`를 `'text'`로 바꾼 뒤 두 필드를 담은 객체 노드의 `resetSubtree()`를 돌린다(TEST-077).
- 통과: 모든 경우에 `a === false`이고 경고등이 꺼져 있으며, 쓰이지 않은 형제 노드는 다시 해석되지 않는다(TEST-077).
- 무엇: 렌더 시나리오 `union.entry-two-step`에 WRITE-099의 예의 폼과, `a`가 문자열이면 `boolean`으로 아니면 `string`으로 좁히는 폼(되먹임이 멈추지 않는 반례)을 더해 각각 `setValue({a:0})`를 부른다(TEST-077).
- 통과: 첫 폼은 `a === "0"`이고 경고등이 꺼져 있으며, 둘째 폼은 전이 라운드 상한을 넘겨 원본 B로 `a === 0`을 커밋하고 경고등이 켜지며 `diagnostics.status`가 `'degraded'`다(TEST-077).

- 【추론】 시험 `union.rule-a.render.test.tsx`: 규칙 A의 사례와 `['integer','number','boolean']`의 `"2"`→`2`(TEST-077).
- 【추론】 시험 `union.ambiguous.render.test.tsx`: `['string','boolean']`의 `1`·`0`은 값이 유지되고, 경고등이 켜지며, `reason:'ambiguous'`다(TEST-077).
- 【추론】 시험 `union.integer.render.test.tsx`: `['integer','string']`의 `12.5`→`"12.5"`, `['integer','boolean']`의 `12.5`는 경고등이 켜짐, E4는 number 규칙(TEST-077).
- 【추론】 시험 `union.object-array.render.test.tsx`: 멤버십, 변환 없음, 참조 유지, `find('/f/k') === null`, `./f/k` 식, 문자열 값에서 `./f/length`는 `undefined`, 기본 입력의 읽기 전용 JSON과 비우기, `['object','array']` 빈 상자(TEST-077).
- 【추론】 시험 `union.non-json-value.render.test.tsx`: `{a: undefined}`를 든 union과 터미널 객체에서 개발 모드 `NON_JSON_WHOLE_VALUE`가 1회 나고 값은 바뀌지 않으며, 프로덕션에서는 검사하지 않는다(TEST-077).
- 【추론】 시험 `union.default-input-draft.render.test.tsx`: `['number','boolean']`에서 `"4"`→`4`, `"42."`는 초안(쓰기·경고 0)이고 흐려지면 되돌림, `"true"`→`true`, 빈 칸은 `undefined`, nullable 비우기는 `null`이며, `['number','string']`에서 `"42"`는 문자열이고, 치는 도중 유효 목록이 넓어지면 초안을 다시 판정해 이제 맞는 글만 보낸다(TEST-077).
- 【추론】 시험 `union.omit-empty.render.test.tsx`: `''`·`{}`·`[]`는 방출하지 않고 `omitEmpty:false`이면 방출하며, 아이템 자리는 `null`이고 값 없는 루트는 `undefined`다(TEST-077).
- 【추론】 시험 `union.default-fill.render.test.tsx`: `default`는 값 전체로 들어가고, 로드된 `{}`는 덮지 않으며(객체 호스트와 대조), `['string','boolean']`+`default:0`이면 마운트 때 경고가 1회 나고, `setValue(undefined)` 뒤에는 다시 채우지 않는다(TEST-077).
- 【추론】 시험 `union.expressions.render.test.tsx`: `if`+`const`에서 `"1"`과 `1`을 가르고, 판별 키 union의 분기가 켜지며, 목록 밖 리터럴이면 `DISCRIMINATOR_BRANCH_UNREACHABLE`이 한 번 난다(TEST-077).
- 【추론】 시험 `union.migration-shapes.render.test.tsx`: TypeBox `anyOf[string,number]`, pydantic `anyOf[string,null]`, ts-json-schema-generator `type` 배열, OAS `nullable:true`+`type`, 그리고 LANDING-173–LANDING-180의 모양(TEST-077).
- 【추론】 시험 `union.migration-shapes.render.test.tsx`에 LANDING-207의 모양을 더한다(TEST-077).
- 【추론】 시험 `union.migration-shapes.render.test.tsx`에 LANDING-208의 모양을 더한다(TEST-077).
- 【추론】 시험 `union.input-binding.render.test.tsx`: 시험 대조(REACT-033)의 모든 칸, 인라인 `FormTypeInput` 우선, `FORM_TYPE_TEST_INVALID`(모르는 키, `type:'integer'`) 1회, `{typo: undefined}` 시험은 모르는 키를 빼고 대조, 정수 노드 props의 `type === 'number'`와 `schemaType === 'integer'`(TEST-077).
- 【추론】 시험 `schema-form-ajv{6,7,8}-plugin/src/**/__tests__/bind-refusal.test.ts`: `coerceTypes`·`useDefaults`·`removeAdditional` 가운데 하나라도 켠 인스턴스의 `bind`는 `VALIDATOR_BIND_REFUSED`를 던지고 이전 인스턴스가 그대로 남으며, 세 옵션이 꺼진 인스턴스와 기본 인스턴스는 받는다(TEST-077).
- 【추론】 시험 `schema-form-ajv8-plugin/src/**/__tests__/union-types.test.ts`: `{type:['string','number']}`를 컴파일할 때 `console.warn`이 0회이고, `{type:[..], nullable:true}` 컴파일 뒤에도 작성 스키마의 `type` 배열이 그대로다(TEST-077).
- 【추론】 시험 `src/types/__tests__/union.type-test.ts`(tsc 전용): 형 사상(NODE-058), `InferValueType`·`InferJSONSchema`의 형, union props의 `value`(판별)와 `onChange`(목록 형), `NumberNode` props의 `type === 'integer'`가 TS2367(TEST-077).

### 2.7 스토리북의 구조와 이식

스토리는 e2e의 화면 미러다(TEST-022). 스토리북 안의 자동화 시험은 e2e를 미러한다(TEST-022). 중복 코드를 최소화해 관리와 회귀 방지를 함께 얻는다(TEST-022). 그래서 **시나리오는 한 곳(TEST-008)에 있고, 스토리는 그것을 가져와 그리며, 자동화는 그 스토리의 `play`를 돌린다.**(TEST-022)

스토리는 e2e의 화면 미러이고(파일당 다섯 줄), 자동화는 그 스토리의 `play`를 `@storybook/addon-vitest`가 브라우저 모드(chromium)로 돌린다(TEST-022).

(TEST-023)

| 계층 | 위치 | 역할 | 돌리는 것 |
| --- | --- | --- | --- |
| 단일 원천 | 비공개 패키지 `@aileron/schema-form-scenarios`(`packages/aileron/schema-form-scenarios/`)의 `src/**/*.scenario.ts` | 스키마·초기값·단계·기대(순수 데이터). 같은 패키지에 `FormScenario` 형, 화면 어댑터 `playScenario`, 시나리오 감싸개를 둔다. 비공개 패키지라 배포되지 않으며 `@canard/schema-form`을 가져오지 않는다(16라운드 답 8) | 없음 |
| 코어 시나리오 시험 | `src/core/__tests__/scenarios/<부류>.spec.ts` | 데이터 모듈을 노드 트리에서 해석 | vitest `node` |
| 시나리오 스토리 | `stories/scenarios/<이름>.stories.tsx` | 데이터 모듈을 가져와 시나리오 감싸개로 `<Form>`을 그리고(감싸개가 핸들을 등록한다, TEST-011) `play`는 `({ canvasElement }) => playScenario(scenario, canvasElement)` 한 줄 | `storybook dev`(화면), addon-vitest(자동화) |
| 스토리북 자동화 | 같은 스토리 파일 | `play`를 헤드리스 브라우저에서 | vitest 브라우저 모드 + `@storybook/addon-vitest`(playwright chromium) |
| `<Form>` e2e | `src/__tests__/e2e/*.test.tsx` | `renderForm(scenario.schema, { defaultValue: scenario.initialValue })`로 그리고(`renderForm`이 핸들을 `container`에 등록한다, TEST-021), 스토리와 같은 `playScenario(scenario, container)`를 돌린 뒤, 스토리에 둘 수 없는 단언(spy, StrictMode, 바운더리 보고, `onError`)만 더한다. 시나리오는 부류마다 실행기 하나(`src/__tests__/e2e/<부류>.test.tsx`, 코어 러너와 같은 부류, 파일당 15건 이하, 16라운드 답 10)가 돌리고, 추가 단언이 있는 시나리오만 자기 파일을 둔다 | vitest `jsdom` + `@testing-library/react`(16라운드 답 1) |
| 사용법 스토리 | `stories/usage/*.stories.tsx` | 문서용 소수. 시나리오를 가져오되 `play` 없음 | `storybook dev` |

한 시나리오는 파일 넷(데이터 모듈, 코어 러너, 스토리, e2e 실행기)에 나타나되 스키마와 단계는 한 번만 적힌다(TEST-023). 스토리 파일은 다섯 줄(제목, 가져오기, `args`, `play` 한 줄)이고, e2e는 부류마다 실행기 하나가 돌리고 추가 단언이 있는 것만 자기 파일을 둔다(TEST-023).

- vitest `test.projects`의 프로젝트 셋: `unit`(`node`, `src/**/*.{spec,test}.ts`에서 `render`로 가는 `.test.ts`를 `exclude`로 뺀 나머지), `render`(`jsdom`, `src/**/*.test.tsx`(e2e와 훅 시험)와 문서 객체 모델 전역을 쓰는 `.test.ts`(오늘 후보 9파일, PR-0의 처분 목록에서 가른다)), `storybook`(`storybookTest({ configDir: '.storybook' })` 플러그인, `browser: { enabled: true, headless: true, provider: 'playwright', instances: [{ browser: 'chromium' }] }`, `setupFiles: ['.storybook/vitest.setup.ts']`에서 `setProjectAnnotations([preview])`)(TEST-024). 오늘 `yarn test`가 모으는 `architecture/spikes/**`의 4파일 45건은 설계 실험의 기록이라 새 프로젝트에 넣지 않는다(시험은 제품의 회귀를 막는 것만 둔다, TEST-006. 편집자 결정, 16라운드 답 10)(TEST-024). 그 가운데 제품 동작에 남는 상황은 PR-7의 e2e로 옮긴다(TEST-024).
- 더할 의존: `@storybook/addon-vitest`(Storybook 10.4와 vitest 3.2에 호환), `@vitest/browser`(`playwright` 1.58.0은 루트에 이미 있다)(TEST-024). 루트의 `@storybook/test-runner` 0.24는 뺀다(스토리북 서버를 띄워 주소를 순회하는 구식 경로)(TEST-024).
- portable stories는 프레임워크 패키지 `@storybook/react-vite`의 `composeStories`·`composeStory`·`setProjectAnnotations`(TEST-024). `Story.run()`(8.2.7 이상)이 마운트·loaders·`play`를 한 번에 돌리고, 플러그인 패키지가 코어의 시나리오 스토리를 돌릴 때는(TEST-025) `render(<Story />)` 뒤 `await Story.play({ canvasElement })`(두 호출의 스토리 문맥은 다르지만 핸들은 DOM의 등록으로 건너간다, TEST-011)(TEST-024).
- `play` 안의 `expect`는 `storybook/test`의 것이며 vitest 단언과 같아 화면(인터랙션 패널)과 자동화 양쪽에서 같은 결과를 낸다(TEST-024). `step`은 패널용 래퍼라 vitest에서는 투명하다(TEST-024).

- 시나리오를 담고 있는 스토리(분기 전환, `allOf`, 조건부, 배열, 검증, 오류 표시)는 데이터 모듈로 옮기고 `stories/scenarios/`의 다섯 줄 스토리가 된다(TEST-025).
- 사용법을 보여 주는 스토리(플러그인 소개, `FormTypeInput` 교체, `Form.*` 합성 API, ref 핸들)는 `stories/usage/`에 소수만 남기고 새 문법으로 다시 쓴다(TEST-025).
- 스키마를 인라인으로 든 스토리는 남기지 않는다(TEST-025). 플러그인 패키지의 스토리(각 2–4파일)도 같은 규칙이며 코어의 시나리오 스토리를 `composeStories`로 가져와 자기 렌더러로 그린다(TEST-025).

소유자(16라운드 답 4): "옛 스토리 49파일의 처분 | "예. 전체 정리 허용합니다" | 확정. 옛 스토리는 전부 정리할 수 있다"(TEST-025).

옛 스토리는 PR-7에서 모두 정리되므로 이주 대상이 아니고, 새 시나리오 스토리는 스키마를 모듈 범위에 둔다(TEST-025). 스키마를 모듈 범위로 올리는 것은 권고다(함수·컴포넌트 칸을 렌더마다 만들면 reset이 재생성을 탄다)(TEST-025).

### 2.8 릴리스 시험과 배포 작업 흐름

다음은 기록이다(TEST-044). **오늘**(조사, `reviews/raw-round16-release.md`)(TEST-044).

- 워크플로는 둘이다(TEST-044). `performance-benchmarks.yml`(벤치와 과다 렌더 단언)과 수동 실행 전용 `publish-npm-packages.yml`이다(TEST-044). 배포는 `scripts/publish-packages.sh`가 `yarn pack`으로 `workspace:^`를 실제 범위로 바꾸고 이미 있는 판은 건너뛰며 npm OIDC(저장 토큰 없음)로 올리고, `scripts/tag-packages.sh`가 태그만 만든다(TEST-044). GitHub Release는 없다(TEST-044).
- `yarn lint`·`typecheck`·`test`·스토리북 빌드를 돌리는 워크플로가 없다(TEST-044).
- 판은 손으로 올린다(`yarn version`)(TEST-044). `@canard/schema-form` 계열 여덟(본체, ajv6·ajv7·ajv8 플러그인, antd5·antd6·antd-mobile·mui 플러그인)은 같은 판(0.16.0)으로 움직인다(TEST-044).
- changesets는 `@changesets/cli`·`@changesets/changelog-github`와 루트 스크립트만 있고 `.changeset/`이 없다(TEST-044). 루트 `CLAUDE.md`는 changesets를 쓰지 않는다고 적는다(TEST-044).
- 릴리스 전 점검이 없다(TEST-044). `@aileron/production-testbed`와 가져오기 시험 스크립트(`scripts/test-package-import.sh` 등)는 어느 워크플로도 부르지 않는다(TEST-044).

1. **changesets 가동.**(TEST-045) `.changeset/config.json`: `changelog: ["@changesets/changelog-github", { "repo": "vincent-kk/albatrion" }]`(repo 옵션이 없으면 생성기가 던진다), `fixed: [["@canard/schema-form", "@canard/schema-form-*-plugin"]]`(여덟), `privatePackages: { version: false, tag: false }`(기본값은 비공개 패키지의 판을 올린다), `baseBranch: "master"`, `updateInternalDependencies: "patch"`(기본값), `changedFilePatterns`는 아홉째(TEST-045, TEST-053). `fixed`의 근거: 플러그인 일곱은 `@canard/schema-form`을 동료 의존으로 선언하지 않아 사용자에게 보이는 호환 신호가 같은 판 번호뿐이고(일관성), 목표 C7(확장 계약의 재설계)이 무리의 동행을 요구한다(TEST-045, GOAL-020). 비용: `@winglet/*`의 patch 하나도 본체를 거쳐 무리 여덟의 재배포로 번진다(받아들인다)(TEST-045). 플러그인이 나중에 `@canard/schema-form`을 `workspace:^` 동료 의존으로 선언하면 동료의 minor에도 무리 전체가 major로 번지므로 그때 `___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH.onlyUpdatePeerDependentsWhenOutOfRange: true`를 둔다(TEST-045). `changeset version`은 `@changesets/changelog-github`가 `GITHUB_TOKEN`을 요구하므로 `changesets/action` 안에서만 돈다(TEST-045).

   소유자(16라운드 답 9): "정해지지 않았습니다. changeSet 을 사용한 표준 방법으로 바꾸고자 합니다. 릴리즈 테스트도 다시 작성해야 합니다. 지금 구조는 github actions를 보세요"(TEST-045). 소유자(C7): "스키마폼 관련 모든 버전은 일시에 메이저 버전급 변경을 진행한다."(TEST-045).

2. **배포는 오늘의 스크립트, 태그는 `changeset tag`.**(TEST-046) `changeset publish`는 pnpm이 아니면 `npm publish`를 불러 `workspace:` 범위를 바꾸지 않고 설정 기본값 `access: restricted`로 올리므로 쓰지 않는다(TEST-046). 루트 스크립트 `"release": "./scripts/publish-packages.sh && changeset tag"`를 두고 `changesets/action`의 `publish: yarn release`로 부른다(액션 입력에 `&&`를 직접 쓰지 않는다)(TEST-046). 액션은 `changeset tag`의 `New tag:` 줄과 각 패키지의 `CHANGELOG.md`로 GitHub Release를 만든다(TEST-046). 태그 형식은 오늘과 같다(`<이름>@<판>`, 있는 태그는 건너뛴다)(TEST-046). `dry_run`은 액션을 거치지 않는 별도 단계(`DRY_RUN=true ./scripts/publish-packages.sh`)로 가른다(액션을 거치면 올리지 않은 판에 실제 태그와 Release가 생긴다)(TEST-046). 한 패키지의 실패는 `exit 1`로 태그를 막고, 복구는 같은 커밋에서 실패한 작업을 다시 돌리는 것이다(새 푸시로 다시 돌리면 태그가 배포된 커밋을 가리키지 않는다)(TEST-046). 첫 가동 전 확인: 커밋 해시로 고정한 액션 원본에서 태그 푸시, `publish` 입력의 분할, `~/.npmrc`의 `_authToken` 처리가 OIDC와 부딪히지 않는지, `CHANGELOG.md`가 없을 때의 동작을 읽는다(TEST-046). npm Trusted Publisher 등록(`scripts/PUBLISHING.md`의 체크리스트)을 끝낸다(TEST-046). 망가진 `changeset:publish`(`yarn run:all && changeset publish`)는 지운다(TEST-046).

3. **작업 흐름은 `publish-npm-packages.yml` 한 파일.**(TEST-047) npm Trusted Publisher가 이 파일 이름에 묶여 있다(옮기면 공개 패키지 열여섯을 `npm login`과 이중 인증으로 다시 등록한다)(TEST-047). 실행 조건은 `push: master`와 `workflow_dispatch`(`dry_run` 유지)(TEST-047). 작업 다섯(TEST-047):
   - `version`(`changesets/action`을 `publish` 없이 돌려 판 올림 PR을 만들거나 갱신하고 `hasChangesets`를 낸다(TEST-047). `github.ref`가 `refs/heads/master`일 때만. 권한 `contents: write`·`pull-requests: write`, `id-token` 없음)(TEST-047).
   - `detect`(`hasChangesets`가 거짓이고 태그 없는 공개 패키지 판이 있으면 참을 낸다(TEST-047). `fetch-depth: 0`의 git 태그로 본다)(TEST-047).
   - `test`(`uses: ./.github/workflows/test.yml`, `if: needs.detect.outputs.pending == 'true'`. 재사용 작업 흐름을 부르는 작업은 단계를 가질 수 없어 `detect`와 가른다)(TEST-047).
   - `publish`(`needs: [detect, test]`, 권한 `id-token: write`·`contents: write`, 빌드(rolldown 경고 차단 단계 유지) → 릴리스 테스트(여섯째, TEST-050) → `changesets/action`의 publish)(TEST-047).
   - `release-test`(`needs: version`, `if: needs.version.outputs.hasChangesets == 'true'`, 빌드(rolldown 경고 차단 단계 포함)와 여섯째(TEST-050)의 릴리스 테스트, 권한 `contents: read`)(TEST-047).

   `concurrency`(`publish-npm-packages`, 취소 없음)는 그대로다(TEST-047). 작업 흐름 머리의 설명을 새 실행 조건에 맞게 고친다(TEST-047).

4. **토큰은 기본 `GITHUB_TOKEN`.**(TEST-048) GitHub App 토큰이나 개인 토큰을 두지 않는다(TEST-048). 최소 권한 규칙이며, changesets 표준 예시도 기본 토큰이다(TEST-048). 기본 토큰이 연 판 올림 PR에서는 다른 작업 흐름이 돌지 않으므로, '시험을 통과한 것만 나간다'는 판 올림 PR의 병합 조건이 아니라 배포 작업의 `needs: test`가 지킨다(배포할 바로 그 커밋을 검사한다)(TEST-048). 판 올림 PR은 판 번호와 변경 기록만 바꾸고 코드는 이미 `master` 푸시의 시험을 거쳤으므로 병합 뒤 실패하는 창은 좁다(실패 때는 여덟째, TEST-052)(TEST-048). 소유자의 손 작업 하나: 저장소 설정 'Allow GitHub Actions to create and approve pull requests'를 켠다(이름과 동작은 첫 가동 때 확인)(TEST-048).

5. **지속 통합 시험 작업 흐름 `.github/workflows/test.yml`을 새로 둔다.**(TEST-049) 실행 조건은 `pull_request`, `push: master`(문서만 바뀌는 푸시는 `paths-ignore`), `workflow_call`(TEST-049). 단계: `yarn install --immutable`, 의존 빌드, `yarn lint`, `yarn typecheck`, `yarn test`(TEST-049). 루트에는 오늘 `lint`·`typecheck`·`test` 스크립트가 없으므로(루트 `CLAUDE.md`는 있다고 적는다) 전환 PR이 루트에 `yarn workspaces foreach --all --topological-dev run <이름>` 형태로 더한다(TEST-049). 공개 패키지 전부(`@winglet/*`, `@lerx/promise-modal`, `@slats/agents-assets-sync` 포함)의 시험이 같은 관문 뒤에 선다(TEST-049). PR 실행에는 아홉째(TEST-053)의 `changeset status`를 더한다(TEST-049). 브랜치 보호의 필수 검사로는 삼지 않는다(기본 토큰의 판 올림 PR에서는 보고되지 않는다)(TEST-049). schema-form의 vitest 세 프로젝트와 `storybook` 프로젝트의 playwright chromium 설치는 PR-0이 이 파일에 더한다(전환 PR이 먼저 병합되면 schema-form은 오늘의 단일 `vitest run`으로 시작한다)(TEST-049).

6. **릴리스 테스트를 다시 쓴다 — 포장된 산출물을 검사한다.**(TEST-050)
   - (1) 포장: 판 가드 없이 공개 패키지 전부를 `yarn pack`하는 `scripts/pack-packages.sh`를 `publish-packages.sh`에서 떼어 내고 둘이 함께 쓴다(오늘은 판 가드가 `yarn pack`보다 앞이라 레지스트리에 있는 판은 포장되지 않는다)(TEST-050). 비공개 `@aileron/schema-form-scenarios`도 포장한다(TEST-050).
   - (2) 설치: `@aileron/production-testbed`를 저장소 밖 임시 폴더로 복사하고(워크스페이스 안에서는 `workspace:^`가 원본으로 풀린다), 공개 워크스페이스 전부(`@winglet/*`, `@lerx/promise-modal` 포함, 배포되지 않은 의존의 폐포)를 포장 파일로 강제하며(overrides), 플러그인 의존을 더하고, 제3자 의존의 판은 루트 `yarn.lock`의 판으로 고정한다(방법은 전환 PR이 정한다)(TEST-050). React 18과 19는 설치 단계의 판 덮어쓰기로 고른다(16라운드 소유자 답 5)(TEST-050).
   - (3) 검사: `skipLibCheck: false`인 별도 tsconfig로 배포된 `.d.ts`의 형 검사, 설치된 패키지 이름으로 ESM `import`와 CJS `require`(오늘의 가져오기 시험 스크립트를 옮겨 쓴다), testbed 빌드, 대표 시나리오 그리기(감싸개에 포장된 `Form`을 주입, TEST-010)(TEST-050). 조합은 쌍으로 덮는다: UI 플러그인 넷을 각각 ajv8과, ajv6·ajv7을 각각 UI 하나와 짝지어 React 판마다 여섯, 모두 열둘(UI 플러그인과 검증기 플러그인은 서로를 가져오지 않고 코어 계약으로만 만난다(TEST-050). 코어를 거치지 않는 경로가 나오면 곱으로 되돌린다)(TEST-050).
   - (4) 시점: 변경이 대기 중인 `master` 푸시(판 올림 PR이 갱신될 때)에 셋째(TEST-047)의 `release-test` 작업으로 한 번, 셋째(TEST-047)의 `publish` 작업 안에서 빌드 뒤·올리기 전에 같은 빌드로 한 번(TEST-050).

   릴리스 전환 PR은 `master`에 시나리오 패키지가 없으므로 릴리스 테스트를 오늘 배포된 패키지로 시나리오 그리기 없이 돌리고, 조합 열둘의 시나리오 실행은 PR-8의 게이트다(LANDING-097은 전환 PR이 재설계와 독립이라고만 정한다)(TEST-050).

### 2.9 릴리스 관문과 정리

7. **배포 시점: 판 올림 PR을 병합하면 자동으로 배포한다.**(TEST-051) `master`에 태그 없는 공개 판이 있고 대기 중인 changeset이 없으면 `detect → test → publish`가 돈다(TEST-051). '언제 나가는가'의 통제는 소유자가 판 올림 PR의 병합을 누르는 동작으로 남고(오늘의 작업 흐름 머리가 지키던 것), 수동 실행을 남기면 `master`의 판·`CHANGELOG.md`와 npm·태그가 어긋나는 창이 생긴다(TEST-051). 판 변경이 어떤 길로든 `master`에 들어오면(직접 푸시 포함) 배포된다는 것을 `scripts/PUBLISHING.md`에 적는다(TEST-051). `workflow_dispatch`는 실패 뒤 다시 돌리기와 `dry_run` 점검용으로 남는다(TEST-051). 첫 가동은 안전하다(공개 패키지 열여섯의 현재 판은 모두 태그가 있다)(TEST-051).

8. **병합 뒤 시험 실패의 복구.**(TEST-052) 판 올림 PR 병합 뒤 `test`가 실패하면 고치는 커밋에 patch changeset을 더해 다음 판으로 낸다(TEST-052). 실패한 판은 배포되지 않은 채 건너뛴다(그 `CHANGELOG.md` 제목은 남는다)(TEST-052). 같은 판 번호로 고친 것을 올리면 그 수정이 변경 기록에 빠지므로 하지 않는다(TEST-052).

9. **changeset 존재 검사.**(TEST-053) 시험 작업 흐름의 PR 실행에 `yarn changeset status --since=origin/${{ github.base_ref }}`를 넣고(`checkout`은 `fetch-depth: 0`) 없으면 실패하게 한다(TEST-053). 릴리스가 필요 없는 변경은 `changeset add --empty`로 통과한다(TEST-053). 우산 브랜치로 가는 PR은 `changeset add --empty`로 통과하고, `fixed` 무리의 동작 변경 기록은 PR-8의 changeset이 맡는다(무리 밖 패키지는 열한째(TEST-055)처럼 그 패키지를 바꾸는 PR이 자기 changeset을 더한다)(TEST-053). `changedFilePatterns`는 패키지 폴더 기준의 부정 패턴으로 둔다: `["**", "!architecture/**", "!**/INTENT.md", "!**/DETAIL.md", "!CLAUDE.md", "!stories/**", "!bench/**", "!**/*.test.*", "!**/*.spec.*", "!**/__tests__/**", "!vitest.config.*"]`(`docs/**`·`bin/**`·`scripts/**`·빌드 설정·`README.md`는 배포되는 입력이라 남긴다)(TEST-053). 적용 전에 문서만 바꾼 PR과 `docs/agents`를 바꾼 PR로 `changeset status --verbose`를 돌려 확인한다(TEST-053). 소유자의 직접 푸시는 이 검사가 막지 못하므로 루트 `CLAUDE.md`의 규칙(열째, TEST-054)이 덮는다(TEST-053).

10. **자리와 저장소 정리 — 별도 PR, PR-8 전에 병합.**(TEST-054) 저장소 전체의 일이라 재설계와 독립이며 PR-0과는 순서가 없다(다섯째, TEST-049)(TEST-054). 그 PR이 함께 하는 것: 루트 `CLAUDE.md`의 개발 흐름 6번(판을 손으로 올리고 changesets와 CHANGELOG를 쓰지 않는다)을 'changeset을 쓴다'는 규칙으로 바꾸고, 명령 목록을 다섯째(TEST-049)의 루트 스크립트와 맞추며, 스킬 표의 `release-note-generator` 설명을 고친다(TEST-054). `scripts/PUBLISHING.md`의 평상시 절차와 트리거를 새 흐름으로 다시 쓴다(TEST-054). 로컬 폴백(`yarn publish:changed`, 소유자가 둔 이중 인증 경로)은 남기되, 판 올림은 판 올림 PR로만 하고 로컬 폴백은 병합된 판의 올리기만 대신한다고 적는다(TEST-054). 태그는 `yarn changeset tag && git push --tags`(TEST-054). 판을 changeset 없이 정하는 둘째 길인 루트 `major:all`·`minor:all`·`patch:all`, 패키지들의 `version:*`, `tag:packages`와 `scripts/tag-packages.sh`, 망가진 `changeset:publish`는 지운다(근거는 예측가능성: 판을 정하는 길은 하나다)(TEST-054). 이 변경 전부터 `publish-packages.sh`에 밀려난 `publish:all`과 패키지별 `publish:npm`·`build:publish:npm`은 지우지 않고 PR 본문에 적는다(TEST-054). `.claude/skills/release-note-generator`는 남기되 '`.changeset/*.md` 본문 쓰기와 다듬기'(특히 PR-8의 파괴적 변경 changeset과 이주 안내)로 역할을 좁힌다(이미 `knowledge/changeset-enhancement-guide.md`가 있다)(TEST-054).

11. **무리 밖 패키지.**(TEST-055) PR-1이 바꾸는 `@winglet/common-utils`(`merge`의 선택 인자: 배열 교체, 원자 판정, 한쪽 값의 참조 이동, 양쪽에 있는 객체의 쓰기 시 복사. 인자가 없으면 오늘 동작, 더하기만 하는 변경)는 PR-1에서, PR-7이 바꾸는 `@winglet/react-utils`(ErrorBoundary와 감싸개 둘의 렌더 때 보고 함수를 얻는 선택 인자, 더하기만 하는 변경. 17라운드 소유자 답 (나)로 허용)는 PR-7에서 자기 changeset(`minor`)을 더한다(TEST-055). 본체의 `workspace:^`는 포장 때 그 판으로 바뀌고, 릴리스 테스트는 여섯째(TEST-050)의 폐포로 그것을 포장해 넣는다(TEST-055). `@winglet/react-utils`의 범위 밖 판 변경이라 `@lerx/promise-modal`도 patch로 함께 배포된다(`fixed` 무리의 UI 플러그인은 PR-8의 판으로 묶인다)(TEST-055).

12. **제3자 액션은 커밋 해시로 고정한다.**(TEST-056) `changesets/action`, `actions/checkout`, `actions/setup-node`는 `id-token`·`contents` 쓰기 권한을 가진 작업에서 돈다(판 고정 규칙, `.yarnrc.yml`의 공급망 방어와 같은 방향)(TEST-056).

13. **GitHub Release는 changesets의 기본대로 패키지 태그마다 하나다.**(TEST-057) `fixed` 무리가 오르면 여덟이 생긴다(TEST-057). 모아 하나로 만드는 새 코드는 두지 않는다(태그와 Release가 하나씩 맞는 쪽이 예측 가능하다)(TEST-057).

14. **PR-8의 판 번호 — 1.0.0-beta 뒤 1.0.0(16라운드 소유자 답으로 확정).**(TEST-058) Vincent의 답: "(나) 1.0.0-beta를 먼저 내고 1.0.0 예상합니다"(TEST-058). PR-8의 changeset은 `major`이고(0.16.0 → 1.0.0), 먼저 프리릴리스 모드(`changeset pre enter beta`)로 `fixed` 무리 여덟을 1.0.0-beta.N으로 낸다(TEST-058). 프리릴리스는 `latest`를 건드리지 않도록 dist-tag `beta`로 올린다(TEST-058). `publish-packages.sh`가 판의 프리릴리스 식별자에서 dist-tag를 정한다(더하기만 하는 확장)(TEST-058). 실제 소비자가 이주 안내와 이주 프롬프트를 먼저 시험하고 안정성을 확인한 뒤 `changeset pre exit`로 1.0.0을 낸다(TEST-058). 1.0.0부터는 파괴적 변경마다 `major`를 요구하는 안정 약속이 시작된다(TEST-058).

### 2.10 성능 측정 원칙과 기준선

어떤 동작의 비용은 폼의 크기가 아니라 그 동작이 바꾼 것의 크기에 비례한다(TEST-029). 성능은 주장하지 않고 측정한다(TEST-029). 기존 구현이 기준선이고, 예산과 시나리오는 설계의 일부다(TEST-029). 소유자(16라운드 답 10): "에. 최소생성, 메모리안정, 캐싱을 통한 속도 및 재생성 방지가 고속성 원칙에 포함됩니다."(TEST-029). 소유자(16라운드 덧붙인 말): "최초부터 이 form의 목적은 모바일에서도 실행가능한 수준의 안정성과 경제성이라서요"(TEST-029).

ADR 0006(값의 소유), 0007(작업 루프), 0011(노드를 필요할 때 만들기)의 구체 형태는 성능 위험을 안고 있다(TEST-033). 본 구현에 앞서 **버릴 것을 전제로 한 스파이크**로 위험 지점만 잰다: 넓은 객체·긴 배열에서의 불변 갱신 비용, 쓰기당 가드 호출 비용, 작업 루프 한 회의 비용(TEST-033). 스파이크의 결과가 그 ADR들의 미결을 닫는 근거가 된다(TEST-033).

- **하니스는 `@aileron/benchmark-form`이다.**(TEST-026) 이미 npm alias로 옛 판 다섯(`@canard/schema-form_0.9.0` … `_0.12.5`)과 워크스페이스 판을 나란히 설치해 비교하고 있고, `render-trace.tsx`가 경로별 렌더 커밋 수를 센다(TEST-026). 새 항목만 더한다(TEST-026).
- **기준점은 같은 폼이다.**(TEST-026) 스키마 문법이 호환되지 않으므로 `fixtures/equivalent/<이름>.ts`에 옛 문법과 새 문법의 쌍을 두고, 쌍마다 두 판의 `<Form>`이 같은 상호작용 열 뒤에 같은 `[data-path]` 집합을 그리는지(`renderForm`의 `renderedPaths()`와 같은 선택자 `[data-path]:not([data-deferred])`를 `@aileron/benchmark-form` 안에서 판마다 쓴다(TEST-026). `data-path`를 그리지 않는 0.9.0은 이 대조에서 뺀다)를 시험이 단언한다(다르면 벤치가 아니라 시험이 실패한다)(TEST-026). 상호작용 열도 쌍에 같이 둔다(TEST-026).
- **둘로 나눠 잰다.**(TEST-026) 코어(`node` 환경, 트리 생성·값 갱신·정착 시간)와 렌더(React 19, `<React.Profiler>`의 커밋 수와 `actualDuration`, `render-trace`의 번짐)(TEST-026).
- **조건.**(TEST-026) 워밍업 10회 이상, 표본 100회 이상, 평균 대신 중앙값과 99번째 백분위, `node --expose-gc`로 표본 사이 명시적 수집(TEST-026). 결과는 `results/`에 날짜와 커밋으로 남긴다(TEST-026).
- **패키지 벤치 일곱**(`bench/*.bench.ts`: `branch-strategy-init`, `compute-recalculate`, `event-cascade`, `find-node`, `nodeFromJSONSchema`, `object-pending-read`, `render-delay`)은 새 엔진의 대응물로 다시 쓴다(TEST-026). 이름은 새 fractal을 따른다(`blueprint`, `settle`, `dispatch`, `find`, `load`)(TEST-026). 옛 엔진에서 마지막 기준선을 `bench:baseline`으로 남긴다(TEST-026, TEST-031). 이름이 바뀌므로 옛 판 대 새 판의 비교는 `@aileron/benchmark-form`만 맡고, 패키지 벤치는 새 엔진 안의 회귀 감시로 쓴다(TEST-026). 지속 통합 작업 흐름 `.github/workflows/performance-benchmarks.yml`의 과다 렌더 단언과 회귀 검사는 PR-7에서 새 기준선으로 갱신한다(TEST-026).

**5차 주(2026-09-23).**(TEST-030) (1) begin/complete 두 패스와 선택 가드는 사라졌다(정착은 출발점 고정, 한 패스)(TEST-030, FRAGMENT-010, SETTLE-018, SETTLE-003). (2) 분기 선택기와 `selection` 칸은 없다(TEST-030, FRAGMENT-010). (3) 역색인은 기각되었다(TEST-030, VALIDATE-032). (4) `controls.discriminator`는 분기별 `controls.active` 식(`===` 비교)을 만든다 — "판별식 직접 비교를 넣지 않음"은 옛 결정이다(TEST-030, FRAGMENT-008). (5) "dirty 목록"은 재계산 목록이다(TEST-030, SETTLE-002). (6) `&if`는 `controls.active`에 흡수되었다(TEST-030, TEST-035, LANDING-006). (7) 코어에 글로벌 잠금이 없어 루트 키의 특수 조회가 사라진다(TEST-030, CONTROLS-045). 나감의 비움(선택, 기본 꺼짐)은 전이 단계의 자동 쓰기라 켠 폼에서만 비용이 든다(TEST-030, WRITE-037, SETTLE-005).

기존 시험의 처분은 기존 234파일 가운데 그대로 사는 약 30파일과 표면만 고치는 약 25파일의 단언을 남기고, 기존 구현의 성능은 기준선이 된다(TEST-031, TEST-013).

- 코어를 건드리기 전에 재설계 시작 시점(`master` `660dde66f`, v0.16.0)에서 패키지 내 벤치와 `benchmark-form`의 scale 벤치를 돌려 기준선을 잡는다(TEST-031).
- `bench/.results/`는 git 추적 대상이 아니므로 기준선은 **커밋을 고정해 재현할 수 있게** 둔다(TEST-031). `benchmark-form`은 이미 과거 배포 버전을 고정해 같이 재는 구조이므로, 재설계 직전 버전을 "legacy" 어댑터로 고정해 새 구현과 같은 실행에서 나란히 잰다(TEST-031). 기계와 시점이 달라도 비교가 성립한다(TEST-031).

새 불변식이 오라클이 된다(TEST-031). 예산의 수치는 기존 `guard:check`의 선이다(TEST-031, TEST-073). 기존 구현의 기준선(패키지 벤치 일곱, `benchmark-form`의 scale 벤치)과 비교한다(TEST-031). 기준선은 있다: 패키지 벤치 일곱(`bench/.results/baseline.json`)과 `benchmark-form`의 scale 벤치(`results/baseline.json`), 재실행 수치가 기록과 정합(2026-09-23)(TEST-031).

다음은 기록이다(TEST-034).

- **패키지 내 벤치** — `bench/*.bench.ts` 7개, `vitest bench`(node 환경, JSDOM 없음)(TEST-034). `bench:baseline`이 `bench/.results/baseline.json`을 쓰고 `bench:compare`가 그것과 비교한다(`package.json:47-50`)(TEST-034). `bench/.results/`는 git 추적 대상이 아니다(TEST-034).

| 파일 | 재는 것 |
| ---- | ------- |
| `nodeFromJSONSchema.bench.ts` | 스키마 → 노드 트리 생성 (flat / nested / oneOf / computed) |
| `branch-strategy-init.bench.ts` | oneOf 분기 초기화 비용 (2×3 … 10×10, 중첩 깊이 3/5) |
| `event-cascade.bench.ts` | `setValue` → 캐스케이드 (20필드 배치 쓰기, derived 체인, oneOf 토글) |
| `find-node.bench.ts` | `find()` 탐색 (깊이 3/7/12, 팬아웃 10/50) |
| `compute-recalculate.bench.ts` | `ComputedPropertiesManager.recalculate()` |
| `object-pending-read.bench.ts` | 자식 커밋이 대기 중일 때 부모 객체 읽기 비용 |
| `render-delay.bench.ts` | 버전 간 마운트 회귀 감시 (필드 5 / 25 / 150) |

- **라이브러리 간 비교** — `packages/aileron/benchmark-form`(TEST-034). `@canard/schema-form`(워크스페이스 + 고정 버전 0.9.0–0.12.5)을 `@rjsf/core`, `react-hook-form`, `formik`, `@tanstack/react-form`과 같은 하니스(마운트 / 키 입력 / 프로그램적 `setValue`)로 비교한다(TEST-034). 공정성을 위해 문자열 필드만 있는 평면 스키마를 쓴다(TEST-034). schema-form 전용 기능은 "scale" 벤치(flat 50/100/500, nested, array 100/500/1000, oneOf 5/10/20)와 `array-node-stress`(push / applyValue / remove)가 따로 잰다(TEST-034). 통계적 회귀 게이트(`guard:baseline` / `guard:check`)가 있다(TEST-034).
- **모바일 성능 보고서** — `docs/ko/MOBILE_PERFORMANCE_REPORT.md`(v0.10.6)(TEST-034). 문서화된 안전 임계: 필드 50개 미만, 배열 아이템 30개 미만, computed 의존 20개 미만, 중첩 깊이 8 미만, oneOf 분기당 필드 20개 미만(TEST-034).

(TEST-035, TEST-030)

| 장치 | 위치 | 새 구조에서 |
| ---- | ---- | ----------- |
| computed가 없는 노드가 공유하는 frozen sentinel | `getComputedPropertiesManager.ts:19-26` | 유지. `controls`의 식이 없는 노드는 표현식 비용이 0이어야 한다 |
| 단순 동등식 분기의 O(1) 인덱스 조회 | `.../getSimpleEquality.ts:16-64` | 사라진다(`&if` 분기 폐지). 가드 평가는 검증기가 한다. 측정 결과 AJV에서는 대체 장치가 필요 없다(50분기의 마지막 일치도 1.25 µs) |
| 지연 합성 값 캐시 `__composed__` | `ObjectNode/.../BranchStrategy.ts:107-110, 304-317` | 필요 없어진다. 방출 값의 메모를 쓰는 곳이 작업 루프 하나이고, 바뀐 자식이 없으면 이전 참조를 그대로 둔다 (VALUE-012, VALUE-013) |
| 이벤트 배치와 병합 | `EventCascadeManager.ts:79-125` | 통지 1회로 대체된다 (EVENT-001) |
| `revision(mask)` 원장 | `EventCascadeManager.ts:159-201` | 유지 |
| `Batch` / `Isolate` 플래그로 대량 쓰기의 커밋 횟수 줄이기 | `core/types/value.ts:26-66` | "표시 N번 → 계산·커밋 1번"으로 대체된다 (SETTLE-001) |
| 할당 없는 `schemaPath` 매칭 | `.../matchesSchemaPath.ts:29-37` | 유지. 에러 배정은 `dataPath`로 하고 `schemaPath`는 꺼진 union 분기를 표시에서 거르는 필터에서만 쓴다 (VALIDATE-043) |
| 렌더 가상화 | `helpers/virtualization/` | 유지. 노드를 필요할 때 만드는 안(NODE-053)과 결합할 수 있다 |
| 자식 컴포넌트 맵의 메모이제이션 | `.../useChildNodeComponents.tsx:52-113` | 유지. 캐시가 언마운트까지 무한히 자라는 문제는 함께 고친다 |

다음은 기록이다(TEST-062). `benchmark-form/PLAN.md`에는 "oneOf 마운트 비용은 분기 수와 무관하다(활성 분기만 초기화)"는 기록이 있다(TEST-062). 구조 추적에서는 "모든 분기의 자식 노드를 생성자에서 전수 생성한다"를 확인했다(TEST-062). 생성은 전수이고 초기화만 지연이라면 둘은 양립한다(TEST-062). 확인하지 않았다(TEST-062).

### 2.11 측정 시나리오와 실험 기록

(TEST-032, TEST-030, SETTLE-045, TEST-069)

| 상황 | 이미 있는 것 | 새로 필요한 것 |
| ---- | ------------ | -------------- |
| 대규모 쓰기 | `array-node-stress`의 applyValue, scale 벤치 | 큰 트리의 루트에 값을 통째로 쓰기 (flat 500, array 1000) |
| 배치 작업 | `event-cascade`의 K-배치 쓰기 | 표시 N번 → 계산·커밋 1번의 비용 |
| 빠른 연속 입력 | 하니스의 키 입력 단계 | **넓은 객체(키 1,000개)와 긴 배열(아이템 10,000개) 안에서의 키 입력** — 불변 갱신의 복사 비용 (VALUE-014의 위험) |
| 화면 전환 | `branch-strategy-init`, oneOf 토글, 마운트 | begin/complete 두 패스와 선택 가드는 사라졌다. 새 모델의 정착 측정은 SETTLE-045·TEST-069의 PR-2 정착 시나리오와 PR-2 벤치를 가리킨다 |
| (새 구조 고유) | — | **가드 평가** — `if`/`then`이 많은 스키마에서 쓰기당 `compileGuard` 호출 수와 시간, 검증기 구현체별(AJV, 인터프리터형) 비교. **1차 측정 완료** — TEST-036 |
| (새 구조 고유) | — | 분석 단계(스키마 → 청사진)의 1회 비용, `$ref`가 많은 스키마 |
| 메모리 | `benchmark-form`의 heap snapshot 도구(내용 미확인) | 노드당 메모리, 노드를 필요할 때 만드는 안(NODE-053)의 효과 |
| (14라운드) | — | 조건부 폼(`if` 20, 필드 200)의 마운트·키 입력·토글 |
| (14라운드) | — | `oneOf` 픽스처를 `controls.discriminator`판과 게이트 없는 판으로 나누어 잰다 |
| (14라운드) | — | 배치 없는 연속 `setValue` M회의 검증 횟수와 시간 |

측정 수치는 유효하나 시나리오 이름은 옛 모델의 것이다(TEST-032, TEST-030).

- 벤치: 루트로 옮긴 게이트가 N개일 때 키 입력 한 번의 비용을 잰다(TEST-032).
- PR: PR-2 벤치(TEST-027·TEST-032)에 "켜진 조각 N개 호스트의 무관한 키 입력" 행을 더한다(TEST-032).

- PR: PR-2 벤치(TEST-032).
- 무엇: 커밋 때 조상 경로 메모를 갱신하는 비용을 잰다(TEST-032).

다음은 기록이다(TEST-036). 수치와 방법은 `reviews/round-1.md` §2에 있다(TEST-036). 결론만 옮긴다(TEST-036).

1. **AJV에서는 가드를 몇 번 부르느냐가 문제가 아니다.**(TEST-036) 루트에 걸린 좁은 가드 200개를 키 입력마다 전부 돌려 7.9 µs다(TEST-036).
2. **걱정이 현실이 되는 곳은 둘이다**: 인터프리터형 검증기(`@cfworker/json-schema`는 같은 작업에 578 µs, 호스트 객체의 폭에 비례한다)와 컬렉션을 훑는 가드(아이템 10,000개의 `contains` 하나에 AJV 190 µs, 인터프리터 4.5 ms — 키 입력마다)(TEST-036).
3. **"호스트 참조가 그대로면 건너뛴다"는 루트에 걸린 가드에 효과가 없다.**(TEST-036) 읽는 키의 참조를 선형으로 비교하는 것도 AJV에서는 평가 비용과 같다(TEST-036). 효과가 있는 것은 변경 경로 → 가드의 역색인뿐이다(13 ns)(TEST-036).
4. **AJV의 실제 비용은 컴파일이다.**(TEST-036) 가드 하나에 70–270 µs, 200개면 폼 생성 시점에 14–54 ms(TEST-036). 늦추고, 중복을 없애고, 폼 인스턴스 사이에 공유해야 한다(TEST-036).
5. **불변 갱신의 복사 비용은 문제가 아니다.**(TEST-036) 키 1,000개 객체 1.1 µs, 아이템 10,000개 배열 2.7 µs(TEST-036). 현재 구현의 동기 쓰기 경로와 같은 수준이다(TEST-036).
6. 검증은 폼 전체 크기에 비례한다(아이템 10,000 × 6필드에 약 140 µs, 에러가 많으면 더)(TEST-036). 폼은 검증을 입력 경로에서 떼어 내는 장치를 따로 두지 않고 진입당 요청 1회와 마이크로태스크 합치기로 하며, 빈도 조절은 `OnRequest`다(TEST-036, VALIDATE-049).

모바일과 저사양 기기에서는 재지 않았다(TEST-036). 나노초 단위의 측정은 방법에 민감하다 — 같은 인자를 되풀이하면 JIT가 호출을 없애고, 여러 경우를 한 프로세스에서 재면 100배까지 어긋난다(PROCESS-030)(TEST-036).

다음은 기록이다(TEST-037). `reviews/round-2.md` §2에 표가 있고 전문은 `spikes/work-loop/REPORT.txt`다(TEST-037). 요점: 키 입력이 현재 구현보다 두 자릿수 배 싸지고(쓰기 뒤 첫 읽기의 재합성이 사라진다), 구현 선택이 승패를 가른다(메모 복사·패치 대 재구성 104배, dirty 목록 대 플래그 스캔 17배, 역색인 5배)(TEST-037). 재설계가 지는 유일한 지점은 조건부 폼의 생성(가드 컴파일 22 ms)이며 폼 인스턴스 사이의 컴파일 공유가 필요하다(TEST-037). V8의 자기 속성 1,020개 절벽은 현재 구현에도 같게 걸린다(TEST-037).

다음은 기록이다(TEST-059). 파일: `spikes/round9/oneof-if.mjs`, `oneof-if-output.txt`, `REPORT.txt`(TEST-059). 각 분기의 `if`는 `{ properties: { kind: { const } }, required: ['kind'] }`다(TEST-059).

| 배치 | 올바른 값 `{kind:'a', x:'s'}` | 누락 값 `{kind:'a'}` | 어느 조건에도 맞지 않는 값 `{kind:'c'}` | 조건 프로퍼티 없음 `{x:'s'}` |
| --- | --- | --- | --- | --- |
| `oneOf` 분기에 `if/then`만 | 거부 | 통과 | 거부 | 거부 |
| `oneOf` 분기에 `if/then` + `else: false` | 통과 | 거부 | 거부 | 거부 |
| `anyOf` 분기에 `if/then`만 | 통과 | 통과 | 통과 | 통과 |
| `anyOf` 분기에 `if/then` + `else: false` | 통과 | 거부 | 거부 | 거부 |
| `allOf` 항목에 `if/then`만 | 통과 | 거부 | 통과 | 통과 |
| 최상위 `if/then` 하나 | 통과 | 거부 | 통과 | 통과 |
| 오늘 방식(`const` 판별식) | 통과 | 거부 | 거부 | 거부 |

`if`에서 `required`를 빼면 `else: false`를 붙인 `oneOf`·`anyOf`가 `{x:'s'}`를 통과시키고, 빈 값에서 가드 단독 판정이 모두 참이 된다(검증 §2.3)(TEST-059). 그래서 FRAGMENT-022의 컨벤션이 "`else: false`와 `required` 함께"다(TEST-059).

다음은 기록이다(TEST-060). 8라운드 `loop-v4e.mjs`에서 59개 정확 치환(검증 뒤 수정 포함)으로 파생했고 재생성이 바이트 단위로 같다(TEST-060). 상태 칸은 원본과 `extras`뿐이며, 조각은 `if`(검증기 스텁) 또는 `&active`로 켜지고, 게이트 없는 조각은 무조건이다(TEST-060). 재실행은 `spikes/round9/`에서 `node regress/run.mjs`다(TEST-060).

프로토타입 보고서의 사실(`spikes/round9/REPORT-proto.txt`)(TEST-060). 교차 검증(`reviews/raw-round9-verification.md` §2)은 회귀·프로브의 합계 단언을 재실행해 재현했고, 채움 단위와 같은 대상 충돌은 탐침으로 하나씩 재현했다(TEST-060).

- 이식한 8라운드 회귀 63개 단언이 두 모드에서 모두 통과했다(TEST-060). v4e 자신의 기존 실패 셋 가운데 A4c와 A4-cap은 "같은 값을 다시 써도 에지를 발화하지 않는다"는 규칙으로, A4b는 "최종 형상에 없는 노드의 중간 채움은 남기지 않는다"는 규칙으로 기대가 바뀌어 통과한다(`regress/CHANGES.txt`)(TEST-060).
- Q8 프로브 108개 단언과 경계 26개가 통과했다(TEST-060).
- 로드에서는 `&default`가 `default`를 이겼고, 나중에 켜진 조각의 새 노드도 채워졌다(TEST-060).
- `&unsetValue`는 값을 지우고 입력을 남겼으며, 그 뒤 다시 채워지지 않았다(TEST-060). 자기 삭제로 조건이 거짓이 되어도 삭제를 철회하지 않는다(TEST-060).
- `else: false`가 없는 분기 둘에서 개발 모드 경고 둘이 났다(TEST-060). 게이트 없는 순수 `oneOf`·`anyOf`는 두 분기를 모두 켰다(TEST-060).
- 자식 집합 결합에서 AND/OR와 "가장 가까운 선언이 이김"은 정반대 결과를 냈다(TEST-060).
- `&derived`와 `&injectTo`의 같은 대상 충돌은 대상별로 하나만 적용해 2라운드에 수렴했다(TEST-060). 순위는 스위치다(TEST-060).
- `disableAutomaticWrites`는 채움·`&derived`·`&injectTo`·`&unsetValue`를 모두 막고 로드 값은 그대로 두었으며, 그 뒤 사용자 입력에서는 자동 쓰기가 다시 일어났다(TEST-060). 호출 단위 지정이 Form 속성을 덮었다(TEST-060).
- 비수렴 `&derived`·`&injectTo` 쌍은 라운드 상한 5·6·25 모두에서 예산 초과이고, 원본 B 커밋이면 `{a:0, b:0}`, 마지막 라운드 커밋이면 상한 직전의 값(상한 25에서 `{a:24, b:24}`, 상한 5에서 `{a:4, b:4}`)이다(TEST-060).

교차 검증이 첫 판에서 명세와 어긋나는 곳 셋을 찾았고 같은 codex 세션에서 고쳤다(TEST-060). 채움 단위(본체에만 노드 단위였고 공유 노드와 게이트 없는 `allOf` 항목은 조각 단위로 다시 채움), 노드 게이트(로드 때 꺼진 노드를 채우고 켜질 때 채우지 않음), 게이트 없는 분기의 공유 노드에 첫 선언 스키마를 힌트로 남김(TEST-060). 고치는 과정에서 넷째 빈틈이 재현으로 드러났다(`{seed:1, on:1}`, `REPORT-proto.txt` 325행)(TEST-060). 중간 라운드에 채운 값이 뒤 라운드에서 형상에서 빠진 노드의 원본에 남는 문제로, "생김"을 정착이 수렴한 뒤의 최종 형상으로 판정하고 최종 형상에 없는 노드의 채움 후보는 철회하도록 고쳤다("중간 라운드의 주입은 커밋 전에 버린다"(SETTLE-005)의 실행 확인)(TEST-060). 고친 뒤의 결과는 `spikes/round9/REPORT-proto.txt`의 "5. 검증 뒤 수정" 절과 `spikes/round9/r9b-output.txt`(단언 52개, 탐침 13개, 실패 0)에 있다(TEST-060).

고친 뒤 달라진 회귀 기대는 "이미 있던 노드는 다시 채우지 않는다", "최종 형상에 없는 노드의 중간 채움은 남기지 않는다", "게이트가 거짓인 노드는 생기지 않는다(FRAGMENT-014)"에서 온다(TEST-060). 8라운드 회귀 이식의 바뀐 요약은 17행이다(TEST-060). 7라운드 사례 X16(자기 주입으로 자기 조각을 끄는 스키마)은 에지 모드의 두 구성에서, 이전에 중간 원본 보존으로 `stable`이던 것이 예산 초과가 된다(TEST-060). 레벨 모드는 `t='from-undefined'`로 2라운드에 수렴한다(TEST-060). 에지 모드의 결과는 SETTLE-026(자기 가드를 끄는 자동 쓰기는 예산 초과)과 같은 판정이다(TEST-060).

(TEST-061, GOAL-015)

| 항목 | 질문 | 실험 | 결정 기준 |
| ---- | ---- | ---- | --------- |
| D-15 순환 스키마의 출발점 | `if`가 `x`를 요구하고 `then`이 `x`를 선언하는 부정 없는 순환에서 `{x: 'v'}`를 로드하면 조건부 조각이 꺼진 채 출발해 `x`가 방출에서 빠지고 상태는 `stable`이다. 로드한 유효 값이 조용히 사라진다. 원인은 신호의 부재가 아니라 출발점(SETTLE-029)이다 | 프로토타입 `loop-v4d` 사본에 출발점 스위치 셋을 더한다. `minimal`(지금), `S1`(선언 키가 원본에 있는 조건부 조각을 출발점에 더함), `S2`(최소 고정점 뒤 그런 꺼진 조각을 검증기 가드로 한 번 켜 봄). 사례 E8(자기 순환 `{x:'v'}`), E8b(상호 순환 `{a:1,b:2}`), E9(선언 순서에 따라 다른 고정점에 닿던 사례), E1, E12–E14, X15, X16, 독립 모델 N1·N2·N9. 회귀 전부. 비용은 케이스마다 새 프로세스 5회 | 채택: E8 → `{x:'v'}`, E8b → `{a:1,b:2}`, E9 불변 `{a:1}`, 회귀 0, 바퀴 상한 안, 비용 5회 폭 안. 실패 기준은 회귀, 사용자가 끈 조각이 잠복 원본만으로 되살아남, E9 변화다. 실패하면 최소 출발점 유지, 개발 모드 경고(목표 C2(작성자 실수의 가시성)), 프로덕션 신호는 SURFACE-007의 새 상태 값, WRITE-018과 SETTLE-026 수정. 편집자의 손 계산으로는 S1은 E9를 바꾸고 S2는 유지한다 |

D-15 순환 스키마의 출발점: 2항(조건에 쓰는 프로퍼티는 `properties`에 선언되어야 한다) 아래에서 `if`가 요구하는 `x`를 `then`이 선언하는 스키마는 컨벤션 위반이 되므로 우선순위를 낮춘다(TEST-061, GOAL-035). 실험 명세는 그대로 남긴다(TEST-061). 열린 부분은 "D-15: 컨벤션을 어긴 양의 순환 스키마에서 로드한 값이 알림 없이 빠지고 상태가 `stable`로 남는 것을 받아들이는가."였고, 소유자 답(12-10)은 "받아들입니다"다(TEST-061). 받아들인다(TEST-061). 컨벤션 문서에만 적고 경고 코드는 두지 않는다(TEST-061). A-2의 고지 의무는 이 경우에 적용하지 않는다(답 19가 이긴다)(TEST-061).

다음은 기록이다(TEST-064).

| 시나리오 | 3.1판 | 대조 | 출처 |
| -------- | ----- | ---- | ---- |
| 키 입력, 평면 1,000 | 1.39 µs | 3차안 1.35 µs | `reviews/round-4.md` §2.1 |
| 분기 전환(4라운드 측정 시나리오) | 108 µs | 3차안 89 µs | `reviews/round-4.md` §2.1 |
| 루트 통째 쓰기 10,000 × 5 | 12.0 ms | 현재 217 ms | `reviews/round-4.md` §2.1, `reviews/round-2.md` §2 |
| 조건부 폼 생성 (가드 200개) | 23.0 ms (트리 585 µs + AJV 컴파일 22.4 ms) | 현재 13.4 ms | `reviews/round-2.md` §2 |
| 진입 깊이 카운터 | 측정 스프레드 안 (3–4%) | — | `spikes/work-loop/REPORT-v4c.txt` |

노드별 장부가 루트 통째 쓰기를 3차안보다 58% 늦춘다(TEST-064). 조건부 폼 생성은 재설계가 지는 유일한 지점이다(TEST-064). 조건부 폼의 생성은 현재 구현보다 1.7배 느리다 — 가드 200개에 22.4 ms(TEST-064).

**인터프리터형 검증기를 어느 수준까지 지원하는가.**(TEST-065) 성능 예산을 AJV 기준으로 잡으면 인터프리터형은 "동작하지만 큰 폼에서는 느리다"가 된다(TEST-065). 역색인은 기각되었다(TEST-065, TEST-030). 소유자 답(12-3): "검증기의 성능은 우리가 관여할 문제가 아닙니다만. 뭘 말하는건지요?"(TEST-065).

- 【추론】 비용 — 청사진 판정: 로드마다 한 번이며, 비 union 칸에도 드는 로드 비용은 선언마다 `type` 파싱 O(원소 ≤ 7)과 마스크 교집합 O(1)이고, 분기 합치기는 O(분기 × 정적 연언 깊이)다; 메모리는 union 칸마다 얼린 배열 하나와 기본 spec 하나, 노드마다 0이다; 구현은 허용 집합 도우미 약 60줄(`extractSchemaInfo`와 `processSchemaType`의 형 부분 대체), 분기 합치기 약 50줄, 조각 공유 확장 약 40줄이다(TEST-078).
- 【추론】 비용 — 유효 목록: 좁히는 게이트가 없으면 0(같은 참조)이고, 게이트 선언을 가진 노드는 유효 스키마 메모가 바뀔 때 O(k)의 교집합 한 번, 경고등 재계산은 O(1)이다; 메모리는 좁혀진 메모 항목마다 작은 배열 하나와 spec 하나다; 구현은 약 40줄(병합표 `type` 행 포함)이다(TEST-078).
- 【추론】 비용 — 두 번 해석: 비용은 쓰인 노드 가운데 유효 목록이 정적 목록보다 좁은 노드에 한해 `interpret` 한 번과 쓰인 값의 참조 보관이다; 전이 단계 약 20줄이다(TEST-078, WRITE-098).
- 【추론】 비용 — 새 경고 넷(`TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`, `NON_JSON_WHOLE_VALUE`, `DISCRIMINATOR_BRANCH_UNREACHABLE`, `FORM_TYPE_TEST_INVALID`): 개발 모드나 핸들러가 있을 때만 돌며(다만 `NON_JSON_WHOLE_VALUE`의 깊이 점검은 VALUE-037대로 개발 모드에서만 돌며, 핸들러가 있어도 프로덕션에서는 돌지 않는다), 비용은 터미널 하위 스키마 크기, 통째 값 크기(참조가 바뀐 커밋마다), 등록 때의 키 수에 비례한다; 메모리는 중복 억제 키이고; 각 30–40줄이다(TEST-078, WRITE-099).
- 【추론】 비용 — 쓰기(`interpret`): 멤버이면 `classBits` 한 번과 AND 한 번으로 O(1)이고, 문자열 해석은 정규식 한 번과 `Number` 한 번이며, 후보를 세기만 하는 무할당 구현이 조건이다; 메모리 0; `parse/` 약 80–100줄, `unionBehavior/` 행 약 40줄이다(TEST-078).
- 【추론】 비용 — 경고등: 원본이나 유효 스키마가 바뀐 노드만 커밋 때 O(1)이고 경고는 켜질 때만 보낸다; 메모리는 얼린 빈 배열 공유; 게터 두 개다(TEST-078).
- 【추론】 비용 — 방출·채움: 추가 비교와 복사가 없고, 메모리와 구현이 0이다(TEST-078).
- 【추론】 비용 — Hint·props: `useMemo` 안에서 필드 하나를 더 읽고(비 union에도 듦), 시험은 정의 수에 선형(오늘과 같음)이다; 메모리 0; 형 셋과 `getHint` 한 줄이다(TEST-078).
- 【추론】 비용 — 기본 union 입력: 키 입력마다 O(k ≤ 6)이고, 유효 목록은 `jsonSchema` 참조가 바뀔 때만 O(k), `JSON.stringify`는 값 참조가 바뀔 때만 O(값 크기)다; 메모리는 `useState` 하나와 표시 중인 객체 값마다 출력 문자열 크기의 메모다; 감싸개 약 60–80줄이다(TEST-078).
- 【추론】 비용 — 검증기: 기본 경로 0, `bind` 때 옵션 셋 검사 O(1)이다; 메모리는 스키마 깊은 사본을 (인스턴스, 루트)마다 한 번이다; 플러그인마다 약 10줄, ajv8 설정 세 줄이다(TEST-078).
- 【추론】 비용 — 공개 형: 컴파일 시간은 재지 않았다(모름); `value.ts`·`jsonSchema.ts`·노드 형·props 형 약 90줄과 가드 하나다(TEST-078).
- 【추론】 비용 — 플러그인 이주: 객체 시험 일곱 곳(코어 포함), 함수 시험 여섯 곳, mui 수 입력(빈 칸·초안·정수), 플러그인마다 union 항목 하나(권장)다(TEST-078).

### 2.12 성능 예산과 병합 관문

**게이트(16라운드 답 6으로 확정).**(TEST-027) PR-7 병합 전과 릴리스 전에 돌린다(TEST-027). 옛 판보다 느린 항목이 있으면 이유를 적고 Vincent가 받아들여야 병합한다(TEST-027). 옛 판보다 느린 것(대표적으로 `if`-`then`으로 스키마를 제한 없이 넓히는 문법)은 두 조건을 지킨다(TEST-027). 통제 가능: 비용이 입력 크기(가드 수, 조각 수, 재계산 목록의 크기)에 예측 가능하게 자라고, 가드 컴파일은 작성된 위치당 한 번이며(LANDING-073), 한 정착은 예산 다섯 안에서 끝난다(EVENT-020)(편집자 도출)(TEST-027). 일정 수준: 상한을 두며, 그 상한은 `guard:check`의 선이다(TEST-027, TEST-072). 형태와 선은 TEST-072가 정했고(같은 실행의 옛 판 대비, `guard:check`의 선), Vincent는 선을 넘은 항목을 병합 때 받아들인다(TEST-027, TEST-072). 노드 구조의 벤치 B1–B6(NODE-018)도 이 기준선과 비교한다(TEST-027).

새 구현의 어떤 단계도 예산을 넘는 회귀를 안고 병합하지 않는 것이 기본이며, 이유를 적어 Vincent가 받아들인 회귀만 예외로 병합한다(TEST-027, TEST-072, TEST-073). 기존의 통계적 게이트(`guard:check`)를 쓴다(TEST-027). 18라운드 안건(실행 확인, PR-2): "노드 구조의 벤치(섞인 종류 1만 노드의 읽기 순회, 노드당 힙 바이트, 같은 맵인지, 거대형 자리 수, 입력에서 커밋까지, 생성 시간. V8과 JavaScriptCore)"(TEST-027).

벤치마크를 설계에 넣는 것은 소유자의 요구다 — "기존 설계 방향에서 잡았던 고속 동작이 깨져서 느려질까 봐 걱정이다. 벤치마크를 통해서 성능을 끌어올렸으면 한다. 설계 단계니까 이것도 설계에 넣었으면 한다."(TEST-028). 예산의 수치는 기존 `guard:check`의 선이다(TEST-028, TEST-073).

- PR: PR-3 벤치(회귀 항목)(TEST-071).
- 무엇: 객체 원천 `injectTo`(1만 원소의 터미널 객체·배열)에서 한 원소 쓰기의 비교 비용이 값 크기와 무관한지, 통째 교체가 선형인지 잰다(TEST-071).
- 실패: 값 비교를 되돌리지 않고 지름길 구현을 고친다(TEST-071).

【추론】 안건 §5의 성능 물음은 한 규칙에서 닫는다: 옛 판보다 느린 항목은 이유를 적고 Vincent가 병합 때 받아들인다(TEST-027)(TEST-072). 【추론】 이 규칙이 느림을 항목마다 통제하므로 새 수치를 지어내지 않는다(TEST-072). 【추론】 '일정 수준'은 같은 실행에서 옛 판에 견주어 잰다(TEST-026의 하니스, 같은 폼의 쌍)(TEST-072). 【추론】 절대 수치는 두지 않는다(TEST-072). 【추론】 선은 기존 `guard:check`의 규칙이다(TEST-072). 【추론】 옛 판의 표본을 기준으로 넣고, 새 판의 처리량(초당 횟수) 평균이 15% 넘게 떨어지고 Welch p<0.05면 선을 넘는다(`packages/aileron/benchmark-form/src/utils/stat-regression.ts:81-112`, 기본값 `threshold` 15, `alpha` 0.05)(TEST-072). 【추론】 선을 넘은 항목은 TEST-027을 따른다(TEST-072). 【추론】 이유를 적고 Vincent가 받아들여야 병합한다(TEST-072). 【추론】 이것이 '통제 가능하고 일정 수준 안'을 지키는 절차다(TEST-072). 【추론】 1.5배·2배 같은 배율 상한은 따로 두지 않는다(TEST-072). 예: 가드 200개인 조건부 폼 생성은 새 판 23.0 ms(트리 585 µs + AJV 컴파일 22.4 ms) 대 오늘 13.4 ms, 1.7배(처리량 −42%)라 선을 넘는다(TEST-072). 이 항목은 TEST-076대로 PR-4의 수용 필요 항목으로 미리 적혀 있다(TEST-072).

【추론】 예산의 수치는 기존 `guard:check`를 그대로 쓴다(TEST-073). 【추론】 처리량 평균이 15% 넘게 떨어지고 Welch p<0.05면 회귀다(`stat-regression.ts:81-112`)(TEST-073). 【추론】 표본은 TEST-026대로 100회 이상이다(TEST-073). 【추론】 키 입력, 마운트, 대규모 쓰기(루트 통째 쓰기), 배치에 똑같이 적용한다(TEST-073). 【추론】 회귀는 TEST-027 절차를 따른다(이유를 적고 Vincent가 받아들여야 병합)(TEST-073). 【추론】 스파이크의 기대 이득은 기대값으로 적으며, 게이트가 아니다(TEST-073). 【추론】 SETTLE-045의 벤치 게이트와 NODE-055의 B1·B5·B6 합격선이 이 선을 쓴다(TEST-073).

기대값: 루트 통째 쓰기(10k×5) 5.72 ms 대 215.7 ms, 배치 1000 368 µs 대 1.71 ms(`spikes/work-loop/REPORT.txt:245-249`), 트리 생성 flat 1,000 452.75 µs 대 4.63 ms, 트리 생성 array 10,000×5 13.15 ms 대 216.73 ms(`:113-114`)(TEST-073). 예: 기준선 `Scale Interact Flat flat-50`은 14.1 ms(처리량 70.8회/초)다(TEST-073). 15.0 ms(+6.4%, 처리량 −5.9%)가 되면 선 안이라 통과한다(TEST-073). 17.0 ms(처리량 −16.9%)가 되고 Welch p<0.05면 회귀다(TEST-073). 선은 처리량 기준 15%이므로, 시간으로는 약 16.6 ms(+17.6%)가 경계다(TEST-073).

【추론】 안전 임계를 목표 배율로 올려 적지 않는다(TEST-074). 【추론】 문서는 잰 사실만 적는다(TEST-074). 【추론】 PR-7 뒤 `MOBILE_PERFORMANCE_REPORT.md`(v0.10.6)와 같은 모바일 조건으로 다시 재고, 잰 임계를 문서에 적는다(TEST-074). 【추론】 병합 게이트가 아니다(TEST-074). 오늘 문서의 임계는 필드 50개 미만, 배열 아이템 30개 미만이다(TEST-034)(TEST-074). 참고 수치(문서의 임계는 아니다): 데스크톱 기준선 `baseline.json`(5회)에서 flat-500 마운트 약 112 ms, array-100 마운트 약 103 ms로 배열이 가장 약하고, 스파이크의 core 구성은 array 10k×5에서 13 ms 대 217 ms다(`spikes/work-loop/REPORT.txt:114`)(TEST-074).

【추론】 측정 방법을 고정한다(TEST-075). 【추론】 ESM 진입(`dist/index.mjs`)을 esbuild로 minify하고 gzip -9 하며, 의존성은 외부로 둔다(TEST-075). 【추론】 기준은 v0.16.0(2026-09-21 빌드)의 37,023 B다(TEST-075). 【추론】 배포되는 minify 없는 gzip(51,632 B)도 함께 보고한다(TEST-075). 【추론】 기준보다 늘면 TEST-027과 같은 기록·수용 규칙을 따른다(TEST-075). 【추론】 이유를 적고 Vincent가 받아들여야 병합한다(TEST-075). 【추론】 비율 상한은 따로 두지 않는다(TEST-075). 【추론】 "현재 gzip 약 44KB"(GOAL-011)는 측정 방법이 적히지 않은 기록이라 기준으로 쓰지 않는다(TEST-075).

【추론】 컴파일에는 따로 수치 예산을 두지 않는다(TEST-076). 【추론】 기준 플러그인(AJV)으로 재는 마운트 벤치는 가드 컴파일을 포함한다(TEST-076). 【추론】 그 컴파일은 따로 한 줄로 보고하고, 그 줄을 폼의 몫(청사진 분석·트리 생성·식 컴파일)과 검증기의 컴파일 몫(`compileGuard`)으로 나눈다(TEST-076). 【추론】 판정은 TEST-072의 선과 TEST-027을 따른다(TEST-076). 【추론】 선을 넘으면 이유를 적고 Vincent가 받아들여야 병합한다(TEST-076). 【추론】 알려진 느림은 미리 적는다(TEST-076). 【추론】 가드 200개인 조건부 폼 생성은 새 판 23.0 ms(트리 585 µs + AJV 컴파일 22.4 ms) 대 오늘 13.4 ms로 1.7배다(`spikes/work-loop/REPORT.txt:113-118`, `:196-200`)(TEST-076). 【추론】 이 항목을 PR-4(동기 `compileGuard`를 구현하는 PR)의 수용 필요 항목으로 미리 적고, 이유는 "검증기 컴파일"이다(TEST-076). 【추론】 미리 적는 것이지 미리 받아들이는 것이 아니다(TEST-076). 【추론】 수치는 PR-4의 실측으로 바꾼다(TEST-076).
