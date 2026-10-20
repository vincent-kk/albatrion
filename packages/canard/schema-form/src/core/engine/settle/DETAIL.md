# settle 계약

## Requirements

- 호스트 바퀴의 한 라운드가 직접 자식의 있음(이름별 노드 정체)을 직전 라운드 끝과 다르게 만들면, 그 경로를 이 호출의 누적 있음 집합에 더한다. 그 경로나 그 하위를 읽는 역의존 소유자와, 그 경로를 읽는 게이트를 가진 엄격 조상을 raw 변경과 같게 재계산과 형상 dirty로 표시한다(SETTLE-020·021·045, 97C-01 (4)).
- 제외 규칙 1: 진행 중인 호스트 하위의 소유자가 그 호스트나 그 조상을 읽는 경우는 표시하지 않는다(18C-15, 51C-01). 다만 그 가운데 상태 키 소유자는 공표 때 최종 트리로 평가하며, 의존 소유 경로와 살아 있는 상태 키 노드만 등록한다. 제외 규칙 2: 바뀐 하위 트리 안의 소유자는 표시하지 않는다(CONTROLS-080).
- 형상 dirty가 아니던 조상은 자식 계산 뒤 등록 계수가 바뀌었을 때만 다시 확인하고, 필요하면 같은 계산 안에서 바퀴로 들어간다. 이 재진입도 호스트 바퀴 예산에 센다. 직접 자식의 계산 여부는 이 노드의 이번 계산을 기준으로 한다. 각 반복은 아직 계산하지 않은 직접 자식을 하나 이상 계산하거나, 바퀴로 넘기거나, 계수가 그대로여서 끝난다. 계수는 배치의 computeNode 호출 안에서만 바뀌므로 빈 배치 뒤에는 반드시 끝난다. 직접 자식 수는 유한하고 바퀴에는 자체 상한이 있다.
- 배열 재사용 경로(canReuseArrayChildren의 append, pop, splice)는 표시 자리를 거치지 않는다. 그 있음 변화는 raw 쓰기라 registerRecalculation이 덮는다. 재사용 라운드 뒤 새 자식은 다음 라운드에 첫째 자리에서 표시된다.
- 변화 없는 쓰기의 추가 작업은 라운드마다 presenceHosts 조회 하나와, 형상 dirty가 아닌 branch마다 정수 비교 하나다. 게이트 없는 문맥은 있음 등록에서 즉시 돌아오며, 누적 있음 접두는 새 경로에 대해서만 추가한다. 조상 질의는 이미 형상 dirty인 자리에서는 집합 조회로 끝나고, load 범위 위의 조상도 필요한 경우 질의한다(GOAL-011).
- 알려진 남은 결함: overlay가 omitEmpty, omitTrailing, type을 바꾸어 있음은 그대로이고 투영 방출만 바뀌는 읽기 누락은 이번 있음 등록의 범위 밖이다. 재현 장면은 아직 필요하다. 열린 항목: 옮긴 게이트를 처음 locate한 뒤 평가 자리에서 선언 호스트까지의 경로 재계산은, 있음 변화 없이 값만 바뀌는 경우에도 SETTLE-045의 매 바퀴 평가를 지키는지 별도로 확인해야 한다.

- The first owned child is identified directly from selected declarations, the previous commit's selection fallback, and declaration child owner paths, while full policy-layer collection and evaluation, priority, and previous-commit exit semantics remain unchanged (CONTROLS-077·CONTROLS-073(7)·WRITE-032·NODE-044; same-layer keep wins).

- The suppressed-exit stale cleanup runs only for exits inside a candidate ownership scope, reusing the ownership decision already computed for the capture; candidate-free and single-kind exits keep base traversal and allocation (NODE-043, WRITE-015, 370라운드 원칙; 395C-01).

- Candidate exit cleanup owns a latent `(path, token)` inside the inherited scope when the departing candidate reaches it or no candidate reaches it, excluding every key reached by another remaining sibling candidate. A candidate exit removes unshared, unreachable stale keys within its inherited ownership scope independently of automatic-write suppression and classification metadata, without enabling any suppressed exit-policy write (NODE-043, WRITE-015, 390C-02; 395C-01). Policy inheritance still reads shared ancestors' metadata, including explicit retention, while deletion permission alone is restricted by the ownership selector; shared sources and their metadata remain unchanged. Properly owned descendants receive inherited clearing and explicit retention overrides. Broad write/load/reset clearing and committed-rule pruning retain their scope (NODE-043, WRITE-034, 26C-13/14, 390C-02; 394C-01).
- An independently exiting candidate composes the same ownership restriction from every enclosing candidate slot. Passing an already-composed inherited restriction reuses it; an unmarked root blueprint proves that a single-candidate graph needs no enclosing ownership walk (NODE-043, 390C-02; 394C-01).
- One path/token reachability query records failed `(template, segment depth)` states only for that query, so recursive alternatives explore each state at most once. For path length L this bounds work by O((V+E)L) and temporary state by O(VL) over the reachable template graph; nothing persists across queries or settlements, and candidate-free graphs retain their selector fast returns (NODE-043, 370라운드 원칙; 394C-01).
- Structural replay applies one source-selection rule at every live or inactive occurrence: prefer a retained source only when its exact `(path, token)` exists, otherwise interpret the composed input ordinarily. Kind identity does not imply storage compatibility: retained host channels are composed into public values for terminal destinations, and terminal raw values, including valid null, are interpreted ordinarily by branch destinations. Restoring a branch's own source also distributes its children and extras; another kind's source at or below that path never blocks a missing kind's input. Structural latent distribution preserves other kinds' values and classification metadata without the broad clearing used by caller writes. These paths allocate only inside candidate-bearing replay; candidate-free graphs retain their existing fast paths (NODE-043, NODE-051, 41C-01, WRITE-034, 370라운드 원칙; 394C-01).
- For every slot retained by a structural move or retaining host exit, capture its actual live and already-latent candidate sources at every depth before destructive address or storage changes, preserve their `(path, token)` identity and metadata through every later pass of the same settlement, and replay the exact source before ordinary composed input, subject to existing ownership and exit policies, including undeclared destinations and destination arrays exiting in that settlement (NODE-051, NODE-043, 41C-01, 26C-13·14; 395C-01). Protection depends on candidate-bearing subtrees rather than immediate candidate count; wholly candidate-free and single-candidate graphs keep whole-array capture and their existing traversal and allocation behavior, and direct multi-candidate item behavior is unchanged (370라운드 원칙, WRITE-087; 395C-01). The `preserveLatent` replay marker never narrows caller write/load/reset clearing (WRITE-034, 26C-13·14; 395C-01).

- A shape-external write to a candidate-bearing array binds each supplied declared source recursively to the first kind in blueprint total order at write time, clears other kinds at that written address, and preserves length and undeclared tails without reassigning the payload on re-entry (26C-13·14, WRITE-087; 395C-01). A disabled array without candidate descendants retains its whole host raw, inactiveValues representation and entry-time interpretation; retaining exit capture keeps the meaning of 35C-10 (35C-10, 38C-02, 370라운드 원칙; 395C-01).
- A candidate-bearing array's structural plan retains its existing source-move facts lazily for that settlement; the final host length bounds the protected destinations. Record disposal does not prune those destination addresses again when their candidates are inactive, including sources nested beneath intermediate arrays. The existing owned disposal walk clears moved misfit classifications belonging to actual old occurrences, and actual gate exits clear the current-shape misfit entries of departing occurrences and descendants during their existing owned detachment walk. Unrelated retained destination paths remain protected. Final tail cleanup still removes addresses beyond the final length. Replay capture also keeps already-retained absent child sources instead of redistributing the composed value (NODE-051, NODE-043, WRITE-036, VALUE-037; 394C-01).
- Single-candidate graphs retain selector fast returns and the base destination-registration condition, with no added ownership traversal, retained-source query or per-call container allocation from candidate preservation. Candidate-bearing graphs may allocate ownership predicates, captured source metadata and a settlement-local destination map, and structural capture visits their moved owned subtrees. Blueprint construction still makes one O(V) pass over V templates before skipping the reverse graph when no candidate exists (370라운드 원칙; 394C-01).

- 배열의 같은 자리 후보 모두에 게이트를 판정하며, 서로 다른 fold가 함께 켜지면 첫 활성 후보를 유지하고 객체와 같은 코드·메시지·cause의 `SHARED_NODE_CONFLICT`를 기록한다. 배타 전환은 후보별 노드와 기존 정체 토큰의 잠복 원본을 분리한다. 부재 입력은 자리의 전체 후보 사이에 분배하고, 부재 원본 읽기는 작성 순서로 보관된 후보를 찾는다. 살아 있는 선택 없이 여러 fold가 가능한 자리의 새 입력 해석만 입력을 그대로 보존해 최종 선택에 맡기며, 단일 후보만 미리 해석한다. 배열 호스트의 이탈·복원에서도 후보를 포함한 자리 하위 트리(단일 템플릿 아래 더 깊은 후보가 있는 자리 포함)의 보관 원본은 객체 자식처럼 기존 경로·정체 토큰별로 남기고 같은 후보만 복원한다. 호스트의 통째 포착 값은 그 자리의 후보별 원본을 다시 분배하지 않으며, 스냅숏은 자리당 값 하나를 유지한다. 단일 후보이며 더 깊은 후보 자손이 없는 자리의 포착·복원은 통째 배열 경로를 유지한다. 이탈의 후보 전용 자식 순회는 호스트 청사진에 후보 자손이 없거나 배열을 비우는 정책이면 건너뛴다. 보관 자리 이름과 임시 보관 키의 목록은 첫 항목이 생길 때만 만들며, 후보 자손이 없는 호스트의 분배에는 `retainedItemNames`를 붙이지 않는다. 이 목록은 복원 분배 한 번에만 적용하고 이후의 새 쓰기·배열 동사·reset·스냅숏 로드를 막지 않는다. 추가 비용은 후보를 포함한 자리의 살아 있는 하위 트리와 보관 키 수에 비례하는 포착·보존 작업 및 그 자리 이름과 임시 보관 키의 메모리이며, 동사 빠른 길의 자격은 바뀌지 않는다. 모든 후보가 꺼진 자리의 새 입력 분배는 아래 형상 밖 경로 규칙대로 청사진 전순서의 첫 종류에 한다(FRAGMENT-049, 390C-01, 26C-13·14, WRITE-087, 391C-01; 395C-01).

- 정적 배열 선택 재사용은 정착 진입의 `previousEmit`에서 해당 호스트 경로가 배열인 경우로 제한한다. 구조 단계가 이미 잘못된 종류의 raw와 local을 해제했더라도 이전 커밋의 비배열 호스트를 정적 접두로 인정하지 않으며, 부모 투영으로 해당 경로가 없는 경우도 일반 선택을 유지한다.

- 폼 청사진 전체가 branchless이고 게이트·식·파생이 없을 때 배열 호스트의 구조 길이 변경 뒤, 통째 raw·호스트 분배 입력·경로 이동·이탈 대기가 없고 현재 structure가 계산 시작의 prior이면 정적 선택을 재사용할 수 있다. 모든 선언 슬롯에서 같은 청사진·정적 유효 스키마·활성 노드·부모·경로·children 순서를 확인하며 빈 선언·가상 아이템·종류 충돌·재생성 접두는 일반 선택을 유지한다. 전체 증명 뒤 기존 선언 ID를 등록하고 dirty 자식만 기존 계산 콜백으로 처리한다. 스냅숏·잠복·게이트 평가·실패 기록·state dirty·호스트 계산·전이·커밋·배달 순서는 유지한다. 속도 비용은 O(슬롯 수)의 정체성 확인(슬롯별 경로 문자열 비교 포함)과 진입당 `previousEmit` 경로 조회 O(깊이)이며 일반 선택의 구조 복제·슬롯별 잠복/이탈 조회·불변 active 캡처를 제거한다. 기존 선언 ID 메모만 재사용하며 새 보유 캐시·노드/문맥 필드·폼 간 공유는 없다.

- 계산 진입에서 branchless와 빈 shapeDirty·entered를 증명한 경우만 안정 계산 몸통으로 직접 재귀한다. 각 노드의 dirty 확인·stateDirty 표시·자식 post-order·동일 updateOutput 인자·dirty 삭제와 터미널 루트의 schema 선택은 유지한다. 게이트·생김·형상 변경은 기존 계산을 사용한다. 속도 비용은 진입의 O(1) 부재 확인과 기존 O(방문 노드) 작업이며 노드마다 반복하던 gate/appearance/shape 검사·일반 shell을 제거한다. 메모리 비용은 기존 dirtyChildren 배열과 깊이 D의 재귀 stack을 유지하고 새 heap container·노드/문맥 필드·보유 cache·폼 간 공유는 없다(109 갱신 Q1).

- 분기·파생·잠복 원본이 없고 살아 있는 비루트 scalar의 현재 원본·입력·유효 타입이 같은 경우만 쓰기 진입을 특화한다. dispose·가상·detach·잠복 검사와 빈 wrong-kind release의 호출을 생략하되 조상 표시와 실제 wrong-kind 처리, 표시·계산·전이 조건·상태 키·커밋·배달 순서는 유지한다. 이 증명은 빈 derive 검사와 대상 유효 타입 재해석에만 전달하며 실제 생김·이탈·배열·오류 처리는 기존 마감이다. 속도 비용은 고정 수의 O(1) 타입·capability·size 검사이며 빈 helper·배열·sort 콜백 및 중복 유효 타입 해석을 제거한다. 메모리 비용은 호출별 boolean/local만 추가하고 빈 release 임시 배열·클로저를 줄이며 새 상주 메모리·문맥 필드·폼 간 공유는 없다(109 갱신 F1).

- 불일치 경로가 계속 비었고 메모가 루트 빈 경로 row 하나이면 커밋 번호만 갱신한다. 최초 row와 불일치→빈 전이 및 다른 row가 있는 경우는 기존 초기화를 유지한다. 현재 커밋 검사·경고·진단·방문·배달 순서는 같다. 속도 비용은 O(1) row/size 확인이며 빈 경로의 clear·색인 재생성·set을 제거한다. 메모리 비용은 기존 폼 소유 row를 재사용하여 커밋별 row/색인 할당을 줄이고 새 보유 메모리·필드·폼 간 공유는 없다(109 갱신 C1).

- 게이트 식의 의존 값은 기존 의존 배열 순서대로 매 평가마다 classic loop에서 읽는다. 게이트 registry는 실제로 요청한 host/dependency의 절대 경로와 포인터의 decoded segment만 재사용하며, 현재 owner가 host이면 그 record를 직접 사용한다. 다른 host와 projected 값은 현재 구조에서 원래 평가 자리마다 다시 읽는다. 공표·식 호출·catch·gateThrowVersion·오류 위치는 유지한다. 속도는 유일 host/dependency당 O(경로 길이)의 해석 뒤 O(1) 조회이며 같은 포인터의 split·unescape와 host 재탐색을 제거한다. 메모리는 런타임 소유 registry에 O(유일 host/dependency 쌍 + 유일 포인터 segment 수)의 map·문자열·배열을 보유하며 값·live node·조건 결과를 추가로 보유하지 않는다. 입력 배열은 기존 길이대로 유지한다. 종단 시간과 힙 바이트는 별도 세션에서 판정한다(106라운드 게이트 읽기, 117C-01, 변경 2).

- 빈 단계는 입력 부재가 기존 불변 capability 또는 이번 작업 집합의 크기·단일 대상 확인으로 O(1)에 증명될 때만 호출을 생략한다. 파생 규칙이 없으면 파생 실행·기준 커밋을, 식이 없으면 이탈 식 커밋을, 이탈·소멸·생김·되살림·채움·배열 작업이 모두 없으면 이탈 마감을 생략한다. 게이트·생김·이탈이 없고 쓰기 입력이 비었거나 유효 타입이 정적 타입과 같은 원래 대상 하나뿐이면 전이를 생략한다. 빈 이탈 스냅숏·trace 마감·배열 정렬도 진입하지 않는다. 값·오류·배달·revision·커밋 번호·논리 단계 순서와 실제 적용 라운드는 유지하며 일을 다른 단계나 다음 호출로 옮기지 않는다. 속도 비용은 고정 수의 O(1) 부재 검사이며 빈 helper의 호출·반복자·임시 그릇을 제거한다. 새 영구 메모리·노드/문맥 shape·색인은 없고 실제 작업이 있는 경로의 시간·메모리 차수는 유지한다(96C-01, 98라운드 A1).

- 89C-03의 분기 부재 capability가 확정된 청사진은 게이트 예산·호스트 registry·게이트 식 색인을 만들지 않고 불변 빈 조회를 공유한다. 역의존 trie·기능 색인은 분기 부재와 별도로 증명된 식/watch/state 부재에서만 생략하며, derive·watch·state가 있으면 기존 색인·역의존 표와 정착을 유지한다. 정착 순서·커밋·if 작성 위치별 컴파일은 유지한다. 기능 없는 청사진에서는 O(S) 색인 순회와 할당을 제거하고 O(1) capability 조회를 더한다. 기능 있는 청사진의 시간·메모리 차수는 유지하며 실제 수치는 93라운드 짝 측정에 기록한다.

- 정착 안에서는 동기 보고기나 콘솔 경고를 호출하지 않는다. 청사진 생성 오류와 로드를 중단하는 예외 외 기록은 사슬 끝 또는 마운트 준비 이펙트까지 보류한다. 사슬이 없는 내부 정착도 경고를 보관하며 중간 상태를 보고기에 노출하지 않는다. 일반 사슬의 작업량은 유지되며, 사슬 없는 정착에서는 즉시 출력 대신 고유 경고당 O(1) 등록과 배달까지 O(W) 기록 보유가 추가된다. 경고 없는 노드의 추가 순회·고정 칸은 없다. 시간 및 힙 바이트 차이는 별도 미측정이다(ERROR-019, 89C-01).

- S2의 커밋 방문자는 변경·진입·상태·경로·감시·대기 사건 후보를 합친 집합의 각 노드에서 종류 불일치와 Refresh, 전역 상태 증감, 배달 차이, 비트별 개정을 한 번 처리한다. 이탈 하위 트리의 정리는 별도 생명주기 작업이다. 전역 증감은 기존 이탈→진입→변경→상태→로드 순서의 키 삽입 순서를 보존하여 합산하고 배달 전에 공표한다. `UpdateGlobalState`는 최외곽 진입 끝에 한 번이며 진단·커밋 번호와 사건 이름은 유지한다(SETTLE-006, EVENT-007·024·062, 43C-01, 65C-03).

- 기능 통과는 청사진의 기능 정적 색인과 이번 재계산(변경·상태 dirty) 목록의 교집합만 방문한다. 기능 선언이 없으면 방문은 0이다. 이후 단계가 새 기능 통과를 더할 때에도 정적 색인을 두며, 전체 범위 방문이 필요하면 정적으로 범위를 알 수 없는 이유를 이 DETAIL에 명시한다. 방문 순서가 관측 결과에 드는 통과는 SETTLE-006 순서를 유지한다(65C-02, SETTLE-017).

- 의존 방향은 `blueprint < record < {behaviors, navigation} < validation < derive < settle < dispatch < FieldNode`이다. derive는 settle의 형제 fractal(`engine/derive`)이며 settle의 라운드 실행기·커밋·의존 색인 organ과 `types/`는 derive 진입점만 소비하고, derive는 settle을 가져오지 않는다. 값 동등·의존 경로·선언 층 해석은 engine의 `utils/`에서 둘이 함께 가져온다(NODE-016·045, LANDING-083·084). 살아 있는 노드의 계산은 `node.behavior`를 호출하고 형상 밖 값의 정적 해석과 빈 값 판정은 behaviors 진입점을 소비한다. `FieldNode`·`write`는 import하지 않고 `validation` 진입점의 동기 가드 읽기만 소비한다(VALIDATE-015·044, NODE-016, NODE-006, WRITE-082·098, VALUE-034).
- 정착의 내부 organ은 진입점에서 이름으로 제공하며, 바깥 소비자를 섬기는 칸의 유지 이유와 직접 import 예외는 Boundary Exemptions에 기록한다(NODE-016).
- `__tests__/settle.branchless-feature-indexes.test.ts`는 분기 없는 청사진에서도 derive·watch·state 기능 색인과 역의존 색인이 만들어지는지, 그리고 빈 파생 규칙 표를 derive 부재가 capability로 증명된 경우에만 공유하는지를 검증한다. 두 사례는 일반 분석 강제(`vi.mock`)를 쓰지 않는다.
- 한 진입은 동기적으로 표시 → 계산(호스트 바퀴) → 파생(쓰기가 나오면 표시로) → 전이(쓰기가 나오면 표시로) → 커밋한다. 전이가 재계산을 부른 뒤에도 파생을 다시 판정하며, 적용 쓰기가 있는 파생 라운드는 한 정착 전체에서 전이 뒤에도 이어 세고 상한은 25이다(SETTLE-002–006·017, EVENT-020, LANDING-063).
- 출력 참조의 되살림은 한 정착에서 두 번 이상 바뀐 노드에 대해 직전 커밋의 배달 기준(`deliveryPreviousLocal`·`deliveryPreviousEmit`)과도 견준다. 정착 중간 값을 거쳐 직전 커밋과 내용이 같아지면 직전 커밋의 local·emit 참조를 되살려, 배달·revision·감시가 나가지 않는다(SETTLE-043 (나), GOAL-011, EVENT-006, P-25). 비교는 이 정착에서 이미 `UpdateValue` 비트가 선 노드의 출력 계산에만 더해진다. 객체·배열 branch 호스트는 깊은 `sameValue` 전에, 정의된 자식 방출마다 직전 커밋 값의 같은 이름 항목과 참조가 같은지를 재계산된 자식부터 본다. 자식이 부모보다 먼저 끝나 되살린 자식 참조가 이미 자리에 있으므로 이것은 되살림의 필요조건이고, 실제로 바뀐 자식이 있으면 깊은 비교 없이 재계산 자식 수만큼의 비용으로 끝난다(SETTLE-001·003). 그 밖의 노드는 `sameValue` 한 번이고, emit이 local과 같은 참조이며 두 배달 기준도 같으면 emit 비교는 local 비교의 답을 쓴다. 되살림 자리는 조립이며 커밋이 아니다: 커밋 자리에서 되살리면 형제가 실제로 바뀐 정착에서 부모 값이 자식의 새 참조를 든 채 자식만 옛 참조로 돌아간다. 알려진 차이 하나: 같은 정착에서 자식 노드 인스턴스가 바뀌어 내용은 같고 참조만 다른 방출이 생기면 부모는 되살아나지 않아 배달이 한 번 더 나가며, 값은 같다. 저장하는 필드나 단계 순서의 변경은 없고, 배달 자리는 여전히 참조로 비교한다(67C-01).
- 정착 문맥의 선택 칸 `arrayAppend`는 `arrangeFieldNodeItems`가 자격을 준 정적 push 또는 `insert(N)` 한 번의 덧붙임 증명이다(G8). 정적 아이템 선택 재사용 증명(`canReuseArrayChildren`)은 그 호스트에서 먼저 새 자리 하나만 확인한다: 게이트 없음, 통째 raw 없음, 아이템 수 N+1, 공표된 구조·children 참조 그대로, 분배 입력·경로 이동·이탈 대기 없음, 호스트 아래 dirty 직계 자식이 새 자리뿐, 템플릿이 있으면 새 자식의 청사진·이름·부모·경로·정적 유효 스키마·활성 상태이며, items와 prefixItems가 모두 없는 extras 배열이면 새 아이템 노드 없이 길이 N+1의 extras·빈 children·dirty 직계 자식 부재를 확인한다. 성립하면 재사용(`reuseArrayChildren`)은 템플릿이 있을 때만 새 자식의 정적 선언 ID를 공표하고 dirty이면 계산하며, 어긋나면 증명을 무효로 하고 같은 라운드에서 기존 전체 재사용 증명·일반 선택으로 이어 간다. 출력 갱신은 증명이 유효하고 호스트 children이 공표된 참조 그대로이며 `local`이 증명의 직전 `local` 또는 첫 합성 결과일 때만 행 합성에 `hint.append`(N)를 넘긴다. 참조 보존은 children 참조가 같으면 원소 비교 없이 넘어간다. 출력 갱신의 직전 커밋 되살림 확인은 배달 기준 `local`과 새 `local`이 길이가 다른 배열이면 자식 방출 확인 없이 건너뛴다(그때 `sameValue`가 거짓이므로 결과가 같다). 스냅숏 정렬은 루트 스냅숏 참조가 덧붙임 공표 뒤 그대로이고 아이템 수가 N+1인 증명 호스트만 뺀다(꼬리 적용이 이미 밀도 있는 N+1 자리를 공표했으므로 정렬 결과가 같다). 정착 단계 순서·게이트 평가·배달 집합은 바뀌지 않는다.
- 정착 문맥의 선택 칸 `arrayPop`은 `arrangeFieldNodeItems`가 자격을 준 정적 `pop()` 또는 `remove(N−1)` 한 번의 끝 자르기 증명이다(G8 pop, 371C-01). 정적 아이템 선택 재사용 증명(`canReuseArrayChildren`)은 그 호스트에서 먼저 남은 자리를 방문하지 않고 고정 수의 사실만 확인한다: 게이트 없음, 통째 raw 없음, 아이템 수 N−1, 공표된 구조·children 참조 그대로, 분배 입력·경로 이동·이탈 대기 없음, 호스트 아래 dirty 직계 자식 없음. 성립하면 재사용(`reuseArrayChildren`)은 새 자리가 없으므로 아무것도 공표하거나 계산하지 않는다. 어긋나면 증명을 무효로 하고 같은 라운드에서 기존 전체 재사용 증명·일반 선택으로 이어 간다. 출력 갱신은 증명이 유효하고 재계산 목록이 없으며 호스트 children이 공표된 참조 그대로이고 `local`이 증명의 직전 `local` 또는 첫 합성 결과일 때만 행 합성에 `hint.truncate`(N−1)를 넘긴다. 스냅숏 정렬은 루트 스냅숏 참조가 꼬리 적용 공표 뒤 그대로이고 아이템 수가 N−1인 증명 호스트만 뺀다(꼬리 적용이 이미 밀도 있는 N−1 자리를 공표했으므로 정렬 결과가 같다). 정착 단계 순서·게이트 평가·배달 집합은 바뀌지 않는다.
- 정착 문맥의 선택 칸 `arraySplice`는 `arrangeFieldNodeItems`가 자격을 준 정적 가운데 `remove(i)`(i < N−1) 또는 `insert(i)`(i < N) 한 번의 자르고 잇기 증명이다(G8 splice, 371C-01, 355C-01과 365라운드 소유자 답, `architecture/reviews/round-365-owner-answers.md`). 정적 아이템 선택 재사용 증명(`canReuseArrayChildren`)은 그 호스트에서 먼저 접두를 방문하지 않고 꼬리 자리만 확인한다: 게이트 없음, 통째 raw 없음, 아이템 수 N∓1, 공표된 구조·children 참조 그대로, 분배 입력·이탈 대기 없음, 경로 변경 기록이 적용이 남긴 수 그대로, 호스트 아래 dirty 직계 자식이 모두 자리 i 이상, 꼬리 자식마다 구조 항목·청사진·이름·부모·경로·정적 유효 스키마·활성 상태, 새로 들어온 자식은 insert의 자리 i뿐. 성립하면 재사용(`reuseArrayChildren`)은 꼬리 자리 i..(새 아이템 수−1)의 정적 선언 ID만 다시 공표하고 dirty인 꼬리 자식만 계산한다. 접두 0..i−1의 선택 항목은 이미 가진 참조 그대로이다. 어긋나면 증명을 무효로 하고 같은 라운드에서 기존 전체 재사용 증명·일반 선택으로 이어 간다. 출력 합성과 스냅숏 정렬은 이 증명을 읽지 않는다. 정착 단계 순서·게이트 평가·배달 집합은 바뀌지 않는다.
- 호스트의 children 배열은 새로 고른 자식 목록이 직전 배열과 순서·참조가 모두 같으면 직전 배열을 그대로 둔다(`isSameChildList`, `primeHost`·`selectChildren`·`flushPendingOutput`). 같은 배열 참조는 객체 행 합성의 빠른 길(직전 형상의 children 참조와 같을 때 바뀐 자리만 패치)의 조건이고, 내용이 같은 children 재생성이 내던 변경 배달 하나가 빠진다(SETTLE-043 (나), GOAL-011). 형상이 바뀐 비루트 호스트 아래 형제 N개를 둔 쓰기(P-09)의 N 비례 시간은 형제 재계산이 아니라 부모가 자기 자식 목록을 쓰기마다 고정 횟수(호스트 준비 1회, 선택 2회, 합성 4회) 훑는 비용이며, 부모가 재계산 목록에 있으므로 SETTLE-017의 허용 범위 안이다.
- 정적 폼의 통째 쓰기는 값이 바뀌지 않은 잎 자식을 표시하지 않고, 키 집합이 그대로인 호스트를 형상 dirty로 만들지 않는다(372C-01, `settle-static-same-value-write`). 제거하는 비효율은 바뀌지 않은 자식마다 돌던 dirty 표시·재계산 등록·계산·비교와 호스트의 형상 경로 합성이다.
  - **자격(상수 시간, `utils/input/utils/admitsSameValueWrite.ts`).** 모두 성립해야 한다: 쓰기 종류가 로드가 아니고 자동 쓰기가 아니다. 게이트가 없고 청사진 전체가 정적 첫 로드 증명(`StaticFirstLoadCapability`)을 가진다. 배치(`batchDepth`, 여러 쓰기를 합친 교체 범위 `replacePaths`)·방문 표시·로드 범위 밖이다. 쓰인 호스트 H와 그 아래에 잠복 원본과 불일치 경로가 없다(`latentRaw`·`misfitPaths`의 `pathIndex.under(H)`, H 자신 포함). H 밖의 잠복 원본과 불일치는 H의 통째 쓰기가 건드리지 않으므로 자격을 막지 않는다(372C-01): VALUE-031과 18C-96은 둘 다 쓰인 호스트의 하위 트리 안에서 작용한다. 첫 `setValue(getValue())`는 H 아래의 잠복 원본과 투영으로 빠진 원본을 없음으로 바꾼다(18C-96). 교체 쓰기는 `markWrite` 전에 H 범위의 잠복 원본을 비우고, 그 비움이 미공표 잠복 변경(`latentRawDirty`)을 세우므로 그 쓰기는 지금 경로를 탄다. 비워지지 않고 남은 H 아래의 잠복 원본(Merge 등)과 H 아래의 불일치는 이 조건이 지금 경로로 보낸다. `latentRawDirty`는 경로가 없는 폼 전체 표시이고 커밋의 비활성 값 공표가 내리므로, 범위를 좁히려면 바뀐 경로를 새로 기록해야 한다. 그래서 폼 전체로 남긴다. 로드 제외의 문구는 WRITE-090을 따른다. 호스트가 떼어지지 않았다. 쓰기 하나뿐인 배치(입력 쓰기 포함)는 자격을 얻고, 여러 출처의 배치(`loadScope`, `replacePaths`)만 거절한다. 62C-01, 372C-01에 따라 배치 안의 동사는 배치 끝에 통째 쓰기 하나가 되고, `markWrite`는 두 깊이가 0으로 돌아온 뒤 그 쓰기 하나를 보기 때문이다.
  - **호스트(`utils/input/utils/keepsHostKeys.ts`).** 자격에 더해 호스트의 직전·다음 통째 raw와 extras가 없고 아이템 수가 그대로여야 한다. 객체는 입력의 모든 키가 정의된 값을 가지고 직전 `local`에 있어야 하며, 교체 쓰기이면 키 수도 직전 `local`과 같아야 한다(Merge는 입력 키가 모두 직전 `local`에 있으면 된다). 배열은 입력이 배열이고 직전 `local`이 같은 길이의 배열이어야 한다. 성립하면 호스트를 `shapeDirtyPaths`에 넣지 않아, 계산은 재계산된 자식만 합성하는 증분 경로를 탄다.
  - **잎 자식.** 성립한 호스트에서 비 branch 자식은 정적 스펙으로 해석한 값이 지금 raw와 `sameValue`이면 `markWrite`를 부르지 않는다. 그 자식에서는 dirty 표시·`writtenInputs` 기록·재계산 등록·계산·비교가 빠지고, 입력 크기 K의 해석·비교 한 번은 남는다. 값이 다른 잎 자식은 그 해석 값과 해석할 때 조회한 정적 스펙을 함께 `markWrite`에 넘기고, `markWrite`는 쓰지 않는 기본 스펙을 다시 조회하거나 그 자식을 다시 해석·비교하지 않고 바뀐 것으로 기록한다. 그래서 자식마다 스펙 조회·해석·비교는 한 번뿐이다. 해석하지 않은 자식은 기존 기본 스펙 조회를 유지하며, branch 자식은 지금처럼 `markWrite`로 내려가 자기 호스트 조건을 따로 판정한다.
  - **물러남.** 조건이 하나라도 어긋나면 그 호스트는 지금 경로를 그대로 탄다(모든 자식 표시, 형상 dirty). 새 경로는 없고 일반 경로 안의 건너뛰기이다.
  - 같은 길이 배열의 통째 `setValue`도 이 규칙에 든다(365라운드 통째 setValue 조건 다섯). 건너뛰는 일은 값이 같은 자리의 분배·재계산·재공표뿐이며, 로드가 아니므로 로드 전용 단계는 없다. 쓰기 종류는 값에서 추론하지 않고 호출자의 선언 그대로이다(D-4). 정적 폼만 대상이고, 일반 경로를 강제한 실행과 완전 동치이다.
  - 원장 확인(같은 값을 쓴 잎이 `writtenInputs`에서 빠져도 바뀌지 않는 판정):

    | 판정    | 판독                                                                                                           | 근거              |
    | ------- | -------------------------------------------------------------------------------------------------------------- | ----------------- |
    | 채움    | 채움은 노드가 생길 때만 일어나며 쓰기의 기존 자리는 채우지 않는다. `setValue(getValue())`는 멱등이다           | WRITE-090, 18C-96 |
    | Refresh | Refresh는 raw가 실제로 바뀐 노드(`changedRaw`)에만 나간다. `setValue(getValue())`의 Refresh 대상은 빈 집합이다 | EVENT-071, 26C-03 |
    | 전이    | 정적 자격에는 union과 게이트가 없어 유효 스키마가 정적 스키마이다. 같은 값을 쓴 잎의 전이 재해석은 무동작이다  | 정적 첫 로드 증명 |
    | 에지    | 값 동등은 `sameValue`이므로 값이 같은 잎은 에지를 만들지 않는다                                                | SETTLE-043        |

  - 바뀌지 않는 원칙: SETTLE-001(단계 순서), SETTLE-042(키 순서와 수용된 사본), SETTLE-043, NODE-051, BLUEPRINT-007, WRITE-013, 공개 API.

## Structure

- `types/`: 정착 문맥과 경로 저장소의 계약 형.
- `utils/declarations/`: 선택 선언과 제어 층의 해석.
- `utils/latentStore/`: 잠재 저장의 기본 단위: 경로·종류별 원본과 저장 메타데이터의 기본 단위를 제공한다(분배와 복원은 `latent`).
- `utils/input/`: 호출자 입력의 해석과 쓰기 표시.
- `utils/templatePaths/`: 템플릿 경로의 결합과 확장.
- `utils/errors/`: 정착 실패의 수집과 식별.
- `utils/output/`: 계산 출력의 갱신과 공표.
- `utils/gates/`: 게이트 등록과 평가.
- `utils/latent/`: 잠재 값의 분배와 복원: 저장 기본 단위를 사용해 노드·슬롯의 원본을 해석하며 저장 색인의 소유권은 갖지 않는다.
- `utils/controls/`: 감시 값과 상태 키의 읽기·결합.
- `utils/loadValues/`: 로드 값과 기본값·배열 스냅숏 자리의 정렬.
- `utils/scratch/`: 정착별 작업 공간과 dirty 경로.
- `utils/dependencies/`: 의존 색인과 재계산·있음 변경 등록.
- `utils/compute/`: 현재 형상과 자식 선택의 계산.
- `utils/detached/`: 떼어진 참조와 비활성·불일치 값의 읽기.
- `utils/dispose/`: 폐기 트리와 쓰기 가능 여부.
- `utils/pathStores/`: 런타임 경로 저장소의 묶음.
- `utils/derivation/`: 파생 라운드와 쓰기 적용의 조율.
- `utils/commit/`: 커밋 상태·배달 기준의 확정.
- `utils/transition/`: 생김·나감·채움의 전이.
- `utils/settlement/`: 표시 뒤 계산·파생·전이·커밋의 실행.
- `utils/write/`: 일반 쓰기와 교체 범위의 조율.
- `utils/structure/`: 배열 길이와 공통 구조 읽기.
- `loadFieldNodeAtMount/`: 첫 마운트 정착을 소유하는 자식 fractal.
- `arrangeFieldNodeItems/`: 배열 구조 계획의 적용을 소유하는 자식 fractal.
- `utils/reset/`: 폼·하위 트리 로드와 상태 초기화.
- `utils/context/`: 맥락 변경의 정착.

- 위 순서는 아래에서 위로 향하는 의존 층이며, 각 compartment는 이 순서에서 자기보다 아래에 놓인 compartment만 import한다. 두 자식 fractal은 공통 구조 층 위, reset과 context 층 아래에 놓인다.

## API Contracts

- 이 계약의 `(path, kind)`와 `(경로, 종류)`에서 kind/종류는 union의 fold를 포함한 식별 토큰이다. union은 `union:<fold mask>`, 다른 종류는 기존 kind 문자열을 쓴다. 이탈 대기·잠복 원본과 순서·게이트 경로 등록·커밋 선언·나감 정책·채움 집합은 모두 같은 토큰으로 구별한다. 선택의 재사용·비활성 삭제와 문서 순서 검색은 청사진 노드 객체 동일성으로 판정하므로 뒤 종류가 살아 있어도 첫 활성 종류가 생존하며 다른 fold의 잠복 값은 넘겨받지 않는다. 나감 정책의 호스트 식별도 같은 토큰을 써서 fold별 마지막 커밋 값을 읽는다. 행 선택과 object/array/virtual 분류는 기존 kind를 쓴다(BLUEPRINT-043, NODE-043·044, FRAGMENT-049, 389C-02, 390C-01).

- `getControlLayers`의 조각 소유권은 선택된 노드 선언의 `getFragmentOwnerPaths` 결과로 호출마다 지연 생성한 소유 경로 집합 하나에서 판정하며 호출 간 캐시는 두지 않는다. 선언·층 순서는 유지하고, 나감의 `commitExitPolicyValues`·`captureLatentDescendants`가 자식마다 한 번 호출하는 경로는 기록만 하며 바꾸지 않는다(P-08, GOAL-011).

- `__tests__/scenarios`의 `effectiveList.test.ts`·`union.entry-two-step.test.ts`는 정착 선택과 union 진입의 통합 장면을 이 소유 구획에서 검증한다. 공유 owned-inline 기준 데이터는 engine 공용 시험 fixture에서 읽는다.
- watched object의 동일성 비교는 `utils/commit/utils/__tests__/isSameDeliveryValue.test.ts`가 비교 함수의 소유 구획에서 검증한다. write 배달 시험은 이 내부 단위를 직접 가져오지 않는다.

- 정착·자식 선택·제어 선언·배달의 배열 순회는 인덱스 `for`/`while`, 순서 집합과 맵은 `for...of`를 사용한다. 게이트는 첫 거절에서 멈추며 선언/깊이/배달 순서와 같은 값의 참조는 유지한다. 동일 자료의 filter→map과 flat 중간 배열을 제거해 O(N) 시간의 상수를 줄이고 임시 O(N) 메모리를 절감한다. 정적 shape 검증은 완전 일치 확인 뒤 계산을 시작하므로 두 루프를 유지한다(87라운드 원칙 3).

- 게이트 없는 청사진의 선언 선택은 불변 선언 배열을 공유하며 커밋마다 발생 경로별 색인을 복제하지 않는다. 현재 계산의 선택이 우선이고, 게이트가 있는 트리는 기존 커밋 경로 색인과 이탈 선택을 유지한다. 제어 읽기는 선언 배열 identity별 ID 메모를 사용한다. 정적 커밋의 O(발생 수 × 경로 깊이) 색인 작업·메모리를 제거하고 O(사용된 선언 수)의 약한 캐시를 둔다(86C-02 ii, NODE-006, SETTLE-017).

- 정적 자식 선택은 빈 이탈 대기·latent 저장소를 조회하기 위한 경로 직렬화를 하지 않는다. 이미 같은 선언 ID 참조를 선택했으면 재등록하지 않으며 모든 노드 생성·생김 기록·원본 분배는 유지한다. 속도는 빈 조회와 문자열 생성 횟수만큼 개선하며 새 영구 메모리는 없다(86C-02 i, NODE-006, GOAL-011). 게이트가 있는 선택에서도 이탈 대기 맵이 비어 있으면 `selectChildren`의 비활성 항목과 `primeHost`의 baseline 항목은 키를 만들지 않고 조회·삭제도 하지 않는다(386C-01).
- 둘 이상의 oneOf/anyOf 분기를 가진 객체 호스트는 load가 아닌 첫 실제 후보 선택에서만 단일 선언 계획을 준비한다. 마운트·primeHost에서는 준비하지 않으며 if-then·단일 분기·미전환 호스트는 계획을 보유하지 않는다. primeHost는 이미 준비된 baseline만 소비한다. 후보·게이트·이탈·공표 순서는 유지하며 각 원래 평가 자리의 조건 호출은 한 번이다. 속도 비용은 최초 사용 O(후보 수)의 자격 확인과 준비이며 이후 후보 배열·단일 선언 ID 배열 생성·후보별 사전 공표 진입을 제거한다. 메모리는 준비된 청사진 호스트 수명에 O(후보 수)의 step·ID·baseline을 보유하며 실제 값·노드·게이트 결과는 보유하지 않는다. 종단 시간과 힙 바이트는 별도 세션에서 판정한다(89C-03, 117C-01, 변경 1b). 준비 판정은 부적격 호스트의 null까지 약한 map에 남기며 primeHost와 선택은 그 map을 직접 조회해 항목이 없을 때만 계획 함수를 부른다. 그래서 if-then·단일 분기 호스트도 첫 비load 선택 뒤에는 쓰기마다 함수 호출이 없고, 메모리는 게이트 있는 비합집합 호스트마다 null 항목 하나이다. 일반 선택의 사전 공표 호출은 pending output이 있을 때만 들어가며, 이 조건은 그 함수의 즉시 반환 조건과 같아 동작이 같고 빈 호출과 경로 문자열 생성을 없앤다(122 F1·F2, 변경 1c).
- 커밋 배달은 global-state 후보를 먼저 방문하고 그 기존 membership에 없는 추가 후보를 삽입 순서대로 한 번씩 방문한다. 후보 합치기의 속도 비용은 O(G+C) 순회와 추가 후보당 membership 확인이며 두 번째 ordered Set의 복사·삽입을 제거한다. 메모리 비용은 커밋당 임시 Set 하나와 합집합 원소 보관을 줄이고 두 Set iterator만 사용하며 새 상주 칸·캐시·노드 필드는 없다. automatic 작업 색인과 소멸 방문 집합은 같은 형태로 생성하고 automatic 색인은 중간 map 배열 없이 한 루프로 채운다. 모든 영향 노드의 revision·페이로드·방문 순서와 모든 revision 증가 뒤 배달을 유지한다(EVENT-001·007·024, SETTLE-006, 107C-01 (b), 110 D1).

- dirty 경로는 일반 add/delete 색인으로 시작하고 게이트 없는 등록 경계에서 최초 descendant 순서를 유지한 직접 에지 색인으로 전환한다. 이후 추가 시 아직 dirty가 아닌 조상까지만 닫고 직접 부모–자식 에지 하나씩 색인한다. 실제 노드의 계산 완료가 자식 우선으로 소비하므로 생성 O(N), 잎 갱신 O(D), 색인 메모리 O(dirty 노드)이며 내부에서 만든 모든 조상을 다시 모든 접두에 색인하지 않는다. 존재하지 않는 감시 경로가 남아 조상이 먼저 소비될 수 있어 등록의 조상 복구 루프는 유지한다. 게이트가 있는 계산과 일반 DirtyPathSet 사용은 임의 add/delete 뒤 첫 살아 있는 descendant 순서를 보존하는 기존 색인을 쓴다(SETTLE-017·047, 82C-01).
- 전이 채움은 명시 raw와 기본값 부재를 먼저 제외하고 실제 기본값 후보에만 하위 원본 부재를 확인한다. 내부 기본값 없는 N노드 트리의 채움 후보 탐색은 O(N), 추가 영구 메모리는 없으며 기존 부모 우선 채움과 잠복/자손 원본 보호는 유지한다. 여러 층에 실제 branch 기본값이 있는 입력의 source 확인 비용은 별도이다(SETTLE-004·005, 82C-01).

- 형상 불변 객체의 부분 합성도 배열과 같은 `hint.incremental` 계약으로 전체 동등 비교를 생략한다. 행은 바뀐 자식의 값·키 존재를 검증하고 키 집합이 바뀐 경우 힌트를 켜지 않는다. 정착은 재계산 자식만 `sameValue`로 비교하여 같은 내용의 새 하위 참조가 와도 부모의 기존 참조를 되살린다. 비용은 힌트 객체 하나와 재계산 목록·실제 바뀐 하위 내용이며 직전 local 얕은 사본 밖 형제 전수 검사를 추가하지 않는다(SETTLE-042·043, 65C-04, 82C-01).

- 비순환 청사진은 첫 확인 O(V+E)의 DFS 결과를 약한 캐시에 보관하여 각 생성의 재귀 조상 탐색을 O(1)로 생략한다. 임시 DFS 메모리는 O(V), 보유 메모리는 청사진당 boolean 하나이다. 재계산 조상 확장은 호출당 방문 집합으로 중복을 차단하여 유일 경로·조상 수만큼만 확장하고 O(유일 경로 수)의 임시 메모리를 쓴다. 경로 문자열 해석과 dirty descendant 색인의 O(총 경로 segment 수) 비용은 별도이다(SETTLE-017, BLUEPRINT-030, 82C-01).

- BLUEPRINT-030의 원본은 호출자가 로드 V·쓰기·입력으로 준 값이다. 이번 정착의 호스트 채움 D가 분배한 값과 그 값으로 생긴 노드는 원본 없는 사슬에 속한다. 형상 확장과 기본값 채움은 같은 판정으로, 동일 청사진 위치가 호출자 원본 없는 조상에서 반복되고 거리가 청사진 전체의 최대 상대 게이트 읽기 범위 이상이면 `RECURSIVE_SHAPE_DIVERGED`, `cause: 'budget'`, `exceededBudget: 'recursion'`으로 끊는다. 채움은 유효 스키마도 같은 경우에 판정한다. 현재 발생에 명시 분배된 배열(빈 `[]` 포함)은 없음이 아니므로 자신의 D로 다시 채우지 않으며, 호출자 값이 이끄는 유한 배열 확장은 허용한다. 상대 범위는 두 경로가 공유하는 WeakMap에 청사진당 한 번 계산해 숫자 하나를 보관한다. 정상 비순환 경로는 O(1)로 제외하고, 순환 후보는 조상 깊이와 실제 원본 탐색 비용을 사용한다(92C-01·02, 78C-02).

- 역의존 owner와 호스트 게이트의 반복 중복 확인은 삽입 순서를 유지하는 Set으로 처리한다. 등록·수집 시간은 선언/게이트 수에 선형이며 추가 메모리는 유일 owner/게이트 수에 비례한다. 게이트의 평가 순서·횟수·고정 출발점은 바꾸지 않는다(SETTLE-017·020·044·050, 82C-01).
- 전이 채움은 생김 집합의 깊이별 bucket으로 부모 우선·같은 깊이 삽입 순서를 유지한다. 호스트 채움 D의 쓰기로 생긴 자손은 같은 라운드의 뒤 차례에서 없음인 경우 `controls.default` > `default`를 받으며 D가 명시한 값은 보존한다. 같은 생김 묶음에서 처음 계산된 branch의 자손과 현재 D가 처음 만든 배열 자리만 이어 채운다. 이미 평가된 게이트를 자손의 채움이 뒤집어 노드를 내거나 내보내면 새 가지 아래에서도 다음 전이 라운드로 센다. 노드마다 채움은 한 번이고 상한은 게이트 가진 조각 수 + 노드 게이트 수 + 1 그대로이다. 새 생김 커서만 읽으므로 기존 노드를 전수 재방문하지 않는다. 시간은 각 묶음의 O(N+D) bucket 작업과 기존 재계산이며, 호스트 Set·생김/채움 전 길이 Map 및 임시 O(N+D) 참조를 사용한다. 게이트가 있을 때만 묶음의 첫 평가 branch Set과 이번 채움이 배열 자리를 늘린 호스트 Set을 두며 O(B+A) 등록·참조를 더한다. 배열 길이 기록 수집은 기존 자동 배열 로그 순회에 합친다. 노드 shape·영구 메모리는 늘리지 않는다(WRITE-082·088, SETTLE-004·005·017, 82C-01, 90C-01, 92C-03).

- 커밋에서 변경된 객체 호스트의 유효 `required` 목록을 직접 자식의 필수 표시에 반영한다. 필수 여부가 바뀐 자식은 값 변경 없이 `UpdateControlledProperties`를 받아 입력 선택과 DOM 표시를 갱신한다. 형상을 고르는 데 `required`를 쓰지는 않는다(LANDING-027·132, FRAGMENT-026). 검사는 변경된 호스트의 직접 자식에 한정되며 별도 영구 색인을 만들지 않는다.

- 재생성 인계의 폐기는 옛 트리 전체에 폐기 표시를 하고 리스너·구독을 해제하며, 각 노드의 Refresh 번호와 상호작용 초기화 번호를 통지 없이 동기로 올린다. 부모·자식·루트 참조는 끊지 않고 옛 참조의 읽기는 폐기 직전 마지막 커밋을 반환한다. 입력 출처 표식이 있는 늦은 쓰기는 조용히 버리고 표식 없는 쓰기만 `DISPOSED_NODE_WRITE`로 던진다. 검증기 등록 참조 수는 폐기가 아니라 옛 트리의 이펙트 정리에서 내린다. 폐기 비용은 옛 트리의 노드·구독 수에 비례하며 일반 잎 쓰기에 전체 순회를 더하지 않는다(WRITE-046·086, REACT-010·024, 69C-02).
- 폼 수준 reset 로드는 명령형 외부 오류와 검증 결과를 비운다. 바인딩이 소유한 `errors` 속성의 경로 키 재적용은 같은 reset 진입이 돌아오기 전에 끝나며, 트리 유지와 재생성 모두 같은 계약이다(WRITE-045, 69C-03).

- 값·방출·유효 스키마·자식 형상·활성/제어 상태가 결정되는 자리, 경로 재부여 및 상호작용 초기화에서 해당 사건 종류의 첫 기준과 변경 비트를 레코드에 적다. 커밋은 기록된 종류만 비교하며 참조가 원래대로 돌아온 변화는 배달/개정에서 제외한다. 배달 전 여러 커밋의 `previous` 연결과 커밋별 개정은 기존처럼 보존한다. 기준 칸은 커밋에서 비우므로 변경 없는 노드의 11필드 스냅숏을 만들거나 갱신하지 않는다(EVENT-007·024, SETTLE-006, VALUE-002, 65C-03).
- 감시의 영향 경로는 현장 기록과 기존 생김·소멸·`pathChanges` 사실에서 얻고, 조상 경로 중복 제거 뒤 정적 감시 색인의 affected 조회를 사용한다. 감시 대상에서 마지막 값 비교와 경로 색인 갱신은 유지한다. 이는 감시 없는 노드의 읽기를 다시 늘리지 않는다(65C-02·03).

- `interpretFieldNodeInput(template, input)`는 행의 정적 해석만 적용한 원본 트리를 돌려준다. dispatch는 배치 동사의 반환 슬롯에 이 함수를 사용하며 채움·파생·투영·생성은 하지 않는다. 바뀐 하위 값이 있을 때만 그 조상 그릇을 복사하고 순환 입력은 재방문하지 않는다. 비용은 반환 슬롯의 입력 트리 크기에 비례하며 첫 객체 템플릿에서 O(선언 자식 수)의 이름 색인을 약한 참조 캐시에 만들고 재사용한다(EVENT-061, 62C-01).

- 진입점은 `writeFieldNode<Self>(node: FieldNodeRecord<Self>, input: unknown, kind: FieldNodeWriteKind, option: WriteOption): void`, `loadFieldNodeAtMount<Self>(root: FieldNodeRecord<Self>, value: unknown, option: WriteOption): void`, `resetFieldNodeForm<Self>(root: FieldNodeRecord<Self>, value: unknown, option: WriteOption): void`, `resetFieldNodeSubtree<Self>(node: FieldNodeRecord<Self>, option: WriteOption): void`, `arrangeFieldNodeItems(node, operation)`, `readFieldNodeDefaultValue<Self>(node: FieldNodeRecord<Self>): unknown`과 정착용 맥락 변경 함수를 이름으로 내보낸다. `readFieldNodeInactiveValues`·`readFieldNodeMisfit`·`readFieldNodeMisfits`·`readFieldNodeWatchValues`도 노드 겉면에 이름으로 제공하여 각 게터가 내부 organ 없이 한 문장으로 위임하게 한다. 각 읽기 함수는 살아 있는 참조에서는 런타임 값을, 떼어진 참조에서는 마지막 커밋의 동결 값을 읽는 해당 멤버의 계약을 따른다. `FieldNode.setValue`·`resetSubtree`·바인딩 전용 `setContext`의 조율은 `write` 진입을 경유하고, 그 진입이 이곳의 동기 정착 함수를 부른다(NODE-010·044, LANDING-064·084, WRITE-085, CONTROLS-032·080, SURFACE-055, 26C-01, 28C-03·07·08).
- 배열 동사의 정착: 배치 안 동사는 정착을 호출하지 않고 표시된 원본 배열에 순수 계획을 적용하며, 배치 끝에 여러 표시를 루트 한 번 정착으로 합치되 통째 교체 범위(잠복 원본 정리, 객체 호스트의 whole 분배, 교체 나감 판정)는 표시된 경로의 합집합이고 얕은 Merge 표시는 받은 키의 자식 경로이며 덮어쓰기 가상 표시는 참조 형제 경로(`writeOrigins[].fields`, 단일 경로 `virtualReplacePaths`의 배치 대응)이다; 쓰인 배열 호스트 아래 아이템 키는 위치로 잇는다(191C-01, 26C-10, R2). 교체 범위 안의 값 결과는 합성 값의 통째 쓰기 하나와 같아 같은 쓰기들을 순차로 한 결과와 다를 수 있고(GOAL-010, 62C-01), 교체 범위 밖에서 형상에 들어오는 노드는 합성 값 대신 잠복 원본을 복원하므로 그 결과는 통째 쓰기와 다를 수 있다(R1). 커밋은 재인덱싱 경로 사실의 노드와 자손을 배달 후보에 넣어 `UpdatePath`의 `{ previous, current }`를 표시한다(NODE-010·014, SURFACE-005, 33C-01, 35C-02, 36C-01, 62C-01, 실행 ADR D1·D4).
- 진입점은 `readArrayLength(node)`를 이름으로 내보낸다. 배열 노드의 현재 길이(branch는 `itemCount`, terminal은 `raw` 배열 길이, 그 밖은 0)이며 배치 밖 무동작 push·insert와 write의 거부·실패 push·insert가 같은 값을 돌려주게 한다.

- `FieldNodeWriteKind`는 engine의 공유 형 compartment `types/value.ts`에 있으며 `'input' | 'callerPartial' | 'callerReplace' | 'load' | 'automatic'`이다. 마지막 종류는 채움·입력 마침 등 예약 층 쓰기이며, 기본 `setValue(V)`는 로드가 아닌 `callerReplace`이다(VALUE-032, WRITE-096). 표시 단계가 종류·옵션·원래 쓰인 값을 기록하고, 정적 `schemaType`·`nullable`로 먼저 한 번 해석하며 쓴 노드와 역의존 조상을 재계산 목록에 넣는다(WRITE-056·098, SETTLE-002·017).
- `setValue(V, Merge)`는 `callerPartial`이며 받은 키마다 살아 있는 자식 또는 형상 밖 자손의 종류별 잠복 원본에 부분 쓰기를 한다. 형상 밖 호스트의 잘못된 종류 `raw`는 자손 잠복 잎에 방출 가능한 값을 쓴 호출자 부분 쓰기에서만 비우고, 살아 있는 호스트의 `raw`는 자식 방출이 실제 생길 때만 비운다. 빈 객체로 승격하거나 형제의 기본값을 채우지 않는다(WRITE-013·079·090, VALUE-002·034·036, 26C-10, 26C-14).
- 통째 교체·로드에서 V에 없는 선언 자식은 없음으로 정하고(WRITE-091), 선언 밖 키는 `undeclaredValues`에 보관한다(WRITE-090).
- 선언 밖 값은 새 사본에 복사하되 `__proto__`만 own property로 정의하고 나머지 키는 일반 대입한다. 안전한 키 쓰기는 객체 합성과 공유하는 engine의 utils 보조를 사용하며, 선언 키 거름·Merge의 기존 키 보존과 새 키 순서·호출자 입력 불변·빈 값 처리를 유지한다. 객체의 `nextExtras`는 복사 중 쓰기 직후 실제 own key가 생성되었는지를 호출별 지역 값으로 기록하여, own key가 하나도 생성되지 않으면 `undefined`를 결과로 삼는다. 입력의 own data가 동결되어 있고 상속 setter가 대입을 흡수하는 경우에도 대입 시도만으로 빈 객체를 반환하지 않으며, 결과의 키를 다시 열거하지 않는다. 속도 비용은 첫 own key가 생길 때까지의 쓰기별 O(1) 확인이고 메모리 비용은 호출별 boolean 하나이며 보유 캐시는 없다. 객체의 `nextExtras`와 배열의 `arrayExtras`가 같은 값의 이전 참조를 되살리고, 쓰기 표시는 그 결과의 참조 동일성으로 변경을 판정하여 선언 밖 값의 구조 비교를 한 번만 한다. 객체의 참조 되살림은 잠복 Merge의 기존 호스트 재사용에도 유지한다(VALUE-002, SETTLE-042·043, WRITE-013).
- 배열 branch 호스트는 배열 입력을 길이만큼 자리별 아이템에 분배하고 청사진 없는 꼬리 값은 자리 순서의 `undeclaredValues`에 보관한다. `null`·수·평범한 객체 등 배열이 아닌 입력은 호스트 `raw`에 남는다. 아이템 이름은 위치 문자열이고 통째 쓰기는 정착 안에서 이름을 바꾸지 않은 채 위치 i의 기존 노드와 키를 이어 쓰며, 새 꼬리만 만들고 남는 꼬리는 소멸시킨다. 로드는 형상의 모든 아이템을 생김으로, 로드 아닌 통째 쓰기는 새 꼬리 아이템만 생김으로 판정해 없음인 자손에 채움을 적용한다(NODE-021·051·052, VALUE-002, WRITE-007·090, LANDING-164·202).
- 가상 노드에 대한 호출자 쓰기는 참조 노드로 부채질한다. `undefined`는 참조 노드마다 같은 쓰기 종류로 `undefined`를 쓰고, `fields` 수와 길이가 같은 배열은 원소를 순서대로 해당 참조 노드에 같은 종류로 쓴다(각 원소는 그 노드의 `interpret`를 거침). `null`·배열이 아닌 값·길이가 다른 배열은 호출자 오류로 정착 전에 `INVALID_VIRTUAL_NODE_VALUES` 코드의 `SchemaFormError`를 즉시 던지며 `path`와 `details`(기대 길이, 받은 값)를 담는다. `onError` 보고는 진입 배선 단계가 더한다(35C-01). 쓰기 종류는 호출자가 정한 그대로 참조 노드에 간다: `Merge`는 참조 노드마다 부분 쓰기, 옵션 없음·`Overwrite`는 참조 노드마다 통째 쓰기이며 어느 쪽도 기존 노드를 다시 채우지 않는다(WRITE-090, 45C-01). 가상 노드 자신은 표시만 받고 값은 참조 노드에 산다. 자동 쓰기의 모양 분류(`writeShape`)는 그대로이다(NODE-034, ERROR-195, 18C-21, 42C-02).
- 가상 노드의 `structure`는 `fields` 이름마다 실제 형제 노드를 가리키고, 자식 선택은 가상 노드 아래에 노드를 만들지 않는다. 참조 노드의 값이 한 커밋에서 바뀌면 어느 길로 쓰였든 그 노드를 참조하는 가상 노드를 같은 정착의 재조립 대상에 넣는다(NODE-034·054, 42C-02).
- 공개 옵션 `SetValueOption`은 `Overwrite`, `Merge`, `DisableAutomaticWrites`, `EnableAutomaticWrites`의 비트마스크이다. 기본은 `Overwrite`; 억제는 호출 옵션이 Form 속성보다 우선하고 두 억제 비트가 함께 있으면 `DisableAutomaticWrites`가 이긴다. 한 배치에 서로 다르면 억제가 이긴다. 억제는 호출이 일으킨 채움·`derived`·`injectTo`·`unsetValue`·나감 비움을 막지만 받은 값과 투영은 막지 않고, 그 호출에서 소비한 에지를 뒤로 미루지 않는다. 뒤이은 포커스 아웃 `trim`은 호출 비트가 아니라 Form 속성만 억제한다. `resetInteraction`은 자동 쓰기가 아니어서 억제된 로드에서도 판정한다(WRITE-015·097·100, SETTLE-028·048, CONTROLS-029, EVENT-012, 28C-04).
- 기존 `SetValueOption`의 `Overwrite`·`Merge` 비트 값은 레거시 소비자를 위해 유지하고 같은 enum에 억제용 새 비트 둘을 더한다. 새 정착은 기존 비트 중 자기 계약에 든 네 선택만 해석한다(WRITE-015, LANDING-159).
- 계산은 루트에서 한 번 내려가며 재계산 자식을 먼저 마친다. 각 호스트 바퀴는 `게이트 없는 조각 ∪ 상속 overlay`에서 시작하고 노드 게이트는 꺼진 채 시작한다. 직전 커밋의 활성 집합은 평가 순서의 힌트에도 쓰지 않으며 청사진 전순서대로 모든 게이트를 매번 평가하고 가우스-자이델로 즉시 반영한다. 상한은 `게이트 가진 조각 수 + 노드 게이트 수 + 1`이다. 여러 조건(`if`·판별·active)을 가진 조각도 한 번만 세고 조각의 active를 노드 게이트로 다시 세지 않는다. `controls.active`가 있는 `fields` 항목은 대상 수와 무관하게 항목당 노드 게이트 하나로 센다. 분석별·호스트별 셈은 쓰기 사이에 재사용한다(SETTLE-003·018·041·044·050, GOAL-050).
- 호스트 루프는 스키마·자식·출력이 모두 바뀌지 않은 바퀴 뒤에 멈춘다. 갱신 경로에서는 바퀴 k가 끝났을 때 다음 술어 P1–P7이 모두 성립해도 확인 바퀴 k+1을 생략한다: 다음 바퀴가 갱신된 상한 안에 있고(P1), k 동안 게이트가 추가되지 않았으며(P2), 더러운 자식이 없고(P3), 게이트 예외가 없으며(P4), 미공표 출력이 없고(P5), 이 호스트 프레임의 게이트가 k 동안 읽은 모든 경로와 값의 쌍을 끝에서 다시 읽으면 각각 `Object.is`로 동일하며(P6), 로드·호스트 분배 입력·예산 초과가 없는 갱신이다(P7). 같은 경로를 서로 다른 값으로 읽은 바퀴는 P6을 만족하지 않는다. 식의 의존 값과 `@` 맥락 참조, if·판별 게이트의 투영 raw 및 projectedExtra 참조를 기록하고 appliesWhen은 재귀적으로 기록하며, 자식 호스트의 증인은 부모와 섞지 않는다. 생략되는 바퀴는 모든 게이트가 같은 값을 내고 아무것도 바꾸지 않았을 바퀴에 한정한다(SETTLE-020). 고정 출발점과 단계 순서는 유지하고(SETTLE-018·001) 예산 초과 보고는 생략하지 않는다. unit·render·react18 시험 프로젝트는 setupDeriveShadowEvaluation.ts를 통해 내부 shadow 모드로 실행하여 예측한 생략을 모두 확인하고, 계수 계약 시험 세 파일은 record 모드를 명시하여 실행한 확인 바퀴의 계수를 유지한다.
- 게이트를 가진 호스트의 자식 목록·출력은 완료한 자식 선택을 모아 게이트의 투영 값 읽기 직전 또는 자식 선택 끝에 한 번 갱신한다. 하위 게이트가 미갱신 조상을 읽으면 자식을 바꾸기 전에 갱신해 같은 바퀴의 관측값(같은 바퀴에 들어온 사촌은 보이고 계산 중인 자식은 섞이지 않음)을 지킨다(51C-01, NODE-026, SETTLE-017·045, 18C-15).
- 정착 도중 노드 객체의 읽기는 직전 커밋을 돌려주고, 바퀴 중간 상태는 관측 계약이 아니다. 게이트와 식의 입력만 정착 자신의 읽기 길로 같은 바퀴에 들어온 자식을 본다(VALUE-013, EVENT-061, 51C-01, 57C-01).
- 조각 층(`getControlLayers`)의 "직접 선언한 조각"은 engine DETAIL의 조각 소유 판정 한 벌(`getFragmentOwnerPaths`)로 정한다. 부모 배열의 조각이 `items`·`additionalItems`·`prefixItems`로 직접 선언한 모든 아이템은 조각이 켜진 동안 `default`·`unsetOnInactive`·상태 키와 derive 규칙(derived·unsetValue·resetInteraction)을 받는다. derive 식은 호스트에서 라운드마다 한 번 평가하고 같은 값을 아이템별로 쓰며, 새 아이템과 제거된 아이템의 에지는 각각 묶고 해제한다(CONTROLS-077, FRAGMENT-050, 35C-08, 377C-01; 조각의 injectTo는 청사진 오류라 대상이 아니다).
- 계산 끝에는 이번 최종 형상에서 노드 자신·부모의 `controls.fields` 항목·직접 선언한 조각의 `controls`를 같은 층 해석으로 모은다. 표준 `readOnly`와 로컬 잠금(`readOnly`·`disabled`)은 OR, 로컬 표시(`visible`)는 AND로 결합하고 순서와 무관하게 레코드의 세 계산 필드에 쓴다. 상태 키 식이 던지면 그 선언은 없는 것으로 보며 커밋은 `degraded`·`cause: 'expression'`이다. Form 속성의 전체 잠금은 렌더 계층에서 결합하고 코어 쓰기를 막지 않는다(SETTLE-003, CONTROLS-042·045·046·073·082·083, ERROR-122·132).
- 게이트 없는 객체 호스트의 정적 자식 선택은 청사진 호스트별로 메모한다. 선언 종류·순서·유효 스키마가 같은 완성된 발생은 같은 자식 참조와 선언 ID를 재사용하고 더러운 자식의 계산은 그대로 수행한다. 처음 생성, 미완성 재귀 확장, 충돌, 가상 자식과 배열 호스트는 기존 선택 경로를 유지한다. 약한 캐시의 비용은 정적 호스트의 선언 수와 살아 있는 발생 수에 비례하며 노드의 고정 필드를 늘리지 않는다(NODE-006, SETTLE-003, 65C-01, I11 step 1).
- 청사진의 유한 선언에서 표준 `readOnly`와 `visible`·`readOnly`·`disabled` 제어(조각과 부모 `fields` 항목 포함)가 하나도 없으면 상태 키 공표를 생략한다. 이 판정만 청사진별 약한 캐시에 보관하며 노드별 기능 색인을 만들지 않는다. 키가 선언된 청사진은 기존 후보·층 해석·실패 순서로 계산하고, 선언 없는 노드는 생성자의 `visible: true`, `readOnly: false`, `disabled: false`를 유지한다(CONTROLS-045, NODE-006, 65C-01, I11 step 1).
- 게이트 입력은 투영 값과 `undeclaredValues`이며 `@`와 식·`injectTo`의 `ctx.context`는 트리 런타임의 맥락 객체를 읽는다. 투영에서 빠진 선언 자식은 원본·분배 입력을 읽지 않아 `undefined`이고, 선언 밖 경로 키만 `undeclaredValues`에서 읽는다(CONTROLS-080, 28C-03). 판별 게이트는 `./<propertyName>` 값을 `values`의 각 후보와 `===`로 비교하고 분기 `controls.active`와 AND한다. 따라서 `0`과 `−0`은 같고 수 `1`과 문자열 `'1'`은 다르며, `NaN`은 자신을 포함한 어느 후보와도 일치하지 않는다(BLUEPRINT-017, 97C-02). 값 목록은 첫 일치에서 끝나는 인덱스 `for`로 순회하며 O(V) 시간·O(1) 추가 공간이고 영구 상태를 추가하지 않는다. 노드·조각의 active는 `BlueprintExpression.evaluate`로 실제 평가한다. `if`는 `validation` 진입점의 동기 가드로 평가하고 검증기가 없으면 조각을 끈다. 가드 실패·던짐·boolean 아닌 값은 게이트 거짓과 `GUARD_FAILED` 기록이며, 식 실패는 `cause: 'expression'`이다(VALIDATE-015·044·047, ERROR-041·133, TEST-069 (나), 26C-04).
- `BlueprintGate.evaluationReads`는 청사진의 정적 읽기 자리이다. 정착은 노드 발생을 만들 때 실제 선언 호스트와 읽기 자리의 최저 공통 조상 L을 한 번 계산해 settle 소유 메모에 두며 바퀴마다 다시 계산하지 않는다. 게이트를 L의 전순서에서 선언한 조각의 바로 뒤(그 조각의 노드 게이트 뒤)에 평가하고 옮긴 게이트끼리는 문서 순서를 지킨다. 값이 바뀌면 L부터 선언 호스트까지 바퀴 안에서 재계산하며 그 비용은 호스트 바퀴 예산에 포함한다. 두 번째 하강은 없다(SETTLE-045, 26C-04·07).
- 배열 아이템의 선언 경로에 있는 `*` 마디는 실제 색인 마디와 맞추고, 평가의 기준점은 해당 노드의 실제 경로이다. 역의존 조회는 템플릿 소유자 경로를 변화한 아이템의 실제 색인으로 묶고 다른 아이템을 읽는 절대 경로는 배열 호스트 하위 트리 변화에 기대게 한다. 게이트 등록과 자리 L, 파생 규칙의 원천·대상, 상태 키 층, 나감 정책 열쇠 및 `@` 맥락 소유자도 같은 실제 경로로 묶으며 청사진 템플릿과 식 컴파일 결과는 공유한다(CONTROLS-080, SETTLE-017·045, BLUEPRINT-030, 35C-08, 실행 ADR D6).
- 활성 선언을 `mergeEffectiveSchema`로 합쳐 `EffectiveSchema { schema, typeConflict }`를 소비한다. `selectNodeSchema`·`selectChildren`·`primeHost`의 런타임 병합은 청사진 결과가 보유한 `isAtomic`·`isTerminal`과 같은 함수 identity를 전달한다. 게이트로 켜진 선언의 `options`·`presentation`도 같은 원자 판정을 받고, 판정을 주지 않은 core 호스트에는 렌더 계층의 암묵 판정이 없다(REACT-003, 69C-04). `typeConflict`가 참인 경우와, 정적 선언 없는 이름에서 fold가 다른 게이트 선언이 동시에 켜진 경우 모두 `SHARED_NODE_CONFLICT`이며 `cause: 'sharedConflict'`이다. 같은 이름의 간선은 청사진이 fold마다 하나의 노드로 묶으므로 첫 활성 간선의 청사진 노드 identity와 비교한다. 살아 있는 자식은 앞선 정착에서 이어받았을 수 있으므로 그 자식의 종류나 identity를 충돌 기준으로 쓰지 않는다. 같은 간선 안에서는 타입 나열 순서·null 포함 여부로 공유 충돌을 추가 판정하지 않고, 유효 타입의 빈 교집합만 `typeConflict`로 소비한다. 충돌 중에도 형·nullable은 정적 선언의 값이고, 첫 전순서 종류만 형상에 둔다. 오류 메시지는 `Active declarations conflict at <path>`이며 실패를 기록하고 커밋 뒤 던진다(BLUEPRINT-041·043·044, FRAGMENT-049, 26C-05, 389C-01).
- 게이트가 있는 폼의 일반 선택 경로에서 자식 간선의 모든 선언이 이번 평가에서 켜지면(완전 수용 간선) 선택은 정적 선언 ID(`staticIds`)와 간선의 선언 배열을 그대로 쓰고, 유효 스키마와 충돌 판정(`typeConflict`)은 청사진 자식 간선을 열쇠로 한 약한 메모(`readAdmittedEdgeSchema`)에서 읽는다. 그 결과는 간선의 정적 자료와 원자 판정의 순수 함수이므로 같은 간선에서 다시 합치지 않는다(GOAL-011). 게이트는 지금처럼 매 라운드 모두 평가한다(SETTLE-020, BLUEPRINT-007). 선언 하나라도 꺼진 간선, 자식의 청사진 노드가 간선의 노드와 다른 경우(같은 이름·종류의 다른 간선에서 이어받은 자식)는 지금처럼 합친다. 원자 판정 identity가 메모와 다르면 다시 합쳐 메모를 바꾼다. 유니온 호스트의 직접 선택 계획(`getDirectChildSelectionPlan`)은 단계마다 고정 ID를 이미 가지며 지금처럼 합친다. 결과 스키마는 `mergeEffectiveSchema`의 메모 결과와 같은 참조이다(372C-02, 389C-01).
- 같은 이름의 다른 종류 선언은 같은 종류의 자식만 지우고 이어받는다. 부모 원본의 한 경로에 어느 종류든 살아 있으면 그 값은 살아 있는 노드의 원본이므로 비활성 다른 종류 선언의 잠복 원본을 새로 만들지 않는다. 다른 경로의 입력 쓰기나 게이트 전환처럼 그 경로를 덮지 않는 쓰기에서는 떠난 종류의 `(path, kind)` 잠복 원본을 보관하고 재진입 때 복원한다. 여러 쓰기 배치의 루트 입력은 마지막 커밋 값 위에 합성되므로 쓰이지 않은 키도 들어 있는데, 호스트의 분배 입력은 교체 범위(`replacePaths`) 안이거나 그 조상인 자식 경로에서만 쓰기로 세어 진입·자식 선택·비활성 분배가 쓰이지 않은 경로의 잠복 원본을 단일 쓰기처럼 복원한다(R1). 통째 교체·로드는 루트든 하위 노드든 쓰기 범위 안의 모든 종류별 잠복 원본을 종류와 무관하게 지우며 V에 든 경로의 값만 그 경로의 새 원본이다. 범위 밖의 잠복 원본은 그대로 남긴다. V에 없는 경로는 잠복 원본까지 없고, 이후 다른 종류가 입력 게이트 전환으로 생길 때 이전 값은 돌아오지 않는다. 형상 밖 경로를 덮는 쓰기는 청사진 전순서의 첫 종류에 값을 분배하고 같은 경로의 다른 종류 잠복 원본을 지운다. 경로를 덮지 않는 부분 쓰기는 다른 종류 잠복 원본을 보관한다. 쓰기가 둘 이상인 batch는 쓰기 범위를 표시된 경로의 합집합으로 계산하며 자동 쓰기 표시는 범위에 들지 않는다(26C-13, 26C-14, WRITE-085·094, NODE-043, WRITE-087, VALUE-006, 18C-64, 191C-01).
- 전이는 직전 커밋에 없던 최종 형상 노드의 없음인 값에 노드 자신의 `controls.default` > 부모 `controls.fields` 항목의 `default` > 직접 선언한 조각의 `controls.default` > 유효 스키마의 표준 `default` 순으로 채운다. 같은 층은 전순서의 나중 선언이 이기고, 생긴 노드의 `unsetValue`가 참이면 채우지 않는다(CONTROLS-073·077, FRAGMENT-050, SETTLE-004·005).
- 객체 호스트의 없음 판정은 자신의 `raw`·`undeclaredValues`, 살아 있는 자손과 모든 종류의 잠복 자손을 함께 본다(WRITE-082, VALUE-037, 26C-14). 로드와 쓰기 모두에서 종류가 맞지 않는 원본(객체는 비객체, 배열은 비배열)을 든 객체·배열 조상 아래의 자식은 새로 생겨도 채우지 않으며, 자식 입력으로 조상이 승격된 뒤 새로 생긴 노드만 채움을 받는다(WRITE-079·096, VALUE-036). 이미 있던 노드는 새 조각만으로 채우지 않는다(SETTLE-005, FRAGMENT-050).
- 나감 정책 `unsetOnInactive`는 노드 자신 > 부모 `controls.fields` 항목 > 직접 선언한 조각의 `controls` > Form 속성 순으로 정하고 같은 층에 유지가 하나라도 있으면 유지한다. 걸리는 선언과 식 값은 노드가 형상에 있던 직전 커밋에서 읽으며 형상 밖에서 새로 평가하지 않는다. 던진 식의 선언은 유지로 세고 그 식을 평가한 정착은 `degraded`·`cause: 'expression'`이며 사슬 끝에 `EXPRESSION_THREW`를 던진다(WRITE-031·032·038, CONTROLS-024·040, ERROR-122·125·126·132, 28C-05).
- 게이트로 직전 커밋 형상에 있던 노드가 최종 형상에 없을 때만 나가며, 중간 이탈 뒤 재진입하면 같은 노드를 유지한다. 나가는 객체·분기의 정책은 함께 나가는 하위 트리와 잠복 자손으로 내려가고 자손의 명시 선언이 가까운 순서로 이긴다. 노드가 남아도 선언한 조각이 꺼지는 선언의 나감을 사슬에 세며 이때 `undeclaredValues`는 건드리지 않는다. 최종 나감의 비움은 정책대로 `raw`와 `undeclaredValues`를 함께 지우되 억제·원본 B 정착에서는 적용하지 않는다(SETTLE-005·011, WRITE-015·032–036, LANDING-092, 35C-08·09).
- 짧아진 통째 쓰기·`remove`·`pop`·`clear`·로드로 없어진 아이템과 자손은 나감이 아닌 소멸 집합으로 보낸다. 커밋에서는 NODE-044대로 떼어 마지막 커밋 읽기를 얼리고 `active`·`enabled`를 거짓으로 하되 나감 정책·비움·잠복 포착·억제 비트·원본 B 나감 기록은 적용하지 않으며 그 경로의 저장소 항목은 버린다. 게이트로 꺼진 아이템은 나감 정책과 잠복 원본을 적용하고 색인 자리를 남겨 종류별 빈자리로 방출한다(NODE-044, WRITE-036, VALUE-034, 35C-08·09, 실행 ADR D5).
- 최종 형상에서 사라진 중간 채움은 자손의 자동 쓰기와 잠복 원본 변경까지 회수한다. 채움이나 좁혀진 유효 목록으로 원래 입력을 재해석한 쓰기가 게이트를 바꿀 때만 다음 전이 라운드를 세고, 각 노드는 한 정착에서 채움을 최대 한 번 받으며 같은 게이트의 재반전은 새 라운드를 만들지 않는다. 호스트 바퀴 초과는 전이 중에도 즉시 독립된 예산 초과로 처리하며 전이 상한은 `게이트 가진 조각 수 + 노드 게이트 수 + 1`이다(SETTLE-003·005·011·017·022·029·041, WRITE-098·099, 26C-11).
- 상한 초과 시 Source-B 되돌림 기록은 채움·`derived`·`injectTo`·`unsetValue`의 지움·나감 비움의 이전 `raw`·`undeclaredValues`·분배 값을 보관한다. 파생 쓰기를 먼저 되돌리고 중간 채움을 철회하며 채움 노드를 `writtenInputs`에서도 제거하여 원본 B에는 쓰기 경계의 정적 해석만 남긴다. 그 원본으로 형상을 한 번 더 계산하며 또 초과하면 마지막 활성 집합을 고정한다. 객체 자식의 생김·빠짐은 형상 재계산으로 판정한다. 자동 쓰기가 배열 아이템을 만들거나 없애면 구조 로그에 호스트, 직전 순서의 아이템 노드 목록, 직전 `itemCount`와 `undeclaredValues`를 적고 자동 쓰기 로그와 함께 뒤에서부터 되돌린다. 되돌린 아이템은 커밋 형상에 든 적이 없어 생김이나 채움 대상이 아니며 `nextItemKey`는 되감지 않는다. 터미널 배열은 구조 로그 없이 이전 호스트 `raw`만 기록한다(SETTLE-011, WRITE-036·099, TEST-069, 35C-05·12).
- 구조 계획 적용은 옛 자리와 새 자리의 템플릿이 같은 선언(`items` 또는 같은 `prefixItems[i]`)일 때만 새 자리의 옛 노드를 재사용하고, 템플릿이 다르면 새 자리 템플릿의 새 노드(새 키)를 만들며 옛 노드는 소멸시킨다. 새 종류의 잠복 원본이 있으면 생김 입력보다 먼저 복원하고, 없으면 옛 자리의 합성 값을 생김 입력으로 넘긴다(41C-01, NODE-043·051; 394C-01). 그 밖에는 청사진이 있는 새 자리에 새 키의 노드를 만들고, 청사진 없는 자리는 `undeclaredValues`에 두며 빠진 노드는 소멸시킨다. 자리 이동으로 청사진 유무가 바뀌면 값도 노드와 `undeclaredValues` 사이를 옮기고, 옮긴 아이템과 자손의 이름·이스케이프 이름·경로를 정착 전에 고친다. 잠복 `raw`와 메타데이터, `committedDeclarationIds`, 규칙 기준값과 두 색인, `misfitPaths`를 새 경로로 옮기고 `misfitsMemo`·`inactiveValuesMemo`·`inactiveValueEntries`의 경로 접두 메모를 무효화한다. 게이트 색인은 경로에서 계산한 자리 L과 `watchPaths`를 함께 고치도록 이름 변경 전에 하위 트리를 제거하고 변경 후 다시 등록한다. 바뀐 노드와 자손의 `(previous, current)` 경로 사실을 작업 칸에 모으며 정착 중에는 경로가 고정된다(NODE-004·051·052, EVENT-068, 35C-02, 실행 ADR D4).
- 아이템을 만들거나 없애는 쓰기는 호스트 경로의 로드 스냅숏 배열 자리를 청사진 없는 꼬리까지 센 `itemCount` 길이로 맞춘다. 구조 연산의 새 자리에는 생성 값 `v`를, 비구조 쓰기의 새 자리에는 `undefined`를 넣고 없어진 자리는 자르며, 호스트 경로에 배열이 없으면 `undefined` 자리의 배열을 만든다. 값을 다시 싣지 않는 자리 작업은 O(배열 길이)이고 아이템 변화가 없는 `update`는 키·스냅숏 자리를 유지한다(WRITE-085·095·099, NODE-052, 35C-03·06, 실행 ADR D4).
- `diagnostics`는 `{ status: 'stable' | 'degraded', cause?: 'budget' | 'expression' | 'injectTarget' | 'writeShape' | 'sharedConflict', exceededBudget?: 'hostWheel' | 'derive' | 'transition' | 'recursion', iterations?: number, commit?: number }`이다. 파생 상한 25를 넘기면 `degraded`와 첫 실패의 `cause`(선행 실패가 없으면 `'budget'`)·`exceededBudget: 'derive'`·`iterations: 25`로 원본 B를 커밋한다. 모든 칸은 `commit`의 커밋을 설명하며 최초 손상 커밋을 유지하고 폼 수준 로드에서만 `stable`로 초기화한다(ERROR-070·130–133·190·195·204, SETTLE-011·013·017, 26C-02).
- 재귀 발생에서 같은 청사진 템플릿이 자신의 `raw`·`undeclaredValues`·분배 입력·잠복 자손·살아 있는 자손 어디에도 원본이 없는 조상과 다시 만나 계속 확장하려 하면 더 만들지 않고 `recursion`으로 기록한다. 명시 원본의 유한 깊이는 이 판정으로 잘리지 않는다(TEST-067 (c′), ERROR-190).
- 정착 오류는 `src/errors/`의 `SchemaFormError`와 `FormErrorCode`를 쓴다. `BUDGET_EXCEEDED`·`RECURSIVE_SHAPE_DIVERGED`·`EXPRESSION_THREW`·`GUARD_FAILED`·`SHARED_NODE_CONFLICT`·`INJECT_TARGET_MISSING`·`INVALID_VIRTUAL_NODE_VALUES`의 분류를 이곳에서 적용하지만 목록을 다시 소유하지 않는다. 동적 `injectTo` 대상이 없으면 후보에서 빼고 `cause: 'injectTarget'`, 가상 노드 자동 쓰기 모양이 틀리면 `cause: 'writeShape'`로 커밋한 뒤 사슬 끝에 던진다. 버린 트리의 노드 쓰기에만 남는 `DISPOSED_NODE_WRITE`도 같은 오류 클래스와 표의 코드를 쓰며 단순히 형상을 떠난 참조의 쓰기는 오류가 아니다(NODE-044, CONTROLS-079, ERROR-070·122·132·164·195·198).
- 기존 경고 이름공간 `FormWarningCode.Misfit`·`FormWarningCode.NonJsonWholeValue`(`errors`)를 쓴다. 기존 경고와 같은 접두를 재사용하고 개발 모드의 통째 값 검사만 후자 코드를 낸다(VALUE-037, ERROR-070·133).
- 커밋은 `record.markFieldNodeEvent`로 값·경로·자식 형상·유효 스키마 `UpdateJsonSchema`·계산 상태·상호작용 상태·Refresh 대상·루트 진단을 배달 표에 합치고, 집합 전체의 해당 `revisionLedger` 비트를 한 번에 올린다. `write`는 그 표를 재계산하지 않고 배달한다. 커밋 번호와 Refresh 대상·잠복 원본 열거 메모·정합 경고등도 확정한다(EVENT-004·006·007·043·064·066·071, SETTLE-007). 루트의 잠복 원본은 `(절대 path, kind)`로, `misfitPaths`는 현재 형상의 경로로 보관한다. `inactiveValues`는 경로마다 형상 밖 잎·터미널 및 잘못된 종류의 `raw`를 든 호스트 중 전순서상 첫 원본을 골라 얼린 `{ path, value }` 항목을 청사진 문서 전순서로 열거한다. 커밋은 잠복 집합·원본이 바뀐 경로의 조상 배열만 다시 만들고 변경 없는 배열·항목 참조는 재사용하며 빈 배열 하나를 공유한다. `misfit`은 현재 유효 목록과 원본의 함수이고, `misfits`는 불일치 집합이 바뀐 정착에서만 다시 만드는 하위 경로 목록 메모이다. 집합이 그대로이면 `inactiveValues`처럼 목록 배열 참조를 유지하고, 내용은 계속 상태의 함수이다. 읽는 쪽은 `.paths`만 쓰고 행의 커밋 번호를 읽지 않는다(`readFieldNodeMisfits`, `captureDetachedFieldNodeReads`)(VALUE-029·030·037, WRITE-087, SURFACE-061, 372C-02).
- 커밋은 `record.markFieldNodeEvent`로 값·경로·자식 형상·유효 스키마 `UpdateJsonSchema`·계산 상태·상호작용 상태·Refresh 대상·루트 진단을 배달 표에 합치고, 집합 전체의 해당 `revisionLedger` 비트를 한 번에 올린다. `write`는 그 표를 재계산하지 않고 배달한다. 최종 형상에 든 노드의 참인 `interactionState` 키는 더하고 떠난 노드의 키는 빼며, 살아 있는 노드의 정착 중 상태 변경도 이전 커밋 값과 비교해 셈에 반영한다. 순변화에서 0↔1 경계가 생겼을 때만 루트의 `UpdateGlobalState`를 정착 밖 사건 대기열에 합친다(EVENT-062, 43C-01). 커밋 번호와 Refresh 대상·잠복 원본 열거 메모·정합 경고등도 확정한다(EVENT-004·006·007·043·064·066·071, SETTLE-007). 루트의 잠복 원본은 `(절대 path, kind)`로, `misfitPaths`는 현재 형상의 경로로 보관한다. `inactiveValues`는 경로마다 형상 밖 잎·터미널 및 잘못된 종류의 `raw`를 든 호스트 중 전순서상 첫 원본을 골라 얼린 `{ path, value }` 항목을 청사진 문서 전순서로 열거한다. 커밋은 잠복 집합·원본이 바뀐 경로의 조상 배열만 다시 만들고 변경 없는 배열·항목 참조는 재사용하며 빈 배열 하나를 공유한다. `misfit`은 현재 유효 목록과 원본의 함수이고, `misfits`는 불일치 집합이 바뀐 정착에서만 다시 만드는 하위 경로 목록 메모이다. 집합이 그대로이면 `inactiveValues`처럼 목록 배열 참조를 유지하고, 내용은 계속 상태의 함수이다. 읽는 쪽은 `.paths`만 쓰고 행의 커밋 번호를 읽지 않는다(`readFieldNodeMisfits`, `captureDetachedFieldNodeReads`)(VALUE-029·030·037, WRITE-087, SURFACE-061, 372C-02).
- 배달 표시는 자동 쓰기 노드를 커밋당 한 번 색인하고, 유효 `controls.watch`는 해석된 경로→살아 있는 감시 노드의 역색인으로 관리한다. 변경된 방출 경로와 상태 변경 경로가 감시 경로의 조상 또는 자손이면 감시 값을 다시 읽고, `@` 감시는 마지막 배달에서 본 맥락 참조와 현재 참조가 다른 커밋에서만 후보에 넣는다. 형상 진입은 현재 경로, 배열 소멸과 조건 의존의 형상 이탈은 직전 커밋 경로(`deliveryPreviousPath ?? path`), 이동은 옛·새 경로로 조회한다. 나간 경로의 조회는 조상 감시와 그 경로 및 아래의 감시만 후보로 넣고, 나간 하위 트리 안의 감시 노드는 떠남 정리가 역색인에서 뺀다. 자손이 조상 변화를 설명하여 조상 경로를 생략해도 자손 경로 조회가 조상 감시를 포함한다. 역색인 메모리는 O(감시 에지), 일반·배열 구조·형상 이탈 커밋 조회는 O(영향 경로 수 × 깊이 + 일치 감시 노드 수)이다(EVENT-064, CONTROLS-019, 28C-07, SETTLE-017·047, 44C-01, 372C-02).
- 들어오는 자식의 입력은 이번 정착에서 호스트가 분배한 해당 키 값, 자기 `(경로, 종류)` 잠복 원본, 없음 순으로 정한다. 부분 쓰기가 잠복 원본 위에 겹치면 먼저 그 노드 상태를 복원한다. 호스트가 이전에 받은 객체의 키 값은 들어오는 자식의 입력이 아니다(VALUE-002·004·025, SETTLE-005, 26C-13).
- 형상 밖 객체 값은 선언의 전순서 첫 종류를 따라 노드별 잠복 원본으로 분배하고, 같은 경로의 다른 종류 잠복 원본은 지운다. 호스트 잠복 원본은 자신의 비객체 `raw`와 선언 밖 `undeclaredValues`만 함께 보관하며 빈 호스트는 항목이 없다(26C-13, 26C-14, SETTLE-029, VALUE-002). 열거는 종류가 아닌 경로마다 한 항목이다. 같은 경로에 서로 다른 종류의 잠복 키가 있으면 전순서상 가장 앞선 종류의 값만 열거한다. 살아 있는 경로는 그 경로의 잠복 항목만 숨기고 형상 밖 자손은 계속 열거한다. 경로가 형상을 떠나면 다시 열거한다. 처음부터 비활성인 branch의 로드 값도 펼쳐 열거하고 재진입 때 복원한다. 변경 없는 항목·배열은 참조를 재사용하며, 잠복 값과 형상 가시성이 그대로인 정착은 열거를 건너뛴다(26C-13, NODE-043, WRITE-087, VALUE-029, VALUE-006, 18C-64, SETTLE-029·047). 떠나는 배열 호스트에서 노드가 아직 없는 템플릿 슬롯(같은 정착의 쓰기가 늘린 자리)은 그 슬롯 경로가 교체 범위 안이고 호스트의 분배가 자동 쓰기가 아니면 이번 정착의 분배 입력을 `interpret`해 담고, 아니면 보관된 잠복 원본을 읽는다(211C-01, LANDING-018, EVENT-013). 떠나는 객체 호스트에서 노드가 아직 없는 선언 자식(같은 정착의 쓰기가 처음 넣은 키)도 같은 판정으로 이번 정착의 분배 입력을 선언 종류별 잠복 분배(형상 밖 쓰기와 같은 규칙)로 적다(211C-01 A′).
- 최종 형상에서 나가거나 소멸한 노드와 그 당시 형상에 있던 모든 자손은 함께 떼어진다. 정착 중 임시 나감은 분리를 보류하며 재진입하면 이미 만든 동일 노드를 붙이다. 최종 형상 확정 뒤 `misfit`·`misfits`·`inactiveValues`·`defaultValue`와 로컬 `visible`·`readOnly`·`disabled`를 마지막 커밋 값으로 보존하고 `active`를 거짓으로 바꾸며 게이트 등록을 해제한다. `diagnostics`는 살아 있는 트리에서 계속 읽는다. 떼어진 참조의 쓰기는 정착·통지 없이 자신과 하위 선언의 노드별 잠복 원본을 고친다. 자기 종류를 쓰고 같은 경로의 다른 종류 잠복 원본을 지운다(26C-10·14, NODE-044, 28C-02, 35C-09). 단, 같은 `(path, kind)`가 현재 형상에 살아 있으면 옛 참조의 `setValue`·`Merge`·`resetSubtree`는 오류 없이 아무 효과도 내지 않고 잠복 원본도 만들지 않는다. 그 경로가 다시 형상에서 나가면 옛 참조들은 같은 잠복 원본을 다시 쓸 수 있다. 살아 있는 경로 확인은 기존 경로 색인을 우선 사용하며 일반 살아 있는 쓰기에 할당을 더하지 않는다. 전체 교체는 그 경로의 기존 잠복 자손을 지운 뒤 새 값을 노드별로 분배하고, `Merge`는 받은 키마다 자손 잠복 원본에 부분 쓰기를 하며 비객체 값은 해당 위치를 통째로 교체한다(WRITE-079·087, NODE-043·044, SETTLE-010, ERROR-131, SURFACE-007, 26C-08·10·12·14).
- 소멸 때 보류 중인 나감의 정리는 경로 접두가 아니라 노드 동일성으로 판정한다. 보류 나감의 노드가 소멸한 노드 자신이거나 부모 사슬로 그 아래에 있을 때만 나감에서 빼고, 소멸한 아이템의 옛 경로로 옮겨 온 다른 아이템의 나감은 나감으로 처리한다. 최종 형상을 떠난 노드는 자손과 함께 떼어지므로, 이미 아이템의 `children`을 떠난 보류 나감도 소멸 자손처럼 떼어지고 `active`가 거짓이 되며 게이트 등록이 해제되고 배달을 받지 않는다(NODE-044).
- 둘 이상의 종류(후보)가 있는 배열 경로의 새 형상 밖 쓰기를 제외하면, 비활성 배열 호스트의 잠복 원본은 아이템별 항목이 아니라 배열 전체를 호스트 자신의 얼린 `raw` 하나로 보관하며 `inactiveValues`에는 호스트 경로 항목 하나만 낸다(SETTLE-029, VALUE-002·029, NODE-044, WRITE-007, 26C-13, 35C-10, 38C-02, 47C-01; 395C-01). 그 배열은 나가기 직전의 원본 트리이다: 잎·터미널 아이템은 자기 `raw`, 배열 아이템은 자리 수 N 그대로의 배열(각 자리는 그 자리의 원본 트리, 원본이 없는 자리만 `undefined`, N = 0이면 `[]`)이고 배열 전체를 `undefined`로 접지 않는다. 객체 아이템은 원본 트리가 `undefined`가 아닌 키만 모은 객체와 `undeclaredValues`이며 그런 키가 없으면 `undefined`이다(`{}`가 아님). 청사진 없는 자리는 그 `undeclaredValues` 값이다. 방출용 빈자리 채움(`{}`·`[]`·`null`)은 데이터가 아니라 얼리지 않는다. 호스트 경로 아래에 이미 있던 `(path, kind)` 잠복 항목은 각 자리의 원본 트리에 접어 넣고 따로 두지 않는다. 다시 활성화되면 그 원본 트리를 생김 입력으로 새 키의 아이템을 만들고 원본이 `undefined`인 곳에만 쓰기 종류에 맞는 채움을 적용한다(SETTLE-029, VALUE-002·029, NODE-044, WRITE-007, 26C-13, 35C-10, 38C-02, 47C-01).
- 살아 있는 아이템이 없는 자리의 `update(i, v)`가 호스트를 다시 쓸 때도 같은 원본 트리 읽기를 쓰므로 다른 아이템의 자리 수·키·스냅숏 자리가 그대로 남는다(35C-06, WRITE-007, NODE-051, 47C-01).
- 잘못된 종류의 `raw`를 든 호스트(객체 호스트의 비객체, 배열 호스트의 비배열)는 그 `raw`를 받은 그대로 방출한다. 배열 호스트는 그때 아이템이 없다(기존 아이템은 소멸). 루트도 같아서 잘못된 종류의 `raw`를 든 루트는 그 `raw`를 방출하고, 방출이 없을 때만 루트 종류의 빈 그릇(`{}`·`[]`)을 낸다(VALUE-033·034, WRITE-013, 38C-01, 39C-01).
- `MISFIT` 기록은 `{ level: 'warning', code, path, expected: { schemaType, nullable, effective }, received, reason, candidates?, source }`이며 꺼짐→켜짐·재생김·로드·게이트 좁힘에서 한 번 보낸다. 켜진 채 다른 어긋난 값이 와도 반복하지 않는다. 채움으로 들어온 원본의 `source`는 로드 도중에도 `'fill'`이고 직접 로드된 원본은 `'load'`이다. 게이트만 경고등을 켜면 `'gate'`, 직접 쓴 원본은 입력 종류를 유지한다. 로드 범위의 노드는 원본이 같아도 Refresh를 받는다. 그 범위 밖을 포함한 비로드 쓰기는 원본이 실제 바뀐 노드 중 입력 출처로 쓴 자신만 제외하여 Refresh 대상을 모으고, `setValue(getValue())`의 대상은 비어 있다(VALUE-037, EVENT-039·071, SETTLE-049, 26C-03, 72C-01).
- 로드는 마운트·폼 reset·`resetSubtree`뿐이다. 루트 `loadSnapshot`은 로드한 경로 P를 `setIn(snapshot, P, V)`로 갱신하고 `defaultValue`는 `getIn(snapshot, node.path)`이다. `resetSubtree`에서 P의 값이 `sameValue`로 같으면 스냅숏 참조를 유지한다. 폼 수준 로드는 에지·생김 기준과 진단을 비우며, `resetSubtree`는 하위 트리만 새 수명으로 보아 채움·비움 범위를 제한한다. 일반 쓰기는 `setValue(V)`도 직전 커밋을 기준으로 삼는다(WRITE-085·090, SETTLE-048·049, ERROR-204).
- 맥락 변경은 로드가 아니며 `surface/`의 바인딩 전용 `setContext`가 settle 진입 함수를 부른다. 맥락 객체가 `sameValue`로 같으면 참조와 커밋을 그대로 두고, 다르면 런타임 칸을 바꾼 뒤 `@` 소유자와 조상만 재계산 목록에 넣어 한 정착을 돈다. `@`를 읽는 게이트·상태 키는 다시 판정하고 `derived`·`unsetValue`·`resetInteraction`에는 직전 커밋 기준의 에지를 내며 원천 방출 값이 그대로인 `injectTo`에는 내지 않는다. 통로는 옵션을 받지 않아 Form 속성 `disableAutomaticWrites`가 자동 쓰기의 기본값이다(CONTROLS-080, SURFACE-055, WRITE-015, SETTLE-043·048, NODE-010, 28C-03·08).
- 로드의 상호작용 상태는 쓰기 전에 비우되 경고등 경로 비움과 스냅숏 교체는 계산 뒤·커밋 직전에 한다. 떼어지는 노드는 직전 커밋 값을 갈무리한다(26C-10). 로드 커밋에서 해당 범위의 경고등을 다시 계산하며 `resetSubtree`는 형제의 상태·경고등·진단을 바꾸지 않는다(WRITE-085, VALUE-030, EVENT-072).
- 로드 범위 밖에서 나간 노드는 로드가 아닌 정착과 같은 나감 규칙(정책·억제·원본 B)으로 자기 잠복 원본을 갈무리한다. `resetSubtree()`의 로드 규칙은 그 하위 트리에만 적용되므로 범위 밖 원본은 형상을 떠나도 남는다(EVENT-072, NODE-044, VALUE-006).
- 잎 입력은 재계산 목록·자동 쓰기 로그만 순회한다. 로드와 전체 교체 쓰기만 쓰기가 닿은 하위 트리를 한 번 순회할 수 있다. 나감·채움에 꼭 필요한 하위 선언 순회는 해당 범위로 제한한다. 게이트 없는 평면 객체의 초기 로드에서 선언·입력·활성 자식의 총 처리량은 자식 수에 비례하며 자식마다 전체 선언이나 이미 모은 키를 다시 검색하지 않는다(SETTLE-017·047, GOAL-050).
- 한 트리의 `SettlementScratch<Self>`는 런타임의 선택적 슬롯에서 지연 생성하고, 비점유 때만 다음 쓰기에 재사용한다. 작업 컨테이너는 분배 입력과 잘못된 종류의 호스트 후보를 별도로 보관한다. 중첩 쓰기는 별도 컨테이너를 쓰며, 성공·throw 모두 `finally`에서 노드 참조와 작업 항목을 비운 뒤 점유를 해제한다. 객체 호스트 입력 쓰기는 전체 교체처럼 살아 있는 자식과 형상 밖 선언에 분배한다. 일반 입력 쓰기마다 새 작업 컨테이너를 만들지 않는다(SETTLE-047, NODE-045).
- 정착 문맥은 호출마다 독립적으로 만들되 게이트 없는 청사진에는 전이 상한을 준비하지 않고, 정적 첫 로드 자격이 가상 노드 부재를 증명하면 참조 색인을 준비하지 않는다. 나머지 청사진은 기존 준비를 유지하며 일을 첫 갱신이나 다른 단계로 옮기지 않는다. 비어 있는 scratch Set·Map은 정리 호출을 생략하고 DirtyPathSet은 비어 있어도 모드와 부모 색인을 함께 초기화한다. 부모 색인의 중복 정리는 하지 않는다. 속도 비용은 고정 개수의 O(1) 기능·size 검사이고 빈 helper 호출과 clear를 제거하며, 새 상주 메모리·색인·객체 필드 없이 기존 컨테이너와 호출별 문맥을 유지한다(SETTLE-017·047, NODE-045, 96C-01).
- 모든 정착 오류는 종류와 무관하게 발생 순서의 실패 목록에 보존한다. 게이트·공유 충돌·예산·주입 대상·쓰기 모양·파생·상태 키·상호작용 초기화·나감 정책의 오류가 모두 포함된다. 같은 게이트와 호스트, 같은 충돌 위치나 규칙 발생의 재계산은 한 정착에서 한 실패로 세며 다음 쓰기에서는 다시 수집한다. 각 실패를 열린 디스패치 사슬의 오류와 기록 발생에 한 번씩 넘기고 커밋 뒤 다시 던지지 않는다. 사슬 밖 직접 호출은 하나를 그대로, 여럿을 `MULTIPLE_ERRORS`의 `details.errors`로 발생 순서대로 묶어 던진다. 진단 `cause`는 첫 실패의 원인이며 예산 초과가 뒤따라도 바꾸지 않는다. 예산 초과 여부는 별도로 유지하여 계산 뒤 진행을 막고 원본 B를 복원하되 앞의 실패들을 버리지 않는다. 개발 모드 `mountingGuardPass`는 게이트 실패 없이 가드의 `sink` 기록만 남기며, 가드 기록은 폼당 가드 하나에 한 번이라는 기존 규칙을 유지한다(TEST-069, ERROR-004·005·034·041·070, 58C-01).
- 파생 판정은 개발 모드(`process.env.NODE_ENV !== 'production'`)에서만 규칙별 기록 항목을 만들고 실행기는 진입 API·옵션 비트·라운드별 결과·예산 초과의 마지막 라운드를 모은다. 커밋은 그 정착의 기록 하나로 런타임 칸을 바꾸며 프로덕션에는 항목도 칸도 만들지 않고 콘솔·`onError`로 보내지 않는다(ERROR-030·159, NODE-045, 28C-01).

- 전이 중 잠복 원본의 변경은 건드린 키의 직전 존재 여부와 값만 기록하고 메타데이터는 유지한다. 잠복 맵이 바뀌면 자손 접두 메모를 무효화한다. 원본 B를 만들 때 노드 자동 쓰기 로그 뒤에 이 기록을 되돌리고, 최종 형상에서 사라진 중간 채움을 회수한 뒤 형상을 다시 계산한다. 종료한 선언의 잠복 자손은 해당 청사진 하위 경로만 방문한다(SETTLE-005·011·047, WRITE-034).

## Acceptance Criteria

### settle-presence-readers — 있음 변경을 읽는 게이트와 상태 키

- oneOf·속성 게이트를 기본값 있음·없음과 양방향으로 전환하며 비루트 호스트, 배열 아이템, visible, 같은 호스트의 옮긴 읽기와 늦은 사촌을 검증한다. 늦은 사촌은 마운트와 갱신 뒤 모두 p.child가 P여야 한다. record·skip·shadow에서 emit, 있음, active, visible, readOnly, disabled, diagnostics.status와 살아 있는 노드의 committedDeclarationIds가 최종 값·맥락의 새 마운트와 같아야 한다.
- prior 자식이 나갔다 되살아나는 틈과 이번 바퀴에 들어온 자식이 뒤 라운드에 나가는 틈, 진행 중 호스트를 읽는 상태 키, setContext로 생기는 양방향 있음 변화를 검증한다. 렌더 장면은 공유 순수 데이터와 playScenario로 최종 DOM을 확인한다.
- oneOf·default 호스트의 재진입은 노드별 계산 횟수가 바퀴 상한 이하여야 한다. 있음 변화 없는 쓰기는 기준선과 같은 계산 수, 재진입 0회, 등록과 registerPresenceChanges 호출 0회여야 한다. 반복의 세 종료 경로와 빈 배치 종료를 유지하고, 배열 재사용의 raw 쓰기 등록 및 다음 라운드의 새 자식 표시를 보존한다.
- 등록 직후 모든 등록 발생을 훑어, 감시 경로가 누적 있음 집합과 어느 방향으로든 교차하는 발생이 (가) 바뀐 호스트나 그 조상에 평가 자리를 두는지 단언한다(SETTLE-045 재배치 불변식). (나) 그 평가 자리가 엄격 조상이면 형상 dirty인지 단언한다.

### settle-control-layers-ownership — 조각 소유권과 층 순서 보존

- 현재 구현의 참조 사본과 모든 장면·노드·선택 조합에서 층, 선언 ID, 스키마 경로, controls·host 참조와 순서가 같은지 확인한다. `properties` 이름, 중첩 조각, 형제 접두, items·additionalItems·prefixItems, 선택하지 않은 자식 선언과 게이트 꺼짐·켜짐을 포함한다.

### settle-control-layers-scaling — 호출별 소유 경로 수집의 작업량

- P-08 장면의 조각 수 16·32·64·128에서 한 호출의 배열 포함 검사와 문자열 경로 연산을 세어 인접 배율이 2.2 이하이고 조각 층 수가 조각 수와 같은지 확인한다. 나감의 두 호출 경로는 기록만 하며 이 검증의 최적화 범위에 넣지 않는다.

### scenario-runner-union-entry — 정착 선택과 union 진입 장면

- 유효 목록의 정착·파생 반영과 union 진입의 두 단계 관측은 같은 코어 시나리오 실행기를 사용하며 단계별 값·형상·배달 단언을 유지한다.

### settle-branchless-feature-indexes — 분기 없는 청사진의 기능 색인과 빈 규칙 표

- derive·watch·state·역의존 기능이 선언되면 코어 정착에 필요한 색인이 남는다. 빈 파생 식처럼 규칙이 없어도 부재 증명이 없는 경우에는 청사진 사이에서 빈 표를 공유하지 않는다.

### settle-child-selection-metadata — 지연 후보 계획의 런타임 계수 (변경 1b)

- 고정 live 폭의 B=5/10/20/40에서 무관 분기의 후보 접근·사전 공표 방문을 줄이고 각 원래 평가 자리의 조건 호출 한 번과 첫 전환 16B·이후 8B를 유지한다. 이 16B·8B는 확인 바퀴를 실행하는 내부 record 모드의 계수이며, 확인 바퀴를 생략하는 출하 모드에서는 첫 전환 8B·이후 4B이다(출하 계수는 settle.gate-wheel-counts.test.ts의 S2가 검증한다).
- mount와 무관한 잎 쓰기에서는 계획을 준비하지 않는다. 첫 union 전환에서 호스트당 한 번 준비하며 primeHost는 준비하지 않고 기존 계획만 읽는다. if-then·단일 분기는 mount·전환 모두 계획 생성 0회이다.

### settle-child-selection-lookup — 계획 조회와 사전 공표 진입의 런타임 계수 (변경 1c)

- if-then 호스트는 자동 쓰기 ON/OFF 모두 첫 쓰기 뒤 쓰기마다 계획 함수 진입 0회이고, mount와 쓰기에서 사전 공표 함수의 빈 진입도 0회이다. union 호스트도 첫 전환에서 준비한 뒤의 전환마다 0회이다.
- 고정 live 폭 B=5/10/20/40의 mount는 사전 공표 함수를 pending output이 있을 때만 6B−2회 부르며 빈 진입은 0회이다. 무관 분기의 후보 접근은 변경 1b와 같이 첫 전환 3회, 이후 0회이다.

### settle-gate-selection-differential — 검증자 이력의 전수 평가 관측

- 고정된 검증 경계와 입력 이력(−0/undefined/NaN/객체 const, 분기 전용 키, 같은 이름 다른 종류, 무일치, 비루트 호스트, 배열 발생, 퇴장/예외, 이동 게이트 상한 등)을 같은 코드로 두 번 실행해 매 정착 직후의 값·형상·오류·진단·revision·커밋·전역 상태·latent·배달 순서가 같음을 단언한다.
- 두 번째 실행에는 읽기 그림자를 설치하여 위반이 없고 실제 읽기 횟수가 0보다 큼을 단언한다.

### settle-gate-selection-order — 평가 자리의 읽기 투영

- 무공표 독립 reader는 노드가 이미 소비되었거나 공표 대기이면 던지고, 읽지 않는 undefined raw 호스트는 제외함을 단언한다.
- 고정 분기 전환(kind_0에서 kind_4)에서 전수 평가의 값과 반복 참조 동일성, 안정 상태를 단언한다.
- 마운트와 갱신의 모든 `active` gate 평가 직후 독립 reader의 값이 평가 결과와 같고, changedNodes·pendingOutputs·gateThrowVersion이 변하지 않으며 위반이 0임을 단언한다.

### settle-gate-selection-counts — 고정 live 폭의 분기 축

- B=5/10/20/40에서 `active` 식 평가 횟수를 계수한다. kind_0에서 kind_4로 가는 첫 전환은 16·B회, 이후 세 전환은 각 8·B회이다. 이 16B·8B는 확인 바퀴를 실행하는 내부 record 모드의 계수이며, 확인 바퀴를 생략하는 출하 모드에서는 첫 전환 8B·이후 4B이다(출하 계수는 settle.gate-wheel-counts.test.ts의 S2가 검증한다).
- 각 전환 뒤 자식 5개, 안정 진단, emit 90바이트를 단언한다.

### settle-recursive-fill — 재귀 채움의 종료와 상한

- 호출자 값의 유한 재귀 배열과 D가 명시한 `[]`는 정상 완료하며, default만 반복되는 배열 및 객체 D 안의 같은 반복은 재귀 진단으로 끊는다.
- 배열 D 아이템의 a→b→c→d는 이어 채움 1회·센 전이 4회로 상한 4 안에서 안정된다. 같은 선언이 반복되어 실제 사슬이 상한을 넘으면 전이 예산 오류이며, 무게이트 자손은 전이 1회에 채워진다.
- 시간은 기존 방문에 첫 평가 branch의 O(B) 집합 등록을 더하며, 같은 생김 묶음의 임시 O(B) 참조만 보유한다. 노드 shape와 상한 식은 그대로이다.

### settle-reporter-boundary — 정착 중 보고 금지

- 사슬 없는 첫 로드의 검증기 부재 경고와 non-JSON whole-value 경고는 기록으로 남고 보고기·콘솔을 동기로 호출하지 않는다. 공개 사슬의 기존 전달은 기록을 소비하며 production에서는 non-JSON 개발 경고를 만들지 않는다.

### settle-runtime-predicates — 런타임 병합의 판정 정체성

- 게이트 선언의 React 요소와 ref 모양은 청사진에 전달한 원자 판정대로 병합되고, 판정 없는 core 호스트의 병합 계약은 유지된다(REACT-003, 69C-04).

### settle-failure-identity — 오류 발생 식별자

- 실패 중복 키는 한 정착의 발생 식별자이며, 대상 경로가 원천과 다른 파생 실패는 종류·원천 경로·대상 경로·규칙 스키마 경로를 함께 구별한다. 같은 규칙을 공유하는 서로 다른 원천이 같은 대상에서 실패해도 별개 오류로 보존한다(ERROR-004, 58C-01).
- 자동 쓰기의 `INJECT_TARGET_MISSING`·`INVALID_VIRTUAL_NODE_VALUES`는 오류 생성 시 `details.sourcePath`에 `controls.injectTo` 선언 노드의 데이터 경로를 넣고 `details.path`는 대상 경로로 유지한다. 쓰기 모양 오류의 기대 길이·받은 값도 유지하며, 사슬 끝 기록은 같은 상세 참조를 전달한다. 호출자 경로의 쓰기 모양 오류에는 원천 경로를 더하지 않는다(ERROR-017·195, 59C-01).

### settle-gates — 평가와 위치

- 판별·노드/조각 active는 실제로 평가하고 `if`는 검증기 계약의 동기 가드로 판정한다. 시험 전용 술어 대역 없이 L로 옮긴 게이트의 사촌·루트 읽기와 순환은 고정 출발점에서 같은 형상을 낸다(VALIDATE-015·044, TEST-069 (나), SETTLE-045, 26C-04).

### settle-gate-path-resolution — 같은 포인터의 반복 해석 계수 (변경 2)

- 고정 축 B=5/10/20/40의 각 무관 분기에서 전환 중 중복 해석을 제거하며, 이미 등록된 /kind의 전체 경로 해석은 첫·후속 전환 모두 0회로 분기 수와 무관하다.
- 해석 메타데이터만 공유하고 각 원래 평가 자리의 projected 읽기·실제 조건 호출 한 번과 첫 전환 16B·이후 8B를 유지한다. 이 16B·8B는 확인 바퀴를 실행하는 내부 record 모드의 계수이며, 확인 바퀴를 생략하는 출하 모드에서는 첫 전환 8B·이후 4B이다(출하 계수는 settle.gate-wheel-counts.test.ts의 S2가 검증한다).

### settle-discriminator-comparison — 판별 값의 엄격 비교

- `const: 0`에 `−0`, `enum: [0]`에 `−0`, `enum: [−0]`에 `0`을 쓰면 해당 분기를 켠다. 수 `1`과 문자열 `'1'`은 서로의 분기를 켜지 않는다. `NaN`은 `const: NaN`과 유한 enum을 포함하여 어느 분기도 켜지 않는다(BLUEPRINT-017, 97C-02).

### settle-budget — 원본 B와 진단

- 호스트·파생·전이 초과 및 재귀 무한 확장은 원본 B·`degraded`·해당 `exceededBudget`을 커밋한 뒤 오류를 던지고, 폼 수준 로드 전에는 진단이 유지된다. 파생은 적용 라운드 25를 한 정착에서 누적하고 초과하면 `exceededBudget: 'derive'`·`iterations: 25`이다. 자기 노드의 존재를 부정하는 게이트가 한 호스트 계산에서 진동하면 전이 중이라도 `hostWheel` 초과이며, 채움·비움이 서로 다른 게이트를 전이 상한보다 많은 라운드에 걸쳐 뒤집을 때만 `transition` 초과이다. 같은 최종 형상에 이르는 로드는 입력 키 유무와 관계없이 같은 진단 상태이다(SETTLE-003·005·011·017·022·029, EVENT-020, ERROR-070·132·190·204, TEST-069, 26C-11). 식이나 가드가 던져도 정착은 자리마다 정의된 값으로 끝까지 가며 파생·채움·나감 비움을 이어 간다. 나감 비움을 빼는 것은 던져 거짓이 된 게이트로 나간 노드와 함께 나가는 하위 트리뿐이고, 자동 쓰기 전체를 빼는 것은 예산 초과뿐이다(ERROR-121·122·125·126, SETTLE-011, WRITE-033, 29C-02).

### settle-derive — 파생 단계의 실행

- 파생은 계산 뒤·전이 앞에 돌고 쓰기가 나오면 표시로 돌아가며, 로드는 기준을 비워 발화하고 같은 값의 일반 쓰기는 발화하지 않는다. 태어난 노드의 규칙은 원천 방출 값이 `undefined`여도 발화하고 채움 뒤 새 에지로 다시 발화한다. `DisableAutomaticWrites`는 그 호출의 파생 쓰기를 막고 값 동등은 `sameValue` 하나로 판정한다(SETTLE-004·005·043·046·048, WRITE-015·028·029, 18C-50, 29C-01).

- 수렴 확인은 이번 라운드의 실제 승자 쓰기 대상 모두가 전체 청사진의 규칙 원천·식 읽기·watch 및 게이트 읽기와 조상·자손 양방향으로 만나지 않는다는 증명이 있을 때만 생략한다. 첫 실제 쓰기 라운드에서만 증명을 계산하며 쓰기 없는 마운트는 계산하지 않는다. 증명 불가 결과도 청사진에 한 번 메모해 이후 갱신과 청사진 캐시를 공유하는 같은 스키마 객체의 두 번째 폼이 재사용한다. 비활성 조각의 규칙과 게이트도 증명에 포함한다. injectTo의 원천은 원천 노드 방출이며 derived는 식 경로와 대상 watch의 합이다. 정적으로 묶을 수 없는 발생 경로, 맥락/전체 호스트 읽기 또는 읽기 완전성을 인정하지 못하는 식이 하나라도 있으면 폼 전체가 기존 확인으로 돌아간다. 가상 쓰기는 실제 형제 분배를 별도로 증명하지 않아 기존 확인을 유지한다(98C-01, 97C-01, 99라운드).
- 생략 증명은 한 파생 호출의 마지막 쓰기에만 적용하며 전이 단계나 전이 쓰기 뒤의 새 파생 호출을 생략하지 않는다. 해당 라운드에 실패가 있으면 확인을 유지한다. 쓰기를 낸 라운드 수·예산 초과 `iterations`와 개발 기록의 빈 확인 슬롯은 유지한다. 기본으로 꺼진 모듈 내부 플래그를 이 패키지의 unit·render·react18 Vitest 설정이 켠 경우에만 생략할 확인을 실제로 돌려 후보와 실패가 0임을 단언한다. 소비자의 `NODE_ENV=test`는 그림자를 켜지 않으며 공개 진입점·공개 타입에는 스위치를 노출하지 않는다. 개발 모드 동결은 기존 환경 조건을 유지한다(Q113). 증명 비용은 생성에서 첫 쓰기로 옮긴 선언/읽기 수집과 대상×읽기 교차 판정이며, 이후 라운드는 O(1) 캐시 조회만 더한다. 보유 메모리는 청사진당 약한 캐시 한 항목과 O(정적 대상 수)의 경로 참조, 기존 O(컴파일 식 수)의 약한 완전성 등록이며 값·노드·식 descriptor shape는 추가하지 않는다. 실행은 쓰기마다 Set 조회 하나를 기존 승자 적용 루프에 합치고 확인의 규칙 방문·의존 읽기·임시 배열/Map을 제거한다. 실제 속도는 99라운드 짝 측정으로 판정하며 힙 바이트는 별도 측정하지 않는다.

### settle-state-keys — 상태 키의 결합

- `publishStateKeys`는 상태 dirty 목록에서 청사진이 로컬 상태 키를 선언한 노드와 조각·부모 fields 층의 직접 자식 대상을 골라 계산한다. 역의존/형상 변경 호스트의 자식 확장도 색인된 대상에 한정한다. 결합 결과는 방문 순서와 무관하나 실패 수집 순서는 기존 후보 순서를 유지한다. 게이트가 꺼져도 정적 대상은 남으므로 잠금·표시가 기본값으로 돌아간다. 선언이 없는 청사진은 후보·식 방문이 0이다(CONTROLS-045·073·082·083, 65C-02).

- 잠금은 네 자리 가운데 하나라도 참이면 참, 표시는 모두 참이어야 참이고 선언 순서와 무관하다. 잎 입력은 역의존 소유자·형상 변경 호스트에서만 자식으로 넓혀 계산하며, 떼어진 노드는 마지막 커밋의 상태 키를 유지한다(CONTROLS-073·082·083, SETTLE-017, GOAL-011, NODE-044, 28C-02·07).

### settle-item-fragment-layer — 배열 아이템의 조각 층

- 배열 호스트의 조각이 `items`·`additionalItems`·`prefixItems`로 선언한 아이템은 모두 그 조각의 상태 키와 `default`를 조각이 켜진 동안 받고, 조각이 꺼지면 상태 키가 기본값으로 돌아간다. 조각이 꺼져 아이템이 나갈 때는 그 조각의 `unsetOnInactive`가 Form 정책보다 앞서며, 중첩 배열에서 조각은 자기 호스트의 직계 아이템에만 걸린다(CONTROLS-077, WRITE-032, 35C-08).

### settle-virtual — 가상 노드의 쓰기와 참조

- 호출자의 가상 노드 쓰기는 참조 노드로 나뉘고 틀린 모양은 즉시 던지며(배치 표시도 진입점의 `assertVirtualWriteShape(node, input)`으로 같은 시점에 던짐), 가상 노드의 자식은 실제 형제 노드이고 참조 노드가 바뀐 정착에서 가상 노드의 튜플이 다시 조립된다(NODE-034·054, ERROR-195, 42C-01·02).

### settle-context — 맥락 변경의 정착

- 같은 맥락 객체 또는 깊이 같은 새 객체는 정착도 참조 교체도 하지 않고, 바뀐 `@` 맥락은 소유자와 조상을 재계산하되 `injectTo`를 발화시키지 않는다(CONTROLS-080, SURFACE-055, SETTLE-043·048, 28C-03·08).

### settle-write — 쓰기 범위

- 두 단계 해석·로드 스냅숏·`resetSubtree`·옵션 억제·Refresh 대상을 쓰기 종류와 범위에 맞게 확정하고 잎 입력은 트리 전체를 걷지 않는다(WRITE-015·085·098·099, EVENT-071, SETTLE-047).

### settle-array — 배열 형상과 구조 정착

- 배열 아이템 에지는 재귀 조상 탐색을 끊는다. 빈 아이템도 참조된 객체 필드와 빈 자식 배열을 만들며, 빈 배열에서는 아이템을 만들지 않는다. 배열 에지 안쪽의 객체 프로퍼티 전용 순환 보호는 유지한다(BLUEPRINT-030, 18C-01, LANDING-128).
- 통째 쓰기는 자리의 노드·키를 잇고 새 꼬리만 만들거나 남은 꼬리를 소멸시키며, 로드와 비로드의 생김·채움을 구분한다. 구조 동사는 행 계획으로 경로 열쇠 저장소와 게이트 등록을 재배치하고 스냅숏 자리를 맞춘 뒤 한 번 정착하며, 원본 B는 자동 쓰기의 구조 로그를 역순으로 되돌리고 키 계수를 유지한다. 아이템 선언은 실제 경로에 묶이고 비활성 배열 호스트의 잠복 원본은 전체 배열 하나이다(NODE-051·052, WRITE-036·085·090·095·099, CONTROLS-080, 35C-02·05·08·09·10).

### settle-array-selection-reuse — 구조 정착 뒤 정적 아이템 선택 재사용

- append·remove-last의 정적 선택 단축은 일반 선택과 값·방출·반환값·스냅숏·노드/키/경로·배달 순서·개정·진단·기록·소멸 관측이 같다. 실제 단축 경로가 실행되며 접두의 일반 선택 몸통 방문은 0회이다.
- 경로가 옮겨진 정착은 선택을 재사용하지 않는다. 예외는 유효한 `arraySplice` 증명을 가진 정적 호스트(`admitsStaticArrayTail`: 게이트·식·파생·감시 없음)의 가운데 remove·insert이며, 선택을 재사용하고 꼬리 T 항목(자리 i..새 아이템 수−1)만 다시 공표한다. 정적 자격 아래 이름이 바뀐 꼬리 노드의 선택은 같은 템플릿 노드와 정적 선언 ID라는 경로와 무관한 구조 사실에만 기대기 때문이다. 접두 항목은 다시 공표하지 않으며, 결과는 일반 경로를 강제한 실행과 값·키·경로·배달·개정·선언 ID가 같다(371C-03, 371C-01, 365라운드 소유자 답 `architecture/reviews/round-365-owner-answers.md`).
- 새 아이템의 기존 계산은 유지한다. 게이트·식·파생 입력·통째 배열 교체·정적 증명 없는 경로 이동·잘못된 종류의 호스트는 일반 경로를 유지하며 결과와 실패 기록을 비교한다. 스키마 불일치·종류 충돌·빈 선언·가상 아이템·dirty 접두 자식 조건은 증명을 국소적으로 유지하는 방어 조건이며 이 그룹의 테스트는 재현하지 않는다.

### settle-delivery — 변경 범위의 배달 표시

- 하위 트리 로드에서 발화한 주입 등 비로드 쓰기로 범위 밖 노드의 원본이 바뀌면 그 노드에도 `RequestRefresh`를 한 번 표시한다. 범위 밖의 원본이 그대로인 노드는 표시하지 않으며, 로드 범위의 모든 노드는 값이 같아도 표시한다. 비로드 쓰기에서는 입력 출처로 쓴 자신만 제외한다(EVENT-039·071, SETTLE-049, 18C-94, 72C-01). 추가 비용은 변경 원본 경로의 범위 판정에 비례하며 기존 Refresh 대상 집합을 재사용하고 전체 트리 순회를 추가하지 않는다.
- `markCommitDeliveries`의 후보별 감시 값 읽기는 배달 후보와 청사진 감시 선언 색인의 교집합에 한정한다. 의존 경로·맥락·형상으로 추가된 기존 감시 역색인 후보도 포함하며, 비활성 감시 선언의 이전 값은 빈 값과 비교하여 배달한다. 감시가 없는 후보는 공용 빈 값을 쓰고 감시 메모/역색인을 방문하지 않는다. 감시 비교 자체는 순서와 무관하지만 사건 표시·개정과 배달 후보의 순서는 유지한다(EVENT-007·024·064, SETTLE-006, 65C-02).
- 배달의 변경 판단(값·방출·감시 값 튜플의 원소)은 참조 동일성에 `NaN`을 `NaN`과 같게 보는 SameValueZero이다(SETTLE-043, 66C-01). 그래서 `NaN`을 든 잎은 다시 계산되거나 계산 플래그 변경으로 후보가 되어도 `UpdateValue`를 받지 않고, `NaN`을 든 감시 튜플은 그대로이면 `UpdateControlledProperties`를 받지 않는다. 깊은 비교는 되살림에서 한 번, 배달은 참조: 내용 비교(`sameValue`)는 커밋의 참조 되살림(SETTLE-043 (나))과 원본·입력 비교에만 쓰고, 배달·`onChange`·검증 요청·감시 간선은 참조로 비교한다(67C-01).
- `commitGlobalState`는 정적 범위를 줄이지 않는다. 모든 종류의 노드가 스키마 선언과 무관하게 `setState`·`setSubtreeState`로 임의 상호작용 상태 키를 받을 수 있고, 로드/초기화 및 형상 진입·이탈에서 참→거짓과 이전 참 노드의 제거도 셈해야 한다. 따라서 현재 참 플래그나 `controls.resetInteraction` 선언은 EVENT-062의 정적 상한이 아니며, 가능한 정적 범위는 전체 노드이다. 키별 증감 합산은 순서와 무관하나 전역 상태 확정→배달 표시 및 최외곽 진입당 `UpdateGlobalState` 한 번의 SETTLE-006·43C-01 순서는 유지한다(65C-02).

- 소멸한 아이템과 자손의 직전 상호작용 상태를 전역 셈에서 빼고, 구조 연산의 새 아이템은 생김 집합으로 더한다. 소멸 노드의 레코드 배달 기준·감시 역색인·대기 사건·검증/외부 오류 및 대상 집합은 노드 identity로 지운다. 재인덱싱은 identity 저장소를 유지하고 경고 데이터 경로 키를 옮기며 소멸 경로의 경고는 버린다. 사슬에 이미 발생한 오류와 기록은 당시 경로를 유지하여 발생 순서를 보존한다. 정리는 소멸 하위 트리의 노드 수에 비례하고 일반 잎 쓰기에는 저장소 전체 순회를 더하지 않는다(35C-02·09, 43C-01, 58C-01). 소멸 경로 정리는 항목이 없는 경로 저장소와 빈 경고 색인을 경로마다 조회하지 않고, 소멸 마감은 런타임의 게이트 등록부를 한 번 얻고 대기 나감이 없으면 노드마다 훑지 않는다. 결과와 순서는 같다(371C-04, arrangeFieldNodeItems DETAIL의 `settle-array-clear`).

- 관련 없는 한 잎 쓰기와 맥락 참조가 그대로인 커밋은 해당하지 않는 감시 노드의 감시 값을 다시 읽지 않는다. `@` 감시는 마지막 배달에서 본 맥락 참조와 현재 참조가 다른 커밋에서만 후보가 되며, 의존 경로·맥락·형상 변경은 해당 감시 값과 `UpdateControlledProperties` 비트를 유지한다(EVENT-064, CONTROLS-019, 28C-07, 44C-01).

- I9 경로 저장소는 생성 시점부터 명시적인 PathKeyedMap·PathKeyedSet 형이며 native Map·Set의 열거와 instanceof 동작을 유지한다. 인스턴스 메서드 패치·약한 등록·첫 쓰기의 adoption 순회는 없다. exact·조상·숫자 자리 radix 색인은 set·add·delete·clear와 명시적 replaceEntries 일괄 이동에서 갱신한다. PathKeyedSet은 저장된 경로를 바꾼 호출(새 경로의 add, 실제로 지운 delete, clear, replacePaths)마다 오르는 변경 계수를 가지며, 불일치 메모는 이 계수와 메모의 크기·정체성을 마지막 만듦과 견주어 다시 만들지 정한다. 배열 재키·비움은 메모 행을 지우기만 하므로 크기 비교가 그 무효화를 잡는다(372C-02). 소멸·이동은 영향 prefix만 조회하고 규칙 원천·대상을 모두 색인한다. 일괄 이동 동안 빈 prefix를 보류하여 살아남는 마디와 숫자 radix를 재사용하며 경로와 숫자 판정을 prefix별로 보관한다. 메모리는 경로 깊이 D의 항목 K개에 O(KD) 키 참조와 유일한 prefix 문자열·부모 연결·숫자 radix 마디를 더한다. 값은 복제하지 않는다. 생성은 빈 색인 O(1), 새로운 키의 쓰기·삭제는 O(D) 색인 연산과 문자열 처리이며 기존 키 값 갱신은 O(1)이다(SETTLE-017·047, GOAL-011, 49C-01).
- 배열 소멸은 직전 스냅숏 경로를, 이동은 previous·current 경로를 배달 감시 역색인에 넣는다. 변경 자손의 조상을 생략해도 역색인 조회가 조상 감시를 포함하므로 배달을 잃지 않는다. 조건 의존의 나감은 나간 노드의 직전 커밋 경로를 배달 감시 역색인에 넣는다. 나간 노드는 떼어진 뒤 변경 기록이 영향 경로를 남기지 않으므로 커밋이 그 경로를 직접 더한다. 관련 없는 watcher 수 W에 비례하는 배열 구조·나감 배달 비용을 추가하지 않는다(NODE-026, EVENT-064, 44C-01, 372C-02).

### scenario-runner-effective-list — 유효 목록 E26 장면

- `runScenario`를 공유하는 인라인 시나리오에서 좁히지 않은 effective 목록과 scalar schemaType이 동일한지 단계별 결과를 비교한다(WRITE-099).

### settle-array-carryover — 투영된 빈 자리와 보존 원본

- 로드 뒤 omitTrailing으로 출력에서 빠진 원본 자리가 남는지, 빈 루트 배열·없는 잎의 null·빈 객체 아이템 자리가 어떻게 방출되는지 확인한다. 끝의 빈 잎만 잘리고 중간 자리와 원본은 유지되는지도 확인한다(26C-03, VALUE-034).

### settle-array-declarations — 아이템 경로에 결합된 선언

- 각 아이템의 visible·readOnly·fields·if 게이트·나감 정책이 자기 자리에 적용되고, 아이템이 꺼져도 배열 자리가 남는지 확인한다. remove·push 뒤에는 아이템 선언과 게이트 등록이 새 자리에서 다시 결합되는지 확인하고, 다른 아이템의 절대·상대 읽기, 방출 배열 길이, 중첩 템플릿과 @ 소유자가 아이템 경로에서 풀리는지 확인한다(35C-08, CONTROLS-073, SETTLE-045, VALUE-034, WRITE-031, 18C-13, CONTROLS-080).

### settle-array-legacy-ports — 빈 배열·최소 길이·가상 자리의 원본

- 빈 배열·부분 배열의 로드와 clear가 minItems를 임의로 채우지 않고, 빈 가상 집계 자리와 가상 Overwrite의 참조 필드 비움이 유지되는지 확인한다. 기본값 없는 push의 없는 자리 채움과 비활성 분기 재진입 시 omitTrailing 원본 자리 복원을 확인한다(VALUE-034, WRITE-022, LANDING-171, LANDING-155, 18C-21, GOAL-074).

### settle-array-lifecycle — 소멸과 호스트 잠재 원본의 복원

- 소멸 아이템 아래의 잠재·선언 경로가 지워지고, 꺼진 아이템과 중첩 배열의 원본·자리 수가 호스트 잠재 값 하나에 보존되어 재진입하는지 확인한다. 자동 배열 증가가 예산으로 되돌아갈 때 이전 아이템 참조와 extras가 복원되는지, 재귀 잠재 포착의 방문량과 나간 아이템 자리 유지도 확인한다(35C-09, WRITE-036, 35C-10, 38C-02, 47C-01, 35C-05, 35C-08).

### settle-array-recursion — 재귀 아이템의 유한 확장과 순환 거절

- 빈 재귀 아이템은 참조 필드와 빈 자식 배열을 만들고 push마다 한 층만 확장하지만 빈 자식 배열은 더 확장하지 않는지 확인한다. 아이템 안의 객체 프로퍼티 전용 자기 순환과 원본 없는 게이트 객체 순환은 각각 청사진·정착의 보호로 거절되는지 확인한다(BLUEPRINT-030).

### settle-array-scaling — 배열 계산·저장소 방문의 계수 상한

- 대량 배열 쓰기·나감·clear에서 행 조립, 의존 소유자, 잠재·경로·규칙 저장소와 dirty 색인의 방문 계수가 각 단언의 상한을 지키는지 확인한다. 2,000개 아이템의 잎 갱신은 dirty 자리만 방문하고 같은 값·무관한 아이템의 참조, 제거 후 dirty 순서와 빈 이름·escape 경로를 유지하는지 확인한다(44C-01, 51C-01, SETTLE-017, 49C-01, NODE-026, 18C-15, SETTLE-045, 48C-01, SETTLE-047, SETTLE-042).

### settle-array-writes — 배열 교체·로드의 자리와 원본

- 교체·Merge·reset 뒤 살아남은 자리의 노드·키·상태와 로드 스냅숏이 맞고, 비로드 쓰기는 새 꼬리만 채우며 tuple extras·schemaType 참조와 빈 자리 출력을 유지하는지 확인한다. 잘못된 종류의 배열·객체 원본은 그대로 방출되고 옛 아이템은 소멸하며, 그런 원본 아래의 자손 채움은 막히고 자동 기본값이 만든 배열은 재계산되는지 확인한다(NODE-051, LANDING-164, WRITE-090, LANDING-202, WRITE-048, WRITE-095, NODE-044, WRITE-007, NODE-052, 25C-11, VALUE-034, 38C-01, 39C-01).

### settle-write-commit — 경고·잠재 열거·참조의 커밋 관측

- 불일치 경고의 fill·load·gate 출처, 재점등·후보 변환·개발 전용 non-JSON 경고, 출력 키 순서·옵션 overlay와 호출자 및 입력 출처별 Refresh를 확인한다. 비활성·떼어진 값의 종류별 중복 제거와 문서 순서·메모 참조를 확인하고, 같은 선언·같은 계산값·NaN 자식에서는 유효 스키마와 부모 참조가 유지되는지 확인한다(VALUE-037, SETTLE-042, 18C-39, VALUE-034, VALUE-032, EVENT-071, WRITE-087, 26C-13, 25C-04, SETTLE-043).

### settle-gates-conflicts — 공유 선언 충돌의 커밋과 종류 선택

- 공유 선언 충돌이 있어도 파생·채움·무관한 나감 비움과 호출자 원본을 커밋한 뒤 오류를 던지는지 확인한다. fold는 활성 선언의 첫 종류를 고르고 서로 다른 종류의 게이트 충돌을 보고하는지 확인한다. 타입 나열 순서가 다르거나 null 포함 여부만 다른 같은 fold는 공유 노드 하나와 오류 없음이며, 서로 다른 union fold와 number/string은 기존 코드·메시지·진단 원인의 충돌이고, 같은 string fold는 오류가 없다(29C-03, 26C-05, BLUEPRINT-043·044, 389C-01).

### settle-derive-context-owners — 맥락 의존 소유자 두 경로

- @를 읽는 derived 대상 /target과 active 게이트 /gate가 getContextOwners의 결과에 모두 포함되는지 확인한다(28C-03).

### settle-state-keys-context — 상태 키 식의 방문과 오류 격리

- 64개 형제의 상태 키 로드는 식 배열을 find로 검색하지 않고 map으로 한 번 준비하며, 하나의 fields 식은 두 대상에 대해 한 번 호출되는지 확인한다. visible 식 실패는 해당 선언을 무시한 degraded 커밋과 기본 visible을 남기면서, 무관한 unsetOnInactive 나감의 노드·잠재 원본 비움은 계속 수행하는지 확인한다(GOAL-011, CONTROLS-073, ERROR-122).

### settle-delivery-watch-index — 감시 후보의 제외·추가·제거

- 관련 없는 1,000개 감시 읽기는 잎 쓰기·잎 reset에서 제외하고, anchor·맥락·조건 의존의 진입·나감은 해당 감시자를 배달 후보에 넣되 상호작용 상태만 변한 의존에는 배달하지 않는지 확인한다. 게이트로 나간 그룹의 자손과 나간 감시자 자체는 감시 역색인에서 제거되는지 확인한다(44C-01, EVENT-064, 372C-02).

### settle-delivery-watch-exit — 나감의 감시 색인 조회

- 형제 나감과 재진입, 그룹 나감(자손 `../grp/x`·그룹·루트 감시), 중첩 호스트 나감(조상·자손 감시, 나간 하위 트리 안의 감시), 바뀐 형제 옆의 나감에서 색인 조회의 사건 표시(노드별 종류·payload·options·순서)·배달 순서·방출 값·남은 역색인이 모든 감시 노드를 후보로 넣은 조회와 같은지 확인한다. 나감에서 감시 값을 다시 읽는 노드는 관련 없는 감시 노드가 10개일 때와 1,000개일 때 같은지 확인한다(EVENT-064, 44C-01, 372C-02).
- 서로 다른 노드 사이의 표시 순서는 계약이 아니다. `deliverWave`가 웨이브마다 문서 순서로 정렬하므로 리스너는 이 순서를 볼 수 없다. 그래서 표시는 노드별 호출 순서로 비교하고, 배달 순서는 전체를 그대로 비교한다.

### settle-derive-exit-policy — 나감 정책 커밋의 reset 기준점

- 나감 정책이 선언된 트리에서 이미 참인 resetInteraction 조건을 둔 대상에 입력을 써도 원본은 갱신되고 수동으로 켠 Dirty 상태는 지워지지 않는지 확인한다(SETTLE-004).

### settle-derive-locality — 미방문 기준점과 잎 쓰기의 국소성

- 공유 선언의 재활성화는 발화 없이 기준점만 만들고, 자식을 방문한 정착에서도 방문하지 않은 호스트의 기준점은 자기 unset 규칙 유무와 관계없이 보존되는지 확인한다. 잎 커밋은 무관한 derived 기준점을 파싱하지 않고 다른 가지의 원본·자식 값을 읽지 않는지 확인한다(FRAGMENT-050, SETTLE-004, SETTLE-017, SETTLE-047).

### settle-derive-selection — 선택 선언의 기준점과 다음 에지

- if·then·allOf·discriminator의 공유 선언 활성화와 같은 길이의 선택 교체는 derived·unsetValue·resetInteraction·injectTo의 기준점만 갱신하고 다음 원천·조건 에지에서 발화하지만, 새로 진입한 노드의 규칙은 바로 발화하는지 확인한다. 깊이별·중첩 분기에서는 꺼진 선언이 쓰기·상태 초기화를 하지 않고 재선택과 유효 스키마·선택 결과가 새 로드와 일치하는지 확인한다(FRAGMENT-050, SETTLE-003, CONTROLS-077, SETTLE-049).

### settle-budget-expression-errors — 파생 예산보다 앞선 식 오류

- 식 ERROR-122가 먼저 발생하고 파생 예산도 초과한 경우 오류 묶음에 앞선 오류가 남으며 진단의 최초 cause가 바뀌지 않는지 확인한다(ERROR-004, ERROR-005, 58C-01, ERROR-122).

### settle-gates-error-exits — 실패한 게이트의 나감 값과 계속되는 쓰기

- 형제 active 게이트 평가는 식 배열을 매번 검색하지 않는지 확인한다. 던진 조상·자기 게이트로 나간 값은 잠재 원본에 보존되는 한편, 무관한 나감 비움과 파생 쓰기는 끝까지 수행되는지 확인한다(SETTLE-017, ERROR-125).

### settle-array-fill-descendants — 같은 라운드의 배열 기본값 자손

- 배열·중첩 배열·객체 기본값이 만든 아이템은 명시 값을 유지하면서 없는 자손이 채워진 최종 방출 값을 내고, 진단은 `stable`, 커밋 번호는 1인지 확인한다. DisableAutomaticWrites와 새 아이템에 적용되는 unset·derived의 우선순위, 기존 아이템을 보존하는 push, 게이트가 낸 형제의 채움, 반복 기본값의 재귀 오류와 원본 조상에 닿는 상대 읽기의 유한 확장을 확인한다(90C-01, WRITE-088, BLUEPRINT-030).

### settle-write-global-state — 형상 진입·나감의 참 상태 셈

- 게이트로 들어오는 노드의 참 상태 키는 전역 셈에 더해지고 나가면 빠지며 다시 들어오면 다시 더해지는지 확인한다(EVENT-062, 43C-01).

### settle-budget-misfit-scaling — 불일치·스냅숏·선언 조회의 계수

- 2,000개 불일치의 조상 읽기·나감 제거와 1,000개 없는 게이트 대상의 선언 조회는 계수 상한을 지키고, 불일치 메모 키 순서와 떼어진 읽기를 유지하는지 확인한다. 대량 형제 배열의 스냅숏 정렬도 복사 계수 상한 안에서 순차 setLoadValue 결과와 같고, 바뀐 부모만 복사하며 무관한 자리·공유 참조는 보존하는지 확인한다(49C-01, SETTLE-017, M26, M27, M28, M29).

### settle-misfit-memo-rebuild — 불일치 집합이 바뀐 정착에서만 메모 만듦

- 불일치 추가·제거, 배열 remove·insert의 이동, 다른 불일치 옆의 배열 비움, 불일치가 그대로인 쓰기를 차례로 할 때 매 쓰기 뒤의 메모 행이 새로 만든 행과 같고, 루트 행의 목록 배열은 집합이 바뀐 정착에서만 새 참조이며 그대로인 정착에서는 같은 참조인지 확인한다. 큰 불일치 집합이 그대로인 두 정착 뒤 모든 행과 목록 배열의 참조가 같은지 확인한다(VALUE-030·037, 372C-02).

### settle-admitted-edge-schema — 완전 수용 간선의 상수 스키마

- 게이트가 모두 열린 폼, 일부 닫힌 폼, 게이트 전환, 같은 이름의 선언이 충돌하거나 충돌하지 않는 경우, if/then/else, oneOf·anyOf 분기, 중첩 게이트 호스트에서 메모를 읽는 선택과 메모를 거절한 선택의 값·노드별 active·스키마 객체·선택 ID·충돌·배달이 같은지 확인한다. 완전 수용 간선의 스키마가 패스와 정착을 건너 같은 참조이고, 일부만 켜진 간선은 메모를 읽지 않는지 확인한다(GOAL-011, SETTLE-020, 372C-02).

### settle-derive-same-value — 깊은 값 동등과 원본 참조 유지

- sameValue는 중첩 평범한 값과 SameValueZero 원시 값을 비교하고, 참조가 같은 원소는 깊은 비교에 들어가지 않는지 확인한다. terminal에 깊이 같은 값을 다시 쓰면 기존 raw 참조를 유지하는지도 확인한다(18C-50, TEST-071).

### settle-reference-revival — 직전 커밋 기준의 참조 되살림

- 객체 호스트가 한 정착 안에서 중간 값을 거쳐 직전 커밋과 같은 내용으로 돌아오면, 커밋된 local·emit 참조가 직전 커밋의 것과 같고 호스트의 `UpdateValue`와 그 호스트를 감시하는 노드의 `UpdateControlledProperties` revision이 오르지 않는지 확인한다(P-25, SETTLE-043 (나)).
- 같은 정착에서 형제가 `injectTo`로 실제로 바뀌는 동안 호스트가 되살아나면, 부모와 조부모의 local·emit이 그 이름 항목에 되살린 자식 emit 참조를 그대로 드는지 확인한다(P-25, SETTLE-043 (나)).

### settle-children-retention — 같은 자식 목록의 배열 유지

- 형상이 바뀐 비루트 `if` 호스트 아래에서 부모를 다시 고르는 쓰기 뒤에도 자식 목록의 순서·참조가 같으면 부모의 children 배열 참조가 쓰기 전과 같고, 자식이 실제로 들고 나면 새 배열이 공표되는지 확인한다(P-09, SETTLE-043 (나)).

### settle-write-traversal — 잎·통째 쓰기의 실제 방문 범위

- 잎 입력은 자신과 조상만 방문하고 게이트 읽기가 바뀌지 않은 50개 형제를 계산하지 않는지 확인한다. 통째 교체는 대상 하위 트리 밖을 방문하지 않는지 확인한다(SETTLE-047).

### settle-static-same-value-write — 정적 통째 쓰기의 같은 값 건너뛰기

- 객체 통째 `setValue`, 같은 길이 배열 통째 `setValue`, Merge, 루트 `setValue`, 입력 Overwrite에서 같은 참조·키 하나 바뀜·모든 키 바뀜·키 일부 제거마다, 자격을 거절한 일반 경로와 값·키 순서(SETTLE-042)·배달 집합·Refresh 대상(`setValue(getValue())`의 빈 집합 포함, EVENT-071, 26C-03, 372C-01)·비트별 revision·에지·파생 라운드 수·defaultValue·오류·진단이 같다. 같은 참조와 내용만 같은 새 참조의 중첩 객체 자식을 포함하며, 건너뛰기가 실제로 일어났는지와 키 일부 제거가 일반 경로로 물러나는지도 확인한다.

### settle-static-same-value-write-fallback — 같은 값 건너뛰기 자격의 거절 조건

- 잠복 원본, 불일치 경로, 게이트, 식, 파생, 감시, 로드, 배치, 방문, 자동 쓰기, 떼어진 호스트, 바뀐 키 집합마다 건너뛰기 없이 지금 경로(모든 자식 표시, 호스트 형상 dirty)가 실행되고 결과가 자격을 막은 비교 트리와 같음을 확인한다(18C-96, 372C-01).

### settle-static-same-value-write-cost — 키 수와 무관한 자식 표시·계산

- K=100과 K=1,000에서 키 하나를 바꾼 객체 통째 쓰기의 자식 `markWrite`(쓴 입력 수)와 계산(상태 dirty 노드 수)이 K와 함께 늘지 않음을 확인한다(372C-01).

### settle-write-value-model — 종류별 원본·extras·잠재 쓰기

- object 호스트의 null·scalar 원본과 extras의 순서·참조, 떼어진 Merge의 입력 보호, 같은 경로의 다른 종류 잠재 값 교체·복원과 명시한 없음이 다른 형제 값을 되살리지 않는 조건을 확인한다. 게이트·기본값·자동 쓰기 억제·원본 B 복원·하위 reset·재귀 분배가 caller 원본과 잠재 자손의 보호 및 비움 범위를 지키는지도 확인한다(39C-01, VALUE-002, WRITE-018, WRITE-079, 26C-14, VALUE-031, WRITE-091, WRITE-015, SETTLE-005, WRITE-013, VALUE-025, TEST-069, WRITE-098, WRITE-082, WRITE-035, OPEN-1, OPEN-2, OPEN-4, EVENT-072).

### settle-transition — 최종 형상 나감과 재진입

- 최종 형상에 남는 종류와 잠재 원본을 선택하고 통째 쓰기·폼 및 하위 트리 reset의 범위를 구별하며, 원본 B 복원과 자동 쓰기 억제 뒤에도 나간 원본을 보존한다(26C-13, WRITE-094, VALUE-025, WRITE-085, SETTLE-011, WRITE-015).

### settle-child-selection-differential — 고정 HEAD의 자식 선택 관측

- 고정 HEAD와 59개 코퍼스의 모든 노드 리스너, B=5/10/20/40의 첫·준비된 전환, if-then의 자동 쓰기 억제·가드 실패·중첩 위치에 대한 최종 관측을 비교한다. 같은 값 통째 쓰기가 형상 dirty 밖에 둔 호스트는 `selectChildren` 지점을 내지 않는다(371C-03, 372C-01). 그런 호스트마다 쓰기 뒤 출력이 직전 `local`과 같은 참조이고 그 쓰기에서 `UpdateValue`·`UpdateChildren` 배달을 받지 않았음을 확인하며, 나머지 지점은 고정 HEAD와 그대로 같아야 한다.

### settle-pending-exit-key — 빈 이탈 대기 맵의 키 생략

- oneOf-20 모양의 마운트와 아무 노드도 나가지 않는 갱신에서 `selectChildren`·`primeHost`가 부르는 `JSON.stringify`가 0회인지 확인한다. 앞 바퀴에서 나간 노드의 게이트가 뒤 바퀴에서 실패하면 그 나감을 찾아 잠재 원본을 지키는지, `primeHost`가 이탈 대기 중인 게이트 없는 자식을 같은 노드 인스턴스로 되살리는지 확인한다(386C-01, ERROR-125, GOAL-011). `primeHost` 사례는 조회 계약 확인용이다. 자연 적중은 오류로 끝나는 지연된 SharedNodeConflict 정착뿐이라, 스파이로 대기 나감을 둔다.

### settle-exit-pruning-identity — 소멸 때 보류 나감의 동일성 정리

- 배열 `remove`가 뒤 아이템을 소멸한 아이템의 경로로 옮기고 그 안의 게이트 필드가 같은 커밋에서 나가면, 그 필드가 떼어지고 `active`가 거짓이며 게이트 등록이 해제되고 경로 배달을 받지 않으며 방출 값이 맞고 그 값이 `insert`의 나감처럼 `inactiveValues`에 드는지 확인한다. 나감이 없는 이동 아이템은 지금처럼 살아 있고, 소멸한 아이템 안의 보류 나감은 아이템과 함께 떼어져 `active`가 거짓이고 게이트 등록이 해제되며 배달을 받지 않는지, `insert`의 위로 옮김과 중첩 배열에서도 같은지 확인한다(NODE-044).

## Boundary Exemptions

### `utils/input/` — 입력 해석 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: assertVirtualWriteShape·interpretFieldNodeInput은 write의 배치 표시와 반환 슬롯 해석이 진입점으로 소비하며, 일반 쓰기와 함께 쓰는 정적 해석을 같은 organ에 둔다.

### `utils/write/` — 일반 쓰기 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: writeFieldNode는 write의 호출자·입력 진입이 이름으로 소비하며, 표시와 교체 범위 보조를 함께 소유하는 일반 쓰기 organ에 둔다.

### `utils/dispose/` — 폐기 통로 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: assertFieldNodeWritable·disposeFieldNodeTree는 write의 쓰기 판정과 재생성 인계가 진입점으로 소비하며, 폐기 표시와 읽기 보존을 같은 organ에 둔다.

### `utils/structure/` — 배열 길이 읽기 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: readArrayLength는 write의 배열 진입이 이름으로 소비하며, 구조 정착과 함께 쓰는 공통 읽기이므로 부모의 구조 organ에 둔다.

### `utils/reset/` — 로드 초기화 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: resetFieldNodeForm·resetFieldNodeSubtree는 write의 폼·하위 트리 초기화 진입이 이름으로 소비하며, 공통 상태 초기화와 함께 reset organ에 둔다.

### `utils/loadValues/` — 기본값 읽기 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: readFieldNodeDefaultValue는 노드 겉면의 기본값 읽기가 진입점으로 소비하며, 마운트·reset이 함께 쓰는 로드 스냅숏 해석과 같은 organ에 둔다.

### `utils/detached/` — 마지막 커밋 읽기 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: readFieldNodeInactiveValues·readFieldNodeMisfit·readFieldNodeMisfits는 노드 겉면이 이름으로 소비하며, 살아 있는 참조와 떼어진 참조의 공통 읽기를 같은 organ에 둔다.

### `utils/controls/` — 감시 값 읽기 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: readFieldNodeWatchValues는 노드 겉면이 진입점으로 소비하며, 정착의 배달 판정과 같은 감시 값 해석을 공유하므로 controls organ에 둔다.

### `utils/context/` — 맥락 변경 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: changeFieldNodeContext는 write의 바인딩용 맥락 변경 진입이 이름으로 소비하며, 의존 소유자 등록과 동기 정착 조율을 context organ에 둔다.

### `utils/gates/getGateRegistry.ts` — 레거시 비교 스크립트의 직접 import

- **Consumers**: `**/bench/legacy-compare/**`
- **Direct import**: `allowed`
- **Reason**: `bench/legacy-compare/`는 src 밖에서 레거시 코어와 새 코어를 나란히 재는 독립 스크립트 넷(`array`·`derive-and-controls`·`dispatch-and-validation`·`node-and-settle`)의 자리이며 레거시와 함께 지운다. 그때까지 소유자 결정(276라운드, 대기열 49)으로 fractal import 규칙의 직접 import 금지에서 면제된다. 게이트 등록표 구성 비용을 따로 재기 위해 진입점에 올리지 않고 그대로 읽는다.

## Last Updated

정돈-3 settle 재구성(2026-10-15); 373라운드 배열 아이템 조각 층(2026-10-15, CONTROLS-077); 389라운드 공유 선언 fold 충돌 판정(2026-10-16, 389C-01)
