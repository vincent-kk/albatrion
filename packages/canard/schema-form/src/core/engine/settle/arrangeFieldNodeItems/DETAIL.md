# arrangeFieldNodeItems 계약

## Requirements

- 일반 배열 재배치에는 잠복 원본 변환·직렬화·재키가 없다. 살아남는 자리의 모든 후보 슬롯과 overlay를 새 호스트로 직접 이전하며 다른 튜플 청사진·미선언 꼬리·중첩 배열에서도 정확한 종류별 원본을 합성 입력보다 우선한다. 실제 삭제 자리만 버리고 옛 참조의 공개 path·읽기는 고정한 채 쓰기 주소를 함께 옮긴다. 같은 청사진의 이전 비용은 영향 아이템 수에 비례하며 떼어진 인스턴스 복제·합성 호출은 0이다. 서로 다른 tuple 청사진 사이의 중첩 보유 자손은 각 재생성 깊이에서 하위 복제·합성이 반복될 수 있어 최악 O(영향 서브트리 × 재생성 깊이)라는 알려진 한계가 있다. 일반 분기 전환에는 이 경로가 없으며 load·reset·진짜 소멸은 해당 보유 자료를 버린다. 별표 공표 호환 폼만 기존 wildcard 제외 결과를 위한 별도 저장·이동을 허용하며 일반 배열은 그 저장을 만들지 않는다.



- 슬롯 경로의 배열 이동은 값의 폐기가 아니다. 호스트 레코드가 가진 inactiveSlots와 overlay는 살아남는 아이템과 함께 이동하고 새 레코드로 재생성되면 새 호스트로 이전한다. 떼어진 원본 인스턴스의 공개 path·읽기는 바꾸지 않고 옛 참조의 쓰기 주소만 현재 슬롯을 가리키게 한다. 기존 NODE-051·394C-01의 모든 후보 원천 보존·재키·소멸 구분을 유지한다.

- 배열의 일반 slot 경로와 정적 splice는 잠복 메타데이터를 재키할 때 그 occurrence를 붙든 분리된 참조의 쓰기 주소 셀도 새 경로·문서 순서로 옮긴다. 참조의 고정된 공개 `path`는 바꾸지 않으며 값이 삭제된 뒤에도 마지막 쓰기 주소는 셀에 남는다. 보존 접두와 사라진 occurrence는 이동하지 않는다(NODE-044, VALUE-031, 446C-07 (가)).
- 정적 splice의 자격은 청사진 전체에 게이트·식이 없음을 요구하므로 살아남은 아이템 아래에 형상을 떠난 자손이 생길 수 없다. 이 결함의 분리된 자손 재키는 일반 slot 경로에서 시험하며 정적 자격을 강제로 넓히거나 불가능한 상태를 만들지 않는다(447라운드 코디네이터 결정, 446C-07 (가)).

- The template-less destination exception applies only to source capture for candidate-bearing moves; candidate-free and single-kind slots keep the existing early return and destination-registration conditions (NODE-051, 370라운드 원칙; 395C-01).

- A source slot that survives an insert/remove shift carries every candidate's latent raw and classification metadata, including the slot root at depth 0, to its destination even when the destination tuple blueprint recreates the live record or a candidate-bearing move targets a slot with no template (NODE-051/NODE-043 supplements, 41C-01, WRITE-036, 370라운드 원칙; 395C-01). Within this scope structural capture retains previously live and already-latent sources at every depth, including beneath arrays with a single immediate item template, before the collision-free rekey. In a move into an undeclared tail, live and already-latent candidate sources are captured before the address changes; a later destination-array exit in the same settlement preserves those sources under the existing ownership and exit policies (NODE-051/NODE-043 supplements, 41C-01, WRITE-036, 370라운드 원칙; 395C-01). The destination restores its own kind's stored source before composed replay. Widened destination registration first checks the host's candidate proof, then applies only when the source or destination slot templates have candidate descendants or multiple root candidates. An unrelated slot follows the base registration condition: reusable old records and source positions with no live old record. Their latent entries retain the base rekey order and classification metadata before any subsequent input distribution. Record perishing is distinct from source-slot destruction: rekey discards truly removed sources while moving survivors before new records consume input, and a removed old address must never prune a survivor moved onto it. True remove/pop/clear/shortening still destroy all sources in the disappearing slot (NODE-051/NODE-043 supplements, 41C-01, WRITE-036, 370라운드 원칙; 394C-01).
- A recreated surviving occurrence at every depth prefers its own kind's source only when its exact `(path, token)` is retained; otherwise the composed input keeps the ordinary interpretation. Candidate preservation checks every source-slot template independently of whether the source has a live record or the destination has candidates. Shared structural replay converts retained host channels to a complete public value before a terminal destination consumes them, interprets terminal raw values and valid null for branch destinations, and continues ordinary child and extras distribution after a branch restores its own source. Newly declared extras become children and former declared children can become extras. An inactive destination with no own-kind source receives its input while other kinds' keys and metadata remain untouched. The replay marker propagates through reconstruction and can reach newly inserted single-candidate objects under a candidate-bearing host. Candidate-free graphs perform no new source capture, lookup, traversal or per-call allocation. Per-slot checks reuse authored templates without a cache; structural replay visits only the moved source and destination input subtrees (NODE-051, NODE-043, 41C-01, WRITE-034, 370라운드 원칙; 394C-01).
- Final record disposal respects every destination processed by the structural rekey, including destinations whose candidates are inactive. Only candidate-bearing hosts retain the existing source-move array in a call-local map; no move list is copied or cached across settlements. Retained sources, metadata, declarations, rules and unrelated misfit paths at surviving addresses are not pruned again. The existing disposal walk clears moved misfit classifications of actual old occurrences, and actual gate exits clear departing occurrences and descendants in the existing detachment walk. True source destruction and final shortening retain their broad cleanup (NODE-051, NODE-043, WRITE-036, VALUE-037; 394C-01).

- 여러 fold 후보가 있는 배열의 구조 동사는 일반 정착 경로를 사용한다. 재사용은 목적지 후보와 청사진 객체 정체가 같을 때만 허용하고, 새 자리 입력은 게이트 선택까지 보존한다. 단일 후보의 push·pop·꼬리·splice 지름길 자격은 유지하며 스냅숏은 위치당 한 값이다(389C-03, 391C-01).

- 배열 구조 계획의 공유 구간이 같은 위치의 원본 슬롯이고 각 선언 아이템의 살아 있는 노드·청사진이 그대로이며 호스트에 통째 raw가 없으면 append·remove-last를 꼬리만 처리한다. append의 새 슬롯은 값 슬롯이어야 하며 비접두 이동·교체나 재생성이 필요한 접두는 기존 일반 경로이다. 접두의 raw·잠복·경로 저장소와 구조 맵 항목을 유지하며 새 꼬리만 만들고 제거 꼬리만 소멸시킨다. children과 밀도가 같은 로드 스냅숏은 별도 배열로 공표하여 이전 배달 기준과 호출자 입력을 수정하지 않는다. 게이트 제거·재등록, 이전 범위 밖 경로 정리, 소멸 읽기 포착, 변경 표시와 계산·전이·커밋·배달 순서는 유지한다. 비용은 접두 자격 검사·children/스냅숏 사본의 O(P), 새 노드·소멸 하위 트리·영향 저장소의 꼬리 작업이며 접두 raw 재합성·재배치 map/set·경로 move 할당을 제거한다. 게이트가 있으면 접두 하위 트리의 게이트 제거·재등록 O(접두 노드)는 일반 경로와 같이 남는다. 새 보유 캐시·노드/문맥 필드는 없고 임시 메모리는 공표 배열과 꼬리 작업량에 비례한다.
- 정적 배열의 단독 `push`와 꼬리 자리 N의 `insert(N, value)`는 행 계획을 만들기 전에 덧붙임 자격을 O(1)로 검사한다(G8). `insert(N)`의 계획은 push와 같은 꼬리 한 자리이므로 같은 자격과 같은 경로를 쓰고 push의 자격은 그대로이다. 자격은 모두 성립해야 한다: 동사가 `push`이거나 색인이 현재 아이템 수 N과 같은 `insert`이고 행이 기본 branch 배열 행의 `arrange`를 그대로 쓴다. 호스트가 활성이고 배달 초기화를 마쳤으며 떼어지지 않았고 배치·방문 표시 중이 아니다. 청사진 전체가 정적 첫 로드 증명(`StaticFirstLoadCapability`: 게이트·식·파생·감시·의존·상태 키·가상·union·터미널 호스트·리터럴이 아닌 기본값·제어 기본값·`unsetValue`·`injectTo`·재귀 확장 없음)을 가진다. 잠복 원본과 미공표 잠복 변경, 불일치 경로가 없다. 호스트에 통째 raw가 없으며, 아이템 템플릿이 있는 경우 extras 없이 새 자리 N이 튜플 자리 밖의 비가상 템플릿 자리이고 선언과 종류 충돌 없는 정적 유효 스키마가 있어야 한다. items와 prefixItems가 모두 없는 경우에는 빈 children과 길이 N의 extras만 허용하며 prefixItems 뒤의 extras 꼬리는 제외한다. 직전 `local`이 길이 N의 배열이고 템플릿이 있으면 children 수가 N이며 N이 0보다 크면 구조가 있고 직전 방출의 호스트 자리가 배열이고 `omitTrailing` 투영이 꺼져 있다. 하나라도 어긋나면 행 계획과 기존 일반 경로(접두 자격 검사와 꼬리 적용 또는 전체 계획)를 그대로 실행한다.
- 자격을 얻은 push는 새 자리 하나만 담은 꼬리 계획을 위치 N에서 적용하도록 꼬리 적용을 호출하여(꼬리 적용은 유지 접두 자리를 읽지 않는다) 칸 계획과 접두 자격 증명을 만들지 않고, 호출 한정 덧붙임 증명(호스트·N·템플릿이 있을 때의 새 자리 항목과 정적 유효 스키마·직전 `local`·공표된 children·공표된 스냅숏 루트·첫 합성 결과)을 정착 문맥의 선택 칸 `arrayAppend`에 둔다. 표시 뒤에는 자식 선택·출력 합성·스냅숏 정렬이 이 증명을 국소적으로 확인하고, 확인이 깨지면 같은 문맥에서 일반 선택·전체 합성·정렬로 이어 간다. push를 다시 적용하거나 이 함수에 다시 들어가지 않는다. 증명은 문맥과 함께 사라지며 노드·런타임·캐시에 남지 않는다.
- 자격을 얻은 정적 push에서 기존 아이템 수 N에 비례하는 작업은 수용된 사본 세 개뿐이다: 출력 합성의 직전 `local` 얕은 사본 하나(SETTLE-042, 63C-03), 이전 배달 기준으로 남는 children 배열의 얕은 사본 하나(아이템 없는 배열은 새 빈 children을 공표하고 대신 extras를 얕게 복사한다), WRITE-085의 로드 스냅숏 사본 하나. 스냅숏 사본은 유지 접두 길이로 미리 잡은 배열에 자리마다 대입하므로 성긴 자리와 짧은 원본의 빈 끝도 `undefined` 값으로 채워진 밀도 있는 배열이 되고, 요소마다 늘려 붙이는 재할당은 없다. 단, 새 아이템이나 그 하위가 전이 단계에서 기본값을 채우면 호스트가 같은 정착에서 다시 합성되어 첫 합성 결과의 얕은 사본(`assembleArray`의 N+1 패치)이 하나 더 생긴다. 일반 경로도 이 경우 N 크기 배열을 두 번 만들므로 회귀는 아니지만, 이 사본은 63C-03이 받은 한 번의 사본 밖이라 원장 관리자의 판단 전까지 수용된 사본으로 세지 않는다. 새 아이템 하위 트리의 생성·채움은 그 크기에 비례한다. 증명·계획의 메모리는 고정 크기이다.
- 정적 배열의 `pop()`과 마지막 자리의 `remove(N−1)`은 행 계획을 만들기 전에 끝 자르기 자격을 O(1)로 검사한다(G8 pop). `remove(N−1)`의 행 계획은 pop과 같다(앞 N−1 자리를 같은 위치에서 유지하고 N−1 자리의 값을 돌려준다). 그래서 둘은 같은 자격과 같은 경로를 쓰고, push·`insert(N)`의 덧붙임 자격은 바뀌지 않는다. 자격은 템플릿이 있는 push의 정적 자격과 같다: 기본 branch 배열 행, 활성, 배달 초기화를 마침, 떼어지지 않음, 배치·방문 표시 밖, 정적 첫 로드 증명, 잠복 원본·미공표 잠복 변경·불일치 경로 없음, 통째 raw·extras 없음, 아이템 템플릿 있음, 직전 `local`이 길이 N의 배열, children 수 N, 구조 있음, 직전 방출의 호스트 자리가 배열, `omitTrailing` 꺼짐. 여기에 N이 0보다 크고, 지울 자리 N−1이 튜플 자리 밖이며, 그 자리의 살아 있는 노드가 구조와 children의 끝에 같은 참조로 있어야 한다. push·pop 공통 정적 자격은 `utils/arraySlots/admitsStaticArrayTail.ts` 하나가 판정하고, 덧붙임 자격과 끝 자르기 자격은 그 위에 각자의 조건만 더한다. 하나라도 어긋나면 행 계획과 기존 일반 경로를 그대로 실행한다. 빈 배열의 pop은 행의 무동작 계획을 따라 오류·경고 없이 끝난다(35C-06). 근거: 371C-01(push·pop은 꼬리 연산이라 자리 하나의 비용이 목표, 355C-01을 옮긴 추론, 365라운드 소유자 결정 `architecture/reviews/round-365-owner-answers.md`).
- 자격을 얻은 pop은 빈 꼬리 계획을 위치 N−1에서 꼬리 적용으로 적용한다. 그래서 칸 계획(`copyArraySlots`)과 접두 자격 증명(`canApplyArrayTail`)을 만들지 않는다. 꼬리 적용은 지워진 노드 하나만 소멸시키며(그 하위 트리 크기에 비례), 떼어진 읽기 포착(NODE-044)·잠복 원본·경로 저장소 정리는 일반 경로와 같다. 호출 한정 끝 자르기 증명(호스트·N·직전 `local`·공표된 children·공표된 스냅숏 루트·첫 합성 결과)을 정착 문맥의 선택 칸 `arrayPop`에 둔다. 표시 뒤에는 자식 선택·출력 합성·스냅숏 정렬이 이 증명을 국소적으로 확인하고, 확인이 깨지면 같은 문맥에서 일반 선택·전체 합성·정렬로 이어 간다. pop을 다시 적용하거나 이 함수에 다시 들어가지 않는다. 증명은 문맥과 함께 사라지며 노드·런타임·캐시에 남지 않는다.
- 자격을 얻은 pop에서 N에 비례하는 작업은 수용된 사본 세 개뿐이다: 꼬리 적용의 children 얕은 사본(N−1), WRITE-085의 로드 스냅숏 사본(N−1), 출력 합성의 직전 `local` 앞 N−1 자리 사본(`slice(0, N−1)`). 셋은 push의 수용 사본(SETTLE-042, 63C-03, 371C-03)과 같은 성격이다. 제자리 변경은 배달 기준과 호출자 입력의 불변을 깨므로 하지 않는다. 비용 수용 범위는 push와 같이 기본값을 채우지 않는 수 아이템이다. 증명·계획의 메모리는 고정 크기이다.
- 일반 경로의 칸 적용은 결과를 쓰지 않는 호스트 전체 원본 트리 읽기(`readRawTree`)를 하지 않는다. 원본을 쓰는 곳은 extras 계산(아이템 템플릿이 없을 때), 통째 raw가 있는 호스트, 살아 있는 노드가 없는 지운 자리의 값, 재사용할 노드가 없는 원본 자리의 새 노드 값이다. 아이템 템플릿이 있고 튜플 자리·extras·통째 raw가 없으면 앞의 둘이 생기지 않으므로, 뒤의 둘이 실제로 필요해질 때만 칸 적용이 상태를 바꾸기 전에 한 번 읽는다. 그 밖에는 지금처럼 칸 계획을 훑기 전에 한 번 읽는다.
- 정적 배열의 가운데 `remove(i)`(0 ≤ i < N−1)와 `insert(i, value)`(0 ≤ i < N)는 행 계획을 만들기 전에 자르고 잇기 자격을 검사한다(G8 splice). 끝 자리의 `remove(N−1)`과 `insert(N)`은 지금처럼 끝 자르기·덧붙임 경로를 쓰며, 자르고 잇기 자격은 그 자리를 받지 않는다. 자격은 push·pop 공통 정적 자격(`admitsStaticArrayTail`)에 동사 조건을 더한다: 색인이 정수이고 위 범위 안이며 튜플 자리 밖이다. remove는 지울 자리의 살아 있는 노드가 구조와 children의 같은 자리에 같은 참조로 있어야 한다. insert는 자리 i가 비가상 템플릿 자리이고 선언이 있으며 정적 유효 스키마에 종류 충돌이 없어야 한다. 공통 자격은 고정 수의 읽기이다. 꼬리 확인(자리 i부터 N−1까지 구조와 children이 같은 참조를 같은 이름으로 가짐)은 꼬리 T = N − i에 비례한다. 하나라도 어긋나면 행 계획과 기존 일반 경로를 그대로 실행한다. 범위 밖 색인과 빈 배열은 행의 무동작 계획을 그대로 따른다(35C-06, insert의 [0, N] 규칙). 근거: 371C-01("remove와 insert는 꼬리를 다시 매긴다. T에 비례하는 비용은 준수이다. 안정 키는 두지 않는다", 355C-01과 365라운드 소유자 답 `architecture/reviews/round-365-owner-answers.md`).
- 자격을 얻은 호출은 자르고 잇기 적용(`applyArraySplice`)으로 꼬리만 다시 만든다. 접두 0..i−1의 노드·키·raw·로드 스냅숏 자리·구조 항목은 같은 참조로 남고 읽히지 않는다. 그래서 원본 트리 읽기(`readRawTree`), 칸 계획(`copyArraySlots`), 접두 자격 증명(`canApplyArrayTail`), 재배치 map/set을 만들지 않는다. remove는 자리 i의 노드 하나만 소멸시키고 i+1..N−1의 노드를 한 자리 앞으로 옮긴다. 소멸 처리(떼어진 읽기 포착 NODE-044, 경로 저장소 정리)는 일반 경로와 같다. insert는 자리 i에 새 노드를 만들고 i..N−1의 노드를 한 자리 뒤로 옮긴다. 옮긴 노드와 하위의 이름·경로 재게시(NODE-051), 경로 저장소 이동(`rekeyArrayRuntimePaths`에 i를 보존 접두로 넘김), 경로 변경 기록, 변경 노드 표시는 일반 경로와 같은 순서로 유지한다. 그래서 이름·경로가 바뀐 꼬리 노드마다 경로 갱신 배달이 하나씩 나간다. children과 로드 스냅숏은 새 배열로 공표하며, 둘은 수용 사본이다.
- 자르고 잇기 자격을 얻은 호출은 호출 한정 증명(호스트·N·i·insert의 새 자리 항목과 정적 유효 스키마·반환값 계획·공표된 children·적용이 남긴 경로 변경 수)을 정착 문맥의 선택 칸 `arraySplice`에 둔다. 자식 선택은 이 증명으로 "접두 그대로, 꼬리는 같은 노드가 한 자리 이동(insert는 자리 i에 새 노드)"을 꼬리 자리만 방문해 확인하면 선택을 재사용하고 꼬리 자리 i..(새 아이템 수−1)의 정적 선택만 다시 공표한다. 접두 항목은 다시 공표하지 않는다. 경로가 옮겨진 정착의 선택 재사용 거절에 대한 예외이며 근거는 settle DETAIL의 `settle-array-selection-reuse`이다(371C-03, 371C-01). 확인이 깨지면 증명을 무효로 하고 같은 문맥에서 일반 선택으로 이어 간다. 적용을 다시 하거나 이 함수에 다시 들어가지 않는다. 출력 합성과 스냅숏 정렬은 일반 경로 그대로이다. 증명은 문맥과 함께 사라지며 노드·런타임·캐시에 남지 않는다.
- 자르고 잇기 자격을 얻은 호출은 이름만 바뀐 꼬리 하위의 dirty·형상 dirty 표시와 그 재계산 등록을 하지 않는다. 자격이 청사진 전체에 게이트·식·파생·감시·상태 키·가상·`injectTo`가 없음을 증명하므로, 위치가 값이나 선택에 들어갈 길이 없다. 자격 밖의 일반 경로는 지금처럼 다시 계산한다. 어떤 식이 위치를 읽는지 따로 판정하는 검출기는 두지 않는다(BLUEPRINT-007).
- 자르고 잇기 경로의 자격·적용·재계산 등록·계산·자식 선택은 접두를 방문하지 않는다. 꼬리 T에 비례하는 작업은 꼬리 확인, 노드 이동·재게시·경로 저장소 이동, 꼬리 배달, 꼬리 선택 확인과 재공표이다. N에 비례하는 작업은 수용 사본 셋(children 사본, WRITE-085 로드 스냅숏 사본, 출력 합성의 값 배열)과 스냅숏 정렬이다. 노드 정체성을 위치가 아닌 안정 키로 바꾸는 일(NODE-051 변경)은 하지 않는다.
- 배열 `clear()`(G8 clear)는 행의 빈 칸 계획을 그대로 쓰며 통째 raw가 없으면 꼬리 적용(유지 접두 0, 새 길이 0)으로 모든 아이템을 소멸시킨다. 새 자격·증명·정착 문맥 칸은 없고 통째 raw가 있는 호스트는 지금처럼 일반 칸 적용을 쓴다. 바뀌는 것은 소멸 아이템마다 되풀이되던 같은 일의 비용뿐이다. 값·방출·키·소멸 집합·배달(종류·payload·순서)·비트별 revision·떼어진 읽기(NODE-044)·잠복 원본·경로 저장소 조회·로드 스냅숏은 그대로이다. SETTLE-001 단계 순서, NODE-051 위치 정체성, SETTLE-043 값 불변과 참조 되살림, BLUEPRINT-007 게이트 재평가, 공개 API는 바꾸지 않는다. 근거: 371C-04(370라운드 편집자 결정으로 clear를 L1b에서 다룸, `architecture/verification/perf-optimization/array-verbs-measurement.md`)과 364라운드 소유자 지시(모든 배열 동사).
- 새 길이가 0인 꼬리 적용(clear와 아이템이 하나뿐인 pop·`remove(0)`)은 경로 저장소를 자리마다 정리·재키하지 않고 호스트 접두로 한 번에 정리한다(`utils/rekey/clearArrayRuntimePaths.ts`). 잠복·메타데이터·선언·규칙·misfit 저장소는 호스트 아래 숫자 자리 색인(`PathStoreIndex.tail(host, 0)`)에 실제로 있는 자리만 방문하여 그 아래 항목을 모두 지운다. 결과는 소멸 아이템 경로의 `prunePerishedPaths`와 옛 자리 전부를 소멸로 넘긴 `rekeyArrayRuntimePaths`를 차례로 부른 것과 같다: 이전 범위 밖 자리의 정리, 살아 있던 아이템과 범위 밖 자리의 `inactiveValuesMemo` 정리, 옛 자리와 범위 밖 자리의 경고 제거, 살아 있는 노드가 없던 옛 자리에 잠복·메타데이터가 있었을 때의 `latentRawDirty` 표시, `misfitsMemo`(잠복이 더러우면 `inactiveValuesMemo`·`inactiveValueEntries`도)의 옛 자리 하위와 호스트 조상 정확 항목의 무효화가 같다. 경고 색인이 비어 있으면 자리별 경고 확인을 하지 않는다. 비용은 아이템 수 N이 아니라 지울 항목 수 × 깊이에 비례하며, 소멸 아이템 경로 집합은 살아 있던 아이템을 가리기 위해 그대로 만든다.
- 꼬리 적용의 소멸 아이템 떼어진 읽기 포착(NODE-044: 떼어진 노드는 마지막 커밋 형상을 읽는다)은 아이템 자신의 `defaultValue`를 자리마다 루트부터 경로를 다시 걷지 않고 꼬리 적용이 이미 읽은 호스트 로드 값에서 위치로 채운다. 아이템 경로가 호스트 경로 + `/` + 위치이고 떼어지지 않았을 때만 그렇게 하며, 그 값은 `getLoadValue(loadSnapshot, item.path)`와 같다(호스트 값이 객체가 아니면 `undefined`, 객체이면 위치 이름의 속성). 그 밖의 아이템과 자손은 지금처럼 경로로 읽는다. 나머지 읽기(오류, misfit, misfits, inactiveValues, visible·readOnly·disabled, 감시 값)는 그대로이다.
- 소멸 마감(`finalizePerished`)은 같은 런타임의 게이트 등록부를 노드마다 다시 찾지 않고 한 번 얻으며, 대기 나감이 없으면 노드마다 대기 나감을 훑지 않는다. 소멸 경로 정리(`prunePerishedPaths`)는 항목이 없는 저장소와 빈 경고 색인을 경로마다 조회하지 않는다. 소멸 아이템과 자손은 배달을 받지 않고 배달 기준·대기 배달·revision 대기를 비우며, clear의 배달은 호스트와 그 조상의 변경뿐이다. 배달 집합, 비트별 revision, 배달 순서는 같다(EVENT-001·007·024, 63C-02).

## API Contracts

- 진입점은 `arrangeFieldNodeItems(node, operation)`를 이름으로 내보낸다. 배치 밖 배열 진입은 write의 사슬 안에서 이 함수를 호출하여 행 계획을 적용하고 표시 → 계산 → 파생 → 전이 → 커밋을 동기적으로 한 번 돌린다.

## Acceptance Criteria

### settle-array-integration — 배열 소멸과 기록 저장소

- 오류 맵을 제거하기 전에 마지막 합쳐진 오류 읽기를 떼어진 노드의 약한 참조 읽기 묶음으로 보존한다. 비용은 소멸 노드당 배열 참조 하나이며, 배열 합치기는 기존 오류 읽기 메모를 재사용한다(NODE-044, 35C-09).

- 소멸 아이템과 자손은 전역 상태 셈·배달/감시·오류/대상 대기 저장소에서 제거된다. 경고 구조 키는 현재 경로를 따르고 기록 객체는 당시 경로를 유지한다. 값·계산 상태 변화가 없는 경로 사실도 아이템과 자손의 배달 후보가 된다. 같은 없는 대상을 겨눈 배열 아이템마다 출처 경로를 담은 오류를 하나씩 발생 순서대로 묶는다(35C-02·09, 43C-01, 58C-01, 59C-01).

### settle-array-prefix — 구조 계획의 접두 재사용

- append·remove-last·여러 꼬리 제거는 일반 경로와 값·방출·반환값·밀도 있는 스냅숏·노드/키/경로·배달·개정·소멸 관측이 같다.
- 선언 밖 extras, 짧거나 성긴 스냅숏, 잠복 원본·경고·규칙 원천/대상과 메모 정리는 일반 경로와 같다. 게이트가 접두 아이템을 없애거나 위치 청사진이 다른 경우와 비접두 이동은 일반 경로를 사용한다.
- 이전 children과 호출자 스냅숏은 수정하지 않으며 접두 raw를 재합성하지 않는다.

### settle-array-append — 정적 push의 덧붙임 경로

- 자격을 얻은 push는 덧붙임 자격을 거절한 일반 경로와 모든 공개 경계에서 같다: 반환 길이, 순서 있는 raw·local·emit(구멍·`undefined`·`NaN` 포함), 기존 자리의 노드·키·이름·경로·부모, 새 하위 트리의 즉시 생성, defaultValue·reset 원천, 이벤트의 종류·payload·순서와 비트별 revision. 실제로 덧붙임 경로에 들어갔는지도 확인한다.
- push 전에 잡아 둔 children·`local`·`emit`·로드 스냅숏은 push 뒤에도 내용이 그대로이다.

### settle-array-append-fallback — 덧붙임 자격의 거절 조건

- 게이트, 파생, 감시, 식, 배치, 방문, 떼어진 호스트, `omitTrailing`, 아직 선언된 튜플 자리·prefixItems 뒤의 템플릿 없는 꼬리, 터미널 배열, 잠복 원본, 불일치 경로, 잘못된 종류의 호스트 raw, 방출이 생략된 비루트 빈 배열마다 덧붙임 경로에 들어가지 않고 일반 경로가 실행되며 결과가 덧붙임 자격을 막은 비교 트리와 같음을 확인한다.

### settle-array-append-cost — 길이와 무관한 덧붙임 작업량

- N=1,000과 N=8,000에서 자격을 얻은 push의 접두 작업(`canApplyArrayTail`·`canReuseArrayChildren`·`reuseArrayChildren` 호출, 자리별 `getItemEntry`·`staticIds` 요청, `preserveReferences`의 원소 비교, `alignArraySnapshotSlots`의 자르기)이 N과 함께 늘지 않고, 기본값을 채우지 않는 수 아이템 push에서 N 크기 작업은 수용된 사본 세 개뿐임을 확인한다. 기본값을 채우는 객체 아이템 push의 두 번째 합성에서도 직전 커밋 되살림 확인이 N개 자식을 훑지 않는지 확인한다.

### settle-array-pop — 정적 pop의 끝 자르기 경로

- 자격을 얻은 pop과 `remove(N−1)`은 끝 자르기 자격을 거절한 일반 경로와 모든 공개 경계에서 같다: 반환값(지운 값), 순서 있는 local·emit, 남은 자리의 노드·키·이름·경로·부모, defaultValue, 이벤트의 종류·payload·순서와 revision, 지운 노드의 떼어진 읽기와 잠복 원본. 실제로 끝 자르기 경로에 들어갔는지도 확인한다. 값·방출·defaultValue는 앞 N−1 자리를 통째 쓴 결과와도 같다.
- pop 전에 잡아 둔 children·`local`·`emit`·로드 스냅숏은 pop 뒤에도 내용이 그대로이다. 빈 배열의 pop은 오류·경고 없는 무동작이다(35C-06).

### settle-array-pop-fallback — 끝 자르기 자격의 거절 조건

- 게이트, 식, 파생, 감시, 상태 키, 가상 자리, `injectTo`, 떼어진 호스트, 배치, 방문, 빈 배열, 튜플 자리, 템플릿 없는 자리, extras, 잠복 원본, 불일치 경로마다 끝 자르기 경로에 들어가지 않고 일반 경로가 실행되며 결과가 자격을 막은 비교 트리와 같음을 확인한다. 선택 시점의 증명이 깨지면(dirty 자식 등) 같은 정착에서 일반 선택·전체 합성·정렬로 이어 가며 결과가 같다.

### settle-array-pop-cost — 길이와 무관한 끝 자르기 작업량

- N=1,000과 N=8,000에서 자격을 얻은 pop과 `remove(N−1)`의 접두 작업(`copyArraySlots`·`canApplyArrayTail` 호출, `canReuseArrayChildren`·`reuseArrayChildren` 호출, 자리별 `getItemEntry`·`staticIds` 요청, `preserveReferences`의 원소 비교, `alignArraySnapshotSlots`의 정렬 호스트)이 N과 함께 늘지 않고, 수 아이템 pop에서 N 크기 작업은 수용된 사본 세 개뿐임을 확인한다.

### settle-array-splice — 정적 가운데 remove·insert의 자르고 잇기 경로

- 자격을 얻은 `remove(i)`와 `insert(i, v)`(i = 0, 1, N/2, N−2)는 자르고 잇기 자격을 거절한 일반 경로와 모든 공개 경계에서 같다: 반환값, raw·local·emit, 노드 정체성·키·이름·경로·부모, `defaultValue`, 이벤트의 종류·payload·순서, 비트별 revision, 지운 노드의 떼어진 읽기와 잠복 원본, 로드 스냅숏. NODE-051 정체성(접두는 같은 노드와 키, 꼬리는 같은 노드와 키에 이름·경로만 바뀜, insert의 새 키)을 명시적으로 확인한다. 실제로 자르고 잇기 경로에 들어갔는지와 그 호스트의 자식 선택이 재사용되었는지도 확인한다.
- 중첩 객체 아이템의 정적 폼은 꼬리 하위를 다시 계산하지 않아도 결과가 같다. 위치를 읽는 게이트, 식, 파생, 감시가 있는 폼은 일반 경로로 꼬리를 다시 계산한다.

### settle-array-splice-fallback — 자르고 잇기 자격의 거절 조건

- 게이트, 식, 파생, 감시, 상태 키, 가상 자리, `injectTo`, 떼어진 호스트, 배치, 방문, 튜플 자리, 템플릿 없는 자리와 extras, 잠복 원본, 불일치 경로, `omitTrailing`, 터미널 배열마다 자르고 잇기 경로에 들어가지 않고 일반 경로가 실행되며, 결과가 자격을 막은 비교 트리와 같음을 확인한다. 끝 자리의 `remove(N−1)`과 `insert(N)`은 끝 자르기·덧붙임 경로에 남는다. 꼬리 확인이 깨지면(구조와 children이 어긋난 꼬리 자리) 적용 전에 거절되어 일반 경로가 실행되며 결과가 같다. 선택 시점의 증명이 깨지면 같은 정착에서 일반 선택으로 이어 가며 결과가 같다.

### settle-array-splice-cost — 꼬리에만 비례하는 자르고 잇기 작업량

- N=1,000과 N=8,000에서 같은 꼬리 T의 자격을 얻은 remove·insert는 자격과 적용의 접두 작업(`readRawTree`·`canApplyArrayTail`·`applyArraySlots` 호출, 접두 자리의 `getItemEntry` 요청), 자식 선택의 접두 자리 `getItemEntry`·`staticIds` 요청, 재계산 등록, 계산 방문이 N과 함께 늘지 않고, 이름·경로 재게시는 T에만 비례하며, 수 아이템의 계산 방문은 T와도 무관함을 확인한다. 자격을 거절한 일반 경로의 아이템 템플릿 배열은 원본 트리를 읽지 않음을 확인한다.

### settle-array-clear — clear의 호스트 접두 정리와 위치별 읽기 채움

- clear는 호스트 접두 정리와 위치별 `defaultValue` 채움을 끈 직전 동작(소멸 경로 정리와 재키, 경로로 읽는 포착)과 모든 공개 경계에서 같다: 반환값, 값·방출·키, 이벤트의 종류·payload·순서, 비트별 revision, 지운 노드마다의 떼어진 읽기, 잠복 raw, 모든 경로 저장소의 항목과 경로 조회, 로드 스냅숏. 중첩 객체 아이템(자손), 게이트·식·파생·감시가 있는 폼, 잠복·misfit·경고·규칙이 호스트 아래에 있는 폼을 포함한다. clear의 배달 목록은 고정된 기대 목록과도 같다.

### settle-array-clear-cost — 아이템 수와 무관한 clear 정리 상수

- N=1,000과 N=8,000에서 clear의 재키 호출, 호스트 접두 정리의 경로 저장소 조회, 소멸 아이템 자신의 `getLoadValue`, 소멸 마감의 게이트 등록부 조회가 N과 함께 늘지 않음을 확인한다. N에 비례하는 경로 저장소 조회는 소멸 마감의 소멸 경로 정리가 항목이 있는 저장소(정적 수 배열에서는 하나)에서 소멸 아이템마다 하는 `under` 하나뿐임도 확인한다.

### settle-array-insert — 가운데 삽입과 경계

- `insert(i, v)`는 이동한 후보의 잠복 원본이 선택에 영향을 주지 않는 경우 같은 값을 새 배열로 통째 쓴 결과와 값·방출·`defaultValue`·배달된 경로가 같다. 이동한 자리의 새 종류에 잠복 원본이 있으면 구조 이동은 그 원본을 먼저 복원하지만, 통째 쓰기는 쓰기 범위의 잠복 원본을 먼저 지우므로 이 동치의 예외이다. NODE-051대로 i 앞 자리는 같은 노드와 키를 유지하고, i 자리는 새 키를 받으며, i 뒤 자리는 템플릿이 같으면 노드와 키를 유지한 채 이름과 경로가 바뀌고 다르면 새 기록을 만든다. 로드 스냅숏의 i 자리에 생성 값이 들어가고 호출자의 원래 스냅숏은 그대로이다(WRITE-085·099, NODE-043·051, 26C-13/14; 394C-01).
- 색인 0·가운데·N(push와 같은 결과와 덧붙임 경로), -1·N+1·1.5의 무동작과 현재 길이, 비배열 호스트의 0번 삽입과 1번 무동작, 터미널 배열의 사본 `splice`, 떼어진 호스트의 잠복 통째 쓰기를 확인한다. 위치를 읽는 게이트와 식은 밀린 꼬리에서 다시 평가된다(NODE-005·044·051, 35C-06, 47C-02, BLUEPRINT-007).

### settle-array-rekey — 경로 저장소 이동과 떼어진 배열 쓰기

- 새 아이템 진입 전에 옛 계획 밖 잠재 자리를 지우고 모든 경로 저장소와 살아 있는 아이템의 잠재 원본·게이트 등록을 충돌 없이 옮기는지 확인한다. pop한 참조의 잠재 쓰기·이미 점유된 경로의 무동작·떼어진 배열의 통째 잠재 쓰기와 예산 오류 하나 및 사용한 키의 비재사용을 확인한다(35C-02, NODE-051, NODE-044, 58C-01, GOAL-073).

## Last Updated

정돈-3 settle 재구성(2026-10-15)
