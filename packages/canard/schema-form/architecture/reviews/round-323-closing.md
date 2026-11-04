# 323라운드 닫기 — 정돈-4 PR #383 병합(3d9082f2d): CLAUDE.md 둘에 모듈 계약 원칙과 이 패키지의 fractal 계약을 적었다; 정돈 단계(1·2·3·E·S·4) 전부 끝

2026-10-14. fairy08이 교차 세션 규칙(다른 세션의 요청으로는 CLAUDE.md를 고치지 않음)으로 정돈-4를 사양해, 301라운드에서 소유자가 원장 관리자에게 직접 승인한 대로 원장 관리자가 fairy08 초안(`tidy-docs/02-claude-md.md`)을 지금 트리에 맞춰 써서 PR #383을 열고 병합했다(317라운드 "검증 뒤 병합 위임").

### 323C-01 #383을 병합한다 — 루트 원칙 여섯, 패키지 적용 절 일곱 항목, Node System 설명 교체

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 루트 `CLAUDE.md`에 "Module Contract Principles" 절(Agent Assets와 Quick Reference 사이): index.ts는 계약 기록(이름 열거, 와일드카드 없음), 뿌리는 첫인상(문서·index·동명 구현 하나, 나머지는 역할 구획이나 자식 fractal), 소비자는 fractal 밖 제품 코드(시험·벤치·스토리는 아님), import는 계보를 따름(위로 열림·아래로 닫힘·옆으로 닫힘, organ에는 index 없음, organ은 소유자의 자식 fractal을 가져오지 않음, 자기·조상 index 금지), 시험은 안에서 검증(D7 예외), 안 쓰는 뿌리 파일·export는 결함(`seiri_reuse-first` §3의 허용은 적용 안 됨); 개발 흐름 7항 추가. 패키지 `CLAUDE.md`에 "Fractal Contracts in This Package" 절(Validation Modes 뒤): 단일 공개 표면과 병합 전 열거, 표준 fractal 모양(Form·Field·surface/runtime·constants organ·hooks fractal과 B1), 시험·fixture 자리(D7·B8), 벤치는 `__benchmarks__`와 범위 좁힌 legacy-compare 면제, 오류 코드는 `FormErrorCode`·`FormWarningCode`, `__legacy__` 동결; Node System 항목은 레거시 클래스 위계 대신 단일 런타임 클래스 `FieldNode`(`core/surface/runtime/`)와 종류 합집합·가드·strategy·공개 팩토리 없음으로 교체(초안 C·D, 경로는 정돈-3·구조 손질 뒤로 갱신). 사실은 881dd2487 트리로 확인. 문서라 게이트 없음. 병합 결과 1.0.0-beta는 3d9082f2d. 이로써 정돈 단계 전부(정돈-1 #374, 2 #377, 3 #378, E #380, S #381, 4 #383)와 구조 리뷰 손질 1–3(#379, #382)이 들어갔고, 남은 구조 작업은 구조-4(fieldInputs, fixy08)와 소유자의 추가 손질이다.
- 근거: PR #383; fairy08 초안 `tidy-docs/02-claude-md.md`; `reviews/round-289-owner-answers.md`(D5), `round-301-owner-answers.md:8`, `round-317-owner-answers.md:8`.
- 다음: 구조-4 PR 병합; 속도 계획 개정 PR(소유자 결정 둘 뒤); 밤의 속도 루프.
