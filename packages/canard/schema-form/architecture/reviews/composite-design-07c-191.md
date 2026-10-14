# 07c 복합 사례 설계안 (fairy07 작성, 191라운드에 소유자 검토용으로 옮김, 2026-10-13)

검토안 184라운드의 C1~C7을 출발점으로 두고, 186라운드 소유자 답의 회귀·타이밍 종류를 더해 24건으로 짰다. 모든 사례는 여러 단계로 이뤄지고, 각 단계 뒤에 중간 상태(형상·노드 값·출력 값·오류)를 단언한다. 표기: "→"는 그 단계 뒤의 단언이다.

## 공통 결정 4가지 (191C-01로 원장 관리자가 정함)

1. 폼 속성(context, errors, showError, virtualization, 사용자 입력 정의)은 시나리오 형에 넣지 않는다. 시나리오 패키지의 FormScenario 형을 넓히지 않고, 속성 값도 시나리오 패키지에 순수 데이터 상수로 두어 스토리가 가져다 공용 컴포넌트에 넘긴다.
2. dirty·touched처럼 공유 기대값 어휘에 없는 관찰은 그 사례의 스토리 파일 play에서 playScenario 뒤에 소비자 단언으로 더한다(패키지 규칙 "소비자 전용 관찰이 필요한 시나리오는 자기 파일을 갖는다").
3. IME 조합과 숫자 badInput은 실제 브라우저에서만 재현된다. 이 두 사례의 play는 G23 게이트처럼 play 안에서 @vitest/browser/context의 CDP를 불러 쓴다. 일반 Storybook 창에서는 그 play가 실패하므로 눈 확인은 수동 조작으로 한다.
4. "검증 도중 reset"은 지연이 있는 검증기가 있어야 재현된다. 스토리 쪽에서 ajv8 플러그인을 감싸 판정을 한 박자 늦추는 소비자 검증기를 쓴다. jsdom e2e는 같은 감싸개를 하네스 검증기에 씌운다.

## 사례 목록

CX-01 주문서 (C1: G3·G2·G4·G5). 판별 payment(card·bank) oneOf, 공통 items 배열(name, qty, price), controls.derived 합계 total.
1 첫 화면 → card 필드, items 비어 있음, total 0. 2 push 두 번, 값 채움 → total = Σ qty×price. 3 payment=bank → card 필드 없음, items·total 그대로, bank 기본값 채움. 4 items 0번 remove → 1번 노드가 0번으로 같은 노드(identity), total 재계산. 5 submit → bank account required 오류만(card 분기 오류는 걸러짐). 6 account 채우고 submit → 출력 값이 화면과 같음.

CX-02 조직도 (C2: G1·G10·G5). $defs.member 재귀(name, reports: member 배열), virtualization 켬(문턱 낮게).
1 3단 트리 로드 → 깊은 항목은 placeholder. 2 지연 항목에 handle setValue → 노드 값 바뀜, 아직 placeholder, dirty true. 3 그 항목 focus → 마운트, 입력에 값. 4 상위 reports에 push → 새 경로 이스케이프. 5 reset → 값·dirty 원복, 지연 상태 다시 계산.

CX-03 프로필 (C3: G3·G5). nullable address 객체, if country=="KR" then postcode required else zip.
1 address null 로드 → 자식 없음, 출력 null. 2 자식 입력으로 승격 → 형제 기본값 안 채움. 3 country KR→US→KR → postcode raw 유지. 4 errors prop으로 /address/postcode 서버 오류 → 외부 오류 먼저, 검증 오류 뒤. 5 showError를 dirty일 때만 → 손대지 않은 필드 오류 감춤. 6 address를 다시 null → 하위 오류 사라짐.

CX-04 금액 입력 (C4: G6·G5, 브라우저 전용). amount(number, minimum 1), memo, 사용자 정의 포매터 입력(천 단위 쉼표, 캐럿 유지).
1 "1234" → 화면 "1,234", 노드 1234, 캐럿 끝. 2 가운데 숫자 삽입 → 캐럿이 삽입 뒤. 3 number 입력에 "1e" → badInput, 노드 undefined, 초안이라 오류 표시 안 함. 4 Enter → VALIDATION_ERROR. 5 고쳐서 Enter → onSubmit 한 번, 출력 정확.

CX-05 권한 폼 (C5: G4·G7). @.mode(view·edit·admin) context, controls.readOnly·visible, owner→audit injectTo.
1 view → 모두 readOnly, admin 필드 숨김(값 유지). 2 context edit → readOnly 풀림, 값 그대로. 3 owner 입력 → audit에 주입. 4 admin → admin 필드 보이고 이전 값. 5 view로 → 주입 값 유지, 편집 불가.

CX-06 플러그인 폼 (C6: G8·G6). antd 렌더러 + 파일 업로드 + throw하는 입력.
1 antd 래퍼에 data-path. 2 파일 둘 첨부 → attachedFilesMap 둘. 3 throw 입력 → 그 서브트리만 fallback. 4 업로드 필드 언마운트(분기 전환) → 파일 정리. (G8 뒤 구현, 플러그인 패키지는 composeStories 검토.)

CX-07 설정 마법사 (C7: G3·G2·G7). anyOf 다중 선택(email·sms·push), prefixItems 튜플 [host, port] + 열린 items.
1 email·push 켬 → 두 분기 필드, 공유 필드 하나. 2 튜플 여분 push → extras. 3 sms 켜고 email 끔 → 공유 필드 유지. 4 reset → 첫 로드 값과 분기. 5 defaultValue 교체(재로드) → 새 값 기준 분기.

CX-08 분기 전환 중 배열 push/remove. kind(list·single) oneOf, list 분기에 tags 배열.
1 push 3개. 2 batch[push, kind=single] → tags 형상 없음, 출력에서 빠짐. 3 kind=list → tags 4개, 노드 동일. 4 remove 1 → 순서·identity. 5 빠른 왕복 두 번 → 결과 동일. (2번은 G3 발견과 같은 길이라 지금 실패할 수 있다. 발견이면 it.fails로 남긴다.)

CX-09 검증 도중 reset (지연 검증기). 1 잘못된 값 → 검증 대기. 2 판정 전 reset. 3 판정이 도착해도 reset 뒤 상태에 오류 없음. 4 다시 잘못된 값 → 오류 정상. 5 submit 도중 reset → submit 결과가 reset 뒤 값을 덮지 않음.

CX-10 batch 안 injectTo 사슬. a→b→c, x 독립. 1 batch[a=1, x=1] → onChange 한 번, c까지 반영. 2 b 직접 편집 → c만 재주입. 3 a 다시 → 사슬 재주입. 4 순환(c→a) 추가판 → 예산 진단 degraded, 폼 동작 유지.

CX-11 IME 조합 중 분기 전환 (브라우저 전용). 1 분기 a 입력에서 "가" 조합 중. 2 handle로 kind=b → 조합 중 입력 언마운트. 3 조합 확정이 와도 꺼진 분기에 쓰기 없음. 4 kind=a → 조합 전 raw 복원, 새 입력 초안 비어 있음.

CX-12 가상화 지연 마운트와 dirty·touched. 100필드, 문턱 20. 1 지연 필드 setValue → dirty true, touched false. 2 focus → 마운트, blur → touched true. 3 idle 백필 뒤 전부 마운트. 4 reset → dirty·touched false.

CX-13 중첩 oneOf 안의 anyOf. 바깥 oneOf(tier) → 안쪽 oneOf(mode) → anyOf(addons). 층마다 순서대로·역순으로 토글, raw 유지와 공유 필드 수명.

CX-14 $ref 재귀 안의 조건. $defs.node: if type=folder then children(node 배열) else size, 3단. 1 가운데 folder→file → 하위 트리 없음. 2 file→folder → 하위 raw 복원. 3 가장 깊은 size에 잘못된 값 → 그 경로에 오류. 4 키에 "/"·"~" → 이스케이프된 경로로 오류 귀속.

CX-15 외부 errors와 검증 오류 동시. 1 errors prop /email + minLength 위반 → 외부 먼저. 2 값 고침 → 검증 오류만 사라짐. 3 errors prop [] → 모두 사라짐. 4 배열 아닌 errors → 빈 목록(178C-01). 5 getErrors()는 루트 외부 + 검증 목록(79C-01).

CX-16 빠른 연속 토글 혼합. controls.active 분기와 if/then을 한 폼에. 1 화면 토글 세 번 사이사이 입력. 2 batch 안 토글 네 번. 3 서로 다른 게이트를 같은 batch에서 뒤집기. 각 단계 뒤 양쪽 raw 유지(2·3은 G3 발견에 걸림).

CX-17 판별 분기 + 분기별 배열 + 항목 오류. 1 card 분기 cards에 pattern 위반 둘 → 각 항목 경로에 오류. 2 bank로 → 노드 오류 걸러짐, 폼 수준 목록엔 남음. 3 card로 → 항목 오류 복귀. 4 가운데 remove → 오류가 옮겨진 항목을 따라감.

CX-18 분기 전환 시 파생 재계산. 분기마다 다른 필드로 total derived. 전환 → 재계산, 수동 편집 → 파생 규칙(G4), 되돌림 → 이전 값.

CX-19 분기 기본값 + reset + 전환. 1 b로 바꾸고 편집. 2 reset → a와 그 기본값, b 편집 사라짐. 3 다시 b → b 기본값부터.

CX-20 oneOf 항목들의 배열. 항목마다 kind 분기. 1 서로 다른 kind 셋. 2 가운데 remove → 남은 항목의 분기·값·identity. 3 update로 한 항목 kind 바꾸기. 4 pop.

CX-21 배열 항목 안의 검증기 guard. 항목 price, if price>100 then approval required. push·update·remove 사이에 오류가 항목을 따라 움직임.

CX-22 분기 안의 visible 대 active. visible false는 값 유지·검증 대상, active false는 값 제거. 분기 전환과 섞어서.

CX-23 nullable 분기 객체의 null과 전환. null 로드 → 자식 입력 승격 → 그 사이 분기 전환 → 형제 채움 없음.

CX-24 Enter 제출과 분기 무효. 1 a의 required 비움, Enter → VALIDATION_ERROR. 2 b로 → 같은 Enter 성공. 3 a로 되돌려 채우고 Enter 성공.

## 순서와 크기
C1~C7 데이터는 해당 그룹이 끝난 뒤 쓴다(예: CX-06은 G8 뒤). 나머지 17건은 G3·G2·G5·G4가 끝나는 대로 묶어 쓴다. 복합 e2e는 features-composite-*.test.tsx 여러 파일로 나눠 파일당 15건 이하로 둔다.
