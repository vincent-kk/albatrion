# ADR 0012 — FE 오버레이를 위한 별도의 입구를 두지 않는다

## 상태

| 항목 | 닫은 사람 | 라운드 |
| --- | --- | --- |
| SCHEMA-015 | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:13` 5) | 15 |
| SCHEMA-016 | 소유자 답(`reviews/round-2.md:113` C1), 소유자 답(`00-goals.md:104` C1) | 2 |
| SCHEMA-017 | 소유자 답(`reviews/round-2.md:113` C1), 소유자 답(`00-goals.md:104` C1) | 2 |
| SCHEMA-018 | 소유자 답(`reviews/round-2.md:113` C1), 소유자 답(`00-goals.md:111` C8), 편집자 결정(2라운드 ADR 0012 3판, `adr/0012-fe-overlay.md:31-32`; 판정 동일과 `$ref` 정의의 merge), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-66) | 18 |

## 결정

### 01-schema-to-blueprint.md §1.2 단일 스키마와 표현 층

**Form은 단일 `jsonSchema`를 받는다.**(SCHEMA-016) FE의 표현 층을 얹는 일은 소비자가 스키마를 넘기기 전에 자기 방식으로 merge해서 한다(SCHEMA-016). 직렬화할 수 없는 값(입력 컴포넌트)을 넣는 통로는 이미 있다 — `formTypeInputMap`(데이터 경로로 매칭)과 `formTypeInputDefinitions`(SCHEMA-016). 입구가 하나면 인라인 키와 오버레이 사이의 우선순위 규칙도 필요 없다(SCHEMA-016). 하나의 개념에 하나의 장치다(목표 G4(하나의 개념에는 하나의 장치))(SCHEMA-016, GOAL-006).

(2) FE가 서버 스키마에 얹는 키는 그룹 객체 셋 안에만 있다(SCHEMA-015). 셋 다 검증기 앞에서 지워진다(VALIDATE-004)(SCHEMA-015, VALIDATE-004). 15라운드에 13라운드 답 3의 경계와 14라운드 O-9의 닫힌 목록을 대체한다(SCHEMA-015).

`overlay` prop을 철회한 이유 — 그것이 주겠다던 이점이 성립하지 않았다(SCHEMA-017).

1. "검증기에 서버의 원본이 그대로 간다." strict 모드는 기본이 아니다(VALIDATE-005)(SCHEMA-017, VALIDATE-005). 검증기는 미지 키워드를 무시하므로 제어 키가 섞인 merge본과 원본을 **같게 판정한다.**(SCHEMA-017) 기본 구성에서 이 이점은 0이다(SCHEMA-017). 그룹 셋은 검증기 사본에서 늘 지운다, BE가 strict면 같은 셋을 지운다(SCHEMA-017, CONTROLS-047).
2. "오버레이의 표준 키워드를 거부한다." merge하면서 `type`이나 `required`를 건드리는 것은 작성자의 책임이다(SCHEMA-017). 스키마 선언의 책임을 작성자에게 두는 것이 이 재설계의 일관된 원칙이다(목표 G3(의미는 위임한다 — 재구현하지 않는다))(SCHEMA-017, GOAL-005).
3. "가리키는 위치가 스키마에 없으면 경고한다." 편의이고, Form의 두 번째 입구가 되어야 할 이유가 아니다(SCHEMA-017).

- 목표 C1(BE 소유 스키마 위에 FE의 표현 층을 얹는 수단)은 새 장치 없이 충족된다(SCHEMA-018, GOAL-014). 필요한 것은 문서다 — "서버 스키마에 제어 키를 merge하는 방법, 컴포넌트를 `formTypeInputMap`으로 꽂는 방법"을 이행 문서와 배포 문서에 적는다(목표 C8(이행 경로), GOAL-021)(SCHEMA-018, GOAL-021).
- merge본은 서버의 스키마와 바이트 단위로 같지는 않지만 판정은 같다(같은 설정의 검증기, VALIDATE-002)(SCHEMA-018, VALIDATE-002).
- `$ref`로 재사용되는 정의에 merge한 설정은 그 정의가 쓰이는 모든 곳에 적용된다(SCHEMA-018). 위치마다 다르게 주려면 `formTypeInputMap`처럼 데이터 경로로 매칭하는 기존 통로를 쓴다(SCHEMA-018).

【추론】 merge 안내 문서에 이 쓰임을 예로 더한다(SCHEMA-018).

【추론】 제공하지 않는다(SCHEMA-046). 【추론】 서버 스키마에 예약 층 키를 얹는 merge는 소비자가 자기 방식으로 한다(SCHEMA-046). 【추론】 패키지는 그 방법을 이주 안내와 배포 문서에 적는 것까지만 한다(PR-8)(SCHEMA-046). 【추론】 위치 불일치 경고용 helper도 두지 않는다(SCHEMA-046).

## 설계문서

- `design/01-schema-to-blueprint.md` §1.2 (SCHEMA-016, SCHEMA-015, SCHEMA-017, SCHEMA-018)
