# HANDOFF — `@canard/schema-form` 재설계

개발의 진행 상황과 다음 할 일은 `PLAN.md`가 단일 진입점으로 든다. 다음 세션이 바로 이어서 일하기 위한 문서다. 이력은 `git log`와 `reviews/`에 있으므로 여기에는 지금 상태, 다음 할 일, 일하는 법만 적는다. 소유자는 Vincent다.

## 1. 지금 어디인가 (2026-10-13, 217라운드 닫힘; 07 전환 진행 중)

- **184라운드(2026-10-13, 닫기).** 스토리 재구성 검토안을 올렸다. 기능 그룹 열 개에 그룹별 스토리 테스트와 복합 사례 일곱을 두고, 새 디렉토리에만 쓰므로 리뷰 작업과 병렬이 가능하며, 소유자 결정 여섯을 묻는다(reviews/round-184-closing.md).
- **185라운드(2026-10-13, 소유자).** 외부 주입 오류를 자식 노드가 지우거나 쓰면 key 식별자 없이 경로로 루트 집계에 반영한다. 옛 판의 의도를 잠재 버그 없이 복원하는 것이며 reviewer가 구현한다(reviews/round-185-owner-answers.md).
- **186라운드(2026-10-13, 소유자).** 스토리 재구성은 검토안대로 간다. fairy07이 별도 워크트리에서 지금 병렬로 시작해 브라우저 테스트까지 하고 PR로 머지하며, 복합·중첩 동작과 검증기 기반 분기 제어에 힘을 싣는다(reviews/round-186-owner-answers.md).
- **187라운드(2026-10-13, 닫기).** 스토리에서 실제 ajv8 플러그인을 쓰기 위한 스토리북 설정 수정을 허용했다. 소비자 문서가 아직 가르치는 옛 작성 문법은 설계 단계에서 사라진 것이라 스토리는 코드를 따르고, 문서 정합은 정리 항목으로 두어 소유자에게 보고한다(reviews/round-187-closing.md).
- **188라운드(2026-10-13, 닫기).** 외부 오류가 바뀌면 onValidate가 집계를 받도록 통지를 되찾는다. 옛 판은 errors prop 변경에 onValidate를 불렀고 새 판은 검증 때만 불렀다(reviews/round-188-closing.md).
- **189라운드(2026-10-13, 소유자).** 개발 모드 판정 함수는 process.env.NODE_ENV 토큰을 그대로 읽고 첫 결과를 캐시한다. 소비자 번들러의 치환을 지키기 위해서다(reviews/round-189-owner-answers.md).
- **190라운드(2026-10-13, 소유자).** 공개 형이 readonly를 허용하지 않는 동결 상수처럼 제한된 자리에서는 unknown을 거친 단언을 허용한다. useTerminalChildren의 빈 자식 목록 상수는 한 줄로 정리하며 reviewer가 처리한다(reviews/round-190-owner-answers.md).
- **191라운드(2026-10-13, 닫기).** 스토리 재구성 첫 그룹(합성)이 끝났고, 그 과정에서 두 쓰기 이상의 batch가 숨은 분기 값을 모두 지우는 제품 결함을 찾았다. reviewer가 07 브랜치에서 머지 전에 고친다. 복합 사례 설계안의 공통 결정 넷은 편집자가 정했고 사례 목록은 소유자 검토에 올린다(reviews/round-191-closing.md).
- **192라운드(2026-10-13, 소유자).** 복합 사례는 설계안대로 간다. 측정은 리뷰 작업이 끝나는 대로 fixy07에 지시하고, 스토리 재구성은 별도 PR로 검증까지 fairy07이 맡으며, 원장 관리자는 관리·관제·기록만 한다(reviews/round-192-owner-answers.md).
- **193라운드(2026-10-13, 소유자).** SchemaNode 클래스의 풀리지 않는 inheritDoc 주석은 리뷰 둘째 라운드에서 직접 문장으로 고친다. 평평한 core 구조는 소유자가 받아들이지 않으므로 core와 SchemaNode의 관계와 위계를 고찰한 문서를 먼저 쓰고 07 머지 뒤 재배치한다. 고찰 범위는 core만이 아니라 패키지 전체의 fractal과 organ이다(reviews/round-193-owner-answers.md).
- **194라운드(2026-10-13, 닫기).** 스토리 재구성 둘째 그룹(구조)이 끝났고 새 제품 결함은 없었다. batch 안 배열 동사의 위치 identity는 명세(62C-01)이고 batch 고침은 그것을 유지한다(reviews/round-194-closing.md).
- **195라운드(2026-10-13, 닫기).** 리뷰 첫 라운드의 독립 검증이 차단 회귀 하나를 찾았다. 바깥 쓰기를 전달하는 중에 리스너가 지운 자식의 서버 오류가 루트 목록에 남는다. 고침은 둘째 라운드로 들어가고, isDevelopment를 캐시 함수로 둘지 번들러가 지울 수 있는 상수로 되돌릴지는 소유자 결정이다(reviews/round-195-closing.md).
- **196라운드(2026-10-13, 소유자).** 개발 모드 판정은 소비자 번들러가 지울 수 있는 모듈 상수로 되돌린다(reviews/round-196-owner-answers.md).
- **197라운드(2026-10-13, 닫기).** batch 고침의 계획 검증이 기존 결함 둘을 더 찾았다. 다른 종류의 노드가 살아 있는 경로로 batch가 되돌아가면 잠복 값을 복원하지 않고, 여러 쓰기 batch 안의 가상 노드 쓰기는 버려진다. 둘 다 리뷰 둘째 라운드 꼬리에 넣고 측정 시작은 batch 커밋이 모두 오른 뒤로(reviews/round-197-closing.md).
- **198라운드(2026-10-13, 소유자).** 소유자가 자리를 비운다. 결정이 필요한 것은 미루고, 부속 PR은 검증 뒤 원장 관리자가 머지하며, 전환 브랜치 하나만 draft로 남긴다. 고침마다 회귀 시험을 두고, 구조 고찰 뒤 explain 문서를 소유자가 보고 재배치를 진행한다(reviews/round-198-owner-answers.md).
- **199라운드(2026-10-13, 닫기).** 스토리 재구성 셋째 그룹(값과 기본 입력)이 끝났고 제품 결함은 없었다. 내장 입력이 집합 밖 값을 어떻게 보일지는 소유자 질의로 미뤘다(reviews/round-199-closing.md).
- **200라운드(2026-10-13, 닫기).** 개발 모드 판정을 모듈 상수로 되돌려도 소비자 번들러가 개발 분기를 지우지 못함이 확인됐다. 소유자가 고른 목적을 이루기 위해 사용처마다 토큰을 직접 쓰고 lint로 모양을 고정하며, 귀환 때 확인 항목으로 남긴다(reviews/round-200-closing.md).
- **201라운드(2026-10-13, 닫기).** 스토리 재구성 넷째 그룹(검증·상태·오류)이 끝났고 제품 결함은 없었다. 네이티브 submit의 검증 거부는 onError 없이 싱크로만 간다는 읽기를 원장에 보충하고 Form 문서 한 문장을 고친다(reviews/round-201-closing.md).
- **202라운드(2026-10-13, 닫기).** 스토리 재구성 다섯째 그룹(파생·주입·watch)이 게이트를 통과했으나 검토용 verifier 실행이 권한 분류기에 거부됐다. 재시도 없이 보류로 적어 커밋하고 다음 그룹으로 간다(reviews/round-202-closing.md).
- **203라운드(2026-10-13, 닫기).** 스토리 재구성 여섯째 그룹(입력 컴포넌트)이 끝났고 제품 결함은 없었다. fairy07 세션의 검토용 verifier 실행이 종류째 거부돼 그룹별 검토는 보류하고, PR 전체 독립 검증은 원장 관리자 세션이 맡는다(reviews/round-203-closing.md).
- **204라운드(2026-10-13, 닫기).** 리뷰 둘째 라운드가 아홉 커밋으로 끝났다. batch가 순차 쓰기와 다른 값을 내는 마지막 발견은 결함이 아니라 batch를 쓰기 하나로 세는 계약의 귀결이라 시험으로 고정한다. fixy07의 측정과 둘째 라운드 독립 검증을 시작한다(reviews/round-204-closing.md).
- **205라운드(2026-10-13, 닫기).** 스토리 재구성 일곱째 그룹(핸들·레이아웃)이 끝났고 제품 결함은 없었다. fairy07 세션은 서브에이전트 실행이 전부 거부돼 자체 변이 탐침으로 대신한다. 07b 브랜치가 리뷰 둘째 라운드 위로 올라갔고 07c도 그 위로 옮긴다(reviews/round-205-closing.md).
- **206라운드(2026-10-13, 닫기).** core와 SchemaNode의 관계와 패키지 전체 위계를 고찰한 문서가 완성돼 원장에 들어왔다. 권고는 core를 엔진과 겉면 두 자식으로 나누는 모양이고, 소유자 결정 다섯은 설명 문서와 함께 귀환 때 올린다(reviews/round-206-closing.md).
- **207라운드(2026-10-13, 닫기).** 스토리 재구성 여덟째 그룹(이벤트·통지)이 끝났고 제품 결함은 없었다. 검증 결과가 그대로여도 새 배열로 파동을 내 렌더가 두 번인 것은 07b 정리 항목으로 넘겼다. 소유자용 구조 설명 문서를 썼다(reviews/round-207-closing.md).
- **208라운드(2026-10-13, 닫기).** 리뷰 둘째 라운드의 독립 검증이 조건부로 통과했다. 가상 노드 입력의 오류 경로가 부수 효과 없이 던지게 된 것은 새 동작으로 받고, lint 설정과 문서 문장 둘, 비차단 넷은 reviewer가 꼬리 커밋으로 고친다. 측정은 둘째 라운드 head로 진행한다(reviews/round-208-closing.md).
- **209라운드(2026-10-13, 닫기).** 리뷰 둘째 라운드의 꼬리 다섯 커밋을 직접 재검증해 받았고 둘째 라운드가 닫혔다. 이 세션의 검토용 서브에이전트 실행도 거부돼 최종 검증은 직접 한다. 스토리 재구성 아홉째 그룹(플러그인)이 끝났고 제품 결함은 없었다(reviews/round-209-closing.md).
- **210라운드(2026-10-13, 닫기).** 스토리 재구성 열 그룹이 모두 끝났다. 스토리 213건, 제품 결함은 둘(하나는 고쳐짐, 하나는 07b 항목). 다음은 복합 사례 스물넷이고, 끝나면 07c PR을 열어 원장 관리자가 직접 검증한 뒤 머지한다(reviews/round-210-closing.md).
- **211라운드(2026-10-13, 닫기).** 복합 사례 작성 중 제품 결함 둘을 더 찾았다. 분기가 닫히는 같은 쓰기에서 배열에 더한 새 항목의 값이 사라지고, 재귀 참조 안의 중첩 인스턴스에서 조건 분기가 적용되지 않는다. 둘 다 reviewer가 코어에서 고친다(reviews/round-211-closing.md).
- **212라운드(2026-10-13, 닫기).** 조용한 창에서 방향 확인 둘이 끝났다. 리뷰 둘째 라운드는 쓰기 경로에 감지 가능한 비용을 더하지 않았고, 개선 커밋 2는 약간 빠른 방향이라 판정 세션으로 간다. 두 세션을 해제하고 판정 세션은 셋째 라운드가 올라온 뒤 조용한 창에서 돌린다(reviews/round-212-closing.md).
- **213라운드(2026-10-13, 닫기).** 복합 사례가 찾은 코어 결함 셋의 고침이 전환 브랜치에 올랐고 직접 재검증을 통과했다. 07b 브랜치와 스토리 브랜치를 차례로 그 위로 옮기고, 판정 세션은 기계가 빈 뒤 돌린다(reviews/round-213-closing.md).
- **214라운드(2026-10-13, 닫기).** 복합 사례 스물넷이 끝나 스토리 재구성의 작성이 모두 끝났다. 입력기 조합 중에 노드에 쓰는 것은 동기 통지 규칙대로 의도된 동작이다. 전체 게이트 뒤 스토리 PR을 열면 원장 관리자가 직접 검증한다(reviews/round-214-closing.md).
- **215라운드(2026-10-13, 닫기).** 스토리 재구성 PR을 직접 검증해 07b 브랜치에 합쳤다. 판정 세션이 시작됐고, 문서 정합에서 나온 최상위 가상 필드 형은 측정 뒤 계획을 거쳐 지운다(reviews/round-215-closing.md).
- **216라운드(2026-10-13, 닫기).** 네 시간 판정 세션이 끝났고 개선 커밋 2는 다섯 부분 모두 채택이다. 측정 창이 닫혀 세 세션이 다시 자유롭고, 07b 브랜치의 마무리 여섯 단계가 정해졌다(reviews/round-216-closing.md).
- **217라운드(2026-10-13, 소유자).** codex와 agy를 쓰는 멀티에이전트 정책을 다시 켠다. 소스와 시험의 구현은 codex가 하고 Claude 세션은 계획과 검증을 맡으며 품질 게이트는 그대로다(reviews/round-217-owner-answers.md). 다음 라운드 번호는 218.
- **그 앞의 라운드 요지(19라운드부터)는 PLAN-LOG.md 2절에 있다.** 라운드마다 한 문단이며, 1절의 기록 표와 같은 순서다.
- **설계의 정본은 단일 원장 `ledger/`다.** 영역 17개, 항목 1,350개(80라운드 뒤, 24라운드 뒤 1,348; 현행 1,076(부정 결정·기록 포함), 대체됨 199, 분할됨 49, 중복 24, 열림 0). 형식과 규칙은 `ledger/README.md`.
- **옛 설계 문서(`00`–`09`, `adr/`, `open-questions.md`)는 동결됐다.** 더 고치지 않는다. 어긋남은 원장의 충돌 칸에 적는다. 원장이 인용하는 옛 문서의 `path:line`은 모두 커밋 `ba398c330` 기준 줄 번호다(그 뒤 옛 문서는 바뀌지 않았다).
- **18라운드가 닫혔고, 소유자가 검토했고, 결정은 봉인됐다.**
  - 편집자 결정의 정본은 `reviews/round-18-closing.md`의 블록 `18C-01`…`18C-105`이다. 모든 결정에 【추론】 표지가 있다.
    - 01–88: 열린 항목 99개를 닫은 것과 반영 게이트가 드러낸 둘(87·88).
    - 89–93: union 설계 스웜의 편집자 결정(노드 공개 형, 청사진 판정 절차, 값 의미, 입력 바인딩, 이주·시험·비용).
    - 94–103: 채움 시점(WRITE-090)이 드러낸 파생(Refresh 범위, 순회 예산, 잠복 원본, 스냅숏 자리, 진단 초기화, 이주 행 셋, null 계약, `resetSubtree()` 범위, 에지 기준, 정리).
    - 104: 게이트 3이 찾은 U7의 반례를 닫은 정련(쓰기 경계는 정적 목록, 전이 단계는 원래 쓰인 값을 최종 유효 목록으로). 게이트 3 원문은 `reviews/raw-round18-tests/gate3-union-fill.md`.
    - 105: 최종 정합성 검증(codex·antigravity, `reviews/raw-round18-final-check.md`)이 찾은 13건을 닫은 블록 — U7의 게이트 되먹임은 전이 라운드 상한 안에서 다음 라운드를 부르고 원본 B에는 쓰기 경계의 해석만 남음, `VALIDATOR_COMPILE_FAILED`는 폼 수준 기록, 정적 선언 없는 이름의 분기 fold 불일치는 청사진 오류, `node.type`은 여덟, `push(v)`의 스냅숏 생성 값, 유효 목록의 "같은 참조" 뜻, 목록 밖 `default`는 노드가 생길 때마다.
  - 소유자 답은 `reviews/round-18-owner-answers.md:24-46`이다(`ledger/checks/owner-answers.tsv` 242건(19라운드 둘 포함), 모두 인용됨). 요약은 `reviews/round-18-closing-summary.md` §D(24–37행). 38–41행은 설계서 검토 메모, 42–46행은 개발계획 결정(2026-09-27)이며 모두 원장에 반영됐다.
    - 24 union 규칙 A(순서 없음, 받아 주는 형이 하나일 때만 변환), 25 안쪽 이름 통일, 26 **채움은 노드가 생길 때만(B안)** — `setValue(V)`는 로드가 아니다, 27 명령 넷, 28 용어(`union`·variant 호스트).
    - 29–37 union 설계: 객체·배열 포함 union을 터미널 한정으로 허용, 형 없는 원시 `anyOf`는 분기 형을 모음, 필드는 `type`(종류)·`schemaType`(계산된 허용 형 목록, union만 배열, `'null'` 제외)·`nullable`, 형 없는 `const`·`enum` 분기와 객체·원시 혼합 `oneOf`는 오류, 값을 바꾸는 검증기는 `bind` 거부, Hint·props의 `type`은 종류, 좁힘은 연언의 교집합(정적은 청사진에서, 게이트는 켜진 동안 유효 목록만).
  - union 설계는 스웜(렌즈 넷 → 검증 둘 → 병합 → codex·antigravity 교차 확인 → 2·3판)으로 만들었다. 작업 파일은 `reviews/raw-round18-union-swarm/`(정본 설계 `merged-v3.md`), 시험 보고는 `reviews/raw-round18-tests/`(표준 대조 둘, 원장 정합성 시험 둘, 1차 교차 확인 둘).
- **기계 검사는 모두 문제 0이다(§4).** 소유자 답 248/248(27라운드 뒤), 정확 일치 225 항목, 블록 105/105, 문장 검사 17 영역 0/0, 토큰 잔여 484(25·26라운드 뒤; 옛 문서를 `_archive/2026-09-29/`로 옮기고 README·HANDOFF를 다시 쓴 뒤 485, 옛 문서에 원천이 있는 잔여 419는 이동 전후 같고, 나머지 66은 README·HANDOFF의 자기 서술 토큰이다 — `ledger/checks/token-review.md` 끝 절).
- **의미 게이트(게이트 3)는 13건을 찾아 모두 고쳤다.** 원문은 `reviews/raw-round18-tests/gate3-union-fill.md`. 게이트가 "확인하지 못한 것"으로 남긴 둘(정적 선언이 없는 이름에서 게이트 없는 분기끼리 fold가 다를 때, EVENT-072의 "한 로드에 한 번"이 `VALIDATOR_COMPILE_FAILED`에서 뜻하는 것)은 §2의 최종 검증(E)에 넣는다.

## 2. 다음 할 일 — 순서대로

1. **최종 논리 정합성 검증 — 끝났다(2026-09-27).** codex·antigravity에 같은 지시서(A–E)를 돌려 13건(겹침 제외)을 받았고, 검증 뒤 모두 18C-105로 닫았다. 원문·판정·고침 명세는 `reviews/raw-round18-final-check.md`. 다시 돌릴 때의 지시서 골격은 다음과 같다.
   - (A) 현행 항목끼리의 모순: 같은 상황에 다른 결과, 같은 이름의 두 뜻, 개수·코드 이름·PR 배정·순서·기본값의 불일치. 18라운드 항목(특히 89–103과 소유자 답 24–37에서 온 항목) 대 다른 영역의 옛 현행 항목을 가장 세게 본다.
   - (B) 끊긴 가리킴: `대체됨`·`중복`의 대상이 내용을 들지 않음, `분할됨`이 부모를 다 덮지 않음, 충돌의 이긴 쪽이 틀림.
   - (C) 소유자 답과 어긋나는 결정, 편집자 추론을 소유자 답처럼 적은 귀속.
   - (D) 현행인데 선택을 미룬 결정. 누가 언제 정하는지 없이 "미정", "나중에"라고 적은 것. (알려진 보류: 객체·원시 혼합 `oneOf`의 허용 — 소유자 답 33행이 "지금은 오류"로 정했고 나중에 풀어도 파괴적 변화가 아니다.)
   - (E) 18C 블록끼리의 불일치. 특히 U7(전이 단계의 재해석, BLUEPRINT-041) 대 정착 예산(SETTLE-017·047), 유효 목록(게이트) 대 VALUE-030의 경고등 정의.
   - 출발점은 `reviews/round-18-closing.md` 전체다. 블록마다 이름·코드·번호로 원장을 grep해 같은 주제의 현행 항목과 대조하고, 끝으로 개수와 이름을 17개 파일 전체에서 훑는다.
   - 지적 양식은 한 건마다 `F<n> <높음|중간|낮음>`, 두 항목과 상태, 원문 인용(`path:line`), 왜 모순인가, 제안(어느 쪽이 이기는가, 또는 "소유자 물음")이다.
   - 원문과 판정은 `reviews/raw-round18-final-check.md`에 적는다(`reviews/raw-round18-ledger-check.md`가 선례). 검증자가 원문과 대조해 거른 뒤 고침 명세로 반영한다. 지시서 초안은 세션 scratchpad의 `brief-final-check.md`였다(저장소에 없으므로 위 다섯으로 다시 쓴다).
2. **설계 완료 확정과 개발계획 — 끝났다(2026-09-27).** 설계 PR #345는 `1.0.0-beta`에 머지됐다. 소유자의 개발계획 결정(`reviews/round-18-owner-answers.md:42-46`)은 원장에 반영됐다: LANDING-204(우산 구조와 개발 PR 여섯 — 기반+청사진, 노드 트리·정착, 파생+상태 키·제어, 통지·검증, 배열, 전환), LANDING-205(`src/__legacy__/`는 PR-8까지 참고용 보존, 삭제는 PR-8), LANDING-206(ajv 셋은 PR-4, UI 플러그인 넷은 플러그인 PR), PROCESS-067(PR 디렉토리마다 문서 셋, 절차는 seiri·filid), LANDING-060 보충(설계문서는 별도 PR). 계획서는 `plan/<순서>-<이름>/`에 있다. 개발 PR은 그 디렉토리만 보고 진행하고, 착수 전 남은 소유자 결정은 05의 명령 메서드 이름·형·`FormHandle` 대칭(EVENT-073)이다.
3. **원장에서 ADR과 설계문서를 만든다 — 끝났다(2026-09-29, 단계 01).** 결정마다 원장 번호를 단다. 설계문서 여덟은 `design/`, ADR 열일곱은 `adr/`에 있다. 만든 뒤 §4의 검사를 원장 대 새 문서로 한 번 더 돌렸다(`doc-coverage.mjs`: 현행 항목의 인용, 틀린 ID, 결정 토큰, 문장마다의 ID 표지). 문장이 원장과 같은 뜻인지는 조각마다의 두 방향 대조와 해상도 대조가 보았다. union의 설계문서는 `reviews/raw-round18-union-swarm/merged-v3.md`의 묶음과 순서만 참고하고, 문장은 원장 결정 칸에서 옮긴다(PROCESS-050·051). 과정의 기록은 `plan/01-design-docs/log.md`, 해상도 대조는 `reviews/raw-design-docs-check.md`.
4. **옛 문서를 백업 디렉토리로 옮긴다 — 끝났다(2026-09-29).** 옛 문서(00–09, `open-questions.md`, 옛 ADR 0001–0014)는 `_archive/2026-09-29/`에 동결됐다. 원장이 인용한 옛 경로는 `ledger/checks/lib.mjs`의 `ARCHIVE_ROOT`가 백업본으로 읽는다. 소유자의 절 단위 통과는 새 설계문서에서만 한다(12-6).
5. **PR-0**(문서 최종화, 프로토타입 v7, 시나리오 패키지 뼈대, vitest `test.projects`), 그다음 **PR-1**. PR 계획은 원장 LANDING 영역(`ledger/landing.md`)이 정본이다. 프로토타입 v7은 18C-88의 방출 규칙과 18C-91의 규칙 A(`isMember`·`convert`·`interpret`, 동점 12건)를 따른다. v6은 빈 루트를 `undefined`로 낸다.
   - **소유자 메모(2026-09-27, 설계서 검토, `reviews/round-18-owner-answers.md` 38–41행) — 반영됨(2026-09-27, 소유자 지시)**: (38) 청사진 내부 이름은 약어 없이(`PropertyDecl` → `PropertyDeclaration` 같은 풀 네임) → BLUEPRINT-046, BLUEPRINT-002에 보충·충돌. (39) 조각의 구현 타입 이름은 `SchemaFragment`(개념어 "조각"과 FRAGMENT 영역 이름은 그대로) → BLUEPRINT-047, BLUEPRINT-002에 보충·충돌. 둘은 PR-1의 청사진 `DETAIL.md`·`type.ts`가 적는다. (40) 명령 넷(`focus`·`select`·`refresh`·`remount`)은 메서드 넷이 아니라 명령 종류를 매개변수로 받는 노드 메서드 하나(`action`·`interaction`·`request` 또는 명령 한정 `publish`) → EVENT-073; 메서드 이름·값의 형·`FormHandle` 대칭 모양은 PR-4 착수 전에 편집자가 권장안을 올리고 소유자가 정한다. EVENT-063·SURFACE-011·SURFACE-058·LANDING-170에 보충·충돌(겉면 수 약 57 → 약 54). (41) 경고등 공개 이름 확정: 게터 `typeMismatch`·목록 `typeMismatches`·코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH` → SURFACE-061; 가칭을 결정문에 든 현행 항목 열둘(BLUEPRINT-041, ERROR-186, ERROR-198, LANDING-126, NODE-058, REACT-032, REACT-033, SURFACE-052, SURFACE-058, VALUE-030, VALUE-037, WRITE-079)에 보충·충돌, 보충만 든 항목 6개(ERROR-164, NODE-041, REACT-027, SURFACE-010, TEST-077, WRITE-093)에 보충. 시험 파일 이름 `union.mismatch-light.test.ts`는 그대로다. LANDING-127은 가칭을 들지 않아 손대지 않았다. 네 행은 `ledger/checks/owner-answers.tsv`에 더했고(235건), `reviews/round-18-closing-summary.md` §D에는 넣지 않았다.
   - PR-2 게이트에 반드시 넣을 시험: 규칙 A 표 전체와 동점 12건, `integer` 멤버십, 게이트 켜짐·꺼짐 전이에서 경고등만 바뀌고 값은 바뀌지 않음, `setValue({kind:'num', a:'42'})`가 직전 상태와 무관하게 `a = 42`(U7), 서로소 게이트 둘의 충돌(TEST-077).
- **성능 최적화는 구현 완료 뒤의 별도 작업이다(27라운드 소유자 답).** PR-2~PR-7에서는 느린 행을 고치지 않고 `verification/03-node-and-settle/performance.md`에 기록만 남긴다. 구현이 끝나면 그 기록을 참고 데이터로 삼아 최적화를 따로 요청받아 시작한다(섞이지 않게 분리). 단계를 가로지르는 속도 문제 대장은 `verification/performance-issues.md`이며(04에서 시작, 03·04의 성능 기록을 가리킨다), 구현을 마친 뒤 최적화 작업의 출발점이다. 그 작업의 계획서 셋은 plan 아래 perf-optimization 디렉토리(M0 측정판 고정 → M1 분류·우선순위 → M2 묶음별 PR → M3 종합 재측정·수용; 07 머지 뒤 착수, 08과 병렬, 09 전)이며, 원장 항목을 더하지 않고 동작 불변·측정·원장 불변을 게이트로 둔다.
- **원장 관리자 세션의 인수(2026-10-03, 89라운드 뒤, 소유자 지시로 세션 종료).** 소유자는 원장 관리자 역할을 세웠다: 단계 세션의 원장 물음에 편집자 결정(라운드)으로 답하고, 소유자의 직접 말만 소유자 라운드로 적으며, 소유자가 직접 답해야 하는 것만 대기를 알리고 묻는다. 07 전환 세션은 소유자 지시로 함께 닫혔고 재개 지점을 가지 feat/schema-form-switch의 커밋 b31125119에 두었다(plan/07-switch/log.md 0절: 게이트 스물넷 통과·서른셋 가운데, 열린 게이트와 순서는 88라운드 마무리 → 89라운드 정적 첫 로드 구현 → 분기 전환 정착 진단 → 되먹임의 개발 모드 경고(81라운드 3번) → 원장 대 구현 대조 게이트의 재검증 → 나머지 게이트; 게이트 원장 사본은 plan/07-switch/gates-snapshot.md). 07 워크트리에는 중단된 codex 작업(88C-02 정리, 88C-01 b3, array-1000 재측정)의 미완성·미검증 변경이 커밋되지 않은 채 남아 있으므로 다음 07 세션이 먼저 처분한다. 원장 쪽에서 열린 것(종료 시점 기준이며, 두 세션은 그 뒤 재개되어 이후의 진행은 1절의 최신 라운드 요지에 있다): 기다리는 것은 07의 정적 첫 로드 구현과 재측정(85C-01 목표, 86C-01 측정 조건), 그 뒤 분기 전환 정착의 단계별 진단과 설계안(89C-05), 목표에 못 미친 행이 남으면 수치·b1·b2의 절감 상한·뒤집힐 항목과 함께 소유자에게 올리는 일(86C-02, 84·87라운드 소유자 답). 성능 게이트 G26은 그때까지 열려 있고 PR-7은 머지되지 않는다. 소유자에게 대기 중인 결정은 없다. 라운드를 닫는 절차와 도구는 3절 끝에 있다.

## 3. 일하는 법

**물음을 내는 법.** 소유자는 유도할 수 있는 것은 묻지 않기를 원한다.
- 원리, 앞선 소유자 답, 채택된 ADR, 현행 원장 항목, 패키지 설계 가치(`packages/canard/schema-form/CLAUDE.md` Design Values)로 갈리는 것은 편집자가 【추론】으로 닫는다.
- 소유자에게는 가치가 서열 없이 부딪치고 사용자에게 보이는 결과가 갈리는 것만 묻는다.
- 물은다면 "배경 → 왜 묻는가 → 예시 → 선택지와 결과 → 관련 원장 번호"를 붙인다. 마크다운 한 장을 `/preview`로 띄워 댓글로 받는다.
- 소유자가 "정합하면 채택"으로 위임한 결정은 검증자로 검증하고, 검증이 찾은 결함을 고친 형태로 채택한다. 소유자 답에는 위임 원문과 검증 결과 파일을 함께 적는다(37행이 선례).

**답을 기록하는 법.** `reviews/round-18-owner-answers.md`에 행 하나를 더한다.
- 칸: 번호, 물음, 답(원문 그대로, 날짜), 반영(원장에 어떻게 적히는지). 반영 칸이 원장 항목의 정본 글이 된다(WRITE-078, BLUEPRINT-036이 선례).
- `ledger/checks/owner-answers.tsv`에 그 줄을 더한다(열: `path:line`, 라운드, 라벨, 답의 첫 80자).
- 소유자 답이 앞선 답이나 18C 블록의 문장을 대체하면 그 항목은 `분할됨(→ 나머지 항목, 새 항목)`이 되고, 나머지 항목은 살아남은 문장만 정확히 인용한다. 표 행이라 `#n` 조각으로 나눌 수 없으면 출처에 그 사정을 적는다.

**결정을 적는 법.**
- 새 결정은 먼저 정본 문서에 블록으로 적는다. 블록은 닫는 항목·결정·근거·게이트로 이루어지고, 결정은 한 줄에 한 문장이다.
- 원장은 그 줄을 글자 그대로 인용한다. 그래서 정본을 고칠 때는 줄 수를 바꾸지 않고 제자리에서 고치고, 원장에서 그 줄을 인용한 곳을 같은 글로 맞춘다.
- 새 결정은 파일 끝에 새 블록으로 붙인다. 근거가 세션 작업 파일이면 먼저 `reviews/raw-*/`로 옮기고 그 경로를 인용한다(scratchpad 경로는 커밋에 남지 않는다).

**원장에 반영하는 법.** 먼저 번호를 모두 미리 배정한 계획을 만들고, 영역별로 병렬 반영한 뒤, 영역별 검증자가 본다. 규칙은 다음과 같다.
- **집.** 블록의 결정·게이트 줄은 모두 어떤 항목의 결정 칸에 있어야 한다(첫 출처가 `(정본)`인 항목). 옛 항목의 보충에만 두지 않는다. 이주 줄은 LANDING의 이주 행이 든다.
- **옛 항목.** 결정이 물음·주제·미정이면 `대체됨(→ 새 번호)`, 여럿으로 나뉘면 `분할됨(→ …)`이다. 이때 이번 라운드가 보충에 더한 같은 줄은 지운다. 규칙이 그대로 유효하면 `현행`으로 두고 보충을 교차 참조로 남긴다. 행을 나눌 수 없는 표 항목은 충돌 줄로 적는다.
- **게이트 줄**(PR·무엇·통과·실패)은 결정이다.
- **옛 글은 자라기만 한다.** 옛 결정과 옛 줄은 고치지 않는다. 이번 라운드가 더한 것은 되돌릴 수 있다. 옛 항목의 제목은 현행 항목의 낡은 가리킴만 고친다.
- **충돌 줄 모양:** `` `path:line`의 "원문"은 N라운드 결정과 다르다: 새 규칙(번호). N라운드 결정이 이긴다(`정본:줄`). `` 소유자 답이 이기면 `소유자 답이 이긴다(`reviews/round-18-owner-answers.md:N`)`.
- **가리킴:** `대체됨`·`분할됨`의 목록은 옛 내용을 드는 항목을 모두 적는다. 항목을 분할하면 §4의 분할 포인터 풀기를 먼저 돌린다.
- **닫은 사람:** 18라운드 내용은 편집자 결정이다. 소유자 답은 그 답이 규칙을 정할 때만 닫은 사람이 된다.

**규칙 셋(변하지 않음).**
1. 소유자 답은 고정이다. 어긋나는 결론은 소유자 물음이 된다.
2. 원칙으로 정해지지 않고, 서열 없는 가치가 부딪치며, 사용자에게 보이는 결과가 갈리는 것만 소유자에게 간다. 나머지는 편집자나 스웜이 정하고, 닫은 사람에 그렇게 적는다.
3. 오류는 삼키지 않는다.

**라운드를 닫는 절차(68라운드부터의 관례, 89라운드까지 그대로).** 단계 세션의 물음이 오면 관련 원장 항목을 읽고 reviews 디렉토리에 round-NN-closing.md를 쓴다. 머리글은 날짜·누가 무엇을 물었는가·편집자 결정으로 닫는다는 선언이고, 결정 블록은 NNC-kk 제목, 닫는 항목, 결정(추론 표지 한 줄), 근거다. 소유자의 직접 말은 round-NN-owner-answers.md의 표(확인, 물음 요지, 답 원문, 반영)에 적고 owner-answers.tsv에 행을 더한다. 보충은 sup-insert.mjs가 결정 줄을 글자 그대로 인용해 항목에 넣고, round-close.mjs가 PLAN 5절·PLAN-LOG 1절·HANDOFF 1절(최신 라운드 셋만, 가장 오래된 것은 PLAN-LOG 2절로)·HANDOFF 5절 지도를 갱신한다. 그다음 4절의 검사를 모두 돌린다(토큰 잔여는 사백칠십구에서 변하지 않아야 하고, HANDOFF의 새 글은 역따옴표 파일 이름과 숫자 표기를 피한다). 커밋은 바뀐 파일을 경로로 지정해 하고(원장 관리자는 ledger, reviews, HANDOFF, PLAN 5절과 소유자가 청한 절, PLAN-LOG, ledger/checks만 고친다), 커밋 전에 현재 가지가 1.0.0-beta인지 확인하며, 커밋마다 밀어 올린다. 단계 세션에는 결정 요지와 다음 라운드 번호를 보낸다. 단계 세션의 허가 차단을 대신 풀어 주지 않는다 — 원장 판단만 주고 허가는 소유자에게 돌린다.

## 4. 검사 명령 (`architecture/`에서, 모두 문제 0이어야 한다)

```
node ledger/checks/expand-split-pointers.mjs ledger/checks/sentence-classified.tsv -- ledger/*.md   # 분할한 항목이 있으면 먼저
node ledger/checks/verbatim-check.mjs . ledger/*.md
node ledger/checks/sup-check.mjs . ledger/*.md
node ledger/checks/ref-check.mjs ledger/*.md
node ledger/checks/owner-cited.mjs ledger/checks/owner-answers.tsv ledger/*.md
node ledger/checks/bundle.mjs . ledger/checks/section-map.tsv $TMPDIR/bundles
for d in GOAL SCHEMA CONTROLS BLUEPRINT FRAGMENT VALUE WRITE SETTLE EVENT VALIDATE ERROR NODE REACT SURFACE LANDING TEST PROCESS; do
  node ledger/checks/sentence-check.mjs $TMPDIR/bundles/bundle-$d.md ledger/checks/sentence-classified.tsv ledger/*.md | tail -1; done
node ledger/checks/tokens.mjs inventory $TMPDIR/inv.json _archive/2026-09-29/0*.md _archive/2026-09-29/open-questions.md _archive/2026-09-29/adr/*.md README.md HANDOFF.md
node ledger/checks/tokens.mjs check $TMPDIR/inv.json ledger/*.md | head -1   # 잔여의 판정은 ledger/checks/token-review.md
node ledger/checks/plan-links.mjs plan/README.md plan/*/*.md -- ledger/*.md   # 개발계획서가 인용한 ID는 모두 현행, PR 정의 항목은 모두 인용됨
node ledger/checks/doc-coverage.mjs design/*.md adr/*.md -- ledger/*.md   # 설계문서·ADR 역검사: 현행 항목 모두 인용, 틀린 ID 없음, 결정 토큰, 꼬리표 없는 문장 없음
```

- **원천 묶음.** `bundle-*.md`는 `section-map.tsv`에서 언제든 다시 만든다.
- **문장 검사.** 인용을 먼저 보고 분류 행을 본다. 그래서 인용된 문장에 남은 낡은 분류 행은 무해하다.
- **토큰 잔여.** 지금 484이다(25·26라운드 뒤. 옛 문서 이동과 README·HANDOFF 재작성 뒤에는 485였다). 옛 문서에 원천이 있는 잔여(419)는 HEAD 잔여의 부분집합이고, 나머지(66)는 README·HANDOFF의 자기 서술 토큰이다(`ledger/checks/token-review.md`).
- **`verbatim-check`의 한계.** 인용한 줄이 출처 파일 어딘가에 있는지만 본다. 그래서 줄 범위가 틀리거나, 줄이 빠지거나, 순서가 바뀐 것은 잡지 못한다.
  - 18라운드에서는 세션 scratchpad의 임시 스크립트 셋(`exact-check.mjs` 정확 일치, `block-check.mjs` 블록 덮개와 항목↔블록 이름, `diff-guard.mjs` 옛 항목은 자라기만 한다)으로 이것을 보았다. 저장소에는 없다. 정본 블록을 새로 반영할 때는 같은 대조를 다시 만든다(각 40–80줄).

## 5. 파일 지도

| 파일 | 무엇 |
| --- | --- |
| `PLAN.md` | 개발의 단일 진입점 — 계획 링크, 수행 방법, 단계별 진행 상황, 다음 할 일. PR을 열고 머지할 때마다 갱신. 기록 표는 마지막 행만 두고 나머지는 PLAN-LOG.md |
| PLAN-LOG.md | 기록 — 1절 날짜·무엇·어디의 표(라운드·PR·머지마다 한 행, 끝에만 덧붙임), 2절 라운드별 요지(이 문서 1절에서 옮긴 문단, 19라운드부터). 둘 다 append-only |
| `ledger/README.md` | 원장의 형식, 정본 우선순위, 상태·닫은 사람·분류의 허용값, 검사, 18라운드부터의 규칙 |
| `ledger/<영역>.md` ×17 | 원장. 머리 + 색인 표 + 항목 |
| `ledger/checks/*.mjs` | 검사 도구(`lib.mjs`의 문장 분할이 조각 출처 `path:line#n`의 기준) |
| `ledger/checks/section-map.tsv` | 옛 문서를 절 단위로 영역에 배정한 표(421절) |
| `ledger/checks/sentence-classified.tsv` | 원장에 인용되지 않은 문장의 분류(RESTATES·VIEW·HISTORY·OUT) |
| `ledger/checks/owner-answers.tsv` | 기록된 소유자 답 목록(242) |
| `ledger/checks/token-review.md` | 토큰 검사 잔여의 판정 |
| `ledger/checks/doc-coverage.mjs` | 설계문서·ADR 역검사(원장 → 문서). 영역을 좁힐 때는 `--areas`, 픽스처는 `ledger/checks/fixtures/doc-coverage/` |
| ledger/checks/round-close.mjs | 라운드를 닫은 뒤의 장부 갱신(PLAN 5절·PLAN-LOG·HANDOFF 1절과 5절). 쓰는 법은 파일 머리 |
| ledger/checks/sup-insert.mjs | 닫기 문서의 결정 줄을 글자 그대로 인용해 항목에 보충으로 넣는 도구. 계획은 JSON 파일 |
| `ledger/checks/doc-token-exempt.tsv` | `doc-coverage`의 토큰 예외(이긴 충돌·가리킴 바꿈·정비 문장만, 행마다 까닭) |
| `design/*.md` ×8 | 설계문서. 원장을 읽는 표면이며 문장 끝 괄호의 ID가 근거다(단계 01, 2026-09-29) |
| `adr/*.md` ×17 | ADR 0001–0017. 본문은 설계문서의 같은 절을 글자 그대로 모은 것이다 |
| `_archive/2026-09-29/` | 동결한 옛 문서(00–09, `open-questions.md`, 옛 ADR 0001–0014). 원장의 옛 줄 인용은 커밋 `ba398c330` 기준 |
| `plan/README.md`, `plan/<순서>-<이름>/` | 개발계획(2026-09-27): 우산 구조(`1.0.0-beta`, PR #344)와 순서, PR 디렉토리 열 개(01 설계문서 … 09 정리·릴리스, 릴리스 전환)마다 문서 셋 — `request.md`(개발요청서, 원장 링크), `verification.md`(검증 구성요건), `adr-and-axes.md`(ADR과 핵심 축). 형식은 PROCESS-067. 계획서는 안내이고 원장 항목이 명세다 — 2026-09-27의 전수 대조가 원장을 잃은 요약 문장을 원장 원문 인용으로 바꿨고, 계획서와 원장이 다르면 원장대로 가며 멈추지 않는다(`PLAN.md` §2 1항) |
| `reviews/round-18-closing.md` | 18라운드 편집자 결정의 정본(18C-01…105) |
| `reviews/round-18-closing-summary.md` | 소유자 검토용 요약(원장이 인용하지 않음). §D가 검토 결과 |
| `reviews/round-18-agenda.md` | 18라운드 안건. 행마다 닫힘 표지 |
| `reviews/round-18-owner-answers.md` | 18라운드 소유자 답(원문). 23행은 닫기 방식, 24–37행은 검토 결과와 union 설계, 38–41행은 설계서 검토 메모, 42–46행은 개발계획 결정(2026-09-27, 원장 반영됨) |
| `reviews/round-19-closing.md` | 19라운드 편집자 결정의 정본(19C-01 형 없는 객체·배열 분기 호스트, 19C-02 `const`만 있는 칸). 표지 없는 줄은 소유자 답이 정한 규칙 |
| `reviews/round-19-owner-answers.md` | 19라운드 소유자 답(원문). 7행 형 없는 객체 호스트, 8행 `const`만 있는 프로퍼티(X1) |
| `reviews/round-20-closing.md` | 20라운드 편집자 결정의 정본(20C-01 새 설계문서와 ADR의 근거 표기는 문장 끝 괄호 안에 원장 ID). 소유자 답 없음 |
| `reviews/round-21-closing.md` | 21라운드 편집자 결정의 정본(21C-01 호출 수준 억제 비트는 뒤이은 포커스 아웃 `trim`에 듣지 않음, 억제 자리는 Form 속성뿐). 소유자 답 없음 |
| `reviews/round-22-closing.md` | 22라운드 편집자 결정의 정본(22C-01 `resetSubtree()`의 로드에서 `injectTo` 발화와 채움은 그 하위 트리에만). 소유자 답 없음 |
| `reviews/round-23-closing.md` | 23라운드 편집자 결정의 정본(23C-01 직전 커밋의 활성 집합은 전이 판정에만, 평가 순서 힌트(F13) 폐기). 소유자 답 없음 |
| `reviews/round-24-owner-answers.md` | 24라운드 소유자 답(원문). 7행 PR #348의 편집자 결정(21·22·23라운드, 충돌 줄 해석) 검토 — 동의 |
| `reviews/round-25-closing.md` | 25라운드 편집자 결정의 정본(25C-01~12: 02 청사진 코드와 01 설계문서의 어긋남 16건 — 오류 코드 셋, 시험 이름과 단언, 공집합 판정의 범위, 02가 정한 사실, 01의 상태). 소유자 답 없음 |
| `reviews/round-26-closing.md` | 26라운드 편집자 결정의 정본(26C-01~14: 03(PR-2) 착수 전 해석 여섯 건 — 겉면 멤버의 PR 배분, 렌더 시나리오 게이트의 실행 자리, 뒤 PR 기제를 쓰는 게이트의 나눔, 게이트 평가의 몫과 평가 자리 L, `SHARED_NODE_CONFLICT`의 신호, 루트가 드는 자료의 저장 자리, 재귀 템플릿의 평가 자리 L, 떼어진 노드의 `active`, 자기 부정 게이트의 예산 초과). 소유자 답 없음 |
| `reviews/round-27-owner-answers.md` | 27라운드 소유자 답(원문·요지) 5행: PR-2 벤치의 느린 행 수용, 벤치 기록 문서, React 대 JS 코어 비중, 최종 검사는 React·jsdom(PR-7 게이트), 최적화는 구현 완료 뒤 |
| `reviews/round-30-owner-answers.md` | 30라운드 소유자 답: D-1 명령 메서드의 한 호출 한 종류·값은 비트 별칭 열거. 나머지 D-1 답은 직접 확인 뒤 행 추가 |
| `reviews/round-31-closing.md` | 31라운드 편집자 결정 다섯: 05 착수 뒤의 원장 해석(진입 밖 명령 배달, 운영 모드 경고의 둘째 예외, `reason` 값, 차등 시험의 독립 검증기, 가칭 확정 절차) |
| `reviews/round-32-closing.md` | 32라운드 편집자 결정 둘: `validatorFactory` 계약 통일의 공개 겉면 시점(PR-7), `VALIDATOR_BIND_REFUSED`가 던지는 객체 |
| `reviews/round-33-closing.md` | 33라운드 편집자 결정 하나: 배열 쓰기 동사의 `dispatch` 진입 파일 분담(05·06 병렬) |
| `reviews/round-34-closing.md` | 34라운드 편집자 결정 둘: 플러그인용 계약 형의 자리(`ValidatorPlugin`, PR-4가 개정), `JSONSchemaError` 별칭 유지 |
| `reviews/round-35-closing.md` | 35라운드 편집자 결정 열둘: 06 배열 해석 아홉과 05 후속 셋(32C-02 정정 포함) |
| `reviews/round-36-closing.md` | 36라운드 편집자 결정 둘: 배열 연산의 여덟째 행 칸, 옛 튜플 표기의 `additionalItems` 컴파일 |
| `reviews/round-37-closing.md` | 37라운드 편집자 결정 하나: 가지 배열에서 `omitTrailing`이 자르는 것 |
| `reviews/round-38-closing.md` | 38라운드 편집자 결정 둘: 배열 호스트의 잘못된 종류 값, 나간 배열 호스트의 잠복 원본 내용 |
| `reviews/round-39-closing.md` | 39라운드 편집자 결정 하나: 잘못된 종류의 `raw`를 든 가지 호스트의 방출(객체 행 결함, 06이 고침) |
| `reviews/round-40-owner-answers.md` | 40라운드 소유자 답: 차등 시험의 독립 검증기는 ajv 밖에 두지 않음(같은 ajv 경로 비교), 교차 확인은 ajv 아닌 플러그인 PR로 |
| `reviews/round-41-closing.md` | 41라운드 편집자 결정 하나: 템플릿이 다른 튜플 자리의 밀림 |
| `reviews/round-42-closing.md` | 42라운드 편집자 결정 둘: 가상 노드 쓰기 분배·그림자 기록 결함의 귀속(06)과 고치는 내용 |
| `reviews/round-43-closing.md` | 43라운드 편집자 결정 하나: 전역 상태 유도 기제의 PR 귀속(PR-4)과 자리 |
| `reviews/round-44-closing.md` | 44라운드 편집자 결정 하나: 비례하지 않는 비용 둘은 계약 위반이라 06이 고침, 남는 느린 행만 소유자 수용 |
| `reviews/round-45-closing.md` | 45라운드 편집자 결정 하나: 가상 노드 분배는 쓰기 종류를 그대로 넘김 |
| `reviews/round-46-closing.md` | 46라운드 편집자 결정 하나: 가드 인스턴스의 루트 중복 컴파일은 느린 행, B안 금지, A안은 소유자 물음 |
| `reviews/round-47-closing.md` | 47라운드 편집자 결정 둘: 원본 트리의 배열 자리 수 보존, 없음 위의 미는 동사 |
| `reviews/round-48-closing.md` | 48라운드 편집자 결정 둘: 대량 나감의 이차 고리 셋은 06이 고침, 터미널 행의 미는 동사 |
| `reviews/round-49-closing.md` | 49라운드 편집자 결정 하나: 44C-01 수정 범위의 경계 |
| `reviews/round-50-closing.md` | 50라운드 편집자 결정 하나: 옛 오류 형 이름은 호환 확장으로 |
| `reviews/round-51-closing.md` | 51라운드 편집자 결정 하나: 게이트 호스트의 아이템마다 재조립은 06이 고침 |
| `reviews/round-52-owner-answers.md` | 52라운드 소유자 답 셋: 느린 행의 완료점 기준 재측정, 가드 직접 컴파일의 조건부 수용, 범위 경계 확정 |
| `reviews/round-53-closing.md` | 53라운드 편집자 결정 하나: 직접 컴파일 경로의 가드 실패 단위 |
| `reviews/round-54-owner-answers.md` | 54라운드 소유자 답: 06 느린 행 P-14 수용, P-13 닫힘 |
| `reviews/round-55-closing.md` | 55라운드 편집자 결정 셋: 가드 실패 둘의 묶음, 문서화된 한계 둘, 가칭 확정 |
| `reviews/round-56-owner-answers.md` | 56라운드 소유자 답: 05 느린 행 넷 수용, 느린 행 수용의 일반 규칙 |
| `reviews/round-57-closing.md` | 57라운드 편집자 결정 하나: 정착 도중 살아 있는 노드 읽기는 직전 커밋 |
| `reviews/round-58-closing.md` | 58라운드 편집자 결정 하나: 정착 오류 묶음은 종류를 가리지 않음 |
| `reviews/round-59-closing.md` | 59라운드 편집자 결정 하나: 오류 세부의 출처 경로 |
| `reviews/round-60-closing.md` | 60라운드 편집자 결정 하나: 시나리오 가족 디렉토리의 문서와 검사 예외 |
| `reviews/round-61-closing.md` | 61라운드 편집자 결정 하나: 가칭 처분의 기록 |
| `reviews/round-62-closing.md` | 62라운드 편집자 결정 하나: 배치 안의 배열 동사 |
| `reviews/round-63-closing.md` | 63라운드 편집자 결정 셋: 통합 뒤의 느린 행 귀속, 제거의 전체 훑기, 키 입력의 사본 |
| `reviews/round-64-owner-answers.md` | 64라운드 소유자 답 하나: 통합 뒤 느린 행의 속도 개선 지시 |
| `reviews/round-65-closing.md` | 65라운드 편집자 결정 넷: 느려진 추세의 진단, 상수 몫의 범위, 구조 몫 둘의 처분, 곁다리 열린 행 |
| `reviews/round-66-closing.md` | 66라운드 편집자 결정 하나: 배달 변경 판정의 동등 |
| `reviews/round-67-closing.md` | 67라운드 편집자 결정 하나: 깊은 비교의 자리와 배달의 참조 비교 |
| `reviews/round-68-closing.md` | 68라운드 편집자 결정 열: 07 전환 착수의 물음(처분표·이주 점검표·명령 메서드·벤치 기준선·경로·changeset·플러그인 경계·ERROR-117 모양·스파이크·React 18) |
| `reviews/round-69-closing.md` | 69라운드 편집자 결정 다섯: 07이 코어에서 찾은 빈자리(바인딩 통로·폐기·reset 외부 오류·원자 판정·마운트 검증 시점) |
| `reviews/round-70-closing.md` | 70라운드 편집자 결정 하나: `nodeFromJSONSchema`의 새 서명 |
| `reviews/round-71-closing.md` | 71라운드 편집자 결정 하나: `core/types`의 노드 형 둘을 레거시로 옮김 |
| `reviews/round-72-closing.md` | 72라운드 편집자 결정 하나: Refresh 대상의 "쓴 입력 제외"는 입력 출처 통로의 것 |
| `reviews/round-73-closing.md` | 73라운드 편집자 결정 하나: 레거시 안의 `<Form>` 렌더 시험 두 파일의 처분 |
| `reviews/round-74-owner-answers.md` | 74라운드 소유자 답 하나: 레거시의 완전 분리(규칙 2 폐기, 사본, 호환 별칭 종료) |
| `reviews/round-75-closing.md` | 75라운드 편집자 결정 하나: 레거시 안의 공개 `<Form>` 시험 두 파일은 지움, 이주 안내의 자리 |
| `reviews/round-76-owner-answers.md` | 76라운드 소유자 답 하나: 새 단계 "정돈"(08 뒤, 최적화 앞) |
| `reviews/round-77-closing.md` | 77라운드 편집자 결정 하나: 옛 스토리의 처분은 PR-7 안에서 끝남(발판 허용) |
| `reviews/round-78-closing.md` | 78라운드 편집자 결정 둘: 중단 파일 다섯의 처분, 재귀 확장 차단은 03 결함 |
| `reviews/round-79-closing.md` | 79라운드 편집자 결정 하나: `globalErrors`의 내용은 오늘과 같음 |
| `reviews/round-80-closing.md` | 80라운드 편집자 결정 셋: 이주 행 LANDING-209·210 신설, 메운 빈 곳 셋의 귀속 |
| `reviews/round-82-closing.md` | 82라운드 편집자 결정 하나: 성능 게이트 백아홉 행의 네 갈래 처분 |
| `reviews/round-83-closing.md` | 83라운드 편집자 결정 하나: 성능 진단 뒤의 소유자 묶음 확정과 원 표본 보존 |
| `reviews/round-84-owner-answers.md` | 84라운드 소유자 답 둘: 느린 행 묶음 불수용(목표 속도 선행), 번들 크기 수용(뒤로) |
| `reviews/round-81-owner-answers.md` | 81라운드 소유자 답 하나: 이펙트 되먹임은 3번(코어 불감지, 문서 예방, 개발 모드 경고) |
| `reviews/round-85-closing.md` | 85라운드 편집자 결정 하나: PR-7의 목표 속도 셋 |
| `reviews/round-86-closing.md` | 86라운드 편집자 결정 둘: React 층 측정 조건, 구조 후보 셋의 처분과 순서 |
| `reviews/round-87-owner-answers.md` | 87라운드 소유자 답 하나: 속도의 원칙 둘, 구조 변경은 PR-7에서 |
| `reviews/round-88-closing.md` | 88라운드 편집자 결정 둘: b3 좁은 변형 승인, 측정 파일 정리 |
| `reviews/round-89-closing.md` | 89라운드 편집자 결정 다섯: 정적 첫 로드 설계안의 승인과 조건, 분기 전환 정착의 진단을 다음 과제로 |
| `reviews/round-90-closing.md` | 90라운드 편집자 결정 둘: 배열 기본값이 만든 아이템의 채움은 범용 정착의 결함, 정착 도중의 동기 보고 둘의 수정 |
| `reviews/round-91-owner-answers.md` | 91라운드 소유자 답: 분기·조건 폼의 속도 목표와 판정 기준 셋 |
| `reviews/round-92-closing.md` | 92라운드 편집자 결정 셋: 기본값만의 되풀이는 원본 없는 사슬, 사슬 길이 기준, 새 가지 아래의 라운드 세기 |
| `reviews/round-93-closing.md` | 93라운드 편집자 결정 하나: 게이트 판정의 측정 방법 고정 |
| `reviews/round-94-closing.md` | 94라운드 편집자 결정 셋: 치우침을 뺀 판정과 종단 측정, 1.0배 행의 판정, 다음 진단의 세 절 |
| `reviews/round-95-closing.md` | 95라운드 편집자 결정 하나: 종단 측정의 끝과 대기의 빼기 |
| `reviews/round-96-closing.md` | 96라운드 편집자 결정 하나: 게이트 재평가를 판별 선택 표와 결과 재사용의 두 범위로 엶 |
| `reviews/round-97-closing.md` | 97라운드 편집자 결정 셋: 게이트 선택 설계안의 조건부 승인, 판별 게이트의 같음 판정, 무관한 키 입력의 계수 |
| `reviews/round-98-closing.md` | 98라운드 편집자 결정 하나: 파생의 수렴 확인 라운드를 건너뛰는 조건 |
| `reviews/round-99-closing.md` | 99라운드 편집자 결정 하나: 판별 선택 표의 되돌림과 진단 방법의 교체 |
| `reviews/round-100-closing.md` | 100라운드 편집자 결정 하나: 청사진 분석을 먼저 줄이고 공유 계약은 뒤로 |
| `reviews/round-101-closing.md` | 101라운드 편집자 결정 하나: 분석의 기록 구조 설계안을 코드 수준 묶음과 병행 |
| `reviews/round-102-closing.md` | 102라운드 편집자 결정 하나: 청사진 기록의 운영 모드 동결 집합 |
| `reviews/round-103-closing.md` | 103라운드 편집자 결정 하나: 청사진 기록의 불변 장치 owned-inline |
| `reviews/round-104-owner-answers.md` | 104라운드 소유자 답 셋: 작은 폼 코어 갱신 수용, 비교 기준과 rjsf, 가능한 범위 |
| `reviews/round-105-closing.md` | 105라운드 편집자 결정 하나: 잡음보다 작은 이득의 채택 판정은 아홉 회차 부트스트랩 |
| `reviews/round-106-closing.md` | 106라운드 편집자 결정 하나: 수용 범위의 해석과 갱신 쪽으로의 이행 |
| `reviews/round-107-closing.md` | 107라운드 편집자 결정 하나: 갱신 쪽 손질의 계약 범위 |
| `reviews/round-108-owner-answers.md` | 108라운드 소유자 답 둘: 코어 마운트 다섯 행 수용, 청사진 공유 계약 미룸 |
| `reviews/round-109-closing.md` | 109라운드 편집자 결정 하나: 측정기 수정과 분기 기준 ① 미달의 귀속 |
| `reviews/round-110-owner-answers.md` | 110라운드 소유자 답 하나: 첫 갱신 두 행 수용 |
| `reviews/round-111-closing.md` | 111라운드 편집자 결정 하나: 보정 검증 (가)의 형태 |
| `reviews/round-112-closing.md` | 112라운드 편집자 결정 하나: Refresh의 범위와 오류 경계 |
| `reviews/round-113-owner-answers.md` | 113라운드 소유자 답 하나: 분기 폼 장부 작업의 코드 수준 고침과 기준 ①의 해석 |
| `reviews/round-114-closing.md` | 114라운드 편집자 결정 하나: React 갱신 행의 분해와 번들 예산의 처리 |
| `reviews/round-115-owner-answers.md` | 115라운드 소유자 답 하나: 번들 크기의 처분 |
| `reviews/round-116-owner-answers.md` | 116라운드 소유자 답 하나: 속도의 절대 기준(프레임 예산)과 진행 |
| `reviews/round-117-closing.md` | 117라운드 편집자 결정 하나: 분기 변경 1b와 React 층 진단 |
| `reviews/round-118-closing.md` | 118라운드 편집자 결정 하나: React 갱신 판정 열의 정정과 경계 계층 축소 |
| `reviews/round-119-owner-answers.md` | 119라운드 소유자 답 하나: React 층의 설계 원칙 |
| `reviews/round-120-closing.md` | 120라운드 편집자 결정 하나: 분기 변경의 원인 진단과 프록시 감사 |
| `reviews/round-121-closing.md` | 121라운드 편집자 결정 하나: 프록시 감사의 처분 |
| `reviews/round-122-owner-answers.md` | 122라운드 소유자 답 하나: 전역 문맥 변화의 전체 렌더 |
| `reviews/round-123-owner-answers.md` | 123라운드 소유자 답 하나: 문맥 선택 구독 불채택과 memo 유지 |
| `reviews/round-124-closing.md` | 124라운드 편집자 결정 하나: 좁은 교환 규칙 |
| `reviews/round-125-closing.md` | 125라운드 편집자 결정 하나: 측정기의 순서 편향 정정 |
| `reviews/round-126-owner-answers.md` | 126라운드 소유자 답 하나: 가드 분기의 최적화 기준 |
| `reviews/round-127-closing.md` | 127라운드 편집자 결정 하나: 구간의 클러스터 bootstrap과 파이프라인 전체 검토 |
| `reviews/round-128-closing.md` | 128라운드 편집자 결정 하나: 면제 범위의 해석과 회귀 확인 측정 |
| `reviews/round-129-owner-answers.md` | 129라운드 소유자 답 하나: 측정 세션의 분할 |
| `reviews/round-130-owner-answers.md` | 130라운드 소유자 답 하나: 7단계 뒤의 순서 |
| `reviews/round-131-closing.md` | 131라운드 편집자 결정 하나: 순서통계량 구간과 셈의 정정 |
| `reviews/round-132-owner-answers.md` | 132라운드 소유자 답 하나: 7단계 마무리의 운영 |
| `reviews/round-133-owner-answers.md` | 133라운드 소유자 답 하나: 우산 브랜치의 커밋 정리 |
| `reviews/round-134-closing.md` | 134라운드 편집자 결정 하나: 세션 수 절감 |
| `reviews/round-135-owner-answers.md` | 135라운드 소유자 답 하나: 지연과 동시 진행 |
| `reviews/round-136-closing.md` | 136라운드 편집자 결정 하나: 넷 번들 거절, 셋 번들 재판정, F-E 보류 |
| `reviews/round-137-closing.md` | 137라운드 편집자 결정 하나: (가) 실패 재측정, 느린 행 서른하나와 기준 ①의 질의 |
| `reviews/round-138-closing.md` | 138라운드 편집자 결정 하나: 수용 대기 행의 정직 표시와 G26 열린 채 PR |
| `reviews/round-139-closing.md` | 139라운드 편집자 결정 하나: G27 2단계 고침의 측정과 게이트 처리 |
| `reviews/round-140-owner-answers.md` | 140라운드 소유자 답 하나: 측정 원자료의 처분 |
| `reviews/round-141-closing.md` | 141라운드 편집자 기록 하나: PR #354 생성과 열린 게이트의 닫는 길 |
| `reviews/round-142-owner-answers.md` | 142라운드 소유자 답 다섯: 질의 방식, 느린 행 수용, 기준 ① 이월, GC 조건 유지, 형 단언 재검토 |
| `reviews/round-143-owner-answers.md` | 143라운드 소유자 답 둘: 배열 세 행의 시도 충분성 조사와 재판정 지시 |
| `reviews/round-144-owner-answers.md` | 144라운드 소유자 답 하나: 배열 세 행 재판정의 판정 열을 둘로 |
| `reviews/round-145-closing.md` | 145라운드 편집자 결정 하나: 배열 세 행 재판정의 둘째 판정 열 확정 |
| `reviews/round-146-owner-answers.md` | 146라운드 소유자 답 셋: 형 단언 재검토의 공개 형 변경, 콜백 계약, 잔존 1건 |
| `reviews/round-147-owner-answers.md` | 147라운드 소유자 답 하나: 공개 형 변경의 버전은 changeset으로 |
| `reviews/round-148-closing.md` | 148라운드 편집자 결정 하나: 배열 세 행 1단계 결과와 2단계 순서, 대조 세션 |
| `reviews/round-149-owner-answers.md` | 149라운드 소유자 답 하나: isArray overload와 소비 코드 여섯 자리 |
| `reviews/round-150-owner-answers.md` | 150라운드 소유자 답 하나: 형 추론의 원칙과 옛 구조 참고 |
| `reviews/round-151-closing.md` | 151라운드 편집자 결정 하나: 대조 세션 결과와 출발 수치 고정 |
| `reviews/round-152-owner-answers.md` | 152라운드 소유자 답 하나: 레거시 편집 승인과 끝까지 진행 |
| `reviews/round-153-closing.md` | 153라운드 편집자 결정 하나: 다섯 가드 유지와 형 단언 14건의 최종 셈 |
| `reviews/round-154-closing.md` | 154라운드 편집자 결정 하나: 배열 코어 ① 채택과 세 행의 수치 |
| `reviews/round-155-closing.md` | 155라운드 편집자 결정 하나: 배열 코어 ② 채택과 두 열린 항목 |
| `reviews/round-156-closing.md` | 156라운드 편집자 결정 하나: 배열 세 행 최종 수치 확정과 소유자 선택지 |
| `reviews/round-157-owner-answers.md` | 157라운드 소유자 답 둘: 배열 세 행 수용과 replace-200 이월, 격차 원인 추정의 기록 |
| `reviews/round-158-closing.md` | 158라운드 편집자 결정 하나: G27 닫힘과 PR 갱신, 비차단 지적 처분 |
| `reviews/round-159-owner-answers.md` | 159라운드 소유자 답 둘: 쌓은 브랜치로 07b 시작, 순서와 F-E 해제 |
| `reviews/round-160-closing.md` | 160라운드 편집자 결정 하나: 구조 변경의 정규화 동치 기준 |
| `reviews/round-161-closing.md` | 161라운드 편집자 결정 하나: 개선-32 변경 범위와 판정 단위 |
| `reviews/round-162-owner-answers.md` | 162라운드 소유자 답 하나: 개선 항목 배정 확정 |
| `reviews/round-163-closing.md` | 163라운드 편집자 결정 하나: 형 추론 감사 차이 9건의 처분 |
| `reviews/round-164-closing.md` | 164라운드 편집자 결정 하나: formatError 되돌림 철회 |
| `reviews/round-165-closing.md` | 165라운드 편집자 결정 하나: F-E의 구독 규약 예외 |
| `reviews/round-166-owner-answers.md` | 166라운드 소유자 답 하나: 오류 배열 readonly, state flag 세 값, INTENT 예외 |
| `reviews/round-167-closing.md` | 167라운드 편집자 결정 하나: global state flag 형 복원과 키 소멸 시점 |
| `reviews/round-168-closing.md` | 168라운드 편집자 결정 하나: 32a 배열 부분 예산 초과, 확인 측정과 가르는 세션 생략, 맞바꿈 보고 |
| `reviews/round-169-owner-answers.md` | 169라운드 소유자 답 하나: 32a까지만 돌리고 멈춤, 배열 확인 측정 축소 또는 생략, 소유자 브라우저 검토·코드 리뷰 |
| `reviews/round-170-owner-answers.md` | 170라운드 소유자 답 하나: 커밋 1 맞바꿈 수용, 확인 측정은 블록 8개 추세만 |
| `reviews/round-171-owner-answers.md` | 171라운드 소유자 답 하나: #354 리뷰 먼저, 그 결과로 #355 맞춤 |
| `reviews/round-172-owner-answers.md` | 172라운드 소유자 답 하나: G23 개시, 수행 세션 fairy07 |
| `reviews/round-173-owner-answers.md` | 173라운드 소유자 답 하나: 주 에이전트 Claude, codex·antigravity는 교차확인·리뷰 전용 |
| `reviews/round-174-closing.md` | 174라운드 편집자 결정 하나: G23 첫 실행 결과와 스토리 렌더 결함 고침, 실제 IME는 소유자 |
| `reviews/round-175-owner-answers.md` | 175라운드 소유자 답 하나: reviewer 직접 커밋 확인, 스토리 고침 먼저 |
| `reviews/round-176-closing.md` | 176라운드 편집자 결정 하나: G23 재실행 일치, 남은 소유자 몫 둘 |
| `reviews/round-177-owner-answers.md` | 177라운드 소유자 답 하나: ENHANCED_KEY·transformErrors 제거 |
| `reviews/round-178-closing.md` | 178라운드 편집자 결정 하나: errors prop 비배열 가드, key 변형은 새 판 |
| `reviews/round-179-owner-answers.md` | 179라운드 소유자 답 하나: deprecated 타입 전면 교체(개선-37) |
| `reviews/round-180-owner-answers.md` | 180라운드 소유자 답 하나: G23 닫힘, 18C-73 개발 모드·브랜치 노드 한정 |
| `reviews/round-181-owner-answers.md` | 181라운드 소유자 답 하나: 한쪽 지시를 다른 쪽이 따름 |
| `reviews/round-182-closing.md` | 182라운드 편집자 결정 하나: PR-4 표 인용 바로잡음, ESM NODE_ENV 결함 상신 |
| `reviews/round-183-owner-answers.md` | 183라운드 소유자 답 하나: ESM NODE_ENV 고침, 스토리 재구성 검토 |
| `reviews/round-184-closing.md` | 184라운드 편집자 결정 하나: 스토리 재구성 검토안 제출(검토안은 같은 디렉토리의 story-regroup-proposal 문서) |
| `reviews/round-185-owner-answers.md` | 185라운드 소유자 답 하나: 자식 외부 오류의 루트 전파를 경로로 |
| `reviews/round-186-owner-answers.md` | 186라운드 소유자 답 하나: 스토리 재구성 검토안 수용과 시작 |
| `reviews/round-187-closing.md` | 187라운드 편집자 결정 하나: 07c G3의 플러그인 alias 허용, 문서 정합 항목, 검증기 분기 범위 |
| `reviews/round-188-closing.md` | 188라운드 편집자 결정 하나: 외부 오류 변경의 onValidate 통지 복원 |
| `reviews/round-189-owner-answers.md` | 189라운드 소유자 답 하나: bare NODE_ENV 토큰 유지 |
| `reviews/round-190-owner-answers.md` | 190라운드 소유자 답 하나: 제한된 unknown 단언 허용, 동결 상수 한 줄 |
| `reviews/round-191-closing.md` | 191라운드 편집자 결정 하나: G3 완료, batch 가지치기 결함 배정, 복합 설계 결정 |
| `reviews/round-192-owner-answers.md` | 192라운드 소유자 답 하나: 복합 설계 수용, 측정 시점, 07c 위임, 역할 |
| `reviews/round-193-owner-answers.md` | 193라운드 소유자 답 하나: inheritDoc 주석 고침, core·SchemaNode 위계 재설계(개선-38) |
| `reviews/round-194-closing.md` | 194라운드 편집자 결정 하나: G2 완료, 62C-01 범위 |
| `reviews/round-195-closing.md` | 195라운드 편집자 결정 하나: 1라운드 독립 검증 결과와 2라운드 고침 사양 |
| `reviews/round-196-owner-answers.md` | 196라운드 소유자 답 하나: isDevelopment를 모듈 상수로 |
| `reviews/round-197-closing.md` | 197라운드 편집자 결정 하나: 잔여 batch 결함 둘의 배정 |
| `reviews/round-198-owner-answers.md` | 198라운드 소유자 답 하나: 부재 중 운영과 부속 PR 머지, 최종 상태 |
| `reviews/round-199-closing.md` | 199라운드 편집자 결정 하나: G1 완료, 소유자 질의 9번 |
| `reviews/round-200-closing.md` | 200라운드 편집자 결정 하나: 개발 모드 토큰을 사용처마다 |
| `reviews/round-201-closing.md` | 201라운드 편집자 결정 하나: G5 완료, submit 거부의 길 |
| `reviews/round-202-closing.md` | 202라운드 편집자 결정 하나: G4 verifier 거부 처리 |
| `reviews/round-203-closing.md` | 203라운드 편집자 결정 하나: G6 완료, verifier 거부의 처리 |
| `reviews/round-204-closing.md` | 204라운드 편집자 결정 하나: 2라운드 완료, R3 판정, 측정·검증 시작 |
| `reviews/round-205-closing.md` | 205라운드 편집자 결정 하나: G7 완료, 서브에이전트 거부 대체, 07c rebase |
| `reviews/round-206-closing.md` | 206라운드 편집자 결정 하나: 개선-38 문서 수용과 권고 |
| `reviews/round-207-closing.md` | 207라운드 편집자 결정 하나: 이벤트 그룹 완료, 경고 중복·검증 파동 |
| `reviews/round-208-closing.md` | 208라운드 편집자 결정 하나: 2라운드 검증 결과와 꼬리 항목 |
| `reviews/round-209-closing.md` | 209라운드 편집자 결정 하나: 꼬리 재검증, G8 완료 |
| `reviews/round-210-closing.md` | 210라운드 편집자 결정 하나: 규모 그룹 완료, 열 그룹 마감 |
| `reviews/round-211-closing.md` | 211라운드 편집자 결정 하나: 복합 결함 둘 배정, R1 읽기 |
| `reviews/round-212-closing.md` | 212라운드 편집자 결정 하나: 방향 확인 결과와 32b 시점 |
| `reviews/round-213-closing.md` | 213라운드 편집자 결정 하나: 3라운드 수용, rebase 사슬 |
| `reviews/round-214-closing.md` | 214라운드 편집자 결정 하나: 복합 완료, 조합 중 쓰기 |
| `reviews/round-215-closing.md` | 215라운드 편집자 결정 하나: 07c 머지, 32b 시작, 문서 발견 셋 |
| `reviews/round-216-closing.md` | 216라운드 편집자 결정 하나: 32b 판정 수용, 07b 마무리 순서 |
| `reviews/round-217-owner-answers.md` | 217라운드 소유자 답 하나: codex·agy 정책 재활성화와 운영 규칙 |
| reviews 아래 improvement-38-explain.html | 개선-38 소유자용 설명(seiri:explain) |
| reviews 아래 improvement-38-fractal-map.md | 개선-38 고찰 문서(reviewer, verifier 대조판) |
| reviews 아래 raw-improvement-38 디렉터리 | 개선-38 근거: 소비자 증거 표, filid 요약 |
| reviews/raw-round97-gate-selection/ | 97라운드 원자료: 게이트 선택 설계안의 독립 검증 보고 |
| `reviews/round-28-closing.md` | 28라운드 편집자 결정의 정본(28C-01~08: 04(PR-3+PR-6) 실행 계획 초안의 해석 일곱 건과 후속 둘 — 개발 모드 정착 기록의 자리, `enabled`와 떼어진 노드의 상태 게터, `@` 맥락과 `setContext`의 PR, 억제 비트와 `resetInteraction`, `unsetOnInactive` 식의 throw, TEST-071의 값 크기, `watchValues`의 PR, `node.context`의 PR과 맥락 변경 정착). 보충 줄만 |
| `reviews/round-29-closing.md` | 29라운드 편집자 결정의 정본(29C-01~04: 생긴·로드된 노드의 파생 규칙은 원천이 `undefined`여도 발화, 채움 뒤의 값 변화는 새 에지, v7의 모형 선택은 이식하지 않음; 식이 던진 정착의 채움·나감 비움은 진행, 03의 전이 전체 생략은 결함; 공유 충돌 정착도 진행하고 원본 B는 예산 초과에만; 조각 `controls`의 `injectTo`는 불허). 보충 줄만 |
| `verification/performance-issues.md` | 단계를 가로지르는 속도 문제 대장(열림·해결). 구현 완료 뒤 최적화 작업의 출발점. 측정 원본은 단계별 `performance.md`(03·04) |
| plan 아래 perf-optimization 디렉토리 | 구현 완료 뒤 성능 최적화 작업의 계획서 셋(request·verification·adr-and-axes). 단계 M0–M3, 묶음 넷, 금지된 후보 목록 |
| `reviews/raw-round19-typeless-object-host/` | 19라운드 작업 파일: 지시서와 초안(`brief.md`), 검증 셋(`verifier.md`·`codex.md`·`antigravity.md`), 판정과 고친 결정문(`merged-v1.md`), X1 초안, 원장 반영 계획(`ledger-plan.md`) |
| `reviews/raw-round18-union-swarm/` | union 설계 스웜: 공통 브리프, 렌즈 넷의 제안, 검증 둘, 판정 셋, 교차 확인 둘, O7·O8 검증, 정본 설계 `merged-v3.md`, 규칙 A 전수 실행 스크립트 |
| `reviews/raw-round18-tests/` | 표준 대조(명세·생성기·검증기·폼 라이브러리, 브랜치 노드), 원장 정합성 시험(union, 채움 시점), 1차 교차 확인(codex·antigravity), 게이트 3 원문 |
| `reviews/raw-round18-ledger-check.md` | 원장 총검증(codex·antigravity) 원문과 판정 |
| `reviews/round-N-*.md`, `reviews/raw-*.md` | 1–17라운드 기록(원장이 인용) |
| `spikes/` | 프로토타입과 실측(`.md`는 훅에 막히므로 `.txt`) |

## 6. 배운 것 — 다음에도 같은 방식으로

- **위임의 갈래.** 추출이나 결정문 작성(opus) → 독립 검증(verifier) → 고침(worker, 정확한 문자열만) → 재검증. 쓴 사람이 스스로 검증하지 않는다.
- **설계 스웜의 모양(union에서 검증됨).** 공통 브리프(확정 사실·가치·소유자 원문) + 렌즈별 브리프 → 렌즈들이 서로 요구를 주고받으며 제안 → 검증 둘(렌즈 간 정합, 원장·가치 대조) → 편집자 판정 → 병합 → 외부 교차 확인(codex·antigravity) → 재판정 → 재병합. 소유자에게는 갈린 것만 선택지 둘과 권장으로 올린다. 병합 문서는 규칙 한 문장마다 근거를 달아, 그대로 소유자 답·18C 블록으로 옮겨진다.
- **소유자가 위임한 결정도 검증을 거친다.** O7·O8은 검증자가 "정합하지 않음"을 찾아 고친 형태로 채택됐다(순서 의존, `setValue` 순서 의존). 검증 없이 채택했다면 하위 문법 둘이 들어갔을 것이다.
- **검증이 늘 잡는 것.**
  - 편집자 산문, 검토자 결론, 소유자의 되물음을 소유자 답으로 적은 귀속
  - 소유자 답이 정했는데 편집자 결정으로 적은 누락
  - 옛 커밋으로만 확인되는 라운드
  - 안건에 없는 열린 항목
  - 편집자가 확정 결정을 뒤집은 판정(codex가 O8에서 잡았다) — 뒤집으려면 소유자 항목으로 올린다
- **반영 계획은 블록 덮개를 기계로 확인한다.** 블록마다 결정 칸의 집이 있어야 한다. 18라운드 1차 계획은 이것을 놓쳐, 질문 모양의 옛 항목이 `현행`으로 남고 결정은 보충에만 들어갔다.
- **게이트 지시서에는 판정 기준을 미리 적는다.** 질문 모양의 현행과 게이트 줄이 그 예다. 적지 않으면 게이트마다 판정이 갈린다.
- **결정은 모형과 대조한다.** 새 결정이 원장의 상태 모형(P3 등)과 맞는지 게이트가 따로 본다. 18C-87의 "빈 그릇 로드"는 모형에서 효과가 없음이 드러나 18C-88로 다시 정했다. 오래된 빈틈이 원장 밖 기록(예: `reviews/round-6-coherence.md:107`)에 남아 있을 수 있다.
- **한 소유자 답이 원장 곳곳에 파생을 낳는다.** 26행(채움 B안)은 항목 40여 개의 충돌·보충과 블록 열 개(94–103)를 낳았다. 소유자 답을 반영한 뒤에는 그 답만 겨냥한 정합성 시험을 한 번 돌린다(`reviews/raw-round18-tests/t1b-fill-consistency.md`가 선례).
- **작업자는 검사 출력으로만 "끝"을 말하게 한다.** 스스로 했다고 하는 보고는 세지 않는다.
- **하위 에이전트의 보고서 파일 쓰기를 훅이 막는다.** 보고는 메시지로 받아 팀장이 파일로 옮긴다.
- **외부 검토자(codex·antigravity)는 낡은 분류 행에 속는다.** 인용된 문장의 분류 행은 지우고 넘긴다. codex는 세션 scratchpad를 읽지 못하므로 파일을 저장소 안에 두거나 본문을 인라인으로 넘긴다.
