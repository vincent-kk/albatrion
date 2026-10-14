# HANDOFF — `@canard/schema-form` 재설계

개발의 진행 상황과 다음 할 일은 `PLAN.md`가 단일 진입점으로 든다. 다음 세션이 바로 이어서 일하기 위한 문서다. 이력은 `git log`와 `reviews/`에 있으므로 여기에는 지금 상태, 다음 할 일, 일하는 법만 적는다. 소유자는 Vincent다.

## 1. 지금 어디인가 (2026-10-15, 334라운드 닫힘; 8단계 첫 토막 구조 정리 진행(codex 없이, 소유자 감독) — 브랜치 feat/schema-form-08-review-and-perf, fairy08 조사·fixy08 이동 묶음 1, 둘째 토막 속도 최적화는 codex·agy, 대기열 54)

- **264라운드(2026-10-14, 소유자).** 고유명사 후보 15 중 1·3·4·5·6·7·8·9·10·11·15를 권고대로 승인했고, 2(ChildField 이름 길이)·12(controls.children 대체 이름)·13(propertyKeys 공개 자리·이름)·14(virtual을 object 전용 키로)는 추가 논의, 비표준 최상위 키의 잔여 점검을 요구했다(reviews/round-264-owner-answers.md).
- **265라운드(2026-10-14, 소유자).** 추가 논의 넷을 닫았다: ChildFields, controls.fields, options.propertyOrder(object 전용), options.virtual 형 선언과 VirtualSchema 비공개화, nullable: true 제거(265C-01 후속 대응표, reviews/round-265-owner-answers.md). 07b-5 후속 커밋으로 fixy07에게.
- **266라운드(2026-10-14, 소유자).** 스토리북 관찰 셋을 기록해 대기열 40·41·42로 올렸다: docs 페이지의 jsonSchema 순환참조 직렬화 오류, nullable 분기 스토리의 화면·값 불일치(설계 판단 필요), 스토리 가독성(설명·값·오류·스키마·설정 수록)(reviews/round-266-owner-answers.md).
- **267라운드(2026-10-14, 소유자).** 중지 없이 끝까지 진행하라는 지시: PR 병합 포함, C 재배치와 스토리·런타임 묶음까지, 결정은 대기열에 모아 끝에 한 번에(267C-01 계획, reviews/round-267-owner-answers.md).
- **268라운드(2026-10-14, 소유자).** codex·agy 멀티에이전트 작업 재개(덧붙임: `nullable: true`는 잔류, 265C-01의 제거 항목 취소): 257라운드의 "이번에 한해 claude 직접" 예외를 끝내고 217C-01 규칙으로 복귀(268C-01, reviews/round-268-owner-answers.md); 07b-5 후속은 fixy07이 마무리, 07b-6·07b-7·07c부터 codex 구현.
- **269라운드(2026-10-14, 소유자).** 07b-6 스토리 설계의 결정: usage 스토리에 play 단언을 두고 패키지 CLAUDE.md의 "documentation-only" 문장을 고치는 권장안 승인(269C-01, reviews/round-269-owner-answers.md); nullable은 잔류·공식 지원으로 확정(269C-02, 오류 없음; 07b-7에서 형·문서 보강).
- **270라운드(2026-10-14, 닫기/원장 관리자).** 07b-5 #365를 직접 검증(시험 3943·storybook 241·typecheck·lint·플러그인 일곱·documents·G16·verifier·agy)하고 squash 병합(17414cd4a); fixy07 판단 셋 승인; 지적 일곱은 07b-7로 이월(270C-01, reviews/round-270-closing.md); fairy07 07b-6·fixy07 07b-7을 17414cd4a에서 병렬 착수(codex 구현).
- **271라운드(2026-10-14, 소유자).** 대기열 46 승인: `src/helpers`·`src/components`는 INTENT/DETAIL/index 없는 compartment로 두고 자식 fractal은 그대로(271C-01, reviews/round-271-owner-answers.md; 264라운드 결정 4 번복). 07c 계획 확정.
- **272라운드(2026-10-14, 닫기/원장 관리자).** 07b-7 #366을 직접 검증(시험 3950·storybook 241·typecheck·lint·json-schema·플러그인 일곱·documents·G16·verifier·agy)하고 squash 병합(c0ddd4b51): 로드 null·종류 틀린 원본 아래 자식 미채움(41·45), enum select undefined 표시(44), nullable 공식 지원 문구(269C-02), #365 후속 여섯(272C-01, reviews/round-272-closing.md). 07c 재배치 브리프를 fixy07에게 발송(codex 구현), 07b-6은 c0ddd4b51에 rebase 뒤 PR.
- **273라운드(2026-10-14, 닫기/원장 관리자).** 07b-6 #367을 직접 검증(storybook 251·시험 3949·typecheck·lint·documents·verifier)하고 squash 병합(beff4b5ec): 패널 데코레이터(42), FormHandle 스토리 10개(43), docs 직렬화 방어 수정(40, 재현 불가로 소유자 재확인), CLAUDE.md:125 문장 확정(273C-01, reviews/round-273-closing.md). fairy07은 README 1.0.0 이주 절 초안, fixy07은 07c 재배치 진행 중.
- **274라운드(2026-10-14, 닫기/원장 관리자).** README 두 파일의 Migration (1.0.0) 절 #368을 agy·직접 대조로 검증하고 squash 병합(e5f7f9fa3)(274C-01, reviews/round-274-closing.md); 옛 최상위 키 조용한 무시의 개발 빌드 경고는 대기열 47; fairy07은 #354 본문 갱신 초안, fixy07은 07c 재배치 진행 중.
- **275라운드(2026-10-14, 닫기/원장 관리자).** 07c 재배치 #369를 직접 검증(시험 3840·storybook 251·typecheck·lint·플러그인 일곱·documents·G16·d.ts 바이트 동일·verifier·agy)하고 squash 병합(4da9567ea): core/{engine, surface}, 미사용 helpers 셋 삭제, src/constants, helpers·components는 compartment(275C-01, reviews/round-275-closing.md). 267C-01 1~4 완료, 5(마무리) 진행: 설명 문서 갱신(fairy07), #354 본문 갱신 완료, 워크트리 정리·대기열 총정리는 소유자 보고.
- **276라운드(2026-10-14, 소유자).** 대기 결정 일괄 답(reviews/round-276-owner-answers.md): 47은 경고 없이 문서 안내만("과거와의 결별"), 패키지 CLAUDE.md:142 수정 승인, G23은 ego-browser로 원장 관리자가 직접 실행, 38(접근성 묶음)·39(분기 terminal 합쳐 읽기)·48(플러그인 셋 enum select)·49(constants 이름 열거; 시험·bench 직접 import는 소유자 면제)는 후속 PR 07d로 fixy07 발주, 45 넓은 해석 확정, 40 소유자 추후 확인. 버전 올리기는 최종 단계로 미룸.
- **277라운드(2026-10-14, 소유자).** G23 실행 주체 교정: "스토리 도는건 너 말고 다른애 시켜. 넌 관리해야지" — 원장 관리자의 ego-browser 실행을 멈추고 fairy07에게 발주(스토리북 6007, 스크립트 scratchpad/g23-run-all-stories.js). 대기열 39 oneOf 터미널 이유는 원장 관리자가 소유자에게 직접 답함(reviews/round-277-owner-answers.md).
- **278라운드(2026-10-14, 소유자).** 대기열 40 내용 질문에 답했고, 39의 고침 방향을 소유자 지적대로 명세의 덮어쓰기 규칙(게이트 없는 분기 선언도 전체 순서에서 나중 승)으로 정정해 fixy07의 07d 브리프를 고침(reviews/round-278-owner-answers.md).
- **279라운드(2026-10-14, 소유자).** "좋아 쭉 작업해 다시" — 39 세부 결정(분기가 호스트 자신에 단 terminal은 무시) 승인으로 읽고 07d·G23을 기다려 병합·보고(reviews/round-279-owner-answers.md).
- **280라운드(2026-10-14, 소유자).** 38의 verifier 결함(스키마 모양 판정과 입력 선출의 어긋남)에 소유자가 "자유도를 해치지 않고 사용 방식에 따라 맞추게" 답해, 라벨은 항상 htmlFor와 id를 갖고 묶음은 aria-labelledby로 제목을 가리키는 추측 없는 규약으로 바꿔 fixy07에게 보냄(reviews/round-280-owner-answers.md). alias 자리는 문제없음.
- **281라운드(2026-10-14, 소유자).** "할거 다 하고 PR을 머지하고 다음으로 가자. 7단계가 너무 비대해졌네" — #370·Prettier PR·G23을 끝낸 뒤 #354를 병합하고, 디렉터리·구성 다듬기는 새 단계(08)로(reviews/round-281-owner-answers.md).
- **282라운드(2026-10-14, 소유자).** 08단계 씨앗 메모: fractal 최소 export 계약 위반(가장 거슬림), nodeFromJSONSchema가 root export인 이유, FormContents의 이름·위계. 시험·bench가 index를 경유하는 것은 filid의 한계가 아니라 07c·07d의 선택이었음을 원장 관리자가 export 소비자 셈으로 답함(reviews/round-282-owner-answers.md).
- **283라운드(2026-10-14, 닫기/원장 관리자).** PR #370(07d) squash 병합(0b879e594): 47 문서 안내, CLAUDE.md:142, 38 추측 없는 label id 규약(`label:${path}`), 45 원칙 문장, 48 플러그인 시험, 49 이름 열거·면제 선언. verifier FAIL→PASS, agy 차단 없음, 직접 게이트 전부 통과(283C-01). 낮은 후속 넷은 07e로.
- **284라운드(2026-10-14, 닫기/원장 관리자).** PR #371(07e) squash 병합(89898d107): 45 원칙 문장, 플러그인 셋 FormGroup 제목 id, 형제 충돌 시험, skills 문서 접미어, Prettier 다섯 파일(284C-01). 남은 것은 G23 보고와 #354 병합, 08단계 계획.
- **285라운드(2026-10-14, 닫기/원장 관리자).** G23 닫힘: fairy07이 ego-browser(spaceId 39)로 tip 89898d107의 스토리 251개 전부 finished·실패 0, 자동 게이트 251 통과(285C-01). 첫 실행은 대기 조건 오류로 무효. NaN defaultValue 경고 세 스토리는 debugger 진단 중. 다음은 #354 병합.
- **286라운드(2026-10-14, 닫기/원장 관리자).** #372(07f, NaN 표시) 병합 3c1a7f2c3, PR #354(07 전환)를 1.0.0-beta에 squash 병합 9c4d4a59d(가지 보존). 07단계 닫힘(286C-01). 다음은 08단계 계획(282라운드 메모).
- **287라운드(2026-10-14, 소유자).** 정돈 단계 설계(PR 셋, 결정 넷)에 답: 단계 순서는 괘념치 말 것, 최소 export 원칙의 까닭(계약의 기록, 복잡도 폭발 방지)과 "fractal의 1차 이미지" 전제를 적고, 뿌리에 보이지만 외부에서 안 쓰이는 파일(surface/nodeFromJSONSchema.ts)을 기능 고장에 준한다고 봄. 원칙을 CLAUDE.md 등 가이드에 적고 전수 재검사를 지시(reviews/round-287-owner-answers.md).
- **288라운드(2026-10-14, 소유자).** 전수 검사 보고에 답: 뿌리·최소 export 문제는 filid 플러그인 원칙 문제라 ogham에 이슈 하나를 남기되 바로 등록하지 말고 "구현 위반인지 규칙 결함인지"를 진행하며 가릴 것, CLAUDE.md 자리(루트/패키지)는 검토할 것, 수정 계획을 먼저 보일 것(reviews/round-288-owner-answers.md). 계획은 plan/tidy-structure/request.md(발견 F1–F8의 판정표, PR 넷, 결정 D1–D6).
- **289라운드(2026-10-14, 소유자).** 정돈 결정: D1 진행, D2 nodeFromJSONSchema는 문서에서 지우고 뿌리에서 아래로 옮김, D3 providers organ은 components·hooks 둘, D4 잉여 export는 지우되 오류 코드 상수는 object enum으로 root export(발화 가능한 오류의 일람, 안전한 상수 사용 계약), D5 가이드는 루트에 원칙·패키지에 적용, D6 filid 이슈(규칙 결함 셋·도구 결함 하나)는 정돈-2 뒤 등록(reviews/round-289-owner-answers.md).
- **290라운드(2026-10-14, 소유자).** 정돈 작업자는 fixy08(구현)·fairy08(문서), 원장 관리자는 관리만(reviews/round-290-owner-answers.md). 정돈-1 브리프 plan/tidy-structure/brief-tidy-1.md를 fixy08에게 보냄.
- **291라운드(2026-10-14, 소유자).** 문자열 리터럴 규약은 JSON Schema type 외에 금지(변경 표면), 추가 사례·method·event dispatch 안전 여부 물음, 순서는 정돈 → 구조 리뷰 → 속도 개선(reviews/round-291-owner-answers.md). 전수 판정은 plan/tidy-structure/string-literal-audit.md(dispatch·메서드 안전, 누수는 오류 코드 생성자·controls 키·FieldNode 형 미연결·경로 토큰). 정돈-E 범위 E1–E5.
- **292라운드(2026-10-14, 닫기/원장 관리자).** fairy08의 문서 정합 PR #373을 0d17c3080으로 squash 병합(SPECIFICATION·README·QUICK_REFERENCE·api-reference 18건, 소스는 주석 넷). 정돈-1 편집자 결정 둘(292C-02). 대기열 51(NULLABLE_ONE_OF_NULL_UNREACHABLE 이식 누락 여부) 개설.
- **293라운드(2026-10-14, 소유자).** FCA import 멘탈모델: import는 외부·형제·직계 셋, 형제는 index로만(외부 패키지에 준하는 최소 계약), 직계 서브트리는 index 없이 "내부 모듈", 시험·벤치는 fractal 안에서 가장 가까운 곳, 공유 기능은 공통 부모 organ, 부모는 자식의 비방출 내부에 못 닿음(비대칭). 재구성·헛점 지적 요청(reviews/round-293-owner-answers.md).
- **294라운드(2026-10-14, 소유자).** 보강 다섯(부모 organ은 자식을 모른다, 삼촌·사촌은 혈통 밖, 조상 index 경유 금지, organ은 맨 위만, 벤치도 안에) 수용. 모델은 plan/tidy-structure/fca-import-model.md, 모델 기준 구조 검사는 lineage-audit.md. **마지막에 이 모두를 포함해 filid 개선 여부를 소유자가 결정한다 — 잊지 말 것**(reviews/round-294-owner-answers.md).
- **295라운드(2026-10-14, 소유자).** D7 허용(src/__tests__/e2e·scenarios·migration의 공개 API 시험은 외부 소비자, 루트 index 경유), D8 허용(B6·B7). 모델 안에서의 약간의 변용 허용 — 핵심은 가독성·인터페이스 계약·폭발 반경 억제. filid는 언어 중립이라 alias 처리는 어댑터 층(reviews/round-295-owner-answers.md). 검사 결과는 plan/tidy-structure/lineage-audit.md(제품 위반 2, 시험 326, settle↔derive 층 순환).
- **296라운드(2026-10-14, 소유자).** 정돈-1 병합 즉시 정돈-2 투입, 끝나는 대로 보고. fairy08은 유휴 → export 재검사(와일드카드 재수출 추적) 배정(reviews/round-296-owner-answers.md).
- **297라운드(2026-10-14, 닫기/원장 관리자).** 정돈-1 PR #374를 ae502f7bd로 squash 병합(297C-01; 시험 3823·storybook 251·플러그인 일곱·표면 92 동일). 정돈-2 브리프를 fixy08에게 넘김.
- **298라운드(2026-10-14, 소유자).** 구조 리뷰(5단계) 전까지 정돈-2·3·E·4를 멈추지 말고 진행, 판단은 대기열에 모아 한 번에, 생성 PR 병합 허용(reviews/round-298-owner-answers.md). CLAUDE.md 둘만 승인 대기(대기열 52).
- **299라운드(2026-10-14, 닫기/원장 관리자).** fairy08의 api-reference(en·ko) 전면 재작성 PR #375를 c2c6007b2로 squash 병합(299C-01). 대기열 53(core가 maxItems·minItems를 강제하지 않음) 개설.
- **300라운드(2026-10-14, 닫기/원장 관리자).** 소유자 지적대로 대기열을 원장 원리로 닫음: 53(core는 배열 한도를 강제하지 않음 — write 표 현행), 50(분기 선언은 존재만 기여 유지, 다중 분기 터미널은 fieldInputMap 안내), 52(CLAUDE.md 둘은 정돈-4 PR의 diff로 소유자가 보고 소유자가 병합). 51·40은 fairy08 코드 확인으로.
- **301라운드(2026-10-14, 소유자).** 대기열은 원장 원리·코드 확인으로 직접 닫을 것. 53은 "core는 값을 조작·제어하지 않는다" 원칙의 산물이나 옵션 기능으로 재검토(레거시는 maxItems push 차단·minItems 채움 지원, 새 엔진은 둘 다 안 함을 시험이 고정; SPECIFICATION 986·998행이 코드와 어긋남 → 정돈-E 문서). CLAUDE.md 갱신은 필요하면 진행 → 정돈-4 PR, 원장 관리자 병합(reviews/round-301-owner-answers.md).
- **302라운드(2026-10-14, 소유자).** 53의 유익·손해 비교 요청(controls 어휘, 입력 컴포넌트의 일인지, 타입 불일치 값과의 유비). 답은 plan/tidy-structure/array-limits-review.md(권고: 1.0.0은 현행, UX는 입력의 UI 전용 빈 슬롯, 제어는 controls 옵트인으로 별도 라운드)(reviews/round-302-owner-answers.md).
- **303라운드(2026-10-14, 소유자).** 53의 경계·일관성 물음. 답: core는 적용 가능성(효력 중인 선언)에는 따르고 제약 키워드는 강제하지 않는다 — 가려진 필드 제거와 배열 개수 비강제가 한 규칙; 제공하지 않는 쪽이 일관적(reviews/round-303-owner-answers.md).
- **304라운드(2026-10-14, 소유자).** 53 확정 — 경계 한 줄 수용(WRITE-003 보충, ADR 0013 §3.1 문장 추가), 1.0.0은 현행, 기본 배열 입력의 UI 전용 빈 슬롯은 작은 PR(정돈-S), controls 옵트인은 새 라운드, 문서는 지금(reviews/round-304-owner-answers.md).
- **305라운드(2026-10-14, 닫기/원장 관리자).** fairy08 코드 확인으로 대기열 51(넷 모두 폐기 — 경고 하나는 fairy08이 이식 누락으로 보았으나 ERROR-162가 17라운드에 폐기함; 정돈-E가 다섯을 지움)과 40(docs 페이지 85개 재현 안 됨, #367 방어 수정 유효) 닫음. 옛 조건 문법이 보고 없이 무시되는 것은 CONTROLS-001의 결과라 대기열에 올리지 않음. 배열 한도·경계 문장 문서는 fairy08 문서 전용 PR(documents 데모의 없는 이름 교체 포함), 원장 관리자 병합. 대기열은 비었다.
- **306라운드(2026-10-14, 닫기/원장 관리자).** fairy08의 배열 한도 문서 PR #376 병합(c40d6de8f): 304라운드 경계 문장과 배열 한도 절이 SPECIFICATION·README·QUICK_REFERENCE·docs/agents·documents에 들어갔고, documents 데모가 새 엔진에 없는 이름 대신 outputValue를 읽는다.
- **307라운드(2026-10-14, 닫기/원장 관리자).** 정돈-2 PR #377을 fd2a56c2f로 squash 병합(verifier 독립 검증: 공개 표면 92 동일, unit·render·react18 3825 통과, 가드 시험이 옛 트리의 위반을 잡음). 정돈-2의 편집자 결정과 변용 일곱, B8 첫 실제 사례(engine DETAIL 선언, vi.mock 경로는 검사기가 못 봄 → filid 결정 재료)를 기록. fixy08에게 정돈-3 투입, fairy08은 filid 이슈 수치 갱신 뒤 ogham 등록.
- **308라운드(2026-10-14, 닫기/원장 관리자).** fairy08이 filid 개선 요청을 ogham 이슈 #143으로 등록(289라운드 D6). 수치는 정돈-2 뒤 트리 기준(시험 쪽 위반은 D7 밖 0, index 48항목 삭제), B8 첫 사례와 mock 경로 제안, 훅 차단 사례를 더함. 소유자의 마지막 filid 결정 재료.
- **309라운드(2026-10-14, 소유자).** 이동 작업의 소요 시간 지적 → 217C-01에 예외: 순수 이동·이름 변경·import 고침은 fixy08이 직접(새 로직만 codex), 전체 게이트는 PR 직전 한 번(중간은 typecheck만, verifier도 한 번). 정돈-3에 즉시 적용(reviews/round-309-owner-answers.md).
- **310라운드(2026-10-14, 소유자).** 벤치는 게이트가 아님 — 경로 바뀐 파일만 PR 직전 시작 확인 한 번, 측정 없음. 오래 걸리는 절차는 몇 단계를 묶어 한 번(원칙은 PR 직전), 중간은 typecheck만; 정돈-E·S에도 적용(reviews/round-310-owner-answers.md).
- **311라운드(2026-10-14, 소유자).** 정돈-3이 구조 리뷰 전 마지막; 리뷰하며 구조를 더 잡고 오늘 밤 속도 측정·개선 루프. 리뷰 동안 E·S·4를 끝내고 밤에는 측정만(조용한 창), 속도 계획 점검은 fairy08(reviews/round-311-owner-answers.md).
- **312라운드(2026-10-14, 닫기/원장 관리자).** 정돈-3 PR #378을 eeb1bd374로 squash 병합(verifier: 표면 92 동일, 3826 통과, 이동 147건 이력 유지, 비이동 편집은 B1에 따른 둘뿐). 결정 D1–D6과 선택 여섯 기록(rolled는 src/rolled, 형 전용 순환 하나는 리뷰 항목, round-87 스크립트는 돌지 않음). 구조 이동 끝 → 소유자 구조 리뷰(5단계) 시작 가능. fixy08은 정돈-E.
- **313라운드(2026-10-14, 소유자).** 정돈-E·S도 codex 없이 fixy08이 직접(진행 중 codex 작업은 멈춤). 소유자는 E·S·4가 모두 병합된 뒤 구조를 직접 손보고 원장 관리자가 diff를 읽어 모델 기준으로 짚는다(소유자 편집이 정돈-E 작업과 부딪혀 되돌림)(reviews/round-313-owner-answers.md).
- **314라운드(2026-10-14, 소유자).** 구조 리뷰 첫 손질: Form fractal 재구성(뿌리는 문서·index·Form.tsx만, FormCore와 Form.* 다섯은 components/ 아래 fractal 여섯, 오류 바운더리 래핑은 FormCore로). 여섯은 fractal(INTENT·DETAIL 한국어), 이름 함정(FormCore.tsx의 FormRoot, 별칭)은 오타로 수정, 문서화·정리는 fairy08 위임 → 워크트리 stage-form-fractals, PR은 원장 관리자 병합(reviews/round-314-owner-answers.md).
- **315라운드(2026-10-14, 닫기/원장 관리자).** 소유자 Form 재구성 PR #379 병합: FormCore·Form.* 다섯이 components/ 아래 fractal로 INTENT·DETAIL(한국어)과 함께, 이름 함정 해소(바깥 FormCore, 안쪽 FormRoot), 공개 export 불변. 이 모양을 구조 리뷰의 표준 틀로. 남은 리뷰 항목: FieldInputSlot↔FieldProxy 형 전용 순환, getAbsolutePointer 시험 상한.
- **316라운드(2026-10-14, 소유자).** Form 재구성의 뜻은 컴포지션의 독립 컴포넌트(같은 위계). 구조 지도(fractal 59·organ 125) 뒤 결정: constants·hooks는 organ(index 제거, 직접 import), types·rolled는 fractal 그대로, organ 안의 barrel은 두지 않음(Form/components/index.ts도 제거), Field는 Form처럼 자식 셋을 components/ 아래로. fairy08 PR, 정돈-E 뒤 rebase(reviews/round-316-owner-answers.md).
- **317라운드(2026-10-14, 소유자).** Form barrel 삭제 확정; 개발은 병렬·병합만 직렬, 정돈-S는 fairy08이 병렬 시작; PR 셋과 정돈-4는 원장 관리자가 검증 뒤 병합; surface/classes는 단일 클래스라 runtime/으로(보조 둘 동반), 손질은 같은 PR에 모음(reviews/round-317-owner-answers.md). hooks는 B1 때문에 organ이 아니라 fractal 유지(fairy08 지적, 편집자 결정 A).
- **318라운드(2026-10-14, 소유자).** 넷째 손질: fieldInputs를 내장 입력 열한 개의 fractal로(components/ 아래, index.ts에 Definition, 보조는 각자 아래, 한국어 문서), fixy08이 정돈-E 뒤 별도 PR(정돈-S 병합 뒤 base). ArrayItems 래핑은 memo 경계(설계 의도)라 유지(reviews/round-318-owner-answers.md).
- **319라운드(2026-10-14, 닫기/원장 관리자).** 정돈-E PR #380을 8f4dce4ab로 squash 병합(직접 검증: 표면 92→94는 정확히 FormErrorCode·FormWarningCode, 시험 3835 통과, 리터럴 발화 0, 플러그인은 32C-02대로 group·code). 결정 묶음 열 기록; 남는 항목은 타이밍 시험 한도와 클래스의 공개 형 매개변수화.
- **320·321라운드(2026-10-14, 소유자·닫기).** 320: fieldInputs의 열한 fractal은 컴포넌트가 아니라 FieldInputDefinition이므로 components/가 아니라 fieldInputDefinitions/ 아래(additionalOrganNames에 추가), 뿌리 이름은 고민 중(reviews/round-320-owner-answers.md). 321: 정돈-S PR #381을 a8277781f로 squash 병합 — 기본 배열 입력의 UI 전용 빈 슬롯, core 불변, 입력 기원 쓰기만.
- **322라운드(2026-10-14, 닫기/원장 관리자).** 구조 손질 2·3 PR #382를 496148de7로 squash 병합(삭제는 barrel 둘, 이름 바꿈 39, 루트 index 불변, 가드 넷 0). 남은 구조 작업: fieldInputs(구조-4, fixy08), CLAUDE.md(정돈-4 — fairy08이 교차 세션 규칙으로 사양, 원장 관리자가 직접).
- **323라운드(2026-10-14, 닫기/원장 관리자).** 정돈-4 PR #383을 3d9082f2d로 squash 병합: 루트 CLAUDE.md의 모듈 계약 원칙 여섯과 개발 흐름 7항, 패키지 CLAUDE.md의 fractal 계약 절과 Node System 교체(단일 런타임 클래스). 정돈 단계 전부와 구조 손질 1–3 완료; 남은 것은 구조-4(fixy08)와 소유자 추가 손질, 속도 계획 개정, 밤 루프.
- **324·325라운드(2026-10-14, 소유자·닫기).** 324: 밤 루프 결정은 소유자가 작업을 본 뒤, 지금은 대기(reviews/round-324-owner-answers.md). 325: 구조-4 PR #384를 307728a6d로 squash 병합 — fieldInputs는 fieldInputDefinitions/ 아래 열한 fractal, filid 키는 organNames(규칙 문서의 additionalOrganNames와 불일치 → filid 결정 재료). 구조 손질 1–4 완료, 작업자 둘 대기.
- **326라운드(2026-10-14, 소유자).** 구조 손질 5: components/Field의 본체는 FieldProxy이므로 fractal을 components/FieldProxy로(뿌리에 동명 구현, 부품 둘은 components/ 아래), fixy08 직접; 병합 전 전체 게이트는 약식(스토리북·플러그인·documents 생략), 문제가 생기면 자세히(reviews/round-326-owner-answers.md).
- **327라운드(2026-10-14, 닫기/원장 관리자).** 구조-5 PR #385를 c2d5f737e로 squash 병합(약식 전체 게이트: 시험 3841 통과, 표면 94, filid 새 지적 0). 부품의 뿌리 type.ts 위로 import는 DETAIL 예외 선언 → filid 결정 재료. 구조 손질 1–5 완료, 작업자 둘 대기, 밤 루프는 소유자 결정 대기.
- **328라운드(2026-10-14, 소유자).** schema-form의 INTENT·DETAIL 문서를 모두 한국어로(humanizer, sonnet·agy 병렬, codex 금지) — fairy08, 문서 전용 PR, 원장 관리자 병합(reviews/round-328-owner-answers.md).
- **329라운드(2026-10-15, 닫기/원장 관리자).** 문서 한국어화 PR #386을 d25a8aee8로 squash 병합: 138개 중 96 재작성(의미 변경 43건 되돌림), 파일마다 한 문체(섞인 10개는 -다로), app/plugin INTENT의 플러그인 규칙 문장을 코드대로 정정, filid documents 0. 작업자 둘 대기, 밤 루프는 소유자 결정 둘 대기.
- **330라운드(2026-10-15, 소유자).** 중간 브랜치 전부 삭제, 백업 backup/1.0.0-beta-2026-10-15 뒤 1.0.0-beta를 344 → 48 커밋으로 압축(기능 PR은 그대로, 원장 커밋은 라운드 범위별 하나; 트리 동일). 8단계(소유자 코드 리뷰·속도 측정, 원장 표의 최적화 트랙)는 브랜치 feat/schema-form-08-review-and-perf에서; 원장 작업 트리 /tmp/claude-501/ledger-08, 작업자 워크트리도 이 브랜치에서, 끝나면 1.0.0-beta에 squash(reviews/round-330-owner-answers.md).
- **331라운드(2026-10-15, 소유자).** 08 플러그인은 완료로(이주는 07b·07d에서 끝남, 플러그인 0.17.0); 미확인 셋(union 시험 객체·typeMismatch 표지, 수 입력 빈 값 방출, 자사 수정 목록)은 대기열 54로 09 정리 때 대조. 최적화 트랙 진행. 소유자가 거슬리는 점을 하나씩 말하며 작업(reviews/round-331-owner-answers.md).
- **332라운드(2026-10-15, 소유자).** 리뷰 1차 열넷: rolled·types 병합(types/ 아래 두 칸 병존), schemaType의 virtual·union 정리, 한글 주석 영문화, typeMismatch 이름 공모, 입력을 아는 JSON.stringify와 템플릿 리터럴을 문자열 연결로, WeakMap 54곳 이유, NODE_ENV 판정의 한곳 모음 여부, 함수 안 정규식 상수화, engine 하위(blueprint·derive·navigation·record·settle) utils의 fractal 승격과 미묘한 디렉토리 재구조화(재검증 필요), hooks/hooks 해소, 훅 안 상수 끌어올림, @inheritDoc 54곳 제거. 배분은 reviews/round-332-owner-answers.md.
- **333라운드(2026-10-15, 소유자).** 작업자 fixy08·fairy08. WeakMap은 memo(측정은 밤 루프). NODE_ENV는 React의 배포 방식을 fairy08이 확인해 따른다. types/internal·rolled, hooks/fieldNode·form 수용. typeMismatch → misfit(drift는 과정의 말, misfit은 상태의 말)(reviews/round-333-owner-answers.md).
- **334라운드(2026-10-15, 소유자).** 구조 정리를 먼저 빠르게 codex 없이 소유자 감독으로, 그 뒤 속도 최적화부터 codex·agy 사용(reviews/round-334-owner-answers.md). 다음 라운드 번호는 335.
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
| `reviews/round-218-closing.md` | 218라운드 편집자 결정 둘: codex 장애 대체 규칙, ④ 설계 변경 |
| `reviews/round-219-closing.md` | 219라운드 편집자 결정 하나: codex 복구, #358 머지, reviewer 다음 배정 |
| `reviews/round-220-owner-answers.md` | 220라운드 소유자 물음 하나: 통제와 꼬리, 새 범위 닫음 |
| `reviews/round-221-owner-answers.md` | 221라운드 소유자 답 하나: 기계적 검증 범위 |
| `reviews/round-222-closing.md` | 222라운드 편집자 결정 하나: #359 머지, 남은 순서 |
| `reviews/round-223-closing.md` | 223라운드 편집자 결정 하나: #360 머지, reviewer 종료 |
| `reviews/round-224-owner-answers.md` | 224라운드 소유자 물음 둘: 속도 현황, 추가 측정 시간 |
| `reviews/round-225-owner-answers.md` | 225라운드 소유자 답 하나: 방향 확인 실행 |
| `reviews/round-226-closing.md` | 226라운드 닫기: 방향 확인 통과(3라운드·④) |
| `reviews/round-227-closing.md` | 227라운드 닫기: 전체 스토리 순회 통과, ⑥ 신호 |
| `reviews/round-228-owner-answers.md` | 228라운드 소유자 답 하나: #355 병합 허가 |
| `reviews/round-229-closing.md` | 229라운드 닫기: #355 병합, 07b 마무리 끝 |
| `reviews/round-230-owner-answers.md` | 230라운드 소유자 답 일곱: 대기열 10·17·19·20·22·23·25·27 |
| `reviews/round-231-closing.md` | 231라운드 닫기: 230 답 배분(07b-2, 문서 PR) |
| `reviews/round-232-owner-answers.md` | 232라운드 소유자 답 넷: 대기열 9·26 고침, 22 검토, 정리 시점 |
| `reviews/round-233-closing.md` | 233라운드 닫기: 07b-2 추가 셋, #361 확장, 22 진단 |
| `reviews/round-234-owner-answers.md` | 234라운드 소유자 답 넷과 이름 재구성 의견 요청 |
| `reviews/round-235-owner-answers.md` | 235라운드 소유자 답 하나: 이름 재구성 동의, 공모 |
| `reviews/round-236-closing.md` | 236라운드 닫기: 이름 공모 결과와 권고 |
| `reviews/round-237-owner-answers.md` | 237라운드 소유자 답 하나: Field 시리즈 선택, 힌트 미정 |
| `reviews/round-238-owner-answers.md` | 238라운드 소유자 답 하나: inputType 잠정, FieldRenderer |
| `reviews/round-239-owner-answers.md` | 239라운드 소유자 답 셋: 이름 체계 확정과 대응표 |
| `reviews/round-240-closing.md` | 240라운드 닫기: 이름 재구성 범위와 결정 다섯 |
| `reviews/round-241-owner-answers.md` | 241라운드 소유자 답 하나: Label·Error 보류, 재설계 검토 |
| `reviews/round-242-owner-answers.md` | 242라운드 소유자 답 하나: 이름 치환 전 영역 허용 |
| `reviews/round-243-owner-answers.md` | 243라운드 소유자 답 둘: 31 닫힘, 32 설명 요구 |
| `reviews/round-244-owner-answers.md` | 244라운드 소유자 답 둘: 33·34 승인, 07b-2 뒤 함께 |
| `reviews/round-245-closing.md` | 245라운드 닫기: ②-3 확인, ⑨ 통지 규칙 (가) |
| `reviews/round-246-closing.md` | 246라운드 닫기: #362 직접 검증, ⑨ 보강 246C-01 |
| `reviews/round-247-owner-answers.md` | 247라운드 소유자 지시: PR 정리 뒤 다음 작업 준비 |
| `reviews/round-248-owner-answers.md` | 248라운드 소유자 답: #362 병합 허가 |
| `reviews/round-249-closing.md` | 249라운드 닫기: #362 병합, #361·07b-3 배분 |
| `reviews/round-250-owner-answers.md` | 250라운드 소유자 답: 대기열 35 승인(옛 문법 전환) |
| `reviews/round-251-closing.md` | 251라운드 닫기: #361 검증 통과 |
| `reviews/round-252-owner-answers.md` | 252라운드 소유자 답: #361 병합 허가 |
| `reviews/round-253-closing.md` | 253라운드 닫기: #363 검증 통과 |
| `reviews/round-254-owner-answers.md` | 254라운드 소유자 답: #363 병합 허가 |
| `reviews/round-255-closing.md` | 255라운드 닫기: #363 병합, 정리 커맨드 갱신 |
| `reviews/round-256-owner-answers.md` | 256라운드 소유자 답: 대기열 열한 개 정리 |
| `reviews/round-257-owner-answers.md` | 257라운드 소유자 답: 07b-4 시작, Claude 직접 구현 |
| `reviews/round-258-owner-answers.md` | 258라운드 소유자 답: 개선-38 결정 다섯·후보 C, 이름 논의 셋 |
| `reviews/round-259-owner-answers.md` | 259라운드 소유자 답: FieldNode 확정, 대응표 259C-01 |
| `reviews/round-260-owner-answers.md` | 260라운드 소유자 답: 옛 이름 게이트, 고유명사 재검토 |
| `reviews/round-261-closing.md` | 261라운드 닫기: 고유명사 재검토 후보 15 |
| `reviews/round-262-closing.md` | 262라운드 닫기: #364 검증 통과 |
| `reviews/round-263-owner-answers.md` | 263라운드 소유자 답: #364 병합 허가 |
| `reviews/round-264-owner-answers.md` | 264라운드 소유자 답: 후보 15 결정과 추가 논의 넷 |
| `reviews/round-265-owner-answers.md` | 265라운드 소유자 답: 후속 대응표 265C-01 |
| `reviews/round-266-owner-answers.md` | 266라운드 소유자 관찰: 스토리북 문제 셋 |
| `reviews/round-267-owner-answers.md` | 267라운드 소유자 지시: 중지 없이 진행, 계획 267C-01 |
| `reviews/round-268-owner-answers.md` | 268라운드 소유자 지시: codex·agy 멀티에이전트 작업 재개(217C-01 복귀) |
| `reviews/round-269-owner-answers.md` | 269라운드 소유자 답: 07b-6 결정 승인, nullable 논의 계속 |
| `reviews/round-270-closing.md` | 270라운드 닫기: #365 병합(17414cd4a), 07b-6·07b-7 착수 |
| `reviews/round-271-owner-answers.md` | 271라운드 소유자 답: 대기열 46 승인(helpers·components는 compartment) |
| `reviews/round-272-closing.md` | 272라운드 닫기: #366 병합(c0ddd4b51), 07c 착수 |
| `reviews/round-273-closing.md` | 273라운드 닫기: #367 병합(beff4b5ec), README 이주 절 조사 배정 |
| `reviews/round-274-closing.md` | 274라운드 닫기: #368 병합(e5f7f9fa3), 대기열 47 |
| `reviews/round-275-closing.md` | 275라운드 닫기: #369 병합(4da9567ea), 07c 완료 |
| `reviews/round-276-owner-answers.md` | 276라운드 소유자 답: 대기열 일괄 답(47·CLAUDE.md:142·G23·38·39·45·48·49·40) |
| `reviews/round-277-owner-answers.md` | 277라운드 소유자 답: G23 주체는 fairy07, 대기열 39 답변 요구 |
| `reviews/round-278-owner-answers.md` | 278라운드 소유자 물음: 대기열 40 내용, 39 덮어쓰기 규칙 정정 |
| `reviews/round-279-owner-answers.md` | 279라운드 소유자 답: 계속 진행 |
| `reviews/round-280-owner-answers.md` | 280라운드 소유자 답: 38 자유도 유지 규약, alias 자리 확인 |
| `reviews/round-281-owner-answers.md` | 281라운드 소유자 답: 다음 단계 방향 |
| `reviews/round-282-owner-answers.md` | 282라운드 소유자 메모: 08단계 씨앗과 filid 질문 |
| `reviews/round-287-owner-answers.md` | 287라운드 소유자 지시: 최소 export 원칙의 까닭과 전제, 전수 재검사 |
| `reviews/round-288-owner-answers.md` | 288라운드 소유자 지시: filid 이슈(등록 보류), 가이드 자리 검토, 수정 계획 제시 |
| `reviews/round-289-owner-answers.md` | 289라운드 소유자 답: 정돈 결정 D1–D6, filid 이슈 본문은 규칙 결함 셋·도구 결함 하나 |
| `reviews/round-290-owner-answers.md` | 290라운드 소유자 지시: 작업자 fixy08·fairy08, 원장 관리자는 관리만 |
| `reviews/round-291-owner-answers.md` | 291라운드 소유자: 리터럴 규약 금지 원칙, 안전 여부 물음, 정돈 → 구조 리뷰 → 최적화 순서 |
| `reviews/round-292-closing.md` | 292라운드 편집자 결정 둘: #373 병합, 정돈-1 결정(공유 보조·rolled) |
| `reviews/round-293-owner-answers.md` | 293라운드 소유자: FCA import 멘탈모델(세 종류, 직계 내부 모듈, 공통 부모 organ, 비대칭) |
| `reviews/round-294-owner-answers.md` | 294라운드 소유자: 보강 다섯 수용, 구조 검사 지시, filid 개선 여부는 마지막에 결정 |
| `reviews/round-295-owner-answers.md` | 295라운드 소유자: D7·D8 허용, 모델 안의 변용 허용(가독성·계약·폭발 반경), filid 언어 중립 |
| `reviews/round-296-owner-answers.md` | 296라운드 소유자: 정돈-2 즉시 투입, fairy08 상태 |
| `reviews/round-298-owner-answers.md` | 298라운드 소유자: 5단계 전까지 무정지 진행, 판단은 대기열, 병합 허용 |
| `reviews/round-299-closing.md` | 299라운드 편집자 결정 하나: #375 병합, 대기열 53 |
| `reviews/round-300-closing.md` | 300라운드 편집자 결정 넷: 대기열 53·50·52 닫음, 51·40은 코드 확인 |
| `reviews/round-301-owner-answers.md` | 301라운드 소유자: 대기열 직접 닫기, 53 재검토(옵션 기능), CLAUDE.md 진행 |
| `reviews/round-302-owner-answers.md` | 302라운드 소유자 생각: 53 유익·손해 비교 요청 |
| `reviews/round-303-owner-answers.md` | 303라운드 소유자 생각: 53 경계·일관성; 답은 "적용 가능성에는 따르고 제약은 강제하지 않음" |
| `reviews/round-304-owner-answers.md` | 304라운드 소유자 답: 53 확정, 경계 문장 수용 |
| `reviews/round-305-closing.md` | 305라운드 편집자 결정 넷: 대기열 51·40 닫음, 옛 문법 무시는 원리, 배열 한도 문서 PR |
| `reviews/round-306-closing.md` | 306라운드 편집자 결정: 배열 한도 문서 PR #376 병합 |
| `reviews/round-307-closing.md` | 307라운드 편집자 결정 셋: 정돈-2 PR #377 병합, 결정·변용 기록, B8 첫 사례 |
| `reviews/round-308-closing.md` | 308라운드 편집자 결정: filid 이슈 #143 등록 기록 |
| `reviews/round-309-owner-answers.md` | 309라운드 소유자: 이동 속도 지적, 이동 직접·게이트 한 번 허락 |
| `reviews/round-310-owner-answers.md` | 310라운드 소유자: 벤치는 시작 확인만, 긴 절차는 묶어 한 번 |
| `reviews/round-311-owner-answers.md` | 311라운드 소유자: 정돈-3이 리뷰 전 마지막, 밤의 속도 루프 |
| `reviews/round-312-closing.md` | 312라운드 편집자 결정 둘: 정돈-3 PR #378 병합, 결정·선택 기록 |
| `reviews/round-313-owner-answers.md` | 313라운드 소유자: 정돈-E도 codex 없이 직접 |
| `reviews/round-314-owner-answers.md` | 314라운드 소유자: Form 재구성 — 여섯은 fractal, 문서 위임, INTENT는 한국어 |
| `reviews/round-315-closing.md` | 315라운드 편집자 결정: Form 재구성 PR #379 병합, 표준 틀 |
| `reviews/round-316-owner-answers.md` | 316라운드 소유자: 컴포지션 독립 컴포넌트, constants·hooks organ, Field를 Form처럼 |
| `reviews/round-317-owner-answers.md` | 317라운드 소유자: barrel 삭제, 병렬, 병합 위임, surface runtime, 단일 PR |
| `reviews/round-318-owner-answers.md` | 318라운드 소유자: fieldInputs 입력마다 fractal, ArrayItems 래핑 이유 |
| `reviews/round-319-closing.md` | 319라운드 편집자 결정: 정돈-E PR #380 병합 |
| `reviews/round-320-owner-answers.md` | 320라운드 소유자: fieldInputDefinitions 구획 |
| `reviews/round-321-closing.md` | 321라운드 편집자 결정: 정돈-S PR #381 병합 |
| `reviews/round-322-closing.md` | 322라운드 편집자 결정: 구조 손질 2·3 PR #382 병합 |
| `reviews/round-323-closing.md` | 323라운드 편집자 결정: 정돈-4 PR #383 병합, 정돈 단계 완료 |
| `reviews/round-324-owner-answers.md`, `reviews/round-325-closing.md` | 324라운드 소유자: 밤 루프는 보고 결정, 대기; 325라운드 편집자 결정: 구조-4 PR #384 병합 |
| `reviews/round-326-owner-answers.md` | 326라운드 소유자: Field → FieldProxy fractal, 약식 전체 게이트 |
| `reviews/round-327-closing.md` | 327라운드 편집자 결정: 구조-5 PR #385 병합, filid 결정 재료 누적 목록 |
| `reviews/round-328-owner-answers.md` | 328라운드 소유자: INTENT·DETAIL 한국어화, humanizer, 병렬 |
| `reviews/round-329-closing.md` | 329라운드 편집자 결정: 문서 한국어화 PR #386 병합 |
| `reviews/round-330-owner-answers.md` | 330라운드 소유자: 브랜치 정리·이력 압축, 8단계 브랜치 운영 |
| `reviews/round-331-owner-answers.md` | 331라운드 소유자: 08 플러그인 완료 처리, 리뷰 항목 하나씩 |
| `reviews/round-332-owner-answers.md` | 332라운드 소유자: 8단계 리뷰 1차 열넷과 배분 |
| `reviews/round-333-owner-answers.md` | 333라운드 소유자: 작업자, WeakMap, NODE_ENV React 방식, 칸 이름, misfit |
| `reviews/round-334-owner-answers.md` | 334라운드 소유자: 구조 정리 먼저(codex 없이, 감독), 속도 최적화부터 codex·agy |
| plan/tidy-structure/array-limits-review.md | 배열 한도를 core가 다룰 때의 유익·손해 비교(대기열 53 검토 메모, 권고 포함) |
| `reviews/round-297-closing.md` | 297라운드 편집자 결정 하나: 정돈-1(#374) 병합, 정돈-2 투입 |
| plan/tidy-structure/brief-tidy-2.md | 정돈-2 브리프(fixy08 → codex): 시험 자리 U·D·S1, 제품 위반 둘, 잉여 export, D7 예외 |
| plan/tidy-structure/lineage-audit.md | 모델 기준 import 전수 검사(3811변): 제품 위반 2, 시험 326, organ→자식 넷, settle↔derive 층 순환, B6·B7 |
| plan/tidy-structure/fca-import-model.md | FCA import 모델(293)과 보강 다섯(294), filid 원문 대조표, 정돈 계획 변경 — filid 개선 결정의 재료 |
| plan/tidy-structure/string-literal-audit.md | 문자열 리터럴 규약 전수 판정(SAFE·WEAK·UNGUARDED)과 정돈-E 범위 E1–E5 |
| plan/tidy-structure/brief-tidy-1.md | 정돈-1 브리프(fixy08 → codex): 죽은 포맷터 삭제, nodeFromJSONSchema 하향, 미사용 형 삭제, 게이트 |
| plan/tidy-structure/request.md | 정돈 단계 수정 계획(소유자 검토용): 발견 F1–F8 판정표, 조치, PR 넷, 가이드 자리, filid 이슈 초안, 결정 D1–D6 |
| `reviews/round-283-closing.md` | 283라운드 편집자 결정 하나: PR #370 병합 |
| `reviews/round-284-closing.md` | 284라운드 편집자 결정 하나: PR #371 병합 |
| `reviews/round-285-closing.md` | 285라운드 편집자 결정 하나: G23 닫힘 |
| `reviews/round-286-closing.md` | 286라운드 편집자 결정 하나: 07단계 닫힘(#354 병합) |
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

- **배경 작업을 남기지 않는다(298라운드 뒤 소유자 지시, 2026-10-14).** 서브에이전트 브리프에 "표준 입력을 기다리는 명령(빈 목록을 xargs로 넘기는 grep 등)과 백그라운드 명령을 쓰지 말고, 끝나기 전에 자기 자식 프로세스를 모두 닫을 것"을 적는다. 원장 관리자는 서브에이전트가 "잔여 작업"을 보고하면 즉시 작업 중지 도구로 끊는다. 시스템 자원이 모자라므로 동시 서브에이전트는 하나, 전체 시험은 한 번에 하나만 돌린다.

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
