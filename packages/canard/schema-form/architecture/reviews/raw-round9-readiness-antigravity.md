# 9라운드 원문 — 개발 진입 준비도 검토 (cennad antigravity, tier high)

편집자 주: 소유자의 질문 "개발 진입이 가능한가, 아직 설계나 논의가 더 필요한가"에 대한 독립 검토 원문이다. 편집자는 `file://` 링크를 `경로:줄` 표기로 바꾼 것 말고는 고치지 않았다. 인용 줄 번호는 대조하지 않았다.

---

`@canard/schema-form` 재설계 명세 검토 결과, 본 프로젝트는 **단계적 진입 가능** 상태로 판단합니다. 코어 정착 루프의 알고리즘과 수학적 불변식은 프로토타입 검증이 완료되었으나, 미결 정책과 미설계 영역이 존재하므로 명확한 슬라이스 분할과 선결 결정이 필요합니다.

---

### 1. 결정된 것 / 열린 것의 목록

#### 결정된 것 (합의 및 도출 완료)
- **판정과 형상의 분리**: 폼은 스키마 의미를 임의로 해석하지 않고 형상(노드 구조)만 읽으며, 유효성 판정은 검증기가 담당합니다 (`03-mental-model.md` §1 P1, P1′(03-mental-model.md:9-16); `07-conclusions.md` §2.2 1항(07-conclusions.md:47)).
- **상태 칸의 축소**: 노드가 소유하는 상태는 원본(`raw`)과 `extras` 둘뿐이며, `selection` 칸과 분기 선택 명령(`setSelectedBranch`)은 제거되었습니다 (`07-conclusions.md` §1, §4.25(07-conclusions.md:27); `03-mental-model.md` §2(03-mental-model.md:21-34)).
- **작업 루프 7단계**: 표시 → 계산 → 파생 → 전이 → 커밋 → 통지 → 검증의 고정 단방향 흐름 (`07-conclusions.md` §4.23(07-conclusions.md:114-124); `adr/0007-settle-cycle.md` §1(adr/0007-settle-cycle.md:28-37)).
- **채움 시점과 원천**: 노드 생성 시 1회만 채우며, 우선순위는 `&default` > 표준 `default` > 없음입니다 (`07-conclusions.md` §4.22(07-conclusions.md:102-110); `reviews/round-9-derivation.md` §3(reviews/round-9-derivation.md:54)).
- **값 조작 주체 일원화**: 코어의 독자적 값 변경은 금지되며, 예약 층(`&default`, `&derived`, `&injectTo`, `&clearValue`) 및 호출자/사용자만 씁니다 (`07-conclusions.md` §3.2, §4.28(07-conclusions.md:70); `adr/0013-core-does-not-rewrite-values.md` §1(adr/0013-core-does-not-rewrite-values.md:23-28)).
- **비수렴 보호**: 라운드 상한 초과 시 자동 쓰기를 제외한 원본 B를 커밋합니다 (`07-conclusions.md` §4.0 4.11, §4.23(07-conclusions.md:94); `reviews/round-9-derivation.md` §3(reviews/round-9-derivation.md:60)).

#### 열린 것의 분류

**(A) 코어 정착 루프 및 노드 트리 구현을 직접 차단 (선결 필수)**
- **노드 게이트 `&active`의 형상 제외 및 생성 트리거 규칙 확정**: 거짓이면 형상에서 제외되고 참 전환 시 생성으로 보는 규칙 확인 (`07-conclusions.md` §4.24, §5.2 항목 10(07-conclusions.md:130-134)).
- **같은 대상 자동 쓰기 경합 해소 순위**: 파생 단계에서 `&clearValue`, `&derived`, `&injectTo` 간의 우선순위 정책 (`07-conclusions.md` §4.23, §5.2 항목 8·9(07-conclusions.md:125)).
- **초기 로드/reset 시 참 조건의 에지 발화 여부**: `&clearValue`·`&pristine`이 참인 채 전체 교체 시 에지로 간주하여 값을 지울지 여부 (`07-conclusions.md` §4.23, §5.2 항목 21(07-conclusions.md:126)).
- **배열 아이템 identity 및 동적 생성 시 채움 규칙**: 배열 요소 추가/재배치 시 노드 identity 및 채움 발화 계약 (`open-questions.md` Q13(open-questions.md:82); `04-inherited-constraints.md` T-22(04-inherited-constraints.md:37)).
- **조각 비활성화 시 잔류 원본의 생명주기 및 비활성 경로 쓰기 계약**: 비활성 노드에 대한 쓰기 허용 및 삭제 시점 규정 (`open-questions.md` Q1(open-questions.md:5-16)).

**(B) 주변부 차단 (스위치나 스텁으로 격리 가능)**
- **형상 예산 초과 시 제출 차단 여부** (`07-conclusions.md` §5.1 항목 1(07-conclusions.md:203)).
- **로드 시 `&injectTo`의 기존 값 덮어쓰기(`fire` vs `fill`)** (`07-conclusions.md` §5.1 항목 6(07-conclusions.md:204)).
- **조건부 조각 주석 키워드의 본체 오버라이드 여부** (`07-conclusions.md` §5.1 항목 7(07-conclusions.md:205)).
- **런타임 결측 전용 채움 키 신설 여부** (`07-conclusions.md` §5.2 항목 11(07-conclusions.md:216)).
- **루트 `readOnly: false` 잠금 해제 폐지 여부 및 중간 객체 잠금 상속** (`07-conclusions.md` §5.2 항목 12·13(07-conclusions.md:217-218)).
- **`&children`의 문법 형태((나) 묶음형) 및 상태 키 한정 여부** (`07-conclusions.md` §5.2 항목 14·15(07-conclusions.md:219-220)).
- **유효 스키마 병합 세부 규칙 (주석 키워드 나중-승 통일, 전순서, `options` 얕은 병합)** (`07-conclusions.md` §5.2 항목 16·17·18(07-conclusions.md:221-223)).
- **개발 모드 정적 검사 및 경고 규칙** (`07-conclusions.md` §5.2 항목 19·20(07-conclusions.md:224-225)).
- **`Merge` 시 `undefined`를 통한 키 삭제 및 `findNodes` 터미널 하위 검색 규칙** (`07-conclusions.md` §5.3 항목 2·3(07-conclusions.md:232-233)).
- **`virtual` 노드의 참조 그룹 전환** (`07-conclusions.md` §5.3 항목 4(07-conclusions.md:234); `open-questions.md` Q5(open-questions.md:31-45)).
- **검증 에러 라우팅** (`open-questions.md` Q12(open-questions.md:78-81); `adr/0005-blueprint-analysis-and-node-sharing.md` §4(adr/0005-blueprint-analysis-and-node-sharing.md:3)).
- **`emit`의 키 직렬화 순서 보장** (`open-questions.md` Q14(open-questions.md:86-88)).

**(C) 비차단 (명명, 문서, 마이그레이션)**
- **`&pristine` 새 이름 평가** (`07-conclusions.md` §5.3 항목 5(07-conclusions.md:235)).
- **진단 표면의 `transitionDefaults` 이름 변경 검토** (`07-conclusions.md` §6.2 N4(07-conclusions.md:281)).
- **원리 원장 `03-mental-model.md` 및 ADR 5차 본문 개정** (`07-conclusions.md` §9 항목 1·2(07-conclusions.md:349-350)).
- **ADR 0010(분기 표현 관행) 및 마이그레이션 가이드 문서화** (`07-conclusions.md` §9 항목 5·6(07-conclusions.md:353-354)).

---

### 2. 설계가 아직 없는 것

1. **`&children` 구체 문법 스펙**: `07-conclusions.md` §5.2 항목 14(07-conclusions.md:219)에서 대상 묶음 형태 (나)로 기울었으나 정식 AST 구조 및 파서 문법이 정의되지 않았습니다.
2. **유효 스키마 병합표의 주석/커스텀 키 상세 명세**: `07-conclusions.md` §4.27(07-conclusions.md:161-179)에서 승자 원칙만 제시되었을 뿐, 재귀적 객체 병합 알고리즘 및 충돌 처리 규칙이 부재합니다.
3. **root / local / inherit 계층 상세**: `07-conclusions.md` §4.26, §5.2 항목 12·13(07-conclusions.md:217-218)에서 제안된 결합 규칙 외에 중간 컨테이너의 잠금 전파 알고리즘 명세가 부족합니다.
4. **검증 에러 라우팅 규칙**: `open-questions.md` Q12(open-questions.md:78)에 언급되었으나, 불일치 에러를 호스트나 특정 필드로 분배하는 규칙이 ADR 0004/0005 어디에도 작성되지 않았습니다.
5. **검증기 플러그인 `compileGuard` 계약 세부**: 동기 호출 인터페이스만 언급되었고, 서브스키마 컴파일 캐시 전략, 실패 시 반환 포맷, 에러 정규화 계약이 미비합니다.
6. **유효 스키마 변경 통지 상세**: `07-conclusions.md` §4.9, §4.27(07-conclusions.md:177)에서 배달 집합 추가만 명시되었을 뿐, 노드 단위 변경 감지 기준(참조 동일성 여부)과 리스너 API가 정의되지 않았습니다.
7. **ADR 0010 (분기 UX 및 표현 관행)**: 문서 자체가 아직 작성되지 않았습니다 (`07-conclusions.md` §9 항목 5(07-conclusions.md:353); `HANDOFF.md` §3 항목 7(HANDOFF.md:74)).
8. **성능 예산 구체 수치**: `adr/0009-performance-budget-and-benchmarks.md` §3(adr/0009-performance-budget-and-benchmarks.md:3)의 상태가 명시하듯 허용 지연 시간 수치가 공란입니다.
9. **`control` 컨테이너의 TypeScript 타입 서피스**: 이름(`control`)만 결정되었고 (`07-conclusions.md` §6.1(07-conclusions.md:243)), 구체적 타입 인터페이스 선언이 없습니다.
10. **공식 마이그레이션 가이드**: 변경 항목 목록만 존재하며 실무 사용자를 위한 전환 단계별 지침서가 없습니다.

---

### 3. 위험

1. **"폼은 분기를 고르지 않는다" 모델과 실제 OpenAPI 판별식의 충돌**: 실세계 스키마 대다수는 순수 `oneOf` + `const` 또는 `discriminator.propertyName`을 사용합니다. 07 모델은 이를 `if/else: false`나 `&active` 컨벤션으로 작성자가 명시하도록 요구하므로, 외부/서버 스키마를 직접 가져와 쓸 때 모든 분기가 동시에 활성화되는 심각한 불일치가 발생할 수 있습니다 (`07-conclusions.md` §4.25(07-conclusions.md:137)).
2. **노드 단위 채움(node-unit fill)과 배열의 상호작용 위험**: 단일 객체 필드와 달리 배열 아이템이 동적으로 삽입/삭제/정렬될 때 "노드가 생성되는 사건"의 identity 판정이 모호해져 의도치 않은 재채움이나 기본값 누락이 일어날 수 있습니다 (`07-conclusions.md` §4.22(07-conclusions.md:106); `open-questions.md` Q13(open-questions.md:82)).
3. **같은 대상 규칙(same-target resolution)의 미확정성**: 파생 단계에서 대상별 쓰기 1건 적용 원칙은 도출되었으나, `&clearValue`, `&derived`, `&injectTo` 간의 최종 승자 정책이 미결이라 규칙 조합에 따라 예산 초과나 값 덮어쓰기 왜곡이 재발할 수 있습니다 (`07-conclusions.md` §4.23(07-conclusions.md:125)).
4. **AND/OR 결합에 따른 기존 루트 우선순위 파괴**: 교환법칙 기반 AND/OR 결합은 루트에서 `readOnly: false`를 지정하여 하위 노드의 잠금을 전역 해제하던 기존 동작을 불가능하게 만듭니다 (`07-conclusions.md` §4.26, §5.2 항목 12`(07-conclusions.md:159)).
5. **검증기 컴파일 `if` 가드의 런타임 지연**: AJV 기준 가드당 70~270 µs의 컴파일 비용이 발생하므로, 조건부 조각이 많은 거대 폼에서 초기 로드 시 메인 스레드 차단이 발생할 수 있습니다 (`adr/0009-performance-budget-and-benchmarks.md` §2(adr/0009-performance-budget-and-benchmarks.md:49)).
6. **`else: false` 및 `required` 컨벤션의 강제 비용**: 실측 결과 `oneOf` 분기마다 `else: false`와 `required: [조건키]`가 반드시 병기되어야만 올바르게 판정되므로, 기존 표준 스키마 작성자에게 매우 가혹한 인위적 규칙이 강제됩니다 (`07-conclusions.md` §4.25, §7.1(07-conclusions.md:147)).

---

### 4. 판정

**판정: 단계적 진입 가능(무엇부터, 무엇은 뒤로)**

1. 핵심 정착 루프(7단계)와 노드 상태 모델(`raw`, `extras`)의 수학적 수렴성은 프로토타입 v5(`spikes/round9/proto/loop-v5.mjs`)를 통해 63개 회귀 및 108개 프로브 검증이 완료되어 알고리즘적으로 검증되었습니다.
2. 따라서 주변부 명세나 UI 연동의 미결 상태와 무관하게, 코어 엔진의 최소 불변식(정착 루프, 노드 트리, 순수 가드 평가)부터 격리된 단위로 단계적 구현에 진입할 수 있습니다.
3. 다만 프로덕션 코드 전체로의 일괄 진입은 불가하며, 소유자가 `07-conclusions.md`의 핵심 도출(4절)과 차단 항목(A군)에 대해 확인을 부여해야 각 슬라이스를 진행할 수 있습니다.
4. 구현 슬라이스는 코어 정착 엔진부터 시작하여 점진적으로 확장하는 순서로 배치해야 재작업 위험을 방지할 수 있습니다.

#### 구현 슬라이스 순서 및 선결 결정
1. **슬라이스 1: 코어 정착 루프 및 원시 노드 트리**
   - 범위: 표시 → 계산 → 전이 → 커밋 루프, `raw`/`extras` 상태 칸, 노드 단위 채움(`&default` > `default`), 노드 게이트 `&active`.
   - 선결 결정: `07-conclusions.md` §5.2 항목 10(07-conclusions.md:215)(노드 게이트 도출 수락), §5.2 항목 21(07-conclusions.md:226)(reset 시 에지 기준점).
2. **슬라이스 2: 파생 단계 및 자동 쓰기 엔진**
   - 범위: `&derived`, `&injectTo`, `&clearValue`, 같은 대상 쓰기 해소기, 라운드 상한 초과 시 원본 B 커밋.
   - 선결 결정: `07-conclusions.md` §5.1 항목 6(07-conclusions.md:204)(로드 시 injectTo `fire`), §5.2 항목 8·9(07-conclusions.md:213-214)(쓰기 우선순위 정책).
3. **슬라이스 3: 정적 청사진 분석기 및 유효 스키마 병합**
   - 범위: `Blueprint` 생성, `if/then/else` 및 `allOf` 조각 트리화, 검증 키워드 교차 병합, 주석 키워드 병합.
   - 선결 결정: `07-conclusions.md` §5.1 항목 7(07-conclusions.md:205)(주석 키워드 조각 오버라이드), §5.2 항목 16·17·18(07-conclusions.md:221-223)(병합 세부 규칙).
4. **슬라이스 4: 계층 제어 및 예약 층 확장**
   - 범위: `&children`, root/local 결합 규칙(AND/OR), `DisableAutomaticWrites` 비트마스크 옵션.
   - 선결 결정: `07-conclusions.md` §5.2 항목 12·13(07-conclusions.md:217-218)(루트 잠금 해제 폐지 여부 및 중간 객체 상속), §5.2 항목 14·15(07-conclusions.md:219-220)(`&children` 문법 확정).
5. **슬라이스 5: 배열 심화, 렌더러 바인딩 및 ADR 0010**
   - 범위: 배열 아이템 identity, 동기 통지 디스패처, 검증 에러 라우팅, ADR 0010 분기 관행 문서화.
   - 선결 결정: `open-questions.md` Q12(open-questions.md:78)(에러 라우팅), Q13(open-questions.md:82)(배열 identity), ADR 0010 작성.

---

### 5. 미확인

- `adr/0004-validator-plugin-contract.md`(adr/0004-validator-plugin-contract.md) 전문은 직접 읽지 않고 상위 문서 및 ADR 0005/미결 질문의 인용을 통해 확인했습니다.
- `spikes/round9/proto/loop-v5.mjs` 소스 코드는 직접 열람하지 않고 실행 보고서(`REPORT-proto.txt`, `r9b-output.txt`)와 07/09 문서의 인용 사실에 의존했습니다.
- 저사양 모바일 기기에서의 실제 `compileGuard` 지연 시간은 문서에 "미측정"으로 명시되어 있어 확인할 수 없었습니다.
- 실제 React 19 환경 브라우저에서의 IME 조합 중 동기 통지 캐럿 유지 여부는 jsdom 모델링 한계로 인해 완전히 검증되지 않았습니다 (`04-inherited-constraints.md` §아직 확인하지 않은 것(04-inherited-constraints.md:54)).
