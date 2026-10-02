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
| LANDING-022 | 이주 19 — 루트 `onChange` 디바운스 대신 최외곽 동기 진입당 1회 | 현행 | 소유자 답(`reviews/round-4.md:116` D-10), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-84) |
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
| LANDING-041 | 이주 38 — 로드 뒤 검증은 `OnChange` 비트일 때만 한 번 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:71` §2.6의 아홉째), 17라운드 스웜 수렴(편집자 결정, core만 쓰는 호스트의 마운트 검증), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-101) |
| LANDING-042 | 이주 39 — 호출자의 전체 교체 `setValue(V)`는 reset과 같은 입력 판정 | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:71` §2.6의 열넷째), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94) |
| LANDING-043 | 이주 40 — 공개 `node.group`은 `node.strategy` | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름) |
| LANDING-044 | 이주 41 — Form 속성 `onError` 신설, 오류·경고 코드 목록이 공개 계약 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 17라운드 스웜 수렴(편집자 결정, 안 B) |
| LANDING-045 | 이주 42 — `diagnostics`는 `'stable'`·`'degraded'`, 다음 로드까지 남고 그 동안 제출 거부 | 현행 | 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드, `exceededBudget`을 정착 예산 셋으로), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-01·18C-21; `recursion`·`writeShape` 값 추가) |
| LANDING-046 | 이주 43 — 바운더리는 가두고 대체 화면을 그린 뒤 다시 던지지 않고 보고 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 소유자 답(`reviews/round-17-owner-answers.md:34` (나)) |
| LANDING-047 | 이주 44 — `trim`은 포커스 아웃 때 `finishInput` 칸이 자르고 입력 출처 쓰기로 다룸 | 대체됨(→ LANDING-145) | 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:43` 9 입력 마침 칸), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-19) |
| LANDING-048 | 이주 45 — `isTerminalNode`는 `node.strategy`로 판정하고 형 좁히기를 바로잡음 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 17라운드 스웜 수렴(편집자 결정, 노드 구조), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-38·18C-89; `UnionNode` 포함, 가상 제외) |
| LANDING-049 | 이주 46 — 노드 메서드 `findAll`은 `findNodes` | 현행 | 17라운드 스웜 수렴(편집자 결정, 노드 구조) |
| LANDING-050 | 이주 47 — 행이 없는 조합(잎 `terminal: false`, 가상 `terminal: true`, 인라인 입력)의 처리와 이주 | 대체됨(→ LANDING-149) | 편집자 결정(17라운드, 18라운드 안건 N14로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-38) |
| LANDING-051 | 배포는 한 번, 개발은 우산 브랜치 안의 PR 아홉으로 나눔 | 현행 | 소유자 답(`00-goals.md:110` C7), 편집자 결정(14라운드, `08-design-a-to-z.md:551`) |
| LANDING-052 | 전환 방식 — 옛 코드는 레거시로 옮기고 새로 쓰며 옛 이름과의 중복은 기준이 아님 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:52` 전환 방식) |
| LANDING-053 | 새 엔진은 전환 PR 전까지 `<Form>`에 닿지 않고 점진 교체는 하지 않음 | 현행 | 편집자 결정(17라운드, `08-design-a-to-z.md:552` antigravity 검토와 같은 판단) |
| LANDING-054 | 레거시 디렉토리의 이름과 자리, 그 동안 기존 시험과 스토리북을 돌리는 방법 | 대체됨(→ LANDING-159) | 편집자 결정(17라운드, 18라운드 안건 §8로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49) |
| LANDING-055 | 문서가 코드보다 먼저 바뀜 — 각 PR은 새 fractal의 INTENT·DETAIL로 시작, 이름은 책임으로 | 현행 | 원리(filid 규칙, 저장소 `.claude/rules/filid_code-placement.md` §5), 소유자 답(`reviews/round-17-owner-answers.md:26` `tree`의 이름, 책임별로 나눔) |
| LANDING-056 | 새 core의 자리와 이름 — `blueprint`·`record`·`behaviors`·`navigation`·`settle`·`dispatch`·`validation`·`SchemaNode`와 행의 칸 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:21` 종류별 동작 표의 이름), 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:26` `tree`의 이름), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸), 소유자 답(`reviews/round-17-owner-answers.md:42-46` 4·9·10·12·15·14), 소유자 답(`reviews/round-17-owner-answers.md:53` `Node` 이름 규칙) |
| LANDING-057 | 겉면 규칙과 behaviors 규칙 | 현행 | 17라운드 스웜 수렴(편집자 결정, 노드 구조 스웜 정련; `reviews/round-17-owner-answers.md:25` 반영 칸) |
| LANDING-058 | 원샷이어야 하는 것은 전환 PR(PR-7)과 `master` 병합 둘뿐 | 현행 | 편집자 결정(14라운드, `08-design-a-to-z.md:562`), 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4) |
| LANDING-059 | 릴리스는 `master` 병합 뒤의 배포이며 판 올림 PR 병합이 시험 관문을 거쳐 자동 배포 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2의 일곱째) |
| LANDING-060 | PR-0 문서 — 이 문서·기록·HANDOFF·프로토타입 v7·시나리오 패키지 뼈대 | 현행 | 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:570`), 소유자 답(`reviews/round-16-owner-answers.md:14` 8 시나리오 모듈은 비공개 패키지), 편집자 결정(17라운드, 18라운드 정련을 착수 조건에 더함), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49), 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4), 소유자 답(`reviews/round-18-owner-answers.md:45` 개발계획 1-가), 소유자 답(`reviews/round-18-owner-answers.md:16` 12-6) |
| LANDING-061 | PR-1 청사진 — 조각 표·노드 공유·병합 함수·잎 교차 함수 이동·식 컴파일러 이동·청사진 오류의 데이터화 | 현행 | 편집자 결정(16라운드, 답 10으로 확정 `reviews/round-16-owner-answers.md:16`), 소유자 답(`reviews/round-14-owner-answers.md:17` O-11 `merge` 선택 인자), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 17라운드 스웜 수렴(편집자 결정, 터미널 전략·병합의 원자·데이터화), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02·18C-08·18C-49), 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-14; 정적 `injectTo` 오류 없음) |
| LANDING-062 | PR-2 노드 트리와 정착 — 단일 클래스 `SchemaNode`와 동작 행, 정착 루프, 예산 다섯과 원본 B, `diagnostics` | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 편집자 결정(16라운드 정착 검토 조건 5, `09-landing-and-test-strategy.md:23`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-25; 예산·배열 기록의 PR 배분) |
| LANDING-063 | PR-3 파생 — `controls.derived`·`injectTo`·`unsetValue`, 같은 대상 규칙, 에지 소비 | 현행 | 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:573`), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기), 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4) |
| LANDING-064 | PR-4 통지와 검증 — 디스패처·`batch`·진입 사슬·`onError`의 core 쪽·`compileGuard`·배달 경로 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:9` 3 배달 경로), 소유자 답(`reviews/round-16-owner-answers.md:16` 10 가드 캐시와 등록의 소유), 16라운드 스웜 수렴(편집자 결정, 재생성 reset의 같은 `$id`), 17라운드 스웜 수렴(편집자 결정, `onError` core 쪽과 가드 컴파일), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1) |
| LANDING-065 | PR-5 배열 — 배열·터미널 배열 행, 아이템 호스트, 통째 교체의 identity | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:575`), 편집자 결정(18라운드, SURFACE-005; 배열 쓰기는 다섯) |
| LANDING-066 | PR-6 상태 키와 제어 — 결합(OR/AND)·`controls.children`·조각 `controls`·`unsetOnInactive`의 정책 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 17라운드 스웜 수렴(편집자 결정, 터미널 전략은 선언 사이 정적), 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4), 편집자 결정(18라운드, LANDING-092; 하위 트리 규칙은 PR-2) |
| LANDING-067 | PR-7 전환 — `nodeFromJSONSchema` 재구축, React 바인딩 연결, Form 속성, 바운더리, 옛 코드 삭제, UI 플러그인 이주 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 소유자 답(`reviews/round-17-owner-answers.md:34` (나)), 소유자 답(`reviews/round-16-owner-answers.md:11,13` 5·7), 16라운드 스웜 수렴(편집자 결정, reset·로드·`setValue(V)`), 17라운드 스웜 수렴(편집자 결정, 바운더리·마운트 계약), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94), 소유자 답(`reviews/round-18-owner-answers.md:43` 개발계획 P2), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1) |
| LANDING-068 | PR-8 릴리스 — README·docs, ADR 0010 최종, 이주 안내와 프롬프트, changeset과 `CHANGELOG.md`, 릴리스 테스트 | 현행 | 소유자 답(`00-goals.md:111` C8), 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 소유자 답(`reviews/round-16-owner-answers.md:22` PR-8의 판 번호), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2), 소유자 답(`reviews/round-18-owner-answers.md:43` 개발계획 P2), 편집자 결정(18라운드, TEST-045; `CHANGELOG.md`는 action이 만듦) |
| LANDING-069 | 교체 규모 — 교체 대상, 그대로 쓰는 것, 옮기는 것, 테스트 234파일의 처분 | 현행 | 편집자 결정(16라운드 정착 검토 조건 2, `09-landing-and-test-strategy.md:20`), 소유자 답(`reviews/round-17-owner-answers.md:45` 12·15 생성 함수), 소유자 답(`reviews/round-16-owner-answers.md:13` 7) |
| LANDING-070 | 형제 패키지 — ajv 셋의 동기 `compileGuard`, UI 플러그인 27파일의 `presentation.*` 이주, `@winglet/react-utils` 선택 인자 | 현행 | 편집자 결정(16라운드 정착 검토 조건 1·6, `09-landing-and-test-strategy.md:19,24`), 소유자 답(`reviews/round-17-owner-answers.md:34` (나)), 17라운드 스웜 수렴(편집자 결정) |
| LANDING-071 | 위험이 모이는 곳은 PR-7 — 완화는 엔진 수준 통합 시나리오와 차등 테스트 | 현행 | 편집자 결정(14라운드, `08-design-a-to-z.md:600`) |
| LANDING-072 | PR-7을 더 쪼갤 수 없는 이유 | 현행 | 편집자 결정(14라운드, `08-design-a-to-z.md:601`) |
| LANDING-073 | 정착 조건 1 — 가드 계약 `compileGuard(root, pointer)`, ajv 셋의 동기 경로, 코어의 작성 루트 기준 캐시 | 현행 | 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-16-owner-answers.md:16` 10) |
| LANDING-074 | 정착 조건 2 — 재사용 두 문장을 사실대로: 잎 교차 함수만 재사용, 식 컴파일러는 청사진으로 통째 이동 | 현행 | 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-16-owner-answers.md:16` 10), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-08; 레거시 `const` 깊은 비교) |
| LANDING-075 | 정착 조건 3 — 바인딩 계약 넷(다섯째는 편집자가 더함) | 현행 | 17라운드 스웜 수렴(편집자 결정, 첫째·넷째), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4, 다시 던지지 않음), 편집자 결정(16라운드, 다섯째) |
| LANDING-076 | 정착 조건 4 — 상태·오류·명령 사건과 검증 결과의 배달 경로 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:9` 3) |
| LANDING-077 | 정착 조건 5 — 되돌림 기록에 `extras`와 배열 구조 | 현행 | 편집자 결정(16라운드 정착 검토) |
| LANDING-078 | 정착 조건 6 — UI 플러그인 규모와 `options` 닫힌 목록의 충돌은 PR-7의 `presentation.*` 이주로 | 현행 | 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1) |
| LANDING-079 | 정착 조건 7 — 공개 노드 타입·가드는 단일 클래스 겉면과 판별 인터페이스로 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 17라운드 스웜 수렴(편집자 결정, 노드 구조 수렴) |
| LANDING-080 | 정착 조건 8 — 훅·바인딩 시험과 React 18 실행 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:11` 5), 편집자 결정(16라운드 정착 검토) |
| LANDING-081 | 정착 지도 PR-1 — 부딪히는 코드, 그대로 쓰는 것, 새 fractal `src/core/blueprint/` | 현행 | 편집자 결정(16라운드 정착 검토), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-08; 잎 교차 함수의 뜻 변경) |
| LANDING-082 | 정착 지도 PR-2 — 부딪히는 코드, 그대로 쓰는 것과 옮길 자리, 새 fractal 다섯 | 현행 | 편집자 결정(16라운드 정착 검토), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 소유자 답(`reviews/round-18-owner-answers.md:7` S1; 파서를 가져온다), 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; 뜻이 그대로인 변환만), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49·18C-36), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-01·18C-33·18C-93; 형 판정·탐색 멤버 대체) |
| LANDING-083 | 정착 지도 PR-3 — 부딪히는 코드, `createDynamicFunction`의 의존 주입 형태, `settle/derive/` | 현행 | 편집자 결정(16라운드 정착 검토) |
| LANDING-084 | 정착 지도 PR-4 — `EventCascadeManager`·`ValidationManager` 교체, `dispatch/`·`validation/`, 진입 사슬의 소유 | 현행 | 편집자 결정(16라운드 정착 검토), 17라운드 스웜 수렴(편집자 결정, 진입 사슬은 `dispatch`가 소유) |
| LANDING-085 | 정착 지도 PR-5 — `ArrayNode` 전략·비동기 `push` 교체, `arrayBehavior/` | 현행 | 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈) |
| LANDING-086 | 정착 지도 PR-6 — 루트 스키마 전역 상속·`checkComputedOptionFactory` 교체, `settle/`의 계산 끝 | 현행 | 편집자 결정(16라운드 정착 검토) |
| LANDING-087 | 정착 지도 PR-7 — 렌더 계층 교체, 그대로 쓰는 것, `core/index.ts` 수출의 전환 | 현행 | 편집자 결정(16라운드 정착 검토), 17라운드 스웜 수렴(편집자 결정, `core/index.ts`의 진입점과 `core/types` 정리), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1) |
| LANDING-088 | `core/INTENT.md`의 상속 문장은 PR-1에서 먼저 고침 | 현행 | 편집자 결정(16라운드 정착 검토), 원리(filid 규칙, 문서가 코드보다 먼저) |
| LANDING-089 | 정착 지도의 '그대로 쓰는 것'은 레거시에서 가져오는 코드의 목록 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:52` 전환 방식), 편집자 결정(17라운드, `09-landing-and-test-strategy.md:42`) |
| LANDING-090 | 보정 PR-0 — 시나리오 형과 러너 뼈대, vitest 셋, addon-vitest, 옛 스토리 처분 목록, 비공개 시나리오 패키지 | 현행 | 편집자 결정(16라운드, 테스트 전략), 소유자 답(`reviews/round-16-owner-answers.md:14` 8), 소유자 답(`reviews/round-16-owner-answers.md:10` 4) |
| LANDING-091 | 보정 PR-1 — 식 컴파일러 통째 이동, 잎 교차 함수 이동, `core/INTENT.md` 개정, `merge` 선택 인자와 changeset | 현행 | 편집자 결정(16라운드, 답 10으로 확정 `reviews/round-16-owner-answers.md:16`), 소유자 답(`reviews/round-14-owner-answers.md:17` O-11), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-08; 레거시 `const` 깊은 비교) |
| LANDING-092 | 보정 PR-2 — 되돌림 기록 항목 확정, 노드 구조, `active` 게터, 나감 비움의 하위 트리 규칙 | 현행 | 편집자 결정(16라운드 정착 검토 조건 5), 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02; PR-2에 `union` 행) |
| LANDING-093 | 보정 PR-4 — ajv 셋의 동기 `compileGuard`, 사본·가드 캐시, 재생성 reset의 같은 `$id`, `onError`의 core 쪽 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:16` 10), 16라운드 스웜 수렴(편집자 결정, 재생성 reset의 같은 `$id`), 17라운드 스웜 수렴(편집자 결정, `onError` core 쪽), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-30·18C-74), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1) |
| LANDING-094 | 보정 PR-5 — 배열·터미널 배열 행, `resolveArrayLimits`의 청사진 이동 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 편집자 결정(16라운드 정착 검토) |
| LANDING-095 | 보정 PR-7 — 바인딩 계약 다섯, `onError` 렌더 계층, `finishInput`, e2e·스토리·스파이크 이식, `reset`의 로드 전환 | 현행 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 소유자 답(`reviews/round-16-owner-answers.md:10,11` 4·5), 16라운드 스웜 수렴(편집자 결정, reset·로드), 17라운드 스웜 수렴(편집자 결정, 바인딩 계약 첫째·넷째), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1) |
| LANDING-096 | 보정 PR-8 — 릴리스 전 벤치 재실행, changeset과 판 번호, 릴리스 테스트, reset 규칙 문서, 스토리북 문서 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:22` PR-8의 판 번호), 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2), 소유자 답(`reviews/round-18-owner-answers.md:43` 개발계획 P2) |
| LANDING-097 | 릴리스 전환(별도 PR) — changesets 가동과 CI·배포 작업 흐름 정리, PR-8 전에 병합 | 현행 | 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2) |
| LANDING-098 | 05의 이주 행 가운데 08 §14에 행이 없는 것 — `ENHANCED_KEY`, `minItems`·`maxItems`, `Normalize`, `null`→`{}`, 배열 Promise, `setValue(getValue())`, `useEffect` 파생 쓰기 | 분할됨(→ LANDING-115, LANDING-116, LANDING-117, LANDING-118, LANDING-119) | 편집자 결정(6라운드 대조, `05-before-after.md:5`) |
| LANDING-099 | 대체됨 — 폼이 분기를 고르던 05의 행(값 가드·선택 가드·`selection` 칸·분기 하나만 활성) | 대체됨(→ LANDING-004, LANDING-005, LANDING-006, LANDING-028) | 편집자 결정(9라운드 세 도출 일치, `07-conclusions.md:142` 4.25), 소유자 답(`reviews/round-9-spec.md:42,44` 읽기1) |
| LANDING-100 | 대체됨 — `options.trim` 강제 변환은 사라지고 입력 컴포넌트가 맡음 | 대체됨(→ LANDING-047, LANDING-034) | 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3) |
| LANDING-101 | 대체됨 — React 컴포넌트 감지 대신 "있고 `null`이 아니다"만 봄 | 대체됨(→ LANDING-061, LANDING-082) | 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1) |
| LANDING-102 | 대체됨 — 분석 단계의 정적 throw 대신 런타임 충돌 보고 | 대체됨(→ ERROR-078, LANDING-061) | 소유자 답(`reviews/round-14-owner-answers.md:16` O-10), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| LANDING-103 | 대체됨 — 쓰기 옵션은 옵션 객체(`{ mode: 'Merge' }`) | 대체됨(→ LANDING-021) | 편집자 결정(9라운드 이름, `07-conclusions.md:345` N1; 비트마스크는 8라운드 소유자 지시, `HANDOFF.md` 8라운드 행) |
| LANDING-104 | 대체됨 — 정착 상태 `settle`과 예산 | 대체됨(→ LANDING-045) | 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) |
| LANDING-105 | 대체됨 — strict 검증기용 `&` 키 제거 유틸리티 | 대체됨(→ LANDING-031, LANDING-033) | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:13` 5) |
| LANDING-106 | `refresh(path)`·`remount(path)` 공개 — C-11 확정 대기 | 대체됨(→ EVENT-063) | 편집자 결정(17라운드, 18라운드 안건 §7로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-42) |
| LANDING-107 | 대체됨 — 진단 채널 후보(단일 콜백) | 대체됨(→ LANDING-044, LANDING-045) | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 17라운드 스웜 수렴(편집자 결정, 안 B) |
| LANDING-108 | 대체됨 — `normalizedValue`·`enhancedValue`·`&pristine`·`PublicSetValueOption`의 이름과 거취 미결(D-23) | 대체됨(→ LANDING-023, LANDING-008) | 편집자 결정(8라운드 이름 N3, `06-conclusions.md:356,358`), 편집자 결정(9라운드 이름, `07-conclusions.md:316` 소유자 동의 기록) |
| LANDING-109 | 06 §9의 5 이주 안내 항목(C8) — 8라운드가 새로 올린 것 | 현행(기록) | 소유자 답(`00-goals.md:111` C8; 이주 안내를 낸다), 편집자 결정(8라운드, `06-conclusions.md:429`; 목록), 소유자 답(`reviews/round-10-owner-answers.md:20` D-7; 5.3의 (C)), 소유자 답(`reviews/round-24-owner-answers.md:7` PR #348 검토; 현행(기록)으로 내린 것에 동의) |
| LANDING-110 | 07 §9의 6 이주 안내 항목(C8) — 9라운드가 더한 것 | 현행(기록) | 편집자 결정(9라운드, `07-conclusions.md:423`) |
| LANDING-111 | 대체됨 — `&if`를 `&active`로 옮길 때 `./x`를 `../x`로 고친다 | 대체됨(→ LANDING-029) | 소유자 답(`reviews/round-15-decisions.md:9` 1) |
| LANDING-112 | 대체됨 — 코드 착수 전에 할 일 넷(9라운드 개발 진입 평가) | 대체됨(→ LANDING-060) | 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:570` 착수 전 닫을 것) |
| LANDING-113 | 대체됨 — 구현 슬라이스 0–8(두 검토의 순서를 합침) | 대체됨(→ LANDING-060, LANDING-061, LANDING-062, LANDING-063, LANDING-064, LANDING-065, LANDING-066, LANDING-067, LANDING-068) | 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:568-578`) |
| LANDING-114 | 대체됨 — 9라운드의 규모 추정(교차 연산을 청사진 병합으로 옮겨 재사용) | 대체됨(→ LANDING-069, LANDING-074) | 편집자 결정(16라운드 정착 검토 조건 2, `09-landing-and-test-strategy.md:20`) |
| LANDING-115 | 이주(05) — `ENHANCED_KEY` 마커 주입이 사라지고 활성 조각 기반 `schemaPath` 필터로 | 중복(→ VALIDATE-010) | 원리(`03-mental-model.md:13` P1) |
| LANDING-116 | 이주(05) — `minItems` 채움·`maxItems` 차단은 입력 컴포넌트로, `Normalize` 키 제거와 `null`→`{}`는 폐기 | 중복(→ WRITE-022) | 소유자 답(`reviews/round-2.md:119` 새 원칙; 배열 행), 편집자 결정(5라운드, ADR 0013 4차 본문 `adr/0013-core-does-not-rewrite-values.md:12`; F27·E16) |
| LANDING-117 | 이주(05) — 배열 연산은 Promise를 돌려주지 않는 동기 API | 중복(→ EVENT-002) | 편집자 결정(4라운드, 실행 검증을 통과한 제안, `adr/0008-event-system.md:3`·`reviews/round-4.md:77`) |
| LANDING-118 | 이주(05) — `setValue(getValue())`는 전체 교체라 지운 키에 채움이 다시 들어감 | 대체됨(→ WRITE-090) | 소유자 답(`reviews/round-4.md:113` D-7), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-103) |
| LANDING-119 | 이주(05) — `useEffect`로 쓴 파생 값은 새 진입이라 키 입력당 `onChange` 2회 | 중복(→ EVENT-036) | 편집자 결정(5라운드 도출 C-10, `reviews/round-5-derivations.md:25`) |
| LANDING-120 | 이주(S1) — 파서의 강제 변환이 빠지고, 바꾸지 못한 값은 `NaN` 대신 받은 그대로 들며, 경고 `VALUE_TYPE_MISMATCH`가 생김 | 분할됨(→ LANDING-125, LANDING-126, LANDING-127) | 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; 뜻이 그대로인 변환만), 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째; 받은 그대로 든다, 경고등, `onError` 전달), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; 경고의 level·가칭 코드·보내는 때) |
| LANDING-121 | PR-8의 reset 문서가 적는 것 — 같은 스키마의 판정, prop을 읽는 때, 노드 참조가 이어지는 조건, 늦은 쓰기, `dirty` | 현행 | 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:79`), 소유자 답(`00-goals.md:109` C6; `dirty` 현행 유지) |
| LANDING-122 | 정착 검토의 그 밖의 판단 — `extras` 정적 규칙은 조각 표 걸음에서, 유효 스키마 메모는 비트 집합 키(추정) | 현행 | 편집자 결정(16라운드 정착 검토, `09-landing-and-test-strategy.md:3`) |
| LANDING-123 | 대체됨: 작업은 `feature/schema-form-redesign` 브랜치에 모이고 그 브랜치가 우산 PR — 14라운드에 우산 브랜치는 `refactor/schema-form-internal-architecture` | 대체됨(→ LANDING-051) | 편집자 결정(14라운드, `08-design-a-to-z.md:551`) |
| LANDING-124 | 명령 RequestEmitChange·RequestInjection과 공개 훅의 거취 — 미확인 | 현행(기록) | 편집자 결정(18라운드, 원장 토큰 검사가 찾은 미결, `reviews/round-18-agenda.md:151`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-86; 명령 둘과 훅 셋에 한정), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-87; 나머지 공개 표면과 타입별 빈 값) |
| LANDING-125 | 이주(S1) — 파서의 강제 변환이 빠지고, 바꾸지 못한 값은 `NaN` 대신 받은 그대로 든다 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; 뜻이 그대로인 변환만), 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째; 받은 그대로 든다, 경고등, `onError` 전달), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-126 | 이주(S1) — 변환 실패 `onError` 기록의 level은 `warning`, 가칭 `VALUE_TYPE_MISMATCH` | 현행 | 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; 경고의 level·가칭 코드·보내는 때), 소유자 답(`reviews/round-18-owner-answers.md:17` 12-7; level `warning`), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4) |
| LANDING-127 | 이주(S1) — 변환 실패 기록은 검증기 유무와 무관하게 보낸다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; 보내는 때) |
| LANDING-128 | 이주(18라운드) — 재귀 객체 스키마의 실패가 명시적 청사진 오류 `RECURSIVE_SHAPE_UNBOUNDED`(가칭)로 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-01) |
| LANDING-129 | 이주(18라운드) — 원시 타입 둘 이상의 `type` 배열이 `union` 잎과 문자열 입력으로 선다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-130 | 이주(18라운드) — `['integer','number']`는 수 노드 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-131 | 이주(18라운드) — `dependentSchemas`·`dependencies`를 쓴 스키마에 개발 모드 경고 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-03) |
| LANDING-132 | 이주(18라운드) — 조건부 `required`의 필수 표시가 켜진 `then`을 따른다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-06) |
| LANDING-133 | 이주(18라운드) — 같은 값인 객체·배열 `const`끼리의 `allOf`가 통과한다(결함 수정) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-08) |
| LANDING-134 | 이주(18라운드) — 여러 `pattern`의 `node.jsonSchema` 표현이 첫 패턴 + `allOf` 항목으로 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-08) |
| LANDING-135 | 이주(18라운드) — 식의 `*` 조각은 청사진 오류 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-13) |
| LANDING-136 | 이주(18라운드) — `omitEmpty` 아래에서 `../name === ''` 같은 식은 `undefined`를 본다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-13) |
| LANDING-137 | 이주(18라운드) — `watchValues`도 `omitEmpty` 아래에서 빈 문자열을 `undefined`로 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-13) |
| LANDING-138 | 이주(18라운드) — `injectTo` 반환의 `undefined` 항목은 쓰지 않는다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-14) |
| LANDING-139 | 이주(18라운드) — 입력이나 `Merge`로 된 `null` 아래의 자식은 채움 없이 없음 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16) |
| LANDING-140 | 이주(18라운드) — 입력이 넘긴 `Merge`는 자기 입력을 다시 마운트하지 않는다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16) |
| LANDING-141 | 이주(18라운드) — `Overwrite`와 `Merge`를 함께 주면 `INVALID_WRITE_OPTION` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16) |
| LANDING-142 | 이주(18라운드) — `setValue(undefined)`는 기본값을 다시 채운다 | 대체됨(→ WRITE-090) | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-17), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체) |
| LANDING-143 | 이주(18라운드) — 입력의 `onChange(undefined, Overwrite)`는 기본값을 다시 채운다, 스토리 넷 고침 | 대체됨(→ WRITE-090) | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-17), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체) |
| LANDING-144 | 이주(18라운드) — 로드나 부모가 준 `{}`가 호스트 `default`를 막지 않는다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-18) |
| LANDING-145 | 이주 44(18라운드 판) — `trim`은 `finishInput` 칸의 자동 쓰기, 바깥 오류·dirty는 그대로, 같은 값이면 쓰지 않음, 흐림 때 다시 마운트 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-19) |
| LANDING-146 | 이주(18라운드) — `batch(fn)` 안의 updater는 이어지고 평범한 읽기는 직전 커밋 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-20) |
| LANDING-147 | 이주(18라운드) — 가상 노드의 모양이 틀린 쓰기는 `SchemaFormError`로, 같은 길이 문자열 쪼개기는 거부로 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-21) |
| LANDING-148 | 이주(18라운드) — `find`는 꺼진 `oneOf` 변형의 노드를 돌려주지 않는다(`null`) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-33) |
| LANDING-149 | 이주 47(18라운드 판) — 잎 `terminal: false`·가상 `terminal: true`는 청사진 오류, 가상의 인라인 입력은 `branch`로 `ChildNodeComponents`를 받음 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-38) |
| LANDING-150 | 착수 항목(18라운드) — parse 문서는 새 자리의 문서로 PR-2, `src/types/formTypeInput.ts:60-65`의 문서 주석은 PR-7 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40) |
| LANDING-151 | 착수 항목(18라운드) — 자사 플러그인 수정 목록은 PR-7 이주 항목 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1) |
| LANDING-152 | 이주(18라운드) — `globalState`의 키는 참인 노드가 없으면 내려간다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-41) |
| LANDING-153 | 이주(18라운드) — `globalState`의 값은 `true` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-41) |
| LANDING-154 | 이주(18라운드) — 노드의 `key`·`schemaPath`가 없어진다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-43) |
| LANDING-155 | 이주(18라운드) — `defaultValue`는 로드를 따르고 배열 아이템은 구조 연산을 따라 자기 값을 지킨다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-44) |
| LANDING-156 | 이주(18라운드) — `find('@')`·`findAll('@')`는 맥락 노드를 돌려주지 않는다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-45) |
| LANDING-157 | 이주(18라운드) — `NodeState` → `SchemaNodeState` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-47) |
| LANDING-158 | 이주(18라운드) — `NodeEventType` → `SchemaNodeEventType` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-47) |
| LANDING-159 | 레거시는 `src/__legacy__/` — 상대 경로 유지, PR마다 옮김, 새 fractal의 가져오기 금지, PR-7 통째 삭제, 시험 글롭 포함, filid 깊이 점검, 스토리북·벤치 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49), 소유자 답(`reviews/round-18-owner-answers.md:43` 개발계획 P2), 편집자 결정(18라운드, 개발계획 07; 레거시 시험은 PR-7 뒤 글롭에서 뺌) |
| LANDING-160 | 이주(18라운드) — 수 노드의 근사 같음 비교가 정확한 비교로 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50) |
| LANDING-161 | 이주(18라운드) — 객체 같음 비교가 키 순서를 본다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50) |
| LANDING-162 | 이주(18라운드) — 내장 객체·클래스 인스턴스는 참조로 비교 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50) |
| LANDING-163 | 이주(18라운드) — `derived`는 자기 의존 집합에서만 발화 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50) |
| LANDING-164 | 이주(18라운드) — 배열 통째 쓰기가 아이템 키를 잇는다(상태가 위치를 따라감) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59) |
| LANDING-165 | 이주(18라운드) — 닫힌 튜플 뒤의 값이 방출된다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59) |
| LANDING-166 | 이주(18라운드) — 사용자가 일으킨 `injectTo`가 null 조상을 객체로 만들지 않는다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-65) |
| LANDING-167 | 이주(18라운드) — 인라인 입력을 둔 가상 노드 아래 경로의 `find`가 참조된 노드를 돌려준다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-68) |
| LANDING-168 | 이주(18라운드) — Form 속성의 잠금 동안 입력의 `onChange`는 버려진다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-71) |
| LANDING-169 | 이주(18라운드) — 루트 수준 검증 오류의 `dataPath`가 `'/'`에서 `''`로 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-74) |
| LANDING-170 | 명령 `RequestEmitChange`·`RequestInjection`은 새 설계에 없음(이주 행 없음), 공개 훅 셋 `useChildNodeComponentMap`·`useChildNodeErrors`·`useFormSubmit`은 이름·시그니처 유지, `useChildNodeErrors`는 PR-7에 새 통지로 다시 구현 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-86), 소유자 답(`reviews/round-18-owner-answers.md:27` 18C 검토 5번; 제거 확인), 소유자 답(`reviews/round-18-owner-answers.md:40` 설계서 메모 3) |
| LANDING-171 | 이주(18라운드) — 빈 중첩 객체·배열 노드의 `outputValue`는 `omitEmpty` 아래에서 `undefined`(오늘 `normalizedValue`는 `{}`·`[]`) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-87) |
| LANDING-172 | 이주(18라운드) — `['object','string']`·`['object','array']`·`['array','string']`은 터미널 강제 `union`(안쪽 `find` 없음, `{}`·`[]` 방출은 `omitEmpty: false`) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-173 | 이주(18라운드) — `type` 배열과 함께 적힌 `nullable:true`는 nullable(오늘 배열 경로가 보지 않음) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-174 | 이주(18라운드) — 형 없는 원시 `anyOf`·`oneOf`(TypeBox·pydantic·zod)는 `union`·원시 잎 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-175 | 이주(18라운드) — 형 없는 칸의 분기가 모두 null 분기이면 nullable null 노드 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-176 | 이주(18라운드) — 형 없는 `{allOf:[{type:'string'}]}`는 string 노드 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-177 | 이주(18라운드) — `['null','null']`은 `UNKNOWN_JSON_SCHEMA`(오늘 nullable null 노드) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-178 | 이주(18라운드) — nullable 기반에 붙은 형 없는 `allOf` 항목 `{nullable:false}`는 효과 없음 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-179 | 이주(18라운드) — `{type:['string','null'], allOf:[{type:['number','null']}]}`는 nullable null 노드(오늘 `ALL_OF_TYPE_REDEFINITION`) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-180 | 이주(18라운드) — `{type:'number', allOf:[{type:['number','string']}]}`는 교집합인 number 노드(오늘 `ALL_OF_TYPE_REDEFINITION`) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-181 | 이주(18라운드) — `Hint.type`·`FormTypeInputProps.type`은 `node.type`(정수 노드는 `'number'`), 새 칸 `schemaType` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-182 | 이주(18라운드) — `{type:['number','integer']}` 시험은 `{type:'number'}`, 정수만이면 `{schemaType:'integer'}` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-183 | 이주(18라운드) — 함수 시험의 `type === 'integer'` 절은 죽은 조건이라 지움 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-184 | 이주(18라운드) — mui 수 입력 — 빈 칸 `undefined`, 정수 판정 `schemaType === 'integer'`, 자르지 않음, 해석할 수 없는 글은 초안 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-185 | 이주(18라운드) — `FormTypeTestObject`의 `type`은 `SchemaNodeType`이나 그 배열, 새 키 `schemaType` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-186 | 이주(18라운드) — 시험 객체의 모르는 키는 대조에서 빼고 개발 모드 경고(오늘 `{typo: undefined}`가 우연히 맞음) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-187 | 이주(18라운드) — 코어 기본 입력 정의는 `{type:'union'}` 감싸개를 더해 열한 개 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-188 | 이주(18라운드) — 가드 `isTerminalNode`·`isBranchNode`는 `strategy`를 보고 반환 형에 `UnionNode`가 더해짐 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-189 | 이주(18라운드) — `InferValueType`의 `as const` `type` 배열은 `any`에서 정확한 합 형으로 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-190 | 이주(18라운드) — 합 형에 대한 `InferJSONSchema`는 분배되지 않고 `UnionSchema`·`UnionNode` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-191 | 이주(18라운드) — `SchemaNode` 합집합과 `FormTypeRendererProps.type`에 `UnionNode`·`'union'`(망라 `switch`에 `case 'union'`) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-192 | 이주(18라운드) — 값을 바꾸는 옵션을 켠 ajv 인스턴스의 `bind`는 `VALIDATOR_BIND_REFUSED`(가칭)를 던짐 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-193 | 이주(18라운드) — 검증기에 넘기는 스키마 사본은 깊은 사본 한 번(오늘 얕음) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-194 | 이주(18라운드) — ajv8에서 union `type`의 `strictTypes` 로그 경고가 없어짐(`allowUnionTypes`) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-195 | 이주(18라운드) — 터미널 아래 경로의 검증 에러는 터미널(union) 노드가 받음(오늘 버려짐) | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-196 | 이주(18라운드) — 기본 입력의 빈 칸은 `undefined`, 해석할 수 없는 초안은 흐려질 때 되돌림 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-197 | 이주(18라운드) — 터미널 object·array 값 안의 JSON 부정합에 개발 모드 경고 (가칭) `NON_JSON_WHOLE_VALUE` | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93) |
| LANDING-198 | union 설계의 이주 점검 — PR-7 이주 목록에 LANDING-181–LANDING-186과 자사 플러그인마다 `union` 항목(권장), 바뀌지 않는 것, 이주 행마다 오늘과 새 동작을 시험으로 대조 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1) |
| LANDING-199 | 이주(18라운드) — 호출자의 `setValue(V)`는 하위 트리 전체가 아니라 원본이 바뀐 노드만 다시 마운트 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94) |
| LANDING-200 | 이주(18라운드) — 호출자의 `setValue(null)` 뒤 자식 쓰기로 객체가 돌아와도 자식 기본값을 채우지 않는다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-99) |
| LANDING-201 | 이주(18라운드) — 입력의 `onChange(v, Overwrite)`는 자기 입력을 다시 마운트하지 않는다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-99) |
| LANDING-202 | 이주(18라운드) — 배열 통째 `setValue`는 남은 아이템을 채우지 않고 뒤쪽의 새 아이템만 채운다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-99) |
| LANDING-203 | 채움 시점 이주 행 셋(LANDING-200–LANDING-202)의 점검 — 세 장면을 오늘 코드와 새 구현에서 돌린다 | 현행 | 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-99) |
| LANDING-204 | 우산 `1.0.0-beta`와 개발 PR 여섯 — 기반+청사진, 노드 트리·정착, 파생+상태 키·제어, 통지·검증, 배열, 전환; 자식 PR은 설계·설계문서 → 개발 여섯 → 플러그인 → 정리·릴리스, 단계 정의는 그대로 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4), 소유자 답(`reviews/round-18-owner-answers.md:45` 개발계획 1-가) |
| LANDING-205 | `src/__legacy__/`는 정리·릴리스 PR(PR-8)까지 참고용으로 보존 — PR-7은 진입점 전환과 레거시 import 0 점검만, 삭제는 PR-8, 우산에 딸린 무관한 파일은 정리하지 않음 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:43` 개발계획 P2) |
| LANDING-206 | UI 플러그인 넷의 이주는 플러그인 PR(우산 순서 N+1) — `presentation.*` 이주·자사 플러그인 수정 목록·union 항목, PR-7은 기본 입력으로 검증, ajv 셋은 원장대로 PR-4, 이주 표와 이주 점검은 PR-7에 남음 | 현행 | 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1) |
| LANDING-207 | 이주(19라운드) — 형 없는 객체 분기 `oneOf`·`anyOf`(pydantic·zod·OpenAPI·TypeBox)는 object variant 호스트, `Optional[Self]`는 `RECURSIVE_SHAPE_UNBOUNDED` | 현행 | 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-01) |
| LANDING-208 | 이주(19라운드) — `type` 없이 `const`·`enum`만 있는 프로퍼티(OpenAPI 3.1·JSON Schema 2020-12 관용구, 수기 태그)는 리터럴 종류의 원시 잎 | 현행 | 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-02) |

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
  > `07-conclusions.md:423`의 "`computed`→`control`(별칭이므로 기계적)"는 정본과 다르다. 정본이 이긴다(`08-design-a-to-z.md:436`, 15라운드 결정 5). LANDING-007이 이긴다: `computed` 컨테이너는 `controls`로 이름 변경, 별칭 없음.
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
- 보충:
  > 편집자 결정(18C-84): "【추론】 이주 안내에는 한 줄만 두고 README를 가리킨다." (`reviews/round-18-closing.md:2227`)
  > 편집자 결정(18C-84): "【추론】 그 한 줄은, 오늘 매크로태스크 디바운스가 가리던 "이펙트 쓰기면 키 입력당 `onChange` 2회"가 새 설계에서 드러난다는 점이다(LANDING-022 이주 19와 짝)." (`reviews/round-18-closing.md:2228`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:451`(정본), `05-before-after.md:158,174,201`, `reviews/round-18-closing.md:2227-2228`
- 닫은 사람: 소유자 답(`reviews/round-4.md:116` D-10), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-84)
- 라운드: 18
- 까닭: `reviews/round-4.md:153`, `reviews/round-18-closing.md:2231-2231`

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
- 보충:
  > 편집자 결정(34C-02): "【추론】 ERROR-032가 PR-4에 둔 "`ValidationIssue` 개명"은 새 이름을 공개 index에 내보내 `onError`의 공개(PR-7)보다 먼저 세우는 것이고, 옛 이름 `JSONSchemaError`를 같은 형의 별칭으로 PR-7까지 남기는 것은 LANDING-159 규칙 3(공개 진입점은 PR-7까지 옛 엔진)과 맞다; 옛 `<Form>` 형과 플러그인 스토리 파일이 아직 옛 이름을 가져오기 때문이다." (`reviews/round-34-closing.md:18`)
  > 편집자 결정(34C-02): "【추론】 별칭을 지우는 것은 LANDING-024 이주 21의 적용이며 전환(PR-7) 또는 이주 안내를 넣는 PR-8의 몫이다; ajv 플러그인 셋은 PR-4에서 새 이름으로 바꿔 가져온다(LANDING 영역 형제 패키지 문단)." (`reviews/round-34-closing.md:19`)
  > 편집자 결정(50C-01): "【추론】 34C-02가 옛 이름을 남기라고 한 까닭은 LANDING-159 규칙 3(공개 진입점은 PR-7까지 옛 엔진이고 PR-4 전에는 공개 동작 변경이 없다, 32C-01)대로 옛 `<Form>` 형과 플러그인 스토리, 그리고 소비자 코드가 계속 컴파일되게 하는 것이므로, 같은 형의 별칭이 `details`를 `unknown`으로 좁혀 소비자 코드를 PR-7 전에 깨뜨린다면 그 수단이 뜻을 거스른다; 그래서 `JSONSchemaError`는 옛 공개 형과 같은 모양을 지키는 `ValidationIssue`의 호환 확장(`details?: Record<string, any>`, `key?: number`)으로 `src/index.ts`에서 이름으로 내보내고, 새 엔진의 `ValidationIssue`는 `details?: Record<string, unknown>`을 지키며 함께 내보낸다(새 엔진의 값은 확장에 대입 가능하고, 새 엔진은 `key`를 쓰지 않는다). 옛 이름을 지우는 것은 34C-02·LANDING-024대로 PR-7 또는 PR-8의 몫이고, 그때 `any`와 `key`도 함께 사라진다; `ValidationIssue.details`를 `any`로 넓히거나 소비자의 좁힘을 받아들이는 길은 택하지 않는다." (`reviews/round-50-closing.md:9`)
  > 소유자(74라운드, 레거시의 완전 분리): "예. 완전히 분리하세요. 저는 사실 패키지 레벨에서 분리를 할거라고 생각했는데, 이정도만 분리해도 괜찮겠네요" (`reviews/round-74-owner-answers.md:7`) — 공개 호환 별칭 `JSONSchemaError`(34C-02·50C-01, "PR-7까지")는 07의 전환 커밋에서 `src/index.ts`에서 빠지고 이주 안내에 적는다; 전환 뒤 공개 index에는 옛 이름의 별칭을 두지 않는다(원장 관리자, 2026-10-02).
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
- 보충:
  > 편집자 결정(32C-01): "【추론】 Form 속성 `validatorFactory`가 함수 하나에서 `{ compile, compileGuard }` 객체로 바뀌는 것(LANDING-036 이주 33)은 공개 겉면의 변경이고, LANDING-159 규칙 3대로 `src/index.ts`는 PR-7까지 옛 엔진을 가리키며 LANDING-064의 PR-7 행이 Form 속성 `validatorFactory`의 연결을 전환 PR에 두므로, 공개 속성의 형과 동작은 PR-7에서 바뀐다; PR-4 전에는 공개 동작 변경이 없다." (`reviews/round-32-closing.md:10`)
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
- 보충:
  > 편집자 결정(18C-101): "【추론】 로드 뒤 `OnChange` 비트면 한 번 하는 검증(LANDING-041, ERROR-040, EVENT-032)은 `resetSubtree()`에는 그 하위 트리에만 적용한다." (`reviews/round-18-closing.md:2848`)
  > 편집자 결정(69C-05): "【추론】 LANDING-041은 "마운트의 검증 요청은 렌더 계층의 준비 시점(폼이 커밋된 뒤, 오늘 `handleReady`의 자리), reset은 진입 끝에서 내며 … core만 쓰는 호스트(C3)는 마운트 검증을 직접 요청한다"고 둘을 갈랐고, LANDING-067의 PR-7 행이 그것을 전환의 일로 두었다. 오늘 `dispatchMount`가 사슬 끝에서 루트 검증을 요청하는 것은 core만 쓰는 호스트의 모양이므로 결함이 아니고, 바인딩이 쓸 길이 없는 것이 빈자리다. 07은 마운트 진입에 선택 인자(검증 요청을 미룸)를 더해 바인딩 전용 마운트 함수(69C-01)가 그것을 켜고, 준비 이펙트에서 루트 검증을 요청한다(규칙은 LANDING-041 "로드 뒤 `OnChange` 비트면 한 번"). 그래서 StrictMode가 버리는 둘째 `useMemo` 트리는 커밋되지 않아 준비 이펙트가 없고 검증도 돌지 않으며, 로드 기록이 커밋된 로드 객체에 붙는 규칙(`reviews/raw-round17-onerror.md:55`)과 맞는다. 선택을 켜지 않은 호출(core만 쓰는 호스트, 오늘의 시험)은 동작이 바뀌지 않는다." (`reviews/round-69-closing.md:37`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:470`(정본), `09-landing-and-test-strategy.md:71`, `reviews/round-18-closing.md:2848`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:71` §2.6의 아홉째), 17라운드 스웜 수렴(편집자 결정, core만 쓰는 호스트의 마운트 검증), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-101)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:71`, `reviews/round-18-closing.md:2853-2855`

### LANDING-042 이주 39 — 호출자의 전체 교체 `setValue(V)`는 reset과 같은 입력 판정

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 39 | 호출자의 전체 교체 `setValue(V)`는 브랜치에도 Refresh를 내어 객체·배열 입력 아래 서브트리 전체를 다시 마운트한다 | reset과 같은 입력 판정이다. 자식 프록시를 그리지 않는 입력만 다시 마운트하고(값 전체를 스스로 그리는 사용자 브랜치 입력은 오늘처럼 다시 마운트된다), 대체된 입력의 늦은 쓰기는 버린다(09 §2.6의 열넷째, 16라운드 스웜 수렴(편집자 결정)) |
- 보충: 없음
- 상태: 현행
- 출처: `08-design-a-to-z.md:471`(정본), `09-landing-and-test-strategy.md:71`, `reviews/round-18-closing.md:2730-2731`
- 닫은 사람: 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:71` §2.6의 열넷째), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:71`, `reviews/round-18-closing.md:2734-2736`
- 충돌:
  > `08-design-a-to-z.md:471`의 "reset과 같은 입력 판정이다"는 18라운드 결정과 다르다: 로드가 아닌 쓰기(`setValue(V)` 포함)는 원본이 실제로 바뀐 노드에만 Refresh를 내고 쓴 입력 자신은 제외하며, "값이 같아도 낸다"는 로드의 새 수명에만 해당한다(EVENT-071, LANDING-199). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2730-2731`).
  > `08-design-a-to-z.md:471`의 "값 전체를 스스로 그리는 사용자 브랜치 입력은 오늘처럼 다시 마운트된다"는 18라운드 결정과 다르다: 로드가 아닌 `setValue(V)`는 원본이 실제로 바뀐 노드에만 Refresh를 내고 그 노드만 다시 마운트하므로, 값 전체를 그리는 브랜치 입력도 그 노드의 원본이 바뀐 때만 다시 마운트된다(EVENT-071, LANDING-199). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2730-2731`).

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
- 보충:
  > 편집자 결정(18C-98): "【추론】 `diagnostics`와 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화한다." (`reviews/round-18-closing.md:2797`)
  > 편집자 결정(18C-98): "【추론】 `setValue(V)`와 `resetSubtree()`는 초기화하지 않는다." (`reviews/round-18-closing.md:2798`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:474`(정본), `02-target-overview.md:332`, `reviews/round-18-closing.md:2797-2798`, `reviews/round-18-closing.md:28,666`
- 닫은 사람: 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드, `exceededBudget`을 정착 예산 셋으로), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-01·18C-21; `recursion`·`writeShape` 값 추가)
- 라운드: 18
- 까닭: `reviews/round-17-owner-answers.md:9`
- 충돌:
  > `08-design-a-to-z.md:474`의 "원인 `cause`(예산, 식, 대상, 공유 충돌), `exceededBudget`은 정착 예산 셋"는 18라운드 결정과 다르다: `cause`에 다섯째 값 (가칭) `'writeShape'`가 더해지고(ERROR-195), `exceededBudget`에 재귀 펼침의 멈춤을 뜻하는 (가칭) `'recursion'`이 더해져 값이 넷이다(ERROR-190). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:28`, `reviews/round-18-closing.md:666`).

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
- 상태: 대체됨(→ LANDING-145)
- 출처: `08-design-a-to-z.md:476`(정본), `08-design-a-to-z.md:577`, `09-landing-and-test-strategy.md:261`, `reviews/round-18-closing.md:582-597`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:43` 9 입력 마침 칸), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-19)
- 라운드: 18
- 까닭: `reviews/round-17-owner-answers.md:11`, `reviews/round-18-closing.md:599-603`

### LANDING-048 이주 45 — `isTerminalNode`는 `node.strategy`로 판정하고 형 좁히기를 바로잡음

- 결정:
  > | # | 오늘 | 새 설계 |
  > | --- | --- | --- |
  > | 45 | `isTerminalNode`는 `node.group === 'terminal'`로 판정하면서 형을 잎 넷으로 좁힌다(`src/core/nodes/filter.ts:195-198`) | `node.strategy`로 판정하고, 형의 좁히기를 터미널 객체·배열까지 포함하도록 바로잡는다(공개 형 변경) |
- 보충:
  > "이름 규칙을 오늘의 공개 이름에 적용할지. 공개 index가 내보내는 `Node`로 줄인 이름(형 `ArrayNode` 등 일곱, `NodeState`, `NodeEventType`, 가드 `is…Node`)을 `SchemaNode` 접두로 바꿀지와 08 §14의 이주 행" (`reviews/round-18-agenda.md:91`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:477`(정본), `reviews/round-18-closing.md:1038,2348`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 17라운드 스웜 수렴(편집자 결정, 노드 구조), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-38·18C-89; `UnionNode` 포함, 가상 제외)
- 라운드: 18
- 까닭: `reviews/round-17-owner-answers.md:22`
- 충돌:
  > `08-design-a-to-z.md:477`의 "형의 좁히기를 터미널 객체·배열까지 포함하도록 바로잡는다"는 18라운드 결정과 다르다: `isTerminalNode`의 반환 형 합집합에 `UnionNode`가 들어가고(LANDING-188), 가상 노드는 전략이 `branch`라 `isTerminalNode(가상)`은 거짓이다(LANDING-149). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2348`).

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
- 상태: 대체됨(→ LANDING-149)
- 출처: `08-design-a-to-z.md:479`(정본), `reviews/round-18-agenda.md:78`, `reviews/round-18-closing.md:1029-1038`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건 N14로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-38)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:78`, `reviews/round-18-closing.md:1040-1047`

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
  > `08-design-a-to-z.md:551`의 "그 안에서는 PR 아홉으로 나누며"는 소유자 답과 다르다: 개발 PR은 여섯(기반+청사진, 노드 트리·정착, 파생+상태 키·제어, 통지·검증, 배열, 전환)이고 자식 PR의 순서는 설계·설계문서 → 개발 여섯 → 플러그인 → 정리·릴리스다(LANDING-204). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:44`).
  > `08-design-a-to-z.md:551`의 "`refactor/schema-form-internal-architecture`"는 소유자 답과 다르다: 우산 브랜치는 `1.0.0-beta`다(LANDING-204). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:44`).

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
- 상태: 대체됨(→ LANDING-159)
- 출처: `08-design-a-to-z.md:552#6`(정본), `09-landing-and-test-strategy.md:42`, `reviews/round-18-agenda.md:100-101`, `reviews/round-18-closing.md:1330-1363`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건 §8로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49)
- 라운드: 18
- 까닭: `reviews/round-17-owner-answers.md:52`, `reviews/round-18-closing.md:1365-1368`

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
- 보충:
  > 편집자 결정(36C-01): "【추론】 NODE-014가 "비배열에서 부르면 행의 공유 칸이 `SchemaFormError`를 던지므로 겉면과 `dispatch`는 종류를 묻지 않는다"고 적은 그 칸은 NODE-006·LANDING-056의 일곱 칸(`interpret`·`assemble`·`project`·`finishInput`·`declareChildren`·`type`·`strategy`)에 들어 있지 않으므로, 배열 구조 연산을 받는 여덟째 칸으로 모든 행이 같은 자리에 갖는다; 일곱 칸 목록은 모순되지 않고 늘어난다. 칸 이름(06 제안 `arrange`)과 자리(`declareChildren` 뒤, `type` 앞)는 06의 실행 결정 기록이 정하고 모듈 DETAIL은 이 라운드와 그 기록을 함께 인용한다." (`reviews/round-36-closing.md:9`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:553-560`(정본, 553은 넷째 문장), `09-landing-and-test-strategy.md:32-38`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:21` 종류별 동작 표의 이름), 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:26` `tree`의 이름), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸), 소유자 답(`reviews/round-17-owner-answers.md:42-46` 4·9·10·12·15·14), 소유자 답(`reviews/round-17-owner-answers.md:53` `Node` 이름 규칙)
- 라운드: 17
- 까닭: `reviews/round-17-owner-answers.md:38`
- 충돌:
  > `08-design-a-to-z.md:556`의 "`stringBehavior/`·`numberBehavior/`·`booleanBehavior/`·`nullBehavior/`·`virtualBehavior/`"는 18라운드 결정과 다르다: 종류 모듈 목록에 (가칭) `unionBehavior/`가 더해진다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:80`). 규칙의 집은 BLUEPRINT-043이고 이름은 BLUEPRINT-035가 확정했다.

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
- 보충:
  > 반영 칸(개발계획 P3·P4): "우산 PR(`1.0.0-beta`, #344)의 자식은 설계 PR·설계문서 PR → 개발 PR 여섯 → 플러그인 PR → 정리·릴리스 PR(PR-8)이며 모두 `1.0.0-beta`를 base로 열고 merge commit으로 들어온다." (`reviews/round-18-owner-answers.md:44`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:562`(정본, 첫째–넷째 문장), `08-design-a-to-z.md:593`, `reviews/round-18-owner-answers.md:44`
- 닫은 사람: 편집자 결정(14라운드, `08-design-a-to-z.md:562`), 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4)
- 라운드: 18
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
- 보충:
  > 편집자 결정(18C-49): "【추론】 PR-0의 세 프로젝트 글롭(`unit`·`render`·`storybook`)이 `src/__legacy__/**`를 포함한다." (`reviews/round-18-closing.md:1359`)
  > 반영 칸(개발계획 P3·P4): "인접 단계 합침 둘을 채택한다: 기반(PR-0의 코드 부분)과 청사진(PR-1)은 한 PR, 파생(PR-3)과 상태 키·제어(PR-6)는 한 PR." (`reviews/round-18-owner-answers.md:44`)
  > 반영 칸(개발계획 1-가): "설계문서 8편·ADR 재작성·역검사 `doc-coverage`·옛 문서의 `_archive/` 이동·소유자 절 단위 통과는 별도 설계문서 PR로 `1.0.0-beta`에 연다." (`reviews/round-18-owner-answers.md:45`)
  > 반영 칸(개발계획 1-가): "기반 PR과 병렬이며 코드 PR을 막지 않는다." (`reviews/round-18-owner-answers.md:45`)
  > 편집자 결정(25C-09): "【추론】 설계문서 PR(01, #348)은 2026-09-29에 머지되었고 8편 머리 표 192절은 대기이므로 PLAN의 상태는 "머지(절 통과 대기)"로 적는다." (`reviews/round-25-closing.md:85`)
  > 편집자 결정(25C-10): "【추론】 02(#347)는 2026-09-27에, 01(#348)은 2026-09-29에 머지되었고, 병렬은 소유자 선택(LANDING-060 반영 칸)이라 순서는 위반이 아니다." (`reviews/round-25-closing.md:94`)
  > 편집자 결정(25C-10): "【추론】 01이 코드를 보지 않고 원장에서 쓰여 생긴 어긋남 16건은 이 라운드와 보정 PR `fix/schema-form-realign-01-02`가 닫으며, 새 과정 규칙은 두지 않는다." (`reviews/round-25-closing.md:95`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:570`(정본), `09-landing-and-test-strategy.md:256`, `reviews/round-18-closing.md:1359`, `reviews/round-18-owner-answers.md:44`, `reviews/round-18-owner-answers.md:45`, `reviews/round-18-owner-answers.md:16`
- 닫은 사람: 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:570`), 소유자 답(`reviews/round-16-owner-answers.md:14` 8 시나리오 모듈은 비공개 패키지), 편집자 결정(17라운드, 18라운드 정련을 착수 조건에 더함), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49), 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4), 소유자 답(`reviews/round-18-owner-answers.md:45` 개발계획 1-가), 소유자 답(`reviews/round-18-owner-answers.md:16` 12-6)
- 라운드: 18
- 까닭: `08-design-a-to-z.md:570`, `reviews/round-18-closing.md:1365-1368`
- 충돌:
  > `08-design-a-to-z.md:570`의 "이 문서의 절 단위 통과"는 소유자 답과 다르다: 절 단위 통과는 새 설계문서에서만 하고 08·09는 통과 절차 없이 백업으로 간다(PROCESS-062). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:16`).
  > `08-design-a-to-z.md:570`의 "이 문서, 14라운드 기록, ADR 최종 상태, HANDOFF"는 소유자 답과 다르다: 08·09와 옛 ADR은 백업 디렉토리로 가고 설계문서와 ADR은 원장에서 새로 만들며 소유자의 절 단위 통과는 새 설계문서에서만 한다(PROCESS-061, PROCESS-062). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:16`).

### LANDING-061 PR-1 청사진 — 조각 표·노드 공유·병합 함수·잎 교차 함수 이동·식 컴파일러 이동·청사진 오류의 데이터화

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-1 청사진 | 순수 함수 `blueprint`: 조각 표와 전순서, 노드 공유, `controls.discriminator` 변환(끌어올림 포함), 유효 스키마 병합 함수(§9 병합표는 새로 쓴다. 렌더 계층이 넘긴 판정으로 정하는 원자(React 요소, ref 모양)와 한쪽 값의 참조 이동은 `@winglet/common-utils` `merge`의 선택 인자(배열 교체, 원자 판정, 참조 이동. 양쪽에 있는 객체는 새 객체에 병합한다: 쓰기 시 복사. 인자가 없으면 오늘 동작, changeset `minor`)로 쓴다(17라운드 스웜 수렴(편집자 결정)). 오늘의 교차 연산은 먼저 승·얕은 덮어쓰기·무조건 throw라 §9와 다르므로 잎 교차 함수 `intersectEnum`·`intersectConst`·`intersectMinimum`·`intersectMaximum`·`intersectMultipleOf`·`intersectPattern`·`validateRange`를 청사진 밖의 새 fractal로 옮겨(청사진 안에 두면 그것을 가져가는 옛 `helpers/jsonSchema`와 서로 가져오는 고리가 될 수 있다. 이름은 PR-1이 정한다) 이름으로 내보내되, `intersectEnum`·`intersectConst`·`validateRange`는 공집합·충돌에서 던지지 않고 공집합 표시를 돌려주도록 바꾼다. throw는 청사진이 정적 연언을 교차할 때만 한다(§9). 옛 `intersect*Schema`는 공집합 표시를 받으면 오늘처럼 `JSONSchemaError`를 던지도록 import와 함께 고쳐 옛 동작을 PR-7까지 지킨다(레거시로 옮긴 옛 코드가 PR-7까지 도는 방법은 18라운드 안건 '전환 방식의 세부'이며 이 문장은 그 안건의 한 안이다, §15)), 검증기 앞 제거 규칙 하나, `controls`의 식 컴파일(오늘의 컴파일러 `createDynamicFunction`과 그 `utils`, `JSON_POINTER_PATH_REGEX`, `getPathManager`, `DynamicFunction` 형은 `AbstractNode` 조직 안에 있으므로 PR-1에서 청사진으로 통째로 옮긴다. 새 엔진에서 식을 컴파일하는 곳은 청사진 하나뿐이고(filid 배치 규칙 §1), `helpers/dynamicExpression/`의 `INTENT.md`는 표현식 직접 실행(`eval`, `new Function`)을 금한다. PR-7까지는 옛 엔진도 쓰므로 청사진 진입점이 이름으로 내보내고 그 유지 이유를 청사진의 `DETAIL.md`에 적는다. 옛 소비자는 import만 고친다. 16라운드 편집자 결정, 답 10으로 확정)과 역의존 표, 청사진 오류·경고(선언 사이 `options.terminal`·렌더 계층 판정·`controls.discriminator` 불일치, `controls`·`options`의 모르는 키. 터미널 전략은 `options.terminal` → 렌더 계층이 인자로 넘긴 판정 함수 → `type`의 순서로 정하며 청사진은 `presentation`을 읽지 않는다, 17라운드 스웜 수렴(편집자 결정)), `controls.watch` 의존의 합집합, `options`의 닫힌 목록(`trim` 포함), 정적 `controls.injectTo` 대상 없음의 청사진 오류(R17-1 나), 청사진 오류·경고의 데이터화(수집기 인자로 코드·`schemaPath`·세부·판별 칸을 모으며 소비자가 없으면 모으지 않는다. 캐시 청사진의 늦은 경고 수집은 작성 루트마다 한 번, 17라운드 스웜 수렴(편집자 결정)). 테이블 테스트 | 없음 | 18라운드 안건 A(`$ref` 재귀, 다중 `type`, `dependentSchemas`·`patternProperties` 등)와 B(식 언어 명세), 전환 방식의 세부(레거시 디렉토리의 이름과 자리), 노드 구조 N14(행이 없는 조합, 청사진의 전략 결정)(§15) |
- 보충:
  > 편집자 결정(18C-02): "【추론】 (7) PR 배치: 청사진이 `union` 종류를 알아보는 것은 PR-1이다(청사진이 종류를 정한다)." (`reviews/round-18-closing.md:78`)
  > 편집자 결정(18C-49): "【추론】 규칙 1은 파일 한정 ESLint `no-restricted-imports`로 막고 PR-1에서 건다." (`reviews/round-18-closing.md:1338`)
  > 편집자 결정(18C-49): "【추론】 규칙 2: 레거시 → 새 코드는 08 §17.2가 이미 적은 곳만 허용한다(예: 옛 `intersect*Schema`가 새 잎 교차 함수를, 옛 소비자가 청사진으로 옮긴 식 컴파일러를 가져온다)." (`reviews/round-18-closing.md:1339`)
  > 편집자 결정(18C-49): "【추론】 PR-1 점검에 "filid `max-depth` 통과. 실패하면 `src/__legacy__/**`를 예외로 두는 설정 변경을 같은 PR에서 한다"를 둔다." (`reviews/round-18-closing.md:1352`)
  > 반영 칸(개발계획 P3·P4): "인접 단계 합침 둘을 채택한다: 기반(PR-0의 코드 부분)과 청사진(PR-1)은 한 PR, 파생(PR-3)과 상태 키·제어(PR-6)는 한 PR." (`reviews/round-18-owner-answers.md:44`)
  > 편집자 결정(25C-07): "【추론】 잎 교차 함수의 새 fractal은 `src/helpers/schemaIntersection/`이고, 공집합 표시는 `EMPTY_INTERSECTION`(Symbol)이며, `EMPTY_INTERSECTION`과 함께 이름으로 내보내는 함수는 `intersectConst`·`intersectEnum`·`intersectMaximum`·`intersectMinimum`·`intersectMultipleOf`·`validateRange` 여섯이고, `intersectPattern`은 SCHEMA-043대로 레거시에 남는다." (`reviews/round-25-closing.md:68`)
  > 편집자 결정(25C-07): "【추론】 LANDING-061 표의 "착수 전 닫을 것"은 모두 닫혔다: 안건 A는 18라운드(BLUEPRINT-030·BLUEPRINT-041·SCHEMA-040·FRAGMENT-047), 안건 B는 CONTROLS-080, 전환 방식의 세부는 LANDING-159·LANDING-205, N14는 NODE-047이 닫았다." (`reviews/round-25-closing.md:69`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:571`(정본), `09-landing-and-test-strategy.md:20,32,257`, `adr/0014-error-policy.md:178-184`, `reviews/round-18-closing.md:78,193,196,1338-1339,1352`, `reviews/round-18-owner-answers.md:44`, `reviews/round-18-closing.md:387`
- 닫은 사람: 편집자 결정(16라운드, 답 10으로 확정 `reviews/round-16-owner-answers.md:16`), 소유자 답(`reviews/round-14-owner-answers.md:17` O-11 `merge` 선택 인자), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 17라운드 스웜 수렴(편집자 결정, 터미널 전략·병합의 원자·데이터화), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02·18C-08·18C-49), 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-14; 정적 `injectTo` 오류 없음)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:20`, `reviews/round-18-closing.md:84-91`, `reviews/round-18-closing.md:203-207`, `reviews/round-18-closing.md:1365-1368`
- 충돌:
  > `08-design-a-to-z.md:571`의 "옛 `intersect*Schema`는 공집합 표시를 받으면 오늘처럼 `JSONSchemaError`를 던지도록 import와 함께 고쳐 옛 동작을 PR-7까지 지킨다"는 18라운드 결정과 다르다: 레거시의 `const` 비교는 깊은 비교로 바뀌며(결함 수정), 이것이 옛 동작을 PR-7까지 지킨다는 규칙의 예외다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:196`). 규칙의 집은 SCHEMA-043이다.
  > `08-design-a-to-z.md:571`의 "`intersectEnum`·`intersectConst`·`intersectMinimum`·`intersectMaximum`·`intersectMultipleOf`·`intersectPattern`·`validateRange`를 청사진 밖의 새 fractal로 옮겨"는 18라운드 결정과 다르다: `intersectPattern`은 새 fractal로 옮기지 않는다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:193`). 규칙의 집은 SCHEMA-043이다.
  > `08-design-a-to-z.md:571`의 "정적 `controls.injectTo` 대상 없음의 청사진 오류(R17-1 나)"는 18라운드 결정과 다르다: `controls.injectTo`는 함수 형태 하나라 청사진이 정적으로 아는 대상이 없고, 그 오류 코드 `INJECT_TARGET_NOT_FOUND`는 낼 자리가 없어 PR-4의 코드 확정에서 빠지며, 대상 없음은 모두 동적 대상 없음 `INJECT_TARGET_MISSING`이다(CONTROLS-079, ERROR-164). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:387`).
  > `08-design-a-to-z.md:571`의 "18라운드 안건 '전환 방식의 세부'"는 18라운드 결정과 다르다: 그 안건은 닫혔다 — PR-7은 진입점을 새 엔진으로 바꾸고 새 코드가 레거시를 가리키는 import가 0임을 점검하며 옛 코드는 `src/__legacy__/`에 보존한다(LANDING-159, LANDING-205). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:1330-1363`).

### LANDING-062 PR-2 노드 트리와 정착 — 단일 클래스 `SchemaNode`와 동작 행, 정착 루프, 예산 다섯과 원본 B, `diagnostics`

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-2 노드 트리와 정착 | 노드: 상속 없는 단일 클래스 `SchemaNode`(`src/core/SchemaNode/`)와 `BEHAVIORS[type][strategy]`의 동작 행(잎 넷·객체·터미널 객체·가상. 터미널 배열은 PR-5), `src/core/record/`·`src/core/behaviors/`·`src/core/navigation/`, 공개 `type`·`strategy` 게터와 `active` 게터(노드 게이트), 겉면 규칙의 기계 검사(파일 한정 린트, 멤버 목록 시험, 행 칸 순서 시험). `raw`·`extras`, 표시·계산(호스트 바퀴, 노드 게이트, 투영)·전이(채움, 나감 비움 네 층과 하위 트리·잠복 자손으로 내려가는 정책, R17-2 ㄴ)·커밋, 예산 다섯과 원본 B(되돌림 기록. 기록 항목은 노드, 이전 `raw`, 이전 `extras`, 배열 아이템 구조의 생성·폐기이며 중간 라운드 채움의 철회보다 먼저 적용한다), `diagnostics`(`'stable'` 또는 `'degraded'`, `cause`, `commit`, R17-1 나), `SetValueOption`, 게이트는 술어 인터페이스 뒤의 스텁. 정착 루프 테스트(프로토타입 회귀 이식) | PR-1 | 18라운드 안건 B·C·D(`controls.active` 식의 다른 호스트 읽기 순서, 비객체 V의 `Merge`, 되먹임 거부 표면, 프로토타입 v7)와 노드 구조(N2, N5, N6, N14, 공개 표면의 크기, `ContextNode`의 자리)(§15) |
- 보충:
  > 편집자 결정(26C-01): "【추론】 PR-2의 겉면은 `reviews/raw-round17-node-structure.md:74`의 PR-2 목록(식별·값 게터, `active` 게터, `find`·`findNodes`, 가드, 생성, `settle`의 쓰기로 직접 위임하는 `setValue`)과 LANDING-062와 PR-2 게이트(WRITE-093, WRITE-099, SETTLE-049, ERROR-204)가 PR-2에 둔 `raw`·`extras`·`diagnostics`·`SetValueOption`·`defaultValue`·`resetSubtree`·`typeMismatch`·`typeMismatches`다." (`reviews/round-26-closing.md:10`)
  > 편집자 결정(26C-01): "【추론】 뒤 PR의 멤버를 PR-2 클래스에 무해한 구현(스텁)이나 `SchemaNodeRuntime` 칸으로의 위임으로 미리 두지 않는다: PR-2의 시험 대역은 `if` 게이트 술어 하나뿐이고 시험만을 위한 주입 자리를 새로 만들지 않는다(TEST-069 (나)); LANDING-062의 "게이트는 술어 인터페이스 뒤의 스텁"은 이 술어 하나를 말한다." (`reviews/round-26-closing.md:13`)
  > 편집자 결정(26C-04): "【추론】 `controls.active` 게이트(노드 게이트·조각 게이트)는 PR-2가 청사진이 컴파일한 식(`BlueprintExpression.evaluate`)으로 호스트 바퀴에서 실제로 평가하며, 술어 인터페이스 뒤의 대역으로 두지 않는다." (`reviews/round-26-closing.md:45`)
  > 편집자 결정(26C-04): "【추론】 `if` 게이트만 `record/`가 선언한 술어 인터페이스 뒤에 두고 시험은 대역 하나를 쓰며, 실제 술어는 PR-4의 `compileGuard`가 넣는다." (`reviews/round-26-closing.md:46`)
  > 편집자 결정(35C-05): "【추론】 자동 쓰기(채움·`derived`·`injectTo`·`unsetValue`·나감 비움)가 배열 호스트에 닿아 아이템을 만들거나 없애면 정착 작업장이 {호스트, 이전 아이템 목록(순서 있는 노드 참조), 이전 `extras`}를 적고, 예산 초과 때 기존 자동 쓰기 기록과 함께 거꾸로 되돌려 원본 B에 호출자 쓰기만의 구조를 남긴다(LANDING-062 충돌 줄과 TEST-069가 PR-5로 둔 기록); 그 정착에서 생겼다가 되돌린 아이템은 커밋된 형상에 한 번도 들지 않으므로 생김이 아니고 채움도 받지 않으며, 없어지는 아이템은 WRITE-036대로 나감이 아니다." (`reviews/round-35-closing.md:40`)
  > 편집자 결정(39C-01): "【추론】 머지된 객체 행의 `projectObject`가 비객체 `raw`에 `undefined`를 돌려주는 것과 `objectBehavior/DETAIL.md`의 "그 호스트의 방출은 하지 않습니다"는 03의 기록에 결정으로 남아 있지 않은 근사이며 결함이다(29C-02·29C-03의 선례와 같다); nullable 객체(`type: ['object','null']`)의 `null`이 방출에서 사라져 `{ user: null }`이 `{}`가 되는 것은 동작 결함이고, 배열 아이템인 객체 호스트의 `null`이 VALUE-034의 구멍 채움 `{}`로 바뀌어 보이는 것도 같은 결함이다." (`reviews/round-39-closing.md:10`)
  > 편집자 결정(39C-01): "【추론】 고치는 것은 06이다: 배열 행의 투영과 같은 규칙이고 VALUE-034의 구멍 채움이 아이템 호스트의 방출 유무에 기대므로 06의 묶음에서 객체 행의 `projectObject`를 "비객체 `raw`면 그 `raw`를 방출, 아니면 빈 호스트 투영"으로 고치고, `objectBehavior/DETAIL.md`의 그 문장을 먼저 바꾸며, 프로토타입 두 사례(A3-3/A3-4-host, line 31)를 시험으로 이식한다; 루트의 `local` 대체는 VALUE-034의 "방출이 없을 때"에만 해당하고 루트가 잘못된 종류의 `raw`를 들면 그 `raw`를 낸다(프로토타입 `prime(mk(), null)`의 루트가 `null`을 방출). 루트 출력의 수정이 06의 묶음을 넘으면 06 실행 기록 §4에 07로 넘긴다고 적는다. 어느 쪽이든 §4에 결함과 고친 자리를 적는다." (`reviews/round-39-closing.md:11`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:572`(정본), `09-landing-and-test-strategy.md:23,33,258`, `reviews/round-18-closing.md:751,753,769-771`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 편집자 결정(16라운드 정착 검토 조건 5, `09-landing-and-test-strategy.md:23`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-25; 예산·배열 기록의 PR 배분)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:23`
- 충돌:
  > `08-design-a-to-z.md:572`의 "잎 넷·객체·터미널 객체·가상"는 18라운드 결정과 다르다: PR-2의 동작 행에 (가칭) `union` 행이 다른 잎 행과 함께 든다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:79`).
  > `08-design-a-to-z.md:572`의 "예산 다섯과 원본 B(되돌림 기록. 기록 항목은 노드, 이전 `raw`, 이전 `extras`, 배열 아이템 구조의 생성·폐기"는 18라운드 결정과 다르다: 각 PR은 자기가 들여오는 기제를 검증하므로 PR-2가 실제 코드로 시험하는 예산은 호스트 바퀴와 전이 라운드이고, 파생 라운드 예산은 PR-3, 되먹임 파동과 `onChange` 중첩 예산은 PR-4, 원본 B의 배열 아이템 구조 기록은 PR-5가 맡는다(TEST-069). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:753`).

### LANDING-063 PR-3 파생 — `controls.derived`·`injectTo`·`unsetValue`, 같은 대상 규칙, 에지 소비

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-3 파생 | `controls.derived`·`controls.injectTo`·`controls.unsetValue`, 같은 대상 규칙(종류 순위, 문서 순서, 층, 전순서, 정착 단위), 에지 소비, `DisableAutomaticWrites`, `controls.resetInteraction`, 개발 모드 정착 기록 | PR-2 | 에지의 값 동등 판정, `controls.derived` 의존 집합, 조각 `controls` 식의 나감 발화 |
- 보충:
  > 반영 칸(개발계획 P3·P4): "인접 단계 합침 둘을 채택한다: 기반(PR-0의 코드 부분)과 청사진(PR-1)은 한 PR, 파생(PR-3)과 상태 키·제어(PR-6)는 한 PR." (`reviews/round-18-owner-answers.md:44`)
  > 편집자 결정(28C-01): "【추론】 ERROR-159 정착 추적 행의 기록은 트리마다 하나인 `SchemaNodeRuntime`의 칸에 들며(26C-06), 칸을 더하는 절차는 NODE-045대로 `record/`의 선언을 고치고 그 대가를 레코드 `DETAIL.md`에 적는 것이다." (`reviews/round-28-closing.md:9`)
  > 편집자 결정(28C-01): "【추론】 PR-3은 이 기록을 위한 공개 `SchemaNode` 멤버·`onError` 기록·`FormHandle` 멤버를 더하지 않는다: 원장이 정한 멤버가 없고(26C-01), 이 행은 "`onError`에 가지 않음"이다." (`reviews/round-28-closing.md:12`)
  > 편집자 결정(28C-03): "【추론】 맥락 변경의 진입은 바인딩 전용 내부 통로 `setContext`(가칭, SURFACE-055·NODE-010)이고, 그것이 도는 정착(역의존 표의 `@` 항목이 가리키는 노드와 그 조상의 재계산, `@`를 읽는 `derived`·`unsetValue`·`resetInteraction`에게의 에지)은 PR-3의 기제다: 에지 소비와 파생이 PR-3이고(LANDING-063), 원장이 PR을 적지 않은 것은 그 기제를 들여오는 PR에 든다(26C-01)." (`reviews/round-28-closing.md:38`)
  > 소유자(30라운드, 04의 스토리북 게이트): "제가 독립실행했는데 기록이 안되었군요. 모두 pass 로 끝났습니다." (`reviews/round-30-owner-answers.md:13`) — 04 PR #351(PR-3 + PR-6)의 스토리북 게이트는 포기가 아니라 소유자의 독립 실행으로 통과했고 기록만 빠졌다. PLAN §5의 "포기" 기록은 이 답으로 바로잡는다(원장 관리자, 2026-10-01).
- 상태: 현행
- 출처: `08-design-a-to-z.md:573`(정본), `09-landing-and-test-strategy.md:34`, `reviews/round-18-owner-answers.md:44`
- 닫은 사람: 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:573`), 소유자 답(`reviews/round-15-decisions.md:13` 5, `controls` 표기), 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4)
- 라운드: 18
- 까닭: `08-design-a-to-z.md:573`

### LANDING-064 PR-4 통지와 검증 — 디스패처·`batch`·진입 사슬·`onError`의 core 쪽·`compileGuard`·배달 경로

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-4 통지와 검증 | 루트 디스패처, `batch`, 진입당 `onChange` 1회, 진입 사슬과 사슬 끝의 throw, `onError` 로깅 채널의 core 쪽(기록 형 `FormErrorRecord`와 코드 형 `FormErrorCode`(가칭), core가 인자로 받는 보고기(`report`, `hasConsumer`), 사슬 끝 기록마다 전달, 핸들러 예외의 묶음 규칙, 전달 중 쓰기 거부, 경고의 구조 키 중복 억제, 정착 경고 판정의 소비자 조건, `ValidateFunction` 문서 주석 "판정은 돌려주고 던지지 않는다". `ValidationIssue` 개명이 `onError`의 공개보다 먼저 선다, 17라운드 스웜 수렴(편집자 결정)), 진입 사슬의 소유는 `dispatch`(쓰기 동사마다 진입 함수)이며 겉면의 쓰기 위임을 `dispatch` 진입으로 옮김, `SchemaFormError`의 집계 오류(`details.errors`), 주인 없는 오류 싱크, 검증 실행 실패와 검증 불가의 드러남, 가드의 늦은 컴파일(프로덕션)과 개발 모드 일괄 컴파일(어느 환경이든 실패는 그 게이트의 가드 실패)(ADR 0014, 17라운드 스웜 수렴(편집자 결정)), `UpdateDiagnostics`, 커밋 번호 스탬프 검증과 실행 합치기, 검증기 계약(`compileGuard`, `rejectedKey`)의 플러그인·`validatorFactory` 통일과 ajv6·7·8 플러그인 구현, 에러 라우팅, 오류 클래스(`ValidationIssue`), 훅 수준의 React 바인딩 시험(동기 통지와 `useSyncExternalStore`, StrictMode 이중 호출, 구독 뒤 따라잡기), 같은 `$id` 루트의 중복 등록 처리, 상태·오류·명령 사건과 검증 결과의 배달 경로(09 §2.4, 16라운드 답 3), 검증기 등록의 참조 세기와 최근 해제 목록, 재생성 reset의 같은 `$id`(09 §2.6의 여덟째, 16라운드 스웜 수렴(편집자 결정)) | PR-2 (PR-3과 병렬) | `compileGuard` 계약 세부, 에러 라우팅, 유효 스키마 변경 이벤트, core가 `ValidationManager` → `app/plugin`의 `PluginManager`를 거쳐 React 구성 요소 모듈을 가져오는 import의 분리(검증기 주입 경로, §15) |
- 보충:
  > 반영 칸(개발계획 P1): "ajv6·ajv7·ajv8의 `compileGuard`·`rejectedKey`·같은 `$id` 처리는 원장대로 PR-4에서 셋 다 구현한다(LANDING-064·093 그대로)." (`reviews/round-18-owner-answers.md:42`)
  > 편집자 결정(32C-01): "【추론】 LANDING-064의 PR-4 행 "검증기 계약(`compileGuard`, `rejectedKey`)의 플러그인·`validatorFactory` 통일과 ajv6·7·8 플러그인 구현"은 코어가 받는 검증기 계약 형 하나를 정하고 플러그인 셋과 코어의 트리 생성 인자가 그 형을 쓰게 하는 일이다; Form 속성 `validatorFactory`의 공개 형을 바꾸는 일은 아니다." (`reviews/round-32-closing.md:9`)
  > 편집자 결정(32C-01): "【추론】 Form 속성 `validatorFactory`가 함수 하나에서 `{ compile, compileGuard }` 객체로 바뀌는 것(LANDING-036 이주 33)은 공개 겉면의 변경이고, LANDING-159 규칙 3대로 `src/index.ts`는 PR-7까지 옛 엔진을 가리키며 LANDING-064의 PR-7 행이 Form 속성 `validatorFactory`의 연결을 전환 PR에 두므로, 공개 속성의 형과 동작은 PR-7에서 바뀐다; PR-4 전에는 공개 동작 변경이 없다." (`reviews/round-32-closing.md:10`)
  > 편집자 결정(43C-01): "【추론】 `globalState`는 노드 상태의 유도 값이고 `UpdateGlobalState`는 상태 사건이므로, LANDING-064의 PR-4 행 "상태·오류·명령 사건과 검증 결과의 배달 경로"와 EVENT-067(`setState`의 상태 칸 변경은 정착 밖 사건, 비트 `UpdateState`)이 두는 자리인 PR-4가 EVENT-062의 기제 전부 — 키별 참 노드 수, 상태 변경과 형상 출입 때의 갱신, 0과 1 사이를 넘을 때만의 새 객체와 `UpdateGlobalState`, 그 결과로 `dirty`가 내려가는 것 — 를 만든다; 03은 통지와 상태 사건을 비목표로 두었고(03 기록 "비목표: … 통지·검증(05)") 04의 "상태 키"는 `readOnly`·`disabled`·`visible` 같은 제어 상태 키라 노드 `state`가 아니며(03 기록 §4의 P4 배분), 06·07에는 상태 사건이 없다. 계획서가 EVENT-062를 빠뜨린 것은 PR-4 행의 "상태 사건"에 접혀 있던 것이라 05가 자기 작업 항목에 더하고 실행 기록에 적는다." (`reviews/round-43-closing.md:9`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:574`(정본), `09-landing-and-test-strategy.md:19,22,35,259`, `adr/0014-error-policy.md:178-184`, `reviews/round-18-owner-answers.md:42`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:9` 3 배달 경로), 소유자 답(`reviews/round-16-owner-answers.md:16` 10 가드 캐시와 등록의 소유), 16라운드 스웜 수렴(편집자 결정, 재생성 reset의 같은 `$id`), 17라운드 스웜 수렴(편집자 결정, `onError` core 쪽과 가드 컴파일), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:19`

### LANDING-065 PR-5 배열 — 배열·터미널 배열 행, 아이템 호스트, 통째 교체의 identity

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-5 배열 | 배열·터미널 배열 행(`arrayBehavior/`의 `branch/`·`terminal/`), 겉면 배열 멤버, 배열 노드와 아이템 호스트, `items`·`prefixItems`, `push`·`remove`·`update`, 통째 교체의 identity, 아이템 채움 | PR-2 (PR-3·4와 병렬) | 배열 아이템의 생김과 채움, `contains` |
- 보충:
  > 편집자 결정(33C-01): "【추론】 원장은 `dispatch/` fractal을 PR-4에, 배열 동사를 PR-5에 두었고 둘이 병렬이므로 배열 동사의 진입 파일을 어느 PR이 더하는지는 적지 않았다; 05·06이 합의한 "뒤에 머지하는 쪽이 더한다"는 그 빈자리를 채우는 것이며 LANDING-084와 어긋나지 않는다. 조건은 둘 다 머지된 뒤 모든 쓰기 동사의 진입 함수가 `dispatch/`에 있고 겉면의 쓰기 위임이 그 진입을 거치는 것(LANDING-064 "겉면의 쓰기 위임을 `dispatch` 진입으로 옮김")이다." (`reviews/round-33-closing.md:10`)
  > 편집자 결정(33C-01): "【추론】 06이 먼저 머지되면 그 동사는 03(PR-2)이 겉면 쓰기를 둔 모양 — 정착 호출 하나(TEST-069 "PR-2에서 사슬은 settle 호출 하나다") — 을 따르고, 05가 머지되는 쪽(또는 06이 뒤라면 06)이 겉면 위임을 `dispatch` 진입으로 옮기면서 배열 동사 다섯의 진입 파일을 더한다; `batch` 안의 배열 동사가 형제 진입으로 합쳐지는 것(EVENT-035)과 진입당 `onChange` 한 번은 그 뒤에만 성립하므로 06의 시험은 그 둘을 단언하지 않는다(03 log §4의 `batch` 사례 배분과 같다)." (`reviews/round-33-closing.md:11`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:575`(정본), `09-landing-and-test-strategy.md:36,260`, `08-design-a-to-z.md:411`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 편집자 결정(14라운드 PR 계획, `08-design-a-to-z.md:575`), 편집자 결정(18라운드, SURFACE-005; 배열 쓰기는 다섯)
- 라운드: 18
- 까닭: `08-design-a-to-z.md:575`
- 충돌:
  > `08-design-a-to-z.md:575`의 "`push`·`remove`·`update`"는 SURFACE-005와 다르다: 배열 쓰기는 `push`·`pop`·`update`·`remove`·`clear` 다섯이다(SURFACE-005). SURFACE-005가 이긴다(`08-design-a-to-z.md:411`).

### LANDING-066 PR-6 상태 키와 제어 — 결합(OR/AND)·`controls.children`·조각 `controls`·`unsetOnInactive`의 정책

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-6 상태 키와 제어 | `controls.visible`·`controls.readOnly`·`controls.disabled`·표준 `readOnly`의 결합(OR/AND), `controls.children`, 조각 `controls`, `unsetOnInactive`의 층·식의 값(직전 커밋)·하위 트리로 내려가는 정책(R17-2 ㄴ), 겉면의 계산 게터(`visible`·`enabled`·`readOnly`·`disabled`) | PR-3 | `controls.children` 세부. 조각에 따라 터미널 전략이 바뀌는 경로는 17라운드 스웜 수렴(편집자 결정)으로 닫혔다(선언 사이 정적, §9) |
- 보충:
  > 반영 칸(개발계획 P3·P4): "인접 단계 합침 둘을 채택한다: 기반(PR-0의 코드 부분)과 청사진(PR-1)은 한 PR, 파생(PR-3)과 상태 키·제어(PR-6)는 한 PR." (`reviews/round-18-owner-answers.md:44`)
  > 편집자 결정(28C-02): "【추론】 계산 게터 `enabled`는 `active && visible`이다: 원장은 이 게터를 이름만 적었고(26C-01, LANDING-066, `reviews/raw-round17-node-structure.md:136`) 뜻을 새로 정하지 않았으므로 옛 엔진 `AbstractNode.enabled`의 뜻을 유지한다(뜻을 바꾸는 이주는 LANDING 이주 항목으로 적는 것이 원장의 방식이고 `enabled`에는 그런 항목이 없다)." (`reviews/round-28-closing.md:22`)
  > 편집자 결정(28C-02): "【추론】 `visible`·`readOnly`·`disabled` 게터는 CONTROLS-082의 로컬 결합 결과(잠금은 OR, 표시는 AND, 자리 넷)를 돌려주며, Form 속성의 전체 잠금은 렌더 계층이 그 위에 OR하므로 코어 게터에 들지 않는다." (`reviews/round-28-closing.md:24`)
  > 편집자 결정(28C-07): "【추론】 코어 게터 `watchValues`(CONTROLS-032)는 PR-6, 곧 04의 겉면 멤버다: `reviews/raw-round17-node-structure.md:136`이 계산 상태 게터 여섯 가운데 `active`를 뺀 다섯을 PR-6으로 적었고, 26C-01이 LANDING-066의 넷만 인용한 것은 그 목록을 닫은 것이 아니다." (`reviews/round-28-closing.md:75`)
  > 편집자 결정(28C-07): "【추론】 `FormTypeInputProps.watchValues`로 넘기는 일은 PR-7 렌더 계층이고, LANDING-137(`omitEmpty` 아래 빈 문자열이 `undefined`)은 게터가 방출 트리를 읽는 결과이므로 PR-6의 게터에 든다; EVENT-064의 계산 상태 비트에 `watchValues`가 드는 것은 PR-4 배달의 몫이다." (`reviews/round-28-closing.md:77`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:576`(정본), `09-landing-and-test-strategy.md:37`, `reviews/round-18-owner-answers.md:44`, `09-landing-and-test-strategy.md:258`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 17라운드 스웜 수렴(편집자 결정, 터미널 전략은 선언 사이 정적), 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4), 편집자 결정(18라운드, LANDING-092; 하위 트리 규칙은 PR-2)
- 라운드: 18
- 까닭: `08-design-a-to-z.md:576`
- 충돌:
  > `08-design-a-to-z.md:576`의 "`unsetOnInactive`의 층·식의 값(직전 커밋)·하위 트리로 내려가는 정책(R17-2 ㄴ)"는 LANDING-092와 다르다: 나감 비움의 하위 트리 규칙은 PR-2가 세우고, PR-6은 `children` 항목 층·조각 `controls` 층·식 값(직전 커밋)을 더한다(LANDING-092, TEST-069). LANDING-092가 이긴다(`09-landing-and-test-strategy.md:258`).

### LANDING-067 PR-7 전환 — `nodeFromJSONSchema` 재구축, React 바인딩 연결, Form 속성, 바운더리, 옛 코드 삭제, UI 플러그인 이주

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-7 전환 | `nodeFromJSONSchema`를 새 엔진 위에 다시 짓고, React 바인딩(`providers`·`hooks`·`components`)을 새 값 채널(`value`·`outputValue`)과 통지에 연결, Form 속성(`readOnly`·`disabled` 전체 잠금, `unsetOnInactive`, `disableAutomaticWrites`, `onError`, `onDiagnosticsChange`, `validatorFactory`, 렌더러 넷 `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`), 청사진 오류의 생성 자리 포착과 대체 화면, 마운트 정착 오류의 원인별 처리(§11.3), 루트·필드 바운더리의 가두고 보고하기(17라운드 스웜 수렴(편집자 결정), 09 §2.3의 넷째), `degraded` 동안의 제출 거부(네이티브 submit은 `onError`와 싱크로)와 검증 불가의 거부(R17-1 나), 터미널 전략과 병합의 원자(렌더 계층의 터미널 판정 함수와 원자 판정 함수를 청사진에 넘김, §9·§12), 명령, 레거시로 옮긴 옛 `core/nodes`·`parsers`·매니저·전처리 삭제, `core/index.ts`의 수출을 `src/core/SchemaNode/` 진입점으로, `node.group` → `node.strategy`의 소비자 이주(§14의 40행), 렌더 시나리오 438건의 처분(09 §4.3. 17파일은 단언을 이름만 바꿔 살린다, 16라운드 답 7), UI 플러그인 넷의 타입과 등록 키 대응, UI 플러그인 27파일의 `presentation.*` 이주, `SchemaNodeInput`의 흐림 처리에서 `Blurred` 발행을 입력 마침 신호 `finishInput`으로 바꿈(`options.trim`은 문자열 행의 `finishInput` 칸이 판단, R17-3), `ChildNodeComponentProps`·`FormGroupProps`의 prop `FormTypeRenderer` → `FormTypeGroupRenderer`, `SchemaNodeInput.handleChange`의 세 진입(값 쓰기·외부 오류 지움·dirty)을 `batch` 하나로 묶기, 입력 출처 표식(Refresh 판정과 폐기된 노드의 늦은 입력 쓰기 판별용 내부 통로), 마운트 로드 정착 동안 `onChange`·`onDiagnosticsChange`는 버리고 `onError`는 커밋 뒤 한 번 전달하는 계약과 마운트 로드의 검증 요청을 준비 시점에 내는 것(17라운드 스웜 수렴(편집자 결정), 09 §2.3의 첫째), `onError`의 렌더 계층(바깥 감싸개와 인스턴스 보고기 문맥, 로드 기록의 준비 이펙트 전달과 대체 화면 이펙트 전달, 바운더리의 렌더 때 보고기 읽기와 `componentStack`, 네이티브 submit 경로의 오류 층 거부를 `onError`와 싱크로), `@winglet/react-utils` ErrorBoundary와 감싸개 둘의 렌더 때 보고 함수를 얻는 선택 인자(소유자 허용. 그 모듈의 `DETAIL.md`를 먼저 갱신한다, 17라운드 스웜 수렴(편집자 결정)), React 18 실행 시험(16라운드 답 5), `useFormTypeInput`의 메모 의존에 유효 스키마 참조 추가와 `SchemaNodeProxy`의 유효 스키마 변경 비트 구독, 배달 경로의 렌더 계층 구독(09 §2.4), `Form`의 스키마 `clone`(`preprocessSchema(clone(inputJSONSchema))`) 제거(작성 루트 객체를 가드 캐시의 키로 지킨다. `defaultValue`의 `clone`은 이 항목이 아니다), `reset`의 로드 전환(같은 스키마 판정, 커밋 재대조, 호출 안의 재생성, 입력 판정과 노드가 드는 Refresh 번호, 상호작용 초기화 번호), 로드의 검증 규칙(마운트 포함, §14의 38행), `setValue(V)`의 같은 입력 판정(§14의 39행)(09 §2.6, 16라운드 스웜 수렴(편집자 결정)), `@winglet/react-utils`의 changeset(`minor`), 벤치 비교 | PR-1 – PR-6 전부 | 성능 예산 수치(18라운드 안건 E, 소유자 정책), 브라우저 IME 확인, 노드 `resetSubtree`의 존치와 입력 판정의 구현 확인(§15), `trim` 쓰기의 부수 효과(18라운드 안건), `@winglet/react-utils` 선택 인자의 모양, 네이티브 submit 경로의 검증 실패(`ValidationError`) 처리(오늘은 미처리 거부, `Form.tsx:127-133`, `getTrackableHandler.ts:429-431`) |
- 보충:
  > 편집자 결정(18C-49): "【추론】 규칙 4: PR-7은 진입점을 새 엔진으로 바꾸고 `src/__legacy__/`를 통째로 지운다." (`reviews/round-18-closing.md:1342`)
  > 편집자 결정(18C-49): "【추론】 그 점검은 그 디렉토리와 그것을 가리키는 import가 하나도 없는 것이다." (`reviews/round-18-closing.md:1343`)
  > 반영 칸(개발계획 P2): "`src/__legacy__/`는 PR-7이 지우지 않고 정리·릴리스 PR(PR-8)까지 참고용으로 보존한다." (`reviews/round-18-owner-answers.md:43`)
  > 반영 칸(개발계획 P1): "UI 플러그인 넷(antd5·antd6·antd-mobile·mui)의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR(우산 순서 N+1, PR-7 뒤)이 한다." (`reviews/round-18-owner-answers.md:42`)
  > 소유자(27라운드, 최종 검사의 자리): "최종 검사는 리액트 jsdom 등에서 평가되어야 함" (`reviews/round-27-owner-answers.md:10`) — `<Form>`은 PR-7까지 옛 엔진을 섬기므로(LANDING-159 규칙 3) 새 엔진의 React·jsdom 성능 평가는 PR-7 전환의 게이트다: PR-7은 새 엔진으로 전환한 `<Form>`을 jsdom(render 프로젝트)과 `benchmark-form`으로 재어 옛 엔진 기준선과 견주고, 느린 행은 TEST-027 절차를 따른다. PR-2는 옛 엔진의 jsdom render 시험에 회귀가 없음과 `benchmark-form`의 React 경로가 그대로임만 확인한다.
  > 편집자 결정(68C-01): "【추론】 "렌더 시나리오 438건"(LANDING-067, 08 §18의 PR-7 행)과 "447건이 통과하므로"(TEST-023, 09 §5.1)는 설계 시점에 `src/__tests__`를 센 수이고, 원장 어디에도 파일 이름 목록이나 17파일의 이름 목록은 없다(TEST-005의 원문은 기준만 적었고, 설계서 07의 네 부류 표는 대표 이름 여섯뿐이다). 그러므로 수는 구속이 아니고 처분이 구속이다: 07은 전환 직전 커밋의 `src/__tests__`(그리고 `src` 전체의 렌더 시험)를 파일·건수로 세어 처분표를 `verification/07-switch/`에 새로 만들고, 파일마다 09 §4.3의 세 처분(그대로 산다·버리고 새로 쓴다·표면만 고친다) 가운데 하나와 그 까닭을 적으며, "표면만 고친다"에서 조합(`oneOf`·`anyOf`·`if`·`allOf`의 옛 자동 감지)과 옛 키(`presentation.*`로 옮긴 것, `group`, `JSONSchemaError` 등 이주 표가 바꾼 이름)가 없는 파일이 TEST-005의 17파일이다. 수가 17과 다르게 나오면 처분표에 센 기준과 함께 적고 TEST-005를 고치지 않는다(옛 글은 자라기만 한다; 17은 소유자가 받아들인 예외의 범위를 적은 수이지 파일 수의 약속이 아니다). 438·447과 오늘 수의 차이는 `plan/07-switch/log.md`에 한 줄로 남긴다. 이 처분표가 PR-7의 렌더 시나리오 게이트이고, 전환 뒤 `render` 프로젝트의 초록은 처분표의 "산다"·"표면만 고친다" 파일 전부가 돈다는 뜻이다." (`reviews/round-68-closing.md:9`)
  > 편집자 결정(68C-05): "【추론】 앞선 답(07 착수 전 물음 1)의 "`src/**`, `verification/**`, `plan/07-switch/**`, PLAN §3·§4의 07 행"은 `architecture/` 안에서 원장 관리자와 단계 작업자가 나눠 갖는 문서의 경계였고, 코드의 범위는 PR-7의 원장 행이 정한다. LANDING-067·095가 이름 댄 것(옛 스토리 49파일 정리와 시나리오 스토리·`playScenario`, `renderForm` 다섯과 부류별 e2e 실행기, `node.group`·`FormTypeRenderer`의 플러그인 쪽 소비자 이주, `@winglet/react-utils`의 바운더리 선택 인자), TEST-026이 이름 댄 것(`@aileron/benchmark-form`의 새 항목과 `fixtures/equivalent`, `bench/`, `.github/workflows/performance-benchmarks.yml`), REACT-017이 요구하는 React 18 실행 시험의 개발 의존(그에 따른 `yarn.lock`), 그리고 그것들이 돌게 하는 설정(`.storybook/`, `vite.config.ts`, `eslint.config.js`, `package.json`)은 모두 07의 경로다. `@aileron/schema-form-scenarios`는 시나리오 스토리와 e2e 실행기가 읽는 데이터 모듈이라 LANDING-087의 "그대로 쓰는 것"에 들고, 07은 전환이 요구하는 추가만 한다. 이 밖의 경로(다른 패키지, 저장소 설정)에 손대야 하면 쓰기 전에 물음으로 보낸다. 플러그인 패키지의 `src`는 68C-07의 범위 안에서만 고친다." (`reviews/round-68-closing.md:37`)
  > 편집자 결정(69C-05): "【추론】 LANDING-041은 "마운트의 검증 요청은 렌더 계층의 준비 시점(폼이 커밋된 뒤, 오늘 `handleReady`의 자리), reset은 진입 끝에서 내며 … core만 쓰는 호스트(C3)는 마운트 검증을 직접 요청한다"고 둘을 갈랐고, LANDING-067의 PR-7 행이 그것을 전환의 일로 두었다. 오늘 `dispatchMount`가 사슬 끝에서 루트 검증을 요청하는 것은 core만 쓰는 호스트의 모양이므로 결함이 아니고, 바인딩이 쓸 길이 없는 것이 빈자리다. 07은 마운트 진입에 선택 인자(검증 요청을 미룸)를 더해 바인딩 전용 마운트 함수(69C-01)가 그것을 켜고, 준비 이펙트에서 루트 검증을 요청한다(규칙은 LANDING-041 "로드 뒤 `OnChange` 비트면 한 번"). 그래서 StrictMode가 버리는 둘째 `useMemo` 트리는 커밋되지 않아 준비 이펙트가 없고 검증도 돌지 않으며, 로드 기록이 커밋된 로드 객체에 붙는 규칙(`reviews/raw-round17-onerror.md:55`)과 맞는다. 선택을 켜지 않은 호출(core만 쓰는 호스트, 오늘의 시험)은 동작이 바뀌지 않는다." (`reviews/round-69-closing.md:37`)
  > 편집자 결정(70C-01): "【추론】 서명은 `nodeFromJSONSchema<Schema extends JSONSchema>(props: { jsonSchema: Schema; defaultValue?: InferValueType<Schema>; validator?: Validator; validationMode?: ValidationMode; context?: Dictionary; onChange?: (value: InferValueType<Schema> | undefined) => void; onStateChange?: () => void; errorReporter?: FormErrorReporter; unsetOnInactive?: boolean; disableAutomaticWrites?: boolean; isTerminal?: (schema: JSONSchema) => boolean | undefined; isAtomic?: (value: unknown) => boolean; deferMountValidation?: boolean }): InferSchemaNode<Schema>`이고 돌려주는 것은 마운트가 끝난 루트다. 칸마다 근거가 있다: `validator`는 함수 `validatorFactory`가 `{ compile, compileGuard, … }` 객체로 바뀌는 32C-01과 같은 방향이며 형은 새 엔진 쪽 `core/validation/type.ts`의 `Validator`다(공개 index가 아닌 모듈에서 내보냄, 32C-01); `context`는 옛 `contextNode`(`contextNodeFactory`의 노드)를 값으로 바꾼 것으로 `SchemaNode/`의 `setContext`가 받는 값이다; `errorReporter`는 05가 core 인자로 둔 보고기(`report`·`hasConsumer`, LANDING-064 PR-4 행)이고 `isTerminal`·`isAtomic`은 REACT-003이 렌더 계층이 넘긴다고 한 판정 둘이며 core만 쓰는 호스트가 주지 않으면 판정이 없다; `deferMountValidation`은 69C-05의 미룸 선택으로 기본은 꺼짐이라 켜지 않은 호출은 오늘대로 사슬 끝에서 검증을 요청한다. 안에서는 69C-01의 바인딩 전용 통로 가운데 "트리 생성(마운트 없음)"과 "마운트"를 차례로 부르고, `<Form>`은 첫 마운트에서 이 함수를(`deferMountValidation: true`, 버퍼형 보고기) 부르며 재생성 reset은 같은 트리 생성 통로 → 인계 → 마운트를 부르므로 두 경로가 같은 생성 함수를 지난다 — VALIDATE-010 "직접 부르는 경로와 `<Form>` 경로가 같은 계약"의 구현이다." (`reviews/round-70-closing.md:9`)
  > 편집자 결정(70C-01): "【추론】 이주 행은 두지 않는다. 이주 표(LANDING-004–050과 그 뒤의 이주 행)는 소비자 겉면(`src/index.ts`가 내보내는 것)의 오늘 동작과 새 동작을 적는 표이고, `nodeFromJSONSchema`는 오늘도 `src/core/index.ts`만 이름으로 내보내며 `src/index.ts`는 내보내지 않으므로(`src/core/index.ts:1`) SURFACE-058의 약 54에 들지 않고 SURFACE-059의 대조 목록에도 들지 않는다. 대신 07은 이주 점검표(68C-02)의 끝에 "코어 전용 진입의 서명 변경"으로 한 줄 적고(옛 `{ jsonSchema, defaultValue, onChange, validationMode, validatorFactory, contextNode }` → 새 서명), 옛 `contextNodeFactory` 내보내기는 옛 엔진과 함께 `src/__legacy__/`로 가며 `core/index.ts`에서 빠진다. `core/index.ts`는 새 `nodeFromJSONSchema`를 이름으로 내보내고(와일드카드 금지), `src/index.ts`는 오늘처럼 내보내지 않는다. 문서 주석은 "core만 쓰는 호스트의 진입; `<Form>`은 같은 생성 통로를 바인딩 전용 함수로 부른다"를 적는다." (`reviews/round-70-closing.md:10`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:577`(정본), `09-landing-and-test-strategy.md:21,24,26,38,261`, `adr/0014-error-policy.md:178-184`, `reviews/round-18-closing.md:1342-1343`, `reviews/round-18-closing.md:2730-2731`, `reviews/round-18-owner-answers.md:43`, `reviews/round-18-owner-answers.md:42`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 소유자 답(`reviews/round-17-owner-answers.md:34` (나)), 소유자 답(`reviews/round-16-owner-answers.md:11,13` 5·7), 16라운드 스웜 수렴(편집자 결정, reset·로드·`setValue(V)`), 17라운드 스웜 수렴(편집자 결정, 바운더리·마운트 계약), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94), 소유자 답(`reviews/round-18-owner-answers.md:43` 개발계획 P2), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1)
- 라운드: 18
- 까닭: `08-design-a-to-z.md:600-601`, `reviews/round-18-closing.md:1365-1368`
- 충돌:
  > `08-design-a-to-z.md:577`의 "`setValue(V)`의 같은 입력 판정(§14의 39행)"은 18라운드 결정과 다르다: 로드가 아닌 쓰기(`setValue(V)` 포함)는 원본이 실제로 바뀐 노드에만 Refresh를 내고 쓴 입력 자신은 제외하며, "값이 같아도 낸다"는 로드의 새 수명에만 해당한다(EVENT-071, LANDING-199). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2730-2731`).
  > `08-design-a-to-z.md:577`의 "레거시로 옮긴 옛 `core/nodes`·`parsers`·매니저·전처리 삭제"는 소유자 답과 다르다: 레거시 디렉토리는 PR-8까지 보존하고 PR-7은 레거시 import 0만 점검한다(LANDING-205). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:43`).
  > `08-design-a-to-z.md:577`의 "UI 플러그인 27파일의 `presentation.*` 이주"는 소유자 답과 다르다: UI 플러그인 넷의 이주는 PR-7 뒤의 플러그인 PR이 하고 PR-7은 기본 입력으로 검증한다(LANDING-206). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:42`).
  > `08-design-a-to-z.md:577`의 "성능 예산 수치(18라운드 안건 E, 소유자 정책)"는 18라운드 결정과 다르다: 닫혔다 — 예산의 수치는 기존 `guard:check`의 선이다(TEST-073). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:816`).
  > `08-design-a-to-z.md:577`의 "`trim` 쓰기의 부수 효과(18라운드 안건)"는 18라운드 결정과 다르다: 닫혔다 — `trim`은 `finishInput` 칸의 자동 쓰기이고 바깥 오류와 dirty는 그대로다(WRITE-083, LANDING-145). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:594-597`).
  > `08-design-a-to-z.md:577`의 "노드 `resetSubtree`의 존치와 입력 판정의 구현 확인(§15)"은 18라운드 결정과 다르다: `resetSubtree()`의 존치는 닫혔고(WRITE-085, `resetSubtree()`와 게터 `defaultValue`를 남김) 입력 판정의 구현 확인만 PR-7 게이트로 남는다(REACT-028). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:911-913`).

### LANDING-068 PR-8 릴리스 — README·docs, ADR 0010 최종, 이주 안내와 프롬프트, changeset과 `CHANGELOG.md`, 릴리스 테스트

- 결정:
  > | PR | 내용 | 의존 | 착수 전 닫을 것 |
  > | --- | --- | --- | --- |
  > | PR-8 릴리스 | README·docs 재작성, ADR 0010 최종, 이주 안내와 이주 프롬프트(`docs/agents`), changeset(파괴적 변경, `fixed` 무리 전체 `major`. 1.0.0-beta 프리릴리스 뒤 1.0.0, 09 §6.2의 열넷째)과 `CHANGELOG.md`, 포장된 산출물의 릴리스 테스트(09 §6.2, 16라운드 스웜 수렴(편집자 결정)), README·docs의 reset 규칙(09 §2.6의 열여섯째), README·docs의 `onError` 코드 표(코드, level, 부류, 언제, 누구 잘못, 기본 드러남)와 판 규칙 | PR-7 | 릴리스 전환 PR(09 §6.2, 저장소 전체)의 병합 |
- 보충:
  > 반영 칸(개발계획 P2): "디렉토리 삭제는 PR-8이 한다." (`reviews/round-18-owner-answers.md:43`)
  > 편집자 결정(75C-01): "【추론】 이주 안내의 정식 자리는 PR-8의 "이주 안내와 이주 프롬프트(`docs/agents`)"(LANDING-068)다. 07은 그 재료를 이주 점검표(68C-02, `verification/07-switch/migration-check.md`)에 적는다 — 호환 별칭 `JSONSchemaError`의 종료(34C-02·50C-01, 74라운드)는 그 표에 "공개 표면 잔여의 거취" 행으로 한 줄이면 족하고, PR-8이 그 표의 행들을 소비자용 이주 안내로 옮겨 쓴다. `isJSONSchemaError`가 별칭이 아니라 오류 분류의 throw 클래스 `JSONSchemaError`의 판별 함수라 남는 것은 맞다(ERROR 영역의 클래스이지 LANDING-024 이주 21의 인터페이스가 아니다)." (`reviews/round-75-closing.md:10`)
- 상태: 현행
- 출처: `08-design-a-to-z.md:578`(정본), `09-landing-and-test-strategy.md:262`, `reviews/round-18-owner-answers.md:43`, `09-landing-and-test-strategy.md:237`
- 닫은 사람: 소유자 답(`00-goals.md:111` C8), 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 소유자 답(`reviews/round-16-owner-answers.md:22` PR-8의 판 번호), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2), 소유자 답(`reviews/round-18-owner-answers.md:43` 개발계획 P2), 편집자 결정(18라운드, TEST-045; `CHANGELOG.md`는 action이 만듦)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:225`
- 충돌:
  > `08-design-a-to-z.md:578`의 "1.0.0-beta 프리릴리스 뒤 1.0.0, 09 §6.2의 열넷째)과 `CHANGELOG.md`"는 TEST-045와 다르다: `changeset version`은 `changesets/action` 안에서만 돌므로 `CHANGELOG.md`는 병합 뒤 그 작업 흐름의 판 올림 PR이 만들고 PR-8은 changeset만 쓴다(TEST-045). TEST-045가 이긴다(`09-landing-and-test-strategy.md:237`).

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
- 충돌:
  > `08-design-a-to-z.md:599`의 "스키마 읽기 27파일을 `presentation.*`로 옮기는 작업을 포함한다"는 소유자 답과 다르다: UI 플러그인 넷의 `presentation.*` 이주는 PR-7이 아니라 플러그인 PR(우산 순서 N+1)이 하고 PR-7은 기본 입력으로 검증한다(LANDING-206). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:42`).

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
- 출처: `09-landing-and-test-strategy.md:20`(정본), `08-design-a-to-z.md:571,598`, `reviews/round-18-closing.md:196`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-16-owner-answers.md:16` 10), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-08; 레거시 `const` 깊은 비교)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:20`
- 충돌:
  > `09-landing-and-test-strategy.md:20`의 "옛 `intersect*Schema`는 공집합 표시를 받으면 오늘처럼 던지도록 고쳐 옛 동작을 PR-7까지 지킨다"는 18라운드 결정과 다르다: 레거시의 `const` 비교는 깊은 비교로 바뀌며(결함 수정), 이것이 옛 동작을 PR-7까지 지킨다는 규칙의 예외다(SCHEMA-043). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:196`).
  > `09-landing-and-test-strategy.md:20`의 "18라운드 안건 '전환 방식의 세부'"는 18라운드 결정과 다르다: 그 안건은 닫혔다 — PR-7은 진입점을 새 엔진으로 바꾸고 새 코드가 레거시를 가리키는 import가 0임을 점검하며 옛 코드는 `src/__legacy__/`에 보존한다(LANDING-159, LANDING-205). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:1330-1363`).

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
- 보충:
  > 반영 칸(개발계획 P1): "UI 플러그인 넷(antd5·antd6·antd-mobile·mui)의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR(우산 순서 N+1, PR-7 뒤)이 한다." (`reviews/round-18-owner-answers.md:42`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:24`(정본), `08-design-a-to-z.md:469,599`, `reviews/round-18-owner-answers.md:42`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:24`
- 충돌:
  > `09-landing-and-test-strategy.md:24`의 "27파일이 `options.*`·맨 키를 읽으므로 PR-7이 `presentation.*`로 옮긴다"는 소유자 답과 다르다: 옮기는 것은 PR-7 뒤의 플러그인 PR이다(LANDING-206). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:42`).

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
- 충돌:
  > `09-landing-and-test-strategy.md:25`의 "설계 빈틈 넷과 공개 표면의 크기는 18라운드 안건"은 18라운드 결정과 다르다: 그 안건은 닫혔다 — 설계 빈틈 넷(N2·N5·N6·N14)은 NODE-043·NODE-045·NODE-046·NODE-047이, 공개 표면의 크기는 SURFACE-058이 닫았다. 18라운드 결정이 이긴다(`reviews/round-18-closing.md:911-913`).

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
- 보충:
  > 편집자 결정(25C-07): "【추론】 잎 교차 함수의 새 fractal은 `src/helpers/schemaIntersection/`이고, 공집합 표시는 `EMPTY_INTERSECTION`(Symbol)이며, `EMPTY_INTERSECTION`과 함께 이름으로 내보내는 함수는 `intersectConst`·`intersectEnum`·`intersectMaximum`·`intersectMinimum`·`intersectMultipleOf`·`validateRange` 여섯이고, `intersectPattern`은 SCHEMA-043대로 레거시에 남는다." (`reviews/round-25-closing.md:68`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:32`(정본), `08-design-a-to-z.md:571`, `reviews/round-18-closing.md:186,193`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-08; 잎 교차 함수의 뜻 변경)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:20`
- 충돌:
  > `09-landing-and-test-strategy.md:32`의 "잎 교차 함수, `jsonPointer`"는 18라운드 결정과 다르다: 잎 교차 함수 가운데 `intersectConst`는 깊은 비교로 뜻이 바뀌고 `intersectPattern`은 새 fractal로 옮기지 않는다(SCHEMA-043). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:193`).

### LANDING-082 정착 지도 PR-2 — 부딪히는 코드, 그대로 쓰는 것과 옮길 자리, 새 fractal 다섯

- 결정:
  > | PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
  > | --- | --- | --- | --- |
  > | PR-2 트리·정착 | `AbstractNode`의 `onChange` 전파·`__scoped__`·`__reset__`·루트 매크로태스크 디바운스, `ObjectNode` 전략 선택, `getNodeGroup`의 `isReactComponent`(원리 다섯째 'core는 렌더러를 모른다' 위반), `core/parsers/*`(ADR 0013 충돌), `BranchStrategy.ts` | `getResolveSchema`($ref 깊이 1 지연), `extractSchemaInfo`, `omitEmptyObject`(`behaviors/objectBehavior/utils/`로), `findNode`·`traversal`(`navigation/`으로 옮기며 고친다. 기대는 멤버의 존폐는 18라운드 안건 N2), `shallowPatch`(`record/`로) | `src/core/record/`, `src/core/behaviors/`(잎 넷, `objectBehavior/`의 `branch/`·`terminal/`, `virtualBehavior/`. 터미널 배열은 PR-5), `src/core/navigation/`, `src/core/SchemaNode/`, `src/core/settle/` |
- 보충:
  > "확정(나). parse는 뜻이 그대로인 변환만 한다(ajv 규칙 수준). 오늘 파서의 문자 제거, 정수 자르기, 빈 값 치환(`""`, `[]`, `{}`), 불리언의 진릿값 변환은 parse에서 뺀다." (`reviews/round-18-owner-answers.md:8`)
  > "`parsers`의 새 자리는 18라운드의 노드 구조 항목에서 정한다" (`reviews/round-18-owner-answers.md:7`)
  > 편집자 결정(18C-49): "【추론】 예를 들어 PR-2는 `src/core/nodes`, 그것이 가져오는 `src/core/parsers`(→ `src/__legacy__/core/parsers/`), 옛 `src/core/__tests__`를 옮긴다." (`reviews/round-18-closing.md:1334`)
  > 편집자 결정(18C-36): "【추론】 S1 parse 함수는 `src/core/behaviors/utils/parse/`에 둔다." (`reviews/round-18-closing.md:988`)
  > 편집자 결정(18C-36): "【추론】 PR-2는 이 자리에 S1 변환(`reviews/round-18-owner-answers.md:9`의 변환 목록, WRITE-052)만 하는 parse를 새로 둔다." (`reviews/round-18-closing.md:993`)
  > 편집자 결정(18C-36): "【추론】 오늘의 `src/core/parsers/`는 그것을 가져오는 옛 노드와 함께 `src/__legacy__/core/parsers/`로 옮긴다(18C-49)." (`reviews/round-18-closing.md:994`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:33`(정본), `08-design-a-to-z.md:572`, `reviews/round-18-owner-answers.md:7-8`, `09-landing-and-test-strategy.md:9`, `reviews/round-18-closing.md:988,993-994,1334`, `reviews/round-18-closing.md:17,927,931,2698`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 17라운드 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:38`·`reviews/raw-round17-node-structure.md:154`; 소유자 이견 없이 권고대로 확정된 칸), 소유자 답(`reviews/round-17-owner-answers.md:42` 4 종류 모듈), 소유자 답(`reviews/round-18-owner-answers.md:7` S1; 파서를 가져온다), 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; 뜻이 그대로인 변환만), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49·18C-36), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-01·18C-33·18C-93; 형 판정·탐색 멤버 대체)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:100`, `reviews/round-18-closing.md:1365-1368`, `reviews/round-18-closing.md:997-999`
- 충돌:
  > `09-landing-and-test-strategy.md:33`의 "`core/parsers/*`(ADR 0013 충돌)"는 18라운드 소유자 답과 다르다. 18라운드 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:7-8`, WRITE-052): 노드마다 타입에 맞는 parse를 두되 뜻이 그대로인 변환만 하며, 새 parse는 `src/core/behaviors/utils/parse/`에 두고 오늘의 `src/core/parsers/`는 옛 노드와 함께 `src/__legacy__/core/parsers/`로 옮긴다(NODE-056, WRITE-056).
  > `09-landing-and-test-strategy.md:9`의 "옛 엔진의 내부(분기 자동 감지, 마이크로태스크 배칭, 파서 변환, 전역 상속)"는 파서 변환을 교체 대상에 넣은 점에서 18라운드 소유자 답과 다르다. 18라운드 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:7-8`, WRITE-052): 노드마다 타입에 맞는 parse를 두되 뜻이 그대로인 변환만 하며, 새 parse는 `src/core/behaviors/utils/parse/`에 두고 오늘의 `src/core/parsers/`는 옛 노드와 함께 `src/__legacy__/core/parsers/`로 옮긴다(NODE-056, WRITE-056).
  > `09-landing-and-test-strategy.md:33`의 "`src/core/behaviors/`(잎 넷"은 18라운드 결정과 다르다: PR-2의 동작 행에 (가칭) `union` 행이 다른 잎 행과 함께 든다 (BLUEPRINT-043). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:79`).
  > `09-landing-and-test-strategy.md:33`의 "`getResolveSchema`($ref 깊이 1 지연), `extractSchemaInfo`"는 18라운드 결정과 다르다: 청사진은 `$ref`를 대상 위치마다 한 번 분석해 그 분석을 가리키고(BLUEPRINT-030), 형 판정은 `extractSchemaInfo`의 형 부분을 대신하는 허용 집합 도우미가 PR-1 청사진에서 맡는다(BLUEPRINT-044). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2698`).
  > `09-landing-and-test-strategy.md:33`의 "기대는 멤버의 존폐는 18라운드 안건 N2"는 18라운드 결정과 다르다: `find`는 형상에 있는 노드만 돌려주고, `detectsCandidate`와 첫 후보로 물러나는 규칙, 내부 칸 `variant`·`scope`·`oneOfIndex`·`anyOfIndices`는 폐기한다(NODE-043). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:931`).
  > `reviews/round-18-owner-answers.md:7`의 "`parsers`의 새 자리는 18라운드의 노드 구조 항목에서 정한다"는 18라운드 결정과 다르다: 닫혔다 — 새 parse는 `src/core/behaviors/utils/parse/`에 둔다(NODE-056). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:988`).

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
- 보충:
  > 편집자 결정(33C-01): "【추론】 배열 쓰기 동사 `push`·`pop`·`update`·`remove`·`clear`는 EVENT-027의 공개 쓰기 API이므로 그 진입 함수는 LANDING-084대로 `dispatch`가 쓰기 동사마다 하나씩 소유한다; `arrayBehavior/`나 노드 겉면이 따로 진입 사슬(진입 깊이 카운터, `onChange`, 사슬 끝 throw)을 갖지 않는다." (`reviews/round-33-closing.md:9`)
  > 편집자 결정(33C-01): "【추론】 원장은 `dispatch/` fractal을 PR-4에, 배열 동사를 PR-5에 두었고 둘이 병렬이므로 배열 동사의 진입 파일을 어느 PR이 더하는지는 적지 않았다; 05·06이 합의한 "뒤에 머지하는 쪽이 더한다"는 그 빈자리를 채우는 것이며 LANDING-084와 어긋나지 않는다. 조건은 둘 다 머지된 뒤 모든 쓰기 동사의 진입 함수가 `dispatch/`에 있고 겉면의 쓰기 위임이 그 진입을 거치는 것(LANDING-064 "겉면의 쓰기 위임을 `dispatch` 진입으로 옮김")이다." (`reviews/round-33-closing.md:10`)
  > 편집자 결정(33C-01): "【추론】 06이 먼저 머지되면 그 동사는 03(PR-2)이 겉면 쓰기를 둔 모양 — 정착 호출 하나(TEST-069 "PR-2에서 사슬은 settle 호출 하나다") — 을 따르고, 05가 머지되는 쪽(또는 06이 뒤라면 06)이 겉면 위임을 `dispatch` 진입으로 옮기면서 배열 동사 다섯의 진입 파일을 더한다; `batch` 안의 배열 동사가 형제 진입으로 합쳐지는 것(EVENT-035)과 진입당 `onChange` 한 번은 그 뒤에만 성립하므로 06의 시험은 그 둘을 단언하지 않는다(03 log §4의 `batch` 사례 배분과 같다)." (`reviews/round-33-closing.md:11`)
  > 편집자 결정(34C-01): "【추론】 LANDING-084는 PR-4의 새 fractal 칸에 "`app/plugin/type.ts` 개정"을 적었고 VALIDATE-044는 플러그인이 `Validator`에 소비자 훅 `bind?`만 더 가진다고 했으므로, 플러그인이 구현하고 가져오는 계약 형은 오늘도 공개 index가 내보내는 `ValidatorPlugin`이며 그 개정은 PR-4의 몫이다; 32C-01의 "새 계약 형은 공개 index가 아닌 새 엔진 쪽 모듈에서 내보낸다"는 코어가 받는 계약 형 `Validator`(가칭)와 Form 속성 `validatorFactory`의 공개 형에 한한 말이고, 플러그인용 `ValidatorPlugin`에는 미치지 않는다." (`reviews/round-34-closing.md:9`)
  > 편집자 결정(34C-01): "【추론】 PR-4의 `ValidatorPlugin` 개정은 더하기만 한다: `compileGuard?(root, pointer)`·`release?(root)`를 선택 멤버로 더하고, `compile` 결과 함수의 에러 정규화에 `rejectedKey`를 더한다; 선택으로 두는 까닭은 옛 엔진이 PR-7까지 공개 진입점을 섬기는 동안(LANDING-159 규칙 3) 소비자의 사용자 정의 플러그인이 형 검사에서 깨지지 않게 하는 것이며, 필수로 좁히는 것은 Form 속성이 `{ compile, compileGuard }` 객체가 되는 PR-7(LANDING-036 이주 33)에서 이주 항목과 함께 한다." (`reviews/round-34-closing.md:10`)
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
- 보충:
  > 편집자 결정(35C-04): "【추론】 NODE-009(behaviors 밖에서도 쓰는 것은 `blueprint/`로)와 LANDING-085·094(PR-5의 이동)대로 `resolveArrayLimits`는 `blueprint/`의 조직에 두고 청사진 진입점에서 이름으로 내보내며, 조각이 준 `minItems`·`maxItems`가 세어지도록 유효 스키마의 `schema`를 받는다(WRITE-022 "제약을 유효 스키마로 노출"); 코어는 채우지도 막지도 않는다." (`reviews/round-35-closing.md:32`)
  > 편집자 결정(35C-04): "【추론】 PR-5 안의 소비자는 옮긴 시험뿐이고 의도한 소비자는 렌더 계층의 입력 컴포넌트(PR-7·08)이므로 그 의도를 `blueprint/DETAIL.md`에 적는다(소비자 없는 내보내기는 의도를 적는다는 공개 계약 규칙); 레거시의 사본은 LANDING-159 규칙대로 `__legacy__`에 09까지 남고, 레거시가 옮긴 것을 가져오지 않는다." (`reviews/round-35-closing.md:33`)
  > 편집자 결정(35C-12): "【추론】 터미널 배열 행은 NODE-005대로 원본을 배열 전체로 들고 `push`·`pop`·`update`·`remove`·`clear`를 원본의 사본 위에서 수행해 호스트를 통째로 쓰며(아이템 노드·재인덱싱·아이템 스냅숏 이어 붙임이 없고 호스트 자신의 로드 스냅숏이 단위다), `project`가 LANDING-085가 `arrayBehavior/utils/`로 옮긴 `omitTrailing`·`omitEmpty` 보조로 자르고, 값이 `null`이면 동사는 무효 호출(35C-06)이며, VALUE-034의 빈자리 채움은 적용되지 않는다; 원본 B는 다른 터미널 노드처럼 호스트의 이전 `raw`만 적고 구조 로그는 두지 않는다." (`reviews/round-35-closing.md:98`)
  > 편집자 결정(36C-02): "【추론】 NODE-052는 자리 i의 청사진을 `prefixItems[i]`, 아니면 스키마인 `items`, 옛 철자 `items: [..]`이면 `additionalItems`로 정했는데 02 청사진은 `items: [..]`를 튜플로 컴파일하되 `additionalItems`를 컴파일하지 않으므로, 그 꼬리 자리의 아이템 템플릿 컴파일은 PR-5가 청사진에 더한다(아이템은 PR-5의 기제다, TEST-069 (라); LANDING-085가 `resolveArrayLimits`의 청사진 이동을 PR-5에 둔 것과 같은 결의 변경); 청사진 fractal의 DETAIL을 먼저 고치고 02의 기존 시험은 바꾸지 않는다." (`reviews/round-36-closing.md:17`)
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
- 보충:
  > 편집자 결정(71C-01): "【추론】 LANDING-087의 "지운다"는 새 엔진의 `core/types`에서 노드 형 묶음이 사라진다는 뜻이고, LANDING-205는 레거시를 PR-8까지 참고용으로 보존하되 그 안에 두면 tsc·eslint가 설정 변경 없이 따라간다고 했으므로(LANDING-159) 레거시는 전환 뒤에도 컴파일되어야 한다. 둘을 함께 지키는 길은 LANDING-159가 정한 옮김의 모양 그대로다: `src/core/types/node.ts`·`constructor.ts`의 내용을 `src/__legacy__/core/types/`에 같은 상대 경로로 두고(그 안의 `index.ts`가 이름으로 다시 내보냄), 레거시 파일의 가져오기는 별칭 접두만 바꾼다(`@/schema-form/core/types` → `@/schema-form/__legacy__/core/types`, 상대 경로 가져오기는 레거시 안의 묶음을 가리키도록 고침). 70C-01이 `contextNodeFactory`를 옛 엔진과 함께 레거시로 보낸 것과 같은 처분이다. 레거시가 계속 가져오는 `event`·`state`·`value` 형은 오늘 레거시가 이미 `core/types`에서 가져오던 것이고 형 전용이므로 규칙 2("레거시 → 새 코드는 08 §17.2가 이미 적은 곳만")의 허용 목록을 넓히지 않는다 — 다만 07은 그 형들의 뜻이 새 엔진에서 바뀌었다면(예: 상태 비트의 이름) 레거시 쪽 사본을 `src/__legacy__/core/types/`에 함께 두어 레거시가 새 형에 끌려가지 않게 한다. 새 fractal이 `__legacy__`를 가져오지 않는 규칙 1과 "새 코드가 레거시를 가리키는 import 0" 점검(LANDING-205)은 그대로이고, 옮긴 두 파일은 처분표(68C-01)와 이주 점검표(68C-02)가 아니라 `plan/07-switch/log.md`의 레거시 이동 목록에 적는다." (`reviews/round-71-closing.md:9`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:38`(정본), `08-design-a-to-z.md:577`, `reviews/round-18-owner-answers.md:42`
- 닫은 사람: 편집자 결정(16라운드 정착 검토), 17라운드 스웜 수렴(편집자 결정, `core/index.ts`의 진입점과 `core/types` 정리), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:38`
- 충돌:
  > `09-landing-and-test-strategy.md:38`의 "UI 플러그인 27파일"는 소유자 답과 다르다: UI 플러그인 넷(antd5·antd6·antd-mobile·mui)의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR(우산 순서 N+1, PR-7 뒤)이 한다(LANDING-206). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:42`).

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
- 보충:
  > 편집자 결정(25C-08): "【추론】 시나리오 데이터 모듈의 자리는 `packages/aileron/schema-form-scenarios/src/<부류>/<이름>.scenario.ts`이며 TEST-023의 `src/**/*.scenario.ts` 안이다." (`reviews/round-25-closing.md:76`)
  > 편집자 결정(25C-08): "【추론】 시나리오 감싸개는 `ScenarioForm`, 핸들 등록은 `registerScenarioHandle`, 핸들 찾기는 `findScenarioHandle`이다." (`reviews/round-25-closing.md:77`)
  > 편집자 결정(60C-01): "【추론】 filid의 분류는 "어댑터가 모듈 index를 보고하면 fractal"이고 "다른 이가 이름으로 부르면서 내부는 자유로이 바뀌는 디렉토리는 fractal"인데, 가족 디렉토리마다 `index.ts`가 그 가족의 장면 목록(`arrayScenarios` 등)을 이름으로 내보내고 패키지 루트 `index.ts`가 그것을 이름으로 가져오므로 가족은 자료 묶음이면서도 계약(장면 목록)을 가진 모듈이다; 그래서 문서 없이 예외로 두는 (A)는 분류를 거스르고, 뒤로 미루는 (C)는 같은 발견을 PR마다 다시 보게 하므로 (B)를 택한다. 문서는 짧다 — INTENT는 그 가족이 어느 동작 부류의 장면을 담는지와 자료 전용(실행·엔진 의존 없음, TEST-010)이라는 규약, DETAIL은 장면 파일 목록과 각 장면이 검증하는 원장 항목(배열 가족이면 TEST-018과 35C~48C의 결정들)이다. 패키지 INTENT의 "Families name value, settle, fill, exit, and union behavior"는 derive·controls·array를 더해 여덟으로 고친다." (`reviews/round-60-closing.md:9`)
  > 편집자 결정(60C-01): "【추론】 여덟 가족 모두 #353에서 한다: 소유자가 "시나리오 문서의 처리"라는 패키지 전체의 결정을 구했고 문서만 더하는 변경이라 코드 위험이 없으며, 일곱 가족을 따로 PR로 내면 소유자의 머지 지시가 한 번 더 들고 그동안 05·07의 검사가 같은 발견을 다시 낸다; 06 실행 기록 §4에 "기존 일곱 가족의 문서는 패키지 전체 결정(60C-01)으로 이 PR에 들었다"고 적는다. `*.scenario.ts`의 홀로 파일 경고는 장면 하나가 파일 하나인 설계된 모양(LANDING-090의 "신규 시나리오의 자리와 파일당 상한")이므로 `.filid/config.json`의 `zero-peer-file.exempt`에 기존 항목들의 결대로 `**/aileron/schema-form-scenarios/src/**`를 더해 닫고, `array.spec.ts`의 동적 표 사례 상한 미확정은 통과로 바꾸지 않고 그 시험이 속한 fractal의 DETAIL에 "표가 장면 목록에서 생성되어 사례 수가 정적으로 세어지지 않는다"고 선언한다." (`reviews/round-60-closing.md:10`)
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
- 보충:
  > 편집자 결정(25C-07): "【추론】 잎 교차 함수의 새 fractal은 `src/helpers/schemaIntersection/`이고, 공집합 표시는 `EMPTY_INTERSECTION`(Symbol)이며, `EMPTY_INTERSECTION`과 함께 이름으로 내보내는 함수는 `intersectConst`·`intersectEnum`·`intersectMaximum`·`intersectMinimum`·`intersectMultipleOf`·`validateRange` 여섯이고, `intersectPattern`은 SCHEMA-043대로 레거시에 남는다." (`reviews/round-25-closing.md:68`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:257`(정본), `08-design-a-to-z.md:571`, `reviews/round-18-closing.md:193,196`
- 닫은 사람: 편집자 결정(16라운드, 답 10으로 확정 `reviews/round-16-owner-answers.md:16`), 소유자 답(`reviews/round-14-owner-answers.md:17` O-11), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-08; 레거시 `const` 깊은 비교)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:20`
- 충돌:
  > `09-landing-and-test-strategy.md:257`의 "옛 `intersect*Schema`는 공집합 표시를 받으면 오늘처럼 던지도록 고쳐 옛 동작을 PR-7까지 지킨다"는 18라운드 결정과 다르다: 레거시의 `const` 비교는 깊은 비교로 바뀌며(결함 수정) 이것이 그 규칙의 예외이고, `intersectPattern`은 새 fractal로 옮기지 않고 레거시에 남는다(SCHEMA-043). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:196`).
  > `09-landing-and-test-strategy.md:257`의 "18라운드 안건 '전환 방식의 세부'"는 18라운드 결정과 다르다: 그 안건은 닫혔다 — PR-7은 진입점을 새 엔진으로 바꾸고 새 코드가 레거시를 가리키는 import가 0임을 점검하며 옛 코드는 `src/__legacy__/`에 보존한다(LANDING-159, LANDING-205). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:1330-1363`).

### LANDING-092 보정 PR-2 — 되돌림 기록 항목 확정, 노드 구조, `active` 게터, 나감 비움의 하위 트리 규칙

- 결정:
  > | PR | 더해진 것 |
  > | --- | --- |
  > | PR-2 | 되돌림 기록 항목 확정(§2.1의 조건 5), 노드 구조(§3: `record/`·`behaviors/`·`navigation/`·`SchemaNode/`, 행은 잎 넷·객체 둘(터미널 객체까지)·가상. 터미널 배열은 PR-5), `active` 게터, 나감 비움의 하위 트리 규칙(R17-2 ㄴ) |
- 보충: 없음
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:258`(정본), `08-design-a-to-z.md:572`, `reviews/round-18-closing.md:79`
- 닫은 사람: 편집자 결정(16라운드 정착 검토 조건 5), 소유자 답(`reviews/round-17-owner-answers.md:24` 노드 구조), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02; PR-2에 `union` 행)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:23`
- 충돌:
  > `09-landing-and-test-strategy.md:258`의 "행은 잎 넷·객체 둘(터미널 객체까지)·가상"는 18라운드 결정과 다르다: PR-2의 동작 행에 (가칭) `union` 행이 다른 잎 행과 함께 든다(BLUEPRINT-043). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:79`).

### LANDING-093 보정 PR-4 — ajv 셋의 동기 `compileGuard`, 사본·가드 캐시, 재생성 reset의 같은 `$id`, `onError`의 core 쪽

- 결정:
  > | PR | 더해진 것 |
  > | --- | --- |
  > | PR-4 | ajv6·7·8의 동기 `compileGuard(root, pointer)` 구현과 코어의 사본·가드 캐시, 훅 수준 바인딩 시험, 같은 `$id` 재등록, 배달 경로(§2.4), 검증기 등록의 참조 세기와 최근 해제 목록, 재생성 reset의 같은 `$id`(새 루트를 등록할 때 옛 트리가 아직 살아 있으므로 살아 있는 두 트리의 충돌로 다루고 reset의 원자성을 지킨다, §2.6의 일곱째·여덟째, 16라운드 스웜 수렴(편집자 결정)), `onError`의 core 쪽(보고기 인자, 기록 형과 코드 형, 사슬 끝의 기록마다 전달, 핸들러 예외 규칙, 전달 중 쓰기 거부, ADR 0014 §3) |
- 보충:
  > 편집자 결정(18C-30): "【추론】 가드 200개인 조건부 폼 생성은 새 판 23.0 ms(트리 585 µs + AJV 컴파일 22.4 ms) 대 오늘 13.4 ms로 1.7배다(`spikes/work-loop/REPORT.txt:113-118`, `:196-200`)." (`reviews/round-18-closing.md:876`)
  > 편집자 결정(18C-30): "【추론】 이 항목을 PR-4(동기 `compileGuard`를 구현하는 PR)의 수용 필요 항목으로 미리 적고, 이유는 "검증기 컴파일"이다." (`reviews/round-18-closing.md:877`)
  > 편집자 결정(18C-30): "【추론】 미리 적는 것이지 미리 받아들이는 것이 아니다." (`reviews/round-18-closing.md:878`)
  > 편집자 결정(18C-74): "【추론】 저장소의 ajv 플러그인 셋과 core의 폴백 검증기(`src/core/nodes/AbstractNode/utils/ValidationManager/utils/getFallbackValidator.ts:19`)는 PR-4(동기 `compileGuard`를 구현하는 그 PR)에서 함께 루트에 `''`를 내도록 고친다." (`reviews/round-18-closing.md:2056`)
  > 반영 칸(개발계획 P1): "ajv6·ajv7·ajv8의 `compileGuard`·`rejectedKey`·같은 `$id` 처리는 원장대로 PR-4에서 셋 다 구현한다(LANDING-064·093 그대로)." (`reviews/round-18-owner-answers.md:42`)
  > 편집자 결정(34C-01): "【추론】 코어의 `Validator` 형은 `src/core/validation/`에 두고 공개 index에서 내보내지 않으며, `compileGuard`가 있는 `ValidatorPlugin` 값이 구조적으로 `Validator`를 만족하게 두 형을 맞춘다; ajv 플러그인 셋은 세 멤버를 모두 구현하고(LANDING-093 개발계획 P1), 코어 쪽 적합성은 코어의 시험이 플러그인 셋을 `Validator`로 받아 단언한다. 부속 경로(`exports`에 둘째 진입점)를 더하는 것은 공개 겉면 추가라 이 라운드가 열지 않는다." (`reviews/round-34-closing.md:11`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:259`(정본), `08-design-a-to-z.md:574`, `reviews/round-18-closing.md:876-878,2056`, `reviews/round-18-owner-answers.md:42`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:16` 10), 16라운드 스웜 수렴(편집자 결정, 재생성 reset의 같은 `$id`), 17라운드 스웜 수렴(편집자 결정, `onError` core 쪽), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-30·18C-74), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:19`, `reviews/round-18-closing.md:881-884`, `reviews/round-18-closing.md:2059-2062`

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
- 보충:
  > 편집자 결정(68C-05): "【추론】 앞선 답(07 착수 전 물음 1)의 "`src/**`, `verification/**`, `plan/07-switch/**`, PLAN §3·§4의 07 행"은 `architecture/` 안에서 원장 관리자와 단계 작업자가 나눠 갖는 문서의 경계였고, 코드의 범위는 PR-7의 원장 행이 정한다. LANDING-067·095가 이름 댄 것(옛 스토리 49파일 정리와 시나리오 스토리·`playScenario`, `renderForm` 다섯과 부류별 e2e 실행기, `node.group`·`FormTypeRenderer`의 플러그인 쪽 소비자 이주, `@winglet/react-utils`의 바운더리 선택 인자), TEST-026이 이름 댄 것(`@aileron/benchmark-form`의 새 항목과 `fixtures/equivalent`, `bench/`, `.github/workflows/performance-benchmarks.yml`), REACT-017이 요구하는 React 18 실행 시험의 개발 의존(그에 따른 `yarn.lock`), 그리고 그것들이 돌게 하는 설정(`.storybook/`, `vite.config.ts`, `eslint.config.js`, `package.json`)은 모두 07의 경로다. `@aileron/schema-form-scenarios`는 시나리오 스토리와 e2e 실행기가 읽는 데이터 모듈이라 LANDING-087의 "그대로 쓰는 것"에 들고, 07은 전환이 요구하는 추가만 한다. 이 밖의 경로(다른 패키지, 저장소 설정)에 손대야 하면 쓰기 전에 물음으로 보낸다. 플러그인 패키지의 `src`는 68C-07의 범위 안에서만 고친다." (`reviews/round-68-closing.md:37`)
  > 편집자 결정(68C-06): "【추론】 TEST-055는 PR-7이 `@winglet/react-utils`의 자기 changeset(`minor`)을 더한다고 정했고, 루트 `CLAUDE.md`의 "changesets를 쓰지 않고 릴리스 때 판을 올린다"와의 충돌은 01 재정렬 기록(`plan/01-design-docs/realign.md:29,167`)이 "TEST-054·055, LANDING-097: 원장이 이긴다"로 닫았으며, 02(PR-1)는 그대로 `.changeset/common-utils-merge-policies.md`를 더했다. 07은 같은 모양으로 `.changeset/` 아래 `@winglet/react-utils`의 `minor` changeset 파일 하나를 더하고 변경 사유를 그 파일과 커밋 메시지에 적는다. `package.json`의 `version`은 올리지 않는다 — 판 올림은 changesets 가동(LANDING-097, 릴리스 전환 PR)과 PR-8(LANDING-096)의 몫이고, 07이 올리면 프리릴리스 무리의 판 계산과 두 번 셈한다. 루트 `CLAUDE.md`의 문장은 릴리스 전환 PR이 고친다(LANDING-097 "판 올림 스크립트 정리와 루트 `CLAUDE.md`")." (`reviews/round-68-closing.md:44`)
  > 편집자 결정(68C-09): "【추론】 LANDING-095의 "`architecture/spikes/**` 가운데 제품 동작에 남는 상황의 e2e 이식(§5.3)"은 기준만 적었고 목록은 없다. 07은 스파이크의 시험 파일(오늘 `spikes/events/caret`·`entry`, `spikes/work-loop/redteam4-events/current`·`react`)을 사례 단위로 나눠 사례마다 (가) 제품 동작으로 남아 e2e 또는 렌더 시험으로 옮김(새 시험 이름), (나) 설계 탐색이라 옮기지 않음(까닭)을 적은 표를 `plan/07-switch/log.md`에 두고, 옮긴 시험은 새 자리에서 돌며 스파이크 파일은 지우지 않는다(스파이크는 설계 기록이다). 여기에 더해 EVENT-070·REACT-017(18C-85)이 PR-7에 둔 사례 — `useLayoutEffect`와 `useEffect`에서 `node.setValue`로 서로를 되쓰는 두 필드 — 는 `spikes/events/`에 더하고 React 18과 19에서 각각 실행하며, 통과(두 이펙트 모두에서 React가 순환을 끊음)이면 규칙을 그대로 두고 실패하면 EVENT-070대로 소유자에게 올린다(편집자가 정하지 않는다)." (`reviews/round-68-closing.md:65`)
  > 편집자 결정(69C-02): "【추론】 LANDING-095의 PR-7 행은 "`reset`의 로드 전환(같은 스키마 판정, 커밋 재대조, 호출 안의 재생성, 자식 프록시 마운트 여부로 가르는 입력 판정, 노드가 드는 Refresh 번호와 상호작용 초기화 번호)"을 PR-7에 두었고, 05는 오류 코드 표에 `DISPOSED_NODE_WRITE`를 "재생성으로 버린 트리의 노드 쓰기만 거부"로 올리되 동작은 두지 않았다(`plan/05-dispatch-and-validation/log.md:102`). 그러므로 재생성 reset의 폐기(WRITE-046·086의 네 일), 상호작용 초기화 번호의 노드 칸과 그것을 올리는 셋(reset, `clearState`, `controls.resetInteraction`; REACT-024)과 바인딩의 읽기(`useSchemaNodeTracker`), 폐기된 노드에 온 쓰기의 `DISPOSED_NODE_WRITE`는 07이 코어에 더하는 것이 원장의 배정이며 03·04·05의 결함으로 적지 않는다. 조건: 폐기는 부모·자식·루트 참조를 끊지 않고(WRITE-086), 옛 노드의 읽기는 폐기 직전 마지막 커밋을 돌려주며, 검증기 등록의 참조 수는 폐기가 아니라 옛 트리의 효과 정리에서 내린다; 번호 올리기는 통지 없이 동기이고 Refresh 번호는 `revision`과 함께 노드가 든다(REACT-024); 입력 출처 표식이 붙은 늦은 쓰기는 조용히 버리고 표식 없는 쓰기만 `DISPOSED_NODE_WRITE`로 던진다(REACT-010의 가름). 코어 쪽 변경은 `record`·`settle`·`dispatch`의 DETAIL을 코드보다 먼저 고치고, 차등 시험(폐기 전후의 개정 대장과 값 불변)으로 03–06의 시나리오가 그대로임을 보인다." (`reviews/round-69-closing.md:16`)
  > 편집자 결정(77C-01): "【추론】 TEST-025는 소유자 답(16라운드 답 4, "전체 정리 허용")을 받아 옛 스토리 49파일의 처분을 셋으로 정했고 09 §5.4는 "옛 스토리는 PR-7에서 모두 정리된다"고 했으므로, 옛 스토리는 `src/__legacy__/`의 엔진 코드처럼 PR-8까지 보존하는 것이 아니라 PR-7 안에서 파일마다 처분되는 대상이다(LANDING-205의 보존은 `src/__legacy__/`에 한한다; 73C-01이 옛 스토리를 "같은 처분"이라 한 것은 글롭에서 빼는 수단을 말한 것이지 보존을 뜻하지 않는다). 그래서 U8의 (C) — Storybook 글롭과 `tsconfig`의 형 검사에서 `stories/*.stories.tsx`를 빼는 것 — 는 U9(새 시나리오 스토리와 `playScenario`)가 처분을 마칠 때까지 묶음 끝 점검을 초록으로 두는 발판으로만 허용하고, PR-7의 게이트는 "옛 스토리 파일이 남지 않는다"이다: 02가 만든 처분 목록(`verification/02-foundation-and-blueprint/story-disposition.md`)의 행마다 (가) 시나리오 → 데이터 모듈 + `stories/scenarios/`의 다섯 줄 스토리(새 이름), (나) 사용법 → `stories/usage/`에 새 문법으로 다시 씀(소수), (다) 인라인 스키마 → 지움을 적어 07의 처분표 옆에 두고, U9 끝에 49파일을 지우며 글롭·`tsconfig`의 제외 항목도 함께 없앤다. 262건의 형 오류를 새 API로 고쳐 살리는 대안은 TEST-025의 "인라인 스키마 스토리는 남기지 않는다"와 어긋나므로 택하지 않는다. (A)는 68C-01·TEST-005의 적용이고 "버리고 새로 쓴다" 31파일을 U8에서 지우고 U9에서 e2e로 다시 쓰는 사이의 상태는 처분표가 행방을 들고 PR-7이 원샷이므로 허용되며, 기대값이 원장 변경과 부딪히는 파일은 멈추고 물음으로 보낸다; (B)는 73C-01·75C-01 그대로; (D)는 TEST-021의 고칠 것 다섯이다." (`reviews/round-77-closing.md:9`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:261`(정본), `08-design-a-to-z.md:577`, `reviews/round-18-closing.md:2730-2731`, `reviews/round-18-owner-answers.md:42`
- 닫은 사람: 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 소유자 답(`reviews/round-16-owner-answers.md:10,11` 4·5), 16라운드 스웜 수렴(편집자 결정, reset·로드), 17라운드 스웜 수렴(편집자 결정, 바인딩 계약 첫째·넷째), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:44`, `reviews/round-18-closing.md:2734-2736`
- 충돌:
  > `09-landing-and-test-strategy.md:261`의 "`setValue(V)`의 같은 입력 판정"은 18라운드 결정과 다르다: 로드가 아닌 쓰기(`setValue(V)` 포함)는 원본이 실제로 바뀐 노드에만 Refresh를 내고 쓴 입력 자신은 제외하며, "값이 같아도 낸다"는 로드의 새 수명에만 해당한다(EVENT-071, LANDING-199). 18라운드 결정이 이긴다(`reviews/round-18-closing.md:2730-2731`).
  > `09-landing-and-test-strategy.md:261`의 "UI 플러그인 27파일의 `presentation.*` 이주"는 소유자 답과 다르다: UI 플러그인 넷의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR(우산 순서 N+1, PR-7 뒤)이 한다(LANDING-206). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:42`).

### LANDING-096 보정 PR-8 — 릴리스 전 벤치 재실행, changeset과 판 번호, 릴리스 테스트, reset 규칙 문서, 스토리북 문서

- 결정:
  > | PR | 더해진 것 |
  > | --- | --- |
  > | PR-8 | 릴리스 전 벤치 재실행, changeset(파괴적 변경, `fixed` 무리 전체 `major`. 1.0.0-beta 프리릴리스 뒤 1.0.0, §6.2의 열넷째)과 `CHANGELOG.md`, 포장된 산출물의 릴리스 테스트(§6.2, 16라운드 스웜 수렴(편집자 결정)), README·`docs/QUICK_REFERENCE.md`·`docs/agents`의 reset 규칙(§2.6의 열여섯째), 스토리북 문서 |
- 보충:
  > 반영 칸(개발계획 P2): "디렉토리 삭제는 PR-8이 한다." (`reviews/round-18-owner-answers.md:43`)
- 상태: 현행
- 출처: `09-landing-and-test-strategy.md:262`(정본), `08-design-a-to-z.md:578`, `reviews/round-18-owner-answers.md:43`
- 닫은 사람: 소유자 답(`reviews/round-16-owner-answers.md:22` PR-8의 판 번호), 소유자 답(`reviews/round-16-owner-answers.md:15` 9), 16라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:225` §6.2), 소유자 답(`reviews/round-18-owner-answers.md:43` 개발계획 P2)
- 라운드: 18
- 까닭: `09-landing-and-test-strategy.md:225`
- 충돌:
  > `09-landing-and-test-strategy.md:262`의 "과 `CHANGELOG.md`"는 TEST-045와 다르다: `changeset version`은 `changesets/action` 안에서만 돌므로 `CHANGELOG.md`는 병합 뒤 그 작업 흐름의 판 올림 PR이 만들고 PR-8은 changeset만 쓴다(TEST-045). TEST-045가 이긴다(`09-landing-and-test-strategy.md:237`).

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
- 상태: 대체됨(→ EVENT-063)
- 출처: `05-before-after.md:183`(정본, 옛 기록), `reviews/round-18-agenda.md:87`, `reviews/round-18-closing.md:1182-1191`
- 닫은 사람: 편집자 결정(17라운드, 18라운드 안건 §7로 이관), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-42)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:87`, `reviews/round-18-closing.md:1193-1196`

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
  > > 소유자(24라운드, PR #348 검토): "기본적으론 판단에 동의합니다" (`reviews/round-24-owner-answers.md:7`) — 현행(기록)으로 내린 것을 포함한 충돌 줄 해석에 동의했다.
- 상태: 현행(기록)
- 출처: `06-conclusions.md:429#2`(정본, 옛 기록), `08-design-a-to-z.md:254,265,325`, `03-mental-model.md:81`, `06-conclusions.md:231`
- 닫은 사람: 소유자 답(`00-goals.md:111` C8; 이주 안내를 낸다), 편집자 결정(8라운드, `06-conclusions.md:429`; 목록), 소유자 답(`reviews/round-10-owner-answers.md:20` D-7; 5.3의 (C)), 소유자 답(`reviews/round-24-owner-answers.md:7` PR #348 검토; 현행(기록)으로 내린 것에 동의)
- 라운드: 24
- 까닭: `06-conclusions.md:429`
- 충돌:
  > `06-conclusions.md:429`의 "`computed.*` → `&*`와 접두 없는 키의 `&` 접두(N5)"는 정본과 다르다. 정본이 이긴다(`08-design-a-to-z.md:436,462`, 15라운드 결정 5). LANDING-007·LANDING-033이 이긴다: `computed` 컨테이너는 `controls`로 이름을 바꾸고 별칭이 없으며, 평면 `&키` 축약은 사라지고 제어 키는 `controls` 안에만 있다.

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
  > `07-conclusions.md:423`의 "`computed`→`control`(별칭이므로 기계적)"는 정본과 다르다. 정본이 이긴다(`08-design-a-to-z.md:436`, 15라운드 결정 5). LANDING-007이 이긴다: `computed` 컨테이너는 `controls`로 이름 변경, 별칭 없음.
  > `07-conclusions.md:423`의 "`&if`→`&active`(6.1)"는 정본과 다르다. 정본이 이긴다(`08-design-a-to-z.md:435`, 15라운드 결정 5). LANDING-006이 이긴다: `&if`는 `controls.active`로 흡수된다.
  > `07-conclusions.md:423`의 "`&unsetValue` 신설"은 뒤 라운드의 결정과 다르다: 신설되는 키의 이름은 `controls.unsetValue`이며 평면 `&키` 축약은 사라졌다(LANDING-009, LANDING-033). 뒤 라운드가 이긴다(`08-design-a-to-z.md:462`).

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
- 상태: 대체됨(→ WRITE-090)
- 출처: `05-before-after.md:196`(정본, 옛 기록), `adr/0013-core-does-not-rewrite-values.md:70`, `adr/0007-settle-cycle.md:102`, `08-design-a-to-z.md:266,524`, `reviews/round-18-closing.md:2887`
- 닫은 사람: 소유자 답(`reviews/round-4.md:113` D-7), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-103)
- 라운드: 18
- 까닭: `reviews/round-4.md:113`, `reviews/round-18-closing.md:2891-2893`

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
- 보충:
  > 결정 표의 머리 행: "| 항목 | 현재 | 새 설계 | 변화 | 근거 |" (`05-before-after.md:121`)
  > "| `NodeEventType` | 17종. 공개 서브셋 6종 | **3역할로 재정의** — 상태 통지 / `revision` 원장 / 명령 시그널. 17종 개별의 생사는 언급이 없다 | 재정의 + **미확인** | `core/types/event.ts:45-96` / `adr/0008:24-28` |" (`05-before-after.md:123`) — 명령 어휘 행 근거 칸의 "동일"은 이 행의 근거를 가리킨다.
- 상태: 현행(기록)
- 출처: `05-before-after.md:124,140,214`(정본), `reviews/round-18-closing.md:2256-2265`
- 닫은 사람: 편집자 결정(18라운드, 원장 토큰 검사가 찾은 미결, `reviews/round-18-agenda.md:151`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-86; 명령 둘과 훅 셋에 한정), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-87; 나머지 공개 표면과 타입별 빈 값)
- 라운드: 18
- 까닭: `reviews/round-18-agenda.md:151`, `reviews/round-18-closing.md:2267-2268`, `reviews/round-18-closing.md:2290-2296`

### LANDING-125 이주(S1) — 파서의 강제 변환이 빠지고, 바꾸지 못한 값은 `NaN` 대신 받은 그대로 든다

- 결정:
  > 확정(나). parse는 뜻이 그대로인 변환만 한다(ajv 규칙 수준). 오늘 파서의 문자 제거, 정수 자르기, 빈 값 치환(`""`, `[]`, `{}`), 불리언의 진릿값 변환은 parse에서 뺀다.
  > 바꾸지 못한 값은 받은 그대로 들고 `value`·방출·제출이 모두 그 값이다(비우기·대체·거부 없음). 노드는 정합 상태(경고등)를 들고, 이것이 공개 형의 판별자다(이름과 모양은 18라운드 §7).
- 보충:
  > 소유자(S1 이어서): "변경하지 못하는 값을 입력했을때, 이전에는 NaN 같은 값을 넣었는데요" (`reviews/round-18-owner-answers.md:8`)
  > "(2) 입력 구성 요소의 계약: 치다 만 글자는 입력이 들고, 빈 칸은 `undefined`, 비우기는 nullable이면 `null` 아니면 `undefined`를 보낸다. 기본 수 입력(빈 칸에 `valueAsNumber`의 `NaN`)과 기본 불리언 체크박스(`defaultChecked={defaultValue ?? undefined}`)를 고친다." (`reviews/round-18-agenda.md:80`)
  > "(4) nullable이 아닌 노드의 `null`(서버의 NULL)이 더는 방출에서 빠지지 않아 검증기 있는 폼의 제출을 막는 사용성 변화의 문서화." (`reviews/round-18-agenda.md:80`)
  > 편집자 결정(18C-40): "【추론】 (4) nullable이 아닌 노드의 `null`은 바꾸지 않고 받은 그대로 방출된다." (`reviews/round-18-closing.md:1123`)
  > 편집자 결정(18C-40): "【추론】 경고등이 켜지고 경고가 가며, 검증기가 있으면 형 에러로 제출이 막힌다." (`reviews/round-18-closing.md:1124`)
  > 편집자 결정(18C-40): "【추론】 이 사용성 변화를 이주 항목(F27 확장, LANDING-125)과 PR-8 문서에 적는다." (`reviews/round-18-closing.md:1125`)
  > 편집자 결정(18C-40): "【추론】 해법은 스키마에 nullable을 적는 것이다." (`reviews/round-18-closing.md:1126`)
  > 편집자 결정(18C-40): "【추론】 값 규칙은 이미 닫혀 있고 문서화만 남았다." (`reviews/round-18-closing.md:1127`)
  > 편집자 결정(18C-93): "이주(LANDING-125, 그대로): 단일 노드 파서(`parseNumber`는 숫자가 아닌 문자를 지우고 `Math.trunc`로 자름 `src/core/parsers/parseNumber.ts:31-39`, `parseBoolean`은 참 거짓 판정 `parseBoolean.ts:34-41`, `parseString(true)`는 `''` `parseString.ts:34-38`)는 공통 이주를 따른다(WRITE-075의 변환 목록, 실패는 값 보존과 경고등)." (`reviews/round-18-closing.md:2662`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:8-9`(정본. LANDING-120에서 분할), `reviews/round-18-agenda.md:80`, 같은 규칙의 원장 항목 WRITE-052·WRITE-054·WRITE-055, `reviews/round-18-closing.md:1123-1127`, `reviews/round-18-closing.md:2662`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:8` S1 이어서; 뜻이 그대로인 변환만), 소유자 답(`reviews/round-18-owner-answers.md:9` S1 셋째; 받은 그대로 든다, 경고등, `onError` 전달), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:8-9`, `reviews/round-18-closing.md:1134-1141`, `reviews/round-18-closing.md:2711-2715`

### LANDING-126 이주(S1) — 변환 실패 `onError` 기록의 level은 `warning`, 가칭 `VALUE_TYPE_MISMATCH`

- 결정:
  > `onError` 기록의 level은 `warning`이고(값을 보존하므로 폼의 약속은 지켜진다. error 층은 throw·거부·싱크로 드러나야 해 통보 3과 부딪힌다), 가칭 `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH`를 노드의 정합 상태가 켜질 때마다 한 번 보낸다(path, 기대 형, 받은 값의 종류, 쓰기 출처).
- 보충:
  > 열린 부분(level `warning`만. 가칭 코드와 보내는 때는 같은 문장이라 함께 둔다): "변환하지 못한 입력의 `onError` 기록 level을 편집자가 `'warning'`으로 정해도 되는가, `'error'`인가." (`reviews/round-18-agenda.md:165`)
  > 소유자(12-7 답): "형변환 실패로 문제가 생기는 경우에 대한 대응은 FormType 이 하기로 했잖아. 그래서 개발단계에서는 중요한데, 리얼부터는 어쩔 수 없다고 생각하긴 해. warning 이면 되지않을까?" (`reviews/round-18-owner-answers.md:17`)
  > 반영 칸(설계서 메모 4): "게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`." (`reviews/round-18-owner-answers.md:41`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:9`(정본, S1 셋째의 반영 칸. 표 행이라 조각 번호로 나눌 수 없다. LANDING-120에서 분할), `reviews/round-18-owner-answers.md:17`, 같은 규칙의 원장 항목 ERROR-186, `reviews/round-18-owner-answers.md:41`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; 경고의 level·가칭 코드·보내는 때), 소유자 답(`reviews/round-18-owner-answers.md:17` 12-7; level `warning`), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:17`, `reviews/round-18-owner-answers.md:8-9`
- 충돌:
  > `reviews/round-18-owner-answers.md:9`의 "`onError` 기록의 level은 `warning`이고(값을 보존하므로 폼의 약속은 지켜진다. error 층은 throw·거부·싱크로 드러나야 해 통보 3과 부딪힌다), 가칭 `SCHEMA_FORM_WARNING.VALUE_TYPE_MISMATCH`를 노드의 정합 상태가 켜질 때마다 한 번 보낸다(path, 기대 형, 받은 값의 종류, 쓰기 출처)."는 소유자 답과 다르다: 이 항목의 `valueTypeMismatch`·`valueTypeMismatches`·`VALUE_TYPE_MISMATCH`는 확정 이름 `typeMismatch`·`typeMismatches`·`SCHEMA_FORM_WARNING.TYPE_MISMATCH`로 읽는다(SURFACE-061). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:41`).

### LANDING-127 이주(S1) — 변환 실패 기록은 검증기 유무와 무관하게 보낸다

- 결정:
  > 검증기가 있든 없든 보낸다(core의 parse가 찾는 것이라 검증 결과가 아니다).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:9`(정본, S1 셋째의 반영 칸. 표 행이라 조각 번호로 나눌 수 없다. LANDING-120에서 분할), 같은 규칙의 원장 항목 ERROR-187
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:9`; 보내는 때)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:8-9`

### LANDING-128 이주(18라운드) — 재귀 객체 스키마의 실패가 명시적 청사진 오류 `RECURSIVE_SHAPE_UNBOUNDED`(가칭)로

- 결정:
  > 이주(LANDING-128): 재귀 객체 스키마의 실패 모양이 오늘의 `UNKNOWN_JSON_SCHEMA` 또는 스택 넘침에서 청사진 오류 `JSON_SCHEMA_ERROR.RECURSIVE_SHAPE_UNBOUNDED`(가칭)로 바뀐다(서지 않는 것은 같고, 명시적 코드가 생긴다).
- 보충:
  > 편집자 결정(19C-01): "【추론】 pydantic `Optional[Self]`처럼 그 호스트가 게이트 없는 객체 프로퍼티 순환을 이루면 실패 코드가 `UNKNOWN_JSON_SCHEMA`에서 `RECURSIVE_SHAPE_UNBOUNDED`로 바뀐다." (`reviews/round-19-closing.md:27`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:33`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-01)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:35-41`

### LANDING-129 이주(18라운드) — 원시 타입 둘 이상의 `type` 배열이 `union` 잎과 문자열 입력으로 선다

- 결정:
  > 이주(LANDING-129): 원시 타입 둘 이상의 `type` 배열(예 `['number','string']`, `['string','number','null']`)은 오늘 `UNKNOWN_JSON_SCHEMA`로 폼이 서지 않고, 새 설계에서는 `union` 잎과 문자열 입력으로 선다(사용자에게 보이는 변화).
- 보충:
  > 편집자 결정(18C-93): "이주(LANDING-129, 보충): `['string','number']`처럼 null 없는 두 형과 원소가 셋 이상인 `type` 배열은 오늘 `UNKNOWN_JSON_SCHEMA`이고(`src/helpers/jsonSchema/extractSchemaInfo/extractSchemaInfo.ts:25,28-29` → `src/core/nodes/schemaNodeFactory.ts:116`), 새 설계에서는 union 잎(+nullable)이며 기본 입력은 `{type:'union'}` 감싸개다(18C-92)." (`reviews/round-18-closing.md:2636`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:81`(정본), `reviews/round-18-closing.md:2636`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:84-91`, `reviews/round-18-closing.md:2711-2715`

### LANDING-130 이주(18라운드) — `['integer','number']`는 수 노드

- 결정:
  > 이주(LANDING-130): `['integer','number']`는 오늘 `UNKNOWN_JSON_SCHEMA`이고, 새 설계에서는 수 노드다.
- 보충:
  > 편집자 결정(18C-93): "이주(LANDING-130): `['integer','number']`는 오늘 같은 오류이고(`extractSchemaInfo.ts:28-29`), 새 설계에서는 number 노드이며 `schemaType`은 `'number'`다." (`reviews/round-18-closing.md:2637`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:82`(정본), `reviews/round-18-closing.md:2637`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:84-91`, `reviews/round-18-closing.md:2711-2715`

### LANDING-131 이주(18라운드) — `dependentSchemas`·`dependencies`를 쓴 스키마에 개발 모드 경고

- 결정:
  > 이주(LANDING-131): `dependentSchemas`나 `dependencies`를 쓴 스키마에 개발 모드 경고가 새로 난다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:104`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-03)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:106-110`

### LANDING-132 이주(18라운드) — 조건부 `required`의 필수 표시가 켜진 `then`을 따른다

- 결정:
  > 이주(LANDING-132): 조건부 `required`가 있는 필드의 필수 표시는 오늘 늘 켜지고, 새 설계에서는 켜진 `then`에 따라 바뀐다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:159`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-06)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:161-164`

### LANDING-133 이주(18라운드) — 같은 값인 객체·배열 `const`끼리의 `allOf`가 통과한다(결함 수정)

- 결정:
  > 이주(LANDING-133): 같은 값인 객체·배열 `const`끼리의 `allOf`는 오늘 `JSONSchemaError`를 던지고, 새 설계와 레거시 모두에서 통과한다(결함 수정).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:200`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-08)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:203-207`

### LANDING-134 이주(18라운드) — 여러 `pattern`의 `node.jsonSchema` 표현이 첫 패턴 + `allOf` 항목으로

- 결정:
  > 이주(LANDING-134): 여러 `pattern`의 `node.jsonSchema` 표현이 오늘의 `(?=a)(?=b)` 합성 문자열에서 첫 패턴과 `allOf`의 `{pattern}` 항목으로 바뀐다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:201`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-08)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:203-207`

### LANDING-135 이주(18라운드) — 식의 `*` 조각은 청사진 오류

- 결정:
  > 이주(LANDING-135): 식에 쓴 `*` 조각이 청사진 오류가 된다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:366`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-13)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:370-376`

### LANDING-136 이주(18라운드) — `omitEmpty` 아래에서 `../name === ''` 같은 식은 `undefined`를 본다

- 결정:
  > 이주(LANDING-136): `omitEmpty`(기본 켜짐) 아래에서 `../name === ''` 같은 식은 `undefined`를 보게 되므로 `!../name`으로 고치거나 `omitEmpty`를 끈다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:367`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-13)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:370-376`

### LANDING-137 이주(18라운드) — `watchValues`도 `omitEmpty` 아래에서 빈 문자열을 `undefined`로

- 결정:
  > 이주(LANDING-137): `controls.watch`의 `watchValues`도 `omitEmpty` 아래에서 빈 문자열을 `undefined`로 받는다(입력 구성 요소가 보는 변화).
- 보충:
  > 편집자 결정(28C-07): "【추론】 `FormTypeInputProps.watchValues`로 넘기는 일은 PR-7 렌더 계층이고, LANDING-137(`omitEmpty` 아래 빈 문자열이 `undefined`)은 게터가 방출 트리를 읽는 결과이므로 PR-6의 게터에 든다; EVENT-064의 계산 상태 비트에 `watchValues`가 드는 것은 PR-4 배달의 몫이다." (`reviews/round-28-closing.md:77`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:368`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-13)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:370-376`

### LANDING-138 이주(18라운드) — `injectTo` 반환의 `undefined` 항목은 쓰지 않는다

- 결정:
  > 이주(LANDING-138): `injectTo` 반환의 값이 `undefined`인 항목은 오늘 `undefined`로 덮어쓰고, 새 설계에서는 쓰지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:414`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-14)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:416-423`

### LANDING-139 이주(18라운드) — 입력이나 `Merge`로 된 `null` 아래의 자식은 채움 없이 없음

- 결정:
  > 이주(LANDING-139): 입력이나 `Merge`로 된 `null` 아래의 자식은 오늘 기본값 상태를 보이고(S4, `ObjectNode/DETAIL.md:19`), 새 설계에서는 채움 없이 없음이다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:498`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:502-510`

### LANDING-140 이주(18라운드) — 입력이 넘긴 `Merge`는 자기 입력을 다시 마운트하지 않는다

- 결정:
  > 이주(LANDING-140): 입력이 넘긴 `Merge`는 오늘 `Refresh` 비트로 자기 입력을 다시 마운트하고(`value.ts:63`), 새 설계에서는 다시 마운트하지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:499`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:502-510`

### LANDING-141 이주(18라운드) — `Overwrite`와 `Merge`를 함께 주면 `INVALID_WRITE_OPTION`

- 결정:
  > 이주(LANDING-141): `Overwrite | Merge`는 오늘 `Overwrite`로 동작하고(`value.ts:65`), 새 설계에서는 `INVALID_WRITE_OPTION`으로 던진다(`adr/0014-error-policy.md:276` 행의 이주 쪽).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:500`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-16)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:502-510`

### LANDING-142 이주(18라운드) — `setValue(undefined)`는 기본값을 다시 채운다

- 결정:
  > 이주(LANDING-142): `setValue(undefined)`(기본 `Overwrite`)는 오늘 채움 없이 비우고(`ObjectNode/DETAIL.md:21`), 새 설계에서는 `default`가 있는 자리에 기본값이 다시 들어간다.
  > 채움 없이 비우려면 `Merge`나 `DisableAutomaticWrites`를 쓴다.
- 보충: 없음
- 상태: 대체됨(→ WRITE-090)
- 출처: `reviews/round-18-closing.md:535-536`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-17), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:542-548`

### LANDING-143 이주(18라운드) — 입력의 `onChange(undefined, Overwrite)`는 기본값을 다시 채운다, 스토리 넷 고침

- 결정:
  > 이주(LANDING-143): 입력의 `onChange(undefined, SetValueOption.Overwrite)`는 새 설계에서 로드라 기본값이 다시 채워진다.
  > 값을 빼는 입력은 `Overwrite`를 뺀다.
  > 저장소에서 고칠 곳은 `stories/03.FormTypeInput.stories.tsx:138`(`removeClick`), `:213`, `stories/08.VirtualSchema.stories.tsx:441`, `:531`이다.
  > 입력 작성자에게는 이주 안내 항목(C8)으로 알린다.
- 보충: 없음
- 상태: 대체됨(→ WRITE-090)
- 출처: `reviews/round-18-closing.md:537-540`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-17), 소유자 답(`reviews/round-18-owner-answers.md:26` 18C 검토 4번; 대체)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:542-548`

### LANDING-144 이주(18라운드) — 로드나 부모가 준 `{}`가 호스트 `default`를 막지 않는다

- 결정:
  > 이주(LANDING-144): 로드한 값이나 부모가 그 자리에 준 `{}`는 오늘 호스트 `default`를 막고(`AbstractNode.ts:1197-1199`), 새 설계에서는 `{}`여도 호스트가 `default`를 받는다(사용자에게 보이는 변화).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:569`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-18)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:571-576`

### LANDING-145 이주 44(18라운드 판) — `trim`은 `finishInput` 칸의 자동 쓰기, 바깥 오류·dirty는 그대로, 같은 값이면 쓰지 않음, 흐림 때 다시 마운트

- 결정:
  > 이주(LANDING-145, 이주 44를 대신함): 오늘은 흐림 때 원본을 잘린 값으로 덮고 `RequestRefresh`는 없다(`StringNode.ts:118-121`, `:43`, `value.ts:51`).
  > 새 설계에서는 `finishInput` 칸이 자르고, 쓰기는 자동 쓰기다.
  > 바깥 오류와 dirty는 건드리지 않고(오늘과 같음), 같은 값이면 쓰지 않는다.
  > 자동 쓰기이므로 비제어 입력이 흐림 때 다시 마운트된다(오늘과 다름).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:594-597`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-19)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:599-603`

### LANDING-146 이주(18라운드) — `batch(fn)` 안의 updater는 이어지고 평범한 읽기는 직전 커밋

- 결정:
  > 이주(LANDING-146): 오늘은 `batch`가 없고, `setValue`는 부른 자리에서 적용되며 updater도 그 자리의 `value`로 곧바로 계산된다(`AbstractNode.ts:355-364`).
  > 새 설계에서 쓰기를 `batch(fn)`로 묶으면 updater는 오늘처럼 이어진다(+1 두 번이면 +2).
  > 그러나 `fn` 안의 `value`·`outputValue`·`inactiveValues`·`getValue()`는 직전 커밋을 돌려준다.
  > 쓰기 직후 `value`를 읽어 다음 쓰기에 쓰던 코드를 `batch`로 옮기면 updater로 바꾼다.
  > 이주 안내 항목(C8)으로 둔다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:636-640`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-20)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:642-648`

### LANDING-147 이주(18라운드) — 가상 노드의 모양이 틀린 쓰기는 `SchemaFormError`로, 같은 길이 문자열 쪼개기는 거부로

- 결정:
  > 이주(LANDING-147): 가상 노드에 모양이 틀린 쓰기의 오류 클래스가 `JSONSchemaError`에서 `SchemaFormError`로 바뀌고, 길이가 같은 문자열을 글자로 쪼개던 동작은 거부로 바뀐다.
- 보충:
  > 편집자 결정(42C-01): "【추론】 ERROR-195의 "즉시 throw하고, throw 직전에 `onError`로 보낸다"에서 throw는 PR-5가 `settle`의 쓰기 표시에서 하고, `onError` 보고는 PR-4의 보고기를 쓰므로 35C-01과 같이 33C-01의 디스패치 배선과 함께 뒤에 머지하는 단계가 잇는다; 06이 먼저 머지되면 던지기만 하고 그 자리의 DETAIL에 배선 PR이 보고를 더한다는 한 줄을 남긴다. 코드 이름은 가칭 `INVALID_VIRTUAL_NODE_VALUES` 그대로 쓰고(이미 파생 경로가 쓰는 코드와 같은 하나다) 05의 확정 목록(31C-05)에 든다. LANDING-147의 이주(오류 클래스가 `SchemaFormError`로, 같은 길이 문자열 쪼개기는 거부로)는 이 수정으로 호출자 경로에서도 실현된다." (`reviews/round-42-closing.md:11`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:673`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-21)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:675-680`

### LANDING-148 이주(18라운드) — `find`는 꺼진 `oneOf` 변형의 노드를 돌려주지 않는다(`null`)

- 결정:
  > 이주(LANDING-148): 오늘 `find`는 꺼진 `oneOf` 변형의 노드를 돌려줄 수 있지만(`findNode.ts:69-85`, 첫 후보로 물러남), 새 설계는 `null`이다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:932`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-33)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:934-937`

### LANDING-149 이주 47(18라운드 판) — 잎 `terminal: false`·가상 `terminal: true`는 청사진 오류, 가상의 인라인 입력은 `branch`로 `ChildNodeComponents`를 받음

- 결정:
  > 이주(LANDING-149, 08 §14 47행의 새 설계 칸): 잎의 `options.terminal: false`와 가상의 `options.terminal: true`는 청사진 오류(가칭 `TERMINAL_OPTION_UNSUPPORTED`)이니 지운다.
  > 가상의 인라인 `FormTypeInput`은 그대로 그려지며 `ChildNodeComponents`를 받고(오늘은 비워짐), `node.strategy`는 `'branch'`이고 `isTerminalNode(가상)`은 참에서 거짓으로 바뀐다(오늘 `group`은 `'terminal'`).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1037-1038`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-38)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1040-1047`

### LANDING-150 착수 항목(18라운드) — parse 문서는 새 자리의 문서로 PR-2, `src/types/formTypeInput.ts:60-65`의 문서 주석은 PR-7

- 결정:
  > 【추론】 parse의 문서(오늘 `src/core/parsers/INTENT.md`가 맡던 것)는 새 자리(`src/core/behaviors/utils/parse/`, 18C-36)의 문서로 PR-2의 착수 항목이고, `src/types/formTypeInput.ts:60-65`의 문서 주석은 PR-7의 착수 항목이다(LANDING-150).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1132`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1134-1141`

### LANDING-151 착수 항목(18라운드) — 자사 플러그인 수정 목록은 PR-7 이주 항목

- 결정:
  > 자사 플러그인 수정 목록은 PR-7 이주 항목이다: antd·mui 수 입력의 비우기 값과 부분 해석, 스위치의 무효 표지, 문자열 체크박스와 범위 입력의 `Array.isArray` 막기(LANDING-151).
- 보충:
  > 편집자 결정(18C-93): "【추론】 LANDING-151의 PR-7 이주 목록에 LANDING-181–LANDING-186을 더하고, 자사 플러그인마다 union 항목(권장)을 둔다." (`reviews/round-18-closing.md:2665`)
  > 반영 칸(개발계획 P1): "UI 플러그인 넷(antd5·antd6·antd-mobile·mui)의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR(우산 순서 N+1, PR-7 뒤)이 한다." (`reviews/round-18-owner-answers.md:42`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1115`(정본), `reviews/round-18-closing.md:2665`, `reviews/round-18-owner-answers.md:42`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-40), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1134-1141`, `reviews/round-18-closing.md:2711-2715`
- 충돌:
  > `reviews/round-18-closing.md:1115`의 "자사 플러그인 수정 목록은 PR-7 이주 항목이다: antd·mui 수 입력의 비우기 값과 부분 해석, 스위치의 무효 표지, 문자열 체크박스와 범위 입력의 `Array.isArray` 막기(LANDING-151)."는 소유자 답과 다르다: 자사 플러그인 수정 목록은 PR-7 뒤의 플러그인 PR이 한다(LANDING-206). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:42`).
  > `reviews/round-18-closing.md:2665`의 "【추론】 LANDING-151의 PR-7 이주 목록에 LANDING-181–LANDING-186을 더하고, 자사 플러그인마다 union 항목(권장)을 둔다."는 소유자 답과 다르다: 이주 표의 행 LANDING-181–LANDING-186과 이주 점검은 PR-7에 남고, 자사 플러그인마다의 union 항목은 플러그인 PR이 한다(LANDING-206). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:42`).

### LANDING-152 이주(18라운드) — `globalState`의 키는 참인 노드가 없으면 내려간다

- 결정:
  > 이주(LANDING-152): `globalState`의 키는 오늘 루트에서만 비워지고, 새 설계에서는 참인 노드가 없으면 내려간다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1170`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-41)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1173-1176`

### LANDING-153 이주(18라운드) — `globalState`의 값은 `true`

- 결정:
  > 이주(LANDING-153): `globalState`는 오늘 마지막으로 쓴 참인 값을 그대로 들고, 새 설계에서는 비불리언 상태 값도 `true`가 된다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1171`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-41)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1173-1176`

### LANDING-154 이주(18라운드) — 노드의 `key`·`schemaPath`가 없어진다

- 결정:
  > 이주(LANDING-154): 오늘의 `node.key`·`node.schemaPath`는 새 설계에 없다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1210`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-43)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1212-1214`

### LANDING-155 이주(18라운드) — `defaultValue`는 로드를 따르고 배열 아이템은 구조 연산을 따라 자기 값을 지킨다

- 결정:
  > 이주(LANDING-155): `defaultValue`는 그 경로에 닿는 로드마다 새 로드 값이 되고, 배열 아이템은 구조 연산을 따라 자기 값을 지킨다.
  > 오늘 `defaultValue`는 노드가 생긴 뒤 바뀌지 않는다(`AbstractNode.ts:290-296`).
- 보충:
  > 반영 칸(18C 검토 4번, 로드 스냅숏): "`setValue`는 로드가 아니므로 `defaultValue` 게터와 `resetSubtree()`의 로드 스냅숏을 바꾸지 않는다(배열의 구조 연산이 스냅숏을 고치는 18C-44의 규칙은 그대로다)." (`reviews/round-18-owner-answers.md:26`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1237-1238`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-44)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1240-1247`

### LANDING-156 이주(18라운드) — `find('@')`·`findAll('@')`는 맥락 노드를 돌려주지 않는다

- 결정:
  > 이주(LANDING-156): `find('@')`·`findAll('@')`는 오늘 맥락 노드를 돌려주고, 새 설계에서는 `null`·빈 배열을 돌려준다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1262`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-45)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1264-1268`

### LANDING-157 이주(18라운드) — `NodeState` → `SchemaNodeState`

- 결정:
  > 이주(LANDING-157): 공개 형 `NodeState`의 이름이 `SchemaNodeState`로 바뀐다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1300`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-47)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1303-1306`

### LANDING-158 이주(18라운드) — `NodeEventType` → `SchemaNodeEventType`

- 결정:
  > 이주(LANDING-158): 공개 이벤트 형 `NodeEventType`의 이름이 `SchemaNodeEventType`으로 바뀐다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1301`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-47)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1303-1306`

### LANDING-159 레거시는 `src/__legacy__/` — 상대 경로 유지, PR마다 옮김, 새 fractal의 가져오기 금지, PR-7 통째 삭제, 시험 글롭 포함, filid 깊이 점검, 스토리북·벤치

- 결정:
  > 【추론】 레거시 디렉토리는 `src/__legacy__/`다.
  > 【추론】 옮기는 파일은 원래의 `src/` 아래 상대 경로를 그대로 둔다(`src/core/nodes/` → `src/__legacy__/core/nodes/`).
  > 【추론】 import는 별칭 접두만 바꾼다(`@/schema-form/core/nodes` → `@/schema-form/__legacy__/core/nodes`).
  > 【추론】 PR마다 그 PR이 새로 쓰는 영역의 옛 파일만 옮긴다.
  > 【추론】 예를 들어 PR-2는 `src/core/nodes`, 그것이 가져오는 `src/core/parsers`(→ `src/__legacy__/core/parsers/`), 옛 `src/core/__tests__`를 옮긴다.
  > 【추론】 이것으로 새 `src/core/__tests__/scenarios/` 자리가 빈다.
  > 【추론】 옛 노드는 PR-7까지 오늘의 parse 동작을 지키고 새 parse(18C-36)를 가져오지 않으므로, 아래 규칙 2의 허용 목록은 바뀌지 않는다.
  > 【추론】 규칙 1: 새 fractal(PR-1부터 새로 쓴 것)은 `__legacy__`를 가져오지 않는다.
  > 【추론】 규칙 1은 파일 한정 ESLint `no-restricted-imports`로 막고 PR-1에서 건다.
  > 【추론】 규칙 2: 레거시 → 새 코드는 08 §17.2가 이미 적은 곳만 허용한다(예: 옛 `intersect*Schema`가 새 잎 교차 함수를, 옛 소비자가 청사진으로 옮긴 식 컴파일러를 가져온다).
  > 【추론】 규칙 3: `src/core/index.ts`와 `src/index.ts`는 PR-7까지 옛 엔진을 가리킨다.
  > 【추론】 새 엔진은 PR-7 전까지 `<Form>`에 닿지 않는다.
  > 【추론】 규칙 4: PR-7은 진입점을 새 엔진으로 바꾸고 `src/__legacy__/`를 통째로 지운다.
  > 【추론】 그 점검은 그 디렉토리와 그것을 가리키는 import가 하나도 없는 것이다.
  > 【추론】 빌드와 공개 진입점에서 따로 뺄 설정은 두지 않는다.
  > 【추론】 rolldown은 `src/index.ts`가 닿는 것만 묶는다.
  > 【추론】 그 사이의 산출물은 옛 엔진이고, 우산 브랜치는 PR-8 전에 배포하지 않으며, PR-7이 디렉토리를 지운다.
  > 【추론】 이름을 `__legacy__`로 하는 것은 filid 분류 규칙 (3)으로 organ이 확정되어 설계의 fractal로 읽히지 않기 때문이다.
  > 【추론】 저장소의 `__tests__` 관례와 모양이 같다.
  > 【추론】 `src` 안에 두면 tsc·eslint·Storybook의 포함 규칙과 `@/schema-form` 별칭이 설정 변경 없이 따라간다.
  > 【추론】 저장소 filid 설정(`.filid/config.json`)은 `max-depth`를 severity `error`, `maxDepth: 14`로 건다.
  > 【추론】 가장 깊은 `src` 디렉토리가 저장소 뿌리에서 13단이므로 `__legacy__`를 끼우면 14단이다.
  > 【추론】 PR-1 점검에 "filid `max-depth` 통과. 실패하면 `src/__legacy__/**`를 예외로 두는 설정 변경을 같은 PR에서 한다"를 둔다.
  > 【추론】 옛 코드와 함께 사는 `__tests__`는 코드와 함께 옮겨지고, PR-7까지 그대로 돈다.
  > 【추론】 `<Form>`이 쓰는 옛 엔진을 지키는 것이다.
  > 【추론】 09 §4.3의 처분은 파일마다 한다.
  > 【추론】 "그대로 산다"는 단위가 새 자리로 옮겨 가는 PR에서 함께 새 자리로 간다(레거시가 아님).
  > 【추론】 "버리고 새로 쓴다"는 레거시로 옮겨 돌다가, 그 상황 목록이 대체 PR의 데이터 모듈로 옮겨진 뒤 PR-7에서 디렉토리와 함께 지운다.
  > 【추론】 "표면만 고친다" 렌더 시나리오 17파일과 `src/__tests__`의 나머지는 `<Form>`을 시험하므로 자리를 지키다가 PR-7에서 처분한다.
  > 【추론】 PR-0의 세 프로젝트 글롭(`unit`·`render`·`storybook`)이 `src/__legacy__/**`를 포함한다.
  > 【추론】 옛 스토리(`stories/`)는 `../src`의 진입점으로 옛 엔진을 그리므로 PR-7까지 그대로 돈다.
  > 【추론】 새 문법의 시나리오 스토리는 `<Form>`이 새 엔진을 쓰는 PR-7부터 그릴 수 있다.
  > 【추론】 PR-7이 09 §5.4대로 옛 스토리를 정리한다(16라운드 답 4 "전체 정리 허용").
  > 【추론】 옛 엔진의 마지막 벤치 기준선(`bench:baseline`)은 PR-2가 `core/nodes`를 옮기기 전에 잰다.
- 보충:
  > 반영 칸(개발계획 P2): "`src/__legacy__/`는 PR-7이 지우지 않고 정리·릴리스 PR(PR-8)까지 참고용으로 보존한다." (`reviews/round-18-owner-answers.md:43`)
  > 편집자 결정(18C-49에 LANDING-205를 적용): "【추론】 옛 코드와 함께 사는 `__tests__`는 코드와 함께 옮겨지고, PR-7까지 그대로 돈다." (`reviews/round-18-closing.md:1353`) — LANDING-205 뒤에는 PR-7이 진입점을 새 엔진으로 바꾼 뒤 레거시 안의 옛 단위 시험을 시험 글롭에서 빼 두고(옛 엔진은 더 `<Form>`에 닿지 않는다), 디렉토리와 함께 PR-8이 지운다.
  > 편집자 결정(32C-01): "【추론】 Form 속성 `validatorFactory`가 함수 하나에서 `{ compile, compileGuard }` 객체로 바뀌는 것(LANDING-036 이주 33)은 공개 겉면의 변경이고, LANDING-159 규칙 3대로 `src/index.ts`는 PR-7까지 옛 엔진을 가리키며 LANDING-064의 PR-7 행이 Form 속성 `validatorFactory`의 연결을 전환 PR에 두므로, 공개 속성의 형과 동작은 PR-7에서 바뀐다; PR-4 전에는 공개 동작 변경이 없다." (`reviews/round-32-closing.md:10`)
  > 편집자 결정(32C-01): "【추론】 그래서 PR-4의 새 계약 형은 공개 index가 아닌 새 엔진 쪽 모듈에서 내보내고, ajv 플러그인 셋은 그 형을 구현한다; 플러그인 패키지의 공개 겉면이 PR-4에서 바뀌는 것은 LANDING-093·LANDING-192(이주)대로이며 소비자용 Form 속성은 전환 뒤에 따른다." (`reviews/round-32-closing.md:11`)
  > 편집자 결정(50C-01): "【추론】 34C-02가 옛 이름을 남기라고 한 까닭은 LANDING-159 규칙 3(공개 진입점은 PR-7까지 옛 엔진이고 PR-4 전에는 공개 동작 변경이 없다, 32C-01)대로 옛 `<Form>` 형과 플러그인 스토리, 그리고 소비자 코드가 계속 컴파일되게 하는 것이므로, 같은 형의 별칭이 `details`를 `unknown`으로 좁혀 소비자 코드를 PR-7 전에 깨뜨린다면 그 수단이 뜻을 거스른다; 그래서 `JSONSchemaError`는 옛 공개 형과 같은 모양을 지키는 `ValidationIssue`의 호환 확장(`details?: Record<string, any>`, `key?: number`)으로 `src/index.ts`에서 이름으로 내보내고, 새 엔진의 `ValidationIssue`는 `details?: Record<string, unknown>`을 지키며 함께 내보낸다(새 엔진의 값은 확장에 대입 가능하고, 새 엔진은 `key`를 쓰지 않는다). 옛 이름을 지우는 것은 34C-02·LANDING-024대로 PR-7 또는 PR-8의 몫이고, 그때 `any`와 `key`도 함께 사라진다; `ValidationIssue.details`를 `any`로 넓히거나 소비자의 좁힘을 받아들이는 길은 택하지 않는다." (`reviews/round-50-closing.md:9`)
  > 편집자 결정(71C-01): "【추론】 LANDING-087의 "지운다"는 새 엔진의 `core/types`에서 노드 형 묶음이 사라진다는 뜻이고, LANDING-205는 레거시를 PR-8까지 참고용으로 보존하되 그 안에 두면 tsc·eslint가 설정 변경 없이 따라간다고 했으므로(LANDING-159) 레거시는 전환 뒤에도 컴파일되어야 한다. 둘을 함께 지키는 길은 LANDING-159가 정한 옮김의 모양 그대로다: `src/core/types/node.ts`·`constructor.ts`의 내용을 `src/__legacy__/core/types/`에 같은 상대 경로로 두고(그 안의 `index.ts`가 이름으로 다시 내보냄), 레거시 파일의 가져오기는 별칭 접두만 바꾼다(`@/schema-form/core/types` → `@/schema-form/__legacy__/core/types`, 상대 경로 가져오기는 레거시 안의 묶음을 가리키도록 고침). 70C-01이 `contextNodeFactory`를 옛 엔진과 함께 레거시로 보낸 것과 같은 처분이다. 레거시가 계속 가져오는 `event`·`state`·`value` 형은 오늘 레거시가 이미 `core/types`에서 가져오던 것이고 형 전용이므로 규칙 2("레거시 → 새 코드는 08 §17.2가 이미 적은 곳만")의 허용 목록을 넓히지 않는다 — 다만 07은 그 형들의 뜻이 새 엔진에서 바뀌었다면(예: 상태 비트의 이름) 레거시 쪽 사본을 `src/__legacy__/core/types/`에 함께 두어 레거시가 새 형에 끌려가지 않게 한다. 새 fractal이 `__legacy__`를 가져오지 않는 규칙 1과 "새 코드가 레거시를 가리키는 import 0" 점검(LANDING-205)은 그대로이고, 옮긴 두 파일은 처분표(68C-01)와 이주 점검표(68C-02)가 아니라 `plan/07-switch/log.md`의 레거시 이동 목록에 적는다." (`reviews/round-71-closing.md:9`)
  > 편집자 결정(73C-01): "【추론】 LANDING-159는 "09 §4.3의 처분은 파일마다 한다"고 했고, LANDING-205를 적용한 보충은 "PR-7이 진입점을 새 엔진으로 바꾼 뒤 레거시 안의 옛 단위 시험을 시험 글롭에서 빼 두고(옛 엔진은 더 `<Form>`에 닿지 않는다), 디렉토리와 함께 PR-8이 지운다"고 정했다. 레거시 안의 `<Form>` 렌더 시험 둘은 옛 엔진을 `<Form>`으로 시험한 것이라 전환 뒤에는 뜻을 잃으므로 같은 처분(글롭에서 뺌)을 받고, 동시에 렌더 시나리오이므로 그 사례(14건)는 처분표(68C-01)에 추가 행으로 올라 09 §4.3의 처분을 받는다 — 시나리오별로 이주 행(`if`·`then`·`else`의 게이트 이주, nullable의 `type` 배열 이주 등)과 대조해 조합·옛 키가 있으면 "버리고 새로 쓴다"(새 e2e로 옮김, 새 시험 이름을 행에 적음), 없으면 TEST-005의 "표면만 고친다"로 단언을 살린다. 레거시 파일은 LANDING-205대로 고치지 않는다(사례만 지우는 것도 레거시 수정이며, 참고용 보존의 뜻에 어긋난다). 전환 커밋(진입점을 새 엔진으로 바꾸는 커밋)에서 render·unit 프로젝트의 포함 글롭에서 `src/__legacy__/**`를 빼고, 그 변경을 처분표의 머리에 "레거시 시험 N파일 M건은 LANDING-159 보충대로 글롭에서 뺌; 그 가운데 `<Form>` 렌더 사례 14건은 아래 행으로 처분"이라고 적는다. 두 파일만 빼는 대안을 쓰지 않는 까닭은 뺄 단위가 파일 둘이 아니라 레거시 전체이기 때문이고, 07의 권장을 그대로 쓰지 않는 까닭은 레거시 파일을 고치기 때문이다. 처분표에 행이 있고 새 e2e의 이름이 적히므로 붉은 시험을 숨기는 것이 아니다; 글롭에서 뺀 레거시의 시험이 PR-8 전까지 돌지 않는 것은 LANDING-159 보충이 받아들인 상태다." (`reviews/round-73-closing.md:9`)
  > 소유자(74라운드, 레거시의 완전 분리): "예. 완전히 분리하세요. 저는 사실 패키지 레벨에서 분리를 할거라고 생각했는데, 이정도만 분리해도 괜찮겠네요" (`reviews/round-74-owner-answers.md:7`) — 규칙 2(레거시 → 새 코드는 08 §17.2가 적은 곳만 허용)는 폐기되고 레거시는 새 코드를 하나도 가져오지 않는다; 허용되던 가져오기와 새 `core/types`의 남는 형(event·state·value) 가져오기는 모두 `src/__legacy__/` 안의 사본으로 바꾼다. 규칙 1과 함께 양방향 import 0이며, 사본은 전환 뒤 글롭에 묶이지 않고 PR-8이 디렉토리와 함께 지운다. 패키지 수준 분리는 하지 않는다(원장 관리자, 2026-10-02).
  > 편집자 결정(75C-01): "【추론】 LANDING-205가 보존하는 것은 "참고용 옛 구현"이고, 74라운드 소유자 답은 레거시가 새 코드를 하나도 가져오지 않는 완전 고립을 정했다. 두 시험 파일은 옛 노드·파서를 직접 부르지 않고 공개 진입점 `@/schema-form`의 `<Form>`을 그려 단언하므로 그 뜻은 "공개 폼의 동작"이지 "옛 구현"이 아니며, 전환 뒤에는 새 `<Form>`을 옛 기대로 단언하는 모순된 파일이 된다. 옛 렌더 계층을 레거시에 복제해 이 둘을 살리는 것은 소유자 답의 "코드 복사본이 있어도 분리"의 뜻(필요한 조각의 사본)을 넘어 옛 `<Form>` 전체를 둘로 만드는 일이라 택하지 않고, ESLint 규칙에서 둘만 빼는 예외는 소유자가 "완전히 분리하세요"라고 한 것과 어긋나므로 두지 않는다. 그러므로 73C-01의 처분 가운데 (1)은 그대로 — 사례 14건은 처분표 추가 행으로 올려 이주 행과 대조해 새 e2e로 옮기고 새 시험 이름을 행에 적는다 — 이고, (2) "레거시 파일은 고치지 않는다"는 옛 구현과 그것을 직접 시험하는 파일로 좁혀지며, 공개 진입점만 가리키는 이 두 파일은 사례의 행방이 처분표에 적힌 뒤 레거시에서 지운다. 옛 동작의 참고가 필요하면 전환 직전 커밋(07 U1의 기준선 커밋)에 그대로 있다. 73C-01의 (3) 글롭에서 레거시 전체를 빼는 것은 그대로다. 같은 기준으로 레거시 안에 공개 진입점만 가져오는 다른 파일이 더 있으면(스토리·시험) 같은 처분을 하고 `plan/07-switch/log.md`의 레거시 이동 목록에 "지움(공개 겉면의 시험, 사례는 처분표 행 N)"으로 적는다." (`reviews/round-75-closing.md:9`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1330-1363`(정본), `reviews/round-18-owner-answers.md:43`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49), 소유자 답(`reviews/round-18-owner-answers.md:43` 개발계획 P2), 편집자 결정(18라운드, 개발계획 07; 레거시 시험은 PR-7 뒤 글롭에서 뺌)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1365-1368`
- 충돌:
  > `reviews/round-18-closing.md:1342`의 "【추론】 규칙 4: PR-7은 진입점을 새 엔진으로 바꾸고 `src/__legacy__/`를 통째로 지운다."는 소유자 답과 다르다: `src/__legacy__/`는 PR-8까지 참고용으로 보존하고, PR-7은 진입점 전환과 레거시 import 0 점검만 하며, 삭제는 PR-8이 한다(LANDING-205). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:43`).
  > `reviews/round-18-closing.md:1346`의 "【추론】 그 사이의 산출물은 옛 엔진이고, 우산 브랜치는 PR-8 전에 배포하지 않으며, PR-7이 디렉토리를 지운다."는 소유자 답과 다르다: 디렉토리는 PR-8이 지운다(LANDING-205). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:43`).
  > `reviews/round-18-closing.md:1357`의 "PR-7에서 디렉토리와 함께 지운다"는 소유자 답과 다르다: `src/__legacy__/`는 PR-7이 지우지 않고 정리·릴리스 PR(PR-8)까지 참고용으로 보존하며 디렉토리 삭제는 PR-8이 한다(LANDING-205). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:43`).
  > `reviews/round-18-closing.md:1343`의 "【추론】 그 점검은 그 디렉토리와 그것을 가리키는 import가 하나도 없는 것이다."는 18라운드 결정과 다르다: PR-7의 점검은 새 코드가 레거시를 가리키는 import가 0인 것이고, `src/__legacy__/`는 PR-8까지 보존하며 디렉토리 삭제는 PR-8이 한다(LANDING-205). 18라운드 결정이 이긴다(`reviews/round-18-owner-answers.md:43`).
  > `reviews/round-18-closing.md:1339`의 "【추론】 규칙 2: 레거시 → 새 코드는 08 §17.2가 이미 적은 곳만 허용한다(예: 옛 `intersect*Schema`가 새 잎 교차 함수를, 옛 소비자가 청사진으로 옮긴 식 컴파일러를 가져온다)."는 소유자 답과 다르다: 레거시는 새 코드를 하나도 가져오지 않고 필요한 것은 `src/__legacy__/` 안의 사본으로 둔다. 소유자 답이 이긴다(`reviews/round-74-owner-answers.md:7`).
  > `reviews/round-18-closing.md:1336`의 "【추론】 옛 노드는 PR-7까지 오늘의 parse 동작을 지키고 새 parse(18C-36)를 가져오지 않으므로, 아래 규칙 2의 허용 목록은 바뀌지 않는다."는 소유자 답과 다르다: 규칙 2와 그 허용 목록은 폐기되었다. 소유자 답이 이긴다(`reviews/round-74-owner-answers.md:7`).

### LANDING-160 이주(18라운드) — 수 노드의 근사 같음 비교가 정확한 비교로

- 결정:
  > 이주(LANDING-160): 오늘 `NumberNode.__equals__`의 근사 비교(`src/core/nodes/NumberNode/NumberNode.ts:28-38`, `isClose`)는 정확한 비교가 된다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1400`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1405-1411`

### LANDING-161 이주(18라운드) — 객체 같음 비교가 키 순서를 본다

- 결정:
  > 이주(LANDING-161): `ObjectNode`의 키 순서를 무시하는 `equals`(`ObjectNode.ts:46-52`)는 키 순서를 보게 된다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1401`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1405-1411`

### LANDING-162 이주(18라운드) — 내장 객체·클래스 인스턴스는 참조로 비교

- 결정:
  > 이주(LANDING-162): 오늘 `ObjectNode.__equals__`가 쓰는 `@winglet/common-utils/object`의 `equals`(`packages/winglet/common-utils/src/utils/object/equals/equals.ts`)는 내장 객체(`Date` 등)를 내부 상태로, 클래스 인스턴스를 구조로 비교하며, 새 규칙 (가)는 이들을 참조로 본다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1402`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1405-1411`

### LANDING-163 이주(18라운드) — `derived`는 자기 의존 집합에서만 발화

- 결정:
  > 이주(LANDING-163): 오늘은 노드의 모든 계산 속성이 한 의존 배열을 나눠(`ComputedPropertiesManager.ts:264-268`, `AbstractNode.ts:516-555`) `active`만 읽는 경로가 바뀌어도 `derived`를 다시 세고, 새 설계에서는 `derived`가 자기 의존 집합에서만 발화한다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1403`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-50)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1405-1411`

### LANDING-164 이주(18라운드) — 배열 통째 쓰기가 아이템 키를 잇는다(상태가 위치를 따라감)

- 결정:
  > 이주(LANDING-164): 통째 쓰기가 아이템 키를 새로 만들지 않아 `dirty`·`touched`·바깥 오류·가상화 기록·컨테이너 입력의 비값 상태·소비자가 든 노드 참조가 위치를 따라가며, 오늘은 `clear` 뒤 전량 `push`라 모두 새로 시작한다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1683`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1686-1690`

### LANDING-165 이주(18라운드) — 닫힌 튜플 뒤의 값이 방출된다

- 결정:
  > 이주(LANDING-165): 닫힌 튜플 뒤의 값이 버려지지 않고 방출된다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1684`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-59)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1686-1690`

### LANDING-166 이주(18라운드) — 사용자가 일으킨 `injectTo`가 null 조상을 객체로 만들지 않는다

- 결정:
  > 이주(LANDING-166): 사용자 쓰기가 일으킨 `injectTo`가 null 조상을 객체로 만들던 동작(`ObjectNode/DETAIL.md:14,16`)이 사라져, 값은 null 조상 아래에 그려지지만 방출되지 않는다.
  > 이주 안내 항목(C8)으로 둔다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1847-1848`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-65)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1850-1855`

### LANDING-167 이주(18라운드) — 인라인 입력을 둔 가상 노드 아래 경로의 `find`가 참조된 노드를 돌려준다

- 결정:
  > 이주(LANDING-167): 인라인 `FormTypeInput`을 둔 가상 노드 아래 경로의 `find`는 오늘 그 가상 노드를 돌려주고(오늘 가상의 인라인 입력은 `'terminal'`이고 `findNode`는 터미널에 닿으면 남은 경로를 무시한다), 새 설계에서는 참조된 노드를 돌려준다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:1909`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-68)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:1911-1914`

### LANDING-168 이주(18라운드) — Form 속성의 잠금 동안 입력의 `onChange`는 버려진다

- 결정:
  > 이주(LANDING-168): Form 속성의 잠금(`readOnly`·`disabled`)이 켜진 동안 입력의 `onChange`는 버려지며, 오늘은 노드 자신의 잠금만 버리고(`SchemaNodeInput.tsx:51`) Form 속성의 잠금은 입력 prop으로만 넘긴다(`:111-112`).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2004`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-71)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2006-2008`

### LANDING-169 이주(18라운드) — 루트 수준 검증 오류의 `dataPath`가 `'/'`에서 `''`로

- 결정:
  > 이주(LANDING-169): 루트 수준 검증 오류의 공개 `dataPath`가 `'/'`에서 `''`로 바뀐다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2057`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-74)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2059-2062`

### LANDING-170 명령 `RequestEmitChange`·`RequestInjection`은 새 설계에 없음(이주 행 없음), 공개 훅 셋 `useChildNodeComponentMap`·`useChildNodeErrors`·`useFormSubmit`은 이름·시그니처 유지, `useChildNodeErrors`는 PR-7에 새 통지로 다시 구현

- 결정:
  > 【추론】 (1) `RequestEmitChange`·`RequestInjection`은 새 설계에 없다.
  > 【추론】 둘 다 오늘의 이벤트 사슬 전파가 쓰던 내부 비트다(`BranchStrategy.ts:145`, `AbstractNode.ts:974-977`).
  > 【추론】 새 설계에서는 방출과 `controls.injectTo`가 정착 루프의 구조(작업 루프의 커밋과 파생 단계)이며, "전파와 통지가 옵션이 아니라 구조"다(GOAL-075).
  > 【추론】 오늘 공개 `NodeEventType`(=`PublicNodeEventType` 여섯, `src/core/types/event.ts:85-92`, `src/index.ts:44`)에 없고 소비자가 publish할 수도 없으므로(`reviews/round-5-derivations.md:22` C-11) 이주 행은 두지 않는다.
  > 【추론】 (2) 05 §3이 든 공개 훅 가운데 REACT-006이 다루지 않은 셋, `useChildNodeComponentMap`·`useChildNodeErrors`·`useFormSubmit`은 이름과 시그니처를 유지한다(`src/index.ts:82-84`).
  > 【추론】 `useChildNodeComponentMap`은 `ChildNodeComponents`의 `field`만 쓰는 렌더 계층 도우미라 그대로 둔다.
  > 【추론】 `useChildNodeErrors`는 PR-7에서 새 통지(`UpdateChildren`에 대응하는 형상 변경, `UpdateState`, 18C-83의 `UpdatePath`)로 다시 구현하며, 반환형의 `JSONSchemaError`는 `ValidationIssue`로 바뀐다(§14의 21행, LANDING-070).
  > 【추론】 `useFormSubmit`은 `FormHandle.submit`의 `subscribe`·`pending` 위에 서 있고, `degraded` 동안 제출 거부 경로로 이미 새 설계에 쓰였으므로(`adr/0014-error-policy.md:237`) 유지한다.
  > 【추론】 이 결정은 명령 둘과 훅 셋에 한정한다.
  > 【추론】 같은 원문의 나머지 미확인(`Form` props 14, `FormHandle` 8, `NodeEventType` 17종의 개별 생사, `ValidationMode`, `oneOfIndex`/`anyOfIndices`, `type: 'virtual'`, root 폴백, 빈 값 경로)은 이 행의 범위가 아니며, `alias`·`placeholder`·`errorMessages`는 18C-72가 닫는다.
- 보충:
  > 소유자(18C 검토 5번): "브레이킹 체인지를 할거라 제거되는 명령은 없애버려도 됩니다." (`reviews/round-18-owner-answers.md:27`)
  > 소유자(설계서 메모 3): "publish 가 없어진건.. 자의적으로 이벤트를 호출할 수 없어서 좀 그렇긴 한데, 이 4개 기능을 4개로 분할해서 두지 말고 하나의 메소드에 여러 행위 타입을 파라미터로 받아서 행동하게 해줘. 이전에는 publish 에 섞여있어서 메소드로 안보였는데, 이걸 별도 메소드로 빼니까 node 의 정체성이 좀 깨지는걸 action 이나 interaction 이나 뭐든.... publish 를 부활시키던가..." (`reviews/round-18-owner-answers.md:40`)
  > 편집자 결정(68C-03): "【추론】 설계서 메모 3은 방향("넷을 따로 두지 말고 종류를 매개변수로 받는 메서드 하나로")과 이름 후보(`action`·`interaction`·`request`, 또는 명령에 한정한 `publish` 부활)를 함께 적은 것이고, 30라운드에서 소유자가 이름을 `request`로 확정하며 "공개 `publish`는 두지 않는다"(EVENT-063 보충)로 닫혔다. LANDING-170의 "`RequestEmitChange`·`RequestInjection`은 새 설계에 없다"와 "소비자가 publish할 수 없다"는 그대로이고, 메모 3의 `publish` 부활 후보는 택하지 않은 안으로 읽는다. 07의 `FormHandle`과 렌더 계층은 노드의 `request(kind)`만 부른다." (`reviews/round-68-closing.md:23`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2256-2265`(정본), `reviews/round-18-owner-answers.md:40`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-86), 소유자 답(`reviews/round-18-owner-answers.md:27` 18C 검토 5번; 제거 확인), 소유자 답(`reviews/round-18-owner-answers.md:40` 설계서 메모 3)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2267-2268`

### LANDING-171 이주(18라운드) — 빈 중첩 객체·배열 노드의 `outputValue`는 `omitEmpty` 아래에서 `undefined`(오늘 `normalizedValue`는 `{}`·`[]`)

- 결정:
  > 이주(LANDING-171): 빈 중첩 객체·배열 노드의 `normalizedValue`는 오늘 `{}`·`[]`이고(`src/helpers/defaultValue/getEmptyValue/getEmptyValue.ts:8-14`, `src/core/nodes/AbstractNode/AbstractNode.ts:397-399`), 새 설계의 `outputValue`는 `omitEmpty`(기본 켜짐) 아래에서 `undefined`다(18C-88).
  > `node.value`(투영 전)는 오늘처럼 `{}`·`[]`이고, 부모의 값과 `FormHandle.getValue()`에는 오늘처럼 그 키가 없다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2287-2288`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-87)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2290-2296`

### LANDING-172 이주(18라운드) — `['object','string']`·`['object','array']`·`['array','string']`은 터미널 강제 `union`(안쪽 `find` 없음, `{}`·`[]` 방출은 `omitEmpty: false`)

- 결정:
  > 이주(LANDING-172): `['object','string']`·`['object','array']`·`['array','string']`은 오늘 `UNKNOWN_JSON_SCHEMA`이고(`extractSchemaInfo.ts:28-29` → `schemaNodeFactory.ts:116`), 새 설계에서는 터미널 강제 union이며 안쪽 `find`는 없고 `{}`·`[]`를 방출하려면 `omitEmpty: false`를 적는다(`reviews/round-18-owner-answers.md:29`).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2638`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-173 이주(18라운드) — `type` 배열과 함께 적힌 `nullable:true`는 nullable(오늘 배열 경로가 보지 않음)

- 결정:
  > 이주(LANDING-173): `type`이 배열이고 `nullable:true`가 함께 있으면(`{type:['string'], nullable:true}` 같은 비 union 포함) 오늘은 배열 경로가 `nullable`을 보지 않고(`extractSchemaInfo.ts:24-34`), 새 설계에서는 `nullable: true`다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2639`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-174 이주(18라운드) — 형 없는 원시 `anyOf`·`oneOf`(TypeBox·pydantic·zod)는 `union`·원시 잎

- 결정:
  > 이주(LANDING-174): 형 없는 원시 `anyOf`·`oneOf`(TypeBox, pydantic, zod)는 오늘 `UNKNOWN_JSON_SCHEMA`이고(`extractSchemaInfo.ts:23`), 새 설계에서는 union·원시 잎(+nullable)이다(`reviews/round-18-owner-answers.md:30`).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2640`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-175 이주(18라운드) — 형 없는 칸의 분기가 모두 null 분기이면 nullable null 노드

- 결정:
  > 이주(LANDING-175): 형 없는 칸의 분기가 모두 null 분기인 것(`{anyOf:[{type:'null'}]}`)은 오늘 같은 오류이고(`extractSchemaInfo.ts:23`), 새 설계에서는 nullable null 노드다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2641`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-176 이주(18라운드) — 형 없는 `{allOf:[{type:'string'}]}`는 string 노드

- 결정:
  > 이주(LANDING-176): 형 없는 `{allOf:[{type:'string'}]}`는 오늘 병합 처리기가 없어 오류이고(`src/helpers/jsonSchema/processAllOfSchema/processAllOfSchema.ts:31-32`), 새 설계에서는 string 노드다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2642`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-177 이주(18라운드) — `['null','null']`은 `UNKNOWN_JSON_SCHEMA`(오늘 nullable null 노드)

- 결정:
  > 이주(LANDING-177): `['null','null']`은 오늘 nullable null 노드이고(`extractSchemaInfo.ts:28,30`), 새 설계에서는 `UNKNOWN_JSON_SCHEMA`다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2643`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-178 이주(18라운드) — nullable 기반에 붙은 형 없는 `allOf` 항목 `{nullable:false}`는 효과 없음

- 결정:
  > 이주(LANDING-178): nullable 기반에 붙은 형 없는 `allOf` 항목 `{nullable:false}`는 오늘 null을 빼고(`src/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/processSchemaType.ts:57,65-67`), 새 설계에서는 효과가 없다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2644`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-179 이주(18라운드) — `{type:['string','null'], allOf:[{type:['number','null']}]}`는 nullable null 노드(오늘 `ALL_OF_TYPE_REDEFINITION`)

- 결정:
  > 이주(LANDING-179): `{type:['string','null'], allOf:[{type:['number','null']}]}`는 오늘 `ALL_OF_TYPE_REDEFINITION`이고(`winglet/json-schema/src/filters/isCompatibleSchemaType.ts:62-68`), 새 설계에서는 nullable null 노드다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2645`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-180 이주(18라운드) — `{type:'number', allOf:[{type:['number','string']}]}`는 교집합인 number 노드(오늘 `ALL_OF_TYPE_REDEFINITION`)

- 결정:
  > 이주(LANDING-180): `{type:'number', allOf:[{type:['number','string']}]}`는 오늘 `ALL_OF_TYPE_REDEFINITION`이고(`processAllOfSchema.ts:45-50` ← `validateCompatibility.ts:21-25` ← `isCompatibleSchemaType.ts:77-83`), 새 설계에서는 교집합인 number 노드다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2646`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-181 이주(18라운드) — `Hint.type`·`FormTypeInputProps.type`은 `node.type`(정수 노드는 `'number'`), 새 칸 `schemaType`

- 결정:
  > 이주(LANDING-181): `Hint.type`·`FormTypeInputProps.type`은 오늘 `node.schemaType`이고(`src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInput.ts:70`, `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:124`), 새 설계에서는 `node.type`이며 정수 노드는 `'integer'`에서 `'number'`로 바뀌고 새 칸 `schemaType`이 생긴다(`reviews/round-18-owner-answers.md:36`).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2647`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-182 이주(18라운드) — `{type:['number','integer']}` 시험은 `{type:'number'}`, 정수만이면 `{schemaType:'integer'}`

- 결정:
  > 이주(LANDING-182): `{type:['number','integer']}` 시험(코어 `src/formTypeDefinitions/FormTypeInputNumber.tsx:44`, antd5·antd6 Number `:62`·Slider `:53`, antd-mobile Number `:51`, mui Number `:120`)은 새 설계에서 `{type:'number'}`이고, 정수만이면 `{schemaType:'integer'}`다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2648`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-183 이주(18라운드) — 함수 시험의 `type === 'integer'` 절은 죽은 조건이라 지움

- 결정:
  > 이주(LANDING-183): 함수 시험의 `type === 'integer'` 절(antd5·antd6 RadioGroup `:86`, antd-mobile RadioGroup `:91`·Slider `:59`, mui RadioGroup `:125`·Slider `:114`)은 죽은 조건이므로 지운다(TS2367로 드러남).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2649`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-184 이주(18라운드) — mui 수 입력 — 빈 칸 `undefined`, 정수 판정 `schemaType === 'integer'`, 자르지 않음, 해석할 수 없는 글은 초안

- 결정:
  > 이주(LANDING-184): mui 수 입력은 오늘 빈 칸이 `null`이고(`schema-form-mui-plugin/src/formTypeInputs/FormTypeInputNumber.tsx:74-76`), 정수를 `type === 'integer'`로 판정해 `parseInt`로 자르며(`:81`), `step`을 쓴다(`:109`). 새 설계에서는 빈 칸이 `undefined`, 판정은 `schemaType === 'integer'`, 자르지 않음, 해석할 수 없는 글은 초안이다(REACT-027, WRITE-075).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2650`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-185 이주(18라운드) — `FormTypeTestObject`의 `type`은 `SchemaNodeType`이나 그 배열, 새 키 `schemaType`

- 결정:
  > 이주(LANDING-185): `FormTypeTestObject` 형 선언은 오늘 `type: JSONSchemaType | JSONSchemaType[]`이고(`src/types/formTypeInput.ts:163`), 새 설계에서는 `type: SchemaNodeType | SchemaNodeType[]`와 새 키 `schemaType`이다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2651`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-186 이주(18라운드) — 시험 객체의 모르는 키는 대조에서 빼고 개발 모드 경고(오늘 `{typo: undefined}`가 우연히 맞음)

- 결정:
  > 이주(LANDING-186): 시험 객체의 모르는 키는 오늘 모든 키를 비교해 `{typo: undefined}`가 우연히 맞고(`src/helpers/formTypeInputDefinition/formTypeInputDefinitions.ts:44-58`), 새 설계에서는 대조에서 빼고 개발 모드 경고를 낸다(18C-92).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2652`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-187 이주(18라운드) — 코어 기본 입력 정의는 `{type:'union'}` 감싸개를 더해 열한 개

- 결정:
  > 이주(LANDING-187): 코어 기본 입력 정의는 오늘 열 개이고(`src/formTypeDefinitions/index.tsx:14-25`), 새 설계에서는 `{type:'union'}` 감싸개를 더해 열한 개다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2653`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-188 이주(18라운드) — 가드 `isTerminalNode`·`isBranchNode`는 `strategy`를 보고 반환 형에 `UnionNode`가 더해짐

- 결정:
  > 이주(LANDING-188): 가드 `isTerminalNode`·`isBranchNode`는 오늘 `node.group`을 보고(`src/core/nodes/filter.ts:77,198`) `isTerminalNode`의 반환 형은 `BooleanNode | NumberNode | StringNode | NullNode`이며(`:197`), 새 설계에서는 `strategy`를 보고 반환 형에 `UnionNode`가 더해지며 좁힌 뒤 `switch (node.type)`에 `case 'union'`이 필요하다(18C-89).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2654`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-189 이주(18라운드) — `InferValueType`의 `as const` `type` 배열은 `any`에서 정확한 합 형으로

- 결정:
  > 이주(LANDING-189): `InferValueType`의 `as const` `type` 배열은 오늘 `any`이고(`src/types/value.ts:10-15`), 새 설계에서는 정확한 합 형이며 새 형 오류가 날 수 있다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2655`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-190 이주(18라운드) — 합 형에 대한 `InferJSONSchema`는 분배되지 않고 `UnionSchema`·`UnionNode`

- 결정:
  > 이주(LANDING-190): `InferJSONSchema<A|B>`는 오늘 분배되어 `StringNode | NumberNode`이고(`src/types/jsonSchema.ts:40-88`), 새 설계에서는 `UnionSchema`와 `UnionNode`다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2656`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-191 이주(18라운드) — `SchemaNode` 합집합과 `FormTypeRendererProps.type`에 `UnionNode`·`'union'`(망라 `switch`에 `case 'union'`)

- 결정:
  > 이주(LANDING-191): `SchemaNode` 합집합과 `FormTypeRendererProps.type`에는 오늘 `UnionNode`와 `'union'`이 없고(`src/types/formTypeRenderer.ts:21`), 새 설계에서는 망라 `switch`에 `case 'union'`을 더한다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2657`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-192 이주(18라운드) — 값을 바꾸는 옵션을 켠 ajv 인스턴스의 `bind`는 `VALIDATOR_BIND_REFUSED`(가칭)를 던짐

- 결정:
  > 이주(LANDING-192): `coerceTypes`·`useDefaults`·`removeAdditional`을 켠 ajv 인스턴스의 `bind`는 오늘 받아들이고 살아 있는 폼 값이 제자리에서 바뀌며(`schema-form-ajv8-plugin/src/default/validatorPlugin.ts:46`, `src/core/nodes/AbstractNode/AbstractNode.ts:718`, `schema-form-ajv8-plugin/src/validator/createValidatorFactory.ts:23-25`), 새 설계에서는 `bind`가 `VALIDATOR_BIND_REFUSED`를 던지므로 폼에는 값을 바꾸지 않는 인스턴스를 따로 만들어 넘긴다(`reviews/round-18-owner-answers.md:34`).
- 보충:
  > 편집자 결정(32C-02): "【추론】 ajv 플러그인 셋은 `@canard/schema-form`을 런타임 의존성으로 갖지 않으므로(형만 가져온다) 코어 클래스를 던지려면 새 런타임 의존성이 필요한데, 원장은 그런 의존을 정하지 않았다; 플러그인이 이미 런타임 의존성으로 가진 `@winglet/common-utils`의 `BaseError`를 그룹 `'UNHANDLED_ERROR'`·코드 `'VALIDATOR_BIND_REFUSED'`로 던진다(코어 `UnhandledError`와 같은 기반 클래스·같은 그룹·코드 모양). 플러그인 안의 하위 클래스로 감싸도 되나 `name`은 자기 이름을 적고 코어 클래스를 사칭하지 않는다." (`reviews/round-32-closing.md:19`)
  > 편집자 결정(35C-07): "【추론】 32C-02의 "플러그인이 이미 런타임 의존성으로 가진 `@winglet/common-utils`"는 ajv8 플러그인에만 맞고 ajv6·ajv7은 `ajv`만 의존하므로 바로잡는다: ajv 플러그인 셋은 저마다 네이티브 `Error`의 하위 클래스를 자기 이름으로 두고 `group: 'UNHANDLED_ERROR'`·`code: 'VALIDATOR_BIND_REFUSED'`·`details`(켜진 옵션 이름)를 실어 던지며, 호출자는 `group`과 `code`로 가른다; ajv8이 같은 칸을 가진 `BaseError`를 쓰는 것은 허용되나 셋을 같게 두는 것이 낫고, 새 작업 공간 의존성은 더하지 않는다." (`reviews/round-35-closing.md:56`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2658`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-193 이주(18라운드) — 검증기에 넘기는 스키마 사본은 깊은 사본 한 번(오늘 얕음)

- 결정:
  > 이주(LANDING-193): 검증기에 넘기는 스키마 사본은 오늘 얕고(`createValidatorFactory.ts:19-22`, `src/helpers/jsonSchema/stripSchemaExtensions/stripSchemaExtensions.ts:32-36`), 새 설계에서는 깊은 사본을 한 번 만든다(`reviews/round-18-owner-answers.md:34`).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2659`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-194 이주(18라운드) — ajv8에서 union `type`의 `strictTypes` 로그 경고가 없어짐(`allowUnionTypes`)

- 결정:
  > 이주(LANDING-194): ajv8에서 union `type`은 오늘 `strictTypes` 로그 경고를 내고(`schema-form-ajv8-plugin/src/default/validatorPlugin.ts:15-19`에 `strict` 없음, `node_modules/ajv/lib/core.ts:250`의 기본 `"log"`), 새 설계에서는 경고가 없다(`allowUnionTypes`, 18C-90).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2660`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-195 이주(18라운드) — 터미널 아래 경로의 검증 에러는 터미널(union) 노드가 받음(오늘 버려짐)

- 결정:
  > 이주(LANDING-195): 터미널 아래 경로의 검증 에러는 오늘 버려지고(`src/core/nodes/AbstractNode/utils/ValidationManager/ValidationManager.ts:150`), 새 설계에서는 터미널(union) 노드가 받는다(18C-91).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2661`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-196 이주(18라운드) — 기본 입력의 빈 칸은 `undefined`, 해석할 수 없는 초안은 흐려질 때 되돌림

- 결정:
  > 이주(LANDING-196): 기본 입력의 빈 칸과 초안은 오늘 문자열 입력이 글을 그대로 보내고(`src/formTypeDefinitions/FormTypeInputString.tsx:27-29`) 수 입력이 `valueAsNumber`를 보내며(`src/formTypeDefinitions/FormTypeInputNumber.tsx:22-24`), 새 설계에서는 REACT-027을 따라 빈 칸은 `undefined`이고 해석할 수 없는 초안은 흐려질 때 되돌린다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2663`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-197 이주(18라운드) — 터미널 object·array 값 안의 JSON 부정합에 개발 모드 경고 (가칭) `NON_JSON_WHOLE_VALUE`

- 결정:
  > 이주(LANDING-197): 터미널 object·array 값 안의 JSON 부정합은 오늘 검사가 없고, 새 설계에서는 개발 모드 경고 `NON_JSON_WHOLE_VALUE`를 낸다(18C-91).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2664`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`

### LANDING-198 union 설계의 이주 점검 — PR-7 이주 목록에 LANDING-181–LANDING-186과 자사 플러그인마다 `union` 항목(권장), 바뀌지 않는 것, 이주 행마다 오늘과 새 동작을 시험으로 대조

- 결정:
  > 【추론】 LANDING-151의 PR-7 이주 목록에 LANDING-181–LANDING-186을 더하고, 자사 플러그인마다 union 항목(권장)을 둔다.
  > 【추론】 바뀌지 않는 것: `['object','null']`은 nullable object이고, `['null']`은 null 노드다.
  > 【추론】 바뀌지 않는 것: `[]`와 `['string','string']`은 오류다.
  > 【추론】 바뀌지 않는 것: `{type:'number', allOf:[{type:'integer'}]}`와 `{type:'integer', allOf:[{type:'number'}]}`의 `schemaType`은 `'integer'`다(`processSchemaType.ts:73`, `isCompatibleSchemaType.ts:90-93`).
  > 【추론】 바뀌지 않는 것: `{type:'string', allOf:[{type:['string','null']}]}`는 nullable이 아닌 string이다.
  > 【추론】 바뀌지 않는 것: 서로소인 정적 선언(`{type:'string', allOf:[{type:'number'}]}`)은 `ALL_OF_TYPE_REDEFINITION`이다.
  > 【추론】 바뀌지 않는 것: union이 아닌 모든 노드의 `schemaType` 값.
  > PR: PR-7(이주 점검), 시험은 각 줄의 PR(청사진 PR-1, 행 PR-2, 검증기 PR-4, 렌더 PR-7)
  > 무엇: 이주 행마다 오늘 동작과 새 동작을 시험으로 대조하고, 자사 플러그인(antd5·antd6·antd-mobile·mui·ajv6·7·8)의 수정 목록을 LANDING-151과 대조한다.
  > 통과: 오늘과 다른 곳마다 이주 행이 있고, 시험 목록의 모든 줄이 통과한다.
  > 실패: 빠진 이주 행을 더하고, 시험이 규칙과 어긋나면 해당 블록(18C-89–18C-92)을 고친다.
- 보충:
  > 반영 칸(개발계획 P1): "UI 플러그인 넷(antd5·antd6·antd-mobile·mui)의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR(우산 순서 N+1, PR-7 뒤)이 한다." (`reviews/round-18-owner-answers.md:42`)
  > 편집자 결정(68C-02): "【추론】 이주 표는 LANDING-004–050("이주 1"–"이주 47")과 그 뒤 "이주(05)"·"이주(S1)"·"이주(18라운드)"·"이주(19라운드)" 머리를 단 행(LANDING-115–208 사이)으로 흩어져 있고, 18C-87이 정한 이주 점검은 "이주 표의 행마다 오늘 동작과 새 동작을 시험으로 대조"이므로 대상은 현행 상태의 이주 행 전부다. LANDING-206이 "이주 표의 행(LANDING-181–LANDING-186)과 이주 점검은 PR-7에 남는다"고 적은 것은 같은 답에서 08로 옮긴 셋(`presentation.*` 이주·자사 플러그인 수정 목록·플러그인마다의 union 항목)과 헷갈릴 수 있는 union 이주 행이 PR-7에 남음을 밝힌 것이지 점검 범위를 여섯 행으로 줄인 것이 아니다. 07은 `### LANDING-nnn 이주` 머리를 기계로 뽑아 행마다 (가) 렌더 또는 e2e 시험으로 오늘과 새 동작을 대조(시험 이름), (나) 렌더와 무관해 02–06의 코어 시험이 이미 덮음(그 시험 이름 인용; 인용 없는 (나)는 받지 않는다), (다) 08(플러그인)·09(정리·릴리스)의 몫 가운데 하나를 적은 점검표를 `verification/07-switch/`에 두고, 그 표가 PR-7의 이주 점검 게이트다. 상태가 "폐기"·"분할됨"·"대체됨"인 이주 행은 표에 넣되 처분은 "현행 아님"으로 적는다." (`reviews/round-68-closing.md:16`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2665-2671,2717-2720`(정본), `reviews/round-18-owner-answers.md:42`
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-93), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2711-2715`
- 충돌:
  > `reviews/round-18-closing.md:2665`의 "【추론】 LANDING-151의 PR-7 이주 목록에 LANDING-181–LANDING-186을 더하고, 자사 플러그인마다 union 항목(권장)을 둔다."는 소유자 답과 다르다: 이주 표의 행 LANDING-181–LANDING-186과 이주 점검은 PR-7에 남고, 자사 플러그인마다의 union 항목은 플러그인 PR이 한다(LANDING-206). 소유자 답이 이긴다(`reviews/round-18-owner-answers.md:42`).

### LANDING-199 이주(18라운드) — 호출자의 `setValue(V)`는 하위 트리 전체가 아니라 원본이 바뀐 노드만 다시 마운트

- 결정:
  > 이주(LANDING-199): 호출자의 `setValue(V)`(`Overwrite`)는 오늘 브랜치에도 Refresh를 내어 하위 트리 전체를 다시 마운트하고(`08-design-a-to-z.md:471`의 오늘 칸), 새 설계에서는 원본이 실제로 바뀐 노드만 다시 마운트한다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2732`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2734-2736`

### LANDING-200 이주(18라운드) — 호출자의 `setValue(null)` 뒤 자식 쓰기로 객체가 돌아와도 자식 기본값을 채우지 않는다

- 결정:
  > 이주(LANDING-200): 호출자의 `setValue(null)` 뒤 자식 쓰기로 객체가 돌아오면 오늘은 null인 동안 자식이 든 기본값이 나타나고(`src/core/nodes/ObjectNode/DETAIL.md:19-20`), 새 설계에서는 채우지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2814`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-99)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2818-2820`

### LANDING-201 이주(18라운드) — 입력의 `onChange(v, Overwrite)`는 자기 입력을 다시 마운트하지 않는다

- 결정:
  > 이주(LANDING-201): 입력의 `onChange(v, SetValueOption.Overwrite)`는 오늘 `Overwrite`에 든 `Refresh` 비트로 자기 입력을 다시 마운트하고(`src/core/types/value.ts:63,65`, `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:50-53,121`, `src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInputControl.ts:37`), 새 설계에서는 다시 마운트하지 않는다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2815`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-99)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2818-2820`

### LANDING-202 이주(18라운드) — 배열 통째 `setValue`는 남은 아이템을 채우지 않고 뒤쪽의 새 아이템만 채운다

- 결정:
  > 이주(LANDING-202): 배열을 통째로 쓰는 `setValue`는 오늘 아이템을 다시 만들어 모두 채우고(탐침 P8, `reviews/raw-round18-tests/t1b-fill-consistency.md:116-133`), 새 설계에서는 위치로 이어 남은 아이템은 채우지 않고 뒤쪽에 새로 생긴 아이템만 채운다(NODE-051, WRITE-090).
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2816`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-99)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2818-2820`

### LANDING-203 채움 시점 이주 행 셋(LANDING-200–LANDING-202)의 점검 — 세 장면을 오늘 코드와 새 구현에서 돌린다

- 결정:
  > PR: PR-7(이주 점검)·PR-5(배열)
  > 무엇: 세 장면을 오늘 코드와 새 구현에서 돌린다.
  > 통과: 오늘 결과가 T1-B의 탐침과 같고 새 결과가 이주 행대로다.
  > 실패: 다르면 이주 행을 고친다.
- 보충:
  > 편집자 결정(18C-99, 물음의 제목): "채움 시점의 이주 행 셋 — `setValue(null)` 뒤 자식 쓰기, 입력의 `Overwrite`, 배열 통째 `setValue`" (`reviews/round-18-closing.md:2810`) — "세 장면"은 LANDING-200·LANDING-201·LANDING-202의 이주 행이다.
  > 편집자 결정(18C-99, 근거): "T1-B #6(`reviews/raw-round18-tests/t1b-fill-consistency.md:116-133`): 셋 모두 오늘 코드를 실행해 확인했다." (`reviews/round-18-closing.md:2818`)
- 상태: 현행
- 출처: `reviews/round-18-closing.md:2822-2825`(정본)
- 닫은 사람: 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-99)
- 라운드: 18
- 까닭: `reviews/round-18-closing.md:2818-2820`

### LANDING-204 우산 `1.0.0-beta`와 개발 PR 여섯 — 기반+청사진, 노드 트리·정착, 파생+상태 키·제어, 통지·검증, 배열, 전환; 자식 PR은 설계·설계문서 → 개발 여섯 → 플러그인 → 정리·릴리스, 단계 정의는 그대로

- 결정:
  > 인접 단계 합침 둘을 채택한다: 기반(PR-0의 코드 부분)과 청사진(PR-1)은 한 PR, 파생(PR-3)과 상태 키·제어(PR-6)는 한 PR.
  > 개발 PR은 여섯이다: 기반+청사진, 노드 트리·정착(PR-2), 파생+상태 키·제어, 통지·검증(PR-4), 배열(PR-5), 전환(PR-7).
  > 우산 PR(`1.0.0-beta`, #344)의 자식은 설계 PR·설계문서 PR → 개발 PR 여섯 → 플러그인 PR → 정리·릴리스 PR(PR-8)이며 모두 `1.0.0-beta`를 base로 열고 merge commit으로 들어온다.
  > 원장의 단계 정의(LANDING-060–068)는 바뀌지 않는다.
  > 릴리스 전환 PR(LANDING-097)의 시점은 소유자가 정한다.
- 보충:
  > 소유자(개발계획 P3·P4): "이외 권장대로." (`reviews/round-18-owner-answers.md:44`)
  > 소유자(개발계획 1-가): "1-가" (`reviews/round-18-owner-answers.md:45`)
  > 반영 칸(개발계획 1-가): "기반 PR과 병렬이며 코드 PR을 막지 않는다." (`reviews/round-18-owner-answers.md:45`) — 자식 순서의 "설계 PR·설계문서 PR → 개발 PR 여섯"에서 설계문서 PR은 순차가 아니라 병렬이다.
  > 소유자(76라운드, 정돈 단계의 신설과 자리): "그렇게 하자. 지금은 안할거고, 그 단계에서 내가 집중적으로 코드를 보면서 진행할게. 일단 단계만 구분해두렴. 큰 틀이나 인터페이스를 바꿀거같진 않고, 파일 구성이나 함수 이름, 함수 로직 등을 손댈거같아." (`reviews/round-76-owner-answers.md:7`) — 개발 순서에 "정돈" 단계가 든다: 07 전환 → 08 플러그인 → 정돈 → 성능 최적화 → 09. 범위는 내부(파일 구성·함수 이름·함수 로직)이고 fractal 경계와 공개 인터페이스는 바꾸지 않는다(원장 관리자, 2026-10-03).
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:44`(정본, 반영 칸), `reviews/round-18-owner-answers.md:45`
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4), 소유자 답(`reviews/round-18-owner-answers.md:45` 개발계획 1-가)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:44`, `reviews/round-18-owner-answers.md:45`

### LANDING-205 `src/__legacy__/`는 정리·릴리스 PR(PR-8)까지 참고용으로 보존 — PR-7은 진입점 전환과 레거시 import 0 점검만, 삭제는 PR-8, 우산에 딸린 무관한 파일은 정리하지 않음

- 결정:
  > `src/__legacy__/`는 PR-7이 지우지 않고 정리·릴리스 PR(PR-8)까지 참고용으로 보존한다.
  > PR-7은 진입점을 새 엔진으로 바꾸고 새 코드가 레거시를 가리키는 import가 0임을 점검한다.
  > 디렉토리 삭제는 PR-8이 한다.
  > 우산 브랜치에 딸려 들어온 무관한 파일(`.seiri/.gitignore`, 벤치 결과)은 정리하지 않는다.
- 보충:
  > 소유자(개발계획 P2): "레거시는 마지막까지 보존. 참고용." (`reviews/round-18-owner-answers.md:43`)
  > 소유자(개발계획 P2): "무관한 커밋을 굳이 정리할 필욘 없어." (`reviews/round-18-owner-answers.md:43`)
  > 편집자 결정(71C-01): "【추론】 LANDING-087의 "지운다"는 새 엔진의 `core/types`에서 노드 형 묶음이 사라진다는 뜻이고, LANDING-205는 레거시를 PR-8까지 참고용으로 보존하되 그 안에 두면 tsc·eslint가 설정 변경 없이 따라간다고 했으므로(LANDING-159) 레거시는 전환 뒤에도 컴파일되어야 한다. 둘을 함께 지키는 길은 LANDING-159가 정한 옮김의 모양 그대로다: `src/core/types/node.ts`·`constructor.ts`의 내용을 `src/__legacy__/core/types/`에 같은 상대 경로로 두고(그 안의 `index.ts`가 이름으로 다시 내보냄), 레거시 파일의 가져오기는 별칭 접두만 바꾼다(`@/schema-form/core/types` → `@/schema-form/__legacy__/core/types`, 상대 경로 가져오기는 레거시 안의 묶음을 가리키도록 고침). 70C-01이 `contextNodeFactory`를 옛 엔진과 함께 레거시로 보낸 것과 같은 처분이다. 레거시가 계속 가져오는 `event`·`state`·`value` 형은 오늘 레거시가 이미 `core/types`에서 가져오던 것이고 형 전용이므로 규칙 2("레거시 → 새 코드는 08 §17.2가 이미 적은 곳만")의 허용 목록을 넓히지 않는다 — 다만 07은 그 형들의 뜻이 새 엔진에서 바뀌었다면(예: 상태 비트의 이름) 레거시 쪽 사본을 `src/__legacy__/core/types/`에 함께 두어 레거시가 새 형에 끌려가지 않게 한다. 새 fractal이 `__legacy__`를 가져오지 않는 규칙 1과 "새 코드가 레거시를 가리키는 import 0" 점검(LANDING-205)은 그대로이고, 옮긴 두 파일은 처분표(68C-01)와 이주 점검표(68C-02)가 아니라 `plan/07-switch/log.md`의 레거시 이동 목록에 적는다." (`reviews/round-71-closing.md:9`)
  > 편집자 결정(73C-01): "【추론】 LANDING-159는 "09 §4.3의 처분은 파일마다 한다"고 했고, LANDING-205를 적용한 보충은 "PR-7이 진입점을 새 엔진으로 바꾼 뒤 레거시 안의 옛 단위 시험을 시험 글롭에서 빼 두고(옛 엔진은 더 `<Form>`에 닿지 않는다), 디렉토리와 함께 PR-8이 지운다"고 정했다. 레거시 안의 `<Form>` 렌더 시험 둘은 옛 엔진을 `<Form>`으로 시험한 것이라 전환 뒤에는 뜻을 잃으므로 같은 처분(글롭에서 뺌)을 받고, 동시에 렌더 시나리오이므로 그 사례(14건)는 처분표(68C-01)에 추가 행으로 올라 09 §4.3의 처분을 받는다 — 시나리오별로 이주 행(`if`·`then`·`else`의 게이트 이주, nullable의 `type` 배열 이주 등)과 대조해 조합·옛 키가 있으면 "버리고 새로 쓴다"(새 e2e로 옮김, 새 시험 이름을 행에 적음), 없으면 TEST-005의 "표면만 고친다"로 단언을 살린다. 레거시 파일은 LANDING-205대로 고치지 않는다(사례만 지우는 것도 레거시 수정이며, 참고용 보존의 뜻에 어긋난다). 전환 커밋(진입점을 새 엔진으로 바꾸는 커밋)에서 render·unit 프로젝트의 포함 글롭에서 `src/__legacy__/**`를 빼고, 그 변경을 처분표의 머리에 "레거시 시험 N파일 M건은 LANDING-159 보충대로 글롭에서 뺌; 그 가운데 `<Form>` 렌더 사례 14건은 아래 행으로 처분"이라고 적는다. 두 파일만 빼는 대안을 쓰지 않는 까닭은 뺄 단위가 파일 둘이 아니라 레거시 전체이기 때문이고, 07의 권장을 그대로 쓰지 않는 까닭은 레거시 파일을 고치기 때문이다. 처분표에 행이 있고 새 e2e의 이름이 적히므로 붉은 시험을 숨기는 것이 아니다; 글롭에서 뺀 레거시의 시험이 PR-8 전까지 돌지 않는 것은 LANDING-159 보충이 받아들인 상태다." (`reviews/round-73-closing.md:9`)
  > 소유자(74라운드, 레거시의 완전 분리): "예. 완전히 분리하세요. 저는 사실 패키지 레벨에서 분리를 할거라고 생각했는데, 이정도만 분리해도 괜찮겠네요" (`reviews/round-74-owner-answers.md:7`) — 보존되는 레거시는 완전히 고립된 디렉토리다 — 새 코드 → 레거시 import 0(기존 점검)에 레거시 → 새 코드 import 0을 더해 PR-7이 둘 다 점검한다. 별도 패키지로 가르지는 않는다(원장 관리자, 2026-10-02).
  > 편집자 결정(75C-01): "【추론】 LANDING-205가 보존하는 것은 "참고용 옛 구현"이고, 74라운드 소유자 답은 레거시가 새 코드를 하나도 가져오지 않는 완전 고립을 정했다. 두 시험 파일은 옛 노드·파서를 직접 부르지 않고 공개 진입점 `@/schema-form`의 `<Form>`을 그려 단언하므로 그 뜻은 "공개 폼의 동작"이지 "옛 구현"이 아니며, 전환 뒤에는 새 `<Form>`을 옛 기대로 단언하는 모순된 파일이 된다. 옛 렌더 계층을 레거시에 복제해 이 둘을 살리는 것은 소유자 답의 "코드 복사본이 있어도 분리"의 뜻(필요한 조각의 사본)을 넘어 옛 `<Form>` 전체를 둘로 만드는 일이라 택하지 않고, ESLint 규칙에서 둘만 빼는 예외는 소유자가 "완전히 분리하세요"라고 한 것과 어긋나므로 두지 않는다. 그러므로 73C-01의 처분 가운데 (1)은 그대로 — 사례 14건은 처분표 추가 행으로 올려 이주 행과 대조해 새 e2e로 옮기고 새 시험 이름을 행에 적는다 — 이고, (2) "레거시 파일은 고치지 않는다"는 옛 구현과 그것을 직접 시험하는 파일로 좁혀지며, 공개 진입점만 가리키는 이 두 파일은 사례의 행방이 처분표에 적힌 뒤 레거시에서 지운다. 옛 동작의 참고가 필요하면 전환 직전 커밋(07 U1의 기준선 커밋)에 그대로 있다. 73C-01의 (3) 글롭에서 레거시 전체를 빼는 것은 그대로다. 같은 기준으로 레거시 안에 공개 진입점만 가져오는 다른 파일이 더 있으면(스토리·시험) 같은 처분을 하고 `plan/07-switch/log.md`의 레거시 이동 목록에 "지움(공개 겉면의 시험, 사례는 처분표 행 N)"으로 적는다." (`reviews/round-75-closing.md:9`)
  > 편집자 결정(75C-01): "【추론】 이주 안내의 정식 자리는 PR-8의 "이주 안내와 이주 프롬프트(`docs/agents`)"(LANDING-068)다. 07은 그 재료를 이주 점검표(68C-02, `verification/07-switch/migration-check.md`)에 적는다 — 호환 별칭 `JSONSchemaError`의 종료(34C-02·50C-01, 74라운드)는 그 표에 "공개 표면 잔여의 거취" 행으로 한 줄이면 족하고, PR-8이 그 표의 행들을 소비자용 이주 안내로 옮겨 쓴다. `isJSONSchemaError`가 별칭이 아니라 오류 분류의 throw 클래스 `JSONSchemaError`의 판별 함수라 남는 것은 맞다(ERROR 영역의 클래스이지 LANDING-024 이주 21의 인터페이스가 아니다)." (`reviews/round-75-closing.md:10`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:43`(정본, 반영 칸)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:43` 개발계획 P2)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:43`

### LANDING-206 UI 플러그인 넷의 이주는 플러그인 PR(우산 순서 N+1) — `presentation.*` 이주·자사 플러그인 수정 목록·union 항목, PR-7은 기본 입력으로 검증, ajv 셋은 원장대로 PR-4, 이주 표와 이주 점검은 PR-7에 남음

- 결정:
  > ajv6·ajv7·ajv8의 `compileGuard`·`rejectedKey`·같은 `$id` 처리는 원장대로 PR-4에서 셋 다 구현한다(LANDING-064·093 그대로).
  > UI 플러그인 넷(antd5·antd6·antd-mobile·mui)의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR(우산 순서 N+1, PR-7 뒤)이 한다.
  > PR-7은 기본 입력으로 검증한다.
  > 이주 표의 행(LANDING-181–LANDING-186)과 이주 점검은 PR-7에 남는다.
- 보충:
  > 소유자(개발계획 P1): "0에서 ajv 플러그인은 먼저 전부 수정하고 가자. 별로 크게 달라질건 없잖아?" (`reviews/round-18-owner-answers.md:42`)
  > 편집자 결정(68C-02): "【추론】 이주 표는 LANDING-004–050("이주 1"–"이주 47")과 그 뒤 "이주(05)"·"이주(S1)"·"이주(18라운드)"·"이주(19라운드)" 머리를 단 행(LANDING-115–208 사이)으로 흩어져 있고, 18C-87이 정한 이주 점검은 "이주 표의 행마다 오늘 동작과 새 동작을 시험으로 대조"이므로 대상은 현행 상태의 이주 행 전부다. LANDING-206이 "이주 표의 행(LANDING-181–LANDING-186)과 이주 점검은 PR-7에 남는다"고 적은 것은 같은 답에서 08로 옮긴 셋(`presentation.*` 이주·자사 플러그인 수정 목록·플러그인마다의 union 항목)과 헷갈릴 수 있는 union 이주 행이 PR-7에 남음을 밝힌 것이지 점검 범위를 여섯 행으로 줄인 것이 아니다. 07은 `### LANDING-nnn 이주` 머리를 기계로 뽑아 행마다 (가) 렌더 또는 e2e 시험으로 오늘과 새 동작을 대조(시험 이름), (나) 렌더와 무관해 02–06의 코어 시험이 이미 덮음(그 시험 이름 인용; 인용 없는 (나)는 받지 않는다), (다) 08(플러그인)·09(정리·릴리스)의 몫 가운데 하나를 적은 점검표를 `verification/07-switch/`에 두고, 그 표가 PR-7의 이주 점검 게이트다. 상태가 "폐기"·"분할됨"·"대체됨"인 이주 행은 표에 넣되 처분은 "현행 아님"으로 적는다." (`reviews/round-68-closing.md:16`)
  > 편집자 결정(68C-07): "【추론】 `verification.md`의 게이트 "UI 플러그인 넷의 `build`(타입 검사 포함)가 초록"과 LANDING-206의 "자사 플러그인 수정 목록은 플러그인 PR이 한다"는 이렇게 맞물린다: 공개 형의 변경(`type`에서 `'integer'`가 빠짐, `FormTypeTestObject.type`의 형, `FormTypeRenderer` → `FormTypeGroupRenderer`, `node.group` → `node.strategy`)으로 플러그인 소스가 컴파일되지 않는 줄은 07이 고치되, 컴파일 오류를 없애는 데 필요한 최소(이름 바꿈, 비교식의 형 맞춤, 빠진 타입 가져오기)만 하고 그 줄의 목록을 `plan/07-switch/log.md`와 PR 본문에 적는다. 그 밖의 플러그인 동작 변경(수 입력의 빈 칸 `undefined`, `presentation.*` 이주, union 항목)은 08의 목록에 넘기고 07은 기본 입력으로 검증한다. 07이 고친 줄이 동작을 바꾸는지 가를 때는 "같은 입력에서 플러그인의 렌더 결과와 방출 값이 같은가"를 기준으로 하며, 바뀌면 그 줄은 08로 넘기고 07은 컴파일만 통과하도록 가장 좁게 고친다." (`reviews/round-68-closing.md:51`)
- 상태: 현행
- 출처: `reviews/round-18-owner-answers.md:42`(정본, 반영 칸)
- 닫은 사람: 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1)
- 라운드: 18
- 까닭: `reviews/round-18-owner-answers.md:42`

### LANDING-207 이주(19라운드) — 형 없는 객체 분기 `oneOf`·`anyOf`(pydantic·zod·OpenAPI·TypeBox)는 object variant 호스트, `Optional[Self]`는 `RECURSIVE_SHAPE_UNBOUNDED`

- 결정:
  > 【추론】 이주(LANDING-207): 형 없는 객체 분기 `oneOf`·`anyOf`(pydantic·zod·OpenAPI·TypeBox)는 오늘 `UNKNOWN_JSON_SCHEMA`이고(`extractSchemaInfo.ts:23`), 새 설계에서는 object variant 호스트다.
  > 【추론】 pydantic `Optional[Self]`처럼 그 호스트가 게이트 없는 객체 프로퍼티 순환을 이루면 실패 코드가 `UNKNOWN_JSON_SCHEMA`에서 `RECURSIVE_SHAPE_UNBOUNDED`로 바뀐다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-19-closing.md:26-27`(정본)
- 닫은 사람: 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-01)
- 라운드: 19
- 까닭: `reviews/round-19-closing.md:31`

### LANDING-208 이주(19라운드) — `type` 없이 `const`·`enum`만 있는 프로퍼티(OpenAPI 3.1·JSON Schema 2020-12 관용구, 수기 태그)는 리터럴 종류의 원시 잎

- 결정:
  > 【추론】 이주(LANDING-208): `type` 없이 `const`·`enum`만 있는 프로퍼티(OpenAPI 3.1·JSON Schema 2020-12 관용구, 수기 태그)는 오늘 `UNKNOWN_JSON_SCHEMA`이고(`extractSchemaInfo.ts:23`), 새 설계에서는 리터럴 종류의 원시 잎이다.
- 보충: 없음
- 상태: 현행
- 출처: `reviews/round-19-closing.md:45`(정본)
- 닫은 사람: 편집자 결정(19라운드, `reviews/round-19-closing.md` 19C-02)
- 라운드: 19
- 까닭: `reviews/round-19-closing.md:48`
