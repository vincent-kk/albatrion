# 346라운드 — 닫기 (이동 묶음 2 PR #389 병합 085676f77; 편집자 결정 일곱; NODE-049 inheritDoc 관례 대체)

2026-10-15. 344라운드의 자율 진행 지시에 따라 원장 관리자가 묶음 2 PR #389를 검토하고 `feat/schema-form-08-review-and-perf`에 squash 병합했다(085676f77). 내용: 호출 지역 WeakMap·WeakSet 셋을 Map·Set으로, FieldNode의 `{@inheritDoc}` 54개 정리, 정규식 34개와 상수 88곳의 모듈 수준 끌어올리기, 템플릿 리터럴 169곳의 `+` 연결, `schemaType`의 JSON 형 한정(335라운드 안 1, 336라운드 3번)과 소비자 없는 types export 12개 삭제, 하위 순회 한 벌(`visitFieldNodes`, 340라운드)과 공개 `visitSubtree`(SURFACE-062, 342라운드). 검증은 다섯 번(verifier 기계적·verifier 새 로직·codex·agy·원장 관리자 verifier)이었고, 그 과정에서 fixy08이 올린 결정 요청 넷(55·56·떼어진 쓰기·생사 판정)을 원장 근거로 닫았다. 공개 표면은 94개 이름 그대로이며 `NodeSurface`에 멤버 `visitSubtree`가 더해졌다.

## 편집자 결정

- **346C-01 (결정 55 — 떼어진 시작 노드의 `visitSubtree`).**
  - 【추론】 떼어진 노드에서 부른 `visitSubtree`는 NODE-044의 구조 읽기 규칙을 따라 그 노드와 함께 떼어진 하위 트리(마지막 커밋의 형상)를 걷는다. SURFACE-062의 "형상에 있는 노드만 돈다"는 살아 있는 시작 노드에 대한 문장이다. 무동작은 명령과 상태 진입에만 정해진 것이므로 `dispatchSetSubtreeState`의 방식을 유추하지 않는다.
- **346C-02 (결정 56 — 순회 안의 정착 밖 진입).**
  - 【추론】 순회 안의 정착 밖 진입 여섯(`setState`·`setSubtreeState`·`clearSubtreeState`·`setExternalErrors`·`clearExternalErrors`·`request`)은 즉시 전달하지 않고 순회의 묶음을 열어 순회 끝에 한 번 전달한다(`batch` 안과 같은 규칙, EVENT-013). 열린 진입도 순회도 없으면 전과 같이 바로 전달하고, 쓰기도 진입도 없는 순회는 아무것도 열지 않는다. 상태와 외부 오류의 데이터는 즉시 바뀌고 사건만 미뤄진다.
- **346C-03 (`batch`·순회 안의 떼어진 노드 쓰기와 생사 판정).**
  - 【추론】 떼어진 노드에 대한 쓰기(`setValue`·`finishInput`·배열 동사 다섯)는 `batch`나 순회 안에서도 표시하지 않고 곧바로 NODE-044 경로로 잠복 원본만 고친다 — 정착할 것이 없기 때문이고, 표시를 경로로 다시 푸는 지금까지의 동작은 같은 경로의 살아 있는 노드를 덮어쓰거나 쓰기를 버리는 기준 커밋의 결함이었다. 떼어짐의 판정은 쓰는 시점의 직전 커밋 형상이며 같은 `batch`가 바꿀 형상은 보지 않는다(EVENT-013·18C-20 "batch 안의 평범한 읽기는 직전 커밋"). 그래서 `batch` 안에서 떼어내기를 한 뒤 옛 참조에 쓰면 호출 시점에 살아 있는 노드가 있어 그 쓰기는 버려지고, 이것은 그 시점의 직접 쓰기와 같다.
- **346C-04 (전달 중 쓰기 문장 정정).**
  - 【추론】 SURFACE-062 결정의 "전달 중(리스너 안)에는 쓰기가 평소처럼 거부되고 읽기 순회만 된다"는 틀렸다. 전달 중의 쓰기는 거부되지 않고 평소 규칙대로 리스너 되먹임으로 세어지며(EVENT-016, EVENT-020), 오류 관찰자 안의 쓰기만 `WriteInObserver`로 거부된다. 리스너 안의 순회에서 쓰기가 묶음을 열면 visitor의 예외는 순회를 부른 쪽에 닿지 않는다(`batch`와 같음).
- **346C-05 (형제 순서 문장 정정).**
  - 【추론】 SURFACE-062 결정의 "한 파동 안 형제 리스너가 `UpdateState`를 듣는 순서만 바뀌며"는 일어나지 않는다. `deliverWave`가 파동을 문서 순서로 정렬하므로 방문 순서가 정순으로 바뀌어도 전달 순서는 그대로이고 리스너는 아무 차이도 관찰할 수 없다. 두 번 닿는 노드는 한 번만 패치되며 전에는 둘째 패치가 무동작이었다.
- **346C-06 (NODE-049 inheritDoc 관례 대체, 336라운드 4번 승인).**
  - 【추론】 정본 문서 주석은 그대로 선언한 인터페이스(공개 멤버 `NodeSurface`, 레코드 필드 `FieldNodeRecord`)에 두되, 클래스 쪽의 `{@inheritDoc}` 한 줄은 두지 않는다. 클래스 멤버는 레코드 문서를 상속하거나(32개) 정본 첫 문장을 옮긴 한 줄 요약을 지닌다(22개). 관례는 surface DETAIL에 적는다. NODE-049의 셋째·다섯째 문장(클래스는 `{@inheritDoc}`로 가리킨다, 한 줄 `{@inheritDoc}`로 주석 규칙 §4를 충족한 것으로 본다)은 이 결정으로 물러난다.
- **346C-07 (묶음 2 PR #389 병합 기록).**
  - 【추론】 묶음 2 PR #389를 085676f77로 squash 병합했다. 검증 다섯 번이 찾은 결함 넷 — reset이 넘기는 공유 동결 빈 배열이 `routeValidationIssues`의 동일성 비교에 걸려 `globalErrors` 갱신을 건너뜀, 순회 중 단독 flush의 리스너 쓰기가 연 순회 묶음이 flush보다 오래 살아 사슬 오류를 삼킴, `batch` 안 떼어진 쓰기의 덮어쓰기, 도달 불가한 flush 중 `visitDepth` 방어 — 는 모두 같은 PR에서 고쳤다. 전체 게이트는 rebase 뒤 11b738403에서 한 번(typecheck·lint 0, unit 2412·render 725·react18 725, scenarios 45, storybook 251, 플러그인 7, documents, production-test 20, 표면 94, filid 새 발견 0), 보완 커밋 f53327ee8은 축약 게이트(typecheck·lint 0, unit 2419, 표면 94). 상수 끌어올리기의 제외 목록에 "`===`로 비교되는 인자"와 "소비자로 새는 값"을 둔다. 후속 둘: 전달 중 `adoptFieldNodeTree` 인계 뒤 종료·전달 함수가 현재 루트와 런타임을 다시 해석하지 않아 새 루트에 열린 사슬이나 임시 오류 목록이 남는 기준 커밋의 결함은 다음 PR(fix/schema-form-08-adoption-chain)에서 고치고, `JSONPointerPrefix` 값의 형이 `+` 연결로 리터럴에서 string으로 넓어진 것은 의존이 없어 둔다.

## 남은 것

fixy08: 인계 결함 수정 PR → 묶음 3(blueprint → derive+navigation → settle, PR 셋; settle PR에 FormCore·FormError·FormLabel의 type.ts → types/ 와 settle 저장소 키 mismatches·mismatchMemo → misfits·misfitsMemo). fairy08: visitSubtree 공개 문서 PR → 속도 계획 개정 PR. 결정 대기열 54–56은 열려 있다.

다음 라운드 번호는 347이다.
