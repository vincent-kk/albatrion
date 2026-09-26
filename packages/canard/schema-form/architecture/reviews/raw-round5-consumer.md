# 5라운드 원문 — 소비자 관점: 앱 개발자와 최종 사용자 (D-1–D-10)

작성: 2026-09-22. 읽은 것: `HANDOFF.md` §2, `reviews/round-3.md` §4·§8, `reviews/round-4.md` §4·§5, `03-mental-model.md`, `04-inherited-constraints.md`, `reviews/raw-crosscheck-decisions-{codex,antigravity,claude}.md`, 공개 API(`src/components/Form/type.ts`, `src/core/types/value.ts`, `README.md`). 제품 코드는 읽기만 했다.

**이 문서는 권고하지 않는다.** 결정마다 (1) 이해 (2) 시나리오 — 선택지별로 개발자가 쓰는 것과 사용자가 보는 것 (3) 장단점 (4) 제안(가능성으로만) (5) 열린 질문을 적는다. 근거: `파일:줄`은 현재 코드(`src/` 아래, `BranchStrategy.ts`는 ObjectNode의 것), "실행:"은 기록에 남은 실행, "추론"은 이 검토의 판단이다. L1–L8은 claude 교차검증 D-1 표의 누출 경로다.

## 0. 공통

### 0.1 시나리오

| 약칭 | 앱 | 스키마 요지 |
| ---- | -- | ----------- |
| **CRUD** | 주문 수정 폼. 서버 레코드를 불러와 고치고 저장한다 | `title`, `status`(`default:'draft'`), `shipping`(`type:['object','null']` — `address`, `memo` `default:'문 앞'`). 레코드 A `{title:'A', status:'paid', shipping:{address:'서울', memo:'경비실'}}`, B `{title:'B', shipping:null}` |
| **마법사** | 3단계 작성. 앱이 단계 사이의 값을 스토어에 든다 | 2단계에 결제(`method` card/cash, `if card then {cardNo, installments default 1}`)와 배송(CRUD의 `shipping`). 결정마다 필요한 조각을 따로 적는다 |
| **JSON 편집기** | 객체 노드에 붙인 사용자 입력(Monaco 류). 텍스트를 고칠 때마다 객체 전체를 `onChange(obj)`로 넘긴다 | `config`: `host`, `port`(`default:80`), `tls`, `if tls then {cert}`. 현재 `{host:'a', port:8080, tls:true, cert:'C1'}` |
| **목록 편집기** | 서버가 테넌트·버전마다 아이템 스키마를 내려 주는 행 편집기. 앱은 스키마를 고칠 수 없다 | `lines: array`, 아이템 예 `{name, qty default 1}` |

### 0.2 현재 동작 — 이주 비용의 기준선

| 경로 | 현재 | 근거 |
| ---- | ---- | ---- |
| 생성 시 `defaultValue` | V에 없는 키(또는 `undefined`)에 스키마 `default` | `getChildNodeMap.ts:69-70`, `AbstractNode.ts:1197-1199` |
| `setValue(V)` | 기본 Overwrite. V에 없는 키는 없음이 되고 **default를 넣지 않는다** — `reason := undefined` 뒤 `setValue(getValue())`에서 `reason`(`default:'because'`)이 돌아오지 않는다 | `AbstractNode.ts:358`; 실행: `spikes/work-loop/redteam4/current-null.ts:25-26` |
| `FormHandle.reset()` | `version`을 올려 **현재 `defaultValue` prop**을 다시 복제하고 트리를 새로 만든다. prop만 바꾸면 반영되지 않는다 | `Form.tsx:84-94, 151, 186` |
| `setValue(null)` (nullable 객체) | 활성·비활성 분기의 자식 전부를 blank(스키마 default)로 | `BranchStrategy.ts:271-283`, `ObjectNode/DETAIL.md:19` |
| `setValue(undefined)` (객체) | 서브트리를 비우고 default를 복원하지 않는다 | `ObjectNode/DETAIL.md:21` |
| 입력 `onChange(v, option?)` | 기본 `Replace\|Propagate\|EmitChange\|PublishUpdateEvent` — 객체 입력은 그 노드를 통째로 교체, Refresh 없음. dirty는 여기서만 선다 | `SchemaNodeInput.tsx:49-57`, `SchemaNodeInput/type.ts:33-37` |
| 공개 쓰기 옵션 | `Merge`·`Overwrite`(소비자에게는 `SetValueOption`). 둘 다 Refresh 비트를 품는다. README에는 `SetValueOption`이 한 번도 나오지 않는다 | `value.ts:63-74`, `index.ts:45` |
| 루트 `onChange` | 취소·재예약 매크로태스크에서 `normalizedValue`를 한 번(OnChange 검증과 함께). 준비 시 한 번 더, 같은 참조는 거른다 | `AbstractNode.ts:1219-1223`, `afterMicrotask.ts:18-28`, `Form.tsx:103-108, 135-139` |
| `RequestRemount` | 공개 이벤트, 렌더러 래퍼의 `key`. README에 사용법이 없다 | `event.ts:94-95`, `SchemaNodeProxy.tsx:84, 89` |
| 빈 판별 union | 분기 없음(`oneOfIndex = -1`) | `ComputedPropertiesManager.ts:106`, `BranchStrategy.ts:735-739` |

### 0.3 앞선 교차검증과 다르게 읽은 곳

- **Form의 `reset()`은 현재 prop으로 간다.** claude 원문 D-1은 "`reset()`은 생성 시의 V(레코드 A)로 돌아가므로 레코드 B로 가는 수단이 아니다"라 했다. core `resetSubtree()`에는 맞지만 `FormHandle.reset()`은 현재 prop을 다시 읽는다(0.2). 새 설계의 `reset()`이 "생성 시 V"인지 "현재 prop"인지는 소비자에게 보이는 결정이다 — T-21은 리마운트를 유지한다고만 적었다.
- **"현재도 없는 키에만 default"는 생성 경로에만 맞다.** codex·claude 원문 D-5의 요약이다. `setValue` 경로는 오늘 default를 넣지 않는다(0.2). 그래서 "전체 교체 = 로드"는 `setValue`로 레코드를 불러오는 앱에 **동작 변화**이고, D-5 스위치와 D-7 수정자가 오늘 동작으로 돌아가는 이주 경로가 된다.
- **dirty 논쟁은 서로 다른 것을 말했다.** 폼의 dirty는 UI만 세운다(claude가 맞다). 그러나 준비 시 `onChange`가 주입된 값으로 불리므로(`Form.tsx:135-139`) `onChange`를 상태로 미러링해 로드 V와 비교하는 앱에서는 antigravity가 말한 "손대지 않았는데 저장 버튼이 켜짐"이 그대로 나타난다.

## D-1 #338 null 계약 — 미정 (3자 일치 권고: 유지)

**이해.** nullable 객체(`shipping`)가 `null`이 될 때 그 안의 자식 값(`address`, `memo`)을 지우는가, 숨겨 두는가의 문제다. **유지**는 `null`을 "키가 하나도 없는 전체 교체"로 보아 자식 원본을 지우고 빈 칸을 로드 계약의 `default`로 채운다(`03-mental-model.md` §3). **폐기**(E9)는 자식 원본을 남기고 방출만 `null`로 한다. 화면에서 부딪히는 곳은 둘이다 — "배송 안 받음"을 켰다 끄면 적었던 주소가 돌아오는가, 레코드 A 다음에 `shipping:null`인 레코드 B를 불러오면 A의 주소가 B 화면에 보이거나 B로 저장되는가.

| 시나리오 | 선택지 | 개발자가 쓰는 것 | 사용자가 보는 것 |
| -------- | ------ | ---------------- | ---------------- |
| CRUD: A → B 전환 | 유지 | `form.setValue(recordB)` 한 줄 | ① 주소 빈 칸, 메모 '문 앞' ② 주소에 '부산' → 저장의 `shipping`은 `{address:'부산', memo:'문 앞'}` |
| | 폐기 | `setValue(recordB)`로는 부족하다 — 중첩 `null` 아래 A의 원본은 루트 Overwrite로 지워지지 않는다(실행: L2). `<Form key={record.id}>` 또는 prop 갱신 + `reset()`으로 다시 만들어야 한다 | 규율이 빠지면 ① 주소 칸에 A의 '서울', 메모 '경비실'이 **보인다**(L8) ② '부산' 입력 → 저장 `shipping:{address:'부산', memo:'경비실'}` — A의 메모가 B로 저장된다 |
| 마법사: 2단계 "배송 안 받음" 토글 | 유지 | 토글 입력이 켤 때 `onChange(null)`. 되돌림을 원하면 입력이 직전 객체를 `useRef`에 두었다가 끌 때 `onChange(prev)` | 주소 '서울' → 켬 → 끔: 기억이 없으면 빈 칸·'문 앞', 기억하면 '서울'·'경비실' |
| | 폐기 | 끌 때 **부분 쓰기**로 객체를 만들어야 원본이 살아난다(`onChange({}, SetValueOption.Merge)` — 빈 Merge가 null 호스트를 객체로 만드는지는 명세에 없다). `onChange({})`(Overwrite)는 V에 키가 없어 유지와 똑같이 지운다(E9) | Merge로 끄면 '서울'·'경비실', Overwrite로 끄면 빈 칸·'문 앞' |
| JSON 편집기(`shipping`에 붙임): 텍스트를 지워 `null` → `{"address":"부산"}` 붙여넣기 | 유지·폐기 | 둘 다 없음 | 같다 — 편집기는 객체 전체를 넘기므로 숨은 원본이 끼어들지 않는다. V에 없는 `memo`의 처리는 D-4 열린 질문 1에 달린다. 차이는 `null`인 동안 `findNode('/shipping/address').value`를 읽는 코드뿐이다(L1) |

| 선택지 | 개발자 | 사용자 | 이주 비용 |
| ------ | ------ | ------ | --------- |
| 유지 | 레코드 전환이 `setValue(record)` 하나로 안전하다(중첩 `null` 포함). 되돌리는 토글은 입력이 직접 기억한다 | 실수로 누른 `null`에 입력을 잃는다. 다른 레코드의 값을 보거나 저장하는 일은 없다 | 없음 — 오늘도 `null`이면 모든 분기의 자식을 blank로 되돌린다(`BranchStrategy.ts:271-283`, `ObjectNode/DETAIL.md:19`). 내부 장치(`__blank__` 등)만 사라진다 |
| 폐기 | 레코드 전환마다 리마운트 규율이 필요하고, 잊어도 에러가 없다. 토글 입력은 "끌 때 부분 쓰기"를 알아야 한다 | 부분 쓰기 토글이면 값이 돌아온다. 규율이 깨진 앱에서는 이전 레코드의 값이 칸에 보이고 첫 입력에 저장 값으로 섞인다 | 동작 변화 — S4 문장과 nullable 계약 테스트 24–25개가 뒤집힌다(실행: claude). 릴리스 노트에 "레코드 전환은 리마운트" |

**제안(가능성).**
- 유지 쪽: "되돌릴 수 있는 null 토글"(직전 객체 기억 → Overwrite로 재쓰기)을 기본 입력 예제로 문서에 둔다.
- 출처 기반 혼합: F7이 쓰기에 출처 노드를 싣기로 했으므로 "그 노드 자신의 입력이 쓴 `null`은 자식 원본을 잠복으로 남기고(F26 `latent(path)`로 열람), 호출자의 전체 교체가 만든 `null`은 지운다"는 규칙도 가능하다. 레코드 전환 누출(L2)은 닫히고 토글 되돌림은 core가 맡는다. 대가는 같은 `null`이 출처에 따라 다르다는 것 — P2의 "null은 전체 교체" 한 문장이 둘로 갈린다.
- 어느 쪽이든 문서 한 줄: "`null`은 '이 객체는 없다'이다. 값을 숨기기만 하려면 `&active`."

**열린 질문.**
1. 객체 호스트에 `setValue(undefined)`는 무엇인가. 오늘은 default 없이 비운다(`ObjectNode/DETAIL.md:21`, 배열은 `README.md:1484`). "전체 교체 → (i) 주입"을 따르면 `null`과 같이 default가 찬다.
2. 비nullable 객체에 `null`: 오늘 `{}`(`ObjectNode/DETAIL.md:22` S7), 3.1판은 보존·type 에러(F27). 사용자에게 "빈 양식"이 "에러"로 바뀐다.
3. "껐다 켜면 돌아오기"를 원한 사용자 요구가 실제로 있는가 — #338은 없다고 정했다.

## D-2 조각 활성 계산 — 미정 (3자 일치 권고: 비단조 + 상한)

**이해.** 조건부 섹션끼리 서로의 조건을 바꿀 때 폼이 어떤 섹션을 보일지 정하는 규칙이다. **B**(비단조 + 상한)는 조건을 다시 평가해 거짓이면 끄고, 스키마가 자기모순이면 상한(조각 수 + 1)에서 멈춰 `settle.status = 'budget-exceeded'`를 남긴다(개발 모드는 커밋 뒤 동기 throw). **A**(단조)는 한 번 켠 섹션을 그 정착 안에서 끄지 않으므로 반드시 끝나지만 `then`과 `else`가 함께 켜질 수 있다. 부딪히는 화면은 부정 조건(`not`, `else`)이 있는 단계와 앱이 고칠 수 없는 서버 스키마다.

예 스키마(마법사 2단계, codex 실행 `raw-codex3-workloop.md` §A3 step 4와 같은 모양): `allOf: [{if:{not:{required:['bizNo']}}, then:{properties:{consent:{type:'string', default:'Y'}}}}, {if:{properties:{isCorp:{const:true}}, required:['isCorp']}, then:{properties:{bizNo:{type:'string', default:'000-00-00000'}}}}]` — 개인이면 동의 항목, 법인이면 사업자번호.

| 시나리오 | 선택지 | 개발자가 쓰는 것 | 사용자가 보는 것 |
| -------- | ------ | ---------------- | ---------------- |
| 마법사: 1단계에서 "법인" 체크 | B | 없음 | 2단계에 사업자번호 '000-00-00000'만. 저장 `{isCorp:true, bizNo:'000-00-00000'}`(동의 'Y'는 잠복) |
| | A | 부정 가드를 피하도록 스키마를 `if isCorp then … else consent`로 고쳐 쓰거나 `unevaluatedProperties:false`로 어긋남을 드러낸다 | 사업자번호와 "개인 고객 동의 Y"가 **함께** 보이고 저장 `{isCorp:true, consent:'Y', bizNo:'…'}` — 열린 스키마면 에러 없이 서버로 간다(실행: codex, 둘 다 valid). 다음 키 입력에서 동의 칸이 사라질 수 있다(추론: 출발점 고정) |
| 목록 편집기: 서버가 자기모순 규칙 `if:{not:{required:['x']}}, then:{properties:{x:{default:1}}, required:['x']}`을 내려 보냄 | B | 개발 모드: 커밋 뒤 동기 throw로 발견. 프로덕션: `settle` 상태나 진단 통지(이름 미정)를 수집기로 보내는 코드 | 결과가 상한의 홀짝에 달린다(실행: codex — cap 2 `{}` invalid, cap 3 `{x:1}` valid). `{}`이면 "x 필수" 에러는 뜨는데 x 칸이 없어 **제출할 수 없다**(추론). 키 입력마다 같은 결과 |
| | A | 없음 | `{x:1}`, valid(실행: codex) |
| CRUD: 법인 레코드 `{isCorp:true, bizNo:'123'}` 편집 | A·B | 없음 | 로드 직후는 같다 — 출발점 고정이라 첫 바퀴에 로드된 `bizNo`가 보인다. 편집 중 "법인"을 끄고 켜면 마법사 행과 같다 |

| 선택지 | 개발자 | 사용자 | 이주 비용 |
| ------ | ------ | ------ | --------- |
| B | 섹션이 검증기의 판정과 같다. 새 공개 표면(`settle`, 진단 통지)을 배우고, 서버 스키마를 받는 앱은 진단을 수집해야 한다 | 맞는 섹션만 본다. 모순 스키마에서는 임의지만 매번 같은 화면 — 드물게 고칠 수 없는 에러 | 오늘은 `then.properties`와 `not`을 읽지 않는다(`flattenConditions.ts:44-61`) — 오늘 안 보이던 조건부 필드가 새로 나타나고 모순 스키마가 새로 진단된다. 오늘 이 스키마들은 루프 없이 `{}`(실행: claude) |
| A | 종료가 구조로 보장되고 진단이 필요 없다. 대신 "부정 가드를 쓰지 말라"는 작성 규칙이 필요하고 서버 스키마에는 강제할 수 없다 | 무관한 섹션이 함께 보이고 그 default가 조용히 저장된다 | 위와 같다 |

**제안(가능성).**
- 청사진 단계의 정적 검사: 가드 의존에 부정을 포함한 순환(F3의 부류)이 있으면 스키마를 받는 시점에 개발 모드 경고 — 서버 주도 앱이 런타임 전에 안다.
- 공개 모양 후보: `FormHandle.getSettleStatus()`, Form 속성 `onDiagnostic?(d: {status, path, kind: 'fragment' | 'derive'})`, 공개 이벤트 `UpdateSettle`. 검증 에러(`onValidate`)에 섞지 않는다는 것을 문서에 적는다.
- 상한 초과 시 단조 규칙으로 한 번 더 돌려 고정(claude 완화책) — 홀짝 의존과 "칸 없는 필수 에러"가 사라지는지 실행으로 확인할 수 있다.

**열린 질문.**
1. `budget-exceeded`인 폼의 제출을 막는가, 알리기만 하는가.
2. 진단의 청중은 개발자(수집기)인가 최종 사용자(배너)인가.
3. "지원 범위 밖" 스키마를 서버가 내려 보낼 때 누가 고치는가 — 서버 팀에 알리는 경로가 있는가.

## D-3 금지 조각 — 미정 (3자 일치 권고: 읽지 않는다. 2라운드 발언과 반대 방향)

**이해.** 서버 스키마가 "이 조건에서는 X가 있으면 안 된다"(`then:{properties:{cardNo:false}}`, `not:{required:['cardNo']}`)라고 말할 때 폼이 무엇을 하느냐다. (i) 비활성화처럼 숨기고 방출에서 뺀다, (ii) 폼이 금지를 읽어 칸을 보이고 에러를 붙인다, (iii) 폼은 금지를 읽지 않고 검증기의 에러가 떨어지는 대로 보인다(숨김은 작성자가 `&active`로 명시). 부딪히는 화면: 결제 수단을 카드→현금으로 바꿨을 때의 카드번호 칸, 규칙을 어긴 옛 레코드를 열었을 때.

스키마: `properties:{method:{enum:['card','cash']}, cardNo:{type:'string'}}`, `if:{properties:{method:{const:'cash'}}}, then:{properties:{cardNo:false}}`.

| 시나리오 | 선택지 | 개발자가 쓰는 것 | 사용자가 보는 것 |
| -------- | ------ | ---------------- | ---------------- |
| 마법사: 카드 선택 → 카드번호 '1234-5678' → 이전 단계에서 현금으로 | (i) | 없음 | 카드번호 칸이 사라지고 저장 `{method:'cash'}`. 다시 카드로 바꾸면 '1234-5678'이 돌아온다 |
| | (ii) | 없음(core가 금지를 읽고 문구를 붙인다) | 칸이 남고 "현금 결제에서는 입력할 수 없습니다" 류 에러. 비워야 제출된다 |
| | (iii) | 숨기려면 `cardNo`에 `&active: "../method !== 'cash'"`를 직접 단다. 문구는 `formatError`로 `false schema`를 번역 | 그대로면 칸이 남고 `/cardNo`에 "boolean schema is false"(원문), 호스트에 `must match "then" schema`. 비우면 풀린다 |
| CRUD: 규칙을 어긴 옛 레코드 `{method:'cash', cardNo:'1234'}`를 열어 손대지 않고 저장 | (i) | 없음 | 저장 `{method:'cash'}` — 서버가 거부하려던 레코드를 폼이 조용히 고친다. 배타 쌍(`a`면 `b:false`, `b`면 `a:false`)에서는 두 값이 모두 사라지고 두 칸이 숨어 풀 수 없다(실행: `crosscheck-claude-d3-mutex.mjs`) |
| | (ii)·(iii) | 없음 | 카드번호에 에러, 제출이 막힌다. 비우면 통과. `not:{required}` 형이면 (iii)의 에러는 호스트에 "must NOT be valid"로 떨어져 어느 칸인지 모른다(실행: codex·claude ajv) |
| 목록 편집기: 서버가 `x`를 `then` 안에서만 `false`로 선언(다른 곳에 타입 없음), 행 `{mode:'ban', x:'secret'}` | (i) | 없음 | x가 보이지 않고 저장에서 사라진다 |
| | (ii) | x를 보일 입력 종류가 없다 — core나 렌더 계층이 특수 입력(원문 편집 등)을 정해야 한다 | 그 입력에 따라 다르다 |
| | (iii) | 잔여 목록(A8 `residual`, `removeKey(path)`)을 보이는 UI | "허용되지 않는 항목: x = 'secret' [삭제]". UI가 없으면 제출만 막히고 이유가 안 보인다(실행: claude `ban-false-undeclared-*`). mode를 ban으로 바꾸는 것만으로도 생긴다 |

| 선택지 | 개발자 | 사용자 | 이주 비용 |
| ------ | ------ | ------ | --------- |
| (i) | BE 스키마 그대로 숨김이 된다. core에 특칙 셋(E5 (2), E8, 단일 이름)이 남아 동작을 예측하기 어렵다 | 에러를 보지 않지만 옛 값이 조용히 사라지고, 배타 쌍에서는 막힌다 | 동작 변화 — 오늘 조건부 금지는 읽히지 않는다(`flattenConditions.ts:44-61`) |
| (ii) | 친절한 필드 에러를 core가 준다. 대신 금지를 읽는 규칙과 `not` 에러 라우팅이 core에 들어간다 | 무엇을 지울지 안다. 타입 없는 x는 여전히 문제다 | 새 기능. 에러 위치가 오늘과 다르다 |
| (iii) | core에 새 개념이 없다. 숨김은 `&active`, 문구는 `formatError`, 잔여 목록 UI가 전제다 | 문구 매핑이 없으면 원문 에러이거나 호스트에 떨어진 에러를 본다 | 오늘의 조건부 금지와 같다. 다만 최상위 `properties:{x:false}`는 오늘 생성 시 throw(`schemaNodeFactory.ts:116`)이므로 새로 동작하는 폼이 된다 |

**제안(가능성).**
- (iii) + 표시 규칙: 단일 이름 `not.required`의 에러를 그 자식으로 옮기고 기본 문구를 "이 조건에서는 비워야 합니다"로(Q12). 형상이 아니라 표시 규칙이다.
- `formatError`의 기본 번역에 `false schema`를 넣는다.
- (i)의 UX가 필요한 작성자를 위한 코드모드: `then:{properties:{x:false}}` → x에 `&active` 부착(작성자의 명시적 선택으로 바꾼다).
- (i)을 고른다면 안전장치: 로드 시 금지 때문에 빠진 키를 알리는 통지 — 앱이 "이 레코드에서 cardNo가 제거됩니다"를 보일 수 있다.

**열린 질문.**
1. 2라운드 발언 "field가 가려지면서 값을 빼내는 것"은 작성자의 `&active`를 가리켰는가, 표준 `false`까지인가.
2. 실제 BE 계약에서 `x:false`는 거부용인가 숨김용인가 — 서버 팀에 확인할 수 있는가.
3. 잔여 목록 UI는 기본 렌더러가 제공하는가, 앱이 만드는가.

## D-4 쓰기 종류 — 미정 (3자 일치 권고: `Overwrite`(기본)·`Merge`, Refresh는 core)

**이해.** 앱이나 입력이 객체를 쓸 때 "이것이 전부다, 말하지 않은 키는 지워라"(Overwrite)인가 "말한 키만 바꿔라"(Merge)인가, 그리고 비제어 입력이 값을 다시 읽는(리마운트) 시점을 누가 정하는가. (a) 공개는 `Overwrite`(기본)·`Merge`, 재읽기는 core가 쓰기의 출처로 판단(F7). (b) `Refresh`도 공개해 호출자가 고른다. (c) (a)와 같되 기본을 `Merge`로. 부딪히는 화면: JSON 편집기에서 키를 지울 때, 서버가 일부 필드만 돌려줄 때, 행 입력이 행 객체를 넘길 때.

| 시나리오 | 선택지 | 개발자가 쓰는 것 | 사용자가 보는 것 |
| -------- | ------ | ---------------- | ---------------- |
| JSON 편집기: `"port": 8080` 줄을 지움 → 입력이 `onChange({host:'a', tls:true, cert:'C1'})` | (a) | 없음(입력의 `onChange`는 그 노드의 Overwrite) | port가 없음이 된다. 입력 쓰기에 (i) 주입이 적용되면 `port:80`이 즉시 다시 차 편집기에 `"port": 80`이 되살아나고 **지울 수 없다**. 적용되지 않으면 `{host:'a', tls:true, cert:'C1'}`(오늘과 같다). 자기 쓰기라면 재읽기 없음 — 캐럿·undo 유지 |
| | (b) | 입력 작성자가 Refresh를 빼야 한다. 오늘의 preset `SetValueOption.Overwrite`를 넘기면 Refresh가 들어 있어(`value.ts:63-65`) 입력이 자기를 리마운트한다(코드 읽기) | 실수하면 키마다 캐럿이 끝으로 가고 undo가 사라진다 |
| | (c) | 키를 지우려면 입력이 `Overwrite`를 명시 | 명시하지 않으면 `"port": 8080`이 되돌아온다. 비활성 `cert`도 남는다 |
| CRUD: "결제 완료" 뒤 서버가 `{status:'paid'}`만 돌려줌 | (a) | `form.setValue(res, SetValueOption.Merge)` | Merge를 잊으면 `title`·`shipping`이 없음이 되고 default만 남는다 — 입력하던 제목이 사라진다 |
| | (b) | `Merge \| Refresh`처럼 재읽기까지 골라야 한다 | Refresh를 잊으면 비제어 상태 선택기가 옛 'draft'를 보인다 |
| | (c) | `form.setValue(res)`로 충분. 대신 레코드 전환은 `Overwrite`를 명시 | 전환에서 잊으면 B에 없는 A의 키가 남는다(D-1 누출과 같은 모양) |
| 목록 편집기: 행 입력이 `{name:'너트', qty:5}` 행에 `onChange({name:'볼트'})` | (a)·(b) | qty를 지키려면 행 입력이 `Merge` | Merge가 없으면 qty 5가 사라진다((i) 적용 시 default 1) |
| | (c) | 없음 | `{name:'볼트', qty:5}` |

| 선택지 | 개발자 | 사용자 | 이주 비용 |
| ------ | ------ | ------ | --------- |
| (a) | 고를 것이 둘이다(오늘 공개와 같다, `value.ts:69-74`). 재읽기를 신경 쓰지 않는다. `Merge` 누락이 흔한 실수이고 조용한 손실이다 | 타이핑 중 리마운트 없음(T-2), 호출자 쓰기 뒤 비제어 입력이 새 값을 읽는다 | 기본 Overwrite(`AbstractNode.ts:358`), 입력 기본 교체(`SchemaNodeInput/type.ts:33-37`)와 같다. 내부 비트 10개와 `UnionSetValueOption` 타입 누출이 사라진다 |
| (b) | 재읽기를 직접 통제한다. 누락·과잉의 책임도 진다 | 개발자 실수에 따라 stale 화면이나 캐럿 소실 | 오늘 preset이 모두 Refresh를 품으므로 기본 동작을 지키려면 preset에 Refresh를 넣어야 한다 |
| (c) | 부분 패치가 짧다. 전환·삭제·JSON 편집기에는 Overwrite를 명시한다 | 형제가 실수로 지워지지 않는다. 대신 지운 키가 돌아오고 이전 레코드 키가 남는다 | 기본값 반전 — 조용한 동작 변화. 모든 `setValue(record)` 호출 점검 |

**제안(가능성).**
- 입력 컴포넌트 계약을 문서로 고정: "`onChange(value)`는 그 노드 전체의 Overwrite, 패치형 입력은 `onChange(patch, SetValueOption.Merge)`". 입력 쓰기가 로드인지(열린 질문 1)도 같은 자리에 적는다.
- 개발 모드 경고: 루트 Overwrite가 dirty인 필드를 없음으로 만들면 한 번 경고 — `Merge` 누락 탐지.
- README에 "어떤 쓰기가 무엇을 지우는가" 표. 강제 재읽기가 필요한 드문 경우의 탈출구는 D-9 `RequestRemount`로 안내한다.

**열린 질문.**
1. 입력이 넘긴 객체 전체 쓰기는 "로드"인가 — (i) 주입이 일어나는가. A2는 "(i) 전체 교체 직후"라 하고 F25는 "사용자 입력이 일으킨 정착은 로드가 아니다"라 한다. JSON 편집기에서 default 있는 키를 지울 수 있는지가 이것에 달린다.
2. F7의 "그 노드 자신의 입력에서 온 **부분 쓰기**는 Refresh를 내지 않는다"에 객체 입력의 전체 교체도 드는가. 들지 않으면 JSON 편집기가 키마다 자기를 리마운트한다.
3. `Merge`는 중첩 객체에서 깊은 병합인가 — 오늘은 같은 옵션이 자식으로 전파되므로(`BranchStrategy.ts:273-274`) 깊은 병합으로 읽힌다(미실행).
4. 배열에서 `Merge` ≡ `Overwrite`(A2 미결)를 공개 문서에 그대로 쓰는가.

## D-5 로드 시 default 스위치 — 방향 확정(뜻 "초기값 조작 비활성화", `disable…` 형태), 범위 미정

**이해.** 폼이 값을 받을 때(생성 시 `defaultValue`, `reset()`, `setValue(V)`) V에 없는 키를 스키마 `default`로 채우는가. 기본은 채우고 Form 속성 하나로 끈다(소유자 방향, (a)). 비교를 위해 (b) 스위치 없음(항상 채움), (c) 로드는 채우지 않음이 기본(빈 폼만 채움)을 함께 적는다. 부딪히는 화면: 서버가 일부러 비워 둔 필드가 편집 화면에 default로 보이고, 손대지 않은 저장에서 서버로 가는 것.

| 시나리오 | 선택지 | 개발자가 쓰는 것 | 사용자가 보는 것 |
| -------- | ------ | ---------------- | ---------------- |
| CRUD: 서버가 상태를 계산해 비워 둔 레코드 `{id:7, title:'B'}` 편집 | (a) 끔 | `<Form defaultValue={record}>` 또는 마운트 뒤 `form.setValue(record)` | 상태 칸 'draft'. 손대지 않고 저장 → `{id:7, title:'B', status:'draft'}` — 서버의 계산 상태를 덮는다. `setValue` 경로는 오늘 빈 칸이었다(동작 변화) |
| | (a) 켬·(c) | (a) `<Form disableDefaultInjection defaultValue={record}>` / (c) 없음 | 상태 칸 빈 칸. 저장 `{id:7, title:'B'}` |
| | (b) | 저장 전에 로드 V와 `getValue()`를 비교해 default로 생긴 키를 직접 빼거나, 스키마에서 `default`를 지운다(새 폼에도 영향) | (a) 끔과 같다 |
| 마법사: 생성·편집 공용 폼 컴포넌트로 새 주문을 `defaultValue={{title:''}}`로 시작 | (a) 켬·(c) | 새 폼에는 `defaultValue`를 주지 않는다는 규율 | `defaultValue` 없이 시작하면 'draft'가 들어가지만(빈 폼은 로드가 아니다) `{{title:''}}`로 시작하면 **하나도 안 들어간다** — 같은 화면이 prop 모양에 따라 달라진다 |
| | (a) 끔·(b) | 없음 | 두 경우 모두 'draft' |
| 목록 편집기: 서버가 아이템 스키마에 `priority`(`default:'normal'`)를 새로 추가. 옛 행에는 없다. 행 하나만 고쳐 문서 전체를 저장 | (a) 끔·(b) | 없음 | 모든 행에 `priority:'normal'`이 채워져 저장 — 감사 로그에 손대지 않은 행의 변경 |
| | (a) 켬·(c) | 없음 | 옛 행은 없는 채로 저장. `push()`로 추가한 새 행이 default를 받는지는 열린 질문 2 |

| 선택지 | 개발자 | 사용자 | 이주 비용 |
| ------ | ------ | ------ | --------- |
| (a) | 편집 폼은 속성 하나로 왕복 보존, 새 폼은 `defaultValue`를 주지 않는 규율 | 켜면 서버에 없는 값을 편집 화면에서 보지 않는다. 새 폼은 default를 본다 | 생성·`reset()` 경로는 오늘과 같다(`getChildNodeMap.ts:69-70`, `Form.tsx:94, 151`). **`setValue(record)`는 새로 주입한다** — 오늘은 주입하지 않는다(실행: `current-null.ts:25-26`). 오늘 동작은 스위치나 D-7 수정자로 |
| (b) | 규칙은 하나지만 왕복 보존이 앱 코드가 된다 | 편집 화면에 default가 보이고 저장된다 | `setValue` 경로의 새 주입은 (a)와 같다 |
| (c) | 편집 폼은 아무것도 안 써도 보존. 새 폼에서 `defaultValue`를 주면 default가 사라진다 | 새 폼의 default가 prop 유무에 달린다 | 생성 경로 반전 — `BranchStrategy.composition.defaultValue.test.ts:40`, `default-value.render.test.tsx:417`이 뒤집힌다(claude) |

폼의 dirty는 어느 선택지에서도 바뀌지 않는다(UI만 세운다, `SchemaNodeInput.tsx:55-56`). 앱이 체감하는 것은 준비 시 `onChange`가 주입된 값으로 한 번 불리는 것(`Form.tsx:135-139`)과 저장되는 키 집합이다.

**제안(가능성).**
- 이름 후보(`disable…`): `disableDefaultInjection`(현 후보, 기록의 용어 "default 주입"과 같다), `disableLoadDefaults`, `disableDefaultsOnLoad`(범위가 이름에 드러난다), `disableDefaultFill`. 어느 것이든 JSDoc에 "로드"를 정의한다 — 생성 시 `defaultValue`, `reset()`, `setValue(V, Overwrite)`, `null`로의 교체와 그 정착 안의 전이. 빈 폼은 아니다.
- D-7 수정자와 같은 어근이면 문서 한 줄로 설명된다(`disableDefaultInjection` ↔ `SetValueOption.DisableDefaultInjection`류).
- README 첫 예제를 "새 폼"과 "편집 폼" 두 레시피로. 스위치가 켜져 있고 `defaultValue`가 `{}`이면 개발 모드에서 "default가 하나도 들어가지 않습니다" 경고.

**열린 질문.**
1. 스위치가 켜진 폼에서 특정 호출만 default를 받게 하는 반대 방향 수정자가 필요한가(템플릿에서 새로 만들기).
2. `push()`·`push({})`로 만든 새 아이템은 로드인가.
3. V에 없는 중첩 호스트가 자식 default로 객체가 되어 방출되는가(`shipping:{memo:'문 앞'}`) — `round-4.md` §3.4에서 "현재와 같다"는 미확인이다.
4. `required`이면서 default가 있는 필드가 스위치 때문에 빈 채 로드되면 에러를 언제 보이는가(`showError` 정책).

## D-6 `virtual` — 미정 (3자 일치 권고: (a) `&` 계열 + 참조 그룹, 튜플은 읽기 전용 파생)

**이해.** 두 필드(`startDate`, `endDate`)를 입력 하나(기간 선택기)로 다루는 묶음을 어디에 적느냐다. 오늘은 `virtual:{period:{fields:['startDate','endDate'], FormTypeInput}}`와 `required:['period']`를 쓰고, React `Form`의 전처리가 `required`의 `period`를 두 필드로 펼친다(`processVirtualSchema.ts:13-29`, `Form.tsx:91`) — 검증기가 받는 표준 `required`를 폼이 바꾸는 유일한 곳이다. (a) `&virtual` + core의 값 없는 그룹 노드, (b) core에서 빼고 렌더 계층의 묶음 컴포넌트, (c) 현행 유지. 최종 사용자의 화면은 세 선택지에서 같다(바인딩이 있으면). 차이는 개발자의 스키마와 API다.

| 시나리오 | 선택지 | 개발자가 쓰는 것 | 사용자가 보는 것 |
| -------- | ------ | ---------------- | ---------------- |
| CRUD: 레코드 `{startDate:'2026-01-01', endDate:'2026-01-31'}` | (a) | `'&virtual':{period:{fields:['startDate','endDate']}}`, `required:['startDate','endDate']`. 입력은 `value` `['2026-01-01','2026-01-31']`(읽기 전용 파생)을 받고 `onChange([s, e])`가 두 필드로 나뉜다. `findNode('/period')` 유지 | 기간 선택기 하나, 저장 `{startDate, endDate}` |
| | (b) | 스키마에 묶음이 없다. 레이아웃에서 두 경로를 묶는 바인딩(가칭 `<Group paths={['/startDate','/endDate']}>`). `findNode('/period')`·묶음 `setValue`가 없다 | 같다 |
| | (c) | 오늘 그대로 | 같다. 다만 React `Form` 밖(core 단독)에서는 `required:['period']`가 펼쳐지지 않아 항상 실패한다(추론, claude) |
| 마법사: "기간 지정"일 때만 필수 — `then.required:['period']` | (a)·(b) | `then.required:['startDate','endDate']`로 풀어 쓴다(코드모드 가능) | 에러가 실제 필드 경로에 붙는다 |
| | (c) | 그대로 — 전처리가 `then.required`도 펼친다(`transformCondition.ts:31-49`) | 같다 |
| 목록 편집기: 서버 아이템 스키마에 FE가 묶음을 얹음 | (a)·(b) | 서버의 표준 `required`는 그대로, FE는 `&virtual`만 더한다(ADR 0012: 오버레이 없음 — 받은 스키마 객체에 직접 병합) | 서버 검증기와 폼이 같은 스키마로 판정한다 |
| | (c) | 묶음 필수를 원하면 서버 `required`를 가상 이름으로 바꿔야 한다 — 서버 스키마와 갈라진다 | 같다 |

| 선택지 | 개발자 | 사용자 | 이주 비용 |
| ------ | ------ | ------ | --------- |
| (a) | 문법 교체(`virtual` → `&virtual`, `required` 풀어 쓰기). 묶음 API(`findNode`, 부채질 `setValue`) 유지 | 변화 없음 | 기록의 16개 행동이 문법 교체로 살고, required 펼치기 테스트 24개가 사라진다(claude) |
| (b) | 묶음 API가 사라지고 렌더러마다 아홉 책임을 다시 구현하거나 공통 어댑터에 기댄다 | 바인딩 품질에 달린다 | 16개 중 6개 소멸, 9개 재작성(claude) |
| (c) | 변화 없음 | 변화 없음 | 없음. 다만 값 미러가 이벤트 구독으로 상태를 바꾸므로(`VirtualNode.ts:116-131`) ADR 0007 때문에 내부는 어차피 다시 쓴다 |

**제안(가능성).** `required`의 묶음 이름을 구성 필드로 바꾸는 코드모드(C8 이주 프롬프트의 항목), `required`에 `&virtual` 이름이 있으면 개발 모드 경고, `findNode('/period/startDate')` 같은 별칭 경로를 둘지 명시, 묶음 `onChange`의 길이 불일치 에러 문구.

**열린 질문.** (1) 묶음의 `&active`를 구성 필드에 병합하는 오늘 동작을 유지하는가. (2) `oneOf` 분기 안의 묶음을 지원하는가(오늘도 노드가 생기지 않는다). (3) 튜플 `value`의 참조가 언제 바뀌는가 — 묶음 입력의 리렌더 횟수가 여기서 정해진다.

## D-7 `setValue(getValue())` 멱등성 — 결정됨: (a) + `setValue` 호출 단위 수정자(이름 미정)

**이해.** 새 계약에서 `setValue(V)`(Overwrite)는 로드이므로 V에 없는 키에 default를 넣는다. 사용자가 default 있는 칸을 비우면 그 키가 방출에서 빠지고, 앱이 `setValue(getValue())`로 되돌리면 그 칸이 default로 다시 찬다. 오늘은 멱등이다(0.2, `raw-redteam4-loop.md:41`). 소유자는 "값을 씌우는 것과 기본값을 설정하는 것은 다르다"며 로드를 로드로 두고 호출 단위로 주입을 끄는 수정자를 두었다. 결과: **오늘의 `setValue(V)`와 같은 결과를 원하는 호출은 모두 수정자를 붙인다.** 아래 `X`는 수정자의 자리표시다.

| 시나리오 | 선택지 | 개발자가 쓰는 것 | 사용자가 보는 것 |
| -------- | ------ | ---------------- | ---------------- |
| 마법사: 2단계에서 메모 '문 앞'을 지움 → 앱이 `draft = getValue()`(메모 없음)를 스토어에 두고 3단계 → "이전"에서 `form.setValue(draft)` | (a) 수정자 없음 | 그대로 | 지운 메모가 '문 앞'으로 돌아와 있다 |
| | (a) + 수정자 | `form.setValue(draft, SetValueOption.Overwrite \| SetValueOption.X)` | 빈 칸 유지. 단 단계마다 `<Form defaultValue={draft}>`로 다시 만드는 마법사는 호출이 없으므로 수정자를 쓸 곳이 없다 — Form 속성만 남는다 |
| | (b) 기각안: 직전 커밋에도 없던 키에만 | 없음 | 같은 폼이면 빈 칸 유지. 단계마다 폼을 다시 만들면 직전 커밋이 없어 돌아온다 |
| CRUD: 상태를 비우고 저장 → 서버 응답 `{id:1, title:'A'}`로 `form.setValue(saved)` | (a) 수정자 없음 | 그대로 | 상태 칸에 'draft'가 다시 보이고 **다음 저장에서** `status:'draft'`가 서버로 간다 — 비운 값이 두 번째 저장에서 되살아난다 |
| | (a) + 수정자 | `form.setValue(saved, … \| SetValueOption.X)` | 빈 칸 유지 |
| JSON 편집기: `"port"` 줄을 지움 | (a) | 입력 쓰기가 로드라면(D-4 열린 질문 1) 입력이 `onChange(obj, SetValueOption.Overwrite \| SetValueOption.X)`를 써야 한다 — 입력의 `onChange`도 수정자를 받아야 한다 | 수정자가 없으면 `port:80`이 즉시 되살아나 지울 수 없다 |

**API 모양 — 이름 후보.** 오늘 공개 옵션은 비트 값 열거형이고 소비자에게 `SetValueOption`으로 보인다(`value.ts:69-74`, `index.ts:45`). 그 결을 따르는 후보:

| 모양 | 예 | 읽힘 | 조합의 문제 |
| ---- | -- | ---- | ----------- |
| 수정자 비트 | `SetValueOption.NoDefaults` / `SkipDefaults` / `WithoutDefaults` / `DisableDefaultInjection` | `Overwrite \| NoDefaults` — 쓰기 종류와 주입 여부가 따로 읽힌다. `DisableDefaultInjection`은 Form 속성과 같은 어근 | `Merge \| 수정자`의 뜻을 정해야 한다(열린 질문 1) |
| 이름 붙은 preset | `SetValueOption.Restore` / `Hydrate` / `Sync`(= `Overwrite \| 수정자`) | 소유자의 구분("씌우기" 대 "기본값 설정")이 이름이 된다. 토큰 하나 | preset이 늘 때마다 조합이 숨는다. `Restore`는 `reset()`과 헷갈릴 수 있다 |
| 옵션 객체 | `setValue(v, { mode: 'overwrite', defaults: false })` | 가장 자기 설명적 | 오늘의 열거형과 모양이 달라 이주 비용이 는다 |

| 선택지 | 개발자 | 사용자 | 이주 비용 |
| ------ | ------ | ------ | --------- |
| (a) + 수정자 | 규칙 하나(Overwrite = 로드)와 필요할 때 비트 하나. 오늘 동작을 지키려면 호출마다 비트 | 수정자를 잊은 앱에서 지운 값이 돌아온다 | 오늘 `setValue`는 주입하지 않으므로 **기존 호출 전부가 새로 주입한다** — 호출 전수 점검. 이주 프롬프트 한 줄: "오늘의 `setValue(v)` = `setValue(v, Overwrite \| X)`" |
| (b) 기각 | 대부분 아무것도 안 써도 멱등 | 리마운트·새 폼에서는 돌아온다 | 오늘과 가깝지만 규칙이 이력(직전 커밋)에 기댄다 |

**제안(가능성).** 수정자와 Form 속성의 이름을 한 어근으로 묶기. README에 "씌우기 / 기본값 설정" 두 줄 표. 폼을 다시 만드는 마법사를 위한 레시피 `<Form disableDefaultInjection={step > 1} defaultValue={draft}>`(첫 단계만 default). 개발 모드에서 같은 V의 연속 Overwrite가 다른 값을 내면 한 번 경고(비멱등 감지).

**열린 질문.**
1. `Merge | 수정자`: Merge는 로드가 아니라 (i)이 없지만 Merge가 조각을 켜면 전이 주입 (ii)가 일어난다 — 수정자가 이것도 막는가. F25는 Form 속성의 범위를 "전체 교체의 정착"으로 한정했다.
2. `reset()`에도 수정자가 필요한가 — `FormHandle.reset`은 인자가 없다(`type.ts:115`).
3. 입력의 `onChange(value, option)`가 수정자를 받는가(오늘도 두 번째 인자를 받는다, `SchemaNodeInput.tsx:49-50`).
4. 타입 수준에서 의미 없는 조합(`Merge | 수정자`, preset끼리)을 막는가.

## D-8 원본 없는 중첩 union의 판별 default — 결정됨: 암묵 default 없음, 빈 값은 분기 없음

**이해.** 판별 union(`payment: oneOf [card{kind:'card', cardNo, installments default 1}, bank{kind:'bank', account}]`)의 값이 비어 있고 판별 프로퍼티에 명시 `default`가 없으면 폼은 분기를 고르지 않는다. 판별 필드(빈 선택)만 보이고 분기 필드는 고른 뒤에 나타난다. 오늘과 같다(`ComputedPropertiesManager.ts:106`, `BranchStrategy.ts:735-739`). 결과: 쓰지 않은 중첩 객체가 저장되지 않는 대신 사용자가 한 번 더 고른다.

| 시나리오 | 결정의 결과 — 개발자 / 사용자 | 기각안(첫 분기 값)이었다면 |
| -------- | ----------------------------- | -------------------------- |
| 마법사: 2단계 결제 | 개발자: 미리 고르려면 판별 프로퍼티에 `default:'card'`를 명시. 사용자: "결제 수단" 선택만 보임 → '카드' → 카드번호 칸과 할부 1(전이 주입)이 나타남. 손대지 않고 넘기면 `kind` 없음 | 들어가자마자 카드 칸이 보이고 손대지 않아도 `payment:{kind:'card', installments:1}` 저장 |
| 목록 편집기: 행 추가 | 개발자: 종류를 고른 채 추가하려면 `push({kind:'bank'})`. 사용자: `push()`한 새 행에 "종류" 선택만. 고르지 않고 저장하면 판별 노드에 필수 에러(F6 라우팅) | 새 행이 첫 분기로 채워져 빈 `{kind:'card'}` 행이 저장될 수 있다 |
| CRUD: `disableDefaultInjection`을 켠 편집 폼, 레코드에 `payment` 없음, 판별 default `'card'` 명시 | 판별 default도 default이므로 막힌다(F25) → 분기 없음, 판별 필드만. 스위치를 끄면 카드 분기 + 할부 1 | 같다(스위치가 막는다) |

| | 개발자 | 사용자 | 이주 비용 |
| - | ------ | ------ | --------- |
| 결정 | 빈 union은 "먼저 고르기" UX로 설계한다. 기본 분기는 명시 default로만 | 쓰지 않은 객체가 저장되지 않는다. 고르는 단계가 하나 있다 | 없음 — 오늘과 같다. 이 조합을 고정하는 테스트가 오늘 없으므로 새로 넣는다(`HANDOFF.md` §3 항목 9) |

**제안(가능성).** 문서 예제 "기본 분기를 원하면 판별 프로퍼티에 `default`", 선택 UI의 빈 상태 문구(예: "결제 수단을 고르세요"), `push(item)`로 미리 고르는 예제, 분기를 고르기 전에는 분기 필드의 `required` 에러가 없다는 것을 문서에 적기.

**열린 질문.** (1) 명시 default를 어디에 쓰는가 — 호스트의 `properties.kind.default`, 분기 안 `kind`의 `default`, 둘 다 허용하면 우선순위. (2) 판별식 없는 선택 가드 union의 빈 값도 분기 없음인데, 선택 UI는 무엇을 보이는가(ADR 0010). (3) 판별 필드만 있는 상태의 필수 에러를 언제 보이는가(`showError`).

## D-9 `RequestRemount` — 결정됨: (b) 사용자 도구로 유지

**이해.** `RequestRemount`는 노드의 렌더러 래퍼 `key`를 바꿔 서브트리를 새로 마운트하는 공개 명령이다(`SchemaNodeProxy.tsx:84, 89`, `event.ts:94-95`). core가 쓰기의 출처로 판단하는 재읽기(`RequestRefresh`, 입력만 `key={version}`)와 달리 앱이 부른다. 유지의 결과는 셋이다 — 공개 호출 모양, 동기 디스패처·가상화에서의 자리, "무엇을 잃는가"의 문서화. 오늘 `FormHandle`에는 `focus`·`select`만 있고(`type.ts:113-114`) 소비자는 `form.findNode(path)?.publish(NodeEventType.RequestRemount)`로 부른다(추론: `publish`가 노드의 공개 메서드이고 `index.ts:44`가 공개 열거를 `NodeEventType`으로 내보낸다).

| 시나리오 | 유지 — 개발자 / 사용자 | 제거였다면 |
| -------- | ---------------------- | ---------- |
| CRUD: 서드파티 날짜 선택기가 `value` 변경을 무시해 `setValue(recordB)` 뒤에도 A의 날짜를 보임 | 개발자: `form.findNode('/period')?.publish(NodeEventType.RequestRemount)` 또는 헬퍼(가칭 `form.remount('/period')`). 사용자: 선택기가 B의 날짜로 다시 그려진다. 열린 팝업·포커스는 닫힌다 | `<Form key>`나 `reset()`으로 폼 전체를 다시 만든다 — 다른 칸의 입력 중 상태와 touched를 잃는다 |
| JSON 편집기: 편집기 래퍼(툴바, 접힘 상태)까지 새로 해야 할 때 | 개발자: 대부분은 자동 재읽기(F7)가 입력을 리마운트하므로 부를 일이 없다. 사용자: 부르면 캐럿·undo가 사라진다 | 같다 |
| 목록 편집기: 서버가 한 행의 스키마를 바꿈 | 개발자: 그 행 경로에 Remount. 사용자: 그 행만 다시 그려지고 다른 행의 포커스는 유지 | 목록이나 폼 전체 리마운트 |

| | 개발자 | 사용자 | 이주 비용 |
| - | ------ | ------ | --------- |
| 유지 | 서드파티 입력의 탈출구가 남는다. Refresh(자동)와 Remount(수동)의 차이를 배워야 한다 | 필요한 곳만 다시 그려진다. 그 서브트리의 포커스·캐럿·내부 상태는 잃는다 | 없음 — 공개 이벤트 그대로. ADR 0008의 "제거 후보" 문장만 지운다 |

**제안(가능성).** `FormHandle.remount(path)`를 `focus(path)`·`select(path)`와 대칭으로 두는 형태. 문서에 Refresh/Remount 비교 표(누가 부르는가, 무엇이 다시 마운트되는가, 무엇을 잃는가). 리스너 안에서 부르면 다음 파동에 배달된다는 것(B3-4)을 적기.

**열린 질문.** (1) 지연 마운트(가상화)된 노드에 Remount가 오면 드러내는가 — T-3은 Focus·Select만 드러낸다. (2) Remount가 서브트리의 dirty·touched를 초기화하는가(오늘 상태는 노드에 있어 유지된다고 읽힌다, 추론). (3) `batch` 안에서 부른 Remount의 배달 시점.

## D-10 루트 `onChange` — 결정됨: (c) 최외곽 동기 진입당 1회, 마이크로태스크 없음

**이해.** 오늘 루트 `onChange`는 한 태스크의 변화를 모아 취소·재예약하는 매크로태스크(setTimeout)에서 한 번, OnChange 검증과 함께 불린다(0.2). 새 설계는 쓰기를 일으킨 가장 바깥의 동기 호출(키 입력 핸들러, `setValue` 한 번, `batch(fn)` 한 번)이 끝날 때 — 리스너가 일으킨 파동까지 합친 뒤 — **최종 emit으로 정확히 한 번** 부른다. 타이머가 없으므로 `onChange`는 호출자의 스택 안에서 돈다.

**`onChange`가 받는 것.** 그 진입의 마지막 커밋의 emit — `getValue()`와 같은 값(투영: `omitEmpty`·`omitTrailing`·비활성 조각 제외). 오늘의 `normalizedValue`와 같은 종류다. 중간 커밋은 보이지 않는다. 참조는 바뀐 경우에만 새것이므로(F9) Form의 같은 참조 거름(`Form.tsx:105`)과 맞물린다. 오늘은 루트가 비어도 `{}`·`[]`를 준다(`getSafeEmptyValue`, `AbstractNode.ts:1222`, `README.md:1482`) — 새 설계에서 같은지는 정해야 한다.

| 시나리오 | 오늘(매크로태스크) | 결정(진입당 1회) | 개발자가 쓰는 것 |
| -------- | ------------------ | ---------------- | ---------------- |
| CRUD: 제목에 "hello" 입력 | 키마다 별 태스크 → 5회, 핸들러가 끝난 뒤 | 5회, 각 키 핸들러 안에서 동기. `onChange={setDraft}`는 같은 이벤트의 렌더에 합쳐진다(추론: 이산 이벤트 안의 setState 배칭. 찢김 0은 4라운드 실행) | 무거운 `onChange`(1만 필드 직렬화·저장)는 이제 키 입력 지연으로 체감된다(추론) → 직접 디바운스(아래) |
| 마법사: "다음" 버튼이 `setValue({step:2}, Merge); setValue({shipping:{…}}, Merge)` | 같은 태스크 → 1회 | 진입 둘 → 2회, 첫 번째는 중간 상태 | 한 번으로 묶으려면 `batch(() => {…})` — 오늘 `FormHandle`에는 `batch`가 없다(`type.ts:108-128`) |
| 목록 편집기: 행 셋을 반복문으로 `push` | 1회(오늘 `push`는 Promise, T-7) | 3회, `batch`면 1회 | `await arr.push()` 가정 제거 |
| CRUD: `const rec = await api.get(); form.setValue(rec)` | 태스크 뒤 1회 | `setValue`가 돌아오기 전에 1회 | 자동 저장 앱은 로드를 편집으로 오인해 되쓸 수 있다(오늘도 같고 시점만 다르다) — 아래 `meta.cause` |

소비자가 직접 디바운스하는 모양 — 모노레포의 `debounce`(`@winglet/common-utils/function`, `rateLimit/debounce.ts:224`; `clear`·`execute`·`dispose`를 가진다):

```tsx
const save = useMemo(() => debounce((v: Value) => api.saveDraft(v), 500), []);
useEffect(() => () => save.dispose(), [save]);
<Form jsonSchema={schema} onChange={save} onSubmit={async (v) => { save.clear(); await api.save(v); }} />;
```

렌더 비용이 문제라면 `onChange={(v) => startTransition(() => setPreview(v))}`나 `useDeferredValue`로 미룬다. 어느 쪽이든 폼 입력의 렌더(캐럿, T-1)는 영향을 받지 않는다 — 디바운스는 소비자 쪽에만 걸린다.

| 선택지 | 개발자 | 사용자 | 이주 비용 |
| ------ | ------ | ------ | --------- |
| (c) 결정 | 한 사용자 행위 = 한 호출. 타이머·`useEffect` 경합이 없다. 여러 쓰기는 `batch` | 소비자 상태와 폼 화면이 같은 커밋 | 한 태스크 합치기에 기대던 곳(연속 `setValue`·`push`)이 여러 번 호출로 바뀐다. 검증 요청도 진입당 1회(F28) |
| (a) 파동마다 | 리스너 핑퐁에서 핸들러당 최대 26회(실행: 4라운드 이벤트 레드팀) | 소비자 상태가 중간 값을 거친다 | — |
| (b) 매크로태스크 | 오늘과 같다 | 오늘과 같다 | 없음. 대신 dev/prod React 라이프사이클 경합(소유자 발언)과 두 단계 테스트(T-5)가 남는다 |

**제안(가능성).**
- 두 번째 인자 `meta`(가칭) `{ commit: number; cause: 'mount' | 'input' | 'setValue' | 'reset' | 'array' }` — 자동 저장이 로드·마운트를 거를 수 있다. `commit`은 F28의 커밋 번호와 같은 것. 선택 인자라 기존 소비자를 깨지 않는다.
- `FormHandle.batch(fn)` 공개. README에 디바운스 레시피.
- README 정리: `onChange` 타입이 README에서는 `SetStateFn<Value>`(`README.md:70`), 코드에서는 `Fn<[value: Value]>`(`type.ts:52`)로 다르다.

**열린 질문.**
1. 마운트 시 `onChange`를 부르는가 — 오늘은 준비 시 1회(`Form.tsx:135-139`).
2. `onChange` 안의 쓰기는 같은 진입에 합쳐지는가, 새 진입(→ `onChange` 재호출)인가. 외부 상태를 `useEffect`로 `setValue`에 되먹이는 "제어형" 패턴의 수렴이 이것과 D-7에 달린다.
3. 값이 같고 참조만 새것인 커밋(D-7의 재주입 뒤 같은 값)에서도 부르는가.
4. `onChange`가 throw하면 리스너 격리(F21 `onListenerError`)와 같은 통로인가.

## 11. 결정 사이의 연결 — 소비자에게 한 질문으로 보이는 것

- **"입력의 객체 쓰기는 로드인가"** 가 D-4·D-5·D-7에 함께 걸린다. JSON 편집기에서 default 있는 키를 지울 수 있는지, 수정자를 입력 `onChange`에도 열어야 하는지, 자기 쓰기가 Refresh를 부르는지(F7 문구)가 이 한 답으로 정해진다.
- **`setValue`의 이주**: 오늘 `setValue(V)`는 default를 넣지 않고 새 계약은 넣는다. D-5 스위치(폼 단위)와 D-7 수정자(호출 단위)가 오늘 동작으로 돌아가는 두 길이다 — 릴리스 노트(C8)에서 한 문단으로 묶을 수 있다.
- **D-1 × D-7**: `setValue(null, Overwrite | 수정자)`면 `null`인 동안 자식이 default 없이 빈다 — #338의 "null이면 빈 양식(default)" 표시와 달라진다. 의도된 조합인지 정해야 한다.
- **D-4 × D-10**: 부분 패치를 여러 번 부르면 `batch` 없이 `onChange`가 여러 번이다 — `batch` 공개 여부와 같은 질문이다.
- **D-8 × D-5**: 스위치를 켠 편집 폼에서는 명시한 판별 default도 막힌다(F25) — 분기를 미리 고르려면 레코드에 `kind`가 있어야 한다.
- **D-9 × D-4 (a)**: 자동 재읽기는 입력만 리마운트하므로 입력 밖의 내부 상태를 가진 컴포넌트에는 Remount가 유일한 도구다.
