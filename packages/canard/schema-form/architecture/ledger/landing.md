# 단일 원장 — 이주와 착수

기준 커밋: `ba398c330`(저장소 `packages/canard/schema-form/architecture`). 이 원장이 인용하는 `path:line`은 모두 이 커밋의 줄 번호다. 정본 우선순위는 `ledger/README.md` §1을 따른다. 이 영역의 정본은 `08-design-a-to-z.md` §14(오늘과 달라지는 것)·§17(개발 단계와 PR 계획)과 `09-landing-and-test-strategy.md` §2(정착 검토)·§7(PR 계획 보정)이다. `09` §7이 `08` §17과 다르게 적으면 `09` §7이 이긴다(이 커밋에서는 `09` §7이 더하기만 하고 어긋나는 행은 없다). `05-before-after.md`·`06-conclusions.md`·`07-conclusions.md`의 이주 목록과 개발 진입 평가는 그때의 기록이다. 거기 적힌 이주 항목이 뒤 문서에 그대로 있으면 문장 분류(RESTATES)로 뒤 항목을 가리키고, 뒤 문서가 바꾼 것은 원문 그대로 대체됨 항목으로, 뒤 문서가 바꾸지 않았는데 `08` §14에 행이 없는 것은 원문 그대로 남기되, 표의 행은 그 규칙을 든 다른 영역의 항목을 가리키는 중복 항목으로, 나눌 수 없는 목록 문장은 현행 항목으로 둔다.

상태 값의 뜻: **현행**은 지금 유효한 규칙, **현행(기록)**은 그때의 기록이며 그 내용은 뒤 문서의 행이 들거나 뒤 라운드가 바꾼 것, **중복**은 규칙이 더 높은 정본을 가진 다른 영역의 항목에 있는 것, **대체됨**은 뒤 라운드가 바꾼 규칙(옛 문장을 원문 그대로 남긴다), **열림**은 18라운드 안건으로 넘어가 아직 정해지지 않은 것이다. 이주 표와 PR 표는 한 행이 한 항목이며, 결정 칸에 표의 머리 두 줄을 함께 옮긴다. **라운드**는 그 문장이 마지막으로 정해진 라운드이며, 이주 행과 PR 행은 기준 커밋의 `git blame`이 가리키는 라운드 커밋(`d478a8503` 11–14라운드, `f0df9545f` 15라운드, `99765899b` 16라운드, `165ee8948` 17라운드)을 따른다.

## 색인

| 번호 | 한 줄 요약 | 상태 | 닫은 사람 |
| --- | --- | --- | --- |
| LANDING-001 | 완전한 파괴적 변경 — 모든 패키지가 함께 메이저 버전급으로 올라감(C7) | 현행 | 소유자 답(`00-goals.md:110` C7), 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8) |
| LANDING-002 | 판 번호는 1.0.0-beta 프리릴리스 뒤 1.0.0 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:22` PR-8의 판 번호; 원문 재록 `09-landing-and-test-strategy.md:250,278`) |
| LANDING-003 | 릴리스 노트와 이주 프롬프트(`docs/agents`)를 낸다(C8) | 현행 | 소유자 답(`00-goals.md:111` C8), 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8) |
| LANDING-004 | 이주 1 — 분기 자동 감지 대신 명시 `controls.discriminator`·분기 안 `if/then/else: false`·`controls.active` | 현행 | 소유자 답(`reviews/round-9-spec.md:42` 읽기1), 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기) |
| LANDING-005 | 이주 2 — `oneOfIndex`·`anyOfIndices`·분기 선택 API는 대체물 없이 사라짐 | 현행 | 편집자 결정(9라운드 세 도출 일치, `07-conclusions.md:142` 4.25), 소유자 답(`reviews/round-9-spec.md:42` 읽기1) |
| LANDING-006 | 이주 3 — `&if`는 `controls.active`로 흡수 | 현행 | 편집자 결정(9라운드 이름, `07-conclusions.md:312` 조각 게이트 `&if` 은퇴), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기) |
| LANDING-007 | 이주 4 — `computed` 컨테이너는 `controls`로 이름 변경, 별칭 없음 | 현행 | 소유자 답(`reviews/round-15-decisions.md:13` 5), 소유자 답(`reviews/round-15-decisions.md:14` 6) |
| LANDING-008 | 이주 5 — `&pristine`은 `controls.resetInteraction` | 현행 | 소유자 답(`reviews/round-9-spec.md:68` pristine 정정), 편집자 결정(9라운드 이름, `07-conclusions.md:316` 소유자 동의 기록), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기) |
| LANDING-009 | 이주 6 — `controls.unsetValue`·`default`·`children`·`discriminator`·`unsetOnInactive` 신설 | 현행 | 소유자 답(`reviews/round-12-owner-answers.md:13` 5 `&clearValue`→`unsetValue`), 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천), 소유자 답(`reviews/round-9-spec.md:108` 자식 집합 제어), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름) |
| LANDING-010 | 이주 7 — `allOf` 항목 안의 `if/then/else`가 병합된다 | 현행 | 소유자 답(`reviews/round-9-spec.md:23` 축5), 편집자 결정(9라운드 병합표, `07-conclusions.md:168` 4.27) |
| LANDING-011 | 이주 8 — 분기 전환 때 이미 있던 노드는 다시 채우지 않음 | 현행 | 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점 A), 편집자 결정(9라운드, `07-conclusions.md:109` 4.22) |
| LANDING-012 | 이주 9 — 표준 `readOnly`와 `&readOnly`는 택일에서 OR로 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙; 상태 키는 그 노드에만, OR는 정하지 않음), 편집자 결정(로컬 선언끼리 잠금 OR, `07-conclusions.md:158`) |
| LANDING-013 | 이주 10 — `allOf` 항목끼리 겹친 표준 `readOnly`는 먼저 승에서 OR로 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙; 상태 키는 그 노드에만, OR는 정하지 않음), 편집자 결정(로컬 선언끼리 잠금 OR, `07-conclusions.md:158`) |
| LANDING-014 | 이주 11 — 공개 문서의 `derived` 레벨 약속은 에지로 | 현행 | 편집자 결정(9라운드 도출, `07-conclusions.md:276` 06의 5.2 D-11′는 에지) |
| LANDING-015 | 이주 12 — 루트 키 다섯의 특수 처리와 README "Priority System"이 사라지고 전체 잠금은 Form 속성 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리) |
| LANDING-016 | 이주 13 — 로컬 순위 사슬(노드 `readOnly: false`가 `&readOnly`를 이김)은 OR로 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙; 상태 키는 그 노드에만, OR는 정하지 않음), 편집자 결정(로컬 선언끼리 잠금 OR, `07-conclusions.md:158`) |
| LANDING-017 | 이주 14 — 맨 키 `disabled`·`visible`·`active`는 `controls.*`로 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:9` 3 폼 전용 키 접두), 소유자 답(`reviews/round-15-decisions.md:13` 5) |
| LANDING-018 | 이주 15 — 조각이 꺼져도 원본은 기본 유지, 비움은 `unsetOnInactive` | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름) |
| LANDING-019 | 이주 16 — `virtual`의 `required` 재작성을 하지 않음 | 현행 | 편집자 결정(5라운드 ADR 0011 4차, `05-before-after.md:155` 근거 `adr/0011:67,71`) |
| LANDING-020 | 이주 17 — `find`·`findNodes`는 터미널 아래 경로에 노드를 돌려주지 않음 | 현행 | 편집자 결정(7라운드 축 수렴 D-21, `06-conclusions.md:170` 4.8) |
| LANDING-021 | 이주 18 — 10비트 `SetValueOption`은 비트 넷 | 현행 | 편집자 결정(9라운드 이름, `07-conclusions.md:345` N1; 비트마스크는 8라운드 소유자 지시, `HANDOFF.md` 8라운드 행) |
| LANDING-022 | 이주 19 — 루트 `onChange` 디바운스 대신 최외곽 동기 진입당 1회 | 현행 | 소유자 답(`reviews/round-4.md:116` D-10) |
| LANDING-023 | 이주 20 — `normalizedValue`는 `outputValue` | 현행 | 편집자 결정(8라운드 이름 N3, `06-conclusions.md:356`; 9라운드 판정 그대로, `07-conclusions.md:347`) |
| LANDING-024 | 이주 21 — 인터페이스 `JSONSchemaError`는 `ValidationIssue` | 현행 | 편집자 결정(14라운드, `08-design-a-to-z.md:453`) |
| LANDING-025 | 이주 22 — 무한 루프·검증기 실패·바운더리·검증기 없음의 새 동작 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:454`) |
| LANDING-026 | 이주 23 — 조건부 폼 생성 시 `compileGuard` 컴파일 비용이 생김 | 현행 | 편집자 결정(14라운드, `08-design-a-to-z.md:455`) |
| LANDING-027 | 이주 24 — `then`·`else`의 `required`로 켜고 끄던 필드는 `then.properties`나 `controls.active`로 | 현행 | 소유자 답(`reviews/round-9-spec.md:21` 축3), 소유자 답(`reviews/round-10-owner-answers.md:38` E-23), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기) |
| LANDING-028 | 이주 25 — 조건도 판별식도 없는 `oneOf`·`anyOf`는 모든 분기가 켜짐 | 현행 | 소유자 답(`reviews/round-9-spec.md:44` 읽기1 이어서), 편집자 결정(9라운드, `07-conclusions.md:142` 4.25) |
| LANDING-029 | 이주 26 — 식의 기준점은 호스트로 바뀌지 않고 `controls.children`으로 옮길 때만 고침 | 현행 | 소유자 답(`reviews/round-15-decisions.md:9` 1), 소유자 답(`reviews/round-12-owner-answers.md:21` §9 조각 식의 경로 기준) |
| LANDING-030 | 이주 27 — `injectTo` 순환 자동 차단은 없고 예산이 잡음 | 현행 | 소유자 답(`reviews/round-1.md:179` 순환을 분석 단계에서 금지하는가), 소유자 답(`reviews/round-10-owner-answers.md:10` A-4), 소유자 답(`reviews/round-12-owner-answers.md:20` §9 `undefined` 반환) |
| LANDING-031 | 이주 28 — 검증기 앞 제거는 키워드 위치의 그룹 객체 셋 | 현행 | 소유자 답(`reviews/round-15-decisions.md:12` 4) |
| LANDING-032 | 이주 29 — 꺼졌다 켜질 때 복원·`oneOf` 전환 잇기 대신 원본 유지와 노드 공유 | 현행 | 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 편집자 결정(노드 공유, `05-before-after.md:154` 근거 `adr/0005:103`) |
| LANDING-033 | 이주 30 — 평면 `&키` 축약은 사라지고 제어 키는 `controls` 안에만 | 현행 | 소유자 답(`reviews/round-15-decisions.md:13` 5) |
| LANDING-034 | 이주 31 — 맨 폼 전용 키는 `options.*`·`presentation`으로, `options.trim`은 적용 자리만 바뀜 | 현행 | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:15` 7), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3) |
| LANDING-035 | 이주 32 — 렌더러 키·Form 속성·prop `FormTypeRenderer`의 이름 변경 | 현행 | 소유자 답(`reviews/round-15-decisions.md:21` 8 렌더 계층 이름 매핑), 17라운드 스웜 수렴(편집자 결정, 사실 정정) |
| LANDING-036 | 이주 33 — Form 속성 `validatorFactory`는 `{ compile, compileGuard }` 객체 | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:13` O-7), 편집자 결정(16라운드 정착 검토, `09-landing-and-test-strategy.md:19`) |
| LANDING-037 | 이주 34 — 검증기 플러그인 계약에 `compileGuard(root, pointer)`와 `rejectedKey`가 더해짐 | 현행 | 편집자 결정(16라운드 정착 검토 조건 1, `09-landing-and-test-strategy.md:19`), 소유자 답(`reviews/round-16-owner-answers.md:16` 10) |
| LANDING-038 | 이주 35 — `node.jsonSchema`는 켜진 조각을 병합한 유효 스키마 | 현행 | 소유자 답(`reviews/round-9-spec.md:23` 축5), 편집자 결정(16라운드, `08-design-a-to-z.md:467`) |
| LANDING-039 | 이주 36 — `FormHandle.reset`은 로드이며 같은 스키마면 트리를 남기고 다르면 호출 안에서 재생성 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:8` 2), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:71` §2.6) |
| LANDING-040 | 이주 37 — 플러그인의 `options.*` 자유 키와 맨 표현 키는 `presentation.*`로 | 현행 | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:15` 7) |
| LANDING-041 | 이주 38 — 로드 뒤 검증은 `OnChange` 비트일 때만 한 번 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:71` §2.6의 아홉째), 17라운드 스웜 수렴(편집자 결정, core만 쓰는 호스트의 마운트 검증) |
| LANDING-042 | 이주 39 — 호출자의 전체 교체 `setValue(V)`는 reset과 같은 입력 판정 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:71` §2.6의 열넷째) |
| LANDING-043 | 이주 40 — 공개 `node.group`은 `node.strategy` | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름) |
| LANDING-044 | 이주 41 — Form 속성 `onError` 신설, 오류·경고 코드 목록이 공개 계약 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 17라운드 스웜 수렴(편집자 결정, 안 B) |
| LANDING-045 | 이주 42 — `diagnostics`는 `'stable'`·`'degraded'`, 다음 로드까지 남고 그 동안 제출 거부 | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드, `exceededBudget`을 정착 예산 셋으로) |
| LANDING-046 | 이주 43 — 바운더리는 가두고 대체 화면을 그린 뒤 다시 던지지 않고 보고 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 소유자 답(`reviews/round-17-owner-answers.md:34` (나)) |
| LANDING-047 | 이주 44 — `trim`은 포커스 아웃 때 `finishInput` 칸이 자르고 입력 출처 쓰기로 다룸 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:43` 9 입력 마침 칸) |
| LANDING-048 | 이주 45 — `isTerminalNode`는 `node.strategy`로 판정하고 형 좁히기를 바로잡음 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 17라운드 스웜 수렴(편집자 결정, 노드 구조) |
| LANDING-049 | 이주 46 — 노드 메서드 `findAll`은 `findNodes` | 현행 | 17라운드 스웜 수렴(편집자 결정, 노드 구조) |
| LANDING-050 | 이주 47 — 행이 없는 조합(잎 `terminal: false`, 가상 `terminal: true`, 인라인 입력)의 처리와 이주 | 열림(→ `reviews/round-18-agenda.md` §6, :78) | 편집자 결정(17라운드, 18라운드 안건 N14로 이관) |
| LANDING-051 | 배포는 한 번, 개발은 우산 브랜치 안의 PR 아홉으로 나눔 | 현행 | 소유자 답(`00-goals.md:110` C7), 편집자 결정(14라운드, `08-design-a-to-z.md:551`) |
| LANDING-052 | 전환 방식 — 옛 코드는 레거시로 옮기고 새로 쓰며 옛 이름과의 중복은 기준이 아님 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:52` 전환 방식) |
| LANDING-053 | 새 엔진은 전환 PR 전까지 `<Form>`에 닿지 않고 점진 교체는 하지 않음 | 현행 | 편집자 결정(17라운드, `08-design-a-to-z.md:552` antigravity 검토와 같은 판단) |
| LANDING-054 | 레거시 디렉토리의 이름과 자리, 그 동안 기존 시험과 스토리북을 돌리는 방법 | 열림(→ `reviews/round-18-agenda.md` §8, :100-101) | 편집자 결정(17라운드, 18라운드 안건 §8로 이관) |
| LANDING-055 | 문서가 코드보다 먼저 바뀜 — 각 PR은 새 fractal의 INTENT·DETAIL로 시작, 이름은 책임으로 | 현행 | 원리(filid 규칙, 저장소 `.claude/rules/filid_code-placement.md` §5), 소유자 답(`reviews/round-17-owner-answers.md:26` `tree`의 이름, 책임별로 나눔) |
| LANDING-056 | 새 core의 자리와 이름 — `blueprint`·`record`·`behaviors`·`navigation`·`settle`·`dispatch`·`validation`·`SchemaNode`와 행의 칸 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:21` 종류별 동작 표의 이름), 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:26` `tree`의 이름), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸), 소유자 답(`reviews/round-17-owner-answers.md:42-46` 4·9·10·12·15·14), 소유자 답(`reviews/round-17-owner-answers.md:53` `Node` 이름 규칙) |
| LANDING-057 | 겉면 규칙과 behaviors 규칙 | 현행 | 17라운드 스웜 수렴(편집자 결정, 노드 구조 스웜 정련; `reviews/round-17-owner-answers.md:25` 반영 칸) |
| LANDING-058 | 원샷이어야 하는 것은 전환 PR(PR-7)과 `master` 병합 둘뿐 | 현행 | 편집자 결정(14라운드, `08-design-a-to-z.md:562`) |
| LANDING-059 | 릴리스는 `master` 병합 뒤의 배포이며 판 올림 PR 병합이 시험 관문을 거쳐 자동 배포 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2의 일곱째) |
| LANDING-060 | PR-0 문서 — 이 문서·기록·HANDOFF·프로토타입 v7·시나리오 패키지 뼈대 | 현행 | 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:570`), 소유자 답(`reviews/round-16-owner-answers.md:14` 8 시나리오 모듈은 비공개 패키지), 편집자 결정(17라운드, 18라운드 정련을 착수 조건에 더함) |
| LANDING-061 | PR-1 청사진 — 조각 표·노드 공유·병합 함수·잎 교차 함수 이동·식 컴파일러 이동·청사진 오류의 데이터화 | 현행 | 편집자 결정(16라운드, 답 10으로 확정 `reviews/round-16-owner-answers.md:16`), 소유자 답(`reviews/round-14-owner-answers.md:17` O-11 `merge` 선택 인자), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 17라운드 스웜 수렴(편집자 결정, 터미널 전략·병합의 원자·데이터화) |
| LANDING-062 | PR-2 노드 트리와 정착 — 단일 클래스 `SchemaNode`와 동작 행, 정착 루프, 예산 다섯과 원본 B, `diagnostics` | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 편집자 결정(16라운드 정착 검토 조건 5, `09-landing-and-test-strategy.md:23`) |
| LANDING-063 | PR-3 파생 — `controls.derived`·`injectTo`·`unsetValue`, 같은 대상 규칙, 에지 소비 | 현행 | 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:573`), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기) |
| LANDING-064 | PR-4 통지와 검증 — 디스패처·`batch`·진입 사슬·`onError`의 core 쪽·`compileGuard`·배달 경로 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:9` 3 배달 경로), 소유자 답(`reviews/round-16-owner-answers.md:16` 10 가드 캐시와 등록의 소유), 16라운드 스웜 수렴(편집자 결정, 재생성 reset의 같은 `$id`), 17라운드 스웜 수렴(편집자 결정, `onError` core 쪽과 가드 컴파일) |
| LANDING-065 | PR-5 배열 — 배열·터미널 배열 행, 아이템 호스트, 통째 교체의 identity | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:575`) |
| LANDING-066 | PR-6 상태 키와 제어 — 결합(OR/AND)·`controls.children`·조각 `controls`·`unsetOnInactive`의 정책 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 17라운드 스웜 수렴(편집자 결정, 터미널 전략은 선언 사이 정적) |
| LANDING-067 | PR-7 전환 — `nodeFromJSONSchema` 재구축, React 바인딩 연결, Form 속성, 바운더리, 옛 코드 삭제, UI 플러그인 이주 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 소유자 답(`reviews/round-17-owner-answers.md:34` (나)), 소유자 답(`reviews/round-16-owner-answers.md:11,13` 5·7), 16라운드 스웜 수렴(편집자 결정, reset·로드·`setValue(V)`), 17라운드 스웜 수렴(편집자 결정, 바운더리·마운트 계약) |
| LANDING-068 | PR-8 릴리스 — README·docs, ADR 0010 최종, 이주 안내와 프롬프트, changeset과 `CHANGELOG.md`, 릴리스 테스트 | 현행 | 소유자 답(`00-goals.md:111` C8), 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 소유자 답(`reviews/round-16-owner-answers.md:22` PR-8의 판 번호), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2) |
| LANDING-069 | 교체 규모 — 교체 대상, 그대로 쓰는 것, 옮기는 것, 테스트 234파일의 처분 | 현행 | 편집자 결정(16라운드 정착 검토 조건 2, `09-landing-and-test-strategy.md:20`), 소유자 답(`reviews/round-17-owner-answers.md:45` 12·15 생성 함수), 소유자 답(`reviews/round-16-owner-answers.md:13` 7) |
| LANDING-070 | 형제 패키지 — ajv 셋의 동기 `compileGuard`, UI 플러그인 27파일의 `presentation.*` 이주, `@winglet/react-utils` 선택 인자 | 현행 | 편집자 결정(16라운드 정착 검토 조건 1·6, `09-landing-and-test-strategy.md:19,24`), 소유자 답(`reviews/round-17-owner-answers.md:34` (나)), 17라운드 스웜 수렴(편집자 결정) |
| LANDING-071 | 위험이 모이는 곳은 PR-7 — 완화는 엔진 수준 통합 시나리오와 차등 테스트 | 현행 | 편집자 결정(14라운드, `08-design-a-to-z.md:600`) |
| LANDING-072 | PR-7을 더 쪼갤 수 없는 이유 | 현행 | 편집자 결정(14라운드, `08-design-a-to-z.md:601`) |
| LANDING-073 | 정착 조건 1 — 가드 계약 `compileGuard(root, pointer)`, ajv 셋의 동기 경로, 코어의 작성 루트 기준 캐시 | 현행 | 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-16-owner-answers.md:16` 10) |
| LANDING-074 | 정착 조건 2 — 재사용 두 문장을 사실대로: 잎 교차 함수만 재사용, 식 컴파일러는 청사진으로 통째 이동 | 현행 | 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-16-owner-answers.md:16` 10) |
| LANDING-075 | 정착 조건 3 — 바인딩 계약 넷(다섯째는 편집자가 더함) | 현행 | 17라운드 스웜 수렴(편집자 결정, 첫째·넷째), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4, 다시 던지지 않음), 편집자 결정(16라운드, 다섯째) |
| LANDING-076 | 정착 조건 4 — 상태·오류·명령 사건과 검증 결과의 배달 경로 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:9` 3) |
| LANDING-077 | 정착 조건 5 — 되돌림 기록에 `extras`와 배열 구조 | 현행 | 편집자 결정(16라운드 정착 검토) |
| LANDING-078 | 정착 조건 6 — UI 플러그인 규모와 `options` 닫힌 목록의 충돌은 PR-7의 `presentation.*` 이주로 | 현행 | 편집자 결정(16라운드 정착 검토) |
| LANDING-079 | 정착 조건 7 — 공개 노드 타입·가드는 단일 클래스 겉면과 판별 인터페이스로 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 17라운드 스웜 수렴(편집자 결정, 노드 구조 수렴) |
| LANDING-080 | 정착 조건 8 — 훅·바인딩 시험과 React 18 실행 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:11` 5), 편집자 결정(16라운드 정착 검토) |
| LANDING-081 | 정착 지도 PR-1 — 부딪히는 코드, 그대로 쓰는 것, 새 fractal `src/core/blueprint/` | 현행 | 편집자 결정(16라운드 정착 검토) |
| LANDING-082 | 정착 지도 PR-2 — 부딪히는 코드, 그대로 쓰는 것과 옮길 자리, 새 fractal 다섯 | 현행 | 편집자 결정(16라운드 정착 검토), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 소유자 답(`reviews/round-18-owner-answers.md:7` S1; 파서를 가져온다), 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; 뜻이 그대로인 변환만) |
| LANDING-083 | 정착 지도 PR-3 — 부딪히는 코드, `createDynamicFunction`의 의존 주입 형태, `settle/derive/` | 현행 | 편집자 결정(16라운드 정착 검토) |
| LANDING-084 | 정착 지도 PR-4 — `EventCascadeManager`·`ValidationManager` 교체, `dispatch/`·`validation/`, 진입 사슬의 소유 | 현행 | 편집자 결정(16라운드 정착 검토), 17라운드 스웜 수렴(편집자 결정, 진입 사슬은 `dispatch`가 소유) |
| LANDING-085 | 정착 지도 PR-5 — `ArrayNode` 전략·비동기 `push` 교체, `arrayBehavior/` | 현행 | 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈) |
| LANDING-086 | 정착 지도 PR-6 — 루트 스키마 전역 상속·`checkComputedOptionFactory` 교체, `settle/`의 계산 끝 | 현행 | 편집자 결정(16라운드 정착 검토) |
| LANDING-087 | 정착 지도 PR-7 — 렌더 계층 교체, 그대로 쓰는 것, `core/index.ts` 수출의 전환 | 현행 | 편집자 결정(16라운드 정착 검토), 17라운드 스웜 수렴(편집자 결정, `core/index.ts`의 진입점과 `core/types` 정리) |
| LANDING-088 | `core/INTENT.md`의 상속 문장은 PR-1에서 먼저 고침 | 현행 | 편집자 결정(16라운드 정착 검토), 원리(filid 규칙, 문서가 코드보다 먼저) |
| LANDING-089 | 정착 지도의 '그대로 쓰는 것'은 레거시에서 가져오는 코드의 목록 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:52` 전환 방식), 편집자 결정(17라운드, `09-landing-and-test-strategy.md:42`) |
| LANDING-090 | 보정 PR-0 — 시나리오 형과 러너 뼈대, vitest 셋, addon-vitest, 옛 스토리 처분 목록, 비공개 시나리오 패키지 | 현행 | 편집자 결정(16라운드, 테스트 전략), 소유자 답(`reviews/round-16-owner-answers.md:14` 8), 소유자 답(`reviews/round-16-owner-answers.md:10` 4) |
| LANDING-091 | 보정 PR-1 — 식 컴파일러 통째 이동, 잎 교차 함수 이동, `core/INTENT.md` 개정, `merge` 선택 인자와 changeset | 현행 | 편집자 결정(16라운드, 답 10으로 확정 `reviews/round-16-owner-answers.md:16`), 소유자 답(`reviews/round-14-owner-answers.md:17` O-11) |
| LANDING-092 | 보정 PR-2 — 되돌림 기록 항목 확정, 노드 구조, `active` 게터, 나감 비움의 하위 트리 규칙 | 현행 | 편집자 결정(16라운드 정착 검토 조건 5), 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2) |
| LANDING-093 | 보정 PR-4 — ajv 셋의 동기 `compileGuard`, 사본·가드 캐시, 재생성 reset의 같은 `$id`, `onError`의 core 쪽 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:16` 10), 16라운드 스웜 수렴(편집자 결정, 재생성 reset의 같은 `$id`), 17라운드 스웜 수렴(편집자 결정, `onError` core 쪽) |
| LANDING-094 | 보정 PR-5 — 배열·터미널 배열 행, `resolveArrayLimits`의 청사진 이동 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 편집자 결정(16라운드 정착 검토) |
| LANDING-095 | 보정 PR-7 — 바인딩 계약 다섯, `onError` 렌더 계층, `finishInput`, e2e·스토리·스파이크 이식, `reset`의 로드 전환 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 소유자 답(`reviews/round-16-owner-answers.md:10,11` 4·5), 16라운드 스웜 수렴(편집자 결정, reset·로드), 17라운드 스웜 수렴(편집자 결정, 바인딩 계약 첫째·넷째) |
| LANDING-096 | 보정 PR-8 — 릴리스 전 벤치 재실행, changeset과 판 번호, 릴리스 테스트, reset 규칙 문서, 스토리북 문서 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:22` PR-8의 판 번호), 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2) |
| LANDING-097 | 릴리스 전환(별도 PR) — changesets 가동과 CI·배포 작업 흐름 정리, PR-8 전에 병합 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2) |
| LANDING-098 | 05의 이주 행 가운데 08 §14에 행이 없는 것 — `ENHANCED_KEY`, `minItems`·`maxItems`, `Normalize`, `null`→`{}`, 배열 Promise, `setValue(getValue())`, `useEffect` 파생 쓰기 | 분할됨(→ LANDING-115, LANDING-116, LANDING-117, LANDING-118, LANDING-119) | 편집자 결정(6라운드 대조, `05-before-after.md:5`) |
| LANDING-099 | 대체됨 — 폼이 분기를 고르던 05의 행(값 가드·선택 가드·`selection` 칸·분기 하나만 활성) | 대체됨(→ LANDING-004, LANDING-005, LANDING-006, LANDING-028) | 편집자 결정(9라운드 세 도출 일치, `07-conclusions.md:142` 4.25), 소유자 답(`reviews/round-9-spec.md:42,44` 읽기1) |
| LANDING-100 | 대체됨 — `options.trim` 강제 변환은 사라지고 입력 컴포넌트가 맡음 | 대체됨(→ LANDING-047, LANDING-034) | 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3) |
| LANDING-101 | 대체됨 — React 컴포넌트 감지 대신 "있고 `null`이 아니다"만 봄 | 대체됨(→ LANDING-061, LANDING-082) | 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1) |
| LANDING-102 | 대체됨 — 분석 단계의 정적 throw 대신 런타임 충돌 보고 | 대체됨(→ ERROR-078, LANDING-061) | 소유자 답(`reviews/round-14-owner-answers.md:16` O-10), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| LANDING-103 | 대체됨 — 쓰기 옵션은 옵션 객체(`{ mode: 'Merge' }`) | 대체됨(→ LANDING-021) | 편집자 결정(9라운드 이름, `07-conclusions.md:345` N1; 비트마스크는 8라운드 소유자 지시, `HANDOFF.md` 8라운드 행) |
| LANDING-104 | 대체됨 — 정착 상태 `settle`과 예산 | 대체됨(→ LANDING-045) | 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| LANDING-105 | 대체됨 — strict 검증기용 `&` 키 제거 유틸리티 | 대체됨(→ LANDING-031, LANDING-033) | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:13` 5) |
| LANDING-106 | `refresh(path)`·`remount(path)` 공개 — C-11 확정 대기 | 열림(→ `reviews/round-18-agenda.md` §7, :87) | 편집자 결정(17라운드, 18라운드 안건 §7로 이관) |
| LANDING-107 | 대체됨 — 진단 채널 후보(단일 콜백) | 대체됨(→ LANDING-044, LANDING-045) | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 17라운드 스웜 수렴(편집자 결정, 안 B) |
| LANDING-108 | 대체됨 — `normalizedValue`·`enhancedValue`·`&pristine`·`PublicSetValueOption`의 이름과 거취 미결(D-23) | 대체됨(→ LANDING-023, LANDING-008) | 편집자 결정(8라운드 이름 N3, `06-conclusions.md:356,358`), 편집자 결정(9라운드 이름, `07-conclusions.md:316` 소유자 동의 기록) |
| LANDING-109 | 06 §9의 5 이주 안내 항목(C8) — 8라운드가 새로 올린 것 | 현행 | 소유자 답(`00-goals.md:111` C8; 이주 안내를 낸다), 편집자 결정(8라운드, `06-conclusions.md:429`; 목록), 소유자 답(`reviews/round-10-owner-answers.md:20` D-7; 5.3의 (C)) |
| LANDING-110 | 07 §9의 6 이주 안내 항목(C8) — 9라운드가 더한 것 | 현행(기록) | 편집자 결정(9라운드, `07-conclusions.md:423`) |
| LANDING-111 | 대체됨 — `&if`를 `&active`로 옮길 때 `./x`를 `../x`로 고친다 | 대체됨(→ LANDING-029) | 소유자 답(`reviews/round-15-decisions.md:9` 1) |
| LANDING-112 | 대체됨 — 코드 착수 전에 할 일 넷(9라운드 개발 진입 평가) | 대체됨(→ LANDING-060) | 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:570` 착수 전 닫을 것) |
| LANDING-113 | 대체됨 — 구현 슬라이스 0–8(두 검토의 순서를 합침) | 대체됨(→ LANDING-060, LANDING-061, LANDING-062, LANDING-063, LANDING-064, LANDING-065, LANDING-066, LANDING-067, LANDING-068) | 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:568-578`) |
| LANDING-114 | 대체됨 — 9라운드의 규모 추정(교차 연산을 청사진 병합으로 옮겨 재사용) | 대체됨(→ LANDING-069, LANDING-074) | 편집자 결정(16라운드 정착 검토 조건 2, `09-landing-and-test-strategy.md:20`) |
| LANDING-115 | 이주(05) — `ENHANCED_KEY` 마커 주입이 사라지고 활성 조각 기반 `schemaPath` 필터로 | 중복(→ VALIDATE-010) | 원리(`03-mental-model.md:13` P1) |
| LANDING-116 | 이주(05) — `minItems` 채움·`maxItems` 차단은 입력 컴포넌트로, `Normalize` 키 제거와 `null`→`{}`는 폐기 | 중복(→ WRITE-022) | 소유자 답(`reviews/round-2.md:119` 새 원칙; 배열 행), 편집자 결정(5라운드, ADR 0013 4차 본문 `adr/0013-core-does-not-rewrite-values.md:12`; F27·E16) |
| LANDING-117 | 이주(05) — 배열 연산은 Promise를 돌려주지 않는 동기 API | 중복(→ EVENT-002) | 편집자 결정(4라운드, 실행 검증을 통과한 제안, `adr/0008-event-system.md:3`·`reviews/round-4.md:77`) |
| LANDING-118 | 이주(05) — `setValue(getValue())`는 전체 교체라 지운 키에 채움이 다시 들어감 | 중복(→ WRITE-017) | 소유자 답(`reviews/round-4.md:113` D-7) |
| LANDING-119 | 이주(05) — `useEffect`로 쓴 파생 값은 새 진입이라 키 입력당 `onChange` 2회 | 중복(→ EVENT-036) | 편집자 결정(5라운드 도출 C-10, `reviews/round-5-derivations.md:25`) |
| LANDING-120 | 이주(S1) — 파서의 강제 변환이 빠지고, 바꾸지 못한 값은 `NaN` 대신 받은 그대로 들며, 경고 `VALUE_TYPE_MISMATCH`가 생김 | 분할됨(→ LANDING-125, LANDING-126, LANDING-127) | 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; 뜻이 그대로인 변환만), 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째; 받은 그대로 든다, 경고등, `onError` 전달), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; 경고의 level·가칭 코드·보내는 때) |
| LANDING-121 | PR-8의 reset 문서가 적는 것 — 같은 스키마의 판정, prop을 읽는 때, 노드 참조가 이어지는 조건, 늦은 쓰기, `dirty` | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`), 소유자 답(`00-goals.md:109` C6; `dirty` 현행 유지) |
| LANDING-122 | 정착 검토의 그 밖의 판단 — `extras` 정적 규칙은 조각 표 걸음에서, 유효 스키마 메모는 비트 집합 키(추정) | 현행 | 편집자 결정(16라운드 정착 검토, `09-landing-and-test-strategy.md:3`) |
| LANDING-123 | 대체됨: 작업은 `feature/schema-form-redesign` 브랜치에 모이고 그 브랜치가 우산 PR — 14라운드에 우산 브랜치는 `refactor/schema-form-internal-architecture` | 대체됨(→ LANDING-051) | 편집자 결정(14라운드, `08-design-a-to-z.md:551`) |
| LANDING-124 | 명령 RequestEmitChange·RequestInjection과 공개 훅의 거취 — 미확인 | 열림(→ `reviews/round-18-agenda.md:151` 11-20) | 편집자 결정(18라운드, 원장 토큰 검사가 찾은 미결, `reviews/round-18-agenda.md:151`) |
| LANDING-125 | 이주(S1) — 파서의 강제 변환이 빠지고, 바꾸지 못한 값은 `NaN` 대신 받은 그대로 든다 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; 뜻이 그대로인 변환만), 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째; 받은 그대로 든다, 경고등, `onError` 전달) |
| LANDING-126 | 이주(S1) — 변환 실패 `onError` 기록의 level은 `warning`, 가칭 `VALUE_TYPE_MISMATCH` | 현행 | 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; 경고의 level·가칭 코드·보내는 때), 소유자 답(`reviews/round-18-owner-answers.md:17` 12-7; level `warning`) |
| LANDING-127 | 이주(S1) — 변환 실패 기록은 검증기 유무와 무관하게 보낸다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; 보내는 때) |

## 항목

### LANDING-001 완전한 파괴적 변경 — 모든 패키지가 함께 메이저 버전급으로 올라감(C7)

- 결정:
  > 완전한 파괴적 변경이며 `@canard/schema-form`과 플러그인 패키지 전부가 함께 메이저 버전급 변경으로 올라간다(C7).
- 보충:
  > 소유자(C7): ""스키마폼 관련 모든 버전은 일시에 메이저 버전급 변경을 진행한다." `@canard/schema-form`과 플러그인 패키지 전부가 함께 올라간다" (`00-goals.md:110`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:429#1`(정본), `08-design-a-to-z.md:551`, `00-goals.md:110`
- 닫은 사람: 소유자 답(`00-goals.md:110` C7), 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8)
- 라운드: 2
- 까닭: `00-goals.md:110`

### LANDING-002 판 번호는 1.0.0-beta 프리릴리스 뒤 1.0.0

- 결정:
  > 판 번호는 1.0.0-beta 프리릴리스 뒤 1.0.0이다(16라운드 소유자 답, 09 §6.2의 열넷째).
- 보충:
  > 소유자(16라운드 추가 확인): ""(나) 1.0.0-beta를 먼저 내고 1.0.0 예상합니다"" (`reviews/round-16-owner-answers.md:22`)
  > "PR-8의 changeset은 `major`이고(0.16.0 → 1.0.0), 먼저 프리릴리스 모드(`changeset pre enter beta`)로 `fixed` 무리 여덟을 1.0.0-beta.N으로 낸다. 프리릴리스는 `latest`를 건드리지 않도록 dist-tag `beta`로 올린다." (`09-landing-and-test-strategy.md:250`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:429#2`(정본), `08-design-a-to-z.md:562`, `08-design-a-to-z.md:578`, `09-landing-and-test-strategy.md:250,262,278`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:22` PR-8의 판 번호; 원문 재록 `09-landing-and-test-strategy.md:250,278`)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:250`

### LANDING-003 릴리스 노트와 이주 프롬프트(`docs/agents`)를 낸다(C8)

- 결정:
  > 릴리스 노트와 이주 프롬프트(`docs/agents` 경로)를 낸다(C8).
- 보충:
  > 소유자(C8): "(1) 릴리즈 노트와 배포 문서 — 수정의 의도와 목표, 기존 사용 방법별 대체 용법. (2) **그 수정을 수행할 수 있는 프롬프트** — 에이전트가 소비자의 맥락에 맞게 고칠 수 있도록." (`00-goals.md:111`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:429#3`(정본), `08-design-a-to-z.md:578`, `06-conclusions.md:429`, `07-conclusions.md:423`, `00-goals.md:111`
- 닫은 사람: 소유자 답(`00-goals.md:111` C8), 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8)
- 라운드: 2
- 까닭: `00-goals.md:111`

### LANDING-004 이주 1 — 분기 자동 감지 대신 명시 `controls.discriminator`·분기 안 `if/then/else: false`·`controls.active`

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 1 | `oneOf`·`anyOf`의 `const`·`enum` 자동 감지로 분기를 고른다 | 폼은 분기를 고르지 않는다. 명시 `controls.discriminator` 또는 분기 안 `if/then/else: false` 또는 `controls.active` |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:433`(정본), `07-conclusions.md:423`, `07-conclusions.md:142`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:42` 읽기1), 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기)
- 라운드: 15
- 까닭: `07-conclusions.md:142`

### LANDING-005 이주 2 — `oneOfIndex`·`anyOfIndices`·분기 선택 API는 대체물 없이 사라짐

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 2 | `oneOfIndex`·`anyOfIndices`, 분기 선택 API | 대체물 없이 사라진다. 분기의 필드는 노드이고 활성 여부는 노드의 `active` |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:434`(정본), `07-conclusions.md:423`, `07-conclusions.md:142`, `02-target-overview.md:328`
- 닫은 사람: 편집자 결정(9라운드 세 도출 일치, `07-conclusions.md:142` 4.25), 소유자 답(`reviews/round-9-spec.md:42` 읽기1)
- 라운드: 14
- 까닭: `07-conclusions.md:142`

### LANDING-006 이주 3 — `&if`는 `controls.active`로 흡수

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 3 | `&if`(분기의 조건) | `controls.active`로 흡수 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:435`(정본), `07-conclusions.md:312`, `07-conclusions.md:423`, `02-target-overview.md:336`
- 닫은 사람: 편집자 결정(9라운드 이름, `07-conclusions.md:312` 조각 게이트 `&if` 은퇴), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기)
- 라운드: 15
- 까닭: `07-conclusions.md:312`

### LANDING-007 이주 4 — `computed` 컨테이너는 `controls`로 이름 변경, 별칭 없음

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 4 | `computed` 컨테이너 | `controls`로 이름 변경. 별칭 없음(15라운드) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:436`(정본), `02-target-overview.md:335`, `reviews/round-15-decisions.md:13-14`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:13` 5), 소유자 답(`reviews/round-15-decisions.md:14` 6)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:13`
- 충돌:
  > `07-conclusions.md:423`의 "`computed`→`control`(별칭이므로 기계적)"는 정본과 다르다. 정본이 이긴다(`08-design-a-to-z.md:436`, 15라운드 결정 5).
  > `06-conclusions.md:429`의 "`computed.*` → `&*`와 접두 없는 키의 `&` 접두(N5)"는 정본과 다르다. 정본이 이긴다(`08-design-a-to-z.md:436`, 15라운드 결정 5).

### LANDING-008 이주 5 — `&pristine`은 `controls.resetInteraction`

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 5 | `&pristine` | `controls.resetInteraction` |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:437`(정본), `07-conclusions.md:316`, `07-conclusions.md:423`, `02-target-overview.md:337`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:68` pristine 정정), 편집자 결정(9라운드 이름, `07-conclusions.md:316` 소유자 동의 기록), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기)
- 라운드: 15
- 까닭: `07-conclusions.md:316`

### LANDING-009 이주 6 — `controls.unsetValue`·`default`·`children`·`discriminator`·`unsetOnInactive` 신설

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 6 | 없음 | `controls.unsetValue`, `controls.default`, `controls.children`, `controls.discriminator`, `controls.unsetOnInactive` 신설 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:438`(정본), `02-target-overview.md:338`, `07-conclusions.md:423`
- 닫은 사람: 소유자 답(`reviews/round-12-owner-answers.md:13` 5 `&clearValue`→`unsetValue`), 소유자 답(`reviews/round-9-spec.md:52` 읽기2 채우기 원천), 소유자 답(`reviews/round-9-spec.md:108` 자식 집합 제어), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름)
- 라운드: 14
- 까닭: `07-conclusions.md:304-318`

### LANDING-010 이주 7 — `allOf` 항목 안의 `if/then/else`가 병합된다

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 7 | `allOf` 항목 안의 `if/then/else`는 병합되지 않고 경고만 | 병합된다 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:439`(정본), `07-conclusions.md:423`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:23` 축5), 편집자 결정(9라운드 병합표, `07-conclusions.md:168` 4.27)
- 라운드: 14
- 까닭: `07-conclusions.md:168`

### LANDING-011 이주 8 — 분기 전환 때 이미 있던 노드는 다시 채우지 않음

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 8 | 분기 전환 때 공유 노드를 다시 채운다 | 이미 있던 노드는 다시 채우지 않는다 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:440`(정본), `07-conclusions.md:109`, `07-conclusions.md:423`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:56` 읽기2 시점 A), 편집자 결정(9라운드, `07-conclusions.md:109` 4.22)
- 라운드: 14
- 까닭: `07-conclusions.md:109-110`

### LANDING-012 이주 9 — 표준 `readOnly`와 `&readOnly`는 택일에서 OR로

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 9 | 표준 `readOnly`와 `&readOnly`는 택일(표준이 이김) | OR |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:441`(정본), `07-conclusions.md:158`, `07-conclusions.md:423`, `07-conclusions.md:475`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙; 상태 키는 그 노드에만, OR는 정하지 않음), 편집자 결정(로컬 선언끼리 잠금 OR, `07-conclusions.md:158`)
- 라운드: 14
- 까닭: `07-conclusions.md:158`

### LANDING-013 이주 10 — `allOf` 항목끼리 겹친 표준 `readOnly`는 먼저 승에서 OR로

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 10 | `allOf` 항목끼리 겹친 표준 `readOnly`는 먼저 승 | OR |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:442`(정본), `07-conclusions.md:423`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙; 상태 키는 그 노드에만, OR는 정하지 않음), 편집자 결정(로컬 선언끼리 잠금 OR, `07-conclusions.md:158`)
- 라운드: 14
- 까닭: `07-conclusions.md:158`

### LANDING-014 이주 11 — 공개 문서의 `derived` 레벨 약속은 에지로

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 11 | 공개 문서의 `derived` 레벨 약속 | 에지(의존 값이 바뀔 때만) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:443`(정본), `07-conclusions.md:276`, `06-conclusions.md:429`, `07-conclusions.md:423`
- 닫은 사람: 편집자 결정(9라운드 도출, `07-conclusions.md:276` 06의 5.2 D-11′는 에지)
- 라운드: 14
- 까닭: `07-conclusions.md:276`

### LANDING-015 이주 12 — 루트 키 다섯의 특수 처리와 README "Priority System"이 사라지고 전체 잠금은 Form 속성

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 12 | 루트 키 다섯(`readOnly`·`disabled`·`active`·`visible`·`pristine`)의 특수 처리, README "Priority System" | 사라진다. 루트 키는 루트 노드의 로컬 키. 전체 잠금은 Form 속성 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:444`(정본), `07-conclusions.md:423`, `07-conclusions.md:475`, `02-target-overview.md:340`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리)
- 라운드: 14
- 까닭: `07-conclusions.md:158`

### LANDING-016 이주 13 — 로컬 순위 사슬(노드 `readOnly: false`가 `&readOnly`를 이김)은 OR로

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 13 | 로컬 순위 사슬(노드 `readOnly: false`가 `&readOnly`를 이김) | OR |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:445`(정본), `07-conclusions.md:423`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙; 상태 키는 그 노드에만, OR는 정하지 않음), 편집자 결정(로컬 선언끼리 잠금 OR, `07-conclusions.md:158`)
- 라운드: 14
- 까닭: `07-conclusions.md:158`

### LANDING-017 이주 14 — 맨 키 `disabled`·`visible`·`active`는 `controls.*`로

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 14 | 맨 키 `disabled`·`visible`·`active` | `controls.disabled`·`controls.visible`·`controls.active` |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:446`(정본), `07-conclusions.md:423`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:9` 3 폼 전용 키 접두), 소유자 답(`reviews/round-15-decisions.md:13` 5)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:13`

### LANDING-018 이주 15 — 조각이 꺼져도 원본은 기본 유지, 비움은 `unsetOnInactive`

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 15 | 조각이 꺼지면 원본을 지우고 켜지면 노드가 생성될 때의 값(없으면 `default`)으로 복원 | 기본 유지(방출에서만 빠짐). 비움은 `unsetOnInactive` |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:447`(정본), `07-conclusions.md:423`, `08-design-a-to-z.md:305`, `02-target-overview.md:355`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름)
- 라운드: 14
- 까닭: `08-design-a-to-z.md:305`

### LANDING-019 이주 16 — `virtual`의 `required` 재작성을 하지 않음

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 16 | `virtual`의 `required` 재작성(가상 이름 → 실제 자식) | 하지 않는다. 작성자가 실제 필드를 적는다 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:448`(정본), `05-before-after.md:155`, `05-before-after.md:202`
- 닫은 사람: 편집자 결정(5라운드 ADR 0011 4차, `05-before-after.md:155` 근거 `adr/0011:67,71`)
- 라운드: 14
- 까닭: `05-before-after.md:155`

### LANDING-020 이주 17 — `find`·`findNodes`는 터미널 아래 경로에 노드를 돌려주지 않음

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 17 | `find`·`findNodes`가 터미널 아래 경로에 터미널 노드를 별칭으로 돌려줌 | 노드 없음 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:449`(정본), `06-conclusions.md:170`, `06-conclusions.md:176`, `06-conclusions.md:429`
- 닫은 사람: 편집자 결정(7라운드 축 수렴 D-21, `06-conclusions.md:170` 4.8)
- 라운드: 14
- 까닭: `06-conclusions.md:170`

### LANDING-021 이주 18 — 10비트 `SetValueOption`은 비트 넷

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 18 | 10비트 `SetValueOption` | 비트 넷 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:450`(정본), `07-conclusions.md:345`, `02-target-overview.md:339,353`
- 닫은 사람: 편집자 결정(9라운드 이름, `07-conclusions.md:345` N1; 비트마스크는 8라운드 소유자 지시, `HANDOFF.md` 8라운드 행)
- 라운드: 14
- 까닭: `07-conclusions.md:345`

### LANDING-022 이주 19 — 루트 `onChange` 디바운스 대신 최외곽 동기 진입당 1회

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 19 | 루트 `onChange` 매크로태스크 디바운스 | 최외곽 동기 진입당 1회 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:451`(정본), `05-before-after.md:158,174,201`
- 닫은 사람: 소유자 답(`reviews/round-4.md:116` D-10)
- 라운드: 14
- 까닭: `reviews/round-4.md:153`

### LANDING-023 이주 20 — `normalizedValue`는 `outputValue`

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 20 | `normalizedValue` | `outputValue` |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:452`(정본), `06-conclusions.md:356`, `06-conclusions.md:429`, `07-conclusions.md:347`
- 닫은 사람: 편집자 결정(8라운드 이름 N3, `06-conclusions.md:356`; 9라운드 판정 그대로, `07-conclusions.md:347`)
- 라운드: 14
- 까닭: `06-conclusions.md:356`

### LANDING-024 이주 21 — 인터페이스 `JSONSchemaError`는 `ValidationIssue`

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 21 | 인터페이스 `JSONSchemaError`(노드 오류 항목) | `ValidationIssue` |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:453`(정본), `08-design-a-to-z.md:599`, `adr/0014-error-policy.md:321`
- 닫은 사람: 편집자 결정(14라운드, `08-design-a-to-z.md:453`)
- 라운드: 14
- 까닭: `08-design-a-to-z.md:599`

### LANDING-025 이주 22 — 무한 루프·검증기 실패·바운더리·검증기 없음의 새 동작

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 22 | `INFINITE_LOOP_DETECTED`는 배치 도중 throw해 커밋을 남기지 않음. 검증기 컴파일 실패는 `console.error` + 노드 오류. `Form`의 자기 바운더리가 마운트 오류를 삼킴. 검증기 없이도 조용히 동작 | 원본 B를 커밋·통지한 뒤 사슬의 끝에서 모든 환경에서 throw(R17-1 나). 전체 스키마 컴파일 실패는 검증 불가, 가드 컴파일 실패는 그 게이트의 가드 실패, 요청 시점 실패는 `validate()`의 거부. 루트 바운더리는 다시 던지지 않고 가두어 `onError`와 주인 없는 오류 싱크로 보고한다. 검증기가 없어도 폼은 서며 `if` 게이트의 조각은 꺼진 채 경고를 낸다. 검증기가 없으면 거부하지 않고 개발 모드 콘솔과 `onError`의 경고 기록으로 트리마다 한 번 알리며, 검증기는 있으나 전체 스키마 컴파일이 실패하면 검증 모드가 `None`이 아닐 때 검증 요청·`validate()`·제출이 모든 환경에서 거부된다(소유자 통보 3 답, R17-1 나, 17라운드 스웜 수렴(편집자 결정)) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:454`(정본), `adr/0014-error-policy.md:321`, `02-target-overview.md:332`, `05-before-after.md:159`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:454`)
- 라운드: 17
- 까닭: `adr/0014-error-policy.md:14`

### LANDING-026 이주 23 — 조건부 폼 생성 시 `compileGuard` 컴파일 비용이 생김

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 23 | 조건부 폼 생성 시 가드 컴파일 비용 없음 | `compileGuard` 컴파일이 생긴다(가드 200개에 14–54 ms, 위치당 1회·인스턴스 사이 공유) |
- 보충:
  > "조건부 폼의 생성은 현재 구현보다 1.7배 느리다 — 가드 200개에 22.4 ms(ADR 0009)." (`adr/0004-validator-plugin-compile-guard.md:79`)
  > "AJV에서 가드의 호출은 싸고(좁은 가드 5–58 ns, 루트에 걸린 가드 200개를 키 입력마다 전부 돌려 7.9 µs) 비싼 것은 **컴파일**이다(가드 하나에 70–270 µs, 200개면 폼 생성 시점에 14–54 ms)." (`adr/0004-validator-plugin-compile-guard.md:46`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:455`(정본), `adr/0004-validator-plugin-compile-guard.md:46,79`, `07-conclusions.md:452,474`
- 닫은 사람: 편집자 결정(14라운드, `08-design-a-to-z.md:455`)
- 라운드: 14
- 까닭: `07-conclusions.md:474`

### LANDING-027 이주 24 — `then`·`else`의 `required`로 켜고 끄던 필드는 `then.properties`나 `controls.active`로

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 24 | `then`·`else`의 `required`로 필드를 켜고 끔(`then.required`가 `computed.active`가 됨) | 읽지 않는다. 그 필드를 `then.properties`로 옮기거나 `controls.active`를 적는다 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:456`(정본), `07-conclusions.md:423`, `05-before-after.md:194`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:21` 축3), 소유자 답(`reviews/round-10-owner-answers.md:38` E-23), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기)
- 라운드: 15
- 까닭: `07-conclusions.md:423`

### LANDING-028 이주 25 — 조건도 판별식도 없는 `oneOf`·`anyOf`는 모든 분기가 켜짐

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 25 | 조건도 판별식도 없는 `oneOf`·`anyOf`는 어느 분기도 켜지지 않음 | 모든 분기가 켜진다 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:457`(정본), `07-conclusions.md:423`, `07-conclusions.md:472`
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:44` 읽기1 이어서), 편집자 결정(9라운드, `07-conclusions.md:142` 4.25)
- 라운드: 14
- 까닭: `07-conclusions.md:142`

### LANDING-029 이주 26 — 식의 기준점은 호스트로 바뀌지 않고 `controls.children`으로 옮길 때만 고침

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 26 | `&if`의 경로 기준점은 호스트(`./kind`) | 바뀌지 않는다. 조각·`children`·`discriminator`의 식도 호스트 기준(15라운드). 자식에 적던 식을 `controls.children`으로 옮길 때만 `../x`를 `./x`로 고친다 |
- 보충:
  > 15라운드 결정 1: "자식에 적던 식을 `children`으로 옮기면 `../x`를 `./x`로 고친다. 08 §14 이주 항목 26(`&if` 기준점 변경)은 사라진다" (`reviews/round-15-decisions.md:9`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:458`(정본), `reviews/round-15-decisions.md:9`, `05-before-after.md:3`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:9` 1), 소유자 답(`reviews/round-12-owner-answers.md:21` §9 조각 식의 경로 기준)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:9`

### LANDING-030 이주 27 — `injectTo` 순환 자동 차단은 없고 예산이 잡음

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 27 | `injectTo` 순환 자동 차단 | 없다. 예산이 잡는다. 왕복이 정확하지 않은 양방향 주입은 식이 `undefined`를 돌려주어 멈춘다(ADR 0010) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:459`(정본), `07-conclusions.md:423`
- 닫은 사람: 소유자 답(`reviews/round-1.md:179` 순환을 분석 단계에서 금지하는가), 소유자 답(`reviews/round-10-owner-answers.md:10` A-4), 소유자 답(`reviews/round-12-owner-answers.md:20` §9 `undefined` 반환)
- 라운드: 14
- 까닭: `reviews/round-10-owner-answers.md:10`

### LANDING-031 이주 28 — 검증기 앞 제거는 키워드 위치의 그룹 객체 셋

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 28 | 검증기 앞 제거 키 여섯 | 키워드 위치의 그룹 객체 셋(§3.4). strict 검증기에는 동작 변화 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:460`(정본), `07-conclusions.md:423`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:12` 4)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:12`

### LANDING-032 이주 29 — 꺼졌다 켜질 때 복원·`oneOf` 전환 잇기 대신 원본 유지와 노드 공유

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 29 | 꺼졌다 켜질 때 노드 생성 시점의 값으로 복원, `oneOf` 전환에서 같은 이름·같은 타입 값을 이음 | 원본은 그대로 남는다(기본). 잇기 장치는 없고 노드 공유가 대신한다 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:461`(정본), `05-before-after.md:154`
- 닫은 사람: 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 편집자 결정(노드 공유, `05-before-after.md:154` 근거 `adr/0005:103`)
- 라운드: 15
- 까닭: `05-before-after.md:154`

### LANDING-033 이주 30 — 평면 `&키` 축약은 사라지고 제어 키는 `controls` 안에만

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 30 | 평면 `&키` 축약 | 사라진다. 제어 키는 `controls` 안에만(15라운드) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:462`(정본), `02-target-overview.md:335`, `05-before-after.md:3`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:13` 5)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:13`

### LANDING-034 이주 31 — 맨 폼 전용 키는 `options.*`·`presentation`으로, `options.trim`은 적용 자리만 바뀜

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 31 | 맨 키 `terminal`·`virtual`·`propertyKeys`, `formType`·`FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`·`errorMessages`, `options.trim`, `options`의 플러그인 자유 칸 | `options.terminal`·`options.virtual`·`options.propertyKeys`, `presentation`의 다섯 키, 자유 칸. `options.trim`은 `options`에 그대로 두고 적용 자리만 바뀐다(§14의 44행, 17라운드 소유자 답 R17-3) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:463`(정본), `05-before-after.md:3`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:15` 7), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3)
- 라운드: 17
- 까닭: `reviews/round-15-decisions.md:12`

### LANDING-035 이주 32 — 렌더러 키·Form 속성·prop `FormTypeRenderer`의 이름 변경

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 32 | 플러그인 키 `FormGroup`·`FormLabel`·`FormInput`·`FormError`, Form 속성 `CustomFormTypeRenderer`, 타입 `FormTypeRenderer` | `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`. Form 속성 `CustomFormTypeRenderer`는 `FormTypeGroupRenderer`가 되고 같은 이름의 Form 속성 `FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`가 새로 생긴다. `ChildNodeComponentProps`와 `FormGroupProps`의 공개 prop `FormTypeRenderer`(와 `OverridableFormTypeInputProps`의 Omit 목록)도 `FormTypeGroupRenderer`로 바꾼다. `FormInputProps`·`FormRenderProps`도 `ChildNodeComponentProps`와 교차하므로 같은 이름 변경을 받는다(17라운드 스웜 수렴(편집자 결정), 사실 정정). 합성 API `Form.*`의 이름과 `…Props` 형 이름은 그대로(그 안의 prop `FormTypeRenderer`는 위대로 바뀐다) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:464`(정본), `08-design-a-to-z.md:577`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:21` 8 렌더 계층 이름 매핑), 17라운드 스웜 수렴(편집자 결정, 사실 정정)
- 라운드: 17
- 까닭: `reviews/round-15-decisions.md:21`

### LANDING-036 이주 33 — Form 속성 `validatorFactory`는 `{ compile, compileGuard }` 객체

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 33 | Form 속성 `validatorFactory`는 함수 하나 | `{ compile, compileGuard }` 객체. 플러그인과 같은 계약(§11) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:465`(정본), `08-design-a-to-z.md:574`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:13` O-7), 편집자 결정(16라운드 정착 검토, `09-landing-and-test-strategy.md:19`)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:19`

### LANDING-037 이주 34 — 검증기 플러그인 계약에 `compileGuard(root, pointer)`와 `rejectedKey`가 더해짐

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 34 | 검증기 플러그인 계약은 `compile`뿐 | `compileGuard(root, pointer)`와 `rejectedKey`가 더해진다. ajv6·7·8 플러그인이 동기 가드 경로를 구현한다 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:466`(정본), `09-landing-and-test-strategy.md:19`, `05-before-after.md:176`
- 닫은 사람: 편집자 결정(16라운드 정착 검토 조건 1, `09-landing-and-test-strategy.md:19`), 소유자 답(`reviews/round-16-owner-answers.md:16` 10)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:19`

### LANDING-038 이주 35 — `node.jsonSchema`는 켜진 조각을 병합한 유효 스키마

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 35 | `node.jsonSchema`는 마운트 때 고정된 값 | 켜진 조각을 병합한 유효 스키마. 활성 조각 집합마다 메모되어 같은 집합이면 같은 참조, 바뀌면 통지의 배달 집합에 든다(§4·§7·§9) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:467`(정본)
- 닫은 사람: 소유자 답(`reviews/round-9-spec.md:23` 축5), 편집자 결정(16라운드, `08-design-a-to-z.md:467`)
- 라운드: 16
- 까닭: `reviews/round-9-spec.md:23`

### LANDING-039 이주 36 — `FormHandle.reset`은 로드이며 같은 스키마면 트리를 남기고 다르면 호출 안에서 재생성

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 36 | `FormHandle.reset`은 `<Form>` 안의 `RootNodeContextProvider` 아래를 다시 마운트하고(`showError`·첨부 파일 맵 인스턴스·provider는 남고 맵의 내용은 비운다) 그때 새 `jsonSchema`·`defaultValue` prop을 반영 | 로드다(09 §2.6, 16라운드 스웜 수렴(편집자 결정)). 같은 스키마(같은 객체이거나, JSON 부분이 키 순서까지 깊게 같고 함수·컴포넌트 칸이 참조로 같음)면 루트의 로드 한 번이고 트리·캐시·노드 참조가 남는다. 다르면 reset 호출 안에서 트리와 캐시를 새로 만들고(비용은 `<Form key>`의 재생성과 같다) 돌아오기 전에 핸들을 새 트리로 바꾼다. 값은 호출 시점에 커밋된 prop이며, 같은 처리기에서 prop을 바꾼 reset은 그 커밋에서 한 번 더 반영한다(끝에서 새 prop이 반영된다. 그 경로에서는 `onChange`가 두 번이고, `startTransition` 안에서는 첫 로드의 옛 값이 한 번 그려진다). 입력은 자식 프록시를 그리지 않는 입력만 다시 마운트하고(오늘은 provider 아래 전부), 대체된 입력의 늦은 쓰기는 버린다. 어느 경로든 `showError`는 prop 값으로 돌아가고(오늘은 유지), `onStateChange`는 상태가 바뀐 때만 내며, 검증 결과는 비운 뒤 `OnChange` 비트가 켜져 있을 때만 한 번 검증한다(오늘은 모드와 무관하게 늘). `onChange`는 방출 값의 참조가 바뀐 때만 낸다(오늘은 늘 낸다). 스키마 객체를 제자리에서 고친 뒤의 reset은 그 변경을 반영하지 않는다(오늘은 reset마다 `clone`해 다시 읽는다). 노드 참조가 reset을 넘어 이어지는 것은 같은 스키마일 때뿐이다. `FormHandle.reset(option?)`은 억제 비트 둘만 받는다 |
- 보충:
  > 소유자(16라운드 답 2): ""기본적으로 값에 대한 리셋이긴 한데요, 기존 사용방식을 참고해서 로드로 충분한지 검토해보세요. 불필요한 캐시 리빌드를 원하진 않습니다만, 사용자가 key를 사용한 리셋보다 효율적이고 안전한 방법을 얻길 바라긴 합니다"" (`reviews/round-16-owner-answers.md:8`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:468`(정본), `09-landing-and-test-strategy.md:71`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:8` 2), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:71` §2.6)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:71`

### LANDING-040 이주 37 — 플러그인의 `options.*` 자유 키와 맨 표현 키는 `presentation.*`로

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 37 | 플러그인이 `options.*`에 자유 키를 둠(`protocols`·`lazy`·`minimum`·`maximum` 등)과 맨 키(`lazy`·`radioLabels`·`switchLabels`·`switchSize`·`ampm`·`minRows`·`maxRows`) | `presentation.*`로 옮긴다. `options`는 닫힌 목록(`terminal`·`virtual`·`propertyKeys`·`omitEmpty`·`omitTrailing`·`trim`)이라 남겨 두면 청사진 오류 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:469`(정본), `08-design-a-to-z.md:599`, `09-landing-and-test-strategy.md:24`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:15` 7)
- 라운드: 17
- 까닭: `reviews/round-15-decisions.md:12`

### LANDING-041 이주 38 — 로드 뒤 검증은 `OnChange` 비트일 때만 한 번

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 38 | 마운트 때 검증 모드와 무관하게 한 번 검증한다(`Form.tsx:139`) | 로드(마운트·reset) 뒤의 검증은 `ValidationMode`의 `OnChange` 비트가 켜져 있을 때만 한 번이다. `OnRequest`만 켠 폼은 마운트 때 검증하지 않는다(09 §2.6의 아홉째, 16라운드 스웜 수렴(편집자 결정)). 마운트의 검증 요청은 렌더 계층의 준비 시점(폼이 커밋된 뒤, 오늘 `handleReady`의 자리), reset은 진입 끝에서 내며 규칙은 "로드 뒤 `OnChange` 비트면 한 번"이다. core만 쓰는 호스트(C3)는 마운트 검증을 직접 요청한다(§11.2, 17라운드 스웜 수렴(편집자 결정)) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:470`(정본), `09-landing-and-test-strategy.md:71`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:71` §2.6의 아홉째), 17라운드 스웜 수렴(편집자 결정, core만 쓰는 호스트의 마운트 검증)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:71`

### LANDING-042 이주 39 — 호출자의 전체 교체 `setValue(V)`는 reset과 같은 입력 판정

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 39 | 호출자의 전체 교체 `setValue(V)`는 브랜치에도 Refresh를 내어 객체·배열 입력 아래 서브트리 전체를 다시 마운트한다 | reset과 같은 입력 판정이다. 자식 프록시를 그리지 않는 입력만 다시 마운트하고(값 전체를 스스로 그리는 사용자 브랜치 입력은 오늘처럼 다시 마운트된다), 대체된 입력의 늦은 쓰기는 버린다(09 §2.6의 열넷째, 16라운드 스웜 수렴(편집자 결정)) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:471`(정본), `09-landing-and-test-strategy.md:71`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:71` §2.6의 열넷째)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:71`

### LANDING-043 이주 40 — 공개 `node.group`은 `node.strategy`

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 40 | 공개 `node.group`(`'branch'` 또는 `'terminal'`) | `node.strategy`(값은 그대로, 17라운드 소유자 확정). 가드 `isBranchNode`·`isTerminalNode`는 이름을 유지한다. 소비자는 `FallbackComponents/FormGroupRenderer.tsx:18`, UI 플러그인 넷의 `FormGroup`, 스토리와 시나리오 시험이다 |
- 보충:
  > "이름 규칙을 오늘의 공개 이름에 적용할지. 공개 index가 내보내는 `Node`로 줄인 이름(형 `ArrayNode` 등 일곱, `NodeState`, `NodeEventType`, 가드 `is…Node`)을 `SchemaNode` 접두로 바꿀지와 08 §14의 이주 행" (`reviews/round-18-agenda.md:91`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:472`(정본), `08-design-a-to-z.md:577`, `09-landing-and-test-strategy.md:261`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:22`

### LANDING-044 이주 41 — Form 속성 `onError` 신설, 오류·경고 코드 목록이 공개 계약

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 41 | 오류를 받는 Form 속성이 없다. 오류는 throw·`console.error`·노드 오류로 흩어지고 경고는 개발 모드 콘솔뿐이다 | Form 속성 `onError` 신설. 검증 결과를 뺀 폼 내부의 오류와 경고를 같은 모양의 기록으로 받는 관찰자이며 흐름을 바꾸지 못한다(4번 안 B, §11.3, ADR 0014 §3). 오류·경고 코드 목록이 공개 계약이 된다 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:473`(정본), `08-design-a-to-z.md:577`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 17라운드 스웜 수렴(편집자 결정, 안 B)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:15`

### LANDING-045 이주 42 — `diagnostics`는 `'stable'`·`'degraded'`, 다음 로드까지 남고 그 동안 제출 거부

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 42 | 진단 신호가 없다(`INFINITE_LOOP_DETECTED`를 던질 뿐). 앞 판 설계의 `diagnostics.status`는 `'budgetExceeded'`, `exceededBudget`은 예산 다섯이었다 | `status`는 `'stable'` 또는 `'degraded'`, 원인 `cause`(예산, 식, 대상, 공유 충돌), `exceededBudget`은 정착 예산 셋, `commit`. 다음 로드까지 남고 그 동안 폼의 제출 경로가 거부한다(R17-1 나, §12) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:474`(정본), `02-target-overview.md:332`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드, `exceededBudget`을 정착 예산 셋으로)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:9`

### LANDING-046 이주 43 — 바운더리는 가두고 대체 화면을 그린 뒤 다시 던지지 않고 보고

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 43 | 필드 바운더리와 `Form`의 자기 바운더리는 렌더 오류를 가두어 대체 화면을 그리고 `console.error`만 한다 | 가두고 대체 화면을 그리는 것은 같다. 다시 던지지 않고 `componentDidCatch`에서 `onError`와 주인 없는 오류 싱크로 보고한다(§12). `@winglet/react-utils`의 바운더리 감싸개에 렌더 때 보고 함수를 얻는 선택 인자가 더해진다(소유자 허용, `minor`) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:475`(정본), `08-design-a-to-z.md:599`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 소유자 답(`reviews/round-17-owner-answers.md:34` (나))
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:15`

### LANDING-047 이주 44 — `trim`은 포커스 아웃 때 `finishInput` 칸이 자르고 입력 출처 쓰기로 다룸

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 44 | `options.trim: true`이면 `StringNode`가 내부 사건 `Blurred`를 구독해 흐림 때 원본을 잘린 값으로 덮는다(`StringNode.ts:118-122`) | 포커스 아웃 때 자르는 동작은 같다. 판단은 문자열 동작 행의 `finishInput` 칸이 하고 어댑터는 타입을 모르는 입력 마침 신호 `finishInput`만 보낸다. 자른 값은 사용자 입력과 같은 쓰기(입력 출처)이며 현재 값과 같으면 쓰지 않는다(17라운드 소유자 답 R17-3, §3.3). 이 쓰기가 바깥 오류를 지우고 dirty를 표시하는지는 18라운드 안건이다 |
- 보충:
  > "이 쓰기가 오늘 `handleChange`처럼 바깥 오류를 지우고 dirty를 표시하는지가 남았다(오늘의 `trim`은 둘 다 하지 않는다)" (`reviews/round-18-agenda.md:45`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:476`(정본), `08-design-a-to-z.md:577`, `09-landing-and-test-strategy.md:261`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:43` 9 입력 마침 칸)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:11`

### LANDING-048 이주 45 — `isTerminalNode`는 `node.strategy`로 판정하고 형 좁히기를 바로잡음

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 45 | `isTerminalNode`는 `node.group === 'terminal'`로 판정하면서 형을 잎 넷으로 좁힌다(`src/core/nodes/filter.ts:195-198`) | `node.strategy`로 판정하고, 형의 좁히기를 터미널 객체·배열까지 포함하도록 바로잡는다(공개 형 변경) |
- 보충:
  > "이름 규칙을 오늘의 공개 이름에 적용할지. 공개 index가 내보내는 `Node`로 줄인 이름(형 `ArrayNode` 등 일곱, `NodeState`, `NodeEventType`, 가드 `is…Node`)을 `SchemaNode` 접두로 바꿀지와 08 §14의 이주 행" (`reviews/round-18-agenda.md:91`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:477`(정본)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 17라운드 스웜 수렴(편집자 결정, 노드 구조)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:22`

### LANDING-049 이주 46 — 노드 메서드 `findAll`은 `findNodes`

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 46 | 노드 메서드 `findAll` | `findNodes`(`FormHandle`은 이미 `findNodes`다) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:478`(정본)
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, 노드 구조)
- 라운드: 17
- 까닭: `08-design-a-to-z.md:478`

### LANDING-050 이주 47 — 행이 없는 조합(잎 `terminal: false`, 가상 `terminal: true`, 인라인 입력)의 처리와 이주

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 47 | 잎의 `options.terminal: false`는 `'branch'`가 되어 `FormGroupRenderer`가 fieldset으로 그리고, 가상의 `options.terminal: true`와 인라인 `FormTypeInput`은 `'terminal'`이 되어 자식 구성 요소를 비운다 | `BEHAVIORS[type][strategy]`에 행이 없는 조합이다. 처리와 이주는 18라운드 안건이다 |
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md` §6, :78)
- 출처: `08-design-a-to-z.md:479`(정본), `reviews/round-18-agenda.md:78`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건 N14로 이관)
- 라운드: 17
- 까닭: `reviews/round-18-agenda.md:78`

### LANDING-051 배포는 한 번, 개발은 우산 브랜치 안의 PR 아홉으로 나눔

- 결정:
  > - **배포는 한 번, 개발은 나눈다.** 모든 패키지가 함께 메이저 버전급으로 올라가고(C7) 호환 계층을 두지 않으므로(00-goals 비목표), `master`로의 병합은 우산 브랜치(`refactor/schema-form-internal-architecture`) 하나가 한 번에 한다. 그 안에서는 PR 아홉으로 나누며, 각 PR은 새 코드와 그 테스트만으로 독립 검증된다.
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:551`(정본), `00-goals.md:128#4`
- 닫은 사람: 소유자 답(`00-goals.md:110` C7), 편집자 결정(14라운드, `08-design-a-to-z.md:551`)
- 라운드: 16
- 까닭: `08-design-a-to-z.md:551`
- 충돌:
  > `00-goals.md:128`의 "작업은 `feature/schema-form-redesign` 브랜치에 모이고, 이 브랜치가 여러 작업을 병합받는 우산 PR이 된다."는 정본과 다르다(브랜치 이름). 정본이 이긴다(`08-design-a-to-z.md:551`, 뒤 라운드가 앞 라운드를 이긴다).

### LANDING-052 전환 방식 — 옛 코드는 레거시로 옮기고 새로 쓰며 옛 이름과의 중복은 기준이 아님

- 결정:
  > **옛 코드는 레거시로 옮기고 새로 쓴다(17라운드 소유자 답).** PR마다 대상 영역의 옛 코드를 레거시 디렉토리로 옮기고 새 코드를 쓴다. 쓸 만한 코드와 함수는 가져오고 나머지는 버린다. 옛 이름과의 중복은 기준이 아니다(소유자: "그러니 이름 중복은 걱정하지 않아도 됩니다").
- 보충:
  > 소유자(17라운드 전환 방식): ""1. 전환은, 대상 영역 코드를 레거시 디렉토리로 옮기고, 작성을 하려고 합니다. 쓸만한 코드와 함수는 가져오고, 버릴건 버리면서요. 그러니 이름 중복은 걱정하지 않아도 됩니다."" (`reviews/round-17-owner-answers.md:52`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:552`(정본, 첫째–넷째 문장), `09-landing-and-test-strategy.md:42`, `reviews/round-18-agenda.md:96`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:52` 전환 방식)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:52`

### LANDING-053 새 엔진은 전환 PR 전까지 `<Form>`에 닿지 않고 점진 교체는 하지 않음

- 결정:
  > 새 엔진은 전환 PR 전까지 `<Form>`과 `nodeFromJSONSchema`에 닿지 않으며, 옛 코드와 새 코드는 상태 소유 방식이 달라 한 트리 안에서 공존할 수 없으므로(antigravity 검토와 같은 판단) 점진 교체는 하지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:552#5`(정본), `08-design-a-to-z.md:600-601`
- 닫은 사람: 편집자 결정(17라운드, `08-design-a-to-z.md:552` antigravity 검토와 같은 판단)
- 라운드: 17
- 까닭: `08-design-a-to-z.md:601`

### LANDING-054 레거시 디렉토리의 이름과 자리, 그 동안 기존 시험과 스토리북을 돌리는 방법

- 결정:
  > 레거시 디렉토리의 이름과 자리, 그 동안 기존 시험과 스토리북을 돌리는 방법은 18라운드 안건이다(§15).
- 보충:
  > "레거시 디렉토리의 이름과 자리(패키지 안의 어디에, 어떤 이름으로, 빌드와 공개 진입점에서 어떻게 빼는가)" (`reviews/round-18-agenda.md:100`)
  > "옮기는 동안 기존 시험과 스토리북을 돌리는 방법(옛 시험이 레거시 디렉토리를 따라가는가, 09 §4.3의 234파일 처분과 §5.4의 옛 스토리 처분과 어떻게 맞추는가)" (`reviews/round-18-agenda.md:101`)
- 상태: 열림(→ `reviews/round-18-agenda.md` §8, :100-101)
- 출처: `08-design-a-to-z.md:552#6`(정본), `09-landing-and-test-strategy.md:42`, `reviews/round-18-agenda.md:100-101`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건 §8로 이관)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:52`

### LANDING-055 문서가 코드보다 먼저 바뀜 — 각 PR은 새 fractal의 INTENT·DETAIL로 시작, 이름은 책임으로

- 결정:
  > **문서가 코드보다 먼저 바뀐다**(filid 규칙). 각 PR은 새 fractal의 `INTENT.md`·`DETAIL.md`로 시작한다. 이름은 책임을 말하는 것으로 짓는다.
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:553`(정본, 첫째–셋째 문장), `09-landing-and-test-strategy.md:40`
- 닫은 사람: 원리(filid 규칙, 저장소 `.claude/rules/filid_code-placement.md` §5), 소유자 답(`reviews/round-17-owner-answers.md:26` `tree`의 이름, 책임별로 나눔)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:26`

### LANDING-056 새 core의 자리와 이름 — `blueprint`·`record`·`behaviors`·`navigation`·`settle`·`dispatch`·`validation`·`SchemaNode`와 행의 칸

- 결정:
  > 새 core의 자리와 이름은 17라운드에 정했다(소유자 확정, 구조와 규칙은 09 §3).
  > - `src/core/blueprint/`(PR-1): 청사진.
  > - `src/core/record/`: 레코드. `SchemaNodeRecord` 형, 행 계약 `Behavior`, `SchemaNodeFactory` 형, `SchemaNodeRuntime` 형.
  > - `src/core/behaviors/`: 표 `BEHAVIORS`(`BEHAVIORS[type][strategy]`)와 종류 모듈 `stringBehavior/`·`numberBehavior/`·`booleanBehavior/`·`nullBehavior/`·`virtualBehavior/`. `objectBehavior/`와 `arrayBehavior/`는 안에 `branch/`·`terminal/`·`utils/`를 둔다.
  > - `src/core/navigation/`: `find`·`findNodes`와 트리 걷기.
  > - `src/core/settle/`(+`settle/derive/`), `src/core/dispatch/`, `src/core/validation/`.
  > - `src/core/SchemaNode/`: 공개 겉면, 클래스 `SchemaNode`.
  > - 행의 칸은 `interpret`(입력 해석), `assemble`(합성), `project`(투영), `finishInput`(입력 마침), `declareChildren`(자식 선언 목록만 돌려준다. 생성은 `settle`이 런타임의 `nodeFactory`로 한다. 행은 계산만 한다), `type`, `strategy`이고, 종류별 데이터 칸은 `structure`다. 노드 필드 `runtime`은 트리마다 하나인 `SchemaNodeRuntime`(통지 대기열, 검증기, 진단, 진입 깊이와 예산, `nodeFactory`, `onError` 보고기)을 가리키고, 모듈 수준 생성 함수는 `schemaNodeFactory`다.
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:553-560`(정본, 553은 넷째 문장), `09-landing-and-test-strategy.md:32-38`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:21` 종류별 동작 표의 이름), 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:26` `tree`의 이름), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸), 소유자 답(`reviews/round-17-owner-answers.md:42-46` 4·9·10·12·15·14), 소유자 답(`reviews/round-17-owner-answers.md:53` `Node` 이름 규칙)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:38`

### LANDING-057 겉면 규칙과 behaviors 규칙

- 결정:
  > - 겉면 규칙: 클래스는 필드·게터·문장 하나짜리 위임만 두며 분기·반복·종류 비교를 두지 않고 노드마다 할당하지 않는다. 멤버 목록은 시험으로 고정하고, 여러 단계의 조율은 `dispatch`의 동사별 진입이 맡는다. behaviors 규칙: 종류마다 fractal, 여덟 줄을 넘는 칸과 그 종류만의 보조는 그 종류의 `utils/`, 두 전략이 함께 쓰는 것은 그 종류의 `utils/`, 두 종류 이상이 쓰는 것은 `behaviors/utils/`에 두고, 행은 칸을 모두 같은 순서로 갖는다.
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:561`(정본)
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, 노드 구조 스웜 정련; `reviews/round-17-owner-answers.md:25` 반영 칸)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:25`

### LANDING-058 원샷이어야 하는 것은 전환 PR(PR-7)과 `master` 병합 둘뿐

- 결정:
  > **원샷이어야 하는 것은 둘뿐이다.** 전환 PR(PR-7)과 `master` 병합(릴리스). 나머지는 독립이다. 전체를 원샷으로 진행할 필요는 없다.
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:562`(정본, 첫째–넷째 문장), `08-design-a-to-z.md:593`
- 닫은 사람: 편집자 결정(14라운드, `08-design-a-to-z.md:562`)
- 라운드: 14
- 까닭: `08-design-a-to-z.md:601`

### LANDING-059 릴리스는 `master` 병합 뒤의 배포이며 판 올림 PR 병합이 시험 관문을 거쳐 자동 배포

- 결정:
  > 릴리스는 `master` 병합 뒤의 배포이며, 판 올림 PR을 병합하면 배포 작업 흐름이 시험 관문을 거쳐 자동으로 배포한다(09 §6.2의 일곱째, 16라운드 스웜 수렴(편집자 결정)).
- 보충:
  > 소유자(16라운드 답 9): ""정해지지 않았습니다. changeSet 을 사용한 표준 방법으로 바꾸고자 합니다. 릴리즈 테스트도 다시 작성해야 합니다. 지금 구조는 github actions를 보세요"" (`reviews/round-16-owner-answers.md:15`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:562#5`(정본), `08-design-a-to-z.md:593`, `09-landing-and-test-strategy.md:225`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2의 일곱째)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:225`

### LANDING-060 PR-0 문서 — 이 문서·기록·HANDOFF·프로토타입 v7·시나리오 패키지 뼈대

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-0 문서 | 이 문서, 14라운드 기록, ADR 최종 상태, HANDOFF. 프로토타입 v7(게이트 입력의 `extras` 정적 규칙, 같은 순위 동점·정착 단위 순위, 나감 에지, 전이 라운드 상한, 재계산 목록만 순회). 시나리오 패키지 `@aileron/schema-form-scenarios`의 뼈대, vitest `test.projects` 셋, addon-vitest(09 §7) | 없음 | 소유자의 O-1 – O-11 답, 이 문서의 절 단위 통과, 18라운드 정련(`reviews/round-18-agenda.md`) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:570`(정본), `09-landing-and-test-strategy.md:256`
- 닫은 사람: 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:570`), 소유자 답(`reviews/round-16-owner-answers.md:14` 8 시나리오 모듈은 비공개 패키지), 편집자 결정(17라운드, 18라운드 정련을 착수 조건에 더함)
- 라운드: 17
- 까닭: `08-design-a-to-z.md:570`

### LANDING-061 PR-1 청사진 — 조각 표·노드 공유·병합 함수·잎 교차 함수 이동·식 컴파일러 이동·청사진 오류의 데이터화

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-1 청사진 | 순수 함수 `blueprint`: 조각 표와 전순서, 노드 공유, `controls.discriminator` 변환(끌어올림 포함), 유효 스키마 병합 함수(§9 병합표는 새로 쓴다. 렌더 계층이 넘긴 판정으로 정하는 원자(React 요소, ref 모양)와 한쪽 값의 참조 이동은 `@winglet/common-utils` `merge`의 선택 인자(배열 교체, 원자 판정, 참조 이동. 양쪽에 있는 객체는 새 객체에 병합한다: 쓰기 시 복사. 인자가 없으면 오늘 동작, changeset `minor`)로 쓴다(17라운드 스웜 수렴(편집자 결정)). 오늘의 교차 연산은 먼저 승·얕은 덮어쓰기·무조건 throw라 §9와 다르므로 잎 교차 함수 `intersectEnum`·`intersectConst`·`intersectMinimum`·`intersectMaximum`·`intersectMultipleOf`·`intersectPattern`·`validateRange`를 청사진 밖의 새 fractal로 옮겨(청사진 안에 두면 그것을 가져가는 옛 `helpers/jsonSchema`와 서로 가져오는 고리가 될 수 있다. 이름은 PR-1이 정한다) 이름으로 내보내되, `intersectEnum`·`intersectConst`·`validateRange`는 공집합·충돌에서 던지지 않고 공집합 표시를 돌려주도록 바꾼다. throw는 청사진이 정적 연언을 교차할 때만 한다(§9). 옛 `intersect*Schema`는 공집합 표시를 받으면 오늘처럼 `JSONSchemaError`를 던지도록 import와 함께 고쳐 옛 동작을 PR-7까지 지킨다(레거시로 옮긴 옛 코드가 PR-7까지 도는 방법은 18라운드 안건 '전환 방식의 세부'이며 이 문장은 그 안건의 한 안이다, §15)), 검증기 앞 제거 규칙 하나, `controls`의 식 컴파일(오늘의 컴파일러 `createDynamicFunction`과 그 `utils`, `JSON_POINTER_PATH_REGEX`, `getPathManager`, `DynamicFunction` 형은 `AbstractNode` 조직 안에 있으므로 PR-1에서 청사진으로 통째로 옮긴다. 새 엔진에서 식을 컴파일하는 곳은 청사진 하나뿐이고(filid 배치 규칙 §1), `helpers/dynamicExpression/`의 `INTENT.md`는 표현식 직접 실행(`eval`, `new Function`)을 금한다. PR-7까지는 옛 엔진도 쓰므로 청사진 진입점이 이름으로 내보내고 그 유지 이유를 청사진의 `DETAIL.md`에 적는다. 옛 소비자는 import만 고친다. 16라운드 편집자 결정, 답 10으로 확정)과 역의존 표, 청사진 오류·경고(선언 사이 `options.terminal`·렌더 계층 판정·`controls.discriminator` 불일치, `controls`·`options`의 모르는 키. 터미널 전략은 `options.terminal` → 렌더 계층이 인자로 넘긴 판정 함수 → `type`의 순서로 정하며 청사진은 `presentation`을 읽지 않는다, 17라운드 스웜 수렴(편집자 결정)), `controls.watch` 의존의 합집합, `options`의 닫힌 목록(`trim` 포함), 정적 `controls.injectTo` 대상 없음의 청사진 오류(R17-1 나), 청사진 오류·경고의 데이터화(수집기 인자로 코드·`schemaPath`·세부·판별 칸을 모으며 소비자가 없으면 모으지 않는다. 캐시 청사진의 늦은 경고 수집은 작성 루트마다 한 번, 17라운드 스웜 수렴(편집자 결정)). 테이블 테스트 | 없음 | 18라운드 안건 A(`$ref` 재귀, 다중 `type`, `dependentSchemas`·`patternProperties` 등)와 B(식 언어 명세), 전환 방식의 세부(레거시 디렉토리의 이름과 자리), 노드 구조 N14(행이 없는 조합, 청사진의 전략 결정)(§15) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:571`(정본), `09-landing-and-test-strategy.md:20,32,257`, `adr/0014-error-policy.md:178-184`
- 닫은 사람: 편집자 결정(16라운드, 답 10으로 확정 `reviews/round-16-owner-answers.md:16`), 소유자 답(`reviews/round-14-owner-answers.md:17` O-11 `merge` 선택 인자), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 17라운드 스웜 수렴(편집자 결정, 터미널 전략·병합의 원자·데이터화)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:20`

### LANDING-062 PR-2 노드 트리와 정착 — 단일 클래스 `SchemaNode`와 동작 행, 정착 루프, 예산 다섯과 원본 B, `diagnostics`

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-2 노드 트리와 정착 | 노드: 상속 없는 단일 클래스 `SchemaNode`(`src/core/SchemaNode/`)와 `BEHAVIORS[type][strategy]`의 동작 행(잎 넷·객체·터미널 객체·가상. 터미널 배열은 PR-5), `src/core/record/`·`src/core/behaviors/`·`src/core/navigation/`, 공개 `type`·`strategy` 게터와 `active` 게터(노드 게이트), 겉면 규칙의 기계 검사(파일 한정 린트, 멤버 목록 시험, 행 칸 순서 시험). `raw`·`extras`, 표시·계산(호스트 바퀴, 노드 게이트, 투영)·전이(채움, 나감 비움 네 층과 하위 트리·잠복 자손으로 내려가는 정책, R17-2 ㄴ)·커밋, 예산 다섯과 원본 B(되돌림 기록. 기록 항목은 노드, 이전 `raw`, 이전 `extras`, 배열 아이템 구조의 생성·폐기이며 중간 라운드 채움의 철회보다 먼저 적용한다), `diagnostics`(`'stable'` 또는 `'degraded'`, `cause`, `commit`, R17-1 나), `SetValueOption`, 게이트는 술어 인터페이스 뒤의 스텁. 정착 루프 테스트(프로토타입 회귀 이식) | PR-1 | 18라운드 안건 B·C·D(`controls.active` 식의 다른 호스트 읽기 순서, 비객체 V의 `Merge`, 되먹임 거부 표면, 프로토타입 v7)와 노드 구조(N2, N5, N6, N14, 공개 표면의 크기, `ContextNode`의 자리)(§15) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:572`(정본), `09-landing-and-test-strategy.md:23,33,258`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 편집자 결정(16라운드 정착 검토 조건 5, `09-landing-and-test-strategy.md:23`)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:23`

### LANDING-063 PR-3 파생 — `controls.derived`·`injectTo`·`unsetValue`, 같은 대상 규칙, 에지 소비

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-3 파생 | `controls.derived`·`controls.injectTo`·`controls.unsetValue`, 같은 대상 규칙(종류 순위, 문서 순서, 층, 전순서, 정착 단위), 에지 소비, `DisableAutomaticWrites`, `controls.resetInteraction`, 개발 모드 정착 기록 | PR-2 | 에지의 값 동등 판정, `controls.derived` 의존 집합, 조각 `controls` 식의 나감 발화 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:573`(정본), `09-landing-and-test-strategy.md:34`
- 닫은 사람: 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:573`), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기)
- 라운드: 15
- 까닭: `08-design-a-to-z.md:573`

### LANDING-064 PR-4 통지와 검증 — 디스패처·`batch`·진입 사슬·`onError`의 core 쪽·`compileGuard`·배달 경로

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-4 통지와 검증 | 루트 디스패처, `batch`, 진입당 `onChange` 1회, 진입 사슬과 사슬 끝의 throw, `onError` 로깅 채널의 core 쪽(기록 형 `FormErrorRecord`와 코드 형 `FormErrorCode`(가칭), core가 인자로 받는 보고기(`report`, `hasConsumer`), 사슬 끝 기록마다 전달, 핸들러 예외의 묶음 규칙, 전달 중 쓰기 거부, 경고의 구조 키 중복 억제, 정착 경고 판정의 소비자 조건, `ValidateFunction` 문서 주석 "판정은 돌려주고 던지지 않는다". `ValidationIssue` 개명이 `onError`의 공개보다 먼저 선다, 17라운드 스웜 수렴(편집자 결정)), 진입 사슬의 소유는 `dispatch`(쓰기 동사마다 진입 함수)이며 겉면의 쓰기 위임을 `dispatch` 진입으로 옮김, `SchemaFormError`의 집계 오류(`details.errors`), 주인 없는 오류 싱크, 검증 실행 실패와 검증 불가의 드러남, 가드의 늦은 컴파일(프로덕션)과 개발 모드 일괄 컴파일(어느 환경이든 실패는 그 게이트의 가드 실패)(ADR 0014, 17라운드 스웜 수렴(편집자 결정)), `UpdateDiagnostics`, 커밋 번호 스탬프 검증과 실행 합치기, 검증기 계약(`compileGuard`, `rejectedKey`)의 플러그인·`validatorFactory` 통일과 ajv6·7·8 플러그인 구현, 에러 라우팅, 오류 클래스(`ValidationIssue`), 훅 수준의 React 바인딩 시험(동기 통지와 `useSyncExternalStore`, StrictMode 이중 호출, 구독 뒤 따라잡기), 같은 `$id` 루트의 중복 등록 처리, 상태·오류·명령 사건과 검증 결과의 배달 경로(09 §2.4, 16라운드 답 3), 검증기 등록의 참조 세기와 최근 해제 목록, 재생성 reset의 같은 `$id`(09 §2.6의 여덟째, 16라운드 스웜 수렴(편집자 결정)) | PR-2 (PR-3과 병렬) | `compileGuard` 계약 세부, 에러 라우팅, 유효 스키마 변경 이벤트, core가 `ValidationManager` → `app/plugin`의 `PluginManager`를 거쳐 React 구성 요소 모듈을 가져오는 import의 분리(검증기 주입 경로, §15) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:574`(정본), `09-landing-and-test-strategy.md:19,22,35,259`, `adr/0014-error-policy.md:178-184`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:9` 3 배달 경로), 소유자 답(`reviews/round-16-owner-answers.md:16` 10 가드 캐시와 등록의 소유), 16라운드 스웜 수렴(편집자 결정, 재생성 reset의 같은 `$id`), 17라운드 스웜 수렴(편집자 결정, `onError` core 쪽과 가드 컴파일)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:19`

### LANDING-065 PR-5 배열 — 배열·터미널 배열 행, 아이템 호스트, 통째 교체의 identity

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-5 배열 | 배열·터미널 배열 행(`arrayBehavior/`의 `branch/`·`terminal/`), 겉면 배열 멤버, 배열 노드와 아이템 호스트, `items`·`prefixItems`, `push`·`remove`·`update`, 통째 교체의 identity, 아이템 채움 | PR-2 (PR-3·4와 병렬) | 배열 아이템의 생김과 채움, `contains` |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:575`(정본), `09-landing-and-test-strategy.md:36,260`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:575`)
- 라운드: 17
- 까닭: `08-design-a-to-z.md:575`

### LANDING-066 PR-6 상태 키와 제어 — 결합(OR/AND)·`controls.children`·조각 `controls`·`unsetOnInactive`의 정책

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-6 상태 키와 제어 | `controls.visible`·`controls.readOnly`·`controls.disabled`·표준 `readOnly`의 결합(OR/AND), `controls.children`, 조각 `controls`, `unsetOnInactive`의 층·식의 값(직전 커밋)·하위 트리로 내려가는 정책(R17-2 ㄴ), 겉면의 계산 게터(`visible`·`enabled`·`readOnly`·`disabled`) | PR-3 | `controls.children` 세부. 조각에 따라 터미널 전략이 바뀌는 경로는 17라운드 스웜 수렴(편집자 결정)으로 닫혔다(선언 사이 정적, §9) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:576`(정본), `09-landing-and-test-strategy.md:37`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 17라운드 스웜 수렴(편집자 결정, 터미널 전략은 선언 사이 정적)
- 라운드: 17
- 까닭: `08-design-a-to-z.md:576`

### LANDING-067 PR-7 전환 — `nodeFromJSONSchema` 재구축, React 바인딩 연결, Form 속성, 바운더리, 옛 코드 삭제, UI 플러그인 이주

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-7 전환 | `nodeFromJSONSchema`를 새 엔진 위에 다시 짓고, React 바인딩(`providers`·`hooks`·`components`)을 새 값 채널(`value`·`outputValue`)과 통지에 연결, Form 속성(`readOnly`·`disabled` 전체 잠금, `unsetOnInactive`, `disableAutomaticWrites`, `onError`, `onDiagnosticsChange`, `validatorFactory`, 렌더러 넷 `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`), 청사진 오류의 생성 자리 포착과 대체 화면, 마운트 정착 오류의 원인별 처리(§11.3), 루트·필드 바운더리의 가두고 보고하기(17라운드 스웜 수렴(편집자 결정), 09 §2.3의 넷째), `degraded` 동안의 제출 거부(네이티브 submit은 `onError`와 싱크로)와 검증 불가의 거부(R17-1 나), 터미널 전략과 병합의 원자(렌더 계층의 터미널 판정 함수와 원자 판정 함수를 청사진에 넘김, §9·§12), 명령, 레거시로 옮긴 옛 `core/nodes`·`parsers`·매니저·전처리 삭제, `core/index.ts`의 수출을 `src/core/SchemaNode/` 진입점으로, `node.group` → `node.strategy`의 소비자 이주(§14의 40행), 렌더 시나리오 438건의 처분(09 §4.3. 17파일은 단언을 이름만 바꿔 살린다, 16라운드 답 7), UI 플러그인 넷의 타입과 등록 키 대응, UI 플러그인 27파일의 `presentation.*` 이주, `SchemaNodeInput`의 흐림 처리에서 `Blurred` 발행을 입력 마침 신호 `finishInput`으로 바꿈(`options.trim`은 문자열 행의 `finishInput` 칸이 판단, R17-3), `ChildNodeComponentProps`·`FormGroupProps`의 prop `FormTypeRenderer` → `FormTypeGroupRenderer`, `SchemaNodeInput.handleChange`의 세 진입(값 쓰기·외부 오류 지움·dirty)을 `batch` 하나로 묶기, 입력 출처 표식(Refresh 판정과 폐기된 노드의 늦은 입력 쓰기 판별용 내부 통로), 마운트 로드 정착 동안 `onChange`·`onDiagnosticsChange`는 버리고 `onError`는 커밋 뒤 한 번 전달하는 계약과 마운트 로드의 검증 요청을 준비 시점에 내는 것(17라운드 스웜 수렴(편집자 결정), 09 §2.3의 첫째), `onError`의 렌더 계층(바깥 감싸개와 인스턴스 보고기 문맥, 로드 기록의 준비 이펙트 전달과 대체 화면 이펙트 전달, 바운더리의 렌더 때 보고기 읽기와 `componentStack`, 네이티브 submit 경로의 오류 층 거부를 `onError`와 싱크로), `@winglet/react-utils` ErrorBoundary와 감싸개 둘의 렌더 때 보고 함수를 얻는 선택 인자(소유자 허용. 그 모듈의 `DETAIL.md`를 먼저 갱신한다, 17라운드 스웜 수렴(편집자 결정)), React 18 실행 시험(16라운드 답 5), `useFormTypeInput`의 메모 의존에 유효 스키마 참조 추가와 `SchemaNodeProxy`의 유효 스키마 변경 비트 구독, 배달 경로의 렌더 계층 구독(09 §2.4), `Form`의 스키마 `clone`(`preprocessSchema(clone(inputJSONSchema))`) 제거(작성 루트 객체를 가드 캐시의 키로 지킨다. `defaultValue`의 `clone`은 이 항목이 아니다), `reset`의 로드 전환(같은 스키마 판정, 커밋 재대조, 호출 안의 재생성, 입력 판정과 노드가 드는 Refresh 번호, 상호작용 초기화 번호), 로드의 검증 규칙(마운트 포함, §14의 38행), `setValue(V)`의 같은 입력 판정(§14의 39행)(09 §2.6, 16라운드 스웜 수렴(편집자 결정)), `@winglet/react-utils`의 changeset(`minor`), 벤치 비교 | PR-1 – PR-6 전부 | 성능 예산 수치(18라운드 안건 E, 소유자 정책), 브라우저 IME 확인, 노드 `resetSubtree`의 존치와 입력 판정의 구현 확인(§15), `trim` 쓰기의 부수 효과(18라운드 안건), `@winglet/react-utils` 선택 인자의 모양, 네이티브 submit 경로의 검증 실패(`ValidationError`) 처리(오늘은 미처리 거부, `Form.tsx:127-133`, `getTrackableHandler.ts:429-431`) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:577`(정본), `09-landing-and-test-strategy.md:21,24,26,38,261`, `adr/0014-error-policy.md:178-184`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 소유자 답(`reviews/round-17-owner-answers.md:34` (나)), 소유자 답(`reviews/round-16-owner-answers.md:11,13` 5·7), 16라운드 스웜 수렴(편집자 결정, reset·로드·`setValue(V)`), 17라운드 스웜 수렴(편집자 결정, 바운더리·마운트 계약)
- 라운드: 17
- 까닭: `08-design-a-to-z.md:600-601`

### LANDING-068 PR-8 릴리스 — README·docs, ADR 0010 최종, 이주 안내와 프롬프트, changeset과 `CHANGELOG.md`, 릴리스 테스트

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-8 릴리스 | README·docs 재작성, ADR 0010 최종, 이주 안내와 이주 프롬프트(`docs/agents`), changeset(파괴적 변경, `fixed` 무리 전체 `major`. 1.0.0-beta 프리릴리스 뒤 1.0.0, 09 §6.2의 열넷째)과 `CHANGELOG.md`, 포장된 산출물의 릴리스 테스트(09 §6.2, 16라운드 스웜 수렴(편집자 결정)), README·docs의 reset 규칙(09 §2.6의 열여섯째), README·docs의 `onError` 코드 표(코드, level, 부류, 언제, 누구 잘못, 기본 드러남)와 판 규칙 | PR-7 | 릴리스 전환 PR(09 §6.2, 저장소 전체)의 병합 |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:578`(정본), `09-landing-and-test-strategy.md:262`
- 닫은 사람: 소유자 답(`00-goals.md:111` C8), 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 소유자 답(`reviews/round-16-owner-answers.md:22` PR-8의 판 번호), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:225`

### LANDING-069 교체 규모 — 교체 대상, 그대로 쓰는 것, 옮기는 것, 테스트 234파일의 처분

- 결정:
  > - **교체 규모.** `src/core` 178파일 9,884줄 가운데 `AbstractNode`(71파일 3,991줄, 계산 속성·검증 매니저·이벤트 캐스케이드)와 `ObjectNode`의 `BranchStrategy`(39파일 2,185줄), `ArrayNode` 전략(15파일 930줄), 오늘의 `schemaNodeFactory`(노드마다 넘기는 공장)가 교체 대상이다. 새 모듈 수준 생성 함수도 이름이 `schemaNodeFactory`이며 공장은 트리마다 하나다(옛 이름과의 중복은 기준이 아니다, §17.1). `helpers` 134파일 6,087줄 가운데 `jsonPointer`와 가상화는 그대로 쓰고, 교차 연산은 잎 함수만 옮겨 쓰며(§17.2의 PR-1 행), 식 컴파일러는 청사진으로 통째로 옮긴다(§17.2의 PR-1 행). 테스트 234파일의 처분은 09 §4.3을 따른다(17파일은 단언을 살린다, 16라운드 답 7)(`renderForm` 하니스는 재사용).
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:598`(정본), `09-landing-and-test-strategy.md:20`
- 닫은 사람: 편집자 결정(16라운드 정착 검토 조건 2, `09-landing-and-test-strategy.md:20`), 소유자 답(`reviews/round-17-owner-answers.md:45` 12·15 생성 함수), 소유자 답(`reviews/round-16-owner-answers.md:13` 7)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:20`

### LANDING-070 형제 패키지 — ajv 셋의 동기 `compileGuard`, UI 플러그인 27파일의 `presentation.*` 이주, `@winglet/react-utils` 선택 인자

- 결정:
  > - **형제 패키지.** ajv 플러그인 셋은 `ValidatorPlugin`·`ValidateFunction`·`JSONSchema`·`JSONSchemaError`·`SchemaFormPlugin` 타입을 가져오며(`JSONSchemaError`는 §14의 21행에 따라 `ValidationIssue`로 바뀐다) 모두 `$async: true`로 컴파일하므로, PR-4에서 동기 `compileGuard(root, pointer)` 경로를 세 플러그인에 구현해야 한다(캐시는 코어가 든다)(타입만 맞추면 되는 것이 아니다. 16라운드 정착 검토). UI 플러그인 넷은 `FormTypeRendererProps`뿐 아니라 `FormTypeInputDefinition`(11–19회)·`FormTypeInputPropsWithSchema`(8–15회)·스키마 타입을 가져오고, 27파일이 `jsonSchema.options.*`와 맨 키(`formType`·`radioLabels`·`switchLabels`·`switchSize`·`lazy`·`ampm`·`minRows`·`maxRows`)를 읽으며(mui 7/19, antd5 9/22, antd6 9/22, antd-mobile 2/14), 노드 표면 `push`·`remove`·`maxItems`·`length`도 쓴다. 그래서 PR-7의 UI 플러그인 이주는 타입과 등록 키 넷에 더해 스키마 읽기 27파일을 `presentation.*`로 옮기는 작업을 포함한다(§14의 31·32·37행). `@winglet/react-utils`의 ErrorBoundary와 감싸개 둘에는 렌더 때 보고 함수를 얻는 선택 인자를 더한다(주지 않으면 오늘 동작, 소유자 허용, 17라운드 스웜 수렴(편집자 결정), 09 §2.3의 넷째).
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:599`(정본), `09-landing-and-test-strategy.md:19,24`
- 닫은 사람: 편집자 결정(16라운드 정착 검토 조건 1·6, `09-landing-and-test-strategy.md:19,24`), 소유자 답(`reviews/round-17-owner-answers.md:34` (나)), 17라운드 스웜 수렴(편집자 결정)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:24`

### LANDING-071 위험이 모이는 곳은 PR-7 — 완화는 엔진 수준 통합 시나리오와 차등 테스트

- 결정:
  > - **위험이 모이는 곳은 PR-7이다.** PR-1 – PR-6은 `<Form>`에 닿지 않으므로 사용자 관점의 동작은 PR-7에서 처음 검증된다. 완화: PR-2부터 엔진 수준의 통합 시나리오(02 §9의 상황 목록)를 각 PR에 넣고, PR-4 뒤에 차등 테스트(독립 검증기와의 판정 동치)를 돌린다.
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:600`(정본)
- 닫은 사람: 편집자 결정(14라운드, `08-design-a-to-z.md:600`)
- 라운드: 14
- 까닭: `08-design-a-to-z.md:600`

### LANDING-072 PR-7을 더 쪼갤 수 없는 이유

- 결정:
  > - **PR-7을 더 쪼갤 수 없는 이유.** 옛 엔진과 새 엔진은 값의 소유(다중 사본 대 `raw` 하나), 통지(마이크로태스크 배치 대 동기 1회), 분기(자동 감지 대 게이트)가 다르다. `<Form>`이 둘을 동시에 섬길 수 없고, 렌더 시나리오의 기대값도 한 계약에만 맞는다.
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:601`(정본), `08-design-a-to-z.md:552`
- 닫은 사람: 편집자 결정(14라운드, `08-design-a-to-z.md:601`)
- 라운드: 14
- 까닭: `08-design-a-to-z.md:601`

### LANDING-073 정착 조건 1 — 가드 계약 `compileGuard(root, pointer)`, ajv 셋의 동기 경로, 코어의 작성 루트 기준 캐시

- 결정:
  > | 조건 | 처분 |
  > | --- | --- |
  > | 1 가드 계약을 (루트, 위치)로 고치고 ajv 셋에 동기 가드 경로를 두며 작성 루트 기준 캐시를 둔다 | **08·ADR 0004에 반영.** 떼어 낸 `if`는 `$ref` 때문에 단독 컴파일이 실패하고(ajv 8 실행 확인), 세 플러그인이 모두 `$async: true`이며, 같은 `$id` 루트의 재컴파일은 throw한다. `compileGuard(root, pointer)`. 캐시는 코어가 검증기 인스턴스마다 WeakMap<작성 루트 객체, { 사본, 가드 표 }>로 든다. 플러그인의 `compileGuard`는 가드 캐시를 들지 않는다. 사본 루트의 등록(루트마다 한 번의 `addSchema`와 고유 키 배정)은 플러그인의 검증기 인스턴스가 든다(ajv는 같은 키의 재등록에 실패한다, 16라운드 실행 확인). `Form`의 스키마 `clone`은 없앤다. 가드 캐시와 등록의 소유는 편집자 결정이며 16라운드 답 10으로 확정했다 |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:19`(정본), `08-design-a-to-z.md:466,574,599`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-16-owner-answers.md:16` 10)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:19`

### LANDING-074 정착 조건 2 — 재사용 두 문장을 사실대로: 잎 교차 함수만 재사용, 식 컴파일러는 청사진으로 통째 이동

- 결정:
  > | 조건 | 처분 |
  > | --- | --- |
  > | 2 "재사용" 두 문장을 사실대로 | **08 §17에 반영.** 교차 연산은 잎 함수만 재사용하고 병합표는 새로 쓴다(오늘은 먼저 승·얕은 덮어쓰기·무조건 throw). 식 컴파일러는 `AbstractNode` 조직 안에 있으므로 PR-1에서 청사진(`src/core/blueprint/`)으로 통째로 옮긴다. 새 엔진에서 식을 컴파일하는 곳은 청사진 하나뿐이고, `helpers/dynamicExpression/`의 `INTENT.md`는 표현식 직접 실행을 금하기 때문이다(편집자 결정, 16라운드 답 10으로 확정). 잎 함수 `intersectEnum`·`intersectConst`·`validateRange`는 공집합·충돌에서 던지지 않고 공집합 표시를 돌려주도록 바꾼다. 옛 `intersect*Schema`는 공집합 표시를 받으면 오늘처럼 던지도록 고쳐 옛 동작을 PR-7까지 지킨다(방법은 18라운드 안건 '전환 방식의 세부') |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:20`(정본), `08-design-a-to-z.md:571,598`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-16-owner-answers.md:16` 10)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:20`

### LANDING-075 정착 조건 3 — 바인딩 계약 넷(다섯째는 편집자가 더함)

- 결정:
  > | 조건 | 처분 |
  > | --- | --- |
  > | 3 바인딩 계약 넷 | **§2.3에서 정함(첫째·넷째는 17라운드 스웜 수렴(편집자 결정)으로 닫힘: 마운트 동안 `onError`는 커밋 뒤로 미루고 바운더리는 다시 던지지 않고 가두고 보고한다. 다섯째 '유효 스키마를 따라간다'는 편집자가 더함).** 08 §17 PR-7에 반영 |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:21`(정본), `09-landing-and-test-strategy.md:44`, `08-design-a-to-z.md:577`
- 닫은 사람: 17라운드 스웜 수렴(편집자 결정, 첫째·넷째), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4, 다시 던지지 않음), 편집자 결정(16라운드, 다섯째)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:44`

### LANDING-076 정착 조건 4 — 상태·오류·명령 사건과 검증 결과의 배달 경로

- 결정:
  > | 조건 | 처분 |
  > | --- | --- |
  > | 4 상태·오류·명령 사건과 검증 결과의 배달 경로 | **§2.4에서 정함(16라운드 답 3으로 확정).** |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:22`(정본), `09-landing-and-test-strategy.md:56`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:9` 3)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:56`

### LANDING-077 정착 조건 5 — 되돌림 기록에 `extras`와 배열 구조

- 결정:
  > | 조건 | 처분 |
  > | --- | --- |
  > | 5 되돌림 기록에 `extras`와 배열 구조 | **08 §17 PR-2에 반영** |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:23`(정본), `08-design-a-to-z.md:572`, `09-landing-and-test-strategy.md:258`
- 닫은 사람: 편집자 결정(16라운드 정착 검토)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:23`

### LANDING-078 정착 조건 6 — UI 플러그인 규모와 `options` 닫힌 목록의 충돌은 PR-7의 `presentation.*` 이주로

- 결정:
  > | 조건 | 처분 |
  > | --- | --- |
  > | 6 UI 플러그인 규모와 `options` 닫힌 목록의 충돌 | **08 §17.3·§14에 반영.** 27파일이 `options.*`·맨 키를 읽으므로 PR-7이 `presentation.*`로 옮긴다 |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:24`(정본), `08-design-a-to-z.md:469,599`
- 닫은 사람: 편집자 결정(16라운드 정착 검토)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:24`

### LANDING-079 정착 조건 7 — 공개 노드 타입·가드는 단일 클래스 겉면과 판별 인터페이스로

- 결정:
  > | 조건 | 처분 |
  > | --- | --- |
  > | 7 공개 노드 타입·가드는 단일 클래스 겉면과 판별 인터페이스로 | **§3에서 정함(17라운드 소유자 확정과 노드 구조 수렴, 이름도 확정). 설계 빈틈 넷과 공개 표면의 크기는 18라운드 안건** |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:25`(정본), `09-landing-and-test-strategy.md:100`, `reviews/round-18-agenda.md:70-91`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 17라운드 스웜 수렴(편집자 결정, 노드 구조 수렴)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:100`

### LANDING-080 정착 조건 8 — 훅·바인딩 시험과 React 18 실행

- 결정:
  > | 조건 | 처분 |
  > | --- | --- |
  > | 8 훅·바인딩 시험과 React 18 실행 | **§4.4에 넣음.** 08 §17 PR-4·PR-7에 반영(React 18 실행은 16라운드 답 5로 확정) |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:26`(정본), `08-design-a-to-z.md:574,577`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:11` 5), 편집자 결정(16라운드 정착 검토)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:164`

### LANDING-081 정착 지도 PR-1 — 부딪히는 코드, 그대로 쓰는 것, 새 fractal `src/core/blueprint/`

- 결정:
  > | PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
  > | --- | --- | --- | --- |
  > | PR-1 청사진 | `preprocessSchema`(`oneOf` 자동 감지·`virtual` `required` 재작성), `processAllOfSchema`(정적 평탄화, `if/then/else` 무시), `schemaNodeFactory`의 스키마 변이, `BranchStrategy/utils`의 조건 사전 | `stripSchemaExtensions`의 스캐너 틀(키 목록만 그룹 셋으로), 잎 교차 함수, `jsonPointer`, 옮긴 식 컴파일러 | `src/core/blueprint/`(옮긴 식 컴파일러 포함) |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:32`(정본), `08-design-a-to-z.md:571`
- 닫은 사람: 편집자 결정(16라운드 정착 검토)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:20`

### LANDING-082 정착 지도 PR-2 — 부딪히는 코드, 그대로 쓰는 것과 옮길 자리, 새 fractal 다섯

- 결정:
  > | PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
  > | --- | --- | --- | --- |
  > | PR-2 트리·정착 | `AbstractNode`의 `onChange` 전파·`__scoped__`·`__reset__`·루트 매크로태스크 디바운스, `ObjectNode` 전략 선택, `getNodeGroup`의 `isReactComponent`(원리 다섯째 'core는 렌더러를 모른다' 위반), `core/parsers/*`(ADR 0013 충돌), `BranchStrategy.ts` | `getResolveSchema`($ref 깊이 1 지연), `extractSchemaInfo`, `omitEmptyObject`(`behaviors/objectBehavior/utils/`로), `findNode`·`traversal`(`navigation/`으로 옮기며 고친다. 기대는 멤버의 존폐는 18라운드 안건 N2), `shallowPatch`(`record/`로) | `src/core/record/`, `src/core/behaviors/`(잎 넷, `objectBehavior/`의 `branch/`·`terminal/`, `virtualBehavior/`. 터미널 배열은 PR-5), `src/core/navigation/`, `src/core/SchemaNode/`, `src/core/settle/` |
- 보충:
  > "확정(나). parse는 뜻이 그대로인 변환만 한다(ajv 규칙 수준). 오늘 파서의 문자 제거, 정수 자르기, 빈 값 치환(`""`, `[]`, `{}`), 불리언의 진릿값 변환은 parse에서 뺀다." (`reviews/round-18-owner-answers.md:8`)
  > "`parsers`의 새 자리는 18라운드의 노드 구조 항목에서 정한다" (`reviews/round-18-owner-answers.md:7`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:33`(정본), `08-design-a-to-z.md:572`, `reviews/round-18-owner-answers.md:7-8`, `09-landing-and-test-strategy.md:9`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 소유자 답(`reviews/round-18-owner-answers.md:7` S1; 파서를 가져온다), 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; 뜻이 그대로인 변환만)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:100`
- 충돌:
  > `09-landing-and-test-strategy.md:33`의 "`core/parsers/*`(ADR 0013 충돌)"는 18라운드 소유자 답과 다르다. 18라운드 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:7-8`, WRITE-052).
  > `09-landing-and-test-strategy.md:9`의 "옛 엔진의 내부(분기 자동 감지, 마이크로태스크 배칭, 파서 변환, 전역 상속)"는 파서 변환을 교체 대상에 넣은 점에서 18라운드 소유자 답과 다르다. 18라운드 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:7-8`, WRITE-052).

### LANDING-083 정착 지도 PR-3 — 부딪히는 코드, `createDynamicFunction`의 의존 주입 형태, `settle/derive/`

- 결정:
  > | PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
  > | --- | --- | --- | --- |
  > | PR-3 파생 | 의존 경로의 이벤트 구독, `InjectionGuardManager`, `getDerivedValueFactory` | `createDynamicFunction`의 의존 주입 형태 | `src/core/settle/derive/` |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:34`(정본), `08-design-a-to-z.md:573`
- 닫은 사람: 편집자 결정(16라운드 정착 검토)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:34`

### LANDING-084 정착 지도 PR-4 — `EventCascadeManager`·`ValidationManager` 교체, `dispatch/`·`validation/`, 진입 사슬의 소유

- 결정:
  > | PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
  > | --- | --- | --- | --- |
  > | PR-4 통지·검증 | `EventCascadeManager`(노드별 마이크로태스크, 100회 throw), `ValidationManager`(실패 삼킴), `compile` 하나뿐인 계약 | 비트별 배달 원장 개념, 세대 번호, `transformErrors` | `src/core/dispatch/`, `src/core/validation/`, `app/plugin/type.ts` 개정. 진입 사슬은 `dispatch`가 쓰기 동사마다 진입 함수로 소유하고, 검증 결과 배달은 `dispatch`가 넘긴 콜백이다 |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:35`(정본), `08-design-a-to-z.md:574`, `05-before-after.md:159`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 17라운드 스웜 수렴(편집자 결정, 진입 사슬은 `dispatch`가 소유)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:35`

### LANDING-085 정착 지도 PR-5 — `ArrayNode` 전략·비동기 `push` 교체, `arrayBehavior/`

- 결정:
  > | PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
  > | --- | --- | --- | --- |
  > | PR-5 배열 | `ArrayNode` 전략 둘, 비동기 `push` | `resolveArrayLimits`(`blueprint/`로 옮김), `omitTrailingArray`·`omitEmptyArray`(`behaviors/arrayBehavior/utils/`로). `resolveArrayValueFilter`는 투영 칸의 비트 분기로 다시 쓴다 | `src/core/behaviors/arrayBehavior/`(`branch/`·`terminal/`·`utils/`) |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:36`(정본), `08-design-a-to-z.md:575`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:36`

### LANDING-086 정착 지도 PR-6 — 루트 스키마 전역 상속·`checkComputedOptionFactory` 교체, `settle/`의 계산 끝

- 결정:
  > | PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
  > | --- | --- | --- | --- |
  > | PR-6 상태 키·제어 | 루트 스키마 전역 상속, `checkComputedOptionFactory`, `mergeShowConditions` | 없음 | `settle/`의 계산 끝 |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:37`(정본), `08-design-a-to-z.md:576`
- 닫은 사람: 편집자 결정(16라운드 정착 검토)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:37`

### LANDING-087 정착 지도 PR-7 — 렌더 계층 교체, 그대로 쓰는 것, `core/index.ts` 수출의 전환

- 결정:
  > | PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
  > | --- | --- | --- | --- |
  > | PR-7 전환 | `RootNodeContextProvider`, `Form`, `SchemaNodeProxy`, `SchemaNodeInput`, `useFormTypeInput`, `PluginManager`의 렌더 키트, `types/jsonSchema`의 맨 키, UI 플러그인 27파일 | 가상화(WeakSet identity), `renderForm`, `providers` 대부분, `useSchemaNodeTracker`·`useSchemaNodeSubscribe` | 기존 자리. `core/index.ts`의 수출만 새 fractal로 돌려 import 경로를 지킨다(`core/index.ts`는 `SchemaNode/`의 진입점을 가리키고 바인딩 전용 내부 통로를 이름으로 다시 내보낸다). `core/types`의 event·state·value는 남고 node·constructor는 지운다 |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:38`(정본), `08-design-a-to-z.md:577`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 17라운드 스웜 수렴(편집자 결정, `core/index.ts`의 진입점과 `core/types` 정리)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:38`

### LANDING-088 `core/INTENT.md`의 상속 문장은 PR-1에서 먼저 고침

- 결정:
  > `core/INTENT.md`의 "새 노드는 `AbstractNode`를 상속한다"는 PR-1에서 먼저 고친다(문서가 코드보다 먼저 바뀐다).
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:40`(정본), `09-landing-and-test-strategy.md:257`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 원리(filid 규칙, 문서가 코드보다 먼저)
- 라운드: 16
- 까닭: `08-design-a-to-z.md:553`

### LANDING-089 정착 지도의 '그대로 쓰는 것'은 레거시에서 가져오는 코드의 목록

- 결정:
  > 위 표의 '그대로 쓰는 것'은 가져오는 코드의 목록이다.
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:42#5`(정본)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:52` 전환 방식), 편집자 결정(17라운드, `09-landing-and-test-strategy.md:42`)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:52`

### LANDING-090 보정 PR-0 — 시나리오 형과 러너 뼈대, vitest 셋, addon-vitest, 옛 스토리 처분 목록, 비공개 시나리오 패키지

- 결정:
  > | PR | 더해진 것 |
  > | --- | --- |
  > | PR-0 | 시나리오 데이터 모듈의 형(`FormScenario`)과 코어 러너·화면 어댑터 `playScenario`의 뼈대(시나리오 감싸개와 핸들 등록 포함), vitest `test.projects` 셋, addon-vitest 설치, 옛 스토리의 처분 목록, 패키지 `CLAUDE.md`의 'Render-Level Test Harness' 절 개정(신규 시나리오의 자리와 파일당 상한을 §4.2·§5.2에 맞춘다), 비공개 패키지 `@aileron/schema-form-scenarios`의 생성(§5.2), 릴리스 전환 PR 뒤라면 `test.yml`에 vitest 세 프로젝트와 playwright chromium 단계(§6.2의 다섯째) |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:256`(정본), `08-design-a-to-z.md:570`
- 닫은 사람: 편집자 결정(16라운드, 테스트 전략), 소유자 답(`reviews/round-16-owner-answers.md:14` 8), 소유자 답(`reviews/round-16-owner-answers.md:10` 4)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:130`

### LANDING-091 보정 PR-1 — 식 컴파일러 통째 이동, 잎 교차 함수 이동, `core/INTENT.md` 개정, `merge` 선택 인자와 changeset

- 결정:
  > | PR | 더해진 것 |
  > | --- | --- |
  > | PR-1 | 식 컴파일러(`createDynamicFunction`과 그 `utils`, `JSON_POINTER_PATH_REGEX`, `getPathManager`, `DynamicFunction` 형)를 `src/core/blueprint/`로 통째로 옮김(PR-7까지는 옛 엔진도 쓰므로 청사진 진입점이 이름으로 내보내고 그 유지 이유를 청사진의 `DETAIL.md`에 적는다. 옛 소비자는 import만 고침), 잎 교차 함수를 새 fractal로 옮김(옛 `intersect*Schema`는 공집합 표시를 받으면 오늘처럼 던지도록 고쳐 옛 동작을 PR-7까지 지킨다(방법은 18라운드 안건 '전환 방식의 세부')), `core/INTENT.md` 개정, `@winglet/common-utils`의 `merge` 선택 인자와 그 changeset(`minor`, §6.2의 열한째) |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:257`(정본), `08-design-a-to-z.md:571`
- 닫은 사람: 편집자 결정(16라운드, 답 10으로 확정 `reviews/round-16-owner-answers.md:16`), 소유자 답(`reviews/round-14-owner-answers.md:17` O-11)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:20`

### LANDING-092 보정 PR-2 — 되돌림 기록 항목 확정, 노드 구조, `active` 게터, 나감 비움의 하위 트리 규칙

- 결정:
  > | PR | 더해진 것 |
  > | --- | --- |
  > | PR-2 | 되돌림 기록 항목 확정(§2.1의 조건 5), 노드 구조(§3: `record/`·`behaviors/`·`navigation/`·`SchemaNode/`, 행은 잎 넷·객체 둘(터미널 객체까지)·가상. 터미널 배열은 PR-5), `active` 게터, 나감 비움의 하위 트리 규칙(R17-2 ㄴ) |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:258`(정본), `08-design-a-to-z.md:572`
- 닫은 사람: 편집자 결정(16라운드 정착 검토 조건 5), 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:23`

### LANDING-093 보정 PR-4 — ajv 셋의 동기 `compileGuard`, 사본·가드 캐시, 재생성 reset의 같은 `$id`, `onError`의 core 쪽

- 결정:
  > | PR | 더해진 것 |
  > | --- | --- |
  > | PR-4 | ajv6·7·8의 동기 `compileGuard(root, pointer)` 구현과 코어의 사본·가드 캐시, 훅 수준 바인딩 시험, 같은 `$id` 재등록, 배달 경로(§2.4), 검증기 등록의 참조 세기와 최근 해제 목록, 재생성 reset의 같은 `$id`(새 루트를 등록할 때 옛 트리가 아직 살아 있으므로 살아 있는 두 트리의 충돌로 다루고 reset의 원자성을 지킨다, §2.6의 일곱째·여덟째, 16라운드 스웜 수렴(편집자 결정)), `onError`의 core 쪽(보고기 인자, 기록 형과 코드 형, 사슬 끝의 기록마다 전달, 핸들러 예외 규칙, 전달 중 쓰기 거부, ADR 0014 §3) |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:259`(정본), `08-design-a-to-z.md:574`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:16` 10), 16라운드 스웜 수렴(편집자 결정, 재생성 reset의 같은 `$id`), 17라운드 스웜 수렴(편집자 결정, `onError` core 쪽)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:19`

### LANDING-094 보정 PR-5 — 배열·터미널 배열 행, `resolveArrayLimits`의 청사진 이동

- 결정:
  > | PR | 더해진 것 |
  > | --- | --- |
  > | PR-5 | 배열·터미널 배열 행(`behaviors/arrayBehavior/`의 `branch/`·`terminal/`), `resolveArrayLimits`의 청사진 이동 |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:260`(정본), `08-design-a-to-z.md:575`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 편집자 결정(16라운드 정착 검토)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:36`

### LANDING-095 보정 PR-7 — 바인딩 계약 다섯, `onError` 렌더 계층, `finishInput`, e2e·스토리·스파이크 이식, `reset`의 로드 전환

- 결정:
  > | PR | 더해진 것 |
  > | --- | --- |
  > | PR-7 | 바인딩 계약 다섯(§2.3. 첫째·넷째는 17라운드 스웜 수렴(편집자 결정)으로 닫힘. 드러남과 제출 거부는 모든 환경에서 같다, R17-1 나), Form 속성 `onError`와 바깥 감싸개·인스턴스 보고기, 입력 마침 신호 `finishInput`(trim), `node.group` → `node.strategy`의 소비자 이주, UI 플러그인 27파일의 `presentation.*` 이주, `renderForm` 다섯(§4.5), 부류별 e2e 실행기, React 18 실행, 배달 경로의 렌더 계층 구독(§2.4), 시나리오 스토리와 `playScenario`, 옛 스토리 49파일 전체 정리, `architecture/spikes/**` 가운데 제품 동작에 남는 상황의 e2e 이식(§5.3), `Form`의 스키마 `clone` 제거, `reset`의 로드 전환(같은 스키마 판정, 커밋 재대조, 호출 안의 재생성, 자식 프록시 마운트 여부로 가르는 입력 판정, 노드가 드는 Refresh 번호와 상호작용 초기화 번호), 로드의 검증 규칙(마운트 포함), `setValue(V)`의 같은 입력 판정(§2.6, 16라운드 스웜 수렴(편집자 결정)), `@winglet/react-utils`의 changeset(`minor`, §6.2의 열한째) |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:261`(정본), `08-design-a-to-z.md:577`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 소유자 답(`reviews/round-16-owner-answers.md:10,11` 4·5), 16라운드 스웜 수렴(편집자 결정, reset·로드), 17라운드 스웜 수렴(편집자 결정, 바인딩 계약 첫째·넷째)
- 라운드: 17
- 까닭: `09-landing-and-test-strategy.md:44`

### LANDING-096 보정 PR-8 — 릴리스 전 벤치 재실행, changeset과 판 번호, 릴리스 테스트, reset 규칙 문서, 스토리북 문서

- 결정:
  > | PR | 더해진 것 |
  > | --- | --- |
  > | PR-8 | 릴리스 전 벤치 재실행, changeset(파괴적 변경, `fixed` 무리 전체 `major`. 1.0.0-beta 프리릴리스 뒤 1.0.0, §6.2의 열넷째)과 `CHANGELOG.md`, 포장된 산출물의 릴리스 테스트(§6.2, 16라운드 스웜 수렴(편집자 결정)), README·`docs/QUICK_REFERENCE.md`·`docs/agents`의 reset 규칙(§2.6의 열여섯째), 스토리북 문서 |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:262`(정본), `08-design-a-to-z.md:578`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:22` PR-8의 판 번호), 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:225`

### LANDING-097 릴리스 전환(별도 PR) — changesets 가동과 CI·배포 작업 흐름 정리, PR-8 전에 병합

- 결정:
  > | PR | 더해진 것 |
  > | --- | --- |
  > | 릴리스 전환(별도 PR) | changesets 가동, 지속 통합 시험 작업 흐름과 루트 `lint`·`typecheck`·`test` 스크립트, `publish-npm-packages.yml`의 작업 다섯, 포장 스크립트 분리와 릴리스 테스트 재작성, 판 올림 스크립트 정리와 루트 `CLAUDE.md`·`scripts/PUBLISHING.md` 개정(§6.2, 16라운드 스웜 수렴(편집자 결정)). 저장소 전체의 일이라 재설계와 독립이며 PR-8 전에 병합한다. PR-0과는 순서가 없다 |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:263`(정본), `08-design-a-to-z.md:578`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:225`

### LANDING-098 05의 이주 행 가운데 08 §14에 행이 없는 것 — `ENHANCED_KEY`, `minItems`·`maxItems`, `Normalize`, `null`→`{}`, 배열 Promise, `setValue(getValue())`, `useEffect` 파생 쓰기

- 결정:
  > | `ENHANCED_KEY` 마커 주입 | `processOneOfSchema.ts:14-24`, `app/constants/internal.ts:3` | 검증기 입력 불변(P1) | 활성 조각 기반 `schemaPath` 필터(`adr/0001:40`) |
  > | `minItems` 채움 · `maxItems` 차단 | `adr/0013:78`이 지목 | 같음 | 입력 컴포넌트 + 유효 스키마 노출 |
  > | `Normalize`의 미선언 키 제거 | `core/types/value.ts:26-66` | P1′ — 폼은 값을 지우지 않는다 | `extras` 칸 보존·방출(E16) |
  > | `null` → `{}` 변환, 비객체 값 버리기 | `adr/0013:79`가 지목 | 같음 | 보존·방출하고 type 에러(F27) |
  > | 배열 연산의 Promise 반환 | `01-current-structure.md:81` | `await` 뒤가 "구독자가 봤다"는 뜻이 되지 않았다 | 동기 API(T-7) |
  > | `setValue(getValue())`로 값 유지 | 전체 교체이므로 로드 계약이 다시 돌고 지운 키에 `default`가 재주입된다. 막으려면 호출 단위 억제 옵션 |
  > | `useEffect`로 파생 값 쓰기 | 새 진입이 되어 키 입력당 `onChange`가 2회다. 권장 경로는 `&derived`·`injectTo`·리스너 |
- 보충:
  > "`setValue(getValue())`도 전체 교체" (`08-design-a-to-z.md:266`)
  > "`setValue(getValue())`의 재채움(로드는 새 수명)" (`08-design-a-to-z.md:524`)
- 상태: 분할됨(→ LANDING-115, LANDING-116, LANDING-117, LANDING-118, LANDING-119)
- 출처: `05-before-after.md:149,151-153,162,196-197`(정본), `02-target-overview.md:354`, `09-landing-and-test-strategy.md:36`, `08-design-a-to-z.md:266,524`
- 닫은 사람: 편집자 결정(6라운드 대조, `05-before-after.md:5`)
- 라운드: 6
- 까닭: `05-before-after.md:149`

### LANDING-099 대체됨 — 폼이 분기를 고르던 05의 행(값 가드·선택 가드·`selection` 칸·분기 하나만 활성)

- 결정:
  > | `&if` 분기 판별 | `extractConditionInfo.ts:44-45` | 표준 composition 위에 얹은 FE 키가 검증을 깨뜨린다 | 값 가드·선택 가드(`adr/0002:34-40`) |
  > | `anyOf` 다중 활성 | `BranchStrategy.ts:424` | 형상의 결정성 | 분기 하나만 활성(`adr/0002:54`) |
  > | 선택 가드와 `selection` 칸 | `adr/0002:38-40` | 판별식이 없는 union을 사용자가 고른다 |
  > | `&if`로 `oneOf` 분기 고르기 | 분기에 `const`/`enum` 판별식을 넣거나, 판별식 없이 두고 선택 가드로 고른다. `&if`만으로 분기를 구분한 스키마는 **폼에서도 invalid**가 된다 |
  > | `node.oneOfIndex` 읽기 | 대응물이 **미확인**이다 |
  > | 두 분기에 동시에 맞는 값을 `anyOf`에 로드 | 분기 하나만 켜지므로 다른 분기의 키가 방출에서 빠진다 |
- 보충: 없음
- 상태: 대체됨(→ LANDING-004, LANDING-005, LANDING-006, LANDING-028)
- 출처: `05-before-after.md:148,163,178,193,198,203`(정본, 옛 기록), `07-conclusions.md:142`
- 닫은 사람: 편집자 결정(9라운드 세 도출 일치, `07-conclusions.md:142` 4.25), 소유자 답(`reviews/round-9-spec.md:42,44` 읽기1)
- 라운드: 9
- 까닭: `07-conclusions.md:142`

### LANDING-100 대체됨 — `options.trim` 강제 변환은 사라지고 입력 컴포넌트가 맡음

- 결정:
  > | `options.trim` 강제 변환 | `types/jsonSchema.ts:139` | core는 받은 값을 고치지 않는다(P2) | 입력 컴포넌트(`adr/0013:77`) |
- 보충: 없음
- 상태: 대체됨(→ LANDING-047, LANDING-034)
- 출처: `05-before-after.md:150`(정본, 옛 기록)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:11`

### LANDING-101 대체됨 — React 컴포넌트 감지 대신 "있고 `null`이 아니다"만 봄

- 결정:
  > | React 컴포넌트 감지 | `adr/0011:53`이 지목 | 컴포넌트를 감지하는 것은 렌더러를 아는 것(P5) | "있고 `null`이 아니다"만 본다 |
- 보충: 없음
- 상태: 대체됨(→ LANDING-061, LANDING-082)
- 출처: `05-before-after.md:156`(정본, 옛 기록), `08-design-a-to-z.md:571`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:12`

### LANDING-102 대체됨 — 분석 단계의 정적 throw 대신 런타임 충돌 보고

- 결정:
  > | 분석 단계의 정적 throw | `getCompositionNodeMapList.ts:95-105` | 돌려 보고 개발 단계에 알린다 (확인 대기) | 런타임 충돌 보고(`adr/0005:7,99`) |
- 보충: 없음
- 상태: 대체됨(→ ERROR-078, LANDING-061)
- 출처: `05-before-after.md:157`(정본, 옛 기록)
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:16` O-10), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `reviews/round-14-owner-answers.md:16`

### LANDING-103 대체됨 — 쓰기 옵션은 옵션 객체(`{ mode: 'Merge' }`)

- 결정:
  > | `SetValueOption`의 `Batch`·`Isolate`·`EmitChange`·`Propagate`·`PublishUpdateEvent` | `core/types/value.ts:26-66` | 전파와 통지가 옵션이 아니라 구조다 | 옵션 객체(`adr/0013:46`) |
  > | 쓰기 옵션 객체 | `adr/0013:46` | 비트 워드를 대신하고 `reset`·마운트에도 같은 모양으로 있다 |
  > | `SetValueOption.Merge` 비트 | `setValue(v, { mode: 'Merge' })` |
- 보충: 없음
- 상태: 대체됨(→ LANDING-021)
- 출처: `05-before-after.md:160,181,195`(정본, 옛 기록), `07-conclusions.md:345`
- 닫은 사람: 편집자 결정(9라운드 이름, `07-conclusions.md:345` N1; 비트마스크는 8라운드 소유자 지시, `HANDOFF.md` 8라운드 행)
- 라운드: 9
- 까닭: `07-conclusions.md:345`

### LANDING-104 대체됨 — 정착 상태 `settle`과 예산

- 결정:
  > | 정착 상태 `settle`과 예산 | `03-mental-model.md:28`, `adr/0007:30-36` | 형상 계산의 수렴 결과가 프로덕션에서도 관측 가능한 칸이 된다 |
- 보충: 없음
- 상태: 대체됨(→ LANDING-045)
- 출처: `05-before-after.md:171`(정본, 옛 기록)
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:9`

### LANDING-105 대체됨 — strict 검증기용 `&` 키 제거 유틸리티

- 결정:
  > | `&` 키 제거 유틸리티 | `adr/0012:19`·`open-questions.md:66` | strict 검증기를 쓰는 소비자용 선택 사항 |
- 보충: 없음
- 상태: 대체됨(→ LANDING-031, LANDING-033)
- 출처: `05-before-after.md:180`(정본, 옛 기록)
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:13` 5)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:12`

### LANDING-106 `refresh(path)`·`remount(path)` 공개 — C-11 확정 대기

- 결정:
  > | `refresh(path)`·`remount(path)` 공개 | `adr/0008:121` | 후보. C-11 확정 대기 |
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md` §7, :87)
- 출처: `05-before-after.md:183`(정본, 옛 기록), `reviews/round-18-agenda.md:87`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건 §7로 이관)
- 라운드: 17
- 까닭: `reviews/round-18-agenda.md:87`

### LANDING-107 대체됨 — 진단 채널 후보(단일 콜백)

- 결정:
  > | 진단 채널 | 6라운드 D-22 | 후보. 예산 초과·리스너 throw·검증 pending을 실어 나를 단일 콜백 |
- 보충: 없음
- 상태: 대체됨(→ LANDING-044, LANDING-045)
- 출처: `05-before-after.md:184`(정본, 옛 기록)
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 17라운드 스웜 수렴(편집자 결정, 안 B)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:15`

### LANDING-108 대체됨 — `normalizedValue`·`enhancedValue`·`&pristine`·`PublicSetValueOption`의 이름과 거취 미결(D-23)

- 결정:
  > | `normalizedValue`·`enhancedValue`·`&pristine`·`PublicSetValueOption` | 이름과 거취가 **미결(D-23)**이거나 문서에 없다 |
- 보충: 없음
- 상태: 대체됨(→ LANDING-023, LANDING-008)
- 출처: `05-before-after.md:204`(정본, 옛 기록), `06-conclusions.md:356,358`, `07-conclusions.md:316`
- 닫은 사람: 편집자 결정(8라운드 이름 N3, `06-conclusions.md:356,358`), 편집자 결정(9라운드 이름, `07-conclusions.md:316` 소유자 동의 기록)
- 라운드: 9
- 까닭: `06-conclusions.md:358`

### LANDING-109 06 §9의 5 이주 안내 항목(C8) — 8라운드가 새로 올린 것

- 결정:
  > 이 문서가 새로 올린 것: `find`의 터미널 별칭 제거(4.8), 배열 `Merge`의 통째 교체(4.7), 이력에 기대어 안정되던 스키마가 예산 초과가 되는 것(4.15), 비수렴 시 `default`가 모두 빠지는 것(4.11), 파생 필드의 문서와 코드 어긋남(5.2), `injectTo`의 로드 동작(5.1), 조건부 조각의 `default`가 동작하기 시작하는 것(5.3에서 (C)일 때), `normalizedValue` → `outputValue`(N3), `computed.*` → `&*`와 접두 없는 키의 `&` 접두(N5), `push`의 `unlimited` 제거(N6), README 1483행.
- 보충:
  > "주석 키워드(`title`, `description`, `format`, `default`·`controls.default`, `writeOnly`, `$comment`, `examples`) | 뒤가 앞을 덮는다. 켜진 조각이 본체를, 전순서에서 나중 조각이 앞 조각을 덮는다" (`08-design-a-to-z.md:325`)
- 상태: 현행
- 출처: `06-conclusions.md:429#2`(정본, 옛 기록), `08-design-a-to-z.md:254,265,325`, `03-mental-model.md:81`, `06-conclusions.md:231`
- 닫은 사람: 소유자 답(`00-goals.md:111` C8; 이주 안내를 낸다), 편집자 결정(8라운드, `06-conclusions.md:429`; 목록), 소유자 답(`reviews/round-10-owner-answers.md:20` D-7; 5.3의 (C))
- 라운드: 10
- 까닭: `06-conclusions.md:429`
- 충돌:
  > `06-conclusions.md:429`의 "`computed.*` → `&*`와 접두 없는 키의 `&` 접두(N5)"는 정본과 다르다. 정본이 이긴다(`08-design-a-to-z.md:436,462`, 15라운드 결정 5).

### LANDING-110 07 §9의 6 이주 안내 항목(C8) — 9라운드가 더한 것

- 결정:
  > `const`/`enum` 자동 감지 제거와 `oneOfIndex`·`anyOfIndices` 제거(4.25), `&if`→`&active`(6.1), `computed`→`control`(별칭이므로 기계적), `DisableSchemaDefaults`→`DisableAutomaticWrites`(06 문서상의 이름이라 코드 이주는 없음), `&unsetValue` 신설, `allOf` 안의 `if/then/else`가 병합되기 시작하는 것(4.27), 분기 전환 때 공유 노드를 다시 채우지 않는 것(4.22), 같은 노드의 표준 `readOnly`와 `&readOnly`가 택일(오늘은 표준 키가 이김)에서 OR로 바뀌는 것(4.26), `allOf` 항목끼리 겹친 표준 `readOnly`가 먼저-승에서 OR로 바뀌는 것(4.26·4.27), 공개 문서의 `derived` 레벨 약속을 에지로 고치는 것(5.2 아래 문단).
- 보충: 없음
- 상태: 현행(기록)
- 출처: `07-conclusions.md:423#3`(정본, 옛 기록)
- 닫은 사람: 편집자 결정(9라운드, `07-conclusions.md:423`)
- 라운드: 9
- 까닭: `07-conclusions.md:423`
- 충돌:
  > `07-conclusions.md:423`의 "`computed`→`control`(별칭이므로 기계적)"는 정본과 다르다. 정본이 이긴다(`08-design-a-to-z.md:436`, 15라운드 결정 5).
  > `07-conclusions.md:423`의 "`&if`→`&active`(6.1)"는 정본과 다르다. 정본이 이긴다(`08-design-a-to-z.md:435`, 15라운드 결정 5).

### LANDING-111 대체됨 — `&if`를 `&active`로 옮길 때 `./x`를 `../x`로 고친다

- 결정:
  > `&if`를 `&active`로 옮길 때 기준점이 호스트에서 호스트의 직계 자식 자리로 바뀌므로 `./x`를 `../x`로 고친다.
- 보충: 없음
- 상태: 대체됨(→ LANDING-029)
- 출처: `07-conclusions.md:423#9`(정본, 옛 기록), `reviews/round-15-decisions.md:9`
- 닫은 사람: 소유자 답(`reviews/round-15-decisions.md:9` 1)
- 라운드: 15
- 까닭: `reviews/round-15-decisions.md:9`

### LANDING-112 대체됨 — 코드 착수 전에 할 일 넷(9라운드 개발 진입 평가)

- 결정:
  > - **코드 착수 전에 할 일 넷.**
  > 1. 소유자가 이 문서의 3절과 4절을 통과시킨다. 특히 4.22(채움), 4.24(노드 게이트), 4.25(분기를 고르지 않음)다. 4.25가 반려되면 상태 모델이 바뀌므로 그 뒤의 모든 것이 다시 열린다.
  > 2. 원리 원장 `03-mental-model.md`와 ADR 5차 본문(0002·0003·0005·0006·0007·0008·0013)을 써서 구현 명세를 하나로 모은다. 지금 ADR 본문은 4차라 이 문서와 곳곳에서 충돌한다(`selection` 칸, "`default` 주입이 유일한 자동 쓰기", 판별식 식별). 구현자가 두 문서를 대조하며 짜게 두면 안 된다.
  > 3. 생성기가 만든 스키마 14종(`spikes/guard-cost/redteam3/corpus.mjs`: pydantic, OpenAPI 3.0·3.1, zod, TypeBox 등)을 v5 모델로 돌려, "폼은 분기를 고르지 않는다" 아래에서 무엇이 보이는지 표로 만든다(위험 1). **했음(11라운드, `spikes/round11-corpus/REPORT.txt`).** 순수 모드는 14/14 빌드되고 분기는 전부 켜진다(재귀 스키마도 지연 `$ref` 해석으로 유한 트리). `&discriminator`는 12/14에 적용 가능(공통 `const`·`enum` 태그 키가 없는 둘은 불가), `if` 변환도 12/14. 다만 분기가 하나만 켜지는지는 v5가 게이트 입력에 `extras`를 넣지 않아 측정하지 못했다. 설계는 `extras` 경로로 답한다(원장 §5의 게이트 입력 행). 슬라이스 2 전의 프로토타입 v7 항목이다.
  > 4. `adr/0009` §1의 성능 기준선을 실제로 잰다. **확인됨(2026-09-23).** 기준선 기록이 있고(`bench/.results/baseline.json`, `benchmark-form/results/baseline.json`) 재실행 수치가 기록과 정합해 회귀가 없다. 남은 것은 예산 수치 자체이며 소유자 정책이다(ADR 0009 미결). 컴파일 가드 비용(가드 200개에 22.4 ms, `adr/0004:69`)의 허용 여부는 그 수치가 정해져야 판정할 수 있다.
- 보충: 없음
- 상태: 대체됨(→ LANDING-060)
- 출처: `07-conclusions.md:448-452`(정본, 옛 기록), `08-design-a-to-z.md:570`
- 닫은 사람: 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:570` 착수 전 닫을 것)
- 라운드: 14
- 까닭: `08-design-a-to-z.md:570`

### LANDING-113 대체됨 — 구현 슬라이스 0–8(두 검토의 순서를 합침)

- 결정:
  > | 순서 | 슬라이스 | 필요한 결정 |
  > | --- | --- | --- |
  > | 0 | 문서 통합(원리 원장, ADR 5차), 기준선 벤치, corpus 재실행 | 3절·4절 통과, 5.1의 22 |
  > | 1 | 청사진 분석(순수 함수): 조각 표, 노드 공유, 검증 키워드 교차. 주석 병합은 교체할 수 있는 표 | 4.25, 4.27의 교차 |
  > | 2 | 객체 노드 트리와 정착 루프: 표시·계산·전이·커밋, 술어 인터페이스 뒤의 가드 스텁, 노드 게이트, 투영, 노드 생성 채움 | 4.22, 4.24(10), D-1·D-2·D-4, 표현식 의존 범위(11.2), 5.2의 2(`Merge`의 `undefined`) |
  > | 3 | 파생 단계: `&derived`·`&injectTo`·`&unsetValue`, 같은 대상 해소, `DisableAutomaticWrites`. 순위와 로드 에지는 스위치 | 5.3의 6, 5.4의 8·9·21 |
  > | 4 | 통지(ADR 0008), 커밋 번호 스탬프 검증, ajv8 `compileGuard` 플러그인, 에러 라우팅 | `compileGuard` 계약, Q12 |
  > | 5 | 배열 아이템 호스트, `push`, 통째 쓰기의 identity와 채움 | R13, `push`가 로드인가, Q13 |
  > | 6 | 상태 키와 제어: 결합 규칙, `&children`, 조각 범위 제어, `control` 별칭 | 5.3의 7, 5.1의 12, 5.4의 13·16·18, 5.3의 14·17, 5.2의 15 |
  > | 7 | React 바인딩(ADR 0011), 렌더 테스트 이주, UI 플러그인 | S11, 렌더 결과 검토 |
  > | 8 | ADR 0010, 이주 안내, 릴리스 노트 | 5.4의 5 |
- 보충: 없음
- 상태: 대체됨(→ LANDING-060, LANDING-061, LANDING-062, LANDING-063, LANDING-064, LANDING-065, LANDING-066, LANDING-067, LANDING-068)
- 출처: `07-conclusions.md:480-490`(정본, 옛 기록), `08-design-a-to-z.md:568-578`, `02-target-overview.md:394-406`
- 닫은 사람: 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:568-578`)
- 라운드: 14
- 까닭: `08-design-a-to-z.md:551`

### LANDING-114 대체됨 — 9라운드의 규모 추정(교차 연산을 청사진 병합으로 옮겨 재사용)

- 결정:
  > **규모.** 로컬 검토의 추정으로 `src/core` 비테스트 코드 약 9,900행 가운데 절반 이상이 교체 대상이다(`BranchStrategy` 둘, `EventCascadeManager`, `getComputedPropertiesManager`의 상태 기계, `ValidationManager`, `schemaNodeFactory`, `VirtualNode`). `helpers/jsonSchema`의 교차 연산은 청사진 병합으로 옮겨 재사용하고, `findNode`·`traversal`·`jsonPointer`·표현식 컴파일러·가상화는 유지한다. core 테스트 136파일과 시나리오 44파일은 동작이 달라져 다시 쓴다. 이 추정은 줄 수와 ADR 서술로만 했다.
- 보충: 없음
- 상태: 대체됨(→ LANDING-069, LANDING-074)
- 출처: `07-conclusions.md:492`(정본, 옛 기록), `08-design-a-to-z.md:598`, `09-landing-and-test-strategy.md:20`
- 닫은 사람: 편집자 결정(16라운드 정착 검토 조건 2, `09-landing-and-test-strategy.md:20`)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:20`

### LANDING-115 이주(05) — `ENHANCED_KEY` 마커 주입이 사라지고 활성 조각 기반 `schemaPath` 필터로

- 결정:
  > | `ENHANCED_KEY` 마커 주입 | `processOneOfSchema.ts:14-24`, `app/constants/internal.ts:3` | 검증기 입력 불변(P1) | 활성 조각 기반 `schemaPath` 필터(`adr/0001:40`) |
- 보충: 없음
- 상태: 중복(→ VALIDATE-010)
- 출처: `05-before-after.md:149`(정본, 옛 기록), `adr/0001-validator-input-invariant.md:43-44`, `02-target-overview.md:354`
- 닫은 사람: 원리(`03-mental-model.md:13` P1)
- 라운드: 1
- 까닭: `adr/0001-validator-input-invariant.md:43`

### LANDING-116 이주(05) — `minItems` 채움·`maxItems` 차단은 입력 컴포넌트로, `Normalize` 키 제거와 `null`→`{}`는 폐기

- 결정:
  > | `minItems` 채움 · `maxItems` 차단 | `adr/0013:78`이 지목 | 같음 | 입력 컴포넌트 + 유효 스키마 노출 |
  > | `Normalize`의 미선언 키 제거 | `core/types/value.ts:26-66` | P1′ — 폼은 값을 지우지 않는다 | `extras` 칸 보존·방출(E16) |
  > | `null` → `{}` 변환, 비객체 값 버리기 | `adr/0013:79`가 지목 | 같음 | 보존·방출하고 type 에러(F27) |
- 보충:
  > "(4) nullable이 아닌 노드의 `null`(서버의 NULL)이 더는 방출에서 빠지지 않아 검증기 있는 폼의 제출을 막는 사용성 변화의 문서화." (`reviews/round-18-agenda.md:80`)
- 상태: 중복(→ WRITE-022)
- 출처: `05-before-after.md:151-153`(정본, 옛 기록), `05-before-after.md:199`, `adr/0013-core-does-not-rewrite-values.md:90-92`
- 닫은 사람: 소유자 답(`reviews/round-2.md:119` 새 원칙; 배열 행), 편집자 결정(5라운드, ADR 0013 4차 본문 `adr/0013-core-does-not-rewrite-values.md:12`; F27·E16)
- 라운드: 5
- 까닭: `reviews/round-2.md:119`

### LANDING-117 이주(05) — 배열 연산은 Promise를 돌려주지 않는 동기 API

- 결정:
  > | 배열 연산의 Promise 반환 | `01-current-structure.md:81` | `await` 뒤가 "구독자가 봤다"는 뜻이 되지 않았다 | 동기 API(T-7) |
- 보충: 없음
- 상태: 중복(→ EVENT-002)
- 출처: `05-before-after.md:162`(정본, 옛 기록), `05-before-after.md:200`, `adr/0008-event-system.md:40,195`, `adr/0007-settle-cycle.md:138`
- 닫은 사람: 편집자 결정(4라운드, 실행 검증을 통과한 제안, `adr/0008-event-system.md:3`·`reviews/round-4.md:77`)
- 라운드: 4
- 까닭: `adr/0008-event-system.md:40`

### LANDING-118 이주(05) — `setValue(getValue())`는 전체 교체라 지운 키에 채움이 다시 들어감

- 결정:
  > | `setValue(getValue())`로 값 유지 | 전체 교체이므로 로드 계약이 다시 돌고 지운 키에 `default`가 재주입된다. 막으려면 호출 단위 억제 옵션 |
- 보충:
  > "`setValue(getValue())`도 전체 교체" (`08-design-a-to-z.md:266`)
  > "`setValue(getValue())`의 재채움(로드는 새 수명)" (`08-design-a-to-z.md:524`)
  > "필요하면 호출 단위 억제 비트 `DisableAutomaticWrites`로 끈다" (`adr/0007-settle-cycle.md:102`)
- 상태: 중복(→ WRITE-017)
- 출처: `05-before-after.md:196`(정본, 옛 기록), `adr/0013-core-does-not-rewrite-values.md:70`, `adr/0007-settle-cycle.md:102`, `08-design-a-to-z.md:266,524`
- 닫은 사람: 소유자 답(`reviews/round-4.md:113` D-7)
- 라운드: 4
- 까닭: `reviews/round-4.md:113`

### LANDING-119 이주(05) — `useEffect`로 쓴 파생 값은 새 진입이라 키 입력당 `onChange` 2회

- 결정:
  > | `useEffect`로 파생 값 쓰기 | 새 진입이 되어 키 입력당 `onChange`가 2회다. 권장 경로는 `&derived`·`injectTo`·리스너 |
- 보충: 없음
- 상태: 중복(→ EVENT-036)
- 출처: `05-before-after.md:197`(정본, 옛 기록), `adr/0008-event-system.md:134,136`
- 닫은 사람: 편집자 결정(5라운드 도출 C-10, `reviews/round-5-derivations.md:25`)
- 라운드: 5
- 까닭: `adr/0008-event-system.md:136`

### LANDING-120 이주(S1) — 파서의 강제 변환이 빠지고, 바꾸지 못한 값은 `NaN` 대신 받은 그대로 들며, 경고 `VALUE_TYPE_MISMATCH`가 생김

- 결정:
  > 확정(나). parse는 뜻이 그대로인 변환만 한다(ajv 규칙 수준). 오늘 파서의 문자 제거, 정수 자르기, 빈 값 치환(`""`, `[]`, `{}`), 불리언의 진릿값 변환은 parse에서 뺀다.
  > 바꾸지 못한 값은 받은 그대로 들고 `value`·방출·제출이 모두 그 값이다(비우기·대체·거부 없음). 노드는 정합 상태(경고등)를 들고, 이것이 공개 형의 판별자다(이름과 모양은 18라운드 §7).
  > `onError` 기록의 level은 `warning`이고(값을 보존하므로 폼의 약속은 지켜진다. error 층은 throw·거부·싱크로 드러나야 해 통보 3과 부딪힌다), 가칭 `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH`를 노드의 정합 상태가 켜질 때마다 한 번 보낸다(path, 기대 형, 받은 값의 종류, 쓰기 출처). 검증기가 있든 없든 보낸다(core의 parse가 찾는 것이라 검증 결과가 아니다).
- 보충:
  > 소유자(S1 이어서): "변경하지 못하는 값을 입력했을때, 이전에는 NaN 같은 값을 넣었는데요" (`reviews/round-18-owner-answers.md:8`)
  > "(2) 입력 구성 요소의 계약: 치다 만 글자는 입력이 들고, 빈 칸은 `undefined`, 비우기는 nullable이면 `null` 아니면 `undefined`를 보낸다. 기본 수 입력(빈 칸에 `valueAsNumber`의 `NaN`)과 기본 불리언 체크박스(`defaultChecked={defaultValue ?? undefined}`)를 고친다." (`reviews/round-18-agenda.md:80`)
  > "(4) nullable이 아닌 노드의 `null`(서버의 NULL)이 더는 방출에서 빠지지 않아 검증기 있는 폼의 제출을 막는 사용성 변화의 문서화." (`reviews/round-18-agenda.md:80`)
- 상태: 분할됨(→ LANDING-125, LANDING-126, LANDING-127)
- 출처: `reviews/round-18-owner-answers.md:8-9`(정본), `reviews/round-18-agenda.md:80`, 같은 규칙의 원장 항목 WRITE-052·WRITE-054·WRITE-055·ERROR-182
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; 뜻이 그대로인 변환만), 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째; 받은 그대로 든다, 경고등, `onError` 전달), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; 경고의 level·가칭 코드·보내는 때)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:8-9`

### LANDING-121 PR-8의 reset 문서가 적는 것 — 같은 스키마의 판정, prop을 읽는 때, 노드 참조가 이어지는 조건, 늦은 쓰기, `dirty`

- 결정:
  > **문서와 시험.** PR-8의 문서 재작성(README, `docs/QUICK_REFERENCE.md`, `docs/agents`의 `validation-and-state.md`)이 적는 것: 같은 스키마의 판정(첫째), prop을 읽는 때와 재대조(둘째), 노드 참조가 이어지는 조건(로드 경로뿐), 제자리 변경 비반영, `key`가 버리는 것, 포커스, 입력 컴포넌트의 늦은 쓰기는 `node`가 아니라 `onChange`로 한다는 것(재생성 reset 뒤 `node`로 한 늦은 쓰기는 `SchemaFormError`), reset 직후 다시 마운트된 입력이 흉내 언마운트 때 같은 값을 흘려보내 `dirty`를 세울 수 있다는 것(`dirty`는 C6대로 현행 유지라 값이 같아도 선다. 개발 모드 StrictMode에서만 관측될 수 있음, 실행 확인 전).
- 보충:
  > "README·`docs/QUICK_REFERENCE.md`·`docs/agents`의 reset 규칙(§2.6의 열여섯째)" (`09-landing-and-test-strategy.md:262`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:96#1-3`(정본), `09-landing-and-test-strategy.md:262`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`), 소유자 답(`00-goals.md:109` C6; `dirty` 현행 유지)
- 라운드: 16
- 까닭: `09-landing-and-test-strategy.md:79`

### LANDING-122 정착 검토의 그 밖의 판단 — `extras` 정적 규칙은 조각 표 걸음에서, 유효 스키마 메모는 비트 집합 키(추정)

- 결정:
  > - `extras` 정적 규칙은 스캐너의 `keyword`·`variant`·`dataPath`로 구현 가능하다. 조각 표를 만드는 걸음에서 함께 뽑고, `$ref` 순환은 스캐너가 `referenceSkipped: 'cycle'`로 알린다.
  > - 유효 스키마 메모는 노드 위치마다 덧씌움 후보를 전순서로 매기고 활성 부분집합을 비트 집합으로 키한다. 후보에 `controls.children` 항목과 조각의 `controls`까지 넣어야 "같은 집합이면 같은 참조"가 참이 된다(추정, 비용은 재지 않았다).
- 보충:
  > "**메모.** 유효 스키마는 활성 덧씌움 집합(그 노드에 얹힌 켜진 조각들의 집합)마다 메모한다. 같은 집합이면 같은 참조를 돌려준다." (`adr/0005-blueprint-analysis-and-node-sharing.md:109`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:68-69`(정본), `reviews/raw-round16-landing-review.md:28-29`
- 닫은 사람: 편집자 결정(16라운드 정착 검토, `09-landing-and-test-strategy.md:3`)
- 라운드: 16
- 까닭: `reviews/raw-round16-landing-review.md:28-29`

### LANDING-123 대체됨: 작업은 `feature/schema-form-redesign` 브랜치에 모이고 그 브랜치가 우산 PR — 14라운드에 우산 브랜치는 `refactor/schema-form-internal-architecture`

- 결정:
  > 작업은 `feature/schema-form-redesign` 브랜치에 모이고, 이 브랜치가 여러 작업을 병합받는 우산 PR이 된다.
- 보충: 없음
- 상태: 대체됨(→ LANDING-051)
- 출처: `00-goals.md:128#4`(정본)
- 닫은 사람: 편집자 결정(14라운드, `08-design-a-to-z.md:551`)
- 라운드: 14
- 까닭: `08-design-a-to-z.md:551`

### LANDING-124 명령 RequestEmitChange·RequestInjection과 공개 훅의 거취 — 미확인

- 결정:
  > | 명령 어휘 | `RequestFocus`·`RequestSelect`·`RequestRefresh`·`RequestRemount`·`RequestEmitChange`·`RequestInjection` | 앞의 넷은 유지. 뒤의 둘은 **미확인** | 유지 + 미확인 | 동일 / `adr/0008:24-28` |
  > | 공개 훅 5종 | `useSchemaNodeTracker`·`useSchemaNodeSubscribe`·`useChildNodeComponentMap`·`useChildNodeErrors`·`useFormSubmit` | 언급 없음. `useSchemaNodeTracker`의 `useSyncExternalStore` 방식은 유지한다고만 적혀 있다 | **미확인** | `src/index.ts:78-84` / `adr/0008:26` |
  > **문서가 말하지 않는 것(미확인).** `Form` props 14개, `FormHandle` 8개, `NodeEventType` 17종의 개별 생사, `RequestEmitChange`/`RequestInjection`, `ValidationMode`, 공개 훅 5종, `oneOfIndex`/`anyOfIndices`의 대응물, `FormTypeInputProps.alias`, `placeholder`, `errorMessages`, `type: 'virtual'` 노드, `&` 계열의 root 폴백 우선순위, `default` 없는 키에 타입별 빈 값을 만들던 경로의 명시적 폐기.
- 보충: 없음
- 상태: 열림(→ `reviews/round-18-agenda.md:151` 11-20)
- 출처: `05-before-after.md:124,140,214`(정본)
- 닫은 사람: 편집자 결정(18라운드, 원장 토큰 검사가 찾은 미결, `reviews/round-18-agenda.md:151`)
- 라운드: 18(안건)
- 까닭: `reviews/round-18-agenda.md:151`

### LANDING-125 이주(S1) — 파서의 강제 변환이 빠지고, 바꾸지 못한 값은 `NaN` 대신 받은 그대로 든다

- 결정:
  > 확정(나). parse는 뜻이 그대로인 변환만 한다(ajv 규칙 수준). 오늘 파서의 문자 제거, 정수 자르기, 빈 값 치환(`""`, `[]`, `{}`), 불리언의 진릿값 변환은 parse에서 뺀다.
  > 바꾸지 못한 값은 받은 그대로 들고 `value`·방출·제출이 모두 그 값이다(비우기·대체·거부 없음). 노드는 정합 상태(경고등)를 들고, 이것이 공개 형의 판별자다(이름과 모양은 18라운드 §7).
- 보충:
  > 소유자(S1 이어서): "변경하지 못하는 값을 입력했을때, 이전에는 NaN 같은 값을 넣었는데요" (`reviews/round-18-owner-answers.md:8`)
  > "(2) 입력 구성 요소의 계약: 치다 만 글자는 입력이 들고, 빈 칸은 `undefined`, 비우기는 nullable이면 `null` 아니면 `undefined`를 보낸다. 기본 수 입력(빈 칸에 `valueAsNumber`의 `NaN`)과 기본 불리언 체크박스(`defaultChecked={defaultValue ?? undefined}`)를 고친다." (`reviews/round-18-agenda.md:80`)
  > "(4) nullable이 아닌 노드의 `null`(서버의 NULL)이 더는 방출에서 빠지지 않아 검증기 있는 폼의 제출을 막는 사용성 변화의 문서화." (`reviews/round-18-agenda.md:80`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:8-9`(정본. LANDING-120에서 분할), `reviews/round-18-agenda.md:80`, 같은 규칙의 원장 항목 WRITE-052·WRITE-054·WRITE-055
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; 뜻이 그대로인 변환만), 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째; 받은 그대로 든다, 경고등, `onError` 전달)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:8-9`

### LANDING-126 이주(S1) — 변환 실패 `onError` 기록의 level은 `warning`, 가칭 `VALUE_TYPE_MISMATCH`

- 결정:
  > `onError` 기록의 level은 `warning`이고(값을 보존하므로 폼의 약속은 지켜진다. error 층은 throw·거부·싱크로 드러나야 해 통보 3과 부딪힌다), 가칭 `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH`를 노드의 정합 상태가 켜질 때마다 한 번 보낸다(path, 기대 형, 받은 값의 종류, 쓰기 출처).
- 보충:
  > 열린 부분(level `warning`만. 가칭 코드와 보내는 때는 같은 문장이라 함께 둔다): "변환하지 못한 입력의 `onError` 기록 level을 편집자가 `'warning'`으로 정해도 되는가, `'error'`인가." (`reviews/round-18-agenda.md:165`)
  > 소유자(12-7 답): "형변환 실패로 문제가 생기는 경우에 대한 대응은 FormType 이 하기로 했잖아. 그래서 개발단계에서는 중요한데, 리얼부터는 어쩔 수 없다고 생각하긴 해. warning 이면 되지않을까?" (`reviews/round-18-owner-answers.md:17`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:9`(정본, S1 셋째의 반영 칸. 표 행이라 조각 번호로 나눌 수 없다. LANDING-120에서 분할), `reviews/round-18-owner-answers.md:17`, 같은 규칙의 원장 항목 ERROR-186
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; 경고의 level·가칭 코드·보내는 때), 소유자 답(`reviews/round-18-owner-answers.md:17` 12-7; level `warning`)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:17`, `reviews/round-18-owner-answers.md:8-9`

### LANDING-127 이주(S1) — 변환 실패 기록은 검증기 유무와 무관하게 보낸다

- 결정:
  > 검증기가 있든 없든 보낸다(core의 parse가 찾는 것이라 검증 결과가 아니다).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:9`(정본, S1 셋째의 반영 칸. 표 행이라 조각 번호로 나눌 수 없다. LANDING-120에서 분할), 같은 규칙의 원장 항목 ERROR-187
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; 보내는 때)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:8-9`
